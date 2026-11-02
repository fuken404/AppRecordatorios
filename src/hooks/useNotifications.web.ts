import { useCallback, useEffect } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import { onDemoNotificationOpen } from '../demo/demoBus';
import { RootStackParamList } from '../navigation/RootNavigator';

export function useNotifications(
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>,
) {
  useEffect(
    () =>
      onDemoNotificationOpen((reminderId) => {
        if (navigationRef.current?.isReady()) {
          navigationRef.current.navigate('ReminderDetail', { reminderId });
        }
      }),
    [navigationRef],
  );

  return useCallback(() => {}, []);
}
