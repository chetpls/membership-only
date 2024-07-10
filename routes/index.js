const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const { ensureAuthenticated } = require('../middlewares/auth');

router.get('/', async (req, res, next) => {
  try {
    const messages = await Message.find().populate('author').sort({ timestamp: -1 }).exec();
    const reversedMessages = messages.reverse();
    res.render('index', { user: req.user, messages: reversedMessages });
  } catch (err) {
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
