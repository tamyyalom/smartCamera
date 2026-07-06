import React, {useEffect} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ensureMediaDirectory} from '../services/media';
import {a11yHeader} from '../utils/accessibility';
import type {RootStackScreenProps} from '../types/navigation';

export function SplashScreen({navigation}: RootStackScreenProps<'Splash'>) {
  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      await ensureMediaDirectory();
      await new Promise<void>(resolve => setTimeout(resolve, 1200));
      if (active) {
        navigation.replace('Home');
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [navigation]);

  return (
    <SafeAreaView
      style={styles.container}
      accessibilityLabel="טוען את SmartCamera">
      <View style={styles.content}>
        <View style={styles.logoCircle} importantForAccessibility="no-hide-descendants">
          <Text style={styles.logoText}>SC</Text>
        </View>
        <Text style={styles.title} {...a11yHeader('SmartCamera')}>
          SmartCamera
        </Text>
        <Text style={styles.subtitle}>מצלמה חכמה עם חצובה ממונעת</Text>
        <ActivityIndicator
          size="large"
          color="#60a5fa"
          style={styles.loader}
          accessibilityLabel="טוען"
        />
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
    padding: 24,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
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
