const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const books = require('./router/booksdb.js');
const { authenticated: customerRoutes, jwtSecret } = require('./router/auth_users.js');
const generalRoutes = require('./router/general.js').general;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/customer', session({
  secret: process.env.SESSION_SECRET || 'book-review-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

// The async catalog routes use Axios to retrieve the same catalog over HTTP.
app.get('/_internal/books', (_req, res) => res.json(books));

app.use('/customer/auth/*', (req, res, next) => {
  const token = req.session?.authorization ||
    ((req.get('authorization') || '').match(/^Bearer\s+(.+)$/i) || [])[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.use('/customer', customerRoutes);
app.use('/', generalRoutes);

const PORT = Number(process.env.PORT) || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;
