import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockCategoryRepo, createMockProductRepo, createMockCustomerRepo, createMockTransactionRepo } from '../../helpers/mockRepos.js'

vi.mock('../../../models/categoryRepo.js', () => ({
  categoryRepo: createMockCategoryRepo()
}))
vi.mock('../../../models/productRepo.js', () => ({
  productRepo: createMockProductRepo()
}))
vi.mock('../../../models/customerRepo.js', () => ({
  customerRepo: createMockCustomerRepo()
}))
vi.mock('../../../models/transactionRepo.js', () => ({
  transactionRepo: createMockTransactionRepo()
}))
vi.mock('../../../db/index.js', () => ({
  getDb: vi.fn(() => ({
    delete: vi.fn(() => ({ where: vi.fn() }))
  }))
}))
vi.mock('drizzle-orm', () => ({
  like: vi.fn(),
  eq: vi.fn()
}))

import { demoService } from '../../../services/demoService.js'
import { categoryRepo } from '../../../models/categoryRepo.js'
import { productRepo } from '../../../models/productRepo.js'
import { customerRepo } from '../../../models/customerRepo.js'
import { transactionRepo } from '../../../models/transactionRepo.js'

describe('demoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('seedDemoData', () => {
    it('crea categorías, productos, customers y transacciones demo', async () => {
      categoryRepo.create
        .mockResolvedValueOnce({ id: 1, name: 'Demo Beverages' })
        .mockResolvedValueOnce({ id: 2, name: 'Demo Snacks' })
        .mockResolvedValueOnce({ id: 3, name: 'Demo Electronics' })
      productRepo.create.mockResolvedValue({ id: 1 })
      customerRepo.create.mockResolvedValue({ id: 1 })
      transactionRepo.create.mockResolvedValue({ id: 1 })

      const result = await demoService.seedDemoData()

      expect(result).toEqual({ ok: true, message: 'Demo data seeded successfully' })
      expect(categoryRepo.create).toHaveBeenCalledTimes(3)
      expect(categoryRepo.create).toHaveBeenCalledWith('Demo Beverages')
      expect(categoryRepo.create).toHaveBeenCalledWith('Demo Snacks')
      expect(categoryRepo.create).toHaveBeenCalledWith('Demo Electronics')
      expect(productRepo.create).toHaveBeenCalledTimes(6)
      expect(customerRepo.create).toHaveBeenCalledTimes(2)
      expect(transactionRepo.create).toHaveBeenCalledTimes(1)
    })

    it('llama a delete para limpiar datos demo previos', async () => {
      const { getDb } = await import('../../../db/index.js')
      const mockDelete = vi.fn(() => ({ where: vi.fn() }))
      vi.mocked(getDb).mockReturnValue({ delete: mockDelete } as any)

      categoryRepo.create.mockResolvedValue({ id: 1 })
      productRepo.create.mockResolvedValue({ id: 1 })
      customerRepo.create.mockResolvedValue({ id: 1 })
      transactionRepo.create.mockResolvedValue({ id: 1 })

      await demoService.seedDemoData()

      expect(mockDelete).toHaveBeenCalledTimes(4)
    })

    it('maneja errores en creación de categorías', async () => {
      categoryRepo.create.mockRejectedValueOnce(new Error('DB Error'))

      await expect(demoService.seedDemoData()).rejects.toThrow('DB Error')
    })

    it('continúa creando productos aunque fallen algunos', async () => {
      categoryRepo.create
        .mockResolvedValueOnce({ id: 1, name: 'Demo Beverages' })
        .mockResolvedValueOnce({ id: 2, name: 'Demo Snacks' })
        .mockResolvedValueOnce({ id: 3, name: 'Demo Electronics' })
      productRepo.create
        .mockResolvedValueOnce({ id: 1 })
        .mockRejectedValueOnce(new Error('Product fail'))
        .mockResolvedValue({ id: 2 })
      customerRepo.create.mockResolvedValue({ id: 1 })
      transactionRepo.create.mockResolvedValue({ id: 1 })

      await expect(demoService.seedDemoData()).rejects.toThrow('Product fail')
    })
  })
})