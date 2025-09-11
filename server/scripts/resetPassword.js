const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = 'halef.caetano@hotmail.com';
    const newPassword = 'haleff';

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('No user with that email.');
      process.exit(0);
    }

    user.password = newPassword; // will be hashed by pre('save')
    await user.save();

    console.log('✅ Password reset for', email);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error resetting password:', err);
    process.exit(1);
  }
})();
