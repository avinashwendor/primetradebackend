export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

export class AppError extends Error {
  public readonly statusCode: HttpStatus;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, HttpStatus.UNAUTHORIZED, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, HttpStatus.FORBIDDEN, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, HttpStatus.NOT_FOUND, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, HttpStatus.TOO_MANY_REQUESTS, 'RATE_LIMIT_ERROR');
  }
}

