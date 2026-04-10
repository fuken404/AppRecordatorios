import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { AppState } from 'react-native';
import { Reminder } from '../types';
import { getReminders, saveReminders } from '../storage/storage';
import {
  scheduleReminder,
  cancelReminderNotifications,
  replenishNotifications,
} from '../notifications/notificationService';
import { getNextOccurrences } from '../utils/dateHelpers';

// ─── Estado y acciones ───────────────────────────────────────────────────────

interface State {
  reminders: Reminder[];
  loading: boolean;
}

type Action =
  | { type: 'LOADED'; payload: Reminder[] }
  | { type: 'ADD'; payload: Reminder }
  | { type: 'UPDATE'; payload: Reminder }
  | { type: 'DELETE'; id: string }
  | { type: 'UPDATE_NOTIFICATION_IDS'; id: string; ids: string[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADED':
      return { reminders: action.payload, loading: false };
    case 'ADD':
      return { ...state, reminders: [...state.reminders, action.payload] };
    case 'UPDATE':
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.payload.id ? action.payload : r,
        ),
      };
    case 'DELETE':
      return { ...state, reminders: state.reminders.filter((r) => r.id !== action.id) };
    case 'UPDATE_NOTIFICATION_IDS':
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.id ? { ...r, scheduledNotificationIds: action.ids } : r,
        ),
      };
  }
}

// ─── Contexto ────────────────────────────────────────────────────────────────

interface RemindersContextValue {
  reminders: Reminder[];
  loading: boolean;
  saveReminder: (reminder: Reminder) => Promise<void>;
  completeReminder: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
}

const RemindersContext = createContext<RemindersContextValue | null>(null);

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { reminders: [], loading: true });

  // Carga inicial
  useEffect(() => {
    getReminders().then((data) => dispatch({ type: 'LOADED', payload: data }));
  }, []);

  // Reponer notificaciones cuando la app vuelve al primer plano
  useEffect(() => {
    if (state.loading) return;

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        replenishNotifications(state.reminders, (id, newIds) => {
          dispatch({ type: 'UPDATE_NOTIFICATION_IDS', id, ids: newIds });
        });
      }
    });

    return () => sub.remove();
  }, [state.loading, state.reminders]);

  async function saveReminder(reminder: Reminder) {
    const ids = await scheduleReminder(reminder);
    const withIds = { ...reminder, scheduledNotificationIds: ids };

    const exists = state.reminders.some((r) => r.id === reminder.id);
    let updated: Reminder[];

    if (exists) {
      updated = state.reminders.map((r) => (r.id === withIds.id ? withIds : r));
      dispatch({ type: 'UPDATE', payload: withIds });
    } else {
      updated = [...state.reminders, withIds];
      dispatch({ type: 'ADD', payload: withIds });
    }

    await saveReminders(updated);
  }

  async function completeReminder(id: string) {
    const reminder = state.reminders.find((r) => r.id === id);
    if (!reminder) return;

    const isRecurring = reminder.recurrence.frequency !== 'none';

    if (isRecurring) {
      // Avanzar al siguiente ciclo
      const next = getNextOccurrences(new Date(reminder.dueDate), reminder.recurrence, 2);
      const nextDate = next.length > 1 ? next[1] : next[0];
      const updated: Reminder = {
        ...reminder,
        dueDate: nextDate.toISOString(),
        status: 'pending',
        completedAt: undefined,
        updatedAt: new Date().toISOString(),
      };
      await saveReminder(updated);
    } else {
      // Cancelar notificaciones y marcar como completado
      await cancelReminderNotifications(reminder.scheduledNotificationIds);
      const updated: Reminder = {
        ...reminder,
        status: 'completed',
        completedAt: new Date().toISOString(),
        scheduledNotificationIds: [],
        updatedAt: new Date().toISOString(),
      };
      const newList = state.reminders.map((r) => (r.id === id ? updated : r));
      dispatch({ type: 'UPDATE', payload: updated });
      await saveReminders(newList);
    }
  }

  async function deleteReminder(id: string) {
    const reminder = state.reminders.find((r) => r.id === id);
    if (reminder) {
      await cancelReminderNotifications(reminder.scheduledNotificationIds);
    }
    const updated = state.reminders.filter((r) => r.id !== id);
    dispatch({ type: 'DELETE', id });
    await saveReminders(updated);
  }

  return (
    <RemindersContext.Provider
      value={{
        reminders: state.reminders,
        loading: state.loading,
        saveReminder,
        completeReminder,
        deleteReminder,
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
