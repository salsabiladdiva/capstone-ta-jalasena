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
  minZoom: 7,
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
  { id: 'kembung', name: 'Ikan Kembung', icon: '🐟', color: '#4FC3F7' },
  { id: 'teri', name: 'Ikan Teri', icon: '🐠', color: '#81C784' },
  { id: 'tongkol', name: 'Ikan Tongkol', icon: '🐡', color: '#FFB74D' },
];

// --- Data Dummy Zona Ikan ---
// TODO: Integrasi Copernicus Marine Service API
// Data ini akan diganti dengan data real dari satelit Copernicus Marine Service.
// API Copernicus menyediakan data SST (Sea Surface Temperature) dan
// Chlorophyll-a yang digunakan untuk memprediksi lokasi potensial ikan.
// 
// Langkah integrasi:
// 1. Daftar akun di https://marine.copernicus.eu/
// 2. Gunakan Copernicus Marine Toolbox (Python) untuk download data
// 3. Backend Django memproses data SST & Chlorophyll menjadi zona potensial
// 4. Frontend mengambil data zona dari backend API
//
// Referensi dataset:
// - SST: "GLOBAL_ANALYSISFORECAST_PHY_001_024"
// - Chlorophyll: "GLOBAL_ANALYSISFORECAST_BGC_001_028"
export const DUMMY_FISH_ZONES = [
  // === IKAN KEMBUNG ===
  // Kembung prefer perairan hangat (SST 28-30°C) dengan chlorophyll sedang
  // Biasanya ditemukan di area tengah Laut Jawa
  {
    id: 1,
    fish_type: 'kembung',
    latitude: -6.45,
    longitude: 110.25,
    potential_score: 85,
    sst: 29.2,          // Sea Surface Temperature (°C)
    chlorophyll: 2.1,    // Chlorophyll-a (mg/m³)
    description: 'Zona potensial tinggi - perairan hangat dengan plankton melimpah',
  },
  {
    id: 2,
    fish_type: 'kembung',
    latitude: -6.52,
    longitude: 110.55,
    potential_score: 78,
    sst: 28.8,
    chlorophyll: 1.8,
    description: 'Zona potensial sedang-tinggi - area migrasi kembung',
  },
  {
    id: 3,
    fish_type: 'kembung',
    latitude: -6.38,
    longitude: 110.72,
    potential_score: 72,
    sst: 29.5,
    chlorophyll: 2.4,
    description: 'Zona potensial - konsentrasi fitoplankton baik',
  },
  {
    id: 4,
    fish_type: 'kembung',
    latitude: -6.60,
    longitude: 110.10,
    potential_score: 68,
    sst: 28.5,
    chlorophyll: 1.5,
    description: 'Zona potensial sedang - perairan stabil',
  },
  {
    id: 5,
    fish_type: 'kembung',
    latitude: -6.35,
    longitude: 110.90,
    potential_score: 91,
    sst: 29.8,
    chlorophyll: 2.8,
    description: 'Zona potensial sangat tinggi - kondisi ideal untuk kembung',
  },
  {
    id: 6,
    fish_type: 'kembung',
    latitude: -6.70,
    longitude: 110.45,
    potential_score: 65,
    sst: 28.3,
    chlorophyll: 1.9,
    description: 'Zona potensial sedang - area transisi',
  },
  {
    id: 7,
    fish_type: 'kembung',
    latitude: -6.40,
    longitude: 110.95,
    potential_score: 75,
    sst: 29.0,
    chlorophyll: 2.2,
    description: 'Zona potensial - suhu dan nutrisi mendukung',
  },

  // === IKAN TERI ===
  // Teri ditemukan di area pesisir dengan chlorophyll tinggi
  // Biasanya dekat pantai Semarang dan sekitarnya (dipastikan di laut)
  {
    id: 8,
    fish_type: 'teri',
    latitude: -6.78,
    longitude: 110.35,
    potential_score: 88,
    sst: 28.5,
    chlorophyll: 4.2,
    description: 'Zona pesisir - konsentrasi teri sangat tinggi',
  },
  {
    id: 9,
    fish_type: 'teri',
    latitude: -6.75,
    longitude: 110.48,
    potential_score: 82,
    sst: 28.8,
    chlorophyll: 3.8,
    description: 'Area muara sungai - nutrisi melimpah untuk teri',
  },
  {
    id: 10,
    fish_type: 'teri',
    latitude: -6.80,
    longitude: 110.22,
    potential_score: 76,
    sst: 28.2,
    chlorophyll: 3.5,
    description: 'Zona pesisir barat - habitat teri musiman',
  },
  {
    id: 11,
    fish_type: 'teri',
    latitude: -6.62,
    longitude: 110.58,
    potential_score: 79,
    sst: 28.6,
    chlorophyll: 4.0,
    description: 'Perairan dangkal - populasi teri padat',
  },
  {
    id: 12,
    fish_type: 'teri',
    latitude: -6.72,
    longitude: 110.40,
    potential_score: 93,
    sst: 28.4,
    chlorophyll: 4.8,
    description: 'Zona utama teri - chlorophyll sangat tinggi',
  },
  {
    id: 13,
    fish_type: 'teri',
    latitude: -6.55,
    longitude: 110.60,
    potential_score: 70,
    sst: 28.9,
    chlorophyll: 3.2,
    description: 'Area potensial teri timur - sedang berkembang',
  },

  // === IKAN TONGKOL ===
  // Tongkol prefer perairan lebih dalam dengan SST moderat
  // Ditempatkan max 12 mil dari pesisir Semarang
  {
    id: 14,
    fish_type: 'tongkol',
    latitude: -6.50,
    longitude: 110.30,
    potential_score: 87,
    sst: 27.8,
    chlorophyll: 1.8,
    description: 'Zona pelagis - habitat utama tongkol',
  },
  {
    id: 15,
    fish_type: 'tongkol',
    latitude: -6.48,
    longitude: 110.62,
    potential_score: 80,
    sst: 28.0,
    chlorophyll: 1.5,
    description: 'Perairan dalam - migrasi tongkol aktif',
  },
  {
    id: 16,
    fish_type: 'tongkol',
    latitude: -6.30,
    longitude: 110.90,
    potential_score: 73,
    sst: 27.5,
    chlorophyll: 1.6,
    description: 'Zona potensial timur - arus mendukung',
  },
  {
    id: 17,
    fish_type: 'tongkol',
    latitude: -6.55,
    longitude: 110.18,
    potential_score: 90,
    sst: 27.6,
    chlorophyll: 2.0,
    description: 'Zona potensial sangat tinggi - tongkol berkumpul',
  },
  {
    id: 18,
    fish_type: 'tongkol',
    latitude: -6.42,
    longitude: 111.05,
    potential_score: 67,
    sst: 28.2,
    chlorophyll: 1.3,
    description: 'Zona transisi - tongkol bergerak ke timur',
  },
  {
    id: 19,
    fish_type: 'tongkol',
    latitude: -6.52,
    longitude: 110.48,
    potential_score: 84,
    sst: 27.4,
    chlorophyll: 1.9,
    description: 'Zona pelagis utara - kondisi baik untuk tongkol',
  },
  {
    id: 20,
    fish_type: 'tongkol',
    latitude: -6.58,
    longitude: 109.92,
    potential_score: 77,
    sst: 27.9,
    chlorophyll: 1.7,
    description: 'Zona barat - tongkol musiman',
  },
];

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
  roll: 20,   // |roll| >= 20° = bahaya
  pitch: 15,  // |pitch| >= 15° = bahaya
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
  arrivalRadius: 100,      // Jarak (meter) dianggap "sampai" di titik tujuan
  updateInterval: 5000,    // Interval update posisi GPS (ms)
  speedUnit: 'knot',       // Satuan kecepatan
};

// --- Local Storage Keys ---
export const STORAGE_KEYS = {
  SHIP_ID: 'jalasena_ship_id',
  USER_LOCATION: 'jalasena_user_location',
  MAP_CENTER: 'jalasena_map_center',
  SELECTED_FISH_TYPE: 'jalasena_fish_type',
  MONITORING_DATA: 'jalasena_monitoring_data',
};