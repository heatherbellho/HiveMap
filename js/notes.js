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
// notes.js
// Structured apiary notes with text + date + delete
// ------------------------------------------------------------

window.App = window.App || {};
App.Notes = {};

// ------------------------------------------------------------
// Load notes for the current apiary
// ------------------------------------------------------------
App.Notes.load = function () {
  const apiary = Storage.getCurrentApiary();
  if (!apiary) return;

  // Load raw note (old format)
  const oldNote = Storage.getApiaryNote(apiary);

  // Load structured notes (new format)
  let notes = Storage.getApiaryNotes
    ? Storage.getApiaryNotes(apiary)
    : null;

  // If structured notes don't exist, migrate from old textarea
if (!notes) {
  notes = [];

  // Migrate old single-note format (even if empty)
  if (oldNote !== null && oldNote !== undefined) {
    oldNote.split("\n").forEach(line => {
      const trimmed = line.trim();
      if (trimmed !== "") {
        notes.push({
          text: trimmed,
          date: ""
        });
      }
    });
  }

  // Always create structured notes array
  Storage.saveApiaryNotes(apiary, notes);
}


  App.Notes.render(notes);
};

// ------------------------------------------------------------
// Render notes list
// ------------------------------------------------------------
App.Notes.render = function (notes) {
    // Sort newest first
  notes.sort((a, b) => {
    const da = a.date ? new Date(a.date) : 0;
    const db = b.date ? new Date(b.date) : 0;
    return db - da; // newest first
  });

  const list =
    document.getElementById("apiaryNotesListModal") ||
    document.getElementById("apiaryNotesList");

  if (!list) return;

// Sort: most recent date first, undated notes last
notes.sort((a, b) => {
  const da = a.date ? new Date(a.date) : null;
  const db = b.date ? new Date(b.date) : null;

  if (da && db) return db - da;   // both dated → newest first
  if (da) return -1;              // a has date, b doesn't → a first
  if (db) return 1;               // b has date, a doesn't → b first
  return 0;                       // neither dated → keep original order
});

  list.innerHTML = "";

  notes.forEach((note, index) => {
    const row = document.createElement("div");
    row.className = "apiary-note-row";

row.innerHTML = `
  <div class="apiary-note-date-display">
    ${note.date ? App.Utils.formatDateUK(note.date) : "<span class='no-date'>No date</span>"}
  </div>
  <div class="apiary-note-text">${note.text}</div>
  <button class="small-delete" data-index="${index}" type="button">×</button>
`;


    list.appendChild(row);
  });

  // Attach delete handlers
list.querySelectorAll(".small-delete").forEach(btn => {
  btn.addEventListener("click", e => {
    const apiary = Storage.getCurrentApiary();
    let notes = Storage.getApiaryNotes(apiary);

    // Sort notes the same way as render()
    notes.sort((a, b) => {
      const da = a.date ? new Date(a.date) : null;
      const db = b.date ? new Date(b.date) : null;

      if (da && db) return db - da;
      if (da) return -1;
      if (db) return 1;
      return 0;
    });

    const i = parseInt(e.target.dataset.index, 10);

    notes.splice(i, 1);
    Storage.saveApiaryNotes(apiary, notes);
    App.Notes.render(notes);
  });
});

};

// ------------------------------------------------------------
// Add a new note
// ------------------------------------------------------------
App.Notes.add = function () {
  console.log("App.Notes.add called");
  const apiary = Storage.getCurrentApiary();
  if (!apiary) return;

  const textEl = document.getElementById("apiaryNoteInputModal");
  const dateEl = document.getElementById("apiaryNoteDateInputModal");
  if (!textEl || !dateEl) return;

  const text = textEl.value.trim();
  const date = dateEl.value;

  if (!text) return;

  const notes = Storage.getApiaryNotes(apiary) || [];
  notes.push({ text, date });

  Storage.saveApiaryNotes(apiary, notes);

  textEl.value = "";
  dateEl.value = "";

  App.Notes.render(notes);
  App.Notes.closeModal();
};


// ------------------------------------------------------------
// Modal controls for Apiary Notes
// ------------------------------------------------------------
App.Notes.openModal = function () {
  document.getElementById("apiaryNotesModal").style.display = "block";
  document.getElementById("overlay").style.display = "block";

  App.Notes.load();

  // Clear the correct input
  const input = document.getElementById("apiaryNoteInputModal");
  if (input) input.value = "";

  // Optional: clear date too
  const dateInput = document.getElementById("apiaryNoteDateInputModal");
  if (dateInput) dateInput.value = "";
};

App.Notes.closeModal = function () {
  document.getElementById("apiaryNotesModal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
};

App.Notes.init = function () {
  const addBtn = document.getElementById("apiaryNoteAddBtn");
  if (addBtn) addBtn.addEventListener("click", App.Notes.add);

  const addBtnAccordion = document.getElementById("apiaryNoteAddBtn");
if (addBtnAccordion) addBtnAccordion.addEventListener("click", App.Notes.add);

const addBtnModal = document.getElementById("apiaryNoteAddBtnModal");
if (addBtnModal) addBtnModal.addEventListener("click", App.Notes.add);


  const openBtn = document.getElementById("openApiaryNotesBtn");
  if (openBtn) openBtn.addEventListener("click", App.Notes.openModal);

  const closeBtn = document.getElementById("closeApiaryNotesBtn");
  if (closeBtn) closeBtn.addEventListener("click", App.Notes.closeModal);

  const overlay = document.getElementById("overlay");
  if (overlay) overlay.addEventListener("click", App.Notes.closeModal);
};

document.addEventListener("DOMContentLoaded", () => {
  App.Notes.init();
});

