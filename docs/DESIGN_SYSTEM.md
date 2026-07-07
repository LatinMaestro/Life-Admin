# Design System

## Design Direction

Family Life Admin should feel calm, practical, private, and fast. It is a household operations tool, not a marketing site and not a finance dashboard.

The first experience is mobile-first web. Desktop should be useful, but phone workflows are the priority.

## Interface Principles

- Prioritise scanning and quick action.
- Keep pages dense enough for repeated use without feeling cramped.
- Use clear labels for household tasks, reminders, lists, bills, renewals, source references, and members.
- Avoid decorative layouts that reduce clarity.
- Avoid finance-style charts, account panels, spend summaries, or cashflow views.
- Use cards only for repeated items or contained tool surfaces.
- Keep dashboard sections simple and action-oriented.

## Navigation

MVP navigation should support:

- Dashboard
- Inbox
- Tasks
- Shopping
- Bills/Renewals
- Documents/Links
- Settings

On mobile, navigation should be reachable and predictable. The dashboard should show the most important household admin items first.

## Component Direction

Preferred UI stack:

- Tailwind CSS
- shadcn/ui
- lucide icons where icons are useful

Common controls:

- Buttons for clear commands
- Checkboxes for task/list completion
- Tabs or segmented controls for simple status views
- Menus for item actions
- Badges for status and due state
- Date inputs for due/renewal dates
- Text areas for notes and comments

## Tone

Use plain household language:

- "Due today"
- "Assigned to"
- "Add reminder"
- "Add shopping item"
- "Source document"
- "Renewal date"
- "Mark done"

Avoid finance-heavy language:

- "Cashflow"
- "Spend"
- "Transactions"
- "Budget"
- "Tax"
- "Loan"
- "Financial position"

## Accessibility Expectations

- Buttons and controls must have clear accessible names.
- Text should fit on mobile.
- Status should not rely only on color.
- Tap targets should be comfortable.
- Important due states should be readable at a glance.
