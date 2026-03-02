App.Reports = App.Reports || {};

// ---------------------------------------------------------
// OPEN MODAL
// ---------------------------------------------------------
App.Reports.openVetReportModal = function () {
  const modal = document.getElementById("vetReportModal");
  const overlay = document.getElementById("overlay");

  // Populate apiary list
  const select = document.getElementById("vetReportApiarySelect");
  const apiaries = Storage.getAllApiaries() || [];

  select.innerHTML = `<option value="__all__">All Apiaries</option>`;
  apiaries.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    select.appendChild(opt);
  });

  // Reset fields
  document.getElementById("vetReportStart").value = "";
  document.getElementById("vetReportEnd").value = "";
  document.getElementById("vetReportOutput").innerHTML = "";
  document.getElementById("vetReportPrintBtn").style.display = "none";

  modal.style.display = "block";
  overlay.style.display = "block";
};

// ---------------------------------------------------------
// GENERATE REPORT
// ---------------------------------------------------------
App.Reports.generateVetReport = function () {
  const apiaryFilter = document.getElementById("vetReportApiarySelect").value;
  const start = document.getElementById("vetReportStart").value;
  const end = document.getElementById("vetReportEnd").value;

  const output = document.getElementById("vetReportOutput");
  output.innerHTML = "";

  const rows = [];
  const apiaries = Storage.getAllApiaries() || [];

  apiaries.forEach(apiary => {
    if (apiaryFilter !== "__all__" && apiary !== apiaryFilter) return;

    const layout = Storage.getHiveLayout(apiary);
    if (!layout) return;

    const parsed = JSON.parse(layout);

    parsed.objects.forEach(obj => {
      if (obj.hiveData && obj.hiveData.treatments) {
        const hiveName = obj.hiveData.name;

        obj.hiveData.treatments.forEach(t => {
          if (start && t.date < start) return;
          if (end && t.date > end) return;

          rows.push({
            apiary,
            hive: hiveName,
            ...t
          });
        });
      }
    });
  });

  if (rows.length === 0) {
    output.innerHTML = `<p>No treatments found for the selected filters.</p>`;
    return;
  }
// ⭐ Sort newest first
rows.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  // Build table
  let html = `
    <table class="report-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Apiary</th>
          <th>Hive</th>
          <th>Product</th>
          <th>Active Ingredient</th>
          <th>Batch</th>
          <th>Expiry</th>
          <th>Quantity</th>
          <th>Withdrawal</th>
          <th>Supplier</th>
        </tr>
      </thead>
      <tbody>
  `;

  rows.forEach(r => {
    html += `
      <tr>
        <td>${r.date ? App.Utils.formatDateUK(r.date) : ""}</td>
        <td>${r.apiary}</td>
        <td>${r.hive}</td>
        <td>${r.product}</td>
        <td>${r.activeIngredient}</td>
        <td>${r.batch}</td>
        <td>${r.expiry}</td>
        <td>${r.quantity}</td>
        <td>${r.withdrawal}</td>
        <td>${r.supplier}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  output.innerHTML = html;

  document.getElementById("vetReportPrintBtn").style.display = "inline-block";
};

// ---------------------------------------------------------
// DOM WIRING — MUST RUN AFTER DOM IS READY
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

  // Close buttons
  document.getElementById("vetReportCloseBtn").onclick =
  document.getElementById("overlay").onclick =
    function () {
      document.getElementById("vetReportModal").style.display = "none";
      document.getElementById("overlay").style.display = "none";
    };

  // Generate button
  document.getElementById("vetReportGenerateBtn").onclick =
    App.Reports.generateVetReport;

  // Print button
  document.getElementById("vetReportPrintBtn").onclick = function () {
    const content = document.getElementById("vetReportOutput").innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Veterinary Medicines Report</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 6px; }
            th { background: #eee; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

});
