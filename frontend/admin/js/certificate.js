'use strict';

let currentCertId = null;

// ── Load certificates ─────────────────────────────────────────────────────────
async function loadCertificates() {
  const r = await apiFetch('/certificates');
  if (!r || !r.ok) return showInlineAlert('certAlert', 'Failed to load certificates.');

  const certs = r.data.data || [];
  const tbody = document.getElementById('certTableBody');
  if (certs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-muted">No certificates yet.</td></tr>';
    return;
  }

  tbody.innerHTML = certs.map(c => {
    // Cloudinary sudah menyimpan URL penuh — tidak perlu prefix backend
    const imgSrc = c.image_url || 'https://via.placeholder.com/44x34?text=Cert';
    return `
      <tr>
        <td><img src="${imgSrc}" class="thumb" alt="Certificate image"/></td>
        <td><strong>${escHtml(c.name)}</strong></td>
        <td>${escHtml(c.issuer)}</td>
        <td>${fmtDate(c.issue_date)}</td>
        <td>
          ${c.credential_url ? `<a href="${escHtml(c.credential_url)}" target="_blank" class="text-muted" style="font-size:11px">View ↗</a>` : '—'}
        </td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm" onclick="editCertificate(${c.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteCertificate(${c.id})">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ── Open modal ────────────────────────────────────────────────────────────────
function openCertModal(cert = null) {
  currentCertId = cert ? cert.id : null;
  document.getElementById('certModalTitle').textContent = cert ? 'Edit Certificate' : 'Add Certificate';
  document.getElementById('certId').value          = cert?.id || '';
  document.getElementById('certName').value        = cert?.name || '';
  document.getElementById('certIssuer').value      = cert?.issuer || '';
  document.getElementById('certIssueDate').value   = cert?.issue_date?.split('T')[0] || '';
  document.getElementById('certExpiryDate').value  = cert?.expiry_date?.split('T')[0] || '';
  document.getElementById('certCredId').value      = cert?.credential_id || '';
  document.getElementById('certCredUrl').value     = cert?.credential_url || '';

  const preview = document.getElementById('certImagePreview');
  if (cert?.image_url) {
    // Cloudinary URL sudah absolute — gunakan langsung
    preview.src = cert.image_url;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }
  document.getElementById('certImage').value = '';
  openModal('certModal');
}

// ── Edit ──────────────────────────────────────────────────────────────────────
async function editCertificate(id) {
  const r = await apiFetch(`/certificates/${id}`);
  if (!r || !r.ok) return showInlineAlert('certAlert', 'Failed to load certificate.');
  openCertModal(r.data.data);
}

// ── Save ──────────────────────────────────────────────────────────────────────
async function saveCertificate() {
  const id = document.getElementById('certId').value;
  const fd = new FormData();
  fd.append('name',           document.getElementById('certName').value.trim());
  fd.append('issuer',         document.getElementById('certIssuer').value.trim());
  fd.append('issue_date',     document.getElementById('certIssueDate').value);
  fd.append('expiry_date',    document.getElementById('certExpiryDate').value || '');
  fd.append('credential_id',  document.getElementById('certCredId').value.trim());
  fd.append('credential_url', document.getElementById('certCredUrl').value.trim());
  fd.append('sort_order',     '0');

  const imgFile = document.getElementById('certImage').files[0];
  if (imgFile) fd.append('image', imgFile);

  if (!fd.get('name') || !fd.get('issuer') || !fd.get('issue_date')) {
    return alert('Name, Issuer, and Issue Date are required.');
  }

  setBtnLoading('certSaveBtn', true, 'Save');
  const method = id ? 'PUT' : 'POST';
  const path   = id ? `/certificates/${id}` : '/certificates';

  const r = await apiFetch(path, { method, body: fd });
  setBtnLoading('certSaveBtn', false, 'Save');
  if (!r) return;

  if (r.ok) {
    showInlineAlert('certAlert', `Certificate ${id ? 'updated' : 'created'} successfully!`, 'success');
    closeModal('certModal');
    loadCertificates();
  } else {
    alert(r.data.message || 'Failed to save certificate.');
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
async function deleteCertificate(id) {
  confirmDelete('Delete this certificate?', async () => {
    const r = await apiFetch(`/certificates/${id}`, { method: 'DELETE' });
    if (!r) return;
    if (r.ok) {
      showInlineAlert('certAlert', 'Certificate deleted.', 'success');
      loadCertificates();
    } else {
      showInlineAlert('certAlert', r.data.message || 'Failed to delete.');
    }
  });
}
