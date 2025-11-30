// DOM element references
const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const messageEl = document.getElementById("message");
const weatherSection = document.getElementById("weather");
const cityNameEl = document.getElementById("city-name");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("description");
const iconEl = document.getElementById("icon");

// Map weather_code -> description + simple emoji icon
const weatherMap = {
    0: { desc: "Clear sky ☀️" },
    1: { desc: "Partly sunny 🌤️" },
    2: { desc: "Partly cloudy ⛅" },
    3: { desc: "Cloudy ☁️" },
    45: { desc: "Fog 🌫️" },
    48: { desc: "Dense fog 🌫️" },
    51: { desc: "Light drizzle 🌦️" },
    61: { desc: "Light rain 🌧️" },
    63: { desc: "Moderate rain 🌧️" },
    65: { desc: "Heavy rain ⛈️" },
    71: { desc: "Light snow 🌨️" },
    73: { desc: "Moderate snow 🌨️" },
    75: { desc: "Heavy snow ❄️" },
    95: { desc: "Thunderstorm ⛈️" }
};

// Form submit event listener
form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the default form behavior (page reload)

    const city = cityInput.value.trim(); // City name, trimmed
    if (!city) return;

    showMessage("Searching..."); // Display a message to the user
    weatherSection.classList.add("hidden");

    try {
        // Get coordinates
        const { latitude, longitude, name, country } = await geocode(city);
        // Fetch weather data
        const data = await fetchWeather(latitude, longitude);

        // Render result: city name + country code + weather info
        renderWeather(name, country, data);

        showMessage(""); // Clear message
    } catch (err) {
        showMessage(err.message || "Unexpected error");
    }
});

// Utility function to show messages
function showMessage(msg) {
    messageEl.textContent = msg;
}

// Get city coordinates using geocoding API
async function geocode(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error in geocoding service");
    const data = await res.json();
    if (!data.results || data.results.length === 0) throw new Error("City not found");
    const result = data.results[0];
    return {
        latitude: result.latitude,
        longitude: result.longitude,
        name: result.name,
        country: result.country_code
    };
}

// Fetch weather data from Open-Meteo API
async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error fetching weather data");
    return res.json();
}

// Render weather information on the page
function renderWeather(city, country, data) {
    const temp = data.current.temperature_2m;
    const code = data.current.weather_code;
    const weatherInfo = weatherMap[code] || { desc: "Unknown condition" };

    cityNameEl.textContent = `${city}, ${country}`;
    tempEl.textContent = `${Math.round(temp)}°C`;
    descEl.textContent = weatherInfo.desc;

    iconEl.src = ""; // Default emoji used in description
    iconEl.alt = weatherInfo.desc;
    iconEl.style.display = "none";

    weatherSection.classList.remove("hidden");
}
