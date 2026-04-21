const express = require('express');
const router = express.Router();
const { castVote, getVoteStats } = require('../controllers/vote.Controller');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
router.post('/', authMiddleware, authorize('student'), castVote);
router.get('/stats', getVoteStats);

module.exports = router;
