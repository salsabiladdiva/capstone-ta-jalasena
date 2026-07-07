"""
============================================
JALASENA API - Konfigurasi WSGI
============================================

Konfigurasi WSGI (Web Server Gateway Interface) untuk deployment
menggunakan server HTTP tradisional seperti Gunicorn.

Untuk WebSocket, gunakan ASGI (lihat asgi.py).
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jalasena_api.settings')

application = get_wsgi_application()
