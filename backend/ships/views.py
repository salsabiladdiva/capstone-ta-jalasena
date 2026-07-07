"""
============================================
View Kapal
============================================

View ini menangani endpoint API untuk manajemen kapal
dan autentikasi berbasis kode kapal.

Endpoint:
    POST /api/auth/login/      - Login kapal dengan kode kapal
    GET  /api/ships/{code}/    - Detail kapal berdasarkan kode
"""

import logging
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Ship
from .serializers import ShipSerializer, ShipLoginSerializer

# Logger untuk mencatat aktivitas autentikasi
logger = logging.getLogger(__name__)


class ShipLoginView(APIView):
    """
    View untuk autentikasi kapal.

    Kapal login menggunakan kode kapal unik (ship_code).
    Jika kode valid dan kapal aktif, mengembalikan informasi kapal.

    Endpoint: POST /api/auth/login/

    Request Body:
        {
            "ship_code": "JLS-001"
        }

    Response Sukses (200):
        {
            "pesan": "Login berhasil",
            "kapal": { ...data kapal... }
        }

    Response Gagal (401):
        {
            "pesan": "Kode kapal tidak valid",
            "errors": { ...detail error... }
        }
    """

    def post(self, request):
        """Memproses permintaan login kapal."""
        serializer = ShipLoginSerializer(data=request.data)

        if serializer.is_valid():
            # Mengambil data kapal berdasarkan kode yang sudah divalidasi
            ship_code = serializer.validated_data['ship_code']
            ship = Ship.objects.get(ship_code=ship_code)

            logger.info(f"Login berhasil untuk kapal: {ship_code} ({ship.name})")

            return Response({
                'pesan': 'Login berhasil',
                'kapal': ShipSerializer(ship).data,
            }, status=status.HTTP_200_OK)

        logger.warning(
            f"Login gagal dengan kode: {request.data.get('ship_code', 'tidak ada')}"
        )

        return Response({
            'pesan': 'Kode kapal tidak valid',
            'errors': serializer.errors,
        }, status=status.HTTP_401_UNAUTHORIZED)


class ShipDetailView(APIView):
    """
    View untuk melihat detail kapal berdasarkan kode kapal.

    Endpoint: GET /api/ships/{ship_code}/

    Response Sukses (200):
        { ...data kapal... }

    Response Gagal (404):
        {
            "pesan": "Kapal tidak ditemukan",
            "kode_kapal": "JLS-999"
        }
    """

    def get(self, request, ship_code):
        """Mengambil detail kapal berdasarkan kode kapal."""
        try:
            ship = Ship.objects.get(ship_code=ship_code)
        except Ship.DoesNotExist:
            logger.warning(f"Kapal dengan kode {ship_code} tidak ditemukan")
            return Response({
                'pesan': 'Kapal tidak ditemukan',
                'kode_kapal': ship_code,
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ShipSerializer(ship)
        return Response(serializer.data, status=status.HTTP_200_OK)
