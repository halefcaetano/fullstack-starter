const path=require('path');require('dotenv').config({path:path.join(__dirname,'..','.env')});require('dotenv').config();
const mongoose=require('mongoose');const Post=require('../models/Post');
(async()=>{try{
  const uri=process.env.MONGODB_URI||process.env.MONGO_URI||'mongodb://127.0.0.1:27017/fullstack';
  await mongoose.connect(uri,{});
  const doc=await Post.create({title:'Hello Analytics',content:'Testing views',author:'Anonymous'});
  console.log(doc._id.toString());
} catch(e){console.error(e);process.exit(1)} finally {await mongoose.disconnect();}})();
