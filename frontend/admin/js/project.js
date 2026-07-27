'use strict';

let currentProjId = null;

// ── Load projects ─────────────────────────────────────────────────────────────
async function loadProjects() {
  const r = await apiFetch('/projects');
  if (!r || !r.ok) return showInlineAlert('projAlert', 'Failed to load projects.');

  const projs = r.data.data || [];
  const tbody = document.getElementById('projTableBody');
  if (projs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-muted">No projects yet.</td></tr>';
    return;
  }

  tbody.innerHTML = projs.map(p => {
    // Cloudinary sudah menyimpan URL penuh — tidak perlu prefix backend
    const imgSrc = p.image_url || 'https://via.placeholder.com/44x34?text=No+Img';
    return `
      <tr>
        <td><img src="${imgSrc}" class="thumb" alt="Project thumbnail"/></td>
        <td><strong>${escHtml(p.title)}</strong><br/><small class="text-muted">${escHtml(p.slug)}</small></td>
        <td><span class="badge badge-blue">${escHtml(p.category || 'General')}</span></td>
        <td>${p.is_featured ? '<span class="badge badge-orange">Featured</span>' : '—'}</td>
        <td>
          ${p.demo_url ? `<a href="${escHtml(p.demo_url)}" target="_blank" class="text-muted" style="font-size:11px">Demo ↗</a>` : ''}
          ${p.repo_url ? `<a href="${escHtml(p.repo_url)}" target="_blank" class="text-muted" style="font-size:11px">Repo ↗</a>` : ''}
        </td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm" onclick="editProject(${p.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteProject(${p.id})">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ── Open modal ────────────────────────────────────────────────────────────────
function openProjModal(proj = null) {
  currentProjId = proj ? proj.id : null;
  document.getElementById('projModalTitle').textContent = proj ? 'Edit Project' : 'Add Project';
  document.getElementById('projId').value            = proj?.id || '';
  document.getElementById('projTitle').value         = proj?.title || '';
  document.getElementById('projTitleId').value       = proj?.title_id || '';
  document.getElementById('projShortDesc').value     = proj?.short_desc || '';
  document.getElementById('projShortDescId').value   = proj?.short_desc_id || '';
  document.getElementById('projDesc').value          = proj?.description || '';
  document.getElementById('projDescId').value        = proj?.description_id || '';
  document.getElementById('projDemo').value        = proj?.demo_url || '';
  document.getElementById('projRepo').value        = proj?.repo_url || '';
  document.getElementById('projCategory').value    = proj?.category || '';
  document.getElementById('projTech').value        = proj?.tech_stack || '';
  document.getElementById('projMetricUsers').value = proj?.metric_users || '';
  document.getElementById('projMetricPerf').value  = proj?.metric_perf || '';
  document.getElementById('projMetricCustom').value= proj?.metric_custom || '';
  document.getElementById('projFeatured').checked  = !!proj?.is_featured;
  document.getElementById('projSort').value        = proj?.sort_order || 0;

  const preview = document.getElementById('projImagePreview');
  if (proj?.image_url) {
    // Cloudinary URL sudah absolute — gunakan langsung
    preview.src = proj.image_url;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }
  document.getElementById('projImage').value = '';
  openModal('projModal');
}

// ── Edit ──────────────────────────────────────────────────────────────────────
async function editProject(id) {
  const r = await apiFetch(`/projects/${id}`);
  if (!r || !r.ok) return showInlineAlert('projAlert', 'Failed to load project.');
  openProjModal(r.data.data);
}

// ── Save ──────────────────────────────────────────────────────────────────────
async function saveProject() {
  const id = document.getElementById('projId').value;
  const fd = new FormData();
  fd.append('title',            document.getElementById('projTitle').value.trim());
  fd.append('title_id',         document.getElementById('projTitleId').value.trim());
  fd.append('short_desc',       document.getElementById('projShortDesc').value.trim());
  fd.append('short_desc_id',    document.getElementById('projShortDescId').value.trim());
  fd.append('description',      document.getElementById('projDesc').value.trim());
  fd.append('description_id',   document.getElementById('projDescId').value.trim());
  fd.append('demo_url',        document.getElementById('projDemo').value.trim());
  fd.append('repo_url',        document.getElementById('projRepo').value.trim());
  fd.append('category',        document.getElementById('projCategory').value.trim());
  fd.append('tech_stack',      document.getElementById('projTech').value.trim());
  fd.append('metric_users',    document.getElementById('projMetricUsers').value.trim());
  fd.append('metric_perf',     document.getElementById('projMetricPerf').value.trim());
  fd.append('metric_custom',   document.getElementById('projMetricCustom').value.trim());
  fd.append('is_featured',     document.getElementById('projFeatured').checked ? '1' : '0');
  fd.append('sort_order',      document.getElementById('projSort').value);

  const imgFile = document.getElementById('projImage').files[0];
  if (imgFile) fd.append('image', imgFile);

  if (!fd.get('title')) {
    return alert('Title is required.');
  }

  setBtnLoading('projSaveBtn', true, 'Save');
  const method = id ? 'PUT' : 'POST';
  const path   = id ? `/projects/${id}` : '/projects';

  const r = await apiFetch(path, { method, body: fd });
  setBtnLoading('projSaveBtn', false, 'Save');
  if (!r) return;

  if (r.ok) {
    showInlineAlert('projAlert', `Project ${id ? 'updated' : 'created'} successfully!`, 'success');
    closeModal('projModal');
    loadProjects();
  } else {
    alert(r.data.message || 'Failed to save project.');
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
async function deleteProject(id) {
  confirmDelete('Delete this project?', async () => {
    const r = await apiFetch(`/projects/${id}`, { method: 'DELETE' });
    if (!r) return;
    if (r.ok) {
      showInlineAlert('projAlert', 'Project deleted.', 'success');
      loadProjects();
    } else {
      showInlineAlert('projAlert', r.data.message || 'Failed to delete.');
    }
  });
}
