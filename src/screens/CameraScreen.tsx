import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {getSceneProfile} from '../config/scenes';
import type {RootStackScreenProps} from '../types/navigation';

export function CameraScreen({
  navigation,
  route,
}: RootStackScreenProps<'Camera'>) {
  const {sceneId, mode} = route.params;
  const scene = getSceneProfile(sceneId);
  const modeLabel = mode === 'video' ? 'הקלטה' : 'צילום';

  return (
    <View style={styles.container}>
      <View style={styles.previewPlaceholder}>
        <Text style={styles.previewText}>Camera Preview</Text>
        <Text style={styles.previewSubtext}>
          react-native-vision-camera — שלב 1
        </Text>
      </View>

      <View style={styles.overlay}>
        <Text style={styles.sceneBadge}>{scene?.name_he ?? sceneId}</Text>
        <Text style={styles.modeBadge}>{modeLabel}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.popToTop()}>
          <Text style={styles.backText}>חזרה לבית</Text>
        </Pressable>
        <View style={styles.shutter} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
  },
  previewText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  previewSubtext: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
    writingDirection: 'rtl',
  },
  overlay: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  sceneBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    writingDirection: 'rtl',
  },
  modeBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.85)',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    writingDirection: 'rtl',
  },
  controls: {
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    color: '#94a3b8',
    fontSize: 16,
    writingDirection: 'rtl',
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: '#ef4444',
  },
});
