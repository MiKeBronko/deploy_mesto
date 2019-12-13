const { celebrate, Joi } = require('celebrate');

const cards = require('express').Router();

const {
  getCard, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

cards.get('/cards', getCard);
cards.post('/cards', celebrate({
  body: Joi.object().keys(
    {
      name: Joi.string().required().min(2).max(30),
      link: Joi.string().required().regex(/^(https?:\/\/)(www\.)?(([\w]{2,}([.-]+\w+)*\.[A-Za-z]{2,3})?|(\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3})?)?(:[\d]{1,5})?(\/([\w#!:.?+=&%@!\-/])*)?$/),
    },
  ),
}), createCard);
cards.delete('/cards/:cardId', deleteCard);
cards.put('/cards/:cardId/likes', likeCard);
cards.delete('/cards/:cardId/likes', dislikeCard);
module.exports = cards;
