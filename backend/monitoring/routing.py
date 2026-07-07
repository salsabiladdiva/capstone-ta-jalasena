"""
============================================
Routing WebSocket Pemantauan
============================================

Konfigurasi routing URL untuk koneksi WebSocket.
Setiap kapal memiliki channel unik berdasarkan kode kapal.

Endpoint WebSocket:
    ws://host/ws/monitoring/{kode_kapal}/

Contoh:
    ws://localhost:8000/ws/monitoring/JLS-001/
    ws://localhost:8000/ws/monitoring/JLS-002/
"""

from django.urls import re_path
from . import consumers

# Pola URL untuk koneksi WebSocket
websocket_urlpatterns = [
    # Endpoint pemantauan kapal real-time
    # {ship_code} akan di-capture sebagai parameter URL
    re_path(
        r'ws/monitoring/(?P<ship_code>\w+-\w+)/$',
        consumers.MonitoringConsumer.as_asgi()
    ),
]
