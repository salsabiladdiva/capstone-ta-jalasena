"""
============================================
Serializer Pemantauan & Telemetri
============================================

Serializer untuk data telemetri dan peringatan kapal.
"""

from rest_framework import serializers
from .models import ShipTelemetry, Alert
from .ai_model import analyze_tilt, calculate_safety_score


class ShipTelemetrySerializer(serializers.ModelSerializer):
    """
    Serializer untuk model ShipTelemetry.

    Menampilkan data telemetri dengan informasi tambahan:
    - Kode kapal (untuk identifikasi tanpa join)
    - Skor keselamatan (dihitung dari AI model)
    """

    # Menampilkan kode kapal secara langsung
    ship_code = serializers.CharField(
        source='ship.ship_code',
        read_only=True
    )

    # Skor keselamatan yang dihitung oleh model AI
    safety_score = serializers.SerializerMethodField()

    class Meta:
        model = ShipTelemetry
        fields = [
            'id',
            'ship',             # ID kapal (untuk write)
            'ship_code',        # Kode kapal (read-only)
            'tilt_degree',
            'temperature',
            'speed',
            'latitude',
            'longitude',
            'safety_score',     # Skor keselamatan (read-only, dihitung)
            'timestamp',
        ]
        read_only_fields = ['id', 'timestamp', 'ship_code', 'safety_score']

    def get_safety_score(self, obj):
        """
        Menghitung skor keselamatan menggunakan model AI.
        Kombinasi kemiringan dan kecepatan kapal.
        """
        return calculate_safety_score(obj.tilt_degree, obj.speed)


class AlertSerializer(serializers.ModelSerializer):
    """
    Serializer untuk model Alert.
    Menampilkan data peringatan lengkap dengan kode kapal.
    """

    # Menampilkan kode kapal secara langsung
    ship_code = serializers.CharField(
        source='ship.ship_code',
        read_only=True
    )

    class Meta:
        model = Alert
        fields = [
            'id',
            'ship',
            'ship_code',
            'alert_type',
            'tilt_degree',
            'message',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class TelemetryInputSerializer(serializers.Serializer):
    """
    Serializer untuk validasi data telemetri masukan (dari WebSocket).

    Digunakan untuk memvalidasi data yang dikirim oleh perangkat IoT
    di kapal melalui koneksi WebSocket.

    Format data masukan:
        {
            "tilt_degree": 12.5,
            "temperature": 28.3,
            "speed": 5.2,
            "latitude": -6.8765,
            "longitude": 110.4321
        }
    """
    tilt_degree = serializers.FloatField(
        required=True,
        min_value=-90.0,
        max_value=90.0,
        help_text='Derajat kemiringan kapal (-90 sampai 90)'
    )
    temperature = serializers.FloatField(
        required=False,
        default=28.0,
        help_text='Suhu di sekitar kapal (°C)'
    )
    speed = serializers.FloatField(
        required=False,
        default=0.0,
        min_value=0.0,
        help_text='Kecepatan kapal dalam knot'
    )
    latitude = serializers.FloatField(
        required=True,
        min_value=-90.0,
        max_value=90.0,
        help_text='Koordinat lintang GPS'
    )
    longitude = serializers.FloatField(
        required=True,
        min_value=-180.0,
        max_value=180.0,
        help_text='Koordinat bujur GPS'
    )
