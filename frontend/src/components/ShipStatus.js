'use client';

import styles from './ShipStatus.module.css';

export default function ShipStatus({ shipCode, telemetry, ship }) {
  if (!telemetry) {
    return (
      <div className={styles.statusCard}>
        <div className={styles.loadingState}>
          <p>Memuat koneksi ke kapal...</p>
        </div>
      </div>
    );
  }

  const isSafe = telemetry.tilt_degree < 15;
  const isWarning = telemetry.tilt_degree >= 15 && telemetry.tilt_degree < 30;
  const isDanger = telemetry.tilt_degree >= 30;

  return (
    <div className={styles.statusCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Status Kapal</h3>
        <div className={`${styles.statusBadge} ${isDanger ? styles.danger : isWarning ? styles.warning : styles.safe}`}>
          <span className={styles.statusDot}></span>
          {isDanger ? 'BAHAYA' : isWarning ? 'PERINGATAN' : 'AMAN'}
        </div>
      </div>

      <div className={styles.shipInfo}>
        {ship && (
          <div className={styles.infoSection}>
            <h4 className={styles.infoTitle}>Informasi Kapal</h4>
            <div className={styles.infoRow}>
              <span className={styles.label}>Nama Kapal:</span>
              <span className={styles.value}>{ship.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Pemilik:</span>
              <span className={styles.value}>{ship.owner}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Kode:</span>
              <span className={styles.value} style={{ fontFamily: 'monospace' }}>{shipCode}</span>
            </div>
          </div>
        )}

        {telemetry && (
          <div className={styles.infoSection}>
            <h4 className={styles.infoTitle}>Telemetry Terkini</h4>
            
            <div className={styles.infoRow}>
              <span className={styles.label}>Kemiringan:</span>
              <span className={`${styles.value} ${isDanger ? styles.dangerText : isWarning ? styles.warningText : ''}`}>
                {telemetry.tilt_degree.toFixed(1)}°
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>Suhu Air:</span>
              <span className={styles.value}>{telemetry.temperature.toFixed(1)}°C</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>Kecepatan:</span>
              <span className={styles.value}>{telemetry.speed.toFixed(1)} knot</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>Status:</span>
              <span className={`${styles.value} ${telemetry.is_moving ? styles.moving : styles.stopped}`}>
                {telemetry.is_moving ? '🚢 Berlayar' : '⚓ Berhenti'}
              </span>
            </div>
          </div>
        )}
      </div>

      {isDanger && (
        <div className={styles.alertBox}>
          <strong>⚠️ PERINGATAN BAHAYA!</strong>
          <p>Kapal miring lebih dari 30°. Risiko tinggi kapal terbalik!</p>
        </div>
      )}
      
      {isWarning && (
        <div className={`${styles.alertBox} ${styles.warningBox}`}>
          <strong>⚠️ PERHATIAN</strong>
          <p>Kapal miring antara 15-30°. Harap perhatikan gelombang.</p>
        </div>
      )}
    </div>
  );
}