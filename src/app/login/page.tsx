"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MessageCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengirim kode OTP.");
      } else {
        setNormalizedPhone(data.phone);
        setStep("otp");
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kode OTP tidak valid.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Gagal memverifikasi OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#F5F5F7] px-6 py-8">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6E73] transition hover:text-[#1D1D1F]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Beranda
        </Link>
      </div>

      <div className="mx-auto w-full max-w-md rounded-[32px] border border-black/[0.06] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] sm:p-10">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-xs font-bold text-white">
            S
          </div>
          <span className="text-lg font-semibold tracking-tight">Sehatia</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          {step === "phone" ? "Masuk ke Dashboard" : "Masukkan Kode OTP"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">
          {step === "phone"
            ? "Tanpa kata sandi. Kami akan mengirimkan kode 6 digit langsung ke WhatsApp Anda."
            : `Kode 6 digit telah dikirim ke WhatsApp ${normalizedPhone}.`}
        </p>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6E6E73]">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                required
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-[#F5F5F7] px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1D1D1F] py-3.5 text-xs font-semibold text-white transition hover:bg-black/85 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              Kirim Kode OTP ke WhatsApp
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6E6E73]">
                Kode OTP (6 Digit)
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-2xl border border-black/10 bg-[#F5F5F7] px-4 py-3 text-center text-lg font-semibold tracking-[0.35em] outline-none transition focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-3.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Verifikasi & Buka Dashboard
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError("");
              }}
              className="w-full text-center text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F]"
            >
              Ganti nomor WhatsApp
            </button>
          </form>
        )}
      </div>

      <p className="text-center text-[11px] text-[#6E6E73]">
        Sehatia AI Nutritionist • Terhubung otomatis dengan bot WhatsApp Anda
      </p>
    </div>
  );
}
