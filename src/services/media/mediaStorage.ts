import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import type {MediaFile, MediaType, SaveMediaInput} from '../../types/media';

const INDEX_KEY = '@smartcamera/media_index';
const MEDIA_DIR = `${RNFS.DocumentDirectoryPath}/SmartCamera/media`;

function extensionForType(type: MediaType): string {
  return type === 'photo' ? 'jpg' : 'mp4';
}

function mimeForType(type: MediaType): string {
  return type === 'photo' ? 'image/jpeg' : 'video/mp4';
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizePath(uri: string): string {
  return uri.replace('file://', '');
}

async function readIndex(): Promise<MediaFile[]> {
  const raw = await AsyncStorage.getItem(INDEX_KEY);
  if (!raw) {
    return [];
  }
  return JSON.parse(raw) as MediaFile[];
}

async function writeIndex(files: MediaFile[]): Promise<void> {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(files));
}

export async function ensureMediaDirectory(): Promise<string> {
  const exists = await RNFS.exists(MEDIA_DIR);
  if (!exists) {
    await RNFS.mkdir(MEDIA_DIR);
  }
  return MEDIA_DIR;
}

export async function listMediaFiles(): Promise<MediaFile[]> {
  await ensureMediaDirectory();
  const index = await readIndex();
  const verified: MediaFile[] = [];

  for (const file of index) {
    const exists = await RNFS.exists(normalizePath(file.uri));
    if (exists) {
      verified.push(file);
    }
  }

  if (verified.length !== index.length) {
    await writeIndex(verified);
  }

  return verified.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveMediaFile(input: SaveMediaInput): Promise<MediaFile> {
  await ensureMediaDirectory();

  const id = generateId();
  const ext = input.filename?.split('.').pop() ?? extensionForType(input.type);
  const filename = input.filename ?? `${input.type}_${id}.${ext}`;
  const destPath = `${MEDIA_DIR}/${filename}`;
  const sourcePath = normalizePath(input.sourceUri);

  if (!(await RNFS.exists(sourcePath))) {
    throw new Error('Source file not found');
  }

  await RNFS.copyFile(sourcePath, destPath);

  const file: MediaFile = {
    id,
    type: input.type,
    filename,
    uri: destPath,
    createdAt: Date.now(),
    durationMs: input.durationMs,
  };

  const index = await readIndex();
  index.unshift(file);
  await writeIndex(index);

  return file;
}

export async function deleteMediaFile(id: string): Promise<void> {
  const index = await readIndex();
  const file = index.find(item => item.id === id);
  if (!file) {
    return;
  }

  const path = normalizePath(file.uri);
  if (await RNFS.exists(path)) {
    await RNFS.unlink(path);
  }

  await writeIndex(index.filter(item => item.id !== id));
}

export async function getMediaFile(id: string): Promise<MediaFile | undefined> {
  const files = await listMediaFiles();
  return files.find(file => file.id === id);
}

export function toFileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${path}`;
}

export function getMimeType(type: MediaType): string {
  return mimeForType(type);
}

export function formatMediaDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(durationMs?: number): string | null {
  if (!durationMs) {
    return null;
  }
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
