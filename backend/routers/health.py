from datetime import datetime
from fastapi import Depends
import openai
from ..database.mongodb import get_reviews_collection
from fastapi import APIRouter, Depends
from ..dependencies import get_token_header
from pymongo.asynchronous.collection import AsyncCollection
from typing import Any

router = APIRouter(
    prefix="/api/health",
    tags=["health"],
    dependencies=[Depends(get_token_header)],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def health_check(collection:AsyncCollection[Any] =Depends(get_reviews_collection)) -> dict[str, str]:
    """
    Health check endpoint
    """
    try:
        await collection.count_documents({})
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    
    openai_status = "connected" if openai.api_key else "disconnected"
    
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "database": db_status,
        "openai": openai_status
    }