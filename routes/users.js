const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const validatePassword = (password) => {
  const minLength = 8;
  const hasNumber = /\d/;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

  if (password.length < minLength) {
    return 'Password must be at least 8 characters long';
  }
  if (!hasNumber.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!hasSpecialChar.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
};


// GET sign-up page
router.get('/sign-up', (req, res) => {
    res.render('sign-up', { error: null });
  });
  
  // POST sign-up
  router.post('/sign-up', async (req, res, next) => {
    const { fullName, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.render('sign-up', { error: 'Passwords do not match' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.render('sign-up', { error: passwordError });
    }

    
    try {
      const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('sign-up', { error: 'An account with this email already exists' });
    }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        fullName,
        email,
        password: hashedPassword,
      });
      await user.save();
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  });

router.get('/log-in', (req, res) => {
  res.render('log-in');
});

router.post('/log-in', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/log-in',
}));

router.get('/log-out', (req, res) => {
  req.logout(err => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// GET join club page
router.get('/join-club', (req, res) => {
    res.render('join-club', { error: null });
  });
  
  // POST join club
  router.post('/join-club', async (req, res, next) => {
    const { secretPasscode } = req.body;
    const user = req.user;
    
    if (secretPasscode === process.env.MEMBERSHIP_CODE) {
      try {
        user.membershipStatus = true;
        await user.save();
        res.redirect('/');
      } catch (err) {
        next(err);
      }
    } else {
      res.render('join-club', { error: 'Incorrect passcode' });
    }
  });


  
  

module.exports = router;
