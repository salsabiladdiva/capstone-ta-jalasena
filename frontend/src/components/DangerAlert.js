/* ================================================
   JALASENA - Danger Alert Modal Component
   ================================================
   Modal popup untuk peringatan bahaya kemiringan kapal
   ================================================ */

'use client';

import { useEffect, useState } from 'react';
import styles from './DangerAlert.module.css';

export default function DangerAlert({ tilt, isVisible, onClose }) {
  const [playSound, setPlaySound] = useState(false);

  useEffect(() => {
    if (isVisible && tilt >= 15) {
      // Play alert sound sekali
      setPlaySound(true);
      
      // Auto close setelah 10 detik
      const timer = setTimeout(onClose, 10000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, tilt, onClose]);

  if (!isVisible || tilt < 15) return null;

  const isDanger = tilt >= 30;
  const severity = isDanger ? 'danger' : 'warning';

  return (
    <div className={`${styles.alertOverlay} ${styles[`alert${severity.charAt(0).toUpperCase() + severity.slice(1)}`]}`}>
      {/* Audio alert */}
      {playSound && (
        <audio autoPlay>
          <source src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==" />
        </audio>
      )}

      <div className={`${styles.alertModal} ${styles[`modal${severity.charAt(0).toUpperCase() + severity.slice(1)}`]}`}>
        <button 
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close alert"
        >
          ✕
        </button>

        {isDanger ? (
          <>
            <div className={styles.alertIcon}>⚠️</div>
            <h2 className={styles.alertTitle}>BAHAYA! KAPAL TERGULING!</h2>
            <p className={styles.alertMessage}>
              Kemiringan kapal telah mencapai <strong>{tilt.toFixed(1)}°</strong>
            </p>
            <p className={styles.alertSubtext}>
              Segera ambil tindakan darurat! Hubungi pusat penyelamatan maritim jika diperlukan.
            </p>
            <div className={styles.actionButtons}>
              <button className={styles.callBtn} onClick={() => {
                // TODO: Implement emergency call
                alert('Menghubungi pusat penyelamatan...');
              }}>
                📞 Hubungi Darurat
              </button>
              <button className={styles.dismissBtn} onClick={onClose}>
                Tutup
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.alertIcon}>⚠️</div>
            <h2 className={styles.alertTitle}>PERINGATAN KEMIRINGAN</h2>
            <p className={styles.alertMessage}>
              Kapal miring <strong>{tilt.toFixed(1)}°</strong> - Perhatian diperlukan
            </p>
            <p className={styles.alertSubtext}>
              Monitor kondisi kapal dengan cermat. Hindari gerakan mendadak.
            </p>
            <div className={styles.actionButtons}>
              <button className={styles.dismissBtn} onClick={onClose}>
                Mengerti
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
