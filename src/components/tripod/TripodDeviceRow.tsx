import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {TripodDevice} from '../../services/tripod';

interface TripodDeviceRowProps {
  device: TripodDevice;
  selected: boolean;
  onPress: () => void;
}

export function TripodDeviceRow({device, selected, onPress}: TripodDeviceRowProps) {
  return (
    <Pressable
      style={[styles.row, selected && styles.rowSelected]}
      onPress={onPress}>
      <View style={styles.info}>
        <Text style={styles.name}>{device.name}</Text>
        <Text style={styles.meta}>
          {device.rssi != null ? `עוצמת אות ${device.rssi} dBm` : 'אות לא זמין'}
        </Text>
      </View>
      <View style={[styles.dot, selected && styles.dotSelected]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 12,
  },
  rowSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  meta: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  dotSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
});
