import React, { useState } from 'react';
import { 
  Sparkles, Check, Info, Droplets, TrendingUp, AlertTriangle, 
  HelpCircle, Scale, ArrowRight, ShieldCheck, Clock, CheckCircle2, 
  Filter, Eye, Mic, ChevronDown, ChevronUp, Layers, BookOpen 
} from 'lucide-react';
import { CROPS_CATALOG } from '../data/cropsData';
import { money, number } from '../components/Shared';

export default function CropAdvisor({ t, lang, farm, go, calculate, toast }) {
  // Recommendation questionnaire state initialized with farm profile
  const [form, setForm] = useState({
    season: farm.season || 'rabi',
    soil: farm.soil || 'loamy',
    soilPh: farm.soil_ph || 7.2,
    waterLevel: 'medium', // 'low' | 'medium' | 'high'
    irrigationType: 'tubewell',
    durationPreference: 'all', // 'all' | 'short' | 'medium' | 'long'
    budgetLevel: 'standard', // 'low' | 'standard' | 'high'
    storageAccess: true,
    riskAppetite: 'balanced' // 'conservative' | 'balanced' | 'high_yield'
  });

  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [expandedWhy, setExpandedWhy] = useState(null);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Recommendation Scoring Engine
  const scoredCrops = CROPS_CATALOG.map(crop => {
    let score = 50;

    // Season match
    if (crop.season === form.season || (form.season === 'zaid' && crop.season === 'zaid')) {
      score += 25;
    } else {
      score -= 30; // season mismatch penalty
    }

    // Soil match
    if (crop.soils.includes(form.soil)) {
      score += 15;
    }

    // Water level alignment
    if (form.waterLevel === 'low' && (crop.waterCategory === 'Low' || crop.waterCategory === 'Very Low')) {
      score += 10;
    } else if (form.waterLevel === 'high') {
      score += 5;
    }

    // Duration match
    if (form.durationPreference === 'short' && crop.durationCategory.toLowerCase().includes('short')) {
      score += 8;
    }

    // Market demand bonus
    if (crop.demandTrend === 'rising') score += 5;

    // Constrain score between 20 and 98
    const finalScore = Math.min(98, Math.max(25, score));

    return {
      ...crop,
      calculatedScore: finalScore
    };
  })
  .filter(c => c.calculatedScore >= 40)
  .sort((a, b) => b.calculatedScore - a.calculatedScore);

  function toggleCompare(cropId) {
    if (selectedForCompare.includes(cropId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== cropId));
    } else {
      if (selectedForCompare.length >= 3) {
        toast('You can compare up to 3 crops simultaneously.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, cropId]);
    }
  }

  function handleVoiceInput() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast('Speech recognition not available in this browser. Please type.');
      return;
    }
    const recognition = new SR();
    recognition.lang = lang === 'pa' ? 'pa-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setVoiceQuery(text);
      toast(`Heard: "${text}"`);
      // Keyword matching
      if (text.includes('water') || text.includes('पानी') || text.includes('ਪਾਣੀ')) {
        setForm(prev => ({ ...prev, waterLevel: 'low' }));
      }
      if (text.includes('mustard') || text.includes('सरसों') || text.includes('ਸਰ੍ਹੋਂ')) {
        setForm(prev => ({ ...prev, durationPreference: 'short' }));
      }
    };
    recognition.start();
  }

  const comparisonList = CROPS_CATALOG.filter(c => selectedForCompare.includes(c.id));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="aw-title" style={{ marginBottom: 20 }}>
        <div>
          <span className="overline">AI DECISION INTELLIGENCE</span>
          <h1>AI-Powered Crop Recommendation Engine</h1>
          <p>Scientifically ranked recommendations matching soil characteristics, climate risk, water quotas, and regional market demand.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className={`btn-outline ${isListening ? 'recording' : ''}`}
            onClick={handleVoiceInput}
            title="Ask via voice in Punjabi, Hindi or English"
          >
            <Mic size={16} color={isListening ? '#dc2626' : '#2d6a4f'} />
            {isListening ? 'Listening…' : 'Voice Input'}
          </button>
          <button className="btn-primary" onClick={() => go('/planning')}>
            <Scale size={16} />
            Go to Optimizer
          </button>
        </div>
      </div>

      {voiceQuery && (
        <div className="alert-card alert-info" style={{ marginBottom: 20 }}>
          <Sparkles size={18} />
          <span>Recognized speech query: <b>"{voiceQuery}"</b> — Parameters updated automatically.</span>
        </div>
      )}

      {/* Visual Farmer-Friendly Preference Selector */}
      <div className="premium-card" style={{ marginBottom: 24 }}>
        <div className="card-heading" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 15 }}>Farmer Conditions & Planning Preferences</h2>
            <p>Customize your inputs to calibrate suitability scores in real time.</p>
          </div>
          <Filter size={18} color="#2d6a4f" />
        </div>

        <div className="grid-4" style={{ gap: 16 }}>
          <div className="aw-field">
            <label>Crop Season</label>
            <select value={form.season} onChange={e => setForm({ ...form, season: e.target.value })}>
              <option value="rabi">Rabi (Winter: Wheat, Mustard, Chana, Potato)</option>
              <option value="kharif">Kharif (Monsoon: Paddy, Maize, Cotton)</option>
              <option value="zaid">Zaid (Summer: Moong, Fodder, Melons)</option>
            </select>
          </div>

          <div className="aw-field">
            <label>Soil Texture</label>
            <select value={form.soil} onChange={e => setForm({ ...form, soil: e.target.value })}>
              <option value="loamy">Loamy (दोमट / ਦੋਮਟ)</option>
              <option value="alluvial">Alluvial (जलोढ़ / ਜਲੋੜ)</option>
              <option value="sandy">Sandy (रेतीली / ਰੇਤਲੀ)</option>
              <option value="clay">Clay (चिकनी / ਚੀਕਣੀ)</option>
            </select>
          </div>

          <div className="aw-field">
            <label>Water Availability</label>
            <select value={form.waterLevel} onChange={e => setForm({ ...form, waterLevel: e.target.value })}>
              <option value="low">Scarce / Low (Prefer Drought-Tolerant)</option>
              <option value="medium">Standard (Tubewell / Canal Scheduled)</option>
              <option value="high">Abundant (Full Canal + Tubewell Backup)</option>
            </select>
          </div>

          <div className="aw-field">
            <label>Duration Preference</label>
            <select value={form.durationPreference} onChange={e => setForm({ ...form, durationPreference: e.target.value })}>
              <option value="all">Any Growing Duration</option>
              <option value="short">Short Duration (&lt; 100 days)</option>
              <option value="medium">Medium Duration (100 - 135 days)</option>
              <option value="long">Long Duration (140+ days)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Drawer if crops selected */}
      {comparisonList.length > 0 && (
        <div className="premium-card" style={{ marginBottom: 24, border: '2px solid #2d6a4f', background: '#fcfdfa' }}>
          <div className="card-heading" style={{ marginBottom: 16 }}>
            <div>
              <h2 style={{ color: '#1b4332' }}>Side-by-Side Crop Comparison ({comparisonList.length} of 3 selected)</h2>
              <p>Compare agronomic requirements and economics to make confident decisions.</p>
            </div>
            <button className="aw-text-button" onClick={() => setSelectedForCompare([])}>
              Clear Comparison
            </button>
          </div>

          <div className="aw-table-wrap">
            <table className="aw-table">
              <thead>
                <tr>
                  <th>Metric / Factor</th>
                  {comparisonList.map(c => (
                    <th key={c.id}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1b4332' }}>{c.name}</span>
                      <span className="badge-pill" style={{ marginLeft: 6 }}>{c.calculatedScore}% Score</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Expected Yield</strong></td>
                  {comparisonList.map(c => <td key={c.id}>{c.expectedYieldQ} quintals / acre</td>)}
                </tr>
                <tr>
                  <td><strong>Cultivation Cost</strong></td>
                  {comparisonList.map(c => <td key={c.id}>{money(c.cultivationCost)} / acre</td>)}
                </tr>
                <tr>
                  <td><strong>Projected Revenue</strong></td>
                  {comparisonList.map(c => <td key={c.id}>{money(c.grossRevenue)} / acre</td>)}
                </tr>
                <tr>
                  <td><strong>Estimated Net Profit</strong></td>
                  {comparisonList.map(c => (
                    <td key={c.id}>
                      <strong style={{ color: '#16a34a', fontSize: 14 }}>{money(c.netProfit)}</strong> / acre
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Water Requirement</strong></td>
                  {comparisonList.map(c => <td key={c.id}>{c.waterRequirementMm}</td>)}
                </tr>
                <tr>
                  <td><strong>Growing Duration</strong></td>
                  {comparisonList.map(c => <td key={c.id}>{c.durationDays}</td>)}
                </tr>
                <tr>
                  <td><strong>Market Demand Outlook</strong></td>
                  {comparisonList.map(c => <td key={c.id}>{c.marketDemand}</td>)}
                </tr>
                <tr>
                  <td><strong>Key Agronomic Risk</strong></td>
                  {comparisonList.map(c => <td key={c.id} style={{ color: '#b45309' }}>{c.weatherRisk}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Crop Recommendation Cards Grid */}
      <h2 style={{ fontSize: 18, marginBottom: 16, color: '#1b4332' }}>
        Ranked Crop Recommendations for {farm.name || 'Your Farm'} ({scoredCrops.length})
      </h2>

      <div className="grid-3">
        {scoredCrops.map(crop => {
          const isCompared = selectedForCompare.includes(crop.id);
          const isWhyOpen = expandedWhy === crop.id;

          return (
            <div className="crop-card-hero" key={crop.id}>
              {/* Image & Overlay Header */}
              <div className="crop-card-image" style={{ backgroundImage: `url(${crop.image})` }}>
                <div className="crop-card-overlay">
                  <span className="crop-score-badge">
                    <Sparkles size={14} color="#1b4332" />
                    {crop.calculatedScore}% Suitability
                  </span>
                  <div>
                    <h3 style={{ fontSize: 20, margin: 0, fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      {crop.name}
                    </h3>
                    <span style={{ fontSize: 12, opacity: 0.9 }}>
                      {crop.hindiName} · {crop.punjabiName} ({crop.season.toUpperCase()})
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="crop-card-content">
                {/* 2x2 Metric Strip */}
                <div className="crop-metrics-strip">
                  <div className="metric-item">
                    <span>EST. NET PROFIT</span>
                    <strong style={{ color: '#16a34a' }}>{money(crop.netProfit)}</strong>
                  </div>
                  <div className="metric-item">
                    <span>EXPECTED YIELD</span>
                    <strong>{crop.expectedYieldQ} q/acre</strong>
                  </div>
                  <div className="metric-item">
                    <span>CULTIVATION COST</span>
                    <strong>{money(crop.cultivationCost)}</strong>
                  </div>
                  <div className="metric-item">
                    <span>DURATION</span>
                    <strong>{crop.durationDays}</strong>
                  </div>
                </div>

                {/* Agronomic Details */}
                <div style={{ fontSize: 11, color: '#5e6f63', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Droplets size={14} color="#2d6a4f" />
                    <span><b>Water Need:</b> {crop.waterRequirementMm}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <TrendingUp size={14} color="#2d6a4f" />
                    <span><b>Market Demand:</b> {crop.marketDemand}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={14} color="#b45309" />
                    <span><b>Weather/Disease Risk:</b> {crop.weatherRisk}</span>
                  </div>
                </div>

                {/* "Why Recommended" Accordion */}
                <div style={{ borderTop: '1px solid #edf1e6', paddingTop: 10, marginTop: 'auto' }}>
                  <button 
                    onClick={() => setExpandedWhy(isWhyOpen ? null : crop.id)}
                    style={{ 
                      background: 'none', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      width: '100%', 
                      padding: '6px 0',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#2d6a4f'
                    }}
                  >
                    <span>Why AcreWise Recommends This</span>
                    {isWhyOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isWhyOpen && (
                    <div style={{ padding: '8px 10px', background: '#f4f8f2', borderRadius: 6, fontSize: 11, marginTop: 6, color: '#324a3a' }}>
                      <p style={{ margin: '0 0 6px' }}>{crop.recommendationReason}</p>
                      <ul style={{ paddingLeft: 16, margin: 0 }}>
                        {crop.advantages.map((adv, idx) => (
                          <li key={idx} style={{ marginBottom: 3 }}>{adv}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button 
                    className={isCompared ? 'btn-primary' : 'btn-outline'} 
                    style={{ flex: 1, padding: '8px 10px', fontSize: 11 }}
                    onClick={() => toggleCompare(crop.id)}
                  >
                    {isCompared ? <Check size={14} /> : <Scale size={14} />}
                    {isCompared ? 'Compared' : 'Compare'}
                  </button>

                  <button 
                    className="btn-primary" 
                    style={{ flex: 1.2, padding: '8px 10px', fontSize: 11 }}
                    onClick={() => {
                      toast(`Selected ${crop.name} for farm optimization.`);
                      go('/planning');
                    }}
                  >
                    Plan Acreage <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

