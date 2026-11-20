import Link from "next/link";
import { ArrowRight, Camera, Check, MessageCircle, Sparkles } from "lucide-react";

export default function LandingPage() {
  const waNumber = process.env.NEXT_PUBLIC_WA_BOT_NUMBER || "6281234567890";
  const waStartLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    "Halo Sehatia, saya mau mulai hitung kalori harian!"
  )}`;

  return (
    <div className="min-h-screen">
      {/* Frosted Glass Navbar ala Apple */}
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-xs font-bold text-white shadow-sm">
              S
            </div>
            <span className="text-[17px] font-semibold tracking-tight">
              Sehatia
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[#6E6E73] transition hover:text-[#1D1D1F]"
            >
              Masuk Dashboard
            </Link>
            <a
              href={waStartLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#1D1D1F] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-black/80"
            >
              Coba Gratis
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-16 sm:pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3.5 py-1 text-xs font-medium text-[#6E6E73] shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span>Didukung AI Vision + Standar Nutrisi Indonesia</span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-[#1D1D1F] sm:text-6xl sm:leading-[1.08]">
            Jaga pola makan.
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Semudah kirim foto.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#6E6E73] sm:text-lg">
            Tanpa instal aplikasi berat. Cukup foto nasi padang, kopi susu, atau
            menu dietmu ke WhatsApp Sehatia—kalori dan makronutrisi langsung
            tercatat rapi di dashboard.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={waStartLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              Mulai Trial Gratis di WhatsApp
            </a>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-7 py-3.5 text-sm font-medium text-[#1D1D1F] transition hover:bg-black/[0.02] sm:w-auto"
            >
              Buka Web Dashboard
              <ArrowRight className="h-4 w-4 text-[#6E6E73]" />
            </Link>
          </div>
        </div>

        {/* Bento Feature Grid ala Apple */}
        <section className="mt-20 grid gap-5 sm:grid-cols-3">
          <div className="rounded-[28px] border border-black/[0.05] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">
              Kenali Masakan Lokal
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">
              Memahami porsi nasi warteg, ayam geprek, rendang, hingga takaran
              gula minuman kekinian berdasarkan standar TKPI Kemenkes.
            </p>
          </div>

          <div className="rounded-[28px] border border-black/[0.05] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">
              Revisi Lewat Balasan Chat
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">
              Porsi kurang pas? Cukup balas &ldquo;nasinya cuma setengah&rdquo;
              di WhatsApp, dan AI langsung memperbarui hitungan kalorimu.
            </p>
          </div>

          <div className="rounded-[28px] border border-black/[0.05] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">
              Ringkasan Visual Jernih
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">
              Pantau sisa kalori, target protein harian, dan tren 7 hari terakhir
              dalam antarmuka bersih yang bebas distraksi.
            </p>
          </div>
        </section>

        {/* Pricing Card */}
        <section className="mx-auto mt-20 max-w-3xl rounded-[32px] border border-black/[0.05] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:p-12">
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Sehatia Pro
              </span>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Investasi sehat lebih hemat dari segelas kopi.
              </h2>
              <ul className="mt-5 space-y-2.5 text-sm text-[#6E6E73]">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Hingga 15x analisis foto & teks makanan setiap hari
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Koreksi porsi otomatis langsung lewat balasan chat WA
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Akses penuh grafik kalori & makronutrisi di Web Dashboard
                </li>
              </ul>
            </div>

            <div className="shrink-0 rounded-3xl bg-[#F5F5F7] p-6 text-center sm:w-64">
              <p className="text-xs font-medium text-[#6E6E73]">Mulai dari</p>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold tracking-tight">
                  Rp39.000
                </span>
                <span className="text-xs text-[#6E6E73]">/bulan</span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-700">
                Gratis Trial 3 Hari saat pertama chat
              </p>
              <a
                href={waStartLink}
                target="_blank"
                rel="noreferrer"
                className="mt-5 block w-full rounded-full bg-[#1D1D1F] py-3 text-xs font-semibold text-white transition hover:bg-black/80"
              >
                Coba Gratis Sekarang
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
