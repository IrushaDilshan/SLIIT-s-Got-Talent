const Contestant = require('../models/Contestant');

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

// @desc    Delete contestant (Admin)
// @access  Private/Admin
exports.deleteContestant = async (req, res) => {
    try {
        const contestant = await Contestant.findById(req.params.id);
        if (!contestant) {
            return res.status(404).json({ message: 'Contestant not found' });
        }

        await contestant.deleteOne();
        return res.status(200).json({ success: true, message: 'Contestant removed' });
    } catch (error) {
        console.error('Error deleting contestant:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Register a contestant
// @route   POST /api/contestants
// @access  Public
exports.registerContestant = async (req, res) => {
    const { name, universityId, talentType, description, imageUrl, videoUrl } = req.body;
    
    if (!name || !universityId || !talentType) {
        return res.status(400).json({ message: 'Name, universityId and talentType are required' });
    }

    try {
        const existing = await Contestant.findOne({ universityId });
        if (existing) {
            return res.status(400).json({ message: 'Contestant with this universityId already exists' });
        }

        const contestant = await Contestant.create({
            name,
            universityId,
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
