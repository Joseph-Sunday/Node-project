// VARIABLES 
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash'); 
const multer = require('multer');


//|CONNECTION STRING 
const MONGODB_URI = 'mongodb+srv://Joseph18:Thankgod1@cluster0.hgj8mum.mongodb.net/shop?retryWrites=true&w=majority';

//| MONGO DB CONNECT
// const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const mongoose = require('mongoose');

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
}) 
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  }, 
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if(
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true); 
  }else {
    cb(null, false)
  }
};

// ROUTES 
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/404');

// GENERAL CODE/Middlewares

app.set('view engine', 'ejs');
app.set('views', 'views');  

app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
  secret: 'my secret', 
  resave: false, 
  saveUninitialized: false, 
  store: store
}));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if(!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
    if(!user) {
      return next();
    }
    req.user = user;
    next();
  })
  .catch(err => {
    next(new Error(err))
  });
});

app.use(adminRoutes);
app.use(shopRoutes);  
app.use(authRoutes);  

// app.use('/500', errorController.get500);

app.use(errorController.getError);

app.use((error, req, res, next) => {
  // res.redirect('/500')
  console.log(error)
  res.status(500).render('500', {
    pageTitle:'Error!', 
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(3000)
    console.log('Connected!')
  })
  .catch(err => {
    console.log(err)
  })

//   .then(result => {
//     console.log('connected!');
//     User.findOne()
//     .then(user => {
//       if(!user) {
//         const user = new User({
//           name: 'Joseph',
//           email: 'shifu@shifu',
//           cart: {items: []}
//         });
//         user.save();
//       }
//     });
//     app.listen(3000)
//   })
//   .catch(err => {
//     console.log(err)
//   });




// | MONGO DB METHOD 

// //| CONNECTING MONGO DB VIA THE MONGO CONNECT FUNCTION

// mongoConnect(() => {
//   app.listen(3000)
// });

// | SEQUELIZE METHODS 

// | REQUIRED MODELS FOR SEQUELIZE

// const sequelize = require('./util/database');
// const Products = require('./models/product');
// const User = require('./models/user');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-Item');
// const Order = require('./models/order');
// const OrderItem = require('./models/order-Item');


// | SEQUELIZE CODES ||

// //| RELATIONS OR ASSOCIATION
// Products.belongsTo( User, { constraints: true, onDelete: 'CASCADE' } );
// User.hasMany(Products);
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Products, { through: CartItem });
// Products.belongsToMany(Cart, { through: CartItem });
// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Products, { through: OrderItem });

// sequelize
// // .sync({force: true})
// .sync()
// .then((result) => {
//    return User.findByPk(1)
// })
// .then(user => {
//     if (!user) {
//        return User.create({Name: 'Joseph', Email: 'shifu@shifu.com'});
//     }
//     return user;
// })
// .then(user => {
//    return user.createCart();
// })
// .then(cart => {
//     app.listen(3000);
// })
// .catch(err => console.log(err));
