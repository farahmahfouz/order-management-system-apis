const { Router } = require('express');
const router = Router();
const { auth, restrictTo } = require('../middlewares/authMiddleware');
const { getSalesReport } = require('../controllers/reportController');

router.get(
  '/sales-report',
  auth,
  restrictTo('super_admin', 'manager', 'cashier', 'waiter'),
  getSalesReport
);

module.exports = router;
