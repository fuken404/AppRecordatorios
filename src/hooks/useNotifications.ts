import { useCallback, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { NavigationContainerRef } from '@react-navigation/native';
import { requestNotificationPermission } from '../notifications/notificationService';
import { RootStackParamList } from '../navigation/RootNavigator';

/** Abre el recordatorio del aviso tocado. Devuelve lo que debe correr cuando la navegación esté lista. */
export function useNotifications(
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>,
) {
  const handledResponse = useRef<string | null>(null);

  const open = useCallback(
    (response: Notifications.NotificationResponse | null) => {
      const id = response?.notification.request.identifier;
      const data = response?.notification.request.content.data as { reminderId?: string } | undefined;
      if (!id || !data?.reminderId || handledResponse.current === id) return;
      if (!navigationRef.current?.isReady()) return;
      handledResponse.current = id;
      navigationRef.current.navigate('ReminderDetail', { reminderId: data.reminderId });
    },
    [navigationRef],
  );

  useEffect(() => {
    requestNotificationPermission();
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, [open]);

  // Si la app estaba cerrada, el aviso tocado se recupera cuando la navegación ya existe.
  return useCallback(() => {
    Notifications.getLastNotificationResponseAsync().then(open);
  }, [open]);
}
