const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const authService = require('../services/authService');
const { signToken } = require('../utils/jwt');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const { user, activationToken } = await authService.registerUser({
    name,
    email,
    password,
    role,
  });

  const activationUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/activate-account/${activationToken}`;

  await new Email(user, activationUrl).send(
    'accountActivation',
    'Activate your account'
  );

  createSendToken(user, 201, res);
});

exports.activateAccount = catchAsync(async (req, res, next) => {
  const user = await authService.activateUserAccount(req.params.token);
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  res.send(`
  <html>
    <body style="text-align:center; font-family:sans-serif;">
      <h1>🎉 Account Activated!</h1>
      <p>You can now log in to your account.</p>
    </body>
  </html>
`);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await authService.loginUser({ email });
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.isVerified) {
    return next(
      new AppError('Please verify your email before logging in', 401)
    );
  }
  createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { user, resetToken } = await authService.generateResetTokenAndSend(
    req.body.email
  );

  if (!user)
    return next(new AppError('There is no user with this email address', 404));

  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/reset-password/${resetToken}`;
    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending email. Try again later!', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const user = await authService.resetUserPassword(
    req.params.token,
    req.body.password
  );
  if (!user) return next(new AppError('Token is invalid or has expired', 400));
  createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // 3) If correct, update password
  user.password = req.body.password;
  await user.save();

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
