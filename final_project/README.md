# Book Review Application

Express REST API for browsing a small book catalog, registering users, and managing reviews with session and JWT authentication.

## Run locally

```sh
npm install
npm start
```

The server listens on port `5000` by default. Set `PORT`, `SESSION_SECRET`, or `JWT_SECRET` to override the defaults.

## Public routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/` | List all books |
| `GET` | `/isbn/:isbn` | Find one book by catalog ISBN/key |
| `GET` | `/author/:author` | Find books by author |
| `GET` | `/title/:title` | Find books by title |
| `GET` | `/review/:isbn` | Read reviews for one book |
| `POST` | `/register` | Register `{ "username", "password" }` |
| `POST` | `/customer/login` | Sign in and receive a JWT |

## Authenticated review routes

Log in with a cookie jar to retain the session, then send `PUT /customer/auth/review/:isbn` with `{ "review": "..." }` in the JSON body (or a `review` query parameter). A user's next review for the same book replaces their previous one. `DELETE /customer/auth/review/:isbn` deletes only the signed-in user's review. Authenticated routes accept the session cookie or `Authorization: Bearer <token>`.

The async book lookup routes use Axios to request the app's JSON catalog endpoint. The catalog data is the starter project's in-memory dataset, so reviews and registered accounts reset when the server restarts.
