import { RecurrenceFrequency } from '../types';

export const RECURRENCE_OPTIONS: { label: string; value: RecurrenceFrequency }[] = [
  { label: 'Sin repetición', value: 'none' },
  { label: 'Diario', value: 'daily' },
  { label: 'Semanal', value: 'weekly' },
  { label: 'Mensual', value: 'monthly' },
  { label: 'Personalizado', value: 'custom' },
];

export const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const REPEAT_INTERVAL_OPTIONS = [
  { label: '15 minutos', value: 15 },
  { label: '30 minutos', value: 30 },
  { label: '1 hora', value: 60 },
  { label: '2 horas', value: 120 },
];

// iOS conserva 64 avisos pendientes por app y descarta el resto sin avisar.
export const MAX_SCHEDULED_NOTIFICATIONS = 60;
export const OCCURRENCES_PER_REMINDER = 30;
export const NAGS_PER_OCCURRENCE = 2;
