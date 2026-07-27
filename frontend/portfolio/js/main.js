'use strict';

/* ================================================================
   PORTFOLIO MAIN — main.js
   Fetches all data from the backend API and renders each section.

   API_URL is resolved dynamically from config.js:
     • Local  → http://localhost:5000/api
     • Prod   → https://YOUR-RENDER-APP-NAME.onrender.com/api
   ================================================================ */

// PortfolioConfig is loaded by config.js (included BEFORE this file in index.html)
const API  = PortfolioConfig.API;
const BASE = PortfolioConfig.BASE;

// ── Utility ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
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

function show(id)  { const el = document.getElementById(id); if (el) el.style.display = ''; }
function hide(id)  { const el = document.getElementById(id); if (el) el.style.display = 'none'; }

// ════════════════════════════════════════════════════════════════
//  NAVBAR
// ════════════════════════════════════════════════════════════════
(function initNavbar() {
  const navbar = document.getElementById('navbar');

  // Scroll → add shadow
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  // Active link highlight based on scroll position
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a[data-nav]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[data-nav="${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));

  // Hamburger (mobile)
  const btn = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('mobileNav');
  btn.addEventListener('click', () => nav.classList.toggle('open'));
})();

function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
}

// ════════════════════════════════════════════════════════════════
//  FADE-IN on scroll
// ════════════════════════════════════════════════════════════════
(function initFadeIn() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
})();

// ════════════════════════════════════════════════════════════════
//  PROFILE — Hero + About + Navbar brand + Footer
// ════════════════════════════════════════════════════════════════
async function loadProfile() {
  const p = await fetchJson('/profile');
  if (!p) return;

  // Meta tags
  document.title = `${p.full_name || 'Portfolio'} · Portfolio`;
  const metaDesc = document.getElementById('metaDesc');
  if (metaDesc) metaDesc.content = p.bio || '';
  const ogTitle  = document.getElementById('ogTitle');
  if (ogTitle) ogTitle.content = `${p.full_name} — ${p.title}`;
  const ogDesc   = document.getElementById('ogDesc');
  if (ogDesc) ogDesc.content = p.bio || '';

  // ── Hero ─────────────────────────────────────────────────────
  const firstName = (p.full_name || '').split(' ')[0];
  setText('heroFirstName', firstName || 'Your Name');
  setText('heroName', `Hi, I'm `); // reset and rebuild below
  // Rebuild hero name with accent span
  const heroNameEl = document.getElementById('heroName');
  if (heroNameEl) {
    heroNameEl.innerHTML = `Hi, I'm <span class="accent">${escHtml(p.full_name || 'Your Name')}</span>`;
  }
  setText('heroTitle', p.title || '');
  setText('heroBio', p.bio || '');

  // Badge visibility
  const badge = document.getElementById('heroBadge');
  const badgeWrap = badge?.parentElement;
  if (badgeWrap) {
    badgeWrap.style.display = p.open_to_work ? '' : 'none';
  }

  // Photo — Cloudinary menyimpan URL penuh, gunakan langsung
  if (p.photo_url) {
    const img = document.getElementById('heroPhoto');
    if (img) img.src = p.photo_url;
  }

  // CV download button — Cloudinary URL sudah absolute
  if (p.cv_url) {
    const btn = document.getElementById('cvDownloadBtn');
    if (btn) {
      btn.href = p.cv_url;
      btn.classList.remove('hidden');
    }
  }

  // Years of experience stat
  setText('heroYears', (p.years_of_exp || '0') + '+');

  // Navbar brand
  const nb = document.getElementById('navBrand');
  if (nb) nb.textContent = firstName || 'Dev';
  const fl = document.getElementById('footerName');
  if (fl) fl.textContent = firstName || 'Dev';
  const fc = document.getElementById('footerCopy');
  if (fc) fc.textContent = `© ${new Date().getFullYear()} ${p.full_name || ''} · Built with Node.js`;

  // ── About section ─────────────────────────────────────────────
  setText('aboutBio', p.bio || '');

  // Info list
  const infoList = document.getElementById('aboutInfoList');
  if (infoList) {
    const infos = [
      { icon: locIcon(),  label: 'Location',  val: p.location  },
      { icon: mailIcon(), label: 'Email',      val: p.email, href: `mailto:${p.email}` },
      { icon: phoneIcon(),label: 'Phone',      val: p.phone  },
      { icon: linkIcon(), label: 'Website',    val: p.website, href: p.website },
      { icon: expIcon(),  label: 'Experience', val: p.years_of_exp ? `${p.years_of_exp} years` : '' },
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

  // Social links
  const aboutLinks = document.getElementById('aboutLinks');
  if (aboutLinks) {
    const socials = [
      { url: p.github_url,   label: 'GitHub' },
      { url: p.linkedin_url, label: 'LinkedIn' },
      { url: p.twitter_url,  label: 'Twitter' },
      { url: p.website,      label: 'Website' },
    ].filter(s => s.url);

    aboutLinks.innerHTML = socials.map(s => `
      <a href="${escHtml(s.url)}" target="_blank" class="about-link-btn">
        ${escHtml(s.label)} ↗
      </a>`).join('');
  }

  // Contact section info
  const contactInfoList = document.getElementById('contactInfoList');
  if (contactInfoList) {
    const contacts = [
      { icon: mailIcon(),  label: 'Email',    val: p.email,    href: `mailto:${p.email}` },
      { icon: phoneIcon(), label: 'Phone',    val: p.phone,    href: `tel:${p.phone}` },
      { icon: locIcon(),   label: 'Location', val: p.location  },
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

  // Social links in contact section
  const socialLinks = document.getElementById('socialLinks');
  if (socialLinks) {
    const socials = [
      { url: p.github_url,   label: 'GitHub',   icon: ghIcon() },
      { url: p.linkedin_url, label: 'LinkedIn',  icon: liIcon() },
      { url: p.twitter_url,  label: 'Twitter',   icon: twIcon() },
    ].filter(s => s.url);

    socialLinks.innerHTML = socials.map(s => `
      <a href="${escHtml(s.url)}" target="_blank" class="social-link" title="${escHtml(s.label)}">
        ${s.icon}
      </a>`).join('');
  }
}

// ════════════════════════════════════════════════════════════════
//  EXPERIENCES
// ════════════════════════════════════════════════════════════════
async function loadExperiences() {
  const exps = await fetchJson('/experiences');
  hide('experienceLoading');
  const container = document.getElementById('experienceTimeline');
  if (!container) return;

  if (!exps || exps.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem">No experiences added yet.</p>';
    show('experienceTimeline');
    return;
  }

  container.innerHTML = exps.map(e => {
    const period = e.is_current
      ? `${fmtDate(e.start_date)} — Present`
      : `${fmtDate(e.start_date)} — ${fmtDate(e.end_date)}`;

    const tags = (e.tech_stack || '').split(',').map(t => t.trim()).filter(Boolean);

    return `
      <div class="timeline-item">
        <div class="timeline-card">
          <div class="timeline-top">
            <div>
              <div class="timeline-company">${escHtml(e.company)}</div>
              <div class="timeline-position">${escHtml(e.position)}</div>
              ${e.location ? `<div class="timeline-location">📍 ${escHtml(e.location)}</div>` : ''}
            </div>
            <div class="timeline-period">${escHtml(period)}</div>
          </div>
          ${e.description ? `<p class="timeline-desc">${escHtml(e.description)}</p>` : ''}
          ${tags.length ? `<div class="timeline-tags">${tags.map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  show('experienceTimeline');
}

// ════════════════════════════════════════════════════════════════
//  PROJECTS
// ════════════════════════════════════════════════════════════════
let allProjects = [];

async function loadProjects() {
  allProjects = await fetchJson('/projects') || [];
  hide('projectsLoading');

  // Build filter buttons
  const filterEl = document.getElementById('projectsFilter');
  if (filterEl) {
    const categories = ['All', ...new Set(allProjects.map(p => p.category).filter(Boolean))];
    filterEl.innerHTML = categories.map((cat, i) => `
      <button class="filter-btn${i === 0 ? ' active' : ''}"
              data-cat="${escHtml(cat)}"
              onclick="filterProjects('${escHtml(cat)}', this)">
        ${escHtml(cat)}
      </button>`).join('');
  }

  renderProjects(allProjects);
  // Update hero stat
  setText('heroProjectCount', allProjects.length + '+');
}

function filterProjects(category, btn) {
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const filtered = category === 'All'
    ? allProjects
    : allProjects.filter(p => p.category === category);

  renderProjects(filtered);
}

function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');
  const empty = document.getElementById('projectsEmpty');
  if (!grid) return;

  if (projects.length === 0) {
    grid.style.display = 'none';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  grid.style.display = '';

  grid.innerHTML = projects.map(p => {
    // Cloudinary URL sudah absolute — tidak perlu prefix BASE
    const imgEl = p.image_url
      ? `<img src="${escHtml(p.image_url)}" alt="${escHtml(p.title)}" class="project-img" loading="lazy"
              onerror="this.parentNode.innerHTML='<div class=&quot;project-img-placeholder&quot;>No Image</div>'"/>`
      : `<div class="project-img-placeholder">No Image</div>`;

    const metrics = [p.metric_users, p.metric_perf, p.metric_custom].filter(Boolean);
    const tags    = (p.tech_stack || '').split(',').map(t => t.trim()).filter(Boolean);

    return `
      <article class="project-card">
        ${imgEl}
        <div class="project-body">
          <div class="project-category">${escHtml(p.category || 'Project')}</div>
          <h3 class="project-title">${escHtml(p.title)}</h3>
          <p class="project-desc">${escHtml(p.short_desc || p.description?.substring(0, 120) || '')}</p>
          ${metrics.length ? `<div class="project-metrics">${metrics.map(m => `<span class="project-metric">${escHtml(m)}</span>`).join('')}</div>` : ''}
          ${tags.length ? `<div class="timeline-tags">${tags.slice(0, 5).map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>` : ''}
          <div class="project-footer">
            <div class="project-links">
              ${p.demo_url ? `<a href="${escHtml(p.demo_url)}" target="_blank" class="project-link-btn">Demo ↗</a>` : ''}
              ${p.repo_url ? `<a href="${escHtml(p.repo_url)}" target="_blank" class="project-link-btn">Repo ↗</a>` : ''}
            </div>
            ${p.is_featured ? '<span class="project-featured-badge">★ Featured</span>' : ''}
          </div>
        </div>
      </article>`;
  }).join('');
}

// ════════════════════════════════════════════════════════════════
//  SKILLS
// ════════════════════════════════════════════════════════════════
async function loadSkills() {
  const skills = await fetchJson('/skills') || [];
  hide('skillsLoading');

  const container = document.getElementById('skillsContainer');
  if (!container) return;

  if (skills.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem">No skills added yet.</p>';
    show('skillsContainer');
    return;
  }

  // Group by category
  const groups = {};
  skills.forEach(s => {
    const cat = s.category || 'General';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(s);
  });

  container.innerHTML = Object.entries(groups).map(([cat, group]) => `
    <div class="skills-section-group">
      <div class="skills-group-title">${escHtml(cat)}</div>
      <div class="skills-grid">
        ${group.map(s => `
          <div class="skill-card" data-level="${s.level}">
            <div class="skill-name">${escHtml(s.name)}</div>
            <div class="skill-bar-bg">
              <div class="skill-bar-fill" style="width:0%" data-target="${s.level}"></div>
            </div>
            <div class="skill-level">${s.level}%</div>
          </div>`).join('')}
      </div>
    </div>`).join('');

  // Animate bars on scroll
  const bars = container.querySelectorAll('.skill-bar-fill');
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.width = bar.dataset.target + '%';
        barObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.1 });
  bars.forEach(bar => barObserver.observe(bar));

  show('skillsContainer');
}

// ════════════════════════════════════════════════════════════════
//  EDUCATION
// ════════════════════════════════════════════════════════════════
async function loadEducation() {
  const edu = await fetchJson('/education') || [];
  hide('educationLoading');

  const grid = document.getElementById('educationGrid');
  if (!grid) return;

  if (edu.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem;grid-column:1/-1">No education added yet.</p>';
    show('educationGrid');
    return;
  }

  grid.innerHTML = edu.map(e => {
    const years = e.is_current
      ? `${e.start_year} — Present`
      : `${e.start_year} — ${e.end_year || '?'}`;

    return `
      <div class="edu-card">
        <div class="edu-icon">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <div class="edu-institution">${escHtml(e.institution)}</div>
        <div class="edu-degree">${escHtml(e.degree)}</div>
        ${e.field_of_study ? `<div class="edu-field">${escHtml(e.field_of_study)}</div>` : ''}
        <div class="edu-year">${years}</div>
        ${e.gpa ? `<span class="edu-gpa">GPA: ${e.gpa}</span>` : ''}
        ${e.description ? `<p style="font-size:.8rem;color:var(--muted);margin-top:.75rem;line-height:1.6">${escHtml(e.description)}</p>` : ''}
      </div>`;
  }).join('');

  show('educationGrid');
}

// ════════════════════════════════════════════════════════════════
//  CERTIFICATES
// ════════════════════════════════════════════════════════════════
async function loadCertificates() {
  const certs = await fetchJson('/certificates') || [];
  hide('certsLoading');

  const grid = document.getElementById('certsGrid');
  if (!grid) return;

  // Update hero stat
  setText('heroCertCount', certs.length + '+');

  if (certs.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem;grid-column:1/-1">No certificates added yet.</p>';
    show('certsGrid');
    return;
  }

  grid.innerHTML = certs.map(c => {
    // Cloudinary URL sudah absolute — tidak perlu prefix BASE
    const imgEl = c.image_url
      ? `<img src="${escHtml(c.image_url)}" alt="${escHtml(c.name)}" class="cert-img" loading="lazy"
              onerror="this.parentNode.innerHTML='<div class=&quot;cert-img-placeholder&quot;></div>'"/>`
      : `<div class="cert-img-placeholder">
           <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color:var(--muted)">
             <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
           </svg>
         </div>`;

    return `
      <div class="cert-card">
        ${imgEl}
        <div class="cert-body">
          <div class="cert-name">${escHtml(c.name)}</div>
          <div class="cert-issuer">${escHtml(c.issuer)}</div>
          <div class="cert-date">
            Issued: ${fmtDate(c.issue_date)}
            ${c.expiry_date ? ` · Expires: ${fmtDate(c.expiry_date)}` : ''}
          </div>
          ${c.credential_id ? `<div style="font-size:.73rem;color:var(--muted);margin-top:.3rem">ID: ${escHtml(c.credential_id)}</div>` : ''}
        </div>
        ${c.credential_url ? `
        <div class="cert-footer">
          <a href="${escHtml(c.credential_url)}" target="_blank" class="cert-verify-link">
            Verify Credential
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>` : ''}
      </div>`;
  }).join('');

  show('certsGrid');
}

// ════════════════════════════════════════════════════════════════
//  CONTACT FORM
// ════════════════════════════════════════════════════════════════
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = document.getElementById('senderName').value.trim();
    const email   = document.getElementById('senderEmail').value.trim();
    const subject = document.getElementById('msgSubject').value.trim();
    const message = document.getElementById('msgMessage').value.trim();

    // Validation
    let valid = true;
    const errName  = document.getElementById('errName');
    const errEmail = document.getElementById('errEmail');
    const errMsg   = document.getElementById('errMsg');

    [errName, errEmail, errMsg].forEach(el => el.classList.add('hidden'));

    if (!name)  { errName.classList.remove('hidden');  valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errEmail.classList.remove('hidden'); valid = false;
    }
    if (!message) { errMsg.classList.remove('hidden');  valid = false; }
    if (!valid) return;

    // Submit
    const btn     = document.getElementById('contactSubmitBtn');
    const btnText = document.getElementById('contactBtnText');
    const spinner = document.getElementById('contactSpinner');
    btn.disabled     = true;
    btnText.textContent = 'Sending…';
    spinner.classList.remove('hidden');

    try {
      const res = await fetch(`${API}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_name: name, sender_email: email, subject, message })
      });
      const json = await res.json();

      if (res.ok) {
        form.reset();
        document.getElementById('contactFormSuccess').classList.remove('hidden');
        setTimeout(() => document.getElementById('contactFormSuccess').classList.add('hidden'), 6000);
      } else {
        alert(json.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      alert('Cannot connect to server. Please try again later.');
      console.error(err);
    } finally {
      btn.disabled    = false;
      btnText.textContent = 'Send Message';
      spinner.classList.add('hidden');
    }
  });
})();

// ════════════════════════════════════════════════════════════════
//  SVG Icon helpers
// ════════════════════════════════════════════════════════════════
function locIcon()   { return `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`; }
function mailIcon()  { return `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`; }
function phoneIcon() { return `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/></svg>`; }
function linkIcon()  { return `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`; }
function expIcon()   { return `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`; }
function ghIcon()    { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>`; }
function liIcon()    { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`; }
function twIcon()    { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z"/></svg>`; }

// ── Tiny helper to safely set textContent ────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ════════════════════════════════════════════════════════════════
//  BOOTSTRAP — load all sections
// ════════════════════════════════════════════════════════════════
(async function init() {
  await loadProfile();

  // Load other sections in parallel
  await Promise.all([
    loadExperiences(),
    loadProjects(),
    loadSkills(),
    loadEducation(),
    loadCertificates()
  ]);
})();
