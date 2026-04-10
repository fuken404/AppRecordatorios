import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useReminders } from '../context/RemindersContext';
import { useCategories } from '../context/CategoriesContext';
import { ReminderCard } from '../components/ReminderCard';
import { EmptyState } from '../components/EmptyState';
import { FAB } from '../components/FAB';
import { Colors } from '../constants/colors';
import { isToday, isThisWeek } from '../utils/dateHelpers';
import { Reminder } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type Filter = 'all' | 'today' | 'week' | string; // string = categoryId

const FILTERS = [
  { label: 'Todos', value: 'all' as Filter },
  { label: 'Hoy', value: 'today' as Filter },
  { label: 'Esta semana', value: 'week' as Filter },
];

export function HomeScreen({ navigation }: Props) {
  const { reminders, loading, completeReminder, deleteReminder } = useReminders();
  const { categories } = useCategories();
  const [filter, setFilter] = useState<Filter>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  const categoryFilters = categories.map((c) => ({ label: c.name, value: c.id }));
  const allFilters = [...FILTERS, ...categoryFilters];

  const filtered = useMemo(() => {
    let list = reminders.filter((r) =>
      showCompleted ? true : r.status !== 'completed',
    );

    if (filter === 'today') list = list.filter((r) => isToday(r.dueDate));
    else if (filter === 'week') list = list.filter((r) => isThisWeek(r.dueDate));
    else if (filter !== 'all') list = list.filter((r) => r.categoryId === filter);

    return list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [reminders, filter, showCompleted]);

  function getCategoryForReminder(reminder: Reminder) {
    return categories.find((c) => c.id === reminder.categoryId) ?? null;
  }

  function handleComplete(id: string) {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;

    if (reminder.recurrence.frequency !== 'none') {
      Alert.alert(
        'Completar recordatorio',
        'Es un recordatorio recurrente. Se marcará como hecho y se programará la siguiente ocurrencia.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: () => completeReminder(id) },
        ],
      );
    } else {
      completeReminder(id);
    }
  }

  function handleDelete(id: string) {
    Alert.alert('Eliminar recordatorio', '¿Seguro que quieres eliminarlo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteReminder(id) },
    ]);
  }

  if (loading) return null;

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {allFilters.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text
              style={[styles.filterLabel, filter === f.value && styles.filterLabelActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.filterChip, showCompleted && styles.filterChipActive]}
          onPress={() => setShowCompleted((v) => !v)}
        >
          <Text style={[styles.filterLabel, showCompleted && styles.filterLabelActive]}>
            Completados
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Lista */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={filtered.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          <EmptyState
            title="Sin recordatorios"
            subtitle="Toca el botón + para crear tu primer recordatorio"
          />
        }
        renderItem={({ item }) => (
          <ReminderCard
            reminder={item}
            category={getCategoryForReminder(item)}
            onPress={() => navigation.navigate('ReminderDetail', { reminderId: item.id })}
            onComplete={() => handleComplete(item.id)}
          />
        )}
      />

      <FAB onPress={() => navigation.navigate('ReminderForm', {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filtersContainer: {
    flexGrow: 0,
    paddingVertical: 12,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterLabelActive: {
    color: '#fff',
  },
  list: {
    paddingVertical: 8,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
});
