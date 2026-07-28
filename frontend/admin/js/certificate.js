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
    const noImg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='34' viewBox='0 0 44 34'><rect width='44' height='34' rx='4' fill='%23e2e8f0'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='7' fill='%2394a3b8'>Cert</text></svg>`;
    const imgSrc = c.image_url || noImg;
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
  document.getElementById('certNameId').value      = cert?.name_id || '';
  document.getElementById('certIssuer').value      = cert?.issuer || '';
  document.getElementById('certIssueDate').value   = cert?.issue_date?.split('T')[0] || '';
  document.getElementById('certExpiryDate').value  = cert?.expiry_date?.split('T')[0] || '';
  document.getElementById('certCredId').value      = cert?.credential_id || '';
  document.getElementById('certCredUrl').value     = cert?.credential_url || '';

  const preview   = document.getElementById('certImagePreview');
  const imgActions= document.getElementById('certImageActions');
  if (cert?.image_url) {
    preview.src = cert.image_url;
    preview.style.display = 'block';
    if (imgActions) imgActions.style.display = 'flex';
  } else {
    preview.style.display = 'none';
    if (imgActions) imgActions.style.display = 'none';
  }
  const certImg = document.getElementById('certImage');
  if (certImg) certImg.value = '';
  const certImgNew = document.getElementById('certImageNew');
  if (certImgNew) { certImgNew.value = ''; certImgNew.style.display = cert?.image_url ? 'none' : 'block'; }
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
  fd.append('name_id',        document.getElementById('certNameId').value.trim());
  fd.append('issuer',         document.getElementById('certIssuer').value.trim());
  fd.append('issue_date',     document.getElementById('certIssueDate').value);
  fd.append('expiry_date',    document.getElementById('certExpiryDate').value || '');
  fd.append('credential_id',  document.getElementById('certCredId').value.trim());
  fd.append('credential_url', document.getElementById('certCredUrl').value.trim());
  fd.append('sort_order',     '0');

  const imgFile = (document.getElementById('certImage')?.files[0])
                || (document.getElementById('certImageNew')?.files[0]);
  if (imgFile) fd.append('image', imgFile);

  if (!fd.get('name') || !fd.get('issuer') || !fd.get('issue_date')) {
    showInlineAlert('certAlert', 'Name, Issuer, and Issue Date are required.');
    return;
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
    showInlineAlert('certAlert', r.data.message || 'Failed to save certificate.');
  }
}

// ── Remove Image ──────────────────────────────────────────────────────────────
async function removeCertImage() {
  const id = document.getElementById('certId').value;
  if (!id) return;
  if (!confirm('Remove the current image? This cannot be undone.')) return;

  const r = await apiFetch(`/certificates/${id}/image`, { method: 'DELETE' });
  if (!r) return;
  if (r.ok) {
    document.getElementById('certImagePreview').style.display = 'none';
    const imgActions = document.getElementById('certImageActions');
    if (imgActions) imgActions.style.display = 'none';
    showInlineAlert('certAlert', 'Image removed.', 'success');
  } else {
    showInlineAlert('certAlert', r.data.message || 'Failed to remove image.');
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
