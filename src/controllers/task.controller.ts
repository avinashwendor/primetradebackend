import { Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { HttpStatus } from '../utils/errors';
import { CreateTaskInput, UpdateTaskInput, TaskQuery } from '../schemas/task.schema';

export class TaskController {
    async createTask(
        req: AuthenticatedRequest,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const task = await taskService.createTask(
                req.body as CreateTaskInput,
                req.user!.id
            );

            res.status(HttpStatus.CREATED).json({
                success: true,
                message: 'Task created successfully',
                data: task,
            });
        } catch (error) {
            next(error);
        }
    }

    async getTask(
        req: AuthenticatedRequest,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const task = await taskService.getTaskById(
                req.params.id,
                req.user!.id,
                req.user!.role
            );

            res.status(HttpStatus.OK).json({
                success: true,
                data: task,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateTask(
        req: AuthenticatedRequest,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const task = await taskService.updateTask(
                req.params.id,
                req.body as UpdateTaskInput,
                req.user!.id,
                req.user!.role
            );

            res.status(HttpStatus.OK).json({
                success: true,
                message: 'Task updated successfully',
                data: task,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteTask(
        req: AuthenticatedRequest,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            await taskService.deleteTask(
                req.params.id,
                req.user!.id,
                req.user!.role
            );

            res.status(HttpStatus.OK).json({
                success: true,
                message: 'Task deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserTasks(
        req: AuthenticatedRequest,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const result = await taskService.getUserTasks(
                req.user!.id,
                req.query as unknown as TaskQuery
            );

            res.status(HttpStatus.OK).json({
                success: true,
                data: result.data,
                ...{ pagination: result.pagination },
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllTasks(
        req: AuthenticatedRequest,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const result = await taskService.getAllTasks(
                req.query as unknown as TaskQuery
            );

            res.status(HttpStatus.OK).json({
                success: true,
                data: result.data,
                ...{ pagination: result.pagination },
            });
        } catch (error) {
            next(error);
        }
    }

    async getTaskStats(
        req: AuthenticatedRequest,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const stats = await taskService.getTaskStats(req.user!.id);

            res.status(HttpStatus.OK).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const taskController = new TaskController();

