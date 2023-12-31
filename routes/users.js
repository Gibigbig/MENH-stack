const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');
const redirectIfAuthenticated = require('../middleware/redirectIfAuthenticated');


// Login Page
router.get('/login', redirectIfAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', redirectIfAuthenticated, (req, res) => res.render('register'));

// Register Handle
router.post('/register', redirectIfAuthenticated, (req, res) => {
    const { email, password, password2 } = req.body;
    let errors = [];

    // Check required fields
    if (!email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check pass length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.send(JSON.stringify(errors));
    } else {
        // Validation passed
        User.findOne({ email: email }).then(user => {
            if (user) {
                // User exists
                errors.push({ msg: 'Email is already registered' });
                res.send(JSON.stringify(errors));
            } else {
                const newUser = new User({
                    email,
                    password
                });

                // Hash Password
                bcrypt.genSalt(10, (err, salt) => 
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        // Set password to hashed
                        newUser.password = hash;
                        // Save user
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and can log in');
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                }));
            }
        });
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success_msg', 'You are logged out');
      res.redirect('/users/login');
    });
  });
  
  module.exports = router;