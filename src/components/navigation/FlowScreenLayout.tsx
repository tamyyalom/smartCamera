import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FlowProgress, type FlowStep} from './FlowProgress';

interface FlowScreenLayoutProps {
  step: FlowStep;
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  testID?: string;
}

export function FlowScreenLayout({
  step,
  title,
  subtitle,
  onBack,
  children,
  footer,
  testID,
}: FlowScreenLayoutProps) {
  return (
    <SafeAreaView
      testID={testID}
      style={styles.container}
      edges={['top', 'bottom']}>
      <FlowProgress currentStep={step} />

      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={styles.back}>← חזרה</Text>
        </Pressable>
        <View style={styles.titles}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.body}>{children}</View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  back: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  titles: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  body: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
});
