import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Video from 'react-native-video';
import {toFileUri} from '../../services/media';

interface VideoThumbnailProps {
  uri: string;
  durationLabel?: string;
}

export function VideoThumbnail({uri, durationLabel}: VideoThumbnailProps) {
  return (
    <View style={styles.wrap}>
      <Video
        source={{uri: toFileUri(uri)}}
        style={styles.video}
        resizeMode="cover"
        paused
        muted
        repeat={false}
      />
      <View style={styles.overlay}>
        <Text style={styles.playIcon}>▶</Text>
      </View>
      {durationLabel ? (
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{durationLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1e293b',
  },
  video: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playIcon: {
    color: '#ffffff',
    fontSize: 18,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
});
