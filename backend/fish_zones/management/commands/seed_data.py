"""
============================================
Perintah Manajemen: Seed Data
============================================

Perintah ini mengisi database dengan data dummy untuk pengembangan
dan pengujian. Mencakup semua model di ketiga aplikasi:

1. fish_zones: Jenis ikan dan zona penangkapan di Laut Jawa
2. ships: Kapal nelayan dengan kode unik
3. monitoring: Data telemetri dan peringatan contoh

Penggunaan:
    python manage.py seed_data

Opsi:
    --clear    Hapus semua data sebelum mengisi data baru
    --no-telemetry  Jangan buat data telemetri contoh

Data zona ikan mencakup area Laut Jawa / Semarang:
- Lintang: -6.0 sampai -7.0
- Bujur: 109.5 sampai 111.5

TODO: Integrasi Copernicus Marine Service API
- Di masa depan, data SST dan klorofil akan diambil dari
  API Copernicus Marine Service secara real-time
- Data dummy ini akan digantikan dengan data satelit aktual
"""

import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from fish_zones.models import FishType, FishZone
from ships.models import Ship
from monitoring.models import ShipTelemetry, Alert


class Command(BaseCommand):
    """
    Perintah untuk mengisi database dengan data dummy JALASENA.
    """
    help = 'Mengisi database dengan data dummy untuk pengembangan JALASENA'

    def add_arguments(self, parser):
        """Menambahkan argumen baris perintah."""
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Hapus semua data yang ada sebelum mengisi data baru',
        )
        parser.add_argument(
            '--no-telemetry',
            action='store_true',
            help='Jangan buat data telemetri contoh',
        )

    def handle(self, *args, **options):
        """Menjalankan perintah seed data."""
        self.stdout.write(self.style.NOTICE(
            '\n============================================'
        ))
        self.stdout.write(self.style.NOTICE(
            '  JALASENA - Pengisian Data Dummy'
        ))
        self.stdout.write(self.style.NOTICE(
            '============================================\n'
        ))

        # Menghapus data yang ada jika opsi --clear digunakan
        if options['clear']:
            self._clear_data()

        # Mengisi data secara berurutan
        self._seed_fish_types()
        self._seed_fish_zones()
        self._seed_ships()

        if not options['no_telemetry']:
            self._seed_telemetry()
            self._seed_alerts()

        self.stdout.write(self.style.SUCCESS(
            '\n✅ Semua data dummy berhasil diisi!\n'
        ))

    def _clear_data(self):
        """Menghapus semua data dari database."""
        self.stdout.write('🗑️  Menghapus data yang ada...')
        Alert.objects.all().delete()
        ShipTelemetry.objects.all().delete()
        Ship.objects.all().delete()
        FishZone.objects.all().delete()
        FishType.objects.all().delete()
        self.stdout.write(self.style.WARNING('   Data lama berhasil dihapus'))

    def _seed_fish_types(self):
        """
        Mengisi data jenis ikan.

        3 jenis ikan utama yang umum di Laut Jawa:
        1. Kembung - Ikan pelagis kecil, menyukai perairan hangat
        2. Teri    - Ikan pesisir, ditemukan di area kaya klorofil
        3. Tongkol - Ikan pelagis besar, di perairan yang lebih dalam
        """
        self.stdout.write('🐟 Mengisi data jenis ikan...')

        # Data jenis ikan dengan parameter oseanografi yang disukai
        fish_types_data = [
            {
                'name': 'Kembung',
                'icon_name': 'fish-kembung',
                'description': (
                    'Ikan Kembung (Rastrelliger spp.) adalah ikan pelagis kecil '
                    'yang banyak ditemukan di perairan hangat Laut Jawa. '
                    'Menyukai suhu permukaan laut 28-30°C dengan kadar '
                    'klorofil sedang (1-3 mg/m³). Biasa ditangkap menggunakan '
                    'jaring insang atau purse seine.'
                ),
                'preferred_sst_min': 28.0,
                'preferred_sst_max': 30.0,
                'preferred_chlorophyll_min': 1.0,
                'preferred_chlorophyll_max': 3.0,
            },
            {
                'name': 'Teri',
                'icon_name': 'fish-teri',
                'description': (
                    'Ikan Teri (Stolephorus spp.) adalah ikan pesisir berukuran '
                    'kecil yang melimpah di sekitar pantai utara Jawa. '
                    'Menyukai perairan dangkal dengan klorofil tinggi (2-5 mg/m³) '
                    'yang menandakan kesuburan tinggi. Sering ditemukan di dekat '
                    'muara sungai dan pesisir Semarang.'
                ),
                'preferred_sst_min': 27.0,
                'preferred_sst_max': 30.0,
                'preferred_chlorophyll_min': 2.0,
                'preferred_chlorophyll_max': 5.0,
            },
            {
                'name': 'Tongkol',
                'icon_name': 'fish-tongkol',
                'description': (
                    'Ikan Tongkol (Euthynnus affinis) adalah ikan pelagis besar '
                    'yang ditemukan di perairan lepas pantai yang lebih dalam. '
                    'Menyukai suhu permukaan laut 27-29°C dengan klorofil sedang. '
                    'Merupakan ikan predator yang bermigrasi dalam kelompok besar.'
                ),
                'preferred_sst_min': 27.0,
                'preferred_sst_max': 29.0,
                'preferred_chlorophyll_min': 1.0,
                'preferred_chlorophyll_max': 3.0,
            },
        ]

        for ft_data in fish_types_data:
            fish_type, created = FishType.objects.update_or_create(
                name=ft_data['name'],
                defaults=ft_data,
            )
            status_icon = '✨' if created else '🔄'
            self.stdout.write(f'   {status_icon} {fish_type.name}')

    def _seed_fish_zones(self):
        """
        Mengisi data zona penangkapan ikan di area Laut Jawa / Semarang.

        Area cakupan:
        - Lintang: -6.0 sampai -7.0 (utara Jawa)
        - Bujur: 109.5 sampai 111.5 (sekitar Semarang)

        TODO: Integrasi Copernicus Marine Service API
        - Data SST dan klorofil di bawah ini adalah data dummy
        - Di produksi, data ini akan diambil dari dataset:
          * GLOBAL_ANALYSISFORECAST_PHY (untuk SST)
          * GLOBAL_ANALYSISFORECAST_BGC (untuk klorofil)
        """
        self.stdout.write('📍 Mengisi data zona penangkapan ikan...')

        # ============================================
        # Zona Ikan Kembung (~7 titik)
        # Preferensi: Perairan hangat 28-30°C, klorofil sedang 1-3 mg/m³
        # Area: Lepas pantai utara Jawa, agak ke tengah laut
        # ============================================
        kembung = FishType.objects.get(name='Kembung')
        kembung_zones = [
            # (latitude, longitude, potential_score, sst, chlorophyll)
            (-6.25, 110.10, 0.92, 29.5, 2.1),   # Utara Semarang
            (-6.18, 110.45, 0.88, 29.8, 1.8),   # Timur laut Semarang
            (-6.30, 109.85, 0.85, 29.2, 2.4),   # Barat Semarang
            (-6.10, 110.70, 0.82, 28.9, 1.5),   # Lepas pantai Demak
            (-6.35, 111.00, 0.78, 28.5, 2.8),   # Utara Demak
            (-6.22, 109.65, 0.75, 29.1, 2.0),   # Utara Batang
            (-6.15, 110.95, 0.70, 28.7, 1.9),   # Lepas pantai Jepara
        ]

        for lat, lng, score, sst, chlor in kembung_zones:
            FishZone.objects.update_or_create(
                fish_type=kembung,
                latitude=lat,
                longitude=lng,
                defaults={
                    'potential_score': score,
                    'sst': sst,
                    'chlorophyll': chlor,
                }
            )
        self.stdout.write(f'   🐟 Kembung: {len(kembung_zones)} zona')

        # ============================================
        # Zona Ikan Teri (~6 titik)
        # Preferensi: Pesisir, klorofil tinggi 2-5 mg/m³, dekat pantai
        # Area: Dekat pesisir Semarang, muara sungai
        # ============================================
        teri = FishType.objects.get(name='Teri')
        teri_zones = [
            # (latitude, longitude, potential_score, sst, chlorophyll)
            (-6.88, 110.38, 0.95, 28.5, 4.2),   # Pesisir Semarang (Marina)
            (-6.85, 110.42, 0.90, 28.8, 3.8),   # Pelabuhan Tanjung Emas
            (-6.82, 110.50, 0.87, 29.0, 3.5),   # Muara Sungai Semarang
            (-6.78, 110.35, 0.83, 28.3, 4.5),   # Pesisir Kendal
            (-6.90, 110.55, 0.80, 28.7, 3.2),   # Pantai Demak
            (-6.75, 110.25, 0.76, 27.9, 4.8),   # Pesisir barat Semarang
        ]

        for lat, lng, score, sst, chlor in teri_zones:
            FishZone.objects.update_or_create(
                fish_type=teri,
                latitude=lat,
                longitude=lng,
                defaults={
                    'potential_score': score,
                    'sst': sst,
                    'chlorophyll': chlor,
                }
            )
        self.stdout.write(f'   🐟 Teri: {len(teri_zones)} zona')

        # ============================================
        # Zona Ikan Tongkol (~7 titik)
        # Preferensi: Perairan lebih dalam, SST 27-29°C, klorofil sedang
        # Area: Lepas pantai yang lebih jauh dari pesisir
        # ============================================
        tongkol = FishType.objects.get(name='Tongkol')
        tongkol_zones = [
            # (latitude, longitude, potential_score, sst, chlorophyll)
            (-6.05, 110.30, 0.93, 27.8, 1.8),   # Laut lepas utara Semarang
            (-6.00, 110.65, 0.89, 28.2, 1.5),   # Perairan dalam utara
            (-6.10, 109.80, 0.86, 27.5, 2.1),   # Laut lepas utara Batang
            (-6.08, 111.10, 0.83, 28.5, 1.3),   # Perairan dalam timur
            (-6.15, 110.00, 0.79, 27.9, 2.4),   # Lepas pantai Pekalongan
            (-6.02, 111.30, 0.75, 28.0, 1.6),   # Perairan dalam Jepara
            (-6.12, 109.60, 0.71, 27.3, 2.0),   # Lepas pantai barat
        ]

        for lat, lng, score, sst, chlor in tongkol_zones:
            FishZone.objects.update_or_create(
                fish_type=tongkol,
                latitude=lat,
                longitude=lng,
                defaults={
                    'potential_score': score,
                    'sst': sst,
                    'chlorophyll': chlor,
                }
            )
        self.stdout.write(f'   🐟 Tongkol: {len(tongkol_zones)} zona')

    def _seed_ships(self):
        """
        Mengisi data kapal nelayan dummy.

        3 kapal dengan kode unik berformat JLS-XXX.
        Posisi awal di sekitar pelabuhan Semarang.
        """
        self.stdout.write('🚢 Mengisi data kapal...')

        ships_data = [
            {
                'ship_code': 'JLS-001',
                'name': 'Nelayan Sejahtera I',
                'owner_name': 'Pak Budi Santoso',
                'current_lat': -6.89,
                'current_lng': 110.40,
                'is_active': True,
                'is_moving': True,
            },
            {
                'ship_code': 'JLS-002',
                'name': 'Bahari Jaya',
                'owner_name': 'Pak Ahmad Hidayat',
                'current_lat': -6.85,
                'current_lng': 110.45,
                'is_active': True,
                'is_moving': False,
            },
            {
                'ship_code': 'JLS-003',
                'name': 'Samudra Indah',
                'owner_name': 'Pak Wahyu Prasetyo',
                'current_lat': -6.92,
                'current_lng': 110.38,
                'is_active': True,
                'is_moving': True,
            },
        ]

        for ship_data in ships_data:
            ship, created = Ship.objects.update_or_create(
                ship_code=ship_data['ship_code'],
                defaults=ship_data,
            )
            status_icon = '✨' if created else '🔄'
            self.stdout.write(
                f'   {status_icon} {ship.ship_code} - {ship.name} '
                f'(Pemilik: {ship.owner_name})'
            )

    def _seed_telemetry(self):
        """
        Mengisi data telemetri contoh untuk setiap kapal.

        Membuat 20 data telemetri per kapal dengan simulasi
        pergerakan dan variasi kemiringan yang realistis.
        Interval waktu: setiap 30 detik (10 menit terakhir).
        """
        self.stdout.write('📡 Mengisi data telemetri...')

        ships = Ship.objects.all()
        now = timezone.now()

        for ship in ships:
            # Posisi awal kapal
            base_lat = ship.current_lat
            base_lng = ship.current_lng

            telemetry_records = []
            for i in range(20):
                # Waktu mundur dari sekarang (setiap 30 detik)
                timestamp = now - timedelta(seconds=(19 - i) * 30)

                # Simulasi pergerakan kecil (drift)
                lat = base_lat + random.uniform(-0.005, 0.005)
                lng = base_lng + random.uniform(-0.005, 0.005)

                # Simulasi kemiringan - kebanyakan normal, beberapa tinggi
                if i == 12:
                    # Satu momen kemiringan tinggi (warning)
                    tilt = random.uniform(18.0, 25.0)
                elif i == 15:
                    # Satu momen kemiringan sangat tinggi (danger) untuk kapal pertama
                    tilt = random.uniform(32.0, 40.0) if ship.ship_code == 'JLS-001' else random.uniform(5.0, 12.0)
                else:
                    # Kemiringan normal
                    tilt = random.uniform(1.0, 12.0)

                telemetry_records.append(ShipTelemetry(
                    ship=ship,
                    tilt_degree=round(tilt, 1),
                    temperature=round(random.uniform(27.0, 30.0), 1),
                    speed=round(random.uniform(0.0, 8.0), 1),
                    latitude=round(lat, 6),
                    longitude=round(lng, 6),
                ))

            # Bulk create untuk efisiensi
            ShipTelemetry.objects.bulk_create(telemetry_records)
            self.stdout.write(
                f'   📊 {ship.ship_code}: {len(telemetry_records)} data telemetri'
            )

    def _seed_alerts(self):
        """
        Mengisi data peringatan contoh.

        Membuat beberapa peringatan untuk mendemonstrasikan
        sistem deteksi bahaya.
        """
        self.stdout.write('🚨 Mengisi data peringatan...')

        ships = Ship.objects.all()

        alerts_data = [
            # Peringatan untuk JLS-001 (Nelayan Sejahtera I)
            {
                'ship_code': 'JLS-001',
                'alert_type': 'WARNING',
                'tilt_degree': 22.5,
                'message': (
                    'Peringatan: Kemiringan kapal mencapai 22.5°. '
                    'Kondisi laut mungkin tidak stabil. '
                    'Harap waspada dan kurangi kecepatan.'
                ),
                'is_read': True,
            },
            {
                'ship_code': 'JLS-001',
                'alert_type': 'DANGER',
                'tilt_degree': 35.2,
                'message': (
                    'BAHAYA! Kemiringan kapal mencapai 35.2°. '
                    'Segera lakukan tindakan penyelamatan! '
                    'Risiko kapal terbalik sangat tinggi.'
                ),
                'is_read': False,
            },
            # Peringatan untuk JLS-002 (Bahari Jaya)
            {
                'ship_code': 'JLS-002',
                'alert_type': 'WARNING',
                'tilt_degree': 18.7,
                'message': (
                    'Peringatan: Kemiringan kapal mencapai 18.7°. '
                    'Harap perhatikan kondisi muatan dan kecepatan.'
                ),
                'is_read': True,
            },
            # Peringatan untuk JLS-003 (Samudra Indah)
            {
                'ship_code': 'JLS-003',
                'alert_type': 'WARNING',
                'tilt_degree': 20.1,
                'message': (
                    'Peringatan: Kemiringan kapal mencapai 20.1°. '
                    'Gelombang besar terdeteksi di area ini.'
                ),
                'is_read': False,
            },
        ]

        for alert_data in alerts_data:
            ship = Ship.objects.get(ship_code=alert_data['ship_code'])
            Alert.objects.create(
                ship=ship,
                alert_type=alert_data['alert_type'],
                tilt_degree=alert_data['tilt_degree'],
                message=alert_data['message'],
                is_read=alert_data['is_read'],
            )

        self.stdout.write(f'   🔔 {len(alerts_data)} peringatan contoh dibuat')
