export interface CreateLogRequest {
  date: string;
  content: string;
}

export interface CreateLogResponse {
  success: boolean;
  filePath: string;
}

export interface GetLogRequest {
  date: string;
}

export interface GetLogResponse {
  success: boolean;
  content?: string;
  notFound?: boolean;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}
