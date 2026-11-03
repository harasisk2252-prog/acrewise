import React, { useEffect, useState } from 'react';
import { 
  Bell, Smartphone, ShieldCheck, Globe, Key, Trash2, 
  RotateCcw, CheckCircle2, AlertTriangle, Send 
} from 'lucide-react';
import { apiRequest, post, resetSession } from '../services/api';

export default function SettingsProfile({ t, lang, setLang, toast }) {
  const [phone, setPhone] = useState(localStorage.getItem('acrewise-sms-phone') || '9876543210');
  const [smsConsent, setSmsConsent] = useState(localStorage.getItem('acrewise-sms-consent') === 'true');
  const [smsLang, setSmsLang] = useState(localStorage.getItem('acrewise-sms-lang') || lang || 'pa');
  const [categories, setCategories] = useState({
    weather: true,
    oversupply: true,
    market: true,
    harvest: false
  });
  const [lastDispatchedPreview, setLastDispatchedPreview] = useState(null);
  const [history, setHistory] = useState([]);
  const [smsBusy, setSmsBusy] = useState(false);

  useEffect(() => {
    apiRequest('/api/notifications/preferences').then(p => {
      if (p.phone_masked) setPhone(localStorage.getItem('acrewise-sms-phone') || '');
      setSmsConsent(Boolean(p.consent)); setSmsLang(p.language || lang || 'pa');
      if (Object.keys(p.categories || {}).length) setCategories(prev => ({ ...prev, ...p.categories }));
    }).catch(() => {});
    apiRequest('/api/notifications/history').then(setHistory).catch(() => {});
  }, []);

  async function handleSaveSms(e) {
    e.preventDefault();
    setSmsBusy(true);
    try {
      await apiRequest('/api/notifications/preferences', { method: 'PUT', body: JSON.stringify({ phone, consent: smsConsent, language: smsLang, categories }) });
      localStorage.setItem('acrewise-sms-phone', phone); localStorage.setItem('acrewise-sms-consent', String(smsConsent)); localStorage.setItem('acrewise-sms-lang', smsLang);
      toast('SMS consent and alert preferences saved.');
    } catch (error) { toast(error.message); } finally { setSmsBusy(false); }
  }

  async function handleSendTestSms() {
    if (!phone) {
      toast('Please enter a valid mobile number.');
      return;
    }

    if (!smsConsent) { toast('Please save SMS consent before sending a test alert.'); return; }
    setSmsBusy(true);
    try {
      const sent = await post('/api/notifications/sms', { phone, category: 'oversupply', language: smsLang });
      setLastDispatchedPreview({ phone: sent.phone_masked, text: sent.message, timestamp: new Date().toLocaleTimeString(), status: sent.status, note: sent.note });
      setHistory(rows => [{ ...sent, phone: sent.phone_masked, sent_at: new Date().toISOString() }, ...rows]);
      toast(sent.status === 'accepted_by_twilio' ? 'SMS accepted by provider.' : 'Test alert recorded. Configure Twilio to send SMS.');
    } catch (error) { toast(error.message); } finally { setSmsBusy(false); }
  }

  return (
    <div className="page-container" style={{ maxWidth: 880 }}>
      {/* Title */}
      <div className="aw-title" style={{ marginBottom: 20 }}>
        <div>
          <span className="overline">PREFERENCES & ACCESS</span>
          <h1>Profile, SMS Alerts & System Settings</h1>
          <p>Configure multilingual SMS notifications, alert categories, language interface, and anonymous workspace tokens.</p>
        </div>
      </div>

      {/* Section 1: SMS Notification System (Part 6) */}
      <div className="premium-card" style={{ marginBottom: 24 }}>
        <div className="card-heading" style={{ marginBottom: 16 }}>
          <div>
            <h2>SMS Advisory & Disaster Alerts Configuration</h2>
            <p>Receive critical alerts even when offline, delivered in Punjabi, Hindi or English.</p>
          </div>
          <Smartphone size={22} color="#2d6a4f" />
        </div>

        <form onSubmit={handleSaveSms} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="grid-2">
            <div className="aw-field">
              <label>Farmer Mobile Number (10 Digits)</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="e.g. 9876543210" 
              />
            </div>

            <div className="aw-field">
              <label>SMS Language Preference</label>
              <select value={smsLang} onChange={e => setSmsLang(e.target.value)}>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi Gurmukhi)</option>
                <option value="hi">हिन्दी (Hindi Devanagari)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#1b4332', display: 'block', marginBottom: 10 }}>
              Alert Notification Categories:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#3d4f42' }}>
                <input 
                  type="checkbox" 
                  checked={categories.weather} 
                  onChange={e => setCategories({ ...categories, weather: e.target.checked })} 
                />
                Severe Weather & Hail Warnings
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#3d4f42' }}>
                <input 
                  type="checkbox" 
                  checked={categories.oversupply} 
                  onChange={e => setCategories({ ...categories, oversupply: e.target.checked })} 
                />
                Regional Sowing Oversupply Alerts
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#3d4f42' }}>
                <input 
                  type="checkbox" 
                  checked={categories.market} 
                  onChange={e => setCategories({ ...categories, market: e.target.checked })} 
                />
                APMC Mandi Price Spikes (&gt; 5% above MSP)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#3d4f42' }}>
                <input 
                  type="checkbox" 
                  checked={categories.harvest} 
                  onChange={e => setCategories({ ...categories, harvest: e.target.checked })} 
                />
                Harvest Maturity Reminders
              </label>
            </div>
          </div>

          <div style={{ background: '#f5f8f1', padding: 12, borderRadius: 8, border: '1px solid #e1e9d8' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 11, color: '#46594a', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={smsConsent} 
                onChange={e => setSmsConsent(e.target.checked)} 
                style={{ marginTop: 2 }}
              />
              <span>
                <b>Farmer Consent:</b> I agree to receive non-promotional agricultural advisories from AcreWise. No marketing or spam will ever be transmitted.
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn-primary" disabled={smsBusy}>
              {smsBusy ? 'Saving…' : 'Save SMS Preferences'}
            </button>
            <button type="button" className="btn-outline" disabled={smsBusy} onClick={handleSendTestSms}>
              <Send size={14} /> Send Sample Test SMS
            </button>
          </div>
        </form>

        {lastDispatchedPreview && (
          <div style={{ marginTop: 18, padding: 14, background: '#fbfcf8', border: '1px solid #dbe2d4', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7a8c7c', marginBottom: 6 }}>
              <span>Gateway status: <b>{lastDispatchedPreview.status}</b></span>
              <span>{lastDispatchedPreview.timestamp}</span>
            </div>
            <div style={{ 
              background: '#ffffff', 
              padding: 12, 
              borderRadius: 6, 
              borderLeft: '4px solid #2d6a4f', 
              fontSize: 12, 
              fontFamily: 'monospace',
              color: '#1b4332'
            }}>
              To: {lastDispatchedPreview.phone}<br />
              Message: {lastDispatchedPreview.text}
            </div>
            <small style={{ display: 'block', marginTop: 8 }}>{lastDispatchedPreview.note}</small>
          </div>
        )}

        <div style={{ marginTop: 20, borderTop: '1px solid #dbe2d4', paddingTop: 16 }}>
          <strong style={{ fontSize: 12 }}>Alert history</strong>
          {history.length ? history.slice(0, 5).map(item => <div key={item.id} style={{ marginTop: 8, fontSize: 11 }}><b>{item.category}</b> · {item.status} · {new Date(item.sent_at).toLocaleString()}</div>) : <p style={{ fontSize: 11 }}>No alert has been sent or recorded yet.</p>}
        </div>
      </div>

      {/* Section 2: Workspace & Session Tokens */}
      <div className="premium-card">
        <div className="card-heading" style={{ marginBottom: 16 }}>
          <div>
            <h2>Workspace Privacy & Session Token</h2>
            <p>Your farm data is protected by an anonymous bearer token stored locally in your browser.</p>
          </div>
          <Key size={20} color="#2d6a4f" />
        </div>

        <p style={{ fontSize: 12, color: '#68786a', margin: '0 0 16px', lineHeight: 1.6 }}>
          If you are on a shared computer and wish to clear your anonymous workspace, or start a new farm session, you can reset your session key below.
        </p>

        <button 
          className="btn-outline" 
          style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
          onClick={() => {
            if (window.confirm('Are you sure you want to start a fresh workspace? This will clear browser session tokens.')) {
              resetSession();
              window.location.reload();
            }
          }}
        >
          <RotateCcw size={15} /> Reset Local Workspace Session
        </button>
      </div>
    </div>
  );
}

