import hashlib
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Workspace

def current_workspace(authorization: str = Header(default=''), db: Session = Depends(get_db)):
    scheme, _, token = authorization.partition(' ')
    if scheme.lower() != 'bearer' or not token:
        raise HTTPException(401, 'Workspace session required. Reload to create a local workspace.')
    workspace = db.query(Workspace).filter_by(token_hash=hashlib.sha256(token.encode()).hexdigest()).first()
    if not workspace:
        raise HTTPException(401, 'Workspace session expired. Reset your session to reconnect.')
    return workspace
