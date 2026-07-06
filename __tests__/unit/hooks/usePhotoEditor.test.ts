import ReactTestRenderer from 'react-test-renderer';
import {usePhotoEditor} from '@/hooks/usePhotoEditor';
import * as photoEditor from '@/services/media/photoEditor';
import {renderHookResult} from '../../helpers/renderHook';

jest.mock('@/services/media/photoEditor', () => ({
  renderEditedPhoto: jest.fn(),
  saveEditedPhotoCopy: jest.fn(),
}));

const mockedRender = photoEditor.renderEditedPhoto as jest.MockedFunction<
  typeof photoEditor.renderEditedPhoto
>;
const mockedSave = photoEditor.saveEditedPhotoCopy as jest.MockedFunction<
  typeof photoEditor.saveEditedPhotoCopy
>;

const photoFile = {
  id: 'p1',
  type: 'photo' as const,
  filename: 'shot.jpg',
  uri: '/mock/shot.jpg',
  createdAt: Date.now(),
};

describe('usePhotoEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRender.mockResolvedValue('/tmp/edited.jpg');
    mockedSave.mockResolvedValue({
      file: {...photoFile, id: 'p2', filename: 'shot_edited.jpg'},
      savedToGallery: true,
    });
  });

  it('tracks rotation changes and refreshes preview', async () => {
    const hook = await renderHookResult(() => usePhotoEditor(photoFile));

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    expect(hook.getCurrent().previewUri).toBe('file:///mock/shot.jpg');

    await ReactTestRenderer.act(async () => {
      hook.getCurrent().rotateRight();
      await Promise.resolve();
    });

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    expect(mockedRender).toHaveBeenCalledWith('/mock/shot.jpg', 90, 'none');
    expect(hook.getCurrent().hasChanges).toBe(true);
  });

  it('saves edited copy and returns success message', async () => {
    const hook = await renderHookResult(() => usePhotoEditor(photoFile));

    await ReactTestRenderer.act(async () => {
      hook.getCurrent().rotateRight();
      await Promise.resolve();
    });

    let message: string | null = null;
    await ReactTestRenderer.act(async () => {
      message = await hook.getCurrent().saveCopy();
    });

    expect(mockedSave).toHaveBeenCalled();
    expect(message).toContain('נשמרה');
  });
});
