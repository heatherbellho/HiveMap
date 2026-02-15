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

// Configure Inspection Fields
document.getElementById("toolsConfigureInspection").addEventListener("click", () => {
  closeAllMenus();
  App.Modals.openInspectionFieldConfig();
});

document.getElementById("toolsAccount").addEventListener("click", () => {
  closeAllMenus();

  const modal = document.getElementById("accountModal");
  const overlay = document.getElementById("overlay");

  // LOGIN ACCESS
  const access = JSON.parse(localStorage.getItem("hivemap_access") || "{}");
  const accessEl = document.getElementById("accountAccessStatus");

  if (access.expires) {
    const expiry = new Date(access.expires);
    const now = new Date();
    const days = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    accessEl.innerHTML = `
Subscription expires on <strong>${App.Utils.formatDateUK(expiry)}</strong><br>
      (${days} days remaining)
    `;
  } else {
    accessEl.textContent = "No active login session.";
  }

  // LICENSE STATUS
  const licenseEl = document.getElementById("accountLicenseStatus");
  const keyEl = document.getElementById("accountLicenseKey");

  const key = localStorage.getItem("hivemap_license_key");

  licenseEl.innerHTML = isPro ? "Edition: <strong>HiveMapPlus</strong>" : "Edition: <strong>HiveMapFree</strong>";

 if (key) {
  const last4 = key.slice(-4);
  const masked = "****-****-" + last4;
  keyEl.textContent = "License Key: " + masked;
} else {
  keyEl.textContent = "License Key: None";
}


  // EXPLANATION SECTION (dynamic)
  const explainEl = document.getElementById("accountEditionExplanation");

  if (isPro) {
    explainEl.innerHTML = `
      <strong>HiveMapPlus</strong> unlocks unlimited apiaries and hives.<br>
      You also receive priority updates and access to all future Plus features.<br>
      Your data remains fully local and private.
    `;
  } else {
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
  }

  // VERSION SECTION
  document.getElementById("accountVersion").innerHTML =
    `Version: <strong>${App.Version}</strong>`;

  // OPEN MODAL
  overlay.style.zIndex = "900"; // below account 
  overlay.style.display = "block"; 
  modal.style.display = "block";
});

// Close modal
document.getElementById("accountModalClose").addEventListener("click", () => {
  document.getElementById("accountModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
});
document.getElementById("accountModalCloseFooter").addEventListener("click", () => {
  document.getElementById("accountModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
});
  document.getElementById("overlay").addEventListener("click", () => {
  document.getElementById("accountModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
});

// Renew access
document.getElementById("renewAccessBtn").addEventListener("click", () => {
  App.Modals.openRenewModal();
});

document.getElementById("enterNewCodeBtn").addEventListener("click", () => {
  window.location.href = "login.html?renew=1";
});


// Enter license key
document.getElementById("enterLicenseBtn").addEventListener("click", () => {
  const key = prompt("Enter your HiveMapPlus license key:");
  if (!key) return;

  if (!App.validateLicenseKey(key)) {
    alert("Invalid license key.");
    return;
  }

  localStorage.setItem("hivemap_license_key", key);
  localStorage.setItem("hivemap_pro", "true");

  alert("HiveMapPlus activated. Click OK to reload.");
  window.location.reload();
});

// Reset license key
document.getElementById("resetLicenseBtn").addEventListener("click", () => {
  localStorage.removeItem("hivemap_license_key");
  localStorage.removeItem("hivemap_pro");

  alert("License key removed, HiveMapPlus deactivated. Click OK to reload.");
  window.location.reload();
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

document.getElementById("toolbarApiaryCounts").addEventListener("click", App.Modals.openHiveListModal);

document.getElementById("toolbarOverallCounts").addEventListener("click", App.Modals.openOverallHiveListModal);
