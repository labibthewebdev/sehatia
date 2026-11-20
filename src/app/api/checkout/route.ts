import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  createMidtransSnapTransaction,
  PLANS,
  PlanKey,
} from "@/lib/billing/midtrans";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const planKey: PlanKey =
    body.planKey === "pro_quarterly" ? "pro_quarterly" : "pro_monthly";
  const plan = PLANS[planKey];

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", session.userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const orderId = `SHT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const snap = await createMidtransSnapTransaction({
    orderId,
    planKey,
    customerPhone: user.phone_number,
    customerName: user.name,
  });

  await supabaseAdmin.from("subscriptions").insert({
    user_id: user.id,
    order_id: orderId,
    plan_name: planKey,
    amount_idr: plan.amount,
    status: "pending",
    snap_token: snap.token,
    payment_url: snap.redirect_url,
  });

  return NextResponse.json({
    orderId,
    snapToken: snap.token,
    redirectUrl: snap.redirect_url,
  });
}
