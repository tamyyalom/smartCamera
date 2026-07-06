import React from 'react';
import {Alert} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {EditScreen} from '@/screens/EditScreen';
import * as mediaService from '@/services/media';
import {
  createNavigationMock,
  createRouteMock,
} from '../../helpers/navigation';
import {findTextContaining} from '../../helpers/renderHook';

jest.mock('@/services/media', () => ({
  getMediaFile: jest.fn(),
  formatMediaDate: jest.fn(() => '1 בינו׳ 2025'),
}));

jest.mock('@/hooks/usePhotoEditor', () => ({
  usePhotoEditor: jest.fn(() => ({
    previewUri: 'file:///mock/preview.jpg',
    rotationDegrees: 90,
    cropMode: 'center',
    isProcessing: false,
    isSaving: false,
    error: null,
    hasChanges: true,
    rotateLeft: jest.fn(),
    rotateRight: jest.fn(),
    setCropMode: jest.fn(),
    resetEdits: jest.fn(),
    saveCopy: jest.fn().mockResolvedValue('התמונה נשמרה'),
  })),
}));

const mockedGetMediaFile = mediaService.getMediaFile as jest.MockedFunction<
  typeof mediaService.getMediaFile
>;

describe('EditScreen', () => {
  const navigation = createNavigationMock();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('shows photo editor controls when file exists', async () => {
    mockedGetMediaFile.mockResolvedValue({
      id: 'photo-1',
      type: 'photo',
      filename: 'edit-me.jpg',
      uri: '/mock/edit-me.jpg',
      createdAt: Date.now(),
    });

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <EditScreen
          navigation={navigation as never}
          route={createRouteMock('Edit', {fileId: 'photo-1'}) as never}
        />,
      );
      await Promise.resolve();
    });

    expect(findTextContaining(tree.root, 'edit-me.jpg')).toBe(true);
    expect(findTextContaining(tree.root, 'שמור עותק')).toBe(true);
    expect(findTextContaining(tree.root, 'חיתוך מרכז')).toBe(true);
  });

  it('shows video notice for video files', async () => {
    mockedGetMediaFile.mockResolvedValue({
      id: 'video-1',
      type: 'video',
      filename: 'clip.mp4',
      uri: '/mock/clip.mp4',
      createdAt: Date.now(),
      durationMs: 10_000,
    });

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <EditScreen
          navigation={navigation as never}
          route={createRouteMock('Edit', {fileId: 'video-1'}) as never}
        />,
      );
      await Promise.resolve();
    });

    expect(findTextContaining(tree.root, 'עריכת וידאו — בקרוב')).toBe(true);
  });

  it('shows not-found for missing file', async () => {
    mockedGetMediaFile.mockResolvedValue(undefined);

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <EditScreen
          navigation={navigation as never}
          route={createRouteMock('Edit', {fileId: 'missing'}) as never}
        />,
      );
      await Promise.resolve();
    });

    expect(findTextContaining(tree.root, 'הקובץ לא נמצא')).toBe(true);
  });
});
