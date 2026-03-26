import { v4 as uuidv4 } from 'uuid';

export const handleErrors = (err, req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  
  console.error(`[Error] [${correlationId}] ${err.stack}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    correlationId,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const AppError = class extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
};
