import { getDb } from '../db/index.js';
import { mediaLibrary } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';
import type { MediaRow, MediaDTO } from '../types/index.js';

function mapMedia(row: MediaRow | undefined): MediaDTO | null {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    filename: row.filename,
    path: row.filename,
    source: row.source,
    pexels_id: row.pexels_id,
    photographer: row.photographer,
    alt: row.alt,
    created_at: row.created_at,
  };
}

export const mediaRepo = {
  async findAll(): Promise<MediaDTO[]> {
    const rows = await getDb().select().from(mediaLibrary).orderBy(mediaLibrary.created_at);
    return rows.map(mapMedia).filter((m): m is MediaDTO => m !== null);
  },
  async findById(id: number): Promise<MediaDTO | null> {
    const result = await getDb().select().from(mediaLibrary).where(eq(mediaLibrary.id, id)).limit(1);
    return mapMedia(result[0]);
  },
  async findByFilename(filename: string): Promise<MediaDTO | null> {
    const result = await getDb().select().from(mediaLibrary).where(eq(mediaLibrary.filename, filename)).limit(1);
    return mapMedia(result[0]);
  },
  async create(mediaData: {
    filename: string;
    source?: string;
    pexels_id?: number | null;
    photographer?: string;
    alt?: string;
    created_at?: string;
  }): Promise<MediaDTO> {
    const result = await getDb()
      .insert(mediaLibrary)
      .values({
        filename: mediaData.filename,
        source: mediaData.source || 'upload',
        pexels_id: mediaData.pexels_id || null,
        photographer: mediaData.photographer || '',
        alt: mediaData.alt || '',
        created_at: mediaData.created_at || new Date().toISOString(),
      })
      .returning({ id: mediaLibrary.id });
    const media = await this.findById(result[0].id);
    if (!media) throw new Error('Failed to create media');
    return media;
  },
  async delete(id: number): Promise<string | undefined> {
    const row = await getDb().select({ filename: mediaLibrary.filename }).from(mediaLibrary).where(eq(mediaLibrary.id, id)).limit(1);
    await getDb().delete(mediaLibrary).where(eq(mediaLibrary.id, id));
    return row[0]?.filename;
  },
  mapMedia,
};