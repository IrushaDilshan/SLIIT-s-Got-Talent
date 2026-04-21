const mongoose = require('mongoose');
const JudgeScore = require('../models/JudgeScore');
const User = require('../models/User');
const Contestant = require('../models/Contestant');

// @desc    Get judge profile
// @route   GET /api/judges/profile
// @access  Private (Judge)
exports.getJudgeProfile = async (req, res) => {
  try {
    const judge = await User.findById(req.userId).select('-otp -otpExpires');
    
    if (!judge) {
      return res.status(404).json({ message: 'Judge not found' });
    }

    if (judge.role !== 'judge') {
      return res.status(403).json({ message: 'User is not a judge' });
    }

    // Get judge statistics
    const totalScored = await JudgeScore.countDocuments({ judgeId: judge._id });
    const scoredContestants = await JudgeScore.distinct('contestantId', { judgeId: judge._id });
    
    res.status(200).json({
      success: true,
      data: {
        id: judge._id,
        email: judge.email,
        role: judge.role,
        totalScoredContestants: totalScored,
        uniqueContestants: scoredContestants.length,
        createdAt: judge.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching judge profile:', error);
    res.status(500).json({ message: 'Error fetching judge profile', error: error.message });
  }
};

// @desc    Get all contestants for judge panel
// @route   GET /api/judges/contestants
// @access  Private (Judge)
exports.getContestantsForJudging = async (req, res) => {
  try {
    const { category, round, status } = req.query;
    
    // Build filter object - get all contestants regardless of status for judging
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (round) {
      filter.round = round;
    }

    const contestants = await Contestant.find(filter).select('name category round performanceTitle photo timeSlot status');
    
    if (!contestants || contestants.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No contestants found for judging',
      });
    }

    // Enrich contestants with judge scores if available
    const enrichedContestants = await Promise.all(
      contestants.map(async (contestant) => {
        const judgeScore = await JudgeScore.findOne({
          judgeId: req.userId,
          contestantId: contestant._id,
        });

        return {
          id: contestant._id,
          name: contestant.name,
          category: contestant.category,
          photo: contestant.photo,
          description: contestant.performanceTitle,
          round: contestant.round,
          timeSlot: contestant.timeSlot,
          status: contestant.status,
          hasBeenScored: !!judgeScore,
          scoreSubmitted: judgeScore ? judgeScore.createdAt : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedContestants,
      count: enrichedContestants.length,
    });
  } catch (error) {
    console.error('Error fetching contestants:', error);
    res.status(500).json({ message: 'Error fetching contestants', error: error.message });
  }
};

// @desc    Get judge scores for a specific contestant
// @route   GET /api/judges/scores/:contestantId
// @access  Private (Judge)
exports.getContestantScores = async (req, res) => {
  try {
    const { contestantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contestantId)) {
      return res.status(400).json({ message: 'Invalid contestant ID' });
    }

    const contestant = await Contestant.findById(contestantId);
    if (!contestant) {
      return res.status(404).json({ message: 'Contestant not found' });
    }

    // Get all judge scores for this contestant
    const scores = await JudgeScore.find({ contestantId }).populate('judgeId', 'email');

    const averageScore = scores.length > 0
      ? (scores.reduce((sum, score) => sum + score.totalScore, 0) / scores.length).toFixed(2)
      : 0;

    const criteriaAverages = {
      creativity: 0,
      presentation: 0,
      skillLevel: 0,
      audienceImpact: 0,
    };

    if (scores.length > 0) {
      criteriaAverages.creativity = (
        scores.reduce((sum, score) => sum + score.criteria.creativity, 0) / scores.length
      ).toFixed(2);
      criteriaAverages.presentation = (
        scores.reduce((sum, score) => sum + score.criteria.presentation, 0) / scores.length
      ).toFixed(2);
      criteriaAverages.skillLevel = (
        scores.reduce((sum, score) => sum + score.criteria.skillLevel, 0) / scores.length
      ).toFixed(2);
      criteriaAverages.audienceImpact = (
        scores.reduce((sum, score) => sum + score.criteria.audienceImpact, 0) / scores.length
      ).toFixed(2);
    }

    res.status(200).json({
      success: true,
      data: {
        contestantId: contestant._id,
        contestantName: contestant.name,
        category: contestant.talentType,
        totalJudges: scores.length,
        averageScore,
        criteriaAverages,
        scores: scores.map(score => ({
          judgeId: score.judgeId._id,
          judgeEmail: score.judgeId.email,
          criteria: score.criteria,
          totalScore: score.totalScore,
          submittedAt: score.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching contestant scores:', error);
    res.status(500).json({ message: 'Error fetching contestant scores', error: error.message });
  }
};

// @desc    Submit judge scores for a contestant
// @route   POST /api/judges/submit-score
// @access  Private (Judge)
exports.submitJudgeScore = async (req, res) => {
  try {
    const { contestantId, creativity, presentation, skillLevel, audienceImpact, notes } = req.body;

    console.log('📨 Submitting Score Request:', {
      judgeId: req.userId,
      contestantId,
      creativity,
      presentation,
      skillLevel,
      audienceImpact,
    });

    // Validation
    if (!contestantId) {
      return res.status(400).json({ message: 'Contestant ID is required' });
    }

    if (creativity === undefined || presentation === undefined || skillLevel === undefined || audienceImpact === undefined) {
      return res.status(400).json({ message: 'All scoring criteria are required' });
    }

    // Validate score ranges - FIX: Use for loop instead of forEach
    for (const score of [creativity, presentation, skillLevel, audienceImpact]) {
      if (score < 0 || score > 25) {
        return res.status(400).json({ message: 'Each criterion score must be between 0 and 25' });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(contestantId)) {
      return res.status(400).json({ message: 'Invalid contestant ID' });
    }

    const contestant = await Contestant.findById(contestantId);
    if (!contestant) {
      return res.status(404).json({ message: 'Contestant not found' });
    }

    // Check if judge has already scored this contestant
    const existingScore = await JudgeScore.findOne({
      judgeId: req.userId,
      contestantId,
    });

    if (existingScore) {
      return res.status(400).json({ 
        message: 'You have already submitted a score for this contestant. Update your existing score instead.' 
      });
    }

    const totalScore = creativity + presentation + skillLevel + audienceImpact;

    const judgeScore = await JudgeScore.create({
      judgeId: req.userId,
      contestantId,
      criteria: {
        creativity,
        presentation,
        skillLevel,
        audienceImpact,
      },
      totalScore,
      notes: notes || '',
      status: 'submitted',
    });

    console.log('✅ Score created in DB:', {
      scoreId: judgeScore._id,
      totalScore: judgeScore.totalScore,
    });

    res.status(201).json({
      success: true,
      message: 'Score submitted successfully',
      data: {
        scoreId: judgeScore._id,
        contestantId: judgeScore.contestantId,
        criteria: judgeScore.criteria,
        totalScore: judgeScore.totalScore,
        submittedAt: judgeScore.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error submitting judge score:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'You have already submitted a score for this contestant' 
      });
    }
    res.status(500).json({ message: 'Error submitting score', error: error.message });
  }
};

// @desc    Update judge score (for revision)
// @route   PUT /api/judges/scores/:scoreId
// @access  Private (Judge)
exports.updateJudgeScore = async (req, res) => {
  try {
    const { scoreId } = req.params;
    const { creativity, presentation, skillLevel, audienceImpact, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(scoreId)) {
      return res.status(400).json({ message: 'Invalid score ID' });
    }

    const judgeScore = await JudgeScore.findById(scoreId);
    if (!judgeScore) {
      return res.status(404).json({ message: 'Score not found' });
    }

    // Verify judge is the one who submitted this score
    if (judgeScore.judgeId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this score' });
    }

    // Update scores if provided
    if (creativity !== undefined) judgeScore.criteria.creativity = creativity;
    if (presentation !== undefined) judgeScore.criteria.presentation = presentation;
    if (skillLevel !== undefined) judgeScore.criteria.skillLevel = skillLevel;
    if (audienceImpact !== undefined) judgeScore.criteria.audienceImpact = audienceImpact;

    // Recalculate total
    judgeScore.totalScore = judgeScore.criteria.creativity + judgeScore.criteria.presentation + 
                            judgeScore.criteria.skillLevel + judgeScore.criteria.audienceImpact;

    if (notes !== undefined) judgeScore.notes = notes;

    await judgeScore.save();

    res.status(200).json({
      success: true,
      message: 'Score updated successfully',
      data: {
        scoreId: judgeScore._id,
        criteria: judgeScore.criteria,
        totalScore: judgeScore.totalScore,
        updatedAt: judgeScore.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating judge score:', error);
    res.status(500).json({ message: 'Error updating score', error: error.message });
  }
};

// @desc    Get judge scoreboard (rankings by judge)
// @route   GET /api/judges/scoreboard
// @access  Private (Judge)
exports.getJudgeScoreboard = async (req, res) => {
  try {
    const { category } = req.query;
    console.log('📊 getJudgeScoreboard called for judge:', req.userId, 'category:', category);

    const matchStage = { judgeId: new mongoose.Types.ObjectId(req.userId) };

    const scores = await JudgeScore.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'contestants',
          localField: 'contestantId',
          foreignField: '_id',
          as: 'contestant',
        },
      },
      { $unwind: '$contestant' },
      ...(category ? [{ $match: { 'contestant.category': category } }] : []),
      { $sort: { totalScore: -1 } },
      {
        $project: {
          _id: 0,
          scoreId: '$_id',
          contestantId: '$contestantId',
          name: '$contestant.name',
          category: '$contestant.category',
          photo: '$contestant.photo',
          totalScore: 1,
          criteria: 1,
          submittedAt: '$createdAt',
        },
      },
    ]);

    console.log('✅ Judge scores found:', scores.length);

    res.status(200).json({
      success: true,
      data: scores,
      count: scores.length,
    });
  } catch (error) {
    console.error('Error fetching judge scoreboard:', error);
    res.status(500).json({ message: 'Error fetching scoreboard', error: error.message });
  }
};

// @desc    Get overall scoreboard (average of all judges)
// @route   GET /api/judges/overall-scoreboard
// @access  Private (Any)
exports.getOverallScoreboard = async (req, res) => {
  try {
    const { round, category } = req.query;

    const matchStage = {};
    if (round) {
      matchStage.round = round;
    }

    const scores = await JudgeScore.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$contestantId',
          averageScore: { $avg: '$totalScore' },
          judgeCount: { $sum: 1 },
          averageCreativity: { $avg: '$criteria.creativity' },
          averagePresentation: { $avg: '$criteria.presentation' },
          averageSkillLevel: { $avg: '$criteria.skillLevel' },
          averageAudienceImpact: { $avg: '$criteria.audienceImpact' },
        },
      },
      {
        $lookup: {
          from: 'contestants',
          localField: '_id',
          foreignField: '_id',
          as: 'contestant',
        },
      },
      { $unwind: '$contestant' },
      ...(category ? [{ $match: { 'contestant.talentType': category } }] : []),
      { $sort: { averageScore: -1 } },
      {
        $project: {
          _id: 0,
          contestantId: '$_id',
          name: '$contestant.name',
          category: '$contestant.talentType',
          photo: '$contestant.imageUrl',
          averageScore: { $round: ['$averageScore', 2] },
          judgeCount: 1,
          criteria: {
            creativity: { $round: ['$averageCreativity', 2] },
            presentation: { $round: ['$averagePresentation', 2] },
            skillLevel: { $round: ['$averageSkillLevel', 2] },
            audienceImpact: { $round: ['$averageAudienceImpact', 2] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: scores,
      count: scores.length,
    });
  } catch (error) {
    console.error('Error fetching overall scoreboard:', error);
    res.status(500).json({ message: 'Error fetching overall scoreboard', error: error.message });
  }
};

// @desc    Get judge scoring progress
// @route   GET /api/judges/progress
// @access  Private (Judge)
exports.getJudgeProgress = async (req, res) => {
  try {
    const totalContestants = await Contestant.countDocuments({ status: 'approved' });
    const scoredContestants = await JudgeScore.countDocuments({ judgeId: req.userId });
    const pendingContestants = totalContestants - scoredContestants;

    const scoresByCategory = await JudgeScore.aggregate([
      { $match: { judgeId: new mongoose.Types.ObjectId(req.userId) } },
      {
        $lookup: {
          from: 'contestants',
          localField: 'contestantId',
          foreignField: '_id',
          as: 'contestant',
        },
      },
      { $unwind: '$contestant' },
      {
        $group: {
          _id: '$contestant.talentType',
          count: { $sum: 1 },
          averageScore: { $avg: '$totalScore' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalContestants,
        scoredContestants,
        pendingContestants,
        progressPercentage: totalContestants > 0 ? ((scoredContestants / totalContestants) * 100).toFixed(2) : 0,
        byCategory: scoresByCategory,
      },
    });
  } catch (error) {
    console.error('Error fetching judge progress:', error);
    res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
};

// @desc    Delete judge score (clear submitted score)
// @route   DELETE /api/judges/scores/:scoreId
// @access  Private (Judge)
exports.deleteJudgeScore = async (req, res) => {
  try {
    const { scoreId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(scoreId)) {
      return res.status(400).json({ message: 'Invalid score ID' });
    }

    const judgeScore = await JudgeScore.findById(scoreId);
    if (!judgeScore) {
      return res.status(404).json({ message: 'Score not found' });
    }

    // Verify judge is the one who submitted this score
    if (judgeScore.judgeId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this score' });
    }

    await JudgeScore.findByIdAndDelete(scoreId);

    res.status(200).json({
      success: true,
      message: 'Score deleted successfully',
      data: {
        deletedScoreId: scoreId,
        contestantId: judgeScore.contestantId,
      },
    });
  } catch (error) {
    console.error('Error deleting judge score:', error);
    res.status(500).json({ message: 'Error deleting score', error: error.message });
  }
};

// @desc    Get combined final leaderboard (judge scores + public votes)
// @route   GET /api/judges/final-leaderboard
// @access  Public
exports.getFinalLeaderboard = async (req, res) => {
  try {
    const { category } = req.query;
    console.log('📊 getFinalLeaderboard called with category:', category);

    // Stage 1: Aggregate judge scores
    const judgeScorePipeline = [
      {
        $group: {
          _id: '$contestantId',
          averageJudgeScore: { $avg: '$totalScore' },
          judgeCount: { $sum: 1 },
          averageCreativity: { $avg: '$criteria.creativity' },
          averagePresentation: { $avg: '$criteria.presentation' },
          averageSkillLevel: { $avg: '$criteria.skillLevel' },
          averageAudienceImpact: { $avg: '$criteria.audienceImpact' },
        },
      },
    ];

    const judgeScores = await JudgeScore.aggregate(judgeScorePipeline);
    console.log('✅ Judge scores fetched:', judgeScores.length, 'records');

    // Stage 2: Create a map for quick lookup
    const judgeScoreMap = {};
    judgeScores.forEach(score => {
      judgeScoreMap[score._id.toString()] = {
        averageJudgeScore: Math.round(score.averageJudgeScore * 100) / 100,
        judgeCount: score.judgeCount,
        criteria: {
          creativity: Math.round(score.averageCreativity * 100) / 100,
          presentation: Math.round(score.averagePresentation * 100) / 100,
          skillLevel: Math.round(score.averageSkillLevel * 100) / 100,
          audienceImpact: Math.round(score.averageAudienceImpact * 100) / 100,
        },
      };
    });

    // Stage 3: Fetch contestants
    const matchStage = {};
    if (category) {
      matchStage.category = category;
    }

    const contestants = await Contestant.find(matchStage).select(
      'name category photo performanceTitle round timeSlot'
    );
    console.log('✅ Contestants fetched:', contestants.length, 'records', 'with category filter:', category || 'none');

    // Stage 4: Combine data and calculate weighted scores
    const leaderboardData = contestants.map(contestant => {
      const judgeScoreData = judgeScoreMap[contestant._id.toString()] || {
        averageJudgeScore: 0,
        judgeCount: 0,
        criteria: {
          creativity: 0,
          presentation: 0,
          skillLevel: 0,
          audienceImpact: 0,
        },
      };

      // Max possible scores (4 criteria × 25 points each)
      const maxJudgeScore = 100;

      // Calculate percentages (based only on judge scores since public voting not integrated yet)
      const judgeScorePercent = (judgeScoreData.averageJudgeScore / maxJudgeScore) * 100;

      // Weighted score (100% judge scores for now)
      const weightedScore = Number(judgeScorePercent.toFixed(2));

      return {
        id: contestant._id,
        contestantId: contestant._id.toString(),
        name: contestant.name,
        category: contestant.category,
        photo: contestant.photo,
        performanceTitle: contestant.performanceTitle,
        round: contestant.round,
        timeSlot: contestant.timeSlot,
        averageJudgeScore: judgeScoreData.averageJudgeScore,
        maxJudgeScore,
        judgeCount: judgeScoreData.judgeCount,
        judgeScorePercent: Math.round(judgeScorePercent),
        criteria: judgeScoreData.criteria,
        weightedScore,
      };
    });

    // Stage 5: Sort by weighted score
    const rankedLeaderboard = leaderboardData.sort(
      (a, b) => b.weightedScore - a.weightedScore
    );

    // Calculate summary stats
    const totalJudgeScores = rankedLeaderboard.reduce((sum, c) => sum + c.averageJudgeScore, 0);
    const avgJudgeScore =
      rankedLeaderboard.length > 0
        ? (totalJudgeScores / rankedLeaderboard.length).toFixed(2)
        : 0;

    // Get top 3
    const topThree = rankedLeaderboard.slice(0, 3);

    console.log('📤 Sending final leaderboard response with', rankedLeaderboard.length, 'contestants');

    res.status(200).json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        topThree,
        statistics: {
          totalContestants: rankedLeaderboard.length,
          averageJudgeScore: parseFloat(avgJudgeScore),
          highestJudgeScore: rankedLeaderboard.length > 0 ? rankedLeaderboard[0].averageJudgeScore : 0,
          highestWeightedScore: rankedLeaderboard.length > 0 ? rankedLeaderboard[0].weightedScore : 0,
        },
      },
      count: rankedLeaderboard.length,
    });
  } catch (error) {
    console.error('Error fetching final leaderboard:', error);
    res.status(500).json({
      message: 'Error fetching final leaderboard',
      error: error.message,
    });
  }
};
