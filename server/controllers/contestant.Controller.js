const Contestant = require('../models/Contestant');

/**
 * @desc    Get all contestants with optional filtering by round or status
 * @route   GET /api/contestants?round=Preliminary&status=pending
 * @access  Public
 */
exports.getAllContestants = async (req, res) => {
    try {
        const { round, status, page = 1, limit = 10 } = req.query;

        // Build filter object
        const filter = {};
        if (round) filter.round = round;
        if (status) filter.status = status;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Fetch contestants
        const contestants = await Contestant.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Contestant.countDocuments(filter);

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            data: contestants,
        });
    } catch (error) {
        console.error('Error fetching contestants:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching contestants',
            error: error.message,
        });
    }
};

/**
 * @desc    Get single contestant by ID
 * @route   GET /api/contestants/:id
 * @access  Public
 */
exports.getContestantById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid contestant ID format',
            });
        }

        const contestant = await Contestant.findById(id);

        if (!contestant) {
            return res.status(404).json({
                success: false,
                message: 'Contestant not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: contestant,
        });
    } catch (error) {
        console.error('Error fetching contestant:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching contestant',
            error: error.message,
        });
    }
};

/**
 * @desc    Create new contestant (Admin only)
 * @route   POST /api/contestants
 * @access  Private/Admin
 */
exports.createContestant = async (req, res) => {
    try {
        const { name, category, round, performanceTitle, photo, status, timeSlot, regNumber, contactNumber } = req.body;

        // Validate required fields
        if (!name || !category || !round) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, category, round',
            });
        }

        // Create new contestant
        const newContestant = new Contestant({
            name,
            category,
            round,
            performanceTitle: performanceTitle || '',
            photo: photo || '',
            status: status || 'pending',
            timeSlot: timeSlot || '',
            regNumber: regNumber || '',
            contactNumber: contactNumber || '',
        });

        // Save to database
        await newContestant.save();

        return res.status(201).json({
            success: true,
            message: 'Contestant created successfully',
            data: newContestant,
        });
    } catch (error) {
        console.error('Error creating contestant:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages,
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error while creating contestant',
            error: error.message,
        });
    }
};

/**
 * @desc    Update contestant (Admin only)
 * @route   PUT /api/contestants/:id
 * @access  Private/Admin
 */
exports.updateContestant = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validate MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid contestant ID format',
            });
        }

        // Find and update contestant
        const updatedContestant = await Contestant.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedContestant) {
            return res.status(404).json({
                success: false,
                message: 'Contestant not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Contestant updated successfully',
            data: updatedContestant,
        });
    } catch (error) {
        console.error('Error updating contestant:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages,
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error while updating contestant',
            error: error.message,
        });
    }
};

/**
 * @desc    Delete contestant (Admin only)
 * @route   DELETE /api/contestants/:id
 * @access  Private/Admin
 */
exports.deleteContestant = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid contestant ID format',
            });
        }

        // Find and delete contestant
        const deletedContestant = await Contestant.findByIdAndDelete(id);

        if (!deletedContestant) {
            return res.status(404).json({
                success: false,
                message: 'Contestant not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Contestant deleted successfully',
            data: deletedContestant,
        });
    } catch (error) {
        console.error('Error deleting contestant:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while deleting contestant',
            error: error.message,
        });
    }
};
