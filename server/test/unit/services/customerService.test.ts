import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockCustomerRepo } from '../../helpers/mockRepos.js'
import { mockCustomer } from '../../helpers/testData.js'

vi.mock('../../../models/customerRepo.js', () => ({
  customerRepo: createMockCustomerRepo()
}))

import { customerService } from '../../../services/customerService.js'
import { customerRepo } from '../../../models/customerRepo.js'

describe('customerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllCustomers', () => {
    it('retorna lista de clientes', async () => {
      customerRepo.findAll.mockResolvedValue([mockCustomer])
      const result = await customerService.getAllCustomers()
      expect(result).toEqual([mockCustomer])
    })

    it('retorna array vacío si no hay clientes', async () => {
      customerRepo.findAll.mockResolvedValue([])
      const result = await customerService.getAllCustomers()
      expect(result).toEqual([])
    })
  })

  describe('getCustomerById', () => {
    it('retorna cliente si existe', async () => {
      customerRepo.findById.mockResolvedValue(mockCustomer)
      const result = await customerService.getCustomerById(1)
      expect(result).toEqual(mockCustomer)
    })

    it('retorna null si no existe', async () => {
      customerRepo.findById.mockResolvedValue(null)
      const result = await customerService.getCustomerById(999)
      expect(result).toBeNull()
    })
  })

  describe('createCustomer', () => {
    it('crea cliente con datos completos', async () => {
      const formData = {
        name: 'Nuevo Cliente',
        phone: '555-9999',
        email: 'nuevo@test.com',
        address: '456 Nueva Ave'
      }
      customerRepo.create.mockResolvedValue({ ...mockCustomer, ...formData })

      const result = await customerService.createCustomer(formData)

      expect(result).toEqual(expect.objectContaining(formData))
      expect(customerRepo.create).toHaveBeenCalledWith(formData)
    })

    it('crea cliente con campos opcionales vacíos', async () => {
      const formData = { name: 'Solo Nombre', phone: '', email: '', address: '' }
      customerRepo.create.mockResolvedValue({ ...mockCustomer, ...formData })

      const result = await customerService.createCustomer(formData)

      expect(result.name).toBe('Solo Nombre')
    })
  })

  describe('updateCustomer', () => {
    it('actualiza cliente existente', async () => {
      const formData = { name: 'Actualizado', phone: '555-0000', email: 'upd@test.com', address: 'Nueva Dir' }
      customerRepo.update.mockResolvedValue({ ...mockCustomer, ...formData })

      const result = await customerService.updateCustomer(1, formData)

      expect(result).toEqual(expect.objectContaining(formData))
      expect(customerRepo.update).toHaveBeenCalledWith(1, formData)
    })

    it('retorna null si cliente no existe', async () => {
      customerRepo.update.mockResolvedValue(null)
      const result = await customerService.updateCustomer(999, { name: 'Test' })
      expect(result).toBeNull()
    })
  })

  describe('deleteCustomer', () => {
    it('elimina cliente y retorna changes', async () => {
      customerRepo.delete.mockResolvedValue({ changes: 1 })
      const result = await customerService.deleteCustomer(1)
      expect(result).toEqual({ changes: 1 })
    })

    it('retorna changes 0 si no existe', async () => {
      customerRepo.delete.mockResolvedValue({ changes: 0 })
      const result = await customerService.deleteCustomer(999)
      expect(result).toEqual({ changes: 0 })
    })
  })
})