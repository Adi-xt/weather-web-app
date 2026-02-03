const inputElem = document.querySelector("#Search");
const buttonElem = document.querySelector("#search");

const statusElem = document.querySelector("#status");
const hintElem = document.querySelector("#hint");

function setAccent(data) {
    // simple color mapping by condition text (keeps it easy)
    const text = (data.current.condition.text || "").toLowerCase();
    let accent = "#ffd54a"; // default sunny

    if (text.includes("rain") || text.includes("drizzle") || text.includes("storm")) accent = "#4fc3f7";
    else if (text.includes("cloud") || text.includes("overcast")) accent = "#bdbdbd";
    else if (text.includes("snow") || text.includes("ice")) accent = "#90caf9";
    else if (data.current.is_day === 0) accent = "#b39ddb";

    document.documentElement.style.setProperty("--accent", accent);
}

function setLoading(isLoading) {
    if (isLoading) {
        statusElem.classList.add("is-loading");
        buttonElem.disabled = true;
        buttonElem.textContent = "Loading...";
    } else {
        statusElem.classList.remove("is-loading");
        buttonElem.disabled = false;
        buttonElem.textContent = "Search";
    }
}

async function fetchWeather(location) {
    const url = `https://api.weatherapi.com/v1/current.json?key=c7236d36debb4636a18170654262201&q=${encodeURIComponent(
        location
    )}&aqi=no`;

    const response = await fetch(url);
    const data = await response.json(); // WeatherAPI returns JSON even on errors

    if (!response.ok || data.error) {
        throw new Error(data?.error?.message || "City not found");
    }
    return data;
}

function updateDOM(data) {
    // ---- elements ----
    const tempElem = document.querySelector(".temperature");
    const feelsElem = document.querySelector(".feels");
    const locationElem = document.querySelector(".location");
    const timeElem = document.querySelector(".time");
    const dayElem = document.querySelector(".day");
    const dateElem = document.querySelector(".date");
    const conditionElem = document.querySelector(".condition");
    const updatedAtElem = document.querySelector(".updatedAt");

    const humidityElem = document.querySelector(".humidity");
    const windElem = document.querySelector(".wind");
    const pressureElem = document.querySelector(".pressure");

    const iconImg = document.querySelector(".image");

    // ---- data ----
    const temperature = data.current.temp_c;
    const feelslike = data.current.feelslike_c;
    const location = data.location.name;
    const timedata = data.location.localtime; // "YYYY-MM-DD HH:MM"
    const [date, time] = timedata.split(" ");

    const conditionText = data.current.condition.text;

    // IMPORTANT FIX:
    // WeatherAPI gives: //cdn.weatherapi.com/...
    // so we must prefix https:
    const iconUrl = "https:" + data.current.condition.icon;

    // ---- update ----
    tempElem.textContent = `${temperature} °C`;
    feelsElem.textContent = `${feelslike}`;

    locationElem.textContent = location;

    timeElem.textContent = time;
    dateElem.textContent = date;

    const d = new Date(timedata.replace(" ", "T"));
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    dayElem.textContent = days[d.getDay()];

    conditionElem.textContent = conditionText;
    updatedAtElem.textContent = time;

    humidityElem.textContent = data.current.humidity;
    windElem.textContent = data.current.wind_kph;
    pressureElem.textContent = data.current.pressure_mb;

    // smooth icon swap (fade)
    iconImg.style.opacity = "0";
    iconImg.alt = conditionText;
    iconImg.title = conditionText;
    iconImg.src = iconUrl;
    iconImg.onload = () => {
        iconImg.style.opacity = "1";
    };

    setAccent(data);
}

async function runSearch() {
    const location = inputElem.value.trim();
    hintElem.textContent = "";

    if (!location) {
        hintElem.textContent = "Please enter a city name.";
        return;
    }

    setLoading(true);
    try {
        const data = await fetchWeather(location);
        updateDOM(data);
        inputElem.value = "";
    } catch (err) {
        hintElem.textContent = err.message;
    } finally {
        setLoading(false);
    }
}

buttonElem.addEventListener("click", runSearch);

inputElem.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
});
