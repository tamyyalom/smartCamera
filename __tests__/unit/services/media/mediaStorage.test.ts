import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import {
  deleteMediaFile,
  formatDuration,
  getMimeType,
  listMediaFiles,
  saveMediaFile,
  toFileUri,
} from '@/services/media/mediaStorage';

const storage = new Map<string, string>();

describe('mediaStorage', () => {
  beforeEach(() => {
    storage.clear();
    jest.clearAllMocks();

    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) =>
      Promise.resolve(storage.get(key) ?? null),
    );
    (AsyncStorage.setItem as jest.Mock).mockImplementation(
      (key: string, value: string) => {
        storage.set(key, value);
        return Promise.resolve();
      },
    );
    (RNFS.exists as jest.Mock).mockResolvedValue(true);
  });

  it('formatDuration formats mm:ss', () => {
    expect(formatDuration(65_000)).toBe('1:05');
    expect(formatDuration(undefined)).toBeNull();
  });

  it('toFileUri normalizes paths', () => {
    expect(toFileUri('/path/file.jpg')).toBe('file:///path/file.jpg');
    expect(toFileUri('file:///path/file.jpg')).toBe('file:///path/file.jpg');
  });

  it('getMimeType maps media types', () => {
    expect(getMimeType('photo')).toBe('image/jpeg');
    expect(getMimeType('video')).toBe('video/mp4');
  });

  it('saveMediaFile copies source and updates index', async () => {
    const file = await saveMediaFile({
      type: 'photo',
      sourceUri: 'file:///tmp/capture.jpg',
      filename: 'capture.jpg',
    });

    expect(RNFS.copyFile).toHaveBeenCalled();
    const files = await listMediaFiles();
    expect(files.some(item => item.id === file.id)).toBe(true);

    await deleteMediaFile(file.id);
    const afterDelete = await listMediaFiles();
    expect(afterDelete.some(item => item.id === file.id)).toBe(false);
  });
});
