const express = require('express');

const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');

const User = require('../models/user')

const routes = express.Router();

routes.get('/login', authController.getLogin);

routes.post('/login',
 [
  check('email')
    .isEmail(),
  body('password', 'invalid Password')
  .trim()
  .isLength({min: 5})
  .isAlphanumeric()
 ],
authController.postLogin);

routes.post('/logout', authController.postLogout);

routes.get('/signup', authController.getSignup);

routes.post(
    '/signup', 
    [
      check('email')
        .isEmail()
        .withMessage('Please enter a valid E-mail')
        .normalizeEmail()
        .custom((value, { req }) => {
          return User.findOne({email: value}).then(userDoc => {
              //| Checking if email already exists
            if(userDoc) {
              return Promise.reject(
                'E-mail already exists, please pick another one!'
              ) 
            }
            return true;

              // if(value === 'michel@michel.com') {
              //     throw new Error('This E-mail address is forbidden.');
              // }
              // return true;
          });
        }),
      body(
        'password', 
        'Please enter a password with at least 5 characters or more without symbols'
      )
      .isLength({min: 5})
      .trim()
      .isAlphanumeric(),
      body('confirmPassword')
      .trim()
      .custom((value, {req}) => {
        if(value !== req.body.password){
          throw new Error('Passwords have to match!')
        }
        return true;
      })
    ], 
    authController.postSignup
);

routes.get('/reset', authController.getReset);

routes.post('/reset', authController.postReset);

routes.get('/reset/:token', authController.getNewPassword);

routes.post('/new-password', authController.postNewPassword);

module.exports = routes;