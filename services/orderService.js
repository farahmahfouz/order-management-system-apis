const mongoose = require('mongoose');
const Item = require('../models/itemModel');
const Order = require('../models/orderModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.createOrderService = async ({
  customerName,
  items,
  waiterId,
  cashierId,
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    let totalCost = 0;
    const orderItems = [];

    // 1. Fetch all items in ONE query (بدل loop queries)
    const itemIds = items.map((i) => i.item);

    const dbItems = await Item.find({
      _id: { $in: itemIds },
    }).session(session);

    // 2. Convert to Map for fast lookup
    const itemMap = new Map(
      dbItems.map((item) => [item._id.toString(), item])
    );

    // 3. Validate + process items
    for (const orderItem of items) {
      const item = itemMap.get(orderItem.item.toString());

      if (!item) {
        throw new AppError("Item not found", 404);
      }

      // validation
      const isExpired =
        item.expiryDate && item.expiryDate < new Date();

      const notEnoughStock =
        item.stockQuantity < orderItem.quantity;

      if (isExpired || notEnoughStock) {
        throw new AppError(
          "Item expired or insufficient stock",
          400
        );
      }

      // update in memory first
      item.stockQuantity -= orderItem.quantity;
      item.sold = (item.sold || 0) + orderItem.quantity;

      if (item.stockQuantity <= 0) {
        item.isAvailable = false;
      }

      const finalPrice = item.discountPrice ?? item.price;

      totalCost += finalPrice * orderItem.quantity;

      orderItems.push({
        item: item._id,
        quantity: orderItem.quantity,
        price: finalPrice,
      });
    }

    // 4. Save all items in parallel (more efficient)
    await Promise.all(
      dbItems.map((item) => item.save({ session }))
    );

    // 5. Create order
    const [order] = await Order.create(
      [
        {
          customerName,
          items: orderItems,
          waiter: waiterId,
          cashier: cashierId,
          totalCost,
        },
      ],
      { session }
    );

    // 6. Commit transaction ASAP (important)
    await session.commitTransaction();
    session.endSession();

    // 7. Populate after commit (outside transaction = lighter)
    const populatedOrder = await Order.findById(order._id)
      .populate("cashier", "name")
      .populate("waiter", "name")
      .populate("items.item", "name price");

    return populatedOrder;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

exports.updateOrderService = async (orderId, body, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedOrderItems = [];
    const bulkUpdates = [];
    let newTotalCost = 0;

    const order = await Order.findById(orderId).session(session);
    if (!order) throw new AppError('Order not found', 404);

    if (order.status !== 'pending') {
      throw new AppError('Only pending orders can be updated', 400);
    }

    const { items: newItems } = body;

    const oldItemIds = order.items.map((itemObj) => itemObj.item);
    const newItemIds = newItems.map((itemObj) => itemObj.item);
    const allItemIds = [
      ...new Set([...oldItemIds, ...newItemIds].map((id) => id.toString())),
    ];

    const itemsFromDb = await Item.find({ _id: { $in: allItemIds } }).session(
      session,
    );

    if (itemsFromDb.length !== allItemIds.length) {
      throw new AppError('One or more items not found', 404);
    }

    const itemMap = new Map(
      itemsFromDb.map((item) => [item._id.toString(), item]),
    );

    // 1. Restore old items' stock
    for (const oldItem of order.items) {
      const item = itemMap.get(oldItem.item.toString());
      if (item) {
        bulkUpdates.push({
          updateOne: {
            filter: { _id: item._id },
            update: { $inc: { stockQuantity: oldItem.quantity } },
          },
        });
      }
    }

    // 2. Subtract new items' stock
    for (const newItem of newItems) {
      const item = itemMap.get(newItem.item.toString());
      if (!item) throw new AppError('Item not found', 404);

      if (item.stockQuantity < newItem.quantity) {
        throw new AppError(`Not enough stock for item ${item.name}`, 400);
      }

      bulkUpdates.push({
        updateOne: {
          filter: { _id: item._id },
          update: { $inc: { stockQuantity: -newItem.quantity } },
        },
      });

      const finalPrice = item.discountPrice ?? item.price;

      newTotalCost += finalPrice * newItem.quantity;

      updatedOrderItems.push({
        item: item._id,
        quantity: newItem.quantity,
        price: finalPrice,
      });
    }

    // 3. Apply stock updates
    await Item.bulkWrite(bulkUpdates, { session });

    // 4. Update order
    order.items = updatedOrderItems;
    order.totalCost = newTotalCost;
    await order.save({ session });

    // 5. Commit
    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

exports.markOrderCompleteService = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  const invalidStatuses = ['cancelled', 'expired', 'completed'];

  if (invalidStatuses.includes(order.status)) {
    throw new AppError(`Order already ${order.status}`, 400);
  }

  order.status = 'completed';

  await order.save();

  return order;
};

exports.getAllOrderService = async (queryString) => {
  const features = new APIFeatures(Order.find(), queryString)
    .filter()
    .sort()
    .limitFields()
    .pagination()
    .search();

  const orders = await features.query
    .populate('cashier', 'name email')
    .populate('waiter', 'name email')
    .populate('items.item', 'name price');

  return orders;
};

exports.getOneOrderService = async (id) => {
  return await Order.findById(id)
    .populate('items.item', 'name category price ')
    .populate('waiter', 'name')
    .populate('cashier', 'name');
};

exports.cancelOrderService = async (id) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(id)
      .populate('items.item')
      .session(session);

    if (!order) throw new AppError('Order not found', 404);
    if (order.status === 'cancelled') return order;

    for (const orderItem of order.items) {
      const item = orderItem.item;
      await Item.findByIdAndUpdate(
        item._id,
        {
          $inc: {
            stockQuantity: orderItem.quantity,
            sold: -orderItem.quantity,
          },
        },
        { session },
      );
    }

    order.status = 'cancelled';
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};
