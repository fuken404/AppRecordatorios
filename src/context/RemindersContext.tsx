import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { AppState } from 'react-native';
import { Reminder } from '../types';
import { getReminders, saveReminders } from '../storage/storage';
import { syncNotifications } from '../notifications/notificationService';
import { nextDueDate } from '../utils/dateHelpers';
import { seedReminders } from '../demo/seed';

// ─── Estado y acciones ───────────────────────────────────────────────────────

interface State {
  reminders: Reminder[];
  loading: boolean;
}

type Action =
  | { type: 'LOADED'; payload: Reminder[] }
  | { type: 'SET'; payload: Reminder[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADED':
      return { reminders: action.payload, loading: false };
    case 'SET':
      return { ...state, reminders: action.payload };
  }
}

// ─── Contexto ────────────────────────────────────────────────────────────────

interface RemindersContextValue {
  reminders: Reminder[];
  loading: boolean;
  saveReminder: (reminder: Reminder) => Promise<void>;
  completeReminder: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  clearCategory: (categoryId: string) => Promise<void>;
}

const RemindersContext = createContext<RemindersContextValue | null>(null);

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { reminders: [], loading: true });

  // La lista más reciente: dos acciones seguidas no deben pisarse con datos viejos.
  const latest = useRef<Reminder[]>([]);

  useEffect(() => {
    let active = true;
    getReminders()
      .then(seedReminders)
      .then((data) => {
        if (!active) return;
        latest.current = data;
        dispatch({ type: 'LOADED', payload: data });
        syncNotifications(data); // también al abrir desde cero, no solo al volver del fondo
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') syncNotifications(latest.current);
    });
    return () => sub.remove();
  }, []);

  async function commit(next: Reminder[]) {
    latest.current = next;
    dispatch({ type: 'SET', payload: next });
    await saveReminders(next);
    await syncNotifications(next);
  }

  async function saveReminder(reminder: Reminder) {
    const exists = latest.current.some((r) => r.id === reminder.id);
    await commit(
      exists
        ? latest.current.map((r) => (r.id === reminder.id ? reminder : r))
        : [...latest.current, reminder],
    );
  }

  async function completeReminder(id: string) {
    const reminder = latest.current.find((r) => r.id === id);
    if (!reminder) return;

    const now = new Date();
    const updated: Reminder =
      reminder.recurrence.frequency !== 'none'
        ? {
            ...reminder,
            dueDate: nextDueDate(new Date(reminder.dueDate), reminder.recurrence, now).toISOString(),
            status: 'pending',
            completedAt: undefined,
            updatedAt: now.toISOString(),
          }
        : {
            ...reminder,
            status: 'completed',
            completedAt: now.toISOString(),
            updatedAt: now.toISOString(),
          };
    await commit(latest.current.map((r) => (r.id === id ? updated : r)));
  }

  async function deleteReminder(id: string) {
    await commit(latest.current.filter((r) => r.id !== id));
  }

  async function clearCategory(categoryId: string) {
    await commit(
      latest.current.map((r) => (r.categoryId === categoryId ? { ...r, categoryId: null } : r)),
    );
  }

  return (
    <RemindersContext.Provider
      value={{
        reminders: state.reminders,
        loading: state.loading,
        saveReminder,
        completeReminder,
        deleteReminder,
        clearCategory,
      }}
    >
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders() {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders debe usarse dentro de RemindersProvider');
  return ctx;
}
