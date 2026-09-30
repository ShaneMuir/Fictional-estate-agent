# Cloudways deployment preparation

Status: prepared locally, not deployed. The signed-in account on 30 September 2026 exposes Flexible and Autonomous, but no Velocity product. Account access is the current blocker.

## Required account decisions

- Enable/access Velocity, or use an account with Velocity available.
- Select a plan and confirm its recurring charge before provisioning.
- Select the private Git provider/account and repository for this source.
- Start on a temporary domain unless another domain is requested.

## Deployment configuration

Node 24; npm; root directory `./`; build `npm run build`; start `npm start`. Install dependencies using the lockfile. Keep automatic deployment disabled initially.

Configure `EMDASH_ENCRYPTION_KEY` as sensitive. When transferring the current database, use its existing matching key, never a newly generated replacement. Do not commit or print the key. Configure `EMDASH_SITE_URL` to the actual HTTPS origin at build and runtime. The Astro configuration uses that exact hostname for trusted forwarded-header handling. Use the host/port required by Cloudways' proxy.

Set `NORTHFIELD_DATA_DIR` at **build and runtime** to an absolute private persistent directory confirmed by Cloudways. The configuration points SQLite and uploads to this directory; it must exist and be writable. This environment variable alone does not create a persistent volume. Do not place data within a disposable checkout or publicly served directory. Native session storage also needs review against the platform lifecycle.

## Before launch

Confirm with Cloudways which writable directory survives deployment and rollback and whether backups safely capture SQLite including WAL activity. Do not assume generic database backups cover SQLite. First validate with a disposable data copy, an upload, and a redeployment. Run one application instance against the local SQLite database initially.

Transfer a consistent database snapshot and matching uploaded files using secure account-provided transfer access. The current source ZIP excludes these and `.env`. Do not rerun the seed over migrated editorial content. Establish a real administrator with a passkey on the final HTTPS origin; migrating the local development account does not provide a production login. Clear test sessions and review development fixtures as part of the migration.

Retain noindex and fictional notices. Configure demo access protection at the platform/proxy. Keep local email capture unless a separate test mail transport is approved.

## Acceptance checks

Verify HTTPS, normal administrator login, signed previews, draft isolation, revision restore, publish, media upload, all public routes and document links, valid enquiries and anonymous private-API denial. Development bypass must return 403. Exclude admin, authenticated responses and signed previews from CDN caches. Verify persistence across redeploy and perform an isolated full restore.

Cloudways references:
- https://support.cloudways.com/en/articles/15550368-how-to-launch-an-application-on-cloudways-velocity
- https://support.cloudways.com/en/articles/16187473-how-to-manage-deployments-for-your-application-on-cloudways-velocity
- https://support.cloudways.com/en/articles/16187280-how-to-back-up-and-restore-your-application-on-cloudways-velocity
