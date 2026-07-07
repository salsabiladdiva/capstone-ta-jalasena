"""
============================================
Admin Pemantauan & Telemetri
============================================

Konfigurasi panel admin Django untuk mengelola
data telemetri dan peringatan kapal.
"""

from django.contrib import admin
from .models import ShipTelemetry, Alert


@admin.register(ShipTelemetry)
class ShipTelemetryAdmin(admin.ModelAdmin):
    """Konfigurasi admin untuk model ShipTelemetry."""
    list_display = ['ship', 'tilt_degree', 'temperature', 'speed',
                    'latitude', 'longitude', 'timestamp']
    list_filter = ['ship', 'timestamp']
    search_fields = ['ship__ship_code', 'ship__name']
    readonly_fields = ['timestamp']
    ordering = ['-timestamp']


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    """Konfigurasi admin untuk model Alert."""
    list_display = ['ship', 'alert_type', 'tilt_degree', 'message',
                    'is_read', 'created_at']
    list_filter = ['alert_type', 'is_read', 'ship']
    search_fields = ['ship__ship_code', 'message']
    readonly_fields = ['created_at']
    ordering = ['-created_at']

    # Aksi kustom untuk menandai peringatan sebagai sudah dibaca
    actions = ['tandai_sudah_dibaca']

    @admin.action(description='Tandai peringatan terpilih sebagai sudah dibaca')
    def tandai_sudah_dibaca(self, request, queryset):
        """Menandai peringatan yang dipilih sebagai sudah dibaca."""
        jumlah = queryset.update(is_read=True)
        self.message_user(
            request,
            f'{jumlah} peringatan berhasil ditandai sebagai sudah dibaca.'
        )
