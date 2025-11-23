import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  stack?: string;
}

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response: ErrorResponse = {
    success: false,
    message,
  };

  // Include error details in development
  if (process.env.NODE_ENV === 'development') {
    response.error = err.name;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
