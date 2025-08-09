const User = require('../models/userModel');

exports.getUserById = async (id) => {
  return await User.findById(id).select('+isVerified');
};

exports.getAllUsers = async (role) => {
  const filter = role ? { role } : {};
  return await User.find(filter);
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
