import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface IUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document { }

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    password: {
      type: String,
      required: true,
      maxlength: 255,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

export const User = mongoose.model<IUserDocument>('User', userSchema);

