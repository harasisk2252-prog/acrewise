from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

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

class SowingIntentionCreate(StrictModel):
    crop: str = Field(min_length=2, max_length=80)
    acres: float = Field(gt=0, le=5000)
    district: str = Field(default='Amritsar', min_length=2, max_length=80)
    block: str = Field(default='', max_length=80)
    season: str = Field(default='rabi', max_length=40)

class SMSRequest(StrictModel):
    phone: str = Field(min_length=10, max_length=15)
    category: str = Field(default='weather', max_length=40)
    language: Literal['en', 'hi', 'pa'] = 'pa'
    message: str | None = Field(default=None, max_length=500)

class NotificationPreferences(StrictModel):
    phone: str = Field(default='', max_length=15)
    language: Literal['en', 'hi', 'pa'] = 'pa'
    consent: bool = False
    categories: dict[str, bool] = Field(default_factory=lambda: {
        'weather': True, 'oversupply': True, 'market': True, 'harvest': True, 'crop_plan': True
    })

class FeedbackCreate(StrictModel):
    rating: int = Field(ge=1, le=5)
    category: str = Field(default='recommendation', max_length=60)
    comments: str = Field(min_length=3, max_length=2000)

class DigitalFarmDetails(StrictModel):
    details: dict = Field(default_factory=dict)
