import { Router } from 'express';
import { adminController } from '../../controllers/admin.controller';
import { taskController } from '../../controllers/task.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { UserRole } from '../../types';
import { taskQuerySchema } from '../../schemas/task.schema';
import { z } from 'zod';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
});

const userIdSchema = z.object({
  id: z.string().min(1),
});

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
router.get('/stats', adminController.getStats.bind(adminController));

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
router.get(
  '/users',
  validate({ query: paginationSchema }),
  adminController.getAllUsers.bind(adminController)
);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get(
  '/users/:id',
  validate({ params: userIdSchema }),
  adminController.getUserById.bind(adminController)
);

/**
 * @swagger
 * /api/v1/admin/users/{id}/role:
 *   patch:
 *     summary: Update user role (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: User role updated
 *       400:
 *         description: Invalid role or cannot change own role
 *       404:
 *         description: User not found
 */
router.patch(
  '/users/:id/role',
  validate({ params: userIdSchema, body: updateRoleSchema }),
  adminController.updateUserRole.bind(adminController)
);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 */
router.delete(
  '/users/:id',
  validate({ params: userIdSchema }),
  adminController.deleteUser.bind(adminController)
);

/**
 * @swagger
 * /api/v1/admin/tasks:
 *   get:
 *     summary: Get all tasks from all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All tasks with pagination
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
router.get(
  '/tasks',
  validate({ query: taskQuerySchema }),
  taskController.getAllTasks.bind(taskController)
);

export default router;

