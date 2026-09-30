# Northfield & Co.

A fictional UK estate agency demonstration built with **EmDash 1.0.1**, **Astro 7**, Node.js and SQLite. All public editorial content, listings, UI copy, navigation and images are read from EmDash. No deployment has been performed.

## Review locally

- Website: http://127.0.0.1:4321/
- CMS: http://127.0.0.1:4321/_emdash/admin
- Local development sign-in: http://127.0.0.1:4321/_emdash/api/auth/dev-bypass?redirect=/_emdash/admin
- Private inbox: the **Private enquiries** plugin page in the admin sidebar.

The development sign-in is an official EmDash development-only facility. It is available to anyone who can reach the development server, so the server binds to loopback only. Never expose `astro dev` publicly. A production deployment must use normal EmDash authentication and user-owned passkeys.

## Existing installation

```sh
nvm use
npm ci
npm run dev
```

Astro 7 runs the dev server in the background. Use `npx astro dev status`, `npx astro dev logs`, and `npx astro dev stop`. The `.env` is loaded by the Node launcher and must remain private. The current runtime key is not in the source archive.

## Clean setup

1. Use Node 24.21 or later compatible Node 24 and run `npm ci`.
2. Generate a local encryption key without printing it:

   ```sh
   node --input-type=module -e "import {randomBytes} from 'node:crypto'; import {writeFileSync} from 'node:fs'; writeFileSync('.env', 'EMDASH_ENCRYPTION_KEY='+randomBytes(32).toString('hex')+'\n', {flag:'wx',mode:0o600});"
   ```

3. Run `npx emdash seed seed/seed.json`. The seed imports illustrative images from Unsplash into local storage, so initial seeding needs network access. The normal site serves these imported images locally.
4. Run `npm run dev` and complete EmDash setup with your own passkey, or use the development-only sign-in above for a disposable local evaluation.
5. Run `node scripts/attach-documents.mjs` to upload the three PDFs in `output/pdf` and associate them with all 30 listings. This script uses local development authentication and publishes the attachments. Do not use it against a production site or after making editorial changes without reviewing its scope.

Do not reapply the seed with `--on-conflict update` over an edited site. It is a bootstrapping fixture, not a content synchronization mechanism. `scripts/create-seed.py` regenerates the authored seed, but does not apply it.

## Content and editing

- **Properties:** 20 sales and 10 lettings. Reference, transaction type, price/qualifier, availability, property type, beds/baths/area, tenure, council tax, deposit, address, coordinates, rich description, features, media gallery, main floorplan, additional floorplan links, brochure, EPC/rating, optional video URL, branch, agent and area relationship, featured flag.
- **Availability** is an ordinary select field. It is deliberately separate from EmDash's draft/published status.
- **Pages:** home, sales/lettings introductions, selling, letting, valuation, contact, about, area/branch/advice introductions, privacy, cookies and 404.
- **Page layout:** native versioned blocks for hero, text/image, property grid, area cards, team grid, testimonials, FAQs and CTA. The frontend implements their Astro renderers.
- **Shared content:** `Site Content → Shared site content` holds the demo notice, footer, shared CTA and public interface labels. UI labels use a JSON field; this is less friendly than individual fields in ACF. Main shared copy has normal text inputs.
- **Settings and navigation:** brand title/tagline use native site settings; header and footer use native menus.
- **Related content:** 2 branches, 4 fictional agents, 3 invented area guides and 3 articles.

All sample photography, documents, places, people, testimonials and addresses are illustrative. The sample PDF floorplan is generic and not to scale; the EPC sample explicitly is not an EPC. The optional video URL field is implemented but no property video has been supplied.

## Private enquiries

`@northfield/enquiries` is a custom native EmDash plugin, not a public content collection. It uses native namespaced plugin storage and native permission checks. The trusted native format supports its React inbox and Node cryptography.

Public forms accept only POST, limit request body size, validate fields server-side, check same-origin/custom-header requests, include a honeypot and enforce an atomic 15-attempt/10-minute rate limit. A trusted client IP is HMAC-hashed; without a trusted IP the plugin uses a conservative shared bucket. No raw IP is retained. This is appropriate for a small local demo; configure edge protection and a trusted proxy strategy before internet exposure.

Submissions store type, contact details, message, optional valuation address, property association, assigned colleague, status and timestamps. Initial assignment uses the first published colleague returned by the CMS; staff can change it. Assignment is to a CMS agent profile, not an EmDash login account. Sold and let properties reject viewing submissions.

**Editor (40) and Admin (50)** can read/update/delete enquiry records. Subscribers, Contributors and Authors cannot. Private routes require native authentication and cookie requests require EmDash's CSRF header. Anonymous requests cannot read the inbox. Records are not indexed as content, exposed by public content APIs, or embedded into public pages. SQLite data is not encrypted at rest: use restricted filesystem access and disk encryption on a deployed host.

Email is **captured locally**, alongside each enquiry, addressed to `enquiries@northfield.example`. Nothing is sent to a real mailbox. The capture can be inspected in the inbox. SMTP delivery is not implemented or tested.

The inbox shows the latest 100 enquiries; large-scale inbox pagination, scheduled retention, bulk export and detailed assignment audit history are outside this demo. Delete disposable data from the inbox after assessment.

## Verification

```sh
npm run typecheck
npm run build
node scripts/verify.mjs
```

`docs/verification.json` records the executed HTTP checks. The verification script creates and trashes a uniquely named workflow property, publishes and restores shared CTA copy, creates clearly labelled test enquiries, and temporarily changes the local development account's role to verify restrictions. A `finally` block restores Admin. Run only against this isolated local demo while other editors are not working. Trashed workflow entries remain in the CMS as recoverable evidence; EmDash reserves their slugs.

See [verification notes](docs/VERIFICATION.md), [editor walkthrough](docs/EDITOR-WALKTHROUGH.md), and [CMS comparison](docs/CMS-COMPARISON.md) for tested behavior and limits.

## Deployment and recovery

See [operations](docs/OPERATIONS.md). Review locally before any deployment. No CRM integration, portal feeds, customer accounts or appointment scheduling are included.
