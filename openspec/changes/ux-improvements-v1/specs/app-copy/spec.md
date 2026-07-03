## ADDED Requirements

### Requirement: Remove "buyer's agent" terminology
The term "buyer's agent" SHALL NOT appear anywhere in the application UI copy. It SHALL be replaced with neutral, non-human terminology that does not imply a paid human intermediary.

#### Scenario: Greeting message updated
- **WHEN** the AI sends its initial greeting in the chat
- **THEN** the greeting MUST NOT include the phrase "buyer's agent"

#### Scenario: UI labels and headers updated
- **WHEN** any page, header, tooltip, or label previously contained "buyer's agent"
- **THEN** the text is replaced with approved alternative copy (e.g., "property advisor", "AI assistant", or similar)

#### Scenario: No regression in other copy
- **WHEN** the copy change is deployed
- **THEN** no other UI text is unintentionally altered
