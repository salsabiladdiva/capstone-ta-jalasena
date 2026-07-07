"""
============================================
Model AI Deteksi Kemiringan Kapal
============================================

Model AI sederhana berbasis ambang batas (threshold) untuk
mendeteksi kondisi bahaya berdasarkan derajat kemiringan kapal.

Tingkat kemiringan dan klasifikasi:
┌────────────────┬──────────────┬──────────────────────────────────┐
│ Rentang (°)    │ Klasifikasi  │ Deskripsi                        │
├────────────────┼──────────────┼──────────────────────────────────┤
│ 0 - 15         │ NORMAL       │ Kapal dalam kondisi stabil       │
│ 15 - 30        │ WARNING      │ Perlu perhatian, gelombang besar │
│ > 30           │ DANGER       │ Bahaya! Risiko terbalik tinggi   │
└────────────────┴──────────────┴──────────────────────────────────┘

Catatan: Ini adalah model sederhana berbasis threshold.
Di masa depan, dapat diganti dengan model machine learning
yang lebih canggih (misalnya LSTM untuk prediksi time-series).
"""

import logging

logger = logging.getLogger(__name__)

# ============================================
# Konstanta Ambang Batas Kemiringan
# ============================================

# Batas minimum untuk peringatan (warning)
TILT_WARNING_THRESHOLD = 15.0  # derajat

# Batas minimum untuk bahaya (danger)
TILT_DANGER_THRESHOLD = 30.0  # derajat


def analyze_tilt(tilt_degree):
    """
    Menganalisis derajat kemiringan kapal dan mengembalikan
    klasifikasi tingkat bahaya.

    Fungsi ini merupakan inti dari sistem deteksi bahaya
    JALASENA. Menggunakan pendekatan threshold sederhana
    untuk mengklasifikasikan kondisi kapal.

    Parameter:
        tilt_degree (float): Derajat kemiringan kapal (0-90°)

    Returns:
        dict: Hasil analisis dengan format:
            {
                'alert_type': str,    # 'INFO', 'WARNING', atau 'DANGER'
                'message': str,       # Pesan deskriptif
                'should_alert': bool, # Apakah perlu membuat alert
                'tilt_degree': float, # Derajat kemiringan yang dianalisis
            }

    Contoh Penggunaan:
        >>> result = analyze_tilt(25.0)
        >>> result['alert_type']
        'WARNING'
        >>> result['should_alert']
        True
    """
    # Mengambil nilai absolut untuk menangani kemiringan negatif
    abs_tilt = abs(tilt_degree)

    if abs_tilt > TILT_DANGER_THRESHOLD:
        # BAHAYA: Kemiringan melebihi 30 derajat
        # Kapal berisiko tinggi untuk terbalik
        logger.critical(
            f"⚠️ BAHAYA! Kemiringan kapal mencapai {abs_tilt:.1f}° "
            f"(ambang batas: {TILT_DANGER_THRESHOLD}°)"
        )
        return {
            'alert_type': 'DANGER',
            'message': (
                f'BAHAYA! Kemiringan kapal mencapai {abs_tilt:.1f}°. '
                f'Segera lakukan tindakan penyelamatan! '
                f'Risiko kapal terbalik sangat tinggi. '
                f'Pastikan semua penumpang mengenakan pelampung.'
            ),
            'should_alert': True,
            'tilt_degree': abs_tilt,
        }

    elif abs_tilt > TILT_WARNING_THRESHOLD:
        # PERINGATAN: Kemiringan antara 15-30 derajat
        # Perlu perhatian, kemungkinan gelombang besar
        logger.warning(
            f"⚡ Peringatan: Kemiringan kapal {abs_tilt:.1f}° "
            f"(ambang batas peringatan: {TILT_WARNING_THRESHOLD}°)"
        )
        return {
            'alert_type': 'WARNING',
            'message': (
                f'Peringatan: Kemiringan kapal mencapai {abs_tilt:.1f}°. '
                f'Kondisi laut mungkin tidak stabil. '
                f'Harap waspada dan kurangi kecepatan. '
                f'Pastikan muatan terikat dengan aman.'
            ),
            'should_alert': True,
            'tilt_degree': abs_tilt,
        }

    else:
        # NORMAL: Kemiringan di bawah 15 derajat
        # Kondisi kapal stabil, tidak perlu peringatan
        return {
            'alert_type': 'INFO',
            'message': (
                f'Kondisi kapal stabil. '
                f'Kemiringan {abs_tilt:.1f}° dalam batas normal.'
            ),
            'should_alert': False,
            'tilt_degree': abs_tilt,
        }


def calculate_safety_score(tilt_degree, speed=0.0):
    """
    Menghitung skor keselamatan kapal berdasarkan kemiringan dan kecepatan.

    Skor keselamatan adalah nilai 0.0 - 1.0 dimana:
    - 1.0 = sangat aman
    - 0.0 = sangat berbahaya

    Parameter:
        tilt_degree (float): Derajat kemiringan kapal
        speed (float): Kecepatan kapal dalam knot (opsional)

    Returns:
        float: Skor keselamatan (0.0 - 1.0)
    """
    abs_tilt = abs(tilt_degree)

    # Komponen kemiringan (bobot 70%)
    # Semakin miring, semakin rendah skornya
    if abs_tilt >= 90:
        tilt_score = 0.0
    else:
        tilt_score = max(0.0, 1.0 - (abs_tilt / 90.0))

    # Komponen kecepatan (bobot 30%)
    # Kecepatan tinggi saat miring = lebih berbahaya
    # Kecepatan normal kapal nelayan: 0-12 knot
    speed_score = max(0.0, 1.0 - (speed / 20.0)) if speed > 0 else 1.0

    # Skor akhir (kombinasi berbobot)
    safety_score = (tilt_score * 0.7) + (speed_score * 0.3)

    return round(safety_score, 2)
