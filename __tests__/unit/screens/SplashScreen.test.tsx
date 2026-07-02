import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {SplashScreen} from '@/screens/SplashScreen';
import * as mediaService from '@/services/media';
import {createNavigationMock, createRouteMock} from '../../helpers/navigation';
import {findTextContaining} from '../../helpers/renderHook';

jest.mock('@/services/media', () => ({
  ensureMediaDirectory: jest.fn().mockResolvedValue('/mock/media'),
}));

const mockedEnsureDir = mediaService.ensureMediaDirectory as jest.MockedFunction<
  typeof mediaService.ensureMediaDirectory
>;

describe('SplashScreen', () => {
  const navigation = createNavigationMock();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders branding while bootstrapping', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <SplashScreen
          navigation={navigation as never}
          route={createRouteMock('Splash', undefined) as never}
        />,
      );
    });

    expect(findTextContaining(tree.root, 'SmartCamera')).toBe(true);
    expect(findTextContaining(tree.root, 'מצלמה חכמה')).toBe(true);
  });

  it('initializes media directory then navigates to Home', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SplashScreen
          navigation={navigation as never}
          route={createRouteMock('Splash', undefined) as never}
        />,
      );
    });

    expect(mockedEnsureDir).toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(1200);
      await Promise.resolve();
    });

    expect(navigation.replace).toHaveBeenCalledWith('Home');
  });

  it('does not navigate after unmount', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <SplashScreen
          navigation={navigation as never}
          route={createRouteMock('Splash', undefined) as never}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      tree.unmount();
    });

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(1200);
      await Promise.resolve();
    });

    expect(navigation.replace).not.toHaveBeenCalled();
  });
});
