# Workspace / Report Information Architecture

## Purpose
- This page must scale as property data grows.
- It should not become a schema dump or an internal admin screen.
- It should help a buyer decide, act, and verify in that order.

## Core Principle
- Do not organize the page by backend objects.
- Organize it by buyer decision value.

Every field should answer one of these:
1. Does it change the go / no-go judgment?
2. Does it change the next action?
3. Does it explain the judgment?
4. Is it reference-only?

## The Four Layers

### 1. Decision Layer
- Role: immediate judgment
- Question answered:
  - what is this property
  - what do we think
  - why
  - what is the biggest risk
  - what is the next move
- Placement: always above the fold
- Typical contents:
  - property identity rail
  - summary decision
  - one-line why
  - biggest risk
  - highlights vs concerns

### 2. Action Layer
- Role: turn judgment into progress
- Question answered:
  - what do I need to do to proceed
  - what is missing
  - what needs verification
  - what is blocking readiness
- Placement: immediately below the first decision block
- Typical contents:
  - next move
  - proceed checklist
  - inspection prep
  - missing docs
  - open questions

### 3. Diagnostic Layer
- Role: structured explanation
- Question answered:
  - what detailed facts support the decision
  - where exactly do the strengths and risks come from
- Placement: core body of the page, inside the Evidence Hub
- Typical contents:
  - property facts
  - condition and quality
  - defects and maintenance
  - environment and livability
  - land and planning
  - location and amenity
  - market and pricing
  - sale process and timing
  - documents and interpretation

### 4. Reference Layer
- Role: full disclosure without attention theft
- Question answered:
  - what raw or low-priority data is still available if I need it
- Placement: lowest on page, often collapsible
- Typical contents:
  - agent details
  - listing id
  - raw metadata
  - source provenance
  - raw planning values
  - extracted technical fields

## Stable Module Set

These modules should remain stable even as the schema grows.

### A. Identity
- address
- suburb / state / postcode
- price guide
- property type
- bed / bath / parking / land size
- report version
- last updated

### B. Summary Decision
- verdict
- score if present
- recommendation explanation
- biggest risk
- top reasons in favor
- top reasons against

### C. Proceed
- one next move
- what must happen before proceeding
- missing documents
- unresolved risks
- readiness state

### D. Property Facts
- objective structural data about the property itself

### E. Condition & Quality
- interior condition
- renovation status
- bathroom / kitchen / flooring quality
- facade / garden / materials / parking type

### F. Defects & Maintenance
- visible defects
- structural risk
- cracks
- gutter / roof damage
- general disrepair

### G. Environment & Livability
- greenery
- privacy
- noise
- lighting
- road proximity
- flatness
- sustainability features

### H. Planning & Constraints
- zoning
- overlays
- heritage
- flood / landslide
- FSR / height / lot size
- development potential

### I. Location & Amenity
- nearby POIs
- lifestyle score
- transit score
- safety score

### J. Financial / Investment
- current price
- rent
- rental yield
- capital gain
- cashflow
- potential rent

### K. Sale Process & Timing
- inspection date
- inspection times
- auction date
- listing date
- listing freshness

### L. Documents & Interpretation
- uploaded report summary
- contract summary
- extracted clauses or warnings
- unresolved document unknowns

### M. Reference / Provenance
- source
- listing id
- created_at / updated_at / last_analysis_at
- agent contact details
- raw extracted values

## Module Weight Rules

Not every module should have equal visual weight.

### Primary
- default visible
- strong title and summary
- directly affects judgment or next move
- modules:
  - identity
  - summary decision
  - proceed
  - highlights vs concerns

### Secondary
- visible in main flow but calmer
- supports the judgment
- modules:
  - property facts
  - condition and quality
  - defects and maintenance
  - environment and livability
  - planning and constraints
  - location and amenity
  - market / pricing
  - sale process and timing

### Reference
- collapsible or visually quieter
- does not compete with decision blocks
- modules:
  - provenance
  - raw metadata
  - raw technical values

## Default Page Order
1. identity rail
2. summary decision hero
3. highlights vs concerns
4. what you need to do to proceed
5. evidence hub tabs
6. property-bound chat
7. reference / raw details

## Evidence Hub

The Diagnostic and Reference layers should be delivered through a stable tab system rather than one long vertical report.

### Stable Tabs
- `Overview`
- `Visual`
- `Property`
- `Location`
- `Planning`
- `Financial`
- `Documents`

### Tab Logic
- tabs hold the full evidence set
- the current lifecycle stage determines the default tab
- tabs do not replace the page hierarchy above them
- each tab should open with a short summary, then reveal structured cards, rows, or galleries

### Visual Priority Within The Evidence Hub
1. aerial / top-down
2. map / orientation / boundary
3. floorplan
4. listing detail images

This prevents the workspace from drifting back toward portal-style listing emphasis.

## Rules For New Data

When new fields appear, place them by decision value, not by schema origin.

### Put it in Decision Layer if:
- it materially changes go / no-go
- it reframes the whole property
- it is one of the top 3 reasons for or against proceeding

### Put it in Action Layer if:
- it creates a new required task
- it blocks readiness
- it changes what must happen next

### Put it in Diagnostic Layer if:
- it explains why the property is strong or risky
- it is important, but not first-screen important

### Put it in Reference Layer if:
- it is needed for completeness
- it rarely changes the decision on its own
- it is system or provenance metadata

## Example Mapping For The Sample Schema

### Decision Layer
- `basic_info.full_address`
- `basic_info.suburb`
- `basic_info.state`
- `basic_info.postcode`
- `basic_info.property_type`
- `basic_info.bedrooms_count`
- `basic_info.bathrooms_count`
- `basic_info.land_size`
- `basic_info.price_value`
- `media.main_image_url`
- `recommendation.score`
- `recommendation.highlights`
- `recommendation.concerns`
- `recommendation.explanation`
- high-priority `planning_info` risks such as flood / landslide / heritage

### Action Layer
- `events.inspection_date`
- `events.inspection_times`
- `events.auction_date`
- `events.last_updated_date`
- missing docs
- unresolved risks derived from:
  - `planning_info`
  - `analysis.visible_defects`
  - `defects`
  - missing contract / report interpretation

### Diagnostic Layer
- `analysis.*`
- `planning_info.*`
- `investment_info.*`
- `location_info.*`
- `features.*`
- `defects`
- `events.listing_date`

### Reference Layer
- `listing_id`
- `metadata.*`
- `agent.*`
- `media.video_url`
- `basic_info.price_is_numeric`
- raw `planning_info.overlays`

## Anti-Patterns
- Do not mirror the backend schema as accordion sections.
- Do not give low-value metadata the same visual weight as summary decision.
- Do not put every metric in the hero.
- Do not let chat recap become a competing report section.
- Do not create a new top-level section for every new dataset.

## One-Line Principle
- The page should feel complete because everything is available, but focused because only decision-relevant information gets the top of the page.
