const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.Controller');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', settingsController.getSettings);
router.put('/', authMiddleware, authorize('admin'), settingsController.updateSettings);

module.exports = router;
