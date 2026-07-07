#!/usr/bin/env python
"""
Skrip manajemen Django untuk proyek JALASENA.
Digunakan untuk menjalankan server, migrasi database, dan perintah manajemen lainnya.
"""
import os
import sys


def main():
    """Menjalankan tugas administratif Django."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jalasena_api.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Tidak dapat mengimpor Django. Pastikan Django sudah terinstal "
            "dan tersedia di variabel lingkungan PYTHONPATH. "
            "Apakah Anda lupa mengaktifkan virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
