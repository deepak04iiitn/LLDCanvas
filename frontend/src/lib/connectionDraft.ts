/**
 * Module-level singleton that tracks cursor direction changes while the user
 * is dragging a new connection edge, accumulating confirmed bend waypoints.
 *
 * Only one connection can be in-progress at a time, so module-level state
 * is safe.  Call `resetConnectionDraft()` at the start of every new drag.
 */

import type { Waypoint } from '@/types'

// ─── Tuning parameters ─────────────────────────────────────────────────────────

/**
 * Minimum distance (flow units) the cursor must travel in a new direction
 * before that change is confirmed as an intentional bend.
 * Higher = harder to create bends accidentally; lower = more responsive.
 */
const MIN_TURN_DIST = 26

/**
 * An angle greater than this (between the established segment direction and
 * the current movement direction) is considered a potential direction change.
 */
const TURN_ANGLE_DEG = 28
const SAME_DIR_DOT = Math.cos((TURN_ANGLE_DEG * Math.PI) / 180) // ≈ 0.882

/**
 * Once a candidate direction is established, subsequent movements must
 * align within this angle to accumulate toward confirmation.
 */
const CAND_ANGLE_DEG = 22
const CAND_DIR_DOT = Math.cos((CAND_ANGLE_DEG * Math.PI) / 180) // ≈ 0.927

// ─── Module state ──────────────────────────────────────────────────────────────

let _waypoints: Waypoint[] = []
let _prevPos: Waypoint | null = null
let _segmentDir: Waypoint | null = null   // unit vector for the current segment

// Candidate bend: tracks whether we are "starting to turn"
let _candPos: Waypoint | null = null      // cursor pos when potential turn began
let _candDir: Waypoint | null = null      // unit vector of the candidate turn direction
let _candDist = 0                          // how far we have moved in that candidate direction

// ─── Public API ────────────────────────────────────────────────────────────────

/** Call at the beginning of every new connection drag. */
export function resetConnectionDraft(): void {
  _waypoints = []
  _prevPos = null
  _segmentDir = null
  _candPos = null
  _candDir = null
  _candDist = 0
}

/**
 * Feed the latest cursor position (in React Flow's flow coordinates).
 * Call this every time `toX`/`toY` changes inside the ConnectionLineComponent.
 */
export function updateConnectionDraft(toX: number, toY: number): void {
  const cur: Waypoint = { x: toX, y: toY }

  if (_prevPos === null) {
    _prevPos = cur
    return
  }

  const dx = cur.x - _prevPos.x
  const dy = cur.y - _prevPos.y
  const dist = Math.hypot(dx, dy)

  if (dist < 0.5) return // negligible movement — skip

  const moveDir: Waypoint = { x: dx / dist, y: dy / dist }

  // Establish initial segment direction on first meaningful movement
  if (_segmentDir === null) {
    _segmentDir = moveDir
    _prevPos = cur
    return
  }

  const dotSeg = moveDir.x * _segmentDir.x + moveDir.y * _segmentDir.y

  if (dotSeg >= SAME_DIR_DOT) {
    // ── Still going in the same direction ────────────────────────────────────
    // Discard any in-progress candidate and lightly update the segment direction
    // (exponential smoothing) to stay aligned as the user curves slightly.
    _candPos = null
    _candDir = null
    _candDist = 0
    // Blend the segment direction toward the current movement to handle gradual curves
    const blend = 0.15
    const nx = _segmentDir.x * (1 - blend) + moveDir.x * blend
    const ny = _segmentDir.y * (1 - blend) + moveDir.y * blend
    const nl = Math.hypot(nx, ny)
    if (nl > 0) _segmentDir = { x: nx / nl, y: ny / nl }
  } else {
    // ── Potential direction change ────────────────────────────────────────────
    if (_candPos === null) {
      // Start tracking a candidate: the bend point would be at *prevPos*
      // (where we were when the turn started, not where we are now).
      _candPos = { ..._prevPos }
      _candDir = moveDir
      _candDist = dist
    } else {
      const dotCand = moveDir.x * _candDir!.x + moveDir.y * _candDir!.y

      if (dotCand >= CAND_DIR_DOT) {
        // Continuing in the candidate direction → accumulate distance
        _candDist += dist

        if (_candDist >= MIN_TURN_DIST) {
          // ✓ Confirmed bend: commit the waypoint at the candidate position
          _waypoints.push({ x: _candPos.x, y: _candPos.y })
          _segmentDir = _candDir!
          _candPos = null
          _candDir = null
          _candDist = 0
        }
      } else {
        // The turn direction itself changed — reset the candidate to now
        _candPos = { ..._prevPos }
        _candDir = moveDir
        _candDist = dist
      }
    }
  }

  _prevPos = cur
}

/** Returns a snapshot of all confirmed waypoints so far. */
export function getConnectionDraftWaypoints(): Waypoint[] {
  return [..._waypoints]
}
