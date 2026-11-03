const columns = `p.id, p.sku, p.name, p.description, p.price, p.image_url,
 p.created_at, p.updated_at, c.id AS category_id, c.slug AS category_slug, c.name AS category_name`;
const joined = 'FROM products p JOIN categories c ON c.id = p.category_id';
const sorts = { newest: 'p.created_at DESC, p.id DESC', price_asc: 'p.price ASC, p.id DESC', price_desc: 'p.price DESC, p.id DESC', name_asc: 'p.name ASC, p.id DESC' };
function escapeLike(value) { return value.replace(/[!%_\\]/g, character => `!${character}`); }
function map(row) {
  return {
    id: row.id, sku: row.sku, name: row.name, description: row.description, price: row.price,
    imageUrl: row.image_url, category: { id: row.category_id, slug: row.category_slug, name: row.category_name },
    createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString()
  };
}
class ProductRepository {
  constructor(pool) { this.pool = pool; }
  async list(query) {
    const conditions = [], params = [];
    if (query.q) {
      conditions.push("(p.name LIKE ? ESCAPE '!' OR p.sku LIKE ? ESCAPE '!' OR p.description LIKE ? ESCAPE '!')");
      const keyword = `%${escapeLike(query.q)}%`; params.push(keyword, keyword, keyword);
    }
    if (query.category) { conditions.push('c.slug = ?'); params.push(query.category); }
    if (query.minPrice !== undefined) { conditions.push('p.price >= ?'); params.push(query.minPrice); }
    if (query.maxPrice !== undefined) { conditions.push('p.price <= ?'); params.push(query.maxPrice); }
    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    // One snapshot keeps total and items consistent while another request inserts.
    const connection = await this.pool.getConnection();
    try {
      await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
      await connection.beginTransaction();
      const [[count]] = await connection.execute(`SELECT COUNT(*) AS total ${joined}${where}`, params);
      const [rows] = await connection.execute(`SELECT ${columns} ${joined}${where} ORDER BY ${sorts[query.sort]} LIMIT ? OFFSET ?`,
        [...params, String(query.limit), String((query.page - 1) * query.limit)]);
      await connection.commit();
      return { items: rows.map(map), total: Number(count.total) };
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  }
  async byId(id) {
    const [rows] = await this.pool.execute(`SELECT ${columns} ${joined} WHERE p.id = ?`, [id]);
    return rows[0] ? map(rows[0]) : null;
  }
  async create(product) {
    const [result] = await this.pool.execute(
      'INSERT INTO products (sku, name, category_id, price, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [product.sku, product.name, product.categoryId, product.price, product.description, product.imageUrl]);
    return this.byId(result.insertId);
  }
}
module.exports = { ProductRepository, escapeLike };
