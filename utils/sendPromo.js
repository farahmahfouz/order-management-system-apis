const Email = require('../utils/email');
const User = require('../models/userModel');

exports.sendPromoToAdmins = async (messages) => {
  const admins = await User.find({ role: { $in: ['super_admin', 'manager'] } });

  const subject = '🔥 New Promo Messages for a Food Item';

  for (const admin of admins) {
    const email = new Email(admin, '#');
    await email.send('promoMessage', subject, {
      messages,
    });
  }
};
