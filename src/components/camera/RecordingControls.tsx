import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import type {RecordingPhase} from '../../hooks/useVideoRecorder';
import {a11yButton} from '../../utils/accessibility';

interface RecordingControlsProps {
  phase: RecordingPhase;
  elapsedLabel: string;
  isBusy: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onSnapshot: () => void;
}

export function RecordingControls({
  phase,
  elapsedLabel,
  isBusy,
  onStart,
  onStop,
  onPause,
  onResume,
  onCancel,
  onSnapshot,
}: RecordingControlsProps) {
  const isActive = phase === 'recording' || phase === 'paused';

  return (
    <View style={styles.container}>
      {isActive && (
        <View
          style={[
            styles.timerBadge,
            phase === 'paused' && styles.timerBadgePaused,
          ]}>
          <View
            style={[
              styles.dot,
              phase === 'recording' && styles.dotRecording,
              phase === 'paused' && styles.dotPaused,
            ]}
          />
          <Text style={styles.timerText}>
            {phase === 'paused' ? `מושהה · ${elapsedLabel}` : elapsedLabel}
          </Text>
        </View>
      )}

      <View style={styles.row}>
        {isActive ? (
          <>
            <ActionButton
              label="ביטול"
              onPress={onCancel}
              disabled={isBusy}
              destructive
            />
            <Pressable
              {...a11yButton('עצור הקלטה', {disabled: isBusy})}
              style={[styles.shutter, styles.shutterStop, isBusy && styles.disabled]}
              onPress={onStop}
              disabled={isBusy}>
              {isBusy ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.shutterStopInner} />
              )}
            </Pressable>
            {phase === 'recording' ? (
              <ActionButton
                label="השהה"
                onPress={onPause}
                disabled={isBusy}
              />
            ) : (
              <ActionButton
                label="המשך"
                onPress={onResume}
                disabled={isBusy}
                primary
              />
            )}
            <ActionButton
              label="רגע"
              onPress={onSnapshot}
              disabled={isBusy}
            />
          </>
        ) : (
          <Pressable
            {...a11yButton('התחל הקלטה', {disabled: isBusy})}
            style={[styles.shutter, isBusy && styles.disabled]}
            onPress={onStart}
            disabled={isBusy}>
            {isBusy ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </Pressable>
        )}
      </View>

      <Text style={styles.hint}>
        {phase === 'idle' && 'לחץ להתחלת הקלטה'}
        {phase === 'recording' && 'מקליט — השהה, צלם רגע, או עצור'}
        {phase === 'paused' && 'מושהה — המשך או עצור'}
      </Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  disabled,
  destructive,
  primary,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
  primary?: boolean;
}) {
  return (
    <Pressable
      {...a11yButton(label, {disabled, hint: destructive ? 'מבטל את ההקלטה' : undefined})}
      style={[styles.actionBtn, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}>
      <Text
        style={[
          styles.actionText,
          destructive && styles.actionDestructive,
          primary && styles.actionPrimary,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  timerBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerBadgePaused: {
    backgroundColor: 'rgba(234, 179, 8, 0.9)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  dotRecording: {
    backgroundColor: '#ffffff',
  },
  dotPaused: {
    backgroundColor: '#1e293b',
  },
  timerText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
    paddingHorizontal: 16,
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  shutterStop: {
    borderColor: '#ef4444',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ef4444',
  },
  shutterStopInner: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  actionBtn: {
    minWidth: 52,
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  actionDestructive: {
    color: '#fca5a5',
  },
  actionPrimary: {
    color: '#86efac',
  },
  hint: {
    color: '#94a3b8',
    fontSize: 13,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});
