export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
}

export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  daysOfWeek?: number[];   // 0=Dom, 1=Lun, ..., 6=Sab (solo weekly)
  dayOfMonth?: number;     // 1–31 (solo monthly)
  intervalDays?: number;   // (solo custom)
}

export type ReminderStatus = 'pending' | 'completed' | 'snoozed';

export interface Reminder {
  id: string;
  title: string;
  notes?: string;
  categoryId: string | null;
  dueDate: string;                    // ISO 8601
  recurrence: RecurrenceRule;
  status: ReminderStatus;
  completedAt?: string;
  repeatIfNotCompleted: boolean;
  repeatIntervalMinutes?: number;
  createdAt: string;
  updatedAt: string;
}
