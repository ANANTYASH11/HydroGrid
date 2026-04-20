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

  // Handle Mongoose validation errors (e.g., missing required fields)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Extract all validation error messages
    const messages = Object.values(err.errors).map(e => e.message);
    message = messages.join(', ');
  }

  // Handle Mongoose duplicate key errors (e.g., email already exists)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Handle Mongoose cast errors (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

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
