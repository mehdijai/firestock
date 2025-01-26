import HttpStatusCode from "@/helpers/HTTPStatusCodes";

export type ErrorResponse = {
  statusCode: HttpStatusCode;
  status: string;
  message: string;
  stack?: string
};

export type ApiResponse<T = null> = {
  errors: null | ErrorResponse;
  data: null | T;
};
