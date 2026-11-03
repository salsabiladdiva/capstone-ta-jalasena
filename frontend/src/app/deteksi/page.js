/* ================================================
   JALASENA - Halaman Deteksi Zona Ikan
   ================================================
   Halaman ini menampilkan:
   - Dropdown filter ikan (Kembung, Teri, Tongkol)
   - Button "Cari" untuk mencari zona ikan
   - Peta interaktif Leaflet dengan marker zona ikan
   - Popup info marker (koordinat, jenis ikan, jarak)
   - Panel navigasi ke titik ikan
   ================================================ */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { FISH_TYPES } from '@/lib/constants';
import { fetchFishZones, calculateDistance, formatDistance } from '@/lib/api';
import styles from './deteksi.module.css';

// --- Import Leaflet Map secara dynamic (SSR disabled) ---
// Leaflet membutuhkan objek 'window' yang tidak tersedia di server-side
const FishMap = dynamic(() => import('../../components/FishMap'), { 
  ssr: false,
  loading: () => (
    <div className={styles.mapLoading}>
      <div className={styles.mapLoadingSpinner}></div>
      <p>Memuat peta...</p>
    </div>
  ),
});

export default function DeteksiPage() {
  // State untuk jenis ikan yang dipilih di dropdown
  const [selectedFish, setSelectedFish] = useState('');
  // State untuk daftar zona ikan dari API/dummy data
  const [fishZones, setFishZones] = useState([]);
  // State loading saat fetching data
  const [isLoading, setIsLoading] = useState(false);
  // State zona ikan yang dipilih (saat marker diklik)
  const [selectedZone, setSelectedZone] = useState(null);
  // State posisi pengguna saat ini (dari GPS browser)
  const [userPosition, setUserPosition] = useState(null);
  // State navigasi aktif (saat "Menuju ke Titik Ini" ditekan)
  const [isNavigating, setIsNavigating] = useState(false);
  // State untuk menampilkan popup "sampai"
  const [hasArrived, setHasArrived] = useState(false);
  // State jarak ke tujuan saat navigasi
  const [navDistance, setNavDistance] = useState(null);
  // State kecepatan simulasi
  const [navSpeed, setNavSpeed] = useState(null);
  // State mode peta (gelap/terang)
  const [mapMode, setMapMode] = useState('dark');
  // State GPS permission
  const [gpsStatus, setGpsStatus] = useState('checking'); // 'checking' | 'granted' | 'denied' | 'prompt' | 'unavailable'
  // Ref for map wrapper to force resize
  const mapWrapperRef = useRef(null);

  // --- Cek permission GPS dan ambil posisi pengguna ---
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unavailable');
      setUserPosition({ lat: -6.9667, lng: 110.4196 });
      return;
    }

    // Cek permission status (jika browser mendukung Permissions API)
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          setGpsStatus('granted');
        } else if (result.state === 'denied') {
          setGpsStatus('denied');
          setUserPosition({ lat: -6.9667, lng: 110.4196 });
          return;
        } else {
          // 'prompt' - user belum memutuskan
          setGpsStatus('prompt');
        }

        // Listen for permission changes
        result.onchange = () => {
          if (result.state === 'granted') {
            setGpsStatus('granted');
            requestGpsPosition();
          } else if (result.state === 'denied') {
            setGpsStatus('denied');
          }
        };
      }).catch(() => {
        // Permissions API tidak didukung, langsung coba
        setGpsStatus('prompt');
      });
    } else {
      setGpsStatus('prompt');
    }

    requestGpsPosition();
  }, []);

  // Fungsi untuk meminta posisi GPS
  const requestGpsPosition = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsStatus('granted');
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn('GPS tidak tersedia, menggunakan posisi default Semarang');
        if (err.code === 1) {
          // Permission denied
          setGpsStatus('denied');
        } else {
          setGpsStatus('unavailable');
        }
        // Fallback ke posisi Semarang jika GPS tidak tersedia
        setUserPosition({ lat: -6.9667, lng: 110.4196 });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  // --- Handler pencarian zona ikan ---
  // Dipanggil saat tombol "Cari" ditekan
  const handleSearch = useCallback(async () => {
    if (!selectedFish) return;
    
    setIsLoading(true);
    setSelectedZone(null);
    setIsNavigating(false);
    setHasArrived(false);

    try {
      // TODO: Integrasi Copernicus Marine Service API
      // Saat ini mengambil data dari dummy, nanti dari backend yang
      // terhubung ke Copernicus Marine Service satellite data
      const zones = await fetchFishZones(selectedFish);
      setFishZones(zones);
    } catch (error) {
      console.error('Gagal mengambil data zona ikan:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFish]);

  // --- Handler saat marker ikan diklik ---
  const handleMarkerClick = useCallback((zone) => {
    setSelectedZone(zone);
    setIsNavigating(false);
    setHasArrived(false);
  }, []);

  // --- Handler navigasi ke titik ikan ---
  // Saat tombol "Menuju ke Titik Ini" ditekan
  const handleNavigate = useCallback(() => {
    if (!selectedZone || !userPosition) return;

    setIsNavigating(true);
    
    // Simulasi kecepatan kapal (5-10 knots)
    const speedKnots = (Math.random() * 5 + 5).toFixed(1);
    setNavSpeed(speedKnots);

    // Hitung jarak ke tujuan
    const dist = calculateDistance(
      userPosition.lat, userPosition.lng,
      selectedZone.latitude, selectedZone.longitude
    );
    setNavDistance(dist);

    // --- Simulasi GPS tracking ---
    // Dalam implementasi nyata, GPS device akan aktif dan
    // posisi diupdate setiap beberapa detik
    // Cek apakah sudah "sampai" (jarak < 0.1 km = 100 meter)
    const checkArrival = setInterval(() => {
      // Simulasi pengurangan jarak
      setNavDistance(prev => {
        if (prev === null) return null;
        const newDist = prev - 0.5; // Simulasi bergerak 500m per update
        if (newDist <= 0.1) {
          clearInterval(checkArrival);
          setHasArrived(true);
          return 0;
        }
        return newDist;
      });
    }, 3000);

    return () => clearInterval(checkArrival);
  }, [selectedZone, userPosition]);

  // --- Hitung jarak dari posisi user ke zona terpilih ---
  const getDistanceToZone = useCallback((zone) => {
    if (!userPosition) return null;
    return calculateDistance(
      userPosition.lat, userPosition.lng,
      zone.latitude, zone.longitude
    );
  }, [userPosition]);

  return (
    <>
      <Navbar />
      
      <main className={styles.deteksiPage}>
        {/* === FILTER BAR === */}
        {/* Bar atas berisi dropdown filter ikan dan tombol cari */}
        <div className={styles.filterBar}>
          <div className={styles.filterContent}>
            <h1 className={styles.pageTitle}>
              <span className={styles.pageTitleIcon}>🎯</span>
              Deteksi Zona Ikan
            </h1>
            
            <div className={styles.filterControls}>
              {/* Dropdown pilih jenis ikan */}
              <select
                id="fish-type-select"
                className={styles.fishSelect}
                value={selectedFish}
                onChange={(e) => setSelectedFish(e.target.value)}
              >
                <option value="">-- Pilih Jenis Ikan --</option>
                {FISH_TYPES.map((fish) => (
                  <option key={fish.id} value={fish.id}>
                    {fish.icon} {fish.name}
                  </option>
                ))}
              </select>

              {/* Dropdown pilih mode peta */}
              <select
                id="map-mode-select"
                className={styles.fishSelect}
                value={mapMode}
                onChange={(e) => setMapMode(e.target.value)}
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
              </select>

              {/* Tombol Cari - trigger pencarian zona ikan */}
              <button
                id="btn-search-fish"
                className={`btn-primary ${styles.searchBtn}`}
                onClick={handleSearch}
                disabled={!selectedFish || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Mencari...
                  </>
                ) : (
                  <>
                    🔍 Cari
                  </>
                )}
              </button>
            </div>

            {/* Info jumlah zona ditemukan */}
            {fishZones.length > 0 && (
              <p className={styles.resultInfo}>
                Ditemukan <strong>{fishZones.length}</strong> zona potensial{' '}
                {FISH_TYPES.find(f => f.id === selectedFish)?.name || ''}
              </p>
            )}
          </div>
        </div>

        {/* === GPS PERMISSION BANNER === */}
        {(gpsStatus === 'prompt' || gpsStatus === 'denied' || gpsStatus === 'unavailable') && (
          <div className={styles.gpsBanner}>
            <div className={styles.gpsBannerContent}>
              <span className={styles.gpsBannerIcon}>
                {gpsStatus === 'denied' ? '🚫' : '📍'}
              </span>
              <div className={styles.gpsBannerText}>
                <strong>
                  {gpsStatus === 'denied'
                    ? 'Akses Lokasi Ditolak'
                    : gpsStatus === 'unavailable'
                    ? 'GPS Tidak Tersedia'
                    : 'Aktifkan GPS untuk Akurasi Lokasi'}
                </strong>
                <span>
                  {gpsStatus === 'denied'
                    ? 'Buka pengaturan browser dan izinkan akses lokasi untuk hasil yang lebih akurat.'
                    : gpsStatus === 'unavailable'
                    ? 'Perangkat Anda tidak mendukung GPS. Menggunakan lokasi default.'
                    : 'Izinkan akses lokasi untuk menampilkan posisi Anda di peta dan menghitung jarak.'}
                </span>
              </div>
              {gpsStatus === 'prompt' && (
                <button
                  className={styles.gpsBannerBtn}
                  onClick={requestGpsPosition}
                >
                  Izinkan GPS
                </button>
              )}
            </div>
          </div>
        )}

        {/* === AREA PETA + PANEL NAVIGASI === */}
        <div className={styles.mapContainer}>
          {/* Peta interaktif Leaflet */}
          <div className={styles.mapWrapper} ref={mapWrapperRef}>
            <FishMap
              fishZones={fishZones}
              userPosition={userPosition}
              selectedZone={selectedZone}
              isNavigating={isNavigating}
              onMarkerClick={handleMarkerClick}
              mapMode={mapMode}
            />
          </div>

          {/* Panel info zona ikan terpilih / navigasi */}
          {selectedZone && (
            <div className={styles.infoPanel}>
              {/* Header info panel */}
              <div className={styles.infoPanelHeader}>
                <h3>
                  {FISH_TYPES.find(f => f.id === selectedZone.fish_type)?.icon}{' '}
                  {FISH_TYPES.find(f => f.id === selectedZone.fish_type)?.name}
                </h3>
                <button
                  className={styles.closeBtn}
                  onClick={() => { setSelectedZone(null); setIsNavigating(false); }}
                >
                  ✕
                </button>
              </div>

              {/* Informasi koordinat dan jarak */}
              <div className={styles.infoDetails}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>📍 Latitude</span>
                  <span className={styles.infoValue}>{selectedZone.latitude.toFixed(4)}°</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>📍 Longitude</span>
                  <span className={styles.infoValue}>{selectedZone.longitude.toFixed(4)}°</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>🎯 Potensi</span>
                  <span className={styles.infoValue} style={{ color: 'var(--color-accent)' }}>
                    {selectedZone.potential_score}%
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>🌡️ SST</span>
                  <span className={styles.infoValue}>{selectedZone.sst}°C</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>🧪 Chlorophyll</span>
                  <span className={styles.infoValue}>{selectedZone.chlorophyll} mg/m³</span>
                </div>
                {userPosition && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>📏 Jarak</span>
                    <span className={styles.infoValue}>
                      {formatDistance(getDistanceToZone(selectedZone))}
                    </span>
                  </div>
                )}
                <p className={styles.infoDescription}>{selectedZone.description}</p>
              </div>

              {/* Tombol Navigasi / Info Navigasi Aktif */}
              {!isNavigating ? (
                <button
                  id="btn-navigate"
                  className={`btn-primary ${styles.navigateBtn}`}
                  onClick={handleNavigate}
                >
                  🧭 Menuju ke Titik Ini
                </button>
              ) : (
                <div className={styles.navInfo}>
                  <h4 style={{ color: 'var(--color-accent)', marginBottom: '12px' }}>
                    🧭 Navigasi Aktif
                  </h4>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>⚡ Kecepatan</span>
                    <span className={styles.infoValue}>{navSpeed} knot</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>📏 Sisa Jarak</span>
                    <span className={styles.infoValue}>
                      {navDistance !== null ? formatDistance(navDistance) : '-'}
                    </span>
                  </div>
                  <div className={styles.gpsIndicator}>
                    <span className={styles.gpsDot}></span>
                    GPS Aktif
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* === POPUP "KAMU TELAH SAMPAI" === */}
        {hasArrived && (
          <div className={styles.arrivalOverlay} onClick={() => setHasArrived(false)}>
            <div className={styles.arrivalPopup}>
              <div className={styles.arrivalIcon}>🎉</div>
              <h2>Kamu Telah Sampai!</h2>
              <p>Anda telah tiba di zona potensial ikan. Selamat menangkap ikan!</p>
              <button
                className="btn-primary"
                onClick={() => {
                  setHasArrived(false);
                  setIsNavigating(false);
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
