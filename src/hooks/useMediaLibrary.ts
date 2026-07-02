import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  deleteMediaFile,
  listMediaFiles,
} from '../services/media';
import type {MediaFile, MediaType} from '../types/media';

export type MediaFilter = 'all' | MediaType;

export function useMediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listMediaFiles();
      setFiles(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'טעינת קבצים נכשלה');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const remove = useCallback(async (id: string): Promise<string | null> => {
    try {
      await deleteMediaFile(id);
      setFiles(current => current.filter(file => file.id !== id));
      return null;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'מחיקה נכשלה';
      setError(message);
      return message;
    }
  }, []);

  return {files, loading, error, refresh, remove};
}
