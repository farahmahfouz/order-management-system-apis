const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const hpp = require('hpp');
const xss = require('xss-clean');

const globalHandleMiddleware = require('./middlewares/errorMiddleware');
const AppError = require('./utils/appError');

const userRoutes = require('./routes/userRoute');
const itemRoutes = require('./routes/itemRoute');
const orderRoutes = require('./routes/orderRoute');
const reportRoutes = require('./routes/reportRoute');

const app = express();

app.use(express.json());

app.use(cors());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.use(cookieParser());

// app.use(mongoSanitize());
// app.use(xss());

app.use(
  hpp({
    whitelist: ['expiryDate', 'stockQuantity', 'category', 'price'],
  })
);

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/items', itemRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reports', reportRoutes);

app.use((req, res, next) => {
  next(
    new AppError(`Error Can't find ${req.originalUrl} on this server!`, 404)
  );
});

app.use(globalHandleMiddleware);

module.exports = app;
