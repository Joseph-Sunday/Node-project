const PDFDocument = require('pdfkit');
const stripe = require('stripe')('sk_test_51Mf0dxJdPzXGgzn9PgfsCunvpahdMLdKbwHBsa3cnuXa0tv37v0OmdI05iLhhCNW9hR23sdsmVtQZTmAW93tDVbW00yFK1noyb')

const ITEMS_PER_PAGE = 2;

const fs = require('fs');
const path = require('path');

const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
//| With mongodb driver method we used fetchAll() instead of find()
const page = +req.query.page || 1;
let totalItems;
Product.find()
.countDocuments()
  .then(numProducts => {
    totalItems = numProducts;
    return Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  })
  .then(products => {
    res.render('shop/product-list', {
      prods: products, 
      pageTitle: 'Products',
      path: '/products',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems, 
      hasPreviousPage: page > 1, 
      nextPage: page + 1, 
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
	//| SEQUELIZE METHOD
    // Product.findAll({ where: { id: prodId } })
    // .then(products => {
    //     res.render('shop/product-detail', {
    //     product: products[0], 
    //     pageTitle: products[0].title
    //     });
    // })
    //| Both Mongo db and mongoose use the findById() method. whereas this is a mongo db method
		Product.findById(prodId)
		.then(product => {
			res.render('shop/product-detail', {
				product: product,
				pageTitle: product.title,
        path: '/detail',
			});
		})
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
//| With mongodb driver method we used fetchAll() instead of find() 
const page = +req.query.page || 1;
let totalItems;
Product.find()
.countDocuments()
  .then(numProducts => {
    totalItems = numProducts;
    return Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  })
  .then(products => {
    res.render('shop/index', {
      prods: products, 
      pageTitle: 'Shop',
      path: '/home',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems, 
      hasPreviousPage: page > 1, 
      nextPage: page + 1, 
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  })
  .catch(err => {
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getCart = (req, res, next) => {
  //| MONGO DB METHOD
  req.user
  .populate('cart.items.productId')
  .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        pageTitle: 'Your cart',
        path: '/cart',
        products: products
      });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
    // .catch(err => {
    //   const error = new Error(err);
    //   error.httpStatusCode = 500;
    //   return next(error);
    // });
};

  //| SEQUELIZE METHOD
//   req.user
//     .getCart()
//     .then(cart => {
//         return cart.getProducts()
//         .then(products => {
// res.render('shop/cart', {
//     prods: products, 
//     pageTitle: 'Your Cart',
//     products: products
// })
//         })
//         .catch(err => {
//             console.log(err)
//         });
//     })
//     .catch(err => {
//         console.log(err)
//     });
// };

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product)
    })
    .then(result => {

      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });


    //|SEQUELIZE METHOD
    // let fetchedCart;
    // let newQuantity = 1;
    // //| RETRIEVING CART
    // req.user
    // .getCart()
    // .then(cart => {
    //     fetchedCart = cart
    //     return cart.getProducts({ where: {id: prodId} })
    // })
    // .then(products => {
    //     let product;
    //     if(products.length > 0) {
    //         product = products[0]
    //     }
    //     //|ADDING SAME PRODUCT TO CART (QUANTITY INCREMENTS BY 1)
    //     if(product) {
    //         const oldQuantity = product.cartItems.quantity
    //         newQuantity = oldQuantity + 1;
    //         return product;
    //     }
    //     //| ADDING A PRODUCT FOR THE FIRST TIME
    //     return Product.findByPk(prodId)
    // })
    // .then(product => {
    //     return fetchedCart.addProduct(product,  { 
    //         through:  { quantity: newQuantity }
    //     });
    // })
    // .then(() => {
        // res.redirect('/cart');
    // })
    // .catch(err => {
    //     console.log(err)
    // })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
//| MONGO DB METHOD / Mongoose method
  req.user
  .deleteItemFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  //| SEQUELIZE DELETE METHOD [REMEMBER TO ADD THE .THEN AND .CATCH AT THE END OF THE CODE]
    //| GET THE CART
    // req.user
    // .getCart()
    // .then(cart => {
    //     //| GET THE PRODUCT WITH THE SPECIFIC ID
    //     return cart.getProducts({ where: { id: prodId } })
    // })
    // .then(products => {
    //     //| EXTRACT THE PRODUCT IN THE FIRST ARRAY OF PRODUCTS AND THEN DESTROY
    //     const product = products[0];
    //     return product.cartItems.destroy();
    // })
};

exports.getOrders = (req, res, next) => {
  //|SEQUELIZE METHOD
    // req.user
    // .getOrders({include: ['products']})

    // | MONGO DB METHOD
    // req.user
    // .getOrders()
    //| Mongoose method 
  Order.find({'user.userId': req.user._id})
  .then(orders => {
    res.render('shop/order', {
      pageTitle: 'Your Orders',
      orders: orders,
      path: '/orders',
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0
  req.user
  .populate('cart.items.productId')
  .then(user => {
    products = user.cart.items;
    total = 0;
    products.forEach(p => {
      total += p.quantity * p.productId.price
    });
    // let session;
    // session = stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: products.map(p => {
    //       [{
    //       name: p.productId.title,
    //       description: p.productId.description,
    //       images: p.productId.imageUrl,
    //       amount: p.productId.price,
    //       currency: 'usd',
    //       price_data: {
    //         currency: 'usd',
    //         unit_amount: p.productId.price,
    //         product_data: {
    //           name: p.productId.title,
    //           description: p.productId.description,
    //           images: p.productId.imageUrl,
    //         },
    //       },
    //       quantity: p.quantity,
    //     }]
    //   }), 
    //   mode: 'payment',
    //   success_url: req.protocol + '://' + req.get('host') + '/checkout/success?session_id={CHECKOUT_SESSION_ID}',
    //   cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
    // })
    return stripe.checkout.sessions.create({
      payment_method_types: ['card'], 
      line_items: products.map(p => {
        return {
          name: p.productId.title, 
          description: p.productId.description,
          amount: p.productId.price * 100, 
          currency: 'usd',
          quantity: p.quantity
        }
      }),
      mode: 'payment',
      success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
      cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel' 
    })
    .then(session => {
      res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout',
        products: products, 
        totalSum: total, 
        sessionId: session.id
      });
    })
    
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getCheckoutSuccess = (req, res, next) => {
//| MONGOOSE METHOD
  req.user 
  .populate('cart.items.productId')
  .then(user => {
    const products = user.cart.items.map(i => {
      return { quantity: i.quantity, product: {...i.productId._doc}}
    });

    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user
      }, 
      products: products,
    });
    return order.save();
  })
  .then(() => {
    return req.user.clearCart();
  })
  .then(() => {
    res.redirect('/orders')
  })
  .catch(err => {
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}

exports.postOrder = (req, res, next) => {
   //| MONGOOSE METHOD
  req.user 
  .populate('cart.items.productId')
  .then(user => {
    const products = user.cart.items.map(i => {
      return { quantity: i.quantity, product: {...i.productId._doc}}
    });

    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user
      }, 
      products: products,
    });
    return order.save();
  })
  .then(() => {
    return req.user.clearCart();
  })
  .then(() => {
    res.redirect('/orders')
  })
  .catch(err => {
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });

  //| MONGODB METHOD
  // req.user
  //   .addOrder()
    

  //| SEQUELIZE METHOD;   
  // let fetchedCart
    // //| GET THE CART
    // req.user
    // .getCart()
    // .then(cart => {
    //     fetchedCart = cart
    //     return cart.getProducts()
    // })
    // .then(products => {
    //     //| CREATE AN ORDER
    //     return req.user.createOrder()
    //     .then(order => {
    //         //| ADD PRODUCTS
    //         return order.addProducts(products.map(product => {
    //             product.orderItems = { quantity: product.cartItems.quantity };
    //             return product;
    //         }))
    //     })
    //     .then(result => {
    //         //| DROP PRODUCTS IN CART AFTER PLACING ORDER [CART IS STORED IN THE FETCHEDCART VARIABLE]
    //         return fetchedCart.setProducts(null)
    //     })
    //     .then(result => {
    //         res.redirect('/orders');
    //     })
    //     .catch(err => console.log(err))
    // })
    // .catch(err => console.log(err))
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
  .then(order => {
    if(!order) {
      return next(new Error('No order found'))
    }
    if(order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error('Unauthorised user!'))
    }
    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);

    pdfDoc = new PDFDocument(); 
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition', 
      'inline; filename="' + invoiceName + '"'
    );
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
  
    pdfDoc.fontSize(24).text('Invoice', {
      underline: true
    });
    pdfDoc.text('-----------------------------------');
    let totalPrice = 0;
    order.products.forEach(prod => {
      totalPrice += prod.quantity * prod.product.price
      pdfDoc.fontSize(14).text(
        prod.product.title +
        ' - ' +
        prod.quantity +
        ' x ' +
        ' $' +
        prod.product.price
      );
    });
    pdfDoc.text('-----');
    pdfDoc.fontSize(20).text('Total Price = ' + totalPrice); 

    pdfDoc.end();
  })
  .catch(err => {
    return next(err)
  });
};