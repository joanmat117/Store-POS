import { faker } from '@faker-js/faker';

export const userFactory = (overrides: Partial<{
  username: string; password: string; fullname: string;
  perm_products: number; perm_categories: number; perm_transactions: number;
  perm_users: number; perm_settings: number;
}> = {}) => ({
  username: overrides.username ?? faker.internet.username(),
  password: overrides.password ?? 'TestPass123!',
  fullname: overrides.fullname ?? faker.person.fullName(),
  perm_products: overrides.perm_products ?? 1,
  perm_categories: overrides.perm_categories ?? 0,
  perm_transactions: overrides.perm_transactions ?? 1,
  perm_users: overrides.perm_users ?? 0,
  perm_settings: overrides.perm_settings ?? 0,
});

export const productFactory = (overrides: Partial<{
  name: string; price: number; category: string; quantity: number;
  stock: number; sku: string; img: string;
}> = {}) => ({
  name: overrides.name ?? faker.commerce.productName(),
  price: overrides.price ?? Number(faker.commerce.price({ min: 1, max: 500, dec: 2 })),
  category: overrides.category ?? 'General',
  quantity: overrides.quantity ?? faker.number.int({ min: 0, max: 1000 }),
  stock: overrides.stock ?? 1,
  img: overrides.img ?? '',
});

export const customerFactory = (overrides: Partial<{
  name: string; phone: string; email: string; address: string;
}> = {}) => ({
  name: overrides.name ?? faker.person.fullName(),
  phone: overrides.phone ?? faker.phone.number(),
  email: overrides.email ?? faker.internet.email(),
  address: overrides.address ?? faker.location.streetAddress(),
});

export const transactionFactory = (overrides: Partial<{
  customer: string; customer_name: string; items: any[];
  payment_type: number; discount: number; status: number; paid: number;
}> = {}) => ({
  customer: overrides.customer ?? '1',
  customer_name: overrides.customer_name ?? 'Walk-in Customer',
  items: overrides.items ?? [{ id: 1, name: 'Test', price: 10, quantity: 1, stock: 1 }],
  payment_type: overrides.payment_type ?? 1, // 1=cash, 2=card, 3=mixed
  discount: overrides.discount ?? 0,
  status: overrides.status ?? 1, // 1=completed, 0=hold, 2=void
  paid: overrides.paid ?? 0,
});