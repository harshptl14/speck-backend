import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../../utils/ApiError';
import { ApiErrorType, ErrorResponse } from '../interfaces/Error.interface';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(ApiError(404, `🔍 - Not Found - ${req.originalUrl}`));
};

export const errorHandler = (
  err: Error | ApiErrorType,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): void => {
  const statusCode = 'statusCode' in err ? err.statusCode : (res.statusCode !== 200 ? res.statusCode : 500);
  const status = 'status' in err ? err.status : (statusCode >= 400 && statusCode < 500 ? 'fail' : 'error');

  res.status(statusCode).json({
    success: false,
    status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' ? {
      stack: err.stack
    } : {
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    })
  });
};
