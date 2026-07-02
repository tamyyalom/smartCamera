import React from 'react';
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

const mockedGetMediaFile = mediaService.getMediaFile as jest.MockedFunction<
  typeof mediaService.getMediaFile
>;

describe('EditScreen', () => {
  const navigation = createNavigationMock();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows placeholder when file exists', async () => {
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

    expect(findTextContaining(tree.root, 'עריכה')).toBe(true);
    expect(findTextContaining(tree.root, 'בקרוב')).toBe(true);
    expect(findTextContaining(tree.root, 'edit-me.jpg')).toBe(true);
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
