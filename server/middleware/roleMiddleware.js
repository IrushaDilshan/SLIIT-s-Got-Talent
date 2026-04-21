/**
 * Role-Based Access Control Middleware
 * Ensures only judges (and admins) can access judge endpoints
 */

/**
 * Verify user is a judge or admin
 * Must be called AFTER authMiddleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const requireJudge = (req, res, next) => {
  // Check if user role is judge or admin
  if (req.userRole !== 'judge' && req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only judges can access this resource.',
    });
  }

  next();
};

/**
 * Verify user is an admin
 * Must be called AFTER authMiddleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only admins can access this resource.',
    });
  }

  next();
};

module.exports = {
  requireJudge,
  requireAdmin,
};
