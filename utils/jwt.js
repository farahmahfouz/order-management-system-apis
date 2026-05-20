const jwt = require('jsonwebtoken');

exports.signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15d',
  });
};

exports.signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: '7d',
  });
};