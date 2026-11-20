import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getJakartaDateString, getLastNDatesJakarta } from "@/lib/utils/date";
import { resolveEffectivePlan } from "@/lib/billing/quota";
import { FoodLog, UserProfile } from "@/types/sehatia";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", session.userId)
    .single();

  if (!user) {
    redirect("/login");
  }

  const typedUser = user as UserProfile;
  const effectivePlan = resolveEffectivePlan(typedUser);
  const last7Dates = getLastNDatesJakarta(7);
  const today = getJakartaDateString();

  const { data: logs } = await supabaseAdmin
    .from("food_logs")
    .select("*")
    .eq("user_id", typedUser.id)
    .gte("log_date", last7Dates[0])
    .order("created_at", { ascending: false });

  const typedLogs = (logs || []) as FoodLog[];

  const weeklySummary = last7Dates.map((dateStr) => {
    const dayCalories = typedLogs
      .filter((l) => l.log_date === dateStr)
      .reduce((sum, l) => sum + l.total_calories, 0);

    return {
      date: dateStr,
      label: new Date(`${dateStr}T00:00:00+07:00`).toLocaleDateString("id-ID", {
        weekday: "short",
      }),
      calories: dayCalories,
    };
  });

  return (
    <DashboardClient
      user={typedUser}
      effectivePlan={effectivePlan}
      today={today}
      logs={typedLogs}
      weeklySummary={weeklySummary}
    />
  );
}
