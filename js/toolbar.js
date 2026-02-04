// ============================================================
//  SHARED MENU TOGGLE LOGIC
// ============================================================

const apiaryMenuBtn = document.getElementById("apiaryMenuBtn");
const apiaryMenu = document.getElementById("apiaryMenu");

const hivesMenuBtn = document.getElementById("hivesMenuBtn");
const hivesMenu = document.getElementById("hivesMenu");

const toolsMenuBtn = document.getElementById("toolsMenuBtn");
const toolsMenu = document.getElementById("toolsMenu");

// Close all menus
function closeAllMenus() {
  apiaryMenu.style.display = "none";
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
apiaryMenu.addEventListener("click", (e) => e.stopPropagation());
hivesMenu.addEventListener("click", (e) => e.stopPropagation());
toolsMenu.addEventListener("click", (e) => e.stopPropagation());

// ============================================================
//  APIARY MENU
// ============================================================

apiaryMenuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu(apiaryMenu);
});

document.getElementById("apiaryNew").addEventListener("click", () => {
  closeAllMenus();
  App.Apiaries.create();
});

document.getElementById("apiaryRename").addEventListener("click", () => {
  closeAllMenus();
  App.Apiaries.rename();
});

document.getElementById("apiaryDelete").addEventListener("click", () => {
  closeAllMenus();
  App.Apiaries.delete();
});

document.getElementById("apiaryPrint").addEventListener("click", () => {
  closeAllMenus();
  App.Canvas.print();
});

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

document.getElementById("hivesArchived").addEventListener("click", () => {
  closeAllMenus();
  App.Modals.openArchivedHives();
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

// Configure Inspection Fields
document.getElementById("toolsConfigureInspection").addEventListener("click", () => {
  closeAllMenus();
  App.Modals.openInspectionFieldConfig();
});
// Help Modal
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


