import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  Sprout, LayoutDashboard, Tractor, Sparkles, TrendingUp, 
  MapPin, SlidersHorizontal, Calendar, CloudSun, AudioLines, 
  FileText, CreditCard, MessageSquare, Settings, Users, 
  ShieldCheck, Globe, Menu, X, ArrowUpRight, Check, Info 
} from 'lucide-react';

import { apiRequest, post, ensureSession, readLocal, writeLocal, resetSession } from './services/api';
import { dictionary, languages } from './i18n';
import { Button, ErrorBox } from './components/Shared';

// Import Modern Pages
import Dashboard from './pages/Dashboard';
import MyFarm from './pages/MyFarm';
import CropAdvisor from './pages/CropAdvisor';
import MarketIntelligence from './pages/MarketIntelligence';
import RegionalInsights from './pages/RegionalInsights';
import CropPlanning from './pages/CropPlanning';
import HarvestPlanner from './pages/HarvestPlanner';
import WeatherAlerts from './pages/WeatherAlerts';
import AskAcreWise from './pages/AskAcreWise';
import MyReports from './pages/MyReports';
import Subscription from './pages/Subscription';
import Feedback from './pages/Feedback';
import SettingsProfile from './pages/SettingsProfile';
import FPODashboard from './pages/FPODashboard';
import AdminDashboard from './pages/AdminDashboard';

import './premium.css';
import './modern-theme.css';
import './futuristic-theme.css';

export const defaultFarm = {
  name: 'My Farm',
  farmer_name: '',
  district: 'Amritsar',
  state: 'Punjab',
  acres: 10,
  soil: 'loamy',
  season: 'rabi',
  budget: 180000,
  water: 12000
};

const initialRequest = { farm: defaultFarm, objective: 'balanced', max_share: 0.7 };

export default function App() {
  const [lang, setLang] = useState(() => {
    const x = readLocal('acrewise-language', 'en');
    return languages[x] ? x : 'en';
  });
  const t = dictionary[lang] || dictionary.en;

  const [farm, setFarm] = useState(defaultFarm);
  const [request, setRequest] = useState(initialRequest);
  const [result, setResult] = useState(null);
  const [health, setHealth] = useState(null);
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState(false);
  const [notice, setNotice] = useState('');
  const [menu, setMenu] = useState(false);
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);

  const location = useLocation();
  const go = useNavigate();
  const noticeTimer = useRef();

  const toast = text => {
    setNotice(text);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 4000);
  };

  useEffect(() => {
    writeLocal('acrewise-language', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    let live = true;
    setStatus('checking');
    setError('');
    setReady(false);

    (async () => {
      try {
        const h = await apiRequest('/health').catch(() => ({ status: 'local', storage_mode: 'local' }));
        const fresh = await ensureSession().catch(() => false);
        let f = await apiRequest('/api/farm').catch(() => defaultFarm);

        if (fresh) {
          const old = readLocal('acrewise-farm', null);
          if (old && Number(old.acres) > 0) {
            f = {
              ...defaultFarm,
              farmer_name: old.farmerName || '',
              name: old.name || 'My Farm',
              acres: Number(old.acres),
              district: old.district || 'Amritsar',
              state: old.state || 'Punjab',
              soil: ['loamy', 'alluvial', 'sandy', 'clay'].includes(old.soil?.toLowerCase()) ? old.soil.toLowerCase() : 'loamy'
            };
            await apiRequest('/api/farm', { method: 'PUT', body: JSON.stringify(f) }).catch(() => {});
          }
        }

        if (!live) return;
        setFarm(f);
        setHealth(h);
        setStatus('connected');
        setAuthError(false);

        const req = { ...initialRequest, farm: f };
        setRequest(req);
        setReady(true);

        try {
          const r = await post('/api/optimize', req);
          if (live) setResult(r);
        } catch (e) {
          if (live) {
            setResult(null);
            setError(e.message);
          }
        }
      } catch (e) {
        if (live) {
          setError(e.message);
          setStatus('disconnected');
          setAuthError(e.status === 401);
        }
      }
    })();

    return () => { live = false; };
  }, [version]);

  async function calculate(req) {
    setRequest(req);
    setResult(null);
    const r = await post('/api/optimize', req);
    setResult(r);
    setError('');
    return r;
  }

  const shared = { t, lang, request, setRequest, result, setResult, farm, setFarm, go, toast, calculate, ready, health };

  // Master 13 Navigation Items Categorized
  const navStructure = [
    {
      group: t.workspace,
      items: [
        { path: '/', key: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
        { path: '/farm', key: 'farm', label: t.farm, icon: Tractor },
      ]
    },
    {
      group: t.intelligence,
      items: [
        { path: '/advisor', key: 'advisor', label: t.advisor, icon: Sparkles, badge: 'AI' },
        { path: '/market', key: 'market', label: t.market, icon: TrendingUp },
        { path: '/regional', key: 'regional', label: t.regional, icon: MapPin, badge: 'Live' },
        { path: '/planning', key: 'planning', label: t.planning, icon: SlidersHorizontal },
        { path: '/harvest', key: 'harvest', label: t.harvest, icon: Calendar },
        { path: '/weather', key: 'weather', label: t.weather, icon: CloudSun },
      ]
    },
    {
      group: t.tools,
      items: [
        { path: '/ask', key: 'ask', label: t.ask, icon: AudioLines, badge: 'Voice' },
        { path: '/reports', key: 'reports', label: t.reports, icon: FileText },
        { path: '/subscription', key: 'subscription', label: t.subscription, icon: CreditCard },
        { path: '/feedback', key: 'feedback', label: t.feedback, icon: MessageSquare },
        { path: '/settings', key: 'settings', label: t.settings, icon: Settings },
      ]
    },
    {
      group: t.enterprise,
      items: [
        { path: '/fpo', key: 'fpo', label: t.fpo, icon: Users },
        { path: '/admin', key: 'admin', label: t.admin, icon: ShieldCheck },
      ]
    }
  ];

  return (
    <div className="aw-app">
      <a className="skip-link" href="#main">Skip to content</a>
      {menu && <button className="aw-scrim" onClick={() => setMenu(false)} aria-label="Close menu" />}

      {/* Modern Sidebar */}
      <aside className={`aw-sidebar ${menu ? 'open' : ''}`}>
        <NavLink to="/" className="aw-brand">
          <span className="brand-symbol"><Sprout size={25} /></span>
          <span>AcreWise<span className="brand-period">.</span><small>ROOTED IN POSSIBILITY</small></span>
        </NavLink>
        <button className="mobile-close-aw" aria-label="Close menu" onClick={() => setMenu(false)}><X /></button>

        <nav aria-label="Main Navigation">
          {navStructure.map((group, gIdx) => (
            <div key={gIdx}>
              <div className="nav-section-title">{group.group}</div>
              {group.items.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    end={item.path === '/'}
                    to={item.path}
                    className={({ isActive }) => `aw-nav ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {item.badge && <span className="nav-ai">{item.badge}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-grow" />

        {/* Season & Farm Summary Card */}
        <div className="sidebar-season" style={{ margin: '14px 0' }}>
          <div className="season-icon"><Sprout size={23} /></div>
          <span>{t[farm.season || 'rabi']} 2026–27</span>
          <small><MapPin size={12} />{farm.district || 'Amritsar'}, {farm.state || 'Punjab'}</small>
          <NavLink to="/farm">{t.farm} <ArrowUpRight size={15} /></NavLink>
        </div>

        <a className="classic-link" href="/classic.html">
          {t.classic} <ArrowUpRight size={13} />
        </a>

        {/* Profile Footer */}
        <div className="sidebar-profile">
          <div className="aw-avatar">
            {farm.farmer_name ? farm.farmer_name.slice(0, 2).toUpperCase() : 'AW'}
          </div>
          <div>
            <strong>{farm.farmer_name || 'AcreWise Farmer'}</strong>
            <span>{farm.name || 'My Farm'}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="aw-main">
        {/* Top Header */}
        <header className="aw-topbar">
          <div className="top-left">
            <button className="mobile-open-aw" aria-label="Open menu" onClick={() => setMenu(true)}>
              <Menu />
            </button>
            <span className="crumb">
              AcreWise Platform <span style={{ margin: '0 6px', color: '#cbd5c5' }}>/</span> 
              <strong>{location.pathname.replace('/', '').toUpperCase() || 'DASHBOARD'}</strong>
            </span>
          </div>

          <div className="top-right">
            <span className={`connection ${status}`}>
              <i />{t[status] || status}
            </span>

            {/* Language Selector */}
            <label className="language-select">
              <Globe size={16} />
              <select 
                aria-label="Language / भाषा / ਭਾਸ਼ਾ" 
                value={lang} 
                onChange={e => setLang(e.target.value)}
              >
                {Object.entries(languages).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </label>

            <NavLink to="/settings" className="aw-avatar small" title="Settings">
              {farm.farmer_name ? farm.farmer_name.slice(0, 2).toUpperCase() : 'AW'}
            </NavLink>
          </div>
        </header>

        {/* Content Body */}
        <main id="main" className="aw-content">
          {health?.storage_mode === 'ephemeral' && (
            <div className="warning-box">
              <Info size={16} />
              {t.storageNotice}
            </div>
          )}

          <ErrorBox error={error} />

          {status === 'disconnected' && (
            <div className="reconnect">
              <Button secondary onClick={() => setVersion(v => v + 1)}>{t.retry}</Button>
              {authError && (
                <Button secondary onClick={() => { resetSession(); setVersion(v => v + 1); }}>
                  {t.newSession}
                </Button>
              )}
            </div>
          )}

          {!ready && status === 'checking' ? (
            <div className="aw-loading">
              <Sprout className="pulse" size={36} color="#2d6a4f" />
              <span>{t.loading}</span>
            </div>
          ) : (
            <Routes>
              {/* Core 13 Navigation Routes */}
              <Route path="/" element={<Dashboard {...shared} />} />
              <Route path="/farm" element={<MyFarm {...shared} />} />
              <Route path="/advisor" element={<CropAdvisor {...shared} />} />
              <Route path="/market" element={<MarketIntelligence {...shared} />} />
              <Route path="/regional" element={<RegionalInsights {...shared} />} />
              <Route path="/planning" element={<CropPlanning {...shared} />} />
              <Route path="/harvest" element={<HarvestPlanner {...shared} />} />
              <Route path="/weather" element={<WeatherAlerts {...shared} />} />
              <Route path="/ask" element={<AskAcreWise {...shared} />} />
              <Route path="/reports" element={<MyReports {...shared} />} />
              <Route path="/subscription" element={<Subscription {...shared} />} />
              <Route path="/feedback" element={<Feedback {...shared} />} />
              <Route path="/settings" element={<SettingsProfile {...shared} setLang={setLang} />} />

              {/* Organization & Admin Portals */}
              <Route path="/fpo" element={<FPODashboard {...shared} />} />
              <Route path="/admin" element={<AdminDashboard {...shared} />} />

              {/* Backward Compatibility Aliases */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/optimizer" element={<Navigate to="/planning" replace />} />
              <Route path="/simulator" element={<Navigate to="/planning" replace />} />
              <Route path="/plans" element={<Navigate to="/planning" replace />} />
              <Route path="/crops" element={<Navigate to="/planning" replace />} />
              <Route path="/assistant" element={<Navigate to="/ask" replace />} />
              <Route path="/recommendations" element={<Navigate to="/advisor" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>

        {/* Global Footer */}
        <footer className="aw-footer">
          <span>
            <Sprout size={15} color="#2d6a4f" />
            {t.foot}
          </span>
          <span>
            <i />
            AcreWise 2.0 · The Right Crop for Every Acre.
          </span>
        </footer>
      </div>

      {notice && (
        <div className="aw-toast" role="status">
          <Check size={18} />
          {notice}
        </div>
      )}
    </div>
  );
}
