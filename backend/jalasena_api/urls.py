"""
============================================
JALASENA API - Konfigurasi URL Utama
============================================

Menghubungkan semua endpoint API dari setiap aplikasi.
Semua API menggunakan prefix /api/ untuk konsistensi.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_root(request):
    """
    Halaman utama API JALASENA.
    Menampilkan daftar endpoint yang tersedia.
    """
    return JsonResponse({
        'pesan': 'Selamat datang di JALASENA API',
        'deskripsi': 'Sistem Prediksi Zona Penangkapan Ikan & Pemantauan Kapal Maritim',
        'versi': '1.0.0',
        'endpoints': {
            'zona_ikan': '/api/fish-zones/',
            'autentikasi': '/api/auth/login/',
            'kapal': '/api/ships/<kode_kapal>/',
            'telemetri': '/api/ships/<kode_kapal>/telemetry/',
            'telemetri_terkini': '/api/ships/<kode_kapal>/telemetry/latest/',
            'websocket_monitoring': 'ws://host/ws/monitoring/<kode_kapal>/',
        },
        'palet_warna': {
            'gelap': '#212121',
            'aksen_oranye': '#FF471D',
        }
    })


urlpatterns = [
    # Halaman utama API
    path('', api_root, name='api-root'),

    # Panel admin Django
    path('admin/', admin.site.urls),

    # Endpoint zona penangkapan ikan
    path('api/', include('fish_zones.urls')),

    # Endpoint autentikasi dan manajemen kapal
    path('api/', include('ships.urls')),

    # Endpoint pemantauan dan telemetri kapal
    path('api/', include('monitoring.urls')),
]
