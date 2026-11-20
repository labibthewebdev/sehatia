import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  isValidIndonesianPhone,
  normalizePhoneNumber,
} from "@/lib/utils/phone";
import { sendWhatsAppMessage } from "@/lib/whatsapp/fonnte";

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { phone } = await req.json();
    const normalized = normalizePhoneNumber(String(phone || ""));

    if (!isValidIndonesianPhone(normalized)) {
      return NextResponse.json(
        { error: "Masukkan nomor WhatsApp Indonesia yang valid (contoh: 0812xxxx)." },
        { status: 400 }
      );
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("phone_number", normalized)
      .single();

    if (!user) {
      await supabaseAdmin.from("users").insert({
        phone_number: normalized,
        onboarding_step: "completed",
        plan_tier: "trial",
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await supabaseAdmin.from("otp_codes").insert({
      phone_number: normalized,
      code,
      expires_at: expiresAt,
    });

    await sendWhatsAppMessage(
      normalized,
      `🔐 *Kode Login Sehatia:* *${code}*\n\nBerlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.`
    );

    return NextResponse.json({ success: true, phone: normalized });
  } catch (error) {
    console.error("Request OTP Error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim kode OTP. Coba sesaat lagi." },
      { status: 500 }
    );
  }
}
