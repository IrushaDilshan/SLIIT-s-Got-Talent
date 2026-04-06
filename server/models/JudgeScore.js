/**
 * JudgeScore Model
 * Stores the scores submitted by judges for contestants
 * Ensures one judge cannot submit multiple times for same contestant in same round
 */

const mongoose = require('mongoose');

const judgeScoreSchema = new mongoose.Schema(
  {
    // Reference to the judge who submitted this score
    judgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Judge ID is required'],
    },

    // Reference to the contestant being scored
    contestantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contestant',
      required: [true, 'Contestant ID is required'],
    },

    // Round (Preliminary, Semi-Final, Final) - for context and uniqueness
    round: {
      type: String,
      enum: ['Preliminary', 'Semi-Final', 'Final'],
      required: [true, 'Round is required'],
    },

    // Creativity Score (0-25)
    creativity: {
      type: Number,
      required: [true, 'Creativity score is required'],
      min: [0, 'Creativity must be between 0 and 25'],
      max: [25, 'Creativity must be between 0 and 25'],
      validate: {
        validator: Number.isInteger,
        message: 'Creativity must be an integer',
      },
    },

    // Presentation Score (0-25)
    presentation: {
      type: Number,
      required: [true, 'Presentation score is required'],
      min: [0, 'Presentation must be between 0 and 25'],
      max: [25, 'Presentation must be between 0 and 25'],
      validate: {
        validator: Number.isInteger,
        message: 'Presentation must be an integer',
      },
    },

    // Skill Level Score (0-25)
    skillLevel: {
      type: Number,
      required: [true, 'Skill Level score is required'],
      min: [0, 'Skill Level must be between 0 and 25'],
      max: [25, 'Skill Level must be between 0 and 25'],
      validate: {
        validator: Number.isInteger,
        message: 'Skill Level must be an integer',
      },
    },

    // Audience Impact Score (0-25)
    audienceImpact: {
      type: Number,
      required: [true, 'Audience Impact score is required'],
      min: [0, 'Audience Impact must be between 0 and 25'],
      max: [25, 'Audience Impact must be between 0 and 25'],
      validate: {
        validator: Number.isInteger,
        message: 'Audience Impact must be an integer',
      },
    },

    // Total Score (computed: sum of all criteria) - max 100
    totalScore: {
      type: Number,
      required: true,
      min: [0, 'Total score cannot be negative'],
      max: [100, 'Total score cannot exceed 100'],
    },

    // Comments from judge (optional)
    comments: {
      type: String,
      maxlength: 500,
      trim: true,
    },

    // Submission timestamp
    submittedAt: {
      type: Date,
      default: Date.now,
    },

    // Record creation and update
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

/**
 * Unique compound index: Prevent same judge from scoring same contestant in same round
 * This ensures data integrity - only one score per judge per contestant per round
 */
judgeScoreSchema.index(
  { judgeId: 1, contestantId: 1, round: 1 },
  { unique: true, name: 'unique_judge_contestant_round' }
);

/**
 * Index for faster queries (finding scores by judge or contestant)
 */
judgeScoreSchema.index({ judgeId: 1, round: 1 });
judgeScoreSchema.index({ contestantId: 1, round: 1 });

/**
 * Pre-save middleware: Calculate total score
 * Ensures backend never trusts frontend calculation
 */
judgeScoreSchema.pre('save', function (next) {
  // Calculate total from individual criteria
  this.totalScore = this.creativity + this.presentation + this.skillLevel + this.audienceImpact;

  // Validate that total is exactly 100 or less
  if (this.totalScore > 100) {
    return next(new Error('Total score cannot exceed 100'));
  }

  next();
});

/**
 * Static method to get leaderboard for a specific round
 * Returns contestants sorted by total score (descending)
 */
judgeScoreSchema.statics.getLeaderboard = async function (round, limit = 50) {
  return await this.aggregate([
    { $match: { round } },
    {
      $group: {
        _id: '$contestantId',
        averageScore: { $avg: '$totalScore' },
        judgeCount: { $sum: 1 },
        scores: { $push: '$$ROOT' },
      },
    },
    {
      $sort: { averageScore: -1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: 'contestants',
        localField: '_id',
        foreignField: '_id',
        as: 'contestant',
      },
    },
  ]);
};

module.exports = mongoose.model('JudgeScore', judgeScoreSchema);
