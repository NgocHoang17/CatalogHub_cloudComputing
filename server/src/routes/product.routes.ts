import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createProductSchema,
  getProductsQuerySchema,
  productIdParamSchema,
  updateProductSchema,
} from '../schemas/product.schema.js';

const router = Router();

router.get(
  '/',
  validate(getProductsQuerySchema),
  productController.getProducts.bind(productController)
);

router.post(
  '/',
  validate(createProductSchema),
  productController.createProduct.bind(productController)
);

router.get(
  '/categories',
  productController.getCategories.bind(productController)
);

router.get(
  '/:id',
  validate(productIdParamSchema),
  productController.getProductById.bind(productController)
);

router.put(
  '/:id',
  validate(updateProductSchema),
  productController.updateProduct.bind(productController)
);

router.delete(
  '/:id',
  validate(productIdParamSchema),
  productController.deleteProduct.bind(productController)
);

export default router;

