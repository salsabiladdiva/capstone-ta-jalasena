"""
============================================
JALASENA - Skrip Seed Data (Standalone)
============================================

Skrip ini dapat dijalankan langsung untuk mengisi data dummy:
    python seed_data.py

Atau gunakan perintah manajemen Django:
    python manage.py seed_data

Kedua cara di atas menghasilkan hasil yang sama.
"""

import os
import sys
import django

# Menambahkan direktori proyek ke path Python
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jalasena_api.settings')

# Inisialisasi Django sebelum mengimpor model
django.setup()

# Menjalankan perintah seed_data
from django.core.management import call_command

if __name__ == '__main__':
    print("🌊 JALASENA - Mengisi Data Dummy...")
    print("=" * 50)

    # Menjalankan perintah manajemen seed_data
    # Gunakan --clear untuk menghapus data lama terlebih dahulu
    call_command('seed_data', clear=True)

    print("\n✅ Selesai! Data dummy berhasil diisi ke database.")
    print("   Jalankan server dengan: python manage.py runserver")
