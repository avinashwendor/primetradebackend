import { Task, ITaskDocument, TaskStatus, TaskPriority } from '../models';
import { FilterQuery, SortOrder, Types } from 'mongoose';

interface CreateTaskData {
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  userId: string;
}

interface UpdateTaskData {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

interface TaskFilters {
  userId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

interface TaskSort {
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export class TaskRepository {
  private buildFilterQuery(filters: TaskFilters): FilterQuery<ITaskDocument> {
    const query: FilterQuery<ITaskDocument> = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return query;
  }

  async findById(id: string): Promise<ITaskDocument | null> {
    return Task.findById(id);
  }

  async findByIdAndUserId(id: string, userId: string): Promise<ITaskDocument | null> {
    return Task.findOne({ _id: id, userId });
  }

  async create(data: CreateTaskData): Promise<ITaskDocument> {
    const task = new Task(data);
    return task.save();
  }

  async updateById(id: string, data: UpdateTaskData): Promise<ITaskDocument | null> {
    return Task.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await Task.findByIdAndDelete(id);
    return result !== null;
  }

  async findAll(
    filters: TaskFilters,
    sort: TaskSort,
    page: number,
    limit: number
  ): Promise<{ tasks: ITaskDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const sortBy = sort.sortBy || 'createdAt';
    const sortOrder: SortOrder = sort.sortOrder === 'asc' ? 1 : -1;

    const query = this.buildFilterQuery(filters);

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(query),
    ]);

    return { tasks, total };
  }

  async getTaskStats(userId: string): Promise<Record<TaskStatus, number>> {
    const results = await Task.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats: Record<TaskStatus, number> = {
      [TaskStatus.PENDING]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.COMPLETED]: 0,
      [TaskStatus.CANCELLED]: 0,
    };

    for (const row of results) {
      stats[row._id as TaskStatus] = row.count;
    }

    return stats;
  }
}

export const taskRepository = new TaskRepository();
