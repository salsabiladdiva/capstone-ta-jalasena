/* ================================================
   JALASENA - Chatbot (Gemini)
   ================================================ */

'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Chatbot.module.css';

const GREETING = {
  role: 'model',
  text: 'Halo! Saya asisten JALASENA. Tanyakan apa saja tentang zona ikan, navigasi, atau monitoring kapal.',
};

const SUGGESTIONS = [
  'Apa itu JALASENA?',
  'Bagaimana cara mendeteksi zona ikan?',
  'Kapan kapal dianggap bahaya?',
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const sessionRef = useRef(0); // penanda "sesi chat", naik setiap chat ditutup

  // Scroll otomatis ke pesan terbaru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  // Tutup chat sekaligus hapus semua percakapan
  function closeChat() {
    sessionRef.current += 1; // tandai bahwa sesi lama sudah berakhir
    setOpen(false);
    setMessages([GREETING]); // kembali ke sapaan awal
    setInput('');
    setLoading(false);
  }

  async function send(text) {
    const content = text.trim();
    if (!content || loading) return;

    const session = sessionRef.current; // ingat sesi saat pesan ini dikirim

    const next = [...messages, { role: 'user', text: content }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();

      // Kalau chat sudah ditutup selama menunggu jawaban, abaikan jawabannya
      if (session !== sessionRef.current) return;

      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.');
      setMessages([...next, { role: 'model', text: data.reply }]);
    } catch (err) {
      if (session !== sessionRef.current) return;
      setMessages([...next, { role: 'model', text: `${err.message}`, isError: true }]);
    } finally {
      if (session === sessionRef.current) setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Chatbot JALASENA">
          <div className={styles.header}>
            <div>
              <strong>Asisten JALASENA</strong>
              <span>Ditenagai Gemini</span>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={closeChat}
              aria-label="Tutup chat"
            >
              
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`${styles.bubble} ${m.role === 'user' ? styles.user : styles.bot} ${m.isError ? styles.error : ''}`}
              >
                {m.text}
              </div>
            ))}

            {messages.length === 1 && !loading && (
              <div className={styles.suggestions}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className={`${styles.bubble} ${styles.bot} ${styles.typing}`}>
                <span /><span /><span />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaan..."
              maxLength={1000}
              disabled={loading}
              aria-label="Pesan"
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Kirim" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className={styles.fab}
        onClick={() => (open ? closeChat() : setOpen(true))}
        aria-label={open ? 'Tutup chatbot' : 'Buka chatbot'}
        id="btn-chatbot"
      >
        {open ? (
          <span style={{ fontSize: '22px', lineHeight: 1 }}>&times;</span>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}