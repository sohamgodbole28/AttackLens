from fastapi import APIRouter, HTTPException
from app.loader.registry import registry

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

@router.get("/checklists/{checklist_id}")
async def get_checklist(checklist_id: str):
    if checklist_id not in registry.checklists:
        raise HTTPException(status_code=404, detail="Checklist not found")
    return registry.checklists[checklist_id]

@router.get("/references/{reference_id}")
async def get_reference(reference_id: str):
    if reference_id not in registry.references:
        raise HTTPException(status_code=404, detail="Reference not found")
    return registry.references[reference_id]
