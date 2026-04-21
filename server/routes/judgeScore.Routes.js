/**
 * Judge Score Routes
 * Handles judge score submission and leaderboard
 */

const express = require('express');
const router = express.Router();
const judgeScoreController = require('../controllers/judgeScore.Controller');
const authMiddleware = require('../middleware/authMiddleware');
const { requireJudge } = require('../middleware/roleMiddleware');
const { validateJudgeScore } = require('../middleware/validationMiddleware');

/**
 * Public routes (no auth required)
 */

// GET /api/scores/leaderboard - Get leaderboard with contestant rankings by average judge score
router.get('/leaderboard', judgeScoreController.getLeaderboard);

/**
 * Protected routes (requires judge authentication)
 */

// POST /api/scores/submit - Submit a judge score
// Validates all criteria and prevents duplicate submissions
router.post(
  '/submit',
  authMiddleware,
  requireJudge,
  validateJudgeScore,
  judgeScoreController.submitScore
);

// GET /api/scores/my-scores - Get all scores submitted by logged-in judge
router.get(
  '/my-scores',
  authMiddleware,
  requireJudge,
  judgeScoreController.getMyScores
);

// GET /api/scores/:scoreId - Get single score details
router.get(
  '/:scoreId',
  authMiddleware,
  judgeScoreController.getScore
);

module.exports = router;
