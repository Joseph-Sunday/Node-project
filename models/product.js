//| MONGOOSE METHOD 
const mongoose = require('mongoose');

const Schema = mongoose.Schema; 

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  }, 
  price: {
    type: Number, 
    required: true
  }, 
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true 
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema)

// //| MONGO DB METHOD
// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// class Product {
//     constructor(title, price, description, imageUrl, id, userId) {
//       this.title = title;
//       this.price = price;
//       this.description = description;
//       this.imageUrl = imageUrl;
//       this._id = id ? new mongodb.ObjectId(id) : null;
//       this.userId = userId;
//     }

//     save() {
//       //| Get the database from getDb();
//         const db = getDb();
//         let dbOp;

//       if(this._id) {
//       //| Update the product
//         dbOp = db
//         .collection('products')
//         .updateOne({_id: (this._id)}, {$set: this})
//       }else {
//       //| Add new collection
//         dbOp = db
//         .collection('products')
//         .insertOne(this)
//       }
//         return dbOp 
//           .then(result => {
//             console.log('RESULT', result)
//           })
//           .catch(err => {
//             console.log(err)
//           });
//     };

//   //| Fetching the datas/products from the mongodb database
//     static fetchAll() {
//       const db = getDb();
//       return db
//       .collection('products')
//         .find()
//         .toArray()
//         .then(products => {
//           console.log(products);
//           return products;
//         })
//         .catch(err => {
//           console.log(err)
//         });
//     };

//   //| Fecthing a single product from the mongodb database
//     static findById(prodId) {
//       const db = getDb();
//       return db.collection('products')
//       .find({_id: new mongodb.ObjectId(prodId)})
//       .next()
//       .then(product => {
//         console.log(product)
//         return product;
//       })
//       .catch(err => {
//         console.log(err)
//       });
//     }

//   //| Deleting products from the database using the static method 
//     static deleteById(prodId) {
//       const db = getDb();
//       return db
//       .collection('products')
//         .deleteOne({_id: new mongodb.ObjectId(prodId)})
//         .then(result => {
//           console.log('Deleted')
//         })
//         .catch(err => {
//           console.log(err)
//         });
//     };

// }

// module.exports = Product;

// //| SEQUELIZE METHOD

// // const Product = sequelize.define('product', {
// //     id: {
// //         type: Sequelize.INTEGER,
// //         autoIncrement: true,
// //         allowNull: false,
// //         primaryKey: true
// //     },
// //     title: Sequelize.STRING,
// //     price: {
// //         type: Sequelize.DOUBLE,
// //         allowNull: false 
// //     },
// //     imageUrl: {
// //         type: Sequelize.STRING,
// //         allowNull: false 
// //     },
// //     description: {
// //         type: Sequelize.STRING,
// //         allowNull: false 
// //     }
// // });






// // | SQL2 & FSWRITE CODE //

// // const db = require('../util/database')

// // // const fs = require('fs');
// // // const path = require('path');

// // const Cart = require('./cart')

// // // const p = path.join(
// // //     path.dirname(process.mainModule.filename),
// // //     'data',
// // //     'products.json'
// // // );
    
// // // const getProductsFromFile = cb => {
    
// // //    fs.readFile(p, (err, fileContent) => {
// // //     if (err) {
// // //         cb([]);
// // //     } else {
// // //         cb(JSON.parse(fileContent));
// // //     }
    
// // //    });
// // // }

// // module.exports = class Product {
// //     constructor(id, title, imageUrl, description, price) {
// //         this.id = id
// //         this.title = title;
// //         this.imageUrl = imageUrl;
// //         this.description = description;
// //         this.price = price;
// //     };

// //     save() {
// //         return db.execute('INSERT INTO products (title, price, imageUrl, description) VALUES(?, ?, ?, ?)', 
// //         [this.title, this.price, this.imageUrl, this.description]);

// //         // getProductsFromFile(product => {
// //         //     if (this.id) {
// //         //         const existingProductIndex = product.findIndex(prod => prod.id === this.id);
// //         //         const updatedProducts = [...product];
// //         //         updatedProducts[existingProductIndex] = this;
// //         //         fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
// //         //             console.log(err);
// //         //         });
// //         //     } else {
// //         //         this.id = Math.random().toString();
// //         //         product.push(this);
// //         //         fs.writeFile(p, JSON.stringify(product), (err) => {
// //         //             console.log(err);
// //         //         });
// //         //     }

// //         // });
// //     }

// //     static deleteById(id) {
// //         // getProductsFromFile(products => {
// //         //     const product = products.find(prod => prod.id === id)
// //         //     const updatedProducts = products.filter(prod => prod.id !== id);
// //         //     fs.writeFile(p, JSON.stringify(updatedProducts), err => {
// //         //         if(!err) {
// //         //             Cart.deleteProduct(id, product.price)
// //         //         }
// //         //     });
// //         // });
// //     }

// //     static fetchAll() {
// //         return db.execute('SELECT * FROM products')
// //         // getProductsFromFile(cb)
// //     }

// //     static findById(id) {
// //        return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);

// //         // getProductsFromFile(products => {
// //         //     const product = products.find(p => p.id === id);
// //         //     cb(product);
// //         // });
// //     }
// // };