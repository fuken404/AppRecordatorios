export interface DemoNotification {
  reminderId: string;
  title: string;
  body?: string;
}

type Listener<T> = (value: T) => void;

const shown = new Set<Listener<DemoNotification>>();
const opened = new Set<Listener<string>>();

export function emitDemoNotification(notification: DemoNotification): void {
  shown.forEach((listener) => listener(notification));
}

export function onDemoNotification(listener: Listener<DemoNotification>): () => void {
  shown.add(listener);
  return () => shown.delete(listener);
}

export function openDemoNotification(reminderId: string): void {
  opened.forEach((listener) => listener(reminderId));
}

export function onDemoNotificationOpen(listener: Listener<string>): () => void {
  opened.add(listener);
  return () => opened.delete(listener);
}
