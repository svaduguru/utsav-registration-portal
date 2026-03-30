/**
 * Idempotent seed: runs after schema exists.
 * Uses INSERT OR IGNORE / checks so re-starts do not duplicate rows.
 */
const bcrypt = require('bcrypt');
const { run, get, all } = require('./db');

const SALT_ROUNDS = 10;

async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

const SEED_EVENTS = [
  ['Dance Battle', '2026-04-10', '10:00 AM', 10],
  ['Quiz Contest', '2026-04-10', '12:00 PM', 10],
  ['Fashion Walk', '2026-04-10', '03:00 PM', 10],
  ['Music Solo', '2026-04-11', '10:00 AM', 10],
  ['Group Singing', '2026-04-11', '01:00 PM', 10],
  ['Coding Challenge', '2026-04-11', '03:30 PM', 10],
];

const SEED_DEMO_USERS = [
  ['Ananya', 'ananya@example.com', 'pass123', 'ABC College'],
  ['Rahul', 'rahul@example.com', 'pass123', 'XYZ College'],
  ['Meera', 'meera@example.com', 'pass123', 'ABC College'],
  ['Arjun', 'arjun@example.com', 'pass123', 'LMN College'],
  ['Kiran', 'kiran@example.com', 'pass123', 'PQR College'],
  ['Pooja', 'pooja@example.com', 'pass123', 'STU College'],
  ['Vikas', 'vikas@example.com', 'pass123', 'DEF College'],
];

/** eventTitle -> array of participant full names (must match seeded users) */
const SEED_REGISTRATIONS = {
  'Dance Battle': ['Ananya', 'Rahul', 'Meera'],
  'Quiz Contest': ['Rahul', 'Arjun', 'Kiran'],
  'Fashion Walk': ['Meera', 'Pooja'],
  'Music Solo': ['Ananya', 'Vikas'],
  'Group Singing': ['Arjun', 'Kiran', 'Pooja'],
  'Coding Challenge': ['Rahul', 'Vikas'],
};

async function seedAdmin() {
  const row = await get(`SELECT id FROM users WHERE email = ?`, ['admin@utsav.com']);
  if (row) return;

  const hash = await hashPassword('admin123');
  await run(
    `INSERT INTO users (full_name, email, password, college, role)
     VALUES (?, ?, ?, ?, ?)`,
    ['Utsav Admin', 'admin@utsav.com', hash, 'Utsav Committee', 'admin']
  );
}

async function seedEvents() {
  for (const [title, eventDate, eventTime, maxP] of SEED_EVENTS) {
    await run(
      `INSERT OR IGNORE INTO events (title, event_date, event_time, max_participants)
       VALUES (?, ?, ?, ?)`,
      [title, eventDate, eventTime, maxP]
    );
  }
}

async function seedDemoUsers() {
  const demoHash = await hashPassword('pass123');
  for (const [fullName, email, _pass, college] of SEED_DEMO_USERS) {
    await run(
      `INSERT OR IGNORE INTO users (full_name, email, password, college, role)
       VALUES (?, ?, ?, ?, 'user')`,
      [fullName, email, demoHash, college]
    );
  }
}

async function seedRegistrations() {
  const users = await all(`SELECT id, full_name FROM users`);
  const nameToId = new Map(users.map((u) => [u.full_name, u.id]));

  const events = await all(`SELECT id, title FROM events`);
  const titleToId = new Map(events.map((e) => [e.title, e.id]));

  for (const [eventTitle, names] of Object.entries(SEED_REGISTRATIONS)) {
    const eventId = titleToId.get(eventTitle);
    if (!eventId) continue;

    for (const fullName of names) {
      const userId = nameToId.get(fullName);
      if (!userId) continue;

      await run(
        `INSERT OR IGNORE INTO registrations (user_id, event_id) VALUES (?, ?)`,
        [userId, eventId]
      );
    }
  }
}

async function seed() {
  await seedAdmin();
  await seedEvents();
  await seedDemoUsers();
  await seedRegistrations();
}

module.exports = { seed };
