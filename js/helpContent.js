// -----------------------------
// HELP CONTENT SECTIONS (METADATA FORMAT)
// -----------------------------

window.HELP_SECTIONS = [

  {
    id: "help-hivemap",
    title: "About HiveMap",
    html: `
      <h3 id="help-hivemap">About HiveMap</h3>

      <p>Maintaining good records is a must for good colony management and a valuable learning tool. Keeping records of veterinary treatments is also a legal requirement in many countries.</p>

      <p>Over nearly 30 years as professional bee farmers we have trialled numerous systems and commercial products but never found something that worked for us. It can be a challenge to find a system that truly fits how you manage your bees.</p>

      <p>We created the first simple iteration of HiveMap nearly 10 years ago to help us manage our own apiaries and hives. We wanted a simple, visual way to organise our hives and keep track of inspections and notes without needing to rely on internet access.</p>

      <p>HiveMap is a browser-based tool for organising and managing apiaries, beehives and records. It is designed to be simple and intuitive to use, with a focus on visual organisation and easy access to hive information.</p>

      <p>HiveMap is specifically designed for offline use — no internet access is required. Everything you create is stored locally on your device so your data stays private and loads instantly. All your data can be exported as a single file backup to import and use on other devices.</p>

      <p><strong>HiveMapFree</strong> edition is free to use, limited to 1 apiary and 1 hive but is fully functional.<br>
      <strong>HiveMapPlus</strong> edition is subscription based with unlimited apiaries and hives.<br>
      Development is ongoing, with updates and new features that make it a work in progress.</p>

      <p>HiveMapFree and HiveMapPlus are &copy; products of 
      <a href="https://cornishhoney.co.uk" target="_blank"><strong>Heather Bell Honey Bees Ltd</strong></a>.
      <br>
      For support, feedback, or to suggest new features, please 
      <a href="https://cornishhoney.co.uk/email_us.php" target="_blank"><strong>Contact Us</strong></a>.
      </p>

      <hr>
    `
  },

{
    id: "help-quick",
    title: "Quick Start",
    html: `
      <h3 id="help-quick">Quick Start</h3>

      <p>You will have received an email with a link to your HiveMap dashboard. From there you can open HiveMap in your browser and start using it.</p>
      <p>You will 
      Select or create an Apiary.

      Add a hive using Hives → New Hive.

      Drag the hive in the green area to match its real position.

      Double-click the hive to add an inspection.

      Set the Next Inspection Date.

      Watch the inspection alert icon for reminders.

      Use Tools → Export Data occasionally to back up your records.

      <hr>
    `
},

  {
    id: "help-start",
    title: "Getting Started",
    html: `
      <h3 id="help-start">Getting Started - the Toolbar</h3>

      <p>Use <strong>Select Apiary</strong> in the toolbar, or create a new apiary using the <strong>Apiary</strong> menu.</p>
      <p>Click <strong>Apiary Notes</strong> to see and add notes for the selected apiary.</p>

      <p><strong>Apiary Count</strong> shows the number of hives for the selected apiary separately for hives where status is not equal to Query and for hives where status equals Query.</p>
      <p><strong>Total Count</strong> shows the total number of hives across all apiaries.</p>

      <p>If any hives have a <strong>Next Inspection Date</strong> set,
        <svg class="warning-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M1 21h22L12 2 1 21z" fill="#fff" stroke="#dd0000" stroke-width="1" />
          <path d="M12 8v6" stroke="#000" stroke-width="2" stroke-linecap="round" />
          <circle cx="12" cy="17" r="1.5" fill="#000" />
        </svg>
        appears with the number of hives with due inspections.<br>
        Click this to show a list of hives with due inspections grouped by apiary and ordered by date.
      </p>

      <p>Use the <strong>Apiary</strong> menu to:<br>
        - Create a <strong>New Apiary</strong>.<br>
        - <strong>Rename Apiary</strong> that is selected.<br>
        - <strong>Delete Apiary</strong> that is selected.<br>
        - <strong>Print Apiary</strong> that is selected which opens a print window to print the apiary layout and cards for each hive.
      </p>

      <p>Use the <strong>Hives</strong> menu to:<br>
        - Create a <strong>New Hive</strong>.<br>
        - <strong>Delete Hive</strong> that is selected.
      </p>

      <p>Use the <strong>Tools</strong> menu to:<br>
        - <strong>Export Data</strong> (save all your apiaries and hives to a JSON file).<br>
        - <strong>Import All Data</strong> (load from a previously exported JSON file).<br>
        - <strong>Edit Status Colours</strong> to create or edit hive statuses and their colours.<br>
        - Open this <strong>Help</strong> panel.
      </p>

      <hr>
    `
  },

  {
    id: "help-editing",
    title: "Editing Hives",
    html: `
      <h4 id="help-editing">Editing Hives</h4>
      <p>Double-click a hive to open its inspection panel. Add boxes, notes, and inspection history.</p>
    `
  },

  {
    id: "help-notes",
    title: "Notes",
    html: `
      <h4 id="help-notes">Notes</h4>
      <p>Use the “Apiary Notes” button in the toolbar to record notes for the whole apiary.</p>
    `
  },

  {
    id: "help-status",
    title: "Status Colours",
    html: `
      <h4 id="help-status">Status Colours</h4>
      <p>Edit hive status colours from Tools → Edit Status Colours.</p>
    `
  },

  {
    id: "help-saving",
    title: "Saving Your Data",
    html: `
      <h4 id="help-saving">Saving Your Data</h4>
      <p>Use Tools → Export Data to save everything before closing. Import restores your full setup.</p>
    `
  }

];


// -----------------------------
// COMBINED HELP CONTENT
// -----------------------------

window.HELP_CONTENT = window.HELP_SECTIONS
  .map(section => section.html)
  .join("\n");
