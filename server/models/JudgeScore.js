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
      default: 'Semi-Final',
    },

    // Scoring criteria (components) - each out of 25 points
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

    // Total Score (computed: sum of all criteria) - max 100 (4 x 25)
    totalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // Status of the submission
    status: {
      type: String,
      enum: ['submitted', 'pending', 'revision'],
      default: 'submitted',
    },

    // Comments from judge (optional)
    notes: {
      type: String,
      default: '',
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

module.exports = mongoose.model('JudgeScore', judgeScoreSchema);
