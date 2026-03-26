import { v4 as uuidv4 } from 'uuid';

export const handleErrors = (err, req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || req.correlationId || uuidv4();
  
  console.error(`[Error] [${correlationId}] ${err.stack}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  const retryable = err.retryable !== undefined ? err.retryable : (statusCode >= 500);

  res.status(statusCode).json({
    success: false,
    errorCode,
    message,
    correlationId,
    retryable,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export class AppError extends Error {
  constructor(message, statusCode, errorCode = 'ERROR', retryable = false) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.retryable = retryable;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

