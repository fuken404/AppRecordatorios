// En el navegador Alert.alert no hace nada: sin esto, completar o borrar no respondería.

export function confirmAction(
  title: string,
  message: string,
  _confirmLabel: string,
  onConfirm: () => void | Promise<void>,
  _destructive = false,
): void {
  if (window.confirm(`${title}\n\n${message}`)) void onConfirm();
}

export function showMessage(title: string, message: string): void {
  window.alert(`${title}\n\n${message}`);
}
