const { AppError } = require('../utils/response');
const dbCodes = new Set(['ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET', 'EHOSTUNREACH', 'ENOTFOUND', 'EAI_AGAIN', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE', 'ER_CON_COUNT_ERROR', 'ER_SERVER_SHUTDOWN', 'POOL_CLOSED']);
module.exports = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed') error = new AppError(400, 'INVALID_JSON', 'Request body must be valid JSON.');
  if (error.type === 'entity.too.large') error = new AppError(413, 'BODY_TOO_LARGE', 'Request body must not exceed 100 KB.');
  if (error.type === 'charset.unsupported' || error.type === 'encoding.unsupported') error = new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Use UTF-8 JSON without an unsupported content encoding.');
  if (dbCodes.has(error.code) || error.errors?.some(item => dbCodes.has(item.code))) error = new AppError(503, 'DATABASE_UNAVAILABLE', 'The catalog database is temporarily unavailable. Please try again.');
  if (!(error instanceof AppError)) {
    console.error('Request failed:', /^[A-Z0-9_]+$/.test(error.code || '') ? error.code : 'INTERNAL_ERROR');
    error = new AppError(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');
  }
  res.status(error.status);
  if (req.path === '/api' || req.path.startsWith('/api/')) return res.json({ success: false, error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) } });
  return res.render(error.status === 404 ? '404' : 'error', { title: error.status === 404 ? 'Product not found' : 'Unable to load catalog', message: error.message, status: error.status });
};
