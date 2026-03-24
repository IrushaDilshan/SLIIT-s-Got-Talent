const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-otp -otpExpires').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.role = req.body.role;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createJudge = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const sliitEmailRegex = /@(my\.)?sliit\.lk$/;
    if (!sliitEmailRegex.test(email)) {
      return res.status(400).json({ message: 'Must be a valid @sliit.lk or @my.sliit.lk email' });
    }
    
    let user = await User.findOne({ email });
    if (user) {
      user.role = 'judge';
      await user.save();
      return res.json(user);
    }
    
    user = await User.create({ email, role: 'judge' });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const generateOtpForUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate an OTP that lasts for 24 hours so judges have time
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 24 * 60 * 60 * 1000; 
    
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
    
    res.json({ message: 'OTP Generated successfully', otp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUsers, updateUserRole, deleteUser, createJudge, generateOtpForUser };
