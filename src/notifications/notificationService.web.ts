import { Reminder } from '../types';
import { emitDemoNotification } from '../demo/demoBus';
import { notificationTitle, planNotifications } from './planner';

// En el navegador no hay notificaciones de iOS: los avisos se muestran dentro de la demo.

export async function requestNotificationPermission(): Promise<boolean> {
  return true;
}

export async function notificationsEnabled(): Promise<boolean> {
  return true;
}

export function openNotificationSettings(): void {}

let timers: ReturnType<typeof setTimeout>[] = [];
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

export async function syncNotifications(reminders: Reminder[]): Promise<void> {
  timers.forEach(clearTimeout);
  const now = Date.now();
  timers = planNotifications(reminders)
    .filter((item) => item.date.getTime() - now < MAX_TIMEOUT_MS)
    .map((item) =>
      setTimeout(() => {
        emitDemoNotification({ reminderId: item.reminderId, title: notificationTitle(item), body: item.notes });
      }, item.date.getTime() - now),
    );
}
