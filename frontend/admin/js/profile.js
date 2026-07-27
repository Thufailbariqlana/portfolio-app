'use strict';

// BASE is set in dashboard.js from AdminConfig.BASE (via config.js)

// ── Load profile data ─────────────────────────────────────────────────────────
async function loadProfile() {
  const r = await apiFetch('/profile');
  if (!r || !r.ok) return showInlineAlert('profileAlert', 'Failed to load profile.');

  const p = r.data.data;
  document.getElementById('pFullName').value    = p.full_name    || '';
  document.getElementById('pTitle').value       = p.title        || '';
  document.getElementById('pBio').value         = p.bio          || '';
  document.getElementById('pEmail').value       = p.email        || '';
  document.getElementById('pPhone').value       = p.phone        || '';
  document.getElementById('pLocation').value    = p.location     || '';
  document.getElementById('pWebsite').value     = p.website      || '';
  document.getElementById('pGithub').value      = p.github_url   || '';
  document.getElementById('pLinkedin').value    = p.linkedin_url || '';
  document.getElementById('pTwitter').value     = p.twitter_url   || '';
  document.getElementById('pInstagram').value   = p.instagram_url || '';
  document.getElementById('pFacebook').value    = p.facebook_url  || '';
  document.getElementById('pYoutube').value     = p.youtube_url   || '';
  document.getElementById('pYears').value       = p.years_of_exp  || 0;
  document.getElementById('pOpenToWork').checked = !!p.open_to_work;

  // Photo & CV — Cloudinary menyimpan URL penuh, gunakan langsung tanpa prefix BASE
  const photoEl = document.getElementById('profilePhoto');
  const cvLink  = document.getElementById('cvLink');
  if (p.photo_url) {
    photoEl.src = p.photo_url;
  } else {
    photoEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || 'Admin')}&size=88`;
  }

  if (p.cv_url) {
    cvLink.href = p.cv_url;
    cvLink.classList.remove('hidden');
  } else {
    cvLink.classList.add('hidden');
  }
}

// ── Save profile text fields ──────────────────────────────────────────────────
async function saveProfile() {
  const payload = {
    full_name:     document.getElementById('pFullName').value.trim(),
    title:         document.getElementById('pTitle').value.trim(),
    bio:           document.getElementById('pBio').value.trim(),
    email:         document.getElementById('pEmail').value.trim(),
    phone:         document.getElementById('pPhone').value.trim(),
    location:      document.getElementById('pLocation').value.trim(),
    website:       document.getElementById('pWebsite').value.trim(),
    github_url:    document.getElementById('pGithub').value.trim(),
    linkedin_url:  document.getElementById('pLinkedin').value.trim(),
    twitter_url:    document.getElementById('pTwitter').value.trim(),
    instagram_url:  document.getElementById('pInstagram').value.trim(),
    facebook_url:   document.getElementById('pFacebook').value.trim(),
    youtube_url:    document.getElementById('pYoutube').value.trim(),
    years_of_exp:   Number(document.getElementById('pYears').value) || 0,
    open_to_work:  document.getElementById('pOpenToWork').checked ? 1 : 0
  };

  const r = await apiFetch('/profile', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  if (!r) return;

  if (r.ok) {
    showInlineAlert('profileAlert', 'Profile updated successfully!', 'success');
  } else {
    showInlineAlert('profileAlert', r.data.message || 'Failed to update profile.');
  }
}

// ── Upload photo ──────────────────────────────────────────────────────────────
async function uploadPhoto(input) {
  if (!input.files || !input.files[0]) return;
  const fd = new FormData();
  fd.append('photo', input.files[0]);

  const r = await apiFetch('/profile/photo', { method: 'POST', body: fd });
  if (!r) return;

  if (r.ok) {
    showInlineAlert('profileAlert', 'Photo uploaded!', 'success');
    loadProfile();
  } else {
    showInlineAlert('profileAlert', r.data.message || 'Failed to upload photo.');
  }
  input.value = ''; // reset
}

// ── Upload CV ─────────────────────────────────────────────────────────────────
async function uploadCV(input) {
  if (!input.files || !input.files[0]) return;
  const fd = new FormData();
  fd.append('cv', input.files[0]);

  const r = await apiFetch('/profile/cv', { method: 'POST', body: fd });
  if (!r) return;

  if (r.ok) {
    showInlineAlert('profileAlert', 'CV uploaded!', 'success');
    loadProfile();
  } else {
    showInlineAlert('profileAlert', r.data.message || 'Failed to upload CV.');
  }
  input.value = '';
}
