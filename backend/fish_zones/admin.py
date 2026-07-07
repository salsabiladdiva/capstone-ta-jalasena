"""
============================================
Admin Zona Penangkapan Ikan
============================================

Konfigurasi panel admin Django untuk mengelola
data jenis ikan dan zona penangkapan.
"""

from django.contrib import admin
from .models import FishType, FishZone


@admin.register(FishType)
class FishTypeAdmin(admin.ModelAdmin):
    """Konfigurasi admin untuk model FishType."""
    list_display = ['name', 'icon_name', 'preferred_sst_min', 'preferred_sst_max',
                    'preferred_chlorophyll_min', 'preferred_chlorophyll_max']
    search_fields = ['name']


@admin.register(FishZone)
class FishZoneAdmin(admin.ModelAdmin):
    """Konfigurasi admin untuk model FishZone."""
    list_display = ['fish_type', 'latitude', 'longitude', 'potential_score',
                    'sst', 'chlorophyll', 'last_updated']
    list_filter = ['fish_type']
    search_fields = ['fish_type__name']
    ordering = ['-potential_score']
