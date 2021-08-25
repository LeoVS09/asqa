
from fastapi import APIRouter

router = APIRouter()

# TODO: find real status handler

@router.get("/status")
async def status():
    return { 'enabled': True }