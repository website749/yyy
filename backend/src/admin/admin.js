let users = [];

async function loadUsers() {

  const table = document.getElementById("usersTable");

  table.innerHTML = `
    <tr>
      <td colspan="5" class="loading">
        Loading users...
      </td>
    </tr>
  `;

  try {

    const response = await fetch("/api/users");

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Firebase error");
    }

    users = data.users || [];

    updateStats();
    renderUsers(users);

  } catch (error) {

    console.error(error);

    table.innerHTML = `
      <tr>
        <td colspan="5" class="loading">
          ❌ Failed to load Firebase data
        </td>
      </tr>
    `;

    document.getElementById("systemStatus").textContent = "ERROR";
  }
}


function updateStats() {

  document.getElementById("totalUsers").textContent =
    users.length;

  const online = users.filter(
    user => user.status === "online"
  ).length;

  document.getElementById("onlineUsers").textContent =
    online;
}


function renderUsers(data) {

  const table = document.getElementById("usersTable");

  if (!data.length) {

    table.innerHTML = `
      <tr>
        <td colspan="5" class="loading">
          No users found
        </td>
      </tr>
    `;

    return;
  }

  table.innerHTML = data.map(user => {

    const username =
      user.username ||
      user.name ||
      "Unknown";

    const status =
      user.status || "offline";

    const lastActive =
      user.lastActive
        ? new Date(user.lastActive).toLocaleString()
        : "—";

    return `
      <tr>

        <td>
          ${escapeHTML(user.id)}
        </td>

        <td>
          ${escapeHTML(username)}
        </td>

        <td>
          <span class="status ${status === "online" ? "online" : "offline"}">
            ${escapeHTML(status)}
          </span>
        </td>

        <td>
          ${escapeHTML(lastActive)}
        </td>

        <td>
          <button
            class="action-btn"
            onclick="viewUser('${escapeJS(user.id)}')"
          >
            View
          </button>
        </td>

      </tr>
    `;

  }).join("");
}


function filterUsers() {

  const query =
    document.getElementById("searchInput")
      .value
      .toLowerCase()
      .trim();

  const filtered = users.filter(user => {

    const text = `
      ${user.id || ""}
      ${user.username || ""}
      ${user.name || ""}
      ${user.status || ""}
    `.toLowerCase();

    return text.includes(query);
  });

  renderUsers(filtered);
}


function viewUser(id) {

  const user = users.find(
    item => item.id === id
  );

  if (!user) return;

  alert(
    JSON.stringify(user, null, 2)
  );
}


function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function escapeJS(value) {

  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'");
}


/* Start */

loadUsers();
