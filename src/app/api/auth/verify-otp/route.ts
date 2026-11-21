import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import { createSessionCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    const phone = normalizePhoneNumber(body.phone || "");
    const code = (body.code || "").trim();

    if (!phone || code.length !== 6) {
      return NextResponse.json(
        { error: "Nomor WhatsApp atau kode OTP 6 digit tidak valid." },
        { status: 400 }
      );
    }

    const { data: otpRecord } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("phone_number", phone)
      .eq("code", code)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Kode OTP salah atau sudah kedaluwarsa." },
        { status: 401 }
      );
    }

    await supabaseAdmin
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpRecord.id);

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, phone_number")
      .eq("phone_number", phone)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan." },
        { status: 404 }
      );
    }

    await createSessionCookie({
      userId: user.id,
      phoneNumber: user.phone_number,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat verifikasi OTP." },
      { status: 500 }
    );
  }
}
