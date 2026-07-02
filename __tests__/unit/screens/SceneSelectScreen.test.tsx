import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {SceneSelectScreen} from '@/screens/SceneSelectScreen';
import {getVideoScenes} from '@/config/scenes';
import {useAppStore} from '@/stores/useAppStore';
import {
  createNavigationMock,
  createRouteMock,
} from '../../helpers/navigation';
import {findPressableByLabel, findTextContaining} from '../../helpers/renderHook';

describe('SceneSelectScreen', () => {
  const navigation = createNavigationMock();

  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.getState().resetSession();
  });

  it('renders video scenes for video mode', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <SceneSelectScreen
          navigation={navigation as never}
          route={createRouteMock('SceneSelect', {mode: 'video'}) as never}
        />,
      );
    });

    expect(findTextContaining(tree.root, 'בחירת סצנה')).toBe(true);
    expect(findTextContaining(tree.root, 'סצנות וידאו')).toBe(true);
    const firstScene = getVideoScenes()[0];
    expect(findTextContaining(tree.root, firstScene.name_he)).toBe(true);
  });

  it('disables continue until a scene is selected', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <SceneSelectScreen
          navigation={navigation as never}
          route={createRouteMock('SceneSelect', {mode: 'video'}) as never}
        />,
      );
    });

    const continueButton = tree.root
      .findAllByProps({disabled: true})
      .find(node => findTextContaining(node, 'המשך'));
    expect(continueButton).toBeTruthy();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('navigates to TripodConnect after scene selection', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <SceneSelectScreen
          navigation={navigation as never}
          route={createRouteMock('SceneSelect', {mode: 'video'}) as never}
        />,
      );
    });

    const sceneId = getVideoScenes()[0].id;
    const sceneCard = findPressableByLabel(
      tree.root,
      getVideoScenes()[0].name_he,
    );
    expect(sceneCard).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      sceneCard?.props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      tree.update(
        <SceneSelectScreen
          navigation={navigation as never}
          route={createRouteMock('SceneSelect', {mode: 'video'}) as never}
        />,
      );
    });

    const continueButton = findPressableByLabel(tree.root, 'המשך');
    expect(continueButton?.props.disabled).not.toBe(true);

    await ReactTestRenderer.act(async () => {
      continueButton?.props.onPress();
    });

    expect(useAppStore.getState().selectedSceneId).toBe(sceneId);
    expect(useAppStore.getState().captureMode).toBe('video');
    expect(navigation.navigate).toHaveBeenCalledWith('TripodConnect', {
      sceneId,
      mode: 'video',
    });
  });
});
