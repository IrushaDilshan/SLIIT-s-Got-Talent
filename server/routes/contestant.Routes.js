const express = require('express');
const router = express.Router();
const { getContestants, registerContestant } = require('../controllers/contestant.Controller');

router.get('/', getContestants);
router.post('/', registerContestant);

module.exports = router;
