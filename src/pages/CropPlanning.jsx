import React, { useState } from 'react';
import { 
  SlidersHorizontal, ChartNoAxesCombined, Bookmark, 
  Wheat, Sparkles, Check, Info, RotateCcw, Save, Trash2, ArrowRight, ArrowUpRight 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { post, apiRequest } from '../services/api';
import { dictionary, cropName } from '../i18n';
import { Button, Title, ErrorBox, Field, Assumptions, Mix, Resources, AllocationTable, FarmFields, money, number } from '../components/Shared';

export default function CropPlanning({ t, lang, request, result, calculate, toast, ready, farm, go }) {
  const [activeTab, setActiveTab] = useState('optimizer'); // 'optimizer' | 'simulator' | 'plans' | 'library'

  return (
    <div className="page-container">
      {/* Title */}
      <div className="aw-title" style={{ marginBottom: 20 }}>
        <div>
          <span className="overline">MATHEMATICAL LINEAR PROGRAMMING (SCIPY HIGHS)</span>
          <h1>Crop Mix Optimizer & What-If Simulator</h1>
          <p>
            Constrained optimization engine solving land allocation, water quotas, budget limits and maximum crop diversification caps.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="crop-tabs" style={{ marginBottom: 20 }}>
        <button className={activeTab === 'optimizer' ? 'selected' : ''} onClick={() => setActiveTab('optimizer')}>
          <SlidersHorizontal size={14} style={{ display: 'inline', marginRight: 6 }} />
          Crop Mix Optimizer
        </button>
        <button className={activeTab === 'simulator' ? 'selected' : ''} onClick={() => setActiveTab('simulator')}>
          <ChartNoAxesCombined size={14} style={{ display: 'inline', marginRight: 6 }} />
          What-If Stress Simulator
        </button>
        <button className={activeTab === 'plans' ? 'selected' : ''} onClick={() => setActiveTab('plans')}>
          <Bookmark size={14} style={{ display: 'inline', marginRight: 6 }} />
          Saved Farm Plans
        </button>
        <button className={activeTab === 'library' ? 'selected' : ''} onClick={() => setActiveTab('library')}>
          <Wheat size={14} style={{ display: 'inline', marginRight: 6 }} />
          Agronomic Assumptions Library
        </button>
      </div>

      {activeTab === 'optimizer' && (
        <OptimizerSubView 
          t={t} 
          lang={lang} 
          request={request} 
          result={result} 
          calculate={calculate} 
          toast={toast} 
          ready={ready} 
        />
      )}

      {activeTab === 'simulator' && (
        <SimulatorSubView 
          t={t} 
          lang={lang} 
          request={request} 
          ready={ready} 
        />
      )}

      {activeTab === 'plans' && (
        <PlansSubView 
          t={t} 
          lang={lang} 
          ready={ready} 
          go={go} 
          toast={toast} 
        />
      )}

      {activeTab === 'library' && (
        <LibrarySubView 
          t={t} 
          lang={lang} 
        />
      )}
    </div>
  );
}

function OptimizerSubView({ t, lang, request, result, calculate, toast, ready }) {
  const [draft, setDraft] = useState(request);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [planName, setPlanName] = useState('');

  const dirty = JSON.stringify(draft) !== JSON.stringify(request);
  const visible = dirty ? null : result;

  async function run(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await calculate(draft);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await post('/api/plans', {
        name: planName.trim() || `${draft.farm.name} · ${t[draft.farm.season]}`,
        optimization: request
      });
      toast(t.saved);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="planner-layout">
      <form className="aw-card planner-controls" onSubmit={run}>
        <div className="card-heading">
          <h2>{t.farmInputs}</h2>
          <SlidersHorizontal size={19} />
        </div>
        <FarmFields farm={draft.farm} setFarm={f => setDraft({ ...draft, farm: f })} t={t} disabled={busy} />
        <Field label={t.objective}>
          <select disabled={busy} value={draft.objective} onChange={e => setDraft({ ...draft, objective: e.target.value })}>
            <option value="balanced">{t.balanced}</option>
            <option value="profit">{t.profitObjective}</option>
            <option value="water">{t.waterObjective}</option>
          </select>
        </Field>
        <label className="range-field">
          <span>{t.maxShare}<b>{Math.round(draft.max_share * 100)}%</b></span>
          <input 
            disabled={busy} 
            aria-label={t.maxShare} 
            type="range" 
            min="20" 
            max="100" 
            step="5" 
            value={draft.max_share * 100} 
            onChange={e => setDraft({ ...draft, max_share: Number(e.target.value) / 100 })} 
          />
          <small>20%<span>100%</span></small>
        </label>
        <Button className="full" disabled={busy || !ready}>
          {busy ? t.optimizing : t.optimize}
          <Sparkles size={17} />
        </Button>
      </form>

      <div className="planner-results">
        <ErrorBox error={error} />
        <Mix result={visible} t={t} lang={lang} />
        {visible && (
          <>
            <div className="result-summary">
              <div>
                <span>{t.profit}</span>
                <strong>{money(visible.totals.profit)}</strong>
                <small>{t.profitNote}</small>
              </div>
              <span className="feasible-badge"><Check size={14} />{t.feasible}</span>
            </div>
            <section className="aw-card">
              <div className="card-heading">
                <h2>{t.why}</h2>
              </div>
              <p className="explain-line">{t.rules}</p>
              <AllocationTable result={visible} t={t} lang={lang} />
              <form className="save-plan-form" onSubmit={save}>
                <input 
                  aria-label={t.planName} 
                  placeholder={t.planName} 
                  maxLength={120} 
                  value={planName} 
                  onChange={e => setPlanName(e.target.value)} 
                />
                <Button disabled={saving}>
                  <Save size={16} />
                  {t.save}
                </Button>
              </form>
            </section>
            <Resources result={visible} farm={request.farm} t={t} />
          </>
        )}
        <Assumptions t={t} />
      </div>
    </div>
  );
}

const zeroScenario = { price_pct: 0, yield_pct: 0, cost_pct: 0, water_pct: 0 };
function SimulatorSubView({ t, lang, request, ready }) {
  const [scenario, setScenario] = useState(zeroScenario);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  React.useEffect(() => {
    if (ready) apiRequest('/api/simulations').then(setHistory).catch(e => setError(e.message));
  }, [ready]);

  async function run(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await post('/api/simulate', { optimization: request, scenario });
      setResult(res);
      setHistory(h => [{ id: res.id, created_at: new Date().toISOString(), request: { optimization: request, scenario }, result: res }, ...h].slice(0, 50));
    } catch (e) {
      setResult(null);
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const chart = result ? [
    { name: t.baseline, value: result.baseline.totals.profit, color: '#b9c9a8' },
    { name: t.fixed, value: result.fixed_plan.totals.profit, color: '#d7b86d' },
    ...(result.optimized_plan ? [{ name: t.revised, value: result.optimized_plan.totals.profit, color: '#286345' }] : [])
  ] : [];

  return (
    <div className="planner-layout">
      <div>
        <form className="aw-card simulator-controls" onSubmit={run}>
          <div className="card-heading">
            <h2>{t.changes}</h2>
            <ChartNoAxesCombined size={19} />
          </div>
          {[['price_pct', 'price'], ['yield_pct', 'yield'], ['cost_pct', 'cost'], ['water_pct', 'waterChange']].map(([key, label]) => (
            <label className="range-field scenario-range" key={key}>
              <span>{t[label]}<b className={scenario[key] < 0 ? 'negative' : ''}>{scenario[key] > 0 ? '+' : ''}{scenario[key]}%</b></span>
              <input 
                aria-label={t[label]} 
                disabled={busy} 
                type="range" 
                min="-90" 
                max="100" 
                step="5" 
                value={scenario[key]} 
                onChange={e => {
                  setScenario({ ...scenario, [key]: Number(e.target.value) });
                  setResult(null);
                }} 
              />
              <small>−90%<span>+100%</span></small>
            </label>
          ))}
          <Button className="full" disabled={busy || !ready}>
            {busy ? t.optimizing : t.run}
            <ArrowRight size={16} />
          </Button>
          <button type="button" className="aw-text-button reset-button" disabled={busy} onClick={() => { setScenario(zeroScenario); setResult(null); }}>
            <RotateCcw size={14} />{t.reset}
          </button>
        </form>
        <div className="sim-note">
          <Info size={16} />
          <p>{t.fixedNote}</p>
        </div>
      </div>

      <div className="planner-results">
        <ErrorBox error={error} />
        {result ? (
          <>
            <div className="sim-stats">
              {[[t.baseline, result.baseline.totals.profit], [t.fixed, result.fixed_plan.totals.profit], [t.revised, result.optimized_plan?.totals.profit]].map(([label, value]) => (
                <div className="aw-card" key={label}>
                  <span>{label}</span>
                  <strong>{value == null ? '—' : money(value)}</strong>
                </div>
              ))}
            </div>
            {!result.fixed_plan.feasible && (
              <div className="warning-box">
                <Info size={18} />{t.conditional} ({result.fixed_plan.violations.map(k => t[k]).join(', ')})
              </div>
            )}
            <section className="aw-card">
              <div className="card-heading">
                <div>
                  <h2>{t.change}</h2>
                  <p>{money(result.profit_change)}</p>
                </div>
                <span className="demo-pill">{t.demo}</span>
              </div>
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={chart} margin={{ left: 8, right: 8, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e7e9e1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => `${v / 1000}k`} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => money(v)} />
                  <Bar dataKey="value" name={t.profit} radius={[6, 6, 0, 0]} maxBarSize={80}>
                    {chart.map(r => <Cell key={r.name} fill={r.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>
            {result.optimized_plan ? (
              <Mix result={result.optimized_plan} t={{ ...t, mix: t.revised }} lang={lang} />
            ) : (
              <div className="warning-box">
                <Info size={18} />{t.infeasible}
                <p>{result.infeasibility_reason}</p>
              </div>
            )}
          </>
        ) : (
          <div className="aw-card simulator-empty">
            <ChartNoAxesCombined size={50} />
            <h2>{t.next}</h2>
            <p>{t.simSub}</p>
            <span>−20% <ArrowRight size={24} /> ?</span>
          </div>
        )}
        <section className="aw-card">
          <div className="card-heading">
            <h2>{t.history}</h2>
            <span className="count-badge">{history.length}</span>
          </div>
          {history.length ? history.slice(0, 5).map(h => (
            <button className="history-row" key={h.id} onClick={() => { setScenario(h.request.scenario); setResult(h.result); }}>
              <div>
                <strong>{new Date(h.created_at.endsWith('Z') ? h.created_at : `${h.created_at}Z`).toLocaleDateString()}</strong>
                <span>{t.price}: {h.request.scenario.price_pct}% · {t.water}: {h.request.scenario.water_pct}%</span>
              </div>
              <b>{money(h.result.profit_change)}</b>
            </button>
          )) : (
            <p className="muted-copy">{t.noHistory}</p>
          )}
        </section>
        <Assumptions t={t} />
      </div>
    </div>
  );
}

function PlansSubView({ t, lang, ready, go, toast }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!ready) { setLoading(false); return; }
    apiRequest('/api/plans').then(setPlans).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [ready]);

  return (
    <div>
      <ErrorBox error={error} />
      {loading ? <p>{t.loading}</p> : plans.length ? (
        <div className="saved-grid">
          {plans.map(p => (
            <section className="aw-card saved-plan-card" key={p.id}>
              <h2>{p.name}</h2>
              <p>{number(p.result.acres)} {t.acres} · {p.optimization.farm.district}</p>
              <div className="allocation-strip">
                {p.result.allocations.map(r => (
                  <span key={r.crop} style={{ width: `${r.share}%`, background: r.color }} />
                ))}
              </div>
              <div className="saved-profit">
                <span>{t.profit}</span>
                <strong>{money(p.result.totals.profit)}</strong>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="aw-card aw-empty">
          <Bookmark size={38} />
          <h2>{t.noPlans}</h2>
          <p>{t.noPlansBody}</p>
        </div>
      )}
    </div>
  );
}

function LibrarySubView({ t, lang }) {
  const [crops, setCrops] = useState([]);
  React.useEffect(() => {
    apiRequest('/api/crops').then(r => setCrops(r.items)).catch(() => {});
  }, []);

  return (
    <div className="crop-library">
      {crops.map(c => (
        <article className="aw-card library-card" key={c.name}>
          <div className="library-content">
            <h2>{cropName(c.name, lang)}</h2>
            <dl>
              <div><dt>{t.yield}</dt><dd>{c.yield} q/acre</dd></div>
              <div><dt>{t.price}</dt><dd>{money(c.price)}/q</dd></div>
              <div><dt>{t.cost}</dt><dd>{money(c.cost)}/acre</dd></div>
              <div><dt>{t.water}</dt><dd>{number(c.water)} m³/acre</dd></div>
            </dl>
          </div>
        </article>
      ))}
    </div>
  );
}

