import { Request, Response } from 'express';
import { mediaService } from '../services/mediaService.js';
import type { MediaDTO } from '../types/index.js';

function getMediaIdParam(req: Request): number {
  return parseInt(String(req.params.mediaId), 10);
}

export const mediaController = {
  async getMedia(req: Request, res: Response): Promise<void> {
    const media = await mediaService.getAllMedia();
    res.json(media);
  },
  async getMediaById(req: Request, res: Response): Promise<void> {
    const media = await mediaService.getMediaById(getMediaIdParam(req));
    if (!media) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }
    res.json(media);
  },
  async uploadMedia(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const media = await mediaService.uploadMedia(req.file, req.uploadsPath!, 'upload');
    res.json(media);
  },
  async deleteMedia(req: Request, res: Response): Promise<void> {
    await mediaService.deleteMedia(getMediaIdParam(req), req.uploadsPath!);
    res.sendStatus(200);
  },
};