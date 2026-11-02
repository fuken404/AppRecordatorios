import { describe, expect, it } from 'vitest';
import { alignToRule, getLastOccurrence, getNextOccurrences, nextDueDate } from '../src/utils/dateHelpers';

const at = (y: number, m: number, d: number, h = 8) => new Date(y, m - 1, d, h, 0, 0, 0);
const NOW = at(2026, 11, 2, 13);

describe('completar un recurrente', () => {
  it('vencido: sigue con la próxima ocurrencia, sin saltarla', () => {
    expect(nextDueDate(at(2026, 11, 1), { frequency: 'daily' }, NOW)).toEqual(at(2026, 11, 3));
  });

  it('vencido hace días: no pide ponerse al día', () => {
    expect(nextDueDate(at(2026, 10, 1), { frequency: 'daily' }, NOW)).toEqual(at(2026, 11, 3));
  });

  it('antes de tiempo: avanza un ciclo desde la fecha prevista', () => {
    expect(nextDueDate(at(2026, 11, 5), { frequency: 'daily' }, NOW)).toEqual(at(2026, 11, 6));
  });
});

describe('semanal', () => {
  it('el primer aviso cae en un día elegido', () => {
    // 3 de noviembre de 2026 es martes; se pide viernes.
    const [first] = getNextOccurrences(at(2026, 11, 3), { frequency: 'weekly', daysOfWeek: [5] }, 1, NOW);
    expect(first).toEqual(at(2026, 11, 6));
  });

  it('recorre varios días en orden', () => {
    const list = getNextOccurrences(at(2026, 11, 3), { frequency: 'weekly', daysOfWeek: [1, 3] }, 3, NOW);
    expect(list).toEqual([at(2026, 11, 4), at(2026, 11, 9), at(2026, 11, 11)]);
  });
});

describe('mensual', () => {
  it('el día 31 se ajusta a meses cortos y no se queda corrido', () => {
    const list = getNextOccurrences(at(2027, 1, 31), { frequency: 'monthly', dayOfMonth: 31 }, 3, NOW);
    expect(list).toEqual([at(2027, 1, 31), at(2027, 2, 28), at(2027, 3, 31)]);
  });

  it('si el día ya pasó este mes, arranca el siguiente', () => {
    expect(alignToRule(at(2026, 11, 20), { frequency: 'monthly', dayOfMonth: 5 })).toEqual(at(2026, 12, 5));
  });
});

describe('personalizado y ocurrencia pasada', () => {
  it('un intervalo inválido no causa un ciclo sin fin', () => {
    const [first, second] = getNextOccurrences(at(2026, 11, 3), { frequency: 'custom', intervalDays: 0 }, 2, NOW);
    expect(second.getTime() - first.getTime()).toBe(24 * 60 * 60 * 1000);
  });

  it('encuentra la última ocurrencia ya pasada', () => {
    expect(getLastOccurrence(at(2026, 10, 30), { frequency: 'daily' }, NOW)).toEqual(at(2026, 11, 2));
    expect(getLastOccurrence(at(2026, 11, 5), { frequency: 'daily' }, NOW)).toBeNull();
  });
});
