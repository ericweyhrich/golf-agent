import { RED_TAIL_COURSE } from '../data/courseData';

export function HoleVisual({ hole, tee }) {
  const holeData = RED_TAIL_COURSE.holes.find(h => h.hole === hole);
  const yardage = holeData?.[tee] || 0;

  return (
    <div className="hole-visual">
      <svg viewBox="0 0 200 280" className="hole-svg">
        {/* Fairway */}
        <ellipse cx="100" cy="140" rx="40" ry="90" fill="#7cb342" opacity="0.8" />

        {/* Rough */}
        <ellipse cx="100" cy="140" rx="60" ry="120" fill="#9ccc65" opacity="0.5" />

        {/* Tee box */}
        <rect x="75" y="20" width="50" height="30" fill="#8b7355" rx="3" />
        <text x="100" y="40" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
          TEE
        </text>

        {/* Green */}
        <ellipse cx="100" cy="230" rx="25" ry="30" fill="#4caf50" />
        <circle cx="95" cy="225" r="3" fill="white" opacity="0.7" />

        {/* Flag */}
        <line x1="100" y1="200" x2="100" y2="210" stroke="#333" strokeWidth="1.5" />
        <path d="M 100 210 L 110 215 L 100 220 Z" fill="#e53935" />
      </svg>

      <div className="hole-stats">
        <div className="stat">
          <span className="label">Hole</span>
          <span className="value">{hole}</span>
        </div>
        <div className="stat">
          <span className="label">Par</span>
          <span className="value">{holeData?.par}</span>
        </div>
        <div className="stat">
          <span className="label">Yards</span>
          <span className="value">{yardage}</span>
        </div>
        <div className="stat">
          <span className="label">HCP</span>
          <span className="value">{holeData?.handicap}</span>
        </div>
      </div>
    </div>
  );
}
