import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ShareLib from 'react-native-share';
import {VideoThumbnail} from './media/VideoThumbnail';
import {
  formatDuration,
  formatMediaDate,
  getMimeType,
  toFileUri,
} from '../services/media';
import type {MediaFile} from '../types/media';

interface MediaFileRowProps {
  file: MediaFile;
  onView: (file: MediaFile) => void;
  onEdit: (file: MediaFile) => void;
  onDeleted: (id: string) => Promise<string | null>;
}

export function MediaFileRow({file, onView, onEdit, onDeleted}: MediaFileRowProps) {
  const typeLabel = file.type === 'photo' ? 'תמונה' : 'וידאו';
  const duration = formatDuration(file.durationMs);

  const handleShare = async () => {
    try {
      await ShareLib.open({
        url: toFileUri(file.uri),
        type: getMimeType(file.type),
        failOnCancel: false,
      });
    } catch {
      await Share.share({
        message: `${typeLabel}: ${file.filename}`,
      });
    }
  };

  const handleDelete = () => {
    Alert.alert('מחיקת קובץ', `למחוק את "${file.filename}"?`, [
      {text: 'ביטול', style: 'cancel'},
      {
        text: 'מחק',
        style: 'destructive',
        onPress: async () => {
          const deleteError = await onDeleted(file.id);
          if (deleteError) {
            Alert.alert('שגיאה', deleteError);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <Pressable style={styles.mainRow} onPress={() => onView(file)}>
        <View style={styles.thumbnailWrap}>
          {file.type === 'photo' ? (
            <Image
              source={{uri: toFileUri(file.uri)}}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <VideoThumbnail uri={file.uri} durationLabel={duration ?? undefined} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.filename} numberOfLines={1}>
            {file.filename}
          </Text>
          <Text style={styles.meta}>
            {typeLabel}
            {duration ? ` · ${duration}` : ''} · {formatMediaDate(file.createdAt)}
          </Text>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <ActionButton label="הצגה" onPress={() => onView(file)} />
        <ActionButton label="עריכה" onPress={() => onEdit(file)} />
        <ActionButton label="שיתוף" onPress={handleShare} />
        <ActionButton label="מחיקה" onPress={handleDelete} destructive />
      </View>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  destructive = false,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      style={({pressed}) => [styles.actionBtn, pressed && styles.actionPressed]}
      onPress={onPress}>
      <Text style={[styles.actionText, destructive && styles.actionDestructive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  mainRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  thumbnailWrap: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
  },
  filename: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  meta: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actions: {
    flexDirection: 'row-reverse',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionPressed: {
    backgroundColor: '#f8fafc',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
    writingDirection: 'rtl',
  },
  actionDestructive: {
    color: '#dc2626',
  },
});
