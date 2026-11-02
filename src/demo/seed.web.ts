import { addDays, addMinutes, addSeconds, setHours, setMinutes } from 'date-fns';
import { saveReminders } from '../storage/storage';
import { Reminder } from '../types';

const SEEDED_KEY = '@demo-seeded';
const FIRST_NOTICE_SECONDS = 40;

function sample(partial: Partial<Reminder> & Pick<Reminder, 'id' | 'title' | 'dueDate'>): Reminder {
  const now = new Date().toISOString();
  return {
    categoryId: null,
    recurrence: { frequency: 'none' },
    status: 'pending',
    repeatIfNotCompleted: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

/** Solo la primera visita: si alguien borra los ejemplos, no vuelven a aparecer. */
export async function seedReminders(reminders: Reminder[]): Promise<Reminder[]> {
  if (reminders.length > 0 || localStorage.getItem(SEEDED_KEY)) return reminders;
  localStorage.setItem(SEEDED_KEY, '1');

  const now = new Date();
  const morning = setMinutes(setHours(addDays(now, 1), 8), 0);
  const seeded = [
    sample({
      id: 'demo-aviso',
      title: 'Este aviso llegará en unos segundos',
      notes: 'Tócalo cuando aparezca para abrir el recordatorio.',
      dueDate: addSeconds(now, FIRST_NOTICE_SECONDS).toISOString(),
      categoryId: 'cat-personal',
    }),
    sample({
      id: 'demo-medicina',
      title: 'Tomar la vitamina',
      dueDate: morning.toISOString(),
      categoryId: 'cat-salud',
      recurrence: { frequency: 'daily' },
      repeatIfNotCompleted: true,
      repeatIntervalMinutes: 15,
    }),
    sample({
      id: 'demo-informe',
      title: 'Enviar el informe semanal',
      dueDate: addMinutes(addDays(morning, 2), 60).toISOString(),
      categoryId: 'cat-trabajo',
      recurrence: { frequency: 'weekly', daysOfWeek: [addDays(morning, 2).getDay()] },
    }),
  ];
  await saveReminders(seeded);
  return seeded;
}
