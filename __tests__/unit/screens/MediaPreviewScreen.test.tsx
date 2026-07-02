import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import ShareLib from 'react-native-share';
import {MediaPreviewScreen} from '@/screens/MediaPreviewScreen';
import * as mediaService from '@/services/media';
import {
  createNavigationMock,
  createRouteMock,
} from '../../helpers/navigation';
import {findPressableByLabel, findTextContaining} from '../../helpers/renderHook';

jest.mock('@/services/media', () => ({
  getMediaFile: jest.fn(),
  formatDuration: jest.fn((ms?: number) => (ms ? '1:05' : null)),
  formatMediaDate: jest.fn(() => '1 בינו׳ 2025'),
  getMimeType: jest.fn((type: string) =>
    type === 'photo' ? 'image/jpeg' : 'video/mp4',
  ),
  toFileUri: jest.fn((path: string) =>
    path.startsWith('file://') ? path : `file://${path}`,
  ),
}));

const mockedGetMediaFile = mediaService.getMediaFile as jest.MockedFunction<
  typeof mediaService.getMediaFile
>;

const photoFile = {
  id: 'photo-1',
  type: 'photo' as const,
  filename: 'sunset.jpg',
  uri: '/mock/sunset.jpg',
  createdAt: 1_700_000_000_000,
};

const videoFile = {
  id: 'video-1',
  type: 'video' as const,
  filename: 'clip.mp4',
  uri: '/mock/clip.mp4',
  createdAt: 1_700_000_000_000,
  durationMs: 65_000,
};

describe('MediaPreviewScreen', () => {
  const navigation = createNavigationMock();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading indicator initially', async () => {
    mockedGetMediaFile.mockReturnValue(new Promise(() => {}));
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <MediaPreviewScreen
          navigation={navigation as never}
          route={createRouteMock('MediaPreview', {fileId: 'photo-1'}) as never}
        />,
      );
    });

    expect(tree.root.findByType('ActivityIndicator' as never)).toBeTruthy();
  });

  it('shows not-found state for missing file', async () => {
    mockedGetMediaFile.mockResolvedValue(undefined);
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <MediaPreviewScreen
          navigation={navigation as never}
          route={createRouteMock('MediaPreview', {fileId: 'missing'}) as never}
        />,
      );
      await Promise.resolve();
    });

    expect(findTextContaining(tree.root, 'הקובץ לא נמצא')).toBe(true);
  });

  it('renders photo preview with metadata', async () => {
    mockedGetMediaFile.mockResolvedValue(photoFile);
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <MediaPreviewScreen
          navigation={navigation as never}
          route={createRouteMock('MediaPreview', {fileId: photoFile.id}) as never}
        />,
      );
      await Promise.resolve();
    });

    expect(findTextContaining(tree.root, photoFile.filename)).toBe(true);
    expect(findTextContaining(tree.root, 'תמונה')).toBe(true);
    expect(tree.root.findByType('Image' as never)).toBeTruthy();
  });

  it('renders video player for video files', async () => {
    mockedGetMediaFile.mockResolvedValue(videoFile);
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <MediaPreviewScreen
          navigation={navigation as never}
          route={createRouteMock('MediaPreview', {fileId: videoFile.id}) as never}
        />,
      );
      await Promise.resolve();
    });

    expect(findTextContaining(tree.root, 'וידאו')).toBe(true);
    expect(tree.root.findByType('Video' as never)).toBeTruthy();
  });

  it('opens native share sheet', async () => {
    mockedGetMediaFile.mockResolvedValue(photoFile);

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <MediaPreviewScreen
          navigation={navigation as never}
          route={createRouteMock('MediaPreview', {fileId: photoFile.id}) as never}
        />,
      );
      await Promise.resolve();
    });

    const shareButton = findPressableByLabel(tree.root, 'שיתוף');
    await ReactTestRenderer.act(async () => {
      await shareButton?.props.onPress();
    });

    expect(ShareLib.open).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'file:///mock/sunset.jpg',
        type: 'image/jpeg',
      }),
    );
  });
});
