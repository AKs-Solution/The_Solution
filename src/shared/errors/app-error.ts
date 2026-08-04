export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = "INTERNAL_ERROR",
    statusCode: number = 500,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  public toJSON(): Record<string, unknown> {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        details: this.details,
      },
    };
  }
}

export class ValidationError extends AppError {
  public readonly fieldErrors: Record<string, string[]>;

  constructor(fieldErrors: Record<string, string[]> | string) {
    const formatted = typeof fieldErrors === "string" ? { general: [fieldErrors] } : fieldErrors;
    const msg = typeof fieldErrors === "string" ? fieldErrors : "Validation failed";
    super(msg, "VALIDATION_ERROR", 400, { fields: formatted });
    this.name = "ValidationError";
    this.fieldErrors = formatted;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class ConfigurationError extends AppError {
  constructor(key: string) {
    super(`Missing required configuration: ${key}`, "CONFIGURATION_ERROR", 500);
    this.name = "ConfigurationError";
  }
}

export class RateLimitedError extends AppError {
  constructor(message: string = "Too many requests", retryAfterSeconds?: number) {
    super(message, "RATE_LIMITED", 429, retryAfterSeconds ? { retryAfterSeconds } : undefined);
    this.name = "RateLimitedError";
  }
}
