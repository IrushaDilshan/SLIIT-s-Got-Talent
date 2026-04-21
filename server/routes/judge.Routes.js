const express = require('express');
const router = express.Router();
const {
  getJudgeProfile,
  getContestantsForJudging,
  getContestantScores,
  submitJudgeScore,
  updateJudgeScore,
  deleteJudgeScore,
  getJudgeScoreboard,
  getOverallScoreboard,
  getJudgeProgress,
  getFinalLeaderboard,
} = require('../controllers/judge.Controller');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// @route   GET /api/judges/profile
// @access  Private (Judge)
router.get('/profile', authMiddleware, authorize('judge', 'admin'), getJudgeProfile);

// @route   GET /api/judges/contestants
// @access  Private (Judge)
router.get('/contestants', authMiddleware, authorize('judge', 'admin'), getContestantsForJudging);

// @route   GET /api/judges/scores/:contestantId
// @access  Private (Judge)
router.get('/scores/:contestantId', authMiddleware, authorize('judge', 'admin'), getContestantScores);

// @route   POST /api/judges/submit-score
// @access  Private (Judge)
router.post('/submit-score', authMiddleware, authorize('judge'), submitJudgeScore);

// @route   PUT /api/judges/scores/:scoreId
// @access  Private (Judge)
router.put('/scores/:scoreId', authMiddleware, authorize('judge'), updateJudgeScore);

// @route   DELETE /api/judges/scores/:scoreId
// @access  Private (Judge)
router.delete('/scores/:scoreId', authMiddleware, authorize('judge'), deleteJudgeScore);

// @route   GET /api/judges/scoreboard
// @access  Private (Judge)
router.get('/scoreboard', authMiddleware, authorize('judge', 'admin'), getJudgeScoreboard);

// @route   GET /api/judges/overall-scoreboard
// @access  Private (Any)
router.get('/overall-scoreboard', authMiddleware, getOverallScoreboard);

// @route   GET /api/judges/progress
// @access  Private (Judge)
router.get('/progress', authMiddleware, authorize('judge', 'admin'), getJudgeProgress);

// @route   GET /api/judges/final-leaderboard
// @access  Public
router.get('/final-leaderboard', getFinalLeaderboard);

module.exports = router;
