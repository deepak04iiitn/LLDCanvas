'use client'

import {
  Copy,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Props = {
  onRename: () => void
  onDuplicate: () => void
  onExport: () => void
  onDelete: () => void
  align?: 'start' | 'end'
  className?: string
}

export function DiagramRowActions({
  onRename,
  onDuplicate,
  onExport,
  onDelete,
  align = 'end',
  className,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          className ??
          'flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-hairline/70 hover:text-ink'
        }
        onClick={e => e.stopPropagation()}
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-44" onClick={e => e.stopPropagation()}>
        <DropdownMenuItem onClick={onRename} className="gap-2">
          <Pencil size={13} /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate} className="gap-2">
          <Copy size={13} /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExport} className="gap-2">
          <Download size={13} /> Export PNG
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="gap-2 text-red-600 focus:text-red-600"
        >
          <Trash2 size={13} /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
