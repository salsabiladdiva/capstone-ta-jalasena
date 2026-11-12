/* ================================================
   JALASENA - Halaman Tutorial
   ================================================
   Halaman panduan cara menggunakan sistem JALASENA.
   Berisi informasi:
   - Cara mendapatkan Ship ID
   - Cara menggunakan fitur deteksi ikan
   - Cara login dan monitoring kapal
   - FAQ umum
   ================================================ */

'use client';

import Link from 'next/link';
import Navbar from '../../components/Navbar';
import styles from './tutorial.module.css';

export default function TutorialPage() {
  return (
    <>
      <Navbar />

      <main className={styles.tutorialPage}>
        {/* Header halaman tutorial */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            Panduan Penggunaan <span className={styles.accent}>JALASENA</span>
          </h1>
          <p className={styles.subtitle}>
            Pelajari cara menggunakan sistem JALASENA untuk menemukan zona ikan potensial dan memantau keselamatan kapal Anda.
          </p>
        </div>

        {/* Konten tutorial */}
        <div className={styles.content}>

          {/* === SECTION 1: Tentang JALASENA === */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Apa itu JALASENA?</h2>
            <p className={styles.sectionText}>
              <strong>JALASENA</strong> (Sistem Terintegrasi Prediksi Wilayah Ikan dan Peringatan Dini Kondisi Kapal) 
              adalah platform digital yang dirancang khusus untuk membantu nelayan Indonesia. 
              Sistem kami menggunakan data satelit <strong>Copernicus Marine Service</strong> untuk memprediksi 
              lokasi potensial ikan dan sensor IoT untuk memantau keselamatan kapal secara real-time.
            </p>
          </section>

          {/* === SECTION 2: Cara Mendapatkan Ship ID === */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cara Mendapatkan Ship ID</h2>
            <p className={styles.sectionText}>
              Ship ID adalah kode unik yang diberikan kepada setiap kapal yang terdaftar dalam sistem JALASENA. 
              Kode ini digunakan oleh keluarga nelayan untuk login dan memantau kondisi kapal.
            </p>

            {/* Step-by-step guide */}
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h3>Daftarkan Kapal Anda</h3>
                  <p>
                    Hubungi petugas JALASENA di kantor pelabuhan terdekat atau melalui 
                    WhatsApp di nomor <strong>0812-XXXX-XXXX</strong>. Siapkan data kapal: 
                    nama kapal, nama pemilik, dan nomor registrasi kapal.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h3>Pemasangan Sensor</h3>
                  <p>
                    Tim teknisi kami akan memasang sensor IoT (accelerometer & GPS) di kapal Anda. 
                    Sensor ini akan mengirimkan data kemiringan kapal dan posisi secara real-time.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h3>Terima Ship ID</h3>
                  <p>
                    Setelah pendaftaran dan pemasangan selesai, Anda akan menerima kode Ship ID 
                    (format: <strong>JLS-XXX</strong>). Simpan kode ini dengan baik dan berikan 
                    kepada anggota keluarga yang akan memantau.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h3>Login & Mulai Monitoring</h3>
                  <p>
                    Gunakan Ship ID untuk login di halaman{' '}
                    <Link href="/login" className={styles.link}>Login JALASENA</Link>. 
                    Setelah login, Anda bisa memantau posisi kapal, kemiringan, dan 
                    menerima peringatan bahaya secara real-time.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* === SECTION 3: Fitur Deteksi Zona Ikan === */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Menggunakan Deteksi Zona Ikan</h2>
            <p className={styles.sectionText}>
              Fitur ini membantu nelayan menemukan zona potensial ikan berdasarkan analisis 
              data oseanografi dari satelit.
            </p>

            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h3>Buka Halaman Deteksi</h3>
                  <p>
                    Klik tombol <strong>&quot;Mulai Deteksi Zona Ikan&quot;</strong> di halaman utama 
                    atau menu navigasi.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h3>Pilih Jenis Ikan</h3>
                  <p>
                    Gunakan dropdown untuk memilih jenis ikan yang ingin dicari: 
                    <strong> Kembung</strong>, <strong>Teri</strong>, atau <strong>Tongkol</strong>. 
                    Lalu tekan tombol <strong>&quot;Cari&quot;</strong>.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h3>Lihat Marker di Peta</h3>
                  <p>
                    Marker akan muncul di peta menunjukkan titik-titik potensial ikan. 
                    Klik marker untuk melihat detail: koordinat, jarak dari posisi Anda, 
                    dan tingkat potensi.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h3>Navigasi ke Titik Ikan</h3>
                  <p>
                    Tekan tombol <strong>&quot;Menuju ke Titik Ini&quot;</strong> untuk mengaktifkan 
                    navigasi GPS. Sistem akan menampilkan kecepatan kapal, jarak, dan 
                    memberi notifikasi saat Anda sudah sampai di titik tujuan.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* === SECTION 4: Monitoring Kapal === */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Dashboard Monitoring Kapal</h2>
            <p className={styles.sectionText}>
              Dashboard monitoring memungkinkan keluarga nelayan memantau kondisi kapal secara real-time 
              dari rumah. Informasi yang ditampilkan:
            </p>

            <div className={styles.featureGrid}>
              <div className={styles.featureItem}>
                <h4>Posisi Kapal</h4>
                <p>Koordinat longitude dan latitude kapal saat ini ditampilkan di peta</p>
              </div>
              <div className={styles.featureItem}>
                <h4>Grafik Kemiringan</h4>
                <p>Grafik real-time menunjukkan derajat kemiringan kapal (diperbarui otomatis)</p>
              </div>
              <div className={styles.featureItem}>
                <h4>Suhu Air Laut</h4>
                <p>Suhu permukaan air laut di sekitar kapal</p>
              </div>
              <div className={styles.featureItem}>
                <h4>Peringatan Bahaya</h4>
                <p>Notifikasi otomatis jika kemiringan kapal mencapai level berbahaya (15-30°)</p>
              </div>
            </div>
          </section>

          {/* === SECTION 5: Threshold Keselamatan === */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Tingkat Peringatan Kemiringan</h2>
            <p className={styles.sectionText}>
              Sistem AI kami menganalisis pola kemiringan kapal dari sensor accelerometer 
              untuk menentukan tingkat keselamatan:
            </p>

            <div className={styles.alertLevels}>
              <div className={`${styles.alertLevel} ${styles.alertSafe}`}>
                <div className={styles.alertDot} style={{ backgroundColor: '#4caf50' }}></div>
                <div>
                  <h4>Aman (0° - 15°)</h4>
                  <p>Kondisi normal, kapal dalam keadaan stabil</p>
                </div>
              </div>
              <div className={`${styles.alertLevel} ${styles.alertWarning}`}>
                <div className={styles.alertDot} style={{ backgroundColor: '#ff9800' }}></div>
                <div>
                  <h4>Peringatan (15° - 30°)</h4>
                  <p>Kemiringan mulai berbahaya, waspadai kondisi gelombang</p>
                </div>
              </div>
              <div className={`${styles.alertLevel} ${styles.alertDanger}`}>
                <div className={styles.alertDot} style={{ backgroundColor: '#f44336' }}></div>
                <div>
                  <h4>Bahaya ({'>'}30°)</h4>
                  <p>Kemiringan sangat berbahaya, kapal berisiko terbalik</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tombol kembali ke login */}
          <div className={styles.backSection}>
            <Link href="/login" className="btn-primary">
              ← Kembali ke Login
            </Link>
            <Link href="/" className="btn-secondary">
              Ke Halaman Utama
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
