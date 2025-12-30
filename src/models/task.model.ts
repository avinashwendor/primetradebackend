import mongoose, { Document, Schema, Types } from 'mongoose';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface ITask {
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDocument extends ITask, Document {}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: null,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

taskSchema.index({ userId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text' });

export const Task = mongoose.model<ITaskDocument>('Task', taskSchema);

