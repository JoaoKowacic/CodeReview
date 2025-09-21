import os
from typing import Any
from pymongo import AsyncMongoClient 
import urllib.parse

async def get_reviews_collection():
    return reviews_collection

MONGODB_URL = os.getenv("MONGODB_URL")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")
if MONGODB_URL and MONGODB_PASSWORD:
    try:
        client: AsyncMongoClient[Any] = AsyncMongoClient(MONGODB_URL.replace("<password>", urllib.parse.quote(MONGODB_PASSWORD)))
        print(client)
        db = client.code_review_db
        reviews_collection = db.reviews
    except:
        raise