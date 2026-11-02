import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';
import { Reminder } from '../types';
import { notificationTitle, planNotifications } from './planner';

// Cómo se muestran las notificaciones cuando la app está abierta.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
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

export async function notificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted' || status === 'undetermined';
}

export function openNotificationSettings(): void {
  Linking.openSettings();
}

let queue: Promise<void> = Promise.resolve();

/**
 * Deja programados exactamente los avisos que deben existir. Como iOS es la única fuente de
 * verdad, un recordatorio borrado o editado nunca conserva avisos viejos.
 */
export function syncNotifications(reminders: Reminder[]): Promise<void> {
  queue = queue.then(() => replaceAll(reminders)).catch((error) => {
    console.warn('No se pudieron programar los avisos', error);
  });
  return queue;
}

async function replaceAll(reminders: Reminder[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const item of planNotifications(reminders)) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationTitle(item),
        body: item.notes ?? 'Toca para ver el recordatorio',
        data: { reminderId: item.reminderId, type: item.isNag ? 'nag' : 'reminder' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: item.date,
      },
    });
  }
}
