import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockTransactionRepo } from '../../helpers/mockRepos.js'
import { mockTransaction } from '../../helpers/testData.js'

vi.mock('../../../models/transactionRepo.js', () => ({
  transactionRepo: createMockTransactionRepo()
}))

import { transactionService } from '../../../services/transactionService.js'
import { transactionRepo } from '../../../models/transactionRepo.js'

describe('transactionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Queries de lectura', () => {
    it('getAllTransactions delega al repo', async () => {
      transactionRepo.findAll.mockResolvedValue([mockTransaction])
      const result = await transactionService.getAllTransactions()
      expect(result).toEqual([mockTransaction])
    })

    it('getOnHoldTransactions delega al repo', async () => {
      transactionRepo.findOnHold.mockResolvedValue([mockTransaction])
      const result = await transactionService.getOnHoldTransactions()
      expect(result).toEqual([mockTransaction])
    })

    it('getCustomerOrders delega al repo', async () => {
      transactionRepo.findCustomerOrders.mockResolvedValue([mockTransaction])
      const result = await transactionService.getCustomerOrders()
      expect(result).toEqual([mockTransaction])
    })

    it('getTransactionsByDate pasa filtros correctamente', async () => {
      const filters = { start: '2024-01-01', end: '2024-01-31', status: 1, userId: 1, till: 1 }
      transactionRepo.findByDateRange.mockResolvedValue([mockTransaction])

      const result = await transactionService.getTransactionsByDate(filters)

      expect(transactionRepo.findByDateRange).toHaveBeenCalledWith(filters)
      expect(result).toEqual([mockTransaction])
    })

    it('getTransactionsByDate con filtros parciales', async () => {
      const filters = { start: '2024-01-01', end: '2024-12-31', status: 0, userId: 0, till: 0 }
      transactionRepo.findByDateRange.mockResolvedValue([mockTransaction, mockTransaction])

      const result = await transactionService.getTransactionsByDate(filters)

      expect(result).toHaveLength(2)
    })

    it('getTransactionById retorna transacción si existe', async () => {
      transactionRepo.findById.mockResolvedValue(mockTransaction)
      const result = await transactionService.getTransactionById(1)
      expect(result).toEqual(mockTransaction)
    })

    it('getTransactionById retorna null si no existe', async () => {
      transactionRepo.findById.mockResolvedValue(null)
      const result = await transactionService.getTransactionById(999)
      expect(result).toBeNull()
    })
  })

  describe('Mutaciones', () => {
    it('createTransaction delega al repo', async () => {
      const formData = { ...mockTransaction, id: undefined }
      transactionRepo.create.mockResolvedValue(mockTransaction)

      const result = await transactionService.createTransaction(formData)

      expect(result).toEqual(mockTransaction)
      expect(transactionRepo.create).toHaveBeenCalledWith(formData)
    })

    it('updateTransaction actualiza y retorna transacción', async () => {
      const updates = { ...mockTransaction, total: 20.00 }
      transactionRepo.update.mockResolvedValue(updates)

      const result = await transactionService.updateTransaction(1, updates)

      expect(result).toEqual(updates)
      expect(transactionRepo.update).toHaveBeenCalledWith(1, updates)
    })

    it('updateTransaction retorna null si no existe', async () => {
      transactionRepo.update.mockResolvedValue(null)
      const result = await transactionService.updateTransaction(999, {} as any)
      expect(result).toBeNull()
    })

    it('deleteTransaction retorna changes', async () => {
      transactionRepo.delete.mockResolvedValue({ changes: 1 })
      const result = await transactionService.deleteTransaction(1)
      expect(result).toEqual({ changes: 1 })
    })

    it('deleteTransaction retorna changes 0 si no existe', async () => {
      transactionRepo.delete.mockResolvedValue({ changes: 0 })
      const result = await transactionService.deleteTransaction(999)
      expect(result).toEqual({ changes: 0 })
    })
  })
})