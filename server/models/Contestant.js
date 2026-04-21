/**
 * Contestant Model
 * Stores contestant information for judging
 */

const mongoose = require('mongoose');

const contestantSchema = new mongoose.Schema(
  {
    // Contestant name
    name: {
      type: String,
      required: [true, 'Contestant name is required'],
      trim: true,
      maxlength: 100,
    },

    // Performance category (e.g., "Dance", "Singing", "Comedy", "Magic")
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },

    // Competition round (e.g., "Preliminary", "Semi-Final", "Final")
    round: {
      type: String,
      required: [true, 'Round is required'],
      enum: ['Preliminary', 'Semi-Final', 'Final'],
    },

    // Title of the performance
    performanceTitle: {
      type: String,
      required: [true, 'Performance title is required'],
      trim: true,
    },

    // Contestant photo URL
    photo: {
      type: String,
      required: [true, 'Photo URL is required'],
    },

    // Status of contestant
    status: {
      type: String,
      enum: ['pending', 'performed', 'disqualified'],
      default: 'pending',
    },

    // Time slot (e.g., "09:00 AM", "10:30 AM")
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },

    // Reference to contestant ID (for frontend compatibility)
    contestantId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Contestant registration number
    regNumber: {
      type: String,
      trim: true,
    },

    // Contact information
    contactNumber: {
      type: String,
      trim: true,
    },

    // Created and updated timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries on round and status
contestantSchema.index({ round: 1, status: 1 });

module.exports = mongoose.model('Contestant', contestantSchema);
