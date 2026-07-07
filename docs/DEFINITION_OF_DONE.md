# Definition Of Done

A Family Life Admin change is done only when it is useful, reviewed, scoped, and consistent with the household-first product direction.

## General Done Criteria

- The change supports household/family admin workflows.
- The change is household-scoped.
- The change does not introduce personal finance analytics.
- The change follows the relevant MVP scope.
- The change preserves privacy and document handling rules.
- The change passes applicable review gates.
- Documentation is updated when behavior or data model assumptions change.

## MVP Feature Done Criteria

For each MVP module:

- Core mobile workflow is usable.
- Empty, loading, success, and error states are considered before implementation is accepted.
- Household ownership is enforced.
- Role behavior is clear.
- Activity/comment implications are considered.
- Privacy implications are reviewed.

## Bill/Renewal Done Criteria

Bill and renewal work is done only when:

- The feature treats bills and renewals as admin reminders.
- The feature stores provider, due/renewal dates, status, notes, source references, and reminder metadata only as approved.
- The feature does not store generated/transcribed payment identifiers.
- Payment actions point users to original source documents or user-confirmed source references.
- The bill/payment source-of-truth review gate passes.

## Documentation-Only Done Criteria

This documentation setup pass is done when:

- All requested documentation files exist.
- The product is clearly defined as household admin, not personal finance.
- MVP and out-of-scope boundaries are clear.
- Privacy and source document rules are clear.
- Bill/payment source-of-truth rules are clear.
- Future-phase boundaries are clear.
- App implementation remains paused for review.
