const express = require('express');
const routes = express.Router();
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const { body } = require('express-validator/check')

routes.get('/add-product', isAuth, adminController.getAddProduct);

routes.get('/admin-products', isAuth,adminController.getProducts);

routes.post('/add-product', 
[
  body('title')
    .isString()
    .isLength({ min: 3 })
    .trim(),
  body('price').isFloat(),
  body('description')
    .isLength({ min: 5, max: 400 })
    .trim()
], isAuth, adminController.postAddProduct);

routes.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

routes.post('/edit-product',
[
  body('title')
    .isString()
    .isLength({ min: 3 })
    .trim(),
  body('price').isFloat(),
  body('description')
    .isLength({ min: 5, max: 400 })
    .trim()
], isAuth, adminController.postEditProduct);

routes.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = routes;