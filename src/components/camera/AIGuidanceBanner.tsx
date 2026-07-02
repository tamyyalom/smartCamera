import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

interface AIGuidanceBannerProps {
  text: string | null;
  isThinking?: boolean;
}

export function AIGuidanceBanner({text, isThinking}: AIGuidanceBannerProps) {
  if (!text && !isThinking) {
    return null;
  }

  return (
    <View style={styles.wrap} testID="camera.aiGuidance">
      {isThinking ? (
        <ActivityIndicator color="#93c5fd" size="small" style={styles.spinner} />
      ) : null}
      <Text style={styles.text}>{text ?? 'מנתח קומפוזיציה...'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 6,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(30, 64, 175, 0.88)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  spinner: {
    transform: [{scale: 0.85}],
  },
  text: {
    flex: 1,
    color: '#eff6ff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 20,
  },
});
