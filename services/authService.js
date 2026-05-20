const AppError = require('../utils/appError');
const User = require('../models/userModel');
const crypto = require('crypto');

exports.registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser)
    throw new AppError('User with this email already exists', 409);

  const user = await User.create({ name, email, password, role });

  const activationToken = user.createEmailActivationToken();

  await user.save({ validateBeforeSave: false });

  return { user, activationToken };
};

exports.loginUser = async ({ email }) => {
  return await User.findOne({ email }).select('+password');
};

exports.activateUserAccount = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    activationToken: hashedToken,
    activationTokenExpire: { $gt: Date.now() },
  });

  if (!user) return null;

  user.isVerified = true;
  user.activationToken = undefined;
  user.activationTokenExpire = undefined;
  await user.save({ validateBeforeSave: false });

  return user;
};

exports.generateResetTokenAndSend = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return { user: null, resetToken: null };

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  return { user, resetToken };
};

exports.resetUserPassword = async (token, password) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return null;

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return user;
};