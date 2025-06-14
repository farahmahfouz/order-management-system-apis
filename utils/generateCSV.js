const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

const generateCSV = (orders, fileName = 'daily-report.csv') => {
  const formattedData = [];

  orders.forEach(order => {
    order.items.forEach(orderItem => {
      formattedData.push({
        orderId: order._id.toString(),
        itemName: orderItem.item?.name || 'Unknown',
        quantity: orderItem.quantity,
        price: orderItem.item?.price || 'N/A',
        date: new Date(order.createdAt).toLocaleDateString(),
      });
    });
  });

  // const fields = ['orderId', 'itemName', 'quantity', 'price', 'date'];
  const parser = new Parser();
  return parser.parse(formattedData);
};

module.exports = { generateCSV };