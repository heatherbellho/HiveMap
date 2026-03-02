App.Analytics = {};

//
// Collect inspections based on scope
//
App.Analytics.getInspections = function (scope) {
    let inspections = [];

    // 1) This hive
    if (scope === "hive") {
        const obj = canvas.getActiveObject();
        if (obj && obj.hiveData && obj.hiveData.inspections) {
            inspections = obj.hiveData.inspections;
        }
        return inspections;
    }

    // 2) This apiary
    if (scope === "apiary") {
        const hives = App.Canvas.getAllHives();
        hives.forEach(h => {
            if (h.hiveData && h.hiveData.inspections) {
                inspections.push(...h.hiveData.inspections);
            }
        });
        return inspections;
    }

    // 3) All apiaries
if (scope === "all") {
    const apiaries = Storage.getAllApiaries(); // ["Bank", "Flat", "Willow", "Pit"]

    apiaries.forEach(a => {
        const layout = localStorage.getItem("hiveLayout_" + a);
        if (!layout) return;

        const json = JSON.parse(layout);
        json.objects.forEach(o => {
            if (o.hiveData && o.hiveData.inspections) {
                inspections.push(...o.hiveData.inspections);
            }
        });
    });

    return inspections;
}

    return inspections;
};


//
// Render the Honey Taken graph
//
App.Analytics.renderHoneyGraph = function (canvasEl, inspections) {

    // Unit preference (schema is the ONLY source of truth)
    const unit =
        App.Modals.inspectionSchema.weightUnit === "lbs" ? "lbs" : "kg";

    // Always clear the canvas before drawing
    const ctx = canvasEl.getContext("2d");
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    // RAW ISO dates (required for month extraction)
    const dates = inspections.map(i => i.date);

    // Convert stored kg → display unit
    const honey = inspections.map(i => {
        const kg = Number(i.honeyTaken || 0);
        return unit === "lbs"
            ? (kg * 2.20462).toFixed(1)
            : kg;
    });

    // Destroy previous chart if it exists
    if (App.Analytics._chart) {
        App.Analytics._chart.destroy();
    }

    canvasEl.width = canvasEl.clientWidth;
    canvasEl.height = canvasEl.clientHeight;

    // Create new chart
    App.Analytics._chart = new Chart(canvasEl, {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: unit === "lbs" ? "Honey Taken (lbs)" : "Honey Taken (kg)",
                data: honey,
                borderColor: "#f4b400",
                backgroundColor: "rgba(244,180,0,0.2)",
                borderWidth: 2,
                tension: 0.2
            }]
        },
        options: {
            scales: {
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 12,
                        maxRotation: 0,
                        minRotation: 0,
                        callback: function (value) {
                            const raw = this.chart.data.labels[value];
                            if (!raw) return "";

                            const month = raw.substring(5, 7);

                            const names = {
                                "01": "Jan",
                                "02": "Feb",
                                "03": "Mar",
                                "04": "Apr",
                                "05": "May",
                                "06": "Jun",
                                "07": "Jul",
                                "08": "Aug",
                                "09": "Sep",
                                "10": "Oct",
                                "11": "Nov",
                                "12": "Dec"
                            };

                            return names[month] || "";
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: unit === "lbs"
                            ? "Honey Taken (lbs)"
                            : "Honey Taken (kg)"
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (ctx) {
                            return `${ctx.parsed.y} ${unit}`;
                        }
                    }
                }
            }
        }
    });
};

//
// Called when modal opens or scope changes
//
App.Analytics.updateHoneyGraph = function () {
    const scope = document.getElementById("honeyGraphScope").value;
    const titleEl = document.getElementById("honeyGraphTitle");
    const canvasEl = document.getElementById("honeyGraphCanvas");

    // Title (same for all scopes)
    titleEl.textContent = "Honey Harvest";

    // Selected year
    const year = document.getElementById("honeyGraphYear").value;

    // Get inspections for this scope, filtered by year
    let inspections = App.Analytics.getInspections(scope)
        .filter(i => i.date.startsWith(year));

    // MERGE ALL HONEY ENTRIES BY DATE (stored values are always kg)
    const totalsByDate = {};

    inspections.forEach(i => {
        const d = i.date;
        const amount = Number(i.honeyTaken) || 0;

        if (!totalsByDate[d]) {
            totalsByDate[d] = 0;
        }

        totalsByDate[d] += amount;
    });

    // Build full calendar-year timeline
    const fullDates = App.Analytics.buildYearDateRange(year);

    // Map merged totals onto full year (missing days = 0)
    inspections = fullDates.map(d => ({
        date: d,
        honeyTaken: totalsByDate[d] || 0
    }));

    // --- UNIT PREFERENCE ---
    const unit =
        App.Modals.inspectionSchema.weightUnit === "lbs" ? "lbs" : "kg";

    // --- TOTAL FOR YEAR (stored kg → convert for display) ---
    let totalKg = inspections.reduce((sum, i) => sum + Number(i.honeyTaken || 0), 0);

    let displayTotal = unit === "lbs"
        ? (totalKg * 2.20462)
        : totalKg;

    displayTotal = displayTotal.toFixed(1);

    const totalEl = document.getElementById("honeyGraphTotal");
    if (totalEl) {
        totalEl.innerHTML = `Total for ${year}: <strong style="font-size: 1.2rem;">${displayTotal} ${unit}</strong>`;
    }

    // Empty-state handling
    if (!inspections.length) {
        const ctx = canvasEl.getContext("2d");

        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText("No inspection data available", canvasEl.width / 2, canvasEl.height / 2);

        return;
    }

    // Render graph
    App.Analytics.renderHoneyGraph(canvasEl, inspections);
};


App.Analytics.getAllInspectionYears = function () {
    const all = App.Analytics.getInspections("all");
    const years = new Set();

    all.forEach(i => {
        if (i.date) {
            years.add(i.date.substring(0, 4));
        }
    });

    return Array.from(years).sort();
};

App.Analytics.buildYearDateRange = function (year) {
    const dates = [];
    const start = new Date(year, 0, 1);      // 1 Jan
    const end   = new Date(year, 11, 31);    // 31 Dec

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().substring(0, 10));
    }

    return dates;
};
