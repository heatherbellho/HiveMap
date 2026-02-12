// ------------------------------------------------------------
// apiaries.js
// Handles apiary selection, creation, renaming, deletion,
// and UI updates for the apiary dropdown.
// ------------------------------------------------------------

window.App = window.App || {};
App.Apiaries = {};


// ------------------------------------------------------------
// Populate the apiary <select>
// ------------------------------------------------------------
App.Apiaries.updateSelector = function () {
  const selector = document.getElementById("apiarySelect");
  if (!selector) return;

  const all = Storage.getAllApiaries();
  const current = Storage.getCurrentApiary();

  selector.innerHTML = "";

  all.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    if (name === current) opt.selected = true;
    selector.appendChild(opt);
  });
};


// ------------------------------------------------------------
// Switch to a different apiary
// ------------------------------------------------------------
App.Apiaries.switch = function (name) {
  if (!name) return;

  // Save current layout before switching
  App.Canvas.saveLayout();

  // Update storage
  Storage.saveCurrentApiary(name);

  // Update UI
  App.Apiaries.updateSelector();
  App.Notes.load();
  App.Status.renderLegend();
  App.Stats.update();

  // Load new apiary layout
  App.Canvas.loadLayout();
};


// ------------------------------------------------------------
// Create a new apiary
// ------------------------------------------------------------
App.Apiaries.create = function () {
  const all = Storage.getAllApiaries();

  // ⭐ Limit: max apiaries in free version
  if (all.length >= LIMITS.maxApiaries) {
    alert("The free version of HiveMap supports only one apiary.");
    return;
  }

  const name = prompt("Name of new apiary:");
  if (!name) return;

  if (all.includes(name)) {
    alert("That apiary already exists.");
    return;
  }

  // Add new apiary
  all.push(name);
  Storage.saveAllApiaries(all);

  // Set as current
  Storage.saveCurrentApiary(name);

  // Create empty layout + empty note
  Storage.saveHiveLayout(name, JSON.stringify({ objects: [] }));
  Storage.saveApiaryNote(name, "");

  // Update UI
  App.Apiaries.updateSelector();
  App.Notes.load();
  App.Status.renderLegend();
  App.Stats.update();

  App.Canvas.loadLayout();
};

// ------------------------------------------------------------
// Rename current apiary
// ------------------------------------------------------------
App.Apiaries.rename = function () {
  const oldName = Storage.getCurrentApiary();
  if (!oldName) return;

  const newName = prompt("Enter new name for the apiary:", oldName);
  if (!newName || newName === oldName) return;

  const all = Storage.getAllApiaries();
  if (all.includes(newName)) {
    alert("That name already exists.");
    return;
  }

  // Move layout
  const oldLayout = Storage.getHiveLayout(oldName);
  if (oldLayout) {
    Storage.saveHiveLayout(newName, oldLayout);
    Storage.deleteHiveLayout(oldName);
  }

  // Move note
  const oldNote = Storage.getApiaryNote(oldName);
  if (oldNote !== null && oldNote !== undefined) {
    Storage.saveApiaryNote(newName, oldNote);
    Storage.deleteApiaryNote(oldName);
  }

  // Update list
  const idx = all.indexOf(oldName);
  if (idx !== -1) all[idx] = newName;
  Storage.saveAllApiaries(all);

  // Set new current
  Storage.saveCurrentApiary(newName);

  // Update UI
  App.Apiaries.updateSelector();
  App.Notes.load();
  App.Status.renderLegend();
  App.Stats.update();

  App.Canvas.loadLayout();
};


// ------------------------------------------------------------
// Delete current apiary
// ------------------------------------------------------------
App.Apiaries.delete = function () {
  const all = Storage.getAllApiaries();
  const current = Storage.getCurrentApiary();

  if (all.length === 1) {
    alert("You must have at least one apiary.");
    return;
  }

  if (!confirm(`Delete apiary "${current}"? This cannot be undone.`)) return;

  // Remove layout + note
  Storage.deleteHiveLayout(current);
  Storage.deleteApiaryNote(current);

  // Remove from list
  const updated = all.filter(a => a !== current);
  Storage.saveAllApiaries(updated);

  // Switch to first remaining apiary
  const newCurrent = updated[0];
  Storage.saveCurrentApiary(newCurrent);

  // Update UI
  App.Apiaries.updateSelector();
  App.Notes.load();
  App.Status.renderLegend();
  App.Stats.update();

  App.Canvas.loadLayout();
};


// ------------------------------------------------------------
// Initialise apiary system
// ------------------------------------------------------------
App.Apiaries.init = function () {
  const selector = document.getElementById("apiarySelect");
  if (selector) {
    selector.addEventListener("change", e => {
      App.Apiaries.switch(e.target.value);
    });
  }

  // Buttons
  const createBtn = document.getElementById("createApiaryBtn");
  const renameBtn = document.getElementById("renameApiaryBtn");
  const deleteBtn = document.getElementById("deleteApiaryBtn");

  if (createBtn) createBtn.addEventListener("click", App.Apiaries.create);
  if (renameBtn) renameBtn.addEventListener("click", App.Apiaries.rename);
  if (deleteBtn) deleteBtn.addEventListener("click", App.Apiaries.delete);

  // Initial UI population
  App.Apiaries.updateSelector();
};
