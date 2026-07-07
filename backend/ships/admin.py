"""
============================================
Admin Kapal
============================================

Konfigurasi panel admin Django untuk mengelola data kapal.
"""

from django.contrib import admin
from .models import Ship


@admin.register(Ship)
class ShipAdmin(admin.ModelAdmin):
    """Konfigurasi admin untuk model Ship."""
    list_display = ['ship_code', 'name', 'owner_name', 'is_active',
                    'is_moving', 'current_lat', 'current_lng', 'updated_at']
    list_filter = ['is_active', 'is_moving']
    search_fields = ['ship_code', 'name', 'owner_name']
    readonly_fields = ['created_at', 'updated_at']
