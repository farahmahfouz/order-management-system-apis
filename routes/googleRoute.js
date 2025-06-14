const express = require('express');
const router = express.Router();
const { googleAuth, googleCallback } = require('../controllers/googleController');

router.get('/auth/google', googleAuth);
router.get('/oauth2callback', googleCallback);

module.exports = router;
