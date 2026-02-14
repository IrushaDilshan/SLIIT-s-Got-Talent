const Vote = require('../models/Vote');

// @desc    Cast a vote
// @route   POST /api/votes
// @access  Private (Student)
exports.castVote = async (req, res) => {
    res.status(200).json({ message: 'Cast vote' });
};

// @desc    Get vote stats
// @route   GET /api/votes/stats
// @access  Public
exports.getVoteStats = async (req, res) => {
    res.status(200).json({ message: 'Get vote stats' });
};
