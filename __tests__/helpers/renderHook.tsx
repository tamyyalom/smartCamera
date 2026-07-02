import React, {useEffect} from 'react';
import ReactTestRenderer from 'react-test-renderer';

export function textContent(node: {props: {children?: unknown}}): string {
  const {children} = node.props;
  if (Array.isArray(children)) {
    return children.map(child => String(child)).join('');
  }
  return String(children ?? '');
}

export function findTextContaining(
  root: ReactTestRenderer.ReactTestInstance,
  substring: string,
) {
  const texts = root.findAllByType('Text' as never);
  return texts.some(node => textContent(node).includes(substring));
}

function isPressable(node: ReactTestRenderer.ReactTestInstance) {
  return node.type === 'Pressable' || typeof node.props?.onPress === 'function';
}

export function findPressableByLabel(
  root: ReactTestRenderer.ReactTestInstance,
  label: string,
) {
  const texts = root.findAllByType('Text' as never);
  const match = texts.find(node => textContent(node).includes(label));
  if (!match) {
    return undefined;
  }

  let node: ReactTestRenderer.ReactTestInstance | null = match.parent;
  while (node && !isPressable(node)) {
    node = node.parent;
  }
  return node ?? undefined;
}

export async function renderHookResult<T>(useHook: () => T): Promise<{
  getCurrent: () => T;
  rerender: () => Promise<void>;
  unmount: () => Promise<void>;
}> {
  const state: {current: T | undefined} = {current: undefined};

  function Harness() {
    const value = useHook();
    useEffect(() => {
      state.current = value;
    });
    return null;
  }

  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Harness />);
  });

  await ReactTestRenderer.act(async () => {
    await Promise.resolve();
  });

  return {
    getCurrent: () => {
      if (state.current === undefined) {
        throw new Error('Hook result not ready');
      }
      return state.current;
    },
    rerender: async () => {
      await ReactTestRenderer.act(async () => {
        renderer.update(<Harness />);
        await Promise.resolve();
      });
    },
    unmount: async () => {
      await ReactTestRenderer.act(async () => {
        renderer.unmount();
      });
    },
  };
}
