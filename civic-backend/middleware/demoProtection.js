// Middleware to prevent demo users from making modifications
const demoProtection = (req, res, next) => {
  // Check if user is a demo user
  if (req.user && req.user.role === 'demo') {
    return res.status(403).json({
      success: false,
      message: 'Demo users have read-only access. Modifications are not allowed.',
      isDemo: true
    });
  }

  next();
};

module.exports = demoProtection;
