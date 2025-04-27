document.addEventListener("DOMContentLoaded", function () {
    const table = document.getElementById("table");
    const tbody = table.querySelector("tbody");
    const rows = document.querySelectorAll("#table tbody tr");

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
        ports: [],
        searchTerms: [],
    };

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
        const rowsToDisplay = [];
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

        rows.forEach((row) => {
            const title = row.getAttribute("data-title");
            const price = parseInt(row.getAttribute("data-price")) || 0;
            const screenSize = parseFloat(row.getAttribute("data-screen-size")) || 0;
            const resolutionValue = row.getAttribute("data-resolution");
            const resolutionPixels = row.getAttribute("data-resolution-pixels");
            const maxRefreshRate = row.getAttribute("data-max-refresh-rate") || 0;
            const brightness = row.getAttribute("data-brightness") || 0;
            const year = row.getAttribute("data-year") || 0;
            const ppi = row.getAttribute("data-ppi") || 0;
            const kvm = row.getAttribute("data-kvm") || 0;
            const speakers = row.getAttribute("data-speakers-power") || 0;
            const curved = row.getAttribute("data-curved") || 0;
            const ports = row.getAttribute("data-ports") || "{}";
            let portsObj = {};
            try {
                portsObj = JSON.parse(ports);
            } catch (e) {
                console.error("Failed to parse ports data:", e);
            }

            let contrast = row.getAttribute("data-contrast") || 0;
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

            let aspectRatio = row.getAttribute("data-aspect-ratio") || 0;
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

            let vesa = row.getAttribute("data-vesa-interface") || 0;
            if (!vesaTypes.includes(vesa)) {
                vesa = "Other";
            }

            let bitDepth = row.getAttribute("data-bit-depth") || 0;
            if (!bitDepthTypes.includes(bitDepth)) {
                bitDepth = "Unknown";
            }

            let hdr = row.getAttribute("data-hdr");
            if (!hdrTypes.includes(hdr)) {
                hdr = "Unknown";
            }

            let coating = row.getAttribute("data-coating");
            if (!coatingTypes.includes(coating)) {
                coating = "Unknown";
            }

            let panel = row.getAttribute("data-panel");
            if (!panelTypes.includes(panel)) {
                panel = "Other";
            }

            let brand = row.getAttribute("data-brand").toLowerCase().replace(/\s+/g, "_");
            if (!brandTypes.includes(brand)) {
                brand = "Other";
            }

            const matchesBrand = filters.brands.includes(brand);
            const matchesPrice = price >= filters.price.min && price <= filters.price.max;
            const matchesScreenSize =
                screenSize >= filters.screen_size.min &&
                screenSize <= filters.screen_size.max;
            const matchesResolution = filters.resolution.includes(resolutionValue);
            const matchesPanel = filters.panel.includes(panel);
            const matchesMaxRefreshRate =
                maxRefreshRate >= filters.max_refresh_rate.min &&
                maxRefreshRate <= filters.max_refresh_rate.max;
            const matchesCoating = filters.coating.includes(coating);
            const matchesHdr = filters.hdr.includes(hdr);
            const matchesBrightness =
                brightness >= filters.brightness.min &&
                brightness <= filters.brightness.max;
            const matchesYear = year >= filters.year.min && year <= filters.year.max;
            const matchesPpi = ppi >= filters.ppi.min && ppi <= filters.ppi.max;
            const matchesBitDepth = filters.bit_depth.includes(bitDepth);
            const matchesVesa = filters.vesa.includes(vesa);
            const matchesAspectRatio = filters.aspect_ratio.includes(aspectRatio);
            const matchesContrast = filters.contrast.includes(contrast);
            const matchesSearchTerms =
                filters.searchTerms.length === 0 ||
                filters.searchTerms.every(
                    (keyword) =>
                        title?.toLowerCase().includes(keyword) ||
                        brand?.toLowerCase().includes(keyword) ||
                        row.getAttribute("data-panel").toLowerCase().includes(keyword) ||
                        resolutionPixels?.toLowerCase().includes(keyword)
                );

            let matchesKVM = true;
            if (filters.extras.includes("KVM")) {
                matchesKVM = kvm === "true";
            }

            let matchesSpeakers = true;
            if (filters.extras.includes("Speakers")) {
                matchesSpeakers = parseInt(speakers) > 0;
            }

            let matchesCurved = true;
            if (filters.extras.includes("Curved")) {
                matchesCurved = curved === "true";
            }
            if (filters.extrasNegated.includes("Curved")) {
                matchesCurved = curved !== "true";
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

            if (
                matchesScreenSize &&
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
                matchesSpeakers
            ) {
                rowsToDisplay.push(row);
            }
        });

        // Hide all rows first
        rows.forEach((row) => (row.style.display = "none"));

        // Show only filtered rows
        rowsToDisplay.forEach((row) => (row.style.display = ""));
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

    document
        .querySelectorAll("#filters input, #search-input, #filters select")
        .forEach((input) => {
            if (input.type === "number" || input.type === "text") {
                input.addEventListener("input", updateFilters);
            } else {
                input.addEventListener("change", updateFilters);
            }
        });

    let sortingState = [];

    function sortTableByColumns(sortingState) {
        const rowsArray = Array.from(tbody.querySelectorAll("tr"));

        rowsArray.sort((rowA, rowB) => {
            for (let { columnIndex, ascending } of sortingState) {
                let cellA = rowA.cells[columnIndex].textContent.trim();
                let cellB = rowB.cells[columnIndex].textContent.trim();
                const label = rowA.cells[columnIndex].getAttribute("data-label");

                // Handle specific data attributes for numeric columns
                if (label === "Price") {
                    cellA = rowA.getAttribute("data-price");
                    cellB = rowB.getAttribute("data-price");
                }
                if (label === "Screen Size") {
                    cellA = rowA.getAttribute("data-screen-size");
                    cellB = rowB.getAttribute("data-screen-size");
                }
                if (label === "Resolution") {
                    cellA = -1;
                    let cellAPixels = rowA.getAttribute("data-resolution-pixels");
                    if (cellAPixels) {
                        let resA = parseFloat(cellAPixels.split("x")[0]);
                        let resB = parseFloat(cellAPixels.split("x")[1]);
                        cellA = resA * resB;
                    }

                    cellB = -1;
                    let cellBPixels = rowB.getAttribute("data-resolution-pixels");
                    if (cellBPixels) {
                        let resA = parseFloat(cellBPixels.split("x")[0]);
                        let resB = parseFloat(cellBPixels.split("x")[1]);
                        cellB = resA * resB;
                    }
                }
                if (label === "Contrast Ratio") {
                    cellA = -1;
                    let cellAContrast = rowA.getAttribute("data-contrast");
                    if (cellAContrast && cellAContrast != "0") {
                        let contrastValue = parseFloat(cellAContrast.split(" ")[0]);
                        cellA = contrastValue;
                    }
                    cellB = -1;
                    let cellBContrast = rowB.getAttribute("data-contrast");
                    if (cellBContrast && cellBContrast != "0") {
                        let contrastValue = parseFloat(cellBContrast.split(" ")[0]);
                        cellB = contrastValue;
                    }
                }
                if (label === "Panel") {
                    cellA = rowA.getAttribute("data-panel");
                    cellB = rowB.getAttribute("data-panel");
                }
                if (label === "Refresh Rate") {
                    cellA = rowA.getAttribute("data-max-refresh-rate");
                    cellB = rowB.getAttribute("data-max-refresh-rate");
                }
                if (label === "Brightness") {
                    cellA = rowA.getAttribute("data-brightness");
                    cellB = rowB.getAttribute("data-brightness");
                }
                if (label === "Year") {
                    cellA = rowA.getAttribute("data-year");
                    cellB = rowB.getAttribute("data-year");
                }
                if (label === "PPI") {
                    cellA = rowA.getAttribute("data-ppi");
                    cellB = rowB.getAttribute("data-ppi");
                }
                if (label === "Aspect Ratio") {
                    cellA = rowA.getAttribute("data-aspect-ratio");
                    cellB = rowB.getAttribute("data-aspect-ratio");
                }
                if (label === "Bit Depth") {
                    cellA = rowA.getAttribute("data-bit-depth");
                    cellB = rowB.getAttribute("data-bit-depth");
                }
                if (label === "Vesa Mount") {
                    cellA = -1;
                    let cellAVesa = rowA.getAttribute("data-vesa-interface");
                    if (cellAVesa && cellAVesa != "None" && cellAVesa != "0") {
                        let vesaValue = parseFloat(cellAVesa.split(" ")[0]);
                        cellA = vesaValue;
                    }
                    cellB = -1;
                    let cellBVesa = rowB.getAttribute("data-vesa-interface");
                    if (cellBVesa && cellBVesa != "None" && cellBVesa != "0") {
                        let vesaValue = parseFloat(cellBVesa.split(" ")[0]);
                        cellB = vesaValue;
                    }
                }
                if (label === "KVM") {
                    cellA = rowA.getAttribute("data-kvm");
                    cellB = rowB.getAttribute("data-kvm");
                }
                if (label === "Speakers") {
                    cellA = rowA.getAttribute("data-speakers-power");
                    cellB = rowB.getAttribute("data-speakers-power");
                }

                if (label === "Rtings Score") {
                    const selectedRtingsScoreType =
                        document.getElementById("rtings-score-type").value;
                    cellA = rowA.getAttribute(
                        `data-rtings-${selectedRtingsScoreType}-score`
                    );
                    cellB = rowB.getAttribute(
                        `data-rtings-${selectedRtingsScoreType}-score`
                    );
                }
                if (label === "Coating") {
                    let coatingKeys = { "": 1, Matte: 2, "Semi-Glossy": 3, Glossy: 4 };
                    cellA = coatingKeys[rowA.getAttribute("data-coating")];
                    cellB = coatingKeys[rowB.getAttribute("data-coating")];
                }
                if (label === "HDR") {
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
                    cellA = hdrKeys[rowA.getAttribute("data-hdr")];
                    cellB = hdrKeys[rowB.getAttribute("data-hdr")];
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
                    let comparison = cellA.localeCompare(cellB);
                    if (comparison !== 0) return ascending ? comparison : -comparison;
                }
            }
            return 0; // If all columns are equal, return 0
        });

        rowsArray.forEach((row) => tbody.appendChild(row));
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

    function setupSorting() {
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
    }

    document.querySelector(".control-button.reset").addEventListener("click", (event) => {
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

    document.getElementById("sort-select").addEventListener("change", function () {
        const columnIndex = parseInt(this.value);
        const ascending = this.options[this.selectedIndex].dataset.ascending === "true";
        sortingState = [{ columnIndex, ascending }];
        sortTableByColumns(sortingState);
        updateSortingHeaders();
    });

    let basicToggle = document.querySelector('.specs-toggle input[value="basic"]');
    if (basicToggle && basicToggle.checked) {
        document.querySelector("#container").classList.add("basic");
    }

    document.getElementById("rtings-score-type").addEventListener("change", function () {
        const selectedRtingsScoreType = this.value;
        const selectedRtingsScoreLabel = this.options[this.selectedIndex].dataset.label;
        rows.forEach((row) => {
            const scoreCell = row.querySelector('td[data-label="Rtings Score"]');
            const newScore = row.getAttribute(
                `data-rtings-${selectedRtingsScoreType}-score`
            );
            if (newScore !== "0") {
                scoreCell.querySelector(".rtings-score-value").textContent =
                    parseFloat(newScore).toFixed(1);
            }
        });

        // Check if currently sorting by Rtings score
        const rtingsSortingState = sortingState.find((state) => state.columnIndex === 5);
        if (rtingsSortingState) {
            sortTableByColumns(sortingState);
        }

        encodeFilterState();
    });

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

    // Initialize tri-state checkboxes
    const checkboxes = document.querySelectorAll(".tri");
    const states = new Map();
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
        });
    });

    handleFilterVisibility();
    decodeFilterState();
    updateFilters();
    setupSorting();

    sortingState.push({ columnIndex: 5, ascending: false });
    sortTableByColumns(sortingState);
    updateSortingHeaders();

    document.querySelector("table").style.display = "block";
    document.querySelector("#sidebar").style.display = "block";
    document.querySelector("#filters").scrollTo(0, 0);
    document.querySelector("#main").scrollTo(0, 0);
});
