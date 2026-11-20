import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import { getJakartaDateString } from "@/lib/utils/date";
import { calculateDailyTargets } from "@/lib/utils/nutrition";
import {
  downloadMediaAsBase64,
  sendWhatsAppMessage,
} from "@/lib/whatsapp/fonnte";
import {
  analyzeMealWithGemini,
  parseOnboardingReply,
} from "@/lib/ai/gemini";
import { checkUserQuota } from "@/lib/billing/quota";
import { FoodLog, UserProfile } from "@/types/sehatia";

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, string> = {};

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((val, key) => {
        body[key] = String(val);
      });
    }

    const rawSender = body.sender || "";
    const messageText = (body.message || "").trim();
    const mediaUrl = (body.url || "").trim();
    const isGroup =
      body.isgroup === "true" || rawSender.toLowerCase().includes("@g.us");

    if (!rawSender || isGroup || (!messageText && !mediaUrl)) {
      return NextResponse.json({ status: "ignored" });
    }

    const phone = normalizePhoneNumber(rawSender);

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("phone_number", phone)
      .single();

    if (!user) {
      const { data: createdUser, error } = await supabaseAdmin
        .from("users")
        .insert({
          phone_number: phone,
          onboarding_step: "ask_profile",
          plan_tier: "trial",
        })
        .select("*")
        .single();

      if (error || !createdUser) {
        throw new Error("Gagal membuat user baru");
      }

      await sendWhatsAppMessage(
        phone,
        `Halo! Selamat datang di *Sehatia* 🌿\n\nCukup kirim foto makanan atau ketik apa yang kamu makan, saya akan hitung kalori & nutrisinya secara otomatis.\n\nSebelum mulai, balas pesan ini dengan info singkatmu agar saya bisa menghitung target kalori harianmu:\n*Jenis kelamin, usia, tinggi badan (cm), berat saat ini (kg), dan target dietmu*\n\n_Contoh: Wanita, 27 thn, 160 cm, 64 kg, mau turun ke 55 kg_`
      );
      return NextResponse.json({ status: "onboarding_started" });
    }

    const typedUser = user as UserProfile;

    if (typedUser.onboarding_step === "ask_profile") {
      if (!messageText) {
        await sendWhatsAppMessage(
          phone,
          `Ketik singkat *jenis kelamin, usia, tinggi (cm), dan berat badan (kg)* dulu ya supaya target kalorimu akurat 😊`
        );
        return NextResponse.json({ status: "awaiting_profile_text" });
      }

      const parsed = await parseOnboardingReply(messageText);

      if (
        !parsed.is_complete ||
        !parsed.gender ||
        !parsed.age ||
        !parsed.height_cm ||
        !parsed.current_weight_kg
      ) {
        await sendWhatsAppMessage(phone, parsed.missing_fields_prompt);
        return NextResponse.json({ status: "onboarding_incomplete" });
      }

      const targets = calculateDailyTargets({
        gender: parsed.gender,
        age: parsed.age,
        height_cm: parsed.height_cm,
        current_weight_kg: parsed.current_weight_kg,
        goal: parsed.goal,
      });

      await supabaseAdmin
        .from("users")
        .update({
          name: parsed.name || typedUser.name,
          gender: parsed.gender,
          age: parsed.age,
          height_cm: parsed.height_cm,
          current_weight_kg: parsed.current_weight_kg,
          target_weight_kg: parsed.target_weight_kg || parsed.current_weight_kg,
          goal: parsed.goal,
          ...targets,
          onboarding_step: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", typedUser.id);

      await sendWhatsAppMessage(
        phone,
        `✅ *Profil Sehatia Siap!*\n\nTarget harianmu:\n🔥 Kalori: *${targets.daily_calorie_target} kkal*\n🥩 Protein: *${targets.daily_protein_target_g}g*\n🍚 Karbo: *${targets.daily_carbs_target_g}g*\n🥑 Lemak: *${targets.daily_fat_target_g}g*\n\n🎁 Kamu mendapat *Trial Pro 3 Hari* (3x foto/catat per hari).\nSekarang coba kirim *foto makananmu* atau ketik menu yang baru kamu makan!\n\n📊 Pantau grafik lengkapmu di:\n${process.env.NEXT_PUBLIC_APP_URL}/login`
      );
      return NextResponse.json({ status: "onboarding_completed" });
    }

    const upperCmd = messageText.toUpperCase();
    const adminWa =
      process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER ||
      process.env.NEXT_PUBLIC_WA_BOT_NUMBER ||
      "";

    if (upperCmd === "UPGRADE" || upperCmd === "PRO") {
      const waAdminLink = `https://wa.me/${adminWa}?text=${encodeURIComponent(
        `Halo Admin Sehatia, saya mau upgrade akun (${phone}) ke Sehatia Pro.`
      )}`;

      await sendWhatsAppMessage(
        phone,
        `✨ *Upgrade ke Sehatia Pro*\n\nNikmati hingga 15x foto & analisis makanan setiap hari + riwayat grafik lengkap:\n• Paket 1 Bulan: *Rp39.000*\n• Paket 3 Bulan: *Rp89.000*\n\nHubungi Admin untuk aktivasi cepat:\n👉 ${waAdminLink}`
      );
      return NextResponse.json({ status: "upgrade_info_sent" });
    }

    if (upperCmd === "DASHBOARD" || upperCmd === "WEB") {
      await sendWhatsAppMessage(
        phone,
        `📊 Buka Dashboard Sehatia milikmu di sini:\n${process.env.NEXT_PUBLIC_APP_URL}/login\n\n_(Login cepat menggunakan kode OTP ke nomor WA ini)_`
      );
      return NextResponse.json({ status: "dashboard_link_sent" });
    }

    const hasImage = Boolean(mediaUrl);
    const quota = await checkUserQuota(typedUser, hasImage);

    if (!quota.allowed) {
      const waAdminLink = `https://wa.me/${adminWa}?text=${encodeURIComponent(
        `Halo Admin Sehatia, kuota harian saya (${phone}) habis dan mau upgrade ke Sehatia Pro.`
      )}`;

      await sendWhatsAppMessage(
        phone,
        `📸 *Kuota Harianmu Sudah Habis*\n\nUpgrade ke *Sehatia Pro (Rp39.000/bulan)* untuk mendapatkan 15x analisis foto & teks setiap hari.\n\n👉 Chat Admin untuk aktivasi Pro:\n${waAdminLink}`
      );
      return NextResponse.json({ status: "quota_exceeded" });
    }

    let imagePayload: { base64: string; mimeType: string } | null = null;
    if (hasImage) {
      imagePayload = await downloadMediaAsBase64(mediaUrl);
    }

    const today = getJakartaDateString();
    const { data: todayLogs } = await supabaseAdmin
      .from("food_logs")
      .select("*")
      .eq("user_id", typedUser.id)
      .eq("log_date", today)
      .order("created_at", { ascending: false });

    const lastLog = (todayLogs?.[0] as FoodLog | undefined) || null;

    const analysis = await analyzeMealWithGemini({
      text: messageText || null,
      imageBase64: imagePayload?.base64 || null,
      imageMimeType: imagePayload?.mimeType || null,
      lastFoodLog: lastLog,
    });

    if (!analysis.is_food_or_drink) {
      await sendWhatsAppMessage(
        phone,
        `${analysis.short_feedback_id}\n\n💡 _Contoh: kirim foto makan siangmu atau ketik "nasi putih 1 porsi, ayam bakar dada, es teh tawar"_`
      );
      return NextResponse.json({ status: "not_food" });
    }

    if (analysis.is_revision_of_last_log && lastLog) {
      await supabaseAdmin
        .from("food_logs")
        .update({
          meal_summary: analysis.meal_summary,
          items: analysis.items,
          total_calories: Math.round(analysis.totals.calories),
          total_protein_g: analysis.totals.protein_g,
          total_carbs_g: analysis.totals.carbs_g,
          total_fat_g: analysis.totals.fat_g,
          total_sugar_g: analysis.totals.sugar_g,
          ai_confidence: analysis.ai_confidence,
          short_feedback: analysis.short_feedback_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", lastLog.id);
    } else {
      await supabaseAdmin.from("food_logs").insert({
        user_id: typedUser.id,
        log_date: today,
        meal_type: analysis.meal_type,
        raw_input_text: messageText || null,
        image_url: hasImage ? mediaUrl : null,
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
    }

    const { data: updatedLogs } = await supabaseAdmin
      .from("food_logs")
      .select("total_calories, total_protein_g")
      .eq("user_id", typedUser.id)
      .eq("log_date", today);

    const consumedCalories = (updatedLogs || []).reduce(
      (sum, item) => sum + (item.total_calories || 0),
      0
    );
    const remainingCalories = typedUser.daily_calorie_target - consumedCalories;

    const itemLines = analysis.items
      .map(
        (it) =>
          `• ${it.name} _(${it.estimated_portion})_: *${Math.round(it.calories)} kkal*`
      )
      .join("\n");

    const titlePrefix = analysis.is_revision_of_last_log
      ? "🔄 *Catatan Diperbarui:*"
      : "🍽️ *Tercatat di Sehatia:*";

    const statusSisa =
      remainingCalories >= 0
        ? `Sisa kuota hari ini: *${remainingCalories} kkal* (dari ${typedUser.daily_calorie_target} kkal)`
        : `Melebihi target harian: *+${Math.abs(remainingCalories)} kkal*`;

    await sendWhatsAppMessage(
      phone,
      `${titlePrefix}\n*${analysis.meal_summary}*\n\n${itemLines}\n\n📊 *Total Sajian Ini:*\n🔥 *${Math.round(analysis.totals.calories)} kkal* | 🥩 Protein: *${analysis.totals.protein_g}g* | 🍚 Karbo: *${analysis.totals.carbs_g}g* | 🥑 Lemak: *${analysis.totals.fat_g}g*\n\n💡 _${analysis.short_feedback_id}_\n\n🎯 ${statusSisa}\n_(Balas pesan ini jika ada porsi yang perlu dikoreksi)_`
    );

    return NextResponse.json({ status: "logged" });
  } catch (error) {
    console.error("Webhook Fonnte Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
