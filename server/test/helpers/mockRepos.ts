import { vi } from 'vitest'
import type {
  UserDTO, ProductDTO, CategoryDTO, CustomerDTO,
  TransactionDTO, SettingsDTO, MediaDTO,
  ProductFormData, CategoryFormData, CustomerFormData,
  TransactionFormData, SettingsFormData
} from '../../types/index.js'

export const createMockUserRepo = () => ({
  findByUsername: vi.fn<(username: string) => Promise<UserDTO | null>>(),
  findById: vi.fn<(id: number) => Promise<UserDTO | null>>(),
  findAll: vi.fn<() => Promise<UserDTO[]>>(),
  create: vi.fn<(data: any) => Promise<UserDTO>>(),
  update: vi.fn<(id: number, data: any) => Promise<UserDTO | null>>(),
  delete: vi.fn<(id: number) => Promise<{ changes: number }>>(),
  updateStatus: vi.fn<(id: number, status: string) => Promise<void>>(),
  updatePassword: vi.fn<(id: number, password: string) => Promise<void>>(),
  mapUser: vi.fn<(user: any) => UserDTO>()
})

export const createMockProductRepo = () => ({
  findAll: vi.fn<() => Promise<ProductDTO[]>>(),
  findById: vi.fn<(id: number) => Promise<ProductDTO | null>>(),
  findBySku: vi.fn<(sku: string) => Promise<ProductDTO | null>>(),
  create: vi.fn<(data: any) => Promise<ProductDTO>>(),
  update: vi.fn<(id: number, data: any) => Promise<ProductDTO | null>>(),
  delete: vi.fn<(id: number) => Promise<string | null>>(),
  bulkDelete: vi.fn<(ids: number[]) => Promise<{ deleted: number; images: string[] }>>()
})

export const createMockCategoryRepo = () => ({
  findAll: vi.fn<() => Promise<CategoryDTO[]>>(),
  findById: vi.fn<(id: number) => Promise<CategoryDTO | null>>(),
  create: vi.fn<(name: string) => Promise<CategoryDTO>>(),
  update: vi.fn<(id: number, name: string) => Promise<CategoryDTO | null>>(),
  delete: vi.fn<(id: number) => Promise<{ changes: number }>>()
})

export const createMockCustomerRepo = () => ({
  findAll: vi.fn<() => Promise<CustomerDTO[]>>(),
  findById: vi.fn<(id: number) => Promise<CustomerDTO | null>>(),
  create: vi.fn<(data: CustomerFormData) => Promise<CustomerDTO>>(),
  update: vi.fn<(id: number, data: CustomerFormData) => Promise<CustomerDTO | null>>(),
  delete: vi.fn<(id: number) => Promise<{ changes: number }>>()
})

export const createMockTransactionRepo = () => ({
  findAll: vi.fn<() => Promise<TransactionDTO[]>>(),
  findOnHold: vi.fn<() => Promise<TransactionDTO[]>>(),
  findCustomerOrders: vi.fn<() => Promise<TransactionDTO[]>>(),
  findByDateRange: vi.fn<(filters: any) => Promise<TransactionDTO[]>>(),
  findById: vi.fn<(id: number) => Promise<TransactionDTO | null>>(),
  create: vi.fn<(data: TransactionFormData) => Promise<TransactionDTO>>(),
  update: vi.fn<(id: number, data: TransactionFormData) => Promise<TransactionDTO | null>>(),
  delete: vi.fn<(id: number) => Promise<{ changes: number }>>()
})

export const createMockSettingsRepo = () => ({
  find: vi.fn<() => Promise<SettingsDTO | null>>(),
  update: vi.fn<(data: SettingsFormData) => Promise<SettingsDTO | null>>()
})

export const createMockMediaRepo = () => ({
  findAll: vi.fn<() => Promise<MediaDTO[]>>(),
  findById: vi.fn<(id: number) => Promise<MediaDTO | null>>(),
  create: vi.fn<(data: any) => Promise<MediaDTO>>(),
  delete: vi.fn<(id: number) => Promise<string | null>>()
})