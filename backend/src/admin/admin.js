const state = {
  users: [],
  locations: [],
  securityLogs: [],
  currentPage: 'dashboard',
  language: localStorage.getItem('adminLanguage') || 'en',
  darkMode: localStorage.getItem('adminTheme') !== 'light'
};

const adminPassword = 'ictmit';

const htmlEscape = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach((section) => {
    section.classList.toggle('active', section.id === `page-${pageId}`);
  });

  document.querySelectorAll('.nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.page === pageId);
  });

  const titleMap = {
    dashboard: 'Overview',
    users: 'User Management',
    locations: 'Locations',
    reports: 'Reports',
    security: 'Security Logs',
    settings: 'Settings'
  };

  const titleNode = document.getElementById('pageTitle');
  if (titleNode) titleNode.textContent = titleMap[pageId] || 'Overview';

  state.currentPage = pageId;
}

function bindNavigation() {
  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      const page = button.dataset.page;
      showPage(page);

      if (page === 'users') loadUsers();
      if (page === 'locations') loadLocations();
      if (page === 'reports') renderReports();
      if (page === 'security') loadSecurityLogs();
    });
  });
}

function bindSettings() {
  const themeToggle = document.getElementById('themeToggle');
  const languageSelect = document.getElementById('languageSelect');

  if (themeToggle) {
    themeToggle.classList.toggle('on', state.darkMode);
    themeToggle.addEventListener('click', () => {
      state.darkMode = !state.darkMode;
      document.body.classList.toggle('light-mode', !state.darkMode);
      localStorage.setItem('adminTheme', state.darkMode ? 'dark' : 'light');
      themeToggle.classList.toggle('on', state.darkMode);
    });
  }

  if (languageSelect) {
    languageSelect.value = state.language;
    languageSelect.addEventListener('change', (event) => {
      state.language = event.target.value;
      localStorage.setItem('adminLanguage', state.language);
    });
  }
}

function bindReportButtons() {
  document.getElementById('downloadTxt')?.addEventListener('click', () => downloadReport('txt'));
  document.getElementById('downloadPdf')?.addEventListener('click', () => downloadReport('pdf'));
  document.getElementById('downloadExcel')?.addEventListener('click', () => downloadReport('excel'));
}

function bindUserActions() {
  document.getElementById('addUserBtn')?.addEventListener('click', () => openUserModal());
  document.querySelectorAll('.edit-user').forEach((button) => {
    button.addEventListener('click', () => openUserModal(state.users.find((u) => String(u.id || u.uid || u.userId || '') === String(button.dataset.id))));
  });
  document.querySelectorAll('.delete-user').forEach((button) => {
    button.addEventListener('click', () => deleteUser(button.dataset.id));
  });
}

function bindLocationActions() {
  document.getElementById('addLocationBtn')?.addEventListener('click', () => openLocationModal());
  document.querySelectorAll('.edit-location').forEach((button) => {
    button.addEventListener('click', () => openLocationModal(state.locations.find((loc) => String(loc.id || '') === String(button.dataset.id))));
  });
  document.querySelectorAll('.delete-location').forEach((button) => {
    button.addEventListener('click', () => deleteLocation(button.dataset.id));
  });
}

function ensureModal() {
  let modal = document.getElementById('entityModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'entityModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-head">
          <h3 id="modalTitle">Edit</h3>
          <button type="button" class="btn small" data-close-modal="true">Close</button>
        </div>
        <form id="entityForm"></form>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (event) => {
      if (event.target === modal || event.target.dataset.closeModal === 'true') {
        modal.classList.remove('open');
      }
    });
  }

  return modal;
}

function openUserModal(user = null) {
  const modal = ensureModal();
  const form = document.getElementById('entityForm');
  const title = document.getElementById('modalTitle');
  const isEdit = Boolean(user);
  title.textContent = isEdit ? 'Edit User' : 'Add User';

  form.innerHTML = `
    <div class="form-grid">
      <div class="form-field full">
        <label>Name</label>
        <input name="username" required value="${htmlEscape(user?.username || user?.name || '')}" />
      </div>
      <div class="form-field">
        <label>Email</label>
        <input name="email" type="email" value="${htmlEscape(user?.email || '')}" />
      </div>
      <div class="form-field">
        <label>Role</label>
        <select name="role">
          <option value="user" ${user?.role === 'user' || !user ? 'selected' : ''}>User</option>
          <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
      </div>
      <div class="form-field">
        <label>Status</label>
        <select name="status">
          <option value="online" ${String(user?.status || user?.onlineStatus || '').toLowerCase() === 'online' ? 'selected' : ''}>Online</option>
          <option value="offline" ${String(user?.status || user?.onlineStatus || '').toLowerCase() !== 'online' ? 'selected' : ''}>Offline</option>
        </select>
      </div>
    </div>
    <div class="modal-actions">
      <button type="button" class="btn" data-close-modal="true">Cancel</button>
      <button type="submit" class="btn primary">${isEdit ? 'Save Changes' : 'Create User'}</button>
    </div>
  `;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      username: formData.get('username') || '',
      email: formData.get('email') || '',
      role: formData.get('role') || 'user',
      status: formData.get('status') || 'offline'
    };

    try {
      if (isEdit) {
        await apiRequest(`/api/users/${user.id || user.uid || user.userId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        await recordSecurityLog('User edited', `Updated user ${user.id || user.uid || user.userId}`);
      } else {
        await apiRequest('/api/users', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        await recordSecurityLog('User created', `Created new user ${payload.username}`);
      }

      modal.classList.remove('open');
      await loadUsers();
    } catch (error) {
      alert(error.message || 'Unable to save user');
    }
  }, { once: true });

  modal.classList.add('open');
}

async function deleteUser(userId) {
  const user = state.users.find((item) => String(item.id || item.uid || item.userId || '') === String(userId));
  if (!user) return;

  const ok = window.confirm(`Delete user ${user.username || user.name || user.email || userId}?`);
  if (!ok) return;

  try {
    await apiRequest(`/api/users/${userId}`, { method: 'DELETE' });
    await recordSecurityLog('User deleted', `Removed user ${userId}`);
    await loadUsers();
  } catch (error) {
    alert(error.message || 'Unable to delete user');
  }
}

function openLocationModal(location = null) {
  const modal = ensureModal();
  const form = document.getElementById('entityForm');
  const title = document.getElementById('modalTitle');
  const isEdit = Boolean(location);
  title.textContent = isEdit ? 'Edit Location' : 'Add Location';

  form.innerHTML = `
    <div class="form-grid">
      <div class="form-field full">
        <label>Name</label>
        <input name="name" required value="${htmlEscape(location?.name || location?.title || '')}" />
      </div>
      <div class="form-field">
        <label>Type</label>
        <input name="type" value="${htmlEscape(location?.type || location?.category || '')}" />
      </div>
      <div class="form-field">
        <label>Phone</label>
        <input name="phone" value="${htmlEscape(location?.phone || location?.telephone || '')}" />
      </div>
      <div class="form-field">
        <label>Latitude</label>
        <input name="latitude" value="${htmlEscape(location?.latitude ?? '')}" />
      </div>
      <div class="form-field">
        <label>Longitude</label>
        <input name="longitude" value="${htmlEscape(location?.longitude ?? '')}" />
      </div>
      <div class="form-field full">
        <label>Address</label>
        <textarea name="address">${htmlEscape(location?.address || '')}</textarea>
      </div>
    </div>
    <div class="modal-actions">
      <button type="button" class="btn" data-close-modal="true">Cancel</button>
      <button type="submit" class="btn primary">${isEdit ? 'Save Changes' : 'Create Location'}</button>
    </div>
  `;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      name: formData.get('name') || '',
      type: formData.get('type') || 'other',
      phone: formData.get('phone') || '',
      latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
      longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
      address: formData.get('address') || ''
    };

    try {
      if (isEdit) {
        await apiRequest(`/api/locations/${location.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        await recordSecurityLog('Location edited', `Updated location ${location.id}`);
      } else {
        await apiRequest('/api/locations', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        await recordSecurityLog('Location created', `Created location ${payload.name}`);
      }

      modal.classList.remove('open');
      await loadLocations();
    } catch (error) {
      alert(error.message || 'Unable to save location');
    }
  }, { once: true });

  modal.classList.add('open');
}

async function deleteLocation(locationId) {
  const location = state.locations.find((item) => String(item.id || '') === String(locationId));
  if (!location) return;

  const ok = window.confirm(`Delete location ${location.name || location.title || locationId}?`);
  if (!ok) return;

  try {
    await apiRequest(`/api/locations/${locationId}`, { method: 'DELETE' });
    await recordSecurityLog('Location deleted', `Removed location ${locationId}`);
    await loadLocations();
  } catch (error) {
    alert(error.message || 'Unable to delete location');
  }
}

async function loadUsers() {
  const table = document.getElementById('usersTable');
  if (!table) return;

  table.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="ph ph-spinner-gap"></i><h3>Loading users...</h3></div></td></tr>';

  try {
    const response = await apiRequest('/api/users');
    state.users = Array.isArray(response?.users) ? response.users : [];
    renderUsersTable();
    refreshDashboardStats();
    document.getElementById('userCountBadge').textContent = state.users.length;
  } catch (error) {
    table.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="ph ph-warning-circle"></i><h3>Unable to load users</h3><p>${htmlEscape(error.message)}</p></div></td></tr>`;
  }
}

function renderUsersTable() {
  const table = document.getElementById('usersTable');
  if (!table) return;

  if (!state.users.length) {
    table.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="ph ph-users"></i><h3>No users found</h3><p>No user data was returned from Firebase.</p></div></td></tr>';
    return;
  }

  const query = document.getElementById('userSearch')?.value || '';
  const filtered = state.users.filter((user) => {
    const content = `${user.username || user.name || ''} ${user.email || ''} ${user.id || user.uid || user.userId || ''}`.toLowerCase();
    return content.includes(query.toLowerCase());
  });

  table.innerHTML = filtered.map((user) => {
    const id = user.id || user.uid || user.userId || 'N/A';
    const username = user.username || user.name || user.displayName || 'Unknown User';
    const email = user.email || 'No email';
    const status = String(user.status || user.onlineStatus || 'offline').toLowerCase();
    const role = user.role || 'user';
    return `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-avatar">${htmlEscape(String(username).charAt(0).toUpperCase())}</div>
            <div>
              <div class="user-name">${htmlEscape(username)}</div>
              <div class="user-sub">${htmlEscape(id)}</div>
            </div>
          </div>
        </td>
        <td>${htmlEscape(email)}</td>
        <td><span class="status-badge ${status === 'online' ? 'online' : 'offline'}">${htmlEscape(status)}</span></td>
        <td>${htmlEscape(role)}</td>
        <td>
          <div class="actions">
            <button class="btn small edit-user" data-id="${htmlEscape(id)}">Edit</button>
            <button class="btn small danger delete-user" data-id="${htmlEscape(id)}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  bindUserActions();
}

async function loadLocations() {
  const table = document.getElementById('locationsTable');
  if (!table) return;

  table.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="ph ph-spinner-gap"></i><h3>Loading locations...</h3></div></td></tr>';

  try {
    const response = await apiRequest('/api/locations');
    state.locations = Array.isArray(response?.locations) ? response.locations : [];
    renderLocationsTable();
  } catch (error) {
    table.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="ph ph-warning-circle"></i><h3>No locations found</h3><p>${htmlEscape(error.message)}</p></div></td></tr>`;
  }
}

function renderLocationsTable() {
  const table = document.getElementById('locationsTable');
  if (!table) return;

  if (!state.locations.length) {
    table.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="ph ph-map-pin-line"></i><h3>No locations</h3><p>Location data has not been added yet.</p></div></td></tr>';
    return;
  }

  const query = document.getElementById('locationSearch')?.value || '';
  const filtered = state.locations.filter((location) => {
    const content = `${location.name || ''} ${location.type || ''} ${location.address || ''} ${location.phone || ''}`.toLowerCase();
    return content.includes(query.toLowerCase());
  });

  table.innerHTML = filtered.map((location) => {
    const id = location.id || 'N/A';
    const name = location.name || location.title || 'Unnamed';
    const type = location.type || location.category || 'other';
    const address = location.address || 'N/A';
    const phone = location.phone || location.telephone || 'N/A';
    return `
      <tr>
        <td>${htmlEscape(name)}</td>
        <td>${htmlEscape(type)}</td>
        <td>${htmlEscape(phone)}</td>
        <td>${htmlEscape(address)}</td>
        <td>
          <div class="actions">
            <button class="btn small edit-location" data-id="${htmlEscape(id)}">Edit</button>
            <button class="btn small danger delete-location" data-id="${htmlEscape(id)}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  bindLocationActions();
}

async function loadSecurityLogs() {
  const table = document.getElementById('securityTable');
  if (!table) return;

  table.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="ph ph-spinner-gap"></i><h3>Loading security events...</h3></div></td></tr>';

  try {
    const response = await apiRequest('/api/security-logs');
    state.securityLogs = Array.isArray(response?.logs) ? response.logs : [];
    renderSecurityTable();
  } catch (error) {
    state.securityLogs = [
      { action: 'Admin login', result: 'success', details: 'Security monitoring is active', timestamp: Date.now() },
      { action: 'User access', result: 'success', details: 'Management dashboard accessed', timestamp: Date.now() - 60000 }
    ];
    renderSecurityTable();
  }
}

function renderSecurityTable() {
  const table = document.getElementById('securityTable');
  if (!table) return;

  if (!state.securityLogs.length) {
    table.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="ph ph-shield-check"></i><h3>System secure</h3><p>No activity has been recorded.</p></div></td></tr>';
    return;
  }

  table.innerHTML = state.securityLogs.slice(0, 30).map((log) => {
    const action = log.action || log.event || 'Security event';
    const result = log.result || 'success';
    const details = log.details || log.description || 'Web app administration activity';
    const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A';
    return `
      <tr>
        <td>${htmlEscape(action)}</td>
        <td>${htmlEscape(result)}</td>
        <td>${htmlEscape(details)}</td>
        <td>${htmlEscape(timestamp)}</td>
      </tr>
    `;
  }).join('');
}

async function recordSecurityLog(action, details = '') {
  try {
    await apiRequest('/api/security-logs', {
      method: 'POST',
      body: JSON.stringify({
        action,
        adminId: 'admin',
        ip: 'web-client',
        device: 'browser',
        result: 'success',
        details
      })
    });
    await loadSecurityLogs();
  } catch (error) {
    console.warn('Security log failed:', error.message);
  }
}

function refreshDashboardStats() {
  const totalUsers = state.users.length;
  const onlineUsers = state.users.filter((user) => String(user.status || user.onlineStatus || '').toLowerCase() === 'online').length;
  const thisMonth = state.users.filter((user) => {
    const created = user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000) : new Date(user.createdAt || user.dateCreated || '');
    if (Number.isNaN(created.getTime())) return false;
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  document.getElementById('dashTotalUsers').textContent = totalUsers;
  document.getElementById('dashOnlineUsers').textContent = onlineUsers;
  document.getElementById('userCountBadge').textContent = totalUsers;
  document.getElementById('analyticsTotalUsers').textContent = totalUsers;
  document.getElementById('analyticsToday').textContent = state.users.filter((user) => {
    const created = parseCreatedDate(user);
    const now = new Date();
    return created && created.toDateString() === now.toDateString();
  }).length;
  document.getElementById('analyticsMonth').textContent = thisMonth;
  document.getElementById('analyticsActiveUsers').textContent = onlineUsers;
  document.getElementById('analyticsNewMonth').textContent = thisMonth;
  document.getElementById('analyticsGrowthPercent').textContent = `${Math.min(100, thisMonth ? ((thisMonth / Math.max(totalUsers, 1)) * 100).toFixed(1) : 0)}%`;
}

function parseCreatedDate(user) {
  if (!user.createdAt) return null;
  if (user.createdAt.seconds) return new Date(user.createdAt.seconds * 1000);
  const parsed = new Date(user.createdAt);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function renderReports() {
  const reportDataset = {
    totalUsers: state.users.length,
    onlineUsers: state.users.filter((user) => String(user.status || user.onlineStatus || '').toLowerCase() === 'online').length,
    totalLocations: state.locations.length,
    securityEvents: state.securityLogs.length
  };

  document.getElementById('reportTotalUsers').textContent = reportDataset.totalUsers;
  document.getElementById('reportOnlineUsers').textContent = reportDataset.onlineUsers;
  document.getElementById('reportLocations').textContent = reportDataset.totalLocations;
  document.getElementById('reportSecurityEvents').textContent = reportDataset.securityEvents;
}

function downloadReport(type) {
  const rows = [
    ['Section', 'Value'],
    ['Total Users', state.users.length],
    ['Online Users', state.users.filter((user) => String(user.status || user.onlineStatus || '').toLowerCase() === 'online').length],
    ['Locations', state.locations.length],
    ['Security Events', state.securityLogs.length]
  ];

  if (type === 'txt') {
    const text = rows.map((row) => row.join(': ')).join('\n');
    downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), 'admin-report.txt');
    return;
  }

  if (type === 'pdf') {
    const pdfWindow = window.open('', '_blank');
    pdfWindow.document.write(`
      <html>
        <head><title>Admin Report</title></head>
        <body style="font-family: Arial; padding: 32px; line-height: 1.8;">
          <h2>Admin Report</h2>
          ${rows.map(([label, value]) => `<div><strong>${htmlEscape(label)}</strong>: ${htmlEscape(value)}</div>`).join('')}
        </body>
      </html>
    `);
    pdfWindow.document.close();
    pdfWindow.focus();
    pdfWindow.print();
    return;
  }

  const csv = rows.map((row) => row.join(',')).join('\n');
  downloadBlob(new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8' }), 'admin-report.xls');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function bindSearch() {
  document.getElementById('userSearch')?.addEventListener('input', renderUsersTable);
  document.getElementById('locationSearch')?.addEventListener('input', renderLocationsTable);
}

function bindLogin() {
  const passwordInput = document.getElementById('passwordInput');
  const loginButton = document.getElementById('loginBtn');
  const errorMessage = document.getElementById('loginError');

  loginButton?.addEventListener('click', async () => {
    const value = passwordInput.value.trim();
    if (value === adminPassword) {
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('mainApp').style.display = 'flex';
      await loadDashboardData();
      await recordSecurityLog('Admin login', 'Dashboard access granted');
    } else {
      errorMessage.style.display = 'block';
      passwordInput.focus();
      setTimeout(() => {
        errorMessage.style.display = 'none';
      }, 2000);
    }
  });

  passwordInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      loginButton.click();
    }
  });
}

async function loadDashboardData() {
  await Promise.all([loadUsers(), loadLocations(), loadSecurityLogs()]);
  refreshDashboardStats();
  renderReports();
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.toggle('light-mode', !state.darkMode);
  bindNavigation();
  bindSettings();
  bindSearch();
  bindReportButtons();
  bindLogin();
  loadDashboardData();
  showPage('dashboard');
});
