// require('dotenv').config();

// console.log(process.env.NODE_ENV);
const express = require('express');

const helmet = require('helmet');

const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors, Segments } = require('celebrate');
const rateLimit = require('express-rate-limit');
const users = require('./routes/users');
const cards = require('./routes/cards');
const { login, createUser } = require('./controllers/users');

const auth = require('./middlewares/auth');

const { requestLogger, errorLogger } = require('./middlewares/logger');

// const NotFoundError = require('./errors/not-found-err');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});


// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 20,
// });

// app.use(limiter);
// app.use(helmet());

app.use(requestLogger);
// app.post('/signup', createUser);
// /*

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
// */

app.post('/signin', login);

app.use(auth);
app.use('/', users);
// app.use('/', celebrate({
//   [Segments.HEADERS]: Joi.object({
//     token: Joi.string().token().required(),
//   }).users,
// }));
app.use('/', cards);
// app.use('/', celebrate({
//   [Segments.HEADERS]: Joi.object({
//     token: Joi.string().token().required(),
//   }).cards,
// }));


app.use('*', (req, res) => {
  res.status(404).send({ message: 'Запрашиваемый ресурс не найден' });


  // throw new NotFoundError('Запрашиваемый ресурс не найден');
  // .catch(next);
});

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors());

app.use((err, req, res) => {
  console.log(`ERR-----------> ${err.statusCode}`);
  if (!err.statusCode) {
    const { statusCode = 500, message } = err;
    res
      .status(statusCode)
      .send({
        // проверяем статус и выставляем сообщение в зависимости от него
        message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
      });
  } else {
    res.status(err.statusCode).send({ message: err.message });
  }
});

module.exports = app;
