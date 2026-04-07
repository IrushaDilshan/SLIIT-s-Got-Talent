/**
 * Data Validation Utilities
 * Validates all incoming data for scoring and contestant operations
 */

const validateScore = (score) => {
  if (score === undefined || score === null) {
    return { valid: false, error: 'Score cannot be empty' };
  }

  const numScore = Number(score);

  if (isNaN(numScore)) {
    return { valid: false, error: 'Score must be a number' };
  }

  if (numScore < 0 || numScore > 25) {
    return { valid: false, error: 'Score must be between 0 and 25' };
  }

  return { valid: true, value: numScore };
};

const validateJudgeScoreSubmission = (data) => {
  const errors = [];

  // Validate contestant ID
  if (!data.contestantId) {
    errors.push('Contestant ID is required');
  }

  // Validate criteria scores
  const criteria = ['creativity', 'presentation', 'skillLevel', 'audienceImpact'];
  
  for (const criterion of criteria) {
    if (data[criterion] === undefined) {
      errors.push(`${criterion} score is required`);
      continue;
    }

    const validation = validateScore(data[criterion]);
    if (!validation.valid) {
      errors.push(`${criterion}: ${validation.error}`);
    }
  }

  // Validate notes (optional, but must be string if provided)
  if (data.notes && typeof data.notes !== 'string') {
    errors.push('Notes must be a string');
  }

  if (data.notes && data.notes.length > 500) {
    errors.push('Notes cannot exceed 500 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

const validateEmail = (email) => {
  const sliitEmailRegex = /@(my\.)?sliit\.lk$/;
  
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  if (!sliitEmailRegex.test(email)) {
    return { valid: false, error: 'Only SLIIT email addresses are allowed' };
  }

  return { valid: true, value: email };
};

const validateContestantData = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!data.universityId || typeof data.universityId !== 'string') {
    errors.push('University ID is required');
  }

  if (!data.talentType || typeof data.talentType !== 'string') {
    errors.push('Talent type is required');
  }

  const validStatuses = ['pending', 'approved', 'rejected'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

const validatePagination = (page, limit) => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;

  if (pageNum < 1) {
    return { valid: false, error: 'Page must be >= 1' };
  }

  if (limitNum < 1 || limitNum > 100) {
    return { valid: false, error: 'Limit must be between 1 and 100' };
  }

  return { valid: true, page: pageNum, limit: limitNum };
};

const validateObjectId = (id) => {
  const mongodb = require('mongoose');
  
  if (!mongodb.Types.ObjectId.isValid(id)) {
    return { valid: false, error: 'Invalid ID format' };
  }

  return { valid: true, value: id };
};

const validateSearchQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Search query must be a non-empty string' };
  }

  if (query.length > 100) {
    return { valid: false, error: 'Search query cannot exceed 100 characters' };
  }

  return { valid: true, value: query.trim() };
};

module.exports = {
  validateScore,
  validateJudgeScoreSubmission,
  validateEmail,
  validateContestantData,
  validatePagination,
  validateObjectId,
  validateSearchQuery,
};
