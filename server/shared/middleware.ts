import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ success: false, error: err.message });
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Route ${req.path} not found` });
};