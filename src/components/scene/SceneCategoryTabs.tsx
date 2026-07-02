import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

interface SceneCategoryTabsProps {
  activeMode: 'photo' | 'video';
  videoCount: number;
  stillCount: number;
  onChange: (mode: 'photo' | 'video') => void;
}

export function SceneCategoryTabs({
  activeMode,
  videoCount,
  stillCount,
  onChange,
}: SceneCategoryTabsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tab, activeMode === 'video' && styles.tabActive]}
        onPress={() => onChange('video')}>
        <Text style={[styles.tabText, activeMode === 'video' && styles.tabTextActive]}>
          וידאו ({videoCount})
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tab, activeMode === 'photo' && styles.tabActive]}
        onPress={() => onChange('photo')}>
        <Text style={[styles.tabText, activeMode === 'photo' && styles.tabTextActive]}>
          סטילס ({stillCount})
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    writingDirection: 'rtl',
  },
  tabTextActive: {
    color: '#ffffff',
  },
});
