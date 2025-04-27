document.addEventListener("DOMContentLoaded", async function () {
    const table = document.getElementById("table");
    const tbody = table.querySelector("tbody");
    let allMonitors = [];
    let filteredMonitors = [];

    // Infinite scroll variables
    const INITIAL_LOAD_COUNT = 25;
    const LOAD_MORE_COUNT = 25;
    let displayedCount = 0;
    let isLoading = false;

    // Default filter state
    const filters = {
        brands: [],
        price: { min: 0, max: Infinity },
        screen_size: { min: 0, max: Infinity },
        resolution: [],
        panel: [],
        max_refresh_rate: { min: 0, max: Infinity },
        coating: [],
        hdr: [],
        brightness: { min: 0, max: Infinity },
        year: { min: 0, max: Infinity },
        ppi: { min: 0, max: Infinity },
        bit_depth: [],
        vesa: [],
        extras: [],
        aspect_ratio: [],
        contrast: [],
        ports: {},
        extrasNegated: [],
        searchTerms: [],
    };

    let sortingState = [];
    const states = new Map();

    // Load monitor data from JSON
    try {
        const response = await fetch("data/monitors.json");
        if (!response.ok) {
            throw new Error(`Failed to load monitors: ${response.status} ${response.statusText}`);
        }
        allMonitors = await response.json();
        filteredMonitors = [...allMonitors];

        // Initial render
        displayedCount = INITIAL_LOAD_COUNT;
        renderTableRows(getCurrentItems());

        // Setup UI after data is loaded
        setupFiltersAndEvents();
        setupInfiniteScroll();

        // Initial sort by Rtings PC gaming score
        sortingState.push({ columnIndex: 5, ascending: false });
        sortTableByColumns(sortingState);
        updateSortingHeaders();

        // Show UI now that data is loaded
        document.querySelector("table").style.display = "block";
        document.querySelector("#sidebar").style.display = "block";
        document.querySelector("#main").scrollTo(0, 0);
    } catch (error) {
        console.error("Error loading monitor data:", error);
        const errorMsg = document.createElement("div");
        errorMsg.className = "error-message";
        errorMsg.textContent = "Failed to load monitor data. Please try refreshing the page.";
        table.parentNode.insertBefore(errorMsg, table);
    }

    // Get currently displayed items
    function getCurrentItems() {
        return filteredMonitors.slice(0, displayedCount);
    }

    // Setup infinite scroll
    function setupInfiniteScroll() {
        const mainContainer = document.getElementById("main");
        const loadingIndicator = document.createElement("div");
        loadingIndicator.id = "loading-indicator";
        loadingIndicator.innerHTML = '<div class="spinner"></div><span>Loading more monitors...</span>';
        table.after(loadingIndicator);

        // Hide initially
        loadingIndicator.style.display = "none";

        mainContainer.addEventListener("scroll", function() {
            if (isLoading) return;

            // Calculate when we're close to the bottom
            const scrollPosition = mainContainer.scrollTop + mainContainer.clientHeight;
            const scrollThreshold = mainContainer.scrollHeight - 300; // Load more when 300px from bottom

            if (scrollPosition >= scrollThreshold && displayedCount < filteredMonitors.length) {
                loadMoreItems();
            }
        });
    }

    // Load more items when scrolling
    function loadMoreItems() {
        if (isLoading || displayedCount >= filteredMonitors.length) return;

        isLoading = true;
        document.getElementById("loading-indicator").style.display = "flex";

        // Use setTimeout to give the browser a chance to show the loading indicator
        setTimeout(() => {
            const previousCount = displayedCount;
            displayedCount = Math.min(displayedCount + LOAD_MORE_COUNT, filteredMonitors.length);

            // Get the newly loaded items
            const newItems = filteredMonitors.slice(previousCount, displayedCount);

            // Append only the new items to the table
            newItems.forEach(monitor => {
                const row = createTableRow(monitor);
                tbody.appendChild(row);
            });

            isLoading = false;
            document.getElementById("loading-indicator").style.display = "none";

            // Check if we've reached the end
            if (displayedCount >= filteredMonitors.length) {
                const endMessage = document.createElement("div");
                endMessage.id = "end-message";
                endMessage.textContent = `End of results • ${filteredMonitors.length} monitors`;
                table.after(endMessage);
            } else {
                // Remove end message if it exists and we're not at the end anymore
                const endMessage = document.getElementById("end-message");
                if (endMessage) endMessage.remove();
            }
        }, 100);
    }

    function renderTableRows(monitors) {
        // Clear existing rows
        tbody.innerHTML = "";

        // Create and append the table rows
        monitors.forEach(monitor => {
            const row = createTableRow(monitor);
            tbody.appendChild(row);
        });

        // Remove end message if it exists
        const endMessage = document.getElementById("end-message");
        if (endMessage) endMessage.remove();

        // Add end message if all monitors are loaded
        if (displayedCount >= filteredMonitors.length) {
            const endMessage = document.createElement("div");
            endMessage.id = "end-message";
            endMessage.textContent = `End of results • ${filteredMonitors.length} monitors`;
            table.after(endMessage);
        }
    }

    function createTableRow(monitor) {
        const row = document.createElement("tr");

        // Add all data attributes
        row.setAttribute("data-title", monitor.title || "");
        row.setAttribute("data-brand", monitor.brand || "");
        row.setAttribute("data-price", monitor.price || "0");
        row.setAttribute("data-screen-size", monitor.screenSize || "0");
        row.setAttribute("data-resolution", monitor.resolution || "");
        row.setAttribute("data-resolution-pixels", monitor.resolutionPixels || "");
        row.setAttribute("data-panel", monitor.panel || "");
        row.setAttribute("data-max-refresh-rate", monitor.maxRefreshRate || "0");
        row.setAttribute("data-curved", monitor.curved ? "true" : "");

        // Convert ports object to string with HTML entities for data attribute
        let portsStr = "{}";
        if (monitor.ports) {
            portsStr = JSON.stringify(monitor.ports).replace(/"/g, "&#34;");
        }
        row.setAttribute("data-ports", portsStr);

        row.setAttribute("data-coating", monitor.coating || "");
        row.setAttribute("data-brightness", monitor.brightness || "0");
        row.setAttribute("data-hdr", monitor.hdr || "None");
        row.setAttribute("data-year", monitor.year || "0");
        row.setAttribute("data-ppi", monitor.ppi || "0");
        row.setAttribute("data-aspect-ratio", monitor.aspectRatio || "");
        row.setAttribute("data-contrast", monitor.contrast || "");
        row.setAttribute("data-bit-depth", monitor.bitDepth || "");
        row.setAttribute("data-vesa-interface", monitor.vesaInterface || "None");
        row.setAttribute("data-kvm", typeof monitor.kvm === 'boolean' ? monitor.kvm : "None");
        row.setAttribute("data-speakers-number", monitor.speakersNumber || "0");
        row.setAttribute("data-speakers-power", monitor.speakersPower || "0");
        row.setAttribute("data-rtings-pc-gaming-score", monitor.rtingsPcGamingScore || "0");
        row.setAttribute("data-rtings-office-score", monitor.rtingsOfficeScore || "0");
        row.setAttribute("data-rtings-editing-score", monitor.rtingsEditingScore || "0");
        row.setAttribute("data-rtings-mixed-usage-score", monitor.rtingsMixedUsageScore || "0");
        row.setAttribute("data-rtings-media-consumption-score", monitor.rtingsMediaConsumptionScore || "0");

        // Format the price for display
        const formattedPrice = monitor.price ? `$${Math.round(monitor.price)}` : "$0";

        // Get the selected Rtings score type
        const selectedRtingsScoreType = document.getElementById("rtings-score-type")?.value || "pc-gaming";
        const rtingsScore = monitor[`rtings${selectedRtingsScoreType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}Score`] || 0;

        // Format ports for display
        let portsHtml = '<span class="empty">-</span>';
        if (monitor.ports && Object.keys(monitor.ports).length > 0) {
            portsHtml = '<div class="port-container">';
            for (const [portType, count] of Object.entries(monitor.ports)) {
                portsHtml += `<span class="port-item">${portType} x ${count}</span>`;
            }
            portsHtml += '</div>';
        }

        // Build the HTML for the row
        row.innerHTML = `
            <td data-label="Item" class="sticky">
                <a href="${monitor.link || '#'}" target="_blank">
                    ${monitor.title || ""}
                </a>
            </td>

            <td data-label="Resolution">${monitor.resolution || ""}
                <span class="resolution-pixels">${monitor.resolutionPixels ? `(${monitor.resolutionPixels})` : ""}</span>
            </td>

            <td data-label="Panel">${monitor.panel ? `  ${monitor.panel} ` : ""}</td>

            <td data-label="Screen Size">${monitor.screenSize ? `${monitor.screenSize}"` : ""}</td>

            <td data-label="Price">${formattedPrice}</td>

            <td data-label="Rtings Score" class="rtings-score">
                ${rtingsScore > 0
                    ? `<span class="rtings-score-value">${parseFloat(rtingsScore).toFixed(1)}</span>`
                    : `<span class="empty">None</span>`
                }
            </td>

            <td data-label="Refresh Rate">${monitor.maxRefreshRate ? `${monitor.maxRefreshRate} Hz` : ""}</td>

            <td data-label="Curved">
                ${monitor.curved ? "Yes" : `<span class="empty">No</span>`}
            </td>

            <td data-label="Coating">${monitor.coating || `<span class="empty">-</span>`}</td>

            <td data-label="HDR">
                ${monitor.hdr && monitor.hdr !== "None"
                    ? monitor.hdr
                    : `<span class="empty">No</span>`
                }
            </td>

            <td data-label="Brightness">${monitor.brightness ? `${monitor.brightness} cd/m²` : ""}</td>

            <td data-label="Year">${monitor.year || ""}</td>

            <td data-label="PPI">${monitor.ppi ? `${monitor.ppi} ppi` : ""}</td>

            <td data-label="Aspect Ratio">${monitor.aspectRatio || ""}</td>

            <td data-label="Contrast Ratio">${monitor.contrast || ""}</td>

            <td data-label="Bit Depth">${monitor.bitDepth || ""}</td>

            <td data-label="Vesa Mount">
                ${monitor.vesaInterface && monitor.vesaInterface !== "None"
                    ? monitor.vesaInterface
                    : `<span class="empty">No</span>`
                }
            </td>

            <td data-label="KVM">
                ${monitor.kvm === true
                    ? "Yes"
                    : `<span class="empty">No</span>`
                }
            </td>

            <td data-label="Speakers">
                ${monitor.speakersPower > 0 && monitor.speakersNumber > 0
                    ? `${monitor.speakersPower} W x ${monitor.speakersNumber}`
                    : `<span class="empty">No</span>`
                }
            </td>

            <td data-label="Ports">
                ${portsHtml}
            </td>
        `;

        return row;
    }

    function updateFilters() {
        filters.brands = Array.from(
            document.querySelectorAll("div.filter-group.brand input.filter:checked")
        ).map((input) => input.getAttribute("value"));
        filters.price.min = parseInt(document.getElementById("min-price").value) || 0;
        filters.price.max =
            parseInt(document.getElementById("max-price").value) || Infinity;

        filters.screen_size.min =
            parseFloat(document.getElementById("min-screen-size").value) || 0;
        filters.screen_size.max =
            parseFloat(document.getElementById("max-screen-size").value) || Infinity;
        filters.resolution = Array.from(
            document.querySelectorAll("div.filter-group.resolution input.filter:checked")
        ).map((input) => input.getAttribute("value"));
        filters.panel = Array.from(
            document.querySelectorAll("div.filter-group.panel input.filter:checked")
        ).map((input) => input.getAttribute("value"));
        filters.max_refresh_rate.min =
            parseInt(document.getElementById("min-refresh-rate").value) || 0;
        filters.max_refresh_rate.max =
            parseInt(document.getElementById("max-refresh-rate").value) || Infinity;
        filters.coating = Array.from(
            document.querySelectorAll("div.filter-group.coating input.filter:checked")
        ).map((input) => input.getAttribute("value"));
        filters.hdr = Array.from(
            document.querySelectorAll("div.filter-group.hdr input.filter:checked")
        ).map((input) => input.getAttribute("value"));
        filters.brightness.min =
            parseInt(document.getElementById("min-brightness").value) || 0;
        filters.brightness.max =
            parseInt(document.getElementById("max-brightness").value) || Infinity;
        filters.year.min = parseInt(document.getElementById("min-year").value) || 0;
        filters.year.max =
            parseInt(document.getElementById("max-year").value) || Infinity;
        filters.ppi.min = parseInt(document.getElementById("min-ppi").value) || 0;
        filters.ppi.max = parseInt(document.getElementById("max-ppi").value) || Infinity;
        filters.bit_depth = Array.from(
            document.querySelectorAll("div.filter-group.bit-depth input.filter:checked")
        ).map((input) => input.getAttribute("value"));
        filters.vesa = Array.from(
            document.querySelectorAll("div.filter-group.vesa input.filter:checked")
        ).map((input) => input.getAttribute("value"));
        filters.extras = Array.from(
            document.querySelectorAll("div.filter-group.extras input.filter:checked")
        ).map((input) => input.getAttribute("value"));
        filters.extrasNegated = Array.from(
            document.querySelectorAll(
                "div.filter-group.extras input.filter:indeterminate"
            )
        ).map((input) => input.getAttribute("value"));
        filters.aspect_ratio = Array.from(
            document.querySelectorAll(
                "div.filter-group.aspect-ratio input.filter:checked"
            )
        ).map((input) => input.getAttribute("value"));
        filters.contrast = Array.from(
            document.querySelectorAll(
                "div.filter-group.contrast-ratio input.filter:checked"
            )
        ).map((input) => input.getAttribute("value"));

        let portFilters = {};
        document
            .querySelectorAll("div.filter-group.ports input.filter.port-main:checked")
            .forEach((input) => {
                let number = parseInt(
                    input.closest(".port-type").querySelector(".port-count-select")
                        ?.value || 1
                );
                portFilters[input.getAttribute("value")] = number;
            });
        filters.ports = portFilters;

        filters.searchTerms = document
            .getElementById("search-input")
            .value.toLowerCase()
            .split(",")
            .map((k) => k.trim())
            .filter((k) => k);

        applyFilters();
        encodeFilterState();
    }

    function applyFilters() {
        const brandTypes = Array.from(
            document.querySelectorAll("div.filter-group.brand input.filter")
        ).map((input) => input.getAttribute("value"));

        const panelTypes = Array.from(
            document.querySelectorAll("div.filter-group.panel input.filter")
        ).map((input) => input.getAttribute("value"));

        const coatingTypes = Array.from(
            document.querySelectorAll("div.filter-group.coating input.filter")
        ).map((input) => input.getAttribute("value"));

        const hdrTypes = Array.from(
            document.querySelectorAll("div.filter-group.hdr input.filter")
        ).map((input) => input.getAttribute("value"));

        const bitDepthTypes = Array.from(
            document.querySelectorAll("div.filter-group.bit-depth input.filter")
        ).map((input) => input.getAttribute("value"));

        const vesaTypes = Array.from(
            document.querySelectorAll("div.filter-group.vesa input.filter")
        ).map((input) => input.getAttribute("value"));

        // Filter monitors
        filteredMonitors = allMonitors.filter(monitor => {
            const title = monitor.title || "";
            const brand = (monitor.brand || "").toLowerCase().replace(/\s+/g, "_");
            const price = parseFloat(monitor.price) || 0;
            const screenSize = parseFloat(monitor.screenSize) || 0;
            const resolutionValue = monitor.resolution || "";
            const resolutionPixels = monitor.resolutionPixels || "";
            const panel = monitor.panel || "";
            const maxRefreshRate = parseInt(monitor.maxRefreshRate, 10) || 0;
            const coating = monitor.coating || "";
            const hdr = monitor.hdr || "None";
            const brightness = parseInt(monitor.brightness, 10) || 0;
            const year = parseInt(monitor.year, 10) || 0;
            const ppi = parseInt(monitor.ppi, 10) || 0;
            const bitDepth = monitor.bitDepth || "";
            const vesa = monitor.vesaInterface || "None";
            const kvm = monitor.kvm === true;
            const curved = monitor.curved === true;
            const speakers = monitor.speakersPower > 0;
            const portsObj = monitor.ports || {};

            // Process aspect ratio for filtering
            let aspectRatio = monitor.aspectRatio || "";
            if (aspectRatio) {
                if (["1.778:1", "16:9"].includes(aspectRatio)) {
                    aspectRatio = "Standard";
                } else if (["2.389:1", "2.37:1", "2.4:1"].includes(aspectRatio)) {
                    aspectRatio = "Ultrawide";
                } else if (["3.556:1"].includes(aspectRatio)) {
                    aspectRatio = "Super Ultrawide";
                } else {
                    aspectRatio = "Other";
                }
            }

            // Process contrast for filtering
            let contrast = monitor.contrast || "";
            if (contrast) {
                let contrastValue = parseFloat(contrast.split(" ")[0]);
                if (contrastValue > 0 && contrastValue < 2000) {
                    contrast = "Standard";
                } else if (contrastValue >= 2000) {
                    contrast = "High";
                } else {
                    contrast = "Unknown";
                }
            }

            // Standardize for filter compatibility
            let vesaForFilter = vesa;
            if (!vesaTypes.includes(vesa)) {
                vesaForFilter = "Other";
            }

            let bitDepthForFilter = bitDepth;
            if (!bitDepthTypes.includes(bitDepth)) {
                bitDepthForFilter = "Unknown";
            }

            let hdrForFilter = hdr;
            if (!hdrTypes.includes(hdr)) {
                hdrForFilter = "Unknown";
            }

            let coatingForFilter = coating;
            if (!coatingTypes.includes(coating)) {
                coatingForFilter = "Unknown";
            }

            let panelForFilter = panel;
            if (!panelTypes.includes(panel)) {
                panelForFilter = "Other";
            }

            let brandForFilter = brand;
            if (!brandTypes.includes(brand)) {
                brandForFilter = "Other";
            }

            // Apply all filters
            const matchesBrand = filters.brands.includes(brandForFilter);
            const matchesPrice = price >= filters.price.min && price <= filters.price.max;
            const matchesScreenSize =
                screenSize >= filters.screen_size.min &&
                screenSize <= filters.screen_size.max;
            const matchesResolution = filters.resolution.includes(resolutionValue);
            const matchesPanel = filters.panel.includes(panelForFilter);
            const matchesMaxRefreshRate =
                maxRefreshRate >= filters.max_refresh_rate.min &&
                maxRefreshRate <= filters.max_refresh_rate.max;
            const matchesCoating = filters.coating.includes(coatingForFilter);
            const matchesHdr = filters.hdr.includes(hdrForFilter);
            const matchesBrightness =
                brightness >= filters.brightness.min &&
                brightness <= filters.brightness.max;
            const matchesYear = year >= filters.year.min && year <= filters.year.max;
            const matchesPpi = ppi >= filters.ppi.min && ppi <= filters.ppi.max;
            const matchesBitDepth = filters.bit_depth.includes(bitDepthForFilter);
            const matchesVesa = filters.vesa.includes(vesaForFilter);
            const matchesAspectRatio = filters.aspect_ratio.includes(aspectRatio);
            const matchesContrast = filters.contrast.includes(contrast);
            const matchesSearchTerms =
                filters.searchTerms.length === 0 ||
                filters.searchTerms.every(
                    (keyword) =>
                        title?.toLowerCase().includes(keyword) ||
                        brand?.toLowerCase().includes(keyword) ||
                        panel?.toLowerCase().includes(keyword) ||
                        resolutionPixels?.toLowerCase().includes(keyword)
                );

            let matchesKVM = true;
            if (filters.extras.includes("KVM")) {
                matchesKVM = kvm === true;
            }

            let matchesSpeakers = true;
            if (filters.extras.includes("Speakers")) {
                matchesSpeakers = speakers === true;
            }

            let matchesCurved = true;
            if (filters.extras.includes("Curved")) {
                matchesCurved = curved === true;
            }
            if (filters.extrasNegated.includes("Curved")) {
                matchesCurved = curved !== true;
            }

            let matchesPorts = true;
            if (filters.ports && Object.keys(filters.ports).length > 0) {
                matchesPorts = false;

                if (portsObj && Object.keys(portsObj).length > 0) {
                    matchesPorts = true;
                    for (const [portType, minCount] of Object.entries(filters.ports)) {
                        let foundPorts = Object.keys(portsObj).filter((port) =>
                            port.includes(portType)
                        );
                        if (foundPorts.length > 0) {
                            let portCount = foundPorts.reduce(
                                (acc, port) => acc + parseInt(portsObj[port]),
                                0
                            );
                            if (portCount < minCount) {
                                matchesPorts = false;
                                break;
                            }
                        } else {
                            matchesPorts = false;
                            break;
                        }
                    }
                }
            }

            return matchesScreenSize &&
                matchesPrice &&
                matchesBrand &&
                matchesResolution &&
                matchesPanel &&
                matchesMaxRefreshRate &&
                matchesCoating &&
                matchesHdr &&
                matchesBrightness &&
                matchesYear &&
                matchesPpi &&
                matchesBitDepth &&
                matchesVesa &&
                matchesKVM &&
                matchesCurved &&
                matchesAspectRatio &&
                matchesContrast &&
                matchesPorts &&
                matchesSearchTerms &&
                matchesSpeakers;
        });

        // Reset display counter when filters change
        displayedCount = INITIAL_LOAD_COUNT;

        // Render filtered monitors
        renderTableRows(getCurrentItems());

        // Apply current sorting
        if (sortingState.length > 0) {
            sortTableByColumns(sortingState);
        }

        // Reset scrolling to show the start of results
        document.getElementById("main").scrollTo(0, 0);
    }

    function handleFilterVisibility() {
        document
            .querySelectorAll("div.filter-group input.filter-header")
            .forEach((headerInput) => {
                headerInput.addEventListener("change", () => {
                    const fieldset = headerInput.closest("div.filter-group");
                    const isChecked = headerInput.checked;
                    const filtersInFieldset = fieldset.querySelectorAll("input.filter");

                    filtersInFieldset.forEach((filter) => {
                        filter.checked = isChecked;
                    });

                    updateFilters();
                });
            });
    }

    function sortTableByColumns(sortingState) {
        if (!filteredMonitors.length) return;

        // Sort the full filtered list
        filteredMonitors.sort((monitorA, monitorB) => {
            for (let { columnIndex, ascending } of sortingState) {
                const ths = document.querySelectorAll("th[data-sort]");
                if (columnIndex >= ths.length) continue;

                const label = ths[columnIndex].getAttribute("data-label");

                let cellA, cellB;

                // Handle specific data attributes for sorting
                if (label === "Price") {
                    cellA = parseFloat(monitorA.price) || 0;
                    cellB = parseFloat(monitorB.price) || 0;
                }
                else if (label === "Screen Size") {
                    cellA = parseFloat(monitorA.screenSize) || 0;
                    cellB = parseFloat(monitorB.screenSize) || 0;
                }
                else if (label === "Resolution") {
                    cellA = -1;
                    let cellAPixels = monitorA.resolutionPixels;
                    if (cellAPixels) {
                        let resA = parseFloat(cellAPixels.split("x")[0]);
                        let resB = parseFloat(cellAPixels.split("x")[1]);
                        cellA = resA * resB;
                    }

                    cellB = -1;
                    let cellBPixels = monitorB.resolutionPixels;
                    if (cellBPixels) {
                        let resA = parseFloat(cellBPixels.split("x")[0]);
                        let resB = parseFloat(cellBPixels.split("x")[1]);
                        cellB = resA * resB;
                    }
                }
                else if (label === "Contrast Ratio") {
                    cellA = -1;
                    let cellAContrast = monitorA.contrast;
                    if (cellAContrast && cellAContrast != "0") {
                        let contrastValue = parseFloat(cellAContrast.split(" ")[0]);
                        cellA = contrastValue;
                    }
                    cellB = -1;
                    let cellBContrast = monitorB.contrast;
                    if (cellBContrast && cellBContrast != "0") {
                        let contrastValue = parseFloat(cellBContrast.split(" ")[0]);
                        cellB = contrastValue;
                    }
                }
                else if (label === "Panel") {
                    cellA = monitorA.panel || "";
                    cellB = monitorB.panel || "";
                }
                else if (label === "Refresh Rate") {
                    cellA = parseInt(monitorA.maxRefreshRate, 10) || 0;
                    cellB = parseInt(monitorB.maxRefreshRate, 10) || 0;
                }
                else if (label === "Brightness") {
                    cellA = parseInt(monitorA.brightness, 10) || 0;
                    cellB = parseInt(monitorB.brightness, 10) || 0;
                }
                else if (label === "Year") {
                    cellA = parseInt(monitorA.year, 10) || 0;
                    cellB = parseInt(monitorB.year, 10) || 0;
                }
                else if (label === "PPI") {
                    cellA = parseInt(monitorA.ppi, 10) || 0;
                    cellB = parseInt(monitorB.ppi, 10) || 0;
                }
                else if (label === "Aspect Ratio") {
                    cellA = monitorA.aspectRatio || "";
                    cellB = monitorB.aspectRatio || "";
                }
                else if (label === "Bit Depth") {
                    cellA = monitorA.bitDepth || "";
                    cellB = monitorB.bitDepth || "";
                }
                else if (label === "Vesa Mount") {
                    cellA = -1;
                    let cellAVesa = monitorA.vesaInterface;
                    if (cellAVesa && cellAVesa != "None" && cellAVesa != "0") {
                        let vesaValue = parseFloat(cellAVesa.split(" ")[0]);
                        cellA = vesaValue;
                    }
                    cellB = -1;
                    let cellBVesa = monitorB.vesaInterface;
                    if (cellBVesa && cellBVesa != "None" && cellBVesa != "0") {
                        let vesaValue = parseFloat(cellBVesa.split(" ")[0]);
                        cellB = vesaValue;
                    }
                }
                else if (label === "KVM") {
                    cellA = monitorA.kvm === true ? "true" : "false";
                    cellB = monitorB.kvm === true ? "true" : "false";
                }
                else if (label === "Speakers") {
                    cellA = parseInt(monitorA.speakersPower, 10) || 0;
                    cellB = parseInt(monitorB.speakersPower, 10) || 0;
                }
                else if (label === "Rtings Score") {
                    const selectedRtingsScoreType =
                        document.getElementById("rtings-score-type").value;
                    const scoreTypeKey = `rtings${selectedRtingsScoreType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}Score`;
                    cellA = parseFloat(monitorA[scoreTypeKey]) || 0;
                    cellB = parseFloat(monitorB[scoreTypeKey]) || 0;
                }
                else if (label === "Coating") {
                    let coatingKeys = { "": 1, Matte: 2, "Semi-Glossy": 3, Glossy: 4 };
                    cellA = coatingKeys[monitorA.coating || ""] || 0;
                    cellB = coatingKeys[monitorB.coating || ""] || 0;
                }
                else if (label === "HDR") {
                    let hdrKeys = {
                        "": 1,
                        None: 2,
                        HDR: 3,
                        HDR10: 4,
                        "HDR10+": 5,
                        "DisplayHDR 400": 6,
                        "DisplayHDR 600": 7,
                        "DisplayHDR 1000": 8,
                        "DisplayHDR 1400": 9,
                    };
                    cellA = hdrKeys[monitorA.hdr || "None"] || 0;
                    cellB = hdrKeys[monitorB.hdr || "None"] || 0;
                }
                else {
                    // Default to item name
                    cellA = monitorA.title || "";
                    cellB = monitorB.title || "";
                }

                // Handle empty cells
                if (!cellA && !cellB) return 0;
                if (!cellA) return ascending ? 1 : -1;
                if (!cellB) return ascending ? -1 : 1;

                // Sort numerically if possible
                if (!isNaN(cellA) && !isNaN(cellB)) {
                    const comparison = parseFloat(cellA) - parseFloat(cellB);
                    if (comparison !== 0) return ascending ? comparison : -comparison;
                } else {
                    // Otherwise sort alphabetically
                    let comparison = String(cellA).localeCompare(String(cellB));
                    if (comparison !== 0) return ascending ? comparison : -comparison;
                }
            }
            return 0; // If all columns are equal, return 0
        });

        // Re-render with the sorted items
        renderTableRows(getCurrentItems());
    }

    function updateSortingState(columnIndex, isMultiColumn) {
        const existingState = sortingState.find(
            (state) => state.columnIndex === columnIndex
        );

        if (existingState) {
            existingState.ascending = !existingState.ascending;
            if (!isMultiColumn) {
                sortingState = [];
                sortingState.push({ columnIndex, ascending: existingState.ascending });
            }
        } else {
            if (!isMultiColumn) {
                sortingState = [];
            }
            sortingState.push({ columnIndex, ascending: false });
        }

        sortTableByColumns(sortingState);
    }

    function updateSortingHeaders() {
        document.querySelectorAll("th[data-sort]").forEach((header, index) => {
            header.classList.remove("ascending", "descending");
            const state = sortingState.find((s) => s.columnIndex === index);
            if (state) {
                header.classList.add(state.ascending ? "ascending" : "descending");
            }
        });
    }

    function setupFiltersAndEvents() {
        // Set up filter visibility
        handleFilterVisibility();

        // Set up sorting
        document.querySelectorAll("th[data-sort]").forEach((header) => {
            header.addEventListener("click", (event) => {
                const columnIndex = Array.from(header.parentNode.children).indexOf(
                    header
                );
                const isMultiColumn = event.ctrlKey || event.metaKey;
                updateSortingState(columnIndex, isMultiColumn);
                updateSortingHeaders();
            });
        });

        // Set up filter inputs
        document
            .querySelectorAll("#filters input, #search-input, #filters select")
            .forEach((input) => {
                if (input.type === "number" || input.type === "text") {
                    input.addEventListener("input", updateFilters);
                } else {
                    input.addEventListener("change", updateFilters);
                }
            });

        // Reset button
        document.querySelector(".control-button.reset").addEventListener("click", () => {
            document.getElementById("min-price").value = "";
            document.getElementById("max-price").value = "";
            document.getElementById("min-screen-size").value = "";
            document.getElementById("max-screen-size").value = "";
            document.getElementById("min-refresh-rate").value = "";
            document.getElementById("max-refresh-rate").value = "";
            document.getElementById("min-brightness").value = "";
            document.getElementById("max-brightness").value = "";
            document.getElementById("min-year").value = "";
            document.getElementById("max-year").value = "";
            document.getElementById("min-ppi").value = "";
            document.getElementById("max-ppi").value = "";
            document.getElementById("search-input").value = "";

            // Resetting checkboxes to checked/unchecked state based on default
            document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
                checkbox.checked = true;
                checkbox.indeterminate = false;
            });

            // Reset states Map for tri-state checkboxes
            const checkboxes = document.querySelectorAll(".tri");
            checkboxes.forEach((checkbox) => {
                states.set(checkbox, 0);
            });

            // Unchecking specific checkboxes that should not be checked by default
            document
                .querySelectorAll('input[name="extras"]')
                .forEach((checkbox) => (checkbox.checked = false));
            document
                .querySelectorAll('input[name="ports"]')
                .forEach((checkbox) => (checkbox.checked = false));

            updateFilters();
        });

        // Share button
        document
            .querySelector(".control-button.share")
            .addEventListener("click", async () => {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    const button = document.querySelector(".control-button.share");
                    const originalText = button.textContent;
                    button.textContent = "Link Copied!";
                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 2000);
                } catch (err) {
                    console.error("Failed to copy URL:", err);
                }
            });

        // Specs toggle
        document.querySelectorAll('.specs-toggle input[type="radio"]').forEach((input) => {
            input.addEventListener("change", async () => {
                if (input.value === "basic") {
                    document.querySelector("#container").classList.add("basic");
                    document.querySelector("#main").scrollTo(0, 0);
                } else {
                    document.querySelector("#container").classList.remove("basic");
                }
            });
        });

        // Basic mode check
        let basicToggle = document.querySelector('.specs-toggle input[value="basic"]');
        if (basicToggle && basicToggle.checked) {
            document.querySelector("#container").classList.add("basic");
        }

        // Rtings score type change
        document.getElementById("rtings-score-type").addEventListener("change", function () {
            const selectedRtingsScoreType = this.value;

            // Update scores in table
            document.querySelectorAll("#table tbody tr").forEach((row) => {
                const scoreCell = row.querySelector('td[data-label="Rtings Score"]');
                const scoreValue = parseFloat(row.getAttribute(
                    `data-rtings-${selectedRtingsScoreType}-score`
                )) || 0;

                if (scoreValue > 0) {
                    scoreCell.innerHTML = `<span class="rtings-score-value">${scoreValue.toFixed(1)}</span>`;
                } else {
                    scoreCell.innerHTML = `<span class="empty">None</span>`;
                }
            });

            // Check if currently sorting by Rtings score
            const rtingsSortingState = sortingState.find((state) => state.columnIndex === 5);
            if (rtingsSortingState) {
                sortTableByColumns(sortingState);
            }

            encodeFilterState();
        });

        // Initialize tri-state checkboxes
        const checkboxes = document.querySelectorAll(".tri");
        checkboxes.forEach((checkbox) => {
            // Get initial state from URL parameters
            const params = new URLSearchParams(window.location.search);
            const checkedExtras = params.get("e")?.split(",") || [];
            const indeterminateExtras = params.get("ei")?.split(",") || [];

            if (checkedExtras.includes(checkbox.value)) {
                checkbox.checked = true;
                checkbox.indeterminate = false;
                states.set(checkbox, 1);
            } else if (indeterminateExtras.includes(checkbox.value)) {
                checkbox.checked = false;
                checkbox.indeterminate = true;
                states.set(checkbox, 2);
            } else {
                checkbox.checked = false;
                checkbox.indeterminate = false;
                states.set(checkbox, 0);
            }

            checkbox.addEventListener("click", function () {
                let currentState = states.get(checkbox);
                currentState = (currentState + 1) % 3;
                if (currentState === 0) {
                    checkbox.checked = false;
                    checkbox.indeterminate = false;
                } else if (currentState === 1) {
                    checkbox.checked = true;
                    checkbox.indeterminate = false;
                } else if (currentState === 2) {
                    checkbox.checked = false;
                    checkbox.indeterminate = true;
                }

                states.set(checkbox, currentState);
                updateFilters();
            });
        });

        // Decode filter state from URL
        decodeFilterState();

        // Apply initial filters
        updateFilters();
    }

    function encodeFilterState() {
        const params = new URLSearchParams();

        // Numeric range filters
        const numericFilters = {
            p: ["min-price", "max-price"], // Price
            s: ["min-screen-size", "max-screen-size"], // Screen size
            r: ["min-refresh-rate", "max-refresh-rate"], // Refresh rate
            b: ["min-brightness", "max-brightness"], // Brightness
            y: ["min-year", "max-year"], // Year
            d: ["min-ppi", "max-ppi"], // PPI (density)
        };

        // Encode numeric ranges
        Object.entries(numericFilters).forEach(([prefix, [minId, maxId]]) => {
            const minValue = document.getElementById(minId).value;
            const maxValue = document.getElementById(maxId).value;
            if (minValue) params.append(`${prefix}1`, minValue);
            if (maxValue) params.append(`${prefix}2`, maxValue);
        });

        // Checkbox group filters (checked by default)
        const checkboxGroups = {
            b: "brand", // Brand
            p: "panel", // Panel
            r: "resolution", // Resolution
            c: "coating", // Coating
            h: "hdr", // HDR
            a: "aspect-ratio", // Aspect ratio
            t: "contrast-ratio", // Contrast ratio
            d: "bit-depth", // Bit depth
            v: "vesa", // Vesa
        };

        // Encode checkbox groups - only include unchecked ones
        Object.entries(checkboxGroups).forEach(([prefix, group]) => {
            const uncheckedBoxes = Array.from(
                document.querySelectorAll(`.filter-group.${group} input:not(:checked)`)
            ).map((input) => input.value);
            if (uncheckedBoxes.length > 0) {
                params.append(prefix, uncheckedBoxes.join(","));
            }
        });

        // Extras filters (unchecked by default)
        const extrasFilters = [];
        const indeterminateFilters = [];

        document.querySelectorAll(".filter-group.extras input").forEach((input) => {
            if (input.indeterminate) {
                indeterminateFilters.push(input.value);
            } else if (input.checked) {
                extrasFilters.push(input.value);
            }
        });

        if (extrasFilters.length > 0) {
            params.append("e", extrasFilters.join(","));
        }
        if (indeterminateFilters.length > 0) {
            params.append("ei", indeterminateFilters.join(","));
        }

        // Port filters
        const portFilters = {};
        document
            .querySelectorAll("div.filter-group.ports input.filter.port-main:checked")
            .forEach((input) => {
                const portType = input.getAttribute("value");
                const count =
                    input.closest(".port-type").querySelector(".port-count-select")
                        ?.value || "1";
                portFilters[portType] = count;
            });

        if (Object.keys(portFilters).length > 0) {
            params.append("o", JSON.stringify(portFilters));
        }

        // Search term
        const searchTerm = document.getElementById("search-input").value;
        if (searchTerm) {
            params.append("q", searchTerm);
        }

        // Rtings score type
        const rtingsScoreType = document.getElementById("rtings-score-type").value;
        if (rtingsScoreType !== "pc-gaming") {
            params.append("rt", rtingsScoreType);
        }

        // Update the URL
        window.history.replaceState(
            {},
            "",
            `${window.location.pathname}?${params.toString()}`
        );
    }

    function decodeFilterState() {
        const params = new URLSearchParams(window.location.search);

        // Initialize tri-state checkboxes
        const triStateCheckboxes = document.querySelectorAll(".tri");
        triStateCheckboxes.forEach((checkbox) => {
            checkbox.checked = false;
            checkbox.indeterminate = false;
        });

        // Numeric range filters
        const numericFilters = {
            p: ["min-price", "max-price"], // Price
            s: ["min-screen-size", "max-screen-size"], // Screen size
            r: ["min-refresh-rate", "max-refresh-rate"], // Refresh rate
            b: ["min-brightness", "max-brightness"], // Brightness
            y: ["min-year", "max-year"], // Year
            d: ["min-ppi", "max-ppi"], // PPI (density)
        };

        // Decode numeric ranges
        Object.entries(numericFilters).forEach(([prefix, [minId, maxId]]) => {
            document.getElementById(minId).value = params.get(`${prefix}1`) || "";
            document.getElementById(maxId).value = params.get(`${prefix}2`) || "";
        });

        // Checkbox group filters (checked by default)
        const checkboxGroups = {
            b: "brand", // Brand
            p: "panel", // Panel
            r: "resolution", // Resolution
            c: "coating", // Coating
            h: "hdr", // HDR
            a: "aspect-ratio", // Aspect ratio
            t: "contrast-ratio", // Contrast ratio
            d: "bit-depth", // Bit depth
            v: "vesa", // Vesa
        };

        // First set all checkboxes to their defaults (checked)
        Object.values(checkboxGroups).forEach((group) => {
            document
                .querySelectorAll(`.filter-group.${group} input`)
                .forEach((checkbox) => {
                    checkbox.checked = true;
                });
        });

        // Then uncheck the ones specified in the URL
        Object.entries(checkboxGroups).forEach(([prefix, group]) => {
            const values = params.get(prefix);
            if (values) {
                const uncheckedValues = values.split(",");
                document
                    .querySelectorAll(`.filter-group.${group} input`)
                    .forEach((checkbox) => {
                        if (uncheckedValues.includes(checkbox.value)) {
                            checkbox.checked = false;
                        }
                    });
            }
        });

        // Extras filters (unchecked by default)
        // First reset all extras to unchecked
        document.querySelectorAll(".filter-group.extras input").forEach((checkbox) => {
            checkbox.checked = false;
            checkbox.indeterminate = false;
        });

        // Handle checked extras
        const checkedExtras = params.get("e");
        if (checkedExtras) {
            const checkedValues = checkedExtras.split(",");
            document
                .querySelectorAll(".filter-group.extras input")
                .forEach((checkbox) => {
                    if (checkedValues.includes(checkbox.value)) {
                        checkbox.checked = true;
                    }
                });
        }

        // Handle indeterminate extras
        const indeterminateExtras = params.get("ei");
        if (indeterminateExtras) {
            const indeterminateValues = indeterminateExtras.split(",");
            document
                .querySelectorAll(".filter-group.extras input")
                .forEach((checkbox) => {
                    if (indeterminateValues.includes(checkbox.value)) {
                        checkbox.indeterminate = true;
                    }
                });
        }

        // Port filters
        const portFilters = params.get("o");
        if (portFilters) {
            try {
                const portData = JSON.parse(portFilters);
                Object.entries(portData).forEach(([portType, count]) => {
                    const portInput = document.querySelector(
                        `.filter-group.ports input[value="${portType}"]`
                    );
                    if (portInput) {
                        portInput.checked = true;
                        const countSelect = portInput
                            .closest(".port-type")
                            .querySelector(".port-count-select");
                        if (countSelect) {
                            countSelect.value = count;
                        }
                    }
                });
            } catch (e) {
                console.error("Failed to parse port filters:", e);
            }
        }

        // Search term
        const searchTerm = params.get("q");
        if (searchTerm) {
            document.getElementById("search-input").value = searchTerm;
        }

        // Rtings score type
        const rtingsScoreType = params.get("rt");
        if (rtingsScoreType) {
            document.getElementById("rtings-score-type").value = rtingsScoreType;
            document
                .getElementById("rtings-score-type")
                .dispatchEvent(new Event("change"));
        }
    }
});
