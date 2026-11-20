"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  Flame,
  LogOut,
  MessageCircle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { FoodLog, UserProfile } from "@/types/sehatia";

interface Props {
  user: UserProfile;
  effectivePlan: "pro" | "trial" | "free";
  today: string;
  logs: FoodLog[];
  weeklySummary: Array<{ date: string; label: string; calories: number }>;
}

export default function DashboardClient({
  user,
  effectivePlan,
  today,
  logs,
  weeklySummary,
}: Props) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(today);

  const dayLogs = logs.filter((l) => l.log_date === selectedDate);

  const totalCalories = dayLogs.reduce((s, l) => s + l.total_calories, 0);
  const totalProtein = dayLogs.reduce((s, l) => s + Number(l.total_protein_g), 0);
  const totalCarbs = dayLogs.reduce((s, l) => s + Number(l.total_carbs_g), 0);
  const totalFat = dayLogs.reduce((s, l) => s + Number(l.total_fat_g), 0);

  const calorieProgress = Math.min(
    100,
    Math.round((totalCalories / user.daily_calorie_target) * 100)
  );
  const remaining = user.daily_calorie_target - totalCalories;

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (calorieProgress / 100) * circumference;

  const waNumber = process.env.NEXT_PUBLIC_WA_BOT_NUMBER || "6282129249128";
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER || waNumber;

  const waQuickLogUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    "Catat makan hari ini: "
  )}`;

  function handleUpgrade(planLabel: string) {
    const msg = `Halo Admin Sehatia, saya mau upgrade akun (${user.phone_number}) ke paket ${planLabel}.`;
    window.open(
      `https://wa.me/${adminWa}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  }

  async function handleDeleteLog(id: string) {
    await fetch(`/api/logs/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const maxWeeklyCal = Math.max(
    user.daily_calorie_target,
    ...weeklySummary.map((d) => d.calories)
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Apple Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-xs font-bold text-white">
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
              href={waQuickLogUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Catat via WA
            </a>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="rounded-full p-2 text-[#6E6E73] transition hover:bg-black/5 hover:text-[#1D1D1F]"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-8">
        {/* Banner Upgrade jika bukan Pro */}
        {effectivePlan !== "pro" && (
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-[24px] border border-emerald-500/20 bg-gradient-to-r from-emerald-50/90 to-teal-50/80 p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <Crown className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1D1D1F]">
                  Upgrade ke Sehatia Pro
                </h2>
                <p className="text-xs text-[#6E6E73]">
                  Analisis foto makanan hingga 15x/hari tanpa batas dan riwayat
                  grafik lengkap.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => handleUpgrade("Sehatia Pro 1 Bulan (Rp39.000)")}
                className="rounded-full bg-[#1D1D1F] px-4 py-2 text-xs font-semibold text-white transition hover:bg-black/80"
              >
                Rp39rb / Bulan
              </button>
              <button
                onClick={() => handleUpgrade("Sehatia Pro 3 Bulan (Rp89.000)")}
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                Rp89rb / 3 Bulan
              </button>
            </div>
          </div>
        )}

        {/* Date Selector Pills */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#6E6E73]">Ringkasan Nutrisi</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {selectedDate === today ? "Hari Ini" : selectedDate}
            </h1>
          </div>

          <div className="flex gap-1.5 overflow-x-auto rounded-full border border-black/[0.06] bg-white p-1">
            {weeklySummary.map((day) => {
              const active = day.date === selectedDate;
              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-[#1D1D1F] text-white"
                      : "text-[#6E6E73] hover:text-[#1D1D1F]"
                  }`}
                >
                  {day.date === today ? "Hari Ini" : day.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid Utama: Ring Kalori & Makronutrisi */}
        <div className="grid gap-5 md:grid-cols-12">
          {/* Card 1: Apple Activity Ring Kalori */}
          <div className="flex flex-col justify-between rounded-[28px] border border-black/[0.05] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] md:col-span-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Kalori Harian</span>
              <Flame className="h-4 w-4 text-emerald-500" />
            </div>

            <div className="my-6 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <svg className="h-36 w-36 -rotate-90 transform">
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke="#F5F5F7"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke={remaining >= 0 ? "#10B981" : "#F59E0B"}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-2xl font-bold tracking-tight">
                    {totalCalories}
                  </div>
                  <div className="text-[11px] text-[#6E6E73]">
                    / {user.daily_calorie_target} kkal
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F5F5F7] px-4 py-3 text-center text-xs">
              {remaining >= 0 ? (
                <span>
                  Tersisa <strong className="text-emerald-700">{remaining} kkal</strong>{" "}
                  untuk mencapai target harian
                </span>
              ) : (
                <span>
                  Melebihi target harian sebesar{" "}
                  <strong className="text-amber-600">
                    +{Math.abs(remaining)} kkal
                  </strong>
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Makronutrisi & Tren 7 Hari */}
          <div className="flex flex-col justify-between rounded-[28px] border border-black/[0.05] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] md:col-span-7">
            <div>
              <span className="text-sm font-semibold">Makronutrisi</span>
              <div className="mt-5 space-y-4">
                {/* Protein */}
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-medium">Protein</span>
                    <span className="text-[#6E6E73]">
                      <strong className="text-[#1D1D1F]">
                        {Math.round(totalProtein)}g
                      </strong>{" "}
                      / {user.daily_protein_target_g}g
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F5F5F7]">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (totalProtein / user.daily_protein_target_g) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Karbohidrat */}
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-medium">Karbohidrat</span>
                    <span className="text-[#6E6E73]">
                      <strong className="text-[#1D1D1F]">
                        {Math.round(totalCarbs)}g
                      </strong>{" "}
                      / {user.daily_carbs_target_g}g
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F5F5F7]">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (totalCarbs / user.daily_carbs_target_g) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Lemak */}
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-medium">Lemak</span>
                    <span className="text-[#6E6E73]">
                      <strong className="text-[#1D1D1F]">
                        {Math.round(totalFat)}g
                      </strong>{" "}
                      / {user.daily_fat_target_g}g
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F5F5F7]">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (totalFat / user.daily_fat_target_g) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Bar Chart 7 Hari */}
            <div className="mt-7 border-t border-black/[0.06] pt-5">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="font-semibold">Konsistensi 7 Hari</span>
                <span className="text-[#6E6E73]">
                  Target: {user.daily_calorie_target} kkal
                </span>
              </div>
              <div className="grid grid-cols-7 items-end gap-2 h-20">
                {weeklySummary.map((d) => {
                  const pct = Math.min(
                    100,
                    Math.round((d.calories / maxWeeklyCal) * 100)
                  );
                  return (
                    <div
                      key={d.date}
                      className="flex h-full flex-col items-center justify-end gap-1.5"
                    >
                      <div className="flex w-full flex-1 items-end justify-center">
                        <div
                          style={{ height: `${Math.max(8, pct)}%` }}
                          className={`w-full max-w-[26px] rounded-t-lg transition-all ${
                            d.date === selectedDate
                              ? "bg-emerald-500"
                              : "bg-black/10"
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-[#6E6E73]">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Riwayat Makanan Harian */}
        <section className="mt-6 rounded-[28px] border border-black/[0.05] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold">Catatan Makanan</h2>
            <span className="text-xs text-[#6E6E73]">
              {dayLogs.length} entri tercatat
            </span>
          </div>

          {dayLogs.length === 0 ? (
            <div className="rounded-2xl bg-[#F5F5F7] py-12 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-[#6E6E73]" />
              <p className="mt-2 text-sm font-medium">
                Belum ada catatan makan pada tanggal ini
              </p>
              <p className="mt-1 text-xs text-[#6E6E73]">
                Kirim foto makananmu ke WhatsApp Sehatia untuk mencatat otomatis.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.06]">
              {dayLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">
                        {log.meal_summary}
                      </h3>
                      <span className="rounded-full bg-[#F5F5F7] px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        {log.total_calories} kkal
                      </span>
                    </div>

                    <p className="text-xs text-[#6E6E73]">
                      {log.items
                        .map((i) => `${i.name} (${i.estimated_portion})`)
                        .join(" • ")}
                    </p>

                    <div className="flex gap-3 pt-1 text-[11px] font-medium text-[#6E6E73]">
                      <span>Protein: {log.total_protein_g}g</span>
                      <span>Karbo: {log.total_carbs_g}g</span>
                      <span>Lemak: {log.total_fat_g}g</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    title="Hapus catatan"
                    className="rounded-full p-2 text-[#6E6E73] transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
