import React, { useState } from 'react';
import { 
  Calendar, Clock, AlertTriangle, ShieldCheck, Warehouse, 
  Truck, ArrowRight, CheckCircle2, Info, ThermometerSnowflake, 
  Sparkles, DollarSign 
} from 'lucide-react';
import { CROPS_CATALOG } from '../data/cropsData';
import { money, number } from '../components/Shared';

export default function HarvestPlanner({ t, lang, farm, go }) {
  const [selectedCropId, setSelectedCropId] = useState('mustard');
  const [sowingDate, setSowingDate] = useState('2026-10-15');
  const [storageAvailable, setStorageAvailable] = useState(false);
  const [transportArranged, setTransportArranged] = useState(true);

  const crop = CROPS_CATALOG.find(c => c.id === selectedCropId) || CROPS_CATALOG[0];

  // Lifecycle calculations
  const isShortDuration = crop.durationCategory.toLowerCase().includes('short');
  const estYieldTotal = Math.round(crop.expectedYieldQ * (farm.acres || 10));

  return (
    <div className="page-container">
      {/* Title */}
      <div className="aw-title" style={{ marginBottom: 20 }}>
        <div>
          <span className="overline">LIFECYCLE & DISPOSITION MANAGEMENT</span>
          <h1>Intelligent Harvest & Selling Planner</h1>
          <p>
            Track physiological maturity, time harvest windows against regional weather risks, and balance immediate mandi offload vs secure on-farm storage.
          </p>
        </div>
        <button className="btn-primary" onClick={() => go('/market')}>
          Check Mandi Prices
        </button>
      </div>

      {/* Safety & Prudence Guardrail Alert */}
      <div className="alert-card alert-warning" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
        <ShieldCheck size={26} color="#945700" />
        <div style={{ fontSize: 11, lineHeight: 1.6 }}>
          <strong style={{ fontSize: 12, display: 'block' }}>Agronomic Safety & Quality First Principle:</strong>
          AcreWise never advises delaying harvest past physiological maturity solely for speculative future price gains. Shattering, unseasonal rain, pest infestation, and post-harvest moisture deterioration always outweigh speculative price spikes.
        </div>
      </div>

      {/* Crop & Field Selector Strip */}
      <div className="premium-card" style={{ marginBottom: 24 }}>
        <div className="card-heading" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 15 }}>Select Field Crop & Sowing Baseline</h2>
            <p>Select which cultivated crop to generate an intelligent harvest and selling timeline for.</p>
          </div>
        </div>

        <div className="grid-3" style={{ gap: 16 }}>
          <div className="aw-field">
            <label>Cultivated Crop</label>
            <select value={selectedCropId} onChange={e => setSelectedCropId(e.target.value)}>
              {CROPS_CATALOG.filter(c => c.season === (farm.season || 'rabi')).map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.durationDays})</option>
              ))}
            </select>
          </div>

          <div className="aw-field">
            <label>Field Sowing Date</label>
            <input 
              type="date" 
              value={sowingDate} 
              onChange={e => setSowingDate(e.target.value)} 
            />
          </div>

          <div className="aw-field">
            <label>Post-Harvest Cold/Dry Storage Access?</label>
            <select 
              value={storageAvailable ? 'yes' : 'no'} 
              onChange={e => setStorageAvailable(e.target.value === 'yes')}
            >
              <option value="no">No (Must sell fresh / immediate mandi offload)</option>
              <option value="yes">Yes (Pucca warehouse / Cold storage booked)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visual Crop Lifecycle Timeline */}
      <div className="premium-card" style={{ marginBottom: 24 }}>
        <div className="card-heading" style={{ marginBottom: 16 }}>
          <div>
            <h2>Field Lifecycle Timeline: {crop.name}</h2>
            <p>From initial sowing to peak maturity, harvest readiness, and strategic market selling windows.</p>
          </div>
          <Calendar size={20} color="#2d6a4f" />
        </div>

        <div className="timeline-track">
          <div className="timeline-node active">
            <div className="timeline-node-circle">🌱</div>
            <span className="timeline-node-label">Sowing & Emergence</span>
            <span className="timeline-node-sub">{crop.sowingWindow}</span>
          </div>

          <div className="timeline-node active">
            <div className="timeline-node-circle">🌿</div>
            <span className="timeline-node-label">Vegetative & Branching</span>
            <span className="timeline-node-sub">Day 20 - 55</span>
          </div>

          <div className="timeline-node">
            <div className="timeline-node-circle">🌾</div>
            <span className="timeline-node-label">Flowering & Pod Fill</span>
            <span className="timeline-node-sub">Day 60 - 85</span>
          </div>

          <div className="timeline-node">
            <div className="timeline-node-circle">⭐</div>
            <span className="timeline-node-label">Physiological Maturity</span>
            <span className="timeline-node-sub">Maturity: {crop.harvestWindow}</span>
          </div>

          <div className="timeline-node">
            <div className="timeline-node-circle">🚛</div>
            <span className="timeline-node-label">Optimal Selling Window</span>
            <span className="timeline-node-sub">Mandi or Direct Buyer</span>
          </div>
        </div>
      </div>

      {/* 2-Column Strategy Grid */}
      <div className="overview-grid" style={{ marginBottom: 24 }}>
        {/* Harvest Congestion & Field Logistics */}
        <div className="premium-card">
          <div className="card-heading">
            <div>
              <h2>Harvest Readiness & Logistics</h2>
              <p>Operational factors for {farm.name || 'Your Farm'} ({farm.acres} acres)</p>
            </div>
            <Truck size={20} color="#2d6a4f" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 12, background: '#f7f9f3', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 13, color: '#1b4332', display: 'block' }}>Expected Production Volume</strong>
                <span style={{ fontSize: 11, color: '#68786a' }}>Based on {crop.expectedYieldQ} q/acre baseline</span>
              </div>
              <strong style={{ fontSize: 18, color: '#2d6a4f' }}>{number(estYieldTotal)} Quintals</strong>
            </div>

            <div style={{ padding: 12, background: '#f7f9f3', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 13, color: '#1b4332', display: 'block' }}>Estimated Trolley Trips Required</strong>
                <span style={{ fontSize: 11, color: '#68786a' }}>Assuming standard 45 quintal tractor trolley</span>
              </div>
              <strong style={{ fontSize: 18, color: '#2d6a4f' }}>{Math.ceil(estYieldTotal / 45)} Loads</strong>
            </div>

            <div style={{ padding: 12, background: '#fefbf5', border: '1px solid #f6ecdc', borderRadius: 8 }}>
              <strong style={{ fontSize: 12, color: '#b45309', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={15} /> Regional Harvest Congestion Forecast
              </strong>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#695a43' }}>
                Major harvest peak expected across {farm.district} mandis in late {crop.harvestWindow.split(' - ')[1]}. Pre-booking tractor trolleys and combine harvesters 10 days in advance is recommended.
              </p>
            </div>
          </div>
        </div>

        {/* Selling Decision Comparison Matrix */}
        <div className="premium-card">
          <div className="card-heading">
            <div>
              <h2>Selling Strategy Comparison</h2>
              <p>Immediate Mandi Sale vs Post-Harvest Storage</p>
            </div>
            <Warehouse size={20} color="#2d6a4f" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Strategy 1 */}
            <div style={{ border: '1px solid #e3ebd8', borderRadius: 10, padding: 14, background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <strong style={{ fontSize: 13, color: '#1b4332' }}>Strategy A: Immediate Mandi Offload (At Harvest)</strong>
                <span className="badge-pill">Zero Storage Risk</span>
              </div>
              <p style={{ fontSize: 11, color: '#5e6f63', margin: '0 0 10px' }}>
                Sell directly at official APMC Mandi upon harvest. Realizes immediate liquidity with zero storage fees or moisture shrinkage.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span>Estimated Realized Price: <b>₹{crop.benchmarkPrice.toLocaleString()} / q</b></span>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>Immediate Liquidity</span>
              </div>
            </div>

            {/* Strategy 2 */}
            <div style={{ border: '1px solid #e3ebd8', borderRadius: 10, padding: 14, background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <strong style={{ fontSize: 13, color: '#1b4332' }}>Strategy B: Staggered Storage Sale (30-60 Days)</strong>
                <span className="badge-pill badge-gold">Conditional Premium</span>
              </div>
              <p style={{ fontSize: 11, color: '#5e6f63', margin: '0 0 10px' }}>
                Store in aerated warehouse to bypass post-harvest market supply glut. Suitable only for non-perishable grains/oilseeds with moisture &lt; 10%.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span>Projected Spread: <b>+5% to +8%</b> (less ₹35/q storage)</span>
                <span style={{ color: '#b45309', fontWeight: 700 }}>Carrying Cost Involved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

