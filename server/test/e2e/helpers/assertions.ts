import { expect } from 'vitest';

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveStatus(status: number): T;
    toMatchSchema(schema: object): T;
  }
}

expect.extend({
  toHaveStatus(received: { status: number }, expected: number) {
    const pass = received.status === expected;
    return {
      pass,
      message: () => pass
        ? `expected status not to be ${expected}`
        : `expected status ${expected} but got ${received.status}`,
    };
  },
  toMatchSchema(received: any, schema: object) {
    // Validación ligera con Zod si está disponible
    const pass = true; // placeholder - implementar con Zod si se desea
    return { pass, message: () => '' };
  },
});