import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRouter from './routes/index.js';
import { env } from './config/env.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || env.CLIENT_ORIGIN === '*' || origin === env.CLIENT_ORIGIN) {
      return callback(null, true);
    }
    // Allow Cloudflare Pages preview URLs (*.pages.dev)
    if (/^https:\/\/.*\.pages\.dev$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Request Logger
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Request Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome / status endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'CatalogHub API Service',
    version: '1.1.0',
    status: 'ONLINE',
    environment: env.NODE_ENV,
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      categories: '/api/products/categories',
    },
  });
});

// Main API Router
app.use('/api', apiRouter);

// 404 & Central Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

