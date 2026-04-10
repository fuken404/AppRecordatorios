import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder } from '../types';
import { getNextOccurrences } from '../utils/dateHelpers';
import { MAX_SCHEDULED_NOTIFICATIONS } from '../constants/recurrence';
import { addMinutes } from 'date-fns';

// Configurar cómo se muestran las notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Programa todas las notificaciones para un recordatorio.
 * Cancela las anteriores si existen.
 * Devuelve los nuevos IDs programados.
 */
export async function scheduleReminder(reminder: Reminder): Promise<string[]> {
  // Cancelar notificaciones previas
  await cancelReminderNotifications(reminder.scheduledNotificationIds);

  const ids: string[] = [];
  const isRecurring = reminder.recurrence.frequency !== 'none';

  // Calcular cuántas ocurrencias programar
  // Si tiene nags, reservar slots para ellas por ocurrencia
  const nagsPerOccurrence = reminder.repeatIfNotCompleted ? 2 : 0;
  const occurrenceCount = Math.floor(
    MAX_SCHEDULED_NOTIFICATIONS / (1 + nagsPerOccurrence),
  );

  const occurrences = getNextOccurrences(
    new Date(reminder.dueDate),
    reminder.recurrence,
    isRecurring ? occurrenceCount : 1,
  );

  for (const date of occurrences) {
    if (date <= new Date()) continue;

    // Notificación principal
    const mainId = await scheduleOne(reminder, date, false);
    if (mainId) ids.push(mainId);

    // Notificaciones de recordatorio si no se completa
    if (reminder.repeatIfNotCompleted && reminder.repeatIntervalMinutes) {
      for (let i = 1; i <= nagsPerOccurrence; i++) {
        const nagDate = addMinutes(date, reminder.repeatIntervalMinutes * i);
        const nagId = await scheduleOne(reminder, nagDate, true);
        if (nagId) ids.push(nagId);
      }
    }
  }

  return ids;
}

async function scheduleOne(
  reminder: Reminder,
  date: Date,
  isNag: boolean,
): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: isNag ? `⏰ Pendiente: ${reminder.title}` : reminder.title,
        body: reminder.notes ?? 'Toca para ver el recordatorio',
        data: {
          reminderId: reminder.id,
          type: isNag ? 'nag' : 'reminder',
        },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelReminderNotifications(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

/**
 * Reprograma todos los recordatorios recurrentes que tienen
 * pocas notificaciones restantes. Se llama al abrir la app.
 */
export async function replenishNotifications(
  reminders: Reminder[],
  onUpdate: (id: string, newIds: string[]) => void,
): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const scheduledIds = new Set(scheduled.map((n) => n.identifier));

  for (const reminder of reminders) {
    if (reminder.status === 'completed') continue;
    if (reminder.recurrence.frequency === 'none') continue;

    const remaining = reminder.scheduledNotificationIds.filter((id) =>
      scheduledIds.has(id),
    ).length;

    if (remaining < 3) {
      const newIds = await scheduleReminder(reminder);
      onUpdate(reminder.id, newIds);
    }
  }
}
