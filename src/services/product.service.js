const { AppError } = require('../utils/response');
class ProductService {
  constructor(products, categories) { Object.assign(this, { products, categories }); }
  async list(query) {
    if (query.category && !await this.categories.bySlug(query.category)) throw new AppError(400, 'CATEGORY_NOT_FOUND', 'The selected category does not exist.');
    const { items, total } = await this.products.list(query);
    const totalPages = Math.ceil(total / query.limit);
    return { items, meta: { page: query.page, limit: query.limit, total, totalPages,
      hasNextPage: query.page < totalPages, hasPrevPage: query.page > 1 } };
  }
  async detail(id) {
    const product = await this.products.byId(id);
    if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'This product could not be found.');
    return product;
  }
  async create(product) {
    if (!await this.categories.byId(product.categoryId)) throw new AppError(422, 'VALIDATION_ERROR', 'Please correct the highlighted fields.', [{ field: 'categoryId', message: 'Select an existing category.' }]);
    try { return await this.products.create(product); }
    catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new AppError(409, 'SKU_ALREADY_EXISTS', 'A product with this SKU already exists.', [{ field: 'sku', message: 'This SKU is already in use.' }]);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') throw new AppError(422, 'VALIDATION_ERROR', 'The category no longer exists.', [{ field: 'categoryId', message: 'Select an existing category.' }]);
      throw error;
    }
  }
}
module.exports = ProductService;
