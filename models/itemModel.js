const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: ['others', 'food', 'beverages'],
      required: true,
    },
    expiryDate: Date,
    stockQuantity: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    discountPrice: Number,
    excludeFromDiscount: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

itemSchema.index({ category: 1, price: 1, stockQuantity: 1 }); // compound index
itemSchema.index({ name: 'text', description: 'text' }); // search index
itemSchema.index({ expiryDate: 1 }); // for expiry filtering

itemSchema.virtual('totalStockValue').get(function () {
  return this.price * this.stockQuantity;
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
