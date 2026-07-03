## ADDED Requirements

### Requirement: Increased chat message line spacing
All chat message text (both user messages and AI responses) SHALL use a line height of at least 1.625 (Tailwind `leading-relaxed`) to improve readability.

#### Scenario: AI response text line spacing
- **WHEN** the AI streams or displays a text response in the chat panel
- **THEN** the text is rendered with `line-height: 1.625` or equivalent

#### Scenario: User message bubble line spacing
- **WHEN** a user message bubble is displayed in the chat panel
- **THEN** the text is rendered with `line-height: 1.625` or equivalent

#### Scenario: No layout shift
- **WHEN** line spacing is applied
- **THEN** message bubbles expand vertically to accommodate the new spacing without overlapping adjacent elements
