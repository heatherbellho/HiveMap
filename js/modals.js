// ------------------------------------------------------------
// modals.js
// Handles all modal windows: hive edit modal, hive size modal,
// inspection history, box management, and saving hive data.
// ------------------------------------------------------------

window.App = window.App || {};
App.Modals = {};

let selectedHive = null;   // Fabric group currently being edited
App.Modals.inspectionSchemaWorking = null;

/* ------------------------------------------------------------
   DEFAULT INSPECTION SCHEMA
   (Used when user has not customised their field layout)
------------------------------------------------------------ */
App.Modals.defaultInspectionSchema = {
  groups: [
    {
      id: "management",
      name: "Space & Stores",
      sortOrder: 1,
      fields: [
        { id: "beesFrames", label: "Bees Frames", type: "text", sortOrder: 1, placeholder: "e.g. 8/11 D + 16/22 S" },
        { id: "honeyFrames", label: "Honey Frames", type: "text", sortOrder: 2, placeholder: "e.g. 2/11 D + 12/22 S" },
        { id: "pollenFrames", label: "Pollen Frames", type: "text", sortOrder: 3, placeholder: "e.g. 2/11 D" },
        { id: "feedingType", label: "Feeding", type: "text", sortOrder: 4, placeholder: "e.g. +4pts 50/50" },
        { id: "supersAddedRemoved", label: "Boxes Added/Removed", type: "text", sortOrder: 5, placeholder: "e.g. +1 S" }
      ]
    },
    {
      id: "queenBrood",
      name: "Queen & Brood",
      sortOrder: 2,
      fields: [
        { id: "queenColour", label: "Queen Colour", type: "text", sortOrder: 1, placeholder: "e.g. amber/leather stripe, unmarked" },
        { id: "queenPresence", label: "Queen?", type: "text", sortOrder: 2, placeholder: "e.g. not seen" },
        { id: "eggsPresence", label: "Eggs?", type: "text", sortOrder: 3, placeholder: "e.g. seen" },
        { id: "queenCellsPresent", label: "Queen Cells?", type: "text", sortOrder: 4, placeholder: "e.g. 4 unsealed" },
        { id: "broodFrames", label: "Brood Frames", type: "text", sortOrder: 5, placeholder: "e.g. 5/11 D" },
        { id: "broodPattern", label: "Brood Pattern", type: "text", sortOrder: 6, placeholder: "e.g. good" }
      ]
    },
    {
      id: "health",
      name: "Health",
      sortOrder: 3,
      fields: [
        { id: "treatmentApplied", label: "Treatment Applied", type: "text", sortOrder: 1, placeholder: "e.g. Thymovar in" },
        { id: "diseaseSigns", label: "Disease Signs", type: "textarea", sortOrder: 2, placeholder: "e.g. very little Chalkbrood" },
        { id: "miteCount", label: "Mite Count", type: "number", sortOrder: 3, placeholder: "e.g. not done" },
        { id: "beeTemperament", label: "Bee Temperament", type: "text", sortOrder: 4, placeholder: "e.g. calm" },
        { id: "combCondition", label: "Comb Condition", type: "textarea", sortOrder: 5, placeholder: "e.g. 2/11 D need changing" }
      ]
    },
    {
      id: "environment",
      name: "Environmental",
      sortOrder: 4,
      fields: [
        { id: "temperature", label: "Temperature °C", type: "number", sortOrder: 1, placeholder: "e.g. 18" },
        { id: "weather", label: "Weather", type: "text", sortOrder: 2, placeholder: "e.g. calm, dry" },
        { id: "forage", label: "Forage", type: "text", sortOrder: 3, placeholder: "e.g. willow out and pollen seen" }
      ]
    }
  ]
};

/* ------------------------------------------------------------
   LOAD ACTIVE SCHEMA (user‑saved or default)
------------------------------------------------------------ */
App.Modals.inspectionSchema =
  Storage.getInspectionSchema() || App.Modals.defaultInspectionSchema;


App.Modals.openHiveModal = function (hiveGroup) {
  selectedHive = hiveGroup;
const data = hiveGroup.hiveData;   // MUST be the live reference
// Change modal title depending on hive status
const titleEl = document.getElementById("modalTitle");
if (data.status === "archived") {
  titleEl.textContent = "Archived Hive";
} else {
  titleEl.textContent = "Hive Details";
}
const deleteBtn = document.getElementById("deleteArchivedHiveBtn");

// Always reset first
deleteBtn.style.display = "none";

// Only show delete for archived hives
if (data.status === "archived") {
  deleteBtn.style.display = "block";
}

  // Ensure arrays exist
  data.boxes = data.boxes || [];
  data.inspections = data.inspections || [];
  data.treatments = data.treatments || [];

  // --- Move Hive section ---
  const currentApiary = Storage.getCurrentApiary();
  const allApiaries = Storage.getAllApiaries() || [];

  document.getElementById("currentApiaryName").value =
    currentApiary || "Unknown";

  const destSelect = document.getElementById("destinationApiarySelect");
  destSelect.innerHTML = "";

  allApiaries.forEach(name => {
    if (name !== currentApiary) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      destSelect.appendChild(opt);
    }
  });

  // Populate fields
  document.getElementById("hiveMemo").value = data.memo || "";
  document.getElementById("hiveName").value = data.name || "";
  App.Hives.populateTypeSelect(data.hiveType || "");
  document.getElementById("editHiveEntrance").value = data.entrance || "";


  const rect = hiveGroup._objects[0];
  document.getElementById("editHiveWidth").value = rect.width;
  document.getElementById("editHiveHeight").value = rect.height;

  // Latest inspection
  const latest = data.inspections[data.inspections.length - 1] || {};
  App.Status.populateStatusSelect(latest.queenStatus || "");

  // Render boxes + inspection history preview
  App.Modals.renderBoxList();
  App.Modals.renderInspectionHistory();
  App.Modals.renderTreatmentList();

  // 🔹 Archive / Restore buttons
  const archiveBtn = document.getElementById("archiveHiveBtn");
  const restoreBtn = document.getElementById("restoreHiveBtn");

// ⭐ ARCHIVED HIVES → READ‑ONLY MODE
if (data.status === "archived") {

  // Hide Archive + Restore
  if (archiveBtn) archiveBtn.style.display = "none";

  // Hide all action buttons
  const addInspectionBtn = document.getElementById("addInspectionBtn");
  const addTreatmentBtn = document.getElementById("addTreatmentBtn");
  const moveHiveBtn = document.getElementById("moveHiveBtn");
  const saveHiveBtn = document.getElementById("saveHiveBtn");
  const cancelHiveBtn = document.getElementById("cancelHiveBtn");
  const addBoxBtn = document.getElementById("addBoxBtn");
  const saveHiveBtnFooter = document.getElementById("saveHiveBtnFooter");
  const cancelHiveBtnFooter = document.getElementById("cancelHiveBtnFooter");

  if (addInspectionBtn) addInspectionBtn.style.display = "none";
  if (addTreatmentBtn) addTreatmentBtn.style.display = "none";
  if (moveHiveBtn) moveHiveBtn.style.display = "none";
  if (saveHiveBtn) saveHiveBtn.style.display = "none";
  if (cancelHiveBtn) cancelHiveBtn.style.display = "none";
  if (addBoxBtn) addBoxBtn.style.display = "none";
  if (saveHiveBtnFooter) saveHiveBtnFooter.style.display = "none";
  if (cancelHiveBtnFooter) cancelHiveBtnFooter.style.display = "none";

  // ⭐ Show delete button for archived hives
    const deleteBtn = document.getElementById("deleteArchivedHive");
    deleteBtn.style.display = "block";

deleteBtn.onclick = function () {

  // Open confirm delete modal
  const confirmModal = document.getElementById("confirmDeleteArchivedHiveModal");
  const overlay = document.getElementById("overlay");

  confirmModal.style.display = "block";
  overlay.style.display = "block";
  overlay.style.zIndex = "1150";

  // Wire NO button (cancel)
  const noBtn = document.getElementById("confirmDeleteArchivedHiveNo");
  noBtn.onclick = function () {
    confirmModal.style.display = "none";
    // Reset overlay back to normal — DO NOT hide it
    overlay.style.zIndex = "";
  };

  // Wire YES button (perform delete)
  const yesBtn = document.getElementById("confirmDeleteArchivedHiveYes");
  yesBtn.onclick = function () {

    confirmModal.style.display = "none";
    // Reset overlay back to normal — DO NOT hide it
    overlay.style.zIndex = "";

    // --- your existing delete logic begins here ---

    const uid = selectedHive?.hiveData?.__uid;
    const hiveApiary = selectedHive?.__apiaryName;

    if (!uid || !hiveApiary) {
      console.warn("Cannot delete archived hive — missing UID or apiary name.");
      return;
    }

    const originalApiary = Storage.getCurrentApiary();

    // Switch to the hive’s apiary only if needed
    if (originalApiary !== hiveApiary) {
      Storage.saveCurrentApiary(hiveApiary);
      App.Canvas.loadLayout();
    }

    // Find the real hive object in that apiary
    const objs = canvas.getObjects();
    const real = objs.find(o => o.hiveData && o.hiveData.__uid === uid);

    if (!real) {
      console.warn("Archived hive not found in canvas — aborting delete.");

      // Restore original apiary if needed
      if (originalApiary !== hiveApiary) {
        Storage.saveCurrentApiary(originalApiary);
        App.Canvas.loadLayout();
      }

      App.Modals.closeHiveModal();
      App.Modals.openArchivedHivesModal();
      return;
    }

    // Remove the hive and persist
    canvas.remove(real);
    App.Canvas.saveLayout();

    // Restore original apiary
    if (originalApiary !== hiveApiary) {
      Storage.saveCurrentApiary(originalApiary);
      App.Canvas.loadLayout();
    }

    // Close modal and refresh archive list
    App.Modals.closeHiveModal();
    App.Modals.openArchivedHivesModal();

    if (App.Toolbar && App.Toolbar.refreshCounts) {
      App.Toolbar.refreshCounts();
    }

    // --- end of your existing delete logic ---
  };
};

} else {

  // ACTIVE HIVES → FULL CONTROLS
  if (archiveBtn) archiveBtn.style.display = "inline-block";

  const addInspectionBtn = document.getElementById("addInspectionBtn");
  const addTreatmentBtn = document.getElementById("addTreatmentBtn");
  const moveHiveBtn = document.getElementById("moveHiveBtn");
  const saveHiveBtn = document.getElementById("saveHiveBtn");

  if (addInspectionBtn) addInspectionBtn.style.display = "inline-block";
  if (addTreatmentBtn) addTreatmentBtn.style.display = "inline-block";
  if (moveHiveBtn) moveHiveBtn.style.display = "inline-block";
  if (saveHiveBtn) saveHiveBtn.style.display = "inline-block";

  // Restore Cancel buttons for active hives
const cancelHiveBtn = document.getElementById("cancelHiveBtn");
const cancelHiveBtnFooter = document.getElementById("cancelHiveBtnFooter");

if (cancelHiveBtn) cancelHiveBtn.style.display = "inline-block";
if (cancelHiveBtnFooter) cancelHiveBtnFooter.style.display = "inline-block";

  // Archive action
  if (archiveBtn) {
archiveBtn.onclick = function () {
  // Open confirmation modal
  document.getElementById("confirmArchiveHiveModal").style.display = "block";
  
  // Use the same overlay you already use
  const overlay = document.getElementById("overlay");
  overlay.style.display = "block";
  overlay.style.zIndex = "1150"; // match Apiary Manager behaviour
};

  }
}

  // 🔹 Wire Inspection History button (THIS WAS THE MISSING PIECE)
  const histBtn = document.getElementById("openInspectionHistoryBtn");
  if (histBtn) {
    histBtn.onclick = function () {
      App.Modals.openInspectionHistory(hiveGroup);
    };
  }

  const addTreatBtn = document.getElementById("addTreatmentBtn");
if (addTreatBtn) {
  addTreatBtn.onclick = () => App.Modals.openTreatmentModal(null);
}

  // Show modal
  document.getElementById("modal").style.display = "block";
  document.getElementById("overlay").style.display = "block";
};

App.Hives.moveHive = function (hiveGroup, newApiaryName) {
  if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}

  if (!hiveGroup || !hiveGroup.hiveData) return;

  const currentApiary = Storage.getCurrentApiary();
  if (!currentApiary || !newApiaryName || newApiaryName === currentApiary) return;

  // Helper: generate unique hive name
  function getUniqueHiveName(baseName, existingHives) {
    if (!existingHives.some(h => h.hiveData && h.hiveData.name === baseName)) {
      return baseName;
    }

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < letters.length; i++) {
      const candidate = baseName + letters[i];
      if (!existingHives.some(h => h.hiveData && h.hiveData.name === candidate)) {
        return candidate;
      }
    }

    return baseName + "_" + Date.now();
  }

  // Load destination layout
  const raw = Storage.getHiveLayout(newApiaryName);
  const destJson = raw ? JSON.parse(raw) : { objects: [] };
  destJson.objects = destJson.objects || [];

  // Determine new name
  const existingHives = destJson.objects.filter(o => o.hiveData);
  const originalName = hiveGroup.hiveData.name;
  const newName = getUniqueHiveName(originalName, existingHives);

  // ⭐ Update hiveData BEFORE serialization
  hiveGroup.hiveData.name = newName;

  // ⭐ Update visible label BEFORE serialization
  hiveGroup._objects.forEach(obj => {
    if (obj.type === "text") {
      obj.text = newName;
    }
  });

  // NOW serialize with updated label + data
  const hiveObject = hiveGroup.toObject(["hiveData"]);

  // Remove from current canvas and save
  canvas.remove(hiveGroup);
  App.Canvas.saveLayout();

  // Add to destination
  destJson.objects.push(hiveObject);
  Storage.saveHiveLayout(newApiaryName, JSON.stringify(destJson));

  // Switch to destination apiary
  Storage.saveCurrentApiary(newApiaryName);
  App.Apiaries.updateSelector();
  App.Canvas.loadLayout();

  App.Modals.closeHiveModal();
};



// ------------------------------------------------------------
// Close hive edit modal
// ------------------------------------------------------------
App.Modals.closeHiveModal = function () {
  document.getElementById("modal").style.display = "none";
    const anyOpen = [...document.querySelectorAll('.modal')]
  .some(m => m.style.display === "block");
  document.getElementById("overlay").style.display = anyOpen ? "block" : "none";
  selectedHive = null;
};

App.Modals.confirmEditHive = function (hive) {
  if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}

  const newWidth = parseInt(document.getElementById("editHiveWidth").value, 10);
  const newHeight = parseInt(document.getElementById("editHiveHeight").value, 10);

  const rect = hive._objects[0];
  rect.set({
    width: newWidth,
    height: newHeight
  });

  // Recenter label
  const label = hive._objects[1];
  label.set({
    left: 0,
    top: 0
  });

  // Recalculate group bounds
  hive._calcBounds();
  hive._updateObjectsCoords();
  hive.setCoords();

  // Save layout
  App.Canvas.saveLayout();

  // Optional but recommended
  resizeAndFitCanvas();

  canvas.requestRenderAll();

  App.Modals.closeEditHiveModal();
};

// ------------------------------------------------------------
// Save hive data from modal
// ------------------------------------------------------------
App.Modals.saveHiveData = function () {
  if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}

  if (!selectedHive) return;

  const hiveData = selectedHive.hiveData;

  // -----------------------------
  // 1. UPDATE SIZE
  // -----------------------------
// -----------------------------
// 1. UPDATE SIZE (without moving hive)
// -----------------------------
const newWidth = parseInt(document.getElementById("editHiveWidth").value, 10);
const newHeight = parseInt(document.getElementById("editHiveHeight").value, 10);

// Save current absolute position BEFORE resizing
const oldLeft = selectedHive.left;
const oldTop = selectedHive.top;

const rect = selectedHive._objects[0];
rect.set({
  width: newWidth,
  height: newHeight
});

// Recenter label
const label = selectedHive._objects[1];
label.set({
  left: 0,
  top: 0
});

// Recalculate bounds WITHOUT shifting the group
selectedHive._calcBounds();
selectedHive._updateObjectsCoords();
selectedHive.setCoords();

// Restore original position
selectedHive.left = oldLeft;
selectedHive.top = oldTop;
selectedHive.setCoords();



  // -----------------------------
  // 2. UPDATE HIVE DATA
  // -----------------------------
  selectedHive.hiveData.memo = document.getElementById("hiveMemo").value.trim();
  const name = document.getElementById("hiveName").value.trim() || "Unnamed";
  const hiveType = document.getElementById("hiveType").value;
//  const date = document.getElementById("lastInspection").value;
 // const queenStatus = document.getElementById("queenStatus").value;
//  const notes = document.getElementById("notes").value;
 // const nextInspection = document.getElementById("nextInspection").value;

  hiveData.name = name;
  hiveData.hiveType = hiveType;
  hiveData.entrance = document.getElementById("editHiveEntrance").value;
label.set("text", formatEntranceLabel(hiveData.name, hiveData.entrance));

//  hiveData.nextInspectionDate = nextInspection;

  hiveData.inspections = hiveData.inspections || [];
  const latest = hiveData.inspections[hiveData.inspections.length - 1] || {};

 // if (date !== latest.date || queenStatus !== latest.queenStatus || notes !== latest.notes) {
 //   hiveData.inspections.push({ date, queenStatus, notes });
 // }

  // Update label + colour
  const currentInspection = hiveData.inspections[hiveData.inspections.length - 1] || {};
  hiveData.queenStatus = currentInspection.queenStatus || "";

selectedHive._objects[1].set("text", formatEntranceLabel(name, hiveData.entrance));

  const color = App.Status.getColor(currentInspection.queenStatus || "");
  selectedHive._objects[0].set("fill", color);

// Ensure coordinates are always saved correctly
hiveData.x = selectedHive.left;
hiveData.y = selectedHive.top;

  // -----------------------------
  // 3. SAVE + RENDER
  // -----------------------------
  App.Canvas.saveLayout();
  App.updateDueInspectionsBadge();
  resizeAndFitCanvas();
  canvas.requestRenderAll();
if (App.Toolbar && App.Toolbar.refreshCounts) {
  App.Toolbar.refreshCounts();
}
  App.Modals.closeHiveModal();
};

App.Modals.openTreatmentModal = function (index = null) {
  const modal = document.getElementById("treatmentModal");
  const overlay = document.getElementById("overlay");

  const isEdit = index !== null;
  const t = isEdit ? selectedHive.hiveData.treatments[index] : {};

  // Populate fields
  document.getElementById("treatProduct").value = t.product || "";
  document.getElementById("treatIngredient").value = t.activeIngredient || "";
  document.getElementById("treatBatch").value = t.batch || "";
  document.getElementById("treatExpiry").value = t.expiry || "";
  document.getElementById("treatDate").value = t.date || "";
  document.getElementById("treatQuantity").value = t.quantity || "";
  document.getElementById("treatWithdrawal").value = t.withdrawal || "";
  document.getElementById("treatSupplier").value = t.supplier || "";

  modal.dataset.editIndex = isEdit ? index : "";

  overlay.style.zIndex = 1150; // Ensure treatment modal is above inspection history modal
  modal.style.display = "block";
  overlay.style.display = "block";
};

App.Modals.saveTreatment = function () {
  if (editingDisabled()) {
    App.UI.showToast("Editing is disabled because your subscription has expired.");
    return;
  }

  if (!selectedHive) return;

  const index = document.getElementById("treatmentModal").dataset.editIndex;

  const entry = {
    product: document.getElementById("treatProduct").value.trim(),
    activeIngredient: document.getElementById("treatIngredient").value.trim(),
    batch: document.getElementById("treatBatch").value.trim(),
    expiry: document.getElementById("treatExpiry").value,
    date: document.getElementById("treatDate").value,
    quantity: document.getElementById("treatQuantity").value.trim(),
    withdrawal: document.getElementById("treatWithdrawal").value.trim(),
    supplier: document.getElementById("treatSupplier").value.trim()
  };

  if (index === "") {
    selectedHive.hiveData.treatments.push(entry);
  } else {
    selectedHive.hiveData.treatments[index] = entry;
  }

  App.Modals.renderTreatmentList();

  // ⭐ FIX: Preserve hive coordinates so saveLayout doesn't wipe them
  selectedHive.hiveData.x = selectedHive.left;
  selectedHive.hiveData.y = selectedHive.top;

  App.Canvas.saveLayout();
  App.Modals.closeTreatmentModal();
};


App.Modals.closeTreatmentModal = function () {
  const modal = document.getElementById("treatmentModal");
  modal.style.display = "none";
  overlay.style.zIndex = 900; // Reset z-index
};

App.Modals.renderTreatmentList = function () {
  if (!selectedHive) return;

  const list = document.getElementById("treatmentList");
  const treatments = selectedHive.hiveData.treatments || [];

  if (!list) return;

  if (treatments.length === 0) {
    list.innerHTML = `<p style="opacity: 0.6;">No treatments recorded.</p>`;
    return;
  }

  // ⭐ NEW: reverse so newest is first
  const ordered = treatments.slice().reverse();

list.innerHTML = ordered.map((t, index) => `
  <div class="treatment-item" style="display:flex; justify-content:space-between; align-items:center;">
    
    <div>
      <strong>${t.date ? App.Utils.formatDateUK(t.date) : "No date"}</strong>
      — ${t.product || "Unknown"}
    </div>

    <div class="treatment-actions">
      <button class="btn-info" data-index="${treatments.length - 1 - index}">Edit</button>
      <button class="btn-danger" data-index="${treatments.length - 1 - index}">Delete</button>
    </div>

  </div>
`).join("");


  // Wire edit/delete buttons
  list.querySelectorAll(".btn-info").forEach(btn => {
    btn.onclick = () => App.Modals.openTreatmentModal(btn.dataset.index);
  });

  list.querySelectorAll(".btn-danger").forEach(btn => {
    btn.onclick = () => {
      if (editingDisabled()) {
        App.UI.showToast("Editing is disabled because your subscription has expired.");
        return;
      }

      const i = btn.dataset.index;
      selectedHive.hiveData.treatments.splice(i, 1);
      App.Modals.renderTreatmentList();
      App.Canvas.saveLayout();
    };
  });
};



// ------------------------------------------------------------
// Render inspection history list
// ------------------------------------------------------------
App.Modals.renderInspectionHistory = function () {
  const container = document.getElementById("inspectionHistoryList");
  if (!container || !selectedHive) return;

  const data = selectedHive.hiveData;
  container.innerHTML = "";

  // ⭐ Output Next Inspection Due into the dedicated div
  const nextDueDiv = document.getElementById("nextInspectionDateDisplay");
  if (nextDueDiv) {
    const nextDue = data.nextInspectionDate
      ? App.Utils.formatDateUK(data.nextInspectionDate)
      : "None";

    nextDueDiv.innerHTML = nextDue
      ? `Next Inspection Due – <strong>${nextDue}</strong>`
      : "";
  }

  // ⭐ Render inspection rows
  data.inspections.slice().reverse().forEach((ins, reversedIndex) => {
    const originalIndex = data.inspections.length - 1 - reversedIndex;

    const li = document.createElement("li");
    li.style.marginBottom = "6px";

    // ⭐ NEW: use separate date + time fields
    const dateStr = ins.date ? App.Utils.formatDateUK(ins.date) : "Unknown";
    const timeStr = ins.time || ""; // already HH:MM

    li.innerHTML = `
  <div style="display:flex; justify-content:space-between; align-items:start; gap:6px; width:100%;">
    
    <div>
      <strong>${dateStr} ${timeStr}</strong>
      - Status: ${ins.queenStatus || "N/A"}<br>
      Notes: ${ins.notes || ""}
    </div>

    <div style="display:flex; gap:6px; margin-left:auto;">
      <button class="inspectionDetailsBtn btn-info" data-index="${originalIndex}">Details</button>
      <button type="button"
              class="deleteInspectionBtn small-delete"
              data-index="${originalIndex}">
        ×
      </button>
    </div>

  </div>

    `;

    container.appendChild(li);
  });

  // Details handlers
  document.querySelectorAll(".inspectionDetailsBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      App.Modals.openInspectionDetails(index);
    });
  });

  // Delete handlers
  container.querySelectorAll(".deleteInspectionBtn").forEach(btn => {
    btn.addEventListener("click", e => {
      const index = parseInt(e.target.dataset.index, 10);
      App.Modals.deleteInspection(index);
    });
  });
};


// ------------------------------------------------------------
// Delete an inspection
// ------------------------------------------------------------
App.Modals.deleteInspection = function (index) {
  if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}

  if (!selectedHive) return;

  const hiveData = selectedHive.hiveData;
  if (!hiveData.inspections || index < 0 || index >= hiveData.inspections.length) return;

  if (!confirm("Delete this inspection? This cannot be undone.")) return;

  hiveData.inspections.splice(index, 1);

  // Refresh modal
  App.Modals.renderInspectionHistory();
  App.Canvas.saveLayout();
};


// ------------------------------------------------------------
// Render hive box list
// ------------------------------------------------------------
App.Modals.renderBoxList = function () {
  const container = document.getElementById("boxList");
  if (!container || !selectedHive) return;

  container.innerHTML = "";

  selectedHive.hiveData.boxes.forEach((box, idx) => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.marginBottom = "4px";

    row.innerHTML = `
      <span>${box.count} × ${box.type}</span>
      <button type="button"
              class="deleteBoxBtn small-delete"
              data-index="${idx}">
        ×
      </button>
    `;

    container.appendChild(row);
  });

  // Attach delete handlers
  container.querySelectorAll(".deleteBoxBtn").forEach(btn => {
    btn.addEventListener("click", e => {
      const index = parseInt(e.target.dataset.index, 10);
      selectedHive.hiveData.boxes.splice(index, 1);
      App.Modals.renderBoxList();
      App.Canvas.saveLayout();
    });
  });
};


// ------------------------------------------------------------
// Add a box to the hive
// ------------------------------------------------------------
App.Modals.addBox = function () {
  if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}

  if (!selectedHive) return;

  const type = document.getElementById("boxTypeSelect").value;
  const count = parseInt(document.getElementById("boxCountInput").value, 10);

  if (!count || count < 1) {
    App.UI.showToast("Count must be at least 1");
    return;
  }

  // ⭐ Add new box to TOP of list
  selectedHive.hiveData.boxes.unshift({ type, count });

  App.Modals.renderBoxList();
  App.Canvas.saveLayout();
};



// ------------------------------------------------------------
// HIVE SIZE MODAL
// ------------------------------------------------------------

// Open
App.Modals.openHiveSizeModal = function () {
  if (editingDisabled()) {
    App.UI.showToast("Editing is disabled because your subscription has expired.");
    return;
  }

  // ⭐ CORE VERSION LIMIT CHECK — block before modal opens
  // Count only ACTIVE hives
  const activeHives = App.Canvas.getAllHives().filter(h => h.hiveData.status !== "archived");

  if (activeHives.length >= getLimits().maxHives) {
    App.UI.showToast("The Core version of HiveMap supports only one active hive.");
    return;
  }

  // Open modal
  document.getElementById("hiveSizeModal").style.display = "block";
  document.getElementById("overlay").style.display = "block";

  // ⭐ Auto-suggest next hive number
  // Use ACTIVE hive names only
  const used = activeHives
    .map(h => h.hiveData.name)
    .sort((a, b) => Number(a) - Number(b));

  let n = 1;
  while (used.includes(String(n).padStart(2, "0"))) {
    n++;
  }

  const padded = String(n).padStart(2, "0");
  document.getElementById("hiveNameInput").value = padded;

  document.getElementById("usedHiveNumbers").textContent =
    used.length ? "Used: " + used.join(", ") : "No hives yet";
};


// Close
App.Modals.closeHiveSizeModal = function () {
  document.getElementById("hiveSizeModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
};


// Toggle custom size fields
App.Modals.toggleCustomSizeFields = function () {
  const select = document.getElementById("hiveSizeSelect");
  const fields = document.getElementById("customSizeFields");
  fields.style.display = select.value === "custom" ? "block" : "none";
};


// Confirm creation
App.Modals.confirmCreateHive = function () {
if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}

  const size = document.getElementById("hiveSizeSelect").value;
  const name = document.getElementById("hiveNameInput").value.trim() || "Hive";

  // Duplicate check
const activeNames = App.Canvas.getAllHives()
  .filter(h => h.hiveData.status !== "archived")
  .map(h => h.hiveData.name);

if (activeNames.includes(name)) {
App.UI.showToast(`Hive name "${name}" already exists.`);
    return;
  }

  let width, height;

  if (size === "custom") {
    width = parseInt(document.getElementById("hiveWidthInput").value) || 40;
    height = parseInt(document.getElementById("hiveHeightInput").value) || 40;
  } else {
    [width, height] = size.split("x").map(Number);
  }

  // ⭐ NEW: read entrance selection
  const entrance = document.getElementById("hiveEntranceInput").value;

  // ⭐ Pass entrance into createHive
  App.Canvas.createHive(name, width, height, entrance);

  App.Modals.closeHiveSizeModal();
};

App.Modals.renderInspectionList = function (title, includeFn) {

  const modal = document.getElementById("hiveListModal");
  const overlay = document.getElementById("overlay");
  const tbody = document.getElementById("hiveListBody");

  modal.style.display = "block";
  overlay.style.display = "block";

  document.getElementById("hiveListTitle").textContent = title;

  // Hide old filter bar if still present
  const filterBar = document.getElementById("dueInspectionFilters");
  if (filterBar) filterBar.style.display = "none";

  tbody.innerHTML = "";

  const apiaryNames = Storage.getAllApiaries() || [];
  const originalApiary = Storage.getCurrentApiary();

  window.HiveObjectMap = window.HiveObjectMap || {};

  let dueHives = [];

  const today = new Date().toISOString().slice(0, 10);

  // ------------------------------------------------------------
  // LOAD ALL APIARIES + COLLECT MATCHING HIVES
  // ------------------------------------------------------------
  apiaryNames.forEach(apiaryName => {

    Storage.saveCurrentApiary(apiaryName);
    App.Canvas.loadLayout();

    const hives = App.Canvas.getAllHives();

    hives.forEach(h => {
      const data = App.Canvas.getHiveData(h);
      if (!data) return

      // Only include hives matching the filter condition
      if (!includeFn(data, today)) return;

      // Determine due colour class
      let dueClass = "";
      if (data.nextInspectionDate < today) {
        dueClass = "due-overdue";
      } else if (data.nextInspectionDate === today) {
        dueClass = "due-today";
      } else {
        dueClass = "due-future";
      }

      if (!h.__uid) h.__uid = crypto.randomUUID();
      HiveObjectMap[h.__uid] = h;

      dueHives.push({
        apiaryName,
        hiveObj: h,
        data,
        dueClass
      });
    });
  });

  // Restore original apiary
  Storage.saveCurrentApiary(originalApiary);
  App.Canvas.loadLayout();

  if (dueHives.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6">None found.</td>`;
    tbody.appendChild(row);
    return;
  }

  // Sort by apiary, then due date, then hive number
  dueHives.sort((a, b) => {
    if (a.apiaryName < b.apiaryName) return -1;
    if (a.apiaryName > b.apiaryName) return 1;

    if (a.data.nextInspectionDate < b.data.nextInspectionDate) return -1;
    if (a.data.nextInspectionDate > b.data.nextInspectionDate) return 1;

    return Number(a.data.name) - Number(b.data.name);
  });

  // ------------------------------------------------------------
  // BUILD COLLAPSIBLE GROUPED TABLE
  // ------------------------------------------------------------
  let currentGroup = null;
  let groupIndex = 0;

  dueHives.forEach(({ apiaryName, hiveObj, data, dueClass }) => {

    if (apiaryName !== currentGroup) {
      currentGroup = apiaryName;
      groupIndex++;

      const headerRow = document.createElement("tr");
      headerRow.classList.add("apiary-group-row");
      headerRow.setAttribute("data-group", groupIndex);
      headerRow.innerHTML = `
        <td colspan="6" class="apiary-group-header">
          <span class="apiary-toggle" data-group="${groupIndex}">▼</span>
          <span class="apiary-group-click" data-group="${groupIndex}">${apiaryName}</span>
        </td>
      `;
      tbody.appendChild(headerRow);
    }

    const name = data.name || "—";
    const hiveType = data.hiveType || "—";
    const memo = data.memo || "—";

    const inspections = data.inspections || [];
    const lastEntry = inspections.length > 0
      ? inspections[inspections.length - 1]
      : null;

    const queenStatus = lastEntry
      ? (lastEntry.queenStatus || "—")
      : "—";

    const lastDate = lastEntry && lastEntry.date
      ? App.Utils.formatDateUK(lastEntry.date)
      : "—";

    const nextDue = data.nextInspectionDate
      ? App.Utils.formatDateUK(data.nextInspectionDate)
      : "—";

    const badgeColor = App.Status.getColor(queenStatus);

    const row = document.createElement("tr");
    row.classList.add("apiary-group-item");
    row.setAttribute("data-group", groupIndex);
    row.style.display = ""; // expanded by default

    row.innerHTML = `
      <td>${name}</td>
      <td>
        <span class="status-badge" style="background:${badgeColor}">
          ${queenStatus}
        </span>
      </td>
      <td class="col-date">${lastDate}</td>
      <td class="col-date ${dueClass}">${nextDue}</td>
      <td>${hiveType}</td>
      <td>${memo}</td>
      <td class="col-action">
        <button class="btn-primary edit-hive-btn"
                data-ref="${hiveObj.__uid}"
                data-apiary="${apiaryName}">
          View
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });

  // ------------------------------------------------------------
  // COLLAPSE / EXPAND GROUPS
  // ------------------------------------------------------------
  const toggleGroup = function (group) {
    const toggle = tbody.querySelector(`.apiary-toggle[data-group="${group}"]`);
    const rows = tbody.querySelectorAll(`tr[data-group="${group}"].apiary-group-item`);

    const isOpen = toggle.textContent === "▼";
    toggle.textContent = isOpen ? "►" : "▼";

    rows.forEach(r => {
      r.style.display = isOpen ? "none" : "";
    });
  };

  tbody.querySelectorAll(".apiary-toggle").forEach(toggle => {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleGroup(this.getAttribute("data-group"));
    });
  });

  tbody.querySelectorAll(".apiary-group-click").forEach(header => {
    header.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleGroup(this.getAttribute("data-group"));
    });
  });

  tbody.querySelectorAll(".apiary-group-row").forEach(row => {
    row.addEventListener("click", function () {
      const group = this.getAttribute("data-group");
      toggleGroup(group);
    });
  });

  // ------------------------------------------------------------
  // EDIT BUTTONS
  // ------------------------------------------------------------
tbody.querySelectorAll(".edit-hive-btn").forEach(btn => {
  btn.addEventListener("click", function () {

    const uid = this.getAttribute("data-ref");
    const apiaryName = this.getAttribute("data-apiary");

    Storage.saveCurrentApiary(apiaryName);
    App.Canvas.loadLayout();

    const hiveObj = HiveObjectMap[uid];

    if (hiveObj) {
      selectedHive = hiveObj;
      selectedHive.__apiaryName = apiaryName;   // ⭐ remember which apiary this hive belongs to
      App.Modals.openHiveModal(hiveObj);
    }

    Storage.saveCurrentApiary(originalApiary);
    App.Canvas.loadLayout();
  });
});

};

// ===============================
//  SPECIALISED INSPECTION LISTS
// ===============================
App.Modals.openTodayInspections = function () {
  App.Modals.renderInspectionList("Inspections Due Today", (data, today) =>
    data.nextInspectionDate && data.nextInspectionDate === today
  );
};

App.Modals.openOverdueInspections = function () {
  App.Modals.renderInspectionList("Overdue Inspections", (data, today) =>
    data.nextInspectionDate && data.nextInspectionDate < today
  );
};

App.Modals.openFutureInspections = function () {
  App.Modals.renderInspectionList("Future Inspections", (data, today) =>
    data.nextInspectionDate && data.nextInspectionDate > today
  );
};

// ------------------------------------------------------------
// Open the Inspections Due modal
// ------------------------------------------------------------
App.Modals.openDueInspectionsModal = function () {
  document.getElementById("archiveBtns").style.display = "none";
  document.getElementById("overallArchiveBtns").style.display = "none";
  document.getElementById("dueInspectionBtns").style.display = "block";
  App.Modals.renderInspectionList("Inspections Due", (data, today) =>
    !!data.nextInspectionDate
  );
};

App.Modals.openArchivedHivesModal = function () {
  App.Modals.renderInspectionList("Archived Hives", (data, today) =>
    data.status === "archived"
  );
};

// ------------------------------------------------------------
// Close the Inspections Due modal
// ------------------------------------------------------------
App.Modals.closeDueInspections = function () {
  
  document.getElementById("dueInspectionsModal").style.display = "none";
document.getElementById("overlay").style.display = "none";

};
/*
App.Modals.openArchivedHives = function () {
  const list = document.getElementById("archivedHivesList");
  list.innerHTML = "";

  const archived = canvas.getObjects().filter(o =>
    o.hiveData && o.hiveData.status === "archived"
  );

  if (archived.length === 0) {
    list.innerHTML = "<li>No archived hives.</li>";
  } else {
    archived.forEach(obj => {
      const li = document.createElement("li");
      li.style.marginBottom = "6px";

li.innerHTML = `
  ${obj.hiveData.name}
  <button class="btn-save viewArchivedBtn">View</button>
  <button class="btn-primary restoreArchivedBtn">Restore</button>
`;


      li.querySelector(".restoreArchivedBtn").onclick = () => {
        
        obj.hiveData.status = "active";
        obj.visible = true;
        obj.on("mousedblclick", () => App.Modals.openHiveModal(obj));
        App.Canvas.saveLayout();
        App.Canvas.requestRender();
        App.Modals.openArchivedHives(); // refresh list
        App.Modals.closeArchivedHives();
      };
li.querySelector(".viewArchivedBtn").onclick = () => {
  App.Modals.closeArchivedHives();
  selectedHive = obj;
  App.Modals.openHiveModal(obj);
};

      list.appendChild(li);
    });
  }

  document.getElementById("overlay").style.display = "block";
  document.getElementById("archivedHivesModal").style.display = "block";
};
*/
App.Modals.closeArchivedHives = function () {
  document.getElementById("archivedHivesModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
};


App.Modals.openInspectionDetails = function (inspectionIndex) {
  const hive = selectedHive;
  if (!hive || !hive.hiveData || !hive.hiveData.inspections) return;

  const inspection = hive.hiveData.inspections[inspectionIndex];
  if (!inspection) return;

  App.Modals.currentInspectionIndex = inspectionIndex;

  // ------------------------------------------------------------
  // Populate core editable fields (DATE + TIME)
  // ------------------------------------------------------------

  // Date (YYYY-MM-DD)
  document.getElementById("inspectionDetailsDateInput").value =
    inspection.date || "";

  // Time (HH:MM)
  document.getElementById("inspectionDetailsTimeInput").value =
    inspection.time || "";

  // Recorded-at (read-only display)
  const recordedDisplay = document.getElementById("inspectionDetailsRecordedAt");
  if (recordedDisplay) {
    recordedDisplay.textContent = inspection.recordedAt
      ? `${App.Utils.formatDateUK(inspection.recordedAt)} ${App.Utils.formatTime(inspection.recordedAt)}`
      : "Unknown";
  }

  // Queen status dropdown
  const queenSelect = document.getElementById("inspectionDetailsQueenStatusInput");
  queenSelect.innerHTML = "";

  const statuses = Storage.getQueenStatuses();
  statuses.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.name;
    opt.textContent = s.name;
    queenSelect.appendChild(opt);
  });

  queenSelect.value = inspection.queenStatus || "";

  document.getElementById("inspectionDetailsNextInspectionInput").value =
    hive.hiveData.nextInspectionDate || "";

  document.getElementById("inspectionDetailsNotesInput").value =
    inspection.notes || "";

  // ------------------------------------------------------------
  // Render extended inspection fields
  // ------------------------------------------------------------
  const fieldsContainer = document.getElementById("inspectionDetailsFields");
  fieldsContainer.innerHTML = "";

  App.Modals.inspectionDetailFields = [];

  const groups = [...App.Modals.inspectionSchema.groups].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  groups.forEach(group => {
    const groupWrapper = document.createElement("div");
    groupWrapper.className = "modal-section";

    const groupTitle = document.createElement("h3");
    groupTitle.textContent = group.name;
    groupWrapper.appendChild(groupTitle);

    const grid = document.createElement("div");
    grid.className = "inspection-details-grid";

    const fields = [...group.fields].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );

    fields.forEach(field => {
      const wrapper = document.createElement("div");
      wrapper.className = "inspection-field";

      const label = document.createElement("label");
      label.textContent = field.label;
      label.setAttribute("for", "detail_" + field.id);

      let input;

      if (field.type === "textarea") {
        input = document.createElement("textarea");
      } else if (field.type === "checkbox") {
        input = document.createElement("input");
        input.type = "checkbox";
      } else {
        input = document.createElement("input");
        input.type = field.type;
      }

      input.id = "detail_" + field.id;
      input.dataset.key = field.id;
      input.placeholder = field.placeholder || "";

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      grid.appendChild(wrapper);

      App.Modals.inspectionDetailFields.push({
        key: field.id,
        type: field.type
      });
    });

    groupWrapper.appendChild(grid);
    fieldsContainer.appendChild(groupWrapper);
  });

  // Load extended fields
  App.Modals.inspectionSchema.groups.forEach(group => {
    group.fields.forEach(field => {
      const input = document.getElementById("detail_" + field.id);
      if (!input) return;

      const value = inspection[field.id];

      if (field.type === "checkbox") {
        input.checked = !!value;
      } else {
        input.value = value || "";
      }
    });
  });

  const saveBtn = document.getElementById("inspectionDetailsSaveBtn");
  if (saveBtn) {
    saveBtn.onclick = function () {
      App.Modals.saveInspectionDetails();
    };
  }

  document.getElementById("overlay").style.display = "block";
  document.getElementById("inspectionDetailsModal").style.display = "block";
};

App.Modals.saveInspectionDetails = function () {
  if (!selectedHive || App.Modals.currentInspectionIndex == null) return;

  const hiveData = selectedHive.hiveData;
  const inspection = hiveData.inspections[App.Modals.currentInspectionIndex];
  if (!inspection) return;

  // ⭐ Save date + time separately
  inspection.date =
    document.getElementById("inspectionDetailsDateInput").value || "";

  inspection.time =
    document.getElementById("inspectionDetailsTimeInput").value || "";

  // ⭐ recordedAt stays unchanged (set only when created)

  inspection.queenStatus =
    document.getElementById("inspectionDetailsQueenStatusInput").value || "";

  hiveData.nextInspectionDate =
    document.getElementById("inspectionDetailsNextInspectionInput").value || "";

  inspection.notes =
    document.getElementById("inspectionDetailsNotesInput").value.trim();

  // Extended fields
  App.Modals.inspectionDetailFields.forEach(field => {
    const input = document.getElementById("detail_" + field.key);
    if (!input) return;

    if (field.type === "checkbox") {
      inspection[field.key] = input.checked;
    } else {
      inspection[field.key] = input.value.trim();
    }
  });

  // Update hive colour
  const latest = hiveData.inspections[hiveData.inspections.length - 1] || {};
  const color = App.Status.getColor(latest.queenStatus || "");
  selectedHive._objects[0].set("fill", color);

  App.Canvas.saveLayout();
  App.Canvas.requestRender();
  App.Canvas.saveLayout();

  App.Modals.closeInspectionDetails();

  const editHiveModal = document.getElementById("editHiveModal");
  if (editHiveModal && editHiveModal.style.display === "block") {
    App.Modals.closeEditHiveModal();
  }

  App.Modals.openHiveModal(selectedHive);
};

App.Modals.closeInspectionDetails = function () {
  document.getElementById("inspectionDetailsModal").style.display = "none";
  const anyOpen = [...document.querySelectorAll('.modal')]
  .some(m => m.style.display === "block");
  document.getElementById("overlay").style.display = anyOpen ? "block" : "none";
};

// Inspection Field Config Modal
App.Modals.openInspectionFieldConfig = function () {
  // Create a deep clone so edits don’t affect the live schema
  App.Modals.inspectionSchemaWorking = JSON.parse(JSON.stringify(App.Modals.inspectionSchema));

  document.getElementById("overlay").style.display = "block";
  document.getElementById("inspectionFieldConfigModal").style.display = "block";

  App.Modals.renderInspectionFieldConfig();
};


App.Modals.closeInspectionFieldConfig = function () {
  document.getElementById("inspectionFieldConfigModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
};

App.Modals.moveInspectionGroup = function (index, direction) {
  if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}
  const schema = App.Modals.inspectionSchemaWorking;
  const groups = schema.groups;

  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= groups.length) return;

  const temp = groups[index];
  groups[index] = groups[newIndex];
  groups[newIndex] = temp;

  // Reassign sortOrder
  groups.forEach((g, i) => g.sortOrder = i + 1);

  App.Modals.renderInspectionGroups();
};

App.Modals.deleteInspectionGroup = function (index) {
  if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}
  const schema = App.Modals.inspectionSchemaWorking;

  if (!confirm("Delete this group?")) return;

  schema.groups.splice(index, 1);

  // Reassign sortOrder
  schema.groups.forEach((g, i) => g.sortOrder = i + 1);

  App.Modals.renderInspectionGroups();
};

App.Modals.addInspectionField = function (groupIndex) {
  if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}
  const schema = App.Modals.inspectionSchemaWorking;
  const group = schema.groups[groupIndex];

let name = prompt("Field name:");
if (!name || !name.trim()) name = "New Field";


  const type = prompt("Field type (text, number, checkbox, select):", "text");
  if (!type) return;

  const newField = {
    id: "field_" + Date.now(), 
    label: name.trim(), 
    type: type.trim(),
    sortOrder: group.fields.length + 1
  };

  group.fields.push(newField);

  App.Modals.renderInspectionGroups();
};



App.Modals.renameInspectionGroup = function (index) {
  if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}
  const schema = App.Modals.inspectionSchemaWorking;
  const group = schema.groups[index];

  const newName = prompt("Rename group:", group.name);
  if (!newName) return;

  group.name = newName.trim();
  App.Modals.renderInspectionGroups();
};


App.Modals.renderInspectionGroups = function () {
  const section = document.getElementById("inspectionConfigGroups");
  if (!section) return;

  const schema = App.Modals.inspectionSchemaWorking;
  section.innerHTML = "";

  schema.groups
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .forEach((group, index) => {

      const groupDiv = document.createElement("div");
      groupDiv.className = "inspection-config-group";

      // Collapsible state (default: open)
      if (group._collapsed === undefined) group._collapsed = false;

      // Header
      const header = document.createElement("div");
      header.className = "group-header";

      header.innerHTML = `
        <button class="collapse-btn">${group._collapsed ? "▶" : "▼"}</button>
        <strong>${group.name}</strong>
      `;

      // Collapse toggle
      header.querySelector(".collapse-btn").onclick = () => {
        group._collapsed = !group._collapsed;
        App.Modals.renderInspectionGroups();
      };

      // Controls container
      const controls = document.createElement("div");
      controls.className = "group-controls";

      // Rename
      const renameBtn = document.createElement("button");
      renameBtn.textContent = "Rename";
      renameBtn.onclick = () => App.Modals.renameInspectionGroup(index);
      controls.appendChild(renameBtn);

      // Move Up
      const upBtn = document.createElement("button");
      upBtn.textContent = "Up";
      upBtn.disabled = index === 0;
      upBtn.onclick = () => App.Modals.moveInspectionGroup(index, -1);
      controls.appendChild(upBtn);

      // Move Down
      const downBtn = document.createElement("button");
      downBtn.textContent = "Down";
      downBtn.disabled = index === schema.groups.length - 1;
      downBtn.onclick = () => App.Modals.moveInspectionGroup(index, 1);
      controls.appendChild(downBtn);

      // Delete
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => App.Modals.deleteInspectionGroup(index);
      controls.appendChild(deleteBtn);

      header.appendChild(controls);
      groupDiv.appendChild(header);

      // Fields section (collapsible)
      if (!group._collapsed) {

        const fieldsDiv = document.createElement("div");
        fieldsDiv.className = "group-fields";

        // REAL FIELD LIST
        group.fields
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .forEach((field, fieldIndex) => {

            const fieldRow = document.createElement("div");
            fieldRow.className = "field-row";

            fieldRow.innerHTML = `
              <span class="field-name">${field.label || "(unnamed)"}</span>
              <span class="field-type">${field.type}</span>
            `;

            // Field controls
            const fieldControls = document.createElement("div");
            fieldControls.className = "field-controls";

            // Rename field
            const renameFieldBtn = document.createElement("button");
            renameFieldBtn.textContent = "Rename";
            renameFieldBtn.onclick = () =>
              App.Modals.renameInspectionField(index, fieldIndex);
            fieldControls.appendChild(renameFieldBtn);

            // Change type
            const typeBtn = document.createElement("button");
            typeBtn.textContent = "Type";
            typeBtn.onclick = () =>
              App.Modals.changeInspectionFieldType(index, fieldIndex);
            fieldControls.appendChild(typeBtn);

            // Move Up
            const fieldUpBtn = document.createElement("button");
            fieldUpBtn.textContent = "Up";
            fieldUpBtn.disabled = fieldIndex === 0;
            fieldUpBtn.onclick = () =>
              App.Modals.moveInspectionField(index, fieldIndex, -1);
            fieldControls.appendChild(fieldUpBtn);

            // Move Down
            const fieldDownBtn = document.createElement("button");
            fieldDownBtn.textContent = "Down";
            fieldDownBtn.disabled = fieldIndex === group.fields.length - 1;
            fieldDownBtn.onclick = () =>
              App.Modals.moveInspectionField(index, fieldIndex, 1);
            fieldControls.appendChild(fieldDownBtn);

            // Delete field
            const deleteFieldBtn = document.createElement("button");
            deleteFieldBtn.textContent = "Delete";
            deleteFieldBtn.onclick = () =>
              App.Modals.deleteInspectionField(index, fieldIndex);
            fieldControls.appendChild(deleteFieldBtn);

            fieldRow.appendChild(fieldControls);
            fieldsDiv.appendChild(fieldRow);
          });

        groupDiv.appendChild(fieldsDiv);

        // Add Field button
        const addFieldBtn = document.createElement("button");
        addFieldBtn.textContent = "Add Field";
        addFieldBtn.className = "btn-info";
        addFieldBtn.style.marginTop = "8px";
        addFieldBtn.onclick = () => App.Modals.addInspectionField(index);
        groupDiv.appendChild(addFieldBtn);
      }

      section.appendChild(groupDiv);
    });
};

App.Modals.renameInspectionField = function (groupIndex, fieldIndex) {
  if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}
  const schema = App.Modals.inspectionSchemaWorking;
  const field = schema.groups[groupIndex].fields[fieldIndex];

  const newName = prompt("Rename field:", field.name);
  if (!newName) return;

  field.label = newName.trim();
  App.Modals.renderInspectionGroups();
};

App.Modals.changeInspectionFieldType = function (groupIndex, fieldIndex) {
  if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}
  const schema = App.Modals.inspectionSchemaWorking;
  const field = schema.groups[groupIndex].fields[fieldIndex];

  const newType = prompt(
    "Enter new field type (text, number, checkbox, select):",
    field.type
  );

  if (!newType) return;

  field.type = newType.trim();
  App.Modals.renderInspectionGroups();
};

App.Modals.moveInspectionField = function (groupIndex, fieldIndex, direction) {
  if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}
  const schema = App.Modals.inspectionSchemaWorking;
  const fields = schema.groups[groupIndex].fields;

  const newIndex = fieldIndex + direction;
  if (newIndex < 0 || newIndex >= fields.length) return;

  const temp = fields[fieldIndex];
  fields[fieldIndex] = fields[newIndex];
  fields[newIndex] = temp;

  fields.forEach((f, i) => f.sortOrder = i + 1);

  App.Modals.renderInspectionGroups();
};

App.Modals.deleteInspectionField = function (groupIndex, fieldIndex) {
  if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}
  const schema = App.Modals.inspectionSchemaWorking;

  if (!confirm("Delete this field?")) return;

  schema.groups[groupIndex].fields.splice(fieldIndex, 1);

  schema.groups[groupIndex].fields.forEach((f, i) => f.sortOrder = i + 1);

  App.Modals.renderInspectionGroups();
};


App.Modals.addInspectionGroup = function () {
  if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}
const schema = App.Modals.inspectionSchemaWorking;

  const newGroup = {
    id: "group_" + Date.now(),
    name: "New Group",
    sortOrder: schema.groups.length + 1,
    fields: []
  };

  schema.groups.push(newGroup);

  App.Modals.renderInspectionGroups();
};

App.Modals.renderInspectionFieldConfig = function () {
  const container = document.getElementById("inspectionFieldConfigBody");
  if (!container) return;

const schema = App.Modals.inspectionSchemaWorking;
  if (!schema || !schema.groups) {
    container.innerHTML = "<p>Error: Schema not loaded.</p>";
    return;
  }

  // Clear existing content
  container.innerHTML = "";

  // Create wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "inspection-config-wrapper";

  // Add groups section
  const groupsSection = document.createElement("div");
  groupsSection.id = "inspectionConfigGroups";
  wrapper.appendChild(groupsSection);

  // Add "Add Group" button
  const addGroupBtn = document.createElement("button");
  addGroupBtn.textContent = "Add Group";
  addGroupBtn.className = "btn-primary";
  addGroupBtn.style.marginBottom = "8px";
  addGroupBtn.onclick = () => App.Modals.addInspectionGroup();
  wrapper.appendChild(addGroupBtn);

  container.appendChild(wrapper);

  // Render groups
  App.Modals.renderInspectionGroups();
};

App.Modals.saveInspectionFieldConfig = function () {
  if (editingDisabled()) {
    App.UI.showToast("Editing is disabled because your subscription has expired.");
    return;
  }
  // Commit working copy to live schema
  App.Modals.inspectionSchema = App.Modals.inspectionSchemaWorking;

  // Persist to storage
  Storage.saveInspectionSchema(App.Modals.inspectionSchema);

  // Close modal
  App.Modals.closeInspectionFieldConfig();
};

App.Modals.openHiveListModal = function () {
  App.Modals.resetHiveListHeader();
  document.getElementById("archiveBtns").style.display = "block";
  document.getElementById("dueInspectionBtns").style.display = "none";

  // Show modal + overlay
  document.getElementById("hiveListModal").style.display = "block";
  document.getElementById("overlay").style.display = "block";

  // Title
  const apiaryName = Storage.getCurrentApiary() || "Unknown Apiary";
  document.getElementById("hiveListTitle").textContent = `Apiary: ${apiaryName}`;

  const tbody = document.getElementById("hiveListBody");
  tbody.innerHTML = "";

  const apiaryId = Storage.getCurrentApiary();
  if (!apiaryId) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6">No apiary selected.</td>`;
    tbody.appendChild(row);
    return;
  }

  // Get all Fabric.js hive objects (not raw data)
  let hives = App.Canvas.getAllHives().filter(h => {
    const data = App.Canvas.getHiveData(h);
    return data && data.status !== "archived";
  });

  if (hives.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6">No hives in this apiary.</td>`;
    tbody.appendChild(row);
    return;
  }

  // Sort numerically by hive name
  hives.sort((a, b) =>
    Number(App.Canvas.getHiveData(a).name) -
    Number(App.Canvas.getHiveData(b).name)
  );

  // Ensure global map exists
  window.HiveObjectMap = window.HiveObjectMap || {};

  // Build rows
  hives.forEach(hiveObj => {
    const data = App.Canvas.getHiveData(hiveObj);
    if (!data) return;

    // Ensure stable UID on the actual Fabric.js object
    if (!hiveObj.__uid) hiveObj.__uid = crypto.randomUUID();

    // Store the exact Fabric.js instance
    HiveObjectMap[hiveObj.__uid] = hiveObj;

    const name = data.name || "—";
    const hiveType = data.hiveType || "—";
    const memo = data.memo || "—";

    // ⭐ NEW: use hiveData.queenStatus with fallback
    const queenStatus = (data.queenStatus === undefined || data.queenStatus === null)
      ? ""
      : data.queenStatus;

    const inspections = data.inspections || [];
    const lastEntry = inspections.length > 0
      ? inspections[inspections.length - 1]
      : null;

    const lastDate = lastEntry && lastEntry.date
      ? App.Utils.formatDateUK(lastEntry.date)
      : "—";

    const nextDue = data.nextInspectionDate
      ? App.Utils.formatDateUK(data.nextInspectionDate)
      : "—";

    const badgeColor = App.Status.getColor(queenStatus);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${name}</td>
      <td>
        <span class="status-badge" style="background:${badgeColor}">
          ${queenStatus || "—"}
        </span>
      </td>
      <td class="col-date">${lastDate}</td>
      <td class="col-date">${nextDue}</td>
      <td>${hiveType}</td>
      <td>${memo}</td>
      <td class="col-action">
        <button class="btn-primary edit-hive-btn" data-ref="${hiveObj.__uid}">
          View
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });

  // Wire up Edit buttons (using exact Fabric.js instance)
  tbody.querySelectorAll(".edit-hive-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const uid = this.getAttribute("data-ref");
      const hiveObj = HiveObjectMap[uid];

      if (hiveObj) {
        selectedHive = hiveObj;
        App.Modals.openHiveModal(hiveObj);
      }
    });
  });
};

App.Modals.closeHiveListModal = function () {
  document.getElementById("hiveListModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
};

App.Modals.resetHiveListHeader = function () {
  document.getElementById("archiveBtns").style.display = "none";
  document.getElementById("overallArchiveBtns").style.display = "none";
  document.getElementById("dueInspectionBtns").style.display = "none";
};


App.Modals.openOverallHiveListModal = function () {
  App.Modals.resetHiveListHeader();
  document.getElementById("dueInspectionBtns").style.display = "none";
  document.getElementById("archiveBtns").style.display = "none";
  document.getElementById("overallArchiveBtns").style.display = "block";

  const modal = document.getElementById("hiveListModal");
  const overlay = document.getElementById("overlay");
  const tbody = document.getElementById("hiveListBody");

  modal.style.display = "block";
  overlay.style.display = "block";

  document.getElementById("hiveListTitle").textContent = "All Apiaries";

  tbody.innerHTML = "";

  const apiaryNames = Storage.getAllApiaries() || [];
  const originalApiary = Storage.getCurrentApiary();

  let allHives = [];

  // Ensure global map exists
  window.HiveObjectMap = window.HiveObjectMap || {};

  // ------------------------------------------------------------
  // LOAD ALL APIARIES + COLLECT HIVE DATA
  // ------------------------------------------------------------
  apiaryNames.forEach(apiaryName => {

    Storage.saveCurrentApiary(apiaryName);
    App.Canvas.loadLayout();

    const hives = App.Canvas.getAllHives();

    hives.forEach(h => {
      const data = App.Canvas.getHiveData(h);
      if (data && data.status !== "archived") {

        // ⭐ Give each hive a stable unique ID
        if (!h.__uid) h.__uid = crypto.randomUUID();

        // ⭐ Store the exact Fabric.js object instance
        HiveObjectMap[h.__uid] = h;

        allHives.push({
          apiaryName,
          hiveObj: h,
          data
        });
      }
    });
  });

  // Restore original apiary
  Storage.saveCurrentApiary(originalApiary);
  App.Canvas.loadLayout();

  if (allHives.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6">No hives found.</td>`;
    tbody.appendChild(row);
    return;
  }

  // Sort by apiary, then hive number
  allHives.sort((a, b) => {
    if (a.apiaryName < b.apiaryName) return -1;
    if (a.apiaryName > b.apiaryName) return 1;
    return Number(a.data.name) - Number(b.data.name);
  });

  // ------------------------------------------------------------
  // BUILD COLLAPSIBLE GROUPED TABLE
  // ------------------------------------------------------------
  let currentGroup = null;
  let groupIndex = 0;

  allHives.forEach(({ apiaryName, hiveObj, data }) => {

    // Insert group header when apiary changes
    if (apiaryName !== currentGroup) {
      currentGroup = apiaryName;
      groupIndex++;

      const headerRow = document.createElement("tr");
      headerRow.classList.add("apiary-group-row");
      headerRow.setAttribute("data-group", groupIndex);
      headerRow.innerHTML = `
        <td colspan="6" class="apiary-group-header">
          <span class="apiary-toggle" data-group="${groupIndex}">▼</span>
          <span class="apiary-group-click" data-group="${groupIndex}">${apiaryName}</span>
        </td>
      `;

      tbody.appendChild(headerRow);
    }

    const name = data.name || "—";
    const hiveType = data.hiveType || "—";
    const memo = data.memo || "—";

    // ⭐ NEW: use hiveData.queenStatus with fallback
    const queenStatus = (data.queenStatus === undefined || data.queenStatus === null)
      ? ""
      : data.queenStatus;

    const inspections = data.inspections || [];
    const lastEntry = inspections.length > 0
      ? inspections[inspections.length - 1]
      : null;

    const lastDate = lastEntry && lastEntry.date
      ? App.Utils.formatDateUK(lastEntry.date)
      : "—";

    const nextDue = data.nextInspectionDate
      ? App.Utils.formatDateUK(data.nextInspectionDate)
      : "—";

    const badgeColor = App.Status.getColor(queenStatus);

    const row = document.createElement("tr");
    row.classList.add("apiary-group-item");
    row.setAttribute("data-group", groupIndex);

    row.style.display = "";

    row.innerHTML = `
      <td>${name}</td>
      <td>
        <span class="status-badge" style="background:${badgeColor}">
          ${queenStatus || "—"}
        </span>
      </td>
      <td class="col-date">${lastDate}</td>
      <td class="col-date">${nextDue}</td>
      <td>${hiveType}</td>
      <td>${memo}</td>
      <td class="col-action">
        <button class="btn-primary edit-hive-btn" 
                data-ref="${hiveObj.__uid}"
                data-apiary="${apiaryName}">
          View
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });

  // ------------------------------------------------------------
  // COLLAPSE / EXPAND GROUPS
  // ------------------------------------------------------------
  const toggleGroup = function (group) {
    const toggle = tbody.querySelector(`.apiary-toggle[data-group="${group}"]`);
    const rows = tbody.querySelectorAll(`tr[data-group="${group}"].apiary-group-item`);

    const isOpen = toggle.textContent === "▼";
    toggle.textContent = isOpen ? "►" : "▼";

    rows.forEach(r => {
      r.style.display = isOpen ? "none" : "";
    });
  };

  tbody.querySelectorAll(".apiary-toggle").forEach(toggle => {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleGroup(this.getAttribute("data-group"));
    });
  });

  tbody.querySelectorAll(".apiary-group-click").forEach(header => {
    header.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleGroup(this.getAttribute("data-group"));
    });
  });

  tbody.querySelectorAll(".apiary-group-row").forEach(row => {
    row.addEventListener("click", function () {
      const group = this.getAttribute("data-group");
      toggleGroup(group);
    });
  });

  // ------------------------------------------------------------
  // EDIT BUTTONS (using exact hive instance)
  // ------------------------------------------------------------
  tbody.querySelectorAll(".edit-hive-btn").forEach(btn => {
    btn.addEventListener("click", function () {

      const uid = this.getAttribute("data-ref");
      const apiaryName = this.getAttribute("data-apiary");

      // Switch to correct apiary
      Storage.saveCurrentApiary(apiaryName);
      App.Canvas.loadLayout();

      const hiveObj = HiveObjectMap[uid];

      if (hiveObj) {
        selectedHive = hiveObj;
        App.Modals.openHiveModal(hiveObj);
      }

      // Restore original apiary
      Storage.saveCurrentApiary(originalApiary);
      App.Canvas.loadLayout();
    });
  });
};

App.Modals.closeOverallHiveListModal = function () {
  document.getElementById("hiveListModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
};

// ------------------------------------------------------------
// Exit Modal
// ------------------------------------------------------------
App.Modals.openExitModal = function () {
  document.getElementById("exitModal").classList.remove("hidden");
  document.getElementById("overlay").style.display = "block";
};

App.Modals.closeExitModal = function () {
  document.getElementById("exitModal").classList.add("hidden");
  document.getElementById("overlay").style.display = "none";
};

App.Modals.exitApp = function () {
  window.location.href = "exit.html";
};

App.Modals.openInspectionInput = function (hiveObj) {

  App.Modals.currentHiveForInspection = hiveObj;

  // Title
  document.getElementById("inspectionInputTitle").textContent =
    `New Inspection — ${hiveObj.hiveData.name}`;

  // Default date = today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("inspectionInputDate").value = today;

  // Default time = current time (HH:MM)
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("inspectionInputTime").value = `${hh}:${mm}`;

  // Recorded-at timestamp (set on save, not here)
  document.getElementById("inspectionInputRecordedAt").textContent = "";

  // Queen status dropdown
  const queenSelect = document.getElementById("inspectionInputQueenStatus");
  queenSelect.innerHTML = "";

  Storage.getQueenStatuses().forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.name;
    opt.textContent = s.name;
    queenSelect.appendChild(opt);
  });

  // Default queen status = latest inspection
  const latest = hiveObj.hiveData.inspections?.slice(-1)[0];
  if (latest && latest.queenStatus) {
    queenSelect.value = latest.queenStatus;
  }

  // Build schema-driven fields
  const container = document.getElementById("inspectionInputFields");
  container.innerHTML = "";

  const groups = [...App.Modals.inspectionSchema.groups].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  groups.forEach(group => {
    const groupWrapper = document.createElement("div");
    groupWrapper.className = "modal-section";

    const groupTitle = document.createElement("h3");
    groupTitle.textContent = group.name;
    groupWrapper.appendChild(groupTitle);

    const grid = document.createElement("div");
    grid.className = "inspection-details-grid";

    const fields = [...group.fields].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );

    fields.forEach(field => {
      const wrapper = document.createElement("div");
      wrapper.className = "inspection-field";

      const label = document.createElement("label");
      label.textContent = field.label;
      label.setAttribute("for", "input_" + field.id);

      let input;

      if (field.type === "textarea") {
        input = document.createElement("textarea");
      } else if (field.type === "checkbox") {
        input = document.createElement("input");
        input.type = "checkbox";
      } else {
        input = document.createElement("input");
        input.type = field.type;
      }

      input.id = "input_" + field.id;
      input.dataset.key = field.id;
      input.placeholder = field.placeholder || "";

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      grid.appendChild(wrapper);
    });

    groupWrapper.appendChild(grid);
    container.appendChild(groupWrapper);
  });

  // Show modal
  document.getElementById("overlay").style.display = "block";
  document.getElementById("inspectionInputModal").style.display = "block";
};

App.Modals.saveInspectionInput = function () {
  if (editingDisabled()) {
  App.UI.showToast("Editing is disabled because your subscription has expired.");
  return;
}

  const hiveObj = App.Modals.currentHiveForInspection;
  if (!hiveObj) return;

  const hiveData = hiveObj.hiveData;

  const date = document.getElementById("inspectionInputDate").value;
  const time = document.getElementById("inspectionInputTime").value;

  // Timestamp of data entry (ISO)
  const recordedAt = new Date().toISOString();

  const queenStatus = document.getElementById("inspectionInputQueenStatus").value;
  const nextInspection = document.getElementById("inspectionInputNextInspection").value;
  const notes = document.getElementById("inspectionInputNotes").value.trim();

  const newInspection = {
    date,          // YYYY-MM-DD
    time,          // HH:MM
    recordedAt,    // ISO timestamp of data entry
    queenStatus,
    notes,
    nextInspection,
  };

  // Schema-driven fields
  App.Modals.inspectionSchema.groups.forEach(group => {
    group.fields.forEach(field => {
      const input = document.getElementById("input_" + field.id);
      if (!input) return;

      if (field.type === "checkbox") {
        newInspection[field.id] = input.checked;
      } else {
        newInspection[field.id] = input.value.trim();
      }
    });
  });

  // Push into hive
  hiveData.inspections = hiveData.inspections || [];
  hiveData.inspections.push(newInspection);
  hiveData.nextInspectionDate = nextInspection;

  // Update hive colour
  const latest = hiveData.inspections[hiveData.inspections.length - 1] || {};
  const color = App.Status.getColor(latest.queenStatus || "");
  hiveObj._objects[0].set("fill", color);

  // Save + update
  App.Canvas.requestRender();
  App.Canvas.saveLayout();

  // Refresh Edit Hive modal
  App.Modals.closeInspectionInput();
  App.Modals.openHiveModal(hiveObj);
};

App.Modals.closeInspectionInput = function () {
  document.getElementById("inspectionInputModal").style.display = "none";
    const anyOpen = [...document.querySelectorAll('.modal')]
  .some(m => m.style.display === "block");
  document.getElementById("overlay").style.display = anyOpen ? "block" : "none";
  };

App.Modals.openInspectionHistory = function (hiveGroup) {

  const data = hiveGroup.hiveData || {};
  const inspections = (data.inspections || [])
    .slice()
    .sort((a, b) => {
      // Sort by date + time combined
      const aDT = new Date(`${a.date}T${a.time || "00:00"}`);
      const bDT = new Date(`${b.date}T${b.time || "00:00"}`);
      return bDT - aDT;
    });

  // Title
  document.getElementById("inspectionHistoryTitle").textContent =
    `Inspection History — ${data.name || "Hive"} (${Storage.getCurrentApiary() || "Unknown Apiary"})`;

  const schema = App.Modals.inspectionSchema;

  const thead = document.querySelector("#inspectionHistoryTable thead");
  const tbody = document.querySelector("#inspectionHistoryTable tbody");

  // Build header
  let header = "<tr><th>Date</th><th>Time</th>";
  header += "<th>Status</th>";
  header += "<th>Notes</th>";

  schema.groups
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .forEach(group => {
      group.fields
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .forEach(field => {
          header += `<th>${field.label}</th>`;
        });
    });

  header += "</tr>";
  thead.innerHTML = header;

  // Build rows
  tbody.innerHTML = inspections.map(i => {

    const dateStr = i.date ? App.Utils.formatDateUK(i.date) : "";
    const timeStr = i.time || "";

    let row = `<tr><td>${dateStr}</td><td>${timeStr}</td>`;
    row += `<td>${i.queenStatus || ""}</td>`;
    row += `<td>${i.notes || ""}</td>`;

    schema.groups
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach(group => {
        group.fields
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .forEach(field => {
            row += `<td>${i[field.id] ?? ""}</td>`;
          });
      });

    row += "</tr>";
    return row;

  }).join("");

  // Wire close buttons
  const close1 = document.getElementById("closeInspectionHistoryBtn");
  const close2 = document.getElementById("closeInspectionHistoryBtn2");

const closeFn = App.Modals.closeInspectionHistory;

  if (close1) close1.onclick = closeFn;
  if (close2) close2.onclick = closeFn;

  // Show modal
  document.getElementById("overlay").style.display = "block";
  document.getElementById("inspectionHistoryModal").style.display = "block";
};

App.Modals.closeInspectionHistory = function () {
  document.getElementById("inspectionHistoryModal").style.display = "none";

  const anyOpen = [...document.querySelectorAll('.modal')]
    .some(m => window.getComputedStyle(m).display !== "none");

  document.getElementById("overlay").style.display = anyOpen ? "block" : "none";
};


App.Modals.openRenewModal = function () {
  const overlay = document.getElementById("overlay");
  const renew = document.getElementById("renewModal");

  // When a second modal opens, overlay must rise above the lower modal
  overlay.style.zIndex = "1100";   // between account (1000) and renew (1200)
  overlay.style.display = "block";

  renew.style.display = "block";
};

App.Modals.closeRenewModal = function () {
  const overlay = document.getElementById("overlay");
  const renew = document.getElementById("renewModal");

  renew.style.display = "none";

  // Check if any modal is still open
  const anyOpen = [...document.querySelectorAll('.modal')]
    .some(m => m.style.display === "block");

  if (anyOpen) {
    // Return overlay to its normal position (below the single open modal)
    overlay.style.zIndex = "900";
    overlay.style.display = "block";
  } else {
    // No modals open → hide overlay
    overlay.style.display = "none";
  }
};

// ------------------------------------------------------------
// Apiary Manager modal functions
// ------------------------------------------------------------
App.Modals.openApiaryManager = function (mode = "edit") {
  App.Modals.apiaryManagerMode = mode;

  if (mode === "create" && editingDisabled()) {
    App.UI.showToast("Editing is disabled because your subscription has expired.");
    return;
  }

  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("apiaryManagerModal");

  const titleEl = modal.querySelector("#apiaryManagerTitle");
  const deleteBtn = modal.querySelector("#apiaryManagerDeleteBtn");

  const nameInput = modal.querySelector("#apiaryNameInput");
  const gridInput = modal.querySelector("#apiaryGridInput");
  const addressInput = modal.querySelector("#apiaryAddressInput");
  const notesList = modal.querySelector("#apiaryNotesList");
  const dateInput = modal.querySelector("#newNoteDate");
  const textInput = modal.querySelector("#newNoteText");
  const addBtn = modal.querySelector("#addNoteBtn");

  nameInput.dataset.mode = mode;

  // ⭐ Correct clean-slate detection
  const currentApiary = Storage.getCurrentApiary();
  const hasApiary = !!currentApiary;

  // ⭐ If no apiary exists, force CREATE mode
  if (!hasApiary) {
    mode = "create";
  }

  if (mode === "create") {
    titleEl.textContent = "Create Apiary";
    deleteBtn.style.display = "none";

    nameInput.value = "";
    gridInput.value = "";
    addressInput.value = "";

    notesList.innerHTML = "";
    dateInput.value = new Date().toISOString().slice(0, 10);

  } else {
    // ⭐ EDIT MODE
    const apiaryName = currentApiary;

    titleEl.textContent = "Apiary Details: " + apiaryName;
    deleteBtn.style.display = "inline-block";

    nameInput.value = apiaryName || "";
    gridInput.value = Storage.getApiaryGrid(apiaryName);
    addressInput.value = Storage.getApiaryAddress(apiaryName);

    let notes = [];
    try {
      notes = JSON.parse(Storage.getApiaryNotes(apiaryName)) || [];
    } catch {
      notes = [];
    }

    notesList.innerHTML = "";
    notes.slice().reverse().forEach((n, i) => {
      const row = document.createElement("div");
      row.className = "note-row";
      row.innerHTML = `
        <span class="note-date">${App.Utils.formatDateUK(n.date)}</span>
        <span class="note-text">${n.text}</span>
        <button class="note-delete-btn" data-index="${notes.length - 1 - i}">×</button>
      `;
      notesList.appendChild(row);
    });

    dateInput.value = new Date().toISOString().slice(0, 10);
  }

  modal.style.display = "block";
  overlay.style.display = "block";

  // ⭐ Add note handler (unchanged)
  addBtn.onclick = function () {
    if (editingDisabled()) {
      App.UI.showToast("Editing is disabled because your subscription has expired.");
      return;
    }

    const date = dateInput.value.trim();
    const text = textInput.value.trim();
    const apiaryName = Storage.getCurrentApiary();

    if (!text) return;

    let notes = [];
    try {
      notes = JSON.parse(Storage.getApiaryNotes(apiaryName)) || [];
    } catch {
      notes = [];
    }

    notes.push({ text, date });
    Storage.saveApiaryNotes(apiaryName, JSON.stringify(notes));

    notesList.innerHTML = "";
    notes.slice().reverse().forEach((n, i) => {
      const row = document.createElement("div");
      row.className = "note-row";
      row.innerHTML = `
        <span class="note-date">${App.Utils.formatDateUK(n.date)}</span>
        <span class="note-text">${n.text}</span>
        <button class="note-delete-btn" data-index="${notes.length - 1 - i}">×</button>
      `;
      notesList.appendChild(row);
    });

    textInput.value = "";
  };

  // ⭐ Delete note handler (unchanged)
  notesList.onclick = function (e) {
    if (!e.target.classList.contains("note-delete-btn")) return;

    if (editingDisabled()) {
      App.UI.showToast("Editing is disabled because your subscription has expired.");
      return;
    }

    const apiaryName = Storage.getCurrentApiary();
    const index = parseInt(e.target.dataset.index, 10);

    let notes = [];
    try {
      notes = JSON.parse(Storage.getApiaryNotes(apiaryName)) || [];
    } catch {
      notes = [];
    }

    notes.splice(index, 1);
    Storage.saveApiaryNotes(apiaryName, JSON.stringify(notes));

    notesList.innerHTML = "";
    notes.slice().reverse().forEach((n, i) => {
      const row = document.createElement("div");
      row.className = "note-row";
      row.innerHTML = `
        <span class="note-date">${App.Utils.formatDateUK(n.date)}</span>
        <span class="note-text">${n.text}</span>
        <button class="note-delete-btn" data-index="${notes.length - 1 - i}">×</button>
      `;
      notesList.appendChild(row);
    });
  };
};

App.Modals.saveApiaryManager = function () {

  if (editingDisabled()) {
    App.UI.showToast("Editing is disabled because your subscription has expired.");
    return;
  }

  const nameInput = document.getElementById("apiaryNameInput");
  const newName = nameInput.value.trim();

  const mode = App.Modals.apiaryManagerMode;   // "create" or "edit"
  const oldName = (mode === "edit") ? Storage.getCurrentApiary() : null;

  if (!newName) {
    App.UI.showToast("Please enter a name for the apiary.");
    return;
  }

  let all = Storage.getAllApiaries();
  const isRename = (mode === "edit");

  // CORE EDITION LIMIT: only 1 apiary allowed
if (mode === "create") {
  const all = Storage.getAllApiaries();
  if (all.length >= getLimits().maxApiaries) {
    App.UI.showToast("The Core version of HiveMap supports only one apiary.");
    return;
  }
}

  // -------------------------
  // HANDLE RENAME
  // -------------------------
  if (isRename) {
    const oldNotes = Storage.getApiaryNotes(oldName);
    Storage.saveApiaryNotes(newName, oldNotes || "[]");

    const oldLayout = Storage.getHiveLayout(oldName);
    if (oldLayout) {
      Storage.saveHiveLayout(newName, oldLayout);
    }

    all = all.filter(a => a !== oldName);
    all.push(newName);
    Storage.saveAllApiaries(all);

    localStorage.removeItem("apiaryNotes_" + oldName);
    localStorage.removeItem("hiveLayout_" + oldName);
    localStorage.removeItem("apiaryGrid_" + oldName);
    localStorage.removeItem("apiaryAddress_" + oldName);
  }

  const apiaryName = newName;

  // -------------------------
  // SAVE NOTES
  // -------------------------
  let notes = [];
  try {
    const raw = Storage.getApiaryNotes(apiaryName);
    notes = raw ? JSON.parse(raw) || [] : [];
  } catch {
    notes = [];
  }

  Storage.saveApiaryNotes(apiaryName, JSON.stringify(notes));

  // -------------------------
  // ADD OR UPDATE APIARY
  // -------------------------
  if (!all.includes(apiaryName)) {
    all.push(apiaryName);
    Storage.saveAllApiaries(all);

    Storage.saveHiveLayout(apiaryName, JSON.stringify({ objects: [] }));
  }

  // -------------------------
  // SAVE GRID + ADDRESS
  // -------------------------
  const gridInput = document.getElementById("apiaryGridInput");
  const addressInput = document.getElementById("apiaryAddressInput");

  Storage.saveApiaryGrid(apiaryName, gridInput.value.trim());
  Storage.saveApiaryAddress(apiaryName, addressInput.value.trim());

  // -------------------------
  // ⭐ CRITICAL FIX
  // Guarantee the current apiary is set for hive creation
  // -------------------------
Storage.saveCurrentApiary(apiaryName);

  // -------------------------
  // FINALISE
  // -------------------------
  App.Apiaries.updateSelector();
  App.Canvas.loadLayout();
  App.Modals.closeApiaryManager();
};

App.Modals.deleteApiaryManager = function () {
  const name = Storage.getCurrentApiary();

  // Open the confirm delete modal
  const modal = document.getElementById("confirmDeleteApiaryModal");
  const overlay = document.getElementById("overlay");
  const msg = document.getElementById("confirmDeleteApiaryMessage");

  msg.innerHTML = `
  <p>All associated hives, notes, and layouts will be permanently removed. This cannot be undone.</p>
  <strong>Delete apiary "${name}"?</strong>
  `;
  modal.style.display = "block";

    // When a second modal opens, overlay must rise above the lower modal
  overlay.style.zIndex = "1050";   // between account (1000) and renew (1200)
  overlay.style.display = "block";

};

App.Modals.closeApiaryManager = function () {
  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("apiaryManagerModal");

  modal.style.display = "none";
  overlay.style.display = "none";
};

App.Modals.apiaryManagerMode = "edit"; // "edit" or "create"

// ------------------------------------------------------------
// Box Types Manager — OPEN
// ------------------------------------------------------------
App.Modals.openBoxTypesManager = function () {
  const modal = document.getElementById("boxTypesModal");
  const overlay = document.getElementById("overlay");

  if (!modal || !overlay) return;
App.Modals.renderBoxTypesList();
  modal.style.display = "block";
  overlay.style.display = "block";

  // No rendering yet — that comes in later steps
};


// ------------------------------------------------------------
// Box Types Manager — CLOSE
// ------------------------------------------------------------
App.Modals.closeBoxTypesManager = function () {
  const modal = document.getElementById("boxTypesModal");
  const overlay = document.getElementById("overlay");

  if (!modal || !overlay) return;

  modal.style.display = "none";

  // Maintain correct overlay behaviour
  const anyOpen = [...document.querySelectorAll('.modal')]
    .some(m => window.getComputedStyle(m).display !== "none");

  overlay.style.display = anyOpen ? "block" : "none";
};

// ------------------------------------------------------------
// Render Box Types list (with rename + delete)
// ------------------------------------------------------------
App.Modals.renderBoxTypesList = function () {
  const container = document.getElementById("boxTypesList");
  if (!container) return;

  const list = Storage.getBoxTypes();

  container.innerHTML = list
    .map((type, index) => `
      <div class="box-type-row">
        <input 
          type="text" 
          class="box-type-input" 
          data-index="${index}" 
          value="${type}"
          disabled
        >

        <button class="rename-box-type btn-primary" data-index="${index}">Rename</button>
        <button class="save-box-type btn-save" data-index="${index}" style="display:none;">Save</button>
        <button class="cancel-box-type btn-cancel" data-index="${index}" style="display:none;">Cancel</button>

        <button class="delete-box-type btn-danger" data-index="${index}">Delete</button>
      </div>
    `)
    .join("");

  // DELETE
  container.querySelectorAll(".delete-box-type").forEach(btn => {
    btn.onclick = function () {
      const idx = Number(this.dataset.index);
      App.Modals.deleteBoxType(idx);
    };
  });

  // RENAME (enter rename mode)
  container.querySelectorAll(".rename-box-type").forEach(btn => {
    btn.onclick = function () {
      const idx = Number(this.dataset.index);
      const row = this.closest(".box-type-row");
      const input = row.querySelector(".box-type-input");
      const saveBtn = row.querySelector(".save-box-type");
      const cancelBtn = row.querySelector(".cancel-box-type");

      input.disabled = false;
      input.dataset.original = input.value;
      input.focus();

      this.style.display = "none";
      saveBtn.style.display = "inline-block";
      cancelBtn.style.display = "inline-block";
    };
  });

  // SAVE rename
  container.querySelectorAll(".save-box-type").forEach(btn => {
    btn.onclick = function () {
      const idx = Number(this.dataset.index);
      const row = this.closest(".box-type-row");
      const input = row.querySelector(".box-type-input");
      const renameBtn = row.querySelector(".rename-box-type");
      const cancelBtn = row.querySelector(".cancel-box-type");

      const newValue = input.value.trim();
      const oldValue = input.dataset.original;

      if (newValue && newValue !== oldValue) {
        App.Modals.renameBoxType(idx, newValue);
      } else {
        input.value = oldValue;
      }

      input.disabled = true;
      renameBtn.style.display = "inline-block";
      this.style.display = "none";
      cancelBtn.style.display = "none";
    };
  });

  // CANCEL rename
  container.querySelectorAll(".cancel-box-type").forEach(btn => {
    btn.onclick = function () {
      const row = this.closest(".box-type-row");
      const input = row.querySelector(".box-type-input");
      const renameBtn = row.querySelector(".rename-box-type");
      const saveBtn = row.querySelector(".save-box-type");

      input.value = input.dataset.original;
      input.disabled = true;

      renameBtn.style.display = "inline-block";
      saveBtn.style.display = "none";
      this.style.display = "none";
    };
  });

  // KEYBOARD support
  container.querySelectorAll(".box-type-input").forEach(input => {
    input.onkeydown = function (e) {
      const row = this.closest(".box-type-row");
      const saveBtn = row.querySelector(".save-box-type");
      const cancelBtn = row.querySelector(".cancel-box-type");

      if (e.key === "Enter") saveBtn.onclick();
      if (e.key === "Escape") cancelBtn.onclick();
    };
  });
};

// ------------------------------------------------------------
// Delete a box type
// ------------------------------------------------------------
App.Modals.deleteBoxType = function (index) {
  const list = Storage.getBoxTypes();

  // Remove the selected item
  list.splice(index, 1);

  Storage.saveBoxTypes(list);

  // Re-render list
  App.Modals.renderBoxTypesList();
  App.Hives.populateBoxTypeSelect();
};

// ------------------------------------------------------------
// Rename a box type
// ------------------------------------------------------------
App.Modals.renameBoxType = function (index, newValue) {
  if (!newValue) return; // ignore empty names

  const list = Storage.getBoxTypes();
  list[index] = newValue;

  Storage.saveBoxTypes(list);

  // Re-render list
  App.Modals.renderBoxTypesList();
  App.Hives.populateBoxTypeSelect();
};

// ------------------------------------------------------------
// Add a new box type
// ------------------------------------------------------------
App.Modals.addBoxType = function () {
  const input = document.getElementById("newBoxTypeInput");
  if (!input) return;

  const value = input.value.trim();
  if (!value) return; // ignore empty

  const list = Storage.getBoxTypes();
  list.push(value);

  Storage.saveBoxTypes(list);

  input.value = ""; // clear input
  App.Modals.renderBoxTypesList(); // refresh list
  App.Hives.populateBoxTypeSelect();
};

// Hive Types
App.Modals.renderHiveTypesList = function () {
  const container = document.getElementById("hiveTypesList");
  if (!container) return;

  const list = Storage.getHiveTypes();

  container.innerHTML = list
    .map((type, index) => `
      <div class="hive-type-row">
        <input 
          type="text" 
          class="hive-type-input" 
          data-index="${index}" 
          value="${type}"
          disabled
        >

        <button class="rename-hive-type btn-primary" data-index="${index}">Rename</button>
        <button class="save-hive-type btn-save" data-index="${index}" style="display:none;">Save</button>
        <button class="cancel-hive-type btn-cancel" data-index="${index}" style="display:none;">Cancel</button>

        <button class="delete-hive-type btn-danger" data-index="${index}">Delete</button>
      </div>
    `)
    .join("");

  // DELETE
  container.querySelectorAll(".delete-hive-type").forEach(btn => {
    btn.onclick = function () {
      const idx = Number(this.dataset.index);
      App.Modals.deleteHiveType(idx);
    };
  });

  // RENAME (enter rename mode)
  container.querySelectorAll(".rename-hive-type").forEach(btn => {
    btn.onclick = function () {
      const row = this.closest(".hive-type-row");
      const input = row.querySelector(".hive-type-input");
      const saveBtn = row.querySelector(".save-hive-type");
      const cancelBtn = row.querySelector(".cancel-hive-type");

      input.disabled = false;
      input.dataset.original = input.value;
      input.focus();

      this.style.display = "none";
      saveBtn.style.display = "inline-block";
      cancelBtn.style.display = "inline-block";
    };
  });

  // SAVE rename
  container.querySelectorAll(".save-hive-type").forEach(btn => {
    btn.onclick = function () {
      const idx = Number(this.dataset.index);
      const row = this.closest(".hive-type-row");
      const input = row.querySelector(".hive-type-input");
      const renameBtn = row.querySelector(".rename-hive-type");
      const cancelBtn = row.querySelector(".cancel-hive-type");

      const newValue = input.value.trim();
      const oldValue = input.dataset.original;

      if (newValue && newValue !== oldValue) {
        App.Modals.renameHiveType(idx, newValue);
      } else {
        input.value = oldValue;
      }

      input.disabled = true;
      renameBtn.style.display = "inline-block";
      this.style.display = "none";
      cancelBtn.style.display = "none";
    };
  });

  // CANCEL rename
  container.querySelectorAll(".cancel-hive-type").forEach(btn => {
    btn.onclick = function () {
      const row = this.closest(".hive-type-row");
      const input = row.querySelector(".hive-type-input");
      const renameBtn = row.querySelector(".rename-hive-type");
      const saveBtn = row.querySelector(".save-hive-type");

      input.value = input.dataset.original;
      input.disabled = true;

      renameBtn.style.display = "inline-block";
      saveBtn.style.display = "none";
      this.style.display = "none";
    };
  });

  // KEYBOARD support
  container.querySelectorAll(".hive-type-input").forEach(input => {
    input.onkeydown = function (e) {
      const row = this.closest(".hive-type-row");
      const saveBtn = row.querySelector(".save-hive-type");
      const cancelBtn = row.querySelector(".cancel-hive-type");

      if (e.key === "Enter") saveBtn.onclick();
      if (e.key === "Escape") cancelBtn.onclick();
    };
  });
};

App.Modals.renameHiveType = function (index, newName) {
  const list = Storage.getHiveTypes();
  list[index] = newName;

  Storage.saveHiveTypes(list);

  App.Modals.renderHiveTypesList();
  App.Hives.populateTypeSelect(newName);
};


App.Modals.addHiveType = function () {
  const input = document.getElementById("newHiveTypeInput");
  if (!input) return;

  const name = input.value.trim();
  if (!name) return;

  const list = Storage.getHiveTypes();
  list.push(name);

  Storage.saveHiveTypes(list);

  input.value = "";
  App.Modals.renderHiveTypesList();
  App.Hives.populateTypeSelect(name);
};

App.Modals.deleteHiveType = function (index) {
  const list = Storage.getHiveTypes();
  list.splice(index, 1);

  Storage.saveHiveTypes(list);

  App.Modals.renderHiveTypesList();
  App.Hives.populateTypeSelect();
};


App.Modals.openAccountModal = function () {
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
      <strong>HiveMap Plus</strong> unlocks unlimited apiaries and hives.<br>
      You also receive priority updates and access to all future Plus features.<br>
      Your data remains fully local and private.
    `;
  } else if (edition === "CORE") {
    explainEl.innerHTML = `
      <strong>HiveMap Core</strong> is fully functional but limited to one apiary and one hive.<br>
      Upgrade to <strong>HiveMap Plus</strong> to unlock unlimited apiaries and hives.<br>
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
};

App.Modals.openConfirmDeleteHives = function (count, onConfirm) {
  confirmDeleteHivesCallback = onConfirm;

  // Update message
  confirmDeleteHiveMessage.textContent =
    `Delete ${count} selected hive(s)? This cannot be undone.`;

  // Show modal + overlay
  confirmDeleteHiveModal.style.display = "block";
  document.getElementById("overlay").style.display = "block";
};

App.Modals.closeConfirmDeleteHives = function () {
  confirmDeleteHiveModal.style.display = "none";
  document.getElementById("overlay").style.display = "none";
};

// ------------------------------------------------------------
// Initialise modal system
// ------------------------------------------------------------
App.Modals.init = function () {

  // ------------------------------------------------------------
  // Overlay (shared by all modals)
  // ------------------------------------------------------------
  const overlay = document.getElementById("overlay");

  confirmDeleteHiveModal      = document.getElementById("confirmDeleteHiveModal");
  confirmDeleteHiveMessage    = document.getElementById("confirmDeleteHiveMessage");
  confirmDeleteHiveYesBtn     = document.getElementById("confirmDeleteHiveYesBtn");
  confirmDeleteHiveCancelBtn  = document.getElementById("confirmDeleteHiveCancelBtn");

  // YES button
  confirmDeleteHiveYesBtn.addEventListener("click", function () {
    App.Modals.closeConfirmDeleteHives();

    if (typeof confirmDeleteHivesCallback === "function") {
      confirmDeleteHivesCallback();
      confirmDeleteHivesCallback = null;
    }
  });

  // CANCEL button
  confirmDeleteHiveCancelBtn.addEventListener("click", function () {
    App.Modals.closeConfirmDeleteHives();
    confirmDeleteHivesCallback = null;
  });


App.Modals.renderHiveTypesList();

document.getElementById("confirmDeleteApiaryCancelBtn")
  .addEventListener("click", function () {
    const confirmModal = document.getElementById("confirmDeleteApiaryModal");
    const overlay = document.getElementById("overlay"); // the shared overlay

    // hide the confirm modal
    confirmModal.style.display = "none";

    // reset overlay z-index back to default
    overlay.style.zIndex = "900";

    // DO NOT hide the overlay — ApiaryManagerModal still needs it
  });


document.getElementById("confirmDeleteApiaryYesBtn")
  .addEventListener("click", function () {

    const name = Storage.getCurrentApiary();

    // Remove from list
    const all = Storage.getAllApiaries();
    const idx = all.indexOf(name);
    if (idx !== -1) all.splice(idx, 1);
    Storage.saveAllApiaries(all);

    // Remove notes
    localStorage.removeItem("apiaryNotes_" + name);

    // Remove layout
    localStorage.removeItem("hiveLayout_" + name);

    // Switch to first apiary if any remain
    if (all.length > 0) {
      Storage.saveCurrentApiary(all[0]);
    } else {
      Storage.saveCurrentApiary("");
    }

    App.Apiaries.updateSelector();
    App.Canvas.loadLayout();

    // ⭐ FIX: reset overlay z-index after delete
    const overlay = document.getElementById("overlay");
    overlay.style.zIndex = "900";

    // Close both modals
    document.getElementById("confirmDeleteApiaryModal").style.display = "none";
    App.Modals.closeApiaryManager();
  });

  // Cancel archive
document.getElementById("confirmArchiveHiveCancelBtn")
  .addEventListener("click", function () {
    const confirmModal = document.getElementById("confirmArchiveHiveModal");
    const overlay = document.getElementById("overlay");

    confirmModal.style.display = "none";

    // Reset overlay z-index back to default (same as Apiary Manager)
    overlay.style.zIndex = "900";
  });

// Confirm archive
document.getElementById("confirmArchiveHiveYesBtn")
  .addEventListener("click", function () {
    if (!selectedHive) return;

    selectedHive.hiveData.status = "archived";
    selectedHive.visible = false;

    App.Canvas.saveLayout();
    App.Canvas.requestRender();
    App.Toolbar.refreshCounts();
    // Close confirmation modal
    document.getElementById("confirmArchiveHiveModal").style.display = "none";

    // Close the Edit Hive modal
    App.Modals.closeHiveModal();

    // Reset overlay z-index
    const overlay = document.getElementById("overlay");
    overlay.style.zIndex = "900";
  });


  // ------------------------------------------------------------
  // Hive edit modal
  // ------------------------------------------------------------
  document.getElementById("modalCloseBtn").addEventListener("click", App.Modals.closeHiveModal);
  document.getElementById("cancelHiveBtn").addEventListener("click", App.Modals.closeHiveModal);
  document.getElementById("cancelHiveBtnFooter").addEventListener("click", App.Modals.closeHiveModal);
  document.getElementById("saveHiveBtn").addEventListener("click", App.Modals.saveHiveData);
  document.getElementById("saveHiveBtnFooter").addEventListener("click", App.Modals.saveHiveData);

  // ⭐ Add Inspection button (now works)
  document.getElementById("addInspectionBtn").addEventListener("click", function () {
    if (selectedHive) {
      App.Modals.openInspectionInput(selectedHive);
    }
  });

  if (overlay) overlay.addEventListener("click", App.Modals.closeHiveModal);
document.getElementById("saveInspectionInputBtn").addEventListener("click", App.Modals.saveInspectionInput);
  document.getElementById("closeInspectionInputBtn").addEventListener("click", App.Modals.closeInspectionInput);
  document.getElementById("cancelInspectionInputBtn").addEventListener("click", App.Modals.closeInspectionInput);

  // ------------------------------------------------------------
  // Hive size modal
  // ------------------------------------------------------------
  document.getElementById("addHiveBtn").addEventListener("click", App.Modals.openHiveSizeModal);
  document.getElementById("hiveSizeCloseBtn").addEventListener("click", App.Modals.closeHiveSizeModal);
  document.getElementById("cancelCreateHiveBtn").addEventListener("click", App.Modals.closeHiveSizeModal);
  if (overlay) overlay.addEventListener("click", App.Modals.closeHiveSizeModal);
  document.getElementById("confirmCreateHiveBtn").addEventListener("click", App.Modals.confirmCreateHive);
  document.getElementById("hiveSizeSelect").addEventListener("change", App.Modals.toggleCustomSizeFields);

  // ------------------------------------------------------------
  // Box add button
  // ------------------------------------------------------------
  document.getElementById("addBoxBtn").addEventListener("click", App.Modals.addBox);

  // ------------------------------------------------------------
  // Due inspections modal
  // ------------------------------------------------------------
  document.getElementById("closeDueInspectionsBtn").addEventListener("click", App.Modals.closeDueInspections);
  document.getElementById("closeDueInspectionsBtn2").addEventListener("click", App.Modals.closeDueInspections);
  if (overlay) overlay.addEventListener("click", App.Modals.closeDueInspections);

  // ------------------------------------------------------------
  // Inspection details modal (read-only)
  // ------------------------------------------------------------
  document.getElementById("closeInspectionDetailsBtn").addEventListener("click", App.Modals.closeInspectionDetails);
  document.getElementById("cancelInspectionDetailsBtn").addEventListener("click", App.Modals.closeInspectionDetails);
  document.getElementById("saveInspectionDetailsBtn").addEventListener("click", App.Modals.saveInspectionDetails);
  if (overlay) overlay.addEventListener("click", App.Modals.closeInspectionDetails);

  // ------------------------------------------------------------
  // Inspection field config modal
  // ------------------------------------------------------------
  document.getElementById("inspectionFieldConfigCloseBtn").addEventListener("click", App.Modals.closeInspectionFieldConfig);
  document.getElementById("inspectionFieldConfigCloseBtnFooter").addEventListener("click", App.Modals.closeInspectionFieldConfig);
  document.getElementById("inspectionFieldConfigSaveBtnFooter").addEventListener("click", App.Modals.saveInspectionFieldConfig);
  if (overlay) overlay.addEventListener("click", App.Modals.closeInspectionFieldConfig);

  // ------------------------------------------------------------
  // Hive list modal
  // ------------------------------------------------------------
  document.getElementById("hiveListModalCloseBtn1").addEventListener("click", App.Modals.closeHiveListModal);
  document.getElementById("hiveListCloseBtnFooter").addEventListener("click", App.Modals.closeHiveListModal);
  if (overlay) overlay.addEventListener("click", App.Modals.closeHiveListModal);

  // ------------------------------------------------------------
  // Exit modal
  // ------------------------------------------------------------
  document.getElementById("exitFab").addEventListener("click", () => {
    App.Modals.openExitModal();
  });

  document.getElementById("exitCancelBtn").addEventListener("click", () => {
    App.Modals.closeExitModal();
  });

  if (overlay) overlay.addEventListener("click", App.Modals.closeExitModal);

  document.getElementById("exitWithoutSaveBtn").addEventListener("click", () => {
    App.Modals.exitApp();
  });

  document.getElementById("exitExportBtn").addEventListener("click", () => {
    App.Export.exportAllData();
    App.Modals.exitApp();
  });

  document.getElementById("moveHiveBtn").addEventListener("click", () => {
  if (!selectedHive) return;

  const newApiaryId = document.getElementById("destinationApiarySelect").value;
  App.Hives.moveHive(selectedHive, newApiaryId);
});

document.getElementById("renewCloseBtn").onclick = App.Modals.closeRenewModal;
 if (overlay) overlay.addEventListener("click", App.Modals.closeRenewModal);

// ===============================
//  CLICK HANDLERS FOR COLOUR LABELS
// ===============================
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.style.cursor = "pointer";

  btn.addEventListener("click", () => {
    const type = btn.dataset.filter;

    if (type === "today") App.Modals.openTodayInspections();
    if (type === "overdue") App.Modals.openOverdueInspections();
    if (type === "future") App.Modals.openFutureInspections();
    if (type === "all") App.Modals.openDueInspectionsModal();
    if (type === "archived") App.Modals.openArchivedHivesModal();
    if (type === "hiveListShowAll") App.Modals.openHiveListModal();
    if (type === "overallListShowAll") App.Modals.openOverallHiveListModal();
  });
});
  document.getElementById("closeInspectionHistoryBtn").addEventListener("click", App.Modals.closeInspectionHistory);
  document.getElementById("closeInspectionHistoryBtn2").addEventListener("click", App.Modals.closeInspectionHistory);
   if (overlay) overlay.addEventListener("click", App.Modals.closeInspectionHistory);

  document.getElementById("saveTreatmentBtn").onclick = App.Modals.saveTreatment;
document.getElementById("cancelTreatmentBtn").onclick = App.Modals.closeTreatmentModal;
document.getElementById("treatmentModalCloseBtn").onclick = App.Modals.closeTreatmentModal;
   if (overlay) overlay.addEventListener("click", App.Modals.closeTreatmentModal);


// ------------------------------------------------------------
// Apiary Manager modal
// ------------------------------------------------------------
const apiaryManagerBtn = document.getElementById("apiaryManagerBtn");
const apiaryManagerCloseBtn = document.getElementById("apiaryManagerCloseBtn");
const apiaryManagerCloseFooterBtn = document.getElementById("apiaryManagerCloseFooterBtn");
const apiaryManagerSaveBtn = document.getElementById("apiaryManagerSaveBtn");
const apiaryManagerDeleteBtn = document.getElementById("apiaryManagerDeleteBtn");

if (apiaryManagerBtn) apiaryManagerBtn.addEventListener("click", App.Modals.openApiaryManager);
if (apiaryManagerCloseBtn) apiaryManagerCloseBtn.addEventListener("click", App.Modals.closeApiaryManager);
if (apiaryManagerCloseFooterBtn) apiaryManagerCloseFooterBtn.addEventListener("click", App.Modals.closeApiaryManager);
if (apiaryManagerSaveBtn) apiaryManagerSaveBtn.addEventListener("click", App.Modals.saveApiaryManager);
if (apiaryManagerDeleteBtn) apiaryManagerDeleteBtn.addEventListener("click", App.Modals.deleteApiaryManager);
   if (overlay) overlay.addEventListener("click", App.Modals.closeApiaryManager);


const newApiaryBtn = document.getElementById("newApiaryBtn");
if (newApiaryBtn) newApiaryBtn.addEventListener("click", () => {
  App.Modals.openApiaryManager("create");
});

document.getElementById("apiaryManagerNewBtn")
  .addEventListener("click", () => App.Modals.openApiaryManager("create"));

document.getElementById("apiaryManagerPrintBtn")
  .addEventListener("click", App.Canvas.print);

const closeBtn = document.getElementById("closeBoxTypesBtn");
if (closeBtn) {
  closeBtn.onclick = App.Modals.closeBoxTypesManager;
}
if (overlay) overlay.addEventListener("click", App.Modals.closeBoxTypesManager);
const addBoxTypeBtn = document.getElementById("addBoxTypeBtn");
if (addBoxTypeBtn) {
  addBoxTypeBtn.onclick = App.Modals.addBoxType;
}
};

