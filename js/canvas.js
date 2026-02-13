// ------------------------------------------------------------
// canvas.js
// Fabric.js canvas engine: creation, loading, saving, printing,
// tooltip handling, and hive object management.
// ------------------------------------------------------------

window.App = window.App || {};
App.Canvas = {};

let canvas = null;
let tooltip = null;

// ------------------------------------------------------------
// ⭐ GLOBAL PATCH: Fix invalid baseline at the canvas context level
// ------------------------------------------------------------
const originalGetContext = HTMLCanvasElement.prototype.getContext;

HTMLCanvasElement.prototype.getContext = function(type, options) {
  const ctx = originalGetContext.call(this, type, options);

  if (ctx && ctx.textBaseline !== undefined) {
    const originalSetter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(ctx),
      'textBaseline'
    );

    if (originalSetter && originalSetter.set) {
      Object.defineProperty(ctx, 'textBaseline', {
        set(value) {
          if (value === 'alphabetical') {
            value = 'alphabetic';
          }
          originalSetter.set.call(this, value);
        },
        get() {
          return originalSetter.get.call(this);
        }
      });
    }
  }

  return ctx;
};

// ------------------------------------------------------------
// Initialise Fabric canvas
// ------------------------------------------------------------
let resizeTimer = null; // debounce timer

App.Canvas.init = function () {
  tooltip = document.getElementById("tooltip");

  canvas = new fabric.Canvas("hiveCanvas", {
    selection: true,
    preserveObjectStacking: true
  });
canvas.upperCanvasEl.style.touchAction = "manipulation";
canvas.lowerCanvasEl.style.touchAction = "manipulation";

  // Touch double‑tap to open modal
if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
  let lastTap = 0;

  canvas.on("mouse:down", e => {
    if (!e.target || !e.target.hiveData) return;

    const now = Date.now();
    if (now - lastTap < 300) {
      App.Modals.openHiveModal(e.target);
      lastTap = 0;
    } else {
      lastTap = now;
    }
  });
}


  // Tooltip
  canvas.on("mouse:move", App.Canvas.handleTooltip);
  canvas.on("mouse:out", () => tooltip.style.display = "none");

  // Save layout on changes
  canvas.on("object:modified", App.Canvas.saveLayout);
  canvas.on("object:added", App.Canvas.saveLayout);

  // Load initial layout
  App.Canvas.loadLayout();

  // Underline labels
  App.Canvas.underlineLabels();

  // One unified resize + fit
  resizeAndFitCanvas();
  App.Canvas.fixMissingApiaryIds();
};

App.Canvas.fixMissingApiaryIds = function () {
  if (!canvas) return;
  if (!App.Apiaries || !App.Apiaries.currentApiaryId) return;

  const currentApiaryId = App.Apiaries.currentApiaryId;

  App.Canvas.getAllHives().forEach(hive => {
    if (!hive.hiveData.apiaryId) {
      hive.hiveData.apiaryId = currentApiaryId;
    }
  });

  App.Canvas.saveLayout();
};

// ------------------------------------------------------------
// AUTO‑RESIZE WITH DEBOUNCE (prevents misalignment jumps)
// ------------------------------------------------------------
function scheduleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeAndFitCanvas();
  }, 60); // enough time for flexbox/layout to settle
}

window.addEventListener("resize", scheduleResize);
window.addEventListener("orientationchange", scheduleResize);


// ------------------------------------------------------------
// Fit all hive objects into the visible canvas area
// ------------------------------------------------------------
function fitCanvasToScreen() {
  const objects = canvas.getObjects();
  if (!objects.length) return;

  const bounds = objects.reduce(
    (acc, o) => {
      const a = o.getBoundingRect(true, true);
      acc.minX = Math.min(acc.minX, a.left);
      acc.minY = Math.min(acc.minY, a.top);
      acc.maxX = Math.max(acc.maxX, a.left + a.width);
      acc.maxY = Math.max(acc.maxY, a.top + a.height);
      return acc;
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;

  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();

  // Normal scale calculation
  let scale = Math.min(
    canvasWidth / contentWidth,
    canvasHeight / contentHeight
  );

  // ⭐ Prevent giant hive when only 1 hive exists
  const MAX_SCALE = 1;   // adjust to taste (0.8 = 80% zoom)
  if (scale > MAX_SCALE) {
    scale = MAX_SCALE;
  }

  const vpt = canvas.viewportTransform.slice(0);
  vpt[0] = scale;
  vpt[3] = scale;
  vpt[4] = (canvasWidth - contentWidth * scale) / 2 - bounds.minX * scale;
  vpt[5] = (canvasHeight - contentHeight * scale) / 2 - bounds.minY * scale;

  canvas.setViewportTransform(vpt);
  canvas.renderAll();
}


// ------------------------------------------------------------
// SINGLE SOURCE OF TRUTH FOR RESIZING + FITTING
// ------------------------------------------------------------
function resizeAndFitCanvas() {
  if (!canvas) return;

  const wrapper = canvas.wrapperEl;

  // Force wrapper to fill its container
  wrapper.style.width = "100%";
  wrapper.style.height = "100%";

  // Force both Fabric canvases to fill wrapper
  canvas.lowerCanvasEl.style.width = "100%";
  canvas.lowerCanvasEl.style.height = "100%";
  canvas.upperCanvasEl.style.width = "100%";
  canvas.upperCanvasEl.style.height = "100%";

  // Sync Fabric internal size
  canvas.setWidth(wrapper.clientWidth);
  canvas.setHeight(wrapper.clientHeight);

  // Fix hit‑testing offsets
  canvas.calcOffset();

  // Re-fit hive map
  fitCanvasToScreen();
}

// ------------------------------------------------------------
// Create a hive (Fabric group)
// ------------------------------------------------------------
App.Canvas.createHive = function (name, width, height) {

  // Ensure canvas is fitted BEFORE placing the hive
  if (typeof resizeAndFitCanvas === "function") {
    resizeAndFitCanvas();
  }

  const pt = canvas.getPointer({ clientX: 500, clientY: 80 });

  const rect = new fabric.Rect({
    width,
    height,
    fill: "#fff",
    stroke: "#000",
    strokeWidth: 1,
    originX: "center",
    originY: "center"
  });

  const label = new fabric.Text(name, {
    fontSize: 14,
    fontFamily: "Arial, sans-serif",
    underline: true,
    originX: "center",
    originY: "center",
    fill: "#000"
  });

  const group = new fabric.Group([rect, label], {
    left: pt.x,
    top: pt.y,
    hasControls: true,
    lockScalingX: true,
    lockScalingY: true,
    lockUniScaling: true,
    lockSkewingX: true,
    lockSkewingY: true,
    hiveData: {
      name,
      hiveType: "Hive",
      inspections: [],
      boxes: [],
      status: "active",
      apiaryId: App.Apiaries.currentApiaryId
    }
  });

  group.setControlsVisibility({
    mt:false, mb:false, ml:false, mr:false,
    tl:false, tr:false, bl:false, br:false,
    mtr:true
  });

  group.on("mousedblclick", () => App.Modals.openHiveModal(group));

  canvas.add(group);
  canvas.setActiveObject(group);

  App.Canvas.requestRender();
  App.Canvas.saveLayout();
  App.Notes.load();
  App.Status.renderLegend();
  App.Stats.update();
};

App.Canvas.getAllHives = function () {
  if (!canvas) return [];
  return canvas.getObjects().filter(o => o.hiveData);
};

App.Canvas.getHiveData = function (obj) {
  if (!obj) return null;

  // Prefer hiveData on the group itself
  if (obj.hiveData) return obj.hiveData;

  // Otherwise check children (older hives)
  if (obj._objects && Array.isArray(obj._objects)) {
    for (const child of obj._objects) {
      if (child.hiveData) return child.hiveData;
    }
  }

  return null;
};

// ------------------------------------------------------------
// Tooltip handler
// ------------------------------------------------------------
App.Canvas.handleTooltip = function (options) {
  if (!options.target || !options.target.hiveData) {
    tooltip.style.display = "none";
    return;
  }

  // hiveData object
  const hive = options.target.hiveData;

  // latest inspection
  const inspections = hive.inspections || [];
const latest = inspections[inspections.length - 1] || {};


  tooltip.style.left = (options.e.pageX + 10) + "px";
  tooltip.style.top = (options.e.pageY + 10) + "px";

  tooltip.innerHTML = `
  Memo: <strong>${hive.memo || "N/A"}</strong><br>
    Hive ID: <strong>${hive.name}</strong><br>
       Status: <strong>${latest.queenStatus || "N/A"}</strong><br>
        Last Inspected: <strong>${App.Utils.formatDateUK(latest.date) || "N/A"}</strong><br>
    Next Inspection Due: <strong>${App.Utils.formatDateUK(hive.nextInspectionDate) || "N/A"}</strong><br>
    Hive type: <strong>${hive.hiveType || "N/A"}</strong><br>
    Boxes: <strong>${hive.boxes.map(b => `- ${b.type} x${b.count}`).join("<br>") || "N/A"}</strong>

 
  `;

  tooltip.style.display = "block";
};



// ------------------------------------------------------------
// Save layout to storage
// ------------------------------------------------------------
App.Canvas.saveLayout = function () {
  const current = Storage.getCurrentApiary();
  if (!current) return;

  const json = canvas.toJSON(["hiveData"]); // ONLY hiveData is safe

  Storage.saveHiveLayout(current, JSON.stringify(json));
};

// ------------------------------------------------------------
// Load layout from storage
// ------------------------------------------------------------
App.Canvas.loadLayout = function () {
  const current = Storage.getCurrentApiary();
  if (!current) return;

  const json = Storage.getHiveLayout(current);
  canvas.clear();

  if (!json) {
    App.Canvas.requestRender();
    return;
  }

canvas.loadFromJSON(json, () => {

  canvas.getObjects().forEach(obj => {
    if (obj.type === "group" && obj.hiveData) {

      if (!obj.hiveData.status) {
        obj.hiveData.status = "active";
      }

      if (obj.hiveData.status === "archived") {
        obj.visible = false;
        return;
      }

      // ⭐ Ensure required arrays exist (prevents tooltip crash)
      obj.hiveData.inspections = obj.hiveData.inspections || [];
      obj.hiveData.boxes = obj.hiveData.boxes || [];

      // ⭐ Restore modal behaviour
      obj.on("mousedblclick", () => App.Modals.openHiveModal(obj));

      // ⭐ Restore control visibility (remove resize handles)
      obj.setControlsVisibility({
        mt:false, mb:false, ml:false, mr:false,
        tl:false, tr:false, bl:false, br:false,
        mtr:true
      });

      // ⭐ Ensure scaling is locked
      obj.lockScalingX = true;
      obj.lockScalingY = true;
      obj.lockUniScaling = true;
    }
  });

  App.Canvas.requestRender();

  setTimeout(() => {
    resizeAndFitCanvas();
  }, 50);
});

};



// ------------------------------------------------------------
// Get list of hive names (for duplicate checks)
// ------------------------------------------------------------
App.Canvas.getHiveNames = function () {
  return canvas.getObjects()
    .filter(o => o.hiveData)
    .map(o => String(o.hiveData.name).trim());
};


// ------------------------------------------------------------
// Delete selected hives
// ------------------------------------------------------------
App.Canvas.deleteSelected = function () {
  const active = canvas.getActiveObjects();
  if (!active.length) {
    alert("No hive selected.");
    return;
  }

  if (!confirm(`Delete ${active.length} selected hive(s)? This cannot be undone.`)) return;

  active.forEach(obj => canvas.remove(obj));

  canvas.discardActiveObject();
  App.Canvas.requestRender();
  App.Canvas.saveLayout();
  App.Stats.update();
};


// ------------------------------------------------------------
// Underline all hive labels
// ------------------------------------------------------------
App.Canvas.underlineLabels = function () {
  canvas.getObjects().forEach(obj => {
    if (obj.type === "group" && obj._objects[1] instanceof fabric.Text) {
      obj._objects[1].set({ underline: true });
    }
  });
  App.Canvas.requestRender();
};


// ------------------------------------------------------------
// Print apiary canvas + inspection cards
// ------------------------------------------------------------
App.Canvas.print = function () {
  const apiaryName = Storage.getCurrentApiary() || "Untitled Apiary";

  // Disable controls for clean snapshot
  const prev = canvas.getObjects().map(o => ({
    obj: o,
    hasControls: o.hasControls,
    hasBorders: o.hasBorders,
    selectable: o.selectable,
    hoverCursor: o.hoverCursor
  }));

  canvas.getObjects().forEach(o => {
    o.hasControls = false;
    o.hasBorders = false;
    o.selectable = false;
    o.hoverCursor = "default";
  });

  canvas.discardActiveObject();
  App.Canvas.requestRender();

  const dataURL = canvas.toDataURL({ format: "png", multiplier: 2 });

  // Restore state
  prev.forEach(s => {
    s.obj.hasControls = s.hasControls;
    s.obj.hasBorders = s.hasBorders;
    s.obj.selectable = s.selectable;
    s.obj.hoverCursor = s.hoverCursor;
  });
  App.Canvas.requestRender();

  const win = window.open("", "_blank");

  const objects = canvas.getObjects().filter(o => o.hiveData);
  objects.sort((a, b) => (a.hiveData.name || "").localeCompare(b.hiveData.name || ""));

  let cardsHTML = "";
  objects.forEach(o => {
    const data = o.hiveData;
    const inspections = data.inspections || [];
    const last = inspections[inspections.length - 1];

    cardsHTML += `
      <div class="hive-card">
        <div class="hc-title">${data.name}</div>
        <div class="hc-item"><strong>Last:</strong> ${last ? last.date : "—"}</div>
        <div class="hc-item"><strong>Status:</strong> ${last?.queenStatus || "—"}</div>
        <div class="hc-item"><strong>Notes:</strong> ${last?.notes || "—"}</div>
      </div>
    `;
  });

  const dateStr = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  win.document.write(`
    <html>
    <head>
      <title>Print Apiary</title>
      <style>
        body { margin: 0; font-family: sans-serif; }
        img { width: 100%; display: block; margin-bottom: -50px; }
        .stamp {
          position: absolute;
          right: 12px;
          top: 12px;
          padding: 6px 10px;
          background: rgba(255,255,255,0.85);
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 12px;
        }
        .cards {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 10px;
        }
        .hive-card {
          border: 1px solid #000;
          padding: 6px;
          width: 120px;
          font-size: 11px;
          box-sizing: border-box;
        }
        .hc-title {
          font-weight: bold;
          margin-bottom: 4px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <img id="printImg" src="${dataURL}">
      <div class="stamp">${apiaryName} — ${dateStr}</div>
      <div class="cards">${cardsHTML}</div>
    </body>
    </html>
  `);

  win.document.close();

  win.document.getElementById("printImg").onload = () => {
    win.focus();
    win.print();
  };
};


// ------------------------------------------------------------
// Request canvas render
// ------------------------------------------------------------
App.Canvas.requestRender = function () {
  if (canvas) canvas.requestRenderAll();
};


// ------------------------------------------------------------
// Expose canvas for debugging if needed
// ------------------------------------------------------------
App.Canvas.get = function () {
  return canvas;
};
