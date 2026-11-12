/* ================================================
   JALASENA - Simulasi Data Zona Ikan (Laut Jawa)
   ================================================
   Deterministik: input yang sama (ikan + waktu) selalu
   menghasilkan titik yang sama.
   CATATAN: murni simulasi untuk demo, bukan data satelit.
   TODO: ganti dengan data Copernicus Marine Service.
   ================================================ */

// Interval refresh otomatis di halaman deteksi (ms)
export const SIM_REFRESH_MS = 5000;

// ------------------------------------------------
// 1. Peta laut (. = laut, # = daratan / dekat daratan)
//    Grid 0.1° mulai dari lat -3.7 (baris atas) & lng 106.3 (kolom kiri).
//    Sudah dibuffer ±11 km dari daratan.
// ------------------------------------------------
const GRID_LAT_N = -3.7;
const GRID_LNG_W = 106.3;
const GRID_STEP = 0.1;
const SEA_GRID = [
  '.................................................................................######',
  '.................................................................................######',
  '.................................................................................######',
  '.................................................................................######',
  '.................................................................................######',
  '.................................................................................######',
  '.......................................................................................',
  '.......................................................................................',
  '.......................................................................................',
  '.......................................................................................',
  '.......................................................................................',
  '.......................................................................................',
  '.................................................................................####..',
  '.................................................................................####..',
  '.................................................................................####..',
  '.................................................................................###...',
  '................................................................................###....',
  '...............................................................................####....',
  '...............................................................................####....',
  '.....................................######..................#####.............####....',
  '.....................................#######.................#####.....................',
  '##....######.......###...............#######.................#####.....................',
  '#############......###...............#######.................#####.....................',
  '#################..###.................................................................',
  '######################.................................................................',
  '######################.................................................................',
  '########################..................#######......................................',
  '########################..................#######......................................',
  '########################..................#############................................',
  '#############################............#################.............................',
  '####################################.##################################################',
  '#'.repeat(87),
  '#'.repeat(87),
];

export function isSea(lat, lng) {
  const r = Math.floor((GRID_LAT_N - lat) / GRID_STEP);
  const c = Math.floor((lng - GRID_LNG_W) / GRID_STEP);
  if (r < 0 || r >= SEA_GRID.length || c < 0 || c >= SEA_GRID[0].length) return false;
  return SEA_GRID[r][c] === '.';
}

// ------------------------------------------------
// 2. Random generator deterministik
// ------------------------------------------------
function hashSeed(...parts) {
  const str = parts.join('|');
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rngFrom = (...parts) => mulberry32(hashSeed(...parts));
const frac = (...parts) => hashSeed(...parts) / 4294967296;
const between = (rng, min, max) => min + rng() * (max - min);
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const TWO_PI = Math.PI * 2;

function gauss(rng) {
  const u = Math.max(rng(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TWO_PI * rng());
}

// ------------------------------------------------
// 3. Area tangkapan (hotspot) di Laut Jawa
//    type: pesisir | tengah | lepas ; r = sebaran (derajat)
// ------------------------------------------------
const HOTSPOTS = [
  // --- Pesisir utara Jawa (barat -> timur) ---
  { id: 'seribu', name: 'Kepulauan Seribu', lat: -5.95, lng: 106.75, type: 'pesisir', r: 0.22 },
  { id: 'karawang', name: 'Utara Karawang', lat: -5.75, lng: 107.45, type: 'pesisir', r: 0.25 },
  { id: 'indramayu', name: 'Utara Indramayu', lat: -5.9, lng: 108.3, type: 'pesisir', r: 0.25 },
  { id: 'cirebon', name: 'Utara Cirebon-Brebes', lat: -6.25, lng: 109.05, type: 'pesisir', r: 0.25 },
  { id: 'pekalongan', name: 'Utara Pekalongan', lat: -6.3, lng: 109.85, type: 'pesisir', r: 0.25 },
  { id: 'semarang', name: 'Utara Semarang-Demak', lat: -6.45, lng: 110.45, type: 'pesisir', r: 0.25 },
  { id: 'jepara', name: 'Utara Jepara-Muria', lat: -6.15, lng: 110.85, type: 'pesisir', r: 0.25 },
  { id: 'rembang', name: 'Utara Rembang', lat: -6.4, lng: 111.5, type: 'pesisir', r: 0.25 },
  { id: 'tuban', name: 'Utara Tuban-Lamongan', lat: -6.45, lng: 112.2, type: 'pesisir', r: 0.25 },
  { id: 'madura', name: 'Utara Madura', lat: -6.5, lng: 113.3, type: 'pesisir', r: 0.25 },
  { id: 'sumenep', name: 'Utara Sumenep', lat: -6.45, lng: 114.2, type: 'pesisir', r: 0.25 },
  // --- Perairan tengah ---
  { id: 'tengah_brt', name: 'Tengah Laut Jawa Barat', lat: -5.0, lng: 107.8, type: 'tengah', r: 0.45 },
  { id: 'karimun', name: 'Perairan Karimunjawa', lat: -5.55, lng: 110.75, type: 'tengah', r: 0.35 },
  { id: 'tengah_tgh', name: 'Tengah Laut Jawa', lat: -5.2, lng: 111.4, type: 'tengah', r: 0.45 },
  { id: 'bawean', name: 'Perairan Bawean', lat: -5.45, lng: 112.6, type: 'tengah', r: 0.35 },
  { id: 'masalembu', name: 'Perairan Masalembu', lat: -5.3, lng: 113.7, type: 'tengah', r: 0.35 },
  // --- Laut lepas ---
  { id: 'lepas_brt', name: 'Laut Jawa Utara Barat', lat: -4.3, lng: 108.6, type: 'lepas', r: 0.55 },
  { id: 'belitung', name: 'Selatan Belitung', lat: -3.95, lng: 107.6, type: 'lepas', r: 0.4 },
  { id: 'lepas_tgh', name: 'Laut Jawa Utara Tengah', lat: -4.5, lng: 110.9, type: 'lepas', r: 0.55 },
  { id: 'kalbar', name: 'Selatan Kalimantan', lat: -4.0, lng: 111.3, type: 'lepas', r: 0.4 },
  { id: 'lepas_tmr', name: 'Laut Jawa Utara Timur', lat: -4.4, lng: 112.7, type: 'lepas', r: 0.55 },
  { id: 'lepas_tmr2', name: 'Laut Jawa Timur', lat: -4.6, lng: 114.0, type: 'lepas', r: 0.35 },
].map((h) => ({
  ...h,
  richness: 0.65 + 0.35 * frac('rich', h.id),
  chlBias: { pesisir: 1.25, tengah: 1.0, lepas: 0.8 }[h.type] * (0.9 + 0.2 * frac('chl', h.id)),
  sstBias: (frac('sst', h.id) - 0.5) * 0.7,
}));

// ------------------------------------------------
// 4. Profil tiap ikan (inilah yang membuat data tiap ikan beda)
//    peakHour = jam aktivitas puncak (asumsi simulasi)
// ------------------------------------------------
const FISH_PROFILES = {
  kembung: {
    count: [24, 32],
    sst: [28.0, 30.2],
    chl: [1.2, 3.2],
    peakHour: 19,
    affinity: { pesisir: 1.0, tengah: 1.5, lepas: 0.6 },
    notes: [
      'perairan hangat dengan plankton melimpah',
      'area migrasi kembung aktif',
      'konsentrasi fitoplankton baik',
      'suhu dan nutrisi mendukung',
    ],
  },
  teri: {
    count: [20, 28],
    sst: [27.8, 29.8],
    chl: [3.0, 5.6],
    peakHour: 23,
    affinity: { pesisir: 2.4, tengah: 0.15, lepas: 0 },
    notes: [
      'perairan dangkal dekat pesisir, populasi teri padat',
      'area muara - nutrisi melimpah untuk teri',
      'chlorophyll tinggi, teri bergerombol',
      'habitat teri musiman',
    ],
  },
  tongkol: {
    count: [22, 30],
    sst: [27.0, 29.2],
    chl: [0.8, 2.4],
    peakHour: 6,
    affinity: { pesisir: 0.3, tengah: 1.4, lepas: 1.9 },
    notes: [
      'zona pelagis - habitat utama tongkol',
      'perairan dalam, migrasi tongkol aktif',
      'arus mendukung pergerakan tongkol',
      'tongkol berkumpul mengikuti gerombolan ikan kecil',
    ],
  },
};

// Ikan baru yang ditambah di FISH_TYPES otomatis dapat profil sendiri
function getProfile(fishId) {
  if (FISH_PROFILES[fishId]) return FISH_PROFILES[fishId];
  const r = rngFrom('profile', fishId);
  const sstMin = between(r, 27.0, 28.4);
  const chlMin = between(r, 0.8, 3.0);
  return {
    count: [20, 28],
    sst: [sstMin, sstMin + 1.8],
    chl: [chlMin, chlMin + 1.6],
    peakHour: Math.floor(r() * 24),
    affinity: { pesisir: between(r, 0.2, 2), tengah: between(r, 0.2, 2), lepas: between(r, 0, 2) },
    notes: ['zona potensial - kondisi perairan mendukung'],
  };
}

// ------------------------------------------------
// 5. Pembangkit zona
// ------------------------------------------------
function samplePoint(rng, hs) {
  for (let i = 0; i < 25; i++) {
    const scale = i < 12 ? 1 : 0.4;
    const lat = hs.lat + gauss(rng) * hs.r * 0.6 * scale;
    const lng = hs.lng + gauss(rng) * hs.r * 0.6 * scale;
    if (isSea(lat, lng)) return { lat, lng };
  }
  return { lat: hs.lat, lng: hs.lng };
}

function pickHotspot(rng, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let x = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    x -= weights[i];
    if (x <= 0) return HOTSPOTS[i];
  }
  return HOTSPOTS[HOTSPOTS.length - 1];
}

/**
 * Bangkitkan zona potensial satu jenis ikan pada waktu tertentu.
 * Bentuk datanya sama dengan DUMMY_FISH_ZONES.
 */
export function generateFishZones(fishId, when = new Date()) {
  const profile = getProfile(fishId);
  const dayKey = when.getFullYear() * 10000 + (when.getMonth() + 1) * 100 + when.getDate();
  const hour = when.getHours();
  const tSec = hour * 3600 + when.getMinutes() * 60 + when.getSeconds();
  const hourFloat = tSec / 3600;

  // Jumlah zona berubah tiap jam
  const count = Math.round(
    between(rngFrom(fishId, dayKey, hour, 'count'), profile.count[0], profile.count[1])
  );

  // Bobot hotspot: beda tiap ikan (affinity) & bergeser tiap jam
  const weights = HOTSPOTS.map((h) => {
    const phase = TWO_PI * frac('phase', fishId, h.id);
    const wave = 0.5 + 0.5 * Math.sin(TWO_PI * (hour / 24) + phase);
    return profile.affinity[h.type] * (0.35 + 0.65 * wave);
  });

  const timeFactor = 0.5 + 0.5 * Math.cos((TWO_PI * (hourFloat - profile.peakHour)) / 24);

  const zones = [];
  for (let k = 0; k < count; k++) {
    // Hotspot dipilih sekali per zona per hari (tidak berubah tiap detik)
    // sehingga titik tidak loncat jauh (misal Semarang ke Jakarta)
    const stableRng = rngFrom(fishId, dayKey, k, 'stable');
    const hs = pickHotspot(stableRng, weights);
    const base = samplePoint(stableRng, hs);

    // Bergeser pelan di sekitar titik dasar (drift kecil, maks ~0.02 derajat ≈ 2 km)
    const dr = rngFrom(fishId, 'drift', k);
    const amp = between(dr, 0.008, 0.02);
    const per = between(dr, 180, 600);
    const p1 = dr() * TWO_PI;
    const p2 = dr() * TWO_PI;
    const moved = {
      lat: base.lat + amp * Math.sin((TWO_PI * tSec) / per + p1),
      lng: base.lng + amp * 1.3 * Math.cos((TWO_PI * tSec) / (per * 1.25) + p2),
    };
    const pos = isSea(moved.lat, moved.lng) ? moved : base;

    // Skor, SST, chlorophyll naik-turun
    const wobble = 3 * Math.sin((TWO_PI * tSec) / between(dr, 40, 110) + p1);
    const score = clamp(
      Math.round(
        55 + 25 * hs.richness * (0.7 + 0.3 * stableRng()) + 15 * timeFactor + gauss(stableRng) * 4 + wobble
      ),
      45,
      98
    );
    const sstBase = between(stableRng, profile.sst[0], profile.sst[1]) + hs.sstBias;
    const sst = clamp(
      sstBase +
        0.35 * Math.sin((TWO_PI * (hourFloat - 9)) / 24) +
        0.12 * Math.sin((TWO_PI * tSec) / 75 + p2),
      profile.sst[0] - 0.5,
      profile.sst[1] + 0.5
    );
    const chl = clamp(
      between(stableRng, profile.chl[0], profile.chl[1]) *
        hs.chlBias *
        (1 + 0.08 * Math.sin((TWO_PI * tSec) / 90 + p1)),
      0.3,
      7
    );

    const tier = score >= 85 ? 'sangat tinggi' : score >= 72 ? 'tinggi' : 'sedang';
    const note = profile.notes[Math.floor(stableRng() * profile.notes.length)];

    zones.push({
      id: `${fishId}-${k + 1}`,
      fish_type: fishId,
      latitude: pos.lat,
      longitude: pos.lng,
      potential_score: score,
      sst: Math.round(sst * 10) / 10,
      chlorophyll: Math.round(chl * 10) / 10,
      description: `Zona potensial ${tier} - ${note} (${hs.name})`,
    });
  }
  return zones;
}

// ------------------------------------------------
// 6. Helper pemilihan jam untuk UI
// ------------------------------------------------
export const HOUR_OPTIONS = [
  { value: 'live', label: '🔴 Sekarang (Live)' },
  ...Array.from({ length: 24 }, (_, h) => ({
    value: String(h),
    label: `🕐 ${String(h).padStart(2, '0')}.00 WIB`,
  })),
];

// 'live' = waktu sekarang. Jam tertentu = jam itu, menit:detik tetap berjalan
// supaya data tetap berubah tiap beberapa detik.
export function getSimTime(hourValue = 'live') {
  const now = new Date();
  if (hourValue === 'live') return now;
  const t = new Date(now);
  t.setHours(Number(hourValue));
  return t;
}