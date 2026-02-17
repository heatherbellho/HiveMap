// js/storage.js

const Storage = {

  /* ------------------ QUEEN STATUSES ------------------ */
  getQueenStatuses() {
    return JSON.parse(localStorage.getItem('queenStatuses')) || [
      { name: 'Marked', color: '#bdf' },
      { name: 'Unmarked', color: '#ffd' },
      { name: 'Missing', color: '#fbb' },
      { name: 'Default', color: '#cfc' }
    ];
  },

  saveQueenStatuses(statuses) {
    localStorage.setItem('queenStatuses', JSON.stringify(statuses));
  },


  /* ------------------ HIVE TYPES ------------------ */
  getHiveTypes() {
    return JSON.parse(localStorage.getItem('hiveTypes')) || ['N/A'];
  },

  saveHiveTypes(list) {
    localStorage.setItem('hiveTypes', JSON.stringify(list));
  },


  /* ------------------ APIARIES ------------------ */
  getAllApiaries() {
    return JSON.parse(localStorage.getItem('allApiaries') || '[]');
  },

saveAllApiaries(list) {
  localStorage.setItem('allApiaries', JSON.stringify(list));
},

  getCurrentApiary() {
    return localStorage.getItem('currentApiary') || null;
  },

  saveCurrentApiary(name) {
    localStorage.setItem('currentApiary', name);
  },


  /* ------------------ APIARY NOTES (STRUCTURED) ------------------ */
  getApiaryNotes(apiaryName) {
    // Always return a JSON array string, never empty string
    return localStorage.getItem('apiaryNotes_' + apiaryName) || "[]";
  },

  saveApiaryNotes(apiaryName, notesString) {
    localStorage.setItem('apiaryNotes_' + apiaryName, notesString);
  },

  saveApiaryGrid(apiaryName, value) {
  localStorage.setItem('apiaryGrid_' + apiaryName, value);
  },

  getApiaryGrid(apiaryName) {
    return localStorage.getItem('apiaryGrid_' + apiaryName) || "";
  },

  saveApiaryAddress(apiaryName, value) {
    localStorage.setItem('apiaryAddress_' + apiaryName, value);
  },

  getApiaryAddress(apiaryName) {
    return localStorage.getItem('apiaryAddress_' + apiaryName) || "";
  },


  /* ------------------ HIVE LAYOUTS ------------------ */
  getHiveLayout(apiary) {
    return localStorage.getItem('hiveLayout_' + apiary) || null;
  },

  saveHiveLayout(apiary, json) {
    localStorage.setItem('hiveLayout_' + apiary, json);
  },

  deleteHiveLayout(apiary) {
    localStorage.removeItem('hiveLayout_' + apiary);
  },


  /* ------------------ INSPECTION SCHEMA ------------------ */
  getInspectionSchema() {
    const raw = localStorage.getItem('inspectionSchema');
    return raw ? JSON.parse(raw) : null;
  },

  saveInspectionSchema(schema) {
    localStorage.setItem('inspectionSchema', JSON.stringify(schema));
  },

};

window.Storage = Storage;
