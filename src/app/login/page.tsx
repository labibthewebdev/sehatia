"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

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
        setStep("otp");
      }
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kode OTP tidak valid.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Gagal memverifikasi kode.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6E73] transition hover:text-[#1D1D1F]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Beranda
        </Link>

        <div className="rounded-[28px] border border-black/[0.06] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Masuk ke Sehatia
          </h1>
          <p className="mt-1.5 text-sm text-[#6E6E73]">
            {step === "phone"
              ? "Masukkan nomor WhatsApp yang terdaftar untuk menerima kode verifikasi."
              : `Kami telah mengirim 6 digit kode OTP ke WhatsApp ${phone}.`}
          </p>

          {error && (
            <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6E6E73]">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-black/10 bg-[#F5F5F7] px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1D1D1F] py-3.5 text-sm font-semibold text-white transition hover:bg-black/85 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Kirim Kode OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6E6E73]">
                  Kode OTP (6 Digit)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="mt-1.5 w-full rounded-2xl border border-black/10 bg-[#F5F5F7] px-4 py-3 text-center text-lg font-semibold tracking-[0.35em] outline-none transition focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Verifikasi & Masuk
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                }}
                className="w-full text-center text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F]"
              >
                Ganti nomor WhatsApp
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
