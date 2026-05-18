const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },

      price: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  waiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalCost: Number,
  status: {
    type: String,
    enum: ['cancelled', 'pending', 'completed', 'expired'],
    default: 'pending',
  },
  customerName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
