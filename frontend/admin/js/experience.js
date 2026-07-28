'use strict';

let currentExpId = null;

// ── Load experiences ──────────────────────────────────────────────────────────
async function loadExperiences() {
  const r = await apiFetch('/experiences');
  if (!r || !r.ok) return showInlineAlert('expAlert', 'Failed to load experiences.');

  const exps = r.data.data || [];
  const tbody = document.getElementById('expTableBody');
  if (exps.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted">No experience records yet.</td></tr>';
    return;
  }

  tbody.innerHTML = exps.map(e => `
    <tr>
      <td><strong>${escHtml(e.company)}</strong></td>
      <td>${escHtml(e.position)}</td>
      <td>${fmtDate(e.start_date)} – ${e.is_current ? 'Present' : fmtDate(e.end_date)}</td>
      <td><span class="badge badge-gray">${escHtml(e.tech_stack || '—')}</span></td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-sm" onclick="editExperience(${e.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteExperience(${e.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Open modal (add or edit) ──────────────────────────────────────────────────
function openExpModal(exp = null) {
  currentExpId = exp ? exp.id : null;
  document.getElementById('expModalTitle').textContent = exp ? 'Edit Experience' : 'Add Experience';
  document.getElementById('expId').value           = exp?.id || '';
  document.getElementById('expCompany').value      = exp?.company || '';
  document.getElementById('expPosition').value     = exp?.position || '';
  document.getElementById('expPositionId').value   = exp?.position_id || '';
  document.getElementById('expLocation').value     = exp?.location || '';
  document.getElementById('expStartDate').value    = exp?.start_date?.split('T')[0] || '';
  document.getElementById('expEndDate').value      = exp?.end_date?.split('T')[0] || '';
  document.getElementById('expIsCurrent').checked  = !!exp?.is_current;
  document.getElementById('expDesc').value         = exp?.description || '';
  document.getElementById('expDescId').value       = exp?.description_id || '';
  document.getElementById('expTech').value         = exp?.tech_stack || '';
  document.getElementById('expSort').value         = exp?.sort_order || 0;
  toggleCurrentJob(document.getElementById('expIsCurrent'));
  openModal('expModal');
}

function toggleCurrentJob(checkbox) {
  document.getElementById('expEndDate').disabled = checkbox.checked;
  if (checkbox.checked) document.getElementById('expEndDate').value = '';
}

// ── Edit (fetch + open modal) ─────────────────────────────────────────────────
async function editExperience(id) {
  const r = await apiFetch(`/experiences/${id}`);
  if (!r || !r.ok) return showInlineAlert('expAlert', 'Failed to load experience.');
  openExpModal(r.data.data);
}

// ── Save (create or update) ───────────────────────────────────────────────────
async function saveExperience() {
  const id  = document.getElementById('expId').value;
  const payload = {
    company:        document.getElementById('expCompany').value.trim(),
    position:       document.getElementById('expPosition').value.trim(),
    position_id:    document.getElementById('expPositionId').value.trim(),
    location:       document.getElementById('expLocation').value.trim(),
    start_date:     document.getElementById('expStartDate').value,
    end_date:       document.getElementById('expEndDate').value || null,
    is_current:     document.getElementById('expIsCurrent').checked ? 1 : 0,
    description:    document.getElementById('expDesc').value.trim(),
    description_id: document.getElementById('expDescId').value.trim(),
    tech_stack:     document.getElementById('expTech').value.trim(),
    sort_order:     Number(document.getElementById('expSort').value) || 0
  };

  if (!payload.company || !payload.position || !payload.start_date) {
    showInlineAlert('expAlert', 'Company, Position, and Start Date are required.');
    return;
  }

  setBtnLoading('expSaveBtn', true, 'Save');
  const method = id ? 'PUT' : 'POST';
  const path   = id ? `/experiences/${id}` : '/experiences';

  const r = await apiFetch(path, { method, body: JSON.stringify(payload) });
  setBtnLoading('expSaveBtn', false, 'Save');
  if (!r) return;

  if (r.ok) {
    showInlineAlert('expAlert', `Experience ${id ? 'updated' : 'created'} successfully!`, 'success');
    closeModal('expModal');
    loadExperiences();
  } else {
    showInlineAlert('expAlert', r.data.message || 'Failed to save experience.');
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
async function deleteExperience(id) {
  confirmDelete('Delete this experience record?', async () => {
    const r = await apiFetch(`/experiences/${id}`, { method: 'DELETE' });
    if (!r) return;
    if (r.ok) {
      showInlineAlert('expAlert', 'Experience deleted.', 'success');
      loadExperiences();
    } else {
      showInlineAlert('expAlert', r.data.message || 'Failed to delete.');
    }
  });
}
