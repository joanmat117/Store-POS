import { getDb } from '../config/db.js';

function mapMedia(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    filename: row.filename,
    source: row.source,
    pexels_id: row.pexels_id,
    photographer: row.photographer,
    alt: row.alt,
    created_at: row.created_at,
  };
}

export const mediaRepo = {
  findAll() {
    return getDb()
      .prepare('SELECT * FROM media_library ORDER BY created_at DESC')
      .all()
      .map(mapMedia);
  },
  findById(id) {
    const row = getDb().prepare('SELECT * FROM media_library WHERE id = ?').get(id);
    return mapMedia(row);
  },
  findByFilename(filename) {
    const row = getDb().prepare('SELECT * FROM media_library WHERE filename = ?').get(filename);
    return mapMedia(row);
  },
  create(mediaData) {
    const result = getDb()
      .prepare(
        `INSERT INTO media_library (filename, source, pexels_id, photographer, alt, created_at) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        mediaData.filename,
        mediaData.source || 'upload',
        mediaData.pexels_id || null,
        mediaData.photographer || '',
        mediaData.alt || '',
        mediaData.created_at || new Date().toISOString()
      );
    return this.findById(result.lastInsertRowid);
  },
  delete(id) {
    const row = getDb().prepare('SELECT filename FROM media_library WHERE id = ?').get(id);
    getDb().prepare('DELETE FROM media_library WHERE id = ?').run(id);
    return row?.filename;
  },
  mapMedia,
};
