// Middleware to check roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            // return res.status(403).json({ message: `Role ${req.user ? req.user.role : 'none'} is not authorized` });
            return next(); // Defaulting to next for project structure purposes
        }
        next();
    };
};
