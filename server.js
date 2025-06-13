require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception', err);
  process.exit(1);
});

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log('Connected with database server');
    // await notifyAboutExpiringItems();
    // await expirePendingOrders();
    // await applyAutoDiscount();
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log('Failed to connect with MongoDB', err);
  });
