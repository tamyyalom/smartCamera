import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MediaFileRow} from '../components/MediaFileRow';
import {FlowProgress} from '../components/navigation/FlowProgress';
import {useMediaLibrary, type MediaFilter} from '../hooks/useMediaLibrary';
import {useAppStore} from '../stores/useAppStore';
import {a11yButton, a11yHeader} from '../utils/accessibility';
import type {RootStackScreenProps} from '../types/navigation';
import type {MediaFile} from '../types/media';

const FILTERS: {id: MediaFilter; label: string}[] = [
  {id: 'all', label: 'הכל'},
  {id: 'photo', label: 'תמונות'},
  {id: 'video', label: 'וידאו'},
];

function ListSeparator() {
  return <View style={styles.separator} />;
}

export function HomeScreen({navigation}: RootStackScreenProps<'Home'>) {
  const {files, loading, error, refresh, remove} = useMediaLibrary();
  const resetSession = useAppStore(state => state.resetSession);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<MediaFilter>('all');

  const filteredFiles = useMemo(() => {
    if (filter === 'all') {
      return files;
    }
    return files.filter(file => file.type === filter);
  }, [files, filter]);

  const photoCount = useMemo(
    () => files.filter(file => file.type === 'photo').length,
    [files],
  );
  const videoCount = useMemo(
    () => files.filter(file => file.type === 'video').length,
    [files],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const startFlow = (mode: 'photo' | 'video') => {
    resetSession();
    navigation.navigate('SceneSelect', {mode});
  };

  const handleView = (file: MediaFile) => {
    navigation.navigate('MediaPreview', {fileId: file.id});
  };

  const handleEdit = (file: MediaFile) => {
    navigation.navigate('Edit', {fileId: file.id});
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyWrap}>
          <ActivityIndicator color="#2563eb" />
        </View>
      );
    }

    const emptyLabel =
      filter === 'photo'
        ? 'אין עדיין תמונות'
        : filter === 'video'
          ? 'אין עדיין הקלטות'
          : 'אין עדיין קבצים';

    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>{emptyLabel}</Text>
        <Text style={styles.emptyText}>
          תמונות והקלטות שישמרו מהמצלמה יופיעו כאן
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView testID="home.screen" style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title} {...a11yHeader('SmartCamera')}>
          SmartCamera
        </Text>
        <Text style={styles.subtitle}>שלב 1 — בחרי פעולה להתחלה</Text>
      </View>

      <FlowProgress currentStep={1} />

      <View style={styles.actions}>
        <Pressable
          testID="home.startVideo"
          {...a11yButton('התחל הקלטה', {
            hint: 'מעבר לבחירת סצנת וידאו',
          })}
          style={({pressed}) => [
            styles.button,
            styles.primary,
            pressed && styles.pressed,
          ]}
          onPress={() => startFlow('video')}>
          <Text style={styles.buttonText}>התחל הקלטה</Text>
        </Pressable>

        <Pressable
          testID="home.startPhoto"
          {...a11yButton('התחל צילום', {
            hint: 'מעבר לבחירת סצנת סטילס',
          })}
          style={({pressed}) => [
            styles.button,
            styles.secondary,
            pressed && styles.pressed,
          ]}
          onPress={() => startFlow('photo')}>
          <Text style={styles.buttonTextDark}>התחל צילום</Text>
        </Pressable>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.filesTitle}>קבצים מקומיים</Text>
        {files.length > 0 && (
          <Text style={styles.filesCount}>
            {photoCount} תמונות · {videoCount} וידאו
          </Text>
        )}
      </View>

      <View style={styles.filters}>
        {FILTERS.map(item => {
          const active = filter === item.id;
          return (
            <Pressable
              key={item.id}
              {...a11yButton(`סינון: ${item.label}`, {
                selected: active,
                hint: 'מציג קבצים לפי סוג',
              })}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(item.id)}>
              <Text
                style={[styles.filterText, active && styles.filterTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        accessibilityLabel="רשימת קבצים מקומיים"
        data={filteredFiles}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <MediaFileRow
            file={item}
            onView={handleView}
            onEdit={handleEdit}
            onDeleted={remove}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          filteredFiles.length === 0 && styles.listContentEmpty,
        ]}
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actions: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: '#e2e8f0',
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  buttonTextDark: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  listHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  filesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    writingDirection: 'rtl',
  },
  filesCount: {
    fontSize: 13,
    color: '#64748b',
    writingDirection: 'rtl',
  },
  filters: {
    flexDirection: 'row-reverse',
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    writingDirection: 'rtl',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  separator: {
    height: 10,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    writingDirection: 'rtl',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 22,
  },
  error: {
    color: '#dc2626',
    textAlign: 'right',
    paddingHorizontal: 24,
    paddingBottom: 8,
    writingDirection: 'rtl',
  },
});
