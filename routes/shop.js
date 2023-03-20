const express = require('express');
const routes = express.Router();

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

routes.get('/', shopController.getIndex);

routes.get('/products', shopController.getProducts);

routes.get('/products/:productId', isAuth, shopController.getProduct);  

routes.get('/cart', isAuth, shopController.getCart);

routes.post('/cart', isAuth, shopController.postCart);

routes.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

routes.get('/checkout', isAuth, shopController.getCheckout);

routes.get('/checkout/success', shopController.getCheckoutSuccess);

routes.get('/checkout', shopController.getCheckout)

routes.post('/create-order', isAuth, shopController.postOrder);

routes.get('/orders', isAuth, shopController.getOrders);

routes.get('/orders/:orderId', isAuth, shopController.getInvoice);

// routes.get('/checkout', shopController.getCheckout);

module.exports = routes;