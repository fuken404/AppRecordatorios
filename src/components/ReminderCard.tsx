import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Reminder, Category } from '../types';
import { CategoryBadge } from './CategoryBadge';
import { Colors } from '../constants/colors';
import { formatDate, isOverdue } from '../utils/dateHelpers';

interface Props {
  reminder: Reminder;
  category: Category | null;
  onPress: () => void;
  onComplete: () => void;
}

const RECURRENCE_LABELS: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  custom: 'Personalizado',
};

export function ReminderCard({ reminder, category, onPress, onComplete }: Props) {
  const overdue = reminder.status === 'pending' && isOverdue(reminder.dueDate);
  const completed = reminder.status === 'completed';

  return (
    <TouchableOpacity
      style={[styles.card, completed && styles.cardCompleted]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Franja de color de categoría */}
      {category && (
        <View style={[styles.colorBar, { backgroundColor: category.color }]} />
      )}

      <View style={styles.content}>
        {/* Encabezado: checkbox + título */}
        <View style={styles.header}>
          <Pressable style={styles.checkboxArea} onPress={onComplete}>
            <View style={[styles.checkbox, completed && styles.checkboxChecked]}>
              {completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </Pressable>

          <Text
            style={[styles.title, completed && styles.titleCompleted, overdue && styles.titleOverdue]}
            numberOfLines={2}
          >
            {reminder.title}
          </Text>
        </View>

        {/* Metadatos */}
        <View style={styles.meta}>
          <CategoryBadge category={category} small />

          <View style={styles.dateRow}>
            <Text style={[styles.date, overdue && styles.dateOverdue]}>
              {overdue ? '⚠ ' : ''}{formatDate(reminder.dueDate)}
            </Text>
            {reminder.recurrence.frequency !== 'none' && (
              <View style={styles.recurrencePill}>
                <Text style={styles.recurrenceText}>
                  ↻ {RECURRENCE_LABELS[reminder.recurrence.frequency]}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 5,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardCompleted: {
    opacity: 0.55,
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkboxArea: {
    paddingTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  titleOverdue: {
    color: Colors.danger,
  },
  meta: {
    marginLeft: 32,
    gap: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dateOverdue: {
    color: Colors.danger,
    fontWeight: '600',
  },
  recurrencePill: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recurrenceText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
  },
});
