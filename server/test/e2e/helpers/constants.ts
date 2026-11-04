// Constantes centralizadas para tests e2e
// Evita magic numbers y hace los tests más legibles y mantenibles

export const TransactionStatus = {
  HOLD: 0,
  COMPLETED: 1,
  VOID: 2,
} as const;

export const PaymentType = {
  CASH: 1,
  CARD: 2,
  MIXED: 3,
} as const;

export const UserStatus = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  LOGGED_OUT: 'Logged Out',
} as const;

export const Permissions = {
  PRODUCTS: 'perm_products',
  CATEGORIES: 'perm_categories',
  TRANSACTIONS: 'perm_transactions',
  USERS: 'perm_users',
  SETTINGS: 'perm_settings',
} as const;

export const DefaultSettings = {
  STORE: 'Test Store',
  SYMBOL: '$',
  PERCENTAGE: 10,
  TILL: 1,
} as const;

// Tipos derivados para type safety
export type TransactionStatusValue = typeof TransactionStatus[keyof typeof TransactionStatus];
export type PaymentTypeValue = typeof PaymentType[keyof typeof PaymentType];
export type UserStatusValue = typeof UserStatus[keyof typeof UserStatus];