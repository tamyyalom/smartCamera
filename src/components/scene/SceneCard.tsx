import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {SceneProfile} from '../../types/scene';

interface SceneCardProps {
  scene: SceneProfile;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}

export function SceneCard({scene, selected, onPress, testID}: SceneCardProps) {
  const typeLabel = scene.type === 'video' ? 'וידאו' : 'סטילס';
  const zoomLabel = `${scene.framing.zoom_range[0]}×–${scene.framing.zoom_range[1]}×`;
  const primaryHint = scene.guidance_hints[0];

  return (
    <Pressable
      testID={testID}
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.cardTitle}>{scene.name_he}</Text>
          <Text style={styles.cardSubtitle}>{scene.name_en}</Text>
        </View>
        <View style={[styles.check, selected && styles.checkSelected]}>
          {selected ? <Text style={styles.checkMark}>✓</Text> : null}
        </View>
      </View>

      <Text style={styles.cardDescription}>{scene.description_he}</Text>

      <View style={styles.metaRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{typeLabel}</Text>
        </View>
        <View style={styles.badgeMuted}>
          <Text style={styles.badgeMutedText}>זום {zoomLabel}</Text>
        </View>
      </View>

      {primaryHint ? <Text style={styles.hint}>💡 {primaryHint}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  cardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    borderWidth: 2,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  checkMark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
    writingDirection: 'rtl',
  },
  badgeMuted: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeMutedText: {
    fontSize: 12,
    color: '#475569',
    writingDirection: 'rtl',
  },
  hint: {
    fontSize: 13,
    color: '#334155',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
