from fastapi import Depends
from .reviews import ProgrammingLanguage, ReviewStatus
from ..database.mongodb import get_reviews_collection
from typing import Any
from fastapi import APIRouter, Depends
from ..dependencies import get_token_header
from pymongo.asynchronous.collection import AsyncCollection
from typing import Any

router = APIRouter(
    prefix="/api/stats",
    tags=["stats"],
    dependencies=[Depends(get_token_header)],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_stats(collection:AsyncCollection[Any]=Depends(get_reviews_collection)) -> dict[str, Any]:
    """
    Get aggregate statistics about reviews
    """

    total_reviews = await collection.count_documents({})
    
    status_counts = {}
    for status in ReviewStatus:
        count = await collection.count_documents({"status": status})
        status_counts[status] = count

    language_counts = {}
    for language in ProgrammingLanguage:
        count = await collection.count_documents({"language": language})
        language_counts[language] = count
    
    pipeline: list[dict[str, Any]] = [
        {"$match": {"status": ReviewStatus.COMPLETED, "result.quality_score": {"$exists": True}}},
        {"$group": {"_id": None, "avg_score": {"$avg": "$result.quality_score"}}}
    ]

    cursor = await collection.aggregate(pipeline) 
    docs = [doc async for doc in cursor] 
    avg_score = docs[0]["avg_score"] if docs else 0

    return {
        "total_reviews": total_reviews,
        "by_status": status_counts,
        "by_language": language_counts,
        "average_quality_score": round(avg_score, 2) if avg_score else 0
    }