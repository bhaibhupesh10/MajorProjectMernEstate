import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  // Extract the token from the request cookies
  const token = req.cookies.access_token;

  // Check if the token exists
  if (!token) return next(errorHandler(401, 'Unauthorized'));

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: false }, (err, user) => {
    // If there's an error during token verification
    if (err) {
      // Check if the error is due to token expiration
      if (err.name === 'TokenExpiredError') {
        return next(errorHandler(401, 'Token expired'));
      }
      // If it's not an expiration error, it's likely a forbidden access error
      return next(errorHandler(403, 'Forbidden'));
    }

    // If token verification succeeds, attach the user object to the request
    req.user = user;
    // Call the next middleware function
    next();
  });
};
