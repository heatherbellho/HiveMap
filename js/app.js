// ------------------------------------------------------------
// app.js
// Main orchestrator. Initialises all modules in the correct
// order once the DOM is ready.
// ------------------------------------------------------------

window.App = window.App || {};

App.UI = App.UI || {};

App.UI.showToast = function (msg) {
  const el = document.getElementById("globalToast");
  if (!el) return;

  el.textContent = msg;
  el.classList.add("show");

  setTimeout(() => {
    el.classList.remove("show");
  }, 3000);
};

// ------------------------------------------------------------
// Free vs Pro limits
// ------------------------------------------------------------
const sub = JSON.parse(localStorage.getItem("hivemap_subscription") || "{}");
const isPro = sub.edition === "PLUS";

const subscriptionExpiry = sub.expiry ? new Date(sub.expiry) : null;

const now = new Date();
const isExpired = subscriptionExpiry && subscriptionExpiry < now;

if (isExpired) {
  const expiredModal = document.getElementById("expiredModal");
  expiredModal.classList.remove("hidden");

  document.getElementById("expiredEnterCodeBtn").addEventListener("click", () => {
    document.getElementById("toolsAccount").click();
  });

  document.getElementById("expiredModalClose").addEventListener("click", () => {
    expiredModal.classList.add("hidden");
  });
}

function editingDisabled() {
  return isExpired;
}

const LIMITS = {
  maxApiaries: isPro ? Infinity : 1,
  maxHives:    isPro ? Infinity : 1
};


// ------------------------------------------------------------
// Update the Inspections Due badge and button visibility
// ------------------------------------------------------------
App.updateDueInspectionsBadge = function () {
  const due = App.Hives.getDueInspections();
  const btn = document.getElementById("dueInspectionsBtn");
  const badge = document.getElementById("dueBadge");

  if (!btn || !badge) return;

  if (due.length > 0) {
    btn.style.display = "inline-block";
    badge.textContent = due.length;
    badge.style.display = "inline-block";
  } else {
    btn.style.display = "none";
    badge.style.display = "none";
  }
};



App.init = function () {
  // Initialise subsystems in correct dependency order
  App.Apiaries.init();   // Loads apiary list + selector
  App.Hives.init();      // Hive types + box types
  App.Status.init();     // Queen status legend + modal
  App.Modals.init();     // Hive edit modal + hive size modal
  App.Modals.inspectionSchema = Storage.getInspectionSchema() || App.Modals.defaultInspectionSchema;
  App.Export.init();     // Export/import buttons
  App.Stats.init();      // Hive status summary
  App.Canvas.init();     // Fabric canvas engine

  // Print button
  const printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", App.Canvas.print);
  }

  // Delete selected hives
  const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener("click", App.Canvas.deleteSelected);
  }

  document.getElementById("dueInspectionsBtn")
  .addEventListener("click", App.Modals.openDueInspectionsModal);
const due = App.Hives.getDueInspections();
const btn = document.getElementById("dueInspectionsBtn");
const badge = document.getElementById("dueBadge");

if (due.length > 0) {
  btn.style.display = "inline-block";
  badge.textContent = due.length;
  badge.style.display = "inline-block";
} else {
  btn.style.display = "none";
  badge.style.display = "none";
}
document.getElementById("appVersion").textContent =
`HiveMap${isPro ? "Plus" : "Free"} - ${App.Version}`;

document.title = `HiveMap${isPro ? "Plus" : "Free"} - ${App.Version}`;

// Show Free vs Pro status
const statusEl = document.getElementById("licenseStatus");
if (statusEl) {
  statusEl.textContent = isPro ? "Plus" : "Free";
}

};

// ------------------------------------------------------------
// Start the app when DOM is ready
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  App.init();

  // ------------------------------------------------------------
  // EXIT TOAST (existing)
  // ------------------------------------------------------------
  const exitToast = document.getElementById("exitToast");
  const exitCloseBtn = document.getElementById("exitToastClose");

  // Show the exit toast once per session
  setTimeout(() => {
    exitToast.classList.remove("hidden");
    exitToast.classList.add("show");
  }, 800);

  // Manual dismiss
  exitCloseBtn.addEventListener("click", () => {
    exitToast.classList.remove("show");

    // Remove from layout after fade-out
    setTimeout(() => {
      exitToast.classList.add("hidden");
    }, 400);
  });

});


