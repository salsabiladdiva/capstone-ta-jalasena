"""
============================================
URL Zona Penangkapan Ikan
============================================

Konfigurasi routing URL untuk endpoint zona ikan.
Menggunakan DefaultRouter dari DRF untuk otomatis
membuat endpoint CRUD.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router otomatis membuat URL pattern untuk ViewSet
router = DefaultRouter()
router.register(r'fish-zones', views.FishZoneViewSet, basename='fish-zone')
router.register(r'fish-types', views.FishTypeViewSet, basename='fish-type')

urlpatterns = [
    path('', include(router.urls)),
]
