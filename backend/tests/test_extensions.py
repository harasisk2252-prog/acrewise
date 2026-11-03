import pytest
from app.routers.market import get_mandi_prices
from app.routers.weather import get_weather
from app.routers.notifications import SMS_TEMPLATES

def test_mandi_prices_structure():
    res = get_mandi_prices()
    assert res['status'] == 'active'
    items = res['items']
    assert len(items) >= 5
    crops = [i['crop'] for i in items]
    assert 'Wheat' in crops
    assert 'Mustard' in crops

def test_weather_radar_structure():
    weather = get_weather()
    assert 'Punjab' in weather['location']
    assert len(weather['alerts']) >= 1
    assert len(weather['forecast7Day']) == 7
    assert all('spraySuitability' in d for d in weather['forecast7Day'])

def test_sms_templates_languages():
    for category in ['weather', 'oversupply', 'market']:
        assert category in SMS_TEMPLATES
        for lang in ['pa', 'hi', 'en']:
            assert lang in SMS_TEMPLATES[category]
            assert len(SMS_TEMPLATES[category][lang]) > 10

