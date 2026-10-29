import { vi } from 'vitest'

/**
 * Crea un mock de Express.Multer.File
 */
export const createMockFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File => ({
  fieldname: 'file',
  originalname: 'test.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024,
  destination: '/tmp',
  filename: 'test-123.jpg',
  path: '/tmp/test-123.jpg',
  buffer: Buffer.from('fake-image-data'),
  stream: null as any,
  ...overrides
})

/**
 * Ejecuta un service con repos mockeados
 */
export const withMockedRepos = async <T>(
  serviceModule: string,
  repoMocks: Record<string, any>,
  testFn: (service: T) => Promise<void>
) => {
  // Mockea los repos ANTES de importar el service
  for (const [repoPath, mock] of Object.entries(repoMocks)) {
    vi.doMock(repoPath, () => ({ [repoPath.split('/').pop()!.replace('.js', '')]: mock }))
  }

  const { default: service } = await import(serviceModule)
  await testFn(service as T)
}

/**
 * Assert helper para errores de negocio
 */
export const expectBusinessError = async (
  fn: () => Promise<any>,
  expectedMessage: string | RegExp
) => {
  await expect(fn()).rejects.toThrow(expectedMessage)
}