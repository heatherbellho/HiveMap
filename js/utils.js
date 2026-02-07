// ------------------------------------------------------------
// utils.js
// Shared helper utilities used across modules
// ------------------------------------------------------------

window.App = window.App || {};
App.Utils = {};

// ------------------------------------------------------------
// Format a date string as DD/MM/YYYY (UK format)
// ------------------------------------------------------------
App.Utils.formatDateUK = function (dateString) {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (isNaN(d)) return "Invalid date";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

// ------------------------------------------------------------
// Safe JSON parse (returns fallback on error)
// ------------------------------------------------------------
App.Utils.safeJSON = function (str, fallback = {}) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

// ------------------------------------------------------------
// Generate a unique ID (for future expansion if needed)
// ------------------------------------------------------------
App.Utils.uid = function () {
  return "id-" + Math.random().toString(36).substr(2, 9);
};
