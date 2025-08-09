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
    image: [String],
    role: {
      type: String,
      enum: ['super_admin', 'manager', 'cashier', 'waiter'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    changePasswordAt: Date,
    activationToken: String,
    activationTokenExpire: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', function (next) {
  if (!this.isModified('password') && !this.isNew) return next();
  this.changePasswordAt = Date.now() - 1000;
  next();
});


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
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

userSchema.methods.changedPasswordAfter = function (JWTTimesStamp) {
  if (this.changePasswordAt) {
    const changeTimeStamp = parseInt(
      this.changePasswordAt.getTime() / 1000,
      10
    );
    return JWTTimesStamp < changeTimeStamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
