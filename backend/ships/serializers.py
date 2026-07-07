"""
============================================
Serializer Kapal
============================================

Serializer untuk mengubah model Ship menjadi format JSON
dan memvalidasi data masukan untuk autentikasi.
"""

from rest_framework import serializers
from .models import Ship


class ShipSerializer(serializers.ModelSerializer):
    """
    Serializer untuk model Ship.
    Menampilkan informasi lengkap kapal termasuk posisi terkini.
    """

    class Meta:
        model = Ship
        fields = [
            'id',
            'ship_code',
            'name',
            'owner_name',
            'current_lat',
            'current_lng',
            'is_active',
            'is_moving',
            'created_at',
            'updated_at',
        ]
        # Field yang tidak boleh diubah melalui API
        read_only_fields = ['id', 'created_at', 'updated_at']


class ShipLoginSerializer(serializers.Serializer):
    """
    Serializer untuk autentikasi kapal.

    Kapal login menggunakan kode kapal (ship_code) saja,
    tanpa password. Ini cocok untuk perangkat IoT di kapal
    yang memiliki kode unik tertanam.

    Contoh request body:
        {
            "ship_code": "JLS-001"
        }
    """
    ship_code = serializers.CharField(
        max_length=20,
        required=True,
        help_text='Kode unik kapal untuk autentikasi (contoh: JLS-001)'
    )

    def validate_ship_code(self, value):
        """
        Memvalidasi bahwa kode kapal terdaftar dan aktif.

        Pemeriksaan yang dilakukan:
        1. Kode kapal ada di database
        2. Kapal dalam status aktif (is_active=True)
        """
        try:
            ship = Ship.objects.get(ship_code=value)
        except Ship.DoesNotExist:
            raise serializers.ValidationError(
                'Kode kapal tidak ditemukan. '
                'Pastikan kode kapal yang dimasukkan benar.'
            )

        if not ship.is_active:
            raise serializers.ValidationError(
                'Kapal dengan kode ini sudah tidak aktif dalam sistem.'
            )

        return value
