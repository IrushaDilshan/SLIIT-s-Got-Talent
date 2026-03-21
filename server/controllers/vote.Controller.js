const mongoose = require('mongoose');
const Vote = require('../models/Vote');
const User = require('../models/User');
const Contestant = require('../models/Contestant');

// @desc    Cast a vote
// @route   POST /api/votes
// @access  Private (Student)
exports.castVote = async (req, res) => {
    const { contestantId } = req.body;

    if (!contestantId) {
        return res.status(400).json({ message: 'Contestant ID is required' });
    }

    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const userId = req.user._id;

        // Fetch user to check voting status
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already cast your vote' });
        }

        // Validate contestantId format before querying
        if (!mongoose.Types.ObjectId.isValid(contestantId)) {
            return res.status(400).json({ message: 'Invalid contestant ID' });
        }

        // Ensure contestant exists and is approved
        const contestant = await Contestant.findById(contestantId);
        if (!contestant) {
            return res.status(404).json({ message: 'Contestant not found' });
        }

        if (contestant.status && contestant.status !== 'approved') {
            return res.status(400).json({ message: 'You can only vote for approved contestants' });
        }

        // Optional extra safety: ensure no existing vote by this user
        const existingVote = await Vote.findOne({ voterId: userId });
        if (existingVote) {
            user.isVoted = true;
            await user.save();
            return res.status(400).json({ message: 'You have already cast your vote' });
        }

        // Create vote record
        const vote = await Vote.create({
            voterId: userId,
            contestantId,
        });

        // Increment contestant vote count atomically
        const updatedContestant = await Contestant.findByIdAndUpdate(
            contestantId,
            { $inc: { votes: 1 } },
            { new: true }
        );

        // Mark user as having voted
        user.isVoted = true;
        await user.save();

        return res.status(201).json({
            success: true,
            message: 'Vote cast successfully',
            data: {
                voteId: vote._id,
                contestant: {
                    _id: updatedContestant._id,
                    name: updatedContestant.name,
                    votes: updatedContestant.votes,
                },
            },
        });
    } catch (error) {
        console.error('Error casting vote:', error);
        return res.status(500).json({ message: 'Server error while casting vote' });
    }
};

// @desc    Get vote stats
// @route   GET /api/votes/stats
// @access  Public
exports.getVoteStats = async (req, res) => {
    try {
        const contestants = await Contestant.find({ status: 'approved' })
            .select('name talentType description imageUrl votes')
            .sort({ votes: -1, createdAt: 1 });

        return res.status(200).json({
            success: true,
            data: contestants,
        });
    } catch (error) {
        console.error('Error getting vote stats:', error);
        return res.status(500).json({ message: 'Server error while fetching vote stats' });
    }
};
