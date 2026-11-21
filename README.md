# Sehatia — Pelacak Kalori & Nutrisi Cerdas via WhatsApp + Web Dashboard (Apple Style)

Paket lengkap proyek **Sehatia** menggunakan **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase + Google Gemini 2.5 Flash + Fonnte WhatsApp Gateway**.

## Cara Menjalankan Proyek

1. Salin `.env.example` menjadi `.env.local` lalu isi semua kredensial Anda (atau pertahankan `.env.local` Anda yang sudah terkonfigurasi).
2. Jalankan SQL di `supabase/schema.sql` pada SQL Editor Supabase (jika belum).
3. Jalankan:
   ```bash
   npm install
   npm run dev
   ```
4. Deploy ke Vercel (`https://sehatia-blush.vercel.app`) dan pasang Webhook URL di Fonnte:
   `https://sehatia-blush.vercel.app/api/webhook/fonnte`
