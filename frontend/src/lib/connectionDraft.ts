/**
 * Module-level singleton that accumulates bend waypoints while the user drags
 * a new connection. A waypoint is committed when the cursor stops moving
 * (short stillness debounce). After each bend, the cursor must travel away
 * before another stop can create a new breakpoint — this prevents stacked
 * duplicate circles from hand jitter.
 *
 * Only one connection can be in-progress at a time, so module-level state
 * is safe. Call `resetConnectionDraft()` at the start of every new drag.
 */

import type { Waypoint } from '@/types'

/**
 * Stillness debounce (ms). Long enough to ignore gaps between mousemove
 * events; short enough to feel instant when the user stops.
 */
const PAUSE_MS = 80

/** Movement below this (flow units) still counts as "stopped". */
const STILL_EPS = 4

/**
 * After placing a bend (or starting the drag), the cursor must travel at least
 * this far before another pause can create a breakpoint.
 */
const MIN_SEGMENT = 28

/** Refuse to place a waypoint closer than this to the previous one. */
const MERGE_EPS = 16

// ─── Module state ──────────────────────────────────────────────────────────────

let _waypoints: Waypoint[] = []
let _lastPos: Waypoint | null = null
let _origin: Waypoint | null = null
let _pauseTimer: ReturnType<typeof setTimeout> | null = null
const _listeners = new Set<() => void>()

function notify(): void {
  for (const cb of _listeners) cb()
}

function clearPauseTimer(): void {
  if (_pauseTimer != null) {
    clearTimeout(_pauseTimer)
    _pauseTimer = null
  }
}

function dist(a: Waypoint, b: Waypoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function travelAnchor(): Waypoint | null {
  return _waypoints[_waypoints.length - 1] ?? _origin
}

function farEnoughToArm(pos: Waypoint): boolean {
  const anchor = travelAnchor()
  if (!anchor) return true
  return dist(anchor, pos) >= MIN_SEGMENT
}

function commitPauseWaypoint(): void {
  _pauseTimer = null
  if (!_lastPos) return
  if (!farEnoughToArm(_lastPos)) return

  const last = _waypoints[_waypoints.length - 1]
  if (last && dist(last, _lastPos) < MERGE_EPS) return

  _waypoints.push({ x: _lastPos.x, y: _lastPos.y })
  notify()
}

function schedulePauseWaypoint(): void {
  clearPauseTimer()
  _pauseTimer = setTimeout(commitPauseWaypoint, PAUSE_MS)
}

/** Collapse near-duplicate points (safety net for consumers). */
function dedupeWaypoints(points: Waypoint[]): Waypoint[] {
  const out: Waypoint[] = []
  for (const p of points) {
    const prev = out[out.length - 1]
    if (prev && dist(prev, p) < MERGE_EPS) continue
    out.push(p)
  }
  return out
}

// ─── Public API ────────────────────────────────────────────────────────────────

/** Subscribe to waypoint commits (needed so the draft line re-renders on pause). */
export function subscribeConnectionDraft(onChange: () => void): () => void {
  _listeners.add(onChange)
  return () => {
    _listeners.delete(onChange)
  }
}

/** Call at the beginning of every new connection drag. */
export function resetConnectionDraft(): void {
  clearPauseTimer()
  _waypoints = []
  _lastPos = null
  _origin = null
}

/**
 * Feed the latest cursor position (in React Flow's flow coordinates).
 * Call this every time `toX`/`toY` changes inside the ConnectionLineComponent.
 *
 * Moving restarts the stillness timer. Stopping places a breakpoint once;
 * you must drag away before the next stop can create another.
 */
export function updateConnectionDraft(toX: number, toY: number): void {
  const cur: Waypoint = { x: toX, y: toY }

  if (_lastPos == null) {
    _lastPos = cur
    _origin = cur
    // Don't arm yet — wait until the user has actually dragged away from start.
    return
  }

  const moved = dist(_lastPos, cur)
  if (moved < STILL_EPS) {
    // Still considered stopped — leave any existing pause timer running.
    return
  }

  _lastPos = cur

  if (!farEnoughToArm(cur)) {
    // Still too close to the last bend / start — don't arm a new pause.
    clearPauseTimer()
    return
  }

  schedulePauseWaypoint()
}

/** Returns a snapshot of all confirmed waypoints so far (deduped). */
export function getConnectionDraftWaypoints(): Waypoint[] {
  return dedupeWaypoints(_waypoints)
}
