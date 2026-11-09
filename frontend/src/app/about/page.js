/* ================================================
   JALASENA - Halaman Tentang (About)
   ================================================
   Isi halaman:
   - Ringkasan proyek (HKI, durasi pengerjaan)
   - Tim pengembang & dosen pembimbing
   - Teknologi (bahasa pemrograman & AI)
   - Perangkat IoT (beserta gambar)
   - Cara kerja sistem & alur teknis
   - Bagaimana monitoring bisa akurat

   CARA MENGISI DATA:
   Semua teks yang perlu kamu isi sendiri ada di bagian
   "DATA HALAMAN" di bawah, ditandai komentar "ISI:".
   Teks berformat [seperti ini] = masih placeholder.
   ================================================ */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import styles from './about.module.css';

// ================================================
// DATA HALAMAN (edit di sini saja)
// ================================================

// ISI: nama lengkap, peran, dan (opsional) foto di public/images/team/
const TEAM = [
  { name: '[Nama Anggota 1]', role: '[Peran, mis. Frontend Developer]' },
  { name: '[Nama Anggota 2]', role: '[Peran, mis. Backend Developer]' },
  { name: '[Nama Anggota 3]', role: '[Peran, mis. IoT Engineer]' },
  { name: '[Nama Anggota 4]', role: '[Peran, mis. Data / AI]' },
  { name: '[Nama Anggota 5]', role: '[Peran, mis. UI/UX & Dokumentasi]' },
];

// ISI: nama dosen pembimbing
const SUPERVISORS = [
  { name: '[Nama Dosen Pembimbing 1]', role: 'Dosen Pembimbing 1' },
  { name: '[Nama Dosen Pembimbing 2]', role: 'Dosen Pembimbing 2' },
];

// ISI: tanggal HKI, durasi, dan institusi
const FACTS = [
  { icon: '📜', label: 'Hak Kekayaan Intelektual (HKI)', value: '[Tanggal diresmikan HKI]' },
  { icon: '⏱️', label: 'Lama Pengerjaan', value: '[Mis. 6 bulan (Mei - Nov 2026)]' },
  { icon: '🏫', label: 'Institusi', value: '[Nama kampus / program studi]' },
  { icon: '🎯', label: 'Wilayah Fokus', value: 'Laut Jawa' },
];

// Bahasa pemrograman (kecuali C++, semuanya terlihat di kode proyek)
// ISI: pastikan bahasa firmware ESP32 sesuai kode alat kamu
const LANGUAGES = [
  { name: 'JavaScript', use: 'Website (Next.js 16 + React 19), simulasi data, peta Leaflet' },
  { name: 'Python', use: 'Backend Django REST Framework & Django Channels (WebSocket)' },
  { name: 'C++ (Arduino)', use: 'Firmware ESP32: membaca sensor dan mengirim data ke Firebase' },
  { name: 'CSS Modules', use: 'Tampilan antarmuka (dark theme)' },
];

// AI yang dipakai
// ISI: tambahkan AI coding assistant yang kamu pakai (mis. Claude, Gemini, Copilot)
const AI_TOOLS = [
  {
    name: 'Google Gemini API',
    use: 'Chatbot asisten JALASENA di website (route /api/chat), dibatasi hanya menjawab seputar JALASENA dan keselamatan melaut.',
  },
  {
    name: 'Deteksi bahaya berbasis ambang batas',
    use: 'Kapal dinyatakan BAHAYA jika |roll| >= 20° atau |pitch| >= 15°, mengikuti pelabelan dataset model.',
  },
  {
    name: '[AI untuk membantu pemrograman]',
    use: '[Mis. nama AI coding assistant dan bagian apa yang dibantu]',
  },
];

// Perangkat IoT
// ISI: sesuaikan tipe modul (mis. MPU6050, NEO-6M, DS18B20) dan letakkan
// fotonya di public/images/iot/ dengan nama file seperti di bawah.
const DEVICES = [
  {
    name: 'ESP32 (Mikrokontroler)',
    image: '/images/iot/esp32.png',
    use: 'Otak perangkat. Membaca sensor, menentukan status NORMAL/DANGER, lalu mengirim data lewat WiFi ke Firebase Firestore.',
    spec: '[Tipe board, mis. ESP32 DevKit V1]',
  },
  {
    name: 'Sensor Kemiringan (Accelerometer & Gyroscope)',
    image: '/images/iot/imu.png',
    use: 'Mengukur kemiringan kapal ke samping (roll) dan depan-belakang (pitch) dalam derajat.',
    spec: '[Tipe modul, mis. MPU6050]',
  },
  {
    name: 'Modul GPS',
    image: '/images/iot/gps.png',
    use: 'Menentukan posisi kapal (latitude, longitude) dan kecepatan.',
    spec: '[Tipe modul, mis. NEO-6M]',
  },
  {
    name: 'Sensor Suhu',
    image: '/images/iot/suhu.png',
    use: 'Mengukur suhu di sekitar kapal.',
    spec: '[Tipe sensor, mis. DS18B20]',
  },
];

// status: 'aktif' | 'demo' | 'rencana'
const STATUS_LABEL = {
  aktif: 'Aktif',
  demo: 'Demo (data simulasi)',
  rencana: 'Tahap integrasi',
};

// Alur 1: dari satelit Copernicus sampai tampil di website
const FISH_PIPELINE = [
  {
    title: 'Mengambil data dari Copernicus Marine Service',
    tech: 'Copernicus Marine Toolbox (Python)',
    status: 'rencana',
    desc: 'Mengunduh dua data satelit oseanografi untuk Laut Jawa: suhu permukaan laut (SST, dataset GLOBAL_ANALYSISFORECAST_PHY_001_024) dan klorofil-a (dataset GLOBAL_ANALYSISFORECAST_BGC_001_028). Akses memakai akun Copernicus Marine.',
  },
  {
    title: 'Memotong wilayah & membersihkan data',
    tech: 'Python',
    status: 'rencana',
    desc: 'Data global dipotong ke area Laut Jawa, nilai kosong dibuang, dan titik yang jatuh di daratan disingkirkan supaya hanya perairan yang dianalisis.',
  },
  {
    title: 'Menghitung skor potensi tiap jenis ikan',
    tech: 'Aturan SST + klorofil per jenis ikan',
    status: 'demo',
    desc: 'Tiap ikan punya kondisi ideal berbeda. Teri menyukai perairan pesisir dengan klorofil tinggi, tongkol lebih ke laut lepas dengan suhu lebih rendah, kembung di antaranya. Dari situ dihitung skor potensi 0-100 per titik.',
  },
  {
    title: 'Menyimpan & melayani lewat API',
    tech: 'Django REST Framework',
    status: 'rencana',
    desc: 'Zona potensial disimpan di backend dan disediakan sebagai API. Website tinggal memanggil API ini tanpa perlu memproses data satelit sendiri.',
  },
  {
    title: 'Website mengambil & memperbarui data',
    tech: 'Next.js (fetch + auto refresh)',
    status: 'demo',
    desc: 'Halaman Deteksi mengambil daftar zona sesuai ikan dan jam yang dipilih, lalu memperbaruinya otomatis setiap beberapa detik.',
  },
  {
    title: 'Menampilkan di peta interaktif',
    tech: 'Leaflet + react-leaflet',
    status: 'aktif',
    desc: 'Setiap zona menjadi marker di peta. Klik marker untuk melihat koordinat, skor, SST, klorofil, dan jarak dari posisi nelayan, lalu pilih Menuju ke Titik Ini untuk navigasi.',
  },
];

// Alur 2: monitoring kapal
const MONITOR_PIPELINE = [
  {
    title: 'Sensor membaca kondisi kapal',
    tech: 'Accelerometer, gyroscope, GPS, suhu',
    status: 'aktif',
    desc: 'Perangkat di kapal membaca kemiringan (roll dan pitch), posisi, kecepatan, dan suhu secara terus-menerus.',
  },
  {
    title: 'ESP32 menentukan status',
    tech: 'C++ (Arduino)',
    status: 'aktif',
    desc: 'ESP32 memberi tanda DANGER jika |roll| >= 20° atau |pitch| >= 15°. Nilai absolut dipakai agar miring ke kiri maupun kanan sama-sama terdeteksi.',
  },
  {
    title: 'Mengirim data ke cloud',
    tech: 'WiFi + Firebase Firestore (koleksi IoT)',
    status: 'aktif',
    desc: 'Setiap pengiriman disimpan sebagai satu dokumen baru lengkap dengan timestamp waktu WIB.',
  },
  {
    title: 'Website langsung menerima perubahan',
    tech: 'Firestore onSnapshot',
    status: 'aktif',
    desc: 'Website tidak perlu bertanya berulang-ulang (polling). Begitu ada dokumen baru, Firebase langsung mendorong datanya ke dashboard.',
  },
  {
    title: 'Data dinormalisasi & dicek ulang',
    tech: 'JavaScript',
    status: 'aktif',
    desc: 'Website mengubah format waktu dan angka ke bentuk seragam, lalu menghitung ulang ambang batas bahaya sendiri sebagai pemeriksaan kedua.',
  },
  {
    title: 'Dashboard & peringatan dini',
    tech: 'React + Recharts',
    status: 'aktif',
    desc: 'Menampilkan kemiringan, suhu, kecepatan, posisi, dan grafik 30 data terakhir. Saat bahaya, muncul popup peringatan agar keluarga dan nelayan bisa bertindak cepat.',
  },
];

// Alasan monitoring bisa diandalkan (semua sesuai cara kerja kode saat ini)
const ACCURACY = [
  {
    title: 'Dua lapis deteksi',
    text: 'Bahaya ditentukan di perangkat (ESP32) dan dicek ulang di website memakai ambang batas yang sama. Jika salah satu mendeteksi, peringatan tetap muncul.',
  },
  {
    title: 'Roll dan pitch dinilai terpisah',
    text: 'Kapal bisa oleng ke samping atau mengangguk ke depan-belakang. Masing-masing punya batas sendiri (20° dan 15°), bukan satu angka gabungan.',
  },
  {
    title: 'Real-time tanpa jeda polling',
    text: 'Data didorong langsung oleh Firestore saat tiba, sehingga peringatan tidak tertunda menunggu website memeriksa ulang.',
  },
  {
    title: 'Waktu seragam (WIB)',
    text: 'Timestamp dari ESP32 dinormalisasi ke satu zona waktu agar urutan data dan grafik tidak kacau.',
  },
  {
    title: 'Melihat tren, bukan satu angka',
    text: 'Grafik menampilkan 30 data terakhir, jadi lonjakan sesaat bisa dibedakan dari kemiringan yang terus memburuk.',
  },
  {
    title: 'Ambang batas berdasar data',
    text: 'Batas 20° dan 15° mengikuti pelabelan dataset yang dipakai untuk model, bukan angka sembarang.',
  },
];

// ================================================
// KOMPONEN KECIL
// ================================================

// Gambar dengan placeholder otomatis jika file belum ada
function ImageSlot({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={styles.imagePlaceholder}>
        <span>📷</span>
        <p>Foto belum ditambahkan</p>
        <code>public{src}</code>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={styles.deviceImage} onError={() => setFailed(true)} />
  );
}

function Pipeline({ steps }) {
  return (
    <ol className={styles.pipeline}>
      {steps.map((s, i) => (
        <li key={s.title} className={styles.pipeStep}>
          <div className={styles.pipeNumber}>{i + 1}</div>
          <div className={styles.pipeBody}>
            <div className={styles.pipeHead}>
              <h4>{s.title}</h4>
              <span className={`${styles.badge} ${styles[`badge_${s.status}`]}`}>
                {STATUS_LABEL[s.status]}
              </span>
            </div>
            <span className={styles.pipeTech}>{s.tech}</span>
            <p>{s.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ================================================
// HALAMAN
// ================================================
export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className={styles.aboutPage}>
        {/* === HERO === */}
        <header className={styles.header}>
          <h1 className={styles.title}>
            Tentang <span className={styles.accent}>JALASENA</span>
          </h1>
          <p className={styles.subtitle}>
            Sistem Terintegrasi Prediksi Wilayah Ikan dan Peringatan Dini Kondisi Kapal untuk
            nelayan Indonesia, dengan fokus perairan Laut Jawa.
          </p>
        </header>

        <div className={styles.content}>
          {/* === RINGKASAN === */}
          <section className={styles.factGrid}>
            {FACTS.map((f) => (
              <div key={f.label} className={styles.factCard}>
                <span className={styles.factIcon}>{f.icon}</span>
                <span className={styles.factLabel}>{f.label}</span>
                <strong className={styles.factValue}>{f.value}</strong>
              </div>
            ))}
          </section>

          {/* === TENTANG === */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🌊 Apa yang Dikerjakan JALASENA?</h2>
            <p className={styles.text}>
              JALASENA punya dua fungsi utama. Pertama, <strong>Deteksi Zona Ikan</strong>: memetakan
              lokasi yang berpotensi banyak ikan kembung, teri, dan tongkol berdasarkan suhu
              permukaan laut dan klorofil-a dari satelit. Kedua, <strong>Monitoring Kapal</strong>:
              memantau kemiringan kapal secara real-time lewat sensor IoT dan memberi peringatan
              dini agar kapal tidak terbalik.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/deteksi" className="btn-primary">🎯 Coba Deteksi Zona Ikan</Link>
              <Link href="/tutorial" className={styles.ghostBtn}>📖 Lihat Tutorial</Link>
            </div>
          </section>

          {/* === TIM === */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>👥 Tim Pengembang</h2>
            <div className={styles.personGrid}>
              {TEAM.map((p) => (
                <div key={p.name} className={styles.personCard}>
                  <div className={styles.avatar}>{p.name.replace('[', '').charAt(0)}</div>
                  <strong>{p.name}</strong>
                  <span>{p.role}</span>
                </div>
              ))}
            </div>

            <h3 className={styles.subTitle}>Dosen Pembimbing</h3>
            <div className={styles.personGrid}>
              {SUPERVISORS.map((p) => (
                <div key={p.role} className={styles.personCard}>
                  <div className={styles.avatar}>🎓</div>
                  <strong>{p.name}</strong>
                  <span>{p.role}</span>
                </div>
              ))}
            </div>
          </section>

          {/* === TEKNOLOGI === */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>💻 Teknologi yang Digunakan</h2>

            <h3 className={styles.subTitle}>Bahasa Pemrograman</h3>
            <div className={styles.listGrid}>
              {LANGUAGES.map((l) => (
                <div key={l.name} className={styles.listCard}>
                  <strong>{l.name}</strong>
                  <p>{l.use}</p>
                </div>
              ))}
            </div>

            <h3 className={styles.subTitle}>AI yang Digunakan</h3>
            <div className={styles.listGrid}>
              {AI_TOOLS.map((a) => (
                <div key={a.name} className={styles.listCard}>
                  <strong>{a.name}</strong>
                  <p>{a.use}</p>
                </div>
              ))}
            </div>
          </section>

          {/* === PERANGKAT IOT === */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📡 Perangkat IoT di Kapal</h2>
            <p className={styles.text}>
              Satu perangkat dipasang di kapal. Semua sensor dikendalikan oleh satu mikrokontroler
              ESP32 yang mengirim datanya lewat internet.
            </p>
            <div className={styles.deviceGrid}>
              {DEVICES.map((d) => (
                <article key={d.name} className={styles.deviceCard}>
                  <ImageSlot src={d.image} alt={d.name} />
                  <div className={styles.deviceInfo}>
                    <h4>{d.name}</h4>
                    <span className={styles.spec}>{d.spec}</span>
                    <p>{d.use}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* === CARA KERJA RINGKAS === */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>⚙️ Cara Kerja Sistem</h2>
            <div className={styles.twoCol}>
              <div className={styles.flowCard}>
                <h4>🐟 Deteksi Zona Ikan</h4>
                <p className={styles.flowLine}>
                  Satelit Copernicus → Pemrosesan data → Skor potensi → API → Peta di website
                </p>
              </div>
              <div className={styles.flowCard}>
                <h4>🚢 Monitoring Kapal</h4>
                <p className={styles.flowLine}>
                  Sensor kapal → ESP32 → Firebase → Dashboard real-time → Peringatan dini
                </p>
              </div>
            </div>
          </section>

          {/* === ALUR TEKNIS === */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🛰️ Alur Teknis: Dari Satelit ke Website</h2>
            <Pipeline steps={FISH_PIPELINE} />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🚢 Alur Teknis: Monitoring Kapal</h2>
            <Pipeline steps={MONITOR_PIPELINE} />
          </section>

          {/* === AKURASI === */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>✅ Mengapa Monitoring Bisa Diandalkan</h2>
            <div className={styles.listGrid}>
              {ACCURACY.map((a) => (
                <div key={a.title} className={styles.listCard}>
                  <strong>{a.title}</strong>
                  <p>{a.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* === CATATAN TRANSPARANSI === */}
          <section className={styles.note}>
            <strong>Catatan status pengembangan</strong>
            <p>
              Label pada tiap langkah menunjukkan kondisi saat ini. Pada versi demo, zona ikan
              dibangkitkan oleh data simulasi sambil menunggu integrasi penuh dengan Copernicus
              Marine Service. Monitoring kapal membaca data nyata dari Firebase saat konfigurasi
              Firebase aktif, dan memakai data contoh jika belum.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}