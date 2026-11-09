import { db } from '../config/database.js';
import { Product, CreateProductDTO, ProductFilterParams } from '../types/index.js';

export class ProductRepository {
  /**
   * Find products with filtering, searching, sorting, and pagination
   */
  async findProducts(params: {
    search?: string;
    category?: string;
    stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
    sortBy: string;
    order: 'ASC' | 'DESC';
    offset: number;
    limit: number;
  }): Promise<Product[]> {
    const { search, category, stockStatus, sortBy, order, offset, limit } = params;
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

    if (stockStatus && stockStatus !== 'all') {
      if (stockStatus === 'in_stock') {
        query.andWhere('stock', '>', 10);
      } else if (stockStatus === 'low_stock') {
        query.andWhereBetween('stock', [1, 10]);
      } else if (stockStatus === 'out_of_stock') {
        query.andWhere('stock', '<=', 0);
      }
    }

    query.orderBy(sortBy, order);
    query.limit(limit).offset(offset);

    return query;
  }

  /**
   * Count total matching products for pagination metadata
   */
  async countProducts(params: {
    search?: string;
    category?: string;
    stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  }): Promise<number> {
    const { search, category, stockStatus } = params;
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

    if (stockStatus && stockStatus !== 'all') {
      if (stockStatus === 'in_stock') {
        query.andWhere('stock', '>', 10);
      } else if (stockStatus === 'low_stock') {
        query.andWhereBetween('stock', [1, 10]);
      } else if (stockStatus === 'out_of_stock') {
        query.andWhere('stock', '<=', 0);
      }
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
   * Update an existing product
   */
  async updateProduct(id: number, data: Partial<CreateProductDTO>): Promise<Product | undefined> {
    await db('products').where({ id }).update(data);
    return this.findById(id);
  }

  /**
   * Delete a product by ID
   */
  async deleteProduct(id: number): Promise<boolean> {
    const rowsAffected = await db('products').where({ id }).delete();
    return rowsAffected > 0;
  }

  /**
   * Get unique list of categories
   */
  async findDistinctCategories(): Promise<string[]> {
    const rows = await db('products').distinct('category').orderBy('category', 'asc');
    return rows.map((r: any) => r.category).filter(Boolean);
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStats(): Promise<{
    totalProducts: number;
    totalValue: number;
    lowStock: number;
    outOfStock: number;
  }> {
    const result = await db('products')
      .select(
        db.raw('COUNT(*) as totalProducts'),
        db.raw('COALESCE(SUM(price * stock), 0) as totalValue'),
        db.raw('COALESCE(SUM(CASE WHEN stock BETWEEN 1 AND 10 THEN 1 ELSE 0 END), 0) as lowStock'),
        db.raw('COALESCE(SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END), 0) as outOfStock')
      )
      .first();

    return {
      totalProducts: Number(result?.totalProducts || 0),
      totalValue: Number(result?.totalValue || 0),
      lowStock: Number(result?.lowStock || 0),
      outOfStock: Number(result?.outOfStock || 0),
    };
  }
}

export const productRepository = new ProductRepository();

