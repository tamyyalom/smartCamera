import {
  captureSuccessMessage,
  persistCapture,
} from '@/services/media/persistCapture';
import * as galleryStorage from '@/services/media/galleryStorage';
import * as mediaStorage from '@/services/media/mediaStorage';

jest.mock('@/services/media/mediaStorage');
jest.mock('@/services/media/galleryStorage');

const mockedSaveMedia = mediaStorage.saveMediaFile as jest.MockedFunction<
  typeof mediaStorage.saveMediaFile
>;
const mockedSaveGallery = galleryStorage.saveToGallery as jest.MockedFunction<
  typeof galleryStorage.saveToGallery
>;

describe('persistCapture', () => {
  const mockFile = {
    id: 'file-1',
    type: 'photo' as const,
    filename: 'photo.jpg',
    uri: '/mock/documents/SmartCamera/media/photo.jpg',
    createdAt: 1_700_000_000_000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedSaveMedia.mockResolvedValue(mockFile);
  });

  it('returns savedToGallery true when gallery save succeeds', async () => {
    mockedSaveGallery.mockResolvedValue(undefined);
    const result = await persistCapture({
      type: 'photo',
      sourceUri: 'file:///tmp/photo.jpg',
    });
    expect(result.file).toEqual(mockFile);
    expect(result.savedToGallery).toBe(true);
  });

  it('returns savedToGallery false when gallery save fails', async () => {
    mockedSaveGallery.mockRejectedValue(new Error('permission denied'));
    const result = await persistCapture({
      type: 'photo',
      sourceUri: 'file:///tmp/photo.jpg',
    });
    expect(result.savedToGallery).toBe(false);
    expect(result.file).toEqual(mockFile);
  });
});

describe('captureSuccessMessage', () => {
  it('describes gallery + app save', () => {
    expect(captureSuccessMessage('photo', true)).toMatch(/גלריה ובאפליקציה/);
  });

  it('describes app-only save with permission hint', () => {
    expect(captureSuccessMessage('video', false)).toMatch(/לא בגלריה/);
  });
});
