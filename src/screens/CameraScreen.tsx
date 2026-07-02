import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Camera,
  type CameraRef,
  usePhotoOutput,
  useVideoOutput,
} from 'react-native-vision-camera';
import {CameraControlsPanel} from '../components/camera/CameraControlsPanel';
import {CameraUnavailableView} from '../components/camera/CameraUnavailableView';
import {PhotoCaptureControls} from '../components/camera/PhotoCaptureControls';
import {RecordingControls} from '../components/camera/RecordingControls';
import {FlowProgress} from '../components/navigation/FlowProgress';
import {getSceneProfile} from '../config/scenes';
import {useCameraDeviceStatus} from '../hooks/useCameraDeviceStatus';
import {useCameraPermissions} from '../hooks/useCameraPermissions';
import {usePhotoCapture} from '../hooks/usePhotoCapture';
import {useVideoRecorder} from '../hooks/useVideoRecorder';
import {useAppStore} from '../stores/useAppStore';
import type {RootStackScreenProps} from '../types/navigation';

const DEFAULT_MIN_ZOOM = 1;
const DEFAULT_MAX_ZOOM = 10;
const DEFAULT_MIN_EXPOSURE = -2;
const DEFAULT_MAX_EXPOSURE = 2;

export function CameraScreen({
  navigation,
  route,
}: RootStackScreenProps<'Camera'>) {
  const {sceneId, mode} = route.params;
  const scene = getSceneProfile(sceneId);
  const modeLabel = mode === 'video' ? 'הקלטה' : 'צילום';
  const isFocused = useIsFocused();
  const updateCameraState = useAppStore(state => state.updateCameraState);
  const resetSession = useAppStore(state => state.resetSession);

  const {hasAllPermissions, requestAll} = useCameraPermissions(mode === 'video');
  const {status: cameraStatus, device} = useCameraDeviceStatus();
  const photoOutput = usePhotoOutput();
  const videoOutput = useVideoOutput({enableAudio: mode === 'video'});

  const cameraRef = useRef<CameraRef>(null);

  const [zoom, setZoom] = useState(1);
  const [exposure, setExposure] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [limits, setLimits] = useState({
    minZoom: DEFAULT_MIN_ZOOM,
    maxZoom: DEFAULT_MAX_ZOOM,
    minExposure: DEFAULT_MIN_EXPOSURE,
    maxExposure: DEFAULT_MAX_EXPOSURE,
    supportsExposure: true,
  });

  const recorder = useVideoRecorder({videoOutput, photoOutput});
  const photoCapture = usePhotoCapture(photoOutput);

  const outputs = useMemo(
    () => (mode === 'video' ? [videoOutput, photoOutput] : [photoOutput]),
    [mode, photoOutput, videoOutput],
  );

  const sceneZoomRange = scene?.framing.zoom_range;

  const syncLimitsFromController = useCallback(() => {
    const controller = cameraRef.current?.controller;
    if (!controller) {
      return;
    }
    const dev = controller.device;
    const deviceMin = controller.minZoom ?? dev.minZoom ?? DEFAULT_MIN_ZOOM;
    const deviceMax = controller.maxZoom ?? dev.maxZoom ?? DEFAULT_MAX_ZOOM;
    const profileMin = sceneZoomRange?.[0] ?? deviceMin;
    const profileMax = sceneZoomRange?.[1] ?? deviceMax;
    const minZoom = Math.max(deviceMin, profileMin);
    const maxZoom = Math.min(deviceMax, profileMax);
    const initialZoom = Math.min(maxZoom, Math.max(minZoom, profileMin));

    setLimits({
      minZoom,
      maxZoom,
      minExposure: dev.minExposureBias ?? DEFAULT_MIN_EXPOSURE,
      maxExposure: dev.maxExposureBias ?? DEFAULT_MAX_EXPOSURE,
      supportsExposure: dev.supportsExposureBias ?? true,
    });
    setZoom(initialZoom);
    cameraRef.current?.controller?.setZoom(initialZoom).catch(() => {});
  }, [sceneZoomRange]);

  useEffect(() => {
    updateCameraState({zoom, exposure});
  }, [zoom, exposure, updateCameraState]);

  const handleZoomChange = (value: number) => {
    setZoom(value);
    cameraRef.current?.controller?.setZoom(value).catch(() => {});
  };

  const handleExposureChange = (value: number) => {
    setExposure(value);
    cameraRef.current?.controller?.setExposureBias(value).catch(() => {});
  };

  const handleReset = () => {
    const neutralZoom = limits.minZoom;
    setZoom(neutralZoom);
    setExposure(0);
    cameraRef.current?.controller?.setZoom(neutralZoom).catch(() => {});
    cameraRef.current?.controller?.setExposureBias(0).catch(() => {});
    cameraRef.current?.resetFocus().catch(() => {});
  };

  const takePhoto = photoCapture.capture;

  const exitCamera = useCallback(() => {
    resetSession();
    navigation.popToTop();
  }, [navigation, resetSession]);

  const handleBack = () => {
    if (mode === 'video' && recorder.isActive) {
      Alert.alert('הקלטה פעילה', 'לעצור או לבטל את ההקלטה לפני יציאה?', [
        {text: 'המשך הקלטה', style: 'cancel'},
        {
          text: 'בטל הקלטה',
          style: 'destructive',
          onPress: async () => {
            await recorder.cancel();
            navigation.goBack();
          },
        },
        {
          text: 'שמור וצא',
          onPress: async () => {
            await recorder.stop();
            navigation.goBack();
          },
        },
      ]);
      return;
    }
    navigation.goBack();
  };

  const handleFinish = () => {
    if (mode === 'video' && recorder.isActive) {
      Alert.alert('הקלטה פעילה', 'לעצור או לבטל את ההקלטה לפני סיום?', [
        {text: 'המשך הקלטה', style: 'cancel'},
        {
          text: 'בטל הקלטה',
          style: 'destructive',
          onPress: async () => {
            await recorder.cancel();
            exitCamera();
          },
        },
        {
          text: 'שמור וסיים',
          onPress: async () => {
            await recorder.stop();
            exitCamera();
          },
        },
      ]);
      return;
    }
    exitCamera();
  };

  const guidanceHint = scene?.guidance_hints[0];

  if (!hasAllPermissions) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>נדרשת הרשאת מצלמה</Text>
        <Text style={styles.permissionText}>
          {mode === 'video'
            ? 'לאפליקציה נדרשות הרשאות מצלמה ומיקרופון לצילום והקלטה.'
            : 'לאפליקציה נדרשת הרשאת מצלמה לצילום.'}
        </Text>
        <Pressable style={styles.permissionBtn} onPress={requestAll}>
          <Text style={styles.permissionBtnText}>אפשר גישה</Text>
        </Pressable>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>חזרה</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (cameraStatus === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>טוען מצלמה...</Text>
      </View>
    );
  }

  if (cameraStatus === 'unavailable' || !device) {
    return <CameraUnavailableView onBack={() => navigation.goBack()} />;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && hasAllPermissions}
        outputs={outputs}
        zoom={zoom}
        exposure={exposure}
        enableNativeTapToFocusGesture
        onStarted={syncLimitsFromController}
      />

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <View style={styles.flowBar}>
          <FlowProgress currentStep={4} variant="dark" />
        </View>

        <View style={styles.topBar}>
          <Pressable onPress={handleBack}>
            <Text style={styles.backText}>← חזרה</Text>
          </Pressable>
          <View style={styles.badges}>
            <Text style={styles.sceneBadge}>{scene?.name_he ?? sceneId}</Text>
            <Text style={styles.modeBadge}>{modeLabel}</Text>
          </View>
          <Pressable onPress={handleFinish}>
            <Text style={styles.finishText}>סיום</Text>
          </Pressable>
        </View>

        {guidanceHint ? (
          <View style={styles.hintBar}>
            <Text style={styles.hintText}>💡 {guidanceHint}</Text>
          </View>
        ) : null}

        {showControls && (
          <View style={styles.controlsPanelWrap}>
            <CameraControlsPanel
              zoom={zoom}
              minZoom={limits.minZoom}
              maxZoom={limits.maxZoom}
              exposure={exposure}
              minExposure={limits.minExposure}
              maxExposure={limits.maxExposure}
              supportsExposure={limits.supportsExposure}
              onZoomChange={handleZoomChange}
              onExposureChange={handleExposureChange}
              onReset={handleReset}
            />
            <Text style={styles.focusHint}>הקש על המסך למיקוד</Text>
          </View>
        )}

        <Pressable
          style={styles.settingsToggle}
          onPress={() => setShowControls(v => !v)}>
          <Text style={styles.settingsText}>
            {showControls ? 'הסתר הגדרות' : 'הגדרות מצלמה'}
          </Text>
        </Pressable>

        <View style={styles.bottomBar}>
          {mode === 'video' ? (
            <RecordingControls
              phase={recorder.phase}
              elapsedLabel={recorder.elapsedLabel}
              isBusy={recorder.isBusy}
              onStart={recorder.start}
              onStop={recorder.stop}
              onPause={recorder.pause}
              onResume={recorder.resume}
              onCancel={recorder.cancel}
              onSnapshot={recorder.takeSnapshot}
            />
          ) : (
            <PhotoCaptureControls
              isCapturing={photoCapture.isCapturing}
              onCapture={takePhoto}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94a3b8',
    writingDirection: 'rtl',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  flowBar: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 12,
    marginHorizontal: 12,
    marginTop: 4,
  },
  topBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backText: {
    color: '#ffffff',
    fontSize: 16,
    writingDirection: 'rtl',
  },
  finishText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  hintBar: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hintText: {
    color: '#e2e8f0',
    fontSize: 13,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  settingsToggle: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  settingsText: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  badges: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  sceneBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 13,
    writingDirection: 'rtl',
  },
  modeBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.85)',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 13,
    writingDirection: 'rtl',
  },
  controlsPanelWrap: {
    paddingHorizontal: 16,
    gap: 8,
  },
  focusHint: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: 16,
    gap: 10,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  permissionTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  permissionText: {
    color: '#94a3b8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    writingDirection: 'rtl',
  },
  permissionBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  permissionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  backLink: {
    color: '#60a5fa',
    fontSize: 15,
    marginTop: 8,
    writingDirection: 'rtl',
  },
});
