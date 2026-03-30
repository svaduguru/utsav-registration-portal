/**
 * Utsav Registration Portal — Express API + static frontend.
 */
const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');

const { initSchema, run, get, all } = require('./db');
const { seed } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'utsav-dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
  })
);

app.use(express.static(path.join(__dirname, 'public')));

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Please log in to continue.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.role !== 'admin') {
    return res.status(403).json({ error: 'This action requires an admin account.' });
  }
  next();
}

async function buildEventsForUser(userId) {
  const events = await all(
    `SELECT id, title, event_date, event_time, max_participants
     FROM events
     ORDER BY event_date, id`
  );

  const result = [];
  for (const e of events) {
    const rows = await all(
      `SELECT u.id AS user_id, u.full_name
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       WHERE r.event_id = ?
       ORDER BY u.full_name`,
      [e.id]
    );

    const participantNames = rows.map((r) => r.full_name);
    const currentCount = rows.length;
    const availableSeats = Math.max(0, e.max_participants - currentCount);
    const alreadyRegistered = userId
      ? rows.some((r) => r.user_id === userId)
      : false;

    result.push({
      id: e.id,
      title: e.title,
      event_date: e.event_date,
      event_time: e.event_time,
      max_participants: e.max_participants,
      current_count: currentCount,
      available_seats: availableSeats,
      participant_names: participantNames,
      already_registered: alreadyRegistered,
      is_full: currentCount >= e.max_participants,
    });
  }
  return result;
}

// --- Auth API ---

app.post('/api/register', async (req, res) => {
  try {
    const { full_name, email, password, college } = req.body;
    if (!full_name || !email || !password || !college) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const emailNorm = String(email).trim().toLowerCase();
    const existing = await get(`SELECT id FROM users WHERE lower(email) = ?`, [emailNorm]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(String(password), 10);
    await run(
      `INSERT INTO users (full_name, email, password, college, role)
       VALUES (?, ?, ?, ?, 'user')`,
      [String(full_name).trim(), emailNorm, hash, String(college).trim()]
    );

    return res.status(201).json({ message: 'Registration successful. You can log in now.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const emailNorm = String(email).trim().toLowerCase();
    const user = await get(`SELECT * FROM users WHERE lower(email) = ?`, [emailNorm]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.email = user.email;

    return res.json({
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        college: user.college,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out.' });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out.' });
  });
});

app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const user = await get(
      `SELECT id, full_name, email, college, role, created_at FROM users WHERE id = ?`,
      [req.session.userId]
    );
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Session expired.' });
    }
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load profile.' });
  }
});

// --- Events (logged-in users) ---

app.get('/api/events', requireAuth, async (req, res) => {
  try {
    const events = await buildEventsForUser(req.session.userId);
    return res.json({ events });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load events.' });
  }
});

app.post('/api/events/:eventId/participate', requireAuth, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    if (Number.isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event.' });
    }

    const eventRow = await get(
      `SELECT id, max_participants FROM events WHERE id = ?`,
      [eventId]
    );
    if (!eventRow) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const countRow = await get(
      `SELECT COUNT(*) AS c FROM registrations WHERE event_id = ?`,
      [eventId]
    );
    const current = countRow ? countRow.c : 0;
    if (current >= eventRow.max_participants) {
      return res.status(400).json({ error: 'This event is full.' });
    }

    const existing = await get(
      `SELECT id FROM registrations WHERE user_id = ? AND event_id = ?`,
      [req.session.userId, eventId]
    );
    if (existing) {
      return res.status(400).json({ error: 'You are already registered for this event.' });
    }

    await run(`INSERT INTO registrations (user_id, event_id) VALUES (?, ?)`, [
      req.session.userId,
      eventId,
    ]);

    return res.json({ message: 'You are registered for this event.' });
  } catch (err) {
    if (err && err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'You are already registered for this event.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Could not complete registration.' });
  }
});

// --- Admin API ---

app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await all(
      `SELECT id, full_name, email, college, role, created_at FROM users ORDER BY id`
    );
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load users.' });
  }
});

app.get('/api/admin/event-summary', requireAuth, requireAdmin, async (req, res) => {
  try {
    const events = await buildEventsForUser(null);
    return res.json({ events });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load event summary.' });
  }
});

// SPA fallback: send index for unknown GET (optional) — keep simple; only static files.

async function start() {
  await initSchema();
  await seed();

  app.listen(PORT, () => {
    console.log(`Utsav portal running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
