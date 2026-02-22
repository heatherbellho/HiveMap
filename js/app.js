/* ------------------------------------------------------------
   app.js
   Main orchestrator. Initialises all modules in the correct
   order once the DOM is ready.
------------------------------------------------------------ */

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


/* ------------------------------------------------------------
   HM2 Licensing (v2.2.6)
------------------------------------------------------------ */

let isPro = false;
let isExpired = false;
let edition = "NONE";
let expiryDate = null;

// We delay reading the licence until DOM is ready,
// so the browser has finished writing localStorage after import.
document.addEventListener("DOMContentLoaded", () => {
  const hm2Code = localStorage.getItem("hivemap_license_code") || "";
  startLicenseCheck(hm2Code);
});

function startLicenseCheck(hm2Code) {
  if (!hm2Code) {
    const accountBtn = document.getElementById("toolsAccount");
    if (accountBtn) accountBtn.click();

    const statusEl = document.getElementById("licenseStatus");
    if (statusEl) statusEl.textContent = "Unlicensed";
    return;
  }

  validateHM2Code(hm2Code).then(result => {

    if (result.valid) {
      edition = result.edition;

      // ⭐ READ THE SAME EXPIRY THE ACCOUNT MODAL USES
      const expiryStr = localStorage.getItem("hivemap_license_expiry");
      expiryDate = expiryStr ? new Date(expiryStr) : null;

      if (expiryDate instanceof Date && !isNaN(expiryDate)) {
        const today = new Date();
        today.setHours(0,0,0,0);

        isExpired = expiryDate < today;
        isPro = edition === "PLUS" && !isExpired;
      }

    } else {
      edition = "NONE";
      isPro = false;
      isExpired = false;

      const accountBtn = document.getElementById("toolsAccount");
      if (accountBtn) accountBtn.click();
    }

    if (isExpired) {
      const accountBtn = document.getElementById("toolsAccount");
      if (accountBtn) accountBtn.click();
    }

    const statusEl = document.getElementById("licenseStatus");
    if (statusEl) statusEl.textContent = isPro ? "Plus" : "Unlicensed";

// ⭐ EXPIRY WARNING — TOOLBAR BADGE (replaces toast)
const expiryStr = localStorage.getItem("hivemap_license_expiry");

if (expiryStr) {
  const expiryDate = new Date(expiryStr);

  if (!isNaN(expiryDate)) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays > 0 && diffDays <= 7) {
      const badge = document.getElementById("expiryBadge");
      if (badge) {
        badge.classList.add("expiring");

        // Colour scale
        if (diffDays <= 1) badge.style.background = "#f76969";     // red
        else if (diffDays <= 3) badge.style.background = "#ff8800"; // orange
        else badge.style.background = "#ffcc00";                    // yellow

 //     badge.setAttribute(
//        "data-tooltip",
  //      `Licence expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`
  //    );
      }
    }
  }
}

  });
}

function editingDisabled() {
  return isExpired;
}

function getLimits() {
  return {
    maxApiaries: isPro ? Infinity : 1,
    maxHives:    isPro ? Infinity : 1
  };
}



/* ------------------------------------------------------------
   Update the Inspections Due badge and button visibility
------------------------------------------------------------ */
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


/* ------------------------------------------------------------
   App Initialisation
------------------------------------------------------------ */
App.init = function () {
  App.Apiaries.init();
  App.Hives.init();
  App.Status.init();
  App.Modals.init();
  App.Modals.inspectionSchema = Storage.getInspectionSchema() || App.Modals.defaultInspectionSchema;
  App.Export.init();
  App.Canvas.init();

  const printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", App.Canvas.print);
  }

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
    `HiveMap ${isPro ? "Plus" : "Core"} - ${App.Version}`;

  document.title = `HiveMap ${isPro ? "Plus" : "Core"} - ${App.Version}`;

  const statusEl = document.getElementById("licenseStatus");
  if (statusEl) {
    statusEl.textContent = isPro ? "Plus" : "Core";
  }
};


/* ------------------------------------------------------------
   Start the app when DOM is ready
------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  App.init();
document.getElementById("expiryToastClose")?.addEventListener("click", () => {
  document.getElementById("expiryToast").classList.remove("show");
});

// When the toast link is clicked → close toast → open account modal
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "expiryToastLink") {
    document.getElementById("expiryToast").classList.remove("show");

    // Open the Account & License modal
    const accountBtn = document.getElementById("toolsAccount");
    if (accountBtn) accountBtn.click();
  }
});


  const exitToast = document.getElementById("exitToast");
  const exitCloseBtn = document.getElementById("exitToastClose");

  setTimeout(() => {
    exitToast.classList.remove("hidden");
    exitToast.classList.add("show");
  }, 800);

  exitCloseBtn.addEventListener("click", () => {
    exitToast.classList.remove("show");

    setTimeout(() => {
      exitToast.classList.add("hidden");
    }, 400);
  });
});
