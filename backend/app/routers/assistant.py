import time
from collections import defaultdict, deque
from fastapi import APIRouter, Depends, HTTPException
from app.schemas import ChatRequest
from app.security import current_workspace
from app.services.assistant import answer

router = APIRouter(prefix='/api', tags=['Saathi'])
requests = defaultdict(deque)

@router.post('/assistant')
async def chat(payload: ChatRequest, workspace=Depends(current_workspace)):
    now = time.monotonic()
    queue = requests[workspace.id]
    while queue and queue[0] < now - 60:
        queue.popleft()
    if len(queue) >= 12:
        raise HTTPException(429, 'Please wait a minute before sending more messages.')
    queue.append(now)
    return await answer(payload)
