## ADDED Requirements

### Requirement: Auto-surface latest suburb result
When a follow-up query returns a new suburb snapshot or result panel, the canvas SHALL scroll to bring the new result into view automatically.

#### Scenario: New suburb snapshot appended
- **WHEN** the AI returns a new suburb snapshot in response to a follow-up query
- **THEN** the canvas panel scrolls smoothly to the new result
- **THEN** the new result is fully visible without requiring manual scrolling

#### Scenario: No scroll on initial load
- **WHEN** the page first loads with existing results
- **THEN** no automatic scroll occurs (scroll only triggers on new results appended during the session)

### Requirement: Consistent source attribution
Every suburb result displayed in the canvas SHALL include its own source attribution, regardless of whether it is the first or a subsequent result in the session.

#### Scenario: First suburb result shows sources
- **WHEN** the first suburb result is returned
- **THEN** the result panel displays the data sources used for that suburb

#### Scenario: Subsequent suburb results show sources
- **WHEN** a follow-up query returns a second or subsequent suburb result
- **THEN** each new result panel independently displays its own data sources
- **THEN** the sources shown are specific to that suburb, not carried over from a previous result

#### Scenario: Sources unavailable
- **WHEN** no source data is returned for a suburb result
- **THEN** the source attribution section is hidden (not shown as empty)
