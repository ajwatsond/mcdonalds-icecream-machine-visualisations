/* ============================================================
   pictograph_logic.js — Ice Cream Deficit Pictograph
   Integrated into main Ice Cream site styling
   ============================================================ */

// Wrap in DOMContentLoaded to ensure D3 and data are ready
document.addEventListener("DOMContentLoaded", function () {

    // 1. Setup variables matching HTML elements
    const pictSvg = d3.select("#pictograph-container");
    const toggle  = d3.select("#us-only-toggle-pict");
    const select  = d3.select("#state-select");

    // --- 2. CONSTANTS & LOOKUPS ---
    const iconBroken    = "🍧";
    const iconWorking   = "🍦";
    const unitsPerIcon  = 200000;
    const iconSize      = 25;
    const iconsPerRow   = 20;
    const margin        = { top: 60, right: 150, bottom: 20, left: 150 };
    const totalCanvasWidth = 1100;
    const width         = totalCanvasWidth - margin.left - margin.right;
    const duration      = 750;

    const usStateCodes = new Set([
        "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
        "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
        "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
        "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
        "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
    ]);

    const stateLookup = {
        AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
        CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'Dist. of Columbia',
        FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',
        IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',
        ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',
        MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',
        NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',
        NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',
        PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',
        TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',
        WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming'
    };

    // --- 3. THE MAIN RENDER FUNCTION ---
    window.updateApp = function () {

        // Wipe container for fresh draw
        pictSvg.selectAll("*").remove();

        // Safety check
        if (typeof chartData === 'undefined') {
            console.error("chartData is not ready yet! Check organizedata.js");
            pictSvg.append("p")
                .style("color", "#999")
                .style("font-family", "var(--font-mono)")
                .style("padding", "32px")
                .text("Data not available.");
            return;
        }

        // --- POPULATE DROPDOWN (if empty) ---
        if (select.node() && select.selectAll("option").size() <= 1) {
            select.selectAll("option").remove();
            select.append("option").attr("value", "all").text("All States (Total US)");

            const uniqueStates = [...new Set(chartData.map(d => d.state))];
            uniqueStates
                .sort((a, b) => d3.ascending(stateLookup[a] || a, stateLookup[b] || b))
                .forEach(stateCode => {
                    select.append("option")
                        .attr("value", stateCode)
                        .text(stateLookup[stateCode] || stateCode);
                });
        }

        // --- APPLY FILTERS ---
        const isUSOnly      = toggle.property("checked");
        const selectedState = select.property("value") || "all";

        const displayData  = isUSOnly
            ? chartData.filter(d => usStateCodes.has(d.state))
            : chartData;

        const filteredData = selectedState === "all"
            ? displayData
            : displayData.filter(d => d.state === selectedState);

        if (filteredData.length === 0) {
            pictSvg.append("p")
                .style("color", "#999")
                .style("font-family", "var(--font-mono)")
                .style("padding", "32px")
                .text("No data to display.");
            return;
        }

        // --- CALCULATE HEIGHT ---
        const maxTotalIcons  = d3.max(filteredData, d => Math.floor((Number(d.population) || 0) / unitsPerIcon)) || 1;
        const numRowsOfIcons = Math.ceil(maxTotalIcons / iconsPerRow) || 1;
        const rowHeight      = (numRowsOfIcons * (iconSize + 10)) + 60;
        const totalHeight    = filteredData.length * rowHeight;
        const finalSVGHeight = totalHeight + margin.top + margin.bottom;

        // --- DRAW SVG ---
        const canvasSVG = pictSvg.append("svg")
            .attr("width", "100%")
            .attr("viewBox", `0 0 ${totalCanvasWidth} ${finalSVGHeight}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        // --- LEGEND ---
        const legendData = [
            { label: "Broken Machine", icon: iconBroken },
            { label: "Working Machine", icon: iconWorking }
        ];

        const legend = canvasSVG.append("g")
            .attr("transform", `translate(${margin.left}, 20)`);

        const legendItems = legend.selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(${i * 220}, 0)`);

        legendItems.append("text")
            .text(d => d.icon)
            .style("font-size", `${iconSize}px`)
            .attr("y", 10);

        legendItems.append("text")
            .text(d => d.label)
            .attr("x", iconSize + 10)
            .attr("y", 8)
            .style("font-family", "var(--font-body, 'DM Sans', sans-serif)")
            .style("font-size", "14px")
            .style("fill", "#1a1a1a");

        legend.append("text")
            .attr("x", width)
            .attr("y", 8)
            .attr("text-anchor", "end")
            .style("font-size", "12px")
            .style("font-style", "italic")
            .style("fill", "#666")
            .style("font-family", "var(--font-mono, 'DM Mono', monospace)")
            .text(`1 icon = ${unitsPerIcon.toLocaleString()} people`);

        // --- DRAW ROWS ---
        const canvas = canvasSVG.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const yScale = d3.scaleBand()
            .domain(filteredData.map(d => d.state))
            .range([0, totalHeight])
            .padding(0.4);

        const allRows = canvas.selectAll(".icon-row")
            .data(filteredData, d => d.state)
            .enter()
            .append("g")
            .attr("class", "icon-row")
            .attr("transform", d => `translate(0, ${yScale(d.state)})`);

        // State labels
        allRows.append("text")
            .attr("x", -15)
            .attr("y", 20)
            .attr("text-anchor", "end")
            .attr("class", "axis-label")
            .style("font-family", "var(--font-body, 'DM Sans', sans-serif)")
            .style("font-size", "14px")
            .style("fill", "#1a1a1a")
            .style("font-weight", "600")
            .text(d => stateLookup[d.state] || d.state);

        // Icons
        allRows.each(function (d) {
            const rowGroup = d3.select(this);
            const pop      = Number(d.population) || 0;

            if (pop === 0) {
                rowGroup.append("text")
                    .attr("x", 10).attr("y", 20)
                    .style("fill", "#999")
                    .style("font-style", "italic")
                    .style("font-family", "var(--font-mono, 'DM Mono', monospace)")
                    .style("font-size", "12px")
                    .text("No population data available");
            } else {
                const deficit      = Number(d.iceCreamDeficit) || 0;
                const brokenCount  = Math.floor(deficit / unitsPerIcon);
                const workingCount = Math.floor((pop - deficit) / unitsPerIcon);

                const icons = [];
                for (let i = 0; i < brokenCount; i++)  icons.push({ type: "broken" });
                for (let i = 0; i < workingCount; i++) icons.push({ type: "working" });

                rowGroup.selectAll(".machine-icon")
                    .data(icons)
                    .enter()
                    .append("text")
                    .attr("class", "machine-icon")
                    .attr("x", (icon, i) => (i % iconsPerRow) * (iconSize + 2))
                    .attr("y", (icon, i) => Math.floor(i / iconsPerRow) * (iconSize + 5) + iconSize)
                    .style("font-size", `${iconSize}px`)
                    .style("opacity", 0)
                    .text(icon => icon.type === "broken" ? iconBroken : iconWorking)
                    .transition()
                    .delay((icon, i) => i * 5)
                    .duration(duration / 2)
                    .style("opacity", 1);
            }
        });

        // Stats sidebar
        const statsGroup = allRows.append("g")
            .attr("class", "state-stats")
            .attr("transform", `translate(${iconsPerRow * (iconSize + 2) + 20}, 15)`);

        statsGroup.each(function (d) {
            const group   = d3.select(this);
            const pop     = Number(d.population) || 0;
            const deficit = Number(d.iceCreamDeficit) || 0;

            if (pop > 0) {
                const workingPct = (((pop - deficit) / pop) * 100).toFixed(1);
                const brokenPct  = ((deficit / pop) * 100).toFixed(1);

                group.append("text").attr("y", 0)
                    .style("font-family", "var(--font-mono, 'DM Mono', monospace)")
                    .style("font-size", "11px")
                    .style("fill", "#555")
                    .text(`Pop: ${pop.toLocaleString()}`);

                group.append("text").attr("y", 18)
                    .style("fill", "#007A6E")
                    .style("font-family", "var(--font-mono, 'DM Mono', monospace)")
                    .style("font-size", "11px")
                    .text(`${iconWorking} ${workingPct}% Working`);

                group.append("text").attr("y", 34)
                    .style("fill", "#9E4F00")
                    .style("font-family", "var(--font-mono, 'DM Mono', monospace)")
                    .style("font-size", "11px")
                    .text(`${iconBroken} ${brokenPct}% Broken`);
            }
        });
    };

    // --- 4. EVENT LISTENERS ---
    select.on("change", window.updateApp);
    toggle.on("change", window.updateApp);

    // Initial render triggered by organizedata.js once chartData is ready
    // If chartData already exists (cached), render immediately
    if (typeof chartData !== 'undefined' && chartData.length > 0) {
      window.updateApp();
    }
});