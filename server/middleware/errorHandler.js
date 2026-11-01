// Centralized Error Handling Middleware

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log full error for server diagnostics
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = { statusCode: 404, message };
  }

  // Mongoose Duplicate Key (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    error = { statusCode: 400, message };
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = { statusCode: 400, message };
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = { statusCode: 401, message: 'Invalid authentication token.' };
  }
  if (err.name === 'TokenExpiredError') {
    error = { statusCode: 401, message: 'Authentication token has expired.' };
  }

  // Multer Upload Errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = { statusCode: 400, message: 'File is too large. Maximum file size allowed is 5MB.' };
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error = { statusCode: 400, message: 'Too many files uploaded. Maximum is 10 images at once.' };
    } else {
      error = { statusCode: 400, message: `Upload error: ${err.message}` };
    }
  }

  // CORS Policy Error
  if (err.message && err.message.startsWith('CORS error:')) {
    error = { statusCode: 403, message: err.message };
  }

  const statusCode = error.statusCode || err.statusCode || 500;
  const response = {
    success: false,
    message: error.message || 'Server Error. Please try again later.',
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
