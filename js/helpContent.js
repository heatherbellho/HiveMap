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

      <p>Over many years as professional bee farmers we have trialled numerous systems and commercial products but never found something that worked for us. It can be a challenge to find a system that truly fits the practicalities of beekeeping.<br>
      Paper record sheets kept with hives still have their uses. Spreadsheets work for data entry and display but have their limitations as a visual tool. So we created the first simple iteration of HiveMap to help us manage our own apiaries and hives ussing a simple, visual way to organise our hives and keep track of inspections and notes while not relying on internet access.</p>

      <p>HiveMap is a browser-based tool for organising and managing apiaries, beehives and records. It is designed to be simple and intuitive to use, with a focus on visual organisation and easy access to hive information.</p>

      <p>HiveMap is specifically designed for offline use — no internet access is required. Everything you create is stored locally on your device so your data stays private and loads instantly but everything can also be exported as a single backup file to import and use on other devices.</p>

      <p><strong>HiveMap Free</strong> edition is limited to 1 apiary and 1 hive but is fully functional.<br>
      <strong>HiveMap Plus</strong> edition supports unlimited apiaries and hives.</p>

      <p>Both editions operate using a subscription licence key with an expiry date. When your licence expires, you will need to renew or enter a new valid key to continue using HiveMap.</p>

      <p>Development is ongoing, with updates and new features that make it a work in progress.</p>

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
    id: "help-overview",
    title: "Overview",
    html: `
      <h4 id="help-overview">Overview</h4>
      <p>HiveMap is divided into two main sections, the Toolbar and Field View.</p>
      <p>The Toolbar is at the top of the screen and contains buttons and menus for managing apiaries, hives, and other features.</p>
      <p>The Field View is the main visual area. Think of it as an aerial view of your apiary where you can position and organise your hives visually as they are in the real apiary. It also gives you an immediate overview of hive details and colony status.</p>
    `
  },

{
    id: "help-quick",
    title: "Quick Start",
    html: `
      <h3 id="help-quick">Quick Start</h3>

      <p>You will have received an e-mail from us with a link to HiveMap and/or a license key.<br>
       HiveMap will open in your browser and you'll be prompted to enter your license key. Once entered, you can start using HiveMap.<br>
       You check the status</p>
       <ul>
       <li>Create an apiary using Apiary Manager → New Apiary.<br>
       A panel will open to set up the apiary.<br>
       Enter Apiary Name and optional Grid Location and Address.<br>
       Multiple Dated Notes can be added [+] at any time and they will be stored here.<br>
       The Apiary name and other data can be edited at any time using Apiary Manager.</li>

      <li>Add a hive using Hives → New Hive.<br>
      First use Select Apiary to add the hive to. Then click New Hive and a panel will open to set up the hive.<br>
      Choose a Tile Size in the menu or enter a Custom size. This determines the size of the hive in the 'green field' visual layout.<br>
      Enter a Hive Name/Number. Keep it short and meaningful, it will be shown on the hive in the visual layout.<br>
      Choose an Entrance Direction. This is used to help you orient the hive in the visual layout and can be changed later if needed. It will be shown simply on the hive in the visual layout as < or >.<br>
      Click Save and the Hive Tile will be immediately shown in the visual layout.</li>

      <li>Hover your cursor over a hive to see a tooltip with details.<br>
      Click the hive and a 'handle' will appear. Use this to rotate the hive around its center to match its real position.<br>
      Click and hold the mouse button to drag the hive within the green field to match its real position.
      </li>

      <li>Double click the hive and a panel will open to enter or edit the hive details.<br>
      This can also be accessed by clicking the Apiary: or Total: counts in the toolbar that shows a list of all hives.<br>
      Then click View in the list to open the same Edit Hive panel.</li>

    

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
