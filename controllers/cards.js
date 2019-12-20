const Card = require('../models/card');

const NotFoundError = require('../errors/not-found-err');
const Forbidden = require('../errors/forbidden');

const handlefindError = () => {
  throw new NotFoundError('Нет карточки с таким id');
};

module.exports.getCard = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((cards) => {
      if (!cards) {
        throw new NotFoundError('Нет карточек');
      }
      return res.send({ data: cards });
    })
    .catch(next);
};


module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((cards) => {
      if (!cards) {
        throw new NotFoundError('Нет данных');
      }
      return res.send({ data: cards });
    })
    .catch(next);
};

/**----------------------------*/
module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .populate('owner')
    .then((card) => {
      if (!card) {
        return handlefindError();
      }
      if (card.owner._id.equals(req.user._id)) {
        return Card.findByIdAndRemove(req.params.cardId)
          .then((dataCard) => res.send({ data: dataCard }));
      }
      throw new Forbidden('Вы не можете удалить чужую карточку');
    })
    .catch(next);
};


module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return handlefindError();
      }
      return res
        .status(200)
        .send({ card });
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return handlefindError();
      }
      return res
        .send({ card });
    })
    .catch(next);
};
