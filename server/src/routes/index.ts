import { Router } from 'express';
import productRoutes from './product.routes.js';
import uploadRoutes from './upload.routes.js';
import { productController } from '../controllers/product.controller.js';

const apiRouter = Router();

// Healthcheck endpoint
apiRouter.get('/health', productController.getHealth.bind(productController));

// Products sub-router
apiRouter.use('/products', productRoutes);

// Upload sub-router (Cloudinary Approach 2)
apiRouter.use('/upload', uploadRoutes);

export default apiRouter;

