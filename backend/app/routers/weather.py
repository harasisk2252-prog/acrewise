from datetime import datetime, timezone
import httpx
from fastapi import APIRouter

router = APIRouter(prefix='/api/weather', tags=['Weather Intelligence'])

WEATHER_FEED = {
    'location': 'Amritsar District, Punjab',
    'tempC': 22,
    'minTempC': 13,
    'maxTempC': 27,
    'condition': 'Clear Sky & Favorable Sunlight',
    'humidityPct': 58,
    'windSpeedKmh': 9,
    'windDirection': 'NW',
    'rainfallMm': 0,
    'soilMoisturePct': 64,
    'uvIndex': 5,
    'lastUpdated': 'IMD Agromet Advisory Service Feed',
    'alerts': [
        {
            'id': 'alert-1',
            'type': 'warning',
            'category': 'Unseasonal Rain & Hail Risk',
            'title': 'Western Disturbance Warning for North-West Plains',
            'description': 'Moderate scattered showers and gusty winds (35-45 km/h) forecasted within 4 days. Defer nitrogen top-dressing and secure harvested produce.',
            'cropsAffected': ['Mustard (flowering stage)', 'Early Potato'],
            'actionItem': 'Hold irrigation for next 48 hours to prevent root rot and lodging.',
            'severity': 'Medium'
        },
        {
            'id': 'alert-2',
            'type': 'info',
            'category': 'Optimal Field Spray Window',
            'title': 'Excellent 36-Hour Spraying Window Active',
            'description': 'Low wind velocity (<10 km/h) provides optimal droplet adhesion for protective biopesticide or foliar spray.',
            'cropsAffected': ['Wheat', 'Chickpea'],
            'actionItem': 'Execute weedicide sprays between 07:00 AM and 11:30 AM.',
            'severity': 'Low'
        }
    ],
    'forecast7Day': [
        {'day': 'Mon', 'tempMax': 27, 'tempMin': 14, 'condition': 'Sunny', 'rainProb': 0, 'spraySuitability': 'Excellent'},
        {'day': 'Tue', 'tempMax': 26, 'tempMin': 14, 'condition': 'Sunny', 'rainProb': 5, 'spraySuitability': 'Good'},
        {'day': 'Wed', 'tempMax': 25, 'tempMin': 13, 'condition': 'Partly Cloudy', 'rainProb': 15, 'spraySuitability': 'Good'},
        {'day': 'Thu', 'tempMax': 23, 'tempMin': 12, 'condition': 'Scattered Showers', 'rainProb': 65, 'spraySuitability': 'Do Not Spray'},
        {'day': 'Fri', 'tempMax': 22, 'tempMin': 11, 'condition': 'Light Rain', 'rainProb': 40, 'spraySuitability': 'Poor'},
        {'day': 'Sat', 'tempMax': 24, 'tempMin': 12, 'condition': 'Clearing', 'rainProb': 10, 'spraySuitability': 'Good'},
        {'day': 'Sun', 'tempMax': 25, 'tempMin': 13, 'condition': 'Clear', 'rainProb': 0, 'spraySuitability': 'Excellent'},
    ]
}

@router.get('')
def get_weather():
    """Open-Meteo requires no secret; the labelled fallback keeps demos usable offline."""
    data = {**WEATHER_FEED, 'forecast7Day': [dict(day) for day in WEATHER_FEED['forecast7Day']]}
    try:
        response = httpx.get(
            'https://api.open-meteo.com/v1/forecast',
            params={'latitude': 31.634, 'longitude': 74.8723, 'current': 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m', 'daily': 'temperature_2m_max,temperature_2m_min,precipitation_probability_max', 'timezone': 'Asia/Kolkata', 'forecast_days': 7},
            timeout=5,
        )
        response.raise_for_status(); feed = response.json(); current, daily = feed['current'], feed['daily']
        data.update({'tempC': round(current['temperature_2m']), 'humidityPct': current['relative_humidity_2m'], 'rainfallMm': current['precipitation'], 'windSpeedKmh': round(current['wind_speed_10m']), 'lastUpdated': datetime.now(timezone.utc).isoformat(), 'data_source': 'Open-Meteo forecast API', 'data_mode': 'live'})
        for i, day in enumerate(data['forecast7Day']):
            day.update({'tempMax': round(daily['temperature_2m_max'][i]), 'tempMin': round(daily['temperature_2m_min'][i]), 'rainProb': daily['precipitation_probability_max'][i], 'date': daily['time'][i]})
        return data
    except (httpx.HTTPError, KeyError, IndexError):
        data.update({'data_source': 'Illustrative offline fallback', 'data_mode': 'demo_fallback', 'lastUpdated': 'Offline demo data — not a live weather observation'})
        return data

