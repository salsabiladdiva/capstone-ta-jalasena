/* ================================================
   JALASENA - FishMap Component (Leaflet)
   ================================================
   Komponen peta interaktif menggunakan Leaflet.js
   untuk menampilkan:
   - Marker zona potensial ikan
   - Posisi pengguna saat ini
   - Rute navigasi ke titik ikan
   - Custom popup info marker
   
   PENTING: Komponen ini harus di-import secara dynamic
   dengan ssr: false karena Leaflet membutuhkan 'window'
   ================================================ */

'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG, FISH_TYPES } from '@/lib/constants';
import { calculateDistance, formatDistance } from '@/lib/api';

// --- Fix icon Leaflet default di Next.js ---
// Leaflet icons tidak otomatis ter-resolve di Next.js bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * Membuat custom icon marker ikan berdasarkan jenis
 * Setiap jenis ikan memiliki warna berbeda
 */
function createFishIcon(fishType) {
  const fishConfig = FISH_TYPES.find(f => f.id === fishType) || FISH_TYPES[0];
  
  return L.divIcon({
    className: 'custom-fish-marker',
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <!-- Pulse ring animasi untuk marker -->
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: ${fishConfig.color}33;
          animation: markerPulse 2s ease-in-out infinite;
        "></div>
        <!-- Icon ikan -->
        <div style="
          width: 32px;
          height: 32px;
          background: ${fishConfig.color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 10px ${fishConfig.color}66;
          border: 2px solid white;
          position: relative;
          z-index: 1;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6s-7.56-2.54-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/></svg>
        </div>
      </div>
      <style>
        @keyframes markerPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.8); opacity: 0; }
        }
      </style>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

// Cache icon per jenis ikan supaya animasi pulse tidak restart saat data refresh
const iconCache = {};
function getFishIcon(fishType) {
  if (!iconCache[fishType]) iconCache[fishType] = createFishIcon(fishType);
  return iconCache[fishType];
}

/**
 * Icon untuk posisi pengguna (nelayan)
 */
const userIcon = L.divIcon({
  className: 'user-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #2196F3;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 15px rgba(33, 150, 243, 0.6);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

/**
 * Komponen untuk mengatur view peta.
 * Kamera HANYA bergerak saat pencarian baru (fitKey berubah) atau saat
 * zona dipilih/ditutup. Refresh data otomatis tidak menggerakkan kamera.
 */
function MapController({ fishZones, selectedZone, fitKey }) {
  const map = useMap();
  const zonesRef = useRef(fishZones);
  const selectedRef = useRef(selectedZone);

  // Sinkronkan ref dengan props terbaru
  useEffect(() => {
    zonesRef.current = fishZones;
    selectedRef.current = selectedZone;
  });

  // Fix: invalidateSize saat pertama kali load dan saat resize
  // Ini mengatasi bug Leaflet di mobile dimana peta tidak ter-render
  // karena container belum memiliki dimensi yang benar saat inisialisasi
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Juga invalidateSize setelah delay lebih lama (untuk transisi CSS)
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  const selectedId = selectedZone?.id;
  useEffect(() => {
    const zone = selectedRef.current;
    const zones = zonesRef.current;
    if (zone) {
      // Zoom ke zona yang dipilih
      map.flyTo([zone.latitude, zone.longitude], 12, { duration: 1 });
    } else if (zones.length > 0) {
      // Fit bounds ke semua zona
      const bounds = L.latLngBounds(zones.map(z => [z.latitude, z.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
    }
  }, [fitKey, selectedId, map]);

  return null;
}

/**
 * FishMap - Komponen Peta Utama
 * Menampilkan peta Leaflet dengan marker zona ikan,
 * posisi user, dan rute navigasi
 */
export default function FishMap({
  fishZones = [],
  userPosition,
  selectedZone,
  isNavigating,
  onMarkerClick,
  mapMode = 'dark',
  fitKey = 0,
}) {
  // --- Buat rute navigasi (garis dari user ke zona terpilih) ---
  const routeLine = useMemo(() => {
    if (!isNavigating || !selectedZone || !userPosition) return null;
    return [
      [userPosition.lat, userPosition.lng],
      [selectedZone.latitude, selectedZone.longitude],
    ];
  }, [isNavigating, selectedZone, userPosition]);

  return (
    <div style={{ width: '100%', height: '100%' }} className={mapMode === 'dark' ? 'map-dark-mode' : ''}>
    <MapContainer
      center={MAP_CONFIG.center}
      zoom={MAP_CONFIG.zoom}
      minZoom={MAP_CONFIG.minZoom}
      maxZoom={MAP_CONFIG.maxZoom}
      style={{ width: '100%', height: '100%', minHeight: '300px' }}
      zoomControl={true}
    >
      {/* Tile layer - OpenStreetMap untuk kedua mode */}
      {/* Dark mode: CSS filter diterapkan via wrapper .map-dark-mode */}
      <TileLayer
        url={MAP_CONFIG.lightTileUrl}
        attribution={MAP_CONFIG.lightAttribution}
        maxZoom={19}
      />

      {/* Controller untuk auto-pan/zoom */}
      <MapController fishZones={fishZones} selectedZone={selectedZone} fitKey={fitKey} />

      {/* --- Marker Posisi Pengguna --- */}
      {userPosition && (
        <>
          <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
            <Popup>
              <div style={{ fontFamily: 'Outfit, sans-serif', padding: '4px' }}>
                <strong>Posisi Anda</strong><br/>
                Lat: {userPosition.lat.toFixed(4)}°<br/>
                Lng: {userPosition.lng.toFixed(4)}°
              </div>
            </Popup>
          </Marker>
          {/* Lingkaran radius di sekitar posisi user */}
          <Circle
            center={[userPosition.lat, userPosition.lng]}
            radius={2000}
            pathOptions={{
              color: '#2196F3',
              fillColor: '#2196F3',
              fillOpacity: 0.08,
              weight: 1,
              dashArray: '5, 5',
            }}
          />
        </>
      )}

      {/* --- Marker Zona Ikan --- */}
      {/* Setiap marker menunjukkan titik potensial ikan */}
      {/* TODO: Data marker akan diambil dari API Copernicus Marine Service */}
      {fishZones.map((zone) => (
        <Marker
          key={zone.id}
          position={[zone.latitude, zone.longitude]}
          icon={getFishIcon(zone.fish_type)}
          eventHandlers={{
            click: () => onMarkerClick(zone),
          }}
        >
          <Popup>
            <div style={{
              fontFamily: 'Outfit, sans-serif',
              padding: '8px',
              minWidth: '200px',
            }}>
              <strong style={{ fontSize: '1.1rem' }}>
                {FISH_TYPES.find(f => f.id === zone.fish_type)?.icon}{''}
                {FISH_TYPES.find(f => f.id === zone.fish_type)?.name}
              </strong>
              <hr style={{ border: 'none', borderTop: '1px solid #555', margin: '8px 0' }}/>
              <p style={{ margin: '4px 0' }}>{zone.latitude.toFixed(4)}°, {zone.longitude.toFixed(4)}°</p>
              <p style={{ margin: '4px 0' }}>Potensi: <strong style={{ color: '#FF471D' }}>{zone.potential_score}%</strong></p>
              <p style={{ margin: '4px 0' }}>SST: {zone.sst}°C</p>
              {userPosition && (
                <p style={{ margin: '4px 0' }}>
                  Jarak: {formatDistance(calculateDistance(
                    userPosition.lat, userPosition.lng,
                    zone.latitude, zone.longitude
                  ))}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* --- Rute Navigasi (garis dash bergerak) --- */}
      {/* Ditampilkan saat nelayan menekan "Menuju ke Titik Ini" */}
      {routeLine && (
        <Polyline
          positions={routeLine}
          pathOptions={{
            color: '#FF471D',
            weight: 3,
            dashArray: '10, 10',
            opacity: 0.8,
          }}
        />
      )}
    </MapContainer>
    </div>
  );
}