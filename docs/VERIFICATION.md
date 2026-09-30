# Verification record — 30 September 2026

## Automated local checks

`node scripts/verify.mjs` passed all **46 checks** against the running local development site after the final enquiries changes. The timestamped, individual assertions are in [verification.json](verification.json).

Coverage includes 51 public routes, fictional notices and noindex headers, a real 404, 30 published properties and supporting content counts, URL-based search/filter/sort/pagination, and all 90 property document links. The workflow creates a property, checks unpublished isolation and signed preview, publishes it, verifies draft edits do not leak, publishes an edit, marks it Sold independently of publication status, restores an earlier revision, and updates shared content across pages. The temporary property is moved to native trash after testing.

Forms were exercised with invalid email, missing consent, foreign origin, unavailable properties, valid viewing and valuation submissions. Tests cover private persistence, captured test notification, assignment, status changes, rejection of stale updates, anonymous access denial and absence of a public enquiry collection. Subscriber, Contributor and Author cannot read enquiries; Editor can; Contributor cannot publish and Editor cannot administer users. These role checks temporarily change and restore the local development fixture; they do not test real passkey enrolment.

`npm run typecheck`: 25 Astro files, zero errors, warnings or hints. `npm run build`: passed, with a native admin bundle size advisory. No deployment occurred.

## Browser checks

The desktop homepage and property detail were visually reviewed. At 390px, the homepage and sales page had no horizontal overflow; the mobile menu worked. The property gallery opened, advanced, closed with Escape and returned focus to its opener. Submitting a fictional viewing enquiry displayed success and reset the form. Applying location, price and type filters produced a shareable URL and the expected results.

The native admin dashboard loaded. The custom private enquiry screen was checked in-browser, including saving the Browser Demo Visitor enquiry and receiving “Enquiry updated.” An initial React development JSX runtime error was fixed with an explicit classic JSX pragma and retested successfully.

Native preview, revision restoration and permissions were exercised through EmDash APIs, not an exhaustive click-through of every admin control. The editor walkthrough provides the corresponding manual review steps.

## Compiled runtime

The compiled Node server was started locally on port 4390. Homepage returned 200; development authentication returned 403; anonymous private-enquiry listing returned 401. An explicit startup wrapper is supplied because direct adapter autostart did not start reliably in this host environment. Full production-host, reverse-proxy, HTTPS and passkey tests remain unperformed.

## Recovery

A SQLite online snapshot plus all ten uploaded media files was checksummed, copied into an isolated recovery directory, and passed SQLite integrity and the 30 non-deleted published-property count. See [backup-verification.json](backup-verification.json). This verifies snapshot copying and database/media integrity, not a complete running recovered deployment or encrypted offsite retention.

## Limits and untested behaviour

- Email is captured privately for a reserved `.example` destination; no SMTP delivery is implemented or claimed.
- No formal WCAG audit, screen-reader matrix, cross-browser matrix, load test or penetration test was performed.
- Rate limiting is implemented but its sustained-load boundary was not stress-tested. The local fallback bucket is shared when no trusted client IP is available.
- Search loads the small published demo catalogue; a large production catalogue needs indexed querying.
- The private inbox displays the latest 100 records; pagination and automatic retention need additional work for sustained use.
- Stock photography and three shared illustrative PDFs are demonstrative, not genuine UK listings, valid EPCs or unique floorplans. Optional video links have no seeded video.
- Core roles are intentionally coarse: Editor access grants access to all enquiries, not only assigned enquiries.
- A real hosted deployment, mail transport, real user invitations/passkeys and a full disaster-recovery exercise require further validation.
