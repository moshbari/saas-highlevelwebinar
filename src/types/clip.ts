export interface Clip {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  name: string;
  url: string;
  durationSeconds: number;
  durationAutoDetected: boolean;
  thumbnailUrl: string | null;
  fileSizeMb: number | null;
  notes: string | null;
  tags: string[];
  isArchived: boolean;
}

export interface VideoSequenceItem {
  clipId: string;
  order: number;
}

export interface VideoSequenceClip {
  id: string;
  name: string;
  url: string;
  durationSeconds: number;
  order: number;
}

export type VideoMode = 'single' | 'multi';

export const DEFAULT_CLIP: Omit<Clip, 'id' | 'createdAt' | 'updatedAt'> = {
  userId: null,
  name: '',
  url: '',
  durationSeconds: 0,
  durationAutoDetected: true,
  thumbnailUrl: null,
  fileSizeMb: null,
  notes: null,
  tags: [],
  isArchived: false,
};
