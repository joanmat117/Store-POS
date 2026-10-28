import { Request, Response, NextFunction } from 'express';

// Placeholder for Zod validation schemas (Step 8)
export function validate(schema: { safeParse: (data: unknown) => { success: boolean; data?: unknown; error?: { issues: unknown[] } } }): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Validation failed', details: result.error?.issues });
      return;
    }
    req.validated = result.data;
    next();
  };
}