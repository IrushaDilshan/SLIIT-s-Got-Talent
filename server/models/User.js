/**
 * User Model - represents judges
 * Stores judge information including credentials and profile details
 */

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Judge name
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: 100,
    },

    // Email (unique identifier)
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },

    // Password (will be hashed before saving)
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default in queries
    },

    // Role: only "judge" for this dashboard
    role: {
      type: String,
      enum: ['judge', 'admin'],
      default: 'judge',
    },

    // Judge panel (e.g., "Panel A", "Panel B")
    panel: {
      type: String,
      trim: true,
    },

    // Judge photo URL
    photo: {
      type: String,
      default: null,
    },

    // Active status
    isActive: {
      type: Boolean,
      default: true,
    },

    // OTP fields for email-based authentication
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },

    // Account creation and update timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

/**
 * Hash password before saving
 * Only hash if password is new or modified
 */
userSchema.pre('save', async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare provided password with hashed password
 * @param {string} providedPassword - plaintext password to compare
 * @returns {Promise<boolean>} true if passwords match
 */
userSchema.methods.matchPassword = async function (providedPassword) {
  return await bcryptjs.compare(providedPassword, this.password);
};

/**
 * Remove sensitive data before sending response
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);

