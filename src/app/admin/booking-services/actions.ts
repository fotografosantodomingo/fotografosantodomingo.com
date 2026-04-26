'use server'

// ════════════════════════════════════════════════════════════════════════════
// LEGACY ACTIONS — FROZEN as of Slice A · Step A1 (2026-04-26)
// ════════════════════════════════════════════════════════════════════════════
//
// The /admin/booking-services UI is being replaced by /admin/families and
// /admin/packages (canonical CRUD over service_families + service_packages).
//
// Until that replacement ships and this entire route is removed, all WRITE
// operations against the legacy booking_services table are disabled to
// prevent drift between the two catalogues:
//   - createService     → 410 Gone (returns frozen error)
//   - updateService     → 410 Gone
//   - toggleServiceFlag → 410 Gone
//
// The page itself remains read-only (the list view in page.tsx still loads).
// Any submitted form returns the freeze message in the existing ActionState
// shape, so the modal UI displays it inline without crashing.
// ════════════════════════════════════════════════════════════════════════════

export type ActionState = { error: string | null; success: boolean }

const FROZEN_MESSAGE =
  'Legacy booking_services is frozen. Use canonical Families/Packages admin (/admin/families).'

const FROZEN: ActionState = {
  error: FROZEN_MESSAGE,
  success: false,
}

export async function createService(
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  return FROZEN
}

export async function updateService(
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  return FROZEN
}

export async function toggleServiceFlag(
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  return FROZEN
}
