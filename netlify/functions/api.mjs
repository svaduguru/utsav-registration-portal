import { getStore } from '@netlify/blobs';
import { randomBytes, subtle } from 'crypto';

// --- Crypto helpers (replaces bcrypt, works in serverless) ---

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );
  const saltHex = Buffer.from(salt).toString('hex');
  const hashHex = Buffer.from(derived).toString('hex');
  return `${saltHex}:${hashHex}`;
}

async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const key = await subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );
  return Buffer.from(derived).toString('hex') === hashHex;
}

// --- Store helpers ---

function getDataStore() {
  return getStore({ name: 'app-data', consistency: 'strong' });
}

function getSessionStore() {
  return getStore({ name: 'sessions', consistency: 'strong' });
}

async function getData(store, key) {
  const val = await store.get(key, { type: 'json' });
  return val;
}

async function setData(store, key, value) {
  await store.setJSON(key, value);
}

// --- Session helpers ---

function parseSessionToken(req) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)session=([^;]+)/);
  return match ? match[1] : null;
}

async function getSession(req) {
  const token = parseSessionToken(req);
  if (!token) return null;
  const sessionStore = getSessionStore();
  const session = await sessionStore.get(token, { type: 'json' });
  if (!session) return null;
  if (session.expiresAt && Date.now() > session.expiresAt) {
    await sessionStore.delete(token);
    return null;
  }
  return { ...session, _token: token };
}

async function createSession(userData) {
  const token = randomBytes(32).toString('hex');
  const sessionStore = getSessionStore();
  await sessionStore.setJSON(token, {
    userId: userData.id,
    role: userData.role,
    email: userData.email,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });
  return token;
}

function sessionCookie(token, maxAge = 86400) {
  return `session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}`;
}

// --- Data access ---

async function getUsers(store) {
  return (await getData(store, 'users')) || [];
}

async function getEvents(store) {
  return (await getData(store, 'events')) || [];
}

async function getRegistrations(store) {
  return (await getData(store, 'registrations')) || [];
}

async function saveUsers(store, users) {
  await setData(store, 'users', users);
}

async function saveEvents(store, events) {
  await setData(store, 'events', events);
}

async function saveRegistrations(store, regs) {
  await setData(store, 'registrations', regs);
}

// --- Seed data ---

const SEED_EVENTS = [
  { title: 'Dance Battle', event_date: '2026-04-10', event_time: '10:00 AM', max_participants: 10 },
  { title: 'Quiz Contest', event_date: '2026-04-10', event_time: '12:00 PM', max_participants: 10 },
  { title: 'Fashion Walk', event_date: '2026-04-10', event_time: '03:00 PM', max_participants: 10 },
  { title: 'Music Solo', event_date: '2026-04-11', event_time: '10:00 AM', max_participants: 10 },
  { title: 'Group Singing', event_date: '2026-04-11', event_time: '01:00 PM', max_participants: 10 },
  { title: 'Coding Challenge', event_date: '2026-04-11', event_time: '03:30 PM', max_participants: 10 },
];

const SEED_DEMO_USERS = [
  { full_name: 'Ananya', email: 'ananya@example.com', password: 'pass123', college: 'ABC College' },
  { full_name: 'Rahul', email: 'rahul@example.com', password: 'pass123', college: 'XYZ College' },
  { full_name: 'Meera', email: 'meera@example.com', password: 'pass123', college: 'ABC College' },
  { full_name: 'Arjun', email: 'arjun@example.com', password: 'pass123', college: 'LMN College' },
  { full_name: 'Kiran', email: 'kiran@example.com', password: 'pass123', college: 'PQR College' },
  { full_name: 'Pooja', email: 'pooja@example.com', password: 'pass123', college: 'STU College' },
  { full_name: 'Vikas', email: 'vikas@example.com', password: 'pass123', college: 'DEF College' },
];

const SEED_REGISTRATIONS = {
  'Dance Battle': ['Ananya', 'Rahul', 'Meera'],
  'Quiz Contest': ['Rahul', 'Arjun', 'Kiran'],
  'Fashion Walk': ['Meera', 'Pooja'],
  'Music Solo': ['Ananya', 'Vikas'],
  'Group Singing': ['Arjun', 'Kiran', 'Pooja'],
  'Coding Challenge': ['Rahul', 'Vikas'],
};

async function ensureSeeded(store) {
  const existing = await getData(store, 'seeded');
  if (existing) return;

  const demoHash = await hashPassword('pass123');
  const adminHash = await hashPassword('admin123');

  let nextId = 1;
  const users = [];

  // Admin
  users.push({
    id: nextId++,
    full_name: 'Utsav Admin',
    email: 'admin@utsav.com',
    password: adminHash,
    college: 'Utsav Committee',
    role: 'admin',
    created_at: new Date().toISOString(),
  });

  // Demo users
  for (const u of SEED_DEMO_USERS) {
    users.push({
      id: nextId++,
      full_name: u.full_name,
      email: u.email,
      password: demoHash,
      college: u.college,
      role: 'user',
      created_at: new Date().toISOString(),
    });
  }

  let eventId = 1;
  const events = SEED_EVENTS.map((e) => ({ id: eventId++, ...e }));

  const registrations = [];
  let regId = 1;
  for (const [eventTitle, names] of Object.entries(SEED_REGISTRATIONS)) {
    const ev = events.find((e) => e.title === eventTitle);
    if (!ev) continue;
    for (const name of names) {
      const user = users.find((u) => u.full_name === name);
      if (!user) continue;
      registrations.push({
        id: regId++,
        user_id: user.id,
        event_id: ev.id,
        created_at: new Date().toISOString(),
      });
    }
  }

  await saveUsers(store, users);
  await saveEvents(store, events);
  await saveRegistrations(store, registrations);
  await setData(store, 'next_user_id', nextId);
  await setData(store, 'next_event_id', eventId);
  await setData(store, 'next_reg_id', regId);
  await setData(store, 'seeded', true);
}

// --- Build events for user ---

async function buildEventsForUser(store, userId) {
  const events = await getEvents(store);
  const registrations = await getRegistrations(store);
  const users = await getUsers(store);

  const sorted = [...events].sort((a, b) => {
    if (a.event_date !== b.event_date) return a.event_date.localeCompare(b.event_date);
    return a.id - b.id;
  });

  return sorted.map((e) => {
    const eventRegs = registrations.filter((r) => r.event_id === e.id);
    const participantNames = eventRegs.map((r) => {
      const u = users.find((u) => u.id === r.user_id);
      return u ? u.full_name : 'Unknown';
    }).sort();
    const currentCount = eventRegs.length;
    const availableSeats = Math.max(0, e.max_participants - currentCount);
    const alreadyRegistered = userId ? eventRegs.some((r) => r.user_id === userId) : false;

    return {
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
    };
  });
}

// --- Router ---

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export default async (req, context) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  const store = getDataStore();
  await ensureSeeded(store);

  // POST /api/register
  if (method === 'POST' && path === '/api/register') {
    try {
      const body = await req.json();
      const { full_name, email, password, college } = body;
      if (!full_name || !email || !password || !college) {
        return jsonResponse({ error: 'All fields are required.' }, 400);
      }
      const emailNorm = String(email).trim().toLowerCase();
      const users = await getUsers(store);
      if (users.find((u) => u.email === emailNorm)) {
        return jsonResponse({ error: 'An account with this email already exists.' }, 409);
      }

      const hash = await hashPassword(String(password));
      let nextId = (await getData(store, 'next_user_id')) || users.length + 1;
      const newUser = {
        id: nextId,
        full_name: String(full_name).trim(),
        email: emailNorm,
        password: hash,
        college: String(college).trim(),
        role: 'user',
        created_at: new Date().toISOString(),
      };
      users.push(newUser);
      await saveUsers(store, users);
      await setData(store, 'next_user_id', nextId + 1);

      return jsonResponse({ message: 'Registration successful. You can log in now.' }, 201);
    } catch (err) {
      console.error(err);
      return jsonResponse({ error: 'Registration failed. Please try again.' }, 500);
    }
  }

  // POST /api/login
  if (method === 'POST' && path === '/api/login') {
    try {
      const body = await req.json();
      const { email, password } = body;
      if (!email || !password) {
        return jsonResponse({ error: 'Email and password are required.' }, 400);
      }
      const emailNorm = String(email).trim().toLowerCase();
      const users = await getUsers(store);
      const user = users.find((u) => u.email === emailNorm);
      if (!user) {
        return jsonResponse({ error: 'Invalid email or password.' }, 401);
      }

      const ok = await verifyPassword(String(password), user.password);
      if (!ok) {
        return jsonResponse({ error: 'Invalid email or password.' }, 401);
      }

      const token = await createSession(user);
      return jsonResponse(
        {
          message: 'Logged in successfully.',
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            college: user.college,
            role: user.role,
          },
        },
        200,
        { 'Set-Cookie': sessionCookie(token) }
      );
    } catch (err) {
      console.error(err);
      return jsonResponse({ error: 'Login failed. Please try again.' }, 500);
    }
  }

  // POST /api/logout
  if (method === 'POST' && path === '/api/logout') {
    const session = await getSession(req);
    if (session && session._token) {
      const sessionStore = getSessionStore();
      await sessionStore.delete(session._token);
    }
    return jsonResponse(
      { message: 'Logged out.' },
      200,
      { 'Set-Cookie': sessionCookie('', 0) }
    );
  }

  // --- Auth-required routes ---

  // GET /api/me
  if (method === 'GET' && path === '/api/me') {
    const session = await getSession(req);
    if (!session) return jsonResponse({ error: 'Please log in to continue.' }, 401);

    const users = await getUsers(store);
    const user = users.find((u) => u.id === session.userId);
    if (!user) return jsonResponse({ error: 'Session expired.' }, 401);

    return jsonResponse({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        college: user.college,
        role: user.role,
        created_at: user.created_at,
      },
    });
  }

  // GET /api/events
  if (method === 'GET' && path === '/api/events') {
    const session = await getSession(req);
    if (!session) return jsonResponse({ error: 'Please log in to continue.' }, 401);

    const events = await buildEventsForUser(store, session.userId);
    return jsonResponse({ events });
  }

  // POST /api/events/:eventId/participate
  const participateMatch = path.match(/^\/api\/events\/(\d+)\/participate$/);
  if (method === 'POST' && participateMatch) {
    const session = await getSession(req);
    if (!session) return jsonResponse({ error: 'Please log in to continue.' }, 401);

    const eventId = parseInt(participateMatch[1], 10);
    const events = await getEvents(store);
    const eventRow = events.find((e) => e.id === eventId);
    if (!eventRow) return jsonResponse({ error: 'Event not found.' }, 404);

    const registrations = await getRegistrations(store);
    const eventRegs = registrations.filter((r) => r.event_id === eventId);

    if (eventRegs.length >= eventRow.max_participants) {
      return jsonResponse({ error: 'This event is full.' }, 400);
    }

    if (eventRegs.some((r) => r.user_id === session.userId)) {
      return jsonResponse({ error: 'You are already registered for this event.' }, 400);
    }

    let nextRegId = (await getData(store, 'next_reg_id')) || registrations.length + 1;
    registrations.push({
      id: nextRegId,
      user_id: session.userId,
      event_id: eventId,
      created_at: new Date().toISOString(),
    });
    await saveRegistrations(store, registrations);
    await setData(store, 'next_reg_id', nextRegId + 1);

    return jsonResponse({ message: 'You are registered for this event.' });
  }

  // GET /api/users (admin)
  if (method === 'GET' && path === '/api/users') {
    const session = await getSession(req);
    if (!session) return jsonResponse({ error: 'Please log in to continue.' }, 401);
    if (session.role !== 'admin') return jsonResponse({ error: 'This action requires an admin account.' }, 403);

    const users = await getUsers(store);
    return jsonResponse({
      users: users.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        college: u.college,
        role: u.role,
        created_at: u.created_at,
      })),
    });
  }

  // GET /api/admin/event-summary
  if (method === 'GET' && path === '/api/admin/event-summary') {
    const session = await getSession(req);
    if (!session) return jsonResponse({ error: 'Please log in to continue.' }, 401);
    if (session.role !== 'admin') return jsonResponse({ error: 'This action requires an admin account.' }, 403);

    const events = await buildEventsForUser(store, null);
    return jsonResponse({ events });
  }

  return jsonResponse({ error: 'Not found' }, 404);
};

export const config = {
  path: '/api/*',
};
