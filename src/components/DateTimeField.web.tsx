import React from 'react';
import { format } from 'date-fns';
import { Colors } from '../constants/colors';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

const FORMAT = "yyyy-MM-dd'T'HH:mm";

export function DateTimeField({ value, onChange }: Props) {
  return (
    <input
      type="datetime-local"
      aria-label="Fecha y hora"
      value={format(value, FORMAT)}
      min={format(new Date(), FORMAT)}
      onChange={(event) => {
        const next = new Date(event.target.value);
        if (!Number.isNaN(next.getTime())) onChange(next);
      }}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        minHeight: 46,
        padding: '0 12px',
        borderRadius: 10,
        border: `1px solid ${Colors.border}`,
        background: Colors.surface,
        color: Colors.text,
        fontSize: 16,
        fontFamily: 'inherit',
      }}
    />
  );
}
