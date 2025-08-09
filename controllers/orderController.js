const catchAsync = require('../utils/catchAsync');
const {
  createOrderService,
  getAllOrderService,
  markOrderCompleteService,
  cancelOrderService,
  updateOrderService,
  getOneOrderService,
} = require('../services/orderService');
const AppError = require('../utils/appError');
const Order = require('../models/orderModel');

exports.createOrder = catchAsync(async (req, res, next) => {
  const { customerName, items, waiterId } = req.body;

  const order = await createOrderService({
    customerName,
    items,
    waiterId,
    cashierId: req.user.id,
  });

  res.status(201).json({
    status: 'success',
    data: { order },
  });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  const updatedOrder = await updateOrderService(req.params.id, req.body, next);

  res.status(200).json({
    status: 'success',
    data: { order: updatedOrder },
  });
});

exports.markOrderComplete = catchAsync(async (req, res, next) => {
  const order = await markOrderCompleteService(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));

  res.status(200).json({
    status: 'success',
    data: { order },
  });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await getAllOrderService(req.query);
  if (!orders) return next(new AppError('Orders not found', 404));
  const totalCount = await Order.countDocuments();

  res.status(200).json({
    status: 'success',
    result: orders.length,
    allCounts: totalCount,
    data: { orders },
  });
});

exports.getTodayOrders = catchAsync(async (req, res, next) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const todayOrders = await Order.find({
    createdAt: { $gte: start, $lte: end },
    status: 'pending',
  });

  if (!todayOrders) return next(AppError('No Orders for today!', 404));

  res.status(200).json({
    status: 'success',
    data: { orders: todayOrders },
  });
});

exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await getOneOrderService(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));
  res.status(200).json({
    status: 'success',
    data: { order },
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await cancelOrderService(req.params.id);
  if (!order) throw new AppError('Order not found', 404);

  res.status(200).json({
    status: 'success',
    data: { order },
  });
});
