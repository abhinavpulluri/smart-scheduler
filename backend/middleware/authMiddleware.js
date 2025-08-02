const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access token required' 
      });
    }
    
    // Use a default secret if not provided in environment
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    
    const decoded = jwt.verify(token, jwtSecret);
    
    // Verify the user still exists in the database
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found' 
      });
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    };
    
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ 
      message: 'Invalid or expired token' 
    });
  }
};

module.exports = { authenticateToken }; 