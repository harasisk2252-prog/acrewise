from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app import models
from app.routers import planning, assistant

@asynccontextmanager
async def lifespan(app):
    Base.metadata.create_all(engine)
    yield

app = FastAPI(title='AcreWise 2.0', version='2.0.0', lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=[x.strip() for x in settings.cors_origins.split(',') if x.strip()], allow_credentials=False, allow_methods=['GET','POST','PUT','DELETE','OPTIONS'], allow_headers=['Content-Type','Authorization'])
app.include_router(planning.router)
app.include_router(assistant.router)

@app.get('/health')
def health():
    return {'status':'ok','service':'AcreWise 2.0','assistant_mode':'ai' if settings.gemini_api_key and settings.gemini_model else 'local','data_mode':'illustrative'}
