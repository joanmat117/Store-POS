import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockCategoryRepo } from '../../helpers/mockRepos.js'
import { mockCategory } from '../../helpers/testData.js'

vi.mock('../../../models/categoryRepo.js', () => ({
  categoryRepo: createMockCategoryRepo()
}))

import { categoryService } from '../../../services/categoryService.js'
import { categoryRepo } from '../../../models/categoryRepo.js'

describe('categoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllCategories', () => {
    it('retorna lista de categorías', async () => {
      categoryRepo.findAll.mockResolvedValue([mockCategory])
      const result = await categoryService.getAllCategories()
      expect(result).toEqual([mockCategory])
    })

    it('retorna array vacío si no hay categorías', async () => {
      categoryRepo.findAll.mockResolvedValue([])
      const result = await categoryService.getAllCategories()
      expect(result).toEqual([])
    })
  })

  describe('getCategoryById', () => {
    it('retorna categoría si existe', async () => {
      categoryRepo.findById.mockResolvedValue(mockCategory)
      const result = await categoryService.getCategoryById(1)
      expect(result).toEqual(mockCategory)
    })

    it('retorna null si no existe', async () => {
      categoryRepo.findById.mockResolvedValue(null)
      const result = await categoryService.getCategoryById(999)
      expect(result).toBeNull()
    })
  })

  describe('createCategory', () => {
    it('crea categoría con nombre', async () => {
      categoryRepo.create.mockResolvedValue({ ...mockCategory, name: 'Nueva Categoría' })
      const result = await categoryService.createCategory('Nueva Categoría')
      expect(result.name).toBe('Nueva Categoría')
      expect(categoryRepo.create).toHaveBeenCalledWith('Nueva Categoría')
    })

    it('maneja nombre vacío', async () => {
      categoryRepo.create.mockResolvedValue({ ...mockCategory, name: '' })
      const result = await categoryService.createCategory('')
      expect(result.name).toBe('')
    })
  })

  describe('updateCategory', () => {
    it('actualiza nombre de categoría', async () => {
      categoryRepo.update.mockResolvedValue({ ...mockCategory, name: 'Actualizada' })
      const result = await categoryService.updateCategory(1, 'Actualizada')
      expect(result?.name).toBe('Actualizada')
      expect(categoryRepo.update).toHaveBeenCalledWith(1, 'Actualizada')
    })

    it('retorna null si no existe', async () => {
      categoryRepo.update.mockResolvedValue(null)
      const result = await categoryService.updateCategory(999, 'Test')
      expect(result).toBeNull()
    })
  })

  describe('deleteCategory', () => {
    it('elimina categoría y retorna changes', async () => {
      categoryRepo.delete.mockResolvedValue({ changes: 1 })
      const result = await categoryService.deleteCategory(1)
      expect(result).toEqual({ changes: 1 })
    })

    it('retorna changes 0 si no existe', async () => {
      categoryRepo.delete.mockResolvedValue({ changes: 0 })
      const result = await categoryService.deleteCategory(999)
      expect(result).toEqual({ changes: 0 })
    })
  })
})