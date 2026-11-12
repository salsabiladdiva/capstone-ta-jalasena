/* ================================================
   JALASENA - Konfigurasi & Konstanta
   ================================================
   File ini berisi konstanta, konfigurasi API,
   dan data dummy yang digunakan di seluruh aplikasi.
   ================================================ */

// --- Konfigurasi API Backend ---
// TODO: Ganti dengan URL backend production saat deployment
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

// --- Konfigurasi Peta ---
// Pusat peta default: Laut Jawa (Semarang dan sekitarnya)
export const MAP_CONFIG = {
  center: [-6.7, 110.4], // Koordinat Semarang
  zoom: 9,
  minZoom: 6,
  maxZoom: 16,
  // Tile layer gelap
  darkTileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  darkReferenceUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
  darkAttribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  // Tile layer terang (OpenStreetMap)
  lightTileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  lightAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

// --- Jenis Ikan ---
export const FISH_TYPES = [
  { id: 'kembung', name: 'Ikan Kembung', icon: '', color: '#4FC3F7' },
  { id: 'teri', name: 'Ikan Teri', icon: '', color: '#81C784' },
  { id: 'tongkol', name: 'Ikan Tongkol', icon: '', color: '#FFB74D' },
];

// --- Data Zona Ikan ---
// Saat ini data zona ikan dibangkitkan oleh simulasi (src/lib/fishSimulation.js).
// TODO: Integrasi Copernicus Marine Service API
// Data simulasi akan diganti dengan data real dari satelit Copernicus Marine Service.
// Dataset yang relevan:
// - SST: "GLOBAL_ANALYSISFORECAST_PHY_001_024"
// - Chlorophyll: "GLOBAL_ANALYSISFORECAST_BGC_001_028"

// --- Data Dummy Kapal ---
// Simulasi data kapal nelayan untuk fitur monitoring
export const DUMMY_SHIPS = [
  {
    code: 'JLS-001',
    name: 'KM Bahari Jaya',
    owner: 'Pak Ahmad',
    lat: -6.75,
    lng: 110.42,
    is_active: true,
    is_moving: true,
  },
  {
    code: 'JLS-002',
    name: 'KM Sinar Laut',
    owner: 'Pak Budi',
    lat: -6.82,
    lng: 110.55,
    is_active: true,
    is_moving: false,
  },
  {
    code: 'JLS-003',
    name: 'KM Nelayan Mandiri',
    owner: 'Pak Cahyo',
    lat: -6.68,
    lng: 110.38,
    is_active: false,
    is_moving: false,
  },
];

// --- Threshold Kemiringan Kapal ---
// Aturan sesuai pelabelan dataset model:
// BAHAYA jika |roll| >= 20° ATAU |pitch| >= 15°
// Data roll & pitch didapat dari sensor accelerometer/gyroscope di kapal
export const TILT_THRESHOLDS = {
  roll: 20, // |roll| >= 20° = bahaya
  pitch: 15, // |pitch| >= 15° = bahaya
};

// Mengembalikan true jika kapal dalam kondisi bahaya
export function isTiltDanger(roll, pitch) {
  return (
    Math.abs(roll) >= TILT_THRESHOLDS.roll ||
    Math.abs(pitch) >= TILT_THRESHOLDS.pitch
  );
}

// --- Konfigurasi Navigasi ---
export const NAV_CONFIG = {
  arrivalRadius: 100, // Jarak (meter) dianggap "sampai" di titik tujuan
  updateInterval: 5000, // Interval update posisi GPS (ms)
  speedUnit: 'knot', // Satuan kecepatan
};

// --- Local Storage Keys ---
export const STORAGE_KEYS = {
  SHIP_ID: 'jalasena_ship_id',
  USER_LOCATION: 'jalasena_user_location',
  MAP_CENTER: 'jalasena_map_center',
  SELECTED_FISH_TYPE: 'jalasena_fish_type',
  MONITORING_DATA: 'jalasena_monitoring_data',
};