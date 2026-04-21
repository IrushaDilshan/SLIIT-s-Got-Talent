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
 * Judge Login - Request OTP
 * POST /api/auth/login
 * Send OTP to user's email for verification
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

    // Validate SLIIT email
    if (!/@(my\.)?sliit\.lk$/i.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Only @sliit.lk or @my.sliit.lk emails are allowed.',
      });
    }

    // Find user by email or create new user if doesn't exist
    let user = await User.findOne({ email });
    
    if (!user) {
      // Auto-create user with SLIIT email
      const name = email.split('@')[0]; // Use email prefix as name
      user = await User.create({
        name,
        email,
        password: require('crypto').randomBytes(16).toString('hex'), // Random password
        role: 'judge',
        isActive: true,
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated.',
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Log OTP in console for development (since email not configured)
    console.log(`\n✉️  OTP for ${email}: ${otp}`);
    console.log(`⏰ OTP expires in 10 minutes\n`);

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email. (Check server console in dev mode)',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login.',
      error: error.message,
    });
  }
};

/**
 * Verify OTP
 * POST /api/auth/verify
 * Verify OTP and generate JWT token
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

    // Find user and get OTP (which is hidden by default)
    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpiry) {
      return res.status(401).json({
        success: false,
        message: 'OTP not requested. Please request OTP first.',
      });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(401).json({
        success: false,
        message: 'OTP expired. Please request a new one.',
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP.',
      });
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate JWT token
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
    console.error('Verify error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during verification.',
      error: error.message,
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

