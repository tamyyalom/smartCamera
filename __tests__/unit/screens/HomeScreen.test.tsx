import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {HomeScreen} from '@/screens/HomeScreen';
import {useMediaLibrary} from '@/hooks/useMediaLibrary';
import {useAppStore} from '@/stores/useAppStore';
import {
  createNavigationMock,
  createRouteMock,
} from '../../helpers/navigation';
import {findPressableByLabel, findTextContaining} from '../../helpers/renderHook';

jest.mock('@/hooks/useMediaLibrary');

const mockUseMediaLibrary = useMediaLibrary as jest.MockedFunction<
  typeof useMediaLibrary
>;

const sampleFile = {
  id: 'file-1',
  type: 'photo' as const,
  filename: 'shot.jpg',
  uri: '/mock/shot.jpg',
  createdAt: Date.now(),
};

describe('HomeScreen', () => {
  const navigation = createNavigationMock();

  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.getState().resetSession();
    mockUseMediaLibrary.mockReturnValue({
      files: [sampleFile],
      loading: false,
      error: null,
      refresh: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(null),
    });
  });

  it('renders title and flow actions', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <HomeScreen navigation={navigation as never} route={createRouteMock('Home', undefined) as never} />,
      );
    });

    expect(findTextContaining(tree.root, 'SmartCamera')).toBe(true);
    expect(findTextContaining(tree.root, 'התחל הקלטה')).toBe(true);
    expect(findTextContaining(tree.root, 'התחל צילום')).toBe(true);
  });

  it('navigates to SceneSelect for video flow', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <HomeScreen navigation={navigation as never} route={createRouteMock('Home', undefined) as never} />,
      );
    });

    const videoButton = findPressableByLabel(tree.root, 'התחל הקלטה');
    expect(videoButton).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      videoButton?.props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith('SceneSelect', {mode: 'video'});
  });

  it('shows file count when media exists', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <HomeScreen navigation={navigation as never} route={createRouteMock('Home', undefined) as never} />,
      );
    });

    expect(findTextContaining(tree.root, '1 תמונות')).toBe(true);
  });
});
