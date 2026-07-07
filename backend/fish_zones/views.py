"""
============================================
View Zona Penangkapan Ikan
============================================

View ini menangani endpoint API untuk zona penangkapan ikan.
Mendukung filter berdasarkan jenis ikan melalui parameter query.

Endpoint:
    GET /api/fish-zones/               - Daftar semua zona ikan
    GET /api/fish-zones/?type=kembung   - Filter zona berdasarkan jenis ikan
    GET /api/fish-zones/{id}/           - Detail zona tertentu
    GET /api/fish-types/               - Daftar semua jenis ikan
"""

import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import FishType, FishZone
from .serializers import FishTypeSerializer, FishZoneSerializer

# Logger untuk mencatat aktivitas aplikasi
logger = logging.getLogger(__name__)


class FishTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet untuk melihat daftar jenis ikan.

    Hanya mendukung operasi baca (GET) karena data jenis ikan
    dikelola melalui panel admin atau perintah seed_data.

    Endpoint:
        GET /api/fish-types/      - Daftar semua jenis ikan
        GET /api/fish-types/{id}/ - Detail jenis ikan tertentu
    """
    queryset = FishType.objects.all()
    serializer_class = FishTypeSerializer
    # Menonaktifkan paginasi untuk daftar jenis ikan
    # karena jumlahnya sedikit
    pagination_class = None


class FishZoneViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet untuk melihat zona penangkapan ikan.

    Mendukung filter berdasarkan jenis ikan menggunakan
    parameter query 'type'. Nama jenis ikan bersifat
    case-insensitive (tidak peka huruf besar/kecil).

    Endpoint:
        GET /api/fish-zones/                - Semua zona ikan
        GET /api/fish-zones/?type=kembung   - Zona ikan Kembung
        GET /api/fish-zones/?type=teri      - Zona ikan Teri
        GET /api/fish-zones/?type=tongkol   - Zona ikan Tongkol

    TODO: Integrasi Copernicus Marine Service API
    - Menambahkan endpoint untuk memperbarui data SST dan klorofil
      secara otomatis dari data satelit Copernicus
    - Menambahkan perhitungan skor potensi berdasarkan data real-time
    """
    serializer_class = FishZoneSerializer
    # Menonaktifkan paginasi agar semua zona dikembalikan sekaligus
    # (cocok untuk tampilan peta di frontend)
    pagination_class = None

    def get_queryset(self):
        """
        Mengembalikan queryset zona ikan yang sudah difilter.

        Filter berdasarkan parameter 'type' di query string.
        Jika tidak ada parameter 'type', kembalikan semua zona.

        Contoh penggunaan:
            /api/fish-zones/?type=kembung  → Zona Kembung saja
            /api/fish-zones/?type=teri     → Zona Teri saja
            /api/fish-zones/               → Semua zona
        """
        queryset = FishZone.objects.select_related('fish_type').all()

        # Mengambil parameter filter 'type' dari query string
        fish_type_name = self.request.query_params.get('type', None)

        if fish_type_name is not None:
            # Filter berdasarkan nama jenis ikan (case-insensitive)
            queryset = queryset.filter(
                fish_type__name__iexact=fish_type_name
            )
            logger.info(
                f"Filter zona ikan berdasarkan jenis: {fish_type_name}, "
                f"ditemukan {queryset.count()} zona"
            )

        return queryset

    def list(self, request, *args, **kwargs):
        """
        Override method list untuk menambahkan metadata respons.
        Mengembalikan data zona ikan beserta informasi tambahan.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        # Menyusun respons dengan metadata tambahan
        response_data = {
            'total': queryset.count(),
            'filter_type': request.query_params.get('type', 'semua'),
            'zones': serializer.data,
        }

        return Response(response_data, status=status.HTTP_200_OK)
