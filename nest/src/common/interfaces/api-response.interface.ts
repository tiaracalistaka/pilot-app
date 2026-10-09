export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    statusCode: 200,
  };
}

export function errorResponse(
  message: string,
  statusCode: number,
  error?: string,
): ApiResponse {
  return {
    success: false,
    error,
    message,
    statusCode,
  };
}
