/**
 * Global UML arrowhead definitions.
 * Mount once inside the editor - these IDs are referenced by UMLEdge.tsx.
 *
 * Marker conventions:
 *  - Inheritance / Realization  → markerEnd  (hollow triangle at parent/interface)
 *  - Dependency / Association   → markerEnd  (open arrow at target)
 *  - Aggregation / Composition  → markerStart (diamond at the "whole" side / source)
 *  - Bidirectional              → markerEnd + markerStart (arrows at both ends)
 *
 * Every shape's `refX`/`refY` sits exactly on the shape's own tip vertex, so the
 * arrowhead point lands precisely on the line's endpoint with no gap or overlap.
 *
 * Two colour variants (light & dark) avoid SVG `currentColor` issues
 * when the canvas background changes.
 */
export function UMLMarkers() {
  return (
    <svg
      width={0}
      height={0}
      aria-hidden
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <defs>
        {/* ── Inheritance: hollow triangle at target (parent class) ──────────
            refX=0 places the flat base of the triangle at the path endpoint.
            The edge path is shortened by the triangle depth so the pointed tip
            lands exactly at the node border — same gap-free strategy as the
            diamond markers. */}
        <marker
          id="uml-inheritance"
          markerWidth="10"
          markerHeight="10"
          refX="0"
          refY="4.5"
          orient="auto"
          overflow="visible"
        >
          <path
            d="M 0 0 L 9 4.5 L 0 9 Z"
            fill="white"
            stroke="#374151"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </marker>
        <marker
          id="uml-inheritance-dark"
          markerWidth="10"
          markerHeight="10"
          refX="0"
          refY="4.5"
          orient="auto"
          overflow="visible"
        >
          <path
            d="M 0 0 L 9 4.5 L 0 9 Z"
            fill="#111111"
            stroke="#9CA3AF"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </marker>

        {/* ── Realization: same triangle (dashed line handled in edge) ───── */}
        <marker
          id="uml-realization"
          markerWidth="10"
          markerHeight="10"
          refX="0"
          refY="4.5"
          orient="auto"
          overflow="visible"
        >
          <path
            d="M 0 0 L 9 4.5 L 0 9 Z"
            fill="white"
            stroke="#374151"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </marker>
        <marker
          id="uml-realization-dark"
          markerWidth="10"
          markerHeight="10"
          refX="0"
          refY="4.5"
          orient="auto"
          overflow="visible"
        >
          <path
            d="M 0 0 L 9 4.5 L 0 9 Z"
            fill="#111111"
            stroke="#9CA3AF"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </marker>

        {/* ── Dependency / open arrowhead ────────────────────────────────
            orient="auto-start-reverse" makes this marker work correctly at
            both ends of a bidirectional edge: as markerEnd it points in the
            path direction; as markerStart it is automatically flipped 180°
            so it points back toward the source node. */}
        <marker
          id="uml-dependency"
          markerWidth="9"
          markerHeight="9"
          refX="8"
          refY="4"
          orient="auto-start-reverse"
          overflow="visible"
        >
          <path
            d="M 0 0 L 8 4 L 0 8"
            fill="none"
            stroke="#374151"
            strokeWidth="1.4"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        </marker>
        <marker
          id="uml-dependency-dark"
          markerWidth="9"
          markerHeight="9"
          refX="8"
          refY="4"
          orient="auto-start-reverse"
          overflow="visible"
        >
          <path
            d="M 0 0 L 8 4 L 0 8"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="1.4"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        </marker>

        {/* ── Aggregation: hollow diamond ─────────────────────────────────
            refX=0 places the INNER (left) tip at the path endpoint so the
            edge line connects cleanly to the diamond's inner tip. The edge
            path is shortened by the diamond's width so the outer (right) tip
            lands exactly at the node border — no fill-vs-stroke gap possible. */}
        <marker
          id="uml-aggregation"
          markerWidth="14"
          markerHeight="10"
          refX="0"
          refY="4.5"
          orient="auto"
          overflow="visible"
        >
          <path
            d="M 0 4.5 L 6.5 0 L 13 4.5 L 6.5 9 Z"
            fill="white"
            stroke="#374151"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </marker>
        <marker
          id="uml-aggregation-dark"
          markerWidth="14"
          markerHeight="10"
          refX="0"
          refY="4.5"
          orient="auto"
          overflow="visible"
        >
          <path
            d="M 0 4.5 L 6.5 0 L 13 4.5 L 6.5 9 Z"
            fill="#111111"
            stroke="#9CA3AF"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </marker>

        {/* ── Composition: filled diamond (same geometry, same refX fix) ── */}
        <marker
          id="uml-composition"
          markerWidth="14"
          markerHeight="10"
          refX="0"
          refY="4.5"
          orient="auto"
          overflow="visible"
        >
          <path
            d="M 0 4.5 L 6.5 0 L 13 4.5 L 6.5 9 Z"
            fill="#374151"
            stroke="#374151"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </marker>
        <marker
          id="uml-composition-dark"
          markerWidth="14"
          markerHeight="10"
          refX="0"
          refY="4.5"
          orient="auto"
          overflow="visible"
        >
          <path
            d="M 0 4.5 L 6.5 0 L 13 4.5 L 6.5 9 Z"
            fill="#9CA3AF"
            stroke="#9CA3AF"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
    </svg>
  )
}
