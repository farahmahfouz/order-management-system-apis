const mongoose = require('mongoose');
const Item = require('../models/itemModel');
const Order = require('../models/orderModel');
const AppError = require('../utils/appError');

exports.createOrderService = async ({
  customerName,
  items,
  waiterId,
  cashierId,
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalCost = 0;

    for (const orderItem of items) {
      const item = await Item.findById(orderItem.item).session(session);
      if (!item) throw new AppError('Item not found', 404);

      if (
        (item.expiryDate && item.expiryDate < new Date()) ||
        item.stockQuantity < orderItem.quantity
      ) {
        throw new AppError('Item expired or insufficient stock', 400);
      }

      item.stockQuantity -= orderItem.quantity;
      await item.save({ session });

      totalCost += item.price * orderItem.quantity;
    }

    const [order] = await Order.create(
      [
        {
          customerName,
          items,
          waiter: waiterId,
          cashier: cashierId,
          totalCost,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const populatedOrder = await Order.findById(order._id)
      .populate('cashier', 'name')
      .populate('waiter', 'name')
      .populate('items.item', 'name price');

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
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new AppError('Order not found', 404);

    if (order.status !== 'pending') {
      throw new AppError('Only pending orders can be updated', 400);
    }

    const { items: newItems } = body;

    const oldItemIds = order.items.map((itemObj) => itemObj.item);
    const newItemIds = newItems.map((itemObj) => itemObj.item);
    const allItemIds = [...new Set([...oldItemIds, ...newItemIds].map((id) => id.toString()))];

    const itemsFromDb = await Item.find({ _id: { $in: allItemIds } }).session(session);

    if (itemsFromDb.length !== allItemIds.length) {
      throw new AppError('One or more items not found', 404);
    }

    const itemMap = new Map(
      itemsFromDb.map((item) => [item._id.toString(), item])
    );

    const bulkUpdates = [];
    let newTotalCost = 0;

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

      newTotalCost += item.price * newItem.quantity;
    }

    // 3. Apply stock updates
    await Item.bulkWrite(bulkUpdates, { session });

    // 4. Update order
    order.items = newItems;
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
  return await Order.findByIdAndUpdate(
    orderId,
    { status: 'completed' },
    { new: true }
  );
};

exports.getAllOrderService = async () => {
  return await Order.find()
    .populate('cashier', 'name')
    .populate('waiter', 'name')
    .populate('items.item', 'name price');
};

exports.cancelOrderService = async (id) => {
  return await Order.findByIdAndUpdate(
    id,
    { status: 'cancelled' },
    { new: true }
  );
};
