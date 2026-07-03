## ADDED Requirements

### Requirement: Landing page message redirects to chat without login
When an unauthenticated user submits a message on the landing page, the system SHALL redirect them directly to the `/chat` page with their message pre-loaded, without requiring login.

#### Scenario: Landing page submit redirects to chat
- **WHEN** an unauthenticated user types a message in the landing page chat input and submits
- **THEN** the system redirects to `/chat` and the message is automatically submitted as the first message
- **THEN** no login prompt is shown

#### Scenario: Message passed via sessionStorage
- **WHEN** the landing page redirects to `/chat`
- **THEN** the message is stored in `sessionStorage` under key `brick_guest_initial_message` before redirect
- **THEN** the `/chat` page reads and replays the message on mount, then clears the key

### Requirement: Guest turn limit
An unauthenticated user SHALL be allowed to send up to 3 messages in the chat. After the 3rd message is answered, the system SHALL prompt the user to log in to continue.

#### Scenario: Guest within limit
- **WHEN** an unauthenticated user has sent fewer than 3 messages
- **THEN** the chat input remains enabled and no login prompt is shown

#### Scenario: Guest limit reached
- **WHEN** an unauthenticated user has sent 3 messages and received responses
- **THEN** the chat input is disabled
- **THEN** a non-blocking login prompt is shown: "You've used your 3 free questions. Sign in to keep going."

#### Scenario: Guest turn count persists on page refresh
- **WHEN** an unauthenticated user refreshes the page
- **THEN** the guest turn count is read from `sessionStorage` and the limit is enforced consistently

### Requirement: Chat history preserved after login
When a guest user logs in from the login prompt, the full chat history from the guest session SHALL be preserved and visible in the logged-in chat.

#### Scenario: History retained after login
- **WHEN** a guest user completes login from within the `/chat` page
- **THEN** the existing messages in the chat panel remain visible
- **THEN** the user can continue the conversation from where they left off

#### Scenario: Guest history not duplicated
- **WHEN** the user logs in and the session is restored
- **THEN** the chat messages are NOT duplicated or replayed

### Requirement: Save results CTA
After a guest user has received their first suburb result, the system SHALL display a non-blocking inline CTA inviting them to save their insights by creating a free account.

#### Scenario: Save CTA shown after suburb snapshot
- **WHEN** an unauthenticated user has received a suburb snapshot result
- **THEN** a non-blocking inline banner is displayed with copy: "Want to save these insights? Create a free account."
- **THEN** clicking the CTA initiates the signup flow while preserving session context

#### Scenario: Save CTA hidden for authenticated users
- **WHEN** the user is already logged in
- **THEN** no save CTA is displayed
