from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.auth import verify_api_key
from app.models.schemas import ClimateTrendResponse
from app.services.climate_service import get_climate_trend

router = APIRouter()


@router.get("/api/climate/trend", response_model=ClimateTrendResponse)
async def climate_trend(
    location: str, parameter: str = "rainfall",
    start_year: int | None = None, end_year: int | None = None,
    granularity: str = "annual", api_key: str = Depends(verify_api_key),
):
    return await get_climate_trend(location, parameter, start_year, end_year, granularity)
