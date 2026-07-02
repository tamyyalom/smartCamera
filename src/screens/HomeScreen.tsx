import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {RootStackScreenProps} from '../types/navigation';

export function HomeScreen({navigation}: RootStackScreenProps<'Home'>) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartCamera</Text>
      <Text style={styles.subtitle}>בחרי פעולה להתחלה</Text>

      <View style={styles.actions}>
        <Pressable
          style={({pressed}) => [styles.button, styles.primary, pressed && styles.pressed]}
          onPress={() => navigation.navigate('SceneSelect', {mode: 'video'})}>
          <Text style={styles.buttonText}>התחל הקלטה</Text>
        </Pressable>

        <Pressable
          style={({pressed}) => [styles.button, styles.secondary, pressed && styles.pressed]}
          onPress={() => navigation.navigate('SceneSelect', {mode: 'photo'})}>
          <Text style={styles.buttonTextDark}>התחל צילום</Text>
        </Pressable>
      </View>

      <View style={styles.filesPlaceholder}>
        <Text style={styles.filesTitle}>קבצים אחרונים</Text>
        <Text style={styles.filesEmpty}>אין עדיין הקלטות — שלב 1</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    paddingTop: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 32,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actions: {
    gap: 12,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: '#e2e8f0',
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  buttonTextDark: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  filesPlaceholder: {
    marginTop: 40,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 8,
  },
  filesEmpty: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
