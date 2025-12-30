import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRefreshToken {
    token: string;
    userId: Types.ObjectId;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
}

export interface IRefreshTokenDocument extends IRefreshToken, Document { }

const refreshTokenSchema = new Schema<IRefreshTokenDocument>(
    {
        token: {
            type: String,
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        revokedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

refreshTokenSchema.index({ token: 1 }, { unique: true });
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model<IRefreshTokenDocument>('RefreshToken', refreshTokenSchema);

