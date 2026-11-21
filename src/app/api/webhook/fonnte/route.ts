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

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Sehatia Fonnte Webhook",
  });
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, string> = {};

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        body[key] = String(value);
      });
    }

    const rawSender = body.sender || body.pengirim || "";
    const messageText = (body.message || body.pesan || "").trim();
    const mediaUrl = (body.url || body.file || "").trim();
    const isGroup = body.isgroup === "true" || rawSender.includes("@g.us");

    if (!rawSender || isGroup) {
      return NextResponse.json({ status: "ignored" });
    }

    const phone = normalizePhoneNumber(rawSender);
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://sehatia-blush.vercel.app";
    const adminWa =
      process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER ||
      process.env.NEXT_PUBLIC_WA_BOT_NUMBER ||
      "6285720276493";

    if (!messageText && !mediaUrl) {
      return NextResponse.json({ status: "empty_message" });
    }

    // 1. Cek atau buat user baru
    let { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("phone_number", phone)
      .single();

    if (!user) {
      const { data: newUser, error } = await supabaseAdmin
        .from("users")
        .insert({
          phone_number: phone,
          onboarding_step: "ask_profile",
          plan_tier: "trial",
        })
        .select("*")
        .single();

      if (error || !newUser) {
        console.error("Gagal membuat user:", error);
        return NextResponse.json({ status: "db_error" }, { status: 500 });
      }

      await sendWhatsAppMessage(
        phone,
        `Halo! Selamat datang di *Sehatia* 🥗\n\nSaya asisten gizi AI pribadimu di WhatsApp. Sebelum mulai mencatat makanan, beri tahu data singkatmu dulu ya agar target kalorimu akurat:\n\n*Jenis kelamin, Usia, Tinggi (cm), Berat (kg), dan Target*\nContoh: _Pria, 27 thn, 172 cm, 75 kg, mau turun ke 68 kg_`
      );

      return NextResponse.json({ status: "onboarding_started" });
    }

    const typedUser = user as UserProfile;

    // 2. Perintah ringkasan / dashboard / upgrade
    const lowerText = messageText.toLowerCase();
    if (lowerText === "dashboard" || lowerText === "web" || lowerText === "login") {
      await sendWhatsAppMessage(
        phone,
        `📊 *Web Dashboard Sehatia*\nPantau grafik kalori & riwayat makanmu di:\n${appUrl}/login\n\n_(Masuk cukup pakai nomor WhatsApp ini & kode OTP)_`
      );
      return NextResponse.json({ status: "dashboard_sent" });
    }

    if (lowerText === "upgrade" || lowerText === "pro") {
      const waUpgradeLink = `https://wa.me/${adminWa}?text=${encodeURIComponent(
        `Halo Admin Sehatia, saya mau aktivasi Sehatia Pro untuk nomor ${phone}`
      )}`;
      await sendWhatsAppMessage(
        phone,
        `✨ *Upgrade ke Sehatia Pro*\n\n• Hingga 15x analisis foto & teks makanan/hari\n• Koreksi porsi otomatis lewat chat\n• Grafik & riwayat nutrisi lengkap\n\nPaket mulai *Rp39.000/bulan*. Hubungi admin untuk aktivasi instan:\n${waUpgradeLink}`
      );
      return NextResponse.json({ status: "upgrade_info_sent" });
    }

    // 3. Proses Onboarding jika profil belum lengkap
    if (typedUser.onboarding_step !== "completed") {
      const parsed = await parseOnboardingReply(messageText);

      if (!parsed.is_complete) {
        await sendWhatsAppMessage(
          phone,
          parsed.missing_fields_prompt ||
            `Mohon lengkapi data berikut dalam satu chat ya:\n*Jenis kelamin, Usia, Tinggi (cm), dan Berat (kg)*\nContoh: _Wanita, 25 thn, 160 cm, 62 kg, mau turun ke 55 kg_`
        );
        return NextResponse.json({ status: "onboarding_incomplete" });
      }

      const targets = calculateDailyTargets({
        gender: parsed.gender!,
        age: parsed.age!,
        height_cm: parsed.height_cm!,
        current_weight_kg: parsed.current_weight_kg!,
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
          target_weight_kg: parsed.target_weight_kg || null,
          goal: parsed.goal,
          onboarding_step: "completed",
          ...targets,
          updated_at: new Date().toISOString(),
        })
        .eq("id", typedUser.id);

      await sendWhatsAppMessage(
        phone,
        `✅ *Profil & Target Harian Siap!*\n\n🎯 *Target Kalori:* ${targets.daily_calorie_target.toLocaleString("id-ID")} kkal/hari\n🥩 *Protein:* ${targets.daily_protein_target_g}g | 🍚 *Karbo:* ${targets.daily_carbs_target_g}g | 🥑 *Lemak:* ${targets.daily_fat_target_g}g\n\nKamu mendapat *Trial Gratis 3 Hari* (3x analisis/hari).\nSekarang silakan kirim *foto makanan* atau ketik menu yang baru kamu makan!\n\n📊 Dashboard: ${appUrl}/login`
      );

      return NextResponse.json({ status: "onboarding_completed" });
    }

    // 4. Ambil log terakhir hari ini untuk mendukung revisi via chat
    const today = getJakartaDateString();
    const { data: todayLogs } = await supabaseAdmin
      .from("food_logs")
      .select("*")
      .eq("user_id", typedUser.id)
      .eq("log_date", today)
      .order("created_at", { ascending: false });

    const logsList = (todayLogs || []) as FoodLog[];
    const lastLog = logsList[0] || null;

    // 5. Cek kuota harian user
    const quota = await checkUserQuota(typedUser, Boolean(mediaUrl));
    if (!quota.allowed) {
      const waUpgradeLink = `https://wa.me/${adminWa}?text=${encodeURIComponent(
        `Halo Admin Sehatia, saya mau upgrade ke Sehatia Pro untuk nomor ${phone}`
      )}`;

      const reasonMsg =
        quota.reason === "photo_requires_pro"
          ? "Masa Trial 3 hari kamu telah berakhir. Di mode Free, analisis foto memerlukan *Sehatia Pro*."
          : `Kuota harian kamu (${quota.usedToday}/${quota.limit}) sudah terpakai hari ini.`;

      await sendWhatsAppMessage(
        phone,
        `⚠️ ${reasonMsg}\n\nAktifkan *Sehatia Pro* (Rp39.000/bln) untuk hingga 15x analisis foto & teks setiap hari:\n${waUpgradeLink}`
      );
      return NextResponse.json({ status: "quota_exceeded" });
    }

    // 6. Unduh media jika user mengirim foto
    let mediaData: { base64: string; mimeType: string } | null = null;
    if (mediaUrl) {
      mediaData = await downloadMediaAsBase64(mediaUrl);
    }

    // 7. Analisis nutrisi lewat Google Gemini 2.5 Flash
    const analysis = await analyzeMealWithGemini({
      text: messageText,
      imageBase64: mediaData?.base64,
      imageMimeType: mediaData?.mimeType,
      lastMealLog: lastLog,
    });

    if (!analysis.is_food_or_drink && !analysis.is_revision_of_last_log) {
      await sendWhatsAppMessage(
        phone,
        analysis.short_feedback_id ||
          `Kirimkan *foto makanan* atau ketik nama makanan yang baru kamu konsumsi ya (contoh: _Nasi ayam bakar + es teh tawar_).`
      );
      return NextResponse.json({ status: "non_food_ignored" });
    }

    // 8. Simpan atau perbarui log makanan di Supabase
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

      logsList[0] = {
        ...lastLog,
        meal_summary: analysis.meal_summary,
        total_calories: Math.round(analysis.totals.calories),
        total_protein_g: analysis.totals.protein_g,
        total_carbs_g: analysis.totals.carbs_g,
        total_fat_g: analysis.totals.fat_g,
      };
    } else {
      const { data: inserted } = await supabaseAdmin
        .from("food_logs")
        .insert({
          user_id: typedUser.id,
          log_date: today,
          meal_type: ["breakfast", "lunch", "dinner", "snack"].includes(
            analysis.meal_type
          )
            ? analysis.meal_type
            : "snack",
          raw_input_text: messageText || null,
          image_url: mediaUrl || null,
          meal_summary: analysis.meal_summary,
          items: analysis.items,
          total_calories: Math.round(analysis.totals.calories),
          total_protein_g: analysis.totals.protein_g,
          total_carbs_g: analysis.totals.carbs_g,
          total_fat_g: analysis.totals.fat_g,
          total_sugar_g: analysis.totals.sugar_g,
          ai_confidence: analysis.ai_confidence,
          short_feedback: analysis.short_feedback_id,
        })
        .select("*")
        .single();

      if (inserted) {
        logsList.unshift(inserted as FoodLog);
      }
    }

    // 9. Hitung akumulasi hari ini & kirim balasan rapi ke WhatsApp
    const totalCalToday = logsList.reduce(
      (sum, item) => sum + Number(item.total_calories || 0),
      0
    );
    const remainingCal = typedUser.daily_calorie_target - totalCalToday;

    const itemLines = analysis.items
      .map(
        (it) =>
          `• ${it.name} (${it.estimated_portion}): *${Math.round(it.calories)} kkal*`
      )
      .join("\n");

    const statusLine =
      remainingCal >= 0
        ? `Sisa kuota hari ini: *${remainingCal.toLocaleString("id-ID")} kkal*`
        : `Melebihi target harian: *+${Math.abs(remainingCal).toLocaleString("id-ID")} kkal*`;

    const headerTitle = analysis.is_revision_of_last_log
      ? "✏️ *Catatan Diperbarui*"
      : "🍽️ *Tercatat di Sehatia*";

    const replyMessage = `${headerTitle}\n*${analysis.meal_summary}*\n\n${itemLines}\n\n🔥 *Total:* ${Math.round(analysis.totals.calories)} kkal | 🥩 Protein: ${Math.round(analysis.totals.protein_g)}g | 🍚 Karbo: ${Math.round(analysis.totals.carbs_g)}g | 🥑 Lemak: ${Math.round(analysis.totals.fat_g)}g\n\n💡 _${analysis.short_feedback_id}_\n\n📊 Hari ini: *${totalCalToday.toLocaleString("id-ID")} / ${typedUser.daily_calorie_target.toLocaleString("id-ID")} kkal* (${statusLine})\n_(Balas jika ingin koreksi porsi, misal: "nasinya setengah")_`;

    await sendWhatsAppMessage(phone, replyMessage);

    return NextResponse.json({ status: "logged" });
  } catch (error) {
    console.error("Webhook Fonnte Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
