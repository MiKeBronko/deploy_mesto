const express = require('express');

const helmet = require('helmet');

const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const users = require('./routes/users');
const cards = require('./routes/cards');
const { login, createUser } = require('./controllers/users');

const auth = require('./middlewares/auth');

const { requestLogger, errorLogger } = require('./middlewares/logger');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

app.use(limiter);
app.use(helmet());

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signup', celebrate({
  body: Joi.object().keys(
    {
      name: Joi.string().required().min(2).max(30),
      about: Joi.string().required().min(2).max(30),
      avatar: Joi.string().required().regex(/^(https?:\/\/)(www\.)?(([\w]{2,}([.-]+\w+)*\.[A-Za-z]{2,3})?|(\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3})?)?(:[\d]{1,5})?(\/([\w#!:.?+=&%@!\-/])*)?$/),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    },
  ),
}), createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys(
    {
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    },
  ),
}), login);

app.use(auth);
app.use('/', users);
app.use('/', cards);

app.use('*', (req, res) => {
  res.status(404).send({ message: 'Запрашиваемый ресурс не найден' });
});

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors());

app.use((err, req, res, next) => {
  if (err.statusCode) {
    res.status(err.statusCode).send({ message: err.message });
    return next(err);
    //
  }
  const { statusCode = 500, message } = err;
  return res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
    });
});

module.exports = app;
