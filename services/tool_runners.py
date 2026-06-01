"""
Compound tool runners for the Brick buyer agent.

Each _run_* function corresponds to a DATA_TOOLS declaration in tools.py.
They orchestrate multiple enrichment calls in parallel and return a single
merged dict that Gemini receives as a FunctionResponse.
"""

import asyncio

from services.enrichments import (
    assess_growth_outlook,
    fetch_listing_sources,
    fetch_long_term_factors,
    fetch_property_images,
    fetch_renovation_assessment,
    fetch_risk_assessment,
    fetch_sqm_data,
    fetch_street_info,
    fetch_suburb_stats,
)


async def run_fetch_suburb_data(
    suburb: str,
    state: str,
    postcode: str = "",
    extra_sources: list | None = None,
) -> dict:
    """Compound: suburb stats + SQM Research + long-term factors + growth outlook."""

    async def _empty() -> dict:
        return {}

    real, sqm, long_term = await asyncio.gather(
        asyncio.wait_for(fetch_suburb_stats(suburb, state, extra_sources=extra_sources), timeout=25),
        asyncio.wait_for(fetch_sqm_data(postcode), timeout=20) if postcode else _empty(),
        asyncio.wait_for(fetch_long_term_factors(suburb, state, extra_sources=extra_sources), timeout=25),
        return_exceptions=True,
    )
    real = real if isinstance(real, dict) else {}
    sqm = sqm if isinstance(sqm, dict) else {}
    long_term = long_term if isinstance(long_term, dict) else {}

    result = {**real, **sqm}
    for key, val in long_term.items():
        if isinstance(val, dict):
            result[f"{key}_verdict"] = val.get("verdict", "")
            result[f"{key}_reason"] = val.get("reason", "")

    try:
        outlook = await asyncio.wait_for(
            assess_growth_outlook(suburb, state, result), timeout=20
        )
        result = {**result, **outlook}
    except Exception:
        pass

    return result


async def run_fetch_property_data(
    address: str,
    suburb: str,
    state: str,
    extra_sources: list | None = None,
) -> dict:
    """Compound: listing images + street info + listing sources + renovation assessment."""
    sources_buf: list = extra_sources if extra_sources is not None else []

    images_result, street, _ = await asyncio.gather(
        asyncio.wait_for(
            fetch_property_images(address, suburb, state, extra_sources=sources_buf), timeout=20
        ),
        asyncio.wait_for(
            fetch_street_info(address, suburb, state, extra_sources=sources_buf), timeout=20
        ),
        asyncio.wait_for(
            fetch_listing_sources(address, suburb, state, sources_buf), timeout=15
        ),
        return_exceptions=True,
    )
    images = images_result if isinstance(images_result, list) else []
    street = street if isinstance(street, dict) else {}

    errors: list[str] = []
    if isinstance(images_result, BaseException):
        errors.append(f"images: {images_result}")
    if isinstance(street, BaseException):
        errors.append(f"street: {street}")

    reno: dict = {}
    if images:
        try:
            reno = await asyncio.wait_for(
                fetch_renovation_assessment(images, address), timeout=20
            )
        except Exception as exc:
            errors.append(f"reno: {exc}")

    result = {"images": images, **street, **reno}
    if errors:
        result["_errors"] = errors
    for src in sources_buf:
        url = src.get("url", "")
        if "realestate.com.au/property" in url and "listing_url" not in result:
            result["listing_url"] = url
        elif "domain.com.au/" in url and "domain_url" not in result:
            result["domain_url"] = url

    return result


async def run_fetch_risk_data(
    address: str,
    suburb: str,
    state: str = "NSW",
    postcode: str = "",
    extra_sources: list | None = None,
) -> dict:
    """Fetch noise, slope, and property history risk data for a property."""
    try:
        return await asyncio.wait_for(
            fetch_risk_assessment(address, suburb, state, postcode, extra_sources=extra_sources),
            timeout=25,
        )
    except Exception as exc:
        return {"_error": str(exc)}
