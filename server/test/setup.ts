import { vi, beforeEach, afterEach } from 'vitest'

// Mock global de logger para evitar ruido en tests
vi.mock('../logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

// Mock de bcrypt para tests determinísticos
vi.mock('bcryptjs', () => ({
  default: {
    compareSync: vi.fn((pwd: string, hash: string) => pwd === 'correct-password'),
    hashSync: vi.fn((pwd: string) => `hashed_${pwd}`)
  }
}))

// Limpiar mocks entre tests
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.resetModules()
})