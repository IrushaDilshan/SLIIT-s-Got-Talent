/**
 * Authentication Controller
 * Handles judge login and registration
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

/**
 * Generate JWT token for user
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
 */
exports.login = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email.',
      });
    }

    email = email.trim().toLowerCase();

    if (!/@(my\.)?sliit\.lk$/i.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Only @sliit.lk or @my.sliit.lk emails are allowed.',
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const name = email.split('@')[0];

      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(16).toString('hex'),
        role: 'judge',
        isActive: true,
      });
    }

    if (!user.name || !user.name.trim()) {
      user.name = email.split('@')[0];
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated.',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendEmail({
      to: email,
      subject: 'SLIIT Got Talent - Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; margin-bottom: 10px;">SLIIT Got Talent</h2>
          <p style="color: #374151; font-size: 15px;">Hello ${user.name},</p>
          <p style="color: #374151; font-size: 15px;">
            Your OTP code for login is:
          </p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background: #eff6ff; padding: 16px; text-align: center; border-radius: 10px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #374151; font-size: 14px;">
            This OTP will expire in <strong>10 minutes</strong>.
          </p>
          <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">
            If you did not request this code, please ignore this email.
          </p>
        </div>
      `,
      text: `Hello ${user.name}, Your OTP for SLIIT Got Talent login is ${otp}. It expires in 10 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email.',
    });
  } catch (error) {
    console.error('LOGIN FULL ERROR:', error);
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
 */
exports.verify = async (req, res) => {
  try {
    let { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP.',
      });
    }

    email = email.trim().toLowerCase();
    otp = String(otp).trim();

    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (!user.name || !user.name.trim()) {
      user.name = email.split('@')[0];
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(401).json({
        success: false,
        message: 'OTP not requested. Please request OTP first.',
      });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(401).json({
        success: false,
        message: 'OTP expired. Please request a new OTP.',
      });
    }

    if (user.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP.',
      });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

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
    console.error('VERIFY FULL ERROR:', error);
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
 */
exports.register = async (req, res) => {
  try {
    let { name, email, password, panel, photo } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    name = name.trim();
    email = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered.',
      });
    }

    const newJudge = await User.create({
      name,
      email,
      password,
      panel: panel || null,
      photo: photo || null,
      role: 'judge',
      isActive: true,
    });

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
    console.error('REGISTRATION FULL ERROR:', error);

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
 */
exports.getProfile = async (req, res) => {
  try {
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
    console.error('PROFILE FETCH ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching profile.',
      error: error.message,
    });
  }
};

module.exports = exports;