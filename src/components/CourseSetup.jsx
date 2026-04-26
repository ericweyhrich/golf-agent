import { TEES, getTeeLabel, RED_TAIL_COURSE } from '../data/courseData';
import { useWeather } from '../hooks/useWeather';

export function CourseSetup({ onStart }) {
  const weather = useWeather(RED_TAIL_COURSE.latitude, RED_TAIL_COURSE.longitude);

  const handleStartRound = (tee) => {
    console.log('CourseSetup: handleStartRound called with tee:', tee);
    const now = new Date();
    const setupData = {
      tee,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      timestamp: now.toISOString(),
      weather: weather.condition,
      temperature: weather.temperature,
      weatherData: weather,
    };
    console.log('CourseSetup: calling onStart with:', setupData);
    console.log('CourseSetup: onStart is', typeof onStart);
    try {
      onStart(setupData);
      console.log('CourseSetup: onStart called successfully');
    } catch (e) {
      console.error('CourseSetup: error calling onStart:', e);
    }
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

        <div className="tee-selection">
          <label>Tee Selection</label>
          <div className="tee-buttons">
            {TEES.map(tee => (
              <button
                key={tee}
                className="btn btn-tee"
                onClick={() => handleStartRound(tee)}
              >
                {getTeeLabel(tee)} Tees
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
