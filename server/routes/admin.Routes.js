const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser, createJudge, generateOtpForUser } = require('../controllers/admin.Controller');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.post('/users/judge', createJudge);
router.post('/users/:id/otp', generateOtpForUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
