'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { artifactApi, type ArtifactVersion } from '@/lib/artifact-api'

export interface HistoryPanelProps {
  diagramId?: string | null
  selectedElementId?: string | null
  className?: string
}

function versionId(v: ArtifactVersion): string {
  return String(v.id ?? v._id)
}

/**
 * History tab — Version snapshots for a persisted artifact.
 */
export function HistoryPanel({
  diagramId = null,
  className,
}: HistoryPanelProps) {
  const persistable = Boolean(diagramId && diagramId !== 'local')
  const [versions, setVersions] = useState<ArtifactVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [snapshotting, setSnapshotting] = useState(false)

  const loadVersions = useCallback(async () => {
    if (!diagramId || !persistable) return
    setLoading(true)
    try {
      const res = await artifactApi.getVersions(diagramId)
      setVersions(res.versions ?? [])
    } catch {
      toast.error('Could not load versions')
    } finally {
      setLoading(false)
    }
  }, [diagramId, persistable])

  useEffect(() => {
    void loadVersions()
  }, [loadVersions])

  const snapshot = async () => {
    if (!diagramId) return
    setSnapshotting(true)
    try {
      await artifactApi.postVersion(diagramId, {
        label: `Snapshot ${new Date().toLocaleString()}`,
      })
      toast.success('Version saved')
      await loadVersions()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Snapshot failed')
    } finally {
      setSnapshotting(false)
    }
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-paper', className)}>
      <div className="shrink-0 border-b border-hairline px-3 py-2">
        <p className="font-mono text-[10px] font-medium uppercase tracking-wide text-brand">
          Version History
        </p>
      </div>

      {!persistable ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <p className="max-w-xs text-[13px] text-ink-muted">
            Save this diagram to unlock version history.
          </p>
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-hairline px-4 py-3">
            <button
              type="button"
              disabled={snapshotting}
              onClick={() => void snapshot()}
              className="rounded-md bg-brand px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
            >
              {snapshotting ? 'Saving…' : 'Snapshot current'}
            </button>
          </div>

          {loading ? (
            <div className="flex flex-1 items-center justify-center text-[13px] text-ink-muted">
              Loading…
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              <p className="max-w-xs text-[13px] text-ink-muted">
                No snapshots yet. Use the button above to save the current state.
              </p>
            </div>
          ) : (
            <ul className="min-h-0 flex-1 divide-y divide-hairline overflow-y-auto">
              {versions.map((v, i) => (
                <li
                  key={versionId(v)}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <span className="shrink-0 font-mono text-[10px] text-ink-faint">
                    v{versions.length - i}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-ink">
                      {v.label || new Date(v.createdAt).toLocaleString()}
                    </p>
                    {v.nodeCount != null && (
                      <p className="text-[11px] text-ink-faint">
                        {v.nodeCount} nodes · {v.edgeCount ?? 0} edges
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
