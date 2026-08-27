import pytest

from app.services.nlp_service import classify_intent, detect_language, extract_slots, nlp_pipeline

HINDI_TESTS = [
    ("kal varanasi mein barish hogi?", "forecast_query"),
    ("kya koi cyclone alert hai?", "alert_check"),
    ("mujhe gehu ki fasal ke liye kya karna chahiye?", "agro_advisory"),
    ("VIDP airport pe visibility kitni hai?", "aviation_briefing"),
    ("Kochi ke paas samudra mein lahren kitni unchi hain?", "marine_advisory"),
]

FISHERMAN_TESTS = [
    ("Rameswaram ke paas machhli pakadne ke liye kal samudra kaisa rahega?", "marine_advisory"),
    ("Kya kal mujhe samudra mein jaana chahiye?", "marine_advisory"),
]

MALAYALAM_TESTS = [
    "നാളെ കടലിൽ പോകാൻ സുരക്ഷിതമാണോ?",
    "കൊച്ചി തീരത്ത് തിരമാലകൾ എത്ര ഉയരമുണ്ട്?",
]


@pytest.mark.parametrize("text,expected_intent", HINDI_TESTS + FISHERMAN_TESTS)
def test_intent_accuracy(text, expected_intent):
    result = classify_intent(text)
    assert result["intent"] == expected_intent


def test_fisherman_intent():
    result = classify_intent("Kya kal Digha mein machhwaron ke liye samudra surakshit hai?")
    assert result["intent"] == "marine_advisory"


def test_language_detection():
    assert detect_language("kal barish hogi") == "hi"
    assert detect_language("Will it rain tomorrow") == "en"
    for text in MALAYALAM_TESTS:
        assert detect_language(text) == "ml"


def test_slot_extraction_location_and_date():
    slots = extract_slots("Will it rain in Varanasi tomorrow?", "forecast_query")
    assert slots["location"] == "Varanasi"
    assert slots["date"] == "tomorrow"


def test_slot_extraction_icao():
    slots = extract_slots("What is the visibility at VIDP airport?", "aviation_briefing")
    assert slots["icao_code"] == "VIDP"


@pytest.mark.asyncio
async def test_nlp_pipeline_end_to_end():
    result = await nlp_pipeline("Will it rain in Chennai tomorrow?")
    assert result["intent"] == "forecast_query"
    assert result["lang"] == "en"
    assert result["slots"]["location"] == "Chennai"


@pytest.mark.asyncio
async def test_nlp_pipeline_fisherman_use_case():
    result = await nlp_pipeline("Is it safe to go fishing near Kochi tomorrow?")
    assert result["intent"] == "marine_advisory"
    assert result["use_case_context"] == "fisherman"
