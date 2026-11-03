const { success } = require('../utils/response');
module.exports = categories => async (req, res) => success(res, await categories.all());
