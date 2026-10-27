// Placeholder for Zod validation schemas (Step 8)
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.error.issues });
    }
    req.validated = result.data;
    next();
  };
}
