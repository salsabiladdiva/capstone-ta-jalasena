/* ================================================
   JALASENA - Halaman Monitoring Dashboard
   ================================================
   Dashboard untuk keluarga nelayan memantau kondisi 
   kapal secara real-time, meliputi:
   - Grafik kemiringan kapal (real-time update)
   - Posisi kapal saat ini (longitude, latitude)
   - Suhu air laut saat ini
   - Status kapal (berlayar/berhenti)
   - Peringatan bahaya jika kemiringan > 15°
   
   Data didapat dari sensor IoT di kapal melalui 
   WebSocket (Django Channels) atau Firebase Firestore
   ================================================ */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '../../components/Navbar';
import { createMonitoringSocket, fetchTelemetryHistory } from '../../lib/api';
import { TILT_THRESHOLDS, DUMMY_SHIPS } from '../../lib/constants';
import styles from './monitoring.module.css';

// --- Import grafik secara dynamic (SSR disabled) ---
// Recharts membutuhkan 'window' object
const MonitoringChart = dynamic(() => import('../../components/MonitoringChart'), {
  ssr: false,
  loading: () => <div className={styles.chartLoading}>Memuat grafik...</div>,
});

// [BARU 1] Label sumber data yang ditampilkan di header dashboard
const SOURCE_LABEL = {
  websocket: '🟢 WebSocket (live)',
  firestore: '🟢 Firebase (live)',
  connecting: '🟡 Menghubungkan…',
  dummy: '🟠 Data simulasi',
  offline: '🔴 Tidak terhubung',
};

export default function MonitoringPage() {
  const router = useRouter();
  // --- State data kapal ---
  const [shipData, setShipData] = useState(null);
  const [shipCode, setShipCode] = useState('');
  
  // --- State telemetry real-time ---
  // Data kemiringan, suhu, posisi yang ter-update otomatis
  const [currentTelemetry, setCurrentTelemetry] = useState(null);
  // Histori data untuk grafik
  const [telemetryHistory, setTelemetryHistory] = useState([]);

  // [BARU 2] Sumber data yang sedang aktif (websocket / firestore / dummy / ...)
  const [dataSource, setDataSource] = useState('connecting');
  
  // --- State alert bahaya ---
  const [dangerAlert, setDangerAlert] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  
  // --- Ref untuk WebSocket connection ---
  const socketRef = useRef(null);
  // --- Ref untuk audio alert ---
  const alertSoundRef = useRef(null);

  // --- Cek login dan ambil data kapal dari sessionStorage ---
  useEffect(() => {
    const storedShipData = sessionStorage.getItem('ship_data');
    const storedShipCode = sessionStorage.getItem('ship_code');

    if (!storedShipData || !storedShipCode) {
      // Jika belum login, gunakan data demo
      const demoShip = DUMMY_SHIPS[0];
      setShipData(demoShip);
      setShipCode(demoShip.code);
    } else {
      setShipData(JSON.parse(storedShipData));
      setShipCode(storedShipCode);
    }
  }, [router]);

  // --- Ambil histori telemetry awal ---
  useEffect(() => {
    if (!shipCode) return;

    async function loadHistory() {
      try {
        const history = await fetchTelemetryHistory(shipCode);
        setTelemetryHistory(
          history.map((item, idx) => ({
            ...item,
            time: new Date(item.timestamp).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            index: idx,
          }))
        );
      } catch (error) {
        console.error('Gagal memuat histori telemetry:', error);
      }
    }

    loadHistory();
  }, [shipCode]);

  // --- Koneksi real-time (WebSocket -> Firestore -> dummy) ---
  // Data telemetry dari sensor kapal ter-update otomatis
  useEffect(() => {
    if (!shipCode) return;

    // Callback saat menerima data telemetry baru
    const handleTelemetryData = (data) => {
      setCurrentTelemetry(data);

      // Tambahkan ke histori grafik
      const timeStr = new Date(data.timestamp).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      setTelemetryHistory(prev => {
        const newHistory = [...prev, {
          ...data,
          time: timeStr,
          index: prev.length,
        }];
        // Simpan maksimal 60 data point (5 menit terakhir)
        if (newHistory.length > 60) {
          return newHistory.slice(-60);
        }
        return newHistory;
      });

      // --- Deteksi kondisi bahaya ---
      // Aturan sesuai dataset model: BAHAYA jika |roll| >= 20° ATAU |pitch| >= 15°
      if (data.is_danger) {
        setDangerAlert({
          type: 'danger',
          tilt: data.tilt_degree,
          message: `BAHAYA! Roll ${data.roll.toFixed(1)}° / Pitch ${data.pitch.toFixed(1)}° - Risiko terbalik!`,
        });
        setShowAlert(true);
      }
    };

    // [BARU 3] Argumen ke-4 (setDataSource) melaporkan sumber data yang aktif
    socketRef.current = createMonitoringSocket(
      shipCode,
      handleTelemetryData,
      (error) => console.error('WebSocket error:', error),
      setDataSource
    );

    // Cleanup saat unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [shipCode]);

  // --- Handler tutup alert ---
  const dismissAlert = useCallback(() => {
    setShowAlert(false);
    // Auto re-show jika masih dalam kondisi bahaya
    setTimeout(() => setDangerAlert(null), 500);
  }, []);

  // --- Handler logout ---
  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('ship_data');
    sessionStorage.removeItem('ship_code');
    router.push('/login');
  }, [router]);

  // --- Tentukan status keselamatan berdasarkan kemiringan ---
  const getSafetyStatus = useCallback(() => {
    if (!currentTelemetry) return { status: 'unknown', color: '#757575', text: 'Memuat...' };
    if (currentTelemetry.is_danger) return { status: 'danger', color: '#f44336', text: 'BAHAYA' };
    return { status: 'safe', color: '#4caf50', text: 'AMAN' };
  }, [currentTelemetry]);

  const safety = getSafetyStatus();

  return (
    <>
      <Navbar />

      <main className={styles.monitoringPage}>
        {/* === HEADER DASHBOARD === */}
        <div className={styles.dashboardHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.dashboardTitle}>
              📊 Monitoring Dashboard
            </h1>
            {shipData && (
              <p className={styles.shipInfo}>
                {shipData.name} • <span className={styles.shipCode}>{shipData.code}</span>
                {shipData.owner && ` • ${shipData.owner}`}
              </p>
            )}
            {/* [BARU 4] Indikator sumber data */}
            <p className={styles.shipInfo}>
              Sumber data: {SOURCE_LABEL[dataSource] || SOURCE_LABEL.connecting}
            </p>
          </div>
          <div className={styles.headerRight}>
            {/* Indikator status keselamatan */}
            <div className={styles.safetyBadge} style={{
              backgroundColor: `${safety.color}22`,
              borderColor: `${safety.color}66`,
              color: safety.color,
            }}>
              <span className={styles.safetyDot} style={{ backgroundColor: safety.color }}></span>
              {safety.text}
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* === KONTEN DASHBOARD === */}
        <div className={styles.dashboardGrid}>
          
          {/* --- KOLOM KIRI: Info Cards --- */}
          <div className={styles.leftColumn}>
            
            {/* Card Posisi Kapal */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>📍</span>
                <h3>Posisi Kapal Saat Ini</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.positionRow}>
                  <span className={styles.posLabel}>Latitude</span>
                  <span className={styles.posValue}>
                    {currentTelemetry ? currentTelemetry.latitude.toFixed(6) + '°' : '—'}
                  </span>
                </div>
                <div className={styles.positionRow}>
                  <span className={styles.posLabel}>Longitude</span>
                  <span className={styles.posValue}>
                    {currentTelemetry ? currentTelemetry.longitude.toFixed(6) + '°' : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Suhu */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>🌡️</span>
                <h3>Suhu Air Laut</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.tempDisplay}>
                  <span className={styles.tempValue}>
                    {currentTelemetry ? currentTelemetry.temperature.toFixed(1) : '—'}
                  </span>
                  <span className={styles.tempUnit}>°C</span>
                </div>
              </div>
            </div>

            {/* Card Kemiringan Saat Ini */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>⚖️</span>
                <h3>Kemiringan Kapal</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.positionRow}>
                  <span className={styles.posLabel}>Roll (batas 20°)</span>
                  <span
                    className={styles.posValue}
                    style={{
                      color:
                        currentTelemetry && Math.abs(currentTelemetry.roll) >= TILT_THRESHOLDS.roll
                          ? '#f44336'
                          : undefined,
                    }}
                  >
                    {currentTelemetry ? currentTelemetry.roll.toFixed(1) + '°' : '—'}
                  </span>
                </div>
                <div className={styles.positionRow}>
                  <span className={styles.posLabel}>Pitch (batas 15°)</span>
                  <span
                    className={styles.posValue}
                    style={{
                      color:
                        currentTelemetry && Math.abs(currentTelemetry.pitch) >= TILT_THRESHOLDS.pitch
                          ? '#f44336'
                          : undefined,
                    }}
                  >
                    {currentTelemetry ? currentTelemetry.pitch.toFixed(1) + '°' : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Status Kapal */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>🚢</span>
                <h3>Status Kapal</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Status</span>
                  <span className={`${styles.statusValue} ${
                    currentTelemetry?.is_moving ? styles.statusMoving : styles.statusStopped
                  }`}>
                    <span className={styles.statusDot}></span>
                    {currentTelemetry?.is_moving ? 'Berlayar' : 'Berhenti'}
                  </span>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Kecepatan</span>
                  <span className={styles.statusValue}>
                    {currentTelemetry ? `${currentTelemetry.speed.toFixed(1)} knot` : '—'}
                  </span>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Update Terakhir</span>
                  <span className={styles.statusValue} style={{ fontSize: '0.8rem' }}>
                    {currentTelemetry
                      ? new Date(currentTelemetry.timestamp).toLocaleTimeString('id-ID')
                      : '—'}
                  </span>
                </div>
                {/* Info kapal berhenti */}
                {currentTelemetry && !currentTelemetry.is_moving && (
                  <div className={styles.stoppedInfo}>
                    ⚓ Kapal sedang berlabuh atau berhenti. Pastikan kapal dalam kondisi aman.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- KOLOM KANAN: Grafik Kemiringan --- */}
          <div className={styles.rightColumn}>
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>📈 Grafik Kemiringan Kapal (Real-time)</h3>
                <div className={styles.chartLegend}>
                  <span className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ backgroundColor: '#FF471D' }}></span>
                    Roll (°)
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ backgroundColor: '#29b6f6' }}></span>
                    Pitch (°)
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.legendLine} style={{ borderColor: '#f44336' }}></span>
                    Batas Roll (20°)
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.legendLine} style={{ borderColor: '#ff9800' }}></span>
                    Batas Pitch (15°)
                  </span>
                </div>
              </div>
              <div className={styles.chartContainer}>
                {/* Grafik Recharts - sumbu X: waktu, sumbu Y: derajat kemiringan */}
                {/* Grafik ini akan ter-update otomatis setiap menerima data baru */}
                {/* dari WebSocket / Firestore / simulasi interval */}
                <MonitoringChart
                  data={telemetryHistory}
                  rollThreshold={TILT_THRESHOLDS.roll}
                  pitchThreshold={TILT_THRESHOLDS.pitch}
                />
              </div>
              <p className={styles.chartNote}>
                * Data diperbarui otomatis (real-time) dari sensor kapal
              </p>
            </div>
          </div>
        </div>

        {/* === POPUP ALERT BAHAYA === */}
        {/* Muncul saat |roll| >= 20° atau |pitch| >= 15° */}
        {showAlert && dangerAlert && (
          <div className={styles.alertOverlay} onClick={dismissAlert}>
            <div
              className={`${styles.alertPopup} ${
                dangerAlert.type === 'danger' ? styles.alertPopupDanger : styles.alertPopupWarning
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon alert */}
              <div className={styles.alertIcon}>
                {dangerAlert.type === 'danger' ? '🚨' : '⚠️'}
              </div>
              {/* Pesan alert */}
              <h2 className={styles.alertTitle}>
                {dangerAlert.type === 'danger' ? 'BAHAYA!' : 'PERINGATAN!'}
              </h2>
              <p className={styles.alertMessage}>{dangerAlert.message}</p>
              {/* Info kemiringan */}
              <div className={styles.alertTilt}>
                <span className={styles.alertTiltValue}>
                  {dangerAlert.tilt.toFixed(1)}°
                </span>
                <span className={styles.alertTiltLabel}>Kemiringan</span>
              </div>
              {/* Tombol dismiss */}
              <button className="btn-primary" onClick={dismissAlert}>
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}