import React, {useCallback, useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {SceneCard} from '../components/scene/SceneCard';
import {SceneCategoryTabs} from '../components/scene/SceneCategoryTabs';
import {FlowScreenLayout} from '../components/navigation/FlowScreenLayout';
import {
  EXPECTED_SCENE_COUNTS,
  getSceneCounts,
  getScenesForMode,
} from '../config/scenes';
import {useAppStore} from '../stores/useAppStore';
import {a11yButton} from '../utils/accessibility';
import type {RootStackScreenProps} from '../types/navigation';
import type {SceneProfile} from '../types/scene';

export function SceneSelectScreen({
  navigation,
  route,
}: RootStackScreenProps<'SceneSelect'>) {
  const initialMode = route.params.mode;
  const setSelectedScene = useAppStore(state => state.setSelectedScene);
  const storedSceneId = useAppStore(state => state.selectedSceneId);
  const storedMode = useAppStore(state => state.captureMode);

  const [activeMode, setActiveMode] = useState<'photo' | 'video'>(initialMode);
  const [selectedByMode, setSelectedByMode] = useState<{
    video: string | null;
    photo: string | null;
  }>(() => ({
    video:
      storedMode === 'video' && storedSceneId ? storedSceneId : null,
    photo:
      storedMode === 'photo' && storedSceneId ? storedSceneId : null,
  }));

  const counts = useMemo(() => getSceneCounts(), []);
  const scenes = useMemo(() => getScenesForMode(activeMode), [activeMode]);
  const selectedId = selectedByMode[activeMode];

  const subtitle = useMemo(() => {
    const count = activeMode === 'video' ? counts.video : counts.still;
    const label = activeMode === 'video' ? 'וידאו' : 'סטילס';
    return `${count} סצנות ${label} · בחרי אחת והמשיכי`;
  }, [activeMode, counts.still, counts.video]);

  const countMismatch =
    counts.video !== EXPECTED_SCENE_COUNTS.video ||
    counts.still !== EXPECTED_SCENE_COUNTS.still;

  const handleModeChange = useCallback((mode: 'photo' | 'video') => {
    setActiveMode(mode);
  }, []);

  const handleSelect = useCallback(
    (sceneId: string) => {
      setSelectedByMode(current => ({...current, [activeMode]: sceneId}));
    },
    [activeMode],
  );

  const onContinue = () => {
    if (!selectedId) {
      return;
    }
    setSelectedScene(selectedId, activeMode);
    navigation.navigate('TripodConnect', {sceneId: selectedId, mode: activeMode});
  };

  const renderItem = ({item, index}: {item: SceneProfile; index: number}) => (
    <SceneCard
      testID={`sceneSelect.scene.${index}`}
      scene={item}
      selected={item.id === selectedId}
      onPress={() => handleSelect(item.id)}
    />
  );

  return (
    <FlowScreenLayout
      testID="sceneSelect.screen"
      step={2}
      title="בחירת סצנה"
      subtitle={subtitle}
      onBack={() => navigation.goBack()}
      footer={
        <Pressable
          testID="sceneSelect.continue"
          {...a11yButton('המשך', {
            disabled: !selectedId,
            hint: 'מעבר לחיבור חצובה',
          })}
          style={[styles.continueButton, !selectedId && styles.continueDisabled]}
          disabled={!selectedId}
          onPress={onContinue}>
          <Text style={styles.continueText}>המשך</Text>
        </Pressable>
      }>
      <SceneCategoryTabs
        activeMode={activeMode}
        videoCount={counts.video}
        stillCount={counts.still}
        onChange={handleModeChange}
      />

      {countMismatch ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            אזהרה: נמצאו {counts.video} סצנות וידאו ו-{counts.still} סצנות סטילס
            (צפוי 9+9)
          </Text>
        </View>
      ) : null}

      <FlatList
        accessibilityLabel={`רשימת סצנות ${activeMode === 'video' ? 'וידאו' : 'סטילס'}`}
        data={scenes}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.listHeader}>
            {activeMode === 'video' ? 'סצנות וידאו' : 'סצנות סטילס'}
          </Text>
        }
      />
    </FlowScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  listHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 4,
  },
  warningBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueDisabled: {
    opacity: 0.5,
  },
  continueText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
});
