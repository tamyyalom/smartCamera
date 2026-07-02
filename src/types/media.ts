export type MediaType = 'photo' | 'video';

export interface MediaFile {
  id: string;
  type: MediaType;
  filename: string;
  uri: string;
  createdAt: number;
  durationMs?: number;
}

export interface SaveMediaInput {
  type: MediaType;
  sourceUri: string;
  filename?: string;
  durationMs?: number;
}
