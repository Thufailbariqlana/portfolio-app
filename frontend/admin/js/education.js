'use strict';

let currentEduId = null;

// ── Load education ────────────────────────────────────────────────────────────
async function loadEducation() {
  const r = await apiFetch('/education');
  if (!r || !r.ok) return showInlineAlert('eduAlert', 'Failed to load education.');

  const edu = r.data.data || [];
  const tbody = document.getElementById('eduTableBody');
  if (edu.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-muted">No education records yet.</td></tr>';
    return;
  }

  tbody.innerHTML = edu.map(e => {
    const years = e.is_current ? `${e.start_year} – Present` : `${e.start_year} – ${e.end_year || '?'}`;
    return `
      <tr>
        <td><strong>${escHtml(e.institution)}</strong></td>
        <td>${escHtml(e.degree)}</td>
        <td>${escHtml(e.field_of_study || '—')}</td>
        <td>${years}</td>
        <td>${e.gpa ? e.gpa.toFixed(2) : '—'}</td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm" onclick="editEducation(${e.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteEducation(${e.id})">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ── Open modal ────────────────────────────────────────────────────────────────
function openEduModal(edu = null) {
  currentEduId = edu ? edu.id : null;
  document.getElementById('eduModalTitle').textContent = edu ? 'Edit Education' : 'Add Education';
  document.getElementById('eduId').value           = edu?.id || '';
  document.getElementById('eduInstitution').value  = edu?.institution || '';
  document.getElementById('eduDegree').value       = edu?.degree || '';
  document.getElementById('eduDegreeId').value     = edu?.degree_id || '';
  document.getElementById('eduField').value        = edu?.field_of_study || '';
  document.getElementById('eduFieldId').value      = edu?.field_of_study_id || '';
  document.getElementById('eduStartYear').value    = edu?.start_year || '';
  document.getElementById('eduEndYear').value      = edu?.end_year || '';
  document.getElementById('eduIsCurrent').checked  = !!edu?.is_current;
  document.getElementById('eduGpa').value          = edu?.gpa || '';
  document.getElementById('eduDesc').value         = edu?.description || '';
  document.getElementById('eduDescId').value       = edu?.description_id || '';
  openModal('eduModal');
}

// ── Edit ──────────────────────────────────────────────────────────────────────
async function editEducation(id) {
  const r = await apiFetch(`/education/${id}`);
  if (!r || !r.ok) return showInlineAlert('eduAlert', 'Failed to load education.');
  openEduModal(r.data.data);
}

// ── Save ──────────────────────────────────────────────────────────────────────
async function saveEducation() {
  const id = document.getElementById('eduId').value;
  const payload = {
    institution:       document.getElementById('eduInstitution').value.trim(),
    degree:            document.getElementById('eduDegree').value.trim(),
    degree_id:         document.getElementById('eduDegreeId').value.trim(),
    field_of_study:    document.getElementById('eduField').value.trim(),
    field_of_study_id: document.getElementById('eduFieldId').value.trim(),
    start_year:        Number(document.getElementById('eduStartYear').value) || null,
    end_year:          Number(document.getElementById('eduEndYear').value) || null,
    is_current:        document.getElementById('eduIsCurrent').checked ? 1 : 0,
    gpa:               Number(document.getElementById('eduGpa').value) || null,
    description:       document.getElementById('eduDesc').value.trim(),
    description_id:    document.getElementById('eduDescId').value.trim(),
    sort_order:        0
  };

  if (!payload.institution || !payload.degree || !payload.start_year) {
    return alert('Institution, Degree, and Start Year are required.');
  }

  setBtnLoading('eduSaveBtn', true, 'Save');
  const method = id ? 'PUT' : 'POST';
  const path   = id ? `/education/${id}` : '/education';

  const r = await apiFetch(path, { method, body: JSON.stringify(payload) });
  setBtnLoading('eduSaveBtn', false, 'Save');
  if (!r) return;

  if (r.ok) {
    showInlineAlert('eduAlert', `Education ${id ? 'updated' : 'created'} successfully!`, 'success');
    closeModal('eduModal');
    loadEducation();
  } else {
    alert(r.data.message || 'Failed to save education.');
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
async function deleteEducation(id) {
  confirmDelete('Delete this education record?', async () => {
    const r = await apiFetch(`/education/${id}`, { method: 'DELETE' });
    if (!r) return;
    if (r.ok) {
      showInlineAlert('eduAlert', 'Education deleted.', 'success');
      loadEducation();
    } else {
      showInlineAlert('eduAlert', r.data.message || 'Failed to delete.');
    }
  });
}
