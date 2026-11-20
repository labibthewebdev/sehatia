import { UserProfile } from "@/types/sehatia";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getJakartaDateString } from "@/lib/utils/date";

export function resolveEffectivePlan(user: UserProfile): "pro" | "trial" | "free" {
  const now = new Date();
  if (
    user.plan_tier === "pro" &&
    user.plan_expires_at &&
    new Date(user.plan_expires_at) > now
  ) {
    return "pro";
  }
  if (
    user.plan_tier === "trial" &&
    user.trial_ends_at &&
    new Date(user.trial_ends_at) > now
  ) {
    return "trial";
  }
  return "free";
}

export async function checkUserQuota(user: UserProfile, hasImage: boolean) {
  const supabaseAdmin = getSupabaseAdmin();
  const effectivePlan = resolveEffectivePlan(user);
  const today = getJakartaDateString();

  const { count } = await supabaseAdmin
    .from("food_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("log_date", today);

  const usedToday = count ?? 0;

  if (effectivePlan === "pro") {
    const limit = 15;
    return {
      allowed: usedToday < limit,
      effectivePlan,
      usedToday,
      limit,
      reason: usedToday >= limit ? "daily_limit_pro" : null,
    };
  }

  if (effectivePlan === "trial") {
    const limit = 3;
    return {
      allowed: usedToday < limit,
      effectivePlan,
      usedToday,
      limit,
      reason: usedToday >= limit ? "daily_limit_trial" : null,
    };
  }

  if (hasImage) {
    return {
      allowed: false,
      effectivePlan: "free" as const,
      usedToday,
      limit: 1,
      reason: "photo_requires_pro",
    };
  }

  return {
    allowed: usedToday < 1,
    effectivePlan: "free" as const,
    usedToday,
    limit: 1,
    reason: usedToday >= 1 ? "daily_limit_free" : null,
  };
}
