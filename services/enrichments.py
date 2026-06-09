"""
Low-level data-enrichment functions for the Brick buyer agent.

Each function makes targeted external calls (Gemini + Google Search,
SQM Research scraping, Google Maps / Overpass APIs, allhomes.com.au)
and returns a plain dict.  No SSE, no Gemini streaming — pure data fetch.
"""

import asyncio
import json
import math
import os
import re
import urllib.request

import httpx
from google.auth import aws
from google import genai
from google.genai import types

MODEL = "gemini-3.5-flash"

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

class _EcsAwsCredentialsSupplier(aws.AwsSecurityCredentialsSupplier):
    """Supplies AWS task role credentials from the ECS container endpoint."""

    def __init__(self) -> None:
        self._cached: aws.AwsSecurityCredentials | None = None

    def get_aws_region(self, context, request) -> str:
        region = os.environ.get("AWS_REGION") or os.environ.get("AWS_DEFAULT_REGION")
        if not region:
            raise RuntimeError("AWS_REGION or AWS_DEFAULT_REGION is required for AWS WIF")
        return region

    def get_aws_security_credentials(self, context, request) -> aws.AwsSecurityCredentials:
        if self._cached is not None:
            return self._cached

        full_uri = os.environ.get("AWS_CONTAINER_CREDENTIALS_FULL_URI")
        relative_uri = os.environ.get("AWS_CONTAINER_CREDENTIALS_RELATIVE_URI")
        if full_uri:
            credentials_url = full_uri
        elif relative_uri:
            credentials_url = f"http://169.254.170.2{relative_uri}"
        else:
            raise RuntimeError(
                "ECS task role credentials are unavailable. Configure a Task role "
                "so ECS injects AWS_CONTAINER_CREDENTIALS_RELATIVE_URI."
            )

        req = urllib.request.Request(credentials_url)
        auth_token = os.environ.get("AWS_CONTAINER_AUTHORIZATION_TOKEN")
        if auth_token:
            req.add_header("Authorization", auth_token)

        with urllib.request.urlopen(req, timeout=2) as resp:
            payload = json.loads(resp.read().decode("utf-8"))

        self._cached = aws.AwsSecurityCredentials(
            payload["AccessKeyId"],
            payload["SecretAccessKey"],
            payload.get("Token"),
        )
        return self._cached


def _ecs_wif_credentials() -> aws.Credentials:
    with open(os.environ["GOOGLE_APPLICATION_CREDENTIALS"], encoding="utf-8") as f:
        info = json.load(f)

    return aws.Credentials(
        audience=info["audience"],
        subject_token_type=info["subject_token_type"],
        token_url=info.get("token_url", "https://sts.googleapis.com/v1/token"),
        aws_security_credentials_supplier=_EcsAwsCredentialsSupplier(),
        service_account_impersonation_url=info.get("service_account_impersonation_url"),
        universe_domain=info.get("universe_domain", "googleapis.com"),
    )


def get_client() -> genai.Client:
    """Return a Gemini client.

    Prefers Vertex AI (GCP credits) when GOOGLE_CLOUD_PROJECT is set.
    Falls back to AI Studio API key when only GEMINI_API_KEY is present.
    Note: main.py removes GEMINI_API_KEY at startup in Vertex mode so the
    Interactions SDK doesn't accidentally use it over ADC.
    """
    project = os.environ.get("GOOGLE_CLOUD_PROJECT")
    if project:
        credentials = None
        if os.environ.get("AWS_CONTAINER_CREDENTIALS_RELATIVE_URI") or os.environ.get(
            "AWS_CONTAINER_CREDENTIALS_FULL_URI"
        ):
            credentials = _ecs_wif_credentials()

        return genai.Client(
            vertexai=True,
            credentials=credentials,
            project=project,
            location=os.environ.get("GOOGLE_CLOUD_LOCATION", "global"),
        )
    return genai.Client(api_key=os.environ["GEMINI_API_KEY"])


def sources_from_response(response) -> list[dict]:
    """Extract grounding web sources from a Gemini GenerateContentResponse."""
    sources = []
    try:
        for candidate in response.candidates or []:
            gm = getattr(candidate, "grounding_metadata", None)
            if not gm:
                continue
            for gc in gm.grounding_chunks or []:
                if gc.web and gc.web.uri:
                    sources.append({
                        "title": gc.web.title,
                        "url": gc.web.uri,
                        "domain": gc.web.domain,
                    })
    except Exception:
        pass
    return sources


async def _gemini_json(
    prompt: str, use_search: bool = True, extra_sources: list | None = None,
    timeout: float = 35.0,
) -> dict:
    """Run a single Gemini call (optionally with Search) and return parsed JSON."""
    client = get_client()
    try:
        config_args: dict = {"temperature": 0.1}
        if use_search:
            config_args["tools"] = [types.Tool(google_search=types.GoogleSearch())]

        async def _call():
            return await client.aio.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(**config_args),
            )

        response = await asyncio.wait_for(_call(), timeout=timeout)

        if extra_sources is not None:
            extra_sources.extend(sources_from_response(response))
        text = (response.text or "").strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception:
        return {}


# ---------------------------------------------------------------------------
# Suburb data
# ---------------------------------------------------------------------------

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


async def fetch_suburb_stats(
    suburb: str, state: str = "NSW", extra_sources: list | None = None
) -> dict:
    """Use Gemini + Google Search to get real suburb stats."""
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
        if extra_sources is not None:
            extra_sources.extend(sources_from_response(response))
        text = (response.text or "").strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        data = json.loads(text.strip())
        return {k: v for k, v in data.items() if v is not None}
    except Exception:
        return {}


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
  "short_term_outlook": "<Strong|Moderate|Weak|Caution>",
  "short_term_reason": "<1-sentence reason based on demand/supply metrics>",
  "long_term_outlook": "<Strong|Moderate|Weak|Caution>",
  "long_term_reason": "<1-sentence reason based on long-term price trend and fundamentals>"
}}"""


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


async def fetch_long_term_factors(
    suburb: str, state: str, extra_sources: list | None = None
) -> dict:
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
        if extra_sources is not None:
            extra_sources.extend(sources_from_response(response))
        text = (response.text or "").strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception:
        return {}


# ---------------------------------------------------------------------------
# Property data
# ---------------------------------------------------------------------------

_ALLHOMES_URL_PROMPT = """Search allhomes.com.au for the property listing at: {address}, {suburb}, {state}, Australia.

Search query: "{address} {suburb} {state} site:allhomes.com.au"

Once you find a result, verify it matches by checking that the URL contains the street number and street name from the address.

For example, if the address is "22 Addison Avenue, Roseville NSW", a valid URL would be:
https://www.allhomes.com.au/22-addison-avenue-roseville-nsw-2069
because it contains "22" and "addison-avenue".

If the URL does NOT match the address (wrong street number, wrong street name, or no address in path), return null.

Return ONLY the matching URL, or null if no confident match. No explanation."""


def _allhomes_url(address: str, suburb: str, state: str, postcode: str) -> str:
    """Construct allhomes.com.au listing URL from address components."""
    slug = re.sub(r"[^a-z0-9]+", "-", f"{address} {suburb} {state} {postcode}".lower()).strip("-")
    return f"https://www.allhomes.com.au/{slug}"


async def fetch_property_images(
    address: str, suburb: str, state: str = "NSW", postcode: str = "",
    extra_sources: list | None = None,
) -> list[str]:
    """Find allhomes listing URL via Gemini Search (fallback: construct URL), then scrape for images.
    Returns [] if URL not found, invalid, or no images scraped."""
    client = get_client()
    prompt = _ALLHOMES_URL_PROMPT.format(address=address, suburb=suburb, state=state)
    allhomes_url: str | None = None
    try:
        async def _search():
            return await client.aio.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                    temperature=0.1,
                ),
            )
        response = await asyncio.wait_for(_search(), timeout=20)
        if extra_sources is not None:
            extra_sources.extend(sources_from_response(response))
        text = (response.text or "").strip()
        match = re.search(r'https://www\.allhomes\.com\.au/[^\s"\'<>]+', text)
        if match:
            candidate = match.group(0).rstrip(".")
            path = candidate.replace("https://www.allhomes.com.au", "").strip("/")
            if path and not path.startswith("sale") and not path.startswith("search") and "-" in path:
                allhomes_url = candidate
    except Exception:
        pass

    # Fallback: construct URL from address components if Gemini didn't find one
    if not allhomes_url and postcode:
        allhomes_url = _allhomes_url(address, suburb, state, postcode)

    if not allhomes_url:
        return []

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-AU,en;q=0.9",
        }
        async with httpx.AsyncClient(follow_redirects=True, timeout=10) as client_http:
            resp = await client_http.get(allhomes_url, headers=headers)
            resp.raise_for_status()

        addr_parts = address.lower().split()
        street_number = addr_parts[0] if addr_parts else ""
        street_name_word = addr_parts[1] if len(addr_parts) > 1 else ""
        page_lower = resp.text.lower()
        if street_number and street_name_word:
            if street_number not in page_lower or street_name_word not in page_lower:
                return []

        seen: set[str] = set()
        images: list[str] = []
        media_match = re.search(
            r'"media":\{"items":\[(.+?)\],"__typename"',
            resp.text,
            re.DOTALL,
        )
        if media_match:
            for url_match in re.finditer(
                r'"imageSrc":"(https://images\.allhomes\.com\.au/property/photo/[a-f0-9_]+_hd\.jpg)"',
                media_match.group(1),
            ):
                url = url_match.group(1)
                if url not in seen:
                    seen.add(url)
                    images.append(url)
                if len(images) >= 10:
                    break
        return images
    except Exception:
        return []


async def fetch_listing_sources(
    address: str, suburb: str, state: str, out_sources: list
) -> None:
    """Force a Google Search for the property listing to collect grounding sources."""
    client = get_client()
    prompt = (
        f"Search for the current real estate listing for {address}, {suburb} {state} Australia. "
        f"Find it on realestate.com.au and domain.com.au. "
        f"What is the current asking price and key details?"
    )
    try:
        async def _search():
            return await client.aio.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                    temperature=0.1,
                ),
            )
        response = await asyncio.wait_for(_search(), timeout=20)
        out_sources.extend(sources_from_response(response))
    except Exception:
        pass


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


async def _geocode(
    http: httpx.AsyncClient, address: str, key: str
) -> tuple[float, float] | None:
    r = await http.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        params={"address": address, "key": key},
    )
    results = r.json().get("results", [])
    if not results:
        return None
    loc = results[0]["geometry"]["location"]
    return loc["lat"], loc["lng"]


def _bearing(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate compass bearing from point 1 to point 2 (degrees, 0=North)."""
    d_lng = math.radians(lng2 - lng1)
    lat1_r, lat2_r = math.radians(lat1), math.radians(lat2)
    x = math.sin(d_lng) * math.cos(lat2_r)
    y = math.cos(lat1_r) * math.sin(lat2_r) - math.sin(lat1_r) * math.cos(lat2_r) * math.cos(d_lng)
    return (math.degrees(math.atan2(x, y)) + 360) % 360


def _street_number(address: str) -> int | None:
    m = re.match(r"(\d+)", address.strip())
    return int(m.group(1)) if m else None


def _street_name(address: str) -> str:
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
        coords = await _geocode(http, f"{address}, {suburb}, {state}, Australia", maps_key)
        if not coords:
            return {}
        lat, lng = coords

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
                street_bearing = _bearing(lat, lng, nb_lat, nb_lng)
                facing_bearing = (street_bearing + 90) % 360
                orientation = _heading_to_compass(facing_bearing)
                sunlight_note = _SUNLIGHT_NOTES.get(orientation, "")

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


async def fetch_street_info(
    address: str, suburb: str, state: str = "NSW", extra_sources: list | None = None
) -> dict:
    """Run road/powerline (Gemini+Search) + layout/orientation (Maps APIs) in parallel."""
    road_prompt = _STREET_ROAD_PROMPT.format(address=address, suburb=suburb, state=state)
    road, layout = await asyncio.gather(
        _gemini_json(road_prompt, use_search=True, extra_sources=extra_sources),
        fetch_layout_info(address, suburb, state),
        return_exceptions=True,
    )
    road = road if isinstance(road, dict) else {}
    layout = layout if isinstance(layout, dict) else {}
    return {**road, **layout}


async def fetch_renovation_assessment(images: list[str], address: str) -> dict:
    """Use Gemini Vision to assess kitchen/bathroom renovation needs from listing photos."""
    if not images:
        return {}
    client = get_client()
    req_headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Referer": "https://www.allhomes.com.au/",
    }

    # Download up to 5 images in parallel (was sequential — 10 images × 10s = 100s worst case)
    async def _fetch_image(http: httpx.AsyncClient, url: str) -> types.Part | None:
        try:
            r = await http.get(url, headers=req_headers)
            if r.status_code == 200 and r.headers.get("content-type", "").startswith("image/"):
                mime = r.headers.get("content-type", "image/jpeg").split(";")[0]
                return types.Part.from_bytes(data=r.content, mime_type=mime)
        except Exception:
            pass
        return None

    async with httpx.AsyncClient(timeout=8, follow_redirects=True) as http:
        results = await asyncio.gather(*[_fetch_image(http, url) for url in images[:5]])
    image_parts: list[types.Part] = [p for p in results if p is not None]

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
        async def _vision():
            return await client.aio.models.generate_content(
                model=MODEL,
                contents=types.Content(role="user", parts=image_parts + [text_part]),
                config=types.GenerateContentConfig(temperature=0.1),
            )
        response = await asyncio.wait_for(_vision(), timeout=25)
        text = (response.text or "").strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception:
        return {}


# ---------------------------------------------------------------------------
# Risk assessment
# ---------------------------------------------------------------------------

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


async def fetch_risk_assessment(
    address: str,
    suburb: str,
    state: str = "NSW",
    postcode: str = "",
    extra_sources: list | None = None,
) -> dict:
    """Run noise + history risk checks in parallel, each as a separate Gemini+Search call."""
    noise_prompt = _RISK_NOISE_PROMPT.format(
        address=address, suburb=suburb, state=state, postcode=postcode
    )
    history_prompt = _RISK_HISTORY_PROMPT.format(
        address=address, suburb=suburb, state=state, postcode=postcode
    )
    noise, history = await asyncio.gather(
        _gemini_json(noise_prompt, extra_sources=extra_sources),
        _gemini_json(history_prompt, extra_sources=extra_sources),
        return_exceptions=True,
    )
    noise = noise if isinstance(noise, dict) else {}
    history = history if isinstance(history, dict) else {}
    return {
        **noise,
        **history,
        "builder_name": None,
        "builder_quality": "Unknown",
        "builder_note": None,
    }
