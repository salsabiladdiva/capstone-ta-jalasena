/* ================================================
   JALASENA - Login Form Component
   ================================================
   Form untuk login menggunakan Ship ID Code
   ================================================ */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithShipCode } from '@/lib/api';
import { STORAGE_KEYS } from '@/lib/constants';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const router = useRouter();
  const [shipCode, setShipCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!shipCode.trim()) {
      setError('Masukkan Kode Ship ID terlebih dahulu');
      return;
    }

    setIsLoading(true);

    try {
      const shipData = await loginWithShipCode(shipCode.trim());
      
      // Simpan ship ID ke localStorage
      localStorage.setItem(STORAGE_KEYS.SHIP_ID, shipCode.trim());
      
      setSuccess('Login berhasil! Mengalihkan ke monitoring...');
      
      // Redirect ke halaman monitoring setelah 1 detik
      setTimeout(() => {
        router.push('/monitoring');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginFormWrapper}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>Monitoring Kapal</h1>
        <p className={styles.subtitle}>Masukkan Kode Ship ID Anda</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="shipCode" className={styles.label}>
              Kode Ship ID
            </label>
            <input
              id="shipCode"
              type="text"
              placeholder="Contoh: SHIP001, JLS-001"
              value={shipCode}
              onChange={(e) => {
                setShipCode(e.target.value);
                setError('');
              }}
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              disabled={isLoading}
              autoComplete="off"
            />
            {error && <span className={styles.error}>{error}</span>}
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading || !shipCode.trim()}
          >
            {isLoading ? 'Sedang Login...' : 'Login'}
          </button>

          {success && <div className={styles.success}>{success}</div>}
        </form>

        <div className={styles.helpText}>
          <p>Butuh bantuan? <a href="/tutorial">Lihat Tutorial</a></p>
        </div>
      </div>

      {/* Background animated waves */}
      <div className={styles.wavesContainer}>
        <div className={styles.wave}></div>
        <div className={styles.wave}></div>
        <div className={styles.wave}></div>
      </div>
    </div>
  );
}
