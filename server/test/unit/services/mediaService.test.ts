import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockMediaRepo } from '../../helpers/mockRepos.js'
import { mockMedia } from '../../helpers/testData.js'
import { createMockFile } from '../../helpers/serviceTestUtils.js'

vi.mock('../../../models/mediaRepo.js', () => ({
  mediaRepo: createMockMediaRepo()
}))
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => true),
    unlinkSync: vi.fn()
  }
}))
vi.mock('path', () => ({
  default: {
    join: vi.fn((...args: string[]) => args.join('/'))
  }
}))
import { mediaService } from '../../../services/mediaService.js'
import { mediaRepo } from '../../../models/mediaRepo.js'
import fs from 'fs'
import path from 'path'
import { logger } from '../../../logger.js'

describe('mediaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fs.existsSync).mockReturnValue(true)
  })

  describe('getAllMedia', () => {
    it('retorna lista de media', async () => {
      mediaRepo.findAll.mockResolvedValue([mockMedia])
      const result = await mediaService.getAllMedia()
      expect(result).toEqual([mockMedia])
    })

    it('retorna array vacío si no hay media', async () => {
      mediaRepo.findAll.mockResolvedValue([])
      const result = await mediaService.getAllMedia()
      expect(result).toEqual([])
    })
  })

  describe('getMediaById', () => {
    it('retorna media si existe', async () => {
      mediaRepo.findById.mockResolvedValue(mockMedia)
      const result = await mediaService.getMediaById(1)
      expect(result).toEqual(mockMedia)
    })

    it('retorna null si no existe', async () => {
      mediaRepo.findById.mockResolvedValue(null)
      const result = await mediaService.getMediaById(999)
      expect(result).toBeNull()
    })
  })

  describe('uploadMedia', () => {
    it('sube media con file y datos por defecto', async () => {
      const file = createMockFile({ filename: 'photo.jpg' })
      const expected = { ...mockMedia, filename: 'photo.jpg', source: 'upload', created_at: expect.any(String) }
      mediaRepo.create.mockResolvedValue(expected)

      const result = await mediaService.uploadMedia(file, '/uploads')

      expect(result.filename).toBe('photo.jpg')
      expect(result.source).toBe('upload')
      expect(result.pexels_id).toBeNull()
      expect(result.photographer).toBe('')
      expect(result.alt).toBe('')
      expect(mediaRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        filename: 'photo.jpg',
        source: 'upload',
        pexels_id: null,
        photographer: '',
        alt: ''
      }))
    })

    it('sube media con source personalizado y datos de Pexels', async () => {
      const file = createMockFile({ filename: 'pexels-123.jpg' })
      const pexelsData = { pexels_id: 456, photographer: 'John Doe', alt: 'Beautiful landscape' }
      const expected = { ...mockMedia, filename: 'pexels-123.jpg', source: 'pexels', ...pexelsData, created_at: expect.any(String) }
      mediaRepo.create.mockResolvedValue(expected)

      const result = await mediaService.uploadMedia(file, '/uploads', 'pexels', pexelsData)

      expect(result.source).toBe('pexels')
      expect(result.pexels_id).toBe(456)
      expect(result.photographer).toBe('John Doe')
      expect(result.alt).toBe('Beautiful landscape')
    })

    it('usa valores por defecto si pexelsData está incompleto', async () => {
      const file = createMockFile({ filename: 'partial.jpg' })
      mediaRepo.create.mockResolvedValue({ ...mockMedia, filename: 'partial.jpg' })

      await mediaService.uploadMedia(file, '/uploads', 'upload', { pexels_id: 789 })

      expect(mediaRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        pexels_id: 789,
        photographer: '',
        alt: ''
      }))
    })
  })

  describe('deleteMedia', () => {
    it('elimina media y su archivo', async () => {
      mediaRepo.delete.mockResolvedValue('photo.jpg')

      const result = await mediaService.deleteMedia(1, '/uploads')

      expect(result).toEqual({ ok: true })
      expect(fs.unlinkSync).toHaveBeenCalledWith('/uploads/photo.jpg')
    })

    it('retorna ok aunque archivo no exista', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)
      mediaRepo.delete.mockResolvedValue('missing.jpg')

      const result = await mediaService.deleteMedia(1, '/uploads')

      expect(result).toEqual({ ok: true })
      expect(fs.unlinkSync).not.toHaveBeenCalled()
    })

    it('retorna ok aunque repo retorne null', async () => {
      mediaRepo.delete.mockResolvedValue(null)

      const result = await mediaService.deleteMedia(1, '/uploads')

      expect(result).toEqual({ ok: true })
      expect(fs.unlinkSync).not.toHaveBeenCalled()
    })

    it('loggea error si unlinkSync falla en deleteMedia (catch branch)', async () => {
      vi.mocked(fs.unlinkSync).mockImplementationOnce(() => {
        throw new Error('EBUSY: resource busy or locked')
      })
      mediaRepo.delete.mockResolvedValue('locked.jpg')

      const result = await mediaService.deleteMedia(1, '/uploads')

      expect(result).toEqual({ ok: true })
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'deleteMediaFile',
          path: '/uploads/locked.jpg',
          err: expect.any(Error)
        }),
        'Failed to delete media file'
      )
    })
  })
})