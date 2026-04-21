/**
 * Authentication Controller
 * Handles judge login and registration
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

/**
 * Generate JWT token for user
 * @param {string} userId - User ID from database
 * @param {string} role - User role
 * @returns {string} JWT token valid for 7 days
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production_12345',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Generate random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Judge Login with OTP
 * POST /api/auth/login
 * Expects only email - generates and sends OTP
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
exports.login = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation: Check email is provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email.',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email not registered. Please contact an administrator.',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated.',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Update OTP fields directly (avoid full schema validation)
    await User.updateOne(
      { _id: user._id },
      { otp, otpExpires }
    );

    // In development, log OTP to console
    console.log(`📧 OTP for ${email}: ${otp}`);

    // Send OTP via email
    try {
      await sendEmail({
        email: email,
        subject: 'Your SLIIT Got Talent OTP Code',
        message: `Your One-Time Password (OTP) is: ${otp}\n\nThis OTP is valid for 10 minutes. Do not share this code with anyone.\n\nIf you didn't request this, please ignore this email.\n\n- SLIIT's Got Talent Voting Team`,
      });
      console.log(`✅ OTP email sent to ${email}`);
    } catch (emailError) {
      console.error(`⚠️  Failed to send email to ${email}:`, emailError.message);
      // Don't fail the login flow if email fails - still allow OTP entry
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please check your inbox or spam folder.',
      // NOTE: For development only - remove in production
      devOTP: otp,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('   Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Verify OTP and issue token
 * POST /api/auth/verify
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
exports.verify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP.',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if OTP exists and matches
    if (!user.otp || user.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP.',
      });
    }

    // Check if OTP has expired
    if (new Date() > user.otpExpires) {
      return res.status(401).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Clear OTP after successful verification (avoid full schema validation)
    await User.updateOne(
      { _id: user._id },
      { otp: null, otpExpires: null }
    );

    // Generate token
    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        panel: user.panel,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error('❌ Verify error:', error);
    console.error('   Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during verification.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Judge Register (Admin only)
 * POST /api/auth/register
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, panel, photo } = req.body;

    // Validation: Check all required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered.',
      });
    }

    // Create new judge
    const newJudge = await User.create({
      name,
      email,
      password,
      panel: panel || null,
      photo: photo || null,
      role: 'judge',
      isActive: true,
    });

    // Generate token
    const token = generateToken(newJudge._id, newJudge.role);

    return res.status(201).json({
      success: true,
      message: 'Judge registered successfully.',
      token,
      user: {
        id: newJudge._id,
        name: newJudge.name,
        email: newJudge.email,
        panel: newJudge.panel,
        photo: newJudge.photo,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle duplicate email error from MongoDB
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration.',
      error: error.message,
    });
  }
};

/**
 * Get Logged-In Judge Profile
 * GET /api/auth/profile
 * @param {object} req - Express request (requires auth)
 * @param {object} res - Express response
 */
exports.getProfile = async (req, res) => {
  try {
    // req.userId is set by authMiddleware
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        panel: user.panel,
        photo: user.photo,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching profile.',
      error: error.message,
    });
  }
};

module.exports = exports;

