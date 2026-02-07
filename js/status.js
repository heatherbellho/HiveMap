// ------------------------------------------------------------
// status.js
// Handles queen status list, legend rendering, and the
// status settings modal.
// ------------------------------------------------------------

window.App = window.App || {};
App.Status = {};

// Cached list of statuses
let queenStatuses = Storage.getQueenStatuses() || [];

// ------------------------------------------------------------
// Get colour for a given queen status
// ------------------------------------------------------------
App.Status.getColor = function (status) {
  const s = (status || "").toLowerCase();
  for (let q of queenStatuses) {
    if (q.name && s.includes(q.name.toLowerCase())) {
      return q.color;
    }
  }
  return "#fff"; // fallback
};

// ------------------------------------------------------------
// Populate the queen status <select> in the hive modal
// ------------------------------------------------------------
App.Status.populateStatusSelect = function (selected = "") {
  const sel = document.getElementById("queenStatus");
  if (!sel) return;

  sel.innerHTML = "";

  queenStatuses.forEach(status => {
    const opt = document.createElement("option");
    opt.value = status.name;
    opt.textContent = status.name;
    if (status.name === selected) opt.selected = true;
    sel.appendChild(opt);
  });
};

// ------------------------------------------------------------
// Render the status legend in the sidebar
// ------------------------------------------------------------
App.Status.renderLegend = function () {
  const container = document.getElementById("queenLegend");
  if (!container) return;

  container.innerHTML = "";

  const left = document.createElement("div");
  left.style.display = "flex";
  left.style.flexDirection = "column";
  left.style.gap = "6px";
  left.style.marginBottom = "8px";

  const title = document.createElement("strong");
  title.textContent = "Status Legend:";
  left.appendChild(title);

  queenStatuses.forEach(q => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.gap = "6px";

    div.innerHTML = `
      <span style="width:20px;height:14px;border:1px solid #888;background:${q.color};display:inline-block;"></span>
      ${q.name}
    `;
    left.appendChild(div);
  });

  container.appendChild(left);

};

// ------------------------------------------------------------
// Open the status settings modal
// ------------------------------------------------------------
App.Status.openSettings = function () {
  const modal = document.getElementById("statusModal");
  const list = document.getElementById("statusList");

  if (!modal || !list) return;

  list.innerHTML = "";

  queenStatuses.forEach((status, index) => {
    const row = document.createElement("div");
    row.className = "status-row";

    row.innerHTML = `
      <input type="text" value="${status.name}" data-index="${index}">
      <input type="color" value="${status.color}" data-index="${index}">
      <button class="small-delete" data-index="${index}" type="button">×</button>
    `;

    list.appendChild(row);
  });

  // Name change handlers
  list.querySelectorAll("input[type='text']").forEach(input => {
    input.addEventListener("change", e => {
      const i = parseInt(e.target.dataset.index, 10);
      queenStatuses[i].name = e.target.value.trim() || "(Unnamed)";
      Storage.saveQueenStatuses(queenStatuses);
      App.Status.renderLegend();
      App.Status.populateStatusSelect();
    });
  });

  // Colour change handlers
  list.querySelectorAll("input[type='color']").forEach(input => {
    input.addEventListener("change", e => {
      const i = parseInt(e.target.dataset.index, 10);
      queenStatuses[i].color = e.target.value;
      Storage.saveQueenStatuses(queenStatuses);
      App.Status.renderLegend();
      App.Status.populateStatusSelect();
    });
  });

  // Delete handlers (FIXED: now targets .small-delete)
  list.querySelectorAll(".small-delete").forEach(btn => {
    btn.addEventListener("click", e => {
      const i = parseInt(e.target.dataset.index, 10);
      if (confirm(`Delete status "${queenStatuses[i].name}"?`)) {
        queenStatuses.splice(i, 1);
        Storage.saveQueenStatuses(queenStatuses);
        App.Status.openSettings();
        App.Status.renderLegend();
        App.Status.populateStatusSelect();
      }
    });
  });

  modal.style.display = "block";
  document.getElementById("overlay").style.display = "block";
};

// ------------------------------------------------------------
// Close the status settings modal
// ------------------------------------------------------------
App.Status.closeSettings = function () {
  document.getElementById("statusModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
};

// ------------------------------------------------------------
// Add a new status
// ------------------------------------------------------------
App.Status.addStatus = function () {
  // Hide the + button while adding
  document.getElementById("addStatusBtn").style.display = "none";

  const modal = document.getElementById("statusModal");
  const list = document.getElementById("statusList");

  if (!modal || !list) return;

  list.innerHTML = `
    <div class="status-row">
      <input type="text" id="newStatusName" placeholder="Status name">
      <input type="color" id="newStatusColor" value="#cccccc">
    </div>
  `;

  modal.style.display = "block";
  document.getElementById("overlay").style.display = "block";
};


// ------------------------------------------------------------
// Save status settings
// ------------------------------------------------------------
App.Status.saveSettings = function () {
  const nameEl = document.getElementById("newStatusName");
  const colorEl = document.getElementById("newStatusColor");

  if (nameEl && colorEl) {
    const name = nameEl.value.trim();
    const color = colorEl.value;
    if (name) queenStatuses.push({ name, color });
  }

  Storage.saveQueenStatuses(queenStatuses);
  App.Status.renderLegend();
  App.Status.populateStatusSelect();
  App.Status.closeSettings();

  // Restore + button
  document.getElementById("addStatusBtn").style.display = "inline-block";
};
// ------------------------------------------------------------
// Initialise status system
// ------------------------------------------------------------
App.Status.init = function () {
  // Buttons inside modal
  document.getElementById("addStatusBtn").addEventListener("click", App.Status.addStatus);
  document.getElementById("saveStatusSettingsBtn").addEventListener("click", App.Status.saveSettings);
  document.getElementById("closeStatusSettingsBtn").addEventListener("click", App.Status.closeSettings);
  document.getElementById("closeStatusSettingsBtn2").addEventListener("click", App.Status.closeSettings);

  // Initial legend
  App.Status.renderLegend();

  // Populate queen status dropdown in hive modal
  App.Status.populateStatusSelect();
};
