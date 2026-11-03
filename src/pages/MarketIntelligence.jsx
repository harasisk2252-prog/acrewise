import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Store, Calendar, ArrowUpRight, 
  Search, ShieldAlert, Sparkles, Filter, ChevronRight, BarChart2 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { MANDI_PRICES, PRICE_TREND_MONTHLY } from '../data/marketData';
import { money } from '../components/Shared';

export default function MarketIntelligence({ t, lang, go }) {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');

  const filteredMandi = MANDI_PRICES.filter(m => {
    const matchesSearch = m.crop.toLowerCase().includes(filterQuery.toLowerCase()) ||
                          m.mandi.toLowerCase().includes(filterQuery.toLowerCase()) ||
                          m.variety.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesCrop = selectedCrop === 'All' || m.crop.toLowerCase().includes(selectedCrop.toLowerCase());
    return matchesSearch && matchesCrop;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="aw-title" style={{ marginBottom: 20 }}>
        <div>
          <span className="overline">REGIONAL MARKET DYNAMICS</span>
          <h1>APMC Mandi Intelligence & Price Trends</h1>
          <p>Real-time mandi trade benchmarks, arrivals momentum, price seasonality, and strategic selling opportunities.</p>
        </div>
        <button className="btn-primary" onClick={() => go('/regional')}>
          <TrendingUp size={16} />
          View Sowing Intentions
        </button>
      </div>

      {/* Market Opportunity Banner */}
      <div className="alert-card alert-success" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Sparkles size={24} color="#166534" />
          <div>
            <strong style={{ fontSize: 13, display: 'block' }}>
              Strategic Market Opportunity: Mustard & Chickpea Edible Oil & Pulse Squeeze
            </strong>
            <span style={{ fontSize: 11, opacity: 0.9 }}>
              Domestic wholesale crushers paying +8.5% above MSP for Mustard (₹5,850/q). Pulse deficit in North India supporting Chickpea spot prices.
            </span>
          </div>
        </div>
        <button className="btn-primary" style={{ background: '#166534', borderColor: '#166534' }} onClick={() => go('/advisor')}>
          Check Crop Economics
        </button>
      </div>

      {/* Monthly Price Trend Chart */}
      <div className="premium-card" style={{ marginBottom: 24 }}>
        <div className="card-heading" style={{ marginBottom: 16 }}>
          <div>
            <h2>Wholesale Mandi Seasonal Price Curves (₹ / quintal)</h2>
            <p>Historical and forecasted modal prices through the Rabi season cycle (Nov - Apr).</p>
          </div>
          <BarChart2 size={20} color="#2d6a4f" />
        </div>

        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PRICE_TREND_MONTHLY} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1e6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis unit="₹" domain={['dataMin - 200', 'dataMax + 200']} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()} / q`} />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="Mustard" stroke="#d4a373" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Chickpea" stroke="#8cb369" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Wheat" stroke="#2d6a4f" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Potato" stroke="#bc6c25" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <small style={{ color: '#88988b', display: 'block', marginTop: 10 }}>
          *Note: Mustard exhibits strong pre-harvest firming; Potato faces harvest congestion in January/February before rebounding in cold storage.
        </small>
      </div>

      {/* APMC Mandi Real-Time Benchmarks Table */}
      <div className="premium-card">
        <div className="card-heading" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h2>APMC Mandi Daily Benchmark Prices & Arrivals</h2>
            <p>Live trading rates collected from major grain & fresh produce mandis across Punjab and Haryana.</p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 220 }}>
              <input 
                type="text" 
                placeholder="Search crop or mandi…" 
                value={filterQuery} 
                onChange={e => setFilterQuery(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px 8px 32px', 
                  fontSize: 12, 
                  borderRadius: 6, 
                  border: '1px solid #dfe5d6', 
                  outline: 'none' 
                }}
              />
              <Search size={15} color="#89998b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <select 
              value={selectedCrop} 
              onChange={e => setSelectedCrop(e.target.value)}
              style={{ padding: '8px 12px', fontSize: 12, borderRadius: 6, border: '1px solid #dfe5d6', background: '#fff' }}
            >
              <option value="All">All Crops</option>
              <option value="Wheat">Wheat</option>
              <option value="Mustard">Mustard</option>
              <option value="Chickpea">Chickpea</option>
              <option value="Potato">Potato</option>
              <option value="Rice">Rice (Basmati)</option>
              <option value="Maize">Maize</option>
              <option value="Moong">Moong</option>
            </select>
          </div>
        </div>

        <div className="aw-table-wrap">
          <table className="aw-table">
            <thead>
              <tr>
                <th>Crop & Variety</th>
                <th>APMC Mandi</th>
                <th>State</th>
                <th>Modal Price</th>
                <th>Official MSP</th>
                <th>Spread vs MSP</th>
                <th>Arrivals (Daily)</th>
                <th>Peak Harvest Window</th>
              </tr>
            </thead>
            <tbody>
              {filteredMandi.map((item, idx) => {
                const spread = item.msp ? Math.round(((item.currentPrice - item.msp) / item.msp) * 100) : null;
                return (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: '#1b4332', fontSize: 13 }}>{item.crop}</strong>
                      <span style={{ display: 'block', fontSize: 10, color: '#88988b' }}>{item.variety}</span>
                    </td>
                    <td>{item.mandi}</td>
                    <td>{item.state}</td>
                    <td>
                      <strong style={{ fontSize: 14, color: '#1b4332' }}>₹{item.currentPrice.toLocaleString()}</strong> / q
                    </td>
                    <td>{item.msp ? `₹${item.msp.toLocaleString()} / q` : 'Free Market'}</td>
                    <td>
                      {spread !== null ? (
                        <span style={{ 
                          fontWeight: 700, 
                          color: spread >= 0 ? '#16a34a' : '#dc2626',
                          background: spread >= 0 ? '#eef8f2' : '#fdf2f2',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 11
                        }}>
                          {spread >= 0 ? `+${spread}%` : `${spread}%`}
                        </span>
                      ) : (
                        <span style={{ color: '#88988b', fontSize: 11 }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <b>{item.arrivalsTonnes}</b> tonnes/day
                    </td>
                    <td style={{ color: '#5e6f63' }}>{item.peakArrivalMonth}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

