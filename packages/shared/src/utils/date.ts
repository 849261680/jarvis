export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getTodayDate(): string {
  return formatDate(new Date());
}

export function parseDateString(dateStr: string): Date {
  return new Date(dateStr);
}
