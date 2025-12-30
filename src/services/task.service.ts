import { taskRepository } from '../repositories/task.repository';
import { ITaskDocument, TaskStatus, TaskPriority, UserRole } from '../models';
import { PaginatedResponse } from '../types';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import { CreateTaskInput, UpdateTaskInput, TaskQuery } from '../schemas/task.schema';

function sanitizeTask(task: ITaskDocument): Record<string, unknown> {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    userId: task.userId.toString(),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

export class TaskService {
  async createTask(input: CreateTaskInput, userId: string): Promise<Record<string, unknown>> {
    const task = await taskRepository.create({
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? TaskStatus.PENDING,
      priority: input.priority ?? TaskPriority.MEDIUM,
      dueDate: input.dueDate ?? null,
      userId,
    });
    
    return sanitizeTask(task);
  }

  async getTaskById(taskId: string, userId: string, userRole: string): Promise<Record<string, unknown>> {
    const task = await taskRepository.findById(taskId);
    
    if (!task) {
      throw new NotFoundError('Task');
    }

    if (task.userId.toString() !== userId && userRole !== UserRole.ADMIN) {
      throw new AuthorizationError('You do not have permission to view this task');
    }

    return sanitizeTask(task);
  }

  async updateTask(
    taskId: string, 
    input: UpdateTaskInput, 
    userId: string, 
    userRole: string
  ): Promise<Record<string, unknown>> {
    const existingTask = await taskRepository.findById(taskId);
    
    if (!existingTask) {
      throw new NotFoundError('Task');
    }

    if (existingTask.userId.toString() !== userId && userRole !== UserRole.ADMIN) {
      throw new AuthorizationError('You do not have permission to update this task');
    }

    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;

    const updated = await taskRepository.updateById(taskId, updateData);
    if (!updated) {
      throw new NotFoundError('Task');
    }

    return sanitizeTask(updated);
  }

  async deleteTask(taskId: string, userId: string, userRole: string): Promise<void> {
    const existingTask = await taskRepository.findById(taskId);
    
    if (!existingTask) {
      throw new NotFoundError('Task');
    }

    if (existingTask.userId.toString() !== userId && userRole !== UserRole.ADMIN) {
      throw new AuthorizationError('You do not have permission to delete this task');
    }

    await taskRepository.deleteById(taskId);
  }

  async getUserTasks(
    userId: string, 
    query: TaskQuery
  ): Promise<PaginatedResponse<Record<string, unknown>>> {
    const { page, limit, status, priority, search, sortBy, sortOrder } = query;

    const { tasks, total } = await taskRepository.findAll(
      { userId, status, priority, search },
      { sortBy, sortOrder },
      page,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: tasks.map(sanitizeTask),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getAllTasks(query: TaskQuery): Promise<PaginatedResponse<Record<string, unknown>>> {
    const { page, limit, status, priority, search, sortBy, sortOrder } = query;

    const { tasks, total } = await taskRepository.findAll(
      { status, priority, search },
      { sortBy, sortOrder },
      page,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: tasks.map(sanitizeTask),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getTaskStats(userId: string): Promise<Record<TaskStatus, number>> {
    return taskRepository.getTaskStats(userId);
  }
}

export const taskService = new TaskService();
