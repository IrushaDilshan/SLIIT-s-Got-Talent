const Contestant = require('../models/Contestant');

// @desc    Get all contestants
// @route   GET /api/contestants
// @access  Public
exports.getContestants = async (req, res) => {
    res.status(200).json({ message: 'Get all contestants' });
};

// @desc    Register a contestant
// @route   POST /api/contestants
// @access  Private
exports.registerContestant = async (req, res) => {
    res.status(200).json({ message: 'Register contestant' });
};
