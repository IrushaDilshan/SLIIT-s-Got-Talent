/**
 * Contestant Routes
 * Handles contestant retrieval and management for judging
 */

const express = require("express");
const router = express.Router();

const {
  getAllContestants,
  getContestantById,
  createContestant,
  updateContestant,
  deleteContestant,
} = require("../controllers/contestant.Controller");

const authMiddleware = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

/**
 * Public routes (no auth required)
 */

// GET /api/contestants - Get all contestants
router.get("/", getAllContestants);

// GET /api/contestants/:id - Get single contestant by ID
router.get("/:id", getContestantById);

/**
 * Admin routes (requires auth + admin role)
 */

// POST /api/contestants - Create new contestant
router.post("/", authMiddleware, requireAdmin, createContestant);

// PUT /api/contestants/:id - Update contestant
router.put("/:id", authMiddleware, requireAdmin, updateContestant);

// DELETE /api/contestants/:id - Delete contestant
router.delete("/:id", authMiddleware, requireAdmin, deleteContestant);

module.exports = router;