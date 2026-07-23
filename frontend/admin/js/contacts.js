'use strict';

// ── Load contacts ─────────────────────────────────────────────────────────────
async function loadContacts() {
  const r = await apiFetch('/contacts');
  if (!r || !r.ok) return showInlineAlert('contactAlert', 'Failed to load messages.');

  const messages = r.data.data || [];
  const unread   = r.data.unread_count || 0;

  // Update badge + count label
  updateBadge(unread);
  const countEl = document.getElementById('unreadCount');
  countEl.textContent = unread > 0 ? `${unread} unread` : 'All read';
  countEl.className   = `badge ${unread > 0 ? 'badge-blue' : 'badge-gray'}`;

  const tbody = document.getElementById('contactTableBody');
  if (messages.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-muted">No messages yet.</td></tr>';
    return;
  }

  tbody.innerHTML = messages.map(m => {
    const preview = (m.message || '').substring(0, 80) + (m.message?.length > 80 ? '…' : '');
    return `
      <tr class="${!m.is_read ? 'unread-row' : ''}">
        <td>${escHtml(m.sender_name)}</td>
        <td><a href="mailto:${escHtml(m.sender_email)}">${escHtml(m.sender_email)}</a></td>
        <td>${escHtml(m.subject || '—')}</td>
        <td class="msg-preview">${escHtml(preview)}</td>
        <td>${fmtDate(m.created_at)}</td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm" onclick="viewMessage(${m.id})">View</button>
            <button class="btn btn-danger btn-sm" onclick="deleteMessage(${m.id})">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ── View single message ───────────────────────────────────────────────────────
async function viewMessage(id) {
  const r = await apiFetch(`/contacts/${id}`);
  if (!r || !r.ok) return showInlineAlert('contactAlert', 'Failed to load message.');

  const m = r.data.data;
  document.getElementById('msgFrom').textContent    = m.sender_name;
  document.getElementById('msgEmail').textContent   = m.sender_email;
  document.getElementById('msgEmail').href          = `mailto:${m.sender_email}`;
  document.getElementById('msgSubject').textContent = m.subject || '(no subject)';
  document.getElementById('msgDate').textContent    = fmtDate(m.created_at);
  document.getElementById('msgBody').textContent    = m.message;
  document.getElementById('msgReplyLink').href      = `mailto:${m.sender_email}?subject=Re: ${encodeURIComponent(m.subject || '')}`;

  openModal('msgModal');

  // Refresh table so row loses "unread" style
  loadContacts();
}

// ── Delete message ────────────────────────────────────────────────────────────
async function deleteMessage(id) {
  confirmDelete('Delete this message? This action cannot be undone.', async () => {
    const r = await apiFetch(`/contacts/${id}`, { method: 'DELETE' });
    if (!r) return;
    if (r.ok) {
      showInlineAlert('contactAlert', 'Message deleted.', 'success');
      loadContacts();
    } else {
      showInlineAlert('contactAlert', r.data.message || 'Failed to delete.');
    }
  });
}
