const AppError = require('../utils/appError');

exports.validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) return next(new AppError(error.details[0].message, 400));
    next();
  };
};
