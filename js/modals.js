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
  const data = hiveGroup.hiveData || {};

  // Ensure arrays exist
  data.boxes = data.boxes || [];
  data.inspections = data.inspections || [];

  // Populate fields
  document.getElementById("hiveName").value = data.name || "";
  App.Hives.populateTypeSelect(data.hiveType || "");
  document.getElementById("lastInspection").value = "";
  document.getElementById("nextInspection").value = data.nextInspectionDate || "";
  document.getElementById("notes").value = "";
  const rect = hiveGroup._objects[0];
  document.getElementById("editHiveWidth").value = rect.width;
  document.getElementById("editHiveHeight").value = rect.height;

  // Latest inspection
  const latest = data.inspections[data.inspections.length - 1] || {};
  App.Status.populateStatusSelect(latest.queenStatus || "");

  // Render boxes + inspection history
  App.Modals.renderBoxList();
  App.Modals.renderInspectionHistory();

  // 🔹 Show correct archive/restore button and wire handlers
  const archiveBtn = document.getElementById("archiveHiveBtn");
  const restoreBtn = document.getElementById("restoreHiveBtn");

  if (archiveBtn && restoreBtn) {
    if (data.status === "archived") {
      archiveBtn.style.display = "none";
      restoreBtn.style.display = "inline-block";
    } else {
      archiveBtn.style.display = "inline-block";
      restoreBtn.style.display = "none";
    }

    archiveBtn.onclick = function () {
      if (!selectedHive) return;

      selectedHive.hiveData.status = "archived";
      selectedHive.visible = false;

      App.Canvas.saveLayout();
      App.Canvas.requestRender();
      App.Modals.closeHiveModal();
    };

    restoreBtn.onclick = function () {
      if (!selectedHive) return;

      selectedHive.hiveData.status = "active";
      selectedHive.visible = true;

      App.Canvas.saveLayout();
      App.Canvas.requestRender();
      App.Modals.closeHiveModal();
    };
  }

  // Show modal
  document.getElementById("modal").style.display = "block";
  document.getElementById("overlay").style.display = "block";
};


// ------------------------------------------------------------
// Close hive edit modal
// ------------------------------------------------------------
App.Modals.closeHiveModal = function () {
  document.getElementById("modal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  selectedHive = null;
};

App.Modals.confirmEditHive = function (hive) {
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
  const name = document.getElementById("hiveName").value.trim() || "Unnamed";
  const hiveType = document.getElementById("hiveType").value;
  const date = document.getElementById("lastInspection").value;
  const queenStatus = document.getElementById("queenStatus").value;
  const notes = document.getElementById("notes").value;
  const nextInspection = document.getElementById("nextInspection").value;

  hiveData.name = name;
  hiveData.hiveType = hiveType;
  hiveData.nextInspectionDate = nextInspection;

  hiveData.inspections = hiveData.inspections || [];
  const latest = hiveData.inspections[hiveData.inspections.length - 1] || {};

  if (date !== latest.date || queenStatus !== latest.queenStatus || notes !== latest.notes) {
    hiveData.inspections.push({ date, queenStatus, notes });
  }

  // Update label + colour
  const currentInspection = hiveData.inspections[hiveData.inspections.length - 1] || {};
  selectedHive._objects[1].set("text", name);

  const color = App.Status.getColor(currentInspection.queenStatus || "");
  selectedHive._objects[0].set("fill", color);


  // -----------------------------
  // 3. SAVE + RENDER
  // -----------------------------
  App.Canvas.saveLayout();
  App.updateDueInspectionsBadge();
  App.Stats.update();

  resizeAndFitCanvas();
  canvas.requestRenderAll();

  // -----------------------------
  // 4. CLOSE MODAL
  // -----------------------------
  App.Modals.closeHiveModal();
};


// ------------------------------------------------------------
// Render inspection history list
// ------------------------------------------------------------
App.Modals.renderInspectionHistory = function () {
  const container = document.getElementById("inspectionHistoryList");
  if (!container || !selectedHive) return;

  const data = selectedHive.hiveData;
  container.innerHTML = "";

  data.inspections.slice().reverse().forEach((ins, reversedIndex) => {
    const originalIndex = data.inspections.length - 1 - reversedIndex;

    const li = document.createElement("li");
    li.style.marginBottom = "6px";

li.innerHTML = `
  <div style="display:flex; justify-content:space-between; align-items:start; gap:6px;">
    <div>
      <strong>${App.Utils.formatDateUK(ins.date)}</strong> - Status: ${ins.queenStatus || "N/A"}<br>
      Notes: ${ins.notes || ""}
    </div>
    <button class="inspectionDetailsBtn btn-info" data-index="${originalIndex}">Details</button>
    <button type="button"
            class="deleteInspectionBtn small-delete"
            data-index="${originalIndex}">
            ×
    </button>
  </div>
`;


    container.appendChild(li);
  });

document.querySelectorAll(".inspectionDetailsBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;   // <-- THIS is the real index
        App.Modals.openInspectionDetails(index);
    });
});


  // Attach delete handlers
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
  if (!selectedHive) return;

  const type = document.getElementById("boxTypeSelect").value;
  const count = parseInt(document.getElementById("boxCountInput").value, 10);

  if (!count || count < 1) {
    alert("Count must be at least 1");
    return;
  }

  selectedHive.hiveData.boxes.push({ type, count });
  App.Modals.renderBoxList();
  App.Canvas.saveLayout();
};


// ------------------------------------------------------------
// HIVE SIZE MODAL
// ------------------------------------------------------------

// Open
App.Modals.openHiveSizeModal = function () {
  document.getElementById("hiveSizeModal").style.display = "block";
  document.getElementById("overlay").style.display = "block";

  // Auto-suggest next hive number
const used = App.Canvas.getHiveNames()
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
  const size = document.getElementById("hiveSizeSelect").value;
  const name = document.getElementById("hiveNameInput").value.trim() || "Hive";

  // Duplicate check
  if (App.Canvas.getHiveNames().includes(name)) {
    alert(`Hive name "${name}" already exists.`);
    return;
  }

  let width, height;

  if (size === "custom") {
    width = parseInt(document.getElementById("hiveWidthInput").value) || 40;
    height = parseInt(document.getElementById("hiveHeightInput").value) || 40;
  } else {
    [width, height] = size.split("x").map(Number);
  }

  // Delegate creation to Canvas module
  App.Canvas.createHive(name, width, height);
App.Stats.update();
  App.Modals.closeHiveSizeModal();
};

// ------------------------------------------------------------
// Open the Inspections Due modal
// ------------------------------------------------------------
App.Modals.openDueInspections = function () {
  const fullList = App.Hives.getDueInspections();
  const container = document.getElementById("dueInspectionsList");
  const filterCheckbox = document.getElementById("filterNext7");

  function render() {
    container.innerHTML = "";
    const today = new Date().toISOString().slice(0, 10);

    // Calculate date 7 days from now
    const next7 = new Date();
    next7.setDate(next7.getDate() + 7);
    const next7Str = next7.toISOString().slice(0, 10);

    // Apply filter if checkbox is ticked
const list = filterCheckbox.checked
  ? fullList.filter(item =>
      item.dueDate <= today || // overdue or today
      (item.dueDate > today && item.dueDate <= next7Str) // next 7 days
    )
  : fullList;


    if (list.length === 0) {
      container.innerHTML = "<li>No inspections in this range.</li>";
      return;
    }

    list.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.apiaryName} – Hive ${item.hiveName} (${App.Utils.formatDateUK(item.dueDate)})`;

      if (item.dueDate < today) {
        li.classList.add("due-overdue");
      } else if (item.dueDate === today) {
        li.classList.add("due-today");
      } else {
        li.classList.add("due-future");
      }

      container.appendChild(li);
    });
  }

  // Render immediately
  render();

  // Re-render when checkbox changes
  filterCheckbox.onchange = render;

  // Show modal + overlay
  document.getElementById("overlay").style.display = "block";
  document.getElementById("dueInspectionsModal").style.display = "block";
};


// ------------------------------------------------------------
// Close the Inspections Due modal
// ------------------------------------------------------------
App.Modals.closeDueInspections = function () {
  
  document.getElementById("dueInspectionsModal").style.display = "none";
document.getElementById("overlay").style.display = "none";

};

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
        App.Stats.update();
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

  // Populate modal fields
  document.getElementById("inspectionDetailsTitle").textContent =
    `Inspection Details — ${App.Utils.formatDateUK(inspection.date)}`;

  document.getElementById("inspectionDetailsStatus").textContent =
    inspection.queenStatus || "N/A";

  document.getElementById("inspectionDetailsNotes").textContent =
    inspection.notes || "";

    // ------------------------------------------------------------
// Render extended inspection fields
// ------------------------------------------------------------
// ------------------------------------------------------------
// Render fields from the active inspection schema
// ------------------------------------------------------------
const fieldsContainer = document.getElementById("inspectionDetailsFields");
fieldsContainer.innerHTML = "";

// Sort groups by sortOrder
const groups = [...App.Modals.inspectionSchema.groups].sort(
  (a, b) => a.sortOrder - b.sortOrder
);

groups.forEach(group => {
  // Wrapper using your existing modal-section styling
  const groupWrapper = document.createElement("div");
  groupWrapper.className = "modal-section";

  // Group title
  const groupTitle = document.createElement("h3");
  groupTitle.textContent = group.name;
  groupWrapper.appendChild(groupTitle);

  // Grid container
  const grid = document.createElement("div");
  grid.className = "inspection-details-grid";

  // Sort fields by sortOrder
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
      input.type = field.type; // text, number, etc.
    }

    input.id = "detail_" + field.id;
    input.dataset.key = field.id;

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    grid.appendChild(wrapper);
  });

  groupWrapper.appendChild(grid);
  fieldsContainer.appendChild(groupWrapper);
});

// ------------------------------------------------------------
// Load existing values into the extended fields (schema‑driven)
// ------------------------------------------------------------
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


  // Show modal
  document.getElementById("overlay").style.display = "block";
  document.getElementById("inspectionDetailsModal").style.display = "block";
};
App.Modals.saveInspectionDetails = function () {
  if (!selectedHive || App.Modals.currentInspectionIndex == null) return;

  const inspection = selectedHive.hiveData.inspections[App.Modals.currentInspectionIndex];
  if (!inspection) return;

  // Save extended fields
  App.Modals.inspectionDetailFields.forEach(field => {
    const input = document.getElementById("detail_" + field.key);
    if (!input) return;

    if (field.type === "checkbox") {
      inspection[field.key] = input.checked;
    } else {
      inspection[field.key] = input.value.trim();
    }
  });

  // Close modal
  App.Modals.closeInspectionDetails();

  // Persist hive data
  App.Storage.saveHive(selectedHive);
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
  const schema = App.Modals.inspectionSchemaWorking;

  if (!confirm("Delete this group?")) return;

  schema.groups.splice(index, 1);

  // Reassign sortOrder
  schema.groups.forEach((g, i) => g.sortOrder = i + 1);

  App.Modals.renderInspectionGroups();
};

App.Modals.addInspectionField = function (groupIndex) {
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
  const schema = App.Modals.inspectionSchemaWorking;
  const field = schema.groups[groupIndex].fields[fieldIndex];

  const newName = prompt("Rename field:", field.name);
  if (!newName) return;

  field.label = newName.trim();
  App.Modals.renderInspectionGroups();
};

App.Modals.changeInspectionFieldType = function (groupIndex, fieldIndex) {
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
  const schema = App.Modals.inspectionSchemaWorking;

  if (!confirm("Delete this field?")) return;

  schema.groups[groupIndex].fields.splice(fieldIndex, 1);

  schema.groups[groupIndex].fields.forEach((f, i) => f.sortOrder = i + 1);

  App.Modals.renderInspectionGroups();
};


App.Modals.addInspectionGroup = function () {
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
  // Commit working copy to live schema
  App.Modals.inspectionSchema = App.Modals.inspectionSchemaWorking;

  // Persist to storage
  Storage.saveInspectionSchema(App.Modals.inspectionSchema);

  // Close modal
  App.Modals.closeInspectionFieldConfig();
};

// ------------------------------------------------------------
// Initialise modal system
// ------------------------------------------------------------
App.Modals.init = function () {
  // Hive edit modal
  document.getElementById("modalCloseBtn").addEventListener("click", App.Modals.closeHiveModal);
  document.getElementById("cancelHiveBtn").addEventListener("click", App.Modals.closeHiveModal);
  document.getElementById("cancelHiveBtnFooter").addEventListener("click", App.Modals.closeHiveModal);
  document.getElementById("overlay"); if (overlay) overlay.addEventListener("click", App.Modals.closeHiveModal);
  document.getElementById("saveHiveBtn").addEventListener("click", App.Modals.saveHiveData);
  document.getElementById("saveHiveBtnFooter").addEventListener("click", App.Modals.saveHiveData);

  // Hive size modal
  document.getElementById("addHiveBtn").addEventListener("click", App.Modals.openHiveSizeModal);
  document.getElementById("hiveSizeCloseBtn").addEventListener("click", App.Modals.closeHiveSizeModal);
  document.getElementById("cancelCreateHiveBtn").addEventListener("click", App.Modals.closeHiveSizeModal);
  document.getElementById("confirmCreateHiveBtn").addEventListener("click", App.Modals.confirmCreateHive);
  document.getElementById("hiveSizeSelect").addEventListener("change", App.Modals.toggleCustomSizeFields);

  // Box add button
  document.getElementById("addBoxBtn").addEventListener("click", App.Modals.addBox);

  document.getElementById("closeDueInspectionsBtn").addEventListener("click", App.Modals.closeDueInspections);
  document.getElementById("closeDueInspectionsBtn2").addEventListener("click", App.Modals.closeDueInspections);
  document.getElementById("overlay"); if (overlay) overlay.addEventListener("click", App.Modals.closeDueInspections);

  document.getElementById("hivesArchived").addEventListener("click", App.Modals.openArchivedHives);
  document.getElementById("closeArchivedHivesBtn").addEventListener("click", App.Modals.closeArchivedHives);
  document.getElementById("overlay"); if (overlay) overlay.addEventListener("click", App.Modals.closeArchivedHives);

  document.getElementById("closeInspectionDetailsBtn").addEventListener("click", App.Modals.closeInspectionDetails);
  document.getElementById("cancelInspectionDetailsBtn").addEventListener("click", App.Modals.closeInspectionDetails);
  document.getElementById("overlay"); if (overlay) overlay.addEventListener("click", App.Modals.closeInspectionDetails);
  document.getElementById("saveInspectionDetailsBtn").addEventListener("click", App.Modals.saveInspectionDetails);

  document.getElementById("inspectionFieldConfigCloseBtn").addEventListener("click", App.Modals.closeInspectionFieldConfig);
  document.getElementById("inspectionFieldConfigCloseBtnFooter").addEventListener("click", App.Modals.closeInspectionFieldConfig);
  document.getElementById("inspectionFieldConfigSaveBtnFooter").addEventListener("click", App.Modals.saveInspectionFieldConfig);
  document.getElementById("overlay"); if (overlay) overlay.addEventListener("click", App.Modals.closeInspectionFieldConfig);
};
