const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['super_admin', 'manager', 'cashier', 'waiter'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    activationToken: String,
    activationTokenExpire: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods._createHashedToken = function (fieldPrefix) {
  // This is the token that will be sent to the user's email
  const rawToken = crypto.randomBytes(32).toString('hex');
  // This is the token that will be stored in the database
  this[`${fieldPrefix}Token`] = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');
  this[`${fieldPrefix}TokenExpire`] = Date.now() + 10 * 60 * 1000;
  return rawToken;
};

userSchema.methods.createEmailActivationToken = function () {
  return this._createHashedToken('activation');
};

userSchema.methods.createPasswordResetToken = function () {
  return this._createHashedToken('passwordReset');
};

userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
