import HttpStatusCode from "./HTTPStatusCodes";

export class APIError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(code: HttpStatusCode, message: string) {
    super(message);
    this.statusCode = code;
    this.status = `${code}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Object.setPrototypeOf(this, APIError.prototype);

    Error.captureStackTrace(this, this.constructor);
  }

  toString() {
    return `Error ${this.statusCode}: ${this.message}`;
  }
}

export class Unauthenticated extends APIError {
  constructor(message: string) {
    super(HttpStatusCode.UNAUTHORIZED, message);
  }
}

export class Forbidden extends APIError {
  constructor(message: string) {
    super(HttpStatusCode.FORBIDDEN, message);
  }
}

export class NotFound extends APIError {
  constructor(message: string) {
    super(HttpStatusCode.NOT_FOUND, message);
  }
}

export class BadRequest extends APIError {
  constructor(message: string) {
    super(HttpStatusCode.BAD_REQUEST, message);
  }
}

export class Conflict extends APIError {
  constructor(message: string) {
    super(HttpStatusCode.CONFLICT, message);
  }
}

export class TooManyRequests extends APIError {
  constructor(message: string) {
    super(HttpStatusCode.TOO_MANY_REQUESTS, message);
  }
}

export class UnprocessableEntity extends APIError {
  constructor(message: string) {
    super(HttpStatusCode.UNPROCESSABLE_ENTITY, message);
  }
}

export class ServerError extends APIError {
  constructor(message: string) {
    super(HttpStatusCode.INTERNAL_SERVER_ERROR, message);
  }
}
