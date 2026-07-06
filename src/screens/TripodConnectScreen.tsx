import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {FlowScreenLayout} from '../components/navigation/FlowScreenLayout';
import {TripodDeviceRow} from '../components/tripod/TripodDeviceRow';
import {TripodStatusPanel} from '../components/tripod/TripodStatusPanel';
import {TripodTestControls} from '../components/tripod/TripodTestControls';
import {getSceneProfile} from '../config/scenes';
import {useTripodConnection} from '../hooks/useTripodConnection';
import {useAppStore} from '../stores/useAppStore';
import {a11yButton} from '../utils/accessibility';
import type {RootStackScreenProps} from '../types/navigation';

export function TripodConnectScreen({
  navigation,
  route,
}: RootStackScreenProps<'TripodConnect'>) {
  const {sceneId, mode} = route.params;
  const scene = getSceneProfile(sceneId);
  const setTripodConnected = useAppStore(state => state.setTripodConnected);
  const updateTripodState = useAppStore(state => state.updateTripodState);

  const tripod = useTripodConnection();
  const isBusy =
    tripod.phase === 'scanning' || tripod.phase === 'connecting';
  const isConnected = tripod.phase === 'connected';

  useEffect(() => {
    if (tripod.tripodState) {
      updateTripodState(tripod.tripodState);
      setTripodConnected(tripod.tripodState.connected);
    }
  }, [setTripodConnected, tripod.tripodState, updateTripodState]);

  const continueToCamera = () => {
    navigation.navigate('Camera', {sceneId, mode});
  };

  const skipWithoutTripod = async () => {
    await tripod.disconnect();
    setTripodConnected(false);
    continueToCamera();
  };

  const handleConnectSelected = async () => {
    if (!tripod.selectedDeviceId) {
      return;
    }
    await tripod.connect(tripod.selectedDeviceId);
  };

  return (
    <FlowScreenLayout
      testID="tripodConnect.screen"
      step={3}
      title="חיבור לחצובה"
      subtitle={`${scene?.name_he ?? sceneId} · סריקת BLE`}
      onBack={() => navigation.goBack()}
      footer={
        <>
          {!isConnected ? (
            <>
              <Pressable
                {...a11yButton('סרוק מכשירים BLE', {
                  disabled: isBusy,
                  hint: 'מחפש חצובות SmartCamera בקרבת מכשיר',
                })}
                style={({pressed}) => [
                  styles.button,
                  pressed && styles.pressed,
                  isBusy && styles.disabled,
                ]}
                onPress={tripod.scan}
                disabled={isBusy}>
                {tripod.phase === 'scanning' ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>סרוק מכשירים BLE</Text>
                )}
              </Pressable>

              {tripod.selectedDeviceId ? (
                <Pressable
                  {...a11yButton('חבר למכשיר הנבחר', {
                    disabled: isBusy,
                    hint: 'מתחבר לחצובה שנבחרה ברשימה',
                  })}
                  style={({pressed}) => [
                    styles.button,
                    styles.secondaryButton,
                    pressed && styles.pressed,
                    isBusy && styles.disabled,
                  ]}
                  onPress={handleConnectSelected}
                  disabled={isBusy}>
                  {tripod.phase === 'connecting' ? (
                    <ActivityIndicator color="#2563eb" />
                  ) : (
                    <Text style={styles.secondaryButtonText}>חבר למכשיר הנבחר</Text>
                  )}
                </Pressable>
              ) : null}
            </>
          ) : (
            <>
              <Pressable
                {...a11yButton('המשך לצילום', {
                  hint: 'מעבר למסך המצלמה',
                })}
                style={({pressed}) => [styles.button, pressed && styles.pressed]}
                onPress={continueToCamera}>
                <Text style={styles.buttonText}>המשך לצילום</Text>
              </Pressable>
              <Pressable
                {...a11yButton('נתק חצובה')}
                onPress={tripod.disconnect}>
                <Text style={styles.linkText}>נתק חצובה</Text>
              </Pressable>
            </>
          )}

          {!isConnected ? (
            <Pressable
              testID="tripodConnect.skip"
              {...a11yButton('דלג — המשך בלי חצובה', {
                hint: 'מעבר ישירות למצלמה ללא חיבור BLE',
              })}
              onPress={skipWithoutTripod}>
              <Text style={styles.skipText}>דלג — המשך בלי חצובה</Text>
            </Pressable>
          ) : null}
        </>
      }>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <TripodStatusPanel
          device={tripod.connectedDevice}
          state={tripod.tripodState}
          modeLabel={tripod.modeLabel}
          lastAction={tripod.lastAction}
        />

        {tripod.error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{tripod.error}</Text>
          </View>
        ) : null}

        {!isConnected ? (
          <>
            <Text style={styles.sectionTitle}>
              מכשירים שנמצאו ({tripod.devices.length})
            </Text>
            {tripod.devices.length === 0 ? (
              <Text style={styles.empty}>
                לחצי על "סרוק מכשירים BLE" כדי לחפש חצובות SmartCamera
              </Text>
            ) : (
              <View style={styles.deviceList}>
                {tripod.devices.map(item => (
                  <TripodDeviceRow
                    key={item.id}
                    device={item}
                    selected={tripod.selectedDeviceId === item.id}
                    onPress={() => tripod.selectDevice(item.id)}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <TripodTestControls
            onMove={tripod.testMove}
            onStop={tripod.emergencyStop}
          />
        )}

        <Text style={styles.note}>
          מצב {tripod.modeLabel}: פרוטוקול PAN/TILT/HEIGHT עם safety gates ופרופילי
          מהירות. ב-BLE אמיתי הגדירי `TRIPOD_CONFIG.mode = 'ble'`.
        </Text>
      </ScrollView>
    </FlowScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  deviceList: {
    gap: 8,
  },
  empty: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 22,
    paddingVertical: 12,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 12,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
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
  linkText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingVertical: 6,
  },
  note: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 18,
  },
});
