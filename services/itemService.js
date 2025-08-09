const Item = require('../models/itemModel');
const ApiFeatures = require('../utils/apiFeatures');

exports.createItem = async ({
  name,
  price,
  category,
  expiryDate,
  stockQuantity,
  description,
  image
}) => {
  return await Item.create({
    name,
    price,
    category,
    expiryDate,
    description,
    stockQuantity,
    image
  });
};

exports.getDiscountedItemsService = async () => {
  const discountedItems = await Item.find({
    discountPrice: { $exists: true, $ne: null }
  })
    .limit(2)
    .sort({ createdAt: -1 });

  return discountedItems;
};

exports.getAllItems = async (role, queryParams) => {
  let query = Item.find();

  if (role === 'waiter') {
    query = Item.find({ expiryDate: { $gt: new Date() } });
  }

  const features = new ApiFeatures(query, queryParams)
    .filter()
    .search()
    .sort()
    .limitFields()
    .pagination();

  let items = await features.query;

  if (features.manualSortByTotalStock) {
    items = items.sort((a, b) => b.totalStockValue - a.totalStockValue);
  }

  return items;
};

exports.getOneItem = async (id) => {
  return await Item.findById(id);
};

exports.updateItem = async (id, data) => {
  return await Item.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

exports.softDeleteItem = async (id) => {
  return await Item.findByIdAndUpdate(id, { isAvailable: false });
};
