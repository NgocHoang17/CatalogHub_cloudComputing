const { Router } = require('express');
module.exports = categories => {
  const router = Router();
  router.get('/', require('../controllers/category.controller')(categories));
  return router;
};
