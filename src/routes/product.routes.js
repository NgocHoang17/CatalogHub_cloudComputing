const { Router } = require('express');
const { rateLimit } = require('express-rate-limit');
const { validate } = require('../middleware/validate');
const { productSchema, querySchema } = require('../validators/product.schema');
const { AppError } = require('../utils/response');
module.exports = (service, config) => {
  const router = Router();
  const controller = require('../controllers/product.controller')(service);
  router.get('/', validate(querySchema, 'query'), controller.list);
  router.get('/:id', controller.detail);
  router.post('/', (req, res, next) => {
    if (!config.writeEnabled) return next(new AppError(403, 'WRITE_DISABLED', 'Demo write access is disabled on this deployment'));
    next();
  }, rateLimit({ windowMs: 60000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false,
    handler: (req, res, next) => next(new AppError(429, 'RATE_LIMITED', 'Too many submissions. Please wait a minute.')) }),
  (req, res, next) => {
    if (!req.is('application/json')) return next(new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Send the product as application/json.'));
    if (req.invalidPriceNotation) return next(new AppError(422, 'VALIDATION_ERROR', 'Please correct the highlighted fields.', [{field:'price',message:'Exponent notation is not accepted. Use a decimal value.'}]));
    next();
  }, validate(productSchema), controller.create);
  return router;
};
