const cron = require('node-cron');
const Item = require('../models/itemModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Email = require('../utils/email');
const dayjs = require('dayjs');

cron.schedule('0 * * * *', async () => {
  console.log('🔁 Running cron jobs every hour...');

  await notifyAboutExpiringItems();
  await expirePendingOrders();
  await applyAutoDiscount();
});

const notifyAboutExpiringItems = async () => {
  const today = dayjs().startOf('day');
  const in5Days = today.add(5, 'day');

  const expiryToday = await Item.find({
    expiryDate: {
      $gte: today.toDate(),
      $lt: today.add(1, 'day').toDate(),
    },
  });

  const expirySoon = await Item.find({
    expiryDate: {
      $gte: in5Days.startOf('day').toDate(),
      $lt: in5Days.add(1, 'day').startOf('day').toDate(),
    },
  });

  console.log('📆 Items expiring TODAY:', expiryToday.length);
  expiryToday.forEach((item) => {
    console.log(
      `🔴 TODAY - ${item.name} | Qty: ${item.stockQuantity} | Exp: ${item.expiryDate}`
    );
  });

  console.log('📆 Items expiring IN 5 DAYS:', expirySoon.length);
  expirySoon.forEach((item) => {
    console.log(
      `🟠 IN 5 DAYS - ${item.name} | Qty: ${item.stockQuantity} | Exp: ${item.expiryDate}`
    );
  });

  const admins = await User.find({ role: { $in: ['super_admin', 'manager'] } });

  for (const admin of admins) {
    const email = new Email(admin);
    if (expirySoon.length) {
      await email.send('expiryNotification', 'Items expiring in 5 days', {
        items: expirySoon,
      });
    }

    if (expiryToday.length) {
      await email.send('expiryNotification', 'Items expiring today', {
        items: expiryToday,
      });
    }
  }
};

const expirePendingOrders = async () => {
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

  const result = await Order.updateMany(
    {
      status: 'pending',
      createdAt: { $lte: fourHoursAgo },
    },
    { status: 'expired' }
  );

  console.log(`⏳ Expired ${result.modifiedCount} old pending orders`);
};

const applyAutoDiscount = async () => {
  const now = dayjs();
  const in20Days = now.add(20, 'day').endOf('day');

  const items = await Item.find({
    expiryDate: { $lte: in20Days.toDate() },
    excludeFromDiscount: { $ne: true },
  });

  const updatedItems = [];

  for (const item of items) {
    const originalPrice = item.price;
    const discounted = +(originalPrice * 0.75).toFixed(2);

    // Update only if discount is not already applied
    if (item.discountPrice !== discounted) {
      item.discountPrice = discounted;

      updatedItems.push({
        name: item.name,
        expiryDate: dayjs(item.expiryDate).format('YYYY-MM-DD'),
        originalPrice,
        discountedPrice: discounted,
      });
    }
    
    item.excludeFromDiscount = true;

    await item.save();
  }

  if (updatedItems.length > 0) {
    const admins = await User.find({
      role: { $in: ['super_admin', 'manager'] },
    });

    for (const admin of admins) {
      const email = new Email(admin);
      await email.send('discountedItems', '🟢 Items Discounted Automatically', {
        items: updatedItems,
      });
    }

    console.log(`✅ Applied discount to ${updatedItems.length} items`);
  } else {
    console.log('✅ No items needed discount');
  }
};

module.exports = {
  notifyAboutExpiringItems,
  expirePendingOrders,
  applyAutoDiscount,
};
