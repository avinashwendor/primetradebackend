import { User, IUserDocument, UserRole } from '../models';

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export class UserRepository {
  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  async create(data: CreateUserData): Promise<IUserDocument> {
    const user = new User({
      email: data.email.toLowerCase(),
      password: data.password,
      name: data.name,
      role: data.role || UserRole.USER,
    });

    return user.save();
  }

  async updateById(id: string, data: Partial<IUserDocument>): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return result !== null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }

  async getAllUsers(page: number, limit: number): Promise<{ users: IUserDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ]);

    return { users, total };
  }

  async countByRole(role: UserRole): Promise<number> {
    return User.countDocuments({ role });
  }
}

export const userRepository = new UserRepository();
