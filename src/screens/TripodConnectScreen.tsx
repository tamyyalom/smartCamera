import React, {useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {FlowScreenLayout} from '../components/navigation/FlowScreenLayout';
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

  const continueToCamera = () => {
    navigation.navigate('Camera', {sceneId, mode});
  };

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

  const skipWithoutTripod = () => {
    setTripodConnected(false);
    continueToCamera();
  };

  return (
    <FlowScreenLayout
      step={3}
      title="חיבור לחצובה"
      subtitle={scene?.name_he ?? sceneId}
      onBack={() => navigation.goBack()}
      footer={
        <>
          {status !== 'connected' ? (
            <Pressable
              style={({pressed}) => [styles.button, pressed && styles.pressed]}
              onPress={connect}
              disabled={status === 'scanning'}>
              {status === 'scanning' ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>סרוק וחבר (Mock)</Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              style={({pressed}) => [styles.button, pressed && styles.pressed]}
              onPress={continueToCamera}>
              <Text style={styles.buttonText}>המשך לצילום</Text>
            </Pressable>
          )}

          {status !== 'connected' ? (
            <Pressable onPress={skipWithoutTripod}>
              <Text style={styles.skipText}>דלג — המשך בלי חצובה</Text>
            </Pressable>
          ) : null}

          <Text style={styles.note}>
            מצב Mock — יוחלף במודול native (BLE/WiFi) בשלב 2
          </Text>
        </>
      }>
      <View style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>סטטוס חיבור</Text>
          <Text style={styles.statusValue}>
            {status === 'idle' && 'ממתין לחיבור'}
            {status === 'scanning' && 'מחפש חצובה...'}
            {status === 'connected' && 'מחובר ✓ (Mock)'}
            {status === 'error' && `שגיאה: ${error}`}
          </Text>
        </View>

        <Text style={styles.hint}>
          ניתן לדלג על שלב זה ולהמשיך ישירות למצלמה. חיבור חצובה אמיתי יתווסף
          בשלב 2.
        </Text>
      </View>
    </FlowScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  hint: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
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
  skipText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingVertical: 8,
  },
  note: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
