import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {formatMediaDate, getMediaFile} from '../services/media';
import type {RootStackScreenProps} from '../types/navigation';
import type {MediaFile} from '../types/media';
import {a11yButton, a11yHeader} from '../utils/accessibility';

export function EditScreen({navigation, route}: RootStackScreenProps<'Edit'>) {
  const {fileId} = route.params;
  const [file, setFile] = useState<MediaFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMediaFile(fileId).then(result => {
      setFile(result ?? null);
      setLoading(false);
    });
  }, [fileId]);

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

        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>עריכה — בקרוב</Text>
          <Text style={styles.placeholderText}>
            עריכה אוטומטית וידנית יתווספו בשלב 6. בינתיים ניתן להציג ולשתף
            מהמסך הראשי.
          </Text>
        </View>
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
    padding: 24,
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
  placeholder: {
    marginTop: 32,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  placeholderText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
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
