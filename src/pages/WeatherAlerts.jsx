import React, { useEffect, useState } from 'react';
import { 
  CloudSun, Droplets, Wind, Thermometer, ShieldAlert, 
  Sparkles, CheckCircle2, AlertTriangle, Calendar, Info 
} from 'lucide-react';
import { CURRENT_WEATHER } from '../data/weatherData';
import { apiRequest } from '../services/api';

export default function WeatherAlerts({ t, lang, farm, go }) {
  const [selectedCropAlert, setSelectedCropAlert] = useState('All');
  const [weather, setWeather] = useState(CURRENT_WEATHER);

  useEffect(() => { apiRequest('/api/weather').then(setWeather).catch(() => {}); }, []);

  return (
    <div className="page-container">
      {/* Title */}
      <div className="aw-title" style={{ marginBottom: 20 }}>
        <div>
          <span className="overline">AGRO-METEOROLOGY & DISASTER MITIGATION</span>
          <h1>Weather Intelligence & Agronomic Risk Radar</h1>
          <p>
            Real-time agro-climatic advisories, 7-day field forecasts, spray window advisories, and severe weather warnings tailored for {farm.district || 'Amritsar'}, {farm.state || 'Punjab'}.
          </p>
        </div>
        <div style={{ fontSize: 11, color: '#68786a', background: '#ffffff', padding: '6px 12px', borderRadius: 6, border: '1px solid #dfe5d6' }}>
          {weather.data_mode === 'live' ? `Live · ${weather.data_source}` : `Demo · ${weather.lastUpdated}`}
        </div>
      </div>

      {/* Severe Weather Hazard Alerts */}
      <div style={{ marginBottom: 24 }}>
        {weather.alerts.map(alert => (
          <div 
            key={alert.id}
            className={`alert-card ${alert.type === 'warning' ? 'alert-warning' : 'alert-info'}`}
            style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}
          >
            <ShieldAlert size={24} color={alert.type === 'warning' ? '#945700' : '#1e40af'} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <strong style={{ fontSize: 13 }}>
                  [{alert.category}] {alert.title}
                </strong>
                <span className="badge-pill" style={{ background: alert.type === 'warning' ? '#fde2b4' : '#d0e4ff' }}>
                  Severity: {alert.severity}
                </span>
              </div>
              <p style={{ margin: '6px 0 8px', fontSize: 11, lineHeight: 1.6 }}>
                {alert.description}
              </p>
              <div style={{ fontSize: 11, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span><b>Actionable Guidance:</b> {alert.actionItem}</span>
                <span><b>Crops at Risk:</b> {alert.cropsAffected.join(', ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current Agro-Weather Conditions Grid */}
      <div className="aw-metrics" style={{ marginBottom: 24 }}>
        <div className="aw-metric green">
          <div className="metric-top">
            <span>Air Temperature</span>
            <Thermometer size={16} />
          </div>
          <strong>{weather.tempC}°C</strong>
          <small>Day High: {weather.maxTempC}°C · Min: {weather.minTempC}°C</small>
        </div>

        <div className="aw-metric blue">
          <div className="metric-top">
            <span>Relative Humidity</span>
            <Droplets size={16} />
          </div>
          <strong>{weather.humidityPct}%</strong>
          <small>Low disease incubation pressure</small>
        </div>

        <div className="aw-metric">
          <div className="metric-top">
            <span>Wind Speed & Direction</span>
            <Wind size={16} />
          </div>
          <strong>{weather.windSpeedKmh} km/h</strong>
          <small>{weather.windDirection} breeze · Ideal for spraying</small>
        </div>

        <div className="aw-metric gold">
          <div className="metric-top">
            <span>Root-Zone Soil Moisture</span>
            <CloudSun size={16} />
          </div>
          <strong>{weather.soilMoisturePct}%</strong>
          <small>Adequate topsoil moisture</small>
        </div>
      </div>

      {/* 7-Day Agro-Meteorological Forecast & Spray Window Matrix */}
      <div className="premium-card" style={{ marginBottom: 24 }}>
        <div className="card-heading" style={{ marginBottom: 16 }}>
          <div>
            <h2>7-Day Field Forecast & Chemical Spraying Suitability Windows</h2>
            <p>Calculated using wind velocity, precipitation likelihood, and relative humidity thresholds.</p>
          </div>
          <Calendar size={20} color="#2d6a4f" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 12 }}>
          {weather.forecast7Day.map((day, idx) => {
            const isGoodSpray = day.spraySuitability === 'Excellent' || day.spraySuitability === 'Good';
            return (
              <div 
                key={idx}
                style={{
                  background: '#f9fbf7',
                  border: '1px solid #e3ebd8',
                  borderRadius: 10,
                  padding: 14,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <strong style={{ fontSize: 13, color: '#1b4332' }}>{day.day}</strong>
                <span style={{ fontSize: 10, color: '#88988b' }}>{day.date}</span>

                <div style={{ fontSize: 24, margin: '10px 0' }}>
                  {day.icon === 'sun' ? '☀️' : day.icon === 'cloud-sun' ? '⛅' : '🌧️'}
                </div>

                <strong style={{ fontSize: 15, color: '#1b4332' }}>
                  {day.tempMax}° / <span style={{ color: '#88988b', fontSize: 12 }}>{day.tempMin}°</span>
                </strong>

                <span style={{ fontSize: 11, color: '#5e6f63', margin: '4px 0 8px' }}>
                  {day.condition}
                </span>

                <div style={{ 
                  marginTop: 'auto', 
                  width: '100%', 
                  padding: '4px 6px', 
                  borderRadius: 4, 
                  fontSize: 9, 
                  fontWeight: 700,
                  background: isGoodSpray ? '#eef8f2' : '#fdf2f2',
                  color: isGoodSpray ? '#166534' : '#991b1b'
                }}>
                  Spray: {day.spraySuitability}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agronomic Precautions & Advisory Guide */}
      <div className="premium-card">
        <div className="card-heading" style={{ marginBottom: 14 }}>
          <div>
            <h2>Agronomic Recommendations for Forecast Conditions</h2>
            <p>Guidelines for protecting active crops against upcoming weather fluctuations.</p>
          </div>
        </div>

        <div className="grid-3" style={{ gap: 16 }}>
          <div style={{ padding: 14, background: '#fafcfa', border: '1px solid #e7ecdf', borderRadius: 8 }}>
            <strong style={{ fontSize: 13, color: '#1b4332', display: 'block', marginBottom: 4 }}>
              Irrigation Scheduling
            </strong>
            <p style={{ fontSize: 11, color: '#5e6f63', margin: 0, lineHeight: 1.6 }}>
              Hold canal tubewell irrigation for fields scheduled after Wednesday. Anticipated scattered showers will provide 12-15mm natural soil recharge.
            </p>
          </div>

          <div style={{ padding: 14, background: '#fafcfa', border: '1px solid #e7ecdf', borderRadius: 8 }}>
            <strong style={{ fontSize: 13, color: '#1b4332', display: 'block', marginBottom: 4 }}>
              Weedicide & Pest Application
            </strong>
            <p style={{ fontSize: 11, color: '#5e6f63', margin: 0, lineHeight: 1.6 }}>
              Complete pre-emergence weedicide applications on Monday and Tuesday morning. Calm winds will ensure uniform foliar coverage without droplet drift.
            </p>
          </div>

          <div style={{ padding: 14, background: '#fafcfa', border: '1px solid #e7ecdf', borderRadius: 8 }}>
            <strong style={{ fontSize: 13, color: '#1b4332', display: 'block', marginBottom: 4 }}>
              Storage Protection
            </strong>
            <p style={{ fontSize: 11, color: '#5e6f63', margin: 0, lineHeight: 1.6 }}>
              Ensure tarpaulins and dry storage sheds are pre-deployed over harvested tuber crops or fodder stacks ahead of Thursday's cloud system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

