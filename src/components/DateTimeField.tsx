import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../constants/colors';

// En Android el selector es un diálogo. En iOS sigue abierto para mover hora y minutos de corrido.
const CLOSES_ON_CHANGE = Platform.OS !== 'ios';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

export function DateTimeField({ value, onChange }: Props) {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  return (
    <>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.button, showDate && styles.buttonActive]} onPress={() => { setShowDate(!showDate); setShowTime(false); }}>
          <Text style={styles.text}>
            {value.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, showTime && styles.buttonActive]} onPress={() => { setShowTime(!showTime); setShowDate(false); }}>
          <Text style={styles.text}>
            {value.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      </View>

      {showDate && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={new Date()}
          onChange={(_, date) => {
            setShowDate(CLOSES_ON_CHANGE ? false : showDate);
            if (date) {
              const updated = new Date(value);
              updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
              onChange(updated);
            }
          }}
        />
      )}

      {showTime && (
        <DateTimePicker
          value={value}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, date) => {
            setShowTime(CLOSES_ON_CHANGE ? false : showTime);
            if (date) {
              const updated = new Date(value);
              updated.setHours(date.getHours(), date.getMinutes(), 0, 0);
              onChange(updated);
            }
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  buttonActive: { borderColor: Colors.primary },
  text: { color: Colors.text, fontSize: 15, fontWeight: '500' },
});
