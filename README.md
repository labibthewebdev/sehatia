# Sehatia — Pelacak Kalori & Nutrisi Cerdas via WhatsApp + Web Dashboard (Apple Style)

Paket lengkap proyek **Sehatia** menggunakan **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase + Google Gemini 2.5 Flash + Fonnte WhatsApp Gateway + Midtrans QRIS**.

## Cara Menjalankan Proyek

### 1. Setup Database Supabase
1. Buat project baru di [Supabase](https://supabase.com).
2. Buka menu **SQL Editor**, lalu jalankan seluruh isi file `supabase/schema.sql`.
3. Ambil `Project URL` dan `service_role` secret key dari menu **Project Settings → API**.

### 2. Konfigurasi Environment Variable
1. Salin file `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Isi semua variabel:
   - `NEXT_PUBLIC_SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY` dari Google AI Studio
   - `FONNTE_TOKEN` dari dashboard Fonnte
   - `MIDTRANS_SERVER_KEY` & `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` dari dashboard Midtrans
   - `JWT_SECRET` (isi teks acak minimal 32 karakter)

### 3. Install & Jalankan Secara Lokal
```bash
npm install
npm run dev
```
Buka `http://localhost:3000` di browser.

### 4. Konfigurasi Webhook (Setelah Deploy ke Vercel / Domain Publik)
1. **Fonnte Dashboard:**
   - Masuk ke **Device → Edit → Webhook URL**, isi dengan `https://domain-anda.id/api/webhook/fonnte`
   - Aktifkan **Webhook Media / URL** agar foto makanan yang dikirim user diteruskan ke server.
2. **Midtrans Dashboard:**
   - Masuk ke **Settings → Configuration → Payment Notification URL**, isi dengan `https://domain-anda.id/api/webhook/midtrans`
