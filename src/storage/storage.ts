import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, Reminder } from '../types';

const KEYS = {
  REMINDERS: '@reminders',
  CATEGORIES: '@categories',
} as const;

/** Si los datos están dañados, los aparta en vez de cerrar la app al abrirla. */
function parseList<T>(raw: string, key: string): T[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as T[];
  } catch {
    // se aparta abajo
  }
  AsyncStorage.setItem(`${key}.corrupt`, raw).catch(() => {});
  return null;
}

// ─── Categorías ───────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-personal', name: 'Personal', color: '#0E5A5F', createdAt: new Date().toISOString() },
  { id: 'cat-trabajo',  name: 'Trabajo',  color: '#E74C3C', createdAt: new Date().toISOString() },
  { id: 'cat-salud',    name: 'Salud',    color: '#2ECC71', createdAt: new Date().toISOString() },
];

export async function getCategories(): Promise<Category[]> {
  const raw = await AsyncStorage.getItem(KEYS.CATEGORIES);
  if (!raw) {
    await saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return parseList<Category>(raw, KEYS.CATEGORIES) ?? DEFAULT_CATEGORIES;
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
}

// ─── Recordatorios ────────────────────────────────────────────────────────────

export async function getReminders(): Promise<Reminder[]> {
  const raw = await AsyncStorage.getItem(KEYS.REMINDERS);
  return raw ? (parseList<Reminder>(raw, KEYS.REMINDERS) ?? []) : [];
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
}
