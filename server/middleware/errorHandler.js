/**
 * Error Handling Middleware
 * Centralized error handling for all routes
 */

/**
 * Custom Error Class
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
  }
}

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Error Handler Middleware
 * Must be placed AFTER all other middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  console.error('❌ Error:', {
    timestamp: new Date(),
    method: req.method,
    path: req.path,
    status: err.statusCode || 500,
    message: err.message,
  });

  // Custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { details: err.details }),
      timestamp: err.timestamp,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      details: errors,
      timestamp: new Date(),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate entry for ${field}`,
      details: `${field} already exists`,
      timestamp: new Date(),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      timestamp: new Date(),
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      timestamp: new Date(),
    });
  }

  // MongoDB connection error
  if (err.name === 'MongoError' || err.name === 'MongoNetworkError') {
    return res.status(503).json({
      success: false,
      message: 'Database connection error',
      timestamp: new Date(),
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date(),
  });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.originalUrl}`);
  next(error);
};

module.exports = {
  ApiError,
  asyncHandler,
  errorHandler,
  notFoundHandler,
};
