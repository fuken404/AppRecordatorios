import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { NavigationContainerRef } from '@react-navigation/native';
import { requestNotificationPermission } from '../notifications/notificationService';
import { RootStackParamList } from '../navigation/RootNavigator';

export function useNotifications(
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>,
) {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    requestNotificationPermission();

    // Escucha notificaciones que llegan mientras la app está abierta
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (_notification) => {
        // La notificación se muestra automáticamente por el handler configurado
      },
    );

    // Navegar al recordatorio cuando el usuario toca la notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          reminderId?: string;
        };
        if (data?.reminderId && navigationRef.current) {
          navigationRef.current.navigate('ReminderDetail', {
            reminderId: data.reminderId,
          });
        }
      },
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [navigationRef]);
}
