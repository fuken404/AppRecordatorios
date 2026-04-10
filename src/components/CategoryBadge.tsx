import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Category } from '../types';

interface Props {
  category: Category | null;
  small?: boolean;
}

export function CategoryBadge({ category, small }: Props) {
  if (!category) return null;

  return (
    <View style={[styles.badge, { backgroundColor: category.color + '22' }, small && styles.small]}>
      <View style={[styles.dot, { backgroundColor: category.color }]} />
      <Text style={[styles.label, { color: category.color }, small && styles.smallText]}>
        {category.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 10,
  },
});
