"""
UI tool definitions for Gemini function calling.
Each tool drives a React component in the Gen UI panel.
"""

UI_TOOLS = [
    {
        "name": "show_property_card",
        "description": (
            "Display a property card with photo, address, price, and key stats. "
            "Call this whenever you present a specific property listing."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "address": {"type": "string", "description": "Full street address"},
                "suburb": {"type": "string"},
                "state": {"type": "string"},
                "postcode": {"type": "string"},
                "price": {"type": "integer", "description": "Listing price in AUD"},
                "bedrooms": {"type": "integer"},
                "bathrooms": {"type": "integer"},
                "parking": {"type": "integer"},
                "land_sqm": {"type": "integer"},
                "days_on_market": {"type": "integer"},
                "suburb_median": {"type": "integer", "description": "Suburb median price in AUD for same property type"},
                "price_delta_pct": {"type": "number", "description": "% difference from suburb median (positive = above)"},
                "images": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "5 to 8 photo URLs for this listing from domain.com.au or realestate.com.au. Include the main hero shot plus interior/exterior photos.",
                },
                "verdict": {
                    "type": "string",
                    "enum": ["great_value", "within_median", "slightly_above", "overpriced"],
                },
                "on_main_road": {"type": "boolean", "description": "Whether property fronts a major arterial/main road (enriched)"},
                "main_road_note": {"type": "string", "description": "Short note about road type and noise risk"},
                "powerlines_nearby": {"type": "boolean", "description": "Whether high-voltage powerlines or pylons are near the property (enriched)"},
                "powerlines_note": {"type": "string", "description": "Short note about powerline proximity"},
                "t_junction": {"type": "boolean", "description": "Whether property sits at end of a T-junction (路冲) (enriched)"},
                "t_junction_note": {"type": "string", "description": "Short note about T-junction risk"},
                "orientation": {"type": "string", "description": "Primary orientation of main living area, e.g. 'North-facing'"},
                "sunlight_note": {"type": "string", "description": "Short note on sunlight and natural light"},
                "kitchen_condition": {"type": "string", "description": "Kitchen condition: Modern, Good, Fair, Needs Renovation"},
                "bathroom_condition": {"type": "string", "description": "Bathroom condition: Modern, Good, Fair, Needs Renovation"},
                "renovation_needed": {"type": "boolean", "description": "Whether kitchen or bathroom clearly needs renovation"},
                "renovation_note": {"type": "string", "description": "1-sentence renovation summary"},
                "warnings": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of warning strings to display on the card",
                },
            },
            "required": ["address", "price", "verdict"],
        },
    },
    {
        "name": "show_map",
        "description": "Display an interactive property map for a suburb with price pins and property cards, similar to a real-estate portal. Include 4-6 real listings with full details.",
        "parameters": {
            "type": "object",
            "properties": {
                "suburb": {"type": "string"},
                "state": {"type": "string"},
                "lat": {"type": "number"},
                "lng": {"type": "number"},
                "zoom": {"type": "integer", "default": 15},
                "properties": {
                    "type": "array",
                    "description": "List of 4-6 property listings to display as pins and cards",
                    "items": {
                        "type": "object",
                        "properties": {
                            "address": {"type": "string"},
                            "lat": {"type": "number"},
                            "lng": {"type": "number"},
                            "price": {"type": "integer", "description": "Listing price in AUD"},
                            "label": {"type": "string", "description": "Short price label e.g. $1.82M"},
                            "meta": {"type": "string", "description": "e.g. 4 bed · 2 bath · 512m²"},
                            "type": {"type": "string", "enum": ["buy", "invest"], "description": "Buyer intent"},
                            "verdict": {"type": "string", "description": "Short verdict e.g. ✓ Good buy"},
                            "verdict_sentiment": {"type": "string", "enum": ["positive", "neutral", "caution"], "description": "Controls badge colour"},
                            "growth": {"type": "string", "description": "e.g. ↑ +7.4% YoY"},
                            "median_suburb": {"type": "string", "description": "Suburb median price e.g. $2.08M"},
                            "clearance_rate": {"type": "string", "description": "e.g. 74%"},
                            "days_on_market": {"type": "string", "description": "e.g. 22"},
                        },
                        "required": ["address", "lat", "lng", "label"],
                    },
                },
            },
            "required": ["suburb", "lat", "lng"],
        },
    },
    {
        "name": "show_suburb_stats",
        "description": "Display suburb statistics including median price, clearance rate, growth, and rental yield.",
        "parameters": {
            "type": "object",
            "properties": {
                "suburb": {"type": "string"},
                "state": {"type": "string"},
                "postcode": {"type": "string", "description": "4-digit Australian postcode for the suburb"},
                "median_price": {"type": "integer"},
                "clearance_rate": {"type": "number", "description": "Auction clearance rate as a percentage"},
                "growth_12mo": {"type": "number", "description": "12-month price growth as a percentage"},
                "rental_yield": {"type": "number", "description": "Gross rental yield as a percentage"},
                "days_on_market": {"type": "integer"},
                "crime_rate": {"type": "integer", "description": "Total crime incidents per 1000 residents per year"},
                "crime_label": {"type": "string", "description": "Crime level: Very Low, Low, Moderate, High, Very High"},
                "vacancy_rate": {"type": "number", "description": "Rental vacancy rate as a percentage (enriched from SQM Research)"},
                "stock_on_market": {"type": "integer", "description": "Total properties currently listed for sale (enriched from SQM Research)"},
                "growth_1yr": {"type": "number", "description": "1-year asking price growth % (enriched from SQM Research)"},
                "growth_5yr": {"type": "number", "description": "5-year asking price growth % (enriched from SQM Research)"},
                "growth_10yr": {"type": "number", "description": "10-year asking price growth % (enriched from SQM Research)"},
                "short_term_outlook": {"type": "string", "description": "1-5 year growth outlook: Strong, Moderate, Neutral, Weak, or Caution"},
                "short_term_reason": {"type": "string", "description": "One-sentence reason for short-term outlook"},
                "long_term_outlook": {"type": "string", "description": "6-15 year growth outlook: Strong, Moderate, Neutral, Weak, or Caution"},
                "long_term_reason": {"type": "string", "description": "One-sentence reason for long-term outlook"},
                "economic_verdict": {"type": "string", "description": "Economic factor verdict: Strong, Moderate, Neutral, Weak"},
                "economic_reason": {"type": "string", "description": "Reason for economic verdict"},
                "affordability_verdict": {"type": "string", "description": "Affordability verdict: Strong, Moderate, Neutral, Challenging"},
                "affordability_reason": {"type": "string", "description": "Reason for affordability verdict"},
                "lifestyle_education_verdict": {"type": "string", "description": "Lifestyle & Education verdict: Strong, Moderate, Neutral, Weak"},
                "lifestyle_education_reason": {"type": "string", "description": "Reason for lifestyle & education verdict"},
                "supply_verdict": {"type": "string", "description": "Supply risk verdict: Low Risk, Moderate, High Risk"},
                "supply_reason": {"type": "string", "description": "Reason covering developable land and building approvals"},
                "source_note": {"type": "string", "description": "Data source and date note"},
            },
            "required": ["suburb", "median_price"],
        },
    },
    {
        "name": "show_affordability",
        "description": "Display an affordability analysis based on the buyer's income.",
        "parameters": {
            "type": "object",
            "properties": {
                "income": {"type": "integer", "description": "Annual gross income in AUD"},
                "borrowing_capacity": {"type": "integer", "description": "Estimated maximum borrowing in AUD"},
                "deposit_required": {"type": "integer", "description": "Required deposit in AUD"},
                "monthly_repayment": {"type": "integer", "description": "Estimated monthly repayment in AUD"},
                "score": {"type": "integer", "description": "Affordability score 0-100"},
                "note": {"type": "string", "description": "Short summary e.g. 'Comfortable' or 'Stretching'"},
                "monthly_take_home": {"type": "integer"},
                "monthly_remaining": {"type": "integer"},
            },
            "required": ["income", "borrowing_capacity", "monthly_repayment", "score"],
        },
    },
    {
        "name": "show_risk_summary",
        "description": "Display a risk assessment panel with flood, overlay, bushfire, and contract risks.",
        "parameters": {
            "type": "object",
            "properties": {
                "risks": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "description": {"type": "string"},
                            "severity": {"type": "string", "enum": ["low", "medium", "high"]},
                            "status": {"type": "string", "description": "Short status label"},
                        },
                        "required": ["name", "severity"],
                    },
                }
            },
            "required": ["risks"],
        },
    },
    {
        "name": "show_street_view",
        "description": "Display a Google Street View image of the property address.",
        "parameters": {
            "type": "object",
            "properties": {
                "address": {"type": "string", "description": "Full street address for Street View lookup"},
            },
            "required": ["address"],
        },
    },
    {
        "name": "show_grants",
        "description": "Display available government grants and schemes for this buyer.",
        "parameters": {
            "type": "object",
            "properties": {
                "state": {"type": "string"},
                "grants": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "description": {"type": "string"},
                            "value": {"type": "string", "description": "Dollar value or 'Eligible'"},
                            "eligible": {"type": "boolean"},
                        },
                        "required": ["name", "eligible"],
                    },
                },
                "total_savings": {"type": "integer", "description": "Total estimated savings in AUD"},
            },
            "required": ["state", "grants"],
        },
    },
    {
        "name": "show_comparison",
        "description": "Display a side-by-side comparison table for 2-3 properties.",
        "parameters": {
            "type": "object",
            "properties": {
                "properties": {
                    "type": "array",
                    "description": "2 to 3 properties to compare",
                    "items": {
                        "type": "object",
                        "properties": {
                            "address": {"type": "string"},
                            "price": {"type": "integer"},
                            "bedrooms": {"type": "integer"},
                            "bathrooms": {"type": "integer"},
                            "land_sqm": {"type": "integer"},
                            "days_on_market": {"type": "integer"},
                            "suburb_median": {"type": "integer"},
                            "verdict": {"type": "string"},
                            "pros": {"type": "array", "items": {"type": "string"}},
                            "cons": {"type": "array", "items": {"type": "string"}},
                        },
                        "required": ["address", "price"],
                    },
                }
            },
            "required": ["properties"],
        },
    },
]
