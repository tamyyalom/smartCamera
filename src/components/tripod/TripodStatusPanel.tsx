import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {TripodState} from '../../types/ai';
import type {TripodDevice} from '../../services/tripod';

interface TripodStatusPanelProps {
  device: TripodDevice | null;
  state: TripodState | null;
  modeLabel: string;
  lastAction?: string | null;
}

export function TripodStatusPanel({
  device,
  state,
  modeLabel,
  lastAction,
}: TripodStatusPanelProps) {
  const connected = state?.connected ?? false;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>סטטוס חיבור</Text>
        <View style={[styles.badge, connected ? styles.badgeOn : styles.badgeOff]}>
          <Text style={styles.badgeText}>
            {connected ? 'מחובר' : 'לא מחובר'}
          </Text>
        </View>
      </View>

      <Text style={styles.line}>
        מצב: <Text style={styles.value}>{modeLabel}</Text>
      </Text>
      {device ? (
        <Text style={styles.line}>
          מכשיר: <Text style={styles.value}>{device.name}</Text>
        </Text>
      ) : null}

      {state ? (
        <View style={styles.metrics}>
          <Metric label="Pan" value={`${state.pan.toFixed(1)}°`} />
          <Metric label="Tilt" value={`${state.tilt.toFixed(1)}°`} />
          <Metric label="Height" value={`${state.height.toFixed(0)} cm`} />
        </View>
      ) : null}

      {lastAction ? (
        <Text style={styles.lastAction}>{lastAction}</Text>
      ) : null}
    </View>
  );
}

function Metric({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    writingDirection: 'rtl',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeOn: {
    backgroundColor: '#dcfce7',
  },
  badgeOff: {
    backgroundColor: '#f1f5f9',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    writingDirection: 'rtl',
  },
  line: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  value: {
    color: '#0f172a',
    fontWeight: '600',
  },
  metrics: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginTop: 4,
  },
  metric: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  lastAction: {
    fontSize: 13,
    color: '#16a34a',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
