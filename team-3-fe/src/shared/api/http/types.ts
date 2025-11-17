export interface SuccessResponse<T> {
  status?: string;      
  message?: string;
  data: T;
}

export interface ApiError {
  message?: string;
  statusCode?: number;
  details?: unknown;
}