const { success } = require('../utils/response');
const { parse } = require('../middleware/validate');
const { idSchema } = require('../validators/product.schema');
module.exports = service => ({
  list: async (req, res) => { const { items, meta } = await service.list(req.validated); return success(res, items, meta); },
  detail: async (req, res) => success(res, await service.detail(parse(idSchema, req.params.id, 400, 'INVALID_ID'))),
  create: async (req, res) => {
    const product = await service.create(req.validated);
    res.status(201).location(`/api/v1/products/${product.id}`);
    return success(res, product);
  }
});
