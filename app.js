const airportCoordinates = {
    NZAA: { lat: -37.008, lon: 174.792 },  // Auckland Airport
    NZCH: { lat: -43.487, lon: 172.531 },  // Christchurch Airport
    NZDN: { lat: -45.908, lon: 170.199 },  // Dunedin Airport
    NZGS: { lat: -38.667, lon: 177.982 },  // Gisborne Airport
    NZHK: { lat: -42.713, lon: 170.984 },  // Hokitika Airport
    NZHN: { lat: -37.865, lon: 175.336 },  // Hamilton
    NZHS: { lat: -39.647, lon: 176.766 },  // Hastings
    NZKI: { lat: -42.425, lon: 173.601 },  // Kaikoura Airport
    NZKK: { lat: -35.262, lon: 173.912 },  // Kerieri
    NZKT: { lat: -35.066, lon: 173.284 },  // Kaitaia
    NZMS: { lat: -40.973, lon: 175.634 },  // Hood Aerodrome, Masterton
    NZPM: { lat: -40.323, lon: 175.622 },  // Palmerston North International
    NZNS: { lat: -41.298, lon: 173.224 },  // Nelson Airport
    NZNP: { lat: -39.009, lon: 174.178 },  // New Plymouth Airport
    NZOH: { lat: -40.202, lon: 175.390 },  // Ohakea Airfield
    NZPP: { lat: -40.901, lon: 174.985 },  // NZPP
    NZRO: { lat: -38.109, lon: 176.316 },  // Rotorua Airport
    NZTG: { lat: -37.672, lon: 176.198 },  // Tauranga Airport
    NZAP: { lat: -38.739, lon: 176.083 },  // Taupo Airport
    NZWB: { lat: -41.514, lon: 173.868 },  // Woodbourne Airport
    NZWF: { lat: -44.722, lon: 169.246 },  // Wanaka Airport
    NZWK: { lat: -37.924, lon: 176.918 },  // Whakatane Airport
    NZWS: { lat: -41.739, lon: 171.578 },  // Westport
    NZWU: { lat: -39.961, lon: 175.024 },  // Wanganui Airport
    NZTU: { lat: -44.301, lon: 171.223 },  // Timaru Airport
    NZQN: { lat: -45.019, lon: 168.745 },  // Queenstown Airport
    NZNV: { lat: -46.415, lon: 168.321 },  // Invercargill Airport
    NZMC: { lat: -43.766, lon: 170.132 },  // Mount cook Airport
    NZWN: { lat: -41.326, lon: 174.806 },  // Wellington
};

// Function to fetch METAR data from the API
async function fetchMetarData() {
    try {
        const response = await fetch('https://api-preprod.avplan-efb.com/api/v4/opmet/metar', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer 7KDDlultS24J5NlI5qUrJQ==' // Replace with your actual API key
            }
        });

        const data = await response.json();

        if (data.error) {
            console.error('Error fetching METAR data:', data.error);
        } else {
            // Log raw METAR data to the console for debugging
            logRawMetarData(data);

            // Find and log airports with windspeed above 29
            findWindyAirports(data);

            // Find and log airports with wind gusts above 24
            findGustyAirports(data);

            // Filter airports starting with 'NZ' and display them on the map
            const nzAirports = filterAirportsStartingWithNZ(data);

            // Update the flight conditions of windy and gusty airports
            updateWindyAirportConditions(nzAirports, data);
            updateGustyAirportConditions(nzAirports, data);

            addMarkersToMap(nzAirports);
        }
    } catch (error) {
        console.error("Error fetching METAR data:", error);
    }
}

// Log the raw METAR data to the console for debugging purposes
function logRawMetarData(metarData) {
    console.log("Raw METAR Data:");
    console.log(metarData);  // Log the entire METAR response for inspection
}

// Find and log airports with windspeed greater than 29
function findWindyAirports(metarData) {
    const windyAirports = metarData.filter(airport => airport.windspeed > 29);

    if (windyAirports.length > 0) {
        console.log("Windy airports:");

        windyAirports.forEach(airport => {
            console.log(`Airport: ${airport.ident}, Windspeed: ${airport.windspeed} KT`);
        });
    } else {
        console.log("No windy airports found.");
    }
}

// Find and log airports with windgust greater than 24
function findGustyAirports(metarData) {
    const gustyAirports = metarData.filter(airport => airport.windgust > 24);

    if (gustyAirports.length > 0) {
        console.log("Gusty airports:");

        gustyAirports.forEach(airport => {
            console.log(`Airport: ${airport.ident}, Wind Gust: ${airport.windgust} KT`);
        });
    } else {
        console.log("No gusty airports found.");
    }
}

// Update flight conditions for airports with windspeed above 29
function updateWindyAirportConditions(nzAirports, metarData) {
    const windyAirports = metarData.filter(airport => airport.windspeed > 24);

    windyAirports.forEach(windyAirport => {
        const airportCode = windyAirport.ident;

        // If the airport is found in our list of NZ airports, update its condition to 'windy'
        const airport = nzAirports.find(airport => airport.ident === airportCode);
        if (airport) {
            airport.flightcategory = 'windy'; // Update the flight condition to 'windy'
        }
    });
}

// Update flight conditions for airports with wind gusts above 24
function updateGustyAirportConditions(nzAirports, metarData) {
    const gustyAirports = metarData.filter(airport => airport.windgust > 24);

    gustyAirports.forEach(gustyAirport => {
        const airportCode = gustyAirport.ident;

        // If the airport is found in our list of NZ airports, update its condition to 'gusty'
        const airport = nzAirports.find(airport => airport.ident === airportCode);
        if (airport) {
            airport.flightcategory = 'gusty'; // Update the flight condition to 'gusty'
        }
    });
}

// Filter METAR data for airports starting with 'NZ'
function filterAirportsStartingWithNZ(metarData) {
    return metarData.filter(airport => airport.ident && airport.ident.startsWith("NZ"));
}

// Add markers to the map for airports starting with 'NZ'
function addMarkersToMap(nzAirports) {
    nzAirports.forEach(airport => {
        const airportCode = airport.ident;
        const flightCategory = airport.flightcategory;
        const coordinates = airportCoordinates[airportCode];

        if (coordinates && coordinates.lat && coordinates.lon) {
            let markerColor = 'green'; // Default to 'vfr'

            // Change color based on the flight category
            if (flightCategory === 'IFR') {
                markerColor = 'red'; // IFR is bad weather, so red
            } else if (flightCategory === 'MVFR') {
                markerColor = 'yellow'; // MVFR is moderate weather, so yellow
            } else if (flightCategory === 'VFR') {
                markerColor = 'green'; // VFR is good weather, so green
            } else if (flightCategory === 'LIFR') {
                markerColor = 'purple'; // LIFR is very poor conditions, so purple
            } else if (flightCategory === 'windy') {
                markerColor = 'blue'; // Windy is blue
            } else if (flightCategory === 'gusty') {
                markerColor = 'magenta'; // Gusty is magenta
            }

            const marker = L.circleMarker([coordinates.lat, coordinates.lon], {
                color: markerColor,
                radius: 8,
                fillOpacity: 0.8
            }).addTo(map)
            .bindPopup(`<b>${airportCode}</b><br>Flight Category: ${flightCategory}`);
        }
    });
}

// Create the Legend with hoverable question marks for more info
function createLegend() {
    const legend = L.control({ position: 'topright' });

    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        const categories = [
            { color: 'green', label: 'VFR', description: 'Visual Flight Rules (Good weather)' },
            { color: 'yellow', label: 'MVFR', description: 'Marginal VFR (Moderate weather)' },
            { color: 'red', label: 'IFR', description: 'Instrument Flight Rules (Poor weather)' },
            { color: 'purple', label: 'LIFR', description: 'Low IFR (Very poor conditions)' },
            { color: 'blue', label: 'Windy', description: 'Strong winds (Windspeed > 29)' },
            { color: 'magenta', label: 'Gusty', description: 'High gusts (Wind Gust > 24)' }
        ];

        categories.forEach(category => {
            div.innerHTML +=
                `<i style="background:${category.color}"></i> ${category.label} 
                <span class="question-mark" title="${category.description}">?</span><br>`;
        });

        return div;
    };

    legend.addTo(map);
}

// Add CSS for the question mark and tooltips
const style = document.createElement('style');
style.innerHTML = `
    .info.legend {
        background: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 14px;
        box-shadow: 0px 0px 5px rgba(0,0,0,0.2);
    }

    .info.legend i {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
    }

    .info.legend .question-mark {
        font-size: 16px;
        color: gray;
        cursor: pointer;
        margin-left: 5px;
    }

    .info.legend .question-mark:hover {
        color: black;
    }
`;
document.head.appendChild(style);

// Initialize the map (Leaflet.js)
const map = L.map('map').setView([-41.2867, 174.7762], 6);  // Default to New Zealand coordinates

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Fetch and display METAR data
fetchMetarData();

// Create the legend for the map
createLegend();