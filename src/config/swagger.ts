import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PrimeTrade API',
      version: '1.0.0',
      description: 'RESTful API with JWT Authentication and Role-Based Access Control',
      contact: {
        name: 'API Support',
        email: 'support@primetrade.ai',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            userId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Tasks', description: 'Task management endpoints' },
    ],
  },
  apis: ['./src/routes/**/*.ts'],
};

/**
 * Lazy-loaded Swagger spec to avoid synchronous file scanning on cold start.
 * The spec is only generated when the /api-docs endpoint is accessed.
 */
let _swaggerSpec: object | null = null;

export function getSwaggerSpec(): object {
  if (!_swaggerSpec) {
    _swaggerSpec = swaggerJsdoc(options);
  }
  return _swaggerSpec;
}

// For backward compatibility - but prefer using getSwaggerSpec()
export const swaggerSpec = {
  get spec() {
    return getSwaggerSpec();
  }
};

