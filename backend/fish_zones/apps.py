"""
Konfigurasi aplikasi Zona Penangkapan Ikan.
"""

from django.apps import AppConfig


class FishZonesConfig(AppConfig):
    """
    Konfigurasi untuk aplikasi fish_zones.
    Mengelola data zona penangkapan ikan berdasarkan
    parameter oseanografi seperti SST dan klorofil.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'fish_zones'
    verbose_name = 'Zona Penangkapan Ikan'
