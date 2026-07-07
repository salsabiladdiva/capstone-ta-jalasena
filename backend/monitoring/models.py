"""
============================================
Model Pemantauan & Telemetri Kapal
============================================

Model ini menyimpan data telemetri real-time dari kapal
dan peringatan (alert) yang dihasilkan oleh sistem AI.

Data telemetri mencakup:
- Derajat kemiringan (tilt) kapal untuk deteksi bahaya
- Suhu sekitar kapal
- Kecepatan kapal
- Posisi GPS (latitude & longitude)

Sistem peringatan berdasarkan ambang batas kemiringan:
- Normal: 0-15 derajat
- Peringatan (Warning): 15-30 derajat
- Bahaya (Danger): >30 derajat
"""

from django.db import models
from ships.models import Ship


class ShipTelemetry(models.Model):
    """
    Model untuk data telemetri kapal.

    Menyimpan data sensor dari perangkat IoT di kapal secara
    berkala (setiap beberapa detik). Data ini digunakan untuk:
    1. Memantau kondisi kapal secara real-time
    2. Mendeteksi potensi bahaya (kemiringan berlebih)
    3. Melacak rute perjalanan kapal

    Atribut:
        ship (FK): Referensi ke kapal pemilik data telemetri
        tilt_degree (float): Derajat kemiringan kapal (0-90°)
                             Kemiringan >30° dianggap berbahaya
        temperature (float): Suhu di sekitar kapal (°C)
        speed (float): Kecepatan kapal dalam knot
        latitude (float): Posisi lintang GPS kapal
        longitude (float): Posisi bujur GPS kapal
        timestamp (datetime): Waktu pencatatan data telemetri
    """

    ship = models.ForeignKey(
        Ship,
        on_delete=models.CASCADE,
        related_name='telemetry_records',
        verbose_name='Kapal',
        help_text='Kapal pemilik data telemetri ini'
    )
    tilt_degree = models.FloatField(
        default=0.0,
        verbose_name='Derajat Kemiringan (°)',
        help_text='Derajat kemiringan kapal dari sensor akselerometer'
    )
    temperature = models.FloatField(
        default=28.0,
        verbose_name='Suhu (°C)',
        help_text='Suhu di sekitar kapal dari sensor suhu'
    )
    speed = models.FloatField(
        default=0.0,
        verbose_name='Kecepatan (knot)',
        help_text='Kecepatan kapal dalam satuan knot'
    )
    latitude = models.FloatField(
        verbose_name='Lintang (Latitude)',
        help_text='Posisi lintang GPS kapal'
    )
    longitude = models.FloatField(
        verbose_name='Bujur (Longitude)',
        help_text='Posisi bujur GPS kapal'
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Waktu Pencatatan',
        help_text='Waktu data telemetri dicatat oleh sensor'
    )

    class Meta:
        verbose_name = 'Data Telemetri'
        verbose_name_plural = 'Data Telemetri'
        # Mengurutkan berdasarkan waktu terbaru
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['ship', '-timestamp'], name='idx_telemetry_ship_time'),
        ]

    def __str__(self):
        return (
            f"Telemetri {self.ship.ship_code} - "
            f"Kemiringan: {self.tilt_degree:.1f}° - "
            f"{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"
        )


class Alert(models.Model):
    """
    Model untuk peringatan/alert keselamatan kapal.

    Peringatan dihasilkan secara otomatis oleh model AI (ai_model.py)
    berdasarkan data telemetri. Terdapat 3 tingkat peringatan:

    1. INFO    - Informasi umum (kemiringan normal)
    2. WARNING - Peringatan (kemiringan 15-30°, perlu perhatian)
    3. DANGER  - Bahaya! (kemiringan >30°, tindakan segera diperlukan)

    Atribut:
        ship (FK): Referensi ke kapal terkait
        alert_type (str): Jenis peringatan (INFO/WARNING/DANGER)
        tilt_degree (float): Derajat kemiringan saat peringatan terjadi
        message (str): Pesan deskriptif tentang peringatan
        is_read (bool): Status apakah peringatan sudah dibaca oleh nahkoda
        created_at (datetime): Waktu peringatan dibuat
    """

    # Pilihan jenis peringatan
    ALERT_TYPE_CHOICES = [
        ('INFO', 'Informasi'),
        ('WARNING', 'Peringatan'),
        ('DANGER', 'Bahaya'),
    ]

    ship = models.ForeignKey(
        Ship,
        on_delete=models.CASCADE,
        related_name='alerts',
        verbose_name='Kapal',
        help_text='Kapal yang menerima peringatan'
    )
    alert_type = models.CharField(
        max_length=10,
        choices=ALERT_TYPE_CHOICES,
        default='INFO',
        verbose_name='Jenis Peringatan',
        help_text='Tingkat keparahan peringatan (INFO/WARNING/DANGER)'
    )
    tilt_degree = models.FloatField(
        default=0.0,
        verbose_name='Derajat Kemiringan (°)',
        help_text='Derajat kemiringan kapal saat peringatan dibuat'
    )
    message = models.TextField(
        verbose_name='Pesan Peringatan',
        help_text='Deskripsi detail tentang peringatan yang terjadi'
    )
    is_read = models.BooleanField(
        default=False,
        verbose_name='Sudah Dibaca',
        help_text='Apakah peringatan sudah dibaca oleh nahkoda'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Waktu Peringatan',
        help_text='Waktu peringatan pertama kali dibuat'
    )

    class Meta:
        verbose_name = 'Peringatan'
        verbose_name_plural = 'Peringatan'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['ship', '-created_at'], name='idx_alert_ship_time'),
            models.Index(fields=['alert_type'], name='idx_alert_type'),
        ]

    def __str__(self):
        return (
            f"[{self.alert_type}] {self.ship.ship_code} - "
            f"Kemiringan: {self.tilt_degree:.1f}° - "
            f"{self.message[:50]}"
        )
