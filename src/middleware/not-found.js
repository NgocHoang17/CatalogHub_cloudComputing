const { AppError } = require('../utils/response');
module.exports = (req, res, next) => next(new AppError(404, 'NOT_FOUND', 'The page or endpoint you requested does not exist.'));
