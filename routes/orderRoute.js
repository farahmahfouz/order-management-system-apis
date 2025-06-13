const { Router } = require('express');
const router = Router();

const {
  createOrder,
  markOrderComplete,
  getAllOrders,
  cancelOrder,
  updateOrder,
} = require('../controllers/orderController');
const { auth, restrictTo } = require('../middlewares/authMiddleware');

router.use(auth, restrictTo('cashier', 'super-admin', 'manager'));

router.post('/', createOrder);

router.patch('/:id', updateOrder);

router.patch('/:id/complete', markOrderComplete);

router.get('/', getAllOrders);

router.patch('/:id/cancel', cancelOrder);

module.exports = router;
