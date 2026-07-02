import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  SPEED_PROFILE_LABELS,
  SPEED_PROFILES,
} from '../../services/tripod';
import type {SpeedProfile} from '../../types/scene';

interface TripodTestControlsProps {
  disabled?: boolean;
  onMove: (pan: number, tilt: number, height: number, profile: SpeedProfile) => void;
  onStop: () => void;
}

export function TripodTestControls({
  disabled = false,
  onMove,
  onStop,
}: TripodTestControlsProps) {
  const [profile, setProfile] = useState<SpeedProfile>('slow');

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>בדיקת תנועה</Text>

      <View style={styles.profiles}>
        {SPEED_PROFILES.map(item => {
          const active = profile === item;
          return (
            <Pressable
              key={item}
              style={[styles.chip, active && styles.chipActive]}
              disabled={disabled}
              onPress={() => setProfile(item)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {SPEED_PROFILE_LABELS[item]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.grid}>
        <ControlButton
          label="Pan +5°"
          disabled={disabled}
          onPress={() => onMove(5, 0, 0, profile)}
        />
        <ControlButton
          label="Pan -5°"
          disabled={disabled}
          onPress={() => onMove(-5, 0, 0, profile)}
        />
        <ControlButton
          label="Tilt +3°"
          disabled={disabled}
          onPress={() => onMove(0, 3, 0, profile)}
        />
        <ControlButton
          label="Tilt -3°"
          disabled={disabled}
          onPress={() => onMove(0, -3, 0, profile)}
        />
        <ControlButton
          label="Height +2"
          disabled={disabled}
          onPress={() => onMove(0, 0, 2, profile)}
        />
        <ControlButton
          label="Height -2"
          disabled={disabled}
          onPress={() => onMove(0, 0, -2, profile)}
        />
      </View>

      <Pressable
        style={[styles.stopBtn, disabled && styles.disabled]}
        disabled={disabled}
        onPress={onStop}>
        <Text style={styles.stopText}>עצירת חירום</Text>
      </Pressable>
    </View>
  );
}

function ControlButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.btn, disabled && styles.disabled]}
      disabled={disabled}
      onPress={onPress}>
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  profiles: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  chipActive: {
    backgroundColor: '#2563eb',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    writingDirection: 'rtl',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  btn: {
    width: '48%',
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1d4ed8',
    writingDirection: 'rtl',
  },
  stopBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  stopText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  disabled: {
    opacity: 0.5,
  },
});
