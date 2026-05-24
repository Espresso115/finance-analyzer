export const successResponse = (res, { statusCode = 200, data = null, message = 'OK' } = {}) =>
  res.status(statusCode).json({
    success: true,
    message,
    data
  });

export const errorResponse = (
  res,
  { statusCode = 500, code = 'INTERNAL_SERVER_ERROR', message = 'Internal server error', details = null } = {}
) =>
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details
    }
  });

export const paginatedResponse = (
  res,
  { data = [], limit = 20, offset = 0, total = 0, message = 'OK' } = {}
) =>
  res.json({
    success: true,
    message,
    data,
    pagination: {
      limit,
      offset,
      total
    }
  });
