const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const userService = require('../services/userService');

const filterObj = (obj, ...allowedField) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedField.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getOneUser = catchAsync(async (req, res, next) => {
  const user = await userService.getUserById(req.user.id);
  if (!user) next(new AppError('User not found', 404));
  res.status(200).json({ status: 'success', data: { user } });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await userService.getAllUsers(req.query.role);
  if (!users || users.length === 0) {
    next(new AppError('No users found', 404));
  }
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'role', 'email');
  const updatedUser = await userService.updateUser(req.params.id, filteredBody);
  if (!updatedUser) throw new AppError('No user found', 404);
  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await userService.deleteUser(req.params.id);
  if (!user) throw new AppError('No user found', 404);
  res.status(204).json({ status: 'success', data: null });
});
