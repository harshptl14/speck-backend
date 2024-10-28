
export interface ErrorResponse {
    success: boolean;
    status: string;
    message: string;
    stack?: string;
}

export interface ApiErrorType extends Error {
    statusCode: number;
    status: string;
    isOperational?: boolean;
}
