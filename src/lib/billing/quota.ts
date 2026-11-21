import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getJakartaDateString } from "@/lib/utils/date";
import { PlanTier, UserProfile } from "@/types/sehatia";

export async function checkUserQuota(user: UserProfile, hasImage: boolean) {
  const supabaseAdmin = getSupabaseAdmin();
  const now = new Date();
  let effectivePlan: PlanTier = user.plan_tier;

  if (effectivePlan === "pro" && user.plan_expires_at) {
    if (new Date(user.plan_expires_at) < now) {
      effectivePlan = "free";
      await supabaseAdmin
        .from("users")
        .update({ plan_tier: "free" })
        .eq("id", user.id);
    }
  } else if (effectivePlan === "trial" && user.trial_ends_at) {
    if (new Date(user.trial_ends_at) < now) {
      effectivePlan = "free";
      await supabaseAdmin
        .from("users")
        .update({ plan_tier: "free" })
        .eq("id", user.id);
    }
  }

  const today = getJakartaDateString(now);
  const { count } = await supabaseAdmin
    .from("food_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("log_date", today);

  const usedToday = count || 0;

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
