from fastapi import HTTPException
from scipy.optimize import linprog
from app.schemas import OptimizeRequest, Scenario
from app.services.catalog import CROPS, ASSUMPTIONS, DATA_VERSION

def eligible(req):
    if req.crops and any(c not in CROPS for c in req.crops):
        raise HTTPException(422, 'Unknown crop selected.')
    return [(name, d) for name, d in CROPS.items() if req.farm.season in d['seasons'] and req.farm.soil in d['soils'] and (req.crops is None or name in req.crops)]

def coefficients(d, scenario):
    revenue = d['yield'] * (1 + scenario.yield_pct / 100) * d['price'] * (1 + scenario.price_pct / 100)
    cost = d['cost'] * (1 + scenario.cost_pct / 100)
    return revenue, cost

def totals(allocations):
    return {k: round(sum(x[k] for x in allocations), 2) for k in ['revenue', 'cost', 'profit', 'water']}

def optimize(req: OptimizeRequest, scenario: Scenario | None = None):
    scenario = scenario or Scenario()
    candidates = eligible(req)
    if not candidates:
        raise HTTPException(422, 'No crops match this soil, season and selection. Change the farm conditions or selected crops.')
    rows = []
    for name, d in candidates:
        revenue, cost = coefficients(d, scenario)
        profit = revenue - cost
        score = profit if req.objective == 'profit' else profit - revenue * d['risk'] if req.objective == 'balanced' else -d['water']
        rows.append((name, d, revenue, cost, score))
    water_limit = req.farm.water * (1 + scenario.water_pct / 100)
    result = linprog([-r[4] for r in rows], A_ub=[[r[3] for r in rows], [r[1]['water'] for r in rows]], b_ub=[req.farm.budget, water_limit], A_eq=[[1.] * len(rows)], b_eq=[req.farm.acres], bounds=[(0, req.farm.acres * req.max_share)] * len(rows), method='highs')
    if not result.success:
        raise HTTPException(422, 'No feasible full-farm plan. Increase the budget or water allowance, increase the maximum crop share, or reduce acreage. No constraints were relaxed.')
    allocations = []
    for area, (name, d, revenue, cost, _) in zip(result.x, rows):
        if area < 1e-8:
            continue
        allocations.append({'crop': name, 'acres': float(area), 'share': float(area / req.farm.acres * 100), 'revenue': float(revenue * area), 'cost': float(cost * area), 'profit': float((revenue - cost) * area), 'water': float(d['water'] * area), 'color': d['color'], 'yield_per_acre': d['yield'] * (1 + scenario.yield_pct / 100), 'price': d['price'] * (1 + scenario.price_pct / 100), 'risk': d['risk']})
    summary = totals(allocations)
    return {'allocations': allocations, 'totals': summary, 'remaining_budget': round(req.farm.budget - summary['cost'], 2), 'remaining_water': round(water_limit - summary['water'], 2), 'water_limit': water_limit, 'acres': req.farm.acres, 'objective': req.objective, 'data_version': DATA_VERSION, 'assumptions': ASSUMPTIONS, 'method': 'SciPy HiGHS linear programming', 'explanation': [f"Allocated {req.farm.acres:g} acres across {len(allocations)} crops that match {req.farm.soil} soil and {req.farm.season} season.", f"Estimated cost ₹{summary['cost']:,.0f} stays within your ₹{req.farm.budget:,.0f} budget; irrigation uses {summary['water']:,.0f} of {water_limit:,.0f} m³.", f"No crop exceeds {req.max_share * 100:g}% of land. Objective: {req.objective}."], 'feasible': True}

def simulate(req):
    baseline = optimize(req.optimization)
    changed = []
    for row in baseline['allocations']:
        revenue, cost = coefficients(CROPS[row['crop']], req.scenario)
        changed.append({**row, 'revenue': revenue * row['acres'], 'cost': cost * row['acres'], 'profit': (revenue-cost) * row['acres']})
    fixed = totals(changed)
    water_limit = req.optimization.farm.water * (1 + req.scenario.water_pct / 100)
    violations = []
    if fixed['water'] > water_limit + .01:
        violations.append('water')
    if fixed['cost'] > req.optimization.farm.budget + .01:
        violations.append('budget')
    try:
        replanned = optimize(req.optimization, req.scenario)
        reason = None
    except HTTPException as exc:
        if exc.status_code != 422:
            raise
        replanned, reason = None, exc.detail
    return {'baseline': baseline, 'fixed_plan': {'totals': fixed, 'violations': violations, 'feasible': not violations, 'profit_is_conditional': bool(violations)}, 'optimized_plan': replanned, 'infeasibility_reason': reason, 'profit_change': round(fixed['profit'] - baseline['totals']['profit'], 2), 'scenario': req.scenario.model_dump(), 'note': 'Price, yield and cost changes apply to every crop. Water changes the irrigation cap, not yield. Fixed-plan profit is conditional if budget or water is exceeded.'}
