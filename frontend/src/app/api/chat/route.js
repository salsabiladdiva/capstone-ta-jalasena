/* ================================================
   JALASENA - API Chat (Gemini)
   ================================================ */

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_MESSAGES = 12;   // riwayat percakapan yang dikirim ke Gemini
const MAX_CHARS = 1000;    // batas panjang tiap pesan

// Konteks yang membuat chatbot paham tentang JALASENA
const SYSTEM_PROMPT = `Kamu adalah asisten virtual JALASENA, sistem terintegrasi prediksi wilayah ikan dan peringatan dini kondisi kapal untuk nelayan Indonesia (fokus perairan Laut Jawa sekitar Semarang).

Tentang JALASENA:
- Deteksi Zona Ikan: peta interaktif zona potensial untuk ikan kembung, teri, dan tongkol berdasarkan data SST (suhu permukaan laut) dan klorofil-a dari satelit Copernicus Marine Service.
- Navigasi GPS: panduan menuju titik tangkapan dengan info jarak, kecepatan, dan notifikasi saat sampai.
- Monitoring Kapal: dashboard kemiringan kapal real-time dari sensor IoT. Kapal dinyatakan BAHAYA jika |roll| >= 20 derajat atau |pitch| >= 15 derajat, dan peringatan dini muncul agar kapal tidak terbalik.
- Login monitoring memakai Kode Kapal (contoh format: JLS-001).
- Halaman: /deteksi (deteksi zona ikan), /login (monitoring), /tutorial (panduan).

Aturan menjawab:
- Jawab dalam Bahasa Indonesia yang sederhana, ramah, dan singkat (maksimal sekitar 5 kalimat) kecuali diminta rinci.
- Fokus pada JALASENA, penangkapan ikan, cuaca laut, dan keselamatan melaut.
- Jangan mengarang fitur yang tidak disebutkan di atas. Jika tidak tahu, katakan terus terang.
- Untuk kondisi darurat di laut, sarankan segera menghubungi Basarnas (115) atau otoritas setempat.
- Tolak dengan sopan pertanyaan yang tidak berkaitan dan arahkan kembali ke topik JALASENA.`;

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'GEMINI_API_KEY belum diatur di frontend/.env.local' },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Format permintaan tidak valid.' }, { status: 400 });
  }

  // Bersihkan & batasi riwayat pesan dari klien
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const contents = messages
    .filter((m) => (m?.role === 'user' || m?.role === 'model') && typeof m.text === 'string' && m.text.trim())
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role,
      parts: [{ text: m.text.slice(0, MAX_CHARS) }],
    }));

  // Gemini mewajibkan percakapan diawali pesan user
  while (contents.length && contents[0].role !== 'user') contents.shift();

  if (!contents.length || contents[contents.length - 1].role !== 'user') {
    return Response.json({ error: 'Pesan kosong.' }, { status: 400 });
  }

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.6, maxOutputTokens: 600 },
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('[chat] Gemini error:', res.status, data?.error?.message);
      const msg =
        res.status === 429
          ? 'Terlalu banyak permintaan. Coba lagi sebentar lagi.'
          : 'Chatbot sedang bermasalah. Coba lagi nanti.';
      return Response.json({ error: msg }, { status: res.status === 429 ? 429 : 502 });
    }

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || '')
      .join('')
      .trim();

    if (!reply) {
      return Response.json({ reply: 'Maaf, aku tidak bisa menjawab itu. Coba tanyakan dengan cara lain ya.' });
    }

    return Response.json({ reply });
  } catch (err) {
    console.error('[chat] fetch gagal:', err);
    return Response.json({ error: 'Tidak bisa terhubung ke Gemini.' }, { status: 502 });
  }
}