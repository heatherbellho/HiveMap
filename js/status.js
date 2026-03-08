/*
 * ------------------------------------------------------------
 *  © 2026 Heather Bell Honey Bees Ltd. All rights reserved.
 *
 *  This file is part of the HiveMap© software system.
 *  Unauthorized copying, modification, distribution, or use
 *  of this file, via any medium, is strictly prohibited.
 *
 *  Proprietary and confidential.
 * ------------------------------------------------------------
 */ 

// ------------------------------------------------------------
// status.js
// Handles queen status list, legend rendering, and the
// status settings modal.
// ------------------------------------------------------------

window.App = window.App || {};
App.Status = {};

// Cached list of statuses
let queenStatuses = Storage.getQueenStatuses() || [];

function refreshStatusUi() {
  Storage.saveQueenStatuses(queenStatuses);
  App.Status.renderLegend();
  App.Status.populateStatusSelect();
}

function moveStatus(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= queenStatuses.length) return;
  const [status] = queenStatuses.splice(fromIndex, 1);
  queenStatuses.splice(toIndex, 0, status);
  refreshStatusUi();
  App.Status.openSettings();
}

function renderStatusRows(list) {
  list.innerHTML = "";

  queenStatuses.forEach((status, index) => {
    const row = document.createElement("div");
    row.className = "status-row";

    row.innerHTML = `
      <button class="status-move" data-index="${index}" data-direction="up" type="button" aria-label="Move status up" ${index === 0 ? "disabled" : ""}>↑</button>
      <button class="status-move" data-index="${index}" data-direction="down" type="button" aria-label="Move status down" ${index === queenStatuses.length - 1 ? "disabled" : ""}>↓</button>
      <input type="text" value="${status.name}" data-index="${index}">
      <input type="color" value="${status.color}" data-index="${index}">
      <button class="small-delete" data-index="${index}" type="button">×</button>
    `;

    list.appendChild(row);
  });
}

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

  // Ensure container behaves predictably
  container.style.display = "flex";
  container.style.flexDirection = "row";
  container.style.flexWrap = "wrap";

  // Title (always full width)
  const title = document.createElement("strong");
  title.textContent = "Status Legend:";
  title.style.display = "block";
  title.style.textAlign ="center";
  title.style.marginBottom = "8px";

  // ⭐ THIS is the key fix:
  title.style.flexBasis = "100%";   // forces title to its own full-width row

  container.appendChild(title);

  // Wrapper for responsive columns
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexWrap = "wrap";
  wrapper.style.gap = "24px";
  wrapper.style.width = "100%";     // ensures wrapper starts on a new row

  const chunkSize = 4;
  for (let i = 0; i < queenStatuses.length; i += chunkSize) {
    const chunk = queenStatuses.slice(i, i + chunkSize);

    const col = document.createElement("div");
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.gap = "6px";
    col.style.minWidth = "160px";
    col.style.flex = "1 1 auto";

    chunk.forEach(q => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.gap = "6px";
      row.innerHTML = `
        <span style="width:20px;height:14px;border:1px solid #888;background:${q.color};display:inline-block;"></span>
        ${q.name}
      `;
      col.appendChild(row);
    });

    wrapper.appendChild(col);
  }

  container.appendChild(wrapper);
};



// ------------------------------------------------------------
// Open the status settings modal
// ------------------------------------------------------------
App.Status.openSettings = function () {
  const btn = document.getElementById("addStatusBtn");
if (btn) btn.style.display = "block";

  const modal = document.getElementById("statusModal");
  const list = document.getElementById("statusList");

  if (!modal || !list) return;

renderStatusRows(list);

  // Name change handlers
  list.querySelectorAll("input[type='text']").forEach(input => {
    input.addEventListener("change", e => {
      const i = parseInt(e.target.dataset.index, 10);
      queenStatuses[i].name = e.target.value.trim() || "(Unnamed)";
      refreshStatusUi();
    });
  });

  // Colour change handlers
  list.querySelectorAll("input[type='color']").forEach(input => {
    input.addEventListener("change", e => {
      const i = parseInt(e.target.dataset.index, 10);
      queenStatuses[i].color = e.target.value;
      refreshStatusUi();
    });
  });

  list.querySelectorAll(".status-move").forEach(btn => {
    btn.addEventListener("click", e => {
      const i = parseInt(e.target.dataset.index, 10);
      const direction = e.target.dataset.direction;
      moveStatus(i, direction === "up" ? i - 1 : i + 1);
    });
  });

  // Delete handlers (FIXED: now targets .small-delete)
list.querySelectorAll(".small-delete").forEach(btn => {
  btn.addEventListener("click", e => {
    const i = parseInt(e.target.dataset.index, 10);

    // Store index for modal confirm
    App.Status.pendingDeleteIndex = i;

    // Open modal
    App.Modals.openConfirmDeleteStatus();
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
  const list = document.getElementById("statusList");
  if (!list) return;

  // Append a new editable row
  const row = document.createElement("div");
  row.className = "status-row";

  row.innerHTML = `
    <input type="text" id="newStatusName" placeholder="Status name">
    <input type="color" id="newStatusColor" value="#cccccc">
    <button id="saveNewStatusBtn" type="button" class="btn-save">Save</button>
  `;

  list.appendChild(row);

  // Hide the + button
  document.getElementById("addStatusBtn").style.display = "none";

  // Attach save handler
  document.getElementById("saveNewStatusBtn").onclick = function () {
    const name = document.getElementById("newStatusName").value.trim();
    const color = document.getElementById("newStatusColor").value;

    if (!name) return;

    queenStatuses.push({ name, color });
    refreshStatusUi();

    // Re-render the list
    App.Status.openSettings();

    // Show the + button again
    document.getElementById("addStatusBtn").style.display = "block";
  };
};


// ------------------------------------------------------------
// Save status settings
// ------------------------------------------------------------
App.Status.saveSettings = function () {
  if (editingDisabled()) {
    App.UI.showToast("Editing is disabled because your subscription has expired.");
    return;
  }
  const nameEl = document.getElementById("newStatusName");
  const colorEl = document.getElementById("newStatusColor");

  if (nameEl && colorEl) {
    const name = nameEl.value.trim();
    const color = colorEl.value;
    if (name) queenStatuses.push({ name, color });
  }

  refreshStatusUi();
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
     if (overlay) overlay.addEventListener("click", App.Status.closeSettings);


  // Initial legend
  App.Status.renderLegend();

  // Populate queen status dropdown in hive modal
  App.Status.populateStatusSelect();
};
