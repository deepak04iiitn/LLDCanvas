import { Request, Response, NextFunction } from 'express'
import { Diagram } from '../../models/diagram.model'
import { createError } from '../../middleware/error'
import type { GraphNode } from '../../services/graph/analyze'

type MethodLike = string | { name?: string; visibility?: string; returnType?: string }

function methodName(m: MethodLike): string {
  if (typeof m === 'string') return m
  return String(m.name ?? 'method')
}

function methodSigTs(m: MethodLike): string {
  if (typeof m === 'string') return `${m}(): void`
  const name = String(m.name ?? 'method')
  const ret = String(m.returnType ?? 'void')
  return `${name}(): ${ret}`
}

function methodSigJava(m: MethodLike): string {
  if (typeof m === 'string') return `public void ${m}() {}`
  const name = String(m.name ?? 'method')
  const ret = String(m.returnType ?? 'void')
  const vis = String(m.visibility ?? 'public')
  return `  ${vis} ${ret} ${name}() {\n  }`
}

function generateTypescript(nodes: GraphNode[]): string {
  const lines: string[] = ['// Generated from UML — skeleton only\n']
  for (const n of nodes) {
    const data = n.data ?? {}
    const name = String(data.name ?? n.id).replace(/\W/g, '_') || 'Class'
    const nodeType = String(data.nodeType ?? 'class')
    const methods = (Array.isArray(data.methods) ? data.methods : []) as MethodLike[]
    if (nodeType === 'interface') {
      lines.push(`export interface ${name} {`)
      for (const m of methods) lines.push(`  ${methodSigTs(m)};`)
      if (methods.length === 0) lines.push('  // …')
      lines.push('}\n')
    } else {
      lines.push(`export class ${name} {`)
      for (const m of methods) lines.push(`  ${methodSigTs(m)} {}`)
      if (methods.length === 0) lines.push('  // …')
      lines.push('}\n')
    }
  }
  if (nodes.length === 0) lines.push('// No class/interface nodes found.\n')
  return lines.join('\n')
}

function generateJava(nodes: GraphNode[]): string {
  const lines: string[] = ['// Generated from UML — skeleton only\n']
  for (const n of nodes) {
    const data = n.data ?? {}
    const name = String(data.name ?? n.id).replace(/\W/g, '_') || 'Class'
    const nodeType = String(data.nodeType ?? 'class')
    const methods = (Array.isArray(data.methods) ? data.methods : []) as MethodLike[]
    if (nodeType === 'interface') {
      lines.push(`public interface ${name} {`)
      for (const m of methods) {
        if (typeof m === 'string') lines.push(`  void ${m}();`)
        else lines.push(`  ${String(m.returnType ?? 'void')} ${String(m.name ?? 'method')}();`)
      }
      if (methods.length === 0) lines.push('  // …')
      lines.push('}\n')
    } else {
      lines.push(`public class ${name} {`)
      for (const m of methods) lines.push(methodSigJava(m))
      if (methods.length === 0) lines.push('  // …')
      lines.push('}\n')
    }
  }
  if (nodes.length === 0) lines.push('// No class/interface nodes found.\n')
  return lines.join('\n')
}

export async function generateUmlCode(req: Request, res: Response, next: NextFunction) {
  try {
    const language = String(req.body.language ?? 'typescript').toLowerCase()
    let nodes: GraphNode[] = []

    if (req.body.diagramData?.nodes) {
      nodes = req.body.diagramData.nodes as GraphNode[]
    } else if (req.body.artifactId) {
      const diagram = await Diagram.findById(String(req.body.artifactId))
      if (!diagram) throw createError('Diagram not found', 404)
      if (diagram.userId.toString() !== req.user!.id) throw createError('Forbidden', 403)
      nodes = (diagram.diagramData?.nodes ?? []) as GraphNode[]
    } else {
      throw createError('Provide artifactId or diagramData', 400)
    }

    // Skip notes / packages for skeleton generation
    nodes = nodes.filter(n => {
      const t = String(n.data?.nodeType ?? 'class')
      return t === 'class' || t === 'interface' || t === 'abstract'
    })

    const code =
      language === 'java' ? generateJava(nodes) : generateTypescript(nodes)

    res.json({ code, language: language === 'java' ? 'java' : 'typescript', nodeCount: nodes.length })
  } catch (e) {
    next(e)
  }
}
