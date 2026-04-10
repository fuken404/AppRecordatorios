import {
  addDays,
  addMonths,
  setDate,
  isAfter,
  isBefore,
  startOfDay,
  format,
  formatDistanceToNow,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { RecurrenceRule } from '../types';

export function formatDate(date: Date | string): string {
  return format(new Date(date), "d MMM yyyy, HH:mm", { locale: es });
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

export function isOverdue(dueDate: string): boolean {
  return isBefore(new Date(dueDate), new Date());
}

export function isToday(dueDate: string): boolean {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const due = new Date(dueDate);
  return !isBefore(due, today) && isBefore(due, tomorrow);
}

export function isThisWeek(dueDate: string): boolean {
  const now = new Date();
  const weekEnd = addDays(startOfDay(now), 7);
  return !isBefore(new Date(dueDate), now) && isBefore(new Date(dueDate), weekEnd);
}

/**
 * Calcula las próximas N ocurrencias de un recordatorio
 * basadas en su regla de recurrencia.
 */
export function getNextOccurrences(
  startDate: Date,
  rule: RecurrenceRule,
  count: number,
): Date[] {
  if (rule.frequency === 'none') return [startDate];

  const occurrences: Date[] = [];
  let current = new Date(startDate);
  const now = new Date();

  // Asegurarse de arrancar desde el futuro
  if (isBefore(current, now)) {
    current = advanceToNext(current, rule, now);
  }

  while (occurrences.length < count) {
    occurrences.push(new Date(current));
    current = advanceByOne(current, rule);
  }

  return occurrences;
}

function advanceToNext(date: Date, rule: RecurrenceRule, after: Date): Date {
  let current = new Date(date);
  while (!isAfter(current, after)) {
    current = advanceByOne(current, rule);
  }
  return current;
}

function advanceByOne(date: Date, rule: RecurrenceRule): Date {
  switch (rule.frequency) {
    case 'daily':
      return addDays(date, 1);

    case 'weekly': {
      if (!rule.daysOfWeek || rule.daysOfWeek.length === 0) {
        return addDays(date, 7);
      }
      // Buscar el próximo día de la semana habilitado
      let next = addDays(date, 1);
      for (let i = 0; i < 7; i++) {
        if (rule.daysOfWeek.includes(next.getDay())) return next;
        next = addDays(next, 1);
      }
      return addDays(date, 7);
    }

    case 'monthly': {
      const nextMonth = addMonths(date, 1);
      if (rule.dayOfMonth) {
        const maxDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
        return setDate(nextMonth, Math.min(rule.dayOfMonth, maxDay));
      }
      return nextMonth;
    }

    case 'custom':
      return addDays(date, rule.intervalDays ?? 1);

    default:
      return addDays(date, 1);
  }
}
