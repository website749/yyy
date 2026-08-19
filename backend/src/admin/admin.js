/* =========================================================
   SMARTMAP ADMIN JAVASCRIPT
========================================================= */

const API_BASE = "/api";

/*
|--------------------------------------------------------------------------
| DATA
|--------------------------------------------------------------------------
*/

let users = [];
let locations = [];
let reports = [];
let securityLogs = [];


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

const ADMIN_PASSWORD = "ictmit";

function checkPassword() {

  const input =
    document.getElementById("passwordInput");

  const error =
    document.getElementById("loginError");

  if (input.value === ADMIN_PASSWORD) {

    document.getElementById("loginScreen").style.display =
      "none";

    document.getElementById("mainApp").style.display =
      "flex";

    sessionStorage.setItem(
      "smartmap_admin",
      "true"
    );

    loadAllData();

  } else {

    error.style.display = "block";

    input.style.borderColor =
      "var(--danger)";

    setTimeout(() => {

      input.style.borderColor =
        "var(--border)";

      error.style.display =
        "none";

    }, 2500);

  }

}


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

function logout() {

  sessionStorage.removeItem(
    "smartmap_admin"
  );

  location.reload();

}


/*
|--------------------------------------------------------------------------
| API HELPER
|--------------------------------------------------------------------------
*/

async function apiRequest(
  endpoint,
  options = {}
) {

  try {

    const response =
      await fetch(
        `${API_BASE}${endpoint}`,
        {
          headers: {
            "Content-Type":
              "application/json",

            ...(options.headers || {})
          },

          ...options
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.error ||
        "API request failed"
      );

    }

    return data;

  } catch (error) {

    console.error(
      "API ERROR:",
      endpoint,
      error
    );

    throw error;

  }

}


/*
|--------------------------------------------------------------------------
| LOAD ALL DATA
|--------------------------------------------------------------------------
*/

async function loadAllData() {

  setApiStatus(
    "Connecting to backend..."
  );

  await Promise.all([
    loadUsers(),
    loadLocations(),
    loadReports(),
    loadSecurityLogs()
  ]);

  updateDashboard();

  setApiStatus(
    "Backend connected"
  );

}


/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

async function loadUsers() {

  try {

    const data =
      await apiRequest(
        "/users"
      );

    users =
      Array.isArray(data.users)
        ? data.users
        : [];

    renderUsers(users);

  } catch (error) {

    console.error(
      "Failed to load users:",
      error
    );

    users = [];

    renderError(
      "usersTableBody",
      5
    );

  }

}


/*
|--------------------------------------------------------------------------
| RENDER USERS
|--------------------------------------------------------------------------
*/

function renderUsers(
  list
) {

  const tbody =
    document.getElementById(
      "usersTableBody"
    );

  if (!tbody) return;

  tbody.innerHTML = "";

  if (!list.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <i class="ph ph-users"></i>
            <h3>No users found</h3>
            <p>No users are available.</p>
          </div>
        </td>
      </tr>
    `;

    return;
  }


  list.forEach(user => {

    const id =
      user.id || "-";

    const username =
      user.username ||
      user.name ||
      user.displayName ||
      "Unknown";

    const phone =
      user.phone ||
      user.phoneNumber ||
      "-";

    const status =
      user.status ||
      "offline";

    const role =
      user.role ||
      "user";

    const initial =
      username
        .charAt(0)
        .toUpperCase();


    const tr =
      document.createElement("tr");

    tr.innerHTML = `

      <td>

        <div class="user-cell">

          <div class="avatar">

            ${escapeHtml(initial)}

          </div>

          <div>

            <div class="user-name">

              ${escapeHtml(username)}

            </div>

            <div class="user-id">

              ${escapeHtml(id)}

            </div>

          </div>

        </div>

      </td>


      <td>

        ${escapeHtml(phone)}

      </td>


      <td>

        <span class="status-badge ${escapeHtml(status)}">

          <i class="ph ph-circle-fill"></i>

          ${escapeHtml(status)}

        </span>

      </td>


      <td>

        <span>

          ${escapeHtml(role)}

        </span>

      </td>


      <td>

        <button
          class="btn"
          onclick="viewUser('${escapeJs(id)}')"
        >

          Manage

        </button>

      </td>

    `;

    tbody.appendChild(tr);

  });

}


/*
|--------------------------------------------------------------------------
| VIEW USER
|--------------------------------------------------------------------------
*/

function viewUser(id) {

  const user =
    users.find(
      item => item.id === id
    );

  if (!user) return;

  alert(
    JSON.stringify(
      user,
      null,
      2
    )
  );

}


/*
|--------------------------------------------------------------------------
| LOCATIONS
|--------------------------------------------------------------------------
*/

async function loadLocations() {

  try {

    const data =
      await apiRequest(
        "/locations"
      );

    locations =
      Array.isArray(data.locations)
        ? data.locations
        : [];

    renderLocations(
      locations
    );

  } catch (error) {

    console.error(
      "Failed to load locations:",
      error
    );

    locations = [];

    renderError(
      "locationsTableBody",
      6
    );

  }

}


/*
|--------------------------------------------------------------------------
| RENDER LOCATIONS
|--------------------------------------------------------------------------
*/

function renderLocations(
  list
) {

  const tbody =
    document.getElementById(
      "locationsTableBody"
    );

  if (!tbody) return;

  tbody.innerHTML = "";

  if (!list.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="6">

          <div class="empty-state">

            <i class="ph ph-map-pin"></i>

            <h3>
              No locations found
            </h3>

            <p>
              No locations exist in the database.
            </p>

          </div>

        </td>
      </tr>
    `;

    return;
  }


  list.forEach(location => {

    const id =
      location.id || "";

    const name =
      location.name ||
      "Unnamed";

    const type =
      location.type ||
      "other";

    const phone =
      location.phone ||
      "-";

    const latitude =
      location.latitude ??
      "-";

    const longitude =
      location.longitude ??
      "-";

    const status =
      location.status ||
      "active";


    const tr =
      document.createElement("tr");

    tr.innerHTML = `

      <td>

        <div class="user-cell">

          <div class="avatar">

            <i class="ph ph-map-pin"></i>

          </div>

          <div>

            <div class="user-name">

              ${escapeHtml(name)}

            </div>

            <div class="user-id">

              ${escapeHtml(id)}

            </div>

          </div>

        </div>

      </td>


      <td>

        ${escapeHtml(type)}

      </td>


      <td>

        ${escapeHtml(phone)}

      </td>


      <td>

        <small>

          ${escapeHtml(String(latitude))},

          ${escapeHtml(String(longitude))}

        </small>

      </td>


      <td>

        <span class="status-badge ${escapeHtml(status)}">

          ${escapeHtml(status)}

        </span>

      </td>


      <td>

        <button
          class="btn"
          onclick="openLocation('${escapeJs(id)}')"
        >

          View

        </button>

        ${
          status === "pending"
            ? `
              <button
                class="btn btn-success"
                onclick="approveLocation('${escapeJs(id)}')"
              >
                Approve
              </button>
            `
            : ""
        }

      </td>

    `;

    tbody.appendChild(tr);

  });

}


/*
|--------------------------------------------------------------------------
| OPEN LOCATION
|--------------------------------------------------------------------------
*/

function openLocation(id) {

  const location =
    locations.find(
      item => item.id === id
    );

  if (!location) return;

  const lat =
    Number(location.latitude);

  const lng =
    Number(location.longitude);

  if (
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {

    window.open(
      `https://www.google.com/maps?q=${lat},${lng}`,
      "_blank"
    );

  } else {

    alert(
      "This location does not have valid coordinates."
    );

  }

}


/*
|--------------------------------------------------------------------------
| APPROVE LOCATION
|--------------------------------------------------------------------------
*/

async function approveLocation(
  id
) {

  if (
    !confirm(
      "Approve this location?"
    )
  ) {

    return;

  }

  try {

    await apiRequest(
      `/locations/${encodeURIComponent(id)}/approve`,
      {
        method: "PATCH"
      }
    );

    await loadLocations();

    updateDashboard();

  } catch (error) {

    alert(
      "Failed to approve location."
    );

  }

}


/*
|--------------------------------------------------------------------------
| REPORTS
|--------------------------------------------------------------------------
*/

async function loadReports() {

  try {

    const data =
      await apiRequest(
        "/reports"
      );

    reports =
      Array.isArray(data.reports)
        ? data.reports
        : [];

    renderReports(
      reports
    );

  } catch (error) {

    console.error(
      "Failed to load reports:",
      error
    );

    reports = [];

    renderError(
      "reportsTableBody",
      5
    );

  }

}


/*
|--------------------------------------------------------------------------
| RENDER REPORTS
|--------------------------------------------------------------------------
*/

function renderReports(
  list
) {

  const tbody =
    document.getElementById(
      "reportsTableBody"
    );

  if (!tbody) return;

  tbody.innerHTML = "";

  if (!list.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="5">

          <div class="empty-state">

            <i class="ph ph-file-text"></i>

            <h3>
              No reports
            </h3>

            <p>
              There are no reports available.
            </p>

          </div>

        </td>
      </tr>
    `;

    return;

  }


  list.forEach(report => {

    const id =
      report.id || "";

    const title =
      report.title ||
      report.subject ||
      report.description ||
      "Report";

    const user =
      report.username ||
      report.userName ||
      report.userId ||
      "-";

    const status =
      report.status ||
      "pending";

    const createdAt =
      report.createdAt ||
      report.timestamp ||
      "-";


    const tr =
      document.createElement("tr");

    tr.innerHTML = `

      <td>

        <div class="user-name">

          ${escapeHtml(
            String(title).substring(0, 80)
          )}

        </div>

        <div class="user-id">

          ${escapeHtml(id)}

        </div>

      </td>


      <td>

        ${escapeHtml(String(user))}

      </td>


      <td>

        <span class="status-badge ${escapeHtml(status)}">

          ${escapeHtml(status)}

        </span>

      </td>


      <td>

        ${formatDate(createdAt)}

      </td>


      <td>

        <button
          class="btn"
          onclick="viewReport('${escapeJs(id)}')"
        >

          View

        </button>

      </td>

    `;

    tbody.appendChild(tr);

  });

}


/*
|--------------------------------------------------------------------------
| VIEW REPORT
|--------------------------------------------------------------------------
*/

function viewReport(id) {

  const report =
    reports.find(
      item => item.id === id
    );

  if (!report) return;

  alert(
    JSON.stringify(
      report,
      null,
      2
    )
  );

}


/*
|--------------------------------------------------------------------------
| SECURITY LOGS
|--------------------------------------------------------------------------
*/

async function loadSecurityLogs() {

  try {

    const data =
      await apiRequest(
        "/security-logs"
      );

    securityLogs =
      Array.isArray(data.logs)
        ? data.logs
        : [];

    renderSecurityLogs(
      securityLogs
    );

  } catch (error) {

    console.error(
      "Failed to load security logs:",
      error
    );

    securityLogs = [];

    renderError(
      "securityTableBody",
      6
    );

  }

}


/*
|--------------------------------------------------------------------------
| RENDER SECURITY LOGS
|--------------------------------------------------------------------------
*/

function renderSecurityLogs(
  list
) {

  const tbody =
    document.getElementById(
      "securityTableBody"
    );

  if (!tbody) return;

  tbody.innerHTML = "";

  if (!list.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="6">

          <div class="empty-state">

            <i class="ph ph-shield-check"></i>

            <h3>
              No security logs
            </h3>

            <p>
              No security events have been recorded.
            </p>

          </div>

        </td>
      </tr>
    `;

    return;

  }


  list.forEach(log => {

    const tr =
      document.createElement("tr");

    const result =
      log.result ||
      "unknown";

    tr.innerHTML = `

      <td>

        ${escapeHtml(
          String(log.action || "unknown")
        )}

      </td>


      <td>

        ${escapeHtml(
          String(log.adminId || "-")
        )}

      </td>


      <td>

        ${escapeHtml(
          String(log.ip || "-")
        )}

      </td>


      <td>

        ${escapeHtml(
          String(log.device || "-")
        )}

      </td>


      <td>

        <span class="status-badge ${result === "success" ? "online" : ""}">

          ${escapeHtml(
            String(result)
          )}

        </span>

      </td>


      <td>

        ${formatDate(
          log.timestamp
        )}

      </td>

    `;

    tbody.appendChild(tr);

  });

}


/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

function updateDashboard() {

  const totalUsers =
    users.length;

  const onlineUsers =
    users.filter(
      user =>
        user.status === "online"
    ).length;

  const totalLocations =
    locations.length;

  const totalReports =
    reports.length;

  const pendingReports =
    reports.filter(
      report =>
        report.status === "pending"
    ).length;

  const totalSecurityLogs =
    securityLogs.length;


  setText(
    "dashTotalUsers",
    totalUsers
  );

  setText(
    "dashOnlineUsers",
    onlineUsers
  );

  setText(
    "dashTotalLocations",
    totalLocations
  );

  setText(
    "dashTotalReports",
    totalReports
  );

  setText(
    "dashPendingReports",
    pendingReports
  );

  setText(
    "dashSecurityLogs",
    totalSecurityLogs
  );


  setText(
    "userCountBadge",
    totalUsers
  );

  setText(
    "locationCountBadge",
    totalLocations
  );

  setText(
    "reportCountBadge",
    totalReports
  );

}


/*
|--------------------------------------------------------------------------
| NAVIGATION
|--------------------------------------------------------------------------
*/

function navigateTo(
  pageId
) {

  document
    .querySelectorAll(".page-container")
    .forEach(page => {

      page.classList.remove(
        "active"
      );

    });


  const target =
    document.getElementById(
      `page-${pageId}`
    );

  if (target) {

    target.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.page === pageId
      );

    });


  const titles = {

    dashboard:
      "Overview",

    users:
      "User Management",

    locations:
      "Locations",

    reports:
      "Reports",

    security:
      "Security",

    settings:
      "Settings"

  };


  setText(
    "pageTitle",
    titles[pageId] ||
    "Dashboard"
  );


  if (
    window.innerWidth <= 768
  ) {

    closeSidebar();

  }

}


/*
|--------------------------------------------------------------------------
| MOBILE SIDEBAR
|--------------------------------------------------------------------------
*/

function toggleSidebar() {

  document
    .getElementById("sidebar")
    ?.classList.toggle(
      "open"
    );

  document
    .getElementById("overlay")
    ?.classList.toggle(
      "show"
    );

}


function closeSidebar() {

  document
    .getElementById("sidebar")
    ?.classList.remove(
      "open"
    );

  document
    .getElementById("overlay")
    ?.classList.remove(
      "show"
    );

}


/*
|--------------------------------------------------------------------------
| SEARCH USERS
|--------------------------------------------------------------------------
*/

function searchUsers(
  term
) {

  term =
    term.toLowerCase().trim();

  const filtered =
    users.filter(user => {

      const text =
        [
          user.id,
          user.username,
          user.name,
          user.displayName,
          user.phone,
          user.phoneNumber,
          user.role
        ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(term);

    });


  renderUsers(
    filtered
  );

}


/*
|--------------------------------------------------------------------------
| SEARCH LOCATIONS
|--------------------------------------------------------------------------
*/

function searchLocations(
  term
) {

  term =
    term.toLowerCase().trim();

  const filtered =
    locations.filter(location => {

      const text =
        [
          location.id,
          location.name,
          location.type,
          location.phone,
          location.address
        ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(term);

    });


  renderLocations(
    filtered
  );

}


/*
|--------------------------------------------------------------------------
| SEARCH REPORTS
|--------------------------------------------------------------------------
*/

function searchReports(
  term
) {

  term =
    term.toLowerCase().trim();

  const filtered =
    reports.filter(report => {

      const text =
        [
          report.id,
          report.title,
          report.subject,
          report.description,
          report.username,
          report.userId,
          report.status
        ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(term);

    });


  renderReports(
    filtered
  );

}


/*
|--------------------------------------------------------------------------
| REFRESH
|--------------------------------------------------------------------------
*/

async function refreshData() {

  const button =
    document.getElementById(
      "refreshBtn"
    );

  if (button) {

    button.disabled = true;

  }

  try {

    await loadAllData();

  } finally {

    if (button) {

      button.disabled = false;

    }

  }

}


/*
|--------------------------------------------------------------------------
| API STATUS
|--------------------------------------------------------------------------
*/

function setApiStatus(
  message
) {

  const element =
    document.getElementById(
      "apiStatus"
    );

  if (element) {

    element.textContent =
      message;

  }

}


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);

  if (element) {

    element.textContent =
      value;

  }

}


function formatDate(
  value
) {

  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(value);

  }

  return date.toLocaleString();

}


function escapeHtml(
  value
) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escapeJs(
  value
) {

  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll('"', '\\"');

}


function renderError(
  elementId,
  colspan
) {

  const tbody =
    document.getElementById(
      elementId
    );

  if (!tbody) return;

  tbody.innerHTML = `

    <tr>

      <td colspan="${colspan}">

        <div class="empty-state">

          <i class="ph ph-warning"></i>

          <h3>
            Failed to load data
          </h3>

          <p>
            Please check the backend server.
          </p>

        </div>

      </td>

    </tr>

  `;

}


/*
|--------------------------------------------------------------------------
| EVENT LISTENERS
|--------------------------------------------------------------------------
*/

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /*
    |--------------------------------------------------------------------------
    | LOGIN
    |--------------------------------------------------------------------------
    */

    const loginBtn =
      document.getElementById(
        "loginBtn"
      );

    loginBtn?.addEventListener(
      "click",
      checkPassword
    );


    const passwordInput =
      document.getElementById(
        "passwordInput"
      );

    passwordInput?.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter"
        ) {

          checkPassword();

        }

      }
    );


    /*
    |--------------------------------------------------------------------------
    | NAVIGATION
    |--------------------------------------------------------------------------
    */

    document
      .querySelectorAll(
        ".nav-item"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            navigateTo(
              button.dataset.page
            );

          }
        );

      });


    /*
    |--------------------------------------------------------------------------
    | MOBILE
    |--------------------------------------------------------------------------
    */

    document
      .getElementById(
        "menuToggle"
      )
      ?.addEventListener(
        "click",
        toggleSidebar
      );


    document
      .getElementById(
        "overlay"
      )
      ?.addEventListener(
        "click",
        closeSidebar
      );


    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    document
      .getElementById(
        "logoutBtn"
      )
      ?.addEventListener(
        "click",
        logout
      );


    /*
    |--------------------------------------------------------------------------
    | REFRESH
    |--------------------------------------------------------------------------
    */

    document
      .getElementById(
        "refreshBtn"
      )
      ?.addEventListener(
        "click",
        refreshData
      );


    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    document
      .getElementById(
        "searchUsers"
      )
      ?.addEventListener(
        "input",
        event => {

          searchUsers(
            event.target.value
          );

        }
      );


    document
      .getElementById(
        "searchLocations"
      )
      ?.addEventListener(
        "input",
        event => {

          searchLocations(
            event.target.value
          );

        }
      );


    document
      .getElementById(
        "searchReports"
      )
      ?.addEventListener(
        "input",
        event => {

          searchReports(
            event.target.value
          );

        }
      );


    /*
    |--------------------------------------------------------------------------
    | EXISTING LOGIN SESSION
    |--------------------------------------------------------------------------
    */

    if (
      sessionStorage.getItem(
        "smartmap_admin"
      ) === "true"
    ) {

      document.getElementById(
        "loginScreen"
      ).style.display = "none";

      document.getElementById(
        "mainApp"
      ).style.display = "flex";

      loadAllData();

    }

  }
);