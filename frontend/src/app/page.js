/* ================================================
   JALASENA - Landing Page V3 (Clean Ocean Animation)
   ================================================
   - Pure CSS animated ocean background (no images)
   - No satellite, no boat — clean & premium
   - Scroll-triggered animations (Intersection Observer)
   - About Us section dengan foto tim
   ================================================ */

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import styles from './page.module.css';

/**
 * Hook custom untuk mendeteksi apakah elemen visible di viewport
 * Digunakan untuk scroll-triggered animations (seperti cargokite.com)
 */
function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Setelah muncul, tidak perlu observe lagi
          observer.unobserve(element);
        }
      },
      { threshold: 0.15, ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
}

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  // --- Scroll-triggered section refs ---
  const [featuresRef, featuresInView] = useInView();
  const [aboutRef, aboutInView] = useInView();
  const [statsRef, statsInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
      <Navbar />

      {/* ============================================
          SECTION 1: HERO - Animated Ocean Background
          ============================================ */}
      <section className={styles.hero} id="hero-section">
        {/* === MULTI-LAYERED ANIMATED OCEAN === */}
        {/* Layer 1: Deep ocean base gradient */}
        <div className={styles.oceanBase} />

        {/* Layer 2: Animated color shift */}
        <div className={styles.oceanShift} />

        {/* Layer 3: Wave pattern overlays */}
        <div className={styles.waveLayer1} />
        <div className={styles.waveLayer2} />
        <div className={styles.waveLayer3} />

        {/* Layer 4: Caustic light reflections */}
        <div className={styles.causticLight} />
        <div className={styles.causticLight2} />

        {/* Layer 5: Surface sparkles */}
        <div className={styles.sparkles} />

        {/* Layer 6: Soft vignette overlay */}
        <div className={styles.heroOverlay} />

        {/* Floating light particles */}
        <div className={styles.particles}>
          <div className={styles.particle} style={{ left: '10%', top: '20%', animationDelay: '0s' }} />
          <div className={styles.particle} style={{ left: '25%', top: '60%', animationDelay: '1.2s' }} />
          <div className={styles.particle} style={{ left: '40%', top: '35%', animationDelay: '2.4s' }} />
          <div className={styles.particle} style={{ left: '55%', top: '75%', animationDelay: '0.8s' }} />
          <div className={styles.particle} style={{ left: '70%', top: '25%', animationDelay: '1.8s' }} />
          <div className={styles.particle} style={{ left: '85%', top: '55%', animationDelay: '3s' }} />
          <div className={styles.particle} style={{ left: '15%', top: '80%', animationDelay: '2s' }} />
          <div className={styles.particle} style={{ left: '65%', top: '45%', animationDelay: '0.5s' }} />
        </div>

        {/* Konten Hero */}
        <div className={`${styles.heroContent} ${isLoaded ? styles.heroContentVisible : ''}`}>
          <h1 className={styles.heroTitle}>JALASENA</h1>
          <div className={styles.heroAccent}></div>
          <p className={styles.heroSubtitle}>
            Sistem Terintegrasi Prediksi Wilayah Ikan
            <br />
            dan Peringatan Dini Kondisi Kapal
          </p>
          {/* CTA buttons - Deteksi + Login */}
          <div className={styles.heroButtons}>
            <Link href="/deteksi" className="btn-primary" id="btn-deteksi">
              Mulai Deteksi Zona Ikan
            </Link>
            <Link href="/login" className="btn-secondary" id="btn-login">
              Login Monitoring
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={styles.scrollIndicator}>
          <div className={styles.scrollMouse}>
            <div className={styles.scrollWheel}></div>
          </div>
          <span>SCROLL</span>
        </div>
      </section>

      {/* ============================================
          SECTION 2: FITUR UNGGULAN (Scroll Animated)
          ============================================ */}
      <section
        ref={featuresRef}
        className={`${styles.section} ${styles.featuresSection} ${featuresInView ? styles.sectionVisible : ''}`}
      >
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>FITUR</span>
            <h2 className={styles.sectionTitle}>
              Teknologi untuk <span className={styles.accent}>Nelayan</span>
            </h2>
            <p className={styles.sectionDesc}>
              Memanfaatkan data satelit dan AI untuk meningkatkan produktivitas dan keselamatan nelayan
            </p>
          </div>

          <div className={styles.featureGrid}>
            <div className={`${styles.featureCard} ${featuresInView ? styles.featureCardVisible : ''}`} style={{ animationDelay: '0s' }}>
              <div className={styles.featureIconBg}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h3>Deteksi Zona Ikan</h3>
              <p>Peta interaktif menunjukkan titik potensial ikan berdasarkan analisis data SST dan Chlorophyll dari satelit Copernicus Marine Service</p>
            </div>
            <div className={`${styles.featureCard} ${featuresInView ? styles.featureCardVisible : ''}`} style={{ animationDelay: '0.15s' }}>
              <div className={styles.featureIconBg}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
              </div>
              <h3>Navigasi GPS</h3>
              <p>Panduan navigasi real-time menuju titik tangkapan ikan dengan informasi jarak, kecepatan, dan notifikasi sampai tujuan</p>
            </div>
            <div className={`${styles.featureCard} ${featuresInView ? styles.featureCardVisible : ''}`} style={{ animationDelay: '0.3s' }}>
              <div className={styles.featureIconBg}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <h3>Monitoring Kapal</h3>
              <p>Dashboard monitoring kemiringan kapal real-time dari sensor IoT dengan peringatan dini bahaya terbalik</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 3: STATISTIK (Scroll Counter)
          ============================================ */}
      <section
        ref={statsRef}
        className={`${styles.section} ${styles.statsSection} ${statsInView ? styles.sectionVisible : ''}`}
      >
        <div className="container">
          <div className={styles.statsGrid}>
            <div className={`${styles.statItem} ${statsInView ? styles.statItemVisible : ''}`} style={{ animationDelay: '0s' }}>
              <span className={styles.statNumber}>20+</span>
              <span className={styles.statLabel}>Zona Ikan Terdeteksi</span>
            </div>
            <div className={`${styles.statItem} ${statsInView ? styles.statItemVisible : ''}`} style={{ animationDelay: '0.1s' }}>
              <span className={styles.statNumber}>3</span>
              <span className={styles.statLabel}>Jenis Ikan</span>
            </div>
            <div className={`${styles.statItem} ${statsInView ? styles.statItemVisible : ''}`} style={{ animationDelay: '0.2s' }}>
              <span className={styles.statNumber}>24/7</span>
              <span className={styles.statLabel}>Monitoring Real-time</span>
            </div>
            <div className={`${styles.statItem} ${statsInView ? styles.statItemVisible : ''}`} style={{ animationDelay: '0.3s' }}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Gratis untuk Nelayan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 4: ABOUT US - Tim JALASENA
          ============================================ */}
      <section
        ref={aboutRef}
        className={`${styles.section} ${styles.aboutSection} ${aboutInView ? styles.sectionVisible : ''}`}
      >
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>TIM KAMI</span>
            <h2 className={styles.sectionTitle}>
              Dibangun oleh <span className={styles.accent}>Anak Bangsa</span>
            </h2>
            <p className={styles.sectionDesc}>
              Tim mahasiswa yang peduli terhadap keselamatan dan kesejahteraan nelayan Indonesia
            </p>
          </div>

          {/* Foto tim */}
          <div className={`${styles.teamPhoto} ${aboutInView ? styles.teamPhotoVisible : ''}`}>
            <Image
              src="/images/team.png"
              alt="Tim JALASENA"
              width={800}
              height={500}
              className={styles.teamImage}
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.teamOverlay}>
              <p>Tim JALASENA</p>
            </div>
          </div>

          {/* Grid anggota tim - ganti nama dengan nama tim mu */}
          <div className={styles.teamGrid}>
            {[
              { name: 'Anggota 1', role: 'Project Lead' },
              { name: 'Anggota 2', role: 'Backend Developer' },
              { name: 'Anggota 3', role: 'Frontend Developer' },
              { name: 'Anggota 4', role: 'Data Scientist' },
              { name: 'Anggota 5', role: 'IoT Engineer' },
            ].map((member, idx) => (
              <div
                key={idx}
                className={`${styles.teamMember} ${aboutInView ? styles.teamMemberVisible : ''}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <h4>{member.name}</h4>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 5: CTA FINAL
          ============================================ */}
      <section
        ref={ctaRef}
        className={`${styles.section} ${styles.ctaSection} ${ctaInView ? styles.sectionVisible : ''}`}
      >
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className={styles.ctaTitle}>
            Siap Menemukan <span className={styles.accent}>Zona Ikan</span> Terbaik?
          </h2>
          <p className={styles.ctaDesc}>
            Gunakan JALASENA sekarang dan tingkatkan hasil tangkapan Anda
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/deteksi" className="btn-primary">
              Mulai Deteksi Zona Ikan
            </Link>
            <Link href="/tutorial" className="btn-secondary">
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className={styles.footer}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.85rem' }}>
            © 2026 JALASENA. Sistem Terintegrasi Prediksi Wilayah Ikan.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/tutorial" style={{ color: 'var(--color-gray-400)', fontSize: '0.85rem' }}>Tutorial</Link>
            <Link href="/login" style={{ color: 'var(--color-gray-400)', fontSize: '0.85rem' }}>Login</Link>
          </div>
        </div>
      </footer>
      {/* Chatbot Gemini (pojok kanan bawah) */}
      <Chatbot />
    </>
  );
}
