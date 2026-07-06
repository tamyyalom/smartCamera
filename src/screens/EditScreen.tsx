import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {PhotoEditorToolbar} from '../components/media/PhotoEditorToolbar';
import {usePhotoEditor} from '../hooks/usePhotoEditor';
import {formatMediaDate, getMediaFile} from '../services/media';
import type {RootStackScreenProps} from '../types/navigation';
import type {MediaFile} from '../types/media';
import {a11yButton, a11yHeader, a11yImage} from '../utils/accessibility';

export function EditScreen({navigation, route}: RootStackScreenProps<'Edit'>) {
  const {fileId} = route.params;
  const [file, setFile] = useState<MediaFile | null>(null);
  const [loading, setLoading] = useState(true);
  const editor = usePhotoEditor(file);

  useEffect(() => {
    getMediaFile(fileId).then(result => {
      setFile(result ?? null);
      setLoading(false);
    });
  }, [fileId]);

  const handleSave = async () => {
    const message = await editor.saveCopy();
    if (!message) {
      return;
    }

    Alert.alert('נשמר', message, [
      {text: 'הישאר בעריכה', style: 'cancel'},
      {
        text: 'חזרה לבית',
        onPress: () => navigation.popToTop(),
      },
    ]);
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
        <Pressable
          {...a11yButton('חזרה')}
          onPress={() => navigation.goBack()}>
          <Text style={styles.link}>חזרה</Text>
        </Pressable>
      </View>
    );
  }

  const isPhoto = file.type === 'photo';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          {...a11yButton('חזרה')}
          onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← חזרה</Text>
        </Pressable>
        <Text style={styles.title} {...a11yHeader('עריכה')}>
          עריכה
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.filename}>{file.filename}</Text>
        <Text style={styles.meta}>{formatMediaDate(file.createdAt)}</Text>

        {isPhoto ? (
          <>
            <View style={styles.previewWrap}>
              {editor.previewUri ? (
                <Image
                  {...a11yImage(`תצוגה מקדימה של ${file.filename}`)}
                  source={{uri: editor.previewUri}}
                  style={styles.preview}
                  resizeMode="contain"
                />
              ) : (
                <ActivityIndicator color="#2563eb" />
              )}
            </View>

            {editor.error ? (
              <Text style={styles.errorBanner}>{editor.error}</Text>
            ) : null}

            <PhotoEditorToolbar
              cropMode={editor.cropMode}
              hasChanges={editor.hasChanges}
              isProcessing={editor.isProcessing}
              isSaving={editor.isSaving}
              onRotateLeft={editor.rotateLeft}
              onRotateRight={editor.rotateRight}
              onCropModeChange={editor.setCropMode}
              onReset={editor.resetEdits}
              onSave={handleSave}
            />
          </>
        ) : (
          <View style={styles.videoNotice}>
            <Text style={styles.videoNoticeTitle}>עריכת וידאו — בקרוב</Text>
            <Text style={styles.videoNoticeText}>
              בשלב זה ניתן לערוך תמונות בלבד. לצפייה ושיתוף וידאו השתמשי במסך
              ההצגה מהבית.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  back: {
    color: '#2563eb',
    fontSize: 16,
    writingDirection: 'rtl',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    writingDirection: 'rtl',
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  filename: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  meta: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  previewWrap: {
    marginTop: 16,
    flex: 1,
    minHeight: 240,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  errorBanner: {
    marginTop: 10,
    color: '#dc2626',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  videoNotice: {
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  videoNoticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  videoNoticeText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 22,
  },
  errorText: {
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 12,
    writingDirection: 'rtl',
  },
  link: {
    color: '#2563eb',
    fontSize: 16,
    writingDirection: 'rtl',
  },
});
