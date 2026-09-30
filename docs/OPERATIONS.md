# Local operation, proposed deployment and recovery

## Local demo boundaries

The server binds to `127.0.0.1:4321`. The official development auth shortcut is enabled only in Astro development; anyone reaching it can obtain the test Admin session. Keep it local. Production must run the build, use HTTPS and normal EmDash authentication, and remain behind an access gate while it is a fictional demo.

Every public page has a fictional notice. `X-Robots-Tag: noindex, nofollow, noarchive`, a robots meta tag and `robots.txt` exclusions discourage indexing. These are not access controls or guarantees against malicious crawlers. A deployed assessment site should also require authentication at the reverse proxy.

## Proposed Node deployment (not performed)

1. Review and approve the local site. Replace fictitious/test material only if a real production project is separately commissioned.
2. Provision a Node 24 host with a persistent private data volume. SQLite and `uploads/` must survive restarts and releases. Do not use ephemeral serverless storage for this configuration.
3. Install with `npm ci`, run typecheck/tests, then `npm run build`.
4. Supply `EMDASH_ENCRYPTION_KEY` from a secret manager. The same key is needed to decrypt stored plugin secrets and to maintain rate-limit pseudonyms. Keep a separately protected copy of the complete rotation list.
5. Run `HOST=127.0.0.1 PORT=4321 npm start` from the project working directory. Set up process supervision and an HTTPS reverse proxy. Configure EmDash's canonical `siteUrl` and Astro `security.allowedDomains` for the real host before building; verify passkey origin, CSRF and signed previews behind the proxy.
6. Provision real admin/editor accounts through native setup/invitation, with user-owned passkeys. A copied local development database contains a Dev Admin fixture and test data; sanitize it through reviewed tooling or initialize a fresh site for a real deployment.
7. Retain demo noindex and proxy access controls. Test anonymous enquiry denial, editor roles, forms, media reads, backups and startup after a restart.

This project currently targets Node and SQLite. Cloudflare/D1/R2 deployment would require adapter/storage changes and replacing the Node-only native plugin dependencies. It has not been configured or tested.

Outbound mail is deliberately absent. A reviewed real or test email transport, retry policy and delivery monitoring are additional work. The local capture is not proof of SMTP delivery. No real messages have been sent.

## Backup

EmDash's admin JSON backup is **not importable/restorable** and omits plugin storage and authentication data. A site transfer package also excludes users, plugin data and secrets. Neither replaces a database backup for this demo's private enquiries.

With editors and uploads paused:

```sh
node scripts/backup.mjs
```

This uses SQLite's online backup API via `sqlite3 .backup`, copies `uploads/`, writes SHA-256 checksums and checks database integrity. The output is under ignored `backups/`. It includes personal data if any was entered, sessions/users and private plugin records. Protect it as sensitive, encrypt offsite copies and apply a retention policy. The script does **not** copy `.env`; back up secrets separately in a secret manager. Media writes must be quiescent so the database and media set are coordinated.

Verify and copy a backup into an isolated recovery directory:

```sh
node scripts/check-backup.mjs backups/TIMESTAMP
```

It verifies every checksum, copies the snapshot to a fresh folder and checks SQLite integrity and the 30 published sample properties. This is a non-destructive local recovery check. Restore tests should additionally exercise login, previews, an edit and a private enquiry on a running recovered deployment before a real release.

## Restore procedure

1. Stop every process that can write the affected database; retain a copy of the current database, WAL/SHM files and media.
2. Restore into a **new** directory/volume from a verified database snapshot and matching uploads. Never overwrite a live database or leave unrelated old WAL/SHM files beside the restored database.
3. Restore the matching application version/dependencies and encryption keys separately.
4. Start the recovered instance on an isolated local port or private staging host. Verify public properties/media, native admin authentication, an edit/publish/preview, private enquiries and any encrypted plugin settings.
5. Only after review, switch the running service to the recovered volume. Retain the previous state until recovery is accepted.

No production deployment or destructive production restore has been executed.
