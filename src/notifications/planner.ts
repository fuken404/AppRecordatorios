import { addMinutes, isAfter } from 'date-fns';
import { MAX_SCHEDULED_NOTIFICATIONS, NAGS_PER_OCCURRENCE, OCCURRENCES_PER_REMINDER } from '../constants/recurrence';
import { Reminder } from '../types';
import { getLastOccurrence, getNextOccurrences } from '../utils/dateHelpers';

export interface PlannedNotification {
  reminderId: string;
  title: string;
  notes?: string;
  date: Date;
  isNag: boolean;
}

function occurrencesOf(reminder: Reminder, now: Date): Date[] {
  const due = new Date(reminder.dueDate);
  if (reminder.recurrence.frequency === 'none') return [due];
  const last = getLastOccurrence(due, reminder.recurrence, now);
  const next = getNextOccurrences(due, reminder.recurrence, OCCURRENCES_PER_REMINDER, now);
  return last ? [last, ...next] : next;
}

/**
 * Decide qué avisos deben existir. Se recalcula entero y se queda con los más próximos, para
 * que ningún recordatorio se pierda por el límite de avisos pendientes de iOS.
 */
export function planNotifications(
  reminders: Reminder[],
  now: Date = new Date(),
  limit: number = MAX_SCHEDULED_NOTIFICATIONS,
): PlannedNotification[] {
  const plan: PlannedNotification[] = [];

  for (const reminder of reminders) {
    if (reminder.status === 'completed') continue;
    const base = { reminderId: reminder.id, title: reminder.title, notes: reminder.notes };

    for (const date of occurrencesOf(reminder, now)) {
      plan.push({ ...base, date, isNag: false });
      if (reminder.repeatIfNotCompleted && reminder.repeatIntervalMinutes) {
        for (let i = 1; i <= NAGS_PER_OCCURRENCE; i++) {
          plan.push({ ...base, date: addMinutes(date, reminder.repeatIntervalMinutes * i), isNag: true });
        }
      }
    }
  }

  return plan
    .filter((item) => isAfter(item.date, now))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, limit);
}

export function notificationTitle(item: PlannedNotification): string {
  return item.isNag ? `⏰ Pendiente: ${item.title}` : item.title;
}
