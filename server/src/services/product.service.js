import { productRepository } from '../repositories/product.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import { db } from '../config/database.js';

export class ProductService {
  async getProducts(params) {
    const { search, category, sortBy, order, page, limit } = params;
    const offset = (page - 1) * limit;

    const [products, total] = await Promise.all([
      productRepository.findProducts({ search, category, sortBy, order, offset, limit }),
      productRepository.countProducts({ search, category }),
    ]);

    return {
      items: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async addProduct(productData) {
    // Check SKU uniqueness
    const existing = await productRepository.findBySku(productData.sku);
    if (existing) {
      throw new AppError(`A product with SKU '${productData.sku}' already exists.`, 409);
    }

    return productRepository.createProduct(productData);
  }

  async getCategories() {
    return productRepository.findDistinctCategories();
  }

  async getHealthMetrics() {
    const start = Date.now();
    const [dbResult] = await db.raw('SELECT 1 + 1 AS ping, (SELECT COUNT(*) FROM products) AS total');
    const latencyMs = Date.now() - start;

    return {
      status: 'UP',
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: 'CONNECTED',
        latencyMs,
        totalProducts: Number(dbResult[0]?.total || 0),
      },
      cloudPlatform: process.env.RAILWAY_ENVIRONMENT ? 'Railway.app' : 'Self-hosted / Local',
    };
  }
}

export const productService = new ProductService();

