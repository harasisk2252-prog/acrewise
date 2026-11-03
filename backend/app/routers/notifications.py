"""Consent-first SMS alerts. Twilio keys stay on the server, never in the browser."""
import json
from uuid import uuid4
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import SMSNotification, NotificationPreference
from app.schemas import SMSRequest, NotificationPreferences
from app.security import current_workspace

router = APIRouter(prefix='/api/notifications', tags=['Notifications & SMS Alerts'])
SMS_TEMPLATES = {
    'weather': {'pa': '[AcreWise ਮੌਸਮ] 48 ਘੰਟਿਆਂ ਵਿੱਚ ਮੀਂਹ/ਤੇਜ਼ ਹਵਾ ਦੀ ਸੰਭਾਵਨਾ ਹੈ। ਸਪਰੇਅ ਅਤੇ ਸਿੰਚਾਈ ਰੋਕੋ।', 'hi': '[AcreWise मौसम] अगले 48 घंटों में बारिश/तेज हवा संभव है। छिड़काव और सिंचाई रोकें।', 'en': '[AcreWise Weather] Rain and strong winds are possible in 48 hours. Defer spray and irrigation.'},
    'oversupply': {'pa': '[AcreWise ਫਸਲ ਚੇਤਾਵਨੀ] ਇਲਾਕੇ ਵਿੱਚ ਕਣਕ ਦੀ ਬਿਜਾਈ ਵੱਧ ਹੈ। ਸਰ੍ਹੋਂ ਜਾਂ ਛੋਲਿਆਂ ਨਾਲ ਵਿਭਿੰਨਤਾ ਬਾਰੇ ਸੋਚੋ।', 'hi': '[AcreWise फसल चेतावनी] क्षेत्र में गेहूँ की बुवाई अधिक है। सरसों या चने से विविधीकरण पर विचार करें।', 'en': '[AcreWise Crop Alert] Wheat concentration is high locally. Consider Mustard or Chickpea diversification.'},
    'market': {'pa': '[AcreWise ਮੰਡੀ] ਸਰ੍ਹੋਂ ਦਾ ਭਾਅ MSP ਤੋਂ ਉੱਪਰ ਹੈ। ਵੇਚਣ ਤੋਂ ਪਹਿਲਾਂ ਨੇੜਲੀ ਮੰਡੀ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।', 'hi': '[AcreWise मंडी] सरसों का भाव MSP से ऊपर है। बिक्री से पहले नजदीकी मंडी में पुष्टि करें।', 'en': '[AcreWise Market] Mustard is above MSP. Confirm the nearest mandi price before selling.'},
    'harvest': {'pa': '[AcreWise ਕਟਾਈ ਯਾਦਦਿਹਾਨੀ] ਮੌਸਮ ਦੇਖ ਕੇ ਪੱਕੀ ਫਸਲ ਦੀ ਕਟਾਈ ਅਤੇ ਢੱਕੀ ਸਟੋਰੇਜ ਦੀ ਯੋਜਨਾ ਬਣਾਓ।', 'hi': '[AcreWise कटाई स्मरण] मौसम देखकर पकी फसल की कटाई और ढकी भंडारण की योजना बनाएं।', 'en': '[AcreWise Harvest] Check weather and plan harvesting and covered storage for mature crops.'},
    'crop_plan': {'pa': '[AcreWise ਯੋਜਨਾ] ਤੁਹਾਡੇ ਫਸਲ ਪਲਾਨ ਦੇ ਪਾਣੀ ਜਾਂ ਬਜਟ ਵਿਚ ਵੱਡਾ ਬਦਲਾਅ ਆਇਆ ਹੈ। ਐਪ ਵਿੱਚ ਪਲਾਨ ਵੇਖੋ।', 'hi': '[AcreWise योजना] आपकी फसल योजना के पानी या बजट में बड़ा बदलाव आया है। ऐप में योजना देखें।', 'en': '[AcreWise Plan] Your crop plan has a significant water or budget change. Review it in the app.'}
}

def mask(phone): return f'{phone[:2]}******{phone[-2:]}' if len(phone) >= 4 else '***'
def pref_out(record):
    return {'phone_masked': record.phone_masked, 'language': record.language, 'consent': record.consent, 'categories': json.loads(record.categories_json or '{}'), 'updated_at': record.updated_at.isoformat()} if record else {'phone_masked': '', 'language': 'pa', 'consent': False, 'categories': {}}

@router.get('/preferences')
def get_preferences(workspace=Depends(current_workspace), db: Session = Depends(get_db)):
    return pref_out(db.get(NotificationPreference, workspace.id))

@router.put('/preferences')
def save_preferences(payload: NotificationPreferences, workspace=Depends(current_workspace), db: Session = Depends(get_db)):
    digits = ''.join(c for c in payload.phone if c.isdigit())
    if payload.consent and len(digits) < 10: raise HTTPException(422, 'A valid mobile number is required when SMS consent is enabled.')
    record = db.get(NotificationPreference, workspace.id)
    if not record: record = NotificationPreference(workspace_id=workspace.id); db.add(record)
    record.phone_masked, record.phone_encrypted_placeholder = (mask(digits) if digits else ''), ('configured' if digits else '')
    record.language, record.consent, record.categories_json = payload.language, payload.consent, json.dumps(payload.categories)
    db.commit(); db.refresh(record)
    return {**pref_out(record), 'privacy_note': 'Raw mobile numbers are not stored in this demo.'}

def send_twilio(phone, body):
    if not all([settings.twilio_account_sid, settings.twilio_auth_token, settings.twilio_from_number]):
        return 'not_sent_provider_unconfigured', 'Twilio is not configured; message was recorded only in alert history.'
    try:
        response = httpx.post(f'https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json', auth=(settings.twilio_account_sid, settings.twilio_auth_token), data={'To': phone, 'From': settings.twilio_from_number, 'Body': body}, timeout=12)
        return ('accepted_by_twilio', 'SMS accepted by Twilio for delivery; carrier delivery may still vary.') if response.is_success else ('provider_rejected', 'SMS provider rejected the request. Check server credentials and sender configuration.')
    except httpx.HTTPError: return 'provider_unavailable', 'SMS provider could not be reached. No delivery was confirmed.'

@router.post('/sms', status_code=201)
def dispatch_sms(payload: SMSRequest, workspace=Depends(current_workspace), db: Session = Depends(get_db)):
    pref = db.get(NotificationPreference, workspace.id)
    if not pref or not pref.consent: raise HTTPException(409, 'SMS consent is required before sending an alert.')
    if not json.loads(pref.categories_json or '{}').get(payload.category, False): raise HTTPException(409, f'The {payload.category} alert category is disabled.')
    phone = ''.join(c for c in payload.phone if c.isdigit())
    if len(phone) < 10: raise HTTPException(422, 'Enter a valid mobile number.')
    template = SMS_TEMPLATES.get(payload.category, SMS_TEMPLATES['weather']); text = payload.message or template.get(payload.language, template['en'])
    status, note = send_twilio(phone, text)
    record = SMSNotification(id=str(uuid4()), workspace_id=workspace.id, phone_masked=mask(phone), category=payload.category, language=payload.language, message=text, status=status)
    db.add(record); db.commit()
    return {'id': record.id, 'status': status, 'phone_masked': record.phone_masked, 'language': payload.language, 'message': text, 'note': note}

@router.get('/history')
def get_sms_history(workspace=Depends(current_workspace), db: Session = Depends(get_db)):
    rows = db.query(SMSNotification).filter_by(workspace_id=workspace.id).order_by(SMSNotification.created_at.desc()).limit(50).all()
    return [{'id': r.id, 'phone': r.phone_masked, 'category': r.category, 'language': r.language, 'message': r.message, 'status': r.status, 'sent_at': r.created_at.isoformat()} for r in rows]
