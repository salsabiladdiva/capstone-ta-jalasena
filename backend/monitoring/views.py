"""
============================================
View Pemantauan & Telemetri Kapal
============================================

View ini menangani endpoint API untuk data telemetri
dan riwayat pemantauan kapal.

Endpoint:
    GET /api/ships/{code}/telemetry/         - Riwayat telemetri kapal
    GET /api/ships/{code}/telemetry/latest/   - Data telemetri terbaru
    GET /api/ships/{code}/alerts/             - Daftar peringatan kapal
"""

import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from ships.models import Ship
from .models import ShipTelemetry, Alert
from .serializers import ShipTelemetrySerializer, AlertSerializer

# Logger untuk mencatat aktivitas pemantauan
logger = logging.getLogger(__name__)


class TelemetryPagination(PageNumberPagination):
    """
    Paginasi khusus untuk data telemetri.
    Menampilkan 50 data per halaman karena telemetri
    bisa sangat banyak (dikirim setiap beberapa detik).
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


class ShipTelemetryHistoryView(APIView):
    """
    View untuk melihat riwayat telemetri kapal.

    Menampilkan data telemetri dalam urutan waktu terbaru.
    Mendukung paginasi untuk menangani data dalam jumlah besar.

    Endpoint: GET /api/ships/{ship_code}/telemetry/

    Parameter Query:
        page (int): Nomor halaman (default: 1)
        page_size (int): Jumlah data per halaman (default: 50, maks: 200)

    Response Sukses (200):
        {
            "count": 150,
            "next": "http://host/api/ships/JLS-001/telemetry/?page=2",
            "previous": null,
            "results": [ ...data telemetri... ]
        }
    """

    def get(self, request, ship_code):
        """Mengambil riwayat telemetri kapal."""
        # Memastikan kapal ada di database
        try:
            ship = Ship.objects.get(ship_code=ship_code)
        except Ship.DoesNotExist:
            return Response({
                'pesan': 'Kapal tidak ditemukan',
                'kode_kapal': ship_code,
            }, status=status.HTTP_404_NOT_FOUND)

        # Mengambil data telemetri dengan paginasi
        telemetry_data = ShipTelemetry.objects.filter(ship=ship)

        # Menerapkan paginasi
        paginator = TelemetryPagination()
        paginated_data = paginator.paginate_queryset(telemetry_data, request)
        serializer = ShipTelemetrySerializer(paginated_data, many=True)

        return paginator.get_paginated_response(serializer.data)


class ShipTelemetryLatestView(APIView):
    """
    View untuk melihat data telemetri terbaru kapal.

    Hanya mengembalikan 1 data telemetri terakhir yang diterima.
    Cocok untuk tampilan dashboard real-time.

    Endpoint: GET /api/ships/{ship_code}/telemetry/latest/

    Response Sukses (200):
        { ...data telemetri terbaru... }

    Response Kosong (200):
        {
            "pesan": "Belum ada data telemetri",
            "kode_kapal": "JLS-001"
        }
    """

    def get(self, request, ship_code):
        """Mengambil data telemetri terbaru kapal."""
        try:
            ship = Ship.objects.get(ship_code=ship_code)
        except Ship.DoesNotExist:
            return Response({
                'pesan': 'Kapal tidak ditemukan',
                'kode_kapal': ship_code,
            }, status=status.HTTP_404_NOT_FOUND)

        # Mengambil data telemetri terbaru (1 data terakhir)
        latest_telemetry = ShipTelemetry.objects.filter(
            ship=ship
        ).first()  # Sudah diurutkan -timestamp dari Meta.ordering

        if latest_telemetry is None:
            return Response({
                'pesan': 'Belum ada data telemetri untuk kapal ini',
                'kode_kapal': ship_code,
            }, status=status.HTTP_200_OK)

        serializer = ShipTelemetrySerializer(latest_telemetry)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ShipAlertListView(APIView):
    """
    View untuk melihat daftar peringatan kapal.

    Menampilkan semua peringatan yang pernah dihasilkan
    untuk kapal tertentu, diurutkan dari yang terbaru.

    Endpoint: GET /api/ships/{ship_code}/alerts/

    Parameter Query:
        type (str): Filter berdasarkan jenis alert (INFO/WARNING/DANGER)
        unread (bool): Jika 'true', hanya tampilkan yang belum dibaca
    """

    def get(self, request, ship_code):
        """Mengambil daftar peringatan kapal."""
        try:
            ship = Ship.objects.get(ship_code=ship_code)
        except Ship.DoesNotExist:
            return Response({
                'pesan': 'Kapal tidak ditemukan',
                'kode_kapal': ship_code,
            }, status=status.HTTP_404_NOT_FOUND)

        # Mengambil peringatan dengan filter opsional
        alerts = Alert.objects.filter(ship=ship)

        # Filter berdasarkan jenis peringatan
        alert_type = request.query_params.get('type', None)
        if alert_type:
            alerts = alerts.filter(alert_type=alert_type.upper())

        # Filter hanya peringatan yang belum dibaca
        unread_only = request.query_params.get('unread', None)
        if unread_only and unread_only.lower() == 'true':
            alerts = alerts.filter(is_read=False)

        serializer = AlertSerializer(alerts, many=True)

        return Response({
            'total': alerts.count(),
            'kode_kapal': ship_code,
            'alerts': serializer.data,
        }, status=status.HTTP_200_OK)
