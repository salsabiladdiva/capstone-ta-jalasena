"""
============================================
Model Kapal
============================================

Model ini menyimpan data kapal nelayan yang terdaftar
dalam sistem JALASENA. Setiap kapal memiliki kode unik
yang digunakan untuk autentikasi dan pelacakan.
"""

from django.db import models


class Ship(models.Model):
    """
    Model untuk data kapal nelayan.

    Setiap kapal diidentifikasi dengan kode unik (ship_code)
    yang digunakan untuk login ke sistem. Kapal juga menyimpan
    posisi terkini (latitude & longitude) yang diperbarui
    secara real-time melalui telemetri.

    Atribut:
        ship_code (str): Kode unik kapal (contoh: JLS-001)
                         Digunakan sebagai kredensial login
        name (str): Nama kapal (contoh: Nelayan Sejahtera I)
        owner_name (str): Nama pemilik/nahkoda kapal
        current_lat (float): Posisi lintang terkini kapal
        current_lng (float): Posisi bujur terkini kapal
        is_active (bool): Status aktif kapal dalam sistem
        is_moving (bool): Status pergerakan kapal saat ini
        created_at (datetime): Waktu kapal didaftarkan ke sistem
        updated_at (datetime): Waktu terakhir data kapal diperbarui
    """

    ship_code = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Kode Kapal',
        help_text='Kode unik kapal (contoh: JLS-001). Digunakan untuk login.'
    )
    name = models.CharField(
        max_length=200,
        verbose_name='Nama Kapal',
        help_text='Nama resmi kapal nelayan'
    )
    owner_name = models.CharField(
        max_length=200,
        verbose_name='Nama Pemilik',
        help_text='Nama pemilik atau nahkoda kapal'
    )

    # Posisi terkini kapal (diperbarui dari data telemetri)
    current_lat = models.FloatField(
        default=-6.9,
        verbose_name='Lintang Terkini',
        help_text='Posisi lintang (latitude) terkini kapal'
    )
    current_lng = models.FloatField(
        default=110.4,
        verbose_name='Bujur Terkini',
        help_text='Posisi bujur (longitude) terkini kapal'
    )

    # Status kapal
    is_active = models.BooleanField(
        default=True,
        verbose_name='Aktif',
        help_text='Apakah kapal masih aktif terdaftar dalam sistem'
    )
    is_moving = models.BooleanField(
        default=False,
        verbose_name='Sedang Bergerak',
        help_text='Apakah kapal sedang bergerak (berlayar) saat ini'
    )

    # Timestamp otomatis
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Tanggal Didaftarkan',
        help_text='Waktu kapal pertama kali didaftarkan ke sistem'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Terakhir Diperbarui',
        help_text='Waktu terakhir data kapal diperbarui'
    )

    class Meta:
        verbose_name = 'Kapal'
        verbose_name_plural = 'Kapal'
        ordering = ['ship_code']

    def __str__(self):
        status = "🟢 Aktif" if self.is_active else "🔴 Nonaktif"
        return f"{self.ship_code} - {self.name} ({status})"
