import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sprout, Tractor, Compass, TrendingUp, AlertTriangle, CloudSun, 
  Sparkles, Calendar, ArrowRight, ArrowUpRight, CheckCircle2, 
  Droplets, ShieldAlert, Layers, BarChart3, ChevronRight, MapPin
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { CROPS_CATALOG } from '../data/cropsData';
import { MANDI_PRICES, SOWING_INTENTIONS_REGISTRY } from '../data/marketData';
import { CURRENT_WEATHER } from '../data/weatherData';
import { money, number } from '../components/Shared';
import HologramFarm from '../components/HologramFarm';

export default function Dashboard({ t, lang, farm, result, go, calculate }) {
  const regionalData = SOWING_INTENTIONS_REGISTRY.amritsar;
  const topCrops = CROPS_CATALOG.filter(c => c.season === (farm.season || 'rabi')).slice(0, 3);

  // Fallback financial totals from result or estimates
  const estProfit = result?.totals?.profit || (farm.acres * 24500);
  const estCost = result?.totals?.cost || (farm.acres * 15500);
  const estWater = result?.totals?.water || (farm.acres * 1200);

  const intentionsChartData = regionalData.crops.map(c => ({
    name: c.crop,
    share: c.sharePct,
    historical: c.historicalAvgSharePct,
    risk: c.riskLevel
  }));

  return (
    <div className="page-container">
      {/* Top Welcome & Season Banner */}
      <div className="aw-hero" style={{ marginBottom: 24 }}>
        <div className="hero-copy">
          <div className="hero-kicker">
            <span />
            {t.heroBadge}
          </div>
          <h2>{t.heroTitle}</h2>
          <p>{t.heroBody}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => go('/ask')}>
              <Sparkles size={16} />
              Talk to AcreWise Saathi
            </button>
            <button 
              className="btn-outline" 
              style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
              onClick={() => go('/farm')}
            >
              <Tractor size={16} />
              Tell us about my farm
            </button>
          </div>
        </div>
        <div className="hero-art">
          <div className="field-badge">
            <div>
              <Sprout size={20} color="#2d6a4f" />
              <strong>{farm.name || 'My Farm'}</strong>
            </div>
            <span>
              {number(farm.acres || 10)} {t.acres} <i /> {t[farm.season || 'rabi']} 2026–27
            </span>
          </div>
          <span className="hero-coordinate">
            <MapPin size={10} style={{ display: 'inline', marginRight: 4 }} />
            {farm.district || 'Amritsar'}, {farm.state || 'Punjab'}
          </span>
        </div>
      </div>

      {/* Weather & Active Alert Ticker */}
      <div className="alert-card alert-warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldAlert size={24} color="#945700" />
          <div>
            <strong style={{ display: 'block', fontSize: 13 }}>
              {CURRENT_WEATHER.alerts[0].category}: {CURRENT_WEATHER.alerts[0].title}
            </strong>
            <span style={{ fontSize: 11, opacity: 0.9 }}>
              {CURRENT_WEATHER.alerts[0].actionItem} (IMD Agromet)
            </span>
          </div>
        </div>
        <button className="aw-text-button" onClick={() => go('/weather')} style={{ fontWeight: 700, color: '#945700' }}>
          {t.weather} <ArrowRight size={14} />
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="aw-metrics" style={{ marginBottom: 24 }}>
        <div className="aw-metric green">
          <div className="metric-top">
            <span>{t.profit}</span>
            <TrendingUp size={16} />
          </div>
          <strong>{money(estProfit)}</strong>
          <small>Projected seasonal margin</small>
        </div>

        <div className="aw-metric">
          <div className="metric-top">
            <span>{t.budget}</span>
            <Tractor size={16} />
          </div>
          <strong>{money(farm.budget || 180000)}</strong>
          <small>Est. utilized: {money(estCost)}</small>
        </div>

        <div className="aw-metric blue">
          <div className="metric-top">
            <span>{t.water}</span>
            <Droplets size={16} />
          </div>
          <strong>{number(farm.water || 12000)} m³</strong>
          <small>Planned: {number(estWater)} m³</small>
        </div>

        <div className="aw-metric gold">
          <div className="metric-top">
            <span>Regional Sowing Risk</span>
            <AlertTriangle size={16} />
          </div>
          <strong style={{ color: '#b45309' }}>68% Wheat</strong>
          <small>High supply concentration risk</small>
        </div>
      </div>

      <HologramFarm farm={farm} result={result} calculate={calculate} />

      {/* Main 2-Column Analytics Grid */}
      <div className="overview-grid" style={{ marginBottom: 24 }}>
        {/* Left Column: Sowing Intention Intelligence */}
        <div className="premium-card">
          <div className="card-heading">
            <div>
              <h2>Regional Sowing Intentions ({regionalData.district})</h2>
              <p>Aggregated declarations from {regionalData.participatingFarmers} farmers ({number(regionalData.totalReportedAcres)} acres)</p>
            </div>
            <button className="aw-text-button" onClick={() => go('/regional')}>
              {t.regional} <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ height: 230, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intentionsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0e7" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => `${val}% of regional acreage`} />
                <Bar dataKey="share" name="Intended Share (%)" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {intentionsChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.risk === 'high' ? '#dc2626' : entry.risk === 'opportunity' ? '#16a34a' : '#2d6a4f'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: 16, padding: 12, background: '#fdfbf7', borderRadius: 8, border: '1px solid #f1ece1', fontSize: 11 }}>
            <strong style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} /> Regional Oversupply Alert
            </strong>
            <p style={{ margin: '4px 0 0', color: '#6d7568' }}>
              68% of farmers intend to plant Wheat. Consider allocating 20-30% to Mustard or Chana to hedge against harvest mandi gluts.
            </p>
          </div>
        </div>

        {/* Right Column: AI Crop Recommendations Preview */}
        <div className="premium-card">
          <div className="card-heading">
            <div>
              <h2>Top Recommended Crops</h2>
              <p>Matched for {farm.soil || 'loamy'} soil and {farm.season || 'rabi'} season</p>
            </div>
            <button className="aw-text-button" onClick={() => go('/advisor')}>
              View all <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {topCrops.map((crop) => (
              <div 
                key={crop.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 14, 
                  padding: 12, 
                  borderRadius: 10, 
                  border: '1px solid #edf1e6',
                  background: '#fafcfa',
                  cursor: 'pointer'
                }}
                onClick={() => go('/advisor')}
              >
                <img 
                  src={crop.image} 
                  alt={crop.name} 
                  style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: 13, color: '#1b4332' }}>{crop.name}</strong>
                    <span className="badge-pill">{crop.suitabilityScore}% Match</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#6e7e72', display: 'block', marginTop: 2 }}>
                    Est. Profit: <b style={{ color: '#2d6a4f' }}>{money(crop.netProfit)}</b> / acre
                  </span>
                  <span style={{ fontSize: 10, color: '#88988b' }}>
                    Water: {crop.waterCategory} · Duration: {crop.durationCategory}
                  </span>
                </div>
                <ChevronRight size={16} color="#8a9c8e" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="bottom-grid" style={{ marginBottom: 24 }}>
        <section className="scenario-teaser">
          <div>
            <span className="mini-kicker">
              <Calendar size={16} />
              INTELLIGENT TIMELINE
            </span>
            <h2>{t.harvest}</h2>
            <p>Track sowing windows, flowering, maturity dates, and harvest market opportunity windows.</p>
            <button onClick={() => go('/harvest')}>
              Open Harvest Planner <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <section className="saathi-teaser">
          <div>
            <span className="mini-kicker">
              <Sparkles size={16} />
              VOICE & TEXT COMPANION
            </span>
            <h2>Ask AcreWise</h2>
            <p>Speak in Punjabi, Hindi or English. Grounded in your farm profile and local mandi rates.</p>
            <button onClick={() => go('/ask')}>
              Talk to Assistant <ArrowRight size={16} />
            </button>
          </div>
          <div className="saathi-mini-orb">
            <Sprout size={32} />
          </div>
        </section>
      </div>

      {/* Live Mandi Rate Snippet */}
      <div className="premium-card">
        <div className="card-heading">
          <div>
            <h2>APMC Mandi Price Intelligence</h2>
            <p>Real-time trading benchmarks vs Government Minimum Support Price (MSP)</p>
          </div>
          <button className="aw-text-button" onClick={() => go('/market')}>
            View Mandi Hub <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="aw-table-wrap">
          <table className="aw-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Variety</th>
                <th>Mandi / District</th>
                <th>Current Price</th>
                <th>MSP Benchmark</th>
                <th>Trend</th>
                <th>Mandi Arrivals</th>
              </tr>
            </thead>
            <tbody>
              {MANDI_PRICES.slice(0, 5).map((m, idx) => (
                <tr key={idx}>
                  <td><strong>{m.crop}</strong></td>
                  <td>{m.variety}</td>
                  <td>{m.mandi} ({m.state})</td>
                  <td><strong style={{ color: '#1b4332' }}>₹{m.currentPrice.toLocaleString()}</strong> / q</td>
                  <td>{m.msp ? `₹${m.msp.toLocaleString()} / q` : '—'}</td>
                  <td>
                    <span style={{ 
                      color: m.changePct >= 0 ? '#16a34a' : '#dc2626', 
                      fontWeight: 700, 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 4 
                    }}>
                      {m.changePct >= 0 ? '+' : ''}{m.changePct}%
                    </span>
                  </td>
                  <td>{m.arrivalsTonnes} tonnes / day</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

