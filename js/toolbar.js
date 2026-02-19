// ============================================================
//  SHARED MENU TOGGLE LOGIC
// ============================================================

const hivesMenuBtn = document.getElementById("hivesMenuBtn");
const hivesMenu = document.getElementById("hivesMenu");

const toolsMenuBtn = document.getElementById("toolsMenuBtn");
const toolsMenu = document.getElementById("toolsMenu");

// Close all menus
function closeAllMenus() {
  hivesMenu.style.display = "none";
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

// Status colours
document.getElementById("toolsStatus").addEventListener("click", () => {
  closeAllMenus();
  App.Status.openSettings();
});

document.getElementById("toolsVetReport").onclick = function () {
  closeAllMenus();
  App.Reports.openVetReportModal();
};

// Settings (Hive Count Separation)
document.getElementById("toolsSettings").addEventListener("click", () => {
  closeAllMenus();
  openSettingsModal();
});

// Configure Inspection Fields
document.getElementById("toolsConfigureInspection").addEventListener("click", () => {
  closeAllMenus();
  App.Modals.openInspectionFieldConfig();
});

document.getElementById("toolsAccount").addEventListener("click", async () => {
  closeAllMenus();

  const modal = document.getElementById("accountModal");
  const overlay = document.getElementById("overlay");

// ------------------------------------------------------------
// HM2 LICENSING (duration-based, stacking)
// ------------------------------------------------------------

const hm2Code = localStorage.getItem("hivemap_license_code") || "";
const editionEl = document.getElementById("accountEditionStatus");
const expiryEl  = document.getElementById("accountExpiryStatus");
const explainEl = document.getElementById("accountEditionExplanation");
const inputEl   = document.getElementById("hm2Input");

inputEl.value = "";
inputEl.placeholder = hm2Code ? "Key saved (enter new to replace)" : "";

let edition = localStorage.getItem("hivemap_license_edition") || "NONE";
let expiryStr = localStorage.getItem("hivemap_license_expiry") || null;

let expiryDate = expiryStr ? new Date(expiryStr) : null;
let isExpired = false;
let isProLocal = false;

if (expiryDate instanceof Date && !isNaN(expiryDate)) {
  const today = new Date();
  today.setHours(0,0,0,0);

  isExpired = expiryDate < today;
  isProLocal = edition === "PLUS" && !isExpired;
}

// Update Edition display
editionEl.innerHTML = `Edition: <strong>${edition}</strong>`;

// Update Expiry display
if (expiryDate && !isNaN(expiryDate)) {
  const today = new Date();
  today.setHours(0,0,0,0);

  const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

  if (isExpired) {
    expiryEl.innerHTML = `
      Licence expired on <strong>${App.Utils.formatDateUK(expiryDate)}</strong><br>
      (${Math.abs(diffDays)} days ago)
    `;
  } else {
    expiryEl.innerHTML = `
      Licence expires on <strong>${App.Utils.formatDateUK(expiryDate)}</strong><br>
      (${diffDays} days remaining)
    `;
  }

} else {
  expiryEl.innerHTML = "No active licence.";
}

// Explanation text
if (isExpired && edition === "PLUS") {
  explainEl.innerHTML = `
    <strong>Licence expired.</strong><br>
    Enter a valid HM2 licence code to reactivate HiveMapPlus.
  `;
} else if (isProLocal) {
  explainEl.innerHTML = `
    <strong>HiveMapPlus</strong> unlocks unlimited apiaries and hives.<br>
    You also receive priority updates and access to all future Plus features.<br>
    Your data remains fully local and private.
  `;
} else if (edition === "FREE") {
  explainEl.innerHTML = `
    <strong>HiveMapFree</strong> is fully functional but limited to one apiary and one hive.<br>
    Upgrade to <strong>HiveMapPlus</strong> to unlock unlimited apiaries and hives.<br>
    You also receive priority updates and access to any future Plus features.<br>
    Your data remains fully local and private.<br>
    <p><a href="https://cornishhoney.co.uk/email_us.php"
       target="_blank"
       class="toolbar-btn"
       style="text-decoration: none;">
       Contact Us to Upgrade
    </a></p>
  `;
} else {
  explainEl.innerHTML = `
    <strong>No active licence.</strong><br>
    Enter a valid HM2 licence code to activate HiveMapPlus.
  `;
}

  // VERSION SECTION
  document.getElementById("accountVersion").innerHTML =
    `Version: <strong>${App.Version}</strong>`;

  // OPEN MODAL
  overlay.style.zIndex = "900";
  overlay.style.display = "block";
  modal.style.display = "block";
});

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

// ------------------------------------------------------------
// REMOVE HM2 LICENCE CODE
// ------------------------------------------------------------
//document.getElementById("removeHm2Btn").addEventListener("click", () => {
//  localStorage.removeItem("hivemap_license_code");
//  App.UI.showToast("Licence removed.");
//  window.location.reload();
//});

// ------------------------------------------------------------
// CLOSE MODAL
// ------------------------------------------------------------
document.getElementById("accountModalClose").addEventListener("click", () => {
  document.getElementById("accountModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
});

document.getElementById("overlay").addEventListener("click", () => {
  document.getElementById("accountModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
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
    const closeBtn2 = document.getElementById("helpModalCloseBtnFooter");

    if (closeBtn1) closeBtn1.addEventListener("click", closeHelp);
    if (closeBtn2) closeBtn2.addEventListener("click", closeHelp);

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
document.getElementById("settingsCancelBtn").onclick = () => {
  document.getElementById("settingsModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
};

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
    return `Hives: ${total} (${count} ${settings.status})`;
  }

  return `Hives: ${total}`;
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
