import React, {useCallback, useState} from 'react';
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
import {useMediaLibrary} from '../hooks/useMediaLibrary';
import type {RootStackScreenProps} from '../types/navigation';
import type {MediaFile} from '../types/media';

function ListSeparator() {
  return <View style={styles.separator} />;
}

export function HomeScreen({navigation}: RootStackScreenProps<'Home'>) {
  const {files, loading, error, refresh, remove} = useMediaLibrary();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleView = (file: MediaFile) => {
    navigation.navigate('MediaPreview', {fileId: file.id});
  };

  const handleEdit = (file: MediaFile) => {
    navigation.navigate('Edit', {fileId: file.id});
  };

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyWrap}>
          <ActivityIndicator color="#2563eb" />
        </View>
      );
    }

    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>אין עדיין קבצים</Text>
        <Text style={styles.emptyText}>
          תמונות והקלטות שישמרו מהמצלמה יופיעו כאן
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>SmartCamera</Text>
        <Text style={styles.subtitle}>בחרי פעולה להתחלה</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({pressed}) => [
            styles.button,
            styles.primary,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.navigate('SceneSelect', {mode: 'video'})}>
          <Text style={styles.buttonText}>התחל הקלטה</Text>
        </Pressable>

        <Pressable
          style={({pressed}) => [
            styles.button,
            styles.secondary,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.navigate('SceneSelect', {mode: 'photo'})}>
          <Text style={styles.buttonTextDark}>התחל צילום</Text>
        </Pressable>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.filesTitle}>קבצים אחרונים</Text>
        {files.length > 0 && (
          <Text style={styles.filesCount}>{files.length} קבצים</Text>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={files}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <MediaFileRow
            file={item}
            onView={handleView}
            onEdit={handleEdit}
            onDeleted={handleDelete}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          files.length === 0 && styles.listContentEmpty,
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
    paddingTop: 24,
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
    paddingTop: 28,
    paddingBottom: 12,
  },
  filesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    writingDirection: 'rtl',
  },
  filesCount: {
    fontSize: 14,
    color: '#64748b',
    writingDirection: 'rtl',
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
