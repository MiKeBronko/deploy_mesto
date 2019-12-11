const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  link: {
    type: String,
    match: /^(https?:\/\/)(www\.)?(([\w]{2,}([.-]+\w+)*\.[A-Za-z]{2,3})?|(\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3})?)?(:[\d]{1,5})?(\/([\w#!:.?+=&%@!\-/])*)?$/,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    select: false,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: [],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('card', cardSchema);
