const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = 'halef.caetano@hotmail.com';
    const candidate = 'haleff';

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('NOT FOUND');
      process.exit(0);
    }

    console.log('FOUND user _id=', user._id.toString());
    console.log('Hashed password length:', user.password?.length);

    const ok = await bcrypt.compare(candidate, user.password);
    console.log('bcrypt.compare result:', ok);

    process.exit(0);
  } catch (e) {
    console.error('DEBUG ERROR:', e);
    process.exit(1);
  }
})();
