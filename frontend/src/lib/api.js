/* ================================================
   JALASENA - API Helper Functions
   ================================================
   Fungsi-fungsi untuk berkomunikasi dengan backend
   Django REST Framework API. (MOCK MODE AKTIF)
   ================================================ */

import { API_BASE_URL, WS_BASE_URL, DUMMY_FISH_ZONES, DUMMY_SHIPS } from './constants';

// Flag untuk menggunakan data dummy karena IoT/Backend belum siap
const USE_DUMMY_DATA = true;

/**
 * Mengambil daftar zona potensial ikan
 */
export async function fetchFishZones(fishType = '') {
  if (USE_DUMMY_DATA) {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulasi loading
    if (fishType) {
      return DUMMY_FISH_ZONES.filter(zone => zone.fish_type === fishType);
    }
    return DUMMY_FISH_ZONES;
  }
  // Kode integrasi backend asli disembunyikan untuk sementara
}

/**
 * Login dengan Ship ID Code
 */
export async function loginWithShipCode(shipCode) {
  if (USE_DUMMY_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const ship = DUMMY_SHIPS.find(s => s.code.toLowerCase() === shipCode.toLowerCase());
    
    if (!ship) {
      throw new Error('Kode Kapal tidak ditemukan. Pastikan kode yang dimasukkan benar.');
    }
    return ship;
  }
}

/**
 * Mengambil data telemetry terbaru
 */
export async function fetchLatestTelemetry(shipCode) {
  if (USE_DUMMY_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateDummyTelemetry(shipCode);
  }
}

/**
 * Mengambil histori telemetry kapal (30 titik awal untuk grafik)
 */
export async function fetchTelemetryHistory(shipCode) {
  if (USE_DUMMY_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const history = [];
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      history.push({
        timestamp: new Date(now - i * 3000).toISOString(), // Interval 3 detik
        tilt_degree: Math.abs(Math.sin(i * 0.5) * 8 + Math.random() * 4), // Dummy kemiringan natural
        temperature: 28 + Math.random() * 2,
        speed: Math.random() * 8 + 2,
        latitude: -6.75 + (Math.random() - 0.5) * 0.01,
        longitude: 110.42 + (Math.random() - 0.5) * 0.01,
      });
    }
    return history;
  }
}

/**
 * Simulasi WebSocket untuk monitoring real-time
 */
export function createMonitoringSocket(shipCode, onMessage, onError) {
  if (USE_DUMMY_DATA) {
    // Data akan ter-update setiap 3 detik layaknya WebSocket
    const intervalId = setInterval(() => {
      const data = generateDummyTelemetry(shipCode);
      onMessage(data);
    }, 3000);

    return {
      close: () => clearInterval(intervalId),
      readyState: 1, // 1 berarti OPEN
    };
  }
}

/**
 * Generate data telemetry dummy difokuskan pada vessel tilt (kemiringan)
 */
function generateDummyTelemetry(shipCode) {
  const ship = DUMMY_SHIPS.find(s => s.code === shipCode) || DUMMY_SHIPS[0];
  
  // Simulasi kemiringan (normal: 0-12°). Ada chance 5% kemiringan bahaya (>30°)
  const randomSpike = Math.random() > 0.95; 
  const baseTilt = Math.abs(Math.sin(Date.now() / 2000) * 8 + Math.random() * 5);
  const tiltDegree = randomSpike ? baseTilt + 25 : baseTilt; // Spike bahaya

  return {
    ship_code: shipCode,
    timestamp: new Date().toISOString(),
    tilt_degree: Math.round(tiltDegree * 10) / 10,
    temperature: Math.round((28 + Math.random() * 1.5) * 10) / 10,
    speed: ship.is_moving ? Math.round((Math.random() * 6 + 3) * 10) / 10 : 0,
    latitude: ship.lat + (Math.random() - 0.5) * 0.002,
    longitude: ship.lng + (Math.random() - 0.5) * 0.002,
    is_moving: ship.is_moving,
  };
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(distanceKm) {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
}