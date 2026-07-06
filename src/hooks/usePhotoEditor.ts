import {useCallback, useEffect, useRef, useState} from 'react';
import type {MediaFile} from '../types/media';
import {
  type CropMode,
  hasPhotoEdits,
  normalizeRotationDegrees,
} from '../services/media/imageEditing';
import {renderEditedPhoto, saveEditedPhotoCopy} from '../services/media/photoEditor';
import {captureSuccessMessage} from '../services/media/persistCapture';
import {toFileUri} from '../services/media/mediaStorage';

interface UsePhotoEditorResult {
  previewUri: string | null;
  rotationDegrees: number;
  cropMode: CropMode;
  isProcessing: boolean;
  isSaving: boolean;
  error: string | null;
  hasChanges: boolean;
  rotateLeft: () => void;
  rotateRight: () => void;
  setCropMode: (mode: CropMode) => void;
  resetEdits: () => void;
  saveCopy: () => Promise<string | null>;
}

export function usePhotoEditor(file: MediaFile | null): UsePhotoEditorResult {
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [cropMode, setCropModeState] = useState<CropMode>('none');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const refreshPreview = useCallback(
    async (source: MediaFile, rotation: number, crop: CropMode) => {
      const requestId = ++requestIdRef.current;
      setIsProcessing(true);
      setError(null);

      try {
        if (!hasPhotoEdits(rotation, crop)) {
          if (requestId === requestIdRef.current) {
            setPreviewUri(toFileUri(source.uri));
          }
          return;
        }

        const tempPath = await renderEditedPhoto(source.uri, rotation, crop);
        if (requestId === requestIdRef.current) {
          setPreviewUri(toFileUri(tempPath));
        }
      } catch {
        if (requestId === requestIdRef.current) {
          setError('לא ניתן לעדכן תצוגה מקדימה');
          setPreviewUri(toFileUri(source.uri));
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsProcessing(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!file || file.type !== 'photo') {
      setPreviewUri(null);
      return;
    }

    setRotationDegrees(0);
    setCropModeState('none');
    setPreviewUri(toFileUri(file.uri));
    setError(null);
  }, [file]);

  useEffect(() => {
    if (!file || file.type !== 'photo') {
      return;
    }

    refreshPreview(file, rotationDegrees, cropMode).catch(() => {});
  }, [cropMode, file, refreshPreview, rotationDegrees]);

  const rotateLeft = useCallback(() => {
    setRotationDegrees(current => normalizeRotationDegrees(current - 90));
  }, []);

  const rotateRight = useCallback(() => {
    setRotationDegrees(current => normalizeRotationDegrees(current + 90));
  }, []);

  const setCropMode = useCallback((mode: CropMode) => {
    setCropModeState(mode);
  }, []);

  const resetEdits = useCallback(() => {
    setRotationDegrees(0);
    setCropModeState('none');
    if (file) {
      setPreviewUri(toFileUri(file.uri));
    }
    setError(null);
  }, [file]);

  const saveCopy = useCallback(async (): Promise<string | null> => {
    if (!file || file.type !== 'photo') {
      return null;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await saveEditedPhotoCopy(file, rotationDegrees, cropMode);
      return captureSuccessMessage('photo', result.savedToGallery);
    } catch {
      setError('שמירת העותק נכשלה');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [cropMode, file, rotationDegrees]);

  return {
    previewUri,
    rotationDegrees,
    cropMode,
    isProcessing,
    isSaving,
    error,
    hasChanges: hasPhotoEdits(rotationDegrees, cropMode),
    rotateLeft,
    rotateRight,
    setCropMode,
    resetEdits,
    saveCopy,
  };
}
