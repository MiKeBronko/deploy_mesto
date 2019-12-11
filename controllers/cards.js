const Card = require('../models/card');

const NotFoundError = require('../errors/not-found-err');
const Forbidden = require('../errors/forbidden');
// const ErrReq = require('../errors/err-req');

const handlefindError = () => {
  throw new NotFoundError('Нет карточки с таким id');
};

module.exports.getCard = (req, res) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ data: cards }))
    .catch((err) => res.status(500).send({ message: err.message }));
};


module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((cards) => res.send({ data: cards }))
    // .catch((err) => res.status(500).send({ message: err.message }));
    .catch(next);
};

/**----------------------------*/
module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .populate('owner')
    .then((card) => {
      if (!card) {
      // return res.status(404).send({ message: 'Карточка с таким Id не найдена' });
        // throw new NotFoundError('Нет карточки с таким id');
        return handlefindError();
      }
      if (JSON.stringify(req.user._id) === JSON.stringify(card.owner._id)) {
        return Card.findByIdAndRemove(req.params.cardId)
          .then((dataCard) => res.send({ data: dataCard }));
      }
      // return res.status(403).send({ message: 'Вы не можете удалить чужую карточку' });
      throw new Forbidden('Вы не можете удалить чужую карточку');
    })
    // .catch((err) => res.status(500).send({ message: err.message }));
    .catch(next);
};


module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        // return res.status(404).send({ message: 'Карточка с таким Id не найдена' });
        // throw new NotFoundError('Нет карточки с таким id');
        return handlefindError();
      }
      return res
        .status(200)
        .send({ card });
    })
    // .catch((err) => res.status(500).send({ message: err.message }));
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        // return res.status(404).send({ message: 'Карточка с таким Id не найдена' });
        return handlefindError();
      }
      return res
        .send({ card });
    })
    // .catch((err) => res.status(500).send({ message: err.message }));
    .catch(next);
};
