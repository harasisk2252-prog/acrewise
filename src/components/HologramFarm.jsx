import React, { useState } from 'react';
import { Droplets, TrendingUp, ScanLine, Sparkles } from 'lucide-react';
import { money, number } from './Shared';

const palette = ['cyan', 'violet', 'lime', 'blue'];

export default function HologramFarm({ farm, result, calculate }) {
  const [selected, setSelected] = useState(0);
  const [preset, setPreset] = useState('balanced');
  const allocations = result?.allocations?.length ? result.allocations : [
    { crop: 'Wheat', acres: (farm.acres || 10) * .55, share: 55, profit: (farm.acres || 10) * .55 * 26362, water: (farm.acres || 10) * .55 * 1800 },
    { crop: 'Mustard', acres: (farm.acres || 10) * .3, share: 30, profit: (farm.acres || 10) * .3 * 27880, water: (farm.acres || 10) * .3 * 900 },
    { crop: 'Chickpea', acres: (farm.acres || 10) * .15, share: 15, profit: (farm.acres || 10) * .15 * 20352, water: (farm.acres || 10) * .15 * 700 }
  ];
  const active = allocations[selected] || allocations[0];

  async function changePreset(next) {
    setPreset(next);
    setSelected(0);
    if (calculate) await calculate({ farm, objective: next, max_share: next === 'profit' ? .9 : .7 });
  }

  return <section className="holo-card" aria-label="Interactive farm digital twin">
    <div className="holo-scan" />
    <div className="holo-head">
      <div>
        <span className="holo-eyebrow"><i /> DIGITAL TWIN ONLINE · {number(farm.acres || 10)} ACRES</span>
        <h2><Sparkles size={19} /> Your living farm model</h2>
        <p>Tap a field to see live allocation, water draw, and projected margin.</p>
      </div>
      <div className="holo-presets" aria-label="Optimization preference">
        {[['balanced', 'Balanced'], ['profit', 'Profit'], ['water', 'Save water']].map(([key, label]) =>
          <button key={key} type="button" className={preset === key ? 'selected' : ''} onClick={() => changePreset(key)}>{label}</button>
        )}
      </div>
    </div>

    <div className="holo-stage">
      <div className="holo-orbit orbit-one" /><div className="holo-orbit orbit-two" />
      <div className="holo-field">
        {allocations.slice(0, 4).map((plot, index) => <button
          type="button" key={`${plot.crop}-${index}`} className={`holo-plot ${palette[index % palette.length]} ${selected === index ? 'active' : ''}`}
          onClick={() => setSelected(index)}
        >
          <span className="plot-id">PLOT {String.fromCharCode(65 + index)}</span>
          <strong>{plot.crop}</strong>
          <small>{number(plot.acres)} ac · {Math.round(plot.share)}%</small>
        </button>)}
      </div>
      <div className="holo-coordinate">31.6340° N · 74.8723° E</div>
    </div>

    <div className="holo-inspector">
      <span className="inspector-label"><ScanLine size={16} /> ANALYSING PLOT {String.fromCharCode(65 + selected)}</span>
      <strong>{active.crop} <small>{number(active.acres)} acres</small></strong>
      <span><Droplets size={15} /> {number(active.water)} m³ water</span>
      <span className="profit"><TrendingUp size={15} /> {money(active.profit)} margin</span>
    </div>
  </section>;
}
