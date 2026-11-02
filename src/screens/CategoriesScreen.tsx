import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useCategories } from '../context/CategoriesContext';
import { useReminders } from '../context/RemindersContext';
import { confirmAction, showMessage } from '../utils/dialogs';
import { Colors } from '../constants/colors';
import { Category } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

function generateId() {
  return 'cat-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function CategoriesScreen(_props: Props) {
  const { categories, addCategory, deleteCategory } = useCategories();
  const { clearCategory } = useReminders();
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(Colors.categoryPresets[0]);

  function handleAdd() {
    if (!newName.trim()) return;
    const cat: Category = {
      id: generateId(),
      name: newName.trim(),
      color: selectedColor,
      createdAt: new Date().toISOString(),
    };
    addCategory(cat);
    setNewName('');
    setSelectedColor(Colors.categoryPresets[0]);
    setModalVisible(false);
  }

  function handleDelete(cat: Category) {
    confirmAction(
      'Eliminar categoría',
      `¿Eliminar "${cat.name}"? Los recordatorios con esta categoría quedarán sin categoría.`,
      'Eliminar',
      async () => {
        await deleteCategory(cat.id);
        await clearCategory(cat.id);
      },
      true,
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay categorías. Crea una con el botón +.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <Text style={styles.name}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.addBtnText}>+ Nueva categoría</Text>
      </TouchableOpacity>

      {/* Modal de creación */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Nueva categoría</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder="Ej: Hogar, Fitness..."
            placeholderTextColor={Colors.textSecondary}
            autoFocus
            maxLength={30}
          />

          <Text style={styles.label}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.colorRow}>
              {Colors.categoryPresets.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Text style={styles.colorCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Preview */}
          <View style={[styles.preview, { backgroundColor: selectedColor + '22' }]}>
            <View style={[styles.previewDot, { backgroundColor: selectedColor }]} />
            <Text style={[styles.previewText, { color: selectedColor }]}>
              {newName || 'Mi categoría'}
            </Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setModalVisible(false);
                setNewName('');
              }}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd}>
              <Text style={styles.confirmText}>Crear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deleteText: {
    color: Colors.danger,
    fontWeight: '500',
    fontSize: 14,
  },
  empty: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 40,
  },
  addBtn: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  // Modal
  modal: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.background,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 24,
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
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
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  colorCheck: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewText: {
    fontWeight: '600',
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    paddingTop: 24,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },
  confirmBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
