import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {a11yButton} from '../../utils/accessibility';

interface PhotoCaptureControlsProps {
  isCapturing: boolean;
  onCapture: () => void;
}

export function PhotoCaptureControls({
  isCapturing,
  onCapture,
}: PhotoCaptureControlsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        {...a11yButton(isCapturing ? 'שומר תמונה' : 'צלם תמונה', {
          disabled: isCapturing,
          hint: 'שומר את התמונה בגלריה ובאפליקציה',
        })}
        style={[styles.shutter, isCapturing && styles.shutterDisabled]}
        onPress={onCapture}
        disabled={isCapturing}>
        {isCapturing ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <View style={styles.shutterInner} />
        )}
      </Pressable>
      <Text style={styles.hint}>
        {isCapturing ? 'שומר...' : 'לחץ לצילום · נשמר בגלריה'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
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
  shutterDisabled: {
    opacity: 0.7,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ffffff',
  },
  hint: {
    color: '#94a3b8',
    fontSize: 13,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
});
