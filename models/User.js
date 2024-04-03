const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_icon: {type: String},
  name: { type: String },
  username: { type: String },
  bio: { type: String },
  email: { type: String },
  password: { type: String },
  userType: { type: String, enum: ['owner', 'rater'] },
  following: { type: Array },
  followers: { type: Array },
  favoriteplace: { type: Array },
  createdreview: [{
    place_name: { type: String },
    review_title: { type: String },
    review_photo: {type: String}
  }]
},{ versionKey: false });
  
// user model
const userModel = mongoose.model('user', userSchema);

module.exports = userModel;

// TO USE IN APP.JS:
// same syntax as modules
// const userModel = require('./model/User')