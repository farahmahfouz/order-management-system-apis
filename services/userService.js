const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getUserById = async (id) => {
  return await User.findById(id).select('+isVerified');
};

exports.getAllUsers = async (queryString) => {
  const features = new APIFeatures(User.find(), queryString)
      .filter()
      .sort()
      .limitFields()
      .pagination()
      .search();

  const users = await features.query;
  return users
};

exports.updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

exports.deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};
