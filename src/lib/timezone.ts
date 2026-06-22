export const APP_TIMEZONE = 'Asia/Manila';
export const APP_TIMEZONE_LABEL = 'Philippines Time (GMT+8)';
const OFFSET = '+08:00';

function dateTimeParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    day: Number(parts.find((part) => part.type === 'day')?.value),
    hour: Number(parts.find((part) => part.type === 'hour')?.value),
    minute: Number(parts.find((part) => part.type === 'minute')?.value),
  };
}

export function parseManilaDateTime(dateValue: string, timeValue: string): Date | null {
  const normalizedTime = timeValue.length === 5 ? `${timeValue}:00` : timeValue;
  const value = new Date(`${dateValue}T${normalizedTime}${OFFSET}`);
  return Number.isNaN(value.getTime()) ? null : value;
}

export function formatManilaDateInput(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });
}

export function formatManilaTimeInput(date: Date): string {
  const { hour, minute } = dateTimeParts(date);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function manilaDayStart(date: Date): Date {
  return parseManilaDateTime(formatManilaDateInput(date), '00:00')!;
}

export function roundUpToNextHalfHourManila(date: Date): Date {
  const { hour, minute } = dateTimeParts(date);
  let totalMinutes = hour * 60 + minute;
  const remainder = totalMinutes % 30;

  if (remainder !== 0) {
    totalMinutes += 30 - remainder;
  }

  const dayStart = manilaDayStart(date);
  return new Date(dayStart.getTime() + totalMinutes * 60 * 1000);
}

export function formatScheduleRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const now = new Date();

  const formatDateKey = (value: Date) =>
    value.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });

  const startDate = formatDateKey(start);
  const nowDate = formatDateKey(now);
  const tomorrowDate = formatDateKey(new Date(now.getTime() + 24 * 60 * 60 * 1000));

  const dayLabel =
    startDate === nowDate
      ? 'Today'
      : startDate === tomorrowDate
        ? 'Tomorrow'
        : start.toLocaleDateString('en-PH', {
            timeZone: APP_TIMEZONE,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });

  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: APP_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  };

  const startTime = start.toLocaleTimeString('en-PH', timeOptions);
  const endTime = end.toLocaleTimeString('en-PH', timeOptions);

  return `${dayLabel} · ${startTime} – ${endTime}`;
}
