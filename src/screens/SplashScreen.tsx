import React, {useEffect} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import type {RootStackScreenProps} from '../types/navigation';

export function SplashScreen({navigation}: RootStackScreenProps<'Splash'>) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 1200);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartCamera</Text>
      <Text style={styles.subtitle}>מצלמה חכמה עם חצובה ממונעת</Text>
      <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  loader: {
    marginTop: 32,
  },
});
