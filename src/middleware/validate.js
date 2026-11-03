const { AppError } = require('../utils/response');
function parse(schema, data, status = 422, code = 'VALIDATION_ERROR') {
  const result = schema.safeParse(data);
  if (!result.success) throw new AppError(status, code, 'Please correct the highlighted fields.',
    result.error.issues.map(issue => ({ field: issue.path.join('.') || 'body', message: issue.message })));
  return result.data;
}
function validate(schema, source = 'body') {
  return (req, res, next) => {
    try { req.validated = parse(schema, req[source], source === 'query' ? 400 : 422, source === 'query' ? 'INVALID_QUERY' : 'VALIDATION_ERROR'); next(); }
    catch (error) { next(error); }
  };
}
module.exports = { parse, validate };
