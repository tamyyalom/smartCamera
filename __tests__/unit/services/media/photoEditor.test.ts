import {renderEditedPhoto, saveEditedPhotoCopy} from '@/services/media/photoEditor';
import * as persistCapture from '@/services/media/persistCapture';
import {loadImage} from 'react-native-nitro-image';

jest.mock('react-native-nitro-image', () => ({
  loadImage: jest.fn(),
}));

jest.mock('@/services/media/persistCapture', () => ({
  persistCapture: jest.fn(),
}));

const mockedLoadImage = loadImage as jest.MockedFunction<typeof loadImage>;
const mockedPersist = persistCapture.persistCapture as jest.MockedFunction<
  typeof persistCapture.persistCapture
>;

function createMockImage(width: number, height: number) {
  return {
    width,
    height,
    rotateAsync: jest.fn().mockImplementation(async (degrees: number) => ({
      width: degrees % 180 === 0 ? width : height,
      height: degrees % 180 === 0 ? height : width,
      cropAsync: jest.fn().mockImplementation(async () => ({
        width: 100,
        height: 100,
        saveToTemporaryFileAsync: jest
          .fn()
          .mockResolvedValue('/tmp/output.jpg'),
      })),
      saveToTemporaryFileAsync: jest
        .fn()
        .mockResolvedValue('/tmp/output.jpg'),
    })),
    cropAsync: jest.fn().mockImplementation(async () => ({
      width: 100,
      height: 100,
      saveToTemporaryFileAsync: jest.fn().mockResolvedValue('/tmp/output.jpg'),
    })),
    saveToTemporaryFileAsync: jest.fn().mockResolvedValue('/tmp/output.jpg'),
  };
}

describe('photoEditor service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedLoadImage.mockResolvedValue(createMockImage(1000, 800) as never);
    mockedPersist.mockResolvedValue({
      file: {
        id: 'new',
        type: 'photo',
        filename: 'shot_edited.jpg',
        uri: '/mock/shot_edited.jpg',
        createdAt: Date.now(),
      },
      savedToGallery: true,
    });
  });

  it('renders rotated and cropped photo to temp file', async () => {
    const path = await renderEditedPhoto('/mock/shot.jpg', 90, 'center');
    expect(path).toBe('/tmp/output.jpg');
    expect(mockedLoadImage).toHaveBeenCalledWith({filePath: '/mock/shot.jpg'});
  });

  it('saves edited copy through persistCapture', async () => {
    await saveEditedPhotoCopy(
      {
        id: 'p1',
        type: 'photo',
        filename: 'shot.jpg',
        uri: '/mock/shot.jpg',
        createdAt: Date.now(),
      },
      0,
      'square',
    );

    expect(mockedPersist).toHaveBeenCalledWith({
      type: 'photo',
      sourceUri: '/tmp/output.jpg',
      filename: 'shot_edited.jpg',
    });
  });
});
