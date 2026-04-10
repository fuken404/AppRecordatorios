import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useReminders } from '../context/RemindersContext';
import { useCategories } from '../context/CategoriesContext';
import { Colors } from '../constants/colors';
import {
  RECURRENCE_OPTIONS,
  DAY_LABELS,
  REPEAT_INTERVAL_OPTIONS,
} from '../constants/recurrence';
import { Reminder, RecurrenceRule, RecurrenceFrequency } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ReminderForm'>;

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function ReminderFormScreen({ route, navigation }: Props) {
  const { reminderId } = route.params ?? {};
  const { reminders, saveReminder } = useReminders();
  const { categories } = useCategories();

  const existing = reminderId ? reminders.find((r) => r.id === reminderId) : null;

  // ─── Estado del formulario ───────────────────────────────────────────────
  const [title, setTitle] = useState(existing?.title ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(existing?.categoryId ?? null);
  const [dueDate, setDueDate] = useState(
    existing ? new Date(existing.dueDate) : (() => {
      const d = new Date();
      d.setMinutes(d.getMinutes() + 30, 0, 0);
      return d;
    })(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [frequency, setFrequency] = useState<RecurrenceFrequency>(
    existing?.recurrence.frequency ?? 'none',
  );
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    existing?.recurrence.daysOfWeek ?? [],
  );
  const [dayOfMonth, setDayOfMonth] = useState<string>(
    existing?.recurrence.dayOfMonth?.toString() ?? '',
  );
  const [intervalDays, setIntervalDays] = useState<string>(
    existing?.recurrence.intervalDays?.toString() ?? '',
  );

  const [repeatIfNotCompleted, setRepeatIfNotCompleted] = useState(
    existing?.repeatIfNotCompleted ?? false,
  );
  const [repeatInterval, setRepeatInterval] = useState<number>(
    existing?.repeatIntervalMinutes ?? 30,
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: existing ? 'Editar recordatorio' : 'Nuevo recordatorio' });
  }, [existing, navigation]);

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function buildRecurrenceRule(): RecurrenceRule {
    return {
      frequency,
      daysOfWeek: frequency === 'weekly' ? daysOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' ? parseInt(dayOfMonth) || undefined : undefined,
      intervalDays: frequency === 'custom' ? parseInt(intervalDays) || 1 : undefined,
    };
  }

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Título requerido', 'Por favor ingresa un título para el recordatorio.');
      return;
    }

    if (dueDate <= new Date()) {
      Alert.alert('Fecha inválida', 'La fecha debe ser en el futuro.');
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const reminder: Reminder = {
        id: existing?.id ?? generateId(),
        title: title.trim(),
        notes: notes.trim() || undefined,
        categoryId,
        dueDate: dueDate.toISOString(),
        recurrence: buildRecurrenceRule(),
        status: 'pending',
        scheduledNotificationIds: existing?.scheduledNotificationIds ?? [],
        repeatIfNotCompleted,
        repeatIntervalMinutes: repeatIfNotCompleted ? repeatInterval : undefined,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      await saveReminder(reminder);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el recordatorio.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      {/* Título */}
      <Text style={styles.label}>Título *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="¿Qué necesitas recordar?"
        placeholderTextColor={Colors.textSecondary}
        maxLength={100}
        autoFocus={!existing}
      />

      {/* Notas */}
      <Text style={styles.label}>Notas</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Detalles opcionales..."
        placeholderTextColor={Colors.textSecondary}
        multiline
        numberOfLines={3}
        maxLength={500}
      />

      {/* Categoría */}
      <Text style={styles.label}>Categoría</Text>
      <View style={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, categoryId === null && styles.chipSelected]}
          onPress={() => setCategoryId(null)}
        >
          <Text style={[styles.chipText, categoryId === null && styles.chipTextSelected]}>
            Sin categoría
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.chip,
              categoryId === cat.id && { backgroundColor: cat.color, borderColor: cat.color },
            ]}
            onPress={() => setCategoryId(cat.id)}
          >
            <Text
              style={[
                styles.chipText,
                categoryId === cat.id && styles.chipTextSelected,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fecha y hora */}
      <Text style={styles.label}>Fecha y hora</Text>
      <View style={styles.dateRow}>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateBtnText}>
            {dueDate.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.dateBtnText}>
            {dueDate.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={new Date()}
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) {
              const updated = new Date(dueDate);
              updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
              setDueDate(updated);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={dueDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, date) => {
            setShowTimePicker(false);
            if (date) {
              const updated = new Date(dueDate);
              updated.setHours(date.getHours(), date.getMinutes(), 0, 0);
              setDueDate(updated);
            }
          }}
        />
      )}

      {/* Recurrencia */}
      <Text style={styles.label}>Repetición</Text>
      <View style={styles.chips}>
        {RECURRENCE_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, frequency === opt.value && styles.chipSelected]}
            onPress={() => setFrequency(opt.value)}
          >
            <Text style={[styles.chipText, frequency === opt.value && styles.chipTextSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Opciones de recurrencia semanal */}
      {frequency === 'weekly' && (
        <View style={styles.daysRow}>
          {DAY_LABELS.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dayChip, daysOfWeek.includes(index) && styles.dayChipSelected]}
              onPress={() => toggleDay(index)}
            >
              <Text style={[styles.dayText, daysOfWeek.includes(index) && styles.dayTextSelected]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {frequency === 'monthly' && (
        <View>
          <TextInput
            style={styles.input}
            value={dayOfMonth}
            onChangeText={(v) => setDayOfMonth(v.replace(/\D/g, ''))}
            placeholder="Día del mes (1–31)"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
      )}

      {frequency === 'custom' && (
        <TextInput
          style={styles.input}
          value={intervalDays}
          onChangeText={(v) => setIntervalDays(v.replace(/\D/g, ''))}
          placeholder="Cada cuántos días"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="number-pad"
          maxLength={3}
        />
      )}

      {/* Re-aviso si no se completa */}
      <View style={styles.switchRow}>
        <View>
          <Text style={styles.switchLabel}>Re-aviso si no se completa</Text>
          <Text style={styles.switchSub}>Volver a notificar si no marcas como hecho</Text>
        </View>
        <Switch
          value={repeatIfNotCompleted}
          onValueChange={setRepeatIfNotCompleted}
          trackColor={{ true: Colors.primary }}
          thumbColor={Platform.OS === 'android' ? Colors.surface : undefined}
        />
      </View>

      {repeatIfNotCompleted && (
        <View>
          <Text style={styles.label}>Intervalo de re-aviso</Text>
          <View style={styles.chips}>
            {REPEAT_INTERVAL_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, repeatInterval === opt.value && styles.chipSelected]}
                onPress={() => setRepeatInterval(opt.value)}
              >
                <Text style={[styles.chipText, repeatInterval === opt.value && styles.chipTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Guardar */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : 'Guardar recordatorio'}</Text>
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
    paddingBottom: 50,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dateBtnText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  dayChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dayTextSelected: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  switchSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    maxWidth: 220,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 17,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
