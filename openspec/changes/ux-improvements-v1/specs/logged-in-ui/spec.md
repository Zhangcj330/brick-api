## ADDED Requirements

### Requirement: Logged-in chat page matches homepage UI
The logged-in chat page at `/chat` SHALL include the same "Buy" and "Invest" mode options that are available on the homepage chat widget.

#### Scenario: Buy/Invest tabs visible after login
- **WHEN** an authenticated user navigates to `/chat`
- **THEN** the chat page displays "Buy" and "Invest" tab options consistent with the homepage

#### Scenario: Selected mode persists
- **WHEN** the user selects "Buy" or "Invest" on the logged-in chat page
- **THEN** the selection is reflected in the chat context and persists for the session

#### Scenario: Homepage and chat page visually consistent
- **WHEN** the same logged-in user compares the homepage chat widget with the `/chat` page
- **THEN** the layout, typography, and interaction patterns are visually consistent between the two
