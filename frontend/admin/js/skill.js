'use strict';

let currentSkillId = null;

// ── Load skills ───────────────────────────────────────────────────────────────
async function loadSkills() {
  const r = await apiFetch('/skills');
  if (!r || !r.ok) return showInlineAlert('skillAlert', 'Failed to load skills.');

  const skills = r.data.data || [];
  const tbody = document.getElementById('skillTableBody');
  if (skills.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-muted">No skills yet.</td></tr>';
    return;
  }

  tbody.innerHTML = skills.map(s => `
    <tr>
      <td><strong>${escHtml(s.name)}</strong></td>
      <td><span class="badge badge-blue">${escHtml(s.category || 'General')}</span></td>
      <td>
        <div class="skill-bar-wrap">
          <div class="skill-bar-bg">
            <div class="skill-bar-fill" style="width:${s.level}%"></div>
          </div>
          <span style="font-size:12px;color:var(--muted);width:40px;text-align:right">${s.level}%</span>
        </div>
      </td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-sm" onclick="editSkill(${s.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSkill(${s.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Open modal ────────────────────────────────────────────────────────────────
function openSkillModal(skill = null) {
  currentSkillId = skill ? skill.id : null;
  document.getElementById('skillModalTitle').textContent = skill ? 'Edit Skill' : 'Add Skill';
  document.getElementById('skillId').value           = skill?.id || '';
  document.getElementById('skillName').value         = skill?.name || '';
  document.getElementById('skillCategory').value     = skill?.category || '';
  document.getElementById('skillCategoryId').value   = skill?.category_id || '';
  document.getElementById('skillLevel').value        = skill?.level || 80;
  document.getElementById('skillIcon').value         = skill?.icon_url || '';
  document.getElementById('skillSort').value         = skill?.sort_order || 0;
  document.getElementById('skillLevelDisplay').textContent = skill?.level || 80;
  openModal('skillModal');
}

// ── Edit ──────────────────────────────────────────────────────────────────────
async function editSkill(id) {
  const r = await apiFetch(`/skills/${id}`);
  if (!r || !r.ok) return showInlineAlert('skillAlert', 'Failed to load skill.');
  openSkillModal(r.data.data);
}

// ── Save ──────────────────────────────────────────────────────────────────────
async function saveSkill() {
  const id = document.getElementById('skillId').value;
  const payload = {
    name:        document.getElementById('skillName').value.trim(),
    category:    document.getElementById('skillCategory').value.trim(),
    category_id: document.getElementById('skillCategoryId').value.trim(),
    level:       Number(document.getElementById('skillLevel').value) || 80,
    icon_url:    document.getElementById('skillIcon').value.trim(),
    sort_order:  Number(document.getElementById('skillSort').value) || 0
  };

  if (!payload.name) {
    return alert('Skill name is required.');
  }

  setBtnLoading('skillSaveBtn', true, 'Save');
  const method = id ? 'PUT' : 'POST';
  const path   = id ? `/skills/${id}` : '/skills';

  const r = await apiFetch(path, { method, body: JSON.stringify(payload) });
  setBtnLoading('skillSaveBtn', false, 'Save');
  if (!r) return;

  if (r.ok) {
    showInlineAlert('skillAlert', `Skill ${id ? 'updated' : 'created'} successfully!`, 'success');
    closeModal('skillModal');
    loadSkills();
  } else {
    alert(r.data.message || 'Failed to save skill.');
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
async function deleteSkill(id) {
  confirmDelete('Delete this skill?', async () => {
    const r = await apiFetch(`/skills/${id}`, { method: 'DELETE' });
    if (!r) return;
    if (r.ok) {
      showInlineAlert('skillAlert', 'Skill deleted.', 'success');
      loadSkills();
    } else {
      showInlineAlert('skillAlert', r.data.message || 'Failed to delete.');
    }
  });
}
