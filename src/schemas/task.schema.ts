import { z } from 'zod';
import { TaskStatus, TaskPriority } from '../models';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .transform((val) => val?.trim() || null),
  status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.PENDING),
  priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.MEDIUM),
  dueDate: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be less than 200 characters')
    .transform((val) => val.trim())
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .transform((val) => val?.trim() || null)
    .optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z
    .string()
    .datetime()
    .nullable()
    .optional()
    .transform((val) => (val ? new Date(val) : val === null ? null : undefined)),
});

export const taskIdSchema = z.object({
  id: z.string().min(1, 'Invalid task ID'),
});

export const taskQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().min(1).max(100)),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
