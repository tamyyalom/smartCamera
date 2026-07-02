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
  useCameraDevice,
  usePhotoOutput,
  useVideoOutput,
} from 'react-native-vision-camera';
import {CameraControlsPanel} from '../components/camera/CameraControlsPanel';
import {RecordingControls} from '../components/camera/RecordingControls';
import {getSceneProfile} from '../config/scenes';
import {useCameraPermissions} from '../hooks/useCameraPermissions';
import {useVideoRecorder} from '../hooks/useVideoRecorder';
import {saveMediaFile} from '../services/media';
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

  const {hasAllPermissions, requestAll} = useCameraPermissions(mode === 'video');
  const device = useCameraDevice('back');
  const photoOutput = usePhotoOutput();
  const videoOutput = useVideoOutput({enableAudio: mode === 'video'});

  const cameraRef = useRef<CameraRef>(null);

  const [zoom, setZoom] = useState(1);
  const [exposure, setExposure] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [limits, setLimits] = useState({
    minZoom: DEFAULT_MIN_ZOOM,
    maxZoom: DEFAULT_MAX_ZOOM,
    minExposure: DEFAULT_MIN_EXPOSURE,
    maxExposure: DEFAULT_MAX_EXPOSURE,
    supportsExposure: true,
  });

  const recorder = useVideoRecorder({videoOutput, photoOutput});

  const outputs = useMemo(
    () => (mode === 'video' ? [videoOutput, photoOutput] : [photoOutput]),
    [mode, photoOutput, videoOutput],
  );

  const syncLimitsFromController = useCallback(() => {
    const controller = cameraRef.current?.controller;
    if (!controller) {
      return;
    }
    const dev = controller.device;
    setLimits({
      minZoom: controller.minZoom ?? dev.minZoom ?? DEFAULT_MIN_ZOOM,
      maxZoom: controller.maxZoom ?? dev.maxZoom ?? DEFAULT_MAX_ZOOM,
      minExposure: dev.minExposureBias ?? DEFAULT_MIN_EXPOSURE,
      maxExposure: dev.maxExposureBias ?? DEFAULT_MAX_EXPOSURE,
      supportsExposure: dev.supportsExposureBias ?? true,
    });
    setZoom(current => {
      const clamped = Math.min(
        controller.maxZoom ?? DEFAULT_MAX_ZOOM,
        Math.max(controller.minZoom ?? DEFAULT_MIN_ZOOM, current),
      );
      return clamped;
    });
  }, []);

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

  const takePhoto = async () => {
    if (isCapturing) {
      return;
    }
    setIsCapturing(true);
    try {
      const photoFile = await photoOutput.capturePhotoToFile({}, {});
      await saveMediaFile({
        type: 'photo',
        sourceUri: photoFile.filePath,
      });
      Alert.alert('נשמר', 'התמונה נשמרה בהצלחה');
    } catch (error) {
      Alert.alert(
        'שגיאה',
        error instanceof Error ? error.message : 'צילום נכשל',
      );
    } finally {
      setIsCapturing(false);
    }
  };

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

  if (!device) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>טוען מצלמה...</Text>
      </View>
    );
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
        <View style={styles.topBar}>
          <Pressable onPress={handleBack}>
            <Text style={styles.backText}>← חזרה</Text>
          </Pressable>
          <View style={styles.badges}>
            <Text style={styles.sceneBadge}>{scene?.name_he ?? sceneId}</Text>
            <Text style={styles.modeBadge}>{modeLabel}</Text>
          </View>
          <Pressable onPress={() => setShowControls(v => !v)}>
            <Text style={styles.settingsText}>
              {showControls ? 'הסתר' : 'הגדרות'}
            </Text>
          </Pressable>
        </View>

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
            <>
              <Pressable
                style={[styles.shutter, isCapturing && styles.shutterActive]}
                onPress={takePhoto}
                disabled={isCapturing}>
                {isCapturing ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={styles.shutterInner} />
                )}
              </Pressable>
              <Text style={styles.shutterHint}>לחץ לצילום</Text>
            </>
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
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  shutterActive: {
    opacity: 0.85,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ef4444',
  },
  shutterHint: {
    color: '#94a3b8',
    fontSize: 13,
    writingDirection: 'rtl',
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
