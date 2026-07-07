"""
Konfigurasi aplikasi Manajemen Kapal.
"""

from django.apps import AppConfig


class ShipsConfig(AppConfig):
    """
    Konfigurasi untuk aplikasi ships.
    Mengelola data kapal nelayan yang terdaftar dalam sistem JALASENA.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ships'
    verbose_name = 'Manajemen Kapal'
