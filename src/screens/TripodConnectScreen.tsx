import React, {useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {getSceneProfile} from '../config/scenes';
import {mockTripodController} from '../services/tripod';
import {useAppStore} from '../stores/useAppStore';
import type {RootStackScreenProps} from '../types/navigation';

export function TripodConnectScreen({
  navigation,
  route,
}: RootStackScreenProps<'TripodConnect'>) {
  const {sceneId, mode} = route.params;
  const scene = getSceneProfile(sceneId);
  const setTripodConnected = useAppStore(state => state.setTripodConnected);
  const updateTripodState = useAppStore(state => state.updateTripodState);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'connected' | 'error'>(
    'idle',
  );
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setStatus('scanning');
    setError(null);
    try {
      const ok = await mockTripodController.connect();
      if (!ok) {
        throw new Error('Connection failed');
      }
      const state = await mockTripodController.getState();
      setTripodConnected(true);
      updateTripodState(state);
      setStatus('connected');
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const continueToCamera = () => {
    navigation.navigate('Camera', {sceneId, mode});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>חיבור לחצובה</Text>
      <Text style={styles.sceneName}>{scene?.name_he ?? sceneId}</Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>סטטוס</Text>
        <Text style={styles.statusValue}>
          {status === 'idle' && 'ממתין לחיבור'}
          {status === 'scanning' && 'מחפש חצובה...'}
          {status === 'connected' && 'מחובר ✓ (Mock)'}
          {status === 'error' && `שגיאה: ${error}`}
        </Text>
        {status === 'scanning' && (
          <ActivityIndicator color="#2563eb" style={styles.loader} />
        )}
      </View>

      {status !== 'connected' ? (
        <Pressable
          style={({pressed}) => [styles.button, pressed && styles.pressed]}
          onPress={connect}
          disabled={status === 'scanning'}>
          <Text style={styles.buttonText}>סרוק וחבר (Mock)</Text>
        </Pressable>
      ) : (
        <Pressable
          style={({pressed}) => [styles.button, pressed && styles.pressed]}
          onPress={continueToCamera}>
          <Text style={styles.buttonText}>המשך לצילום</Text>
        </Pressable>
      )}

      <Text style={styles.note}>
        מצב Mock — יוחלף במודול native (BLE/WiFi) בשלב 2
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sceneName: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 8,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  loader: {
    marginTop: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
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
  note: {
    marginTop: 16,
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
