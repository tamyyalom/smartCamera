import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ShareLib from 'react-native-share';
import {
  formatDuration,
  formatMediaDate,
  getMediaFile,
  getMimeType,
  toFileUri,
} from '../services/media';
import type {RootStackScreenProps} from '../types/navigation';
import type {MediaFile} from '../types/media';

export function MediaPreviewScreen({
  navigation,
  route,
}: RootStackScreenProps<'MediaPreview'>) {
  const {fileId} = route.params;
  const [file, setFile] = useState<MediaFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMediaFile(fileId).then(result => {
      setFile(result ?? null);
      setLoading(false);
    });
  }, [fileId]);

  const handleShare = async () => {
    if (!file) {
      return;
    }
    try {
      await ShareLib.open({
        url: toFileUri(file.uri),
        type: getMimeType(file.type),
        failOnCancel: false,
      });
    } catch {
      await Share.share({message: file.filename});
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!file) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>הקובץ לא נמצא</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>חזרה</Text>
        </Pressable>
      </View>
    );
  }

  const duration = formatDuration(file.durationMs);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← חזרה</Text>
        </Pressable>
        <Pressable onPress={handleShare}>
          <Text style={styles.share}>שיתוף</Text>
        </Pressable>
      </View>

      <View style={styles.previewArea}>
        {file.type === 'photo' ? (
          <Image
            source={{uri: toFileUri(file.uri)}}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoIcon}>▶</Text>
            <Text style={styles.videoHint}>נגן וידאו — יתווסף עם אינטגרציית המצלמה</Text>
          </View>
        )}
      </View>

      <View style={styles.metaBox}>
        <Text style={styles.filename}>{file.filename}</Text>
        <Text style={styles.meta}>
          {file.type === 'photo' ? 'תמונה' : 'וידאו'}
          {duration ? ` · ${duration}` : ''} · {formatMediaDate(file.createdAt)}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  topBar: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  back: {
    color: '#ffffff',
    fontSize: 16,
    writingDirection: 'rtl',
  },
  share: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  previewArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  videoIcon: {
    fontSize: 48,
    color: '#ffffff',
  },
  videoHint: {
    color: '#94a3b8',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 22,
  },
  metaBox: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  filename: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  meta: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 12,
    writingDirection: 'rtl',
  },
  link: {
    color: '#60a5fa',
    fontSize: 16,
    writingDirection: 'rtl',
  },
});
