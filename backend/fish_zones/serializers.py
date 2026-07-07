"""
============================================
Serializer Zona Penangkapan Ikan
============================================

Serializer mengubah model Django menjadi format JSON untuk API
dan sebaliknya. Digunakan untuk validasi data masukan dan
format data keluaran.
"""

from rest_framework import serializers
from .models import FishType, FishZone


class FishTypeSerializer(serializers.ModelSerializer):
    """
    Serializer untuk model FishType.
    Menampilkan informasi dasar jenis ikan beserta
    parameter oseanografi yang disukai.
    """

    class Meta:
        model = FishType
        fields = [
            'id',
            'name',
            'icon_name',
            'description',
            'preferred_sst_min',
            'preferred_sst_max',
            'preferred_chlorophyll_min',
            'preferred_chlorophyll_max',
        ]


class FishZoneSerializer(serializers.ModelSerializer):
    """
    Serializer untuk model FishZone.

    Menyertakan informasi jenis ikan secara nested (bersarang)
    agar frontend tidak perlu melakukan request tambahan untuk
    mendapatkan detail jenis ikan.
    """

    # Menampilkan nama jenis ikan secara langsung (read-only)
    fish_type_name = serializers.CharField(
        source='fish_type.name',
        read_only=True
    )
    # Menampilkan ikon jenis ikan (read-only)
    fish_type_icon = serializers.CharField(
        source='fish_type.icon_name',
        read_only=True
    )

    class Meta:
        model = FishZone
        fields = [
            'id',
            'fish_type',           # ID jenis ikan (untuk write)
            'fish_type_name',      # Nama jenis ikan (read-only)
            'fish_type_icon',      # Ikon jenis ikan (read-only)
            'latitude',
            'longitude',
            'potential_score',
            'sst',
            'chlorophyll',
            'last_updated',
        ]
