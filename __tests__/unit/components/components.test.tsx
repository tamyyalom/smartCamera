import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {FaceGuideBanner} from '@/components/camera/FaceGuideBanner';
import {
  FLOW_STEPS,
  FlowProgress,
} from '@/components/navigation/FlowProgress';
import {SceneCard} from '@/components/scene/SceneCard';
import {getVideoScenes} from '@/config/scenes';
import {textContent} from '../../helpers/renderHook';

describe('FlowProgress', () => {
  it('renders all flow steps', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<FlowProgress currentStep={2} />);
    });
    const labels = tree!.root.findAllByType('Text' as never);
    FLOW_STEPS.forEach(step => {
      expect(
        labels.some(node => String(node.props.children).includes(step.label)),
      ).toBe(true);
    });
  });

  it('renders dark variant without crashing', () => {
    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<FlowProgress currentStep={4} variant="dark" />);
    });
  });
});

describe('FaceGuideBanner', () => {
  it('returns null when disabled', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <FaceGuideBanner status="ready" faceCount={1} enabled={false} />,
      );
    });
    expect(tree!.toJSON()).toBeNull();
  });

  it('shows ready message', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <FaceGuideBanner status="ready" faceCount={1} enabled />,
      );
    });
    const text = tree!.root.findByType('Text' as never);
    expect(String(text.props.children)).toMatch(/מיקום מושלם/);
  });

  it('shows multi-face subtext', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <FaceGuideBanner status="misaligned" faceCount={3} enabled />,
      );
    });
    const texts = tree!.root.findAllByType('Text' as never);
    expect(
      texts.some(node => textContent(node).includes('3 פנים')),
    ).toBe(true);
  });
});

describe('SceneCard', () => {
  const scene = getVideoScenes()[0];

  it('renders scene name', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <SceneCard scene={scene} selected={false} onPress={jest.fn()} />,
      );
    });
    const texts = tree!.root.findAllByType('Text' as never);
    expect(
      texts.some(node => String(node.props.children).includes(scene.name_he)),
    ).toBe(true);
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <SceneCard scene={scene} selected onPress={onPress} />,
      );
    });
    const pressable = tree!.root.findByProps({onPress});
    ReactTestRenderer.act(() => {
      pressable.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
