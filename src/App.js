import React, { useState } from 'react';
import './App.css';

function App() {
  const [weather, setWeather] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m'
      );
      const data = await response.json();
      setWeather(data.hourly.temperature_2m.slice(0, 12)); // Show first 12 hours
    } catch (err) {
      setError('Failed to fetch weather data');
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <h1>Weather App (Berlin)</h1>
      <button onClick={fetchWeather}>Get Weather</button>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {weather.length > 0 && (
        <div className="weather-info">
          <h2>Hourly Temperatures (°C)</h2>
          <ul>
            {weather.map((temp, index) => (
              <li key={index}>Hour {index + 1}: {temp}°C</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
