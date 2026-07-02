import type {RootStackParamList} from '@/types/navigation';

export function createNavigationMock() {
  return {
    navigate: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
    canGoBack: jest.fn(() => true),
    dispatch: jest.fn(),
    getId: jest.fn(),
    getParent: jest.fn(),
    getState: jest.fn(),
    isFocused: jest.fn(() => true),
  };
}

export function createRouteMock<T extends keyof RootStackParamList>(
  name: T,
  params: RootStackParamList[T],
) {
  return {
    key: `${name}-test`,
    name,
    params,
  };
}
