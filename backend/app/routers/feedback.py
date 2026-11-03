from uuid import uuid4
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import FeedbackRecord
from app.schemas import FeedbackCreate
from app.security import current_workspace

router = APIRouter(prefix='/api/feedback', tags=['Farmer Feedback'])

@router.post('', status_code=201)
def submit_feedback(payload: FeedbackCreate, workspace=Depends(current_workspace), db: Session = Depends(get_db)):
    record = FeedbackRecord(
        id=str(uuid4()),
        workspace_id=workspace.id,
        rating=payload.rating,
        category=payload.category,
        comments=payload.comments
    )
    db.add(record)
    db.commit()
    return {
        'id': record.id,
        'status': 'received',
        'message': 'Feedback successfully recorded for agronomy review.'
    }

@router.get('')
def list_feedback(db: Session = Depends(get_db)):
    records = db.query(FeedbackRecord).order_by(FeedbackRecord.created_at.desc()).limit(50).all()
    return [
        {
            'id': r.id,
            'rating': r.rating,
            'category': r.category,
            'comments': r.comments,
            'created_at': r.created_at.isoformat()
        }
        for r in records
    ]

