/**
 * Menyeragamkan format nomor HP ke format standar 628xxxxxxxxxx
 * agar nomor dari form login web (08xx / +628xx) dan Fonnte (628xx) selalu cocok.
 */
export function normalizePhoneNumber(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1);
  } else if (digits.startsWith("8")) {
    digits = "62" + digits;
  }
  return digits;
}

export function isValidIndonesianPhone(normalized: string): boolean {
  return /^628[1-9][0-9]{7,11}$/.test(normalized);
}
