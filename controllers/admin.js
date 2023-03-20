const fileHelper = require('../util/file');

const ITEMS_PER_PAGE = 2;

const Product = require('../models/product');

const {validationResult} = require('express-validator/check');

exports.getAddProduct = (req, res, next) => {
  // res.sendFile(path.join(__dirname, '../', 'views', 'marketPlace.html'));
  res.render('admin/edit-product', {
    pageTitle: 'Add-product', 
    editing: false,
    path: '/add-product',
    isAuthenticated: req.session.isLoggedIn, 
    hasError: false, 
    errorMessage: null, 
    validationErrors: []
  });
    
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);

  if(!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add-product',
      path: '/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title, 
        price: price,
        description: description,
      },
      errorMessage: 'Attached file is not an image!', 
      validationErrors: []
    });
  }

  if(!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add-product',
      path: '/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title, 
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg, 
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      // console.log(result)
        console.log('Created Product');
        res.redirect('/admin-products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if(!editMode) {
      return res.redirect('/');
  }
  const prodId = req.params.productId;
  //| findById() is also a mongoose method so the code works for both mongodb and mongoose 
  Product.findById(prodId)
  .then(product => {

    if(!product) {
      return res.redirect('/')
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit-product',
      path: '/edit-product',
      editing: editMode,
      product: product,
      isAuthenticated: req.isLoggedIn, 
      hasError: false, 
      errorMessage: null, 
      validationErrors: []
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
    
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  
  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit-product',
      path: '/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle, 
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg, 
      validationErrors: errors.array()
    });
  }
  //| SEQUELIZE METHOD
  // Product.findByPk(prodId)
  // .then(product => {
  //     product.title = updatedTitle;
  //     product.price = updatedPrice;
  //     product.description = updatedDesc;
  //     product.imageUrl = updatedImageUrl;
  //     return product.save();
  // })

  //| MONGO DB METHOD
  // const product = new Product(
  //   updatedTitle, 
  //   updatedPrice, 
  //   updatedDesc, 
  //   updatedImageUrl,
  //   prodId
  // );
  // product.save()

  //| Mongoose method NB: the .then() below this method that redirects is for all three methods
  Product.findById(prodId)
  .then(product => {
    if(product.userId.toString() !== req.user._id.toString()) {
      return res.redirect('/')
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    if(image) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
      console.log(product.imageUrl);
    }
    return product.save()
    .then(result => {
      console.log('UPDATED PRODUCTS!');
      res.redirect('/admin-products');
    })
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProducts = (req, res, next) => {
  //| SEQUELIZE METHOD 
  // req.user.getProducts()
  // .then(product => {
  //     res.render('admin/products', 
  //     {prods: product, 
  //     pageTitle: 'Admin Products'});
  // })
    
  //| MONGO DB METHOD
  //| Always remember that the find() method is for mongoose while the fetchAll() method is for mongo db driver so therefore this is a mongoose method
  Product.find({userId: req.user._id})
  .then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin products',
      path: '/admin-products',
      isAuthenticated: req.session.isLoggedIn
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
  // Product.fetchAll((product) => {
  //     res.render('admin/products', 
  //     {prods: product, 
  //     pageTitle: 'Admin Products'});

  // });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  //| SEQUELIZE METHOD
  // Product.findByPk(prodId)
  // .then(product => {
  //   return product.destroy()
  // })

  //| MONGO DB METHOD
  // Product.deleteById(prodId)

  //| MONGOOSE METHOD 
  Product.findById(prodId)
  .then(product => {
    if(!product) {
      return next(new Error('No products found!'))
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({_id: prodId, userId: req.user._id});
  })
  .then(() => {
    console.log('DELETED PRODUCT');
    res.status(200).json({ message: 'Success!' });
  })
  .catch(err => {
    res.status(500).json({ message: 'Deleting product failed.' })
  });
  
};
