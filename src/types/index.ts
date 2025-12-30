import { Request } from 'express';
import { UserRole } from '../models/user.model';

export { UserRole } from '../models/user.model';
export { TaskStatus, TaskPriority } from '../models/task.model';

export interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
