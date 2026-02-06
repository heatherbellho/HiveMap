// js/storage.js

const Storage = {

  /* ------------------ QUEEN STATUSES ------------------ */
  getQueenStatuses() {
    return JSON.parse(localStorage.getItem('queenStatuses')) || [
      { name: 'Default', color: 'rgb(136, 188, 239)' },
      { name: 'Queen Right', color: 'rgb(139, 231, 139)' },
      { name: 'Queen Cell', color: 'rgb(251, 207, 118)' },
      { name: 'Query', color: 'rgb(241, 152, 152)' }      
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


  /* ------------------ APIARY NOTES ------------------ */
  getApiaryNote(apiary) {
    return localStorage.getItem('apiaryNote_' + apiary) || '';
  },

  saveApiaryNote(apiary, note) {
    localStorage.setItem('apiaryNote_' + apiary, note);
  },

  deleteApiaryNote(apiary) {
    localStorage.removeItem('apiaryNote_' + apiary);
  },

  /* ------------------ STRUCTURED APIARY NOTES (NEW) ------------------ */
  getApiaryNotes(apiary) {
    const raw = localStorage.getItem('apiaryNotes_' + apiary);
    return raw ? JSON.parse(raw) : null;
  },

  saveApiaryNotes(apiary, notes) {
    localStorage.setItem('apiaryNotes_' + apiary, JSON.stringify(notes));
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