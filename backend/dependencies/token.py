from typing import Annotated
from fastapi import Header, HTTPException
import os

SECRET_TOKEN = os.getenv('SECRET_TOKEN')

async def get_token_header(x_token: Annotated[str, Header()]):
    if x_token != SECRET_TOKEN:
        raise HTTPException(status_code=400, detail="X-Token header invalid")