
// src/utils/createError.ts
import { ApiErrorType } from "../src/interfaces/Error.interface";

export const ApiError = (statusCode: number, message: string): ApiErrorType => {
    const error = new Error(message) as ApiErrorType;
    error.statusCode = statusCode;
    error.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    error.isOperational = true;
    Error.captureStackTrace(error, ApiError);
    return error;
};
