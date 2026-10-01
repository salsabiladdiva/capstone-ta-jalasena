/* ================================================
   JALASENA - Halaman Login
   ================================================
   Halaman login untuk keluarga nelayan menggunakan
   kode Ship ID. Setelah login berhasil, pengguna
   diarahkan ke halaman monitoring kapal.
   ================================================ */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { loginWithShipCode } from '../../lib/api';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  // State input Ship ID
  const [shipCode, setShipCode] = useState('');
  // State loading saat proses login
  const [isLoading, setIsLoading] = useState(false);
  // State error message
  const [error, setError] = useState('');
  // State login berhasil (untuk animasi transisi)
  const [loginSuccess, setLoginSuccess] = useState(false);

  // --- Handler submit form login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!shipCode.trim()) {
      setError('Silakan masukkan kode Ship ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validasi ship code ke backend
      const shipData = await loginWithShipCode(shipCode.trim());
      
      // Simpan data kapal ke sessionStorage untuk monitoring page
      sessionStorage.setItem('ship_data', JSON.stringify(shipData));
      sessionStorage.setItem('ship_code', shipData.code);
      
      // Animasi transisi sukses
      setLoginSuccess(true);
      
      // Redirect ke halaman monitoring setelah animasi
      setTimeout(() => {
        router.push('/monitoring');
      }, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <main className={styles.loginPage}>
        {/* Background animasi gelombang */}
        <div className={styles.waveBackground}>
          <div className={styles.wave}></div>
          <div className={styles.wave2}></div>
          <div className={styles.wave3}></div>
        </div>

        {/* Login Card */}
        <div className={`${styles.loginCard} ${loginSuccess ? styles.loginCardSuccess : ''}`}>
          {/* Header card */}
          <div className={styles.loginHeader}>
            {/* Icon kapal */}
            <div className={styles.loginIcon}>🚢</div>
            <h1 className={styles.loginTitle}>Login</h1>
            <p className={styles.loginSubtitle}>
              Login dengan kode dari ID Ship
            </p>
          </div>

          {/* Form login */}
          <form onSubmit={handleLogin} className={styles.loginForm}>
            {/* Input Ship ID */}
            <div className={styles.inputGroup}>
              <label htmlFor="ship-code-input" className={styles.inputLabel}>
                Kode Ship ID
              </label>
              <input
                id="ship-code-input"
                type="text"
                className={styles.input}
                placeholder="Contoh: JLS-001"
                value={shipCode}
                onChange={(e) => {
                  setShipCode(e.target.value.toUpperCase());
                  setError('');
                }}
                disabled={isLoading || loginSuccess}
                autoFocus
              />
            </div>

            {/* Pesan error */}
            {error && (
              <div className={styles.errorMessage}>
                ⚠️ {error}
              </div>
            )}

            {/* Tombol Login */}
            <button
              id="btn-login"
              type="submit"
              className={`btn-primary ${styles.loginBtn}`}
              disabled={isLoading || loginSuccess}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  Memverifikasi...
                </>
              ) : loginSuccess ? (
                <>✅ Berhasil!</>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Link ke tutorial */}
          <div className={styles.loginFooter}>
            <p>
              Belum punya Ship ID?{' '}
              <Link href="/tutorial" className={styles.tutorialLink}>
                Lihat Tutorial →
              </Link>
            </p>
          </div>

          {/* Demo info - kode ship untuk testing */}
          <div className={styles.demoInfo}>
            <p className={styles.demoTitle}>🔑 Kode Demo:</p>
            <div className={styles.demoCodes}>
              <button
                type="button"
                className={styles.demoCode}
                onClick={() => setShipCode('JLS-001')}
              >
                JLS-001
              </button>
              <button
                type="button"
                className={styles.demoCode}
                onClick={() => setShipCode('JLS-002')}
              >
                JLS-002
              </button>
              <button
                type="button"
                className={styles.demoCode}
                onClick={() => setShipCode('JLS-003')}
              >
                JLS-003
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
