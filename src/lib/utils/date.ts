/**
 * Mengembalikan tanggal hari ini dalam format YYYY-MM-DD berdasarkan zona waktu WIB (Asia/Jakarta).
 * Mencegah bug reset kuota harian pada pukul 07:00 pagi WIB akibat perbedaan UTC.
 */
export function getJakartaDateString(date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

export function getLastNDatesJakarta(days: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dates.push(getJakartaDateString(d));
  }
  return dates;
}
