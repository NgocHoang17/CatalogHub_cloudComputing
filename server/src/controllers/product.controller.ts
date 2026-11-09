import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service.js';
import { ProductFilterParams } from '../types/index.js';

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams = req.query as unknown as ProductFilterParams;
      const result = await productService.getProducts(queryParams);
      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const product = await productService.getProductById(id);
      res.json({
        success: true,
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const updated = await productService.updateProduct(id, req.body);
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      await productService.deleteProduct(id);
      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  async getHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await productService.getHealthMetrics();
      res.json(metrics);
    } catch (err: any) {
      res.status(503).json({
        status: 'DEGRADED',
        error: err.message,
      });
    }
  }
}

export const productController = new ProductController();

