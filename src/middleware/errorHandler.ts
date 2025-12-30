import { Request, Response, NextFunction } from 'express';
import { AppError, HttpStatus } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import { ApiResponse } from '../types';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    logger.warn('Operational error', {
      code: error.code,
      message: error.message,
      path: req.path,
      method: req.method,
    });

    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  logger.error('Unexpected error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.nodeEnv === 'production' 
        ? 'An unexpected error occurred' 
        : error.message,
    },
  };

  if (config.nodeEnv !== 'production') {
    response.error!.details = error.stack;
  }

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
}

export function notFoundHandler(
  req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

