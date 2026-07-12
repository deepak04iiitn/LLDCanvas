/**
 * Global UML arrowhead definitions.
 * Mount once inside the editor — these IDs are referenced by UMLEdge.tsx.
 *
 * Marker conventions:
 *  - Inheritance / Realization  → markerEnd  (hollow triangle at parent/interface)
 *  - Dependency / Association   → markerEnd  (open arrow at target)
 *  - Aggregation / Composition  → markerStart (diamond at the "whole" side / source)
 *  - Bidirectional              → markerEnd + markerStart (arrows at both ends)
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
        {/* ── Inheritance: hollow triangle at target (parent class) ──────── */}
        <marker
          id="uml-inheritance"
          markerWidth="16"
          markerHeight="12"
          refX="13"
          refY="6"
          orient="auto"
        >
          <path
            d="M 0 0 L 12 6 L 0 12 Z"
            fill="white"
            stroke="#374151"
            strokeWidth="1.5"
          />
        </marker>
        <marker
          id="uml-inheritance-dark"
          markerWidth="16"
          markerHeight="12"
          refX="13"
          refY="6"
          orient="auto"
        >
          <path
            d="M 0 0 L 12 6 L 0 12 Z"
            fill="#111111"
            stroke="#9CA3AF"
            strokeWidth="1.5"
          />
        </marker>

        {/* ── Realization: same triangle (dashed line handled in edge) ───── */}
        <marker
          id="uml-realization"
          markerWidth="16"
          markerHeight="12"
          refX="13"
          refY="6"
          orient="auto"
        >
          <path
            d="M 0 0 L 12 6 L 0 12 Z"
            fill="white"
            stroke="#374151"
            strokeWidth="1.5"
          />
        </marker>
        <marker
          id="uml-realization-dark"
          markerWidth="16"
          markerHeight="12"
          refX="13"
          refY="6"
          orient="auto"
        >
          <path
            d="M 0 0 L 12 6 L 0 12 Z"
            fill="#111111"
            stroke="#9CA3AF"
            strokeWidth="1.5"
          />
        </marker>

        {/* ── Dependency / open arrowhead at target ─────────────────────── */}
        <marker
          id="uml-dependency"
          markerWidth="12"
          markerHeight="10"
          refX="10"
          refY="5"
          orient="auto"
        >
          <path
            d="M 0 0 L 10 5 L 0 10"
            fill="none"
            stroke="#374151"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </marker>
        <marker
          id="uml-dependency-dark"
          markerWidth="12"
          markerHeight="10"
          refX="10"
          refY="5"
          orient="auto"
        >
          <path
            d="M 0 0 L 10 5 L 0 10"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </marker>

        {/* ── Aggregation: hollow diamond — used with markerEnd (draw from part→whole) */}
        <marker
          id="uml-aggregation"
          markerWidth="18"
          markerHeight="12"
          refX="16"
          refY="6"
          orient="auto"
        >
          <path
            d="M 0 6 L 8 0 L 16 6 L 8 12 Z"
            fill="white"
            stroke="#374151"
            strokeWidth="1.5"
          />
        </marker>
        <marker
          id="uml-aggregation-dark"
          markerWidth="18"
          markerHeight="12"
          refX="16"
          refY="6"
          orient="auto"
        >
          <path
            d="M 0 6 L 8 0 L 16 6 L 8 12 Z"
            fill="#111111"
            stroke="#9CA3AF"
            strokeWidth="1.5"
          />
        </marker>

        {/* ── Composition: filled diamond ────────────────────────────────── */}
        <marker
          id="uml-composition"
          markerWidth="18"
          markerHeight="12"
          refX="16"
          refY="6"
          orient="auto"
        >
          <path
            d="M 0 6 L 8 0 L 16 6 L 8 12 Z"
            fill="#374151"
            stroke="#374151"
            strokeWidth="1"
          />
        </marker>
        <marker
          id="uml-composition-dark"
          markerWidth="18"
          markerHeight="12"
          refX="16"
          refY="6"
          orient="auto"
        >
          <path
            d="M 0 6 L 8 0 L 16 6 L 8 12 Z"
            fill="#9CA3AF"
            stroke="#9CA3AF"
            strokeWidth="1"
          />
        </marker>
      </defs>
    </svg>
  )
}
