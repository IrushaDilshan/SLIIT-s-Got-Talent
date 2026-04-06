/**
 * Input Validation Middleware
 * Validates judge score submissions before processing
 */

/**
 * Validate judge score submission
 * Ensures all required fields are present and valid
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const validateJudgeScore = (req, res, next) => {
  const { creativity, presentation, skillLevel, audienceImpact } = req.body;

  // Check all fields are present
  if (
    creativity === undefined ||
    presentation === undefined ||
    skillLevel === undefined ||
    audienceImpact === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please complete all criteria before submitting.',
      required: ['creativity', 'presentation', 'skillLevel', 'audienceImpact'],
    });
  }

  // Check all are numbers
  if (
    typeof creativity !== 'number' ||
    typeof presentation !== 'number' ||
    typeof skillLevel !== 'number' ||
    typeof audienceImpact !== 'number'
  ) {
    return res.status(400).json({
      success: false,
      message: 'All scores must be numbers.',
    });
  }

  // Check all are integers
  if (
    !Number.isInteger(creativity) ||
    !Number.isInteger(presentation) ||
    !Number.isInteger(skillLevel) ||
    !Number.isInteger(audienceImpact)
  ) {
    return res.status(400).json({
      success: false,
      message: 'All scores must be integers (whole numbers).',
    });
  }

  // Check all are within valid range (0-25)
  const scores = {
    creativity,
    presentation,
    skillLevel,
    audienceImpact,
  };

  for (const [key, value] of Object.entries(scores)) {
    if (value < 0 || value > 25) {
      return res.status(400).json({
        success: false,
        message: `${key} must be between 0 and 25. Received: ${value}`,
      });
    }
  }

  // All validations passed, continue
  next();
};

module.exports = {
  validateJudgeScore,
};
