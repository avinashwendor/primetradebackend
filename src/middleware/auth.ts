import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthenticatedRequest, UserPayload, UserRole } from '../types';
import { AuthenticationError, AuthorizationError } from '../utils/errors';

function extractToken(authHeader: string | undefined): string {
  if (!authHeader) {
    throw new AuthenticationError('No authorization header provided');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new AuthenticationError('Invalid authorization header format');
  }

  return parts[1];
}

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req.headers.authorization);
    
    const decoded = jwt.verify(token, config.jwt.secret) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token has expired'));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
      return;
    }
    next(error);
  }
}

export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError('User not authenticated'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AuthorizationError('Insufficient permissions for this action'));
      return;
    }

    next();
  };
}

export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next();
      return;
    }

    const token = extractToken(authHeader);
    const decoded = jwt.verify(token, config.jwt.secret) as UserPayload;
    req.user = decoded;
    next();
  } catch {
    next();
  }
}

