'use strict';

// AdminConfig is loaded by config.js (included BEFORE this file in index.html)
const API   = AdminConfig.API;
const BASE  = AdminConfig.BASE;
const TOKEN = () => localStorage.getItem('admin_token');

// ── Auth Guard ────────────────────────────────────────────────────────────────
if (!TOKEN()) window.location.href = 'index.html';

// ── Hydrate sidebar user info ─────────────────────────────────────────────────
const uname = localStorage.getItem('admin_username') || 'Admin';
document.getElementById('sidebarUsername').textContent = uname;
document.getElementById('sidebarRole').textContent     = localStorage.getItem('admin_role') || 'admin';
document.getElementById('userAvatar').textContent      = uname.charAt(0).toUpperCase();

// ── Logout ────────────────────────────────────────────────────────────────────
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// ── API Helper ─────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = { Authorization: `Bearer ${TOKEN()}`, ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res  = await fetch(`${API}${path}`, { ...options, headers });
  const json = await res.json();
  if (res.status === 401) { logout(); return null; }
  return { ok: res.ok, status: res.status, data: json };
}

// ── Show inline alert inside a container ─────────────────────────────────────
function showInlineAlert(containerId, msg, type = 'error') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  setTimeout(() => { if (el) el.innerHTML = ''; }, 5000);
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });
});

// ── Confirm delete helper ─────────────────────────────────────────────────────
function confirmDelete(message, onConfirm) {
  document.getElementById('deleteModalMsg').textContent = message;
  const btn = document.getElementById('deleteConfirmBtn');
  // Clone to remove old listener
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  newBtn.addEventListener('click', () => {
    closeModal('deleteModal');
    onConfirm();
  });
  openModal('deleteModal');
}

// ── Nav routing ───────────────────────────────────────────────────────────────
const sectionMeta = {
  overview:     { title: 'Dashboard',    sub: 'Overview of your portfolio.' },
  profile:      { title: 'Profile',      sub: 'Manage your personal information.' },
  experiences:  { title: 'Experience',   sub: 'Add and manage your work history.' },
  projects:     { title: 'Projects',     sub: 'Manage your portfolio projects.' },
  education:    { title: 'Education',    sub: 'Your academic background.' },
  certificates: { title: 'Certificates', sub: 'Professional certifications.' },
  skills:       { title: 'Skills',       sub: 'Your technical and soft skills.' },
  contacts:     { title: 'Messages',     sub: 'Messages from portfolio visitors.' },
  security:     { title: 'Security',     sub: 'Manage your account password.' }
};

function navigateTo(section) {
  // Hide all sections
  document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show target
  const panel = document.getElementById(`section-${section}`);
  if (panel) panel.classList.add('active');

  const navEl = document.querySelector(`.nav-item[data-section="${section}"]`);
  if (navEl) navEl.classList.add('active');

  const meta = sectionMeta[section] || { title: section, sub: '' };
  document.getElementById('headerTitle').textContent = meta.title;
  document.getElementById('headerSub').textContent   = meta.sub;

  // Lazy-load section data
  if (section === 'overview')     loadOverview();
  if (section === 'profile')      loadProfile();
  if (section === 'experiences')  loadExperiences();
  if (section === 'projects')     loadProjects();
  if (section === 'education')    loadEducation();
  if (section === 'certificates') loadCertificates();
  if (section === 'skills')       loadSkills();
  if (section === 'contacts')     loadContacts();
}

document.querySelectorAll('.nav-item[data-section]').forEach(item => {
  item.addEventListener('click', () => {
    navigateTo(item.dataset.section);
    // Also close mobile sidebar when a nav item is tapped
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.remove('open');
  });
});

// ── Overview loader ───────────────────────────────────────────────────────────
async function loadOverview() {
  const [projects, experiences, certificates, skills, contacts] = await Promise.all([
    apiFetch('/projects'),
    apiFetch('/experiences'),
    apiFetch('/certificates'),
    apiFetch('/skills'),
    apiFetch('/contacts')
  ]);

  if (projects)     document.getElementById('statProjects').textContent = projects.data.data?.length ?? 0;
  if (experiences)  document.getElementById('statExp').textContent      = experiences.data.data?.length ?? 0;
  if (certificates) document.getElementById('statCerts').textContent    = certificates.data.data?.length ?? 0;
  if (skills)       document.getElementById('statSkills').textContent   = skills.data.data?.length ?? 0;

  const unread = contacts?.data?.unread_count ?? 0;
  document.getElementById('statMsgs').textContent = unread;
  updateBadge(unread);

  // Recent messages table
  const msgs = contacts?.data?.data?.slice(0, 5) || [];
  const tbody = document.getElementById('recentMsgs');
  if (msgs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-muted">No messages yet.</td></tr>';
    return;
  }
  tbody.innerHTML = msgs.map(m => `
    <tr class="${!m.is_read ? 'unread-row' : ''}">
      <td>${escHtml(m.sender_name)}</td>
      <td>${escHtml(m.subject || '—')}</td>
      <td>${fmtDate(m.created_at)}</td>
      <td><span class="badge ${m.is_read ? 'badge-gray' : 'badge-blue'}">${m.is_read ? 'Read' : 'Unread'}</span></td>
    </tr>`).join('');
}

// ── Badge updater ─────────────────────────────────────────────────────────────
function updateBadge(count) {
  const badge = document.getElementById('navBadge');
  if (count > 0) { badge.textContent = count; badge.classList.remove('hidden'); }
  else           { badge.classList.add('hidden'); }
}

// ── Password strength ─────────────────────────────────────────────────────────
function checkPwStrength(val) {
  const fill  = document.getElementById('pwStrengthFill');
  const label = document.getElementById('pwStrengthLabel');
  let score = 0;
  if (val.length >= 8)               score++;
  if (/[A-Z]/.test(val))             score++;
  if (/[0-9]/.test(val))             score++;
  if (/[^A-Za-z0-9]/.test(val))      score++;
  const levels = [
    { pct: '0%',   color: '',              text: '' },
    { pct: '25%',  color: '#ef4444',       text: 'Weak' },
    { pct: '50%',  color: '#f59e0b',       text: 'Fair' },
    { pct: '75%',  color: '#3b82f6',       text: 'Good' },
    { pct: '100%', color: '#22c55e',       text: 'Strong' }
  ];
  fill.style.width      = levels[score].pct;
  fill.style.background = levels[score].color;
  label.textContent     = levels[score].text;
}

// ── Change password (Security section) ───────────────────────────────────────
async function changePassword() {
  const cur     = document.getElementById('curPw').value;
  const nw      = document.getElementById('newPw').value;
  const confirm = document.getElementById('confirmPw').value;

  if (!cur || !nw || !confirm) {
    showInlineAlert('securityAlert', 'All fields are required.'); return;
  }
  if (nw.length < 8) {
    showInlineAlert('securityAlert', 'New password must be at least 8 characters.'); return;
  }
  if (nw !== confirm) {
    showInlineAlert('securityAlert', 'Passwords do not match.'); return;
  }

  const r = await apiFetch('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword: cur, newPassword: nw })
  });
  if (!r) return;

  if (r.ok) {
    showInlineAlert('securityAlert', 'Password updated successfully.', 'success');
    document.getElementById('curPw').value     = '';
    document.getElementById('newPw').value     = '';
    document.getElementById('confirmPw').value = '';
    checkPwStrength('');
  } else {
    showInlineAlert('securityAlert', r.data.message || 'Failed to update password.');
  }
}

// ── Admin saved flash ─────────────────────────────────────────────────────────
function showAdminSaved() {
  const el = document.getElementById('adminSaveStatus');
  if (!el) return;
  el.style.display = '';
  el.style.opacity = '1';
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => { el.style.display = 'none'; }, 350);
  }, 2200);
}

// ── Utility ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
}

function setBtnLoading(btnId, loading, defaultText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled     = loading;
  btn.textContent  = loading ? 'Saving…' : defaultText;
}

// ── Init ───────────────────────────────────────────────────────────────────────
loadOverview();
