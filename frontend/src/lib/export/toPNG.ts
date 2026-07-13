import { toPng, toSvg } from 'html-to-image'
import type { CanvasTheme } from '@/types'

const BG: Record<CanvasTheme, string> = {
  light: '#F8F8F8',
  dark: '#111111',
  whiteboard: '#FFFFFF',
}

function slug(title: string): string {
  return title.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'diagram'
}

function getCanvasElement(): HTMLElement | null {
  return document.querySelector('.react-flow__renderer') as HTMLElement | null
}

export async function exportPNG(theme: CanvasTheme, title = 'diagram', scale = 2): Promise<void> {
  const el = getCanvasElement()
  if (!el) return

  const dataUrl = await toPng(el, {
    backgroundColor: BG[theme],
    pixelRatio: scale,
    cacheBust: true,
  })

  downloadDataUrl(dataUrl, `${slug(title)}.png`)
}

export async function exportSVG(theme: CanvasTheme, title = 'diagram'): Promise<void> {
  const el = getCanvasElement()
  if (!el) return

  const dataUrl = await toSvg(el, {
    backgroundColor: BG[theme],
    cacheBust: true,
  })

  downloadDataUrl(dataUrl, `${slug(title)}.svg`)
}

export async function generateThumbnail(theme: CanvasTheme): Promise<string | null> {
  const el = getCanvasElement()
  if (!el) return null

  return toPng(el, {
    backgroundColor: BG[theme],
    pixelRatio: 0.5,
    width: 400,
    height: 300,
    cacheBust: false,
  }).catch(() => null)
}

function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}
