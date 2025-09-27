class AppError extends Error {
  constructor({
    message,
    userMessage = null,
    statusCode = 500,
    errorCode = "INTERNAL_SERVER_ERROR",
    isOperational = true,
    details = null,
  }) {
    super(message);
    this.userMessage = userMessage;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
