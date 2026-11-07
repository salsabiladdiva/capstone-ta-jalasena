/* ================================================
   JALASENA - API Helper Functions
   ================================================
   - Login & zona ikan : masih data dummy
   - Telemetri kapal   : Firebase Firestore (koleksi "IoT")
                         (otomatis kembali ke data dummy
                          jika PROJECT_ID belum diisi)
   ================================================ */

import { DUMMY_FISH_ZONES, DUMMY_SHIPS, isTiltDanger } from './constants';
import { collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { getDb } from './firebase';

// Login & zona ikan masih dummy
const USE_DUMMY_DATA = true;

// Telemetri dari Firebase aktif hanya jika PROJECT_ID sudah diisi di .env.local
const USE_FIREBASE = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

// ================================================
// PENGATURAN FIRESTORE (sesuai kode ESP32)
// ================================================
// ESP32 menulis ke koleksi "IoT" (satu dokumen baru per kiriman, id otomatis)
const TELEMETRY_COLLECTION = 'IoT';

// Ubah timestamp menjadi format ISO.
// ESP32 mengirim string waktu WIB tanpa zona, mis. "2026-11-05T13:00:00"
function toIso(ts) {
  if (ts === undefined || ts === null || ts === '') return new Date().toISOString();
  if (typeof ts === 'object' && typeof ts.toDate === 'function') return ts.toDate().toISOString();
  if (typeof ts === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(ts)) {
    return new Date(ts + '+07:00').toISOString();
  }
  const n = Number(ts);
  if (!Number.isNaN(n)) return new Date(n < 1e12 ? n * 1000 : n).toISOString();
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// Samakan bentuk data (Firestore maupun dummy) dengan yang dipakai dashboard
function normalizeTelemetry(shipCode, raw) {
  const roll = Number(raw.roll ?? 0);
  const pitch = Number(raw.pitch ?? 0);
  const speed = Number(raw.speed ?? 0);
  return {
    ship_code: shipCode,
    timestamp: toIso(raw.timestamp),
    roll,
    pitch,
    roll_abs: Math.abs(roll),
    pitch_abs: Math.abs(pitch),
    tilt_degree: Math.max(Math.abs(roll), Math.abs(pitch)), // dipakai popup alert
    // Bahaya jika ESP32 menandai DANGER, atau |roll|>=20 / |pitch|>=15
    is_danger: raw.status === 'DANGER' || isTiltDanger(roll, pitch),
    temperature: Number(raw.temperature ?? 0),
    speed,
    latitude: Number(raw.latitude ?? 0),
    longitude: Number(raw.longitude ?? 0),
    is_moving: raw.is_moving ?? speed > 0.5,
  };
}

// Query: data terbaru lebih dulu (timestamp string ISO bisa diurutkan)
function telemetryQuery(count) {
  return query(
    collection(getDb(), TELEMETRY_COLLECTION),
    orderBy('timestamp', 'desc'),
    limit(count)
  );
}

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
  if (USE_FIREBASE) {
    const snap = await getDocs(telemetryQuery(1));
    if (snap.empty) return null;
    return normalizeTelemetry(shipCode, snap.docs[0].data());
  }
  await new Promise(resolve => setTimeout(resolve, 300));
  return generateDummyTelemetry(shipCode);
}

/**
 * Mengambil histori telemetry kapal (30 titik awal untuk grafik)
 */
export async function fetchTelemetryHistory(shipCode) {
  if (USE_FIREBASE) {
    const snap = await getDocs(telemetryQuery(30));
    // Dibalik supaya urut dari lama ke baru (untuk grafik)
    return snap.docs.map((d) => normalizeTelemetry(shipCode, d.data())).reverse();
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  const history = [];
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    history.push(
      normalizeTelemetry(shipCode, {
        timestamp: now - i * 3000, // Interval 3 detik
        roll: Math.sin(i * 0.5) * 8 + (Math.random() - 0.5) * 4,
        pitch: Math.cos(i * 0.4) * 5 + (Math.random() - 0.5) * 3,
        temperature: 28 + Math.random() * 2,
        speed: Math.random() * 8 + 2,
        latitude: -6.75 + (Math.random() - 0.5) * 0.01,
        longitude: 110.42 + (Math.random() - 0.5) * 0.01,
      })
    );
  }
  return history;
}

/**
 * Monitoring real-time.
 * Firestore: onSnapshot (callback jalan setiap ada dokumen baru dari alat IoT)
 * Dummy    : interval 3 detik
 */
export function createMonitoringSocket(shipCode, onMessage, onError) {
  if (USE_FIREBASE) {
    const unsubscribe = onSnapshot(
      telemetryQuery(1),
      (snap) => {
        if (snap.empty) return;
        onMessage(normalizeTelemetry(shipCode, snap.docs[0].data()));
      },
      (error) => {
        if (onError) onError(error);
      }
    );
    return { close: unsubscribe, readyState: 1 };
  }

  // Data dummy ter-update setiap 3 detik layaknya WebSocket
  const intervalId = setInterval(() => {
    onMessage(generateDummyTelemetry(shipCode));
  }, 3000);

  return {
    close: () => clearInterval(intervalId),
    readyState: 1, // 1 berarti OPEN
  };
}

/**
 * Generate data telemetry dummy (roll & pitch)
 */
function generateDummyTelemetry(shipCode) {
  const ship = DUMMY_SHIPS.find(s => s.code === shipCode) || DUMMY_SHIPS[0];

  // Ada chance 5% roll/pitch melewati batas bahaya (roll >= 20° / pitch >= 15°)
  const randomSpike = Math.random() > 0.95;
  const baseRoll = Math.sin(Date.now() / 2000) * 8 + (Math.random() - 0.5) * 5;
  const basePitch = Math.cos(Date.now() / 2500) * 5 + (Math.random() - 0.5) * 3;

  return normalizeTelemetry(shipCode, {
    timestamp: Date.now(),
    roll: randomSpike ? baseRoll + 20 : baseRoll,
    pitch: basePitch,
    temperature: Math.round((28 + Math.random() * 1.5) * 10) / 10,
    speed: ship.is_moving ? Math.round((Math.random() * 6 + 3) * 10) / 10 : 0,
    latitude: ship.lat + (Math.random() - 0.5) * 0.002,
    longitude: ship.lng + (Math.random() - 0.5) * 0.002,
    is_moving: ship.is_moving,
  });
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