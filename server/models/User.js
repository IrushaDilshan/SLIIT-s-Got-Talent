const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /@sliit\.lk$/, // Ensure SLIIT email
  },
  role: {
    type: String,
    enum: ['student', 'manager', 'admin'],
    default: 'student',
  },
  isVoted: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
