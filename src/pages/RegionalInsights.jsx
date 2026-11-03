import React, { useState } from 'react';
import { 
  Users, MapPin, AlertTriangle, ShieldCheck, Plus, CheckCircle2, 
  BarChart3, PieChart, Info, ArrowRight, Lock, EyeOff 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Cell, Legend 
} from 'recharts';
import { SOWING_INTENTIONS_REGISTRY, REGIONAL_DISTRICTS } from '../data/marketData';
import { number } from '../components/Shared';

export default function RegionalInsights({ t, lang, farm, toast }) {
  const [selectedDistrictKey, setSelectedDistrictKey] = useState('amritsar');
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [intentionForm, setIntentionForm] = useState({
    crop: 'Wheat',
    acres: farm.acres || 5,
    village: 'Chogawan',
    block: 'Majha West',
    season: 'Rabi 2026-27'
  });

  const districtData = SOWING_INTENTIONS_REGISTRY[selectedDistrictKey] || SOWING_INTENTIONS_REGISTRY.amritsar;

  function handleRegisterIntention(e) {
    e.preventDefault();
    toast(`Your anonymous intention of ${intentionForm.acres} acres of ${intentionForm.crop} registered to ${districtData.district} cluster.`);
    setShowDeclareModal(false);
  }

  const chartData = districtData.crops.map(c => ({
    crop: c.crop,
    intended: c.sharePct,
    historical: c.historicalAvgSharePct,
    riskLevel: c.riskLevel
  }));

  return (
    <div className="page-container">
      {/* Title */}
      <div className="aw-title" style={{ marginBottom: 20 }}>
        <div>
          <span className="overline">COMPETITOR SOWING-INTENTION INTELLIGENCE</span>
          <h1>Regional Sowing Intentions & Supply Concentration</h1>
          <p>
            Aggregated, privacy-preserved declarations from regional farmers. Identify prospective mandi oversupplies and high-margin crop opportunities before planting.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowDeclareModal(true)}>
          <Plus size={16} />
          Declare My Sowing Intention
        </button>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="alert-card alert-info" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
        <Lock size={22} color="#1e40af" />
        <div style={{ fontSize: 11, lineHeight: 1.6 }}>
          <strong style={{ fontSize: 12, display: 'block' }}>Zero-Knowledge Privacy Guarantee:</strong>
          Individual farmer names, exact survey numbers, and financial allocations are strictly hidden. Data is aggregated at the block level with minimum $k=15$ anonymization thresholds to protect individual bargaining power.
        </div>
      </div>

      {/* District Selector & Summary Cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1b4332' }}>Select Agricultural Cluster:</span>
        {REGIONAL_DISTRICTS.map(d => (
          <button
            key={d.id}
            onClick={() => setSelectedDistrictKey(d.id)}
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: selectedDistrictKey === d.id ? '#1b4332' : '#ffffff',
              color: selectedDistrictKey === d.id ? '#ffffff' : '#5e6f63',
              border: '1px solid #d8e0d2',
              transition: 'all 0.15s'
            }}
          >
            {d.name} ({d.state})
          </button>
        ))}
      </div>

      {/* Overview Metric Ribbon */}
      <div className="aw-metrics" style={{ marginBottom: 24 }}>
        <div className="aw-metric">
          <div className="metric-top">
            <span>District Coverage</span>
            <MapPin size={16} />
          </div>
          <strong>{districtData.district}</strong>
          <small>{districtData.season}</small>
        </div>

        <div className="aw-metric green">
          <div className="metric-top">
            <span>Participating Farmers</span>
            <Users size={16} />
          </div>
          <strong>{districtData.participatingFarmers} farmers</strong>
          <small>Verified digital landholders</small>
        </div>

        <div className="aw-metric">
          <div className="metric-top">
            <span>Reported Intended Area</span>
            <BarChart3 size={16} />
          </div>
          <strong>{number(districtData.totalReportedAcres)} acres</strong>
          <small>Active Rabi survey cycle</small>
        </div>

        <div className="aw-metric gold">
          <div className="metric-top">
            <span>Primary Crop Concentration</span>
            <AlertTriangle size={16} />
          </div>
          <strong style={{ color: '#b45309' }}>{districtData.crops[0]?.sharePct}% {districtData.crops[0]?.crop}</strong>
          <small>{districtData.crops[0]?.riskStatus}</small>
        </div>
      </div>

      {/* Comparison Chart: Intended Share vs Historical Benchmark */}
      <div className="premium-card" style={{ marginBottom: 24 }}>
        <div className="card-heading" style={{ marginBottom: 16 }}>
          <div>
            <h2>Intended Sowing Share (%) vs 5-Year Historical Average</h2>
            <p>Highlights shifts in farmer behavior that may create supply shortages or mandi gluts.</p>
          </div>
        </div>

        <div style={{ height: 320, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1e6" />
              <XAxis dataKey="crop" tick={{ fontSize: 12 }} />
              <YAxis unit="%" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `${value}% of reported acreage`} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="intended" name="2026-27 Intended Sowing Share (%)" fill="#2d6a4f" radius={[6, 6, 0, 0]} maxBarSize={45} />
              <Bar dataKey="historical" name="5-Year Historical Average Share (%)" fill="#d4a373" radius={[6, 6, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Crop Breakdown Table with Risk Alerts */}
      <div className="premium-card">
        <div className="card-heading" style={{ marginBottom: 16 }}>
          <div>
            <h2>Aggregated Crop Concentration & Market Imbalance Analysis</h2>
            <p>Derived from farmer-declared intentions, historical APMC data, and agronomic models.</p>
          </div>
        </div>

        <div className="aw-table-wrap">
          <table className="aw-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Intended Acreage</th>
                <th>Share of Cluster</th>
                <th>Historical Baseline</th>
                <th>Supply-Demand Status</th>
                <th>AcreWise Strategic Advisory</th>
              </tr>
            </thead>
            <tbody>
              {districtData.crops.map((c, idx) => (
                <tr key={idx}>
                  <td><strong style={{ fontSize: 13, color: '#1b4332' }}>{c.crop}</strong></td>
                  <td><b>{number(c.intendedAcres)}</b> acres</td>
                  <td><strong style={{ fontSize: 14 }}>{c.sharePct}%</strong></td>
                  <td style={{ color: '#68786a' }}>{c.historicalAvgSharePct}%</td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 700,
                      fontSize: 11,
                      padding: '4px 8px',
                      borderRadius: 4,
                      background: c.riskLevel === 'high' ? '#fdf2f2' : c.riskLevel === 'opportunity' ? '#eef8f2' : '#fef9ee',
                      color: c.riskLevel === 'high' ? '#dc2626' : c.riskLevel === 'opportunity' ? '#16a34a' : '#b45309'
                    }}>
                      {c.riskStatus}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: '#3f5245', maxWidth: 380, whiteSpace: 'normal' }}>
                    {c.suggestion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intention Declaration Modal */}
      {showDeclareModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 30, 20, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 90,
          padding: 20
        }}>
          <div className="premium-card" style={{ maxWidth: 520, width: '100%', position: 'relative' }}>
            <div className="card-heading" style={{ marginBottom: 16 }}>
              <div>
                <h2>Declare Your Sowing Intention</h2>
                <p>Help your regional farming cluster detect market gluts before seed is bought.</p>
              </div>
            </div>

            <form onSubmit={handleRegisterIntention} className="aw-form-grid" style={{ gap: 14 }}>
              <div className="aw-field">
                <label>Planned Crop</label>
                <select 
                  value={intentionForm.crop} 
                  onChange={e => setIntentionForm({ ...intentionForm, crop: e.target.value })}
                >
                  <option value="Wheat">Wheat</option>
                  <option value="Mustard">Mustard</option>
                  <option value="Chickpea">Chickpea (Chana)</option>
                  <option value="Potato">Potato</option>
                  <option value="Barley">Barley</option>
                </select>
              </div>

              <div className="aw-field">
                <label>Intended Area (Acres)</label>
                <input 
                  type="number" 
                  step="0.5" 
                  value={intentionForm.acres} 
                  onChange={e => setIntentionForm({ ...intentionForm, acres: Number(e.target.value) })} 
                />
              </div>

              <div className="aw-field">
                <label>Village Name</label>
                <input 
                  type="text" 
                  value={intentionForm.village} 
                  onChange={e => setIntentionForm({ ...intentionForm, village: e.target.value })} 
                />
              </div>

              <div className="aw-field">
                <label>Sub-District / Block</label>
                <input 
                  type="text" 
                  value={intentionForm.block} 
                  onChange={e => setIntentionForm({ ...intentionForm, block: e.target.value })} 
                />
              </div>

              <div style={{ gridColumn: '1 / -1', fontSize: 11, color: '#667768', background: '#f4f7f1', padding: 10, borderRadius: 6 }}>
                🔒 <b>Privacy Assured:</b> Your identity and farm location are never shared with traders, aggregators, or neighboring farms.
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setShowDeclareModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Submit Anonymous Intention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

