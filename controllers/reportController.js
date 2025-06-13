const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const { Parser } = require('json2csv');

exports.getSalesReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, waiter, export: exportData, format } = req.query;

  const userRole = req.user.role;
  const userId = req.user.id;

  const match = {
    status: 'completed',
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  if (userRole === 'waiter') {
    match.waiter = mongoose.Types.ObjectId(userId);
  }

  if (waiter && userRole !== 'waiter') {
    const waiters = await User.find({
      role: 'waiter',
      name: { $regex: waiter, $options: 'i' },
    }).select('_id');
    match.waiter = { $in: waiters.map((m) => m._id) };
  }

  const report = await Order.aggregate([
    { $match: match },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'items',
        localField: 'items.item',
        foreignField: '_id',
        as: 'itemDetails',
      },
    },
    { $unwind: '$itemDetails' },
    {
      $group: {
        _id: '$waiter',
        totalItemsSold: { $sum: '$items.quantity' },
        revenue: {
          $sum: { $multiply: ['$items.quantity', '$items.price'] },
        },
        categories: {
          $push: {
            category: '$itemDetails.category',
            quantity: '$items.quantity',
            price: '$items.price',
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'waiter',
      },
    },
    {
      $addFields: {
        waiter: { $arrayElemAt: ['$waiter.name', 0] },
      },
    },
  ]);

  // Calculate commission
  const result = report.map((entry) => {
    const categoryStats = {};
    let commission = 0;

    for (const item of entry.categories) {
      const cat = item.category;
      const qty = item.quantity;
      const price = item.price;
      const subtotal = qty * price;

      categoryStats[cat] = (categoryStats[cat] || 0) + qty;

      let rate = 0;
      if (cat === 'others') rate = 0.0025;
      else if (cat === 'food') rate = 0.01;
      else if (cat === 'beverages') rate = 0.005;

      commission += subtotal * rate;
    }
    return {
      waiter: entry.waiter,
      totalItemsSold: entry.totalItemsSold,
      revenue: entry.revenue.toFixed(2),
      categoryBreakdown: categoryStats,
      totalCommission: isNaN(commission) ? '0.00' : commission.toFixed(2),
    };
  });
  if (exportData === 'true' && format === 'csv') {
    const parser = new Parser();
    const csv = parser.parse(result);
    res.header('Content-Type', 'text/csv');
    res.attachment('sales-report.csv');
    return res.send(csv);
  }

  res.status(200).json({
    status: 'success',
    results: result.length,
    data: result,
  });
});
