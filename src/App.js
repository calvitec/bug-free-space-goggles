import React, { useState, useEffect } from 'react';
import './App.css';

const API_KEY = 'a7da13b040c748dd949131715251904';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric');

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) {
      setError('Please enter a city name.');
      setWeather(null);
      setForecast([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=3&aqi=no&alerts=no`
      );
      const data = await response.json();

      if (data.error) {
        setError(data.error.message || 'City not found');
        setWeather(null);
        setForecast([]);
        return;
      }

      const { location, current, forecast } = data;

      const weatherData = {
        city: location.name,
        temperature: unit === 'metric' ? current.temp_c : current.temp_f,
        humidity: current.humidity,
        windspeed: unit === 'metric' ? current.wind_kph : current.wind_mph,
        windDirection: current.wind_degree,
        condition: current.condition.text,
        icon: current.condition.icon,
      };

      const forecastData = forecast.forecastday.map((day) => ({
        date: day.date,
        maxTemp: unit === 'metric' ? day.day.maxtemp_c : day.day.maxtemp_f,
        minTemp: unit === 'metric' ? day.day.mintemp_c : day.day.mintemp_f,
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
      }));

      setWeather(weatherData);
      setForecast(forecastData);
      setError(null);

      // Save to localStorage for offline access
      localStorage.setItem('lastWeather', JSON.stringify(weatherData));
      localStorage.setItem('lastForecast', JSON.stringify(forecastData));
    } catch (err) {
      console.error(err);
      setError('Unable to fetch weather data. You may be offline.');

      // Load from localStorage if available
      const lastWeather = localStorage.getItem('lastWeather');
      const lastForecast = localStorage.getItem('lastForecast');
      if (lastWeather && lastForecast) {
        setWeather(JSON.parse(lastWeather));
        setForecast(JSON.parse(lastForecast));
      }
    }
  };

  useEffect(() => {
    if (city) fetchWeather(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  const toggleFavorite = () => {
    if (!city) return;

    const updatedFavorites = favorites.includes(city)
      ? favorites.filter((c) => c !== city)
      : [...favorites, city];

    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const isFavorite = favorites.includes(city);

  return (
    <div className="app">
      <h1>Weather App</h1>

      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city"
      />
      <button onClick={() => fetchWeather(city)}>Get Weather</button>

      <div>
        <label>
          Unit:
          <select value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="metric">Celsius (°C)</option>
            <option value="imperial">Fahrenheit (°F)</option>
          </select>
        </label>
      </div>

      {city && (
        <button onClick={toggleFavorite}>
          {isFavorite ? '★ Remove from Favorites' : '☆ Add to Favorites'}
        </button>
      )}

      {favorites.length > 0 && (
        <div className="favorites">
          <h3>Favorites</h3>
          <div className="favorite-list">
            {favorites.map((fav, i) => (
              <button key={i} onClick={() => setCity(fav)}>
                {fav}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-info">
          <h2>{weather.city}</h2>
          <img src={weather.icon} alt={weather.condition} />
          <p>{weather.condition}</p>
          <p>Temperature: {weather.temperature}°{unit === 'metric' ? 'C' : 'F'}</p>
          <p>Humidity: {weather.humidity}%</p>
          <p>Wind: {weather.windspeed} {unit === 'metric' ? 'km/h' : 'mph'}</p>
          <p>Wind Direction: {weather.windDirection}°</p>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast">
          <h3>3-Day Forecast</h3>
          <div className="forecast-grid">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-day">
                <p>{day.date}</p>
                <img src={day.icon} alt={day.condition} />
                <p>{day.condition}</p>
                <p>Max: {day.maxTemp}°{unit === 'metric' ? 'C' : 'F'}</p>
                <p>Min: {day.minTemp}°{unit === 'metric' ? 'C' : 'F'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
