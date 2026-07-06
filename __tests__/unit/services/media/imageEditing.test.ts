import {
  editedFilename,
  getCenterCropRect,
  getSquareCenterCropRect,
  hasPhotoEdits,
  normalizeRotationDegrees,
} from '@/services/media/imageEditing';

describe('imageEditing helpers', () => {
  it('normalizes rotation degrees', () => {
    expect(normalizeRotationDegrees(450)).toBe(90);
    expect(normalizeRotationDegrees(-90)).toBe(270);
  });

  it('computes center crop rect', () => {
    expect(getCenterCropRect(1000, 800)).toEqual({
      startX: 100,
      startY: 80,
      endX: 900,
      endY: 720,
    });
  });

  it('computes square center crop rect', () => {
    expect(getSquareCenterCropRect(1200, 800)).toEqual({
      startX: 200,
      startY: 0,
      endX: 1000,
      endY: 800,
    });
  });

  it('detects whether edits were applied', () => {
    expect(hasPhotoEdits(0, 'none')).toBe(false);
    expect(hasPhotoEdits(90, 'none')).toBe(true);
    expect(hasPhotoEdits(0, 'square')).toBe(true);
  });

  it('builds edited filename', () => {
    expect(editedFilename('sunset.jpg')).toBe('sunset_edited.jpg');
  });
});
