const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartlaundry_secret');
    req.user = {
      id: decoded.id,
      email: decoded.email,
      userType: decoded.userType
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.'
    });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.'
    });
  }
  next();
};
