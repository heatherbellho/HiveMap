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

// -----------------------------
// HELP CONTENT SECTIONS (METADATA FORMAT)
// -----------------------------

window.HELP_SECTIONS = [

  {
    id: "help-hivemap",
    title: "About HiveMap",
    html: `
      <h2 id="help-hivemap">About HiveMap</h2>

      <p>Maintaining good records is a must for good colony management and a valuable learning tool. Keeping records of veterinary treatments is also a legal requirement in many countries.</p>

      <p>Over many years as professional bee farmers we have trialled numerous systems and commercial products but never found something that worked for us. It can be a challenge to find a system that truly fits the practicalities of beekeeping.<br>
      Paper record sheets kept with hives still have their uses. Spreadsheets work for data entry and display but have their limitations as a visual tool. So we created HiveMap to help us manage our own apiaries and hives to give a simple, visual way to see important data at-a-glance.</p>

      <p>Everything you create is stored locally on your device so your data stays private and loads instantly but everything can also be exported as a single backup file to import and use on other devices.</p>

      <p><strong>HiveMap Core</strong> edition is limited to 1 apiary and 1 hive but is fully functional.<br>
      <strong>HiveMap Plus</strong> edition supports unlimited apiaries and hives.</p>

      <p>Development is ongoing, with updates and new features that make it a work in progress.</p>

      <p>HiveMap Core and HiveMap Plus are &copy; products of 
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
      <h2 id="help-overview">Overview</h2>

      <p>HiveMap is divided into two main sections, the Toolbar and Field View.</p>
      <p>The Toolbar is at the top of the screen and contains buttons and menus for managing apiaries, hives, and other features.<br>
      Pressing buttons or menu items here will open panels on the screen to enter, edit or view data as well as giving access to other tools and features.</p>

      <p>The Field View is the main visual area. Think of it as an aerial view of your apiary where you can position and organise your hives visually as they are in the real apiary. It also gives you an immediate overview of hive details and colony status.</p>
      
      <p>How panels are displayed will depend on the size of the screen on your device and whether it is viewed as portrait or landscape. Some panels will be displaying a lot of data, sometimes with multiple sections or tables, so they are designed to be scrollable but some are best viewed in landscape mode or on larger devices.</p>
      
      <hr>
    `
  },

{
    id: "help-quick",
    title: "Quick Start",
    html: `
      <h2 id="help-quick">Quick Start</h2>

      <p>You will have received an e-mail from us with a link to HiveMap and/or a license code.<br>
      HiveMap will open in your browser and you'll be prompted to enter your license code. Once entered and saved, you can start using HiveMap.<br>
      When your licence expires, you will need to renew with a new valid code to continue using HiveMap.<br>
      Renewal can be done at any time and the new license period will be added to any period you have remaining.<br>
      You can check the status of your license at any time in the toolbar <b>Tools</b> menu - select <b>License</b>.
      <br>
      You can also see there what Edition and Version you are using.<br>
      A reminder will show next to the HiveMap logo in the toolbar when you have less than 7 days until expiry.</p>

      <p>When you first open HiveMap, your browser will show an option to install on your device so you can use HiveMap offline without the requirement for an internet connection.</p>

      <h3>Create an apiary</h3>

      Press the <b>Apiary</b> button in the toolbar - a panel will open to set up the apiary.<br>
      <p>For your first apiary, it will open in 'create' mode showing <b>Create Apiary</b> - otherwise press the <b>Create Apiary</b> button in the panel's top button toolbar to open 'create' mode.</p>

      <p>Enter <b>Apiary Name</b> and optional <b>Grid Location</b> and <b>Address</b>.</p>

      <p>Multiple dated <b>Notes</b> can also be added <b>[+]</b> at any time and they will be stored here.</p>

      <p>Press <b>Save</b> in the panel's bottom button toolbar. This data can be edited at any time using the <b>Apiary</b> button.</p>

      <p>Also in the panel's bottom button toolbar:<br>
      Press the <b>Add Compass</b> button will automatically add a compass to the apiary Field View. This can be dragged to position and rotated to set orientation.<br>
      Press the <b>Delete Compass</b> button to delete that compass and remove it from the Filed View.<br>
      Press the <b>Print Apiary</b> to create a snapshot of the apiary Field View together with labels for each hive showing basic data.</p>

      <p>This data can be edited at any time using the <b>Apiary</b> button.</p>

      <h3>Create a hive</h3>

      <p>First use <b>Select Apiary</b> in the toolbar to choose the apiary where the hive will be added.<br>
      Then press the <b>Hives</b> menu in the toolbar and select <b>Create Hive</b> - a panel will open to set up the hive.</p>

      <p>Choose a <b>Tile Size</b> or enter a Custom size. This determines the size of the hive as shown in the Field View.</p>

      <p>Enter a <b>Hive ID</b>. Keep it short and meaningful, it will be shown on the hive in Field View.<br>
      A new ID number will be auto suggested and a list of existing hive IDs will be shown to help avoid duplicates.</p>

      <p>Choose an <b>Entrance Direction</b>. This is used to help you orient the hive in the Field View and can be changed later if needed.<br>
      It will be shown simply on the hive in the Field View as <b><</b> or <b>></b>.<br>
      Press <b>Save</b> and the hive will be immediately shown in the Field View.</p>

      <p>Hover over or press a hive will instantlyreveal a pop-up with basic hive details.</p>

      <p>Position a hive in the Field View in 2 ways. Press the hive and a 'handle' will appear. Press and hold the handle and drag it to rotate the hive around its centre to match its real position. Press and hold the hive and drag it to match its real position.</p>

      <h3>Edit hive details and add a colony inspection.</h3>

      <p>Press twice quickly on the hive in the Field View and a panel will open to enter, edit and view more in-depth hive details.<br>
      This can also be accessed by pressing the <b>Apiary Hives:</b> or <b>Total Hives:</b> counts in the toolbar that will show a list of all hives.<br>
      Then press <b>View</b> in the list to open the same <b>Hive Details</b> panel.<br>
      This will show 'hive level' data and actions explained in the next section.</p>    

      <hr>
    `
},

  {
    id: "help-hivedetails",
    title: "Hive Details Panel",
    html: `
      <h2 id="help-hivedetails">Hive Details Panel</h2>

      <h3>In the top section of the Hive Details panel.</h3>

      <p>The <b>Hive ID</b> can be edited, press <b>Save</b> to change it.</p>

      <p>The <b>Apiary</b> shows the apiary where the hive is sited. This is read-only.</p>

      <p>There is an option to enter a short <b>Memo</b>. This will also show on the hive pop-up in the Field View and is a useful place to add a short note you want to see at a glance without needing to open the hive details panel. It can be edited at any time.</p>

      <h3>In the main section of the Hive Details panel.</h3>

      <p><b>Move to apiary</b> allows you to move the hive to a different apiary if needed.<br>
      Select the destination apiary in the dropdown menu and press <b>Move</b>. The screen will reload to show the hive in the new apiary.</p>

      <p><b>Hive Type</b> for the hive can be selected from the dropdown menu.<br>
      Set the items in the menu by pressing the <b>Settings</b> menu in the toolbar and selecting <b>Hive Types</b>.<br>
      Add whatever you require, National, W.B.C. etc. This will also show on the hive pop-up in the Field View.</p>

      <p><b>Hive Boxes</b> can be added from the dropdown menu. Select a box type in the menu and press <b>[+]</b>.<br>
      These will be listed above the input field as they are added to give a precide snapshot of the boxes that are being used.<br>
      They can easily be deleted by pressing the <b>[x]</b> button next to each box.<br>
      The items in the menu can be set by pressing the <b>Settings</b> menu in the toolbar and selecting <b>Box Types</b>.<br>
      Add whatever you require, Standard Deep, Standard Shallow etc. This is useful to exactly show the configuration of the hive and how many boxes it has at any time.<br>
      This will also show on the hive pop-up in the Field View.</p>

      <p><b>Treatment Records</b> can be added by pressing <b>Record Treatment</b>.<br>
      This opens a new <b>Record Treatment</b> panel that allows entry of all the details of a treatment that are necessary to comply with the Veterinary Medicines Regulations 2013 as set by the Veterinary Medicines Directorate (VMD) and which need to be kept for 5 years.<br>
      The date and product name of all treatments will be listed above the input field as they are added.<br>
      Press <b>Edit></b> to open a new panel to view/edit all the details of a treatment record or press <b>[x]</b> to delete it.<p>

      <p>All Treatment Records can also be viewed in a report.<br>
      Press the <b>Hives</b> menu in the toolbar and select<b>Treatments Report</b> to open a <b>Veterinary Medicines Report</b> panel. Optionally filter by apiary and date period and click <b>Generate Report</b> to show a list of all treatments for all hives grouped by apiary and ordered by date. Click <b>Print</b> to print a regulations compliant report for your bee disease inspector when required.</p>

      <p><b>Tile Size</b> and <b>Entrance</b> can also be edited, these were originally set when the hive was created.</p>

      <p>If inspections have been recorded for the hive, the <b>Inspections</b> section will show the date of when the <b>Next Inspection Due</b> is set, and a dated list of all inspections for the hive with brief details of each inspection.<br>
      Press <b>Details</b> next to each inspection to open a new panel to view/edit all the details of an inspection record or press <b>[x]</b> to delete it.</p>


      <hr>
    `
  },
  {
    id: "help-inspections",
    title: "Colony Inspections",
    html: `
      <h2 id="help-inspections">Colony Inspections</h2>
      <h3>Add Inspection button in the top button bar of the Hive Details panel.</h3>

      <p>This opens a new <b>Add Inspection</b> panel with input fields for all the details of an inspection that you can customise in the settings.<br>
      Press <b>Settings</b> menu in the toolbar and select <b>Inspection Fields</b> to add/remove, edit, reorder and set Groups and Fields within those Groups.<br>
      This is a powerful system to make your inspection records just right for your needs, the way you work and how much variety of data you want to keep as records of your inspections.</p>

      <p>Note that you can set <b>Honey weight unit</b> to your preference.<br>
      Then use this unit if/when entering <b>Honey Taken</b> in an inspection record.<br>
      This data can then be seen in a <b>Honey Harvest</b> graph.</p>

      <p>If/when entering data for <b>Forage</b> in an inspection record, use consistent plant names, for example, Clover, Bramble etc.<br>
      This only needs to be done for one hive inspection record per apiary to produce a <b>Forage</b> chart for each apiary.
      </p>

      <p>In the <b>Add Inspection</b> panel the date and time of the inspection will be auto set to the current date/time but can be edited if needed.</p>
      
      <p>Set the <b>Status</b> of the colony by selecting an item in the dropdown list. This will also change the colour of the hive shown in the Field View so it can be seen at a glance.<br>
      The legend of Statuses and their colours can be seen below the Field View.<br>
      This is a versatile system and can be used for whatever you want by setting Statuses in the toolbar <b>Setting</b> and selecting <b>Statuses</b>.<br>
      The default settings can be changed or deleted and additional statuses added. Press the colour picker to select any colour to assign to the status.
      </p>

      <p>The <b>Next Inspection Due</b> field is important to set if you want to keep track of when inspections are next due.<br>
      This date will show in the on the hive pop-up in the Field View.<br>
      It will also show in the lists that appear when <b>Apiary Hives</b> and <b>Total Hives</b> buttons are pressed.<br>
      If any hives have a next inspection due date set, a warning icon
      <svg class="warning-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M1 21h22L12 2 1 21z" fill="#fff" stroke="#dd0000" stroke-width="1" />
      <path d="M12 8v6" stroke="#000" stroke-width="2" stroke-linecap="round" />
      <circle cx="12" cy="17" r="1.5" fill="#000" />
      </svg> 
      will appear in the toolbar with a red badge showing the number of hives that have inspections due.<br>
      Press this icon to show a list of all hives with inspections due.<br>
      The <b>Next Due</b> dates will be colour coded for <b>Due Today</b>, <b>Overdue</b>, and <b>Due Future</b>.<br>
      The table list can be filtered by pressing the appropriate buttons in the button bar.<br>
      This is an essential tool to help inspection planning.</p>

      <hr>
    `
  },
  {
    id: "help-archive",
    title: "Archiving",
    html: `
      <h2 id="help-archive">Archiving</h2>
      <h3>Archive Hive button in the top button bar of the Hive Details panel.</h3>

      <p>Press the <b>Archive Hive</b> button.</p>
      <p>This will open a confirmation panel, press <b>Confirm Archive Hive</b> to confirm.</p>

      <p>Archiving a hive allows a hive to be removed from the Field View and all hive counts but still retain all its data and history.<br>
      This particularly useful for when a hive/colony has, for examples, been a loss, failed, died, given away or sold.<br>
      Enter/save that reason for archiving in the <b>Memo</b> of the <b>Hive Details</b> panel so it is easily seen in archived hive records.<br>
      Be sure to save any edits such as these before archiving. No edits can be made to an archived hive and archiving cannot be undone, they are permanent records but archived hives can be deleted.<br>
      Archived hives can be viewed in the toolbar <b>Hives</b>, select <b>Archived Hives</b> to see a table list of all archived hives.<br>
      Use the <svg class="icon"><use href="#icon-search"></use></svg> 'view' icon shown for each hive in the <strong>Archived Hives</strong> table list to open the hive details panel.<br>
      The hive can also be permanently deleted in that panel by pressing the <b>Delete</b> button.</p>

      <hr>
    `
  },

    {
    id: "help-graph",
    title: "Graphs & Charts",
    html: `
      <h2 id="help-graph">Graphs & Charts</h2>
      <h3><svg id="iconGraph" class="icon"><use href="#icon-graph"></use></svg> Honey button in the top button bar of the Hive Details panel.</h3>

      <p>Press the <svg id="iconGraph" class="icon"><use href="#icon-graph"></use></svg> Honey button.</p>
      <p>This will open a panel showing a graph for Honey Harvest.</p>
      <p>This data is taken from recorded hive inspections.<br>
      Go to <b>Settings</b> in the toolbar and select <b>Inspection Fields</b> to open the <b>Configure Inspection Fields</b> panel.<br>
      At the top of the panel, the preferred <b>Honey weight unit</b> can be set to use throughout.<br>
      If this is changed after data has already been recorded, the data will automatically be converted to reflect the new weight unit.</p>

      <p>Select from the <b>Scope</b> menu to show data for the current hive or the current apiary or all apiaries.<br>
      Select from the <b>Year</b> menu to choose which year from which to fetch data.<br>
      In this way, comparisons can be made across years.</p>

      <h3><svg class="icon"><use href="#icon-chart"></use></svg> Forage button in the top button bar of the <b>Apiary</b> panel.</h3>

      <p>If/when entering data for <b>Forage</b> in an inspection record, use consistent plant names, for example, Clover, Bramble etc.<br>
      This data can then be seen in a <b>Forage</b> chart. Press <b>Apiary</b> in the main toolbar and press the <svg class="icon"><use href="#icon-chart"></use></svg> Forage button to show the chart.<br>
      This will then show what forage is out, in what months over a year for the selected apiary. This builds a valuable source of knowledge to help plan management and compare year on year.
      </p>

      <hr>
    `
  },

  {
    id: "help-hivecounts",
    title: "Hive Counts",
    html: `
      <h2 id="help-notes">Hive Counts</h2>

      <p>There are two buttons in the toolbar: <b>Apiary Hives</b> and <b>Total Hives</b>.</p>

      <p><b>Apiary Hives</b> shows the total number of hives in the selected apiary.<br>
      <b>Total Hives</b> shows the total number of hives in all apiaries.</p>

      <p>These will open a table list of hives showing the Hive ID, Status, Date of Last Inspection, Next Inspection Due Date, Hive Type and Memo for every hive.<br>
      Press the <b>Archived</b> button to show archive hives.<br>
      Press the <b>All Hives</b> button to go back.<br>
      Press the <b>View</b> button shown in a hive row to open the <b>Hive Details</b> panel.</p>

      <p>The <b>Total Hives</b> table list will show the hive grouped by apiary.</p>

      <p>The default behaviour of the <b>Apiary Hives</b> and <b>Total Hives</b> is to display like <b>Apiary Hives: 7</b><br>
      A useful feature for at-a-glance information is changing this behaviour in <b>Settings</b> and selecting <b>Hive Counts</b>.<br>
      This will open a <b>Hive Counts</b> panel where you will see <b>Hive Count Separation</b> is set to <b>None</b>.<br>
      Select </b>By Status</b> and select a <b>Status</b> from the list.<br>
      For example, select <b>Queenless</b> from the list and save.<br>
      If one of your hives has its status set as Queenless the display in the buttons will change to <b>Apiary Hives: 7 (1 Queenless)</b>.</p>

      <hr>
    `
  },

  {
    id: "help-status",
    title: "Status Colours",
    html: `
      <h2 id="help-status">Status Colours</h2>

      <p>Edit hive status colours in the toolbar, select <b>Settings</b> and select <b>Statuses</b>.</p>

      <p>Existing status names and their assigned colours can be renamed/edited or deleted directly in the panel.</p>

      <p>Press <b>Add Status</b> to add as many statuses as required, press <b>Save</b>.</p>

      <p>Choosing status names and assigned colours wisely will provide an easy way of instantly seeing what hives need attention and why.</p>

      <hr>

    `
  },

  {
    id: "help-saving",
    title: "Saving Your Data",
    html: `
      <h2 id="help-saving">Saving Your Data</h2>
      <p>Use the floating red <b>Exit</b> button to back up and save everything as one data file before closing.<br>
      This can also be done by going to <b>Tools</b> in the toolbar and select <b>Export Data</b>.<br>
      The file will be saved with a time-stamped name and can be saved anywhere either on your local device or external drive.<br>
      This can then be imported on any other device where HiveMap is used by going to <b>Tools</b> in the toolbar and select <b>Import Data</b> to restore your full setup.<br>
      This also provides a time-stamped 'snapshot' backup that could be imported if something has been done that cannot be undone to restore all your data.</p>

      <hr>
    `
  }

];


// -----------------------------
// COMBINED HELP CONTENT
// -----------------------------

window.HELP_CONTENT = window.HELP_SECTIONS
  .map(section => section.html)
  .join("\n");
