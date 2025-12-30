import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refresh-token.repository';
import { IUserDocument, UserRole } from '../models';
import { UserPayload, TokenPair } from '../types';
import { 
  AuthenticationError, 
  ConflictError, 
  ValidationError 
} from '../utils/errors';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

function generateAccessToken(user: IUserDocument): string {
  const payload: UserPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

function generateRefreshToken(user: IUserDocument): string {
  return jwt.sign(
    { id: user._id.toString(), type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
  );
}

function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

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

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: Record<string, unknown>; tokens: TokenPair }> {
    const existingUser = await userRepository.existsByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, config.bcryptRounds);

    const user = await userRepository.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
      role: UserRole.USER,
    });

    const tokens = await this.createTokenPair(user);

    return { user: sanitizeUser(user), tokens };
  }

  async login(input: LoginInput): Promise<{ user: Record<string, unknown>; tokens: TokenPair }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    const tokens = await this.createTokenPair(user);

    return { user: sanitizeUser(user), tokens };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const storedToken = await refreshTokenRepository.findByToken(refreshToken);
    if (!storedToken) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    try {
      jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch {
      await refreshTokenRepository.revokeToken(refreshToken);
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(storedToken.userId.toString());
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    await refreshTokenRepository.revokeToken(refreshToken);
    return this.createTokenPair(user);
  }

  async logout(refreshToken: string): Promise<void> {
    await refreshTokenRepository.revokeToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await refreshTokenRepository.revokeAllUserTokens(userId);
  }

  private async createTokenPair(user: IUserDocument): Promise<TokenPair> {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiresMs = parseExpiresIn(config.jwt.refreshExpiresIn);
    const expiresAt = new Date(Date.now() + expiresMs);

    await refreshTokenRepository.create(user._id.toString(), refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }

  async getCurrentUser(userId: string): Promise<Record<string, unknown>> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    return sanitizeUser(user);
  }
}

export const authService = new AuthService();
