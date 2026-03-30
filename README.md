# Utsav Registration Portal

A beginner-friendly college fest registration app: **Node.js**, **Express**, **SQLite** (`sqlite3`), **express-session**, and a **vanilla HTML/CSS/JS** frontend.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended; includes `npm`)

## Setup and run

1. Open a terminal in this project folder (`utsav-registration-portal`).

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. In your browser, open:

   **http://localhost:3000**

   - Home: `/` or `/index.html`
   - Register: `/register.html`
   - Login: `/login.html`
   - Student dashboard (after login): `/dashboard.html`
   - Admin dashboard: `/admin.html` (admin account only)

## First run

On the first start, the app:

- Creates `utsav.db` in the project folder
- Creates tables (`users`, `events`, `registrations`)
- Seeds the admin user, demo users, events, and sample registrations (no duplicates on later runs)

## Seeded admin

- **Email:** `admin@utsav.com`
- **Password:** `admin123`

## Where is the SQLite database?

The database is a **single file** on disk:

- **Path:** `utsav.db` in the **project root** (the same folder as `server.js`, `db.js`, and `package.json`).
- It is created automatically the **first time** you run `npm start` (when the server starts and runs the schema + seed).

You can copy or back up the whole app by including `utsav.db`. Deleting `utsav.db` and restarting the server creates a fresh empty database and re-runs the seed.

## How do I log in to the app?

Use the **browser** after starting the server (`npm start`):

1. Open **http://localhost:3000/login.html** (or click **Login** from the home page).
2. Enter **email** and **password**, then submit.

**Admin (full admin dashboard):**

| Email            | Password   |
|------------------|------------|
| `admin@utsav.com` | `admin123` |

**Demo students** (seeded users; all use the same password):

| Email               | Password  |
|---------------------|-----------|
| `ananya@example.com` | `pass123` |
| `rahul@example.com`  | `pass123` |
| (and other demo emails from the seed — see `seed.js`) | `pass123` |

You can also **register a new account** at **http://localhost:3000/register.html** and then log in with that email and password.

**After login:** regular users are sent to the **user dashboard**; the admin account is sent to the **admin dashboard**.

## How do I inspect tables and run SQL?

The app does not ship a built-in SQL console. You use **external tools** that can open `utsav.db`.

### Option A: SQLite command-line tool (`sqlite3`)

If you have the `sqlite3` CLI installed (e.g. from [SQLite download page](https://www.sqlite.org/download.html) or via a package manager), open a terminal **in the project folder** and run:

```bash
sqlite3 utsav.db
```

Useful **dot-commands** inside the SQLite prompt:

| Command        | What it does                          |
|----------------|----------------------------------------|
| `.tables`      | Lists all tables                       |
| `.schema`      | Shows `CREATE TABLE` for all objects   |
| `.schema users`| Shows schema for one table             |
| `.headers on`  | Show column names in query results     |
| `.mode column` | Nicer column alignment (optional)      |
| `.quit`        | Exit                                   |

**Example queries** (type at the `sqlite>` prompt, end with `;`):

```sql
SELECT id, full_name, email, college, role FROM users;
SELECT id, title, event_date, event_time, max_participants FROM events;
SELECT * FROM registrations;
```

Passwords in `users` are **hashed** (bcrypt), so they will not match plain text.

### Option B: DB Browser for SQLite (GUI)

Install **[DB Browser for SQLite](https://sqlitebrowser.org/)**, choose **Open Database**, select `utsav.db` from this project folder, then use the **Browse Data** and **Execute SQL** tabs to view tables and run `SELECT` statements.

### Important

- **Stop the Node server** (`Ctrl+C` in the terminal running `npm start`) before opening `utsav.db` in some tools, or you may see “database is locked” errors. Alternatively, open read-only or retry after closing the app.

## Optional environment variables

- `PORT` — server port (default `3000`)
- `SESSION_SECRET` — secret for session cookies (set a long random string in production)

## Project layout

| File / folder   | Purpose                          |
|----------------|-----------------------------------|
| `server.js`    | Express app, routes, session      |
| `db.js`        | SQLite helpers and schema         |
| `seed.js`      | Idempotent seed data              |
| `public/`      | Static HTML, CSS, JS              |

## Notes

- Passwords are stored with **bcrypt** hashing.
- Sessions use a cookie (`connect.sid` by default); keep the frontend and API on the same origin for local development.
