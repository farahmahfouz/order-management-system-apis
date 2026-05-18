const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/userModel');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);

    console.log('MongoDB Connected');

    const existingAdmin = await User.findOne({
      email: 'super-admin@gmail.com',
    });

    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit();
    }

    const admin = await User.create({
      name: 'Farah Admin',
      email: 'super-admin@gmail.com',
      password: 'Test12345',
      role: 'super_admin',
      isVerified: true
    });

    console.log('Admin created successfully');
    console.log(admin);

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

seedAdmin();
