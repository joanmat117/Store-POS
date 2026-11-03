import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Zod validation middleware factory.
 * @param schema - Zod schema to validate against
 * @param target - Request property to validate (default: 'body')
 * @returns Express middleware
 */
export function validate<T extends ZodSchema>(schema: T, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      res.status(400).json({
        error: 'Validation failed',
        details: fieldErrors,
      });
      return;
    }
    req.validated = result.data;
    next();
  };
}

/**
 * Validate request body with a Zod schema.
 * Shorthand for validate(schema, 'body').
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return validate(schema, 'body');
}

/**
 * Validate request query parameters with a Zod schema.
 * Shorthand for validate(schema, 'query').
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return validate(schema, 'query');
}

/**
 * Validate request route parameters with a Zod schema.
 * Shorthand for validate(schema, 'params').
 */
export function validateParams<T extends ZodSchema>(schema: T) {
  return validate(schema, 'params');
}