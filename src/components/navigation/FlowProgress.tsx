import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export const FLOW_STEPS = [
  {step: 1, label: 'בית'},
  {step: 2, label: 'סצנה'},
  {step: 3, label: 'חצובה'},
  {step: 4, label: 'מצלמה'},
] as const;

export type FlowStep = 1 | 2 | 3 | 4;

interface FlowProgressProps {
  currentStep: FlowStep;
  variant?: 'light' | 'dark';
}

export function FlowProgress({
  currentStep,
  variant = 'light',
}: FlowProgressProps) {
  const dark = variant === 'dark';

  return (
    <View style={styles.container}>
      {FLOW_STEPS.map((item, index) => {
        const active = item.step === currentStep;
        const done = item.step < currentStep;
        return (
          <React.Fragment key={item.step}>
            <View style={styles.stepWrap}>
              <View
                style={[
                  styles.dot,
                  dark && styles.dotDark,
                  active && styles.dotActive,
                  done && styles.dotDone,
                ]}>
                <Text
                  style={[
                    styles.dotText,
                    dark && styles.dotTextDark,
                    (active || done) && styles.dotTextActive,
                  ]}>
                  {item.step}
                </Text>
              </View>
              <Text
                style={[
                  styles.label,
                  dark && styles.labelDark,
                  active && styles.labelActive,
                  done && styles.labelDone,
                ]}>
                {item.label}
              </Text>
            </View>
            {index < FLOW_STEPS.length - 1 ? (
              <View
                style={[styles.line, dark && styles.lineDark, done && styles.lineDone]}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  stepWrap: {
    alignItems: 'center',
    gap: 4,
    minWidth: 44,
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  dotDark: {
    borderColor: '#475569',
    backgroundColor: '#1e293b',
  },
  dotActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  dotDone: {
    borderColor: '#22c55e',
    backgroundColor: '#22c55e',
  },
  dotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  dotTextDark: {
    color: '#94a3b8',
  },
  dotTextActive: {
    color: '#ffffff',
  },
  label: {
    fontSize: 11,
    color: '#94a3b8',
    writingDirection: 'rtl',
  },
  labelDark: {
    color: '#cbd5e1',
  },
  labelActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  labelDone: {
    color: '#16a34a',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginBottom: 16,
    maxWidth: 28,
  },
  lineDark: {
    backgroundColor: '#475569',
  },
  lineDone: {
    backgroundColor: '#86efac',
  },
});
