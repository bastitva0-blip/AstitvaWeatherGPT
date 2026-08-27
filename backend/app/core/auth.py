from fastapi import Header, HTTPException, status

from app.core.config import settings


async def verify_api_key(x_api_key: str = Header(default=None, alias="X-API-Key")) -> str:
    if not x_api_key or x_api_key not in settings.valid_api_keys:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid or missing API key")
    return x_api_key
