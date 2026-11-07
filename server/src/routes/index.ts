import { Router } from 'express';
import productRoutes from './product.routes.js';
import { productController } from '../controllers/product.controller.js';

const apiRouter = Router();

// Healthcheck endpoint
apiRouter.get('/health', productController.getHealth.bind(productController));

// Products sub-router
apiRouter.use('/products', productRoutes);

export default apiRouter;

