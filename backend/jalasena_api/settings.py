"""
============================================
JALASENA API - Konfigurasi Pengaturan Django
============================================

Sistem prediksi zona penangkapan ikan dan pemantauan kapal maritim.
Pengaturan ini mencakup konfigurasi database Supabase, REST framework,
CORS, dan Django Channels untuk komunikasi WebSocket real-time.

Palet Warna:
- #212121 (gelap/dark) - Warna utama latar belakang
- #FF471D (oranye/orange accent) - Warna aksen
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Memuat variabel lingkungan dari file .env
load_dotenv()

# Direktori dasar proyek (backend/)
BASE_DIR = Path(__file__).resolve().parent.parent

# ============================================
# Pengaturan Keamanan
# ============================================

# Kunci rahasia untuk kriptografi Django (WAJIB diganti di produksi!)
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-jalasena-dev-key-ganti-di-produksi')

# Mode debug - JANGAN aktifkan di server produksi
DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 'yes')

# Daftar host yang diizinkan mengakses aplikasi
ALLOWED_HOSTS = ['*']

# ============================================
# Definisi Aplikasi yang Terpasang
# ============================================
INSTALLED_APPS = [
    # Aplikasi bawaan Django
    'daphne',                    # Server ASGI untuk WebSocket
    'django.contrib.admin',      # Panel admin Django
    'django.contrib.auth',       # Sistem autentikasi
    'django.contrib.contenttypes',  # Tipe konten
    'django.contrib.sessions',   # Manajemen sesi
    'django.contrib.messages',   # Sistem pesan
    'django.contrib.staticfiles',  # File statis

    # Aplikasi pihak ketiga
    'rest_framework',            # Django REST Framework untuk API
    'corsheaders',               # CORS headers untuk akses lintas domain
    'channels',                  # Django Channels untuk WebSocket
    'django_filters',            # Filter queryset untuk API

    # Aplikasi JALASENA
    'fish_zones',                # Modul zona penangkapan ikan
    'ships',                     # Modul manajemen kapal
    'monitoring',                # Modul pemantauan & telemetri kapal
]

# ============================================
# Middleware
# ============================================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',        # CORS harus di atas CommonMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'jalasena_api.urls'

# ============================================
# Konfigurasi Template
# ============================================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Konfigurasi WSGI (HTTP biasa)
WSGI_APPLICATION = 'jalasena_api.wsgi.application'

# Konfigurasi ASGI (WebSocket + HTTP)
ASGI_APPLICATION = 'jalasena_api.asgi.application'

# ============================================
# Konfigurasi Database - Supabase (PostgreSQL) / SQLite Fallback
# ============================================
# Menggunakan SQLite secara default jika tidak ada konfigurasi PostgreSQL/Supabase yang valid
db_host = os.getenv('SUPABASE_DB_HOST', '')
is_placeholder = 'xxxxx' in db_host or not db_host
USE_SQLITE = os.getenv('USE_SQLITE', 'True').lower() in ('true', '1', 'yes')

if USE_SQLITE or is_placeholder:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('SUPABASE_DB_NAME', 'postgres'),
            'USER': os.getenv('SUPABASE_DB_USER', 'postgres'),
            'PASSWORD': os.getenv('SUPABASE_DB_PASSWORD', ''),
            'HOST': db_host,
            'PORT': os.getenv('SUPABASE_DB_PORT', '5432'),
            'OPTIONS': {
                'connect_timeout': 10,
            },
        }
    }

# ============================================
# Validasi Password
# ============================================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ============================================
# Internasionalisasi
# ============================================
LANGUAGE_CODE = 'id'          # Bahasa Indonesia
TIME_ZONE = 'Asia/Jakarta'    # Zona waktu WIB (Jakarta)
USE_I18N = True
USE_TZ = True

# ============================================
# File Statis
# ============================================
STATIC_URL = 'static/'

# ============================================
# Tipe Primary Key Default
# ============================================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ============================================
# Konfigurasi Django REST Framework
# ============================================
REST_FRAMEWORK = {
    # Paginasi default - membatasi jumlah data per halaman
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,

    # Filter backend untuk pencarian dan penyaringan data
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],

    # Renderer untuk format respons API
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],

    # Format waktu dan tanggal
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%S%z',
}

# ============================================
# Konfigurasi CORS (Cross-Origin Resource Sharing)
# ============================================
# Mengizinkan frontend Next.js untuk mengakses API
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',     # Frontend Next.js development
]

# Mengizinkan pengiriman cookie dalam permintaan lintas domain
CORS_ALLOW_CREDENTIALS = True

# ============================================
# Konfigurasi Django Channels (WebSocket)
# ============================================
# Menggunakan channel layer in-memory untuk pengembangan
# Di produksi, gunakan Redis sebagai channel layer
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
        # Untuk produksi, gunakan Redis:
        # 'BACKEND': 'channels_redis.core.RedisChannelLayer',
        # 'CONFIG': {
        #     'hosts': [('127.0.0.1', 6379)],
        # },
    },
}

# ============================================
# Konfigurasi Logging
# ============================================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} {name}: {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'fish_zones': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
        'ships': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
        'monitoring': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
