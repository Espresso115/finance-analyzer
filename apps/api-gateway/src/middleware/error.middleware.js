import { errorResponse } from '../utils/apiResponse.js';

export const notFound = (req, res) =>
  errorResponse(res, {
    statusCode: 404,
    code: 'NOT_FOUND',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    details: {
      requestId: req.id
    }
  });

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const isValidationError = err.name === 'ValidationError';
  const isMulterError = err.name === 'MulterError';
  const statusCode = err.statusCode || (isValidationError || isMulterError ? 422 : 500);

  console.error(`Request ${req.id || 'unknown'} failed: ${err.message}`);

  errorResponse(res, {
    statusCode,
    code: err.code || (isValidationError ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR'),
    message: err.message || 'Internal server error',
    details: {
      requestId: req.id
    }
  });
};
