import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isValidIndonesianPhone, normalizePhoneNumber } from "@/lib/utils/phone";
import { sendWhatsAppMessage } from "@/lib/whatsapp/fonnte";

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    const phone = normalizePhoneNumber(body.phone || "");

    if (!isValidIndonesianPhone(phone)) {
      return NextResponse.json(
        { error: "Masukkan nomor WhatsApp Indonesia yang valid (contoh: 0812xxxx)." },
        { status: 400 }
      );
    }

    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("phone_number", phone)
      .single();

    if (!existingUser) {
      await supabaseAdmin.from("users").insert({
        phone_number: phone,
        onboarding_step: "ask_profile",
        plan_tier: "trial",
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await supabaseAdmin.from("otp_codes").insert({
      phone_number: phone,
      code,
      expires_at: expiresAt,
      used: false,
    });

    await sendWhatsAppMessage(
      phone,
      `🔐 *Kode Login Sehatia:* *${code}*\n\nBerlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.`
    );

    return NextResponse.json({ success: true, phone });
  } catch (error) {
    console.error("Request OTP Error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim kode OTP. Pastikan konfigurasi server sudah benar." },
      { status: 500 }
    );
  }
}
