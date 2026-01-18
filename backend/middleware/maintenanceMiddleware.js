const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Optional: if we want to verify user exists
const SystemSetting = require('../models/SystemSetting');

const maintenanceMiddleware = async (req, res, next) => {
    try {
        // Skip check for maintenance status endpoint itself to prevent infinite loops or blockage
        if (req.originalUrl.includes('/api/system/maintenance')) {
            return next();
        }

        // Skip check for login/auth routes to allow admins to login
        if (req.originalUrl.includes('/api/auth')) {
            return next();
        }

        const setting = await SystemSetting.findOne({ key: 'maintenance_mode' });

        if (setting && setting.value === true) {
            // Attempt to identify user from token manually since global middleware runs before 'protect'
            let token;
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                try {
                    token = req.headers.authorization.split(' ')[1];
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);

                    // We can either trust the token or fetch the user.
                    // Fetching user is safer.
                    const user = await User.findById(decoded.id).select('role');

                    if (user && user.role === 'admin') {
                        req.user = user; // Optimization: Attach to req.user so 'protect' doesn't need to fetch again? 
                        // existing 'protect' middleware fetches full user. 
                        // Let's just pass for now.
                        return next();
                    }
                } catch (err) {
                    console.error('Maintenance middleware token verification failed:', err.message);
                    // Token invalid, proceed to block
                }
            }

            // If we get here, either no token, invalid token, or not admin
            return res.status(503).json({
                message: 'System is currently under maintenance. Please try again later.',
                maintenance: true
            });
        }

        next();
    } catch (error) {
        console.error('Maintenance middleware error:', error);
        next();
    }
};

module.exports = maintenanceMiddleware;
