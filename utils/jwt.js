const jwt = require('jsonwebtoken');

exports.signToken = (id) => {
  console.log('SIGN SECRET:', process.env.JWT_SECRET);

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '50d',
  });
};

