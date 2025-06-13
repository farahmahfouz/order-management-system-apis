const catchAsync = require('../utils/catchAsync');
const {
  createOrderService,
  getAllOrderService,
  markOrderCompleteService,
  cancelOrderService,
  updateOrderService 
} = require('../services/orderService');
const AppError = require('../utils/appError');


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
  const orders = await getAllOrderService();
  if (!orders) return next(new AppError('Orders not found', 404));
  res.status(200).json({
    status: 'success',
    result: orders.length,
    data: { orders },
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
