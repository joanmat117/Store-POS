// Helper functions for parametrized tests (future use)
// Currently keeping tests inline for simplicity
import { ApiClient } from './request.js';

export interface DuplicateTestConfig {
  endpoint: string;
  createPayload: any;
  duplicatePayload: any;
  label: string;
}

/**
 * Test factory para verificar rechazo de duplicados
 * Actualmente se usan tests inline para simplicidad
 */
export function testDuplicateRejection(
  api: ApiClient,
  config: DuplicateTestConfig
): void {
  // Placeholder - tests are inline for now
}