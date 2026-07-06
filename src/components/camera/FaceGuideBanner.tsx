import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {FaceGuideStatus} from '../../types/ai';
import {a11yHeader} from '../../utils/accessibility';

const STATUS_LABELS: Record<FaceGuideStatus, string> = {
  unavailable: 'זיהוי פנים לא זמין במכשיר זה',
  idle: 'מצאי את הפנים בתוך המסגרת',
  misaligned: 'יישרי את הפנים במרכז המסגרת',
  ready: 'מיקום מושלם — אפשר לצלם',
};

interface FaceGuideBannerProps {
  status: FaceGuideStatus;
  faceCount: number;
  enabled: boolean;
}

export function FaceGuideBanner({
  status,
  faceCount,
  enabled,
}: FaceGuideBannerProps) {
  if (!enabled) {
    return null;
  }

  const tone =
    status === 'ready'
      ? styles.ready
      : status === 'misaligned'
        ? styles.warn
        : styles.neutral;

  const message =
    faceCount > 1
      ? `${STATUS_LABELS[status]}. זוהו ${faceCount} פנים — התמקדי בנושא הראשי`
      : STATUS_LABELS[status];

  return (
    <View
      style={[styles.banner, tone]}
      {...a11yHeader(message)}
      accessibilityLiveRegion="polite">
      <Text style={styles.text}>{STATUS_LABELS[status]}</Text>
      {faceCount > 1 ? (
        <Text style={styles.subtext}>זוהו {faceCount} פנים — התמקדי בנושא הראשי</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  neutral: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  warn: {
    backgroundColor: 'rgba(180, 83, 9, 0.85)',
  },
  ready: {
    backgroundColor: 'rgba(22, 163, 74, 0.9)',
  },
  text: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtext: {
    color: '#f8fafc',
    fontSize: 12,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
