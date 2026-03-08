/*
 * ------------------------------------------------------------
 *  © 2026 Heather Bell Honey Bees Ltd. All rights reserved.
 *
 *  This file is part of the HiveMap© software system.
 *  Unauthorized copying, modification, distribution, or use
 *  of this file, via any medium, is strictly prohibited.
 *
 *  Proprietary and confidential.
 * ------------------------------------------------------------
 */ 

// ------------------------------------------------------------
// stats.js
// Computes hive status counts per apiary and renders the
// statistics panel in the sidebar.
// ------------------------------------------------------------

window.App = window.App || {};
App.Stats = {};


// ------------------------------------------------------------
// Compute hive stats across all apiaries
// ------------------------------------------------------------
App.Stats.update = function () {
  const stats = {};
  const allApiaries = Storage.getAllApiaries();

  let totalNonQuery = 0;
  let totalQuery = 0;

  allApiaries.forEach(apiary => {
    const raw = Storage.getHiveLayout(apiary);
    const layout = raw ? JSON.parse(raw) : {};
    const objects = layout.objects || [];

    let countNonQuery = 0;
    let countQuery = 0;

    objects.forEach(obj => {
      const hive = obj?.hiveData;
      if (!hive) return;
      if (hive.status === "archived") return;

      let status = "";

      // Last inspection status
      if (hive.inspections && hive.inspections.length > 0) {
        status = hive.inspections[hive.inspections.length - 1].queenStatus || "";
      }
      // Fallback to hive-level status
      else if (hive.queenStatus) {
        status = hive.queenStatus;
      }

      // ⭐ NEW LOGIC: count new hives as OK
      if (!status) {
        countNonQuery++;
      } else if (status.toLowerCase().includes("query")) {
        countQuery++;
      } else {
        countNonQuery++;
      }
    });

    stats[apiary] = { nonQuery: countNonQuery, query: countQuery };

    totalNonQuery += countNonQuery;
    totalQuery += countQuery;
  });

  App.Stats.render(stats, totalNonQuery, totalQuery);
};


// ------------------------------------------------------------
// Render the stats panel
// ------------------------------------------------------------
App.Stats.render = function (stats, totalNonQuery, totalQuery) {
  const panel = document.getElementById("hiveStatsContent");
  if (!panel) return;

  // Clear the side panel completely
  panel.innerHTML = "";

  // ---- Update toolbar counts ----
  const current = Storage.getCurrentApiary();
  const s = stats[current] || { nonQuery: 0, query: 0 };

  const toolbarApiary = document.getElementById("toolbarApiaryCounts");
  const toolbarOverall = document.getElementById("toolbarOverallCounts");

  if (toolbarApiary) {
    toolbarApiary.textContent = `Apiary: ${s.nonQuery} OK (${s.query} Query)`;
  }

  if (toolbarOverall) {
    toolbarOverall.textContent = `Total: ${totalNonQuery} OK (${totalQuery} Query)`;
  }
  // --------------------------------
};

// ------------------------------------------------------------
// Initialise stats system
// ------------------------------------------------------------
App.Stats.init = function () {
  App.Stats.update();
};
