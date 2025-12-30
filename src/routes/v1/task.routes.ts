import { Router } from 'express';
import { taskController } from '../../controllers/task.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../types';
import { 
  createTaskSchema, 
  updateTaskSchema, 
  taskIdSchema,
  taskQuerySchema 
} from '../../schemas/task.schema';

const router = Router();

// All task routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router.post(
  '/',
  validate({ body: createTaskSchema }),
  taskController.createTask.bind(taskController)
);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get user's tasks
 *     tags: [Tasks]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, dueDate, priority, title]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of tasks with pagination
 *       401:
 *         description: Not authenticated
 */
router.get(
  '/',
  validate({ query: taskQuerySchema }),
  taskController.getUserTasks.bind(taskController)
);

/**
 * @swagger
 * /api/v1/tasks/stats:
 *   get:
 *     summary: Get task statistics
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task statistics by status
 *       401:
 *         description: Not authenticated
 */
router.get(
  '/stats',
  taskController.getTaskStats.bind(taskController)
);

/**
 * @swagger
 * /api/v1/tasks/all:
 *   get:
 *     summary: Get all tasks (Admin only)
 *     tags: [Tasks]
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
 *         description: Insufficient permissions
 */
router.get(
  '/all',
  authorize(UserRole.ADMIN),
  validate({ query: taskQuerySchema }),
  taskController.getAllTasks.bind(taskController)
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Task details
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view this task
 *       404:
 *         description: Task not found
 */
router.get(
  '/:id',
  validate({ params: taskIdSchema }),
  taskController.getTask.bind(taskController)
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this task
 *       404:
 *         description: Task not found
 */
router.put(
  '/:id',
  validate({ params: taskIdSchema, body: updateTaskSchema }),
  taskController.updateTask.bind(taskController)
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this task
 *       404:
 *         description: Task not found
 */
router.delete(
  '/:id',
  validate({ params: taskIdSchema }),
  taskController.deleteTask.bind(taskController)
);

export default router;

