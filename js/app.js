// ------------------------------------------------------------
// app.js
// Main orchestrator. Initialises all modules in the correct
// order once the DOM is ready.
// ------------------------------------------------------------

window.App = window.App || {};

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
  App.Notes.init();      // Apiary notes
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
  .addEventListener("click", App.Modals.openDueInspections);
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
document.getElementById("appVersion").textContent = App.Version;
document.title = "HiveMap " + App.Version;


};

// ------------------------------------------------------------
// Start the app when DOM is ready
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", App.init);

document.addEventListener("DOMContentLoaded", () => {
  App.init();

  const toast = document.getElementById("exitToast");
  const closeBtn = document.getElementById("exitToastClose");

  // Show the toast once per session
  setTimeout(() => {
    toast.classList.remove("hidden");
    toast.classList.add("show");
  }, 800);

  // Manual dismiss
  closeBtn.addEventListener("click", () => {
    toast.classList.remove("show");

    // Remove from layout after fade-out
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 400);
  });
});
