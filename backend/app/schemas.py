from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator

class StrictModel(BaseModel):
    model_config = ConfigDict(extra='forbid', allow_inf_nan=False)

class FarmProfile(StrictModel):
    name: str = Field(default='My farm', min_length=1, max_length=100)
    farmer_name: str = Field(default='', max_length=100)
    district: str = Field(default='Amritsar', min_length=2, max_length=80)
    state: str = Field(default='Punjab', min_length=2, max_length=80)
    acres: float = Field(default=10, gt=0, le=10000)
    soil: Literal['loamy', 'alluvial', 'sandy', 'clay'] = 'loamy'
    season: Literal['rabi', 'kharif', 'zaid'] = 'rabi'
    budget: float = Field(default=180000, gt=0, le=1e10)
    water: float = Field(default=12000, gt=0, le=1e9)

class OptimizeRequest(StrictModel):
    farm: FarmProfile = Field(default_factory=FarmProfile)
    objective: Literal['profit', 'balanced', 'water'] = 'balanced'
    max_share: float = Field(default=0.7, gt=0, le=1)
    crops: list[str] | None = Field(default=None, min_length=1, max_length=6)

class Scenario(StrictModel):
    price_pct: float = Field(default=0, ge=-90, le=100)
    yield_pct: float = Field(default=0, ge=-90, le=100)
    cost_pct: float = Field(default=0, ge=-90, le=100)
    water_pct: float = Field(default=0, ge=-90, le=100)

class SimulateRequest(StrictModel):
    optimization: OptimizeRequest
    scenario: Scenario = Field(default_factory=Scenario)

class PlanCreate(StrictModel):
    name: str = Field(min_length=1, max_length=120)
    optimization: OptimizeRequest

class ChatMessage(StrictModel):
    role: Literal['user', 'assistant']
    content: str = Field(min_length=1, max_length=4000)

class ChatRequest(StrictModel):
    message: str = Field(min_length=1, max_length=2000)
    language: Literal['en', 'hi', 'pa'] = 'en'
    optimization: OptimizeRequest
    history: list[ChatMessage] = Field(default_factory=list, max_length=12)
