# iOS Future Roadmap

Native iOS is a future scale-up phase. The MVP should focus on a fast, mobile-first web app.

## Why Web First

- Faster rollout.
- Easier iteration on household workflows.
- Shared code and deployment simplicity.
- Lower upfront platform complexity.
- Better product learning before native investment.

## Future Native iOS Goals

Native iOS may eventually support:

- Faster capture of tasks and reminders.
- Home screen widgets.
- Push notifications.
- Share sheet intake.
- Camera-based source capture.
- Siri/App Intents.
- Offline-friendly interactions.

## Boundaries

Native iOS should not be started until:

- Web MVP workflows are validated.
- Household data model is stable.
- Privacy and source document rules are proven.
- Bill/payment source-of-truth rules are implemented and reviewed.
- Auth and membership model are stable.

## Architecture Notes For Later

The web app should expose clear server-side boundaries so a future iOS app can use the same household-scoped backend. Do not overbuild this during MVP, but avoid web-only assumptions that would block a future native client.

## Future iOS Review Questions

- Which workflows need native speed?
- Are notifications approved?
- Is camera capture approved?
- Are source document uploads approved?
- Are App Intents useful for family admin workflows?
- What offline behavior is required?
