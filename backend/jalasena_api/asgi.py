"""
============================================
JALASENA API - Konfigurasi ASGI
============================================

Konfigurasi ASGI (Asynchronous Server Gateway Interface) untuk mendukung:
- HTTP biasa (REST API)
- WebSocket (pemantauan real-time kapal)

Django Channels digunakan untuk menangani koneksi WebSocket
di endpoint /ws/monitoring/{kode_kapal}/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jalasena_api.settings')

# Inisialisasi aplikasi Django terlebih dahulu
django_asgi_app = get_asgi_application()

# Import routing WebSocket setelah Django terinisialisasi
from monitoring.routing import websocket_urlpatterns

# Konfigurasi router protokol:
# - HTTP: menggunakan Django ASGI standar
# - WebSocket: menggunakan Django Channels dengan autentikasi
application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
