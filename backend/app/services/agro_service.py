"""Crop-specific advisory rules — closes the "superficial agro-advisory"
gap (previously just extracted crop_type with no real logic). Thresholds
are simplified from IMD/ICAR agromet advisory bulletins; a production
deployment should source these from IMD's district-level agromet unit
bulletins directly rather than this static table.
"""
from __future__ import annotations

# (max_safe_temp_c, min_water_need_mm_per_week, notes)
_CROP_RULES = {
    "wheat": {"max_safe_temp_c": 32, "frost_risk_below_c": 4, "water_need_mm_week": 25},
    "rice": {"max_safe_temp_c": 38, "frost_risk_below_c": None, "water_need_mm_week": 50, "needs_standing_water": True},
    "cotton": {"max_safe_temp_c": 40, "frost_risk_below_c": 10, "water_need_mm_week": 30},
}


def get_agro_advisory(crop_type: str | None, weather_data: dict) -> str | None:
    if not crop_type:
        return None
    rules = _CROP_RULES.get(crop_type.lower())
    if not rules:
        return None

    temp_max = weather_data.get("temperature_max")
    temp_min = weather_data.get("temperature_min")
    rainfall_mm = weather_data.get("rainfall_mm") or 0

    warnings = []
    if temp_max is not None and temp_max > rules["max_safe_temp_c"]:
        warnings.append(f"heat stress risk for {crop_type} (forecast {temp_max}C exceeds {rules['max_safe_temp_c']}C safe limit)")
    if rules.get("frost_risk_below_c") is not None and temp_min is not None and temp_min < rules["frost_risk_below_c"]:
        warnings.append(f"frost risk for {crop_type} (forecast low {temp_min}C)")
    if rainfall_mm < rules["water_need_mm_week"] / 7:
        warnings.append(f"irrigation likely needed — forecast rainfall below {crop_type}'s weekly water need")
    elif rules.get("needs_standing_water") and rainfall_mm < 5:
        warnings.append(f"{crop_type} needs standing water — low rainfall forecast, check field water level")

    if not warnings:
        return f"Conditions look favorable for {crop_type} — no heat, frost, or water-stress risk detected in this forecast."
    return "Advisory: " + "; ".join(warnings) + "."
