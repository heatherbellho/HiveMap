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

// ============================================================
//  SHARED MENU TOGGLE LOGIC
// ============================================================

const hivesMenuBtn = document.getElementById("hivesMenuBtn");
const hivesMenu = document.getElementById("hivesMenu");

const toolsMenuBtn = document.getElementById("toolsMenuBtn");
const toolsMenu = document.getElementById("toolsMenu");

const settingsMenuBtn = document.getElementById("settingsMenuBtn");
const settingsMenu = document.getElementById("settingsMenu");

// Close all menus
function closeAllMenus() {
  hivesMenu.style.display = "none";
  settingsMenu.style.display = "none";
  toolsMenu.style.display = "none";
}

// Toggle a specific menu
function toggleMenu(menu) {
  const isOpen = menu.style.display === "flex";
  closeAllMenus();
  if (!isOpen) menu.style.display = "flex";
}

// Close menus when clicking outside
document.addEventListener("click", () => {
  closeAllMenus();
});

// Prevent clicks inside menus from closing them
hivesMenu.addEventListener("click", (e) => e.stopPropagation());
settingsMenu.addEventListener("click", (e) => e.stopPropagation());
toolsMenu.addEventListener("click", (e) => e.stopPropagation());


// ============================================================
//  HIVES MENU
// ============================================================

hivesMenuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu(hivesMenu);
});

// Only REAL actions included
document.getElementById("hiveNew").addEventListener("click", () => {
  closeAllMenus();

const apiaryId = Storage.getCurrentApiary();

  if (!apiaryId) {
    App.UI.showToast("Create an apiary first.");
    return;
  }

  App.Modals.openHiveSizeModal();
});


document.getElementById("hiveDelete").addEventListener("click", () => {
  closeAllMenus();
  App.Canvas.deleteSelected();
});

document.getElementById("toolbarShowArchivedHives")
  .addEventListener("click", function () {
    document.getElementById("archivedFilterBtn").click();
  });

  
const toolsBlankInspectionHistory = document.getElementById("toolsBlankInspectionHistory");
if (toolsBlankInspectionHistory) {
  toolsBlankInspectionHistory.addEventListener("click", () => {
    closeAllMenus();
    App.Modals.printBlankInspectionHistory();
  });
}

document.getElementById("toolsVetReport").onclick = function () {
  closeAllMenus();
  App.Reports.openVetReportModal();
};

// ============================================================
//  SETTINGS MENU

settingsMenuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu(settingsMenu);
});

// Status colours
document.getElementById("toolsStatus").addEventListener("click", () => {
  closeAllMenus();
  App.Status.openSettings();
});

// Settings (Hive Count Separation)
document.getElementById("toolsSettings").addEventListener("click", () => {
  closeAllMenus();
  openSettingsModal();
});

const boxTypesBtn = document.getElementById("toolsBoxTypes");
if (boxTypesBtn) {
  boxTypesBtn.addEventListener("click", () => {
    closeAllMenus();
    App.Modals.openBoxTypesManager();   // placeholder for now
  });
}

// Open Manage Hive Types modal
const toolsHiveTypes = document.getElementById("toolsHiveTypes");
if (toolsHiveTypes) {
  toolsHiveTypes.onclick = function () {
    closeAllMenus();
    document.getElementById("manageHiveTypesModal").style.display = "block";
    document.getElementById("overlay").style.display = "block";
  };
}

// Close button inside the modal
const closeHiveTypesModalBtn = document.getElementById("closeHiveTypesModalBtn");
if (closeHiveTypesModalBtn) {
  closeHiveTypesModalBtn.onclick = function () {
        document.getElementById("manageHiveTypesModal").style.display = "none";
    document.getElementById("overlay").style.display = "none";
  };
}
if (overlay) overlay.addEventListener("click", function() {
  document.getElementById("manageHiveTypesModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
});

const addHiveTypeBtnModal = document.getElementById("addHiveTypeBtnModal");
if (addHiveTypeBtnModal) {
  addHiveTypeBtnModal.onclick = function () {
    App.Modals.addHiveType();
  };
}

// Configure Inspection Fields
document.getElementById("toolsConfigureInspection").addEventListener("click", () => {
  closeAllMenus();
  App.Modals.openInspectionFieldConfig();
});

// ============================================================
//  TOOLS MENU
// ============================================================

toolsMenuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu(toolsMenu);
});

// Export
document.getElementById("toolsExport").addEventListener("click", () => {
  closeAllMenus();
  App.Export.exportAllData();
});

// Import (triggers existing hidden button)
document.getElementById("toolsImport").addEventListener("click", () => {
  document.getElementById("importAllBtn").click();
});

document.getElementById("toolsAccount").addEventListener("click", () => {
  App.Modals.openAccountModal();
});

//document.getElementById("toolsAnalyticsHoney").onclick = function () {
 //   App.Modals.openHoneyGraphModal();
//};


// ------------------------------------------------------------
// SAVE HM2 LICENCE CODE
// ------------------------------------------------------------
document.getElementById("saveHm2Btn").addEventListener("click", async () => {
  const code = document.getElementById("hm2Input").value.trim();
  if (!code) {
    App.UI.showToast("Please enter a licence code.");
    return;
  }

  const result = await applyHM2Code(code);

  if (!result.valid) {
    App.UI.showToast(result.error);
    return;
  }

  App.UI.showToast("Licence activated.");
  window.location.reload();
});

const expiryBadge = document.getElementById("expiryBadge");
if (expiryBadge) {
  expiryBadge.addEventListener("click", () => {
    App.Modals.openAccountModal();
  });
}

// ------------------------------------------------------------
// REMOVE HM2 LICENCE CODE
// ------------------------------------------------------------
//document.getElementById("removeHm2Btn").addEventListener("click", () => {
//  localStorage.removeItem("hivemap_license_code");
//  App.UI.showToast("Licence removed.");
//  window.location.reload();
//});

// ------------------------------------------------------------
// CLOSE ACCOUNT MODAL (BLOCK IF NO LICENCE)
// ------------------------------------------------------------
// ------------------------------------------------------------
// CLOSE ACCOUNT MODAL (BLOCK IF NO LICENCE)
// ------------------------------------------------------------
App.Modals.closeAccountModal = function () {
  const hasLicence = !!localStorage.getItem("hivemap_license_code");

  if (!hasLicence) {
    App.UI.showToast("Please enter your licence code to continue.");

    // ⭐ Prevent overlay from closing when licence is missing
    document.getElementById("overlay").style.display = "block";

    return;
  }

  document.getElementById("accountModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
};


// ------------------------------------------------------------
// CLOSE BUTTON
// ------------------------------------------------------------
document.getElementById("accountModalClose")
  .addEventListener("click", App.Modals.closeAccountModal);

// ------------------------------------------------------------
// OVERLAY CLICK — SINGLE HANDLER ONLY
// ------------------------------------------------------------
document.getElementById("overlay").addEventListener("click", (e) => {
  const accountOpen =
    document.getElementById("accountModal").style.display === "block";

  if (accountOpen) {
    // Block ALL other overlay handlers
    e.stopImmediatePropagation();

    // Run licence-gated close logic
    App.Modals.closeAccountModal();
    return;
  }

  // If account modal is NOT open, allow normal overlay behaviour
  // (your global modal system will handle this)
});

// -----------------------------
// HELP MODAL LOADING
// -----------------------------
function loadHelpContent() {
  const container = document.getElementById("helpContentContainer");
  const navList = document.getElementById("helpNavList");

  // Only load once
  if (!container.dataset.loaded) {

    // Insert main content
    container.innerHTML = window.HELP_CONTENT;
    container.dataset.loaded = "true";

    // Build navigation
    navList.innerHTML = window.HELP_SECTIONS.map(section => `
      <li><a href="#${section.id}" class="help-nav-link">${section.title}</a></li>
    `).join("");

    // Attach smooth scrolling AFTER nav is built
    document.querySelectorAll('.help-nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
}


// -----------------------------
// HELP MODAL OPEN/CLOSE
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const helpBtn = document.getElementById("toolsHelp");
  const overlay = document.getElementById("overlay");
  const helpModal = document.getElementById("helpModal");

  const closeHelp = () => {
    overlay.style.display = "none";
    helpModal.style.display = "none";
  };

  if (helpBtn && overlay && helpModal) {
    helpBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAllMenus();

      // Load content + nav dynamically
      loadHelpContent();

      overlay.style.display = "block";
      helpModal.style.display = "block";
    });

    const closeBtn1 = document.getElementById("helpModalCloseBtn");

    if (closeBtn1) closeBtn1.addEventListener("click", closeHelp);

    overlay.addEventListener("click", closeHelp);
  }
});

/* ============================================================
   SETTINGS MODAL LOGIC
   ============================================================ */

function openSettingsModal() {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("settingsModal").style.display = "block";
  const modal = document.getElementById("settingsModal");
  const modeEl = document.getElementById("hiveCountMode");
  const statusRow = document.getElementById("hiveCountStatusRow");
  const statusEl = document.getElementById("hiveCountStatus");

  // Load existing settings
  const settings = Storage.getHiveCountSettings();

  // Set mode
  modeEl.value = settings.mode || "none";

  // Populate statuses
  statusEl.innerHTML = "";
  const statuses = Storage.getQueenStatuses();
  statuses.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.name;
    opt.textContent = s.name;
    statusEl.appendChild(opt);
  });

  // Set selected status
  if (settings.status) {
    statusEl.value = settings.status;
  }

  // Show/hide status row
  statusRow.style.display = (modeEl.value === "specificStatus") ? "block" : "none";

  // Mode change handler
  modeEl.onchange = () => {
    statusRow.style.display = (modeEl.value === "specificStatus") ? "block" : "none";
  };

  modal.style.display = "block";
}

// Cancel button
document.getElementById("settingsCloseBtn").onclick = () => {
  document.getElementById("settingsModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
};

// Close Settings modal if overlay is clicked
document.getElementById("overlay").addEventListener("click", function () {
  document.getElementById("settingsModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
});

// Save settings
document.getElementById("settingsSaveBtn").onclick = () => {
  const modeEl = document.getElementById("hiveCountMode");
  const statusEl = document.getElementById("hiveCountStatus");

  const newSettings = {
    mode: modeEl.value,
    status: modeEl.value === "specificStatus" ? statusEl.value : null
  };

  Storage.saveHiveCountSettings(newSettings);

  document.getElementById("settingsModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";

  if (App.Toolbar && App.Toolbar.refreshCounts) {
    App.Toolbar.refreshCounts();
  }
  
};

/* ============================================================
   HIVE COUNT SEPARATION — TOOLBAR LABEL LOGIC
   ============================================================ */

if (!App.Toolbar) App.Toolbar = {};

App.Toolbar.getHiveCountLabel = function (hives) {
  const safeHives = hives.map(h => ({
    ...h,
    queenStatus: (h.queenStatus === undefined || h.queenStatus === null)
      ? ""
      : h.queenStatus
  }));

  const total = safeHives.length;
  const settings = Storage.getHiveCountSettings();

  if (total === 0) return "Hives: 0";

  // Mode: none
  if (settings.mode === "none") {
    return `Hives: ${total}`;
  }

  // Mode: specificStatus
  if (settings.mode === "specificStatus" && settings.status) {
    const count = safeHives.filter(h => h.queenStatus === settings.status).length;
    return `Hives: ${total} (${count} ${settings.status}) ▶`;
  }

  return `Hives: ${total} ▶`;
};

// Refresh both toolbar labels
App.Toolbar.refreshCounts = function () {
  const apiaryName = Storage.getCurrentApiary();
  const allApiaries = Storage.getAllApiaries() || [];

  // -----------------------------
  // CURRENT APIARY HIVES (from layout)
  // -----------------------------
  let currentHives = [];
  if (apiaryName) {
    const raw = Storage.getHiveLayout(apiaryName);
    const layout = raw ? JSON.parse(raw) : {};
    const objects = layout.objects || [];

    currentHives = objects
      .map(o => o?.hiveData)
      .filter(h => h && h.status !== "archived");
  }

  // -----------------------------
  // ALL HIVES (from all layouts)
  // -----------------------------
  let allHives = [];

  allApiaries.forEach(name => {
    const raw = Storage.getHiveLayout(name);
    const layout = raw ? JSON.parse(raw) : {};
    const objects = layout.objects || [];

    const hives = objects
      .map(o => o?.hiveData)
      .filter(h => h && h.status !== "archived");

    allHives = allHives.concat(hives);
  });

  // -----------------------------
  // UPDATE LABELS
  // -----------------------------
  const apiaryBtn = document.getElementById("toolbarApiaryCounts");
  const overallBtn = document.getElementById("toolbarOverallCounts");

  if (apiaryBtn) {
    apiaryBtn.textContent = `Apiary ${App.Toolbar.getHiveCountLabel(currentHives)}`;
  }

  if (overallBtn) {
    overallBtn.textContent = `Total ${App.Toolbar.getHiveCountLabel(allHives)}`;
  }
};


document.getElementById("toolbarApiaryCounts").addEventListener("click", App.Modals.openHiveListModal);

document.getElementById("toolbarOverallCounts").addEventListener("click", App.Modals.openOverallHiveListModal);

// Refresh toolbar counts on load
document.addEventListener("DOMContentLoaded", () => {
  if (App.Toolbar && App.Toolbar.refreshCounts) {
    App.Toolbar.refreshCounts();
  }
});
