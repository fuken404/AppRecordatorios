import { Alert } from 'react-native';

export function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void | Promise<void>,
  destructive = false,
): void {
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: () => void onConfirm() },
  ]);
}

export function showMessage(title: string, message: string): void {
  Alert.alert(title, message);
}
