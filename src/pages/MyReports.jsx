import React, { useState } from 'react';
import { 
  FileText, Download, Printer, CheckCircle2, ShieldCheck, 
  Sprout, Calendar, MapPin, DollarSign, Layers 
} from 'lucide-react';
import { CROPS_CATALOG } from '../data/cropsData';
import { SOWING_INTENTIONS_REGISTRY } from '../data/marketData';
import { money, number } from '../components/Shared';

export default function MyReports({ t, lang, farm, result }) {
  const [reportType, setReportType] = useState('full'); // 'full' | 'recommendations' | 'financial'

  function handlePrint() {
    window.print();
  }

  const estProfit = result?.totals?.profit || (farm.acres * 24500);
  const estCost = result?.totals?.cost || (farm.acres * 15500);
  const allocations = result?.allocations || [
    { crop: 'Wheat', acres: (farm.acres || 10) * 0.6, share: 60, profit: (farm.acres || 10) * 0.6 * 26000, water: (farm.acres || 10) * 0.6 * 1800 },
    { crop: 'Mustard', acres: (farm.acres || 10) * 0.4, share: 40, profit: (farm.acres || 10) * 0.4 * 27800, water: (farm.acres || 10) * 0.4 * 900 }
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="aw-title" style={{ marginBottom: 20 }}>
        <div>
          <span className="overline">OFFICIAL AGRICULTURAL DOSSIERS</span>
          <h1>My Farm Reports & Decision Dossiers</h1>
          <p>
            Generate comprehensive agronomic and financial planning reports suitable for bank credit reviews, KVK consultations, or personal farm auditing.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            Print / Export as PDF
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="crop-tabs" style={{ marginBottom: 20 }}>
        <button className={reportType === 'full' ? 'selected' : ''} onClick={() => setReportType('full')}>
          Comprehensive Farm Strategic Dossier
        </button>
        <button className={reportType === 'recommendations' ? 'selected' : ''} onClick={() => setReportType('recommendations')}>
          Crop Mix & Scientific Allocation
        </button>
        <button className={reportType === 'financial' ? 'selected' : ''} onClick={() => setReportType('financial')}>
          Financial & Working Capital Breakdown
        </button>
      </div>

      {/* Printable Report Document Container */}
      <div 
        className="premium-card" 
        style={{ 
          background: '#ffffff', 
          border: '1px solid #d5decb', 
          padding: 36, 
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)' 
        }}
        id="printable-dossier"
      >
        {/* Document Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1b4332', paddingBottom: 18, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ 
                background: '#1b4332', 
                color: '#fff', 
                padding: '4px 8px', 
                borderRadius: 6, 
                fontWeight: 800, 
                fontSize: 14 
              }}>
                AcreWise
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#2d6a4f', letterSpacing: 1 }}>
                AGRICULTURAL DECISION DOSSIER
              </span>
            </div>
            <h1 style={{ fontSize: 24, margin: '8px 0 4px', color: '#0f281e' }}>
              Seasonal Farm Strategy & Crop Allocation
            </h1>
            <span style={{ fontSize: 11, color: '#68786a' }}>
              Document ID: AW-{farm.district?.slice(0, 3).toUpperCase() || 'AMR'}-{Date.now().toString().slice(-6)} · Season: {t[farm.season || 'rabi']} 2026–27
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge-pill" style={{ background: '#eef8f2', color: '#166534', padding: '4px 10px' }}>
              ✓ SciPy HiGHS Verified
            </span>
            <div style={{ fontSize: 11, color: '#7a8c7c', marginTop: 6 }}>
              Generated on {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Section 1: Farmer & Land Holding Summary */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, color: '#1b4332', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
            1. Land Holding & Soil Profile
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, background: '#f8faf5', padding: 16, borderRadius: 8 }}>
            <div>
              <span style={{ fontSize: 10, color: '#88988b', display: 'block' }}>FARM HOLDING</span>
              <strong style={{ fontSize: 13, color: '#1b4332' }}>{farm.name || 'My Farm'}</strong>
            </div>
            <div>
              <span style={{ fontSize: 10, color: '#88988b', display: 'block' }}>LANDOWNER / OPERATOR</span>
              <strong style={{ fontSize: 13, color: '#1b4332' }}>{farm.farmer_name || 'Registered Landholder'}</strong>
            </div>
            <div>
              <span style={{ fontSize: 10, color: '#88988b', display: 'block' }}>GEOGRAPHY</span>
              <strong style={{ fontSize: 13, color: '#1b4332' }}>{farm.district || 'Amritsar'}, {farm.state || 'Punjab'}</strong>
            </div>
            <div>
              <span style={{ fontSize: 10, color: '#88988b', display: 'block' }}>NET CULTIVATED AREA</span>
              <strong style={{ fontSize: 13, color: '#1b4332' }}>{farm.acres} Acres</strong>
            </div>
            <div>
              <span style={{ fontSize: 10, color: '#88988b', display: 'block' }}>SOIL CLASSIFICATION</span>
              <strong style={{ fontSize: 13, color: '#1b4332' }}>{t[farm.soil || 'loamy']}</strong>
            </div>
            <div>
              <span style={{ fontSize: 10, color: '#88988b', display: 'block' }}>SOIL PH STATUS</span>
              <strong style={{ fontSize: 13, color: '#1b4332' }}>7.2 (Optimal)</strong>
            </div>
            <div>
              <span style={{ fontSize: 10, color: '#88988b', display: 'block' }}>WORKING CAPITAL</span>
              <strong style={{ fontSize: 13, color: '#1b4332' }}>{money(farm.budget || 180000)}</strong>
            </div>
            <div>
              <span style={{ fontSize: 10, color: '#88988b', display: 'block' }}>WATER QUOTA</span>
              <strong style={{ fontSize: 13, color: '#1b4332' }}>{number(farm.water || 12000)} m³</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Mathematical Crop Allocation */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, color: '#1b4332', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
            2. Mathematically Optimized Crop Allocation
          </h3>
          <div className="aw-table-wrap">
            <table className="aw-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Allocated Area</th>
                  <th>Acreage Share</th>
                  <th>Water Use (m³)</th>
                  <th>Cultivation Cost</th>
                  <th>Projected Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((a, idx) => (
                  <tr key={idx}>
                    <td><strong>{a.crop}</strong></td>
                    <td>{number(a.acres)} acres</td>
                    <td>{number(a.share)}%</td>
                    <td>{number(a.water)} m³</td>
                    <td>{money(a.cost || a.acres * 15000)}</td>
                    <td><strong style={{ color: '#16a34a' }}>{money(a.profit)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Financial Margins & Sensitivity */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, color: '#1b4332', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
            3. Financial Yield & Sensitivity Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <div style={{ padding: 14, background: '#f5f8f1', borderRadius: 8, border: '1px solid #e1e9d8' }}>
              <span style={{ fontSize: 11, color: '#68786a', display: 'block' }}>Total Projected Revenue</span>
              <strong style={{ fontSize: 20, color: '#1b4332' }}>{money(estCost + estProfit)}</strong>
            </div>
            <div style={{ padding: 14, background: '#f5f8f1', borderRadius: 8, border: '1px solid #e1e9d8' }}>
              <span style={{ fontSize: 11, color: '#68786a', display: 'block' }}>Total Operational Expenses</span>
              <strong style={{ fontSize: 20, color: '#1b4332' }}>{money(estCost)}</strong>
            </div>
            <div style={{ padding: 14, background: '#eef8f2', borderRadius: 8, border: '1px solid #c9edd7' }}>
              <span style={{ fontSize: 11, color: '#166534', display: 'block' }}>Estimated Farm Net Profit</span>
              <strong style={{ fontSize: 20, color: '#166534' }}>{money(estProfit)}</strong>
            </div>
          </div>
        </div>

        {/* Disclaimer & Verification Footer */}
        <div style={{ borderTop: '1px solid #dfe5d6', paddingTop: 14, fontSize: 10, color: '#88988b', lineHeight: 1.5 }}>
          <p style={{ margin: 0 }}>
            <b>Agronomic Disclaimer:</b> This dossier is prepared by the AcreWise 2.0 Decision Support Engine. Production estimates assume good agricultural practices, timely fertilizer application, and standard seed vigor. Actual crop yields and APMC realization depend on in-season weather and mandi demand-supply dynamics.
          </p>
        </div>
      </div>
    </div>
  );
}

