const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const itemService = require('../services/itemService');
const Item = require('../models/itemModel');
const fs = require('fs');
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const { generatePromoMessages } = require('../services/aiService');
const { sendPromoToAdmins } = require('../utils/sendPromo');

exports.createItem = catchAsync(async (req, res, next) => {
  const item = await itemService.createItem(req.body);
  if (item.category === 'food' && item.price >= 200) {
    const promos = await generatePromoMessages(item.name, item.price);
    await sendPromoToAdmins(promos);
  }
  res.status(201).json({ status: 'success', data: { item } });
});

exports.getBestSeller = catchAsync(async (req, res, next) => {
  const bestItems = await Item.find().sort({ sold: -1 }).limit(6);
  res.status(200).json({
    status: 'success',
    result: bestItems.length,
    data: { items: bestItems },
  });
});

exports.getAllItems = catchAsync(async (req, res, next) => {
  const role = req.user.role;
  const items = await itemService.getAllItems(role, req.query);

  if (!items || items.length === 0) {
    return next(new AppError('Items not found', 404));
  }

  const totalCount = await Item.countDocuments();

  res.status(200).json({
    status: 'success',
    result: items.length,
    allCounts: totalCount,
    data: { items },
  });
});

exports.getOneItem = catchAsync(async (req, res, next) => {
  const item = await itemService.getOneItem(req.params.id);
  if (!item) return next(new AppError('Item not found', 404));

  res.status(200).json({
    status: 'success',
    data: { item },
  });
});

exports.updateItem = catchAsync(async (req, res, next) => {
  const item = await itemService.updateItem(req.params.id, req.body);
  if (!item) return next(new AppError('Item not found', 404));

  res.status(200).json({
    status: 'success',
    data: { item },
  });
});

exports.deleteItem = catchAsync(async (req, res, next) => {
  const item = await itemService.softDeleteItem(req.params.id);
  if (!item) return next(new AppError('Item not found', 404));

  res.status(200).json({
    status: 'success',
    data: { item },
  });
});

exports.getDiscountItems = catchAsync(async (req, res, next) => {
  const items = await itemService.getDiscountedItemsService();
  res.status(200).json({
    status: 'success',
    result: items.length,
    data: {
      items,
    },
  });
});

exports.exportItems = catchAsync(async (req, res, next) => {
  const items = await Item.find();
  const fields = ['id', 'name', 'description', 'price', 'stockQuantity'];
  const parser = new Parser({ fields });
  const csv = parser.parse(items);

  res.header('Content-Type', 'text/csv');
  res.attachment('items.csv');
  res.send(csv);
});

exports.importItems = catchAsync(async (req, res, next) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        for (const row of results) {
          const {
            id,
            name,
            description,
            price,
            category,
            expiryDate,
            stockQuantity,
            isAvailable,
          } = row;

          const itemData = {
            name,
            description,
            price: parseFloat(price),
            category: category || 'others',
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            stockQuantity: parseInt(stockQuantity),
            isAvailable: isAvailable === 'true' || isAvailable === '1',
          };

          if (id) {
            const existingItem = await Item.findById(id);
            if (existingItem) {
              await Item.findByIdAndUpdate(id, itemData, {
                new: true,
                runValidators: true,
              });
            } else {
              await Item.create(itemData);
            }
          } else {
            await Item.create(itemData);
          }
        }

        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });

        res.status(200).json({
          status: 'success',
          message: 'Items imported successfully',
          total: results.length,
        });
      } catch (err) {
        next(err);
      }
    });
});
