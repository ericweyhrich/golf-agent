import { useState, useEffect } from 'react';

export function useWeather(latitude, longitude) {
  const [weather, setWeather] = useState({
    condition: 'Loading...',
    temperature: null,
    humidity: null,
    windSpeed: null,
    description: '',
    icon: '⏳',
    lastUpdated: null,
    loading: true,
    error: null,
  });

  const fetchWeather = async () => {
    try {
      // Using Open-Meteo API (free, no API key needed)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit`
      );

      if (!response.ok) throw new Error('Failed to fetch weather');

      const data = await response.json();
      const current = data.current;

      // Map WMO weather codes to conditions
      const weatherDescription = getWeatherDescription(current.weather_code);
      const icon = getWeatherIcon(current.weather_code);

      setWeather({
        condition: weatherDescription,
        temperature: Math.round(current.temperature_2m),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        description: `${Math.round(current.temperature_2m)}°F • ${weatherDescription}`,
        icon,
        lastUpdated: new Date().toLocaleTimeString(),
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Weather fetch error:', error);
      setWeather(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWeather();
  }, [latitude, longitude]);

  // Set up periodic updates every 10 minutes
  useEffect(() => {
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  return { ...weather, refetch: fetchWeather };
}

function getWeatherDescription(code) {
  // WMO Weather interpretation codes
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2) return 'Mostly Clear';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code === 51 || code === 53 || code === 55) return 'Light Drizzle';
  if (code === 61 || code === 63 || code === 65) return 'Rainy';
  if (code === 71 || code === 73 || code === 75) return 'Snow';
  if (code === 77) return 'Snow Grains';
  if (code === 80 || code === 81 || code === 82) return 'Rain Showers';
  if (code === 85 || code === 86) return 'Snow Showers';
  if (code === 95 || code === 96 || code === 99) return 'Thunderstorm';
  return 'Unknown';
}

function getWeatherIcon(code) {
  if (code === 0) return '☀️';
  if (code === 1 || code === 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code === 51 || code === 53 || code === 55) return '🌧️';
  if (code === 61 || code === 63 || code === 65) return '🌧️';
  if (code === 71 || code === 73 || code === 75) return '❄️';
  if (code === 77) return '❄️';
  if (code === 80 || code === 81 || code === 82) return '🌧️';
  if (code === 85 || code === 86) return '❄️';
  if (code === 95 || code === 96 || code === 99) return '⛈️';
  return '🌥️';
}
