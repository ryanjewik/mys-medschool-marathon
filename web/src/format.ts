// "2026-11-20" -> "Nov 20". Built from parts so it doesn't shift a day in US time zones.
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// True when an interview date ("YYYY-MM-DD") is today, in her time zone.
export function isToday(isoDate: string): boolean {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  const now = new Date();
  return now.getFullYear() === y && now.getMonth() === m - 1 && now.getDate() === d;
}
