import fs from 'fs';
import path from 'path';
import { mediaRepo } from '../models/mediaRepo.js';
import { logger } from '../logger.js';
import type { MediaDTO } from '../types/index.js';

export const mediaService = {
  async getAllMedia(): Promise<MediaDTO[]> {
    return mediaRepo.findAll();
  },
  async getMediaById(id: number): Promise<MediaDTO | null> {
    return mediaRepo.findById(id);
  },
  async uploadMedia(file: Express.Multer.File, uploadsPath: string, source = 'upload', pexelsData: { pexels_id?: number; photographer?: string; alt?: string } = {}): Promise<MediaDTO> {
    const mediaData = {
      filename: file.filename,
      source,
      pexels_id: pexelsData.pexels_id || null,
      photographer: pexelsData.photographer || '',
      alt: pexelsData.alt || '',
      created_at: new Date().toISOString(),
    };
    return mediaRepo.create(mediaData);
  },
  async deleteMedia(id: number, uploadsPath: string): Promise<{ ok: boolean }> {
    const filename = await mediaRepo.delete(id);
    if (filename) {
      const filePath = path.join(uploadsPath, filename);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (err) {
        logger.error({ err, operation: 'deleteMediaFile', path: filePath }, 'Failed to delete media file');
      }
    }
    return { ok: true };
  },
};