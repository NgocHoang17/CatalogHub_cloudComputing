const express = require('express');
const helmet = require('helmet');
const path = require('node:path');
const CategoryRepository = require('./repositories/category.repository');
const { ProductRepository } = require('./repositories/product.repository');
const ProductService = require('./services/product.service');
function createApp({ pool, config }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy || false);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(helmet({ contentSecurityPolicy: { directives: {
    'img-src': ["'self'", 'http:', 'https:'], 'script-src': ["'self'"],
    'upgrade-insecure-requests': config.nodeEnv === 'production' ? [] : null
  } } }));
  app.use(express.json({ limit: '100kb', verify: (req, res, buffer) => {
    // JSON.parse normally erases exponent notation. Node 24 supplies the original
    // numeric token to the reviver, including escaped property names.
    try {
      JSON.parse(buffer.toString('utf8'), (key, value, context) => {
        if (key === 'price' && typeof value === 'number' && /[eE]/.test(context.source)) req.invalidPriceNotation = true;
        return value;
      });
    } catch { /* The JSON parser reports malformed JSON through the error handler. */ }
  } }));
  app.use(express.static(path.join(__dirname, '../public')));
  app.locals.writeEnabled = config.writeEnabled;
  Object.assign(app.locals, require('./utils/view'), { active: '', title: 'CatalogHub' });
  const categories = new CategoryRepository(pool);
  const service = new ProductService(new ProductRepository(pool), categories);
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/ready', async (req, res) => {
    try { await pool.query('SELECT 1'); res.json({ status: 'ready', database: 'connected' }); }
    catch { res.status(503).json({ status: 'not_ready', database: 'unavailable' }); }
  });
  app.use('/api/v1/products', require('./routes/product.routes')(service, config));
  app.use('/api/v1/categories', require('./routes/category.routes')(categories));
  // Unknown API routes must never fall through into HTML handlers.
  app.use('/api', require('./middleware/not-found'));
  app.use('/', require('./routes/web.routes')(service, categories));
  app.use(require('./middleware/not-found'));
  app.use(require('./middleware/error-handler'));
  return app;
}
module.exports = { createApp };
