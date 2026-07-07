"""
============================================
URL Kapal
============================================

Konfigurasi routing URL untuk endpoint kapal dan autentikasi.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Endpoint autentikasi - login menggunakan kode kapal
    path(
        'auth/login/',
        views.ShipLoginView.as_view(),
        name='ship-login'
    ),

    # Endpoint detail kapal berdasarkan kode kapal
    path(
        'ships/<str:ship_code>/',
        views.ShipDetailView.as_view(),
        name='ship-detail'
    ),
]
