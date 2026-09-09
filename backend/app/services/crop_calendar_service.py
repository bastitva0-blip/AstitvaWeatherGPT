"""Crop calendar service — monthly sowing/harvest/irrigation windows.

Data sourced from ICAR (Indian Council of Agricultural Research) crop
calendars. These are static lookup tables; a production deployment should
pull from IMD's district-level agromet advisory unit bulletins.

Returns a 12-month calendar for a given crop showing what activity
(sow / grow / irrigate / harvest / rest) is recommended each month,
overlaid with the current weather forecast to flag risk months.
"""
from __future__ import annotations

from datetime import datetime, timezone

# Format: {crop: {month_1_based: {"phase": str, "action": str, "water_need": str}}}
_CROP_CALENDAR: dict[str, dict[int, dict]] = {
    "wheat": {
        1:  {"phase": "growing",   "action": "Top-dress nitrogen fertilizer",     "water_need": "medium"},
        2:  {"phase": "growing",   "action": "Watch for rust disease",             "water_need": "medium"},
        3:  {"phase": "harvest",   "action": "Harvest when grain is golden",       "water_need": "low"},
        4:  {"phase": "harvest",   "action": "Threshing and storage",              "water_need": "none"},
        5:  {"phase": "rest",      "action": "Field preparation, add compost",     "water_need": "none"},
        6:  {"phase": "rest",      "action": "Deep ploughing before monsoon",      "water_need": "none"},
        7:  {"phase": "rest",      "action": "Weed control, soil health check",    "water_need": "none"},
        8:  {"phase": "rest",      "action": "Pre-sowing irrigation if dry",       "water_need": "low"},
        9:  {"phase": "rest",      "action": "Prepare seed bed",                   "water_need": "low"},
        10: {"phase": "sow",       "action": "Sow October 15–31 (Rabi season)",    "water_need": "medium"},
        11: {"phase": "sow",       "action": "First irrigation 20–25 days after sow","water_need": "medium"},
        12: {"phase": "growing",   "action": "Tiller stage — protect from frost",  "water_need": "medium"},
    },
    "rice": {
        1:  {"phase": "rest",      "action": "Field drying after Rabi",            "water_need": "none"},
        2:  {"phase": "rest",      "action": "Soil preparation",                   "water_need": "none"},
        3:  {"phase": "rest",      "action": "Early nursery prep (summer crop)",   "water_need": "low"},
        4:  {"phase": "sow",       "action": "Summer crop nursery sowing",         "water_need": "high"},
        5:  {"phase": "growing",   "action": "Transplant summer crop",             "water_need": "high"},
        6:  {"phase": "sow",       "action": "Kharif nursery — main season",       "water_need": "high"},
        7:  {"phase": "growing",   "action": "Transplant Kharif — maintain water", "water_need": "high"},
        8:  {"phase": "growing",   "action": "Tillering — flood risk watch",       "water_need": "high"},
        9:  {"phase": "growing",   "action": "Panicle initiation — critical water","water_need": "high"},
        10: {"phase": "harvest",   "action": "Drain field 10 days before harvest", "water_need": "none"},
        11: {"phase": "harvest",   "action": "Harvest — dry weather preferred",    "water_need": "none"},
        12: {"phase": "rest",      "action": "Stubble incorporation",              "water_need": "none"},
    },
    "cotton": {
        1:  {"phase": "harvest",   "action": "Late picking — protect from dew",    "water_need": "low"},
        2:  {"phase": "rest",      "action": "Field clearing and ploughing",        "water_need": "none"},
        3:  {"phase": "rest",      "action": "Deep tillage, add organic matter",   "water_need": "none"},
        4:  {"phase": "sow",       "action": "Sow April–May with onset of heat",   "water_need": "low"},
        5:  {"phase": "sow",       "action": "Gap filling, thinning",              "water_need": "medium"},
        6:  {"phase": "growing",   "action": "First weeding, intercultural ops",   "water_need": "medium"},
        7:  {"phase": "growing",   "action": "Square and flower bud formation",    "water_need": "medium"},
        8:  {"phase": "growing",   "action": "Boll development — pest watch",      "water_need": "high"},
        9:  {"phase": "growing",   "action": "Boll opening — reduce irrigation",   "water_need": "low"},
        10: {"phase": "harvest",   "action": "First picking of open bolls",        "water_need": "low"},
        11: {"phase": "harvest",   "action": "Second picking",                     "water_need": "low"},
        12: {"phase": "harvest",   "action": "Final picking and defoliation",      "water_need": "none"},
    },
    "maize": {
        1:  {"phase": "rest",      "action": "Post-harvest stubble management",    "water_need": "none"},
        2:  {"phase": "sow",       "action": "Spring/summer crop sowing",          "water_need": "medium"},
        3:  {"phase": "growing",   "action": "Seedling establishment",             "water_need": "medium"},
        4:  {"phase": "growing",   "action": "Vegetative growth — side-dress N",  "water_need": "high"},
        5:  {"phase": "harvest",   "action": "Summer crop harvest",                "water_need": "low"},
        6:  {"phase": "sow",       "action": "Kharif sowing with monsoon onset",   "water_need": "medium"},
        7:  {"phase": "growing",   "action": "Tasseling — critical water period",  "water_need": "high"},
        8:  {"phase": "growing",   "action": "Silking and grain fill",             "water_need": "high"},
        9:  {"phase": "growing",   "action": "Grain maturity — watch for lodging", "water_need": "medium"},
        10: {"phase": "harvest",   "action": "Harvest at 25% moisture",            "water_need": "none"},
        11: {"phase": "rest",      "action": "Field preparation for Rabi",         "water_need": "none"},
        12: {"phase": "rest",      "action": "Winter fallow or cover crop",        "water_need": "none"},
    },
    "sugarcane": {
        1:  {"phase": "growing",   "action": "Grand growth phase — irrigate weekly","water_need": "high"},
        2:  {"phase": "growing",   "action": "Internode elongation",               "water_need": "high"},
        3:  {"phase": "growing",   "action": "Maturation starts — reduce water",   "water_need": "medium"},
        4:  {"phase": "harvest",   "action": "Harvest before peak heat",           "water_need": "low"},
        5:  {"phase": "sow",       "action": "Plant new ratoon / fresh setts",     "water_need": "medium"},
        6:  {"phase": "sow",       "action": "Germination — ensure moisture",      "water_need": "medium"},
        7:  {"phase": "growing",   "action": "Tillering — earthing up",            "water_need": "high"},
        8:  {"phase": "growing",   "action": "Grand growth — weed control",        "water_need": "high"},
        9:  {"phase": "growing",   "action": "Reduce N, apply K for sucrose",      "water_need": "medium"},
        10: {"phase": "growing",   "action": "Ripening — stop irrigation 45 days before harvest","water_need": "low"},
        11: {"phase": "harvest",   "action": "Harvest season begins",              "water_need": "none"},
        12: {"phase": "harvest",   "action": "Peak crushing season",               "water_need": "none"},
    },
    "mustard": {
        1:  {"phase": "growing",   "action": "Siliqua filling — protect from frost","water_need": "low"},
        2:  {"phase": "harvest",   "action": "Harvest when 75% siliqua turns yellow","water_need": "none"},
        3:  {"phase": "rest",      "action": "Threshing and storage",              "water_need": "none"},
        4:  {"phase": "rest",      "action": "Deep ploughing",                     "water_need": "none"},
        5:  {"phase": "rest",      "action": "Summer fallow",                      "water_need": "none"},
        6:  {"phase": "rest",      "action": "Pre-monsoon soil prep",              "water_need": "none"},
        7:  {"phase": "rest",      "action": "Post-monsoon field work",            "water_need": "none"},
        8:  {"phase": "rest",      "action": "Soil testing and amendment",         "water_need": "none"},
        9:  {"phase": "rest",      "action": "Seed bed preparation",              "water_need": "low"},
        10: {"phase": "sow",       "action": "Sow Oct 1–15 for best yield",       "water_need": "medium"},
        11: {"phase": "growing",   "action": "Vegetative phase — one irrigation", "water_need": "medium"},
        12: {"phase": "growing",   "action": "Flowering — critical frost risk",   "water_need": "low"},
    },
    "soybean": {
        1:  {"phase": "rest",      "action": "Winter fallow",                      "water_need": "none"},
        2:  {"phase": "rest",      "action": "Deep tillage",                       "water_need": "none"},
        3:  {"phase": "rest",      "action": "Field prep, phosphorus application", "water_need": "none"},
        4:  {"phase": "rest",      "action": "Soil health check",                  "water_need": "none"},
        5:  {"phase": "rest",      "action": "Final land preparation",             "water_need": "none"},
        6:  {"phase": "sow",       "action": "Sow June 15–30 with monsoon",       "water_need": "medium"},
        7:  {"phase": "growing",   "action": "Vegetative growth — weed control",  "water_need": "high"},
        8:  {"phase": "growing",   "action": "Flowering and pod set",             "water_need": "high"},
        9:  {"phase": "growing",   "action": "Pod filling — critical stage",      "water_need": "medium"},
        10: {"phase": "harvest",   "action": "Harvest when 95% pods are brown",   "water_need": "none"},
        11: {"phase": "rest",      "action": "Stubble incorporation",              "water_need": "none"},
        12: {"phase": "rest",      "action": "Cover crop or fallow",              "water_need": "none"},
    },
    "groundnut": {
        1:  {"phase": "rest",      "action": "Post-harvest field work",            "water_need": "none"},
        2:  {"phase": "sow",       "action": "Summer crop sowing (Feb–Mar)",      "water_need": "medium"},
        3:  {"phase": "growing",   "action": "Pegging stage — light irrigation",  "water_need": "medium"},
        4:  {"phase": "growing",   "action": "Pod development",                   "water_need": "high"},
        5:  {"phase": "harvest",   "action": "Summer crop harvest",               "water_need": "none"},
        6:  {"phase": "sow",       "action": "Kharif sowing with first monsoon",  "water_need": "medium"},
        7:  {"phase": "growing",   "action": "Vegetative phase",                  "water_need": "high"},
        8:  {"phase": "growing",   "action": "Pegging and pod development",       "water_need": "high"},
        9:  {"phase": "growing",   "action": "Maturation — reduce water",         "water_need": "low"},
        10: {"phase": "harvest",   "action": "Harvest Kharif crop — dry field",  "water_need": "none"},
        11: {"phase": "rest",      "action": "Field clearing",                    "water_need": "none"},
        12: {"phase": "rest",      "action": "Soil enrichment — add lime",        "water_need": "none"},
    },
}

_PHASE_EMOJI = {
    "sow":      "🌱",
    "growing":  "🌿",
    "harvest":  "🌾",
    "rest":     "💤",
}

_WATER_EMOJI = {"none": "💧❌", "low": "💧", "medium": "💧💧", "high": "💧💧💧"}

MONTH_NAMES = ["", "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]


def get_crop_calendar(crop: str) -> dict:
    """Return full 12-month calendar for a crop."""
    crop = crop.lower()
    cal  = _CROP_CALENDAR.get(crop)
    if cal is None:
        return {"error": f"No calendar for crop '{crop}'. Supported: {list(_CROP_CALENDAR.keys())}"}

    current_month = datetime.now(timezone.utc).month
    months = []
    for m in range(1, 13):
        info = cal[m]
        months.append({
            "month":      m,
            "month_name": MONTH_NAMES[m],
            "phase":      info["phase"],
            "phase_emoji":_PHASE_EMOJI.get(info["phase"], "🌱"),
            "action":     info["action"],
            "water_need": info["water_need"],
            "water_emoji":_WATER_EMOJI.get(info["water_need"], "💧"),
            "is_current": m == current_month,
        })

    return {
        "crop":           crop,
        "current_month":  current_month,
        "current_phase":  cal[current_month]["phase"],
        "current_action": cal[current_month]["action"],
        "months":         months,
        "source":         "ICAR Agromet Advisory Bulletins (simplified)",
    }


def get_current_advisory(crop: str) -> dict:
    """Quick helper — just current month's info."""
    result = get_crop_calendar(crop)
    if "error" in result:
        return result
    m = result["current_month"]
    return {
        "crop":         crop,
        "month":        MONTH_NAMES[m],
        "phase":        result["current_phase"],
        "action":       result["current_action"],
        "next_month":   result["months"][m % 12],   # wraps Dec → Jan
    }
