import { Request, Response } from "express";
import { APIError, BadRequest, Conflict } from "@/helpers/exceptions";
import { ErrorResponse } from "@/types/app.types";

export function globalErrorHandler(err: APIError, _: Request, res: Response) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const sendErrorResponse = (error: APIError, response: Response) => {
    const errorResponse: ErrorResponse = {
      status: error.status,
      statusCode: error.statusCode,
      message: error.message,
    };

    // Include stack trace only in development
    if (process.env.NODE_ENV === "development") {
      errorResponse.stack = error.stack;
    }

    response.status(error.statusCode).json(errorResponse);
  };

  // Handle specific error types
  const handleCastErrorDB = (error: any) => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new BadRequest(message);
  };

  const handleDuplicateFieldsDB = (error: any) => {
    const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new Conflict(message);
  };

  const handleValidationErrorDB = (error: any) => {
    const errors = Object.values(error.errors).map((el: any) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new BadRequest(message);
  };

  // Handling different environments
  if (process.env.NODE_ENV === "development") {
    sendErrorResponse(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    // Specific error type handling
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.statusCode === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);

    // Generic error response for production
    sendErrorResponse(error, res);
  }
}
