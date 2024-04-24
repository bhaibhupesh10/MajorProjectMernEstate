// auth.controller.js

import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { errorHandler } from '../utils/error.js';

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, 'User already exists'));
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json('User created successfully!');
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(401, 'Invalid credentials'));
    }

    // Check if the password is valid
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return next(errorHandler(401, 'Invalid credentials'));
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expiration time
    });

    res.cookie('access_token', token, { httpOnly: true });
    res.status(200).json({ user: { _id: user._id, username: user.username } });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    // Clear the access token cookie
    res.clearCookie('access_token');
    res.status(200).json('User has been logged out successfully');
  } catch (error) {
    next(error);
  }
};

export default { signup, signin, signOut };
