const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const authenticated = express.Router();
const users = [];
const jwtSecret = process.env.JWT_SECRET || 'book-review-jwt-secret';

// Return true when a username is available for registration.
const isValid = (username) => !users.some((user) => user.username === username);
const authenticatedUser = (username, password) => users.some(
  (user) => user.username === username && user.password === password
);

authenticated.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password || !authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const authorization = jwt.sign({ username }, jwtSecret, { expiresIn: '1h' });
  req.session.authorization = authorization;
  req.session.username = username;
  return res.json({ message: 'User successfully logged in', username, authorization });
});

// Task 8: each username owns one review per book, so a repeat updates it.
authenticated.put('/auth/review/:isbn', (req, res) => {
  const username = req.user?.username || req.session?.username;
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });

  const review = req.body?.review ?? req.query?.review;
  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({ message: 'A review is required' });
  }

  book.reviews[username] = review.trim();
  return res.json({ message: 'Review added/updated successfully', reviews: book.reviews });
});

// Task 9: a user can remove only their own review.
authenticated.delete('/auth/review/:isbn', (req, res) => {
  const username = req.user?.username || req.session?.username;
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
    return res.status(404).json({ message: 'Review not found' });
  }

  delete book.reviews[username];
  return res.json({ message: 'Review deleted successfully', reviews: book.reviews });
});

module.exports.authenticated = authenticated;
module.exports.authenticatedUser = authenticatedUser;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.jwtSecret = jwtSecret;
