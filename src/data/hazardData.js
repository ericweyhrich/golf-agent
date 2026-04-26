// Hazard and hole feature data for Red Tail Golf Club
// GeoJSON format with bunkers, water, fairways, and out-of-bounds areas

export const RED_TAIL_HAZARDS = {
  type: 'FeatureCollection',
  features: [
    // HOLE 1 - Par 4
    {
      type: 'Feature',
      properties: { hole: 1, type: 'fairway', name: 'Hole 1 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.377251, 42.213999], [-88.380494, 42.213477], [-88.381, 42.212],
          [-88.3805, 42.2115], [-88.378, 42.213], [-88.377251, 42.213999]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 1, type: 'water', name: 'Water Left' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3825, 42.2145], [-88.384, 42.213], [-88.383, 42.211],
          [-88.381, 42.212], [-88.3825, 42.2145]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 1, type: 'bunker', name: 'Bunker Right' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.376, 42.213], [-88.3765, 42.2125], [-88.376, 42.212],
          [-88.3755, 42.2125], [-88.376, 42.213]
        ]]
      }
    },

    // HOLE 2 - Par 5
    {
      type: 'Feature',
      properties: { hole: 2, type: 'fairway', name: 'Hole 2 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.381934, 42.213582], [-88.385816, 42.211334], [-88.386, 42.209],
          [-88.382, 42.211], [-88.381934, 42.213582]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 2, type: 'water', name: 'Water Right' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.379, 42.212], [-88.381, 42.211], [-88.3805, 42.209],
          [-88.3785, 42.210], [-88.379, 42.212]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 2, type: 'bunker', name: 'Fairway Bunker' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3835, 42.2115], [-88.384, 42.211], [-88.3835, 42.2105],
          [-88.383, 42.2105], [-88.3835, 42.2115]
        ]]
      }
    },

    // HOLE 3 - Par 4
    {
      type: 'Feature',
      properties: { hole: 3, type: 'fairway', name: 'Hole 3 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.387933, 42.210485], [-88.391213, 42.209857], [-88.391, 42.208],
          [-88.388, 42.209], [-88.387933, 42.210485]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 3, type: 'water', name: 'Water Left' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.389, 42.211], [-88.391, 42.2105], [-88.3905, 42.209],
          [-88.3885, 42.209], [-88.389, 42.211]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 3, type: 'bunker', name: 'Green Side Bunker' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3908, 42.2097], [-88.3913, 42.2093], [-88.3908, 42.2088],
          [-88.3903, 42.2093], [-88.3908, 42.2097]
        ]]
      }
    },

    // HOLE 4 - Par 3
    {
      type: 'Feature',
      properties: { hole: 4, type: 'fairway', name: 'Hole 4 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.392379, 42.209111], [-88.392689, 42.207831], [-88.391, 42.207],
          [-88.3905, 42.209], [-88.392379, 42.209111]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 4, type: 'water', name: 'Water Front' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3922, 42.2075], [-88.3928, 42.2072], [-88.3925, 42.2065],
          [-88.3920, 42.2068], [-88.3922, 42.2075]
        ]]
      }
    },

    // HOLE 5 - Par 5
    {
      type: 'Feature',
      properties: { hole: 5, type: 'fairway', name: 'Hole 5 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.391333, 42.206359], [-88.386573, 42.205366], [-88.385, 42.203],
          [-88.390, 42.204], [-88.391333, 42.206359]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 5, type: 'water', name: 'Water Right' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3855, 42.2055], [-88.3865, 42.205], [-88.386, 42.2035],
          [-88.3850, 42.204], [-88.3855, 42.2055]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 5, type: 'bunker', name: 'Fairway Bunker Left' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3893, 42.2048], [-88.3898, 42.2044], [-88.3893, 42.2039],
          [-88.3888, 42.2044], [-88.3893, 42.2048]
        ]]
      }
    },

    // HOLE 6 - Par 4
    {
      type: 'Feature',
      properties: { hole: 6, type: 'fairway', name: 'Hole 6 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.385795, 42.205988], [-88.386075, 42.208843], [-88.389, 42.209],
          [-88.387, 42.207], [-88.385795, 42.205988]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 6, type: 'bunker', name: 'Right Bunker' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3855, 42.2070], [-88.3860, 42.2067], [-88.3855, 42.2063],
          [-88.3850, 42.2067], [-88.3855, 42.2070]
        ]]
      }
    },

    // HOLE 7 - Par 4
    {
      type: 'Feature',
      properties: { hole: 7, type: 'fairway', name: 'Hole 7 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.384474, 42.210768], [-88.382125, 42.212409], [-88.380, 42.213],
          [-88.383, 42.212], [-88.384474, 42.210768]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 7, type: 'water', name: 'Water Left' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3855, 42.2115], [-88.3865, 42.2110], [-88.3860, 42.2095],
          [-88.3850, 42.2100], [-88.3855, 42.2115]
        ]]
      }
    },

    // HOLE 8 - Par 3
    {
      type: 'Feature',
      properties: { hole: 8, type: 'fairway', name: 'Hole 8 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.381218, 42.211688], [-88.380359, 42.212513], [-88.379, 42.213],
          [-88.3805, 42.212], [-88.381218, 42.211688]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 8, type: 'bunker', name: 'Front Bunker' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3803, 42.2123], [-88.3808, 42.2120], [-88.3803, 42.2116],
          [-88.3798, 42.2120], [-88.3803, 42.2123]
        ]]
      }
    },

    // HOLE 9 - Par 4
    {
      type: 'Feature',
      properties: { hole: 9, type: 'fairway', name: 'Hole 9 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.378352, 42.212592], [-88.375298, 42.214170], [-88.373, 42.215],
          [-88.377, 42.214], [-88.378352, 42.212592]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 9, type: 'water', name: 'Water Right' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3745, 42.2145], [-88.3755, 42.2140], [-88.3750, 42.2125],
          [-88.3740, 42.2130], [-88.3745, 42.2145]
        ]]
      }
    },

    // HOLE 10 - Par 4
    {
      type: 'Feature',
      properties: { hole: 10, type: 'fairway', name: 'Hole 10 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.379845, 42.207989], [-88.378594, 42.206843], [-88.376, 42.204],
          [-88.3785, 42.206], [-88.379845, 42.207989]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 10, type: 'bunker', name: 'Left Bunker' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3808, 42.2075], [-88.3813, 42.2072], [-88.3808, 42.2068],
          [-88.3803, 42.2072], [-88.3808, 42.2075]
        ]]
      }
    },

    // HOLE 11 - Par 5
    {
      type: 'Feature',
      properties: { hole: 11, type: 'fairway', name: 'Hole 11 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.378594, 42.206843], [-88.374829, 42.204516], [-88.372, 42.202],
          [-88.377, 42.205], [-88.378594, 42.206843]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 11, type: 'water', name: 'Water Left' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3765, 42.2065], [-88.3775, 42.2058], [-88.3770, 42.2040],
          [-88.3760, 42.2048], [-88.3765, 42.2065]
        ]]
      }
    },

    // HOLE 12 - Par 3
    {
      type: 'Feature',
      properties: { hole: 12, type: 'fairway', name: 'Hole 12 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.374829, 42.204516], [-88.381295, 42.203247], [-88.382, 42.201],
          [-88.375, 42.202], [-88.374829, 42.204516]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 12, type: 'water', name: 'Water Right' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3808, 42.2032], [-88.3818, 42.2028], [-88.3813, 42.2013],
          [-88.3803, 42.2018], [-88.3808, 42.2032]
        ]]
      }
    },

    // HOLE 13 - Par 4
    {
      type: 'Feature',
      properties: { hole: 13, type: 'fairway', name: 'Hole 13 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.381295, 42.203247], [-88.384673, 42.205812], [-88.387, 42.207],
          [-88.383, 42.205], [-88.381295, 42.203247]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 13, type: 'bunker', name: 'Fairway Bunker' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3835, 42.2045], [-88.3840, 42.2042], [-88.3835, 42.2038],
          [-88.3830, 42.2042], [-88.3835, 42.2045]
        ]]
      }
    },

    // HOLE 14 - Par 5
    {
      type: 'Feature',
      properties: { hole: 14, type: 'fairway', name: 'Hole 14 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.384673, 42.205812], [-88.388495, 42.207528], [-88.391, 42.209],
          [-88.387, 42.207], [-88.384673, 42.205812]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 14, type: 'water', name: 'Water Right' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3865, 42.2070], [-88.3875, 42.2065], [-88.3870, 42.2045],
          [-88.3860, 42.2050], [-88.3865, 42.2070]
        ]]
      }
    },

    // HOLE 15 - Par 4
    {
      type: 'Feature',
      properties: { hole: 15, type: 'fairway', name: 'Hole 15 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.388495, 42.207528], [-88.391156, 42.209641], [-88.393, 42.211],
          [-88.390, 42.209], [-88.388495, 42.207528]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 15, type: 'bunker', name: 'Right Bunker' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3905, 42.2095], [-88.3910, 42.2092], [-88.3905, 42.2088],
          [-88.3900, 42.2092], [-88.3905, 42.2095]
        ]]
      }
    },

    // HOLE 16 - Par 4
    {
      type: 'Feature',
      properties: { hole: 16, type: 'fairway', name: 'Hole 16 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.391156, 42.209641], [-88.393401, 42.211423], [-88.395, 42.213],
          [-88.392, 42.211], [-88.391156, 42.209641]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 16, type: 'water', name: 'Water Left' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3925, 42.2105], [-88.3935, 42.2100], [-88.3930, 42.2080],
          [-88.3920, 42.2085], [-88.3925, 42.2105]
        ]]
      }
    },

    // HOLE 17 - Par 3
    {
      type: 'Feature',
      properties: { hole: 17, type: 'fairway', name: 'Hole 17 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.390234, 42.211423], [-88.392744, 42.213089], [-88.394, 42.214],
          [-88.391, 42.213], [-88.390234, 42.211423]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 17, type: 'bunker', name: 'Front Left Bunker' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3903, 42.2118], [-88.3908, 42.2115], [-88.3903, 42.2111],
          [-88.3898, 42.2115], [-88.3903, 42.2118]
        ]]
      }
    },

    // HOLE 18 - Par 4
    {
      type: 'Feature',
      properties: { hole: 18, type: 'fairway', name: 'Hole 18 Fairway' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.390234, 42.213089], [-88.387823, 42.214501], [-88.385, 42.216],
          [-88.389, 42.214], [-88.390234, 42.213089]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 18, type: 'water', name: 'Water Right' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3865, 42.2140], [-88.3875, 42.2135], [-88.3870, 42.2115],
          [-88.3860, 42.2120], [-88.3865, 42.2140]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { hole: 18, type: 'bunker', name: 'Green Side Bunker' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.3880, 42.2146], [-88.3885, 42.2143], [-88.3880, 42.2139],
          [-88.3875, 42.2143], [-88.3880, 42.2146]
        ]]
      }
    }
  ]
};

// Function to get hazards for a specific hole
export const getHoleHazards = (holeNumber) => {
  return RED_TAIL_HAZARDS.features.filter(feature => feature.properties.hole === holeNumber);
};

// Function to get hazards by type
export const getHazardsByType = (type) => {
  return RED_TAIL_HAZARDS.features.filter(feature => feature.properties.type === type);
};
