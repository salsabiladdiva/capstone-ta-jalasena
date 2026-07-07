"""
============================================
URL Pemantauan & Telemetri
============================================

Konfigurasi routing URL untuk endpoint pemantauan kapal.
Semua endpoint menggunakan kode kapal sebagai identifier.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Riwayat telemetri kapal (dengan paginasi)
    path(
        'ships/<str:ship_code>/telemetry/',
        views.ShipTelemetryHistoryView.as_view(),
        name='ship-telemetry-history'
    ),

    # Data telemetri terbaru (1 data terakhir)
    path(
        'ships/<str:ship_code>/telemetry/latest/',
        views.ShipTelemetryLatestView.as_view(),
        name='ship-telemetry-latest'
    ),

    # Daftar peringatan kapal
    path(
        'ships/<str:ship_code>/alerts/',
        views.ShipAlertListView.as_view(),
        name='ship-alerts'
    ),
]
