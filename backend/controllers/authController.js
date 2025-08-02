const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const { first_name, last_name, email, password } = req.body;
      
      // Validate input
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ 
          message: 'All fields are required' 
        });
      }
      
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with this email already exists' 
        });
      }
      
      // Create new user
      const newUser = await UserModel.createUser({
        first_name,
        last_name,
        email,
        password
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name
        },
        token
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: 'Internal server error' 
      });
    }
  }
  
  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ 
          message: 'Email and password are required' 
        });
      }
      
      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          message: 'Invalid email or password' 
        });
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: 'Invalid email or password' 
        });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        },
        token
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Internal server error' 
      });
    }
  }
  
  // Get current user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found' 
        });
      }
      
      res.json({ user });
      
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        message: 'Internal server error' 
      });
    }
  }
}

module.exports = AuthController; 