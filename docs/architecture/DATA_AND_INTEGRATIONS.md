# Data and Integration Readiness

## Authentication now, Keycloak later

Baseline authentication is local. `UserAccount` is global and tenant membership/profile data is separate.

The account model intentionally keeps:

- `identityProvider` (`LOCAL`, later `KEYCLOAK`);
- nullable `externalIssuer` + `externalSubject` for an external IdP identity;
- nullable `passwordHash` so an external-only account does not require local credentials;
- first-login state on the global account, not per tenant.

Do **not** build a Keycloak adapter until a task explicitly opens that integration. When it is introduced, map Keycloak `issuer + subject` to the existing account instead of rewriting tenant-person membership data.

## File storage now, S3 later

Business tables reference `MediaAsset.id`; they never store base64 or absolute filesystem paths.

`MediaAsset` stores a provider-neutral `storageKey` plus metadata. Baseline provider is `LOCAL`, rooted at `LOCAL_STORAGE_ROOT=.data/uploads`. A future S3 adapter can keep the same business reference and change only provider/storage implementation.

Do not expose filesystem paths in public API responses.

## Messaging

No SMS/email provider is part of the baseline. Product notifications can be persisted as application data when their feature wave is implemented. External delivery adapters are deferred until required.

## Background jobs

No Redis/BullMQ in baseline bootstrap. Scheduling source-of-truth is synchronous class-centric session generation. Add a queue only when there is a concrete delayed/retry workload that cannot remain synchronous or database-driven.
