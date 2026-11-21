"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  LogOut,
  MessageCircle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { FoodLog, UserProfile } from "@/types/sehatia";

interface Props {
  user: UserProfile;
  initialLogs: FoodLog[];
  last7Dates: string[];
  todayDate: string;
}

export default function DashboardClient({
  user,
  initialLogs,
  last7Dates,
  todayDate,
}: Props) {
  const router = useRouter();
  const [logs, setLogs] = useState<FoodLog[]>(initialLogs);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const botNumber =
    process.env.NEXT_PUBLIC_WA_BOT_NUMBER || "6285720276493";
  const adminNumber =
    process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER || botNumber;

  const waChatLink = `https://wa.me/${botNumber}?text=${encodeURIComponent(
    "Halo Sehatia, saya mau catat makan hari ini"
  )}`;
  const waUpgradeLink = `https://wa.me/${adminNumber}?text=${encodeURIComponent(
    `Halo Admin Sehatia, saya mau upgrade ke Sehatia Pro untuk nomor ${user.phone_number}`
  )}`;

  const todayLogs = logs.filter((l) => l.log_date === todayDate);
  const totalCalories = todayLogs.reduce(
    (s, l) => s + Number(l.total_calories || 0),
    0
  );
  const totalProtein = todayLogs.reduce(
    (s, l) => s + Number(l.total_protein_g || 0),
    0
  );
  const totalCarbs = todayLogs.reduce(
    (s, l) => s + Number(l.total_carbs_g || 0),
    0
  );
  const totalFat = todayLogs.reduce(
    (s, l) => s + Number(l.total_fat_g || 0),
    0
  );

  const calPct = Math.min(
    100,
    Math.round((totalCalories / Math.max(1, user.daily_calorie_target)) * 100)
  );

  const effectivePlan =
    user.plan_tier === "trial" &&
    user.trial_ends_at &&
    new Date(user.trial_ends_at) < new Date()
      ? "free"
      : user.plan_tier;

  async function handleDeleteLog(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/logs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLogs((prev) => prev.filter((item) => item.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-20 text-[#1D1D1F]">
      {/* Apple Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-xs font-bold text-white">
              S
            </div>
            <span className="text-[17px] font-semibold tracking-tight">
              Sehatia
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${
                effectivePlan === "pro"
                  ? "bg-emerald-50 text-emerald-700"
                  : effectivePlan === "trial"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-black/5 text-[#6E6E73]"
              }`}
            >
              {effectivePlan === "pro"
                ? "Pro"
                : effectivePlan === "trial"
                ? "Trial 3 Hari"
                : "Free"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={waChatLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Catat via WA
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-[#6E6E73] transition hover:text-[#1D1D1F]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 pt-8">
        {/* Header Sambutan */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium text-[#6E6E73]">
              Nomor Terhubung: +{user.phone_number}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Ringkasan Nutrisi Hari Ini
            </h1>
          </div>

          {effectivePlan !== "pro" && (
            <a
              href={waUpgradeLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#1D1D1F] px-4 py-2 text-xs font-semibold text-white transition hover:bg-black/80"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              Upgrade Sehatia Pro (Rp39rb/bln)
            </a>
          )}
        </div>

        {/* Kartu Ringkasan Kalori & Makro */}
        <div className="grid gap-5 md:grid-cols-12">
          <div className="rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] md:col-span-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6E6E73]">
                Asupan Kalori
              </span>
              <Flame className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">
                {totalCalories.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-[#6E6E73]">
                / {user.daily_calorie_target.toLocaleString("id-ID")} kkal
              </span>
            </div>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#F5F5F7]">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${calPct}%` }}
              />
            </div>
            <p className="mt-2.5 text-xs text-[#6E6E73]">
              {user.daily_calorie_target - totalCalories >= 0
                ? `Tersisa ${(
                    user.daily_calorie_target - totalCalories
                  ).toLocaleString("id-ID")} kkal lagi hari ini.`
                : `Melebihi target ${Math.abs(
                    user.daily_calorie_target - totalCalories
                  ).toLocaleString("id-ID")} kkal.`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 md:col-span-7">
            <div className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <p className="text-xs font-medium text-[#6E6E73]">Protein</p>
              <p className="mt-2 text-2xl font-bold text-indigo-600">
                {Math.round(totalProtein)}g
              </p>
              <p className="mt-1 text-[11px] text-[#6E6E73]">
                Target {user.daily_protein_target_g}g
              </p>
            </div>

            <div className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <p className="text-xs font-medium text-[#6E6E73]">Karbohidrat</p>
              <p className="mt-2 text-2xl font-bold text-amber-600">
                {Math.round(totalCarbs)}g
              </p>
              <p className="mt-1 text-[11px] text-[#6E6E73]">
                Target {user.daily_carbs_target_g}g
              </p>
            </div>

            <div className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <p className="text-xs font-medium text-[#6E6E73]">Lemak</p>
              <p className="mt-2 text-2xl font-bold text-rose-600">
                {Math.round(totalFat)}g
              </p>
              <p className="mt-1 text-[11px] text-[#6E6E73]">
                Target {user.daily_fat_target_g}g
              </p>
            </div>
          </div>
        </div>

        {/* Grafik 7 Hari Terakhir */}
        <div className="rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <h2 className="text-base font-semibold">Tren Kalori 7 Hari Terakhir</h2>
          <div className="mt-6 grid grid-cols-7 items-end gap-3 h-40">
            {last7Dates.map((d) => {
              const daySum = logs
                .filter((l) => l.log_date === d)
                .reduce((s, l) => s + Number(l.total_calories || 0), 0);
              const heightPct = Math.min(
                100,
                Math.max(
                  6,
                  Math.round(
                    (daySum / Math.max(1, user.daily_calorie_target)) * 100
                  )
                )
              );
              const isToday = d === todayDate;

              return (
                <div key={d} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-medium text-[#6E6E73]">
                    {daySum > 0 ? daySum : "-"}
                  </span>
                  <div className="flex h-24 w-full items-end justify-center rounded-xl bg-[#F5F5F7] p-1">
                    <div
                      className={`w-full rounded-lg transition-all ${
                        isToday ? "bg-emerald-500" : "bg-emerald-500/40"
                      }`}
                      style={{ height: `${daySum > 0 ? heightPct : 6}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-[#6E6E73]">
                    {d.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daftar Makanan Hari Ini */}
        <div className="rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <h2 className="text-base font-semibold">Catatan Makanan Hari Ini</h2>

          {todayLogs.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-[#F5F5F7] p-8 text-center">
              <p className="text-sm font-medium text-[#1D1D1F]">
                Belum ada makanan tercatat hari ini.
              </p>
              <p className="mt-1 text-xs text-[#6E6E73]">
                Kirim foto atau nama makanan ke bot WhatsApp Sehatia untuk mulai
                mencatat.
              </p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-black/[0.05]">
              {todayLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold">{log.meal_summary}</p>
                    <p className="mt-0.5 text-xs text-[#6E6E73]">
                      {log.total_calories} kkal • Protein{" "}
                      {Math.round(Number(log.total_protein_g))}g • Karbo{" "}
                      {Math.round(Number(log.total_carbs_g))}g • Lemak{" "}
                      {Math.round(Number(log.total_fat_g))}g
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    disabled={deletingId === log.id}
                    aria-label="Hapus catatan"
                    className="rounded-full p-2 text-[#6E6E73] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
