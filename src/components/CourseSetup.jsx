import { TEES, getTeeLabel, RED_TAIL_COURSE } from '../data/courseData';
import { useWeather } from '../hooks/useWeather';

export function CourseSetup({ onStart }) {
  const today = new Date().toISOString().split('T')[0];
  const weather = useWeather(RED_TAIL_COURSE.latitude, RED_TAIL_COURSE.longitude);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onStart({
      tee: formData.get('tee'),
      date: formData.get('date'),
      weather: weather.condition,
      temperature: weather.temperature,
      weatherData: weather,
    });
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1>Red Tail Golf Club</h1>
        <p className="subtitle">Start Your Round</p>
        <p className="location">{RED_TAIL_COURSE.location}</p>

        {/* Weather Card */}
        <div className="weather-card">
          <div className="weather-header">
            <span className="weather-icon">{weather.icon}</span>
            <div className="weather-info">
              <div className="weather-condition">
                {weather.condition}
              </div>
              <div className="weather-details">
                {weather.temperature !== null && (
                  <>
                    <span>{weather.temperature}°F</span>
                    {weather.humidity !== null && <span>• {weather.humidity}% humidity</span>}
                    {weather.windSpeed !== null && <span>• {weather.windSpeed} mph wind</span>}
                  </>
                )}
                {weather.loading && <span className="loading">Updating...</span>}
              </div>
              <div className="weather-updated">
                {weather.lastUpdated && <small>Last updated: {weather.lastUpdated}</small>}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input type="date" id="date" name="date" defaultValue={today} required />
          </div>

          <div className="form-group">
            <label htmlFor="tee">Tee Selection</label>
            <select id="tee" name="tee" defaultValue="white" required>
              {TEES.map(tee => (
                <option key={tee} value={tee}>
                  {getTeeLabel(tee)} Tees
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Start Round
          </button>
        </form>
      </div>
    </div>
  );
}
