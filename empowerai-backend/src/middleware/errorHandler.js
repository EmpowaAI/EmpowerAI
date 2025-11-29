module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error for debugging
  console.error('Error:', err.message);
  if (err.stack) {
    console.error('Stack:', err.stack);
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};