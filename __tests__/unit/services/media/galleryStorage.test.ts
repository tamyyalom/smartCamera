type PlatformOptions = {
  os?: 'ios' | 'android';
  version?: number;
  requestResult?: string;
  requestMultipleResult?: Record<string, string>;
};

function loadGalleryStorage(options: PlatformOptions = {}) {
  jest.resetModules();

  const request = jest.fn().mockResolvedValue(options.requestResult ?? 'granted');
  const requestMultiple = jest
    .fn()
    .mockResolvedValue(
      options.requestMultipleResult ?? {
        'android.permission.READ_MEDIA_IMAGES': 'granted',
        'android.permission.READ_MEDIA_VIDEO': 'granted',
      },
    );
  const saveAsset = jest.fn().mockResolvedValue('asset-uri');

  jest.doMock('react-native', () => ({
    Platform: {
      OS: options.os ?? 'ios',
      Version: options.version ?? 34,
      select: (opts: Record<string, unknown>) =>
        opts[options.os ?? 'ios'] ?? opts.default,
    },
    PermissionsAndroid: {
      PERMISSIONS: {
        READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',
        READ_MEDIA_VIDEO: 'android.permission.READ_MEDIA_VIDEO',
        WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
      },
      RESULTS: {
        GRANTED: 'granted',
        DENIED: 'denied',
      },
      request,
      requestMultiple,
    },
  }));

  jest.doMock('@react-native-camera-roll/camera-roll', () => ({
    CameraRoll: {saveAsset},
  }));

  const gallery = require('@/services/media/galleryStorage') as typeof import('@/services/media/galleryStorage');

  return {gallery, request, requestMultiple, saveAsset};
}

describe('galleryStorage', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('ensureGalleryPermission', () => {
    it('returns true on iOS without requesting Android permissions', async () => {
      const {gallery, request, requestMultiple} = loadGalleryStorage();
      expect(await gallery.ensureGalleryPermission()).toBe(true);
      expect(request).not.toHaveBeenCalled();
      expect(requestMultiple).not.toHaveBeenCalled();
    });

    it('requests read media permissions on Android 13+', async () => {
      const {gallery, requestMultiple} = loadGalleryStorage({
        os: 'android',
        version: 33,
      });

      expect(await gallery.ensureGalleryPermission()).toBe(true);
      expect(requestMultiple).toHaveBeenCalledWith([
        'android.permission.READ_MEDIA_IMAGES',
        'android.permission.READ_MEDIA_VIDEO',
      ]);
    });

    it('returns false when Android 13+ media permissions are denied', async () => {
      const {gallery} = loadGalleryStorage({
        os: 'android',
        version: 33,
        requestMultipleResult: {
          'android.permission.READ_MEDIA_IMAGES': 'granted',
          'android.permission.READ_MEDIA_VIDEO': 'denied',
        },
      });

      expect(await gallery.ensureGalleryPermission()).toBe(false);
    });

    it('requests legacy storage permission on Android 6–12', async () => {
      const {gallery, request} = loadGalleryStorage({
        os: 'android',
        version: 30,
      });

      expect(await gallery.ensureGalleryPermission()).toBe(true);
      expect(request).toHaveBeenCalledWith(
        'android.permission.WRITE_EXTERNAL_STORAGE',
      );
    });

    it('returns true on older Android without runtime permission', async () => {
      const {gallery, request} = loadGalleryStorage({
        os: 'android',
        version: 22,
      });

      expect(await gallery.ensureGalleryPermission()).toBe(true);
      expect(request).not.toHaveBeenCalled();
    });
  });

  describe('saveToGallery', () => {
    it('saves photo asset when permission is granted', async () => {
      const {gallery, saveAsset} = loadGalleryStorage();
      await gallery.saveToGallery('/mock/photo.jpg', 'photo');

      expect(saveAsset).toHaveBeenCalledWith('file:///mock/photo.jpg', {
        type: 'photo',
      });
    });

    it('saves video asset when permission is granted', async () => {
      const {gallery, saveAsset} = loadGalleryStorage();
      await gallery.saveToGallery('/mock/clip.mp4', 'video');

      expect(saveAsset).toHaveBeenCalledWith('file:///mock/clip.mp4', {
        type: 'video',
      });
    });

    it('throws Hebrew error when permission is denied', async () => {
      const {gallery, saveAsset} = loadGalleryStorage({
        os: 'android',
        version: 33,
        requestMultipleResult: {
          'android.permission.READ_MEDIA_IMAGES': 'denied',
          'android.permission.READ_MEDIA_VIDEO': 'denied',
        },
      });

      await expect(gallery.saveToGallery('/mock/photo.jpg', 'photo')).rejects.toThrow(
        /אין הרשאה לשמירה בגלריה/,
      );
      expect(saveAsset).not.toHaveBeenCalled();
    });
  });
});
