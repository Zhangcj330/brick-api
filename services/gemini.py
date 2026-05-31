"""
Agentic tool loop — Copilot / Claude Code style.

Each round:
  1. Stream model response (text_delta + tool_call events)
  2. If tool calls fired → "execute" them (emit to frontend), feed dummy
     FunctionResponse back, start next round
  3. If no tool calls → done

Model: gemini-3.5-flash
Tools: google_search (grounding) + function_declarations (Gen UI)
"""

import asyncio
import json
import os
import re
import time
import uuid
from typing import AsyncGenerator

import httpx
from google import genai
from google.genai import types
from langfuse import Langfuse
from langfuse.types import TraceContext

from models.schemas import Message
from prompts.buyer_agent import SYSTEM_PROMPT
from services.tools import UI_TOOLS

MODEL = "gemini-3.5-flash"
MAX_ROUNDS = 5
MAX_MESSAGES = 40
_RISK_KW = {"flood", "bushfire", "overpriced", "heritage", "contamination"}

_SUBURB_STATS_PROMPT = """Search the web and return ONLY a JSON object (no markdown, no explanation) with current real estate statistics for {suburb}, {state}, Australia.

Fields to return:
{{
  "median_price": <integer, median house price AUD>,
  "clearance_rate": <float, auction clearance rate %>,
  "growth_12mo": <float, 12-month price growth %>,
  "rental_yield": <float, gross rental yield %>,
  "days_on_market": <integer, median days on market>,
  "crime_rate": <integer, total crime incidents per 1000 residents per year — search "{suburb} {state} crime statistics BOCSAR" or "crime rate {suburb} {state} Australia">,
  "crime_label": <string, one of "Very Low" | "Low" | "Moderate" | "High" | "Very High" based on crime_rate relative to state average>,
  "source_note": <string, e.g. "Domain.com.au, May 2025">
}}

Search queries to use: "{suburb} {state} median house price 2025", "{suburb} clearance rate auction results", "{suburb} rental yield days on market", "{suburb} {state} crime rate statistics".
Return only the JSON object. Use null for any field you cannot find."""

async def fetch_sqm_data(postcode: str) -> dict:
    """Scrape SQM Research for vacancy rate, stock on market, and historical price growth."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
    }
    result = {}
    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        # Vacancy Rate
        try:
            r = await client.get(
                f"https://sqmresearch.com.au/property/vacancy-rates?postcode={postcode}&t=1",
                headers=headers,
            )
            if r.status_code == 200:
                m = re.search(r"var data = (\[.*?\]);", r.text, re.DOTALL)
                if m:
                    rows = json.loads(m.group(1))
                    latest = rows[-1]
                    result["vacancy_rate"] = round(float(latest["vr"]) * 100, 2)
        except Exception:
            pass

        # Stock on Market
        try:
            r = await client.get(
                f"https://sqmresearch.com.au/property/total-property-listings?postcode={postcode}&t=1",
                headers=headers,
            )
            if r.status_code == 200:
                m = re.search(r"var data = (\[.*?\]);", r.text, re.DOTALL)
                if m:
                    rows = json.loads(m.group(1))
                    latest = rows[-1]
                    total = sum(latest.get(k, 0) for k in ("r30", "r60", "r90", "r180", "r180p"))
                    result["stock_on_market"] = total
        except Exception:
            pass

        # Historical asking price growth (weekly data → compute 1yr/5yr/10yr)
        try:
            r = await client.get(
                f"https://sqmresearch.com.au/property/asking-property-prices?postcode={postcode}&t=1",
                headers=headers,
            )
            if r.status_code == 200:
                m = re.search(r"var data = (\[.*?\]);", r.text, re.DOTALL)
                if m:
                    rows = json.loads(m.group(1))
                    # Filter rows with valid house price
                    rows = [row for row in rows if row.get("houses_all")]
                    if len(rows) >= 52:
                        latest_price = rows[-1]["houses_all"]
                        price_1yr_ago = rows[-52]["houses_all"] if len(rows) >= 52 else None
                        price_5yr_ago = rows[-260]["houses_all"] if len(rows) >= 260 else None
                        price_10yr_ago = rows[-520]["houses_all"] if len(rows) >= 520 else None
                        if price_1yr_ago:
                            result["growth_1yr"] = round((latest_price / price_1yr_ago - 1) * 100, 1)
                        if price_5yr_ago:
                            result["growth_5yr"] = round((latest_price / price_5yr_ago - 1) * 100, 1)
                        if price_10yr_ago:
                            result["growth_10yr"] = round((latest_price / price_10yr_ago - 1) * 100, 1)
        except Exception:
            pass

    return result


_GROWTH_OUTLOOK_PROMPT = """You are a senior Australian property analyst. Based on the data below for {suburb}, {state}, assess the growth outlook.

Data:
- Vacancy rate: {vacancy_rate}% (low <2% = strong demand, high >3% = oversupply)
- Stock on market: {stock_on_market} listings
- Days on market: {days_on_market} days (low <30 = tight market)
- Clearance rate: {clearance_rate}% (high >70% = strong demand)
- Rental yield: {rental_yield}% (high >4% = investment attractive)
- 1-year price growth: {growth_1yr}%
- 5-year price growth: {growth_5yr}%
- 10-year price growth: {growth_10yr}%

Return ONLY a JSON object (no markdown):
{{
  "short_term_outlook": "<Strong|Moderate|Neutral|Weak|Caution>",
  "short_term_reason": "<1-sentence reason based on demand/supply metrics>",
  "long_term_outlook": "<Strong|Moderate|Neutral|Weak|Caution>",
  "long_term_reason": "<1-sentence reason based on long-term price trend and fundamentals>"
}}"""

_LONG_TERM_FACTORS_PROMPT = """You are a senior Australian property analyst. Research {suburb}, {state}, Australia and assess these four long-term investment factors.

Search for:
- Economic: major employers and job hubs nearby, planned infrastructure (metro, roads, hospitals, commercial precincts), employment growth trends
- Affordability: median household income for {suburb}, price-to-income ratio, rent-to-income ratio, whether prices are stretched vs fundamentals
- Lifestyle & Education: top primary and secondary schools in the catchment with ICSEA/NAPLAN standing, walkability, safety, parks, cafes, transport access, community demographics
- Supply: search for "{suburb} developable land rezoning", "{suburb} building approvals DA", "{suburb} new apartment development pipeline". Assess whether significant new supply (large rezoned land parcels, high building approval volumes, major apartment pipelines) could pressure prices, or whether the suburb is land-constrained with low supply risk.

Return ONLY a JSON object (no markdown, no explanation):
{{
  "economic": {{
    "verdict": "<Strong|Moderate|Neutral|Weak>",
    "reason": "<1-2 sentences on employment hubs and infrastructure pipeline>"
  }},
  "affordability": {{
    "verdict": "<Strong|Moderate|Neutral|Challenging>",
    "reason": "<1-2 sentences on income levels, price-to-income ratio, and value vs peers>"
  }},
  "lifestyle_education": {{
    "verdict": "<Strong|Moderate|Neutral|Weak>",
    "reason": "<1-2 sentences on school quality, amenities, and liveability>"
  }},
  "supply": {{
    "verdict": "<Low Risk|Moderate|High Risk>",
    "reason": "<1-2 sentences on developable land availability, building approvals volume, and new development pipeline>"
  }}
}}"""


async def fetch_long_term_factors(suburb: str, state: str) -> dict:
    """Use Gemini + Google Search to research Economic, Affordability, and Lifestyle & Education."""
    client = get_client()
    prompt = _LONG_TERM_FACTORS_PROMPT.format(suburb=suburb, state=state)
    try:
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                temperature=0.1,
            ),
        )
        text = (response.text or "").strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception:
        return {}


async def assess_growth_outlook(suburb: str, state: str, metrics: dict) -> dict:
    """Ask Gemini to assess short-term and long-term growth outlook based on enriched metrics."""
    client = get_client()
    prompt = _GROWTH_OUTLOOK_PROMPT.format(
        suburb=suburb,
        state=state,
        vacancy_rate=metrics.get("vacancy_rate", "unknown"),
        stock_on_market=metrics.get("stock_on_market", "unknown"),
        days_on_market=metrics.get("days_on_market", "unknown"),
        clearance_rate=metrics.get("clearance_rate", "unknown"),
        rental_yield=metrics.get("rental_yield", "unknown"),
        growth_1yr=metrics.get("growth_1yr", "unknown"),
        growth_5yr=metrics.get("growth_5yr", "unknown"),
        growth_10yr=metrics.get("growth_10yr", "unknown"),
    )
    try:
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.1),
        )
        text = (response.text or "").strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception:
        return {}


_STREET_ROAD_PROMPT = """You are an Australian property analyst. Check two street-level factors for this property.

Address: {address}, {suburb}, {state}, Australia

Search for: "{address} {suburb} road powerlines"

1. Main road: Is this on a major arterial/highway? (Parramatta Rd, Pacific Hwy, Canterbury Rd etc.)
2. Power lines: High-voltage lines or pylons near/fronting the property?

Return ONLY a JSON object (no markdown):
{{
  "on_main_road": <true|false>,
  "main_road_note": "<e.g. 'Fronts Parramatta Rd — traffic noise' or 'Quiet residential street'>",
  "powerlines_nearby": <true|false>,
  "powerlines_note": "<e.g. 'Transmission corridor 80m north' or 'No powerline infrastructure'>"
}}"""

_BEARING_TO_COMPASS = [
    (22.5,  "North-facing"),
    (67.5,  "Northeast-facing"),
    (112.5, "East-facing"),
    (157.5, "Southeast-facing"),
    (202.5, "South-facing"),
    (247.5, "Southwest-facing"),
    (292.5, "West-facing"),
    (337.5, "Northwest-facing"),
    (360.0, "North-facing"),
]

_SUNLIGHT_NOTES = {
    "North-facing":     "North-facing — excellent natural light year-round (ideal in Australia)",
    "Northeast-facing": "Northeast-facing — good morning light, bright and comfortable",
    "East-facing":      "East-facing — morning sun, cooler afternoons",
    "Southeast-facing": "Southeast-facing — limited direct sun, can feel cooler",
    "South-facing":     "South-facing — limited natural light, may feel dark in winter",
    "Southwest-facing": "Southwest-facing — afternoon sun, can get hot in summer",
    "West-facing":      "West-facing — harsh afternoon sun, hot in summer",
    "Northwest-facing": "Northwest-facing — afternoon warmth, reasonable light",
}


def _heading_to_compass(heading: float) -> str:
    for threshold, label in _BEARING_TO_COMPASS:
        if heading < threshold:
            return label
    return "North-facing"


async def _geocode(http: httpx.AsyncClient, address: str, key: str) -> tuple[float, float] | None:
    r = await http.get("https://maps.googleapis.com/maps/api/geocode/json", params={"address": address, "key": key})
    results = r.json().get("results", [])
    if not results:
        return None
    loc = results[0]["geometry"]["location"]
    return loc["lat"], loc["lng"]


def _bearing(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate compass bearing from point 1 to point 2 (degrees, 0=North)."""
    import math
    d_lng = math.radians(lng2 - lng1)
    lat1_r, lat2_r = math.radians(lat1), math.radians(lat2)
    x = math.sin(d_lng) * math.cos(lat2_r)
    y = math.cos(lat1_r) * math.sin(lat2_r) - math.sin(lat1_r) * math.cos(lat2_r) * math.cos(d_lng)
    bearing = (math.degrees(math.atan2(x, y)) + 360) % 360
    return bearing


def _street_number(address: str) -> int | None:
    """Extract leading street number from address string."""
    import re
    m = re.match(r"(\d+)", address.strip())
    return int(m.group(1)) if m else None


def _street_name(address: str) -> str:
    """Strip leading number and return rest of address."""
    import re
    return re.sub(r"^\d+\s*", "", address.strip())


async def fetch_layout_info(address: str, suburb: str, state: str) -> dict:
    """
    Accurate orientation + T-junction using Google Maps Geocoding + OpenStreetMap Overpass.

    Orientation: geocode address + neighbour → street bearing → perpendicular = house facing direction
    T-junction: Overpass query counts road ways meeting at the nearest node
    """
    maps_key = os.environ.get("GOOGLE_MAPS_API_KEY", "")
    if not maps_key:
        return {}

    async with httpx.AsyncClient(timeout=10) as http:
        # ── 1. Geocode the property ──────────────────────────────────────────
        coords = await _geocode(http, f"{address}, {suburb}, {state}, Australia", maps_key)
        if not coords:
            return {}
        lat, lng = coords

        # ── 2. Orientation via street bearing ────────────────────────────────
        # Geocode a neighbour address (+2 or -2) to get street direction
        num = _street_number(address)
        street = _street_name(address)
        orientation: str | None = None
        sunlight_note: str | None = None

        if num is not None and street:
            neighbour_num = num + 2 if num % 2 == 0 else num + 2
            neighbour_addr = f"{neighbour_num} {street}"
            nb_coords = await _geocode(http, f"{neighbour_addr}, {suburb}, {state}, Australia", maps_key)
            if nb_coords:
                nb_lat, nb_lng = nb_coords
                street_bearing = _bearing(lat, lng, nb_lat, nb_lng)  # direction along street
                # House faces perpendicular to street → two options, 90° apart
                # The front faces toward the street: if house is on N side of E-W road → faces South
                # We pick the facing that's most "toward street" by checking which perpendicular
                # points more toward the street center (lower address numbers = toward city center)
                facing_bearing = (street_bearing + 90) % 360   # right-perpendicular
                alt_bearing    = (street_bearing - 90) % 360   # left-perpendicular
                # In Australia even numbers right side going away from city, odd left
                # For simplicity: use the perpendicular closest to South (most common N-facing blocks)
                # Better heuristic: choose bearing that differs most from street_bearing itself
                orientation = _heading_to_compass(facing_bearing)
                sunlight_note = _SUNLIGHT_NOTES.get(orientation, "")

        # ── 3. T-junction via Overpass API ──────────────────────────────────
        # Find road nodes within 20m of property, check if any node connects exactly 3 ways
        t_junction = False
        t_junction_note = "No T-junction concern"

        overpass_query = f"""
[out:json][timeout:8];
(
  way(around:60,{lat},{lng})["highway"]["highway"!~"footway|path|cycleway|service|pedestrian"];
);
node(w)->.allnodes;
node.allnodes(around:20,{lat},{lng})->.near;
foreach.near(
  way(bn)["highway"]["highway"!~"footway|path|cycleway|service|pedestrian"]->.connected;
  (.connected; .near;)->._;
  out count;
);
"""
        try:
            ov_r = await http.post(
                "https://overpass-api.de/api/interpreter",
                data={"data": overpass_query},
                timeout=8,
            )
            elements = ov_r.json().get("elements", [])
            # Each "count" block tells us how many ways connect to a nearby node
            for el in elements:
                if el.get("type") == "count":
                    way_count = int(el.get("tags", {}).get("ways", 0))
                    if way_count == 3:
                        t_junction = True
                        t_junction_note = "Property sits at a T-junction (路冲) — road points directly at front of house"
                        break
        except Exception:
            t_junction_note = "No T-junction data available"

        result: dict = {"t_junction": t_junction, "t_junction_note": t_junction_note}
        if orientation:
            result["orientation"] = orientation
            result["sunlight_note"] = sunlight_note
        return result


async def fetch_street_info(address: str, suburb: str, state: str = "NSW") -> dict:
    """Run road/powerline (Gemini+Search) + layout/orientation (Maps APIs) in parallel."""
    road_prompt = _STREET_ROAD_PROMPT.format(address=address, suburb=suburb, state=state)

    road, layout = await asyncio.gather(
        _gemini_json(road_prompt, use_search=True),
        fetch_layout_info(address, suburb, state),
        return_exceptions=True,
    )
    road   = road   if isinstance(road,   dict) else {}
    layout = layout if isinstance(layout, dict) else {}
    return {**road, **layout}


async def fetch_renovation_assessment(images: list[str], address: str) -> dict:
    """Fetch up to 4 listing photos and use Gemini Vision to assess kitchen/bathroom renovation needs."""
    if not images:
        return {}
    client = get_client()
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Referer": "https://www.allhomes.com.au/",
    }
    image_parts: list[types.Part] = []
    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as http:
        for url in images[:10]:
            try:
                r = await http.get(url, headers=headers)
                if r.status_code == 200 and r.headers.get("content-type", "").startswith("image/"):
                    mime = r.headers.get("content-type", "image/jpeg").split(";")[0]
                    image_parts.append(types.Part.from_bytes(data=r.content, mime_type=mime))
            except Exception:
                pass
    if not image_parts:
        return {}

    text_part = types.Part(text=f"""These are listing photos for {address}.
Identify which photos show the kitchen and bathroom. Assess their condition.

Return ONLY a JSON object (no markdown):
{{
  "kitchen_condition": "<Excellent|Good|Fair|Poor>",
  "bathroom_condition": "<Excellent|Good|Fair|Poor>",
  "renovation_needed": <true if kitchen or bathroom clearly needs updating, false otherwise>,
  "renovation_note": "<1-sentence summary, e.g. 'Dated kitchen and original bathroom tiles — budget for renovation'>"
}}
If you cannot identify a kitchen or bathroom photo, set condition to null.""")

    try:
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=types.Content(role="user", parts=image_parts + [text_part]),
            config=types.GenerateContentConfig(temperature=0.1),
        )
        text = (response.text or "").strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception:
        return {}


_RISK_NOISE_PROMPT = """You are an Australian property analyst. Search for noise risks affecting this suburb/address.

Address: {address}, {suburb}, {state} {postcode}, Australia

Search for: "{suburb} {state} flight path ANEF airport noise train line railway"

Return ONLY a JSON object (no markdown):
{{
  "noise_level": "<Low|Moderate|High>",
  "noise_sources": ["<e.g. 'Sydney Airport ANEF 20 contour', 'T3 Liverpool Line 300m east', 'Parramatta Rd traffic'>"],
  "noise_note": "<1-sentence summary>"
}}"""

_RISK_HISTORY_PROMPT = """You are an Australian property analyst. Assess land and property risk for this address.

Address: {address}, {suburb}, {state} {postcode}, Australia

Using your knowledge (search if needed): flood zone, terrain/slope, pest/termite risk, strata issues.

Return ONLY a JSON object (no markdown):
{{
  "land_slope": "<Flat|Gentle Slope|Steep Slope>",
  "land_slope_note": "<short note>",
  "property_history_flags": ["<e.g. 'Flood-prone — check council flood map', 'High termite risk area', 'Strata — check special levies'>"],
  "property_history_note": "<1-sentence or null>",
  "needs_inspection": <true|false>,
  "needs_pest_control": <true|false>,
  "due_diligence_note": "<1-sentence recommendation>"
}}"""


async def _gemini_json(prompt: str, use_search: bool = True) -> dict:
    """Run a single Gemini call (optionally with Search) and return parsed JSON."""
    client = get_client()
    try:
        config_args: dict = {"temperature": 0.1}
        if use_search:
            config_args["tools"] = [types.Tool(google_search=types.GoogleSearch())]
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(**config_args),
        )
        text = (response.text or "").strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception:
        return {}


async def fetch_risk_assessment(address: str, suburb: str, state: str = "NSW", postcode: str = "") -> dict:
    """Run noise + history risk checks in parallel, each as a separate Gemini+Search call."""
    noise_prompt   = _RISK_NOISE_PROMPT.format(address=address, suburb=suburb, state=state, postcode=postcode)
    history_prompt = _RISK_HISTORY_PROMPT.format(address=address, suburb=suburb, state=state, postcode=postcode)

    noise, history = await asyncio.gather(
        _gemini_json(noise_prompt),
        _gemini_json(history_prompt),
        return_exceptions=True,
    )
    noise   = noise   if isinstance(noise,   dict) else {}
    history = history if isinstance(history, dict) else {}
    return {
        **noise,
        **history,
        "builder_name": None,
        "builder_quality": "Unknown",
        "builder_note": None,
    }


_ALLHOMES_URL_PROMPT = """Search allhomes.com.au for the property listing at: {address}, {suburb}, {state}, Australia.

Return ONLY the single allhomes.com.au listing URL for this property. No explanation, just the URL.
Example format: https://www.allhomes.com.au/22-addison-avenue-roseville-nsw-2069

Search query: "{address} {suburb} {state} site:allhomes.com.au"
If no exact match, return the closest listing URL from allhomes.com.au. Return empty string if nothing found."""


def get_client() -> genai.Client:
    return genai.Client(api_key=os.environ["GEMINI_API_KEY"])


def _get_langfuse() -> Langfuse | None:
    try:
        lf = Langfuse(
            public_key=os.environ["LANGFUSE_PUBLIC_KEY"],
            secret_key=os.environ["LANGFUSE_SECRET_KEY"],
            host=os.environ.get("LANGFUSE_HOST", "https://cloud.langfuse.com"),
        )
        return lf
    except KeyError:
        return None


def _build_config() -> types.GenerateContentConfig:
    return types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        tools=[
            types.Tool(google_search=types.GoogleSearch()),
            types.Tool(function_declarations=UI_TOOLS),
        ],
        temperature=0.4,
        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
        tool_config=types.ToolConfig(
            function_calling_config=types.FunctionCallingConfig(mode="AUTO"),
            include_server_side_tool_invocations=True,
        ),
    )


async def fetch_suburb_stats(suburb: str, state: str = "NSW") -> dict:
    """Use a dedicated Gemini + Google Search call to get real suburb stats."""
    client = get_client()
    prompt = _SUBURB_STATS_PROMPT.format(suburb=suburb, state=state)
    try:
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                temperature=0.1,
            ),
        )
        text = response.text or ""
        # Strip markdown code fences if present
        text = text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        data = json.loads(text)
        # Remove null values so model estimates are preserved for missing fields
        return {k: v for k, v in data.items() if v is not None}
    except Exception:
        return {}


async def fetch_property_images(address: str, suburb: str, state: str = "NSW") -> list[str]:
    """Step 1: Ask Gemini to find the allhomes.com.au listing URL.
    Step 2: Scrape that URL for image URLs."""
    client = get_client()

    # Step 1: Gemini finds the listing URL
    prompt = _ALLHOMES_URL_PROMPT.format(address=address, suburb=suburb, state=state)
    try:
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                temperature=0.1,
            ),
        )
        listing_url = (response.text or "").strip()
        # Extract a valid allhomes URL if surrounded by text
        match = re.search(r'https://www\.allhomes\.com\.au/[^\s"\'<>]+', listing_url)
        if not match:
            return []
        listing_url = match.group(0).rstrip(".")
    except Exception:
        return []

    # Step 2: Scrape the listing page for images
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-AU,en;q=0.9",
        }
        async with httpx.AsyncClient(follow_redirects=True, timeout=10) as client_http:
            resp = await client_http.get(listing_url, headers=headers)
            resp.raise_for_status()

        # Images are embedded in JSON within <script> tags — use regex on raw HTML
        seen: set[str] = set()
        images: list[str] = []

        for match in re.finditer(
            r'https://images\.allhomes\.com\.au/property/photo/[a-f0-9_]+_hd\.jpg',
            resp.text,
        ):
            url = match.group(0)
            if url not in seen:
                seen.add(url)
                images.append(url)
            if len(images) >= 8:
                break

        return images
    except Exception:
        return []


def _to_contents(messages: list[Message]) -> list[types.Content]:
    contents = []
    for msg in messages:
        role = "model" if msg.role == "assistant" else "user"
        contents.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))
    return contents



    contents = []
    for msg in messages:
        role = "model" if msg.role == "assistant" else "user"
        contents.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))
    return contents


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


async def stream_chat(
    messages: list[Message], session_id: str
) -> AsyncGenerator[str, None]:
    messages = messages[-MAX_MESSAGES:]
    if not messages:
        yield _sse({"type": "error", "message": "No messages provided"})
        yield _sse({"type": "done"})
        return

    client = get_client()
    contents = _to_contents(messages)
    config = _build_config()
    lf = _get_langfuse()

    all_text: list[str] = []
    tools_called: list[str] = []
    all_grounding_sources: list[dict] = []
    all_grounding_supports: list[dict] = []  # accumulated across all rounds
    trace_obs = None

    if lf:
        trace_obs = lf.start_observation(
            name="buyer-agent-chat",
            as_type="agent",
            trace_context=TraceContext(session_id=session_id, tags=["chat", "buyer-agent"]),
            input=messages[-1].content,
        )

    try:
        for _round in range(MAX_ROUNDS):
            accumulated_text = ""
            fn_call_parts: list[types.Part] = []
            seen_names: set[str] = set()
            seen_tool_calls: list[dict] = []
            round_start = time.time()
            ttft: float | None = None

            gen_obs = None
            if lf and trace_obs:
                gen_obs = lf.start_observation(
                    name=f"round-{_round + 1}",
                    as_type="generation",
                    model=MODEL,
                    input=messages[-1].content,  # last user message for clarity
                )

            # ── Stream one round ──────────────────────────────────────────
            grounding_queries: list[str] = []
            round_sources: list[dict] = []
            round_supports: list[dict] = []
            tool_results: dict[str, dict] = {}  # name → enriched args to feed back to Gemini
            async for chunk in await client.aio.models.generate_content_stream(
                model=MODEL,
                contents=contents,
                config=config,
            ):
                # Stream text
                if chunk.text:
                    if ttft is None:
                        ttft = round(time.time() - round_start, 3)
                    accumulated_text += chunk.text
                    yield _sse({"type": "text_delta", "content": chunk.text})

                # Collect function calls (deduplicated) + grounding metadata
                if chunk.candidates:
                    for candidate in chunk.candidates:
                        if ttft is None and candidate.content and candidate.content.parts:
                            ttft = round(time.time() - round_start, 3)
                        # Capture Google Search grounding data
                        if candidate.grounding_metadata:
                            gm = candidate.grounding_metadata
                            if gm.web_search_queries:
                                grounding_queries.extend(gm.web_search_queries)
                            if gm.grounding_chunks:
                                for gc in gm.grounding_chunks:
                                    if gc.web:
                                        round_sources.append({
                                            "title": gc.web.title,
                                            "url": gc.web.uri,
                                            "domain": gc.web.domain,
                                        })
                            if gm.grounding_supports:
                                for gs in gm.grounding_supports:
                                    support = {
                                        "text": gs.segment.text if gs.segment else None,
                                        "source_indices": list(gs.grounding_chunk_indices or []),
                                        "confidence": [round(s, 3) for s in (gs.confidence_scores or [])],
                                    }
                                    if support["text"]:
                                        round_supports.append(support)

                        if not candidate.content or not candidate.content.parts:
                            continue
                        for part in candidate.content.parts:
                            if not part.function_call:
                                continue
                            fc = part.function_call
                            if fc.name in seen_names:
                                continue
                            seen_names.add(fc.name)
                            seen_tool_calls.append({"name": fc.name, "args": dict(fc.args) if fc.args else {}})
                            fn_call_parts.append(part)

                            args = dict(fc.args) if fc.args else {}
                            tools_called.append(fc.name)

                            # For suburb stats: fetch real data via Google Search + SQM Research
                            if fc.name == "show_suburb_stats":
                                suburb_name = args.get("suburb", "")
                                state_name = args.get("state", "NSW")
                                postcode = args.get("postcode", "")

                                async def _empty() -> dict:
                                    return {}

                                # Run enrichment calls in parallel
                                real, sqm, long_term = await asyncio.gather(
                                    asyncio.wait_for(fetch_suburb_stats(suburb_name, state_name), timeout=25),
                                    asyncio.wait_for(fetch_sqm_data(postcode), timeout=20) if postcode else _empty(),
                                    asyncio.wait_for(fetch_long_term_factors(suburb_name, state_name), timeout=25),
                                    return_exceptions=True,
                                )
                                real      = real      if isinstance(real,      dict) else {}
                                sqm       = sqm       if isinstance(sqm,       dict) else {}
                                long_term = long_term if isinstance(long_term, dict) else {}
                                args = {**args, **real, **sqm}
                                # Short/long-term growth outlook from combined metrics
                                try:
                                    outlook = await asyncio.wait_for(assess_growth_outlook(suburb_name, state_name, args), timeout=20)
                                except Exception:
                                    outlook = {}
                                # Flatten long_term factor dicts into top-level keys
                                for key, val in long_term.items():
                                    if isinstance(val, dict):
                                        args[f"{key}_verdict"] = val.get("verdict", "")
                                        args[f"{key}_reason"] = val.get("reason", "")
                                args = {**args, **outlook}

                            # For property card: fetch real listing images via Google Search
                            if fc.name == "show_property_card":
                                addr = args.get("address", "")
                                sub = args.get("suburb", "")
                                st = args.get("state", "NSW")
                                pc = args.get("postcode", "")
                                # Fetch images, street info, and risk assessment in parallel (20s timeout each)
                                real_images, street, risk = await asyncio.gather(
                                    asyncio.wait_for(fetch_property_images(addr, sub, st), timeout=20),
                                    asyncio.wait_for(fetch_street_info(addr, sub, st), timeout=20),
                                    asyncio.wait_for(fetch_risk_assessment(addr, sub, st, pc), timeout=25),
                                    return_exceptions=True,
                                )
                                real_images = real_images if isinstance(real_images, list) else []
                                street      = street      if isinstance(street,      dict) else {}
                                risk        = risk        if isinstance(risk,        dict) else {}
                                if real_images:
                                    args["images"] = real_images
                                args = {**args, **street, **risk}
                                # Analyse kitchen/bathroom photos for renovation needs
                                final_images = args.get("images", [])
                                if final_images:
                                    try:
                                        reno = await asyncio.wait_for(fetch_renovation_assessment(final_images, addr), timeout=20)
                                    except Exception:
                                        reno = {}
                                    args = {**args, **reno}

                            # Store enriched args so we can feed them back to Gemini
                            tool_results[fc.name] = args

                            # Track tool call as a span in Langfuse
                            if lf and trace_obs:
                                tool_span = trace_obs.start_observation(
                                    name=fc.name,
                                    as_type="span",
                                    input=args,
                                )
                                tool_span.update(
                                    output={"status": "ok", "rendered": "UI component displayed to user"},
                                )
                                tool_span.end()

                            # Emit tool call → frontend renders the component
                            yield _sse({
                                "type": "tool_call",
                                "id": str(uuid.uuid4()),
                                "name": fc.name,
                                "args": args,
                            })

                            # Surface embedded warnings
                            for w in args.get("warnings", []):
                                level = "high" if any(
                                    kw in w.lower() for kw in _RISK_KW
                                ) else "medium"
                                yield _sse({"type": "warning", "level": level, "text": w})

            round_duration = round(time.time() - round_start, 3)

            # Build meaningful output for Langfuse: text + any tool calls
            if accumulated_text and seen_tool_calls:
                gen_output = {"text": accumulated_text, "tool_calls": seen_tool_calls}
            elif accumulated_text:
                gen_output = accumulated_text
            elif seen_tool_calls:
                gen_output = {"tool_calls": seen_tool_calls}
            else:
                gen_output = None

            if gen_obs:
                gen_obs.update(
                    output=gen_output,
                    metadata={
                        "tools": list(seen_names),
                        "round": _round + 1,
                        "ttft_seconds": ttft,
                        "round_duration_seconds": round_duration,
                        "search_queries": grounding_queries,
                        "search_sources": round_sources[:10],
                        "grounding_supports": round_supports,
                    },
                )
                gen_obs.end()

            # Accumulate sources + supports across rounds
            all_grounding_sources.extend(round_sources)
            all_grounding_supports.extend(round_supports)

            # Remove per-round sources emit (now done after all rounds)

            if accumulated_text:
                all_text.append(accumulated_text)

            # ── No tool calls → conversation turn complete ────────────────
            if not fn_call_parts:
                break

            # ── Tool calls fired → build next turn ────────────────────────
            # IMPORTANT: use the raw Part objects from the stream — they carry
            # thought_signature which Gemini 3.5 Flash requires in multi-turn.
            model_parts: list[types.Part] = []
            if accumulated_text:
                model_parts.append(types.Part(text=accumulated_text))
            model_parts.extend(fn_call_parts)  # raw Parts with thought_signature intact

            # Function responses — include enriched data so Gemini can analyse it
            fn_resp_parts = [
                types.Part.from_function_response(
                    name=p.function_call.name,
                    response=tool_results.get(p.function_call.name, {"status": "ok"}),
                )
                for p in fn_call_parts
            ]

            # Extend history and loop
            contents = contents + [
                types.Content(role="model", parts=model_parts),
                types.Content(role="user", parts=fn_resp_parts),
            ]

        if trace_obs:
            trace_obs.update(
                output=" ".join(all_text),
                metadata={"tools_called": tools_called},
            )
            trace_obs.end()
            lf.flush()

        # Emit all accumulated sources (deduped) + supports after final text delta
        if all_grounding_sources:
            seen_urls: set[str] = set()
            unique_sources = []
            for s in all_grounding_sources:
                if s["url"] not in seen_urls:
                    seen_urls.add(s["url"])
                    unique_sources.append(s)
            yield _sse({"type": "sources", "items": unique_sources[:10]})

            if all_grounding_supports:
                yield _sse({"type": "supports", "items": all_grounding_supports})

        yield _sse({"type": "done"})

    except Exception as exc:  # noqa: BLE001
        if trace_obs:
            trace_obs.update(metadata={"error": str(exc)})
            trace_obs.end()
            lf.flush()
        yield _sse({"type": "error", "message": str(exc)})
        yield _sse({"type": "done"})
