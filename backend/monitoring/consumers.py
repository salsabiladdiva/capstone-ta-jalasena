"""
============================================
WebSocket Consumer Pemantauan Kapal
============================================

Consumer ini menangani koneksi WebSocket untuk pemantauan
kapal secara real-time. Setiap kapal terhubung ke channel
unik berdasarkan kode kapal.

Alur kerja WebSocket:
1. Perangkat IoT di kapal membuka koneksi WebSocket
2. Data telemetri dikirim secara berkala (setiap beberapa detik)
3. Server memproses data, menyimpan ke database, dan menjalankan analisis AI
4. Jika terdeteksi bahaya, server mengirim peringatan kembali ke kapal
5. Data juga disiarkan ke semua klien yang memantau kapal tersebut

Endpoint WebSocket:
    ws://host/ws/monitoring/{kode_kapal}/

Format pesan masuk (dari kapal):
    {
        "type": "telemetry",
        "data": {
            "tilt_degree": 12.5,
            "temperature": 28.3,
            "speed": 5.2,
            "latitude": -6.8765,
            "longitude": 110.4321
        }
    }

Format pesan keluar (ke klien):
    {
        "type": "telemetry_update",
        "data": {
            "tilt_degree": 12.5,
            "temperature": 28.3,
            "speed": 5.2,
            "latitude": -6.8765,
            "longitude": 110.4321,
            "safety_score": 0.85,
            "analysis": { ...hasil analisis AI... }
        }
    }
"""

import json
import logging
from channels.generic.websocket import AsyncWebSocketConsumer
from channels.db import database_sync_to_async
from ships.models import Ship
from .models import ShipTelemetry, Alert
from .ai_model import analyze_tilt, calculate_safety_score

# Logger untuk mencatat aktivitas WebSocket
logger = logging.getLogger(__name__)


class MonitoringConsumer(AsyncWebSocketConsumer):
    """
    Consumer WebSocket untuk pemantauan kapal real-time.

    Setiap koneksi WebSocket terhubung ke satu kapal berdasarkan
    kode kapal di URL. Consumer ini menangani:

    1. Penerimaan data telemetri dari perangkat IoT
    2. Penyimpanan data ke database
    3. Analisis kemiringan menggunakan model AI
    4. Pembuatan peringatan otomatis jika diperlukan
    5. Penyiaran data ke semua klien yang memantau kapal
    """

    async def connect(self):
        """
        Menangani koneksi WebSocket baru.

        Langkah-langkah:
        1. Mengambil kode kapal dari URL
        2. Memvalidasi bahwa kapal terdaftar
        3. Menambahkan koneksi ke grup channel kapal
        4. Menerima koneksi WebSocket
        """
        # Mengambil kode kapal dari parameter URL
        self.ship_code = self.scope['url_route']['kwargs']['ship_code']

        # Nama grup channel unik untuk setiap kapal
        # Semua klien yang memantau kapal yang sama akan bergabung
        # ke grup yang sama
        self.room_group_name = f'monitoring_{self.ship_code}'

        # Memvalidasi bahwa kapal terdaftar di database
        ship = await self.get_ship(self.ship_code)
        if ship is None:
            logger.warning(
                f"Koneksi WebSocket ditolak: kapal {self.ship_code} tidak ditemukan"
            )
            await self.close()
            return

        # Menambahkan koneksi ini ke grup channel kapal
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Menerima koneksi WebSocket
        await self.accept()

        logger.info(
            f"✅ WebSocket terhubung untuk kapal {self.ship_code} "
            f"(grup: {self.room_group_name})"
        )

        # Mengirim pesan selamat datang
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'Terhubung ke pemantauan kapal {self.ship_code}',
            'kode_kapal': self.ship_code,
        }))

    async def disconnect(self, close_code):
        """
        Menangani pemutusan koneksi WebSocket.
        Menghapus koneksi dari grup channel kapal.
        """
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        logger.info(
            f"❌ WebSocket terputus untuk kapal {self.ship_code} "
            f"(kode: {close_code})"
        )

    async def receive(self, text_data):
        """
        Menangani pesan yang diterima melalui WebSocket.

        Memproses data telemetri dari perangkat IoT di kapal:
        1. Memvalidasi format data
        2. Menyimpan data telemetri ke database
        3. Menganalisis kemiringan kapal
        4. Membuat peringatan jika diperlukan
        5. Menyiarkan data ke semua klien pemantau
        """
        try:
            # Mengurai pesan JSON
            data = json.loads(text_data)
            message_type = data.get('type', 'telemetry')

            if message_type == 'telemetry':
                await self.handle_telemetry(data.get('data', {}))
            else:
                # Jenis pesan tidak dikenal
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Jenis pesan tidak dikenal: {message_type}',
                }))

        except json.JSONDecodeError:
            logger.error(
                f"Data JSON tidak valid dari kapal {self.ship_code}: {text_data}"
            )
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Format JSON tidak valid',
            }))

        except Exception as e:
            logger.error(
                f"Error saat memproses data dari kapal {self.ship_code}: {str(e)}"
            )
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Terjadi kesalahan: {str(e)}',
            }))

    async def handle_telemetry(self, telemetry_data):
        """
        Memproses data telemetri yang diterima.

        Langkah-langkah:
        1. Mengekstrak data sensor (kemiringan, suhu, kecepatan, GPS)
        2. Menyimpan data ke tabel ShipTelemetry
        3. Memperbarui posisi terkini kapal
        4. Menjalankan analisis AI untuk deteksi bahaya
        5. Membuat peringatan jika kemiringan melebihi ambang batas
        6. Menyiarkan hasil ke semua klien pemantau
        """
        # Mengekstrak data dari payload
        tilt_degree = telemetry_data.get('tilt_degree', 0.0)
        temperature = telemetry_data.get('temperature', 28.0)
        speed = telemetry_data.get('speed', 0.0)
        latitude = telemetry_data.get('latitude', -6.9)
        longitude = telemetry_data.get('longitude', 110.4)

        # Menyimpan data telemetri ke database
        telemetry_record = await self.save_telemetry(
            tilt_degree=tilt_degree,
            temperature=temperature,
            speed=speed,
            latitude=latitude,
            longitude=longitude,
        )

        # Memperbarui posisi terkini kapal
        await self.update_ship_position(latitude, longitude)

        # Menjalankan analisis AI untuk deteksi kemiringan
        analysis = analyze_tilt(tilt_degree)
        safety_score = calculate_safety_score(tilt_degree, speed)

        # Membuat peringatan jika diperlukan
        alert_data = None
        if analysis['should_alert']:
            alert = await self.create_alert(
                alert_type=analysis['alert_type'],
                tilt_degree=analysis['tilt_degree'],
                message=analysis['message'],
            )
            alert_data = {
                'id': alert.id,
                'alert_type': analysis['alert_type'],
                'message': analysis['message'],
            }

        # Menyiarkan data telemetri ke semua klien dalam grup
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'telemetry_update',
                'data': {
                    'ship_code': self.ship_code,
                    'tilt_degree': tilt_degree,
                    'temperature': temperature,
                    'speed': speed,
                    'latitude': latitude,
                    'longitude': longitude,
                    'safety_score': safety_score,
                    'analysis': {
                        'alert_type': analysis['alert_type'],
                        'message': analysis['message'],
                        'should_alert': analysis['should_alert'],
                    },
                    'alert': alert_data,
                    'timestamp': telemetry_record.timestamp.isoformat()
                        if telemetry_record else None,
                },
            }
        )

    async def telemetry_update(self, event):
        """
        Handler untuk event telemetry_update.
        Mengirim data telemetri yang sudah diproses ke klien WebSocket.
        """
        await self.send(text_data=json.dumps({
            'type': 'telemetry_update',
            'data': event['data'],
        }))

    # ============================================
    # Fungsi Akses Database (Async)
    # ============================================
    # Django ORM bersifat synchronous, sehingga perlu dibungkus
    # dengan database_sync_to_async agar bisa dipanggil dari
    # consumer async

    @database_sync_to_async
    def get_ship(self, ship_code):
        """Mengambil data kapal dari database (async-safe)."""
        try:
            return Ship.objects.get(ship_code=ship_code)
        except Ship.DoesNotExist:
            return None

    @database_sync_to_async
    def save_telemetry(self, tilt_degree, temperature, speed, latitude, longitude):
        """
        Menyimpan data telemetri baru ke database (async-safe).
        Mengembalikan objek ShipTelemetry yang baru dibuat.
        """
        try:
            ship = Ship.objects.get(ship_code=self.ship_code)
            telemetry = ShipTelemetry.objects.create(
                ship=ship,
                tilt_degree=tilt_degree,
                temperature=temperature,
                speed=speed,
                latitude=latitude,
                longitude=longitude,
            )
            logger.debug(
                f"Telemetri disimpan untuk {self.ship_code}: "
                f"kemiringan={tilt_degree}°, suhu={temperature}°C"
            )
            return telemetry
        except Ship.DoesNotExist:
            logger.error(f"Gagal menyimpan telemetri: kapal {self.ship_code} tidak ada")
            return None

    @database_sync_to_async
    def update_ship_position(self, latitude, longitude):
        """Memperbarui posisi terkini kapal di database (async-safe)."""
        try:
            Ship.objects.filter(ship_code=self.ship_code).update(
                current_lat=latitude,
                current_lng=longitude,
                is_moving=True,  # Kapal bergerak karena mengirim data
            )
        except Exception as e:
            logger.error(
                f"Gagal memperbarui posisi kapal {self.ship_code}: {str(e)}"
            )

    @database_sync_to_async
    def create_alert(self, alert_type, tilt_degree, message):
        """Membuat peringatan baru di database (async-safe)."""
        try:
            ship = Ship.objects.get(ship_code=self.ship_code)
            alert = Alert.objects.create(
                ship=ship,
                alert_type=alert_type,
                tilt_degree=tilt_degree,
                message=message,
            )
            logger.info(
                f"🚨 Peringatan [{alert_type}] dibuat untuk kapal {self.ship_code}: "
                f"{message[:80]}"
            )
            return alert
        except Ship.DoesNotExist:
            logger.error(
                f"Gagal membuat peringatan: kapal {self.ship_code} tidak ada"
            )
            return None
