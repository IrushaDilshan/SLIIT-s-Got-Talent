const express = require('express');
const router = express.Router();
const { castVote, getVoteStats } = require('../controllers/vote.Controller');

router.post('/', castVote);
router.get('/stats', getVoteStats);

module.exports = router;
