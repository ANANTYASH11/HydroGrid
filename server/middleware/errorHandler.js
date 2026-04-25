/**
 * Global Error Handler Middleware
 * Catches all errors thrown in route handlers and returns
 * consistent JSON error responses
 */

const errorHandler = (err, req, res, next) => {
  // Log the error for debugging (only in development)
  console.error('❌ Error:', err.message);

  // Default to 500 Internal Server Error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Send the error response
  res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
