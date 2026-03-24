const Contestant = require('../models/Contestant');
const path = require('path');

// @desc    Get public approved contestants
// @route   GET /api/contestants
// @access  Public
exports.getContestants = async (req, res) => {
    try {
        const contestants = await Contestant.find({ status: 'approved' }).sort({ createdAt: 1 });
        return res.status(200).json(contestants);
    } catch (error) {
        console.error('Error getting contestants:', error);
        return res.status(500).json({ message: 'Server error while fetching contestants' });
    }
};

// @desc    Get all contestants (Admin)
// @access  Private/Admin
exports.getAllContestantsAdmin = async (req, res) => {
    try {
        const contestants = await Contestant.find({}).sort({ createdAt: -1 });
        return res.status(200).json(contestants);
    } catch (error) {
        console.error('Error getting all contestants:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update contestant (Admin)
// @access  Private/Admin
exports.updateContestant = async (req, res) => {
    try {
        const contestant = await Contestant.findById(req.params.id);
        if (!contestant) {
            return res.status(404).json({ message: 'Contestant not found' });
        }

        const updatedContestant = await Contestant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        return res.status(200).json({ success: true, data: updatedContestant });
    } catch (error) {
        console.error('Error updating contestant:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const User = require('../models/User');
const Vote = require('../models/Vote');

// @desc    Delete contestant (Admin)
// @access  Private/Admin
exports.deleteContestant = async (req, res) => {
    try {
        const contestantId = req.params.id;
        const contestant = await Contestant.findById(contestantId);
        if (!contestant) {
            return res.status(404).json({ message: 'Contestant not found' });
        }

        const category = contestant.talentType;

        // Find users who specifically voted for this contestant
        const affectedUsers = await User.find({ votedContestants: contestantId });
        
        for (let user of affectedUsers) {
            // Remove the specific contestant from array
            user.votedContestants = user.votedContestants.filter(id => id.toString() !== contestantId.toString());
            
            // Re-evaluate category locks precisely since admin deleted the entry
            // This safely forces users to vote again in that category
            user.votedCategories = user.votedCategories.filter(cat => cat !== category);
            
            // Complete reset if no votes left across any category
            if (user.votedCategories.length === 0) {
                user.isVoted = false;
            }
            await user.save();
        }

        // Delete all corresponding votes cast for this person
        await Vote.deleteMany({ contestantId });

        // Proceed to delete the actual contestant entry
        await contestant.deleteOne();
        
        return res.status(200).json({ success: true, message: 'Contestant and associated votes successfully removed' });
    } catch (error) {
        console.error('Error deleting contestant:', error);
        return res.status(500).json({ message: 'Server error while attempting to delete contestant details' });
    }
};

// @desc    Register a contestant
// @route   POST /api/contestants
// @access  Public
exports.registerContestant = async (req, res) => {
    const {
        name,
        universityId,
        email,
        year,
        semester,
        talentType,
        description,
        mobileNumber,
        mobile
    } = req.body;

    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];
    const resolvedMobileNumber = (mobileNumber || mobile || '').trim();

    if (!name || !universityId || !email || !resolvedMobileNumber || !year || !semester || !talentType) {
        return res.status(400).json({
            message: 'name, universityId, email, mobileNumber, year, semester and talentType are required'
        });
    }

    if (!imageFile || !videoFile) {
        return res.status(400).json({ message: 'Image and video files are required' });
    }

    if (imageFile.size > (3 * 1024 * 1024)) {
        return res.status(400).json({ message: 'Image file must be less than 3 MB' });
    }

    if (videoFile.size > (50 * 1024 * 1024)) {
        return res.status(400).json({ message: 'Video file must be less than 50 MB' });
    }

    try {
        const existing = await Contestant.findOne({ universityId });
        if (existing) {
            return res.status(400).json({ message: 'Contestant with this universityId already exists' });
        }

        const imageUrl = path.posix.join('/uploads/contestants', imageFile.filename);
        const videoUrl = path.posix.join('/uploads/contestants', videoFile.filename);

        const contestant = await Contestant.create({
            name,
            universityId,
            email,
            mobileNumber: resolvedMobileNumber,
            year,
            semester,
            talentType,
            description,
            imageUrl,
            videoUrl,
            status: 'pending' // Default to pending
        });

        return res.status(201).json({
            success: true,
            data: contestant
        });
    } catch (error) {
        console.error('Error registering contestant:', error);
        return res.status(500).json({ message: 'Server error while registering contestant' });
    }
};
