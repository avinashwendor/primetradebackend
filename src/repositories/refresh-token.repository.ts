import { RefreshToken, IRefreshTokenDocument } from '../models';

export class RefreshTokenRepository {
  async create(userId: string, token: string, expiresAt: Date): Promise<IRefreshTokenDocument> {
    const refreshToken = new RefreshToken({
      token,
      userId,
      expiresAt,
    });

    return refreshToken.save();
  }

  async findByToken(token: string): Promise<IRefreshTokenDocument | null> {
    return RefreshToken.findOne({
      token,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
  }

  async revokeToken(token: string): Promise<boolean> {
    const result = await RefreshToken.findOneAndUpdate(
      { token },
      { revokedAt: new Date() }
    );
    return result !== null;
  }

  async revokeAllUserTokens(userId: string): Promise<number> {
    const result = await RefreshToken.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() }
    );
    return result.modifiedCount;
  }

  async cleanupExpiredTokens(): Promise<number> {
    const result = await RefreshToken.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount;
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
