import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import { createSessionCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { phone, code } = await req.json();
    const normalized = normalizePhoneNumber(String(phone || ""));
    const cleanCode = String(code || "").trim();

    const { data: otpRecord } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("phone_number", normalized)
      .eq("code", cleanCode)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Kode OTP salah atau sudah kedaluwarsa." },
        { status: 400 }
      );
    }

    await supabaseAdmin
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpRecord.id);

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, phone_number")
      .eq("phone_number", normalized)
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
      { error: "Terjadi kesalahan saat verifikasi." },
      { status: 500 }
    );
  }
}
