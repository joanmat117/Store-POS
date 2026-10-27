import fs from 'fs';
import path from 'path';
import { mediaRepo } from '../models/mediaRepo.js';
import { logger } from '../logger.js';

export const mediaService = {
  async getAllMedia() {
    return mediaRepo.findAll();
  },
  async getMediaById(id) {
    return mediaRepo.findById(id);
  },
  async uploadMedia(file, uploadsPath, source = 'upload', pexelsData = {}) {
    const filename = file.filename;
    const mediaData = {
      filename,
      source,
      pexels_id: pexelsData.pexels_id || null,
      photographer: pexelsData.photographer || '',
      alt: pexelsData.alt || '',
      created_at: new Date().toISOString(),
    };
    return mediaRepo.create(mediaData);
  },
  async deleteMedia(id, uploadsPath) {
    const filename = mediaRepo.delete(id);
    if (filename) {
      const filePath = path.join(uploadsPath, filename);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (err) {
        logger.error(
          { err, operation: 'deleteMediaFile', path: filePath },
          'Failed to delete media file'
        );
      }
    }
    return { ok: true };
  },
};
