import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PLANS, PlanKey, verifyMidtransSignature } from "@/lib/billing/midtrans";
import {
  downloadMediaAsBase64,
  sendWhatsAppMessage,
} from "@/lib/whatsapp/fonnte";
import { analyzeMealWithGemini } from "@/lib/ai/gemini";
import { getJakartaDateString } from "@/lib/utils/date";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    const isValid = verifyMidtransSignature({
      orderId: order_id,
      statusCode: status_code,
      grossAmount: gross_amount,
      signatureKey: signature_key,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const isPaid =
      (transaction_status === "capture" && fraud_status === "accept") ||
      transaction_status === "settlement";

    if (!isPaid) {
      return NextResponse.json({ status: "ignored_status" });
    }

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (!sub || sub.status === "paid") {
      return NextResponse.json({ status: "already_processed" });
    }

    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", sub.id);

    const planKey = (sub.plan_name as PlanKey) || "pro_monthly";
    const durationDays = PLANS[planKey]?.durationDays || 30;

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", sub.user_id)
      .single();

    if (!user) return NextResponse.json({ status: "user_missing" });

    const baseDate =
      user.plan_expires_at && new Date(user.plan_expires_at) > new Date()
        ? new Date(user.plan_expires_at)
        : new Date();
    const newExpiry = new Date(
      baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000
    ).toISOString();

    await supabaseAdmin
      .from("users")
      .update({
        plan_tier: "pro",
        plan_expires_at: newExpiry,
        pending_image_url: null,
        pending_caption: null,
      })
      .eq("id", user.id);

    await sendWhatsAppMessage(
      user.phone_number,
      `🎉 *Pembayaran Berhasil! Sehatia Pro Aktif*\n\nKamu sekarang dapat menganalisis hingga 15x foto & teks makanan setiap hari. Terima kasih telah menjaga pola sehatmu bersama Sehatia!`
    );

    if (user.pending_image_url || user.pending_caption) {
      const media = user.pending_image_url
        ? await downloadMediaAsBase64(user.pending_image_url)
        : null;

      const analysis = await analyzeMealWithGemini({
        text: user.pending_caption,
        imageBase64: media?.base64 || null,
        imageMimeType: media?.mimeType || null,
      });

      if (analysis.is_food_or_drink) {
        await supabaseAdmin.from("food_logs").insert({
          user_id: user.id,
          log_date: getJakartaDateString(),
          meal_type: analysis.meal_type,
          raw_input_text: user.pending_caption,
          image_url: user.pending_image_url,
          meal_summary: analysis.meal_summary,
          items: analysis.items,
          total_calories: Math.round(analysis.totals.calories),
          total_protein_g: analysis.totals.protein_g,
          total_carbs_g: analysis.totals.carbs_g,
          total_fat_g: analysis.totals.fat_g,
          total_sugar_g: analysis.totals.sugar_g,
          ai_confidence: analysis.ai_confidence,
          short_feedback: analysis.short_feedback_id,
        });

        await sendWhatsAppMessage(
          user.phone_number,
          `🍽️ *Catatan Makananmu yang Tertunda Sudah Dianalisis:*\n*${analysis.meal_summary}*\n🔥 *${Math.round(analysis.totals.calories)} kkal* | Protein: *${analysis.totals.protein_g}g* | Karbo: *${analysis.totals.carbs_g}g* | Lemak: *${analysis.totals.fat_g}g*`
        );
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
