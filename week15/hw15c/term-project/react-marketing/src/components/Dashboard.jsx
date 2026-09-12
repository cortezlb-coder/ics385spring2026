import { useEffect, useMemo, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { tourismSeries } from "../data/tourismData";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

const defaultWeather = {
  location: "Kihei, Maui",
  current: 79,
  description: "partly cloudy",
  humidity: 68,
  windSpeed: 11,
  labels: ["Now", "+6h", "+12h", "+18h", "+24h", "+30h"],
  temperatures: [79, 78, 77, 76, 75, 74]
};

function formatMillions(value) {
  return `${value.toLocaleString()}`;
}

export default function Dashboard({ property }) {
  const [weather, setWeather] = useState(defaultWeather);
  const [weatherStatus, setWeatherStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    async function loadWeather() {
      const apiKey = import.meta.env.VITE_WEATHER_KEY;

      if (!apiKey) {
        setWeatherStatus("missing-key");
        return;
      }

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=20.7984&lon=-156.3319&units=imperial&appid=${apiKey}`
        );

        if (!response.ok) {
          throw new Error(`Weather request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const slice = payload.list.slice(0, 6);

        if (isMounted) {
          setWeather({
            location: payload.city?.name || "Kihei, Maui",
            current: Math.round(slice[0]?.main?.temp || defaultWeather.current),
            description: slice[0]?.weather?.[0]?.description || defaultWeather.description,
            humidity: Math.round(slice[0]?.main?.humidity || defaultWeather.humidity),
            windSpeed: Math.round(slice[0]?.wind?.speed || defaultWeather.windSpeed),
            labels: slice.map((entry) =>
              new Date(entry.dt * 1000).toLocaleTimeString([], {
                hour: "numeric"
              })
            ),
            temperatures: slice.map((entry) => Math.round(entry.main.temp))
          });
          setWeatherStatus("loaded");
        }
      } catch (error) {
        if (isMounted) {
          setWeather(defaultWeather);
          setWeatherStatus("fallback");
        }
      }
    }

    loadWeather();

    return () => {
      isMounted = false;
    };
  }, []);

  const arrivalsChart = useMemo(
    () => ({
      labels: tourismSeries.map((item) => item.year),
      datasets: [
        {
          label: "Visitor arrivals",
          data: tourismSeries.map((item) => item.arrivals),
          borderColor: "#0d6471",
          backgroundColor: "rgba(13, 100, 113, 0.16)",
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    }),
    []
  );

  const occupancyChart = useMemo(
    () => ({
      labels: tourismSeries.map((item) => item.year),
      datasets: [
        {
          label: "Hotel occupancy (%)",
          data: tourismSeries.map((item) => item.occupancy),
          borderRadius: 14,
          backgroundColor: ["#0d6471", "#ef8354", "#10354b", "#6cb4bb"]
        }
      ]
    }),
    []
  );

  const weatherChart = useMemo(
    () => ({
      labels: weather.labels,
      datasets: [
        {
          label: "Forecast temperature (F)",
          data: weather.temperatures,
          borderColor: "#ef8354",
          backgroundColor: "rgba(239, 131, 84, 0.18)",
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    }),
    [weather.labels, weather.temperatures]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#183244"
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#587081"
        },
        grid: {
          color: "rgba(16, 53, 75, 0.08)"
        }
      },
      y: {
        ticks: {
          color: "#587081"
        },
        grid: {
          color: "rgba(16, 53, 75, 0.08)"
        }
      }
    }
  };

  return (
    <section className="dashboard" id="dashboard">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Week 13 Dashboard</p>
          <h3>Tourism and weather at a glance.</h3>
        </div>
        <p>
          DBEDT tourism trends and live OpenWeatherMap data support the property story without
          sending visitors to another page.
        </p>
      </div>

      <div className="dashboard-summary">
        <article className="summary-card">
          <span>Property</span>
          <strong>{property.name}</strong>
        </article>
        <article className="summary-card">
          <span>Tourism years</span>
          <strong>{tourismSeries.length}</strong>
        </article>
        <article className="summary-card">
          <span>Weather</span>
          <strong>{weather.current} F in {weather.location}</strong>
        </article>
      </div>

      <div className="chart-grid">
        <article className="chart-card">
          <div className="chart-copy">
            <p className="chart-label">Chart 1</p>
            <h4>Visitor arrivals</h4>
            <p>Sample DBEDT trend line for post-COVID tourism recovery.</p>
          </div>
          <div className="chart-frame">
            <Line data={arrivalsChart} options={chartOptions} />
          </div>
        </article>

        <article className="chart-card">
          <div className="chart-copy">
            <p className="chart-label">Chart 2</p>
            <h4>Hotel occupancy</h4>
            <p>Maui County hotel occupancy trends from DBEDT hospitality data.</p>
          </div>
          <div className="chart-frame">
            <Bar data={occupancyChart} options={chartOptions} />
          </div>
        </article>

        <article className="chart-card">
          <div className="chart-copy">
            <p className="chart-label">Chart 3</p>
            <h4>OpenWeatherMap forecast</h4>
            <p>
              Current conditions: {weather.description}, {weather.humidity}% humidity, {weather.windSpeed} mph winds.
            </p>
          </div>
          <div className="chart-frame">
            <Line data={weatherChart} options={chartOptions} />
          </div>
          <p className="weather-note">
            {weatherStatus === "loaded" && "Live weather loaded from OpenWeatherMap."}
            {weatherStatus === "missing-key" && "Add VITE_WEATHER_KEY to load live weather. Showing fallback weather data."}
            {weatherStatus === "fallback" && "Weather fetch failed. Showing fallback weather data."}
            {weatherStatus === "loading" && "Loading weather forecast..."}
          </p>
        </article>
      </div>

      <div className="dashboard-footnote">
        {tourismSeries.map((item) => (
          <div key={item.year} className="footnote-item">
            <span>{item.year}</span>
            <strong>{formatMillions(item.arrivals)} Australian visitors • {item.occupancy}% occupancy</strong>
          </div>
        ))}
      </div>
    </section>
  );
}