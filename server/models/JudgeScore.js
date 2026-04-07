const mongoose = require('mongoose');

const judgeScoreSchema = new mongoose.Schema({
  judgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contestantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contestant',
    required: true,
  },
  criteria: {
    creativity: {
      type: Number,
      required: true,
      min: 0,
      max: 25,
    },
    presentation: {
      type: Number,
      required: true,
      min: 0,
      max: 25,
    },
    skillLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 25,
    },
    audienceImpact: {
      type: Number,
      required: true,
      min: 0,
      max: 25,
    },
  },
  totalScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ['submitted', 'pending', 'revision'],
    default: 'submitted',
  },
  round: {
    type: String,
    enum: ['qualifier', 'semi-final', 'final'],
    default: 'semi-final',
  },
  notes: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Compound index to ensure one judge scores each contestant only once
judgeScoreSchema.index({ judgeId: 1, contestantId: 1, round: 1 }, { unique: true });

module.exports = mongoose.model('JudgeScore', judgeScoreSchema);
