const express = require('express');
const axios = require('axios');
const { isValid, users } = require('./auth_users.js');

const publicUsers = express.Router();
const catalogUrl = process.env.BOOKS_API_URL ||
  `http://127.0.0.1:${process.env.PORT || 5000}/_internal/books`;

async function fetchBooks() {
  const { data } = await axios.get(catalogUrl, { timeout: 5000 });
  return data;
}

function sendCatalogError(res) {
  return res.status(502).json({ message: 'Book catalog is unavailable' });
}

publicUsers.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  const normalizedUsername = username.trim();
  if (!isValid(normalizedUsername)) {
    return res.status(409).json({ message: 'Username already exists' });
  }
  users.push({ username: normalizedUsername, password });
  return res.status(201).json({ message: 'User successfully registered' });
});

// Task 1, with async catalog retrieval shared by Tasks 10–13.
publicUsers.get('/', async (_req, res) => {
  try {
    return res.json(await fetchBooks());
  } catch (_error) {
    return sendCatalogError(res);
  }
});

// Task 2: the catalog key is the ISBN used by this starter dataset.
publicUsers.get('/isbn/:isbn', async (req, res) => {
  try {
    const books = await fetchBooks();
    const book = books[req.params.isbn];
    if (!book) return res.status(404).json({ message: 'Book not found' });
    return res.json(book);
  } catch (_error) {
    return sendCatalogError(res);
  }
});

// Task 3.
publicUsers.get('/author/:author', async (req, res) => {
  try {
    const books = await fetchBooks();
    const author = req.params.author.toLocaleLowerCase();
    const matches = Object.fromEntries(Object.entries(books).filter(
      ([, book]) => book.author.toLocaleLowerCase() === author
    ));
    if (Object.keys(matches).length === 0) {
      return res.status(404).json({ message: 'No books found for this author' });
    }
    return res.json(matches);
  } catch (_error) {
    return sendCatalogError(res);
  }
});

// Task 4.
publicUsers.get('/title/:title', async (req, res) => {
  try {
    const books = await fetchBooks();
    const title = req.params.title.toLocaleLowerCase();
    const matches = Object.fromEntries(Object.entries(books).filter(
      ([, book]) => book.title.toLocaleLowerCase() === title
    ));
    if (Object.keys(matches).length === 0) {
      return res.status(404).json({ message: 'No books found with this title' });
    }
    return res.json(matches);
  } catch (_error) {
    return sendCatalogError(res);
  }
});

// Task 5.
publicUsers.get('/review/:isbn', async (req, res) => {
  try {
    const books = await fetchBooks();
    const book = books[req.params.isbn];
    if (!book) return res.status(404).json({ message: 'Book not found' });
    return res.json(book.reviews || {});
  } catch (_error) {
    return sendCatalogError(res);
  }
});

module.exports.general = publicUsers;
