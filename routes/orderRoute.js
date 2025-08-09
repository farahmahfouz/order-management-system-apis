const { Router } = require('express');
const router = Router();

const {
  createOrder,
  markOrderComplete,
  getAllOrders,
  cancelOrder,
  updateOrder,
  getOrderById,
  getTodayOrders
} = require('../controllers/orderController');
const { auth, restrictTo } = require('../middlewares/authMiddleware');

router.use(auth, restrictTo('cashier', 'super_admin', 'manager'));

router.get('/sales', getTodayOrders);

router.post('/', createOrder);

router.patch('/:id', updateOrder);

router.get('/:id', getOrderById)

router.patch('/:id/complete', markOrderComplete);

router.get('/', getAllOrders);

router.patch('/:id/cancel', cancelOrder);

module.exports = router;
