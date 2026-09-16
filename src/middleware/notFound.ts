import { Request, Response } from 'express';

// Runs when a request doesn't match any route we've defined. Must be
// registered AFTER all real routes in app.ts.
function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export default notFound;
