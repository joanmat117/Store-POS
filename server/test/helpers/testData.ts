import type { UserDTO, ProductDTO, CategoryDTO, CustomerDTO, TransactionDTO, SettingsDTO, MediaDTO } from '../../types/index.js'

export const mockUser: UserDTO = {
  id: 1,
  username: 'admin',
  password: 'hashed_password',
  role: 'admin',
  permissions: ['perm_products', 'perm_categories', 'perm_transactions', 'perm_users', 'perm_settings'],
  status: 'Logged In_2024-01-01T00:00:00.000Z',
  created_at: '2024-01-01T00:00:00.000Z'
}

export const mockProduct: ProductDTO = {
  id: 1,
  name: 'Test Product',
  price: 10.50,
  category: 'Test Category',
  quantity: 100,
  stock: 1,
  img: 'test.jpg',
  created_at: '2024-01-01T00:00:00.000Z'
}

export const mockCategory: CategoryDTO = {
  id: 1,
  name: 'Test Category',
  created_at: '2024-01-01T00:00:00.000Z'
}

export const mockCustomer: CustomerDTO = {
  id: 1,
  name: 'Test Customer',
  phone: '555-1234',
  email: 'test@example.com',
  address: '123 Test St',
  created_at: '2024-01-01T00:00:00.000Z'
}

export const mockTransaction: TransactionDTO = {
  id: 1,
  ref_number: 'TXN-001',
  customer: '1',
  customer_name: 'Test Customer',
  status: 1,
  user_id: 1,
  user_name: 'Administrator',
  till: 1,
  discount: 0,
  subtotal: 10.50,
  tax: 1.05,
  total: 11.55,
  paid: 20.00,
  change: 8.45,
  payment_type: 1,
  items: [
    { id: 1, name: 'Test Product', price: 10.50, quantity: 1, stock: 1 }
  ],
  date: '2024-01-01T00:00:00.000Z'
}

export const mockSettings: SettingsDTO = {
  id: 1,
  shop_name: 'Test Shop',
  address: '123 Test St',
  phone: '555-0000',
  email: 'shop@test.com',
  tax_rate: 10,
  currency: 'USD',
  receipt_footer: 'Thank you!',
  logo: '',
  updated_at: '2024-01-01T00:00:00.000Z'
}

export const mockMedia: MediaDTO = {
  id: 1,
  filename: 'test.jpg',
  source: 'upload',
  pexels_id: null,
  photographer: '',
  alt: '',
  created_at: '2024-01-01T00:00:00.000Z'
}