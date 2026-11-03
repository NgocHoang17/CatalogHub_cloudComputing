const { Router } = require('express');
const { parse } = require('../middleware/validate');
const { querySchema, idSchema } = require('../validators/product.schema');
module.exports = (service, categories) => {
  const router = Router();
  router.get('/', async (req, res, next) => {
    let query;
    try { query = parse(querySchema, req.query, 400, 'INVALID_QUERY'); }
    catch (error) { return res.status(error.status).render('index', { title: 'Products', active: 'products', categories: [], products: [], meta: null, query: {}, loadError: error.message + ' ' + (error.details || []).map(item => item.message).join(' ') }); }
    try {
      const [result, categoryList] = await Promise.all([service.list(query), categories.all()]);
      res.render('index', { title: 'Products', active: 'products', categories: categoryList, products: result.items, meta: result.meta, query, loadError: null });
    } catch (error) {
      if (error.status === 400) return res.status(400).render('index', { title: 'Products', active: 'products', categories: [], products: [], meta: null, query, loadError: error.message });
      next(error);
    }
  });
  router.get('/products/new', async (req, res) => {
    let categoryList = [], loadError = null;
    try { categoryList = await categories.all(); }
    catch { loadError = 'Categories could not be loaded. Check the database connection and retry.'; res.status(503); }
    res.render('add-product', { title: 'Add Product', active: 'add', categories: categoryList, loadError });
  });
  router.get('/products/:id', async (req, res) => {
    const product = await service.detail(parse(idSchema, req.params.id, 400, 'INVALID_ID'));
    res.render('product-detail', { title: product.name, active: 'products', product });
  });
  return router;
};
