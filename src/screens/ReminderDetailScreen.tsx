import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useReminders } from '../context/RemindersContext';
import { useCategories } from '../context/CategoriesContext';
import { CategoryBadge } from '../components/CategoryBadge';
import { Colors } from '../constants/colors';
import { formatDate, getNextOccurrences } from '../utils/dateHelpers';
import { RECURRENCE_OPTIONS, DAY_LABELS } from '../constants/recurrence';
import { confirmAction } from '../utils/dialogs';

type Props = NativeStackScreenProps<RootStackParamList, 'ReminderDetail'>;

export function ReminderDetailScreen({ route, navigation }: Props) {
  const { reminderId } = route.params;
  const { reminders, completeReminder, deleteReminder } = useReminders();
  const { categories } = useCategories();

  const reminder = reminders.find((r) => r.id === reminderId);
  if (!reminder) {
    return (
      <View style={styles.notFound}>
        <Text>Recordatorio no encontrado</Text>
      </View>
    );
  }

  const reminderId2 = reminder.id;
  const category = categories.find((c) => c.id === reminder.categoryId) ?? null;
  const isRecurring = reminder.recurrence.frequency !== 'none';
  const recurrenceLabel =
    RECURRENCE_OPTIONS.find((o) => o.value === reminder.recurrence.frequency)?.label ?? '';

  const nextOccurrences = isRecurring
    ? getNextOccurrences(new Date(reminder.dueDate), reminder.recurrence, 3)
    : [];

  function handleComplete() {
    confirmAction(
      'Completar',
      isRecurring
        ? 'Se avanzará al siguiente ciclo del recordatorio.'
        : '¿Marcar como completado?',
      'Confirmar',
      async () => {
        await completeReminder(reminderId2);
        navigation.goBack();
      },
    );
  }

  function handleDelete() {
    confirmAction(
      'Eliminar',
      '¿Eliminar este recordatorio?',
      'Eliminar',
      async () => {
        await deleteReminder(reminderId2);
        navigation.goBack();
      },
      true,
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Estado */}
      <View style={[styles.statusBanner, reminder.status === 'completed' && styles.statusCompleted]}>
        <Text style={styles.statusText}>
          {reminder.status === 'completed' ? '✓ Completado' : isRecurring ? '↻ Recurrente' : '◷ Pendiente'}
        </Text>
      </View>

      {/* Título */}
      <Text style={styles.title}>{reminder.title}</Text>

      {/* Notas */}
      {reminder.notes ? (
        <Text style={styles.notes}>{reminder.notes}</Text>
      ) : null}

      <View style={styles.divider} />

      {/* Categoría */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Categoría</Text>
        <CategoryBadge category={category} />
      </View>

      {/* Fecha */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Fecha</Text>
        <Text style={styles.rowValue}>{formatDate(reminder.dueDate)}</Text>
      </View>

      {/* Recurrencia */}
      {isRecurring && (
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Repetición</Text>
          <View>
            <Text style={styles.rowValue}>{recurrenceLabel}</Text>
            {reminder.recurrence.daysOfWeek && reminder.recurrence.daysOfWeek.length > 0 && (
              <Text style={styles.rowSubValue}>
                {reminder.recurrence.daysOfWeek.map((d) => DAY_LABELS[d]).join(', ')}
              </Text>
            )}
            {reminder.recurrence.intervalDays && (
              <Text style={styles.rowSubValue}>
                Cada {reminder.recurrence.intervalDays} días
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Recordatorio de reintento */}
      {reminder.repeatIfNotCompleted && reminder.repeatIntervalMinutes && (
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Re-aviso</Text>
          <Text style={styles.rowValue}>
            Cada {reminder.repeatIntervalMinutes} min si no se completa
          </Text>
        </View>
      )}

      {/* Próximas ocurrencias */}
      {isRecurring && nextOccurrences.length > 0 && (
        <>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Próximas ocurrencias</Text>
          {nextOccurrences.map((d, i) => (
            <Text key={i} style={styles.occurrence}>
              • {formatDate(d)}
            </Text>
          ))}
        </>
      )}

      <View style={styles.divider} />

      {/* Acciones */}
      {reminder.status !== 'completed' && (
        <TouchableOpacity style={styles.btnPrimary} onPress={handleComplete}>
          <Text style={styles.btnPrimaryText}>Marcar como completado</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.btnSecondary}
        onPress={() => navigation.navigate('ReminderForm', { reminderId: reminder.id })}
      >
        <Text style={styles.btnSecondaryText}>Editar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnDanger} onPress={handleDelete}>
        <Text style={styles.btnDangerText}>Eliminar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBanner: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusCompleted: {
    backgroundColor: Colors.success + '22',
  },
  statusText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  notes: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  rowLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    textAlign: 'right',
    maxWidth: '60%',
  },
  rowSubValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  occurrence: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
    paddingLeft: 4,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  btnSecondary: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnSecondaryText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  btnDanger: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDangerText: {
    color: Colors.danger,
    fontWeight: '600',
    fontSize: 15,
  },
});
