import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockUserRepo } from '../../helpers/mockRepos.js'
import { mockUser } from '../../helpers/testData.js'

// Mockea ANTES de importar el service
vi.mock('../../../models/userRepo.js', () => ({
  userRepo: createMockUserRepo()
}))
vi.mock('../../../config/auth.js', () => ({
  signToken: vi.fn((payload: { id: number }) => `mock-jwt-${payload.id}`)
}))

import { authService } from '../../../services/authService.js'
import { userRepo } from '../../../models/userRepo.js'

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('retorna usuario si credenciales válidas', async () => {
      userRepo.findByUsername.mockResolvedValue(mockUser)
      userRepo.mapUser.mockReturnValue({ ...mockUser, password: undefined })

      const result = await authService.login('admin', 'correct-password')

      expect(result).toEqual(expect.objectContaining({ id: 1, username: 'admin' }))
      expect(userRepo.updateStatus).toHaveBeenCalledWith(1, expect.stringContaining('Logged In_'))
    })

    it('retorna null si usuario no existe', async () => {
      userRepo.findByUsername.mockResolvedValue(null)

      const result = await authService.login('nonexistent', 'password')

      expect(result).toBeNull()
      expect(userRepo.updateStatus).not.toHaveBeenCalled()
    })

    it('retorna null si contraseña incorrecta', async () => {
      userRepo.findByUsername.mockResolvedValue(mockUser)

      const result = await authService.login('admin', 'wrong-password')

      expect(result).toBeNull()
    })
  })

  describe('hashPassword', () => {
    it('hashea la contraseña', () => {
      const hashed = authService.hashPassword('mipassword')
      expect(hashed).toBe('hashed_mipassword')
    })
  })

  describe('generateToken', () => {
    it('genera JWT con payload correcto', () => {
      const token = authService.generateToken({ id: 1, username: 'admin', role: 'admin' })
      expect(token).toBe('mock-jwt-1')
    })
  })

  describe('updatePassword', () => {
    it('actualiza password hasheada', async () => {
      userRepo.updatePassword.mockResolvedValue(undefined)

      const result = await authService.updatePassword(1, 'newpass')

      expect(result).toEqual({ ok: true })
      expect(userRepo.updatePassword).toHaveBeenCalledWith(1, 'hashed_newpass')
    })
  })
})