const express = require('express');
const router = express.Router();
const { googleAuth, googleCallback, googleStats } = require('../controllers/googleController');
const { auth, restrictTo } = require('../middlewares/authMiddleware');

router.get('/auth/google', googleAuth);
router.get('/oauth2callback', googleCallback);
router.get(
  '/google/status',
  auth,
  restrictTo('super_admin', 'manager'),
  googleStats
);
// alias for older clients
router.get(
  '/google-status',
  auth,
  restrictTo('super_admin', 'manager'),
  googleStats
);

module.exports = router;
