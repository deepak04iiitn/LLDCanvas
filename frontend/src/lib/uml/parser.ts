import type { UMLAttribute, UMLMethod, Visibility } from '@/types'

const VISIBILITIES: Visibility[] = ['+', '-', '#', '~']

function extractVisibility(raw: string): { visibility: Visibility; rest: string } {
  const trimmed = raw.trim()
  if (VISIBILITIES.includes(trimmed[0] as Visibility)) {
    return { visibility: trimmed[0] as Visibility, rest: trimmed.slice(1).trim() }
  }
  return { visibility: '+', rest: trimmed }
}

// ─── Attributes ───────────────────────────────────────────────────────────────

export function formatAttribute(attr: UMLAttribute): string {
  return `${attr.visibility} ${attr.name}: ${attr.type}`
}

export function parseAttribute(raw: string): Omit<UMLAttribute, 'id' | 'isStatic'> {
  const { visibility, rest } = extractVisibility(raw)
  const colonIdx = rest.lastIndexOf(':')
  if (colonIdx === -1) {
    return { visibility, name: rest || 'field', type: 'String' }
  }
  return {
    visibility,
    name: rest.slice(0, colonIdx).trim() || 'field',
    type: rest.slice(colonIdx + 1).trim() || 'String',
  }
}

// ─── Methods ─────────────────────────────────────────────────────────────────

export function formatMethod(method: UMLMethod, className?: string): string {
  const name = method.isConstructor && className ? className : method.name
  const returnPart = method.isConstructor ? '' : `: ${method.returnType}`
  return `${method.visibility} ${name}(${method.params})${returnPart}`
}

export function parseMethod(raw: string): Omit<UMLMethod, 'id' | 'isStatic' | 'isAbstract' | 'isConstructor'> {
  const { visibility, rest } = extractVisibility(raw)

  const parenOpen = rest.indexOf('(')
  const parenClose = rest.lastIndexOf(')')

  if (parenOpen === -1) {
    // No parens — treat as method name with no params
    const colonIdx = rest.lastIndexOf(':')
    return {
      visibility,
      name: colonIdx !== -1 ? rest.slice(0, colonIdx).trim() : rest,
      params: '',
      returnType: colonIdx !== -1 ? rest.slice(colonIdx + 1).trim() : 'void',
    }
  }

  const name = rest.slice(0, parenOpen).trim() || 'method'
  const params = parenClose > parenOpen ? rest.slice(parenOpen + 1, parenClose) : ''
  const afterParen = rest.slice(Math.max(parenClose + 1, parenOpen + 1)).trim()
  const returnType = afterParen.startsWith(':')
    ? afterParen.slice(1).trim() || 'void'
    : 'void'

  return { visibility, name, params, returnType }
}
