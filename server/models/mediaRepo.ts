import { getDb } from '../config/db.js';
import type { MediaRow, MediaDTO } from '../types/index.js';
import { mapMedia } from '../config/db.js';

export const mediaRepo = {
  findAll(): MediaDTO[] {
    return (getDb().prepare('SELECT * FROM media_library ORDER BY created_at DESC').all() as unknown as MediaRow[])
      .map(mapMedia)
      .filter((m): m is MediaDTO => m !== null);
  },
  findById(id: number): MediaDTO | null {
    const row = getDb().prepare('SELECT * FROM media_library WHERE id = ?').get(id) as MediaRow | undefined;
    return mapMedia(row);
  },
  findByFilename(filename: string): MediaDTO | null {
    const row = getDb().prepare('SELECT * FROM media_library WHERE filename = ?').get(filename) as MediaRow | undefined;
    return mapMedia(row);
  },
  create(mediaData: {
    filename: string;
    source?: string;
    pexels_id?: number | null;
    photographer?: string;
    alt?: string;
    created_at?: string;
  }): MediaDTO {
    const result = getDb()
      .prepare(`INSERT INTO media_library (filename, source, pexels_id, photographer, alt, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(
        mediaData.filename,
        mediaData.source || 'upload',
        mediaData.pexels_id || null,
        mediaData.photographer || '',
        mediaData.alt || '',
        mediaData.created_at || new Date().toISOString()
      );
    const media = this.findById(result.lastInsertRowid);
    if (!media) throw new Error('Failed to create media');
    return media;
  },
  delete(id: number): string | undefined {
    const row = getDb().prepare('SELECT filename FROM media_library WHERE id = ?').get(id) as { filename: string } | undefined;
    getDb().prepare('DELETE FROM media_library WHERE id = ?').run(id);
    return row?.filename;
  },
  mapMedia,
};