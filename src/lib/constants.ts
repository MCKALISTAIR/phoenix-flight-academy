/**
 * Platform-wide constants shared between client and server.
 */

// Default organization id used during Phase 1 multi-tenancy rollout.
// Every existing row was backfilled to this org during the migration.
// Once per-tenant routing (subdomain/slug) lands, callers should resolve
// the active org from request context instead of using this constant.
export const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";