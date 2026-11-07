import { productService } from '../services/product.service.js';

export class ProductController {
  async getProducts(req, res, next) {
    try {
      const result = await productService.getProducts(req.query);
      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async createProduct(req, res, next) {
    try {
      const product = await productService.addProduct(req.body);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  async getCategories(req, res, next) {
    try {
      const categories = await productService.getCategories();
      res.json({
        success: true,
        data: categories,
      });
    } catch (err) {
      next(err);
    }
  }

  async getHealth(req, res, next) {
    try {
      const metrics = await productService.getHealthMetrics();
      res.json(metrics);
    } catch (err) {
      res.status(503).json({
        status: 'DEGRADED',
        error: err.message,
      });
    }
  }
}

export const productController = new ProductController();

