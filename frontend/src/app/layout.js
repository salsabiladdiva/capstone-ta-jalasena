/* ================================================
   JALASENA - Root Layout
   ================================================
   Layout utama aplikasi yang membungkus semua halaman.
   Mengatur font, metadata SEO, dan struktur dasar.
   ================================================ */

import './globals.css';

// --- Metadata SEO ---
export const metadata = {
  title: 'JALASENA - Sistem Prediksi Wilayah Ikan & Peringatan Dini Kondisi Kapal',
  description: 'JALASENA adalah sistem terintegrasi yang membantu nelayan menemukan zona potensial ikan menggunakan data satelit Copernicus dan memantau kondisi keselamatan kapal secara real-time.',
  keywords: 'nelayan, prediksi ikan, zona ikan, monitoring kapal, keselamatan kapal, laut jawa, copernicus',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* Preconnect untuk performa font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
