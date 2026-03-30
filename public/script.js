/**
 * Shared client logic: auth-aware navigation, forms, dashboards.
 * All API calls use credentials: 'include' so the session cookie is sent.
 */

const API = {
  async json(url, options = {}) {
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || res.statusText || 'Request failed');
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  },
};

function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.classList.remove('hidden', 'success', 'error');
  el.classList.add(type === 'error' ? 'error' : 'success');
}

function clearMsg(el) {
  if (!el) return;
  el.classList.add('hidden');
  el.textContent = '';
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

async function logout() {
  try {
    await API.json('/api/logout', { method: 'POST' });
  } catch (_) {
    /* still redirect */
  }
  window.location.href = '/login.html';
}

function wireLogout() {
  const btn = document.getElementById('logout-btn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
}

// --- Register ---
function initRegister() {
  const form = document.getElementById('register-form');
  const msg = document.getElementById('msg');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMsg(msg);
    const fd = new FormData(form);
    const body = {
      full_name: fd.get('full_name'),
      email: fd.get('email'),
      password: fd.get('password'),
      college: fd.get('college'),
    };
    try {
      const data = await API.json('/api/register', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      showMsg(msg, data.message || 'Registered.', 'success');
      form.reset();
    } catch (err) {
      showMsg(msg, err.body?.error || err.message, 'error');
    }
  });
}

// --- Login ---
function initLogin() {
  const form = document.getElementById('login-form');
  const msg = document.getElementById('msg');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMsg(msg);
    const fd = new FormData(form);
    const body = {
      email: fd.get('email'),
      password: fd.get('password'),
    };
    try {
      const data = await API.json('/api/login', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (data.user && data.user.role === 'admin') {
        window.location.href = '/admin.html';
      } else {
        window.location.href = '/dashboard.html';
      }
    } catch (err) {
      showMsg(msg, err.body?.error || err.message, 'error');
    }
  });
}

// --- User dashboard ---
function renderEventCard(ev) {
  const names =
    ev.participant_names && ev.participant_names.length
      ? ev.participant_names.map(escapeHtml).join(', ')
      : '—';

  let actionHtml = '';
  if (ev.already_registered) {
    actionHtml =
      '<span class="badge badge-warn">Already registered</span>' +
      '<button type="button" class="btn btn-primary" disabled>Participate</button>';
  } else if (ev.is_full) {
    actionHtml =
      '<span class="badge badge-muted">Event full</span>' +
      '<button type="button" class="btn btn-primary" disabled>Participate</button>';
  } else {
    actionHtml = `<button type="button" class="btn btn-primary participate-btn" data-event-id="${ev.id}">Participate</button>`;
  }

  return `
    <article class="event-card">
      <h3>${escapeHtml(ev.title)}</h3>
      <div class="event-meta">${escapeHtml(ev.event_date)} · ${escapeHtml(ev.event_time)}</div>
      <div class="event-stats">
        Max: ${ev.max_participants} · Joined: ${ev.current_count} ·
        Available: ${ev.available_seats}
      </div>
      <p class="participants-list"><strong>Participants:</strong> ${names}</p>
      <div style="margin-top: auto; padding-top: 0.75rem">${actionHtml}</div>
    </article>
  `;
}

function bindParticipateButtons(root, msg) {
  if (!root) return;
  root.querySelectorAll('.participate-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-event-id');
      clearMsg(msg);
      try {
        const data = await API.json(`/api/events/${id}/participate`, { method: 'POST' });
        showMsg(msg, data.message || 'Success!', 'success');
        const { events: refreshed } = await API.json('/api/events');
        root.innerHTML = refreshed.map((ev) => renderEventCard(ev)).join('');
        bindParticipateButtons(root, msg);
      } catch (err) {
        showMsg(msg, err.body?.error || err.message, 'error');
      }
    });
  });
}

async function initDashboard() {
  const root = document.getElementById('events-root');
  const loading = document.getElementById('events-loading');
  const msg = document.getElementById('msg');
  const greeting = document.getElementById('user-greeting');
  const adminLink = document.getElementById('admin-link');

  try {
    const me = await API.json('/api/me');
    if (greeting) {
      greeting.innerHTML = `Hi, <strong>${escapeHtml(me.user.full_name)}</strong>`;
    }
    if (adminLink && me.user.role === 'admin') {
      adminLink.classList.remove('hidden');
      adminLink.href = '/admin.html';
    }
  } catch {
    window.location.href = '/login.html';
    return;
  }

  wireLogout();

  try {
    const { events } = await API.json('/api/events');
    if (loading) loading.classList.add('hidden');
    if (root) {
      root.innerHTML = events.map((ev) => renderEventCard(ev)).join('');
      bindParticipateButtons(root, msg);
    }
  } catch (err) {
    if (loading) loading.textContent = 'Could not load events.';
    showMsg(msg, err.body?.error || err.message, 'error');
  }
}

// --- Admin ---
async function initAdmin() {
  const loading = document.getElementById('admin-loading');
  const msg = document.getElementById('msg');
  const usersSection = document.getElementById('users-section');
  const eventsSection = document.getElementById('events-section');
  const usersTbody = document.getElementById('users-tbody');
  const eventsRoot = document.getElementById('admin-events-root');

  try {
    const me = await API.json('/api/me');
    if (me.user.role !== 'admin') {
      window.location.href = '/dashboard.html';
      return;
    }
  } catch {
    window.location.href = '/login.html';
    return;
  }

  wireLogout();

  try {
    const [usersData, summaryData] = await Promise.all([
      API.json('/api/users'),
      API.json('/api/admin/event-summary'),
    ]);

    if (loading) loading.classList.add('hidden');

    if (usersTbody && usersSection) {
      usersTbody.innerHTML = usersData.users
        .map(
          (u) =>
            `<tr>
              <td>${u.id}</td>
              <td>${escapeHtml(u.full_name)}</td>
              <td>${escapeHtml(u.email)}</td>
              <td>${escapeHtml(u.college)}</td>
              <td>${escapeHtml(u.role)}</td>
            </tr>`
        )
        .join('');
      usersSection.style.display = 'block';
    }

    if (eventsRoot && eventsSection) {
      eventsRoot.innerHTML = summaryData.events
        .map((ev) => {
          const occupied = ev.current_count;
          const avail = ev.available_seats;
          const names =
            ev.participant_names && ev.participant_names.length
              ? ev.participant_names.map(escapeHtml).join(', ')
              : '—';
          return `
            <div class="event-card" style="margin-bottom: 1rem">
              <h3>${escapeHtml(ev.title)}</h3>
              <div class="event-meta">${escapeHtml(ev.event_date)} · ${escapeHtml(ev.event_time)}</div>
              <div class="event-stats">
                Max seats: ${ev.max_participants} · Occupied: ${occupied} · Available: ${avail}
              </div>
              <p class="participants-list"><strong>Participants:</strong> ${names}</p>
            </div>
          `;
        })
        .join('');
      eventsSection.style.display = 'block';
    }
  } catch (err) {
    if (loading) loading.textContent = 'Could not load admin data.';
    showMsg(msg, err.body?.error || err.message, 'error');
  }
}

// --- Boot by page ---
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.endsWith('/register.html') || path.endsWith('/register')) {
    initRegister();
  } else if (path.endsWith('/login.html') || path.endsWith('/login')) {
    initLogin();
  } else if (path.endsWith('/dashboard.html') || path.endsWith('/dashboard')) {
    initDashboard();
  } else if (path.endsWith('/admin.html') || path.endsWith('/admin')) {
    initAdmin();
  }
});
