import { db } from '../config/database.js';

export class ProductRepository {
  /**
   * Find products with filtering, searching, sorting, and pagination
   */
  async findProducts({ search, category, sortBy, order, offset, limit }) {
    const query = db('products').select('*');

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
  async countProducts({ search, category }) {
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
  async findBySku(sku) {
    return db('products').where({ sku }).first();
  }

  /**
   * Find by ID
   */
  async findById(id) {
    return db('products').where({ id }).first();
  }

  /**
   * Insert new product
   */
  async createProduct(productData) {
    const [insertedId] = await db('products').insert(productData);
    return this.findById(insertedId);
  }

  /**
   * Get unique list of categories
   */
  async findDistinctCategories() {
    const rows = await db('products').distinct('category').orderBy('category', 'asc');
    return rows.map((r) => r.category).filter(Boolean);
  }
}

export const productRepository = new ProductRepository();

