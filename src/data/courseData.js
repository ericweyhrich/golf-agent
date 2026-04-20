export const RED_TAIL_COURSE = {
  name: 'Red Tail Golf Club',
  location: 'Lakewood, Illinois',
  latitude: 42.1411,
  longitude: -88.2144,
  holes: [
    { hole: 1, par: 4, handicap: 9, red: 304, white: 352, gold: 379, black: 395 },
    { hole: 2, par: 5, handicap: 5, red: 446, white: 494, gold: 515, black: 532 },
    { hole: 3, par: 4, handicap: 13, red: 313, white: 358, gold: 371, black: 392 },
    { hole: 4, par: 3, handicap: 15, red: 155, white: 176, gold: 203, black: 214 },
    { hole: 5, par: 5, handicap: 1, red: 449, white: 487, gold: 515, black: 542 },
    { hole: 6, par: 4, handicap: 3, red: 358, white: 381, gold: 381, black: 422 },
    { hole: 7, par: 4, handicap: 11, red: 293, white: 322, gold: 343, black: 370 },
    { hole: 8, par: 3, handicap: 17, red: 133, white: 139, gold: 168, black: 174 },
    { hole: 9, par: 4, handicap: 7, red: 331, white: 351, gold: 378, black: 398 },
    { hole: 10, par: 4, handicap: 12, red: 278, white: 323, gold: 355, black: 376 },
    { hole: 11, par: 5, handicap: 2, red: 451, white: 501, gold: 533, black: 556 },
    { hole: 12, par: 3, handicap: 16, red: 131, white: 145, gold: 161, black: 171 },
    { hole: 13, par: 4, handicap: 14, red: 310, white: 359, gold: 365, black: 382 },
    { hole: 14, par: 5, handicap: 4, red: 435, white: 480, gold: 506, black: 527 },
    { hole: 15, par: 4, handicap: 6, red: 342, white: 378, gold: 410, black: 416 },
    { hole: 16, par: 4, handicap: 10, red: 335, white: 367, gold: 391, black: 412 },
    { hole: 17, par: 3, handicap: 18, red: 122, white: 125, gold: 156, black: 157 },
    { hole: 18, par: 4, handicap: 8, red: 344, white: 370, gold: 381, black: 404 },
  ],
  frontNine: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  backNine: [10, 11, 12, 13, 14, 15, 16, 17, 18],
};

export const TEES = ['red', 'white', 'gold', 'black'];

export const getHoleYardage = (hole, tee) => {
  const holeData = RED_TAIL_COURSE.holes.find(h => h.hole === hole);
  return holeData?.[tee] || 0;
};

export const getTeeLabel = (tee) => {
  return tee.charAt(0).toUpperCase() + tee.slice(1);
};

export const GOLF_CLUBS = [
  'Driver',
  '3 Wood',
  '5 Wood',
  '3 Hybrid',
  '4 Hybrid',
  '2 Iron',
  '3 Iron',
  '4 Iron',
  '5 Iron',
  '6 Iron',
  '7 Iron',
  '8 Iron',
  '9 Iron',
  'PW (Pitching Wedge)',
  'GW (Gap Wedge)',
  'SW (Sand Wedge)',
  'LW (Lob Wedge)',
  'Putter',
];

export const WEATHER_ICONS = {
  'clear sky': '☀️',
  'few clouds': '🌤️',
  'scattered clouds': '☁️',
  'broken clouds': '☁️',
  'overcast clouds': '☁️',
  'light rain': '🌧️',
  'moderate rain': '🌧️',
  'heavy rain': '⛈️',
  'thunderstorm': '⛈️',
  'snow': '❄️',
  'mist': '🌫️',
  'wind': '💨',
};
