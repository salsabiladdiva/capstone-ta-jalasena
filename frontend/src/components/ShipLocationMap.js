/* ================================================
   JALASENA - ShipLocationMap Component (Leaflet)
   ================================================
   Peta lokasi kapal untuk halaman Monitoring.
   - Base layer: OpenStreetMap & Esri Satellite (bisa diganti
     lewat kontrol layer di pojok kanan atas peta)
   - Marker langsung mengarah ke posisi kapal / titik bahaya
   - Marker merah + lingkaran saat kondisi BAHAYA
   - Peta otomatis mengikuti posisi kapal; tombol
     "Arahkan ke Kapal" muncul jika peta digeser manual

   PENTING: Komponen ini harus di-import secara dynamic
   dengan ssr: false karena Leaflet membutuhkan 'window'
   ================================================ */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, LayersControl, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG } from '@/lib/constants';

const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const ESRI_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const ESRI_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community';

// --- Icon marker kapal (aman = biru, bahaya = merah) ---
function buildShipIcon(isDanger) {
  const color = isDanger ? '#f44336' : '#2196F3';
  return L.divIcon({
    className: 'ship-marker',
    html: `
      <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:100%;height:100%;border-radius:50%;background:${color}66;animation:shipPulse 1.6s ease-out infinite;"></div>
        <div style="width:18px;height:18px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 0 14px ${color};position:relative;z-index:1;"></div>
      </div>
      <style>
        @keyframes shipPulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18],
  });
}

const SAFE_ICON = buildShipIcon(false);
const DANGER_ICON = buildShipIcon(true);

/**
 * Mengatur kamera peta:
 * - Fix posisi pertama -> langsung zoom ke posisi kapal
 * - Posisi berubah -> peta ikut bergeser (jika mode ikuti aktif)
 * - Berubah jadi BAHAYA -> terbang ke titik bahaya
 */
function MapController({ lat, lng, isDanger, follow, onUserDrag, onFollowChange }) {
  const map = useMap();
  const hasFix = useRef(false);
  const wasDanger = useRef(false);

  useMapEvents({ dragstart: onUserDrag });

  // Fix ukuran container (bug Leaflet saat container belum punya dimensi)
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  // Ikuti posisi kapal
  useEffect(() => {
    if (lat == null || lng == null) return;
    if (!hasFix.current) {
      hasFix.current = true;
      map.setView([lat, lng], 14, { animate: false });
      return;
    }
    if (follow) map.panTo([lat, lng], { animate: true });
  }, [lat, lng, follow, map]);

  // Arahkan ke titik bahaya saat status berubah jadi BAHAYA
  useEffect(() => {
    if (isDanger && !wasDanger.current && lat != null && lng != null) {
      onFollowChange(true);
      map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 1 });
    }
    wasDanger.current = isDanger;
  }, [isDanger, lat, lng, map, onFollowChange]);

  return null;
}

export default function ShipLocationMap({ position, isDanger = false, roll = 0, pitch = 0, shipName = 'Kapal' }) {
  const [follow, setFollow] = useState(true);
  const [mapInstance, setMapInstance] = useState(null);

  const lat = position ? position.lat : null;
  const lng = position ? position.lng : null;

  const handleUserDrag = useCallback(() => setFollow(false), []);

  const handleRecenter = useCallback(() => {
    setFollow(true);
    if (mapInstance && lat != null && lng != null) {
      mapInstance.flyTo([lat, lng], Math.max(mapInstance.getZoom(), 14), { duration: 0.8 });
    }
  }, [mapInstance, lat, lng]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        ref={setMapInstance}
        center={lat != null ? [lat, lng] : MAP_CONFIG.center}
        zoom={lat != null ? 14 : MAP_CONFIG.zoom}
        minZoom={3}
        maxZoom={18}
        style={{ width: '100%', height: '100%', minHeight: '240px' }}
        zoomControl={true}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer url={OSM_URL} attribution={OSM_ATTRIBUTION} maxZoom={19} />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Esri Satellite">
            <TileLayer url={ESRI_URL} attribution={ESRI_ATTRIBUTION} maxZoom={19} />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapController
          lat={lat}
          lng={lng}
          isDanger={isDanger}
          follow={follow}
          onUserDrag={handleUserDrag}
          onFollowChange={setFollow}
        />

        {position && (
          <>
            {isDanger && (
              <Circle
                center={[lat, lng]}
                radius={400}
                pathOptions={{ color: '#f44336', fillColor: '#f44336', fillOpacity: 0.15, weight: 2, dashArray: '6, 6' }}
              />
            )}
            <Marker position={[lat, lng]} icon={isDanger ? DANGER_ICON : SAFE_ICON}>
              <Popup>
                <div style={{ fontFamily: 'Outfit, sans-serif', padding: '4px', minWidth: '170px' }}>
                  <strong style={{ color: isDanger ? '#f44336' : undefined }}>
                    {isDanger ? 'TITIK BAHAYA' : 'Posisi Kapal'}
                  </strong>
                  <p style={{ margin: '4px 0' }}>{shipName}</p>
                  <p style={{ margin: '4px 0' }}>{lat.toFixed(6)}°, {lng.toFixed(6)}°</p>
                  <p style={{ margin: '4px 0' }}>Roll {roll.toFixed(1)}° / Pitch {pitch.toFixed(1)}°</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* Menunggu data posisi pertama */}
      {!position && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: '0.85rem',
            pointerEvents: 'none',
          }}
        >
          Menunggu data posisi kapal…
        </div>
      )}

      {/* Tombol kembali ke posisi kapal setelah peta digeser manual */}
      {position && !follow && (
        <button
          type="button"
          onClick={handleRecenter}
          style={{
            position: 'absolute', left: 10, bottom: 24, zIndex: 1000,
            padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: isDanger ? '#f44336' : '#FF471D', color: '#fff',
            fontSize: '0.78rem', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          Arahkan ke Kapal
        </button>
      )}
    </div>
  );
}