import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
  usePhotoOutput,
  useVideoOutput,
} from 'react-native-vision-camera';
import {useFaceDetector} from '@noma4i/vision-camera-face-detector';
import {CameraControlsPanel} from '../components/camera/CameraControlsPanel';
import {CameraUnavailableView} from '../components/camera/CameraUnavailableView';
import {FaceGuideBanner} from '../components/camera/FaceGuideBanner';
import {AIGuidanceBanner} from '../components/camera/AIGuidanceBanner';
import {PhotoCaptureControls} from '../components/camera/PhotoCaptureControls';
import {RecordingControls} from '../components/camera/RecordingControls';
import {FlowProgress} from '../components/navigation/FlowProgress';
import {getSceneProfile} from '../config/scenes';
import {useCameraDeviceStatus} from '../hooks/useCameraDeviceStatus';
import {useCameraPermissions} from '../hooks/useCameraPermissions';
import {usePhotoCapture} from '../hooks/usePhotoCapture';
import {useAIPipeline} from '../hooks/useAIPipeline';
import {useGuidanceSpeech} from '../hooks/useGuidanceSpeech';
import {useVideoRecorder} from '../hooks/useVideoRecorder';
import {sceneUsesFaceGuide} from '../services/ai';
import {useAppStore} from '../stores/useAppStore';
import {a11yButton, a11yHeader} from '../utils/accessibility';
import type {RootStackScreenProps} from '../types/navigation';

const DEFAULT_MIN_ZOOM = 1;
const DEFAULT_MAX_ZOOM = 10;
const DEFAULT_MIN_EXPOSURE = -2;
const DEFAULT_MAX_EXPOSURE = 2;

type CameraRouteProps = RootStackScreenProps<'Camera'>;

function CameraPermissionGate({
  mode,
  navigation,
  requestAll,
}: {
  mode: 'photo' | 'video';
  navigation: CameraRouteProps['navigation'];
  requestAll: () => Promise<boolean>;
}) {
  return (
    <SafeAreaView
      testID="camera.screen"
      accessibilityLabel="camera.permissionGate"
      style={styles.permissionContainer}>
      <Text style={styles.permissionTitle} {...a11yHeader('נדרשת הרשאת מצלמה')}>
        נדרשת הרשאת מצלמה
      </Text>
      <Text style={styles.permissionText}>
        {mode === 'video'
          ? 'לאפליקציה נדרשות הרשאות מצלמה ומיקרופון לצילום והקלטה.'
          : 'לאפליקציה נדרשת הרשאת מצלמה לצילום.'}
      </Text>
      <Pressable
        {...a11yButton('אפשר גישה למצלמה', {
          hint: mode === 'video' ? 'כולל מצלמה ומיקרופון' : 'מצלמה בלבד',
        })}
        style={styles.permissionBtn}
        onPress={requestAll}>
        <Text style={styles.permissionBtnText}>אפשר גישה</Text>
      </Pressable>
      <Pressable
        {...a11yButton('חזרה')}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backLink}>חזרה</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export function CameraScreen({navigation, route}: CameraRouteProps) {
  const {mode} = route.params;
  const {hasAllPermissions, requestAll} = useCameraPermissions(mode === 'video');

  if (!hasAllPermissions) {
    return (
      <CameraPermissionGate
        mode={mode}
        navigation={navigation}
        requestAll={requestAll}
      />
    );
  }

  return <CameraSession navigation={navigation} route={route} />;
}

function CameraSession({navigation, route}: CameraRouteProps) {
  const {sceneId, mode} = route.params;
  const scene = getSceneProfile(sceneId);
  const modeLabel = mode === 'video' ? 'הקלטה' : 'צילום';
  const isFocused = useIsFocused();
  const updateCameraState = useAppStore(state => state.updateCameraState);
  const updateTrackingState = useAppStore(state => state.updateTrackingState);
  const resetSession = useAppStore(state => state.resetSession);
  const tripodConnected = useAppStore(state => state.tripod.connected);

  const enableFaceGuide = sceneUsesFaceGuide(scene);

  const {status: cameraStatus, device} = useCameraDeviceStatus();
  const photoOutput = usePhotoOutput();
  const videoOutput = useVideoOutput({enableAudio: mode === 'video'});

  const captureOutputs = useMemo(
    () => (mode === 'video' ? [videoOutput, photoOutput] : [photoOutput]),
    [mode, photoOutput, videoOutput],
  );

  const face = useFaceDetector({
    preset: mode === 'video' ? 'fast' : 'accurate',
    outputs: captureOutputs,
    guide: enableFaceGuide ? 'selfie' : 'none',
  });

  const cameraRef = face.camera.ref;

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
  }, [cameraRef, sceneZoomRange]);

  useEffect(() => {
    updateCameraState({zoom, exposure});
  }, [zoom, exposure, updateCameraState]);

  useEffect(() => {
    if (!enableFaceGuide) {
      return;
    }

    const rect = face.result.primaryFaceRect;
    updateTrackingState({
      faceCount: face.result.faces.length,
      faceBox: rect
        ? {x: rect.x, y: rect.y, width: rect.width, height: rect.height}
        : undefined,
      guideStatus: face.status,
      motionScore: face.status === 'ready' ? 0 : 0.4,
    });
  }, [enableFaceGuide, face.result, face.status, updateTrackingState]);

  const handleZoomChange = useCallback((value: number) => {
    setZoom(value);
    cameraRef.current?.controller?.setZoom(value).catch(() => {});
  }, [cameraRef]);

  const aiPipeline = useAIPipeline({
    sceneId,
    enabled: isFocused && cameraStatus === 'ready' && !!device,
    onZoomChange: handleZoomChange,
  });

  const guidanceSpeech = useGuidanceSpeech({
    guidanceText: aiPipeline.guidanceText,
    enabled: isFocused && cameraStatus === 'ready' && !!device,
  });

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

  if (cameraStatus === 'loading') {
    return (
      <View testID="camera.screen" style={styles.center}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText} accessibilityLabel="טוען מצלמה">
          טוען מצלמה...
        </Text>
      </View>
    );
  }

  if (cameraStatus === 'unavailable' || !device) {
    return (
      <CameraUnavailableView
        testID="camera.screen"
        onBack={() => navigation.goBack()}
      />
    );
  }

  return (
    <View testID="camera.screen" style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused}
        outputs={face.camera.outputs}
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
          <Pressable
            {...a11yButton('חזרה', {hint: 'חזרה למסך הקודם'})}
            onPress={handleBack}>
            <Text style={styles.backText}>← חזרה</Text>
          </Pressable>
          <View
            style={styles.badges}
            accessibilityLabel={`סצנה ${scene?.name_he ?? sceneId}, מצב ${modeLabel}${
              tripodConnected ? ', חצובה מחוברת' : ''
            }`}>
            <Text style={styles.sceneBadge}>{scene?.name_he ?? sceneId}</Text>
            <Text style={styles.modeBadge}>{modeLabel}</Text>
            {tripodConnected ? (
              <Text style={styles.tripodBadge}>חצובה ✓</Text>
            ) : null}
          </View>
          <Pressable
            {...a11yButton('סיום', {hint: 'סיום הצילום וחזרה לבית'})}
            onPress={handleFinish}>
            <Text style={styles.finishText}>סיום</Text>
          </Pressable>
        </View>

        {guidanceHint ? (
          <View style={styles.hintBar}>
            <Text style={styles.hintText}>💡 {guidanceHint}</Text>
          </View>
        ) : null}

        <FaceGuideBanner
          enabled={enableFaceGuide}
          status={face.status}
          faceCount={face.result.faces.length}
        />

        <AIGuidanceBanner
          text={aiPipeline.guidanceText}
          isThinking={aiPipeline.isThinking}
        />

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

        <View style={styles.quickToggles}>
          <Pressable
            style={styles.settingsToggle}
            {...a11yButton(
              guidanceSpeech.voiceEnabled
                ? 'השתק הנחיות קוליות'
                : 'הפעל הנחיות קוליות',
            )}
            onPress={guidanceSpeech.toggleVoice}>
            <Text style={styles.settingsText}>
              {guidanceSpeech.voiceEnabled ? '🔊 הנחיה קולית' : '🔇 הנחיה קולית'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.settingsToggle}
            {...a11yButton(
              showControls ? 'הסתר הגדרות מצלמה' : 'הצג הגדרות מצלמה',
              {hint: 'זום, חשיפה ואיפוס'},
            )}
            onPress={() => setShowControls(v => !v)}>
            <Text style={styles.settingsText}>
              {showControls ? 'הסתר הגדרות' : 'הגדרות מצלמה'}
            </Text>
          </Pressable>
        </View>

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
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  quickToggles: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
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
  tripodBadge: {
    backgroundColor: 'rgba(22, 163, 74, 0.9)',
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
