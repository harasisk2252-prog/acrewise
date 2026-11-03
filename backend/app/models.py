from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

def now():
    return datetime.now(timezone.utc)

class Workspace(Base):
    __tablename__ = 'workspaces'
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    farm_json: Mapped[str] = mapped_column(Text, default='{}')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

class SavedPlan(Base):
    __tablename__ = 'plans'
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(ForeignKey('workspaces.id'), index=True)
    name: Mapped[str] = mapped_column(String(120))
    request_json: Mapped[str] = mapped_column(Text)
    result_json: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

class Simulation(Base):
    __tablename__ = 'simulations'
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(ForeignKey('workspaces.id'), index=True)
    request_json: Mapped[str] = mapped_column(Text)
    result_json: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

class SowingIntention(Base):
    __tablename__ = 'sowing_intentions'
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(64), index=True)
    district: Mapped[str] = mapped_column(String(80), index=True)
    block: Mapped[str] = mapped_column(String(80), default='')
    season: Mapped[str] = mapped_column(String(40), default='rabi')
    crop: Mapped[str] = mapped_column(String(80))
    acres: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

class SMSNotification(Base):
    __tablename__ = 'sms_notifications'
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(64), index=True)
    phone_masked: Mapped[str] = mapped_column(String(20))
    category: Mapped[str] = mapped_column(String(40))
    language: Mapped[str] = mapped_column(String(10))
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(40), default='delivered_sandbox')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

class NotificationPreference(Base):
    __tablename__ = 'notification_preferences'
    workspace_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    phone_masked: Mapped[str] = mapped_column(String(20), default='')
    phone_encrypted_placeholder: Mapped[str] = mapped_column(String(40), default='')
    language: Mapped[str] = mapped_column(String(10), default='pa')
    consent: Mapped[bool] = mapped_column(default=False)
    categories_json: Mapped[str] = mapped_column(Text, default='{}')
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=now, onupdate=now)

class DigitalFarmProfile(Base):
    __tablename__ = 'digital_farm_profiles'
    workspace_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    details_json: Mapped[str] = mapped_column(Text, default='{}')
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=now, onupdate=now)

class FeedbackRecord(Base):
    __tablename__ = 'feedback_records'
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(64), index=True)
    rating: Mapped[int] = mapped_column(Integer)
    category: Mapped[str] = mapped_column(String(60))
    comments: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
