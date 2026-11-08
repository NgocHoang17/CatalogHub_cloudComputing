import { db } from '../config/database.js';
import { Product, CreateProductDTO, ProductFilterParams } from '../types/index.js';

export class ProductRepository {
  /**
   * Find products with filtering, searching, sorting, and pagination
   */
  async findProducts(params: {
    search?: string;
    category?: string;
    sortBy: string;
    order: 'ASC' | 'DESC';
    offset: number;
    limit: number;
  }): Promise<Product[]> {
    const { search, category, sortBy, order, offset, limit } = params;
    const query = db<Product>('products').select('*');

    if (search) {
      query.where((builder) => {
        builder
          .where('name', 'like', `%${search}%`)
          .orWhere('sku', 'like', `%${search}%`)
          .orWhere('description', 'like', `%${search}%`);
      });
    }

    if (category && category !== 'All') {
      query.andWhere('category', category);
    }

    query.orderBy(sortBy, order);
    query.limit(limit).offset(offset);

    return query;
  }

  /**
   * Count total matching products for pagination metadata
   */
  async countProducts(params: { search?: string; category?: string }): Promise<number> {
    const { search, category } = params;
    const query = db('products').count('id as total');

    if (search) {
      query.where((builder) => {
        builder
          .where('name', 'like', `%${search}%`)
          .orWhere('sku', 'like', `%${search}%`)
          .orWhere('description', 'like', `%${search}%`);
      });
    }

    if (category && category !== 'All') {
      query.andWhere('category', category);
    }

    const result = await query.first();
    return Number(result?.total || 0);
  }

  /**
   * Find by SKU
   */
  async findBySku(sku: string): Promise<Product | undefined> {
    return db<Product>('products').where({ sku }).first();
  }

  /**
   * Find by ID
   */
  async findById(id: number): Promise<Product | undefined> {
    return db<Product>('products').where({ id }).first();
  }

  /**
   * Insert new product
   */
  async createProduct(productData: CreateProductDTO): Promise<Product> {
    const [insertedId] = await db('products').insert(productData);
    const created = await this.findById(insertedId);
    if (!created) {
      throw new Error('Failed to retrieve newly created product');
    }
    return created;
  }

  /**
   * Get unique list of categories
   */
  async findDistinctCategories(): Promise<string[]> {
    const rows = await db('products').distinct('category').orderBy('category', 'asc');
    return rows.map((r: any) => r.category).filter(Boolean);
  }
}

export const productRepository = new ProductRepository();

