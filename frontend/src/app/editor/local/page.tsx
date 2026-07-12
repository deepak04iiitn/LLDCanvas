'use client'

import { EditorShell } from '@/components/editor/EditorShell'

export default function LocalEditorPage() {
  return (
    <EditorShell
      diagramId={null}
      initialTitle="Untitled Diagram"
      initialData={null}
    />
  )
}
