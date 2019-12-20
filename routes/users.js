const { celebrate, Joi } = require('celebrate');

const users = require('express').Router();

const {
  getUsers, findUser, updateUser, updateAva,
} = require('../controllers/users');

users.get('/users', getUsers);
users.get('/users/:userId', celebrate({
  params: Joi.object().keys(
    {
      userId: Joi.string().alphanum().length(24).regex(/^[0-9a-fA-F]{24}$/),
    },
  ).unknown(true),
}), findUser);
users.patch('/users/me', celebrate({
  body: Joi.object().keys(
    {
      name: Joi.string().required().min(2).max(30),
      about: Joi.string().required().min(2).max(30),
    },
  ),
}), updateUser);
users.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys(
    {
      avatar: Joi.string().required().regex(/^(https?:\/\/)(www\.)?(([\w]{2,}([.-]+\w+)*\.[A-Za-z]{2,3})?|(\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3})?)?(:[\d]{1,5})?(\/([\w#!:.?+=&%@!\-/])*)?$/),
    },
  ),
}), updateAva);

module.exports = users;
