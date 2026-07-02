import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {FlowScreenLayout} from '../components/navigation/FlowScreenLayout';
import {getScenesForMode} from '../config/scenes';
import {useAppStore} from '../stores/useAppStore';
import type {RootStackScreenProps} from '../types/navigation';
import type {SceneProfile} from '../types/scene';

export function SceneSelectScreen({
  navigation,
  route,
}: RootStackScreenProps<'SceneSelect'>) {
  const {mode} = route.params;
  const setSelectedScene = useAppStore(state => state.setSelectedScene);
  const scenes = useMemo(() => getScenesForMode(mode), [mode]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const title = mode === 'video' ? 'בחירת סצנת וידאו' : 'בחירת סצנת צילום';
  const subtitle =
    mode === 'video'
      ? 'בחרי סצנה שמתאימה לסוג ההקלטה'
      : 'בחרי סצנה שמתאימה לסוג הצילום';

  const onContinue = () => {
    if (!selectedId) {
      return;
    }
    setSelectedScene(selectedId, mode);
    navigation.navigate('TripodConnect', {sceneId: selectedId, mode});
  };

  const renderItem = ({item}: {item: SceneProfile}) => {
    const selected = item.id === selectedId;
    return (
      <Pressable
        style={[styles.card, selected && styles.cardSelected]}
        onPress={() => setSelectedId(item.id)}>
        <Text style={styles.cardTitle}>{item.name_he}</Text>
        <Text style={styles.cardDescription}>{item.description_he}</Text>
      </Pressable>
    );
  };

  return (
    <FlowScreenLayout
      step={2}
      title={title}
      subtitle={subtitle}
      onBack={() => navigation.goBack()}
      footer={
        <Pressable
          style={[styles.continueButton, !selectedId && styles.continueDisabled]}
          disabled={!selectedId}
          onPress={onContinue}>
          <Text style={styles.continueText}>המשך לחיבור חצובה</Text>
        </Pressable>
      }>
      <FlatList
        data={scenes}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'right',
    writingDirection: 'rtl',
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
