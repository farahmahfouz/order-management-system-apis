const mongoose = require('mongoose');

const googleTokenSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  accessToken: String,
  refreshToken: String,
  expiryDate: Date,
});

const GoogleToken = mongoose.model('GoogleToken', googleTokenSchema);
module.exports = GoogleToken;
