'use strict';

/* ================================================================
   PORTFOLIO MAIN — main.js  v3.0
   New in v3:
   - Typing animation (hero title cycles through roles)
   - Scroll progress bar (top of page)
   - Project search input (real-time filter by title/tech/desc)
   - Project hover overlay with quick-view detail
   - Photo float animation
   - Cloudinary URL auto-optimization (webp + auto quality)
   - JSON-LD structured data (Person schema)
   - Canonical URL tag
   - Hire Me CTA section (i18n + open_to_work aware)
   ================================================================ */

// ── Config ───────────────────────────────────────────────────────
const API  = PortfolioConfig.API;
const BASE = PortfolioConfig.BASE; // kept for non-Cloudinary fallback

// ── i18n Strings ─────────────────────────────────────────────────
const i18n = {
  en: {
    'nav.about':        'About',
    'nav.experience':   'Experience',
    'nav.projects':     'Projects',
    'nav.skills':       'Skills',
    'nav.education':    'Education',
    'nav.certificates': 'Certificates',
    'nav.contact':      'Contact',
    'hero.openToWork':  'Open to Work',
    'hero.viewWork':    'View My Work',
    'hero.downloadCV':  'Download CV',
    'hero.yearsExp':    'Years Exp.',
    'hero.projects':    'Projects',
    'hero.certs':       'Certs',
    'section.about':        'About Me',
    'section.aboutSub':     'A bit more about who I am',
    'section.experience':   'Work Experience',
    'section.experienceSub':'My professional journey',
    'section.projects':     'Projects',
    'section.projectsSub':  "Things I've built",
    'section.skills':       'Skills',
    'section.skillsSub':    'Technologies I work with',
    'section.education':    'Education',
    'section.educationSub': 'Academic background',
    'section.certificates': 'Certificates',
    'section.certificatesSub': 'Professional certifications',
    'section.contact':      'Get In Touch',
    'section.contactSub':   "Have a project in mind? Let's talk.",
    'projects.all':       'All',
    'projects.empty':     'No projects found.',
    'projects.search':    'Search projects…',
    'hire.available':     'Available for new projects',
    'hire.title':         "Let's Work Together",
    'hire.sub':           "I'm open to freelance projects, full-time roles, and interesting collaborations. Got something in mind?",
    'hire.remote':        '🌍 Remote-friendly',
    'hire.freelance':     '💼 Freelance / Full-time',
    'hire.collab':        '🤝 Open Source',
    'hire.cta':           'Get In Touch →',
    'contact.name':     'Full Name *',
    'contact.email':    'Email Address *',
    'contact.subject':  'Subject',
    'contact.message':  'Message *',
    'contact.send':     'Send Message',
    'contact.success':  "Message sent! I'll get back to you soon.",
    'contact.errName':  'Name is required.',
    'contact.errEmail': 'Valid email is required.',
    'contact.errMsg':   'Message is required.',
    'exp.present':      'Present',
    'exp.location':     'Location',
    'no.data':          'No data added yet.',
  },
  id: {
    'nav.about':        'Tentang',
    'nav.experience':   'Pengalaman',
    'nav.projects':     'Proyek',
    'nav.skills':       'Keahlian',
    'nav.education':    'Pendidikan',
    'nav.certificates': 'Sertifikat',
    'nav.contact':      'Kontak',
    'hero.openToWork':  'Terbuka untuk Bekerja',
    'hero.viewWork':    'Lihat Proyek Saya',
    'hero.downloadCV':  'Unduh CV',
    'hero.yearsExp':    'Thn. Pengalaman',
    'hero.projects':    'Proyek',
    'hero.certs':       'Sertifikat',
    'section.about':        'Tentang Saya',
    'section.aboutSub':     'Sedikit lebih banyak tentang saya',
    'section.experience':   'Pengalaman Kerja',
    'section.experienceSub':'Perjalanan profesional saya',
    'section.projects':     'Proyek',
    'section.projectsSub':  'Hal-hal yang telah saya bangun',
    'section.skills':       'Keahlian',
    'section.skillsSub':    'Teknologi yang saya gunakan',
    'section.education':    'Pendidikan',
    'section.educationSub': 'Latar belakang akademik',
    'section.certificates': 'Sertifikat',
    'section.certificatesSub': 'Sertifikasi profesional',
    'section.contact':      'Hubungi Saya',
    'section.contactSub':   'Punya proyek? Mari bicara.',
    'projects.all':       'Semua',
    'projects.empty':     'Tidak ada proyek ditemukan.',
    'projects.search':    'Cari proyek…',
    'hire.available':     'Tersedia untuk proyek baru',
    'hire.title':         'Mari Bekerja Sama',
    'hire.sub':           'Saya terbuka untuk proyek freelance, posisi penuh waktu, dan kolaborasi menarik. Punya sesuatu di benak Anda?',
    'hire.remote':        '🌍 Ramah Remote',
    'hire.freelance':     '💼 Freelance / Penuh Waktu',
    'hire.collab':        '🤝 Open Source',
    'hire.cta':           'Hubungi Saya →',
    'contact.name':     'Nama Lengkap *',
    'contact.email':    'Alamat Email *',
    'contact.subject':  'Subjek',
    'contact.message':  'Pesan *',
    'contact.send':     'Kirim Pesan',
    'contact.success':  'Pesan terkirim! Saya akan segera merespons.',
    'contact.errName':  'Nama wajib diisi.',
    'contact.errEmail': 'Email yang valid diperlukan.',
    'contact.errMsg':   'Pesan wajib diisi.',
    'exp.present':      'Sekarang',
    'exp.location':     'Lokasi',
    'no.data':          'Belum ada data.',
  }
};

let currentLang  = localStorage.getItem('portfolio_lang')  || 'en';
let currentTheme = localStorage.getItem('portfolio_theme') || 'dark';

// ── Utility ───────────────────────────────────────────────────────
function t(key) { return (i18n[currentLang] || i18n.en)[key] || key; }

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/**
 * Bilingual field picker.
 * Returns the _id (Indonesian) version of a field when the UI language
 * is 'id' AND the translated value is non-empty; otherwise returns the
 * primary (English) value.
 *
 * Usage:  loc('title', profile)  →  p.title_id || p.title
 *         loc('description', exp) → e.description_id || e.description
 */
function loc(field, obj) {
  if (currentLang === 'id') {
    const translated = obj[`${field}_id`];
    if (translated && translated.trim()) return translated;
  }
  return obj[field] || '';
}

/**
 * Ensure a URL has a protocol so the browser doesn't treat it as a
 * relative path (which would cause a Vercel 404).
 * e.g. "github.com/user" → "https://github.com/user"
 */
function safeUrl(url) {
  if (!url) return '';
  const s = url.trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('mailto:') || s.startsWith('tel:')) return s;
  return 'https://' + s;
}
function fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US',
    { year: 'numeric', month: 'short' });
}
function fmtYear(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).getFullYear();
}
async function fetchJson(endpoint) {
  try {
    const res = await fetch(`${API}${endpoint}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch (e) {
    console.error(`[fetchJson] ${endpoint}`, e);
    return null;
  }
}
function show(id) { const el = document.getElementById(id); if (el) el.style.display = ''; }
function hide(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/**
 * Cloudinary URL optimizer — injects c_limit,w_900,f_webp,q_auto
 * into a Cloudinary delivery URL so the browser gets a compressed
 * WebP image instead of the original. Falls back to original URL if
 * the URL is not a Cloudinary URL (e.g. placeholder).
 */
function cloudinaryOptimize(url, width = 900) {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;
  // Insert transformation after /upload/
  return url.replace(
    '/upload/',
    `/upload/c_limit,w_${width},f_webp,q_auto/`
  );
}

// ── Apply i18n to DOM ─────────────────────────────────────────────
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (val) el.textContent = val;
  });
  // Update html lang attr
  document.documentElement.lang = currentLang === 'id' ? 'id' : 'en';
  // Update lang button label
  const langLabel = document.getElementById('langLabel');
  if (langLabel) langLabel.textContent = currentLang.toUpperCase();
  // Re-render filter tabs with new "All" translation
  rebuildProjectTabs();
}

// ── Theme Toggle ──────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const moon = document.getElementById('iconMoon');
  const sun  = document.getElementById('iconSun');
  if (theme === 'light') {
    moon?.classList.add('hidden');
    sun?.classList.remove('hidden');
  } else {
    moon?.classList.remove('hidden');
    sun?.classList.add('hidden');
  }
}

(function initTheme() {
  applyTheme(currentTheme);
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('portfolio_theme', currentTheme);
    applyTheme(currentTheme);
  });
})();

// ── Language Toggle ───────────────────────────────────────────────
// Store loaded data for re-render on lang switch
let _cachedProfile     = null;
let _cachedExperiences = null;
let _cachedSkills      = null;
let _cachedEducation   = null;
let _cachedCerts       = null;

(function initLang() {
  const btn = document.getElementById('langToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'id' : 'en';
    localStorage.setItem('portfolio_lang', currentLang);
    applyI18n();
    // Re-render ALL dynamic sections with new language
    if (_cachedProfile)     rerenderProfile(_cachedProfile);
    if (_cachedExperiences) rerenderExperiences(_cachedExperiences);
    if (allProjects.length) {
      rebuildProjectTabs();
      renderProjects(
        currentFilter === 'All' || currentFilter === 'Semua' || currentFilter === t('projects.all')
          ? allProjects
          : allProjects.filter(p => p.category === currentFilter)
      );
    }
    if (_cachedSkills)    rerenderSkills(_cachedSkills);
    if (_cachedEducation) rerenderEducation(_cachedEducation);
    if (_cachedCerts)     rerenderCerts(_cachedCerts);
  });
})();

// ── Scroll Progress Bar ───────────────────────────────────────────
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = pct + '%';
  }, { passive: true });
})();

// ── Typing Animation ──────────────────────────────────────────────
// _typingRoles is populated by loadProfile() from the DB title field.
// Falls back to a generic list if profile hasn't loaded yet.
let _typingRoles = ['Developer', 'Designer', 'Problem Solver'];
let _typingIdx   = 0;
let _charIdx     = 0;
let _typingDir   = 'type'; // 'type' | 'erase'
let _typingTimer = null;

function startTyping(roles) {
  if (!roles || !roles.length) return;
  _typingRoles = roles;
  _typingIdx   = 0;
  _charIdx     = 0;
  _typingDir   = 'type';
  clearTimeout(_typingTimer);
  _typeTick();
}

function _typeTick() {
  const el = document.getElementById('typingText');
  if (!el) return;
  const full = _typingRoles[_typingIdx] || '';

  if (_typingDir === 'type') {
    _charIdx++;
    el.textContent = full.slice(0, _charIdx);
    if (_charIdx >= full.length) {
      // Pause at end before erasing
      _typingTimer = setTimeout(() => { _typingDir = 'erase'; _typeTick(); }, 2000);
      return;
    }
    _typingTimer = setTimeout(_typeTick, 70);
  } else {
    _charIdx--;
    el.textContent = full.slice(0, _charIdx);
    if (_charIdx <= 0) {
      // Move to next role
      _typingIdx = (_typingIdx + 1) % _typingRoles.length;
      _typingDir = 'type';
      _typingTimer = setTimeout(_typeTick, 350);
      return;
    }
    _typingTimer = setTimeout(_typeTick, 38);
  }
}

// ── Navbar ────────────────────────────────────────────────────────
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const backTop = document.getElementById('backTop');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 60;
    navbar?.classList.toggle('scrolled', scrolled);
    backTop?.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // Active nav link on scroll
  const sections = ['about','experience','projects','skills','education','certificates','hire','contact'];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.nav-links a').forEach(a => {
          a.classList.toggle('active', a.dataset.nav === e.target.id);
        });
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });

  // Hamburger
  const btn   = document.getElementById('hamburgerBtn');
  const nav   = document.getElementById('mobileNav');
  const close = document.getElementById('mobileNavClose');
  btn?.addEventListener('click', () => nav?.classList.add('open'));
  close?.addEventListener('click', closeMobileNav);

  // Back to top
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

function closeMobileNav() {
  document.getElementById('mobileNav')?.classList.remove('open');
}

// ── Fade-in on scroll ─────────────────────────────────────────────
(function initFadeIn() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
})();

// ── Social Icons (SVG helpers) ────────────────────────────────────
function ghIcon()   { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>`; }
function liIcon()   { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`; }
function igIcon()   { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`; }
function twIcon()   { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z"/></svg>`; }
function fbIcon()   { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`; }
function ytIcon()   { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>`; }

// Social config — maps profile field to icon + platform name
const SOCIALS = [
  { field: 'github_url',   icon: ghIcon,   label: 'GitHub'    },
  { field: 'linkedin_url', icon: liIcon,   label: 'LinkedIn'  },
  { field: 'twitter_url',  icon: twIcon,   label: 'Twitter/X' },
  { field: 'instagram_url',icon: igIcon,   label: 'Instagram' },
  { field: 'facebook_url', icon: fbIcon,   label: 'Facebook'  },
  { field: 'youtube_url',  icon: ytIcon,   label: 'YouTube'   },
  { field: 'website',      icon: () => `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`, label: 'Website' }
];

function buildSocialButtons(profile, className, size = 17) {
  return SOCIALS
    .filter(s => profile[s.field])
    .map(s => `
      <a href="${escHtml(safeUrl(profile[s.field]))}" target="_blank" rel="noopener noreferrer"
         class="${className}" title="${escHtml(s.label)}" aria-label="${escHtml(s.label)}">
        ${s.icon(size)}
      </a>`).join('');
}

// Other icons
function locIcon()   { return `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`; }
function mailIcon()  { return `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`; }
function phoneIcon() { return `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/></svg>`; }
function expIcon()   { return `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`; }
function linkIcon()  { return `<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`; }

// ── Profile ───────────────────────────────────────────────────────
// Extracted so it can be called again on language toggle
function rerenderProfile(p) {
  if (!p) return;
  // Typing animation: restart with new language roles
  const title    = loc('title', p);
  const extra    = currentLang === 'id'
    ? ['Pengembang Web', 'Pemecah Masalah', 'Pembuat Solusi']
    : ['Web Developer', 'Problem Solver', 'Solution Builder'];
  startTyping([title, ...extra]);
  setText('heroBio',   loc('bio', p));
  setText('aboutBio',  loc('bio', p));
}

async function loadProfile() {
  const p = await fetchJson('/profile');
  if (!p) return;
  _cachedProfile = p;

  // ── Canonical URL ─────────────────────────────────────────────
  const canon = document.getElementById('canonicalUrl');
  if (canon) canon.href = window.location.href.split('?')[0].split('#')[0];

  // ── Meta tags ─────────────────────────────────────────────────
  document.title = `${p.full_name || 'Portfolio'} · Portfolio`;
  const metaDesc = document.getElementById('metaDesc');
  if (metaDesc) metaDesc.content = (loc('bio', p) || '').substring(0, 160);
  const ogTitle  = document.getElementById('ogTitle');
  if (ogTitle)  ogTitle.content  = `${p.full_name} — ${loc('title', p)}`;
  const ogDesc   = document.getElementById('ogDesc');
  if (ogDesc)   ogDesc.content   = (loc('bio', p) || '').substring(0, 160);

  // ── JSON-LD Person structured data ────────────────────────────
  const jsonLdEl = document.getElementById('jsonLd');
  if (jsonLdEl) {
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': p.full_name || '',
      'jobTitle': p.title || '',
      'description': p.bio || '',
      'email': p.email || '',
      'telephone': p.phone || '',
      'url': p.website || window.location.origin,
      'image': p.photo_url || '',
      'sameAs': [
        p.github_url, p.linkedin_url, p.twitter_url,
        p.instagram_url, p.facebook_url, p.youtube_url
      ].filter(Boolean)
    };
    jsonLdEl.textContent = JSON.stringify(ld);
  }

  // ── Hero ───────────────────────────────────────────────────────
  const firstName = (p.full_name || '').split(' ')[0];
  const heroNameEl = document.getElementById('heroName');
  if (heroNameEl) {
    heroNameEl.innerHTML = `Hi, I'm <span class="accent">${escHtml(p.full_name || 'Your Name')}</span>`;
  }
  // Start typing animation with title + extra roles
  const titleText = loc('title', p);
  const extraRoles = currentLang === 'id'
    ? ['Pengembang Web', 'Pemecah Masalah', 'Pembuat Solusi']
    : ['Web Developer', 'Problem Solver', 'Solution Builder'];
  startTyping([titleText, ...extraRoles]);
  setText('heroBio', loc('bio', p));

  // Badge
  const badgeWrap = document.getElementById('heroBadge')?.parentElement;
  if (badgeWrap) badgeWrap.style.display = p.open_to_work ? '' : 'none';

  // Photo — use Cloudinary-optimized URL (WebP, 600px max)
  if (p.photo_url) {
    const img = document.getElementById('heroPhoto');
    if (img) img.src = cloudinaryOptimize(p.photo_url, 600);
  }

  // CV
  if (p.cv_url) {
    const btn = document.getElementById('cvDownloadBtn');
    if (btn) { btn.href = p.cv_url; btn.classList.remove('hidden'); }
  }

  // Stats
  setText('heroYears', (p.years_of_exp || '0') + '+');

  // Nav brand / footer
  const nb = document.getElementById('navBrand');
  if (nb) nb.textContent = firstName || 'Dev';
  const fl = document.getElementById('footerName');
  if (fl) fl.textContent = firstName || 'Dev';
  const fc = document.getElementById('footerCopy');
  if (fc) fc.textContent = `© ${new Date().getFullYear()} ${p.full_name || ''} · Built with Node.js`;

  // ── Hero social icons ─────────────────────────────────────────
  const heroSocials = document.getElementById('heroSocials');
  if (heroSocials) {
    heroSocials.innerHTML = buildSocialButtons(p, 'hero-social-btn');
  }

  // ── Footer social icons ───────────────────────────────────────
  const footerSocials = document.getElementById('footerSocials');
  if (footerSocials) {
    footerSocials.innerHTML = buildSocialButtons(p, 'footer-social-btn');
  }

  // ── Mobile nav social icons ───────────────────────────────────
  const mobileNavSocials = document.getElementById('mobileNavSocials');
  if (mobileNavSocials) {
    mobileNavSocials.innerHTML = buildSocialButtons(p, 'hero-social-btn');
  }

  // ── About section ─────────────────────────────────────────────
  setText('aboutBio', loc('bio', p));

  const infoList = document.getElementById('aboutInfoList');
  if (infoList) {
    const infos = [
      { icon: locIcon(),   label: 'Location',   val: p.location },
      { icon: mailIcon(),  label: 'Email',       val: p.email,   href: `mailto:${p.email}` },
      { icon: phoneIcon(), label: 'Phone',       val: p.phone },
      { icon: linkIcon(),  label: 'Website',     val: p.website, href: safeUrl(p.website) },
      { icon: expIcon(),   label: 'Experience',  val: p.years_of_exp ? `${p.years_of_exp} years` : '' },
    ].filter(i => i.val);

    infoList.innerHTML = infos.map(i => `
      <div class="about-info-item">
        <div class="about-info-icon">${i.icon}</div>
        <div>
          <div class="about-info-label">${escHtml(i.label)}</div>
          <div class="about-info-val">
            ${i.href ? `<a href="${escHtml(i.href)}" target="_blank">${escHtml(i.val)}</a>` : escHtml(i.val)}
          </div>
        </div>
      </div>`).join('');
  }

  // About social links
  const aboutLinks = document.getElementById('aboutLinks');
  if (aboutLinks) {
    aboutLinks.innerHTML = SOCIALS
      .filter(s => p[s.field])
      .map(s => `
        <a href="${escHtml(safeUrl(p[s.field]))}" target="_blank" rel="noopener noreferrer" class="about-link-btn">
          ${s.icon()} ${escHtml(s.label)} ↗
        </a>`).join('');
  }

  // ── Contact info ───────────────────────────────────────────────
  const contactInfoList = document.getElementById('contactInfoList');
  if (contactInfoList) {
    const contacts = [
      { icon: mailIcon(),  label: 'Email',    val: p.email,    href: `mailto:${p.email}` },
      { icon: phoneIcon(), label: 'Phone',    val: p.phone,    href: `tel:${p.phone}` },
      { icon: locIcon(),   label: 'Location', val: p.location },
    ].filter(c => c.val);
    contactInfoList.innerHTML = contacts.map(c => `
      <div class="contact-info-item">
        <div class="contact-info-icon">${c.icon}</div>
        <div>
          <div class="contact-info-label">${escHtml(c.label)}</div>
          <div class="contact-info-val">
            ${c.href ? `<a href="${escHtml(c.href)}">${escHtml(c.val)}</a>` : escHtml(c.val)}
          </div>
        </div>
      </div>`).join('');
  }

  // Contact social icons
  const socialLinks = document.getElementById('socialLinks');
  if (socialLinks) {
    socialLinks.innerHTML = buildSocialButtons(p, 'social-link');
  }

  // ── Hire Me section ───────────────────────────────────────────
  // Hide entire section if not open to work
  const hireSection = document.getElementById('hire');
  if (hireSection) {
    hireSection.style.display = p.open_to_work ? '' : 'none';
  }
}

// ── Experiences ───────────────────────────────────────────────────
function rerenderExperiences(exps) {
  const container = document.getElementById('experienceTimeline');
  if (!container) return;
  if (!exps || exps.length === 0) {
    container.innerHTML = `<p class="empty-msg">${t('no.data')}</p>`;
    show('experienceTimeline'); return;
  }
  container.innerHTML = exps.map(e => {
    const period = e.is_current
      ? `${fmtDate(e.start_date)} — <span class="tag-green" style="padding:.1rem .4rem;border-radius:4px">${t('exp.present')}</span>`
      : `${fmtDate(e.start_date)} — ${fmtDate(e.end_date)}`;
    const tags = (e.tech_stack || '').split(',').map(t2 => t2.trim()).filter(Boolean);
    const desc = loc('description', e);
    return `
      <div class="timeline-item fade-in">
        <div class="timeline-card">
          <div class="timeline-top">
            <div>
              <div class="timeline-company">${escHtml(e.company)}</div>
              <div class="timeline-position">${escHtml(loc('position', e))}</div>
              ${e.location ? `<div class="timeline-location">${locIcon()} ${escHtml(e.location)}</div>` : ''}
            </div>
            <div class="timeline-period">${period}</div>
          </div>
          ${desc ? `<div class="timeline-desc">${escHtml(desc)}</div>` : ''}
          ${tags.length ? `<div class="timeline-tags">${tags.map(tg => `<span class="tag">${escHtml(tg)}</span>`).join('')}</div>` : ''}
        </div>
      </div>`;
  }).join('');
  show('experienceTimeline');

  // Observe new fade-ins
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  container.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

async function loadExperiences() {
  const exps = await fetchJson('/experiences');
  _cachedExperiences = exps;
  hide('experienceLoading');
  rerenderExperiences(exps);
}

// ── Projects ──────────────────────────────────────────────────────
let allProjects   = [];
let currentFilter = 'All';

async function loadProjects() {
  allProjects = await fetchJson('/projects') || [];
  hide('projectsLoading');
  currentFilter = t('projects.all');
  rebuildProjectTabs();
  renderProjects(allProjects);
  setText('heroProjectCount', allProjects.length + '+');
}

function rebuildProjectTabs() {
  const filterEl = document.getElementById('projectsFilter');
  if (!filterEl || !allProjects.length) return;

  // Get unique categories preserving insertion order
  const cats = [...new Set(allProjects.map(p => p.category).filter(Boolean))];
  const allLabel = t('projects.all');

  // Normalize current filter when language changes
  const allLabels = [i18n.en['projects.all'], i18n.id['projects.all']];
  if (allLabels.includes(currentFilter)) currentFilter = allLabel;

  filterEl.innerHTML = [allLabel, ...cats].map(cat => `
    <button
      class="proj-tab${cat === currentFilter ? ' active' : ''}"
      role="tab"
      aria-selected="${cat === currentFilter}"
      data-cat="${escHtml(cat)}"
      onclick="filterProjects('${escHtml(cat)}', this)">
      ${escHtml(cat)}
    </button>`).join('');
}

function filterProjects(category, btn) {
  currentFilter = category;
  document.querySelectorAll('.proj-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === category);
    b.setAttribute('aria-selected', b.dataset.cat === category);
  });
  const allLabel = t('projects.all');
  const filtered = (category === allLabel)
    ? allProjects
    : allProjects.filter(p => p.category === category);
  renderProjects(filtered);
}

function renderProjects(projects) {
  const grid  = document.getElementById('projectsGrid');
  const empty = document.getElementById('projectsEmpty');
  if (!grid) return;

  if (!projects || projects.length === 0) {
    grid.style.display  = 'none';
    if (empty) { empty.textContent = t('projects.empty'); empty.classList.remove('hidden'); }
    return;
  }
  if (empty) empty.classList.add('hidden');
  grid.style.display = '';

  grid.innerHTML = projects.map((p, idx) => {
    const projTitle    = loc('title', p);
    const projShort    = loc('short_desc', p) || loc('description', p).substring(0, 140);
    const projDesc     = loc('description', p) || projShort;
    // Use Cloudinary-optimized image (WebP, 700px)
    const optImg = cloudinaryOptimize(p.image_url, 700);
    const imgEl = p.image_url
      ? `<div class="project-img-wrap">
           <img src="${escHtml(optImg)}" alt="${escHtml(projTitle)}" class="project-img" loading="lazy"
                width="700" height="190"
                onerror="this.parentNode.innerHTML='<div class=&quot;project-img-placeholder&quot;>No Image</div>'"/>
           <div class="project-img-overlay"></div>
         </div>`
      : `<div class="project-img-placeholder">No Image</div>`;

    const metrics = [p.metric_users, p.metric_perf, p.metric_custom].filter(Boolean);
    const tagList = (p.tech_stack || '').split(',').map(t2 => t2.trim()).filter(Boolean);

    // Hover overlay with full description + quick links
    const hoverLinks = [
      p.demo_url ? `<a href="${escHtml(p.demo_url)}" target="_blank" rel="noopener" class="project-hover-btn primary">Demo ↗</a>` : '',
      p.repo_url ? `<a href="${escHtml(p.repo_url)}" target="_blank" rel="noopener" class="project-hover-btn">Repo ↗</a>` : ''
    ].filter(Boolean).join('');

    return `
      <article class="project-card" style="animation-delay:${idx * 60}ms">
        ${imgEl}
        <!-- Hover overlay -->
        <div class="project-hover-overlay">
          <div class="project-hover-title">${escHtml(projTitle)}</div>
          <div class="project-hover-desc">${escHtml(projDesc)}</div>
          <div class="project-hover-links">${hoverLinks}</div>
        </div>
        <div class="project-body">
          <div class="project-category">${escHtml(p.category || 'Project')}</div>
          <h3 class="project-title">${escHtml(projTitle)}</h3>
          <p class="project-desc">${escHtml(projShort)}</p>
          ${metrics.length ? `<div class="project-metrics">${metrics.map(m => `<span class="project-metric">${escHtml(m)}</span>`).join('')}</div>` : ''}
          ${tagList.length ? `<div class="timeline-tags">${tagList.slice(0, 5).map(tg => `<span class="tag">${escHtml(tg)}</span>`).join('')}</div>` : ''}
          <div class="project-footer">
            <div class="project-links">
              ${p.demo_url ? `<a href="${escHtml(p.demo_url)}" target="_blank" rel="noopener" class="project-link-btn">Demo ↗</a>` : ''}
              ${p.repo_url ? `<a href="${escHtml(p.repo_url)}" target="_blank" rel="noopener" class="project-link-btn">Repo ↗</a>` : ''}
            </div>
            ${p.is_featured ? '<span class="project-featured-badge">★ Featured</span>' : ''}
          </div>
        </div>
      </article>`;
  }).join('');
}

// ── Skills ────────────────────────────────────────────────────────
function rerenderSkills(skills) {
  const container = document.getElementById('skillsContainer');
  if (!container) return;
  if (!skills || skills.length === 0) {
    container.innerHTML = `<p class="empty-msg">${t('no.data')}</p>`;
    show('skillsContainer'); return;
  }

  const groups = {};
  skills.forEach(s => { const cat = s.category || 'General'; if (!groups[cat]) groups[cat] = []; groups[cat].push(s); });

  container.innerHTML = Object.entries(groups).map(([cat, group]) => {
    const catLabel = (currentLang === 'id' && group[0].category_id && group[0].category_id.trim())
      ? group[0].category_id
      : cat;
    return `
    <div class="skills-section-group">
      <div class="skills-group-title">${escHtml(catLabel)}</div>
      <div class="skills-grid">
        ${group.map(s => `
          <div class="skill-card">
            <div class="skill-name">${escHtml(s.name)}</div>
            <div class="skill-bar-bg">
              <div class="skill-bar-fill" style="width:0%" data-target="${s.level}"></div>
            </div>
            <div class="skill-level">${s.level}%</div>
          </div>`).join('')}
      </div>
    </div>`;
  }).join('');

  show('skillsContainer');

  // Animate bars on scroll
  const bars = container.querySelectorAll('.skill-bar-fill');
  const barObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.target + '%';
        barObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  bars.forEach(bar => barObs.observe(bar));
}

async function loadSkills() {
  const skills = await fetchJson('/skills') || [];
  _cachedSkills = skills;
  hide('skillsLoading');
  rerenderSkills(skills);
}

// ── Education ─────────────────────────────────────────────────────
function rerenderEducation(edu) {
  const grid = document.getElementById('educationGrid');
  if (!grid) return;
  if (!edu || edu.length === 0) {
    grid.innerHTML = `<p class="empty-msg" style="grid-column:1/-1">${t('no.data')}</p>`;
    show('educationGrid'); return;
  }

  grid.innerHTML = edu.map(e => {
    const years = e.is_current
      ? `${e.start_year} — ${t('exp.present')}`
      : `${e.start_year} — ${e.end_year || '?'}`;
    const eduDeg   = loc('degree', e);
    const eduField = loc('field_of_study', e);
    const eduDesc  = loc('description', e);
    return `
      <div class="edu-card">
        <div class="edu-icon">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <div class="edu-institution">${escHtml(e.institution)}</div>
        <div class="edu-degree">${escHtml(eduDeg)}</div>
        ${eduField ? `<div class="edu-field">${escHtml(eduField)}</div>` : ''}
        <div class="edu-year">${years}</div>
        ${e.gpa ? `<span class="edu-gpa">GPA ${parseFloat(e.gpa).toFixed(2)}</span>` : ''}
        ${eduDesc ? `<p style="font-size:.8rem;color:var(--muted);margin-top:.75rem;line-height:1.6">${escHtml(eduDesc)}</p>` : ''}
      </div>`;
  }).join('');
  show('educationGrid');
}

async function loadEducation() {
  const edu = await fetchJson('/education') || [];
  _cachedEducation = edu;
  hide('educationLoading');
  rerenderEducation(edu);
}

// ── Certificates ──────────────────────────────────────────────────
function rerenderCerts(certs) {
  const grid = document.getElementById('certsGrid');
  if (!grid) return;
  if (!certs || certs.length === 0) {
    grid.innerHTML = `<p class="empty-msg" style="grid-column:1/-1">${t('no.data')}</p>`;
    show('certsGrid'); return;
  }

  grid.innerHTML = certs.map(c => {
    const certName   = loc('name', c);
    const certOptImg = cloudinaryOptimize(c.image_url, 600);
    const imgEl = c.image_url
      ? `<div class="cert-img-wrap"><img src="${escHtml(certOptImg)}" alt="${escHtml(certName)}" class="cert-img" loading="lazy" width="600" height="140" onerror="this.parentNode.innerHTML='<div class=&quot;cert-img-placeholder&quot;></div>'"/></div>`
      : `<div class="cert-img-placeholder">
           <svg width="38" height="38" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color:var(--muted)">
             <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
           </svg>
         </div>`;
    return `
      <div class="cert-card">
        ${imgEl}
        <div class="cert-body">
          <div class="cert-name">${escHtml(certName)}</div>
          <div class="cert-issuer">${escHtml(c.issuer)}</div>
          <div class="cert-date">
            ${fmtDate(c.issue_date)}${c.expiry_date ? ` · ${fmtDate(c.expiry_date)}` : ''}
          </div>
          ${c.credential_id ? `<div style="font-size:.7rem;color:var(--muted-2);margin-top:.3rem">ID: ${escHtml(c.credential_id)}</div>` : ''}
        </div>
        ${c.credential_url ? `
        <div class="cert-footer">
          <a href="${escHtml(c.credential_url)}" target="_blank" rel="noopener" class="cert-verify-link">
            Verify ↗
            <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>` : ''}
      </div>`;
  }).join('');
  show('certsGrid');
}

async function loadCertificates() {
  const certs = await fetchJson('/certificates') || [];
  _cachedCerts = certs;
  hide('certsLoading');
  setText('heroCertCount', certs.length + '+');
  rerenderCerts(certs);
}

// ── Contact Form ──────────────────────────────────────────────────
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name    = document.getElementById('senderName').value.trim();
    const email   = document.getElementById('senderEmail').value.trim();
    const subject = document.getElementById('msgSubject').value.trim();
    const message = document.getElementById('msgMessage').value.trim();

    // Clear errors
    ['errName','errEmail','errMsg'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });

    let valid = true;
    if (!name)  { document.getElementById('errName')?.classList.remove('hidden');  valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('errEmail')?.classList.remove('hidden'); valid = false;
    }
    if (!message) { document.getElementById('errMsg')?.classList.remove('hidden'); valid = false; }
    if (!valid) return;

    const btn     = document.getElementById('contactSubmitBtn');
    const btnText = document.getElementById('contactBtnText');
    const spinner = document.getElementById('contactSpinner');
    btn.disabled = true;
    if (btnText) btnText.textContent = '…';
    spinner?.classList.remove('hidden');

    try {
      const res = await fetch(`${API}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_name: name, sender_email: email, subject, message })
      });
      if (res.ok) {
        form.reset();
        const success = document.getElementById('contactFormSuccess');
        const span = success?.querySelector('[data-i18n]');
        if (span) span.textContent = t('contact.success');
        success?.classList.remove('hidden');
        setTimeout(() => success?.classList.add('hidden'), 6000);
      } else {
        const json = await res.json();
        alert(json.message || 'Failed to send message.');
      }
    } catch {
      alert('Cannot connect to server. Please try again.');
    } finally {
      btn.disabled = false;
      if (btnText) btnText.textContent = t('contact.send');
      spinner?.classList.add('hidden');
    }
  });
})();

// ── Project Search ────────────────────────────────────────────────
(function initProjectSearch() {
  const input = document.getElementById('projectSearch');
  const clear = document.getElementById('projectSearchClear');
  if (!input) return;

  function doSearch(query) {
    const q = query.trim().toLowerCase();
    clear?.classList.toggle('hidden', !q);
    if (!allProjects.length) return;

    if (!q) {
      // Restore current tab filter
      filterProjects(currentFilter, null);
      return;
    }

    // Search across all projects regardless of active tab
    const matched = allProjects.filter(p => {
      const title = (loc('title', p) + ' ' + (p.title || '')).toLowerCase();
      const tech  = (p.tech_stack || '').toLowerCase();
      const desc  = (loc('description', p) + ' ' + loc('short_desc', p)).toLowerCase();
      const cat   = (p.category || '').toLowerCase();
      return title.includes(q) || tech.includes(q) || desc.includes(q) || cat.includes(q);
    });

    renderProjects(matched);
    // Deactivate tab pills visually while searching
    document.querySelectorAll('.proj-tab').forEach(b => b.classList.remove('active'));
  }

  input.addEventListener('input', () => doSearch(input.value));
  clear?.addEventListener('click', () => {
    input.value = '';
    clear.classList.add('hidden');
    filterProjects(currentFilter, null);
    input.focus();
  });
})();

// ── Init ──────────────────────────────────────────────────────────
(async function init() {
  applyI18n(); // apply saved language on load

  await Promise.all([
    loadProfile(),
    loadExperiences(),
    loadProjects(),
    loadSkills(),
    loadEducation(),
    loadCertificates(),
  ]);

  // Apply i18n again after data is loaded (updates dynamic strings)
  applyI18n();

  // Update search placeholder with correct language
  const si = document.getElementById('projectSearch');
  if (si) si.placeholder = t('projects.search');
})();
