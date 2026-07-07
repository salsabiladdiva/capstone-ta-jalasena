"""
Konfigurasi aplikasi Pemantauan Kapal.
"""

from django.apps import AppConfig


class MonitoringConfig(AppConfig):
    """
    Konfigurasi untuk aplikasi monitoring.
    Mengelola data telemetri kapal secara real-time
    dan sistem peringatan (alert) berbasis AI.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'monitoring'
    verbose_name = 'Pemantauan Kapal'
