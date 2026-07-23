'use strict';

// AdminConfig is loaded by config.js (included BEFORE this file in index.html)
const API = AdminConfig.API;

// ── Redirect if already logged in ────────────────────────────────────────────
if (localStorage.getItem('admin_token')) {
  window.location.href = 'dashboard.html';
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function setLoading(on) {
  const btn     = document.getElementById('loginBtn');
  const txt     = document.getElementById('loginBtnText');
  const spinner = document.getElementById('loginSpinner');
  btn.disabled  = on;
  txt.textContent = on ? 'Signing in…' : 'Sign In';
  spinner.classList.toggle('hidden', !on);
}

function showAlert(msg, type = 'error') {
  const el = document.getElementById('loginAlert');
  el.textContent = msg;
  el.className   = `alert alert-${type}`;
  el.classList.remove('hidden');
}

function clearErrors() {
  document.getElementById('loginAlert').classList.add('hidden');
  document.getElementById('usernameErr').textContent = '';
  document.getElementById('passwordErr').textContent = '';
}

// ── Password toggle ───────────────────────────────────────────────────────────
function togglePw() {
  const inp = document.getElementById('password');
  inp.type  = inp.type === 'password' ? 'text' : 'password';
}

// ── Form submit ───────────────────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  let valid = true;

  if (!username) {
    document.getElementById('usernameErr').textContent = 'Username is required.';
    valid = false;
  }
  if (!password) {
    document.getElementById('passwordErr').textContent = 'Password is required.';
    valid = false;
  }
  if (!valid) return;

  setLoading(true);

  try {
    const res  = await fetch(`${API}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password })
    });
    const json = await res.json();

    if (!res.ok) {
      showAlert(json.message || 'Login failed. Please check your credentials.');
      return;
    }

    localStorage.setItem('admin_token',    json.data.token);
    localStorage.setItem('admin_username', json.data.user.username);
    localStorage.setItem('admin_role',     json.data.user.role);
    window.location.href = 'dashboard.html';

  } catch (err) {
    showAlert('Cannot connect to server. Make sure the backend is running.');
    console.error(err);
  } finally {
    setLoading(false);
  }
});
