# EmDash evaluation alongside WordPress / ACF

Documentation checked against the official EmDash site and installed 1.0.1 implementation, 29–30 September 2026.

| Requirement | Native capability used | Custom development in this demo |
|---|---|---|
| Property/branch/agent/area content | Collections, field validation, references, rich text | Estate-agency schema and templates |
| Availability vs publication | Select field plus independent core status | Search/detail presentation and closed-listing form guard |
| Galleries/documents | Media library, image/file fields, image repeaters | Accessible gallery dialog and document links |
| Repeatable floorplans | Repeater supports URL, but **not file** subfields | Main native file picker plus repeatable URL links |
| Composable pages | Versioned blocks fields and block-type definitions | Eight Astro renderers |
| Shared content | CMS collection and native menus/settings | Global-content convention and shared CTA fallback |
| Drafts/previews/revisions | Core signed previews, publication and revision history | Page templates use native content queries |
| Search | Native collection queries provide published content | In-memory location/range/type filtering, sorting and numbered pagination |
| Enquiries | Native plugin storage, private routes, RBAC and CSRF | Form validation, rate limiting, storage model, React inbox, test-email capture |
| SEO/media | Native media optimization and metadata hooks | Global noindex response header/meta, robots exclusion and fictional notices |

WordPress CPTs map broadly to EmDash collections. ACF field groups map to collection field definitions; repeaters have a narrower supported set of child field types. ACF Flexible Content maps most closely to native versioned page blocks with developer-authored renderers. EmDash has database schema plus seed/export tooling rather than this project's familiar PHP field registration/ACF local JSON workflow.

EmDash reference fields store relations outside the content row. Templates request `references` and receive related entries separately from `entry.data`. `entry.id` is the public slug; `entry.data.id` is the database ID used for mutations. Media are structured provider references, not guaranteed URLs or WordPress attachment IDs.

Astro pages are server-rendered. There is no PHP template hierarchy, WordPress hook API or WordPress plugin compatibility. This demo's custom plugin is trusted application code and must be maintained/tested with the site. EmDash's plugin registry is not a substitute for assuming Gravity Forms, CRM or estate-agency portal-feed integrations exist.

Editors manage content and publish; Contributors cannot publish. The private inbox uses `content:edit_any`, limiting it to Editors/Admins. This is a coarse role policy: per-branch tenancy or granular enquiry-specific roles would require additional authorization work. The demonstration tests native roles with a temporary local fixture, not invited human accounts or passkey enrollment.

The small catalogue is intentionally read at request time and filtered in application code. It is complete for 30 listings, but a production-scale catalogue should use indexed database filtering/counting and a reviewed query API. Pagination and filters are already represented in URLs, so the frontend contract can be retained.

A shared CTA updates across pages through a common CMS entry. Other page blocks are reusable layout types whose values belong to each page; they are not automatically synchronized instances. Native portable-text sections are another EmDash feature but are not used for this layout model. Structured interface labels are stored in a JSON field and would benefit from a dedicated form for nontechnical editors.

Two limitations were caught during implementation: a seed could introduce a `file` repeater child that later CRUD calls rejected; the empty unused field was replaced through native schema APIs. Also optional empty URL strings are rejected by content creation; the authored seed now omits unset video URLs. No EmDash core files were modified.

## Sources

- [Field types](https://docs.emdashcms.com/reference/field-types/)
- [Relations](https://docs.emdashcms.com/guides/relations/)
- [Page blocks](https://docs.emdashcms.com/guides/blocks/)
- [Authentication and roles](https://docs.emdashcms.com/guides/authentication/)
- [Content lifecycle](https://docs.emdashcms.com/reference/content-lifecycle/)
- [Preview mode](https://docs.emdashcms.com/guides/preview/)
- [Native plugins](https://docs.emdashcms.com/plugins/creating-native-plugins/your-first-native-plugin/)
- [Backups](https://docs.emdashcms.com/guides/backups/)
