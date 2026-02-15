// ------------------------------------------------------------
// app.js
// Main orchestrator. Initialises all modules in the correct
// order once the DOM is ready.
// ------------------------------------------------------------

window.App = window.App || {};

// ------------------------------------------------------------
// License Key Validation  (MUST come before isPro)
// ------------------------------------------------------------
App.validateLicenseKey = function (key) {
  if (!key || typeof key !== "string") return false;

  const pattern = /^HIVEMAP-(\d{4})-(\d{4})-(\d{4})$/;
  const match = key.trim().toUpperCase().match(pattern);
  if (!match) return false;

  const [_, a, b, c] = match;

  const sum = (parseInt(a) + parseInt(b)) % 997;
  const check = parseInt(c) % 997;

  return sum === check;
};

// ------------------------------------------------------------
// Free vs Pro limits
// ------------------------------------------------------------
const isPro =
  localStorage.getItem("hivemap_pro") === "true" &&
  App.validateLicenseKey(localStorage.getItem("hivemap_license_key"));

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

  // ------------------------------------------------------------
  // EXPIRY WARNING TOAST (14 days)
  // ------------------------------------------------------------
  (function() {
    const access = JSON.parse(localStorage.getItem("hivemap_access") || "{}");
    if (!access.ok || !access.expires) return;

    const expiry = new Date(access.expires).getTime();
    const now = Date.now();
    const daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    // Only warn if within 14 days
    if (daysRemaining > 14) return;

    // Only show once per day
    const today = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem("hivemap_last_expiry_warning");
    if (lastShown === today) return;

    // Toast elements (NO variable name collisions)
    const expiryToast = document.getElementById("expiryToast");
    const expiryMsg = document.getElementById("expiryToastMessage");
    const expiryClose = document.getElementById("expiryToastClose");

    // Set message
expiryMsg.innerHTML =
  `<strong>Your subscription expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}.</strong><br>
   Renew your subscription and enter a new subscription code before the expiration date to continue using HiveMap.<br><br>
   <button id="openAccountFromExpiry" class="expiry-btn">Renew Subscription</button>`;

document.getElementById("openAccountFromExpiry").addEventListener("click", () => {
  // Reuse the existing toolsAccount handler
  document.getElementById("toolsAccount").click();
});

    // Show toast
    expiryToast.classList.remove("hidden");
    setTimeout(() => expiryToast.classList.add("show"), 50);

    // Dismiss
    expiryClose.addEventListener("click", () => {
      expiryToast.classList.remove("show");
      setTimeout(() => expiryToast.classList.add("hidden"), 300);
    });

    // Mark as shown today
    localStorage.setItem("hivemap_last_expiry_warning", today);
  })();
});


