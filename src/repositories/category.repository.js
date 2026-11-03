class CategoryRepository {
  constructor(pool) { this.pool = pool; }
  async all() { const [rows] = await this.pool.execute('SELECT id, slug, name FROM categories ORDER BY name ASC'); return rows; }
  async byId(id) { const [rows] = await this.pool.execute('SELECT id, slug, name FROM categories WHERE id = ?', [id]); return rows[0]; }
  async bySlug(slug) { const [rows] = await this.pool.execute('SELECT id, slug, name FROM categories WHERE slug = ?', [slug]); return rows[0]; }
}
module.exports = CategoryRepository;
