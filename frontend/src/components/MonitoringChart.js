/* ================================================
   JALASENA - Monitoring Chart Component
   ================================================
   Grafik real-time kemiringan kapal (Roll & Pitch).
   Menggunakan Recharts.

   Sumbu X: Waktu
   Sumbu Y: Derajat kemiringan (nilai absolut)

   Garis batas:
   - Roll  : 20°
   - Pitch : 15°
   Bahaya jika |roll| >= 20° ATAU |pitch| >= 15°
   ================================================ */

'use client';

import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ComposedChart,
} from 'recharts';

/**
 * Custom Tooltip - info detail saat hover di grafik
 */
function CustomTooltip({ active, payload, label, rollThreshold, pitchThreshold }) {
  if (active && payload && payload.length) {
    const p = payload[0].payload;
    const isDanger =
      Math.abs(p.roll) >= rollThreshold || Math.abs(p.pitch) >= pitchThreshold;

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
        <p style={{ color: '#FF471D', fontWeight: 700 }}>
          Roll: {Number(p.roll).toFixed(1)}°
        </p>
        <p style={{ color: '#29b6f6', fontWeight: 700 }}>
          Pitch: {Number(p.pitch).toFixed(1)}°
        </p>
        <p style={{
          color: isDanger ? '#f44336' : '#4caf50',
          fontWeight: 600,
          fontSize: '0.8rem',
          marginTop: '4px',
        }}>
          Status: {isDanger ? 'BAHAYA' : 'Aman'}
        </p>
      </div>
    );
  }
  return null;
}

/**
 * MonitoringChart - Grafik Roll & Pitch Kapal Real-time
 *
 * @param {Array}  data           - [{time, roll, pitch, roll_abs, pitch_abs, ...}]
 * @param {number} rollThreshold  - Batas bahaya roll (20°)
 * @param {number} pitchThreshold - Batas bahaya pitch (15°)
 */
export default function MonitoringChart({
  data = [],
  rollThreshold = 20,
  pitchThreshold = 15,
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 65, left: 0, bottom: 10 }}>
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

        {/* Sumbu Y - Derajat */}
        <YAxis
          stroke="#616161"
          tick={{ fill: '#757575', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#424242' }}
          domain={[0, (dataMax) => Math.max(40, Math.ceil(dataMax / 10) * 10)]}
          label={{
            value: 'Derajat (°)',
            angle: -90,
            position: 'insideLeft',
            style: { fill: '#757575', fontSize: 11 },
          }}
        />

        <Tooltip
          content={
            <CustomTooltip
              rollThreshold={rollThreshold}
              pitchThreshold={pitchThreshold}
            />
          }
        />

        {/* Garis batas PITCH (15°) */}
        <ReferenceLine
          y={pitchThreshold}
          stroke="#ff9800"
          strokeDasharray="8 4"
          strokeWidth={1.5}
          label={{ value: 'Pitch', position: 'right', fill: '#ff9800', fontSize: 10 }}
        />

        {/* Garis batas ROLL (20°) */}
        <ReferenceLine
          y={rollThreshold}
          stroke="#f44336"
          strokeDasharray="8 4"
          strokeWidth={1.5}
          label={{ value: 'Roll', position: 'right', fill: '#f44336', fontSize: 10 }}
        />

        {/* Garis Roll */}
        <Line
          type="monotone"
          dataKey="roll_abs"
          stroke="#FF471D"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 6, fill: '#FF471D', stroke: '#fff', strokeWidth: 2 }}
          isAnimationActive={false}
        />

        {/* Garis Pitch */}
        <Line
          type="monotone"
          dataKey="pitch_abs"
          stroke="#29b6f6"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 6, fill: '#29b6f6', stroke: '#fff', strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}