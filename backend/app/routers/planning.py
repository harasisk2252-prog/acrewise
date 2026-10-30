import hashlib
import json
import secrets
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Workspace, SavedPlan, Simulation
from app.schemas import FarmProfile, OptimizeRequest, SimulateRequest, PlanCreate
from app.security import current_workspace
from app.services.catalog import CROPS, ASSUMPTIONS, DATA_VERSION
from app.services.optimizer import optimize, simulate

router = APIRouter(prefix='/api')

@router.post('/workspaces', status_code=201)
def create_workspace(db: Session = Depends(get_db)):
    token = secrets.token_urlsafe(32)
    workspace = Workspace(id=str(uuid4()), token_hash=hashlib.sha256(token.encode()).hexdigest(), farm_json=FarmProfile().model_dump_json())
    db.add(workspace); db.commit()
    return {'token': token, 'id': workspace.id}

@router.get('/farm')
def get_farm(workspace=Depends(current_workspace)):
    return json.loads(workspace.farm_json)

@router.put('/farm')
def put_farm(payload: FarmProfile, workspace=Depends(current_workspace), db: Session = Depends(get_db)):
    workspace.farm_json = payload.model_dump_json()
    db.commit()
    return payload

@router.get('/crops')
def crops():
    return {'items': [{'name': k, **v} for k, v in CROPS.items()], 'assumptions': ASSUMPTIONS, 'data_version': DATA_VERSION}

@router.post('/optimize')
def optimize_route(payload: OptimizeRequest):
    return optimize(payload)

@router.post('/simulate')
def simulate_route(payload: SimulateRequest, workspace=Depends(current_workspace), db: Session = Depends(get_db)):
    result = simulate(payload)
    record = Simulation(id=str(uuid4()), workspace_id=workspace.id, request_json=payload.model_dump_json(), result_json=json.dumps(result))
    db.add(record); db.commit()
    return {**result, 'id': record.id}

@router.get('/simulations')
def simulations(workspace=Depends(current_workspace), db: Session = Depends(get_db)):
    return [{'id': s.id, 'created_at': s.created_at.isoformat(), 'request': json.loads(s.request_json), 'result': json.loads(s.result_json)} for s in db.query(Simulation).filter_by(workspace_id=workspace.id).order_by(Simulation.created_at.desc()).limit(50)]

def plan_json(p):
    return {'id': p.id, 'name': p.name, 'created_at': p.created_at.isoformat(), 'optimization': json.loads(p.request_json), 'result': json.loads(p.result_json)}

@router.post('/plans', status_code=201)
def save_plan(payload: PlanCreate, workspace=Depends(current_workspace), db: Session = Depends(get_db)):
    result = optimize(payload.optimization)
    p = SavedPlan(id=str(uuid4()), workspace_id=workspace.id, name=payload.name, request_json=payload.optimization.model_dump_json(), result_json=json.dumps(result))
    db.add(p); db.commit(); db.refresh(p)
    return plan_json(p)

@router.get('/plans')
def plans(workspace=Depends(current_workspace), db: Session = Depends(get_db)):
    return [plan_json(p) for p in db.query(SavedPlan).filter_by(workspace_id=workspace.id).order_by(SavedPlan.created_at.desc()).limit(100)]

@router.delete('/plans/{plan_id}', status_code=204)
def delete_plan(plan_id: str, workspace=Depends(current_workspace), db: Session = Depends(get_db)):
    p = db.query(SavedPlan).filter_by(id=plan_id, workspace_id=workspace.id).first()
    if not p:
        raise HTTPException(404, 'Plan not found.')
    db.delete(p); db.commit()
