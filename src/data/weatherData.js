// Agro-climatic weather advisories, 7-day forecast, and crop-specific risk alerts
export const CURRENT_WEATHER = {
  location: 'Amritsar District, Punjab',
  tempC: 22,
  minTempC: 13,
  maxTempC: 27,
  condition: 'Clear Sky & Favorable Sunlight',
  humidityPct: 58,
  windSpeedKmh: 9,
  windDirection: 'NW',
  rainfallMm: 0,
  soilMoisturePct: 64,
  uvIndex: 5,
  lastUpdated: 'Today at 08:30 AM (IMD Agromet Advisory Service)',
  alerts: [
    {
      id: 'alert-1',
      type: 'warning',
      category: 'Unseasonal Rain & Hail Risk',
      title: 'Western Disturbance Warning for North-West Plains',
      description: 'Moderate scattered showers and gusty winds (35-45 km/h) forecasted over parts of Majha and Doaba within 4 days. Farmers advised to defer nitrogen top-dressing and secure harvested produce in storage sheds.',
      cropsAffected: ['Mustard (flowering stage)', 'Early Potato'],
      actionItem: 'Hold irrigation for next 48 hours to prevent root rot and lodging.',
      severity: 'Medium'
    },
    {
      id: 'alert-2',
      type: 'info',
      category: 'Optimal Field Spray Window',
      title: 'Excellent 36-Hour Spraying Window Active',
      description: 'Low wind velocity (<10 km/h) and moderate relative humidity provide optimal droplet adhesion for protective biopesticide or micro-nutrient foliar spray.',
      cropsAffected: ['Wheat', 'Chickpea'],
      actionItem: 'Execute weedicide and aphid prevention sprays between 07:00 AM and 11:30 AM.',
      severity: 'Low'
    }
  ],
  forecast7Day: [
    { day: 'Mon', date: 'Nov 03', tempMax: 27, tempMin: 14, icon: 'sun', condition: 'Sunny', rainProb: 0, humidity: 55, spraySuitability: 'Excellent' },
    { day: 'Tue', date: 'Nov 04', tempMax: 26, tempMin: 14, icon: 'sun', condition: 'Sunny', rainProb: 5, humidity: 58, spraySuitability: 'Good' },
    { day: 'Wed', date: 'Nov 05', tempMax: 25, tempMin: 13, icon: 'cloud-sun', condition: 'Partly Cloudy', rainProb: 15, humidity: 62, spraySuitability: 'Good' },
    { day: 'Thu', date: 'Nov 06', tempMax: 23, tempMin: 12, icon: 'cloud-rain', condition: 'Scattered Showers', rainProb: 65, humidity: 78, spraySuitability: 'Do Not Spray' },
    { day: 'Fri', date: 'Nov 07', tempMax: 22, tempMin: 11, icon: 'cloud-rain', condition: 'Light Rain', rainProb: 40, humidity: 72, spraySuitability: 'Poor' },
    { day: 'Sat', date: 'Nov 08', tempMax: 24, tempMin: 12, icon: 'cloud-sun', condition: 'Clearing', rainProb: 10, humidity: 60, spraySuitability: 'Good' },
    { day: 'Sun', date: 'Nov 09', tempMax: 25, tempMin: 13, icon: 'sun', condition: 'Clear', rainProb: 0, humidity: 52, spraySuitability: 'Excellent' },
  ]
};

