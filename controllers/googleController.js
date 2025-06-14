const { google } = require('googleapis');
const GoogleToken = require('../models/googleTokenModel');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

exports.googleAuth = (req, res) => {
  console.log('➡️ Reached googleAuth');
  const scopes = [
    'https://www.googleapis.com/auth/drive.file', // لرفع ملفات على Drive
    'https://www.googleapis.com/auth/calendar.events', // لإضافة أحداث لـ Google Calendar
    'https://www.googleapis.com/auth/userinfo.email', // للحصول على إيميل المستخدم
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  res.redirect(authUrl);
};

exports.googleCallback = async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    const expiresIn = tokens.expiry_date;

    const axios = require('axios');
    const userInfo = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userEmail = userInfo.data.email;

    const tokenData = {
      userEmail,
      accessToken,
      refreshToken,
      expiryDate: expiresIn || Date.now() + 3600 * 1000,
    };

    await GoogleToken.findOneAndUpdate(
      { userEmail: tokenData.userEmail },
      tokenData,
      { upsert: true, new: true }
    );

    console.log('✅ Access Token:', accessToken);
    console.log('🔁 Refresh Token:', refreshToken);
    console.log('👤 Email:', userEmail);

    res.send('Google account connected and token saved successfully!');
  } catch (err) {
    console.error('❌ Error getting Google tokens or saving them:', err);
    res.status(500).send('Authentication error');
  }
};

const getOAuth2Client = async (userEmail) => {
  const token = await GoogleToken.findOne({ userEmail });
  if (!token) throw new Error('No token found for user');

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    expiry_date: token.expiryDate,
  });

   return oauth2Client;
};

exports.getDriveClient = async (userEmail) => {
  const auth = await getOAuth2Client(userEmail);
  return google.drive({ version: 'v3', auth });
};

exports.getCalendarClient = async (userEmail) => {
  const auth = await getOAuth2Client(userEmail);
  return google.calendar({ version: 'v3', auth });
};