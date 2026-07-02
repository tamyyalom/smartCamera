import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

interface CameraUnavailableViewProps {
  onBack: () => void;
}

export function CameraUnavailableView({onBack}: CameraUnavailableViewProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.title}>לא נמצאה מצלמה</Text>
        <Text style={styles.message}>
          האפליקציה לא מזהה מצלמה אחורית במכשיר הזה.
        </Text>
        <Text style={styles.hint}>
          בסימולטור iOS/Android אין מצלמה פיזית — Vision Camera דורשת
          מכשיר אמיתי (iPhone / Android).
        </Text>
        <Pressable style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>חזרה</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  message: {
    color: '#cbd5e1',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    writingDirection: 'rtl',
  },
  hint: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    writingDirection: 'rtl',
    marginTop: 4,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
});
