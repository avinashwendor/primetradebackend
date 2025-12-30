import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

import { User, UserRole, Task, TaskStatus, TaskPriority } from '../../models';

async function seed(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/primetrade_db';

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if admin exists
    let admin = await User.findOne({ email: 'admin@primetrade.ai' });

    if (!admin) {
      const hashedPassword = await bcrypt.hash('Admin@123', 12);

      admin = await User.create({
        email: 'admin@primetrade.ai',
        password: hashedPassword,
        name: 'System Admin',
        role: UserRole.ADMIN,
      });

      console.log('Admin user created: admin@primetrade.ai / Admin@123');
    } else {
      console.log('Admin user already exists');
    }

    // Create demo tasks if none exist for admin
    const existingTasks = await Task.countDocuments({ userId: admin._id });
    
    if (existingTasks === 0) {
      const demoTasks = [
        {
          title: 'Set up development environment',
          description: 'Install Node.js, MongoDB, and configure the project',
          status: TaskStatus.COMPLETED,
          priority: TaskPriority.HIGH,
          userId: admin._id,
        },
        {
          title: 'Implement user authentication',
          description: 'Add JWT-based login and registration',
          status: TaskStatus.COMPLETED,
          priority: TaskPriority.URGENT,
          userId: admin._id,
        },
        {
          title: 'Build task management API',
          description: 'Create CRUD endpoints for tasks',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          userId: admin._id,
        },
        {
          title: 'Add role-based access control',
          description: 'Implement admin and user roles with proper permissions',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.MEDIUM,
          userId: admin._id,
        },
        {
          title: 'Write API documentation',
          description: 'Document all endpoints with Swagger',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          userId: admin._id,
        },
        {
          title: 'Set up CI/CD pipeline',
          description: 'Configure GitHub Actions for automated testing and deployment',
          status: TaskStatus.PENDING,
          priority: TaskPriority.LOW,
          userId: admin._id,
        },
      ];

      await Task.insertMany(demoTasks);
      console.log(`Created ${demoTasks.length} demo tasks for admin`);
    } else {
      console.log(`Admin already has ${existingTasks} tasks`);
    }

    await mongoose.connection.close();
    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();

