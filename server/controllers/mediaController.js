import { mediaService } from '../services/mediaService.js';

export const mediaController = {
  async getMedia(req, res) {
    const media = await mediaService.getAllMedia();
    res.json(media);
  },
  async getMediaById(req, res) {
    const media = await mediaService.getMediaById(parseInt(req.params.mediaId, 10));
    if (!media) return res.status(404).json({ error: 'Media not found' });
    res.json(media);
  },
  async uploadMedia(req, res) {
    const media = await mediaService.uploadMedia(req.file, req.uploadsPath, 'upload');
    res.json(media);
  },
  async deleteMedia(req, res) {
    await mediaService.deleteMedia(parseInt(req.params.mediaId, 10), req.uploadsPath);
    res.sendStatus(200);
  },
};
