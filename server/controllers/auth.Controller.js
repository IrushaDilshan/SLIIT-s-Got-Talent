const User = require('../models/User');

// @desc    Register/Login user with OTP
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    res.status(200).json({ message: 'Login User' });
};

// @desc    Verify OTP
// @route   POST /api/auth/verify
// @access  Public
exports.verifyOTP = async (req, res) => {
    res.status(200).json({ message: 'Verify OTP' });
};
