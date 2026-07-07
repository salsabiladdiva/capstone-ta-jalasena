"""
============================================
Model Zona Penangkapan Ikan
============================================

Model ini menyimpan data zona potensial untuk penangkapan ikan
di perairan Indonesia. Data didasarkan pada parameter oseanografi
seperti suhu permukaan laut (SST) dan konsentrasi klorofil-a.

TODO: Integrasi Copernicus Marine Service API
- Data SST real-time dari dataset GLOBAL_ANALYSISFORECAST_PHY
- Data klorofil-a dari dataset GLOBAL_ANALYSISFORECAST_BGC
"""

from django.db import models


class FishType(models.Model):
    """
    Model untuk jenis/spesies ikan.

    Menyimpan informasi dasar tentang jenis ikan yang diprediksi
    keberadaannya di zona penangkapan.

    Atribut:
        name (str): Nama jenis ikan (contoh: Kembung, Teri, Tongkol)
        icon_name (str): Nama ikon untuk ditampilkan di frontend
                         (menggunakan nama ikon dari library ikon)
        description (str): Deskripsi singkat tentang karakteristik ikan
        preferred_sst_min (float): Suhu permukaan laut minimum yang disukai (°C)
        preferred_sst_max (float): Suhu permukaan laut maksimum yang disukai (°C)
        preferred_chlorophyll_min (float): Konsentrasi klorofil-a minimum (mg/m³)
        preferred_chlorophyll_max (float): Konsentrasi klorofil-a maksimum (mg/m³)
    """

    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Nama Ikan',
        help_text='Nama jenis ikan (contoh: Kembung, Teri, Tongkol)'
    )
    icon_name = models.CharField(
        max_length=50,
        default='fish',
        verbose_name='Nama Ikon',
        help_text='Nama ikon untuk ditampilkan di aplikasi frontend'
    )
    description = models.TextField(
        blank=True,
        default='',
        verbose_name='Deskripsi',
        help_text='Deskripsi singkat tentang karakteristik ikan'
    )

    # Parameter oseanografi yang disukai oleh jenis ikan ini
    # TODO: Integrasi Copernicus Marine Service API
    # Parameter ini akan digunakan untuk mencocokkan data satelit
    # dengan preferensi habitat ikan
    preferred_sst_min = models.FloatField(
        default=27.0,
        verbose_name='SST Minimum (°C)',
        help_text='Suhu permukaan laut minimum yang disukai ikan ini'
    )
    preferred_sst_max = models.FloatField(
        default=30.0,
        verbose_name='SST Maksimum (°C)',
        help_text='Suhu permukaan laut maksimum yang disukai ikan ini'
    )
    preferred_chlorophyll_min = models.FloatField(
        default=1.0,
        verbose_name='Klorofil Min (mg/m³)',
        help_text='Konsentrasi klorofil-a minimum yang disukai'
    )
    preferred_chlorophyll_max = models.FloatField(
        default=5.0,
        verbose_name='Klorofil Maks (mg/m³)',
        help_text='Konsentrasi klorofil-a maksimum yang disukai'
    )

    class Meta:
        verbose_name = 'Jenis Ikan'
        verbose_name_plural = 'Jenis Ikan'
        ordering = ['name']

    def __str__(self):
        return self.name


class FishZone(models.Model):
    """
    Model untuk zona potensial penangkapan ikan.

    Setiap zona merepresentasikan titik koordinat di laut yang memiliki
    potensi tinggi untuk penangkapan jenis ikan tertentu. Prediksi
    didasarkan pada parameter oseanografi dari data satelit.

    Atribut:
        fish_type (FK): Referensi ke jenis ikan yang diprediksi
        latitude (float): Koordinat lintang zona (-90 sampai 90)
        longitude (float): Koordinat bujur zona (-180 sampai 180)
        potential_score (float): Skor potensi penangkapan (0.0 - 1.0)
                                 1.0 = sangat potensial, 0.0 = tidak potensial
        sst (float): Suhu Permukaan Laut / Sea Surface Temperature (°C)
                     Data dari sensor satelit oseanografi
        chlorophyll (float): Konsentrasi Klorofil-a (mg/m³)
                             Indikator kesuburan perairan
        last_updated (datetime): Waktu terakhir data diperbarui
    """

    fish_type = models.ForeignKey(
        FishType,
        on_delete=models.CASCADE,
        related_name='zones',
        verbose_name='Jenis Ikan',
        help_text='Jenis ikan yang diprediksi ada di zona ini'
    )
    latitude = models.FloatField(
        verbose_name='Lintang (Latitude)',
        help_text='Koordinat lintang dalam derajat desimal'
    )
    longitude = models.FloatField(
        verbose_name='Bujur (Longitude)',
        help_text='Koordinat bujur dalam derajat desimal'
    )
    potential_score = models.FloatField(
        default=0.5,
        verbose_name='Skor Potensi',
        help_text='Skor potensi penangkapan ikan (0.0 - 1.0)'
    )

    # TODO: Integrasi Copernicus Marine Service API
    # Field SST dan klorofil ini nantinya akan diisi otomatis
    # dari data satelit Copernicus Marine Service
    sst = models.FloatField(
        verbose_name='Suhu Permukaan Laut (°C)',
        help_text='Sea Surface Temperature dari data satelit'
    )
    chlorophyll = models.FloatField(
        verbose_name='Klorofil-a (mg/m³)',
        help_text='Konsentrasi klorofil-a dari data satelit'
    )

    last_updated = models.DateTimeField(
        auto_now=True,
        verbose_name='Terakhir Diperbarui',
        help_text='Waktu terakhir data zona ini diperbarui'
    )

    class Meta:
        verbose_name = 'Zona Penangkapan Ikan'
        verbose_name_plural = 'Zona Penangkapan Ikan'
        ordering = ['-potential_score']
        # Indeks untuk mempercepat pencarian berdasarkan jenis ikan
        indexes = [
            models.Index(fields=['fish_type'], name='idx_zone_fish_type'),
            models.Index(fields=['latitude', 'longitude'], name='idx_zone_coordinates'),
        ]

    def __str__(self):
        return (
            f"Zona {self.fish_type.name} "
            f"({self.latitude:.4f}, {self.longitude:.4f}) "
            f"- Potensi: {self.potential_score:.0%}"
        )
