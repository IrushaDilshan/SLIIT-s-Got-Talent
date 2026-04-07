const express = require('express');
const router = express.Router();
const {
  getJudgeProfile,
  getContestantsForJudging,
  getContestantScores,
  submitJudgeScore,
  updateJudgeScore,
  getJudgeScoreboard,
  getOverallScoreboard,
  getJudgeProgress,
} = require('../controllers/judge.Controller');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// @route   GET /api/judges/profile
// @access  Private (Judge)
router.get('/profile', protect, authorize('judge', 'admin'), getJudgeProfile);

// @route   GET /api/judges/contestants
// @access  Private (Judge)
router.get('/contestants', protect, authorize('judge', 'admin'), getContestantsForJudging);

// @route   GET /api/judges/scores/:contestantId
// @access  Private (Judge)
router.get('/scores/:contestantId', protect, authorize('judge', 'admin'), getContestantScores);

// @route   POST /api/judges/submit-score
// @access  Private (Judge)
router.post('/submit-score', protect, authorize('judge'), submitJudgeScore);

// @route   PUT /api/judges/scores/:scoreId
// @access  Private (Judge)
router.put('/scores/:scoreId', protect, authorize('judge'), updateJudgeScore);

// @route   GET /api/judges/scoreboard
// @access  Private (Judge)
router.get('/scoreboard', protect, authorize('judge', 'admin'), getJudgeScoreboard);

// @route   GET /api/judges/overall-scoreboard
// @access  Private (Any)
router.get('/overall-scoreboard', protect, getOverallScoreboard);

// @route   GET /api/judges/progress
// @access  Private (Judge)
router.get('/progress', protect, authorize('judge', 'admin'), getJudgeProgress);

module.exports = router;
