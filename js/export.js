// ------------------------------------------------------------
// export.js
// Handles exporting/importing layouts, apiaries, and full data.
// ------------------------------------------------------------

window.App = window.App || {};
App.Export = {};


// ------------------------------------------------------------
// Export the current apiary layout only
// ------------------------------------------------------------
App.Export.exportLayout = function () {
  const apiaryName = Storage.getCurrentApiary() || "Untitled Apiary";
  const layoutJSON = canvas.toJSON(["hiveData"]);

  const exportData = {
    hiveLayout: layoutJSON,
    queenStatuses: Storage.getQueenStatuses(),
    hiveTypes: Storage.getHiveTypes(),
    apiaryNote: Storage.getApiaryNote(apiaryName) || "",
    allApiaries: Storage.getAllApiaries(),
    currentApiary: apiaryName
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${apiaryName}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};


// ------------------------------------------------------------
// Export ALL apiaries into one JSON file
// ------------------------------------------------------------
App.Export.exportAllData = function () {
  const allApiaries = Storage.getAllApiaries();
  if (!allApiaries.length) {
    App.UI.showToast("No apiaries to export.");
    return;
  }

  const exportObj = {
    version: 2,
    apiaries: {},
    settings: {
      hiveTypes: Storage.getHiveTypes(),
      queenStatuses: Storage.getQueenStatuses(),
      zoom: 1,
      snap: true
    },
    media: { images: {} },
    lastUsed: Storage.getCurrentApiary() || ""
  };

allApiaries.forEach(apiary => {
  const layoutJSON = Storage.getHiveLayout(apiary);

  // FIX: use structured notes, not old single-note API
  const note = Storage.getApiaryNotes(apiary) || [];

  let hives = {};

  if (layoutJSON) {
    const tempCanvas = new fabric.Canvas(null);
    tempCanvas.loadFromJSON(layoutJSON, () => {
      tempCanvas.getObjects().forEach(obj => {
        if (obj.type === "group" && obj.hiveData) {
          hives[obj.hiveData.name || "Unnamed"] = {
            name: obj.hiveData.name || "Unnamed",
            hiveType: obj.hiveData.hiveType || "N/A",
            inspections: obj.hiveData.inspections || []
          };
        }
      });
    });
  }

  exportObj.apiaries[apiary] = {
    canvas: layoutJSON ? JSON.parse(layoutJSON) : {},
    hives,
    note
  };
});


  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);
  const hours = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");

  const filename = `HiveMap-${day}-${month}-${year}@${hours}-${mins}.json`;

  const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
    type: "application/json"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);

  App.UI.showToast(`Exported ${allApiaries.length} apiaries.`);
};


// ------------------------------------------------------------
// Import a single apiary layout file
// ------------------------------------------------------------
App.Export.importLayout = function (event) {
  if (editingDisabled()) {
    App.UI.showToast("Editing is disabled because your subscription has expired.");
    return;
  }
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const loaded = JSON.parse(e.target.result);
      const importedName = file.name.replace(/\.json$/i, "").trim();

      if (loaded.queenStatuses) {
        Storage.saveQueenStatuses(loaded.queenStatuses);
        App.Status.renderLegend();
      }

      if (loaded.apiaryNote) {
        Storage.saveApiaryNote(importedName, loaded.apiaryNote);
      }

      if (loaded.hiveLayout) {
        Storage.saveHiveLayout(importedName, JSON.stringify(loaded.hiveLayout));

        const all = Storage.getAllApiaries();
        if (!all.includes(importedName)) {
          all.push(importedName);
          Storage.saveAllApiaries(all);
        }

        Storage.saveCurrentApiary(importedName);

        App.Apiaries.updateSelector();
        App.Canvas.loadLayout();
      } else {
        App.UI.showToast("Invalid file format: Missing hiveLayout.");
      }
    } catch (err) {
      App.UI.showToast("Failed to import: " + err.message);
    }
  };

  reader.readAsText(file);
};


// ------------------------------------------------------------
// Import ALL apiaries from a single JSON file
// ------------------------------------------------------------
App.Export.importAllData = function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const loaded = JSON.parse(e.target.result);

      if (!loaded.apiaries || typeof loaded.apiaries !== "object") {
        App.UI.showToast("Invalid file format: missing apiaries");
        return;
      }

      // ⭐ Enforce free-version limits on imported data
      if (!isPro) {
        const names = Object.keys(loaded.apiaries);

        const firstName = names[0];
        const firstApiary = loaded.apiaries[firstName];

        const trimmedApiaries = {};
        if (firstApiary) {
          const hiveNames = Object.keys(firstApiary.hives || {});
          const firstHiveName = hiveNames[0];

          const trimmedHives = {};
          if (firstHiveName) {
            trimmedHives[firstHiveName] = firstApiary.hives[firstHiveName];
          }

          trimmedApiaries[firstName] = {
            ...firstApiary,
            hives: trimmedHives
          };
        }

        loaded.apiaries = trimmedApiaries;
        loaded.lastUsed = firstName || loaded.lastUsed;
      }

      // ⭐ Clear existing data (but we will restore access + license)
      localStorage.clear();

      // Restore apiaries
      const apiaryNames = Object.keys(loaded.apiaries);

      apiaryNames.forEach(name => {
        const apiary = loaded.apiaries[name];
        Storage.saveHiveLayout(name, JSON.stringify(apiary.canvas || {}));
        Storage.saveApiaryNotes(name, apiary.note || []);
      });

      Storage.saveAllApiaries(apiaryNames);
      Storage.saveCurrentApiary(loaded.lastUsed || apiaryNames[0] || "Default");

      // Restore settings
      if (loaded.settings) {
        Storage.saveHiveTypes(loaded.settings.hiveTypes || []);
        Storage.saveQueenStatuses(loaded.settings.queenStatuses || []);
      }

      App.UI.showToast(`Imported ${apiaryNames.length} apiaries successfully.`);

      // ⭐ Skip login check for this reload
      window.location.reload();

    } catch (err) {
      App.UI.showToast("Failed to import: " + err.message);
      console.error(err);
    }
  };

  reader.readAsText(file);
};

// ------------------------------------------------------------
// Initialise export system
// ------------------------------------------------------------
App.Export.init = function () {
  const exportAllBtn = document.getElementById("exportAllBtn");
  const importAllBtn = document.getElementById("importAllBtn");
  const importAllFile = document.getElementById("importAllFile");

  if (exportAllBtn) exportAllBtn.addEventListener("click", App.Export.exportAllData);
if (importAllBtn) importAllBtn.addEventListener("click", () => {
  if (editingDisabled()) {
    App.UI.showToast("Editing is disabled because your subscription has expired.");
    return;
  }
  importAllFile.click();
});
  if (importAllFile) importAllFile.addEventListener("change", App.Export.importAllData);
};
