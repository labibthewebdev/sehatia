import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  Flame,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Utensils,
} from "lucide-react";

export default function LandingPage() {
  const waNumber = process.env.NEXT_PUBLIC_WA_BOT_NUMBER || "6285720276493";
  const waStartLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    "Halo Sehatia, saya mau mulai hitung kalori harian!"
  )}`;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      {/* Frosted Glass Navbar ala Apple */}
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-xs font-bold text-white shadow-sm">
              S
            </div>
            <span className="text-[17px] font-semibold tracking-tight">
              Sehatia
            </span>
          </div>

          <nav className="hidden items-center gap-7 text-xs font-medium text-[#6E6E73] md:flex">
            <a href="#pola-makan" className="transition hover:text-[#1D1D1F]">
              Nutrisi & Diet
            </a>
            <a href="#cara-kerja" className="transition hover:text-[#1D1D1F]">
              Cara Kerja
            </a>
            <a href="#harga" className="transition hover:text-[#1D1D1F]">
              Sehatia Pro
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-medium text-[#6E6E73] transition hover:text-[#1D1D1F] sm:text-sm"
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

      <main className="overflow-hidden">
        {/* BAND 1: HERO — Video Background (/videos/hero-salad.mp4) + Scrim Kontras Tinggi */}
        <section className="relative border-b border-black/[0.08] bg-[#EEF7F2] pb-20 pt-14 sm:pt-20">
          <video
            src="/videos/hero-salad.mp4"
            poster="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=80"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-55"
          />
          {/* Scrim terang lembut agar teks gelap tetap kontras & tidak berantakan */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F4FBF7]/85 via-[#F7FCFA]/82 to-[#F5F5F7]/95 backdrop-blur-[2px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 top-10 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18),transparent_70%)] blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.16),transparent_70%)] blur-3xl"
          />

          <div className="relative z-10 mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-emerald-700/15 bg-white px-4 py-1.5 text-xs font-medium text-[#1D1D1F] shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>AI Nutritionist • Standar TKPI Kemenkes Indonesia</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Trial 3 Hari
                </span>
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-[#1D1D1F] sm:text-6xl sm:leading-[1.05]">
                Pola makan sehat.
                <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
                  Semudah kirim foto.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#6E6E73] sm:text-lg">
                Tanpa ribet timbang makanan atau instal aplikasi berat. Foto menu
                harianmu ke WhatsApp Sehatia—kalori, protein, dan progres dietmu
                langsung tersaji rapi.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={waStartLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(5,150,105,0.28)] transition hover:bg-emerald-700 sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  Mulai Trial Gratis di WhatsApp
                </a>
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-7 py-3.5 text-sm font-medium text-[#1D1D1F] shadow-sm transition hover:bg-black/[0.02] sm:w-auto"
                >
                  Lihat Web Dashboard
                  <ArrowRight className="h-4 w-4 text-[#6E6E73]" />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-[11px] font-medium text-[#6E6E73]">
                <span className="rounded-full border border-black/[0.07] bg-white px-3.5 py-1">
                  ✓ Cocok untuk masakan rumahan & warteg
                </span>
                <span className="rounded-full border border-black/[0.07] bg-white px-3.5 py-1">
                  ✓ Koreksi porsi lewat chat
                </span>
                <span className="rounded-full border border-black/[0.07] bg-white px-3.5 py-1">
                  ✓ Sinkron otomatis ke Dashboard
                </span>
              </div>
            </div>

            {/* VISUAL SHOWCASE */}
            <div className="mt-14 grid items-center gap-6 lg:grid-cols-12">
              <div className="rounded-[32px] border border-black/[0.07] bg-white p-6 shadow-[0_16px_44px_rgba(0,0,0,0.06)] lg:col-span-4">
                <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                      S
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Sehatia AI Bot</p>
                      <p className="text-[11px] text-emerald-600">
                        ● Online di WhatsApp
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#F5F5F7] px-2.5 py-1 text-[10px] font-semibold text-[#6E6E73]">
                    12:34 WIB
                  </span>
                </div>

                <div className="ml-auto mt-4 max-w-[85%] rounded-2xl rounded-tr-sm bg-[#DCF8C6] p-2.5 text-xs text-[#1D1D1F] shadow-sm">
                  <div className="relative h-32 w-full overflow-hidden rounded-xl">
                    <img
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                      alt="Salad dan Ayam Panggang Sehat"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-2 px-1 font-medium">
                    Makan siang hari ini, nasinya 1 centong aja
                  </p>
                </div>

                <div className="mt-3 max-w-[92%] rounded-2xl rounded-tl-sm border border-black/[0.05] bg-[#F5F5F7] p-3.5 text-xs leading-relaxed">
                  <p className="font-semibold text-emerald-700">
                    🍽️ Tercatat di Sehatia
                  </p>
                  <p className="mt-1 font-medium text-[#1D1D1F]">
                    Bowl Ayam Panggang, Alpukat & Nasi Putih
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="rounded-full bg-white px-2.5 py-0.5 font-semibold text-[#1D1D1F]">
                      🔥 485 kkal
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[#6E6E73]">
                      Protein 36g
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[#6E6E73]">
                      Lemak Sehat 18g
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Showcase Card: Tetap Gambar Sebelumnya */}
              <div className="relative overflow-hidden rounded-[36px] border border-black/[0.07] bg-white shadow-[0_22px_54px_rgba(0,0,0,0.1)] lg:col-span-4">
                <div className="relative h-[410px] w-full">
                  <img
                    src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85"
                    alt="Hidangan Sehat Seimbang"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                  <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-[11px] font-semibold text-[#1D1D1F] backdrop-blur-md">
                    <Camera className="h-3.5 w-3.5 text-emerald-600" />
                    <span>AI Vision Scan • 98% Akurat</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 rounded-3xl border border-white/20 bg-white/95 p-4 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium text-[#6E6E73]">
                          Balanced Diet Bowl
                        </p>
                        <p className="text-sm font-semibold text-[#1D1D1F]">
                          520 kkal • Tinggi Serat & Protein
                        </p>
                      </div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                        <Check className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-black/[0.07] bg-white p-6 shadow-[0_16px_44px_rgba(0,0,0,0.06)] lg:col-span-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#6E6E73]">
                      Target Defisit Kalori
                    </p>
                    <h3 className="text-base font-semibold">Ringkasan Hari Ini</h3>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Flame className="h-4 w-4" />
                  </div>
                </div>

                <div className="my-5 flex items-center gap-5">
                  <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
                    <svg className="h-28 w-28 -rotate-90 transform">
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke="#F5F5F7"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke="#10B981"
                        strokeWidth="10"
                        strokeDasharray="289"
                        strokeDashoffset="72"
                        strokeLinecap="round"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="33"
                        stroke="#F5F5F7"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="33"
                        stroke="#6366F1"
                        strokeWidth="8"
                        strokeDasharray="207"
                        strokeDashoffset="45"
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="block text-base font-bold leading-none">
                        75%
                      </span>
                      <span className="text-[10px] text-[#6E6E73]">Tercapai</span>
                    </div>
                  </div>

                  <div className="w-full space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between font-medium">
                        <span>Kalori</span>
                        <span className="text-emerald-700">1.350 / 1.800</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-[#F5F5F7]">
                        <div className="h-full w-3/4 rounded-full bg-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-medium">
                        <span>Protein</span>
                        <span className="text-indigo-600">96g / 120g</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-[#F5F5F7]">
                        <div className="h-full w-4/5 rounded-full bg-indigo-500" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-medium">
                        <span>Karbohidrat</span>
                        <span className="text-amber-600">130g / 180g</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-[#F5F5F7]">
                        <div className="h-full w-[72%] rounded-full bg-amber-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F5F5F7] px-4 py-3 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-[#1D1D1F]">
                    <TrendingDown className="h-4 w-4 text-emerald-600" />
                    Progres Minggu Ini
                  </span>
                  <span className="font-semibold text-emerald-700">-0.8 kg</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BAND 2: POLA MAKAN — Putih Crisp dengan Warm Mint Accent */}
        <section
          id="pola-makan"
          className="relative bg-gradient-to-b from-white via-[#F7FCFA] to-[#EBF7F2] py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16),transparent_70%)] blur-2xl"
          />

          <div className="relative mx-auto max-w-6xl px-6">
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="inline-block rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Pola Makan Nyata
                </span>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Diet tetap nikmat dengan makanan sehari-hari.
                </h2>
              </div>
              <p className="max-w-md text-sm text-[#6E6E73]">
                Dari menu sehat rumahan, sarapan tinggi protein, hingga masakan
                nusantara—AI Sehatia mengenali porsi dan kalori tersembunyi.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="group overflow-hidden rounded-[28px] border border-black/[0.07] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                    alt="Sarapan Tinggi Protein"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#1D1D1F] shadow-sm backdrop-blur">
                    Sarapan • 340 kkal
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-base font-semibold">
                    Roti Gandum, Telur & Alpukat
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#6E6E73]">
                    Kombinasi lemak sehat dan 22g protein untuk menahan lapar
                    lebih lama hingga jam makan siang.
                  </p>
                </div>
              </div>

              <div className="group overflow-hidden rounded-[28px] border border-black/[0.07] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80"
                    alt="Makan Siang Ayam Bakar"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#1D1D1F] shadow-sm backdrop-blur">
                    Makan Siang • 510 kkal
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-base font-semibold">
                    Dada Ayam Panggang & Sayur Segar
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#6E6E73]">
                    Tinggi protein (41g) untuk menjaga massa otot selama program
                    penurunan berat badan.
                  </p>
                </div>
              </div>

              <div className="group overflow-hidden rounded-[28px] border border-black/[0.07] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=800&q=80"
                    alt="Smoothie Bowl Buah"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#1D1D1F] shadow-sm backdrop-blur">
                    Camilan Sore • 260 kkal
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-base font-semibold">
                    Berry Yogurt & Chia Bowl
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#6E6E73]">
                    Pengganti minuman manis kekinian dengan kadar gula terkontrol
                    dan kaya antioksidan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BAND 3: CARA KERJA — Apple Dark Showcase Band */}
        <section
          id="cara-kerja"
          className="relative bg-[#141619] py-20 text-white"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-72 w-[680px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.2),transparent_70%)] blur-2xl"
          />

          <div className="relative mx-auto max-w-6xl px-6">
            <div className="mb-10 max-w-2xl">
              <span className="inline-block rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Alur Tanpa Ribet
              </span>
              <h2 className="mt-2.5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Tiga langkah singkat di chat harianmu.
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-[28px] border border-white/10 bg-[#1F2329] p-7 shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
                  <Camera className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  1. Kirim Foto ke WhatsApp
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  Foto makananmu sebelum makan atau ketik singkat menunya langsung
                  di chat WhatsApp Sehatia.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[#1F2329] p-7 shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-300">
                  <Utensils className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  2. Koreksi Porsi Instan
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  Cukup balas &ldquo;nasinya setengah&rdquo; atau &ldquo;tanpa
                  kulit&rdquo;, AI langsung menghitung ulang nutrisinya.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[#1F2329] p-7 shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  3. Pantau Grafik Harian
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  Lihat sisa kuota kalori, target protein, dan tren 7 hari di Web
                  Dashboard kapan saja.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BAND 4: PRICING — Soft Emerald & Warm Neutral Band */}
        <section
          id="harga"
          className="relative bg-gradient-to-b from-[#E6F4EE] via-[#F5F5F7] to-[#EAECEF] py-24"
        >
          <div className="mx-auto max-w-5xl px-6">
            <div className="rounded-[36px] border border-black/[0.07] bg-white p-8 shadow-[0_16px_42px_rgba(0,0,0,0.06)] sm:p-12">
              <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
                <div>
                  <span className="inline-block rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Sehatia Pro
                  </span>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Mulai hidup sehat dengan biaya lebih hemat dari segelas kopi.
                  </h2>
                  <ul className="mt-6 space-y-3 text-sm text-[#6E6E73]">
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600" />
                      Hingga 15x analisis foto & teks makanan setiap hari
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600" />
                      Koreksi porsi otomatis lewat balasan chat WhatsApp
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600" />
                      Akses penuh ring kalori & grafik makronutrisi harian
                    </li>
                  </ul>
                </div>

                <div className="shrink-0 rounded-[28px] border border-black/[0.06] bg-gradient-to-b from-[#F5F5F7] to-[#ECEEF2] p-7 text-center sm:w-72">
                  <p className="text-xs font-medium text-[#6E6E73]">Mulai dari</p>
                  <div className="mt-1 flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold tracking-tight">
                      Rp39.000
                    </span>
                    <span className="text-xs text-[#6E6E73]">/bulan</span>
                  </div>
                  <p className="mt-1.5 text-[11px] font-medium text-emerald-700">
                    Gratis Trial 3 Hari saat pertama chat
                  </p>
                  <a
                    href={waStartLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 block w-full rounded-full bg-[#1D1D1F] py-3.5 text-xs font-semibold text-white transition hover:bg-black/80"
                  >
                    Coba Gratis di WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
