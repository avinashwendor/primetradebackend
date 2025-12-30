import { Response, NextFunction } from 'express';
import { userRepository } from '../repositories/user.repository';
import { taskRepository } from '../repositories/task.repository';
import { AuthenticatedRequest, ApiResponse, PaginatedResponse } from '../types';
import { HttpStatus, NotFoundError, ValidationError } from '../utils/errors';
import { UserRole, IUserDocument } from '../models';

function sanitizeUser(user: IUserDocument): Record<string, unknown> {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class AdminController {
  async getAllUsers(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

      const { users, total } = await userRepository.getAllUsers(page, limit);
      const totalPages = Math.ceil(total / limit);

      res.status(HttpStatus.OK).json({
        success: true,
        data: users.map(sanitizeUser),
        ...{
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await userRepository.findById(req.params.id);
      
      if (!user) {
        throw new NotFoundError('User');
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: sanitizeUser(user),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!Object.values(UserRole).includes(role)) {
        throw new ValidationError('Invalid role');
      }

      // Prevent admin from demoting themselves
      if (id === req.user!.id && role !== UserRole.ADMIN) {
        throw new ValidationError('Cannot change your own admin role');
      }

      const user = await userRepository.updateById(id, { role });
      
      if (!user) {
        throw new NotFoundError('User');
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'User role updated successfully',
        data: sanitizeUser(user),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (id === req.user!.id) {
        throw new ValidationError('Cannot delete your own account');
      }

      const deleted = await userRepository.deleteById(id);
      
      if (!deleted) {
        throw new NotFoundError('User');
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { users: allUsers, total: totalUsers } = await userRepository.getAllUsers(1, 1);
      const { tasks: allTasks, total: totalTasks } = await taskRepository.findAll({}, {}, 1, 1);
      
      // Get user count by role
      const adminCount = await userRepository.countByRole(UserRole.ADMIN);
      const userCount = await userRepository.countByRole(UserRole.USER);

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          totalUsers,
          totalTasks,
          adminCount,
          userCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();

