## ADDED Requirements

### Requirement: Multi-line auto-grow textarea
The chat input field SHALL be a `<textarea>` element that automatically grows in height as the user types, up to a defined maximum height.

#### Scenario: Single line input
- **WHEN** the user types a short message (one line)
- **THEN** the textarea displays at its minimum height (44px)

#### Scenario: Multi-line input auto-grow
- **WHEN** the user types text that exceeds the current textarea width
- **THEN** the textarea height increases to accommodate the content without showing a scrollbar, up to a maximum height of 160px

#### Scenario: Maximum height reached
- **WHEN** the text content exceeds the 160px maximum height
- **THEN** the textarea stops growing and becomes vertically scrollable

#### Scenario: Text deleted
- **WHEN** the user deletes text and the content no longer requires the full height
- **THEN** the textarea shrinks back to fit the remaining content, down to the minimum height

#### Scenario: Submit clears and resets height
- **WHEN** the user submits the message
- **THEN** the textarea is cleared and its height resets to the minimum (44px)
