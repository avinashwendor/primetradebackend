import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { HttpStatus } from '../utils/errors';
import { RegisterInput, LoginInput, RefreshTokenInput } from '../schemas/auth.schema';

export class AuthController {
  async register(
    req: Request<unknown, unknown, RegisterInput>,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.register(req.body);
      
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Registration successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(
    req: Request<unknown, unknown, LoginInput>,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.login(req.body);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(
    req: Request<unknown, unknown, RefreshTokenInput>,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const tokens = await authService.refreshTokens(req.body.refreshToken);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(
    req: Request<unknown, unknown, RefreshTokenInput>,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      await authService.logout(req.body.refreshToken);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      await authService.logoutAll(req.user!.id);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Logged out from all devices',
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await authService.getCurrentUser(req.user!.id);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

