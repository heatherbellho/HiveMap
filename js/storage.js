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

// js/storage.js

const Storage = {

  /* ------------------ QUEEN STATUSES ------------------ */
  getQueenStatuses() {
    return JSON.parse(localStorage.getItem('queenStatuses')) || [
      { name: 'Queenless', color: '#bbddff' },
      { name: 'Query', color: '#ffffdd' },
      { name: 'Queen Cells', color: '#ffbbbb' },
      { name: 'Queenright', color: '#ccffcc' }
    ];
  },

  saveQueenStatuses(statuses) {
    localStorage.setItem('queenStatuses', JSON.stringify(statuses));
  },

/* ------------------ HIVE TYPES ------------------ */
getHiveTypes() {
  const raw = localStorage.getItem('hiveTypes');
  return raw ? JSON.parse(raw) : ['N/A'];
},

saveHiveTypes(list) {
  localStorage.setItem('hiveTypes', JSON.stringify(list));
},


  /* ------------------ HIVE BOX TYPES ------------------ */
getBoxTypes() {
  return JSON.parse(localStorage.getItem('boxTypes')) || [
    "Standard Deep 11",
    "Extra Deep 11",
    "Standard Shallow"
  ];
},

saveBoxTypes(list) {
  localStorage.setItem('boxTypes', JSON.stringify(list));
},


  /* ------------------ HIVE COUNT SEPARATION SETTINGS ------------------ */
  getHiveCountSettings() {
    return JSON.parse(localStorage.getItem('hiveCountSettings')) || {
      mode: 'none',            // 'none' | 'queryStatus' | 'specificStatus'
      status: null             // used only when mode === 'specificStatus'
    };
  },

  saveHiveCountSettings(obj) {
    localStorage.setItem('hiveCountSettings', JSON.stringify(obj));
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

  /* ------------------ FORAGE RECORDS ------------------ */
  getForageRecords(apiaryName) {
    if (!apiaryName) return [];

    const raw = localStorage.getItem('forageRecords_' + apiaryName);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveForageRecords(apiaryName, records) {
    if (!apiaryName) return;
    const safeRecords = Array.isArray(records) ? records : [];
    localStorage.setItem('forageRecords_' + apiaryName, JSON.stringify(safeRecords));
  },

  upsertForageRecord(apiaryName, record) {
    if (!apiaryName || !record || !record.id) return;

    const records = Storage.getForageRecords(apiaryName);
    const idx = records.findIndex(r => r?.id === record.id);

    if (idx === -1) {
      records.push(record);
    } else {
      records[idx] = { ...records[idx], ...record };
    }

    Storage.saveForageRecords(apiaryName, records);
  },

  deleteForageRecord(apiaryName, recordId) {
    if (!apiaryName || !recordId) return;

    const records = Storage.getForageRecords(apiaryName)
      .filter(r => r?.id !== recordId);

    Storage.saveForageRecords(apiaryName, records);
  },

  deleteForageRecords(apiaryName) {
    if (!apiaryName) return;
    localStorage.removeItem('forageRecords_' + apiaryName);
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
