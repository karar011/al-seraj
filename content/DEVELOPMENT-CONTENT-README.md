# PHASE 12 — Development Content Mode

This repository snapshot is a **development population build**, not a final publication of company facts. Every newly added population module is marked `DEVELOPMENT CONTENT MODE · DEMO_PLACEHOLDER`, and every temporary image is marked `DEVELOPMENT ASSET` in the UI and registries.

## Replacement workflow

Replace approved content and imagery by updating the registry records first, then replace the corresponding HTML value or asset mapping while preserving the existing route and layout. Do not remove the markers until the replacement has been reviewed and approved.

| Registry | Purpose |
|---|---|
| `placeholder-registry.json` | Maps 168 content sections/cards to the required approved replacement. |
| `image-registry.json` | Maps all 224 temporary image slots to an approved future visual. |
| `population-matrix.json` | Machine-readable 56-route population coverage. |
| `population-matrix.md` | Human-readable route/slot matrix. |

## Content safety

Demo projects use no fictional client names. Fields such as client, location, year, scope, status, manufacturer, specification, and datasheet are explicit human-input placeholders. Standards, regulatory terms, and technical references are not presented as company certification or approval.

## Asset safety

The development assets are generic engineering visuals or abstract schematics. They contain no client logos, manufacturer marks, or readable project identifiers. Replace them with approved real photographs only after receiving usage permission and the corresponding replacement record.

## Contact safety

The existing contact form remains local-only. This development population does not create a backend, CRM, SMTP service, or fake submission endpoint. Existing WhatsApp links remain subject to separate authorization review.
