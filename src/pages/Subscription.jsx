import React, { useState } from 'react';
import { Check, Sparkles, Shield, Users, ArrowRight, HelpCircle } from 'lucide-react';

export default function Subscription({ t, toast }) {
  const [billingCycle, setBillingCycle] = useState('seasonal'); // 'seasonal' | 'annual'

  function handleSubscribe(tierName) {
    toast(`Tier "${tierName}" selected in demo mode. No real payment processing is initiated.`);
  }

  const plans = [
    {
      id: 'free',
      name: 'Free Demo Farmer',
      badge: 'CURRENT ACTIVE TIER',
      tagline: 'Basic farm planning and local guide for individual family holdings.',
      priceSeasonal: '₹0',
      priceAnnual: '₹0',
      period: 'forever free',
      highlighted: false,
      features: [
        'Single farm profile & 2 field parcels',
        'SciPy HiGHS mathematical crop mix optimizer',
        'What-if scenario simulator (±90% bounds)',
        'Local rule-based farming guide in 3 languages',
        'Standard APMC Mandi daily rate benchmarks',
        'Browser-local anonymous workspace persistence'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Farmer Plan',
      badge: 'MOST POPULAR',
      tagline: 'Precision agronomic optimization, competitor sowing alerts and voice AI.',
      priceSeasonal: '₹499',
      priceAnnual: '₹899',
      period: billingCycle === 'seasonal' ? 'per season' : 'per year',
      highlighted: true,
      features: [
        'Everything in Free Plan, plus:',
        'Unlimited multi-field parcels & soil test calibrations',
        'Regional Sowing-Intention Alerts (Detect gluts early)',
        'Full Google Gemini AI Voice Assistant in Punjabi & Hindi',
        '7-day agro-meteorological spray window forecast',
        'Bilingual SMS disaster & market opportunity alerts',
        'Exportable bank-ready Agricultural Decision Dossiers (PDF)'
      ]
    },
    {
      id: 'fpo',
      name: 'FPO & Enterprise Hub',
      badge: 'FOR COOPERATIVES',
      tagline: 'Aggregated regional intelligence and collective purchasing for FPOs and advisors.',
      priceSeasonal: '₹4,999',
      priceAnnual: '₹8,999',
      period: billingCycle === 'seasonal' ? 'per season' : 'per year',
      highlighted: false,
      features: [
        'Everything in Pro Farmer, plus:',
        'Cluster management for up to 500 member farmers',
        'Aggregated village-level sowing intentions & yield forecasts',
        'Collective bulk input procurement savings calculator',
        'Centralized mandi price bargaining insights',
        'Dedicated agronomist dashboard & exportable batch reports',
        'Custom SMS broadcast to farmer member groups'
      ]
    }
  ];

  return (
    <div className="page-container">
      {/* Title */}
      <div className="aw-title" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
        <span className="overline">TRANSPARENT AGRITECH PRICING</span>
        <h1 style={{ fontSize: 32 }}>Transparent Plans for Every Agricultural Acre</h1>
        <p style={{ maxWidth: 600, margin: '0 auto' }}>
          From smallholder individual farmers to regional Farmer Producer Organizations (FPOs). Simple, honest subscriptions designed to pay for themselves in seed and fertilizer savings.
        </p>

        {/* Billing Toggle */}
        <div style={{ 
          display: 'inline-flex', 
          background: '#e9eedf', 
          padding: 4, 
          borderRadius: 30, 
          marginTop: 20 
        }}>
          <button
            onClick={() => setBillingCycle('seasonal')}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: billingCycle === 'seasonal' ? '#1b4332' : 'transparent',
              color: billingCycle === 'seasonal' ? '#ffffff' : '#4f6354',
              transition: 'all 0.15s'
            }}
          >
            Seasonal Billing (Rabi / Kharif)
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: billingCycle === 'annual' ? '#1b4332' : 'transparent',
              color: billingCycle === 'annual' ? '#ffffff' : '#4f6354',
              transition: 'all 0.15s'
            }}
          >
            Annual (Save 25%)
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid-3" style={{ alignItems: 'stretch', marginBottom: 36 }}>
        {plans.map(plan => (
          <div 
            key={plan.id}
            className="premium-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              border: plan.highlighted ? '2px solid #2d6a4f' : '1px solid #e3e9db',
              background: plan.highlighted ? '#fcfdfb' : '#ffffff',
              boxShadow: plan.highlighted ? '0 12px 30px rgba(27,67,50,0.12)' : 'none'
            }}
          >
            {plan.highlighted && (
              <span style={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#1b4332',
                color: '#ffffff',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1,
                padding: '4px 12px',
                borderRadius: 20
              }}>
                {plan.badge}
              </span>
            )}

            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 20, margin: '4px 0', color: '#1b4332' }}>{plan.name}</h3>
              <p style={{ fontSize: 11, color: '#68786a', minHeight: 34 }}>{plan.tagline}</p>
            </div>

            <div style={{ margin: '14px 0 20px', borderBottom: '1px solid #edf1e6', paddingBottom: 16 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: '#1b4332', letterSpacing: -1 }}>
                {billingCycle === 'seasonal' ? plan.priceSeasonal : plan.priceAnnual}
              </span>
              <span style={{ fontSize: 11, color: '#88988b', marginLeft: 6 }}>
                / {plan.period}
              </span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
              {plan.features.map((feat, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#3d4f42', marginBottom: 10 }}>
                  <Check size={16} color="#2d6a4f" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <button 
              className={plan.highlighted ? 'btn-primary' : 'btn-outline'} 
              style={{ width: '100%', justifyContent: 'center', padding: 12 }}
              onClick={() => handleSubscribe(plan.name)}
            >
              {plan.id === 'free' ? 'Active Demo Workspace' : 'Select Plan (Demo)'}
            </button>
          </div>
        ))}
      </div>

      {/* Trust & Ethics Banner */}
      <div style={{ textAlign: 'center', color: '#7a8c7c', fontSize: 11 }}>
        🔒 <b>Demo Notice:</b> Payment gateways are strictly mocked in test mode. No actual debit occurs.
      </div>
    </div>
  );
}

