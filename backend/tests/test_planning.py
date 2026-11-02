import os
os.environ['DATABASE_URL'] = 'sqlite://'
os.environ['GEMINI_API_KEY'] = ''
os.environ['GEMINI_MODEL'] = ''
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import Base, get_db
from app.schemas import OptimizeRequest, FarmProfile, SimulateRequest, Scenario
from app.services.optimizer import optimize, simulate

def test_constraints_and_accounting():
    req=OptimizeRequest()
    r=optimize(req)
    assert sum(x['acres'] for x in r['allocations']) == pytest.approx(10)
    assert all(x['acres'] <= 7.00001 for x in r['allocations'])
    assert r['totals']['cost'] <= req.farm.budget
    assert r['totals']['water'] <= req.farm.water
    assert r['totals']['profit'] == pytest.approx(r['totals']['revenue']-r['totals']['cost'], abs=.01)
    assert all(x['crop'] in ['Wheat','Mustard','Chickpea'] for x in r['allocations'])

def test_known_profit_optimum():
    r=optimize(OptimizeRequest(objective='profit',max_share=1,farm=FarmProfile(water=100000)))
    assert r['allocations'][0]['crop']=='Mustard'
    assert r['totals']['profit']==253000

@pytest.mark.parametrize('farm', [FarmProfile(budget=1), FarmProfile(water=1), FarmProfile(season='zaid',soil='clay')])
def test_infeasible_never_relaxes_constraints(farm):
    with pytest.raises(HTTPException) as e:
        optimize(OptimizeRequest(farm=farm))
    assert e.value.status_code==422

def test_soil_and_season_are_hard_filters():
    r=optimize(OptimizeRequest(farm=FarmProfile(soil='clay',season='rabi',water=25000),max_share=1))
    assert [a['crop'] for a in r['allocations']]==['Wheat']

def test_zero_scenario_matches_baseline():
    r=simulate(SimulateRequest(optimization=OptimizeRequest()))
    assert r['profit_change']==0
    assert r['fixed_plan']['totals']==r['baseline']['totals']
    assert r['optimized_plan']['totals']==r['baseline']['totals']

def test_scenario_multiplicative_price_yield_and_cost():
    r=simulate(SimulateRequest(optimization=OptimizeRequest(),scenario=Scenario(price_pct=-20,yield_pct=-10,cost_pct=15)))
    b=r['baseline']['totals']; f=r['fixed_plan']['totals']
    assert f['revenue']==pytest.approx(b['revenue']*.8*.9,abs=.02)
    assert f['cost']==pytest.approx(b['cost']*1.15,abs=.02)
    assert f['profit']==pytest.approx(f['revenue']-f['cost'],abs=.02)

def test_water_shortage_marks_fixed_plan_conditional():
    r=simulate(SimulateRequest(optimization=OptimizeRequest(),scenario=Scenario(water_pct=-90)))
    assert r['fixed_plan']['violations']==['water']
    assert r['fixed_plan']['profit_is_conditional']
    assert r['optimized_plan'] is None
    assert r['infeasibility_reason']

def test_water_objective_uses_less_water():
    req=OptimizeRequest()
    r=optimize(req.model_copy(update={'objective':'water'}))
    assert r['totals']['water']<=optimize(req)['totals']['water']

@pytest.fixture
def client():
    engine=create_engine('sqlite://',connect_args={'check_same_thread':False},poolclass=StaticPool)
    Base.metadata.create_all(engine)
    Session=sessionmaker(bind=engine)
    def db():
        with Session() as s: yield s
    app.dependency_overrides[get_db]=db
    with TestClient(app) as c: yield c
    app.dependency_overrides.clear()
    engine.dispose()

def session(client):
    r=client.post('/api/workspaces')
    assert r.status_code==201
    return {'Authorization':f"Bearer {r.json()['token']}"}

def test_full_user_journey_and_isolation(client):
    auth=session(client)
    farm=FarmProfile(farmer_name='Test farmer').model_dump()
    assert client.put('/api/farm',headers=auth,json=farm).status_code==200
    assert client.get('/api/farm',headers=auth).json()['farmer_name']=='Test farmer'
    req=OptimizeRequest(farm=FarmProfile(**farm)).model_dump()
    assert client.post('/api/optimize',json=req).status_code==200
    p=client.post('/api/plans',headers=auth,json={'name':'Test plan','optimization':req})
    assert p.status_code==201
    assert len(client.get('/api/plans',headers=auth).json())==1
    other=session(client)
    assert client.get('/api/plans',headers=other).json()==[]
    assert client.delete('/api/plans/'+p.json()['id'],headers=other).status_code==404
    s=client.post('/api/simulate',headers=auth,json={'optimization':req,'scenario':{'price_pct':-10}})
    assert s.status_code==200
    assert len(client.get('/api/simulations',headers=auth).json())==1
    assert client.get('/api/simulations',headers=other).json()==[]
    for lang in ['en','hi','pa']:
        chat=client.post('/api/assistant',headers=auth,json={'message':'Explain my crop mix','language':lang,'optimization':req})
        assert chat.status_code==200
        assert chat.json()['mode']=='local'
        assert chat.json()['language']==lang
        assert '10' in chat.json()['reply']
    assert client.delete('/api/plans/'+p.json()['id'],headers=auth).status_code==204
    assert client.get('/api/plans',headers=auth).json()==[]

def test_validation_and_auth(client):
    assert client.get('/api/farm').status_code==401
    assert client.post('/api/optimize',json={'farm':{'acres':-1}}).status_code==422
    assert client.post('/api/optimize',json={'crops':['Unknown']}).status_code==422
    assert client.post('/api/optimize',json={'max_share':.2}).status_code==422
    auth=session(client)
    assert client.post('/api/simulate',headers=auth,json={'optimization':{},'scenario':{'price_pct':-101}}).status_code==422
