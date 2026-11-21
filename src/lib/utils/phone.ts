export function normalizePhoneNumber(raw: string): string {
  const withoutJid = raw.split("@")[0] || raw;
  let digits = withoutJid.replace(/\D/g, "");
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
