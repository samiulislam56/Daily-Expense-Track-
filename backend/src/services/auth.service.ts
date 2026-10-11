import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository.js';
import { hashPassword, verifyPassword, generateToken } from '../utils/crypto.js';
import { RegisterInput, LoginInput } from '../schemas/auth.schema.js';
import { ConflictError, UnauthorizedError } from '../middleware/error.middleware.js';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    createdAt: string;
  };
}

export interface UserProfileResponse {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const cleanUsername = input.username.trim().toLowerCase();
    const existing = await userRepository.findByUsername(cleanUsername);
    if (existing) {
      throw new ConflictError('A user with this username already exists. Please choose a different username.');
    }

    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(input.password);
    const user = await userRepository.create({
      id: userId,
      username: input.username.trim(),
      passwordHash,
      displayName: input.displayName?.trim() || input.username.trim(),
    });

    const token = generateToken({ sub: user.id, username: user.username });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        createdAt: user.createdAt,
      },
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await userRepository.findByUsername(input.username.trim());
    if (!user || !verifyPassword(input.password, user.passwordHash)) {
      // Do not reveal whether username or password was incorrect to prevent account enumeration
      throw new UnauthorizedError('Invalid username or password.');
    }

    const token = generateToken({ sub: user.id, username: user.username });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        createdAt: user.createdAt,
      },
    };
  }

  async getMe(userId: string): Promise<UserProfileResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User session is invalid or user not found.');
    }

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
