import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { getSwaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import v1Routes from './routes/v1';
import { logger } from './utils/logger';

export function createApp(): Application {
  const app = express();

  // Trust proxy - REQUIRED for Vercel serverless to get correct IP addresses
  // This allows Express to trust the X-Forwarded-* headers from Vercel
  app.set('trust proxy', true);

  // Warmup endpoint - before all middleware for fastest response
  // Used by Vercel to keep the function warm
  app.get('/_warmup', (_req, res) => {
    res.status(200).json({ status: 'warm', timestamp: Date.now() });
  });

  // CORS configuration
  // For separate deployments, use ALLOWED_ORIGINS env var
  // Standard permissive setup for troubleshooting
  const corsOptions = {
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200,
  };

  // Apply CORS BEFORE other middleware
  app.use(cors(corsOptions));

  // Handle preflight requests explicitly
  app.options('*', cors(corsOptions));

  // Security middleware - AFTER CORS
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  }));

  // Rate limiting - configured for serverless/Vercel
  // With trust proxy enabled, req.ip will work correctly
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_ERROR',
        message: 'Too many requests, please try again later',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Custom key generator as fallback (trust proxy should make req.ip work)
    keyGenerator: (req) => {
      // With trust proxy, req.ip should be available
      // Fallback to headers if needed
      if (req.ip) {
        return req.ip;
      }
      // Fallback for edge cases
      const forwardedFor = req.headers['x-forwarded-for'];
      if (forwardedFor) {
        return Array.isArray(forwardedFor)
          ? forwardedFor[0].trim()
          : forwardedFor.toString().split(',')[0].trim();
      }
      return req.headers['x-real-ip']?.toString() || 'unknown';
    },
  });
  app.use(limiter);

  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Request logging
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`, {
      query: req.query,
      ip: req.ip,
    });
    next();
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // API Documentation - lazy load swagger spec to avoid cold start overhead
  app.use('/api-docs', swaggerUi.serve, (req: express.Request, res: express.Response, next: express.NextFunction) => {
    swaggerUi.setup(getSwaggerSpec(), {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'PrimeTrade API Documentation',
      customCssUrl: 'https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui.css',
      customJs: [
        'https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui-bundle.js',
        'https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui-standalone-preset.js',
      ],
    })(req, res, next);
  });

  // API Routes
  // Mount at standard path
  app.use('/api/v1', v1Routes);

  // Also mount at root as fallback (in case Vercel rewrites strip the path)
  // This helps avoid 404/405s if req.url comes in as just /auth/login
  app.use('/', v1Routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
