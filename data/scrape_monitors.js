const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const htmlFilePath = path.join(__dirname, 'index.html');
const jsonFilePath = path.join(__dirname, 'monitors.json');

try {
    // Read the HTML file
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

    // Load HTML content into cheerio
    const $ = cheerio.load(htmlContent);

    const monitors = [];

    // Select all table rows within the tbody with id 'table-body'
    $('#table-body tr').each((index, element) => {
        const row = $(element);
        const data = row.data(); // Gets all data-* attributes

        // Basic check if it's a valid monitor row (e.g., has a title)
        if (!data.title) {
            console.warn(`Skipping row ${index + 1}: Missing data-title attribute.`);
            return; // Skip this row if it doesn't seem like a monitor entry
        }

        // Extract link from the first td
        const link = row.find('td.sticky a').attr('href') || null;

        // Parse ports JSON, handling potential errors and HTML entities
        let ports = {};
        if (data.ports && typeof data.ports === 'string') {
            try {
                // Replace HTML entities for quotes before parsing
                const portsJsonString = data.ports.replace(/&#34;/g, '"');
                ports = JSON.parse(portsJsonString);
            } catch (e) {
                console.error(`Failed to parse ports JSON for ${data.title}: ${data.ports}`, e);
                ports = {}; // Default to empty object on error
            }
        } else if (typeof data.ports === 'object') {
            // If it's already an object (less likely with direct data attributes but possible)
             ports = data.ports;
        }


        const monitor = {
            title: data.title || null,
            brand: data.brand || null,
            price: parseFloat(data.price) || 0, // Default to 0 if parsing fails or missing
            screenSize: parseFloat(data.screenSize) || 0,
            resolution: data.resolution || null,
            resolutionPixels: data.resolutionPixels || null,
            panel: data.panel || null,
            maxRefreshRate: parseInt(data.maxRefreshRate, 10) || 0,
            curved: data.curved === 'true', // Convert string 'true' to boolean
            ports: ports,
            coating: data.coating || null,
            brightness: parseInt(data.brightness, 10) || 0,
            hdr: data.hdr || 'None', // Keep 'None' or specific HDR value
            year: parseInt(data.year, 10) || 0,
            ppi: parseInt(data.ppi, 10) || 0,
            aspectRatio: data.aspectRatio || null,
            contrast: data.contrast || null, // Keep as string "X : 1" or null
            bitDepth: data.bitDepth || null, // Keep string like "8 bits" or "10 bits (8 bits + FRC)"
            vesaInterface: data.vesaInterface || 'None', // Keep 'None' or specific value
            kvm: data.kvm || 'None', // Keep 'None' or specific value
            speakersNumber: data.speakersNumber === 'None' ? null : parseInt(data.speakersNumber, 10) || null,
            speakersPower: parseInt(data.speakersPower, 10) || 0,
            rtingsPcGamingScore: parseFloat(data.rtingsPcGamingScore) || 0,
            rtingsOfficeScore: parseFloat(data.rtingsOfficeScore) || 0,
            rtingsEditingScore: parseFloat(data.rtingsEditingScore) || 0,
            rtingsMixedUsageScore: parseFloat(data.rtingsMixedUsageScore) || 0,
            rtingsMediaConsumptionScore: parseFloat(data.rtingsMediaConsumptionScore) || 0,
            link: link,
        };

        // Clean up null/empty values if desired, e.g., set 0 brightness/year/ppi to null
        if (monitor.brightness === 0) monitor.brightness = null;
        if (monitor.year === 0) monitor.year = null;
        if (monitor.ppi === 0) monitor.ppi = null;
        if (monitor.contrast === '0') monitor.contrast = null;
        if (monitor.aspectRatio === '0') monitor.aspectRatio = null;
        if (monitor.bitDepth === '0') monitor.bitDepth = null;
        if (monitor.vesaInterface === '0') monitor.vesaInterface = 'None';
        if (monitor.kvm === '0') monitor.kvm = 'None';
        if (monitor.hdr === '') monitor.hdr = 'None';
        if (monitor.coating === '') monitor.coating = null;
        // Handle cases where ports might be an empty string attribute resulting in {}
        if (Object.keys(monitor.ports).length === 0 && data.ports === '') {
             monitor.ports = null;
        }


        monitors.push(monitor);
    });

    // Write the data to a JSON file
    fs.writeFileSync(jsonFilePath, JSON.stringify(monitors, null, 2), 'utf-8');

    console.log(`Successfully scraped ${monitors.length} monitors to ${jsonFilePath}`);

} catch (error) {
    console.error('Error during scraping process:', error);
    process.exit(1); // Exit with error code
}

// To run this script:
// 1. Make sure you have Node.js installed.
// 2. Install cheerio: npm install cheerio
// 3. Run the script: node scrape_monitors.js
