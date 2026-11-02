from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.services.catalog import CROPS

router=APIRouter(prefix='/api',tags=['Original frontend compatibility'])
class RecommendationInput(BaseModel):
    season: str = Field(default='rabi',max_length=40)
    soil_type: str = 'loamy'
    acreage: float = Field(default=5,gt=0)

@router.post('/recommendations')
def recommendations(req: RecommendationInput):
    items=[]
    for name,d in CROPS.items():
        season_fit=any(s in req.season.lower() for s in d['seasons'])
        soil_fit=req.soil_type.lower() in d['soils']
        items.append({'name':name,'yield':d['yield'],'price':d['price'],'cost':d['cost'],'water':'Low' if d['water']<1000 else 'High' if d['water']>2000 else 'Medium','score':50+25*season_fit+15*soil_fit,'suitability':'High' if season_fit and soil_fit else 'Review','outlook':'Illustrative','reason':f"Season match: {season_fit}. Soil match: {soil_fit}. Based on sample assumptions.",'assumptions':'Illustrative yields, prices and costs. Not a live market feed.','risk':'Confirm local weather, irrigation and buyer access.'})
    return {'recommendations':sorted(items,key=lambda c:c['score'],reverse=True),'data_mode':'illustrative'}
