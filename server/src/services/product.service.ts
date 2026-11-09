import { productRepository } from '../repositories/product.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import { db } from '../config/database.js';
import { Product, CreateProductDTO, ProductFilterParams, PaginationMeta, HealthResponse } from '../types/index.js';

export class ProductService {
  async getProducts(params: ProductFilterParams): Promise<{ items: Product[]; pagination: PaginationMeta }> {
    const { search, category, stockStatus, sortBy, order, page, limit } = params;
    const offset = (page - 1) * limit;

    const [products, total] = await Promise.all([
      productRepository.findProducts({ search, category, stockStatus, sortBy, order, offset, limit }),
      productRepository.countProducts({ search, category, stockStatus }),
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

  async addProduct(productData: CreateProductDTO): Promise<Product> {
    const existing = await productRepository.findBySku(productData.sku);
    if (existing) {
      throw new AppError(`A product with SKU '${productData.sku}' already exists.`, 409);
    }

    return productRepository.createProduct(productData);
  }

  async getProductById(id: number): Promise<Product> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError(`Product with ID ${id} not found`, 404);
    }
    return product;
  }

  async updateProduct(id: number, data: Partial<CreateProductDTO>): Promise<Product> {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new AppError(`Product with ID ${id} not found`, 404);
    }
    const updated = await productRepository.updateProduct(id, data);
    return updated!;
  }

  async deleteProduct(id: number): Promise<void> {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new AppError(`Product with ID ${id} not found`, 404);
    }
    await productRepository.deleteProduct(id);
  }

  async getCategories(): Promise<string[]> {
    return productRepository.findDistinctCategories();
  }

  async getHealthMetrics(): Promise<HealthResponse> {
    const start = Date.now();
    const [dbResult]: any = await db.raw('SELECT 1 + 1 AS ping, (SELECT COUNT(*) FROM products) AS total');
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

