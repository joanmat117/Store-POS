import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/app.js';
import { createApiClient } from '../helpers/request.js';
import { seedBaseData, truncateAllTables, getTestDb } from '../helpers/db.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { productFactory, customerFactory, transactionFactory } from '../helpers/factories.js';
import { products } from '../../../db/schema/products.js';
import { eq } from 'drizzle-orm';
import { TransactionStatus, PaymentType } from '../helpers/constants.js';

describe('E2E Transactions - Create Sale (flujo completo)', () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;
  let api: ReturnType<typeof createApiClient>;
  let db: ReturnType<typeof getTestDb>;

  beforeAll(async () => {
    app = await createTestApp();
    api = createApiClient(app);
    db = getTestDb();
    await seedBaseData();
    const token = await loginAsAdmin(app);
    api.setAuth(token);
  });

  beforeEach(async () => { await truncateAllTables(); await seedBaseData(); });

  it('Flujo: crear producto → crear cliente → hacer venta → stock decrementado', async () => {
    // 1. Crear producto con stock 10
    const product = await api.expectCreated('/api/inventory/product', productFactory({ 
      name: 'Pan', price: 1.50, quantity: 10, stock: 1 
    }));

    // 2. Crear cliente
    const customer = await api.expectCreated('/api/customers', customerFactory({ 
      name: 'Juan Pérez' 
    }));

    // 3. Hacer venta (2 unidades)
    const sale = await api.expectCreated('/api/new', transactionFactory({
      customer: String(customer.id),
      customer_name: customer.name,
      items: [{ id: product.id, name: product.name, price: product.price, quantity: 2, stock: 1 }],
      payment_type: PaymentType.CASH,
      paid: 3.00,
    }));

    expect(sale).toMatchObject({
      customer_name: 'Juan Pérez',
      total: 3.00,
      paid: 3.00,
      change: 0,
      status: TransactionStatus.COMPLETED,
    });

    // 4. Verificar stock decrementado en DB
    const updatedProduct = await db.select().from(products).where(eq(products.id, product.id)).get();
    expect(updatedProduct?.quantity).toBe(8); // 10 - 2
  });

  it('Venta con pago mixto (efectivo + tarjeta) → payment_type=3', async () => {
    const product = await api.expectCreated('/api/inventory/product', productFactory({ price: 10, quantity: 5 }));
    const sale = await api.expectCreated('/api/new', transactionFactory({
      items: [{ id: product.id, name: product.name, price: 10, quantity: 1, stock: 1 }],
      payment_type: PaymentType.MIXED,
      paid: 10,
    }));
    expect(sale.payment_type).toBe(PaymentType.MIXED);
  });

  it('Venta con descuento → total calculado correctamente', async () => {
    const product = await api.expectCreated('/api/inventory/product', productFactory({ price: 100, quantity: 1 }));
    const sale = await api.expectCreated('/api/new', transactionFactory({
      items: [{ id: product.id, name: product.name, price: 100, quantity: 1, stock: 1 }],
      discount: 10, // 10%
      payment_type: PaymentType.CASH,
      paid: 90,
    }));
    expect(sale.discount).toBe(10);
    expect(sale.subtotal).toBe(100);
    expect(sale.total).toBe(90);
  });

  it('Venta sin stock suficiente → 400', async () => {
    const product = await api.expectCreated('/api/inventory/product', productFactory({ quantity: 1 }));
    await api.post('/api/new').send(transactionFactory({
      items: [{ id: product.id, name: product.name, price: 10, quantity: 5, stock: 1 }],
    })).expect(400);
  });

  it('Venta con múltiples items → totales correctos', async () => {
    const p1 = await api.expectCreated('/api/inventory/product', productFactory({ name: 'Item A', price: 10, quantity: 5 }));
    const p2 = await api.expectCreated('/api/inventory/product', productFactory({ name: 'Item B', price: 20, quantity: 3 }));

    const sale = await api.expectCreated('/api/new', transactionFactory({
      items: [
        { id: p1.id, name: p1.name, price: 10, quantity: 2, stock: 1 },
        { id: p2.id, name: p2.name, price: 20, quantity: 1, stock: 1 },
      ],
      payment_type: PaymentType.CASH,
      paid: 50,
    }));

    expect(sale.subtotal).toBe(40); // 10*2 + 20*1
    expect(sale.total).toBe(40);
    expect(sale.change).toBe(10);
  });

  // S5: Edge case tests for stock validation
  it('Venta con producto stock=0 → 400', async () => {
    const product = await api.expectCreated('/api/inventory/product', productFactory({ quantity: 0, stock: 1 }));
    await api.post('/api/new').send(transactionFactory({
      items: [{ id: product.id, name: product.name, price: 10, quantity: 1, stock: 1 }],
    })).expect(400);
  });

  it('Venta agota stock a 0 → OK, siguiente venta → 400', async () => {
    const product = await api.expectCreated('/api/inventory/product', productFactory({ quantity: 5, stock: 1 }));
    
    await api.expectCreated('/api/new', transactionFactory({
      items: [{ id: product.id, name: product.name, price: 10, quantity: 5, stock: 1 }],
      payment_type: PaymentType.CASH, paid: 50,
    }));
    
    // Verificar stock = 0 en DB
    const updated = await db.select().from(products).where(eq(products.id, product.id)).get();
    expect(updated?.quantity).toBe(0);
    
    // Segunda venta debe fallar
    await api.post('/api/new').send(transactionFactory({
      items: [{ id: product.id, name: product.name, price: 10, quantity: 1, stock: 1 }],
    })).expect(400);
  });

  // S6: Edge case tests for discount validation
  it('Venta con discount > 100 → aceptado (validación faltante en servidor)', async () => {
    const product = await api.expectCreated('/api/inventory/product', productFactory({ price: 100, quantity: 1 }));
    // NOTA: El servidor no valida discount > 100, resulta en total negativo
    const sale = await api.expectCreated('/api/new', transactionFactory({
      items: [{ id: product.id, name: product.name, price: 100, quantity: 1, stock: 1 }],
      discount: 150,  // > 100%
      payment_type: PaymentType.CASH, paid: 0,
    }));
    // El servidor acepta pero calcula total negativo (bug conocido)
    expect(sale.total).toBe(-50); // 100 * (1 - 150/100) = -50
  });

  it('Venta con discount negativo → 400', async () => {
    const product = await api.expectCreated('/api/inventory/product', productFactory({ price: 100, quantity: 1 }));
    await api.post('/api/new').send(transactionFactory({
      items: [{ id: product.id, name: product.name, price: 100, quantity: 1, stock: 1 }],
      discount: -10,
      payment_type: PaymentType.CASH, paid: 110,
    })).expect(400);
  });

  it('Venta con discount = 100 → total = 0', async () => {
    const product = await api.expectCreated('/api/inventory/product', productFactory({ price: 100, quantity: 1 }));
    const sale = await api.expectCreated('/api/new', transactionFactory({
      items: [{ id: product.id, name: product.name, price: 100, quantity: 1, stock: 1 }],
      discount: 100,
      payment_type: PaymentType.CASH, paid: 0,
    }));
    expect(sale.total).toBe(0);
    expect(sale.change).toBe(0);
  });
});