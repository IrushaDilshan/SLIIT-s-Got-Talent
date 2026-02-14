// Middleware to protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // TODO: Verify token with JWT
            // const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // req.user = await User.findById(decoded.id).select('-otp');

            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        // res.status(401).json({ message: 'Not authorized, no token' });
        // Allowing next() for now as it's a skeleton
        next();
    }
};
