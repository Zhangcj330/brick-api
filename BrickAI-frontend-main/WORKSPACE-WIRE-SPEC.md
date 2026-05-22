# Workspace Page Wire Spec

## Role
- This page is the canonical single-property decision surface.
- It combines property identity, summary judgment, risks, next actions, report detail, and property-bound chat.
- It should feel like a buyer decision desk, not a portal listing and not a PDF viewer.

## Priority Order
1. property identity rail
2. summary decision hero
3. stage timeline + next action
4. what you need to do to proceed
5. evidence hub tabs
6. property chat

## Desktop Layout
- `AppNavigator`
- utility row
  - back to dashboard
  - open general chat
- hero shell
  - left: square overview image
  - right: identity rail + summary decision + save/chat actions
- stage timeline row
  - lifecycle timeline
  - next action card sits directly below the timeline with action summary and primary CTA
- content shell
  - main column
    - what you need to do to proceed
    - evidence hub
  - side column
    - property-bound chat on very wide desktop only

## Mobile Layout
- utility row stacks
- square overview image stays first
- identity rail sits directly under image
- summary decision hero follows immediately
- action row wraps but keeps one primary CTA first
- highlights vs concerns becomes single-column stack
- proceed section stays above report details
- evidence hub becomes horizontal scroll tabs with tab-specific content
- chat moves below main content
- tablet and standard desktop should keep `Current stage` and `Evidence hub` full width, matching the hero above

## Component Tree
- `WorkspaceShell`
- `WorkspaceUtilityRow`
- `WorkspaceHero`
- `PropertyIdentityRail`
- `SummaryDecisionCard`
- `HeroActionRow`
- `StageTimeline`
- `StageActionCard`
- `ProceedChecklist`
- `EvidenceHub`
- `EvidenceTabBar`
- `EvidenceTabPanel`
- `PropertyChatPanel`

## Property Identity Rail
- Type: compact metadata rail
- Contents:
  - address
  - suburb
  - price guide
  - property type
  - bedrooms
  - report version
  - updated time
- Rules:
  - compact and horizontal on desktop
  - wraps naturally on mobile
  - never becomes a large listing card

## Summary Decision Hero
- Type: dominant decision card
- Contents:
  - label: `Decision`
  - simple decision chip
  - one-line summary decision
  - `Highlights`
  - `Concerns`
- Rules:
  - this is the first thing the user should understand
  - stage should not live inside this widget
  - score is supporting only
  - use simpler decision language than the long canonical verdict label when needed

## Hero Action Row
- Type: secondary action cluster
- Contents:
  - secondary: `Save to watch`
  - secondary: `Chat`
- Rules:
  - these actions support the decision card
  - the stage CTA belongs in the stage timeline card, not here

## Stage Timeline
- Type: horizontal buyer-journey timeline
- Contents:
  - current lifecycle stage
  - completed stages
  - upcoming stages
  - stage-specific primary action
- Rules:
  - the timeline explains where the buyer is in the journey
  - the next action card should sit beside or under the timeline
  - desktop timeline width should be capped; if it overflows, it scrolls horizontally
  - users can click any stage, including earlier ones, to review or return to that stage
  - tablet and desktop should expose left/right scroll controls for the stage rail
  - the action card should describe the selected stage without repeating the stage label as the main heading

## What You Need To Do To Proceed
- Type: checklist / action module
- Contents:
  - heading
  - 3-4 concrete next checks
  - optional status cue for how ready the property is
- Rules:
  - should answer: "what do I need to do before I can keep going?"
  - action phrasing should be direct and specific

## Evidence Hub
- Type: tabbed evidence container
- Tabs:
  - `Overview`
  - `Visual`
  - `Property`
  - `Location`
  - `Planning`
  - `Financial`
  - `Documents`
- Rules:
  - all complete evidence should live here
  - tabs keep the page comprehensive without turning it into a single long report
  - the current stage should choose the default tab
  - every tab starts with a short summary before deeper detail
  - `Overview` should contain the full `Highlights` and `Concerns` blocks

## Property Chat Panel
- Type: contextual support panel
- Contents:
  - property label
  - suggested prompts
  - message list
  - composer
- Rules:
  - property-bound, not general chat
  - should feel secondary to the decision hero
  - on mobile it moves below the main report flow

## One-Line Principle
- The workspace should answer:
  - what is this property
  - what do we think
  - why
  - what is the biggest risk
  - what must happen next
