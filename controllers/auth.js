 const crypto = require('crypto')

const { validationResult } = require('express-validator/check')

const bcrypt = require('bcryptjs');
const User = require('../models/user');
//| Sending mails
const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport')

const transporter = nodemailer.createTransport(({
  service: 'gmail', 
  auth: {
    user: 'abublessing76@gmail.com',
    pass: 'libaipmsqudqtezv'
    // api_key: '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'
  }
}));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error')
    if(message.length > 0) {
      message = message[0]
    }else {
      message = null;
    }
  res.render('auth/login', {
    pageTitle: 'Login', 
    path: '/login',
    isAuthenticated: false,
    errorMessage: message,
    oldInputs: {
      email: '',
      password: '',
    }, 
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array())
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errors.array()[0].msg,
        oldInputs: {
          email: email,
          password: password
        },
        validationErrors: errors.array()
      });
    }else {

    //| Comparing the emails
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid E-mail!.',
            oldInputs: {
              email: email,
              password: password
            },
            validationErrors: [{param: 'email'}]
          });
        }
        //| Comparing the passwords
        bcrypt
          .compare(password, user.password)
          .then(doMatch => {
            if (doMatch) {
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save(err => {
                console.log(err);
                res.redirect('/');
              });
            }
            return res.status(422).render('auth/login', {
              path: '/login',
              pageTitle: 'Login',
              errorMessage: 'Invalid Password.',
              oldInputs: {
                email: email,
                password: password
              },
              validationErrors: [{param: 'password'}]
            });
          })
          .catch(err => {
            console.log(err);
            res.redirect('/login');
          });
      })
      .catch(err => console.log(err));
    }

};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err)
    res.redirect('/')
  })
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error')
    if(message.length > 0) {
      message = message[0]
    }else {
      message = null;
    }
  res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
    isAuthenticated: false,
    errorMessage: message,
    oldInputs: {
      email: '', 
      password: '', 
      confirmPassword: ''
    }, 
    validationErrors: []
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).render('auth/signup', {
      pageTitle: 'Signup',
      path: '/signup',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInputs: {
        email: email,
        password: password, 
        confirmPassword: confirmPassword
      },
      validationErrors: errors.array()
    });
  }
  //| Checking the existence of an already used email
  // User.findOne({email: email})
  // .then(userDoc => {
  //   //| Checking if email already exists
  //   if(userDoc) {
  //     req.flash('error', 'E-mail already exists!')
  //     return res.redirect('/signup')
  //   }
  //| Creating a new user
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        password: hashedPassword, 
        email: email,
        cart: {items: []}
      });
      return user.save();
    })
    .then(success => {
      if(success) {
        res.redirect('/login')
        req.flash('success', 'Signup sucessfull')
        
        let mailOptions = {
          from: 'node-complete-webApp',
          to: req.body.email,
          subject: 'Signup sucessful',
          html:  `
          <h2 style="font-family:'calibri'">You successfully signed up with node-complete-webApp!</h2>
        `
        }
        return transporter.sendMail(mailOptions, (err, info) => {
          if(err) {
            console.log('ERORR', err)
          }else {
            console.log('E-mail sent' + info.response)
          }
        });
      }else {
        req.flash('error', "Couldn't Signup!")
        res.redirect('/signUp')
      }
    })
    .catch(err => {
      console.log(err)
    })
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error')
    if(message.length > 0) {
      message = message[0]
    }else {
      message = null;
    }
  res.render('auth/reset', {
    pageTitle: 'Reset Password', 
    path: '/reset',
    isAuthenticated: false,
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  //| creating the token
  crypto.randomBytes(32, (err, buffer) => {
    if(err) {
      console.log(err)
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    //| Finding the user by email
    User.findOne({email: req.body.email})
      .then(user => {
        if(!user) {
          req.flash('error', 'No account with that email found!')
          res.redirect('/reset')
        }
        user.resetToken = token
        user.resetTokenExpiration = Date.now() + 3600000;
        user.save();
      })
      .then(result => {
        res.redirect('/')

        let mailOptions = {
          from: 'node-complete-webApp',
          to: req.body.email,
          subject: 'Password reset',
          html: `
              <p>You requested a password reset!</p>
              <p>Click this <a href="http://localhost:3000/reset/${token}">link to set a new password</p>
          `
        }

        transporter.sendMail(mailOptions, (err, info) => {
          if(err) {
            console.log(err)
          }else {
            console.log('E-mail sent' + info.response)
          }
        }) 
      })
      .catch(err => {
        console.log(err)
      });
  });
}

exports.getNewPassword = (req, res, next) => {
  //| Getting the token
  const token = req.params.token;
  //| Finding user with corresponding token
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now() }})
    .then(user => {
      let message = req.flash('error')
      if(message.length > 0) {
        message = message[0]
      }else {
        message = null;
      }
      res.render('auth/new-password', {
        pageTitle: 'Password reset', 
        path: '/new-password',
        isAuthenticated: false,
        errorMessage: message,
        userId: user._id.toString(), 
        passwordToken: token
      });
    })
    .catch(err => {
      console.log(err)
    });

}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const passwordToken = req.body.passwordToken;
  const userId = req.body.userId
  let resetUser;
//| Find a user that meets with the listed requirements
  User.findOne({
    resetToken: passwordToken, 
    resetTokenExpiration: { $gt: Date.now() }, 
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12)
    })
    .then(hashedPassword => {
      resetUser.password =  hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login')
    })
    .catch(err => {
      console.log(err)
    });
}