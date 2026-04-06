/**
 * Judge Score Controller
 * Handles score submission, retrieval, and leaderboard
 */

const JudgeScore = require('../models/JudgeScore');
const Contestant = require('../models/Contestant');

/**
 * Submit Judge Score
 * POST /api/scores/submit
 * Validates all criteria and prevents duplicate submissions
 * @param {object} req - Express request with judgeId, contestantId, scores in body
 * @param {object} res - Express response
 */
exports.submitScore = async (req, res) => {
  try {
    const { contestantId, creativity, presentation, skillLevel, audienceImpact } = req.body;
    const judgeId = req.userId; // Set by authMiddleware

    // Validate contestant exists
    if (!contestantId) {
      return res.status(400).json({
        success: false,
        message: 'Contestant ID is required.',
      });
    }

    // Find contestant to get round info
    const contestant = await Contestant.findById(contestantId);
    if (!contestant) {
      return res.status(404).json({
        success: false,
        message: 'Contestant not found.',
      });
    }

    // Check for duplicate submission in same round
    const existingScore = await JudgeScore.findOne({
      judgeId,
      contestantId,
      round: contestant.round,
    });

    if (existingScore) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a score for this contestant in this round.',
        existingSubmission: new Date(existingScore.submittedAt),
      });
    }

    // Create new judge score
    const judgeScore = new JudgeScore({
      judgeId,
      contestantId,
      round: contestant.round,
      creativity,
      presentation,
      skillLevel,
      audienceImpact,
      // totalScore is calculated in pre-save hook
    });

    // Save to database
    await judgeScore.save();

    return res.status(201).json({
      success: true,
      message: 'Score submitted successfully.',
      score: {
        id: judgeScore._id,
        creativity: judgeScore.creativity,
        presentation: judgeScore.presentation,
        skillLevel: judgeScore.skillLevel,
        audienceImpact: judgeScore.audienceImpact,
        totalScore: judgeScore.totalScore,
        submittedAt: judgeScore.submittedAt,
      },
    });
  } catch (error) {
    console.error('Score submission error:', error);

    // Handle duplicate key error from MongoDB index
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate submission detected. You have already scored this contestant in this round.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your score.',
      error: error.message,
    });
  }
};

/**
 * Get Scores by Logged-In Judge
 * GET /api/scores/my-scores
 * Returns all scores submitted by the logged-in judge
 * @param {object} req - Express request (requires auth)
 * @param {object} res - Express response
 */
exports.getMyScores = async (req, res) => {
  try {
    const judgeId = req.userId; // Set by authMiddleware
    const { round, limit = 50 } = req.query;

    // Build query
    let query = { judgeId };
    if (round) {
      query.round = round;
    }

    // Find scores and populate contestant info
    const scores = await JudgeScore.find(query)
      .populate('contestantId', 'name category performanceTitle photo')
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: scores.length,
      scores: scores.map((score) => ({
        id: score._id,
        contestant: score.contestantId,
        round: score.round,
        creativity: score.creativity,
        presentation: score.presentation,
        skillLevel: score.skillLevel,
        audienceImpact: score.audienceImpact,
        totalScore: score.totalScore,
        submittedAt: score.submittedAt,
      })),
    });
  } catch (error) {
    console.error('Fetch my scores error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching your scores.',
      error: error.message,
    });
  }
};

/**
 * Get Leaderboard / Scoreboard
 * GET /api/scores/leaderboard
 * Returns contestants sorted by average judge score (descending)
 * @param {object} req - Express request with optional round and limit query params
 * @param {object} res - Express response
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { round = 'Preliminary', limit = 50 } = req.query;

    // Aggregate scores: group by contestant, calculate average
    const leaderboard = await JudgeScore.aggregate([
      // Filter by round
      { $match: { round } },

      // Group by contestant
      {
        $group: {
          _id: '$contestantId',
          averageScore: { $avg: '$totalScore' },
          totalScore: { $sum: '$totalScore' },
          judgeCount: { $sum: 1 },
          scores: { $push: '$$ROOT' },
        },
      },

      // Sort by average score descending
      { $sort: { averageScore: -1 } },

      // Limit results
      { $limit: parseInt(limit) },

      // Lookup contestant details
      {
        $lookup: {
          from: 'contestants',
          localField: '_id',
          foreignField: '_id',
          as: 'contestant',
        },
      },

      // Unwind contestant (single object, not array)
      { $unwind: '$contestant' },
    ]);

    // Format response
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      contestantId: entry._id,
      contestant: {
        name: entry.contestant.name,
        category: entry.contestant.category,
        performanceTitle: entry.contestant.performanceTitle,
        photo: entry.contestant.photo,
      },
      averageScore: Number(entry.averageScore.toFixed(2)),
      totalScore: entry.totalScore,
      judgeCount: entry.judgeCount,
    }));

    return res.status(200).json({
      success: true,
      round,
      count: formattedLeaderboard.length,
      leaderboard: formattedLeaderboard,
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the leaderboard.',
      error: error.message,
    });
  }
};

/**
 * Get Single Judge Score
 * GET /api/scores/:scoreId
 * Returns a single judge score with contestant details
 * @param {object} req - Express request with scoreId in params
 * @param {object} res - Express response
 */
exports.getScore = async (req, res) => {
  try {
    const { scoreId } = req.params;

    const score = await JudgeScore.findById(scoreId).populate(
      'contestantId',
      'name category performanceTitle photo round'
    );

    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'Score not found.',
      });
    }

    return res.status(200).json({
      success: true,
      score: {
        id: score._id,
        contestant: score.contestantId,
        creativity: score.creativity,
        presentation: score.presentation,
        skillLevel: score.skillLevel,
        audienceImpact: score.audienceImpact,
        totalScore: score.totalScore,
        submittedAt: score.submittedAt,
      },
    });
  } catch (error) {
    console.error('Fetch score error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the score.',
      error: error.message,
    });
  }
};

module.exports = exports;
