import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSettingsRepo } from '../../helpers/mockRepos.js'
import { mockSettings } from '../../helpers/testData.js'

vi.mock('../../../models/settingsRepo.js', () => ({
  settingsRepo: createMockSettingsRepo()
}))

import { settingsService } from '../../../services/settingsService.js'
import { settingsRepo } from '../../../models/settingsRepo.js'

describe('settingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSettings', () => {
    it('retorna configuración si existe', async () => {
      settingsRepo.find.mockResolvedValue(mockSettings)
      const result = await settingsService.getSettings()
      expect(result).toEqual(mockSettings)
    })

    it('retorna null si no hay configuración', async () => {
      settingsRepo.find.mockResolvedValue(null)
      const result = await settingsService.getSettings()
      expect(result).toBeNull()
    })
  })

  describe('updateSettings', () => {
    it('actualiza configuración con datos parciales', async () => {
      const formData = { shop_name: 'Nueva Tienda', tax_rate: 15 }
      const updated = { ...mockSettings, ...formData }
      settingsRepo.update.mockResolvedValue(updated)

      const result = await settingsService.updateSettings(formData)

      expect(result).toEqual(updated)
      expect(settingsRepo.update).toHaveBeenCalledWith(formData)
    })

    it('actualiza todos los campos', async () => {
      const formData = {
        shop_name: 'Tienda Completa',
        address: '789 Calle',
        phone: '555-1111',
        email: 'full@test.com',
        tax_rate: 21,
        currency: 'EUR',
        receipt_footer: 'Gracias por su compra',
        logo: 'logo.png'
      }
      settingsRepo.update.mockResolvedValue({ ...mockSettings, ...formData })

      const result = await settingsService.updateSettings(formData)

      expect(result).toEqual(expect.objectContaining(formData))
    })

    it('retorna null si update falla', async () => {
      settingsRepo.update.mockResolvedValue(null)
      const result = await settingsService.updateSettings({ shop_name: 'Test' })
      expect(result).toBeNull()
    })
  })
})