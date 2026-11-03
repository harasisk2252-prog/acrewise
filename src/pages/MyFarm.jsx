import React, { useEffect, useState } from 'react';
import { 
  Tractor, Sprout, MapPin, Droplets, FlaskConical, History, 
  Wallet, Plus, Trash2, Save, CheckCircle2, AlertCircle, Info, FileText 
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { money, number } from '../components/Shared';

export default function MyFarm({ t, lang, farm, setFarm, toast, ready }) {
  const [draft, setDraft] = useState({
    ...farm,
    soil_ph: farm.soil_ph || 7.2,
    organic_carbon: farm.organic_carbon || 0.65,
    irrigation_source: farm.irrigation_source || 'Tubewell + Canal',
    fields: farm.fields || [
      { id: 'f-1', name: 'Main Killa Block', acres: 6.5, soil: farm.soil || 'loamy', irrigation: 'Tubewell', currentCrop: 'Wheat (Planned)' },
      { id: 'f-2', name: 'Canal Road Parcel', acres: 3.5, soil: 'alluvial', irrigation: 'Canal', currentCrop: 'Mustard (Planned)' }
    ],
    cropHistory: farm.cropHistory || [
      { season: 'Kharif 2026', crop: 'Rice (Paddy)', acres: 10, yieldQ: 26.5, priceQ: 2320, profitPerAcre: 28500 },
      { season: 'Rabi 2025-26', crop: 'Wheat', acres: 8, yieldQ: 19.0, priceQ: 2275, profitPerAcre: 24700 },
      { season: 'Kharif 2025', crop: 'Maize', acres: 10, yieldQ: 21.0, priceQ: 2150, profitPerAcre: 26000 }
    ],
    expenses: farm.expenses || [
      { category: 'Certified Seeds', amount: 14500, note: 'PBW-826 High Yielding Variety' },
      { category: 'DAP & Urea Fertilizer', amount: 22000, note: 'Cooperative society subsidized quota' },
      { category: 'Tractor Diesel & Land Prep', amount: 18500, note: 'Subsoiler + 2 harrow passes' },
      { category: 'Tubewell Electricity / Fuel', amount: 12000, note: 'Scheduled seasonal allowance' },
      { category: 'Harvest & Labour Reserve', amount: 25000, note: 'Labor pooling agreement' }
    ]
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'fields' | 'history' | 'expenses'

  useEffect(() => {
    apiRequest('/api/farm/details').then(({ details }) => {
      if (details && Object.keys(details).length) setDraft(current => ({ ...current, ...details }));
    }).catch(() => {});
  }, []);

  async function handleSave(e) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      // Keep payload compatible with backend FarmProfile schema while saving extended digital profile in workspace
      const backendPayload = {
        name: draft.name || 'My Farm',
        farmer_name: draft.farmer_name || '',
        district: draft.district || 'Amritsar',
        state: draft.state || 'Punjab',
        acres: Number(draft.acres) || 10,
        soil: draft.soil || 'loamy',
        season: draft.season || 'rabi',
        budget: Number(draft.budget) || 180000,
        water: Number(draft.water) || 12000
      };

      const updated = await apiRequest('/api/farm', {
        method: 'PUT',
        body: JSON.stringify(backendPayload)
      });

      const { name, farmer_name, district, state, acres, soil, season, budget, water, ...details } = draft;
      await apiRequest('/api/farm/details', { method: 'PUT', body: JSON.stringify({ details }) });

      // Merge extended fields locally and persist them independently from optimizer inputs.
      const fullMerged = { ...updated, ...draft };
      setFarm(fullMerged);
      localStorage.setItem('acrewise-extended-farm', JSON.stringify(draft));
      toast('Digital Farm Profile updated successfully!');
    } catch (err) {
      toast(err.message || 'Failed to save farm profile');
    } finally {
      setSaving(false);
    }
  }

  function addField() {
    const newField = {
      id: `f-${Date.now()}`,
      name: `Field Parcel ${draft.fields.length + 1}`,
      acres: 2.0,
      soil: 'loamy',
      irrigation: 'Tubewell',
      currentCrop: 'Unallocated'
    };
    setDraft({ ...draft, fields: [...draft.fields, newField] });
  }

  function removeField(id) {
    setDraft({ ...draft, fields: draft.fields.filter(f => f.id !== id) });
  }

  const totalFieldAcres = draft.fields.reduce((acc, f) => acc + Number(f.acres || 0), 0);
  const totalLoggedExpenses = draft.expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

  return (
    <div className="page-container">
      {/* Title & Actions */}
      <div className="aw-title" style={{ marginBottom: 20 }}>
        <div>
          <span className="overline">DIGITAL FARM IDENTITY</span>
          <h1>My Farm & Land Records</h1>
          <p>Register multiple field parcels, track soil health tests, irrigation facilities and historical cultivation records.</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving || !ready}>
          <Save size={16} />
          {saving ? 'Saving Profile…' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="crop-tabs" style={{ marginBottom: 20 }}>
        <button className={activeTab === 'profile' ? 'selected' : ''} onClick={() => setActiveTab('profile')}>
          Farm Profile & Baseline
        </button>
        <button className={activeTab === 'fields' ? 'selected' : ''} onClick={() => setActiveTab('fields')}>
          Field Parcels ({draft.fields.length})
        </button>
        <button className={activeTab === 'history' ? 'selected' : ''} onClick={() => setActiveTab('history')}>
          Crop History & Past Yields
        </button>
        <button className={activeTab === 'expenses' ? 'selected' : ''} onClick={() => setActiveTab('expenses')}>
          Cultivation Expense Ledger
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="farm-layout">
          <form className="premium-card" onSubmit={handleSave}>
            <div className="card-heading">
              <div>
                <h2>Primary Farm Parameters</h2>
                <p>These values power the AI Crop Advisor and SciPy mathematical optimizer.</p>
              </div>
              <Tractor size={22} color="#2d6a4f" />
            </div>

            <div className="aw-form-grid" style={{ marginBottom: 20 }}>
              <div className="aw-field">
                <label>Farm / Holding Name</label>
                <input 
                  type="text" 
                  value={draft.name || ''} 
                  onChange={e => setDraft({ ...draft, name: e.target.value })} 
                  placeholder="e.g. Green Valley Killa" 
                />
              </div>

              <div className="aw-field">
                <label>Farmer / Landowner Name</label>
                <input 
                  type="text" 
                  value={draft.farmer_name || ''} 
                  onChange={e => setDraft({ ...draft, farmer_name: e.target.value })} 
                  placeholder="e.g. Sardar Harinder Singh" 
                />
              </div>

              <div className="aw-field">
                <label>District</label>
                <input 
                  type="text" 
                  value={draft.district || ''} 
                  onChange={e => setDraft({ ...draft, district: e.target.value })} 
                />
              </div>

              <div className="aw-field">
                <label>State</label>
                <input 
                  type="text" 
                  value={draft.state || ''} 
                  onChange={e => setDraft({ ...draft, state: e.target.value })} 
                />
              </div>

              <div className="aw-field">
                <label>Total Farmland Area (Acres)</label>
                <input 
                  type="number" 
                  step="0.5" 
                  value={draft.acres || ''} 
                  onChange={e => setDraft({ ...draft, acres: Number(e.target.value) })} 
                />
              </div>

              <div className="aw-field">
                <label>Primary Soil Classification</label>
                <select value={draft.soil} onChange={e => setDraft({ ...draft, soil: e.target.value })}>
                  <option value="loamy">{t.loamy} (Best for diverse crops)</option>
                  <option value="alluvial">{t.alluvial} (Fertile river plains)</option>
                  <option value="sandy">{t.sandy} (Light, quick draining)</option>
                  <option value="clay">{t.clay} (High water retention)</option>
                </select>
              </div>

              <div className="aw-field">
                <label>Active Season</label>
                <select value={draft.season} onChange={e => setDraft({ ...draft, season: e.target.value })}>
                  <option value="rabi">Rabi (Winter: Oct - Apr)</option>
                  <option value="kharif">Kharif (Monsoon: Jun - Nov)</option>
                  <option value="zaid">Zaid (Summer: Mar - Jun)</option>
                </select>
              </div>

              <div className="aw-field">
                <label>Working Capital Budget (₹)</label>
                <input 
                  type="number" 
                  step="5000" 
                  value={draft.budget || ''} 
                  onChange={e => setDraft({ ...draft, budget: Number(e.target.value) })} 
                />
              </div>

              <div className="aw-field">
                <label>Seasonal Water Allowance (m³)</label>
                <input 
                  type="number" 
                  step="500" 
                  value={draft.water || ''} 
                  onChange={e => setDraft({ ...draft, water: Number(e.target.value) })} 
                />
              </div>

              <div className="aw-field">
                <label>Primary Irrigation Facility</label>
                <select 
                  value={draft.irrigation_source} 
                  onChange={e => setDraft({ ...draft, irrigation_source: e.target.value })}
                >
                  <option value="Tubewell + Canal">Tubewell + Canal Command Area</option>
                  <option value="Deep Bore Tubewell Only">Deep Bore Tubewell Only</option>
                  <option value="Perennial Canal Only">Perennial Canal Only</option>
                  <option value="Micro Drip / Sprinkler">Micro Drip / Sprinkler System</option>
                  <option value="Rainfed (Barani)">Rainfed (Barani)</option>
                </select>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e7ecdf', paddingTop: 20 }}>
              <div className="card-heading" style={{ marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 14 }}>Soil Health & Lab Test Indicators</h3>
                  <p>Incorporate official Krishi Vigyan Kendra (KVK) or Soil Health Card data.</p>
                </div>
                <FlaskConical size={20} color="#2d6a4f" />
              </div>

              <div className="aw-form-grid">
                <div className="aw-field">
                  <label>Soil pH Value: <b>{draft.soil_ph}</b> (Neutral: 6.5 - 7.5)</label>
                  <input 
                    type="range" 
                    min="5.0" 
                    max="9.0" 
                    step="0.1" 
                    value={draft.soil_ph} 
                    onChange={e => setDraft({ ...draft, soil_ph: Number(e.target.value) })} 
                  />
                  <small style={{ color: draft.soil_ph >= 6.5 && draft.soil_ph <= 7.8 ? '#16a34a' : '#b45309' }}>
                    {draft.soil_ph >= 6.5 && draft.soil_ph <= 7.8 ? '✓ Optimal range for Wheat, Mustard & Pulses' : '⚠️ Requires gypsum or organic matter amendment'}
                  </small>
                </div>

                <div className="aw-field">
                  <label>Organic Carbon (%): <b>{draft.organic_carbon}%</b></label>
                  <input 
                    type="range" 
                    min="0.2" 
                    max="1.5" 
                    step="0.05" 
                    value={draft.organic_carbon} 
                    onChange={e => setDraft({ ...draft, organic_carbon: Number(e.target.value) })} 
                  />
                  <small style={{ color: draft.organic_carbon >= 0.6 ? '#16a34a' : '#b45309' }}>
                    {draft.organic_carbon >= 0.6 ? 'Good soil organic activity' : 'Medium - Recommended green manuring'}
                  </small>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: 20 }}>
              <Save size={15} /> Save Farm Profile
            </button>
          </form>

          {/* Right Farm Card Preview */}
          <aside className="farm-preview">
            <div>
              <span className="overline">ACREWISE DIGITAL RECORD</span>
              <h2>{draft.name || 'My Farm'}</h2>
              <p><MapPin size={16} /> {draft.district}, {draft.state}</p>
              <strong>{number(draft.acres || 0)} <small>{t.acres}</small></strong>
              <div className="farm-tags">
                <span>{t[draft.soil]} Soil</span>
                <span>{t[draft.season]} Season</span>
                <span>{draft.irrigation_source}</span>
              </div>
              <p style={{ marginTop: 15, fontSize: 11, color: '#c7d9bc' }}>
                Allocated across {draft.fields.length} parcels. Soil pH: {draft.soil_ph}.
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Field Parcels Tab */}
      {activeTab === 'fields' && (
        <div className="premium-card">
          <div className="card-heading">
            <div>
              <h2>Registered Field Parcels ({totalFieldAcres} of {draft.acres} acres allocated)</h2>
              <p>Manage individual plots with separate soil types, water sources, and sowing intentions.</p>
            </div>
            <button className="btn-primary" onClick={addField}>
              <Plus size={15} /> Add New Field
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {draft.fields.map((f, idx) => (
              <div 
                key={f.id} 
                style={{ 
                  background: '#f9faf6', 
                  border: '1px solid #e3e8db', 
                  borderRadius: 12, 
                  padding: 18, 
                  position: 'relative' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <strong style={{ fontSize: 14, color: '#1b4332' }}>{f.name}</strong>
                  <button 
                    onClick={() => removeField(f.id)} 
                    style={{ background: 'none', color: '#b91c1c', padding: 4 }}
                    title="Remove Parcel"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="aw-form-grid" style={{ gap: 10 }}>
                  <div className="aw-field">
                    <label>Parcel Name</label>
                    <input 
                      type="text" 
                      value={f.name} 
                      onChange={e => {
                        const updated = [...draft.fields];
                        updated[idx].name = e.target.value;
                        setDraft({ ...draft, fields: updated });
                      }} 
                    />
                  </div>

                  <div className="aw-field">
                    <label>Area (Acres)</label>
                    <input 
                      type="number" 
                      step="0.5" 
                      value={f.acres} 
                      onChange={e => {
                        const updated = [...draft.fields];
                        updated[idx].acres = Number(e.target.value);
                        setDraft({ ...draft, fields: updated });
                      }} 
                    />
                  </div>

                  <div className="aw-field">
                    <label>Soil Type</label>
                    <select 
                      value={f.soil} 
                      onChange={e => {
                        const updated = [...draft.fields];
                        updated[idx].soil = e.target.value;
                        setDraft({ ...draft, fields: updated });
                      }}
                    >
                      <option value="loamy">Loamy</option>
                      <option value="alluvial">Alluvial</option>
                      <option value="sandy">Sandy</option>
                      <option value="clay">Clay</option>
                    </select>
                  </div>

                  <div className="aw-field">
                    <label>Irrigation Type</label>
                    <select 
                      value={f.irrigation} 
                      onChange={e => {
                        const updated = [...draft.fields];
                        updated[idx].irrigation = e.target.value;
                        setDraft({ ...draft, fields: updated });
                      }}
                    >
                      <option value="Tubewell">Tubewell</option>
                      <option value="Canal">Canal</option>
                      <option value="Drip / Micro">Drip / Micro</option>
                      <option value="Rainfed">Rainfed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={handleSave} style={{ marginTop: 20 }}>
            <Save size={15} /> Save Field Parcels
          </button>
        </div>
      )}

      {/* Crop History Tab */}
      {activeTab === 'history' && (
        <div className="premium-card">
          <div className="card-heading">
            <div>
              <h2>Cultivation History & Past Performance</h2>
              <p>Historical yields and realized market prices used by AcreWise to calibrate future recommendations.</p>
            </div>
            <History size={20} color="#2d6a4f" />
          </div>

          <div className="aw-table-wrap">
            <table className="aw-table">
              <thead>
                <tr>
                  <th>Season</th>
                  <th>Crop Grown</th>
                  <th>Land Area</th>
                  <th>Actual Yield</th>
                  <th>Realized Mandi Price</th>
                  <th>Gross Margin / Acre</th>
                </tr>
              </thead>
              <tbody>
                {draft.cropHistory.map((h, i) => (
                  <tr key={i}>
                    <td><strong>{h.season}</strong></td>
                    <td>{h.crop}</td>
                    <td>{h.acres} acres</td>
                    <td>{h.yieldQ} quintals / acre</td>
                    <td>₹{h.priceQ.toLocaleString()} / q</td>
                    <td><strong style={{ color: '#2d6a4f' }}>{money(h.profitPerAcre)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="premium-card">
          <div className="card-heading">
            <div>
              <h2>Cultivation Expense Ledger (Total: {money(totalLoggedExpenses)})</h2>
              <p>Breakdown of operational inputs against your ₹{farm.budget?.toLocaleString()} working budget.</p>
            </div>
            <Wallet size={20} color="#2d6a4f" />
          </div>

          <div className="aw-table-wrap">
            <table className="aw-table">
              <thead>
                <tr>
                  <th>Expense Category</th>
                  <th>Details & Vendor</th>
                  <th>Amount (₹)</th>
                  <th>Share of Budget</th>
                </tr>
              </thead>
              <tbody>
                {draft.expenses.map((exp, i) => (
                  <tr key={i}>
                    <td><strong>{exp.category}</strong></td>
                    <td style={{ color: '#68786a' }}>{exp.note}</td>
                    <td><strong style={{ color: '#1b4332' }}>{money(exp.amount)}</strong></td>
                    <td>{Math.round((exp.amount / (draft.budget || 180000)) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

