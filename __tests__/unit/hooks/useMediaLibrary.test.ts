import * as mediaService from '@/services/media';
import {useMediaLibrary} from '@/hooks/useMediaLibrary';
import {renderHookResult} from '../../helpers/renderHook';

jest.mock('@/services/media', () => ({
  listMediaFiles: jest.fn(),
  deleteMediaFile: jest.fn(),
}));

const mockedList = mediaService.listMediaFiles as jest.MockedFunction<
  typeof mediaService.listMediaFiles
>;
const mockedDelete = mediaService.deleteMediaFile as jest.MockedFunction<
  typeof mediaService.deleteMediaFile
>;

const sampleFiles = [
  {
    id: 'photo-1',
    type: 'photo' as const,
    filename: 'a.jpg',
    uri: '/mock/a.jpg',
    createdAt: 1,
  },
  {
    id: 'video-1',
    type: 'video' as const,
    filename: 'b.mp4',
    uri: '/mock/b.mp4',
    createdAt: 2,
    durationMs: 5000,
  },
];

describe('useMediaLibrary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedList.mockResolvedValue(sampleFiles);
    mockedDelete.mockResolvedValue(undefined);
  });

  it('loads files on mount via focus effect', async () => {
    const hook = await renderHookResult(() => useMediaLibrary());
    expect(mockedList).toHaveBeenCalled();
    expect(hook.getCurrent().files).toEqual(sampleFiles);
    expect(hook.getCurrent().loading).toBe(false);
    expect(hook.getCurrent().error).toBeNull();
    await hook.unmount();
  });

  it('refresh reloads files', async () => {
    const hook = await renderHookResult(() => useMediaLibrary());
    mockedList.mockClear();
    mockedList.mockResolvedValue([sampleFiles[0]]);

    await hook.getCurrent().refresh();
    await hook.rerender();

    expect(mockedList).toHaveBeenCalledTimes(1);
    expect(hook.getCurrent().files).toEqual([sampleFiles[0]]);
    await hook.unmount();
  });

  it('sets error when list fails', async () => {
    mockedList.mockRejectedValueOnce(new Error('disk error'));
    const hook = await renderHookResult(() => useMediaLibrary());
    expect(hook.getCurrent().error).toBe('disk error');
    expect(hook.getCurrent().files).toEqual([]);
    await hook.unmount();
  });

  it('remove deletes file and updates local state', async () => {
    const hook = await renderHookResult(() => useMediaLibrary());
    const error = await hook.getCurrent().remove('photo-1');
    await hook.rerender();

    expect(mockedDelete).toHaveBeenCalledWith('photo-1');
    expect(error).toBeNull();
    expect(hook.getCurrent().files).toEqual([sampleFiles[1]]);
    await hook.unmount();
  });

  it('remove returns error message on failure', async () => {
    mockedDelete.mockRejectedValueOnce(new Error('locked'));
    const hook = await renderHookResult(() => useMediaLibrary());
    const error = await hook.getCurrent().remove('photo-1');
    await hook.rerender();

    expect(error).toBe('locked');
    expect(hook.getCurrent().error).toBe('locked');
    await hook.unmount();
  });
});
