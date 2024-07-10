const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const { ensureAuthenticated } = require('../middlewares/auth');

router.get('/', async (req, res, next) => {
  try {
    console.log('Fetching messages');
    const messages = await Message.find().populate('author');
    console.log('Messages retrieved:', messages);
    res.render('index', { user: req.user, messages: messages });
  } catch (err) {
    console.error('Error in GET / route:', err);
    next(err);
  }
});


router.post('/new-message', ensureAuthenticated, async (req, res, next) => {
  try {
    const newMessage = new Message({
      text: req.body.message,
      author: req.user._id,
      timestamp: new Date()
    });
    await newMessage.save();
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
