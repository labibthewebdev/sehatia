import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getJakartaDateString, getLastNDatesJakarta } from "@/lib/utils/date";
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

  const last7Dates = getLastNDatesJakarta(7);
  const startDate = last7Dates[0];
  const todayDate = getJakartaDateString();

  const { data: logs } = await supabaseAdmin
    .from("food_logs")
    .select("*")
    .eq("user_id", session.userId)
    .gte("log_date", startDate)
    .order("created_at", { ascending: false });

  return (
    <DashboardClient
      user={user as UserProfile}
      initialLogs={(logs || []) as FoodLog[]}
      last7Dates={last7Dates}
      todayDate={todayDate}
    />
  );
}
