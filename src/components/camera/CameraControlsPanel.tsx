import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {a11yButton} from '../../utils/accessibility';

interface CameraControlsPanelProps {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  exposure: number;
  minExposure: number;
  maxExposure: number;
  supportsExposure: boolean;
  onZoomChange: (value: number) => void;
  onExposureChange: (value: number) => void;
  onReset: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function Stepper({
  label,
  value,
  min,
  max,
  step,
  format,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable
          {...a11yButton(`הקטן ${label}`, {
            disabled: disabled || value <= min,
          })}
          style={[styles.stepBtn, disabled && styles.stepBtnDisabled]}
          disabled={disabled || value <= min}
          onPress={() => onChange(clamp(value - step, min, max))}>
          <Text style={styles.stepBtnText} importantForAccessibility="no">
            −
          </Text>
        </Pressable>
        <Text
          style={styles.stepperValue}
          accessibilityLabel={`${label}: ${format(value)}`}>
          {format(value)}
        </Text>
        <Pressable
          {...a11yButton(`הגדל ${label}`, {
            disabled: disabled || value >= max,
          })}
          style={[styles.stepBtn, disabled && styles.stepBtnDisabled]}
          disabled={disabled || value >= max}
          onPress={() => onChange(clamp(value + step, min, max))}>
          <Text style={styles.stepBtnText} importantForAccessibility="no">
            +
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function CameraControlsPanel({
  zoom,
  minZoom,
  maxZoom,
  exposure,
  minExposure,
  maxExposure,
  supportsExposure,
  onZoomChange,
  onExposureChange,
  onReset,
}: CameraControlsPanelProps) {
  return (
    <View style={styles.panel}>
      <Stepper
        label="זום"
        value={zoom}
        min={minZoom}
        max={maxZoom}
        step={0.1}
        format={v => `${v.toFixed(1)}x`}
        onChange={onZoomChange}
      />
      <Stepper
        label="חשיפה"
        value={exposure}
        min={minExposure}
        max={maxExposure}
        step={0.25}
        format={v => (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1))}
        disabled={!supportsExposure}
        onChange={onExposureChange}
      />
      <Pressable
        {...a11yButton('איפוס הגדרות מצלמה')}
        style={styles.resetBtn}
        onPress={onReset}>
        <Text style={styles.resetText}>איפוס</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  stepperRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    writingDirection: 'rtl',
    width: 48,
    textAlign: 'right',
  },
  stepperControls: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'flex-end',
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.35,
  },
  stepBtnText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
  },
  stepperValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    minWidth: 52,
    textAlign: 'center',
  },
  resetBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetText: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
});
