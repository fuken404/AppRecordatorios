import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, Reminder } from '../types';

const KEYS = {
  REMINDERS: '@reminders',
  CATEGORIES: '@categories',
} as const;

// ─── Categorías ───────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-personal', name: 'Personal', color: '#4A90D9', createdAt: new Date().toISOString() },
  { id: 'cat-trabajo',  name: 'Trabajo',  color: '#E74C3C', createdAt: new Date().toISOString() },
  { id: 'cat-salud',    name: 'Salud',    color: '#2ECC71', createdAt: new Date().toISOString() },
];

export async function getCategories(): Promise<Category[]> {
  const raw = await AsyncStorage.getItem(KEYS.CATEGORIES);
  if (!raw) {
    await saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return JSON.parse(raw) as Category[];
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
}

// ─── Recordatorios ────────────────────────────────────────────────────────────

export async function getReminders(): Promise<Reminder[]> {
  const raw = await AsyncStorage.getItem(KEYS.REMINDERS);
  return raw ? (JSON.parse(raw) as Reminder[]) : [];
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
}
