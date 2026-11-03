import React, { useState } from 'react';
import { 
  Users, Building2, TrendingUp, Package, ShoppingCart, 
  Layers, MapPin, Calendar, ArrowUpRight, BarChart2, ShieldCheck 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, 
  Cell, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { number, money } from '../components/Shared';

export default function FPODashboard({ t, lang }) {
  const fpoStats = {
    name: 'Majha Agro Producer Company Ltd. (FPO)',
    registration: 'FPO-PB-AMR-2023-8842',
    totalMembers: 412,
    totalAcreage: 4250,
    districts: 'Amritsar & Tarn Taran',
    crops: [
      { crop: 'Wheat', acres: 2890, sharePct: 68, estProductionTonnes: 5200, color: '#2d6a4f' },
      { crop: 'Mustard', acres: 722, sharePct: 17, estProductionTonnes: 520, color: '#d4a373' },
      { crop: 'Potato', acres: 425, sharePct: 10, estProductionTonnes: 4675, color: '#bc6c25' },
      { crop: 'Chickpea', acres: 213, sharePct: 5, estProductionTonnes: 125, color: '#8cb369' },
    ],
    collectiveSavings: 840000 // Estimated savings from bulk purchase of DAP/Urea and certified seeds
  };

  return (
    <div className="page-container">
      {/* Title */}
      <div className="aw-title" style={{ marginBottom: 20 }}>
        <div>
          <span className="overline">COOPERATIVE & PRODUCER INTELLIGENCE</span>
          <h1>FPO Cluster Command & Member Aggregation</h1>
          <p>
            Aggregated intelligence for Farmer Producer Organizations. Monitor cluster sowing distribution, forecast collective harvest tonnage, and coordinate bulk inputs.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong style={{ fontSize: 13, color: '#1b4332', display: 'block' }}>{fpoStats.name}</strong>
          <span style={{ fontSize: 10, color: '#88988b' }}>Reg: {fpoStats.registration}</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="aw-metrics" style={{ marginBottom: 24 }}>
        <div className="aw-metric green">
          <div className="metric-top">
            <span>Registered Farmers</span>
            <Users size={16} />
          </div>
          <strong>{fpoStats.totalMembers} Members</strong>
          <small>Verified landholder roster</small>
        </div>

        <div className="aw-metric">
          <div className="metric-top">
            <span>Collective Land Area</span>
            <Layers size={16} />
          </div>
          <strong>{number(fpoStats.totalAcreage)} Acres</strong>
          <small>Across Amritsar & Tarn Taran</small>
        </div>

        <div className="aw-metric blue">
          <div className="metric-top">
            <span>Forecast Production</span>
            <Package size={16} />
          </div>
          <strong>10,520 Tonnes</strong>
          <small>Combined Rabi harvest volume</small>
        </div>

        <div className="aw-metric gold">
          <div className="metric-top">
            <span>Collective Bulk Savings</span>
            <ShoppingCart size={16} />
          </div>
          <strong style={{ color: '#b45309' }}>{money(fpoStats.collectiveSavings)}</strong>
          <small>Bulk seed & fertilizer discount</small>
        </div>
      </div>

      {/* 2-Column Analytics Grid */}
      <div className="overview-grid" style={{ marginBottom: 24 }}>
        {/* Left: Crop Acreage Distribution */}
        <div className="premium-card">
          <div className="card-heading" style={{ marginBottom: 16 }}>
            <div>
              <h2>Cluster Crop Acreage Allocation (Acres)</h2>
              <p>Aggregated declarations across all 412 member farmers for Rabi season.</p>
            </div>
            <BarChart2 size={20} color="#2d6a4f" />
          </div>

          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fpoStats.crops} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="crop" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `${number(value)} acres`} />
                <Bar dataKey="acres" name="Collective Acres" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {fpoStats.crops.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Collective Procurement & Market Bargaining */}
        <div className="premium-card">
          <div className="card-heading" style={{ marginBottom: 16 }}>
            <div>
              <h2>FPO Collective Bargaining Hub</h2>
              <p>Coordinated market sales and bulk input procurement opportunities.</p>
            </div>
            <ShoppingCart size={20} color="#2d6a4f" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 12, background: '#f6f9f2', borderRadius: 8, border: '1px solid #e2ebd6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 13, color: '#1b4332' }}>Mustard Processing Mill Forward Contract</strong>
                <span className="badge-pill">High Opportunity</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#5e6f63' }}>
                Aggregating 520 tonnes of Mustard from 64 farmers enables negotiating direct delivery to local oil mill at ₹5,950/q (+₹300 over spot APMC rate).
              </p>
            </div>

            <div style={{ padding: 12, background: '#fdfbf5', borderRadius: 8, border: '1px solid #f6ecdc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 13, color: '#b45309' }}>Bulk DAP / Urea Co-op Society Procurement</strong>
                <span className="badge-pill badge-gold">₹8.4L Saved</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#695a43' }}>
                Consolidated order of 2,100 bags placed with IFFCO cooperative at institutional wholesale rebate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

