/* ================================================
   JALASENA - Monitoring Chart Component
   ================================================
   Komponen grafik real-time untuk menampilkan data
   kemiringan kapal. Menggunakan Recharts library.
   
   Sumbu X: Waktu (timestamp)
   Sumbu Y: Derajat kemiringan kapal
   
   Fitur:
   - Garis threshold peringatan (15°) dan bahaya (30°)
   - Auto-scroll ke data terbaru
   - Animasi transisi smooth saat data baru masuk
   - Area fill di bawah garis untuk visualisasi
   
   Data kemiringan kapal didapat dari sensor
   accelerometer/gyroscope yang terpasang di kapal,
   dikirim via IoT ke backend, lalu di-broadcast
   via WebSocket ke dashboard ini.
   ================================================ */

'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';

/**
 * Custom Tooltip Component
 * Menampilkan info detail saat hover di grafik
 */
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const tilt = payload[0].value;
    let statusColor = '#4caf50';
    let statusText = 'Aman';

    if (tilt >= 30) {
      statusColor = '#f44336';
      statusText = 'BAHAYA';
    } else if (tilt >= 15) {
      statusColor = '#ff9800';
      statusText = 'Waspada';
    }

    return (
      <div style={{
        background: 'rgba(33, 33, 33, 0.95)',
        border: '1px solid #424242',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '0.85rem',
        fontFamily: 'Outfit, sans-serif',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}>
        <p style={{ color: '#9e9e9e', marginBottom: '6px' }}>⏰ {label}</p>
        <p style={{ color: '#FF471D', fontWeight: 700, fontSize: '1.1rem' }}>
          {tilt?.toFixed(1)}°
        </p>
        <p style={{ color: statusColor, fontWeight: 600, fontSize: '0.8rem', marginTop: '4px' }}>
          Status: {statusText}
        </p>
      </div>
    );
  }
  return null;
}

/**
 * MonitoringChart - Grafik Kemiringan Kapal Real-time
 * 
 * @param {Array} data - Array data telemetry [{time, tilt_degree, ...}]
 * @param {number} warningThreshold - Batas peringatan dalam derajat (15°)
 * @param {number} dangerThreshold - Batas bahaya dalam derajat (30°)
 */
export default function MonitoringChart({
  data = [],
  warningThreshold = 15,
  dangerThreshold = 30,
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
        {/* Grid background */}
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.06)"
          vertical={false}
        />

        {/* Sumbu X - Waktu */}
        <XAxis
          dataKey="time"
          stroke="#616161"
          tick={{ fill: '#757575', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#424242' }}
          interval="preserveStartEnd"
        />

        {/* Sumbu Y - Derajat Kemiringan */}
        <YAxis
          stroke="#616161"
          tick={{ fill: '#757575', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#424242' }}
          domain={[0, 45]}
          ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45]}
          label={{
            value: 'Derajat (°)',
            angle: -90,
            position: 'insideLeft',
            style: { fill: '#757575', fontSize: 11 },
          }}
        />

        {/* Tooltip custom */}
        <Tooltip content={<CustomTooltip />} />

        {/* --- Garis threshold PERINGATAN (15°) --- */}
        {/* Garis putus-putus kuning menandakan batas peringatan */}
        <ReferenceLine
          y={warningThreshold}
          stroke="#ff9800"
          strokeDasharray="8 4"
          strokeWidth={1.5}
          label={{
            value: 'Peringatan',
            position: 'right',
            fill: '#ff9800',
            fontSize: 10,
          }}
        />

        {/* --- Garis threshold BAHAYA (30°) --- */}
        {/* Garis putus-putus merah menandakan batas bahaya */}
        <ReferenceLine
          y={dangerThreshold}
          stroke="#f44336"
          strokeDasharray="8 4"
          strokeWidth={1.5}
          label={{
            value: 'Bahaya',
            position: 'right',
            fill: '#f44336',
            fontSize: 10,
          }}
        />

        {/* --- Area fill di bawah garis --- */}
        {/* Memberikan efek visual area di bawah garis kemiringan */}
        <defs>
          <linearGradient id="tiltGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF471D" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#FF471D" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="tilt_degree"
          stroke="none"
          fill="url(#tiltGradient)"
          fillOpacity={1}
          isAnimationActive={false}
        />

        {/* --- Garis utama kemiringan kapal --- */}
        {/* Animasi smooth saat data baru masuk */}
        <Line
          type="monotone"
          dataKey="tilt_degree"
          stroke="#FF471D"
          strokeWidth={2.5}
          dot={false}
          activeDot={{
            r: 6,
            fill: '#FF471D',
            stroke: '#fff',
            strokeWidth: 2,
          }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}