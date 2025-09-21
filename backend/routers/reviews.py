from fastapi import HTTPException, Query, Path, Depends, BackgroundTasks, Request, APIRouter
from motor.motor_asyncio import AsyncIOMotorCollection
from typing import Optional, List,  Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId
from ..dependencies import get_token_header
from ..database.mongodb import get_reviews_collection, reviews_collection
from enum import Enum
import uuid
import asyncio
import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter(
    prefix="/api/reviews",
    tags=["reviews"],
    dependencies=[Depends(get_token_header)],
    responses={404: {"description": "Not found"}},
)

class ReviewStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ProgrammingLanguage(str, Enum):
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    JAVA = "java"
    CPP = "cpp"
    CSHARP = "csharp"
    GO = "go"
    RUST = "rust"
    TYPESCRIPT = "typescript"

class SubmitReviewRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=10000, description="The code to review")
    language: ProgrammingLanguage = Field(..., description="Programming language of the code")
    title: Optional[str] = Field(None, max_length=100, description="Optional title for the review")

class CodeFeedback(BaseModel):
    issue: str
    suggestion: str
    severity: str 

class ReviewResult(BaseModel):
    quality_score: int = Field(..., ge=1, le=10, description="Code quality score from 1-10")
    feedback: List[CodeFeedback] = Field(..., description="List of issues and suggestions")
    security_concerns: List[str] = Field(..., description="List of security concerns")
    performance_recommendations: List[str] = Field(..., description="List of performance recommendations")
    summary: str = Field(..., description="Overall summary of the code review")

class CodeReview(BaseModel):
    id: str
    title: Optional[str]
    code: str
    language: ProgrammingLanguage
    status: ReviewStatus
    submitted_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Optional[ReviewResult] = None
    error_message: Optional[str] = None
    ip_address: Optional[str] = None

    class Config:
        json_encoders = {
            ObjectId: str
        }

class AICodeReviewer:
    def __init__(self):
        self.system_prompt = """You are an expert code reviewer. Analyze the provided code and provide a structured review including:
        1. A code quality score from 1-10
        2. Specific issues found with suggestions for improvement
        3. Any security concerns
        4. Performance recommendations
        5. A summary of your assessment

        Format your response as JSON with the following structure:
        {
            "quality_score": 7,
            "feedback": [
                {
                    "issue": "Issue description",
                    "suggestion": "Suggestion for improvement",
                    "severity": "high/medium/low"
                }
            ],
            "security_concerns": ["Security issue 1", "Security issue 2"],
            "performance_recommendations": ["Performance suggestion 1", "Performance suggestion 2"],
            "summary": "Overall summary of the code review"
        }
        """

    async def review_code(self, code: str, language: str) -> ReviewResult:
        try:
            user_prompt = f"Please review the following {language} code:\n\n{code}"

            response = await asyncio.to_thread(
                openai.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,
                max_tokens=1500
            )

            result_text = response.choices[0].message.content
            if result_text:
                import json
                try:
                    result_data = json.loads(result_text)
                except json.JSONDecodeError as e:
                    raise Exception(f"AI review failed: {str(e)}")
            else:
                raise Exception(f"AI review failed: In")

            return ReviewResult(**result_data)
        except Exception as e:
            raise Exception(f"AI review failed: {str(e)}")

ai_reviewer = AICodeReviewer()

async def process_review_background(review_id: str, code: str, language: str):
    await reviews_collection.update_one(
        {"id": review_id},
        {"$set": {"status": ReviewStatus.PROCESSING, "started_at": datetime.now()}}
    )
    
    try:
        result = await ai_reviewer.review_code(code, language)
  
        await reviews_collection.update_one(
            {"id": review_id},
            {"$set": {
                "status": ReviewStatus.COMPLETED,
                "completed_at": datetime.now(),
                "result": result.model_dump()
            }}
        )
    except Exception as e:
        await reviews_collection.update_one(
            {"id": review_id},
            {"$set": {
                "status": ReviewStatus.FAILED,
                "completed_at": datetime.now(),
                "error_message": str(e)
            }}
        )

@router.post("/", response_model=CodeReview)
# @limiter.limit("10/hour")
async def submit_review(
    request: Request,
    background_tasks: BackgroundTasks,
    review_request: SubmitReviewRequest,
    collection: AsyncIOMotorCollection[Dict[str, Any]] = Depends(get_reviews_collection)
):
    """
    Submit code for review
    """
    review_id = str(uuid.uuid4())
    if request.client:
        review = CodeReview(
            id=review_id,
            title=review_request.title,
            code=review_request.code,
            language=review_request.language,
            status=ReviewStatus.PENDING,
            submitted_at=datetime.now(),
            ip_address=request.client.host
        )
    
        await collection.insert_one(review.model_dump())

        background_tasks.add_task(
            process_review_background, 
            review_id, 
            review_request.code, 
            review_request.language.value
        )
        
        return review

@router.get("/{id}", response_model=CodeReview)
async def get_review(
    id: str = Path(..., description="The ID of the review to retrieve"),
    collection: AsyncIOMotorCollection[Dict[str, Any]]= Depends(get_reviews_collection)
):
    """
    Get specific review by ID
    """
    review = await collection.find_one({"id": id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return CodeReview(**review)

@router.get("/", response_model=List[CodeReview])
async def list_reviews(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of items to return"),
    status: Optional[ReviewStatus] = Query(None, description="Filter by review status"),
    language: Optional[ProgrammingLanguage] = Query(None, description="Filter by programming language"),
    collection: AsyncIOMotorCollection[Dict[str, Any]] = Depends(get_reviews_collection)
):
    """
    List reviews with pagination and filters
    """
    query = {}
    if status:
        query["status"] = status
    if language:
        query["language"] = language
    
    cursor = collection.find(query).skip(skip).limit(limit).sort("submitted_at", -1)
    reviews = await cursor.to_list(length=limit)
    
    return [CodeReview(**review) for review in reviews]



