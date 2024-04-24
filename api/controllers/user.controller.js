import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

export const test = (req, res) => {
  res.json({
    message: 'API route is working!',
  });
};

export const updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id)
      return next(errorHandler(401, 'You can only update your own account!'));

    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.password)
      updates.password = bcryptjs.hashSync(req.body.password, 10);
    if (req.body.avatar) updates.avatar = req.body.avatar;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id)
      return next(errorHandler(401, 'You can only delete your own account!'));

    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json('User has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id)
      return next(errorHandler(401, 'You can only view your own listings!'));

    const listings = await Listing.find({ userRef: req.params.id });
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, 'User not found!'));

    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
