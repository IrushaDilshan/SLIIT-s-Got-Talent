const express = require('express');
const router = express.Router();
const { uploadContestantMedia } = require('../middleware/uploadMiddleware');
const { 
    getContestants, 
    registerContestant, 
    getAllContestantsAdmin, 
    updateContestant, 
    deleteContestant 
} = require('../controllers/contestant.Controller');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getContestants);
router.post('/', uploadContestantMedia, registerContestant);

// Admin routes
router.get('/admin', protect, authorize('admin'), getAllContestantsAdmin);
router.put('/:id', protect, authorize('admin'), updateContestant);
router.delete('/:id', protect, authorize('admin'), deleteContestant);

module.exports = router;
