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

/** Máximo de pasos al avanzar por una recurrencia: evita un ciclo sin fin con datos dañados. */
const MAX_STEPS = 20000;

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** Lleva una fecha al primer día válido de la regla, sin retroceder. */
export function alignToRule(date: Date, rule: RecurrenceRule): Date {
  if (rule.frequency === 'weekly' && rule.daysOfWeek?.length) {
    let current = new Date(date);
    for (let i = 0; i < 7; i++) {
      if (rule.daysOfWeek.includes(current.getDay())) return current;
      current = addDays(current, 1);
    }
  }
  if (rule.frequency === 'monthly' && rule.dayOfMonth) {
    const candidate = setDate(date, Math.min(rule.dayOfMonth, daysInMonth(date)));
    if (!isBefore(candidate, date)) return candidate;
    const nextMonth = addMonths(setDate(date, 1), 1);
    return setDate(nextMonth, Math.min(rule.dayOfMonth, daysInMonth(nextMonth)));
  }
  return new Date(date);
}

function advanceByOne(date: Date, rule: RecurrenceRule): Date {
  switch (rule.frequency) {
    case 'daily':
      return addDays(date, 1);

    case 'weekly': {
      if (!rule.daysOfWeek?.length) return addDays(date, 7);
      return alignToRule(addDays(date, 1), rule);
    }

    case 'monthly': {
      if (rule.dayOfMonth) {
        const nextMonth = addMonths(setDate(date, 1), 1);
        return setDate(nextMonth, Math.min(rule.dayOfMonth, daysInMonth(nextMonth)));
      }
      return addMonths(date, 1);
    }

    case 'custom':
      return addDays(date, Math.max(1, rule.intervalDays ?? 1));

    default:
      return addDays(date, 1);
  }
}

/** Próximas ocurrencias posteriores a `now`. */
export function getNextOccurrences(
  startDate: Date,
  rule: RecurrenceRule,
  count: number,
  now: Date = new Date(),
): Date[] {
  if (rule.frequency === 'none') return [startDate];

  let current = alignToRule(startDate, rule);
  for (let i = 0; i < MAX_STEPS && !isAfter(current, now); i++) {
    current = advanceByOne(current, rule);
  }

  const occurrences: Date[] = [];
  while (occurrences.length < count) {
    occurrences.push(current);
    current = advanceByOne(current, rule);
  }
  return occurrences;
}

/** Última ocurrencia ya pasada, si existe: aún puede tener re-avisos pendientes. */
export function getLastOccurrence(startDate: Date, rule: RecurrenceRule, now: Date = new Date()): Date | null {
  let current = alignToRule(startDate, rule);
  if (isAfter(current, now)) return null;
  for (let i = 0; i < MAX_STEPS; i++) {
    const next = advanceByOne(current, rule);
    if (isAfter(next, now)) return current;
    current = next;
  }
  return current;
}

/** Fecha que sigue al completar un recordatorio recurrente: nunca se salta una ocurrencia. */
export function nextDueDate(dueDate: Date, rule: RecurrenceRule, now: Date = new Date()): Date {
  const after = isAfter(dueDate, now) ? dueDate : now;
  let current = alignToRule(dueDate, rule);
  for (let i = 0; i < MAX_STEPS && !isAfter(current, after); i++) {
    current = advanceByOne(current, rule);
  }
  return current;
}
