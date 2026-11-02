import { describe, expect, it } from 'vitest';
import { notificationTitle, planNotifications } from '../src/notifications/planner';
import { Reminder } from '../src/types';

const NOW = new Date(2026, 10, 2, 8, 5);

function reminder(partial: Partial<Reminder>): Reminder {
  return {
    id: 'r',
    title: 'Pagar',
    categoryId: null,
    dueDate: new Date(2026, 10, 3, 8).toISOString(),
    recurrence: { frequency: 'none' },
    status: 'pending',
    repeatIfNotCompleted: false,
    createdAt: '',
    updatedAt: '',
    ...partial,
  };
}

describe('planNotifications', () => {
  it('completado o vencido sin repetición: no avisa', () => {
    expect(planNotifications([reminder({ status: 'completed' })], NOW)).toEqual([]);
    expect(planNotifications([reminder({ dueDate: new Date(2026, 10, 1).toISOString() })], NOW)).toEqual([]);
  });

  it('agrega los re-avisos', () => {
    const plan = planNotifications([reminder({ repeatIfNotCompleted: true, repeatIntervalMinutes: 15 })], NOW);
    expect(plan.map((p) => p.isNag)).toEqual([false, true, true]);
    expect(plan[1].date).toEqual(new Date(2026, 10, 3, 8, 15));
    expect(notificationTitle(plan[1])).toBe('⏰ Pendiente: Pagar');
  });

  it('conserva los re-avisos de una ocurrencia que acaba de pasar', () => {
    const plan = planNotifications(
      [reminder({ dueDate: new Date(2026, 10, 2, 8).toISOString(), recurrence: { frequency: 'daily' }, repeatIfNotCompleted: true, repeatIntervalMinutes: 15 })],
      NOW,
    );
    expect(plan[0].date).toEqual(new Date(2026, 10, 2, 8, 15));
    expect(plan[0].isNag).toBe(true);
  });

  it('nunca pasa del límite y prioriza los más próximos', () => {
    const reminders = Array.from({ length: 30 }, (_, i) =>
      reminder({ id: `r${i}`, dueDate: new Date(2026, 10, 3 + i, 8).toISOString(), recurrence: { frequency: 'daily' }, repeatIfNotCompleted: true, repeatIntervalMinutes: 15 }),
    );
    const plan = planNotifications(reminders, NOW);
    expect(plan).toHaveLength(60);
    const times = plan.map((p) => p.date.getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(plan[0].date).toEqual(new Date(2026, 10, 3, 8));
  });

  it('un recordatorio único lejano no se pierde si cabe', () => {
    const far = reminder({ id: 'lejano', dueDate: new Date(2027, 5, 1).toISOString() });
    const plan = planNotifications([reminder({ recurrence: { frequency: 'weekly', daysOfWeek: [1] } }), far], NOW);
    expect(plan.some((p) => p.reminderId === 'lejano')).toBe(true);
  });
});
