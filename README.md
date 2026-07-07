# 🌊 JALASENA - Panduan Menjalankan Program

Aplikasi **JALASENA** (Sistem Prediksi Zona Penangkapan Ikan dan Pemantauan Kapal Real-Time) terdiri dari dua bagian utama:
1. **Backend**: Menggunakan Python dengan Django, Django REST Framework (DRF), dan Django Channels (WebSockets).
2. **Frontend**: Menggunakan JavaScript/React dengan Next.js.

Ikuti langkah-langkah di bawah ini untuk menjalankan seluruh aplikasi secara lokal.

---

## 🛠️ Prasyarat (Prerequisites)

Sebelum mulai, pastikan Anda telah menginstal perangkat lunak berikut:
- **Python (versi 3.8 - 3.11)**
- **Node.js (versi 18 ke atas) & npm**

---

## 🐍 1. Menjalankan Backend (Django)

### Langkah 1: Buka Terminal di Folder Backend
```bash
cd backend
```

### Langkah 2: Buat & Aktifkan Virtual Environment
Sangat disarankan untuk menggunakan *virtual environment* agar dependensi terisolasi:
- **Windows (PowerShell):**
  ```powershell
  python -m venv venv
  .\venv\Scripts\activate
  ```
- **macOS / Linux:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

### Langkah 3: Instal Dependensi Python
Instal package yang dibutuhkan dari `requirements.txt`:
```bash
pip install -r requirements.txt
```

### Langkah 4: Konfigurasi Environment (`.env`)
1. Salin file `.env.example` menjadi `.env`:
   - **Windows:** `copy .env.example .env`
   - **macOS/Linux:** `cp .env.example .env`
2. **Catatan Penting Database:**
   - Secara default, program telah dimodifikasi agar **otomatis menggunakan SQLite** (`db.sqlite3` lokal) jika tidak ada konfigurasi database PostgreSQL/Supabase yang valid. Ini memudahkan Anda untuk langsung menjalankan program tanpa setup database tambahan!
   - Jika ingin menghubungkan ke database **Supabase / PostgreSQL**, buka file `.env` dan masukkan kredensial database Anda pada variabel `SUPABASE_DB_...`.

### Langkah 5: Buat Migrasi & Migrasikan Database
Karena folder migrasi belum disertakan secara default, buat file migrasi dan lakukan migrasi skema database dengan menjalankan:
```bash
python manage.py makemigrations fish_zones ships monitoring
python manage.py migrate
```

### Langkah 6: Masukkan Data Dummy (Seed Data)
Isi database dengan data awal (spesies ikan, zona potensial, dan kapal simulasi):
```bash
python seed_data.py
```
*(atau menggunakan command Django: `python manage.py seed_data`)*

### Langkah 7: Jalankan Server Backend
Jalankan server pengembangan Django:
```bash
python manage.py runserver
```
Backend akan berjalan di **`http://127.0.0.1:8000`**.

---

## 🌐 2. Menjalankan Frontend (Next.js)

### Langkah 1: Buka Terminal Baru di Folder Frontend
```bash
cd frontend
```

### Langkah 2: Instal Dependensi Node.js
Instal paket Node.js yang diperlukan:
```bash
npm install
```

### Langkah 3: Jalankan Server Pengembangan Frontend
Mulai server pengembangan Next.js:
```bash
npm run dev
```

Frontend akan berjalan di **`http://localhost:3000`**. Buka tautan ini di browser Anda untuk menggunakan aplikasi JALASENA.

---

## 📡 Integrasi & Fitur Utama

- **Peta Interaktif:** Menampilkan peta perairan Indonesia dengan zona potensial penangkapan ikan berdasarkan SST (Suhu Permukaan Laut) dan Klorofil-a.
- **Pemantauan Real-time (WebSockets):** Status pergerakan kapal dan derajat kemiringan (akselerometer) kapal dikirim secara berkala.
- **Peringatan Keselamatan AI:** Jika sensor mendeteksi kemiringan kapal > 30 derajat, notifikasi bahaya (DANGER) akan dikirimkan secara real-time guna mencegah kapal terbalik.
