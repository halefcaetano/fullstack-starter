const path=require('path');
require('dotenv').config({ path: path.join(__dirname,'..','.env') });
require('dotenv').config();
const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const User=require('../models/User');
const Post=require('../models/Post');

(async()=>{ 
  try {
    const uri=process.env.MONGODB_URI||process.env.MONGO_URI||'mongodb://127.0.0.1:27017/fullstack';
    await mongoose.connect(uri,{});
    const suffix=Date.now();
    const email=`seed${suffix}@test.com`;
    const username=`seeduser${suffix}`;
    const passwordPlain='secret123';
    const password=await bcrypt.hash(passwordPlain,10);

    let user=await User.create({ email, username, name:'Seed User', password });
    const post=await Post.create({ title:'Hello Analytics', content:'Testing views', author:user._id });

    console.log(JSON.stringify({ postId: post._id.toString(), email, username, password: passwordPlain }));
  } catch(e) {
    console.error(e);
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(()=>{});
  }
})();
