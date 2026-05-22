# Property State Machine

This product should not use internal labels like `Report v1` or `Report v2` as primary UI states.

The UI should always tell the buyer:
- where this property currently sits in the buying journey
- whether the report has been purchased
- what the single next move is

## State Axes

Every serious property should carry three separate state fields.

### 1. `marketStatus`
- `selling`
- `sold`

This is market reality, not buyer workflow.

### 2. `reportStatus`
- `unpurchased`
- `purchased`

This is independent from the main lifecycle stage. A property can be shortlisted without a purchased report.

### 3. `lifecycleStage`
- `shortlisted`
- `reviewing_report`
- `ready_for_inspection`
- `needs_further_checks`
- `preparing_offer`
- `under_contract`
- `pre_settlement`
- `settled`

## Stage Definitions

### `shortlisted`
- Meaning: the property is worth keeping in play, but it has not yet become a serious evaluation
- Main CTA: `Purchase full access`
- Dashboard guidance: this card should push the user out of browsing and into a paid report decision

### `reviewing_report`
- Meaning: the report has been purchased and the buyer is reading it to decide whether inspection is justified
- Main CTA: `Prepare for inspection`
- Dashboard guidance: the card should push the user into the workspace and inspection prep

### `ready_for_inspection`
- Meaning: the user has enough confidence to inspect in person
- Main CTA: `I've been to inspection`
- Dashboard guidance: the card should prompt a real-world validation step, not more desk research

### `needs_further_checks`
- Meaning: inspection or report review surfaced issues that still need evidence
- Main CTA: `Upload contract`
- Dashboard guidance: the card should ask for contract, building report, or other missing verification

### `preparing_offer`
- Meaning: the property has enough conviction to move toward an offer or auction strategy
- Main CTA: `Prepare offer`
- Dashboard guidance: the card should shift from analysis to price discipline and execution planning

### `under_contract`
- Meaning: the offer has progressed into contract stage
- Main CTA: `Track contract tasks`
- Dashboard guidance: the card should focus on finance, legal, and condition tracking

### `pre_settlement`
- Meaning: the property is moving toward settlement
- Main CTA: `Prepare for settlement`
- Dashboard guidance: the card should focus on final inspection, funds, and legal readiness

### `settled`
- Meaning: the purchase flow is complete
- Main CTA: `Review settlement notes`
- Dashboard guidance: this becomes history and record-keeping, not active decision support

## UI Rules

### Dashboard
- Each property row should show:
  - `decision`
  - `lifecycleStage`
  - `reportStatus`
  - `next action`
- The row should not show:
  - `Report v1`
  - `Report v2`
  - internal draft/version language

### Workspace
- The hero should show:
  - property identity
  - decision
  - current lifecycle stage
  - report purchased / not purchased
  - one primary CTA tied to the next stage
- The proceed section should change by lifecycle stage

## Example Mapping

### Example 1
- `marketStatus`: `selling`
- `reportStatus`: `unpurchased`
- `lifecycleStage`: `shortlisted`
- Visible next move: `Purchase full access`

### Example 2
- `marketStatus`: `selling`
- `reportStatus`: `purchased`
- `lifecycleStage`: `ready_for_inspection`
- Visible next move: `I've been to inspection`

### Example 3
- `marketStatus`: `selling`
- `reportStatus`: `purchased`
- `lifecycleStage`: `needs_further_checks`
- Visible next move: `Upload contract`

### Example 4
- `marketStatus`: `sold`
- `reportStatus`: `purchased`
- `lifecycleStage`: `pre_settlement`
- Visible next move: `Prepare for settlement`
