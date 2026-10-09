import type { ISkills } from '../../models/journey/journey-profile.model'

export const SKILL_KEYS: (keyof ISkills)[] = [
  'oop',
  'solid',
  'patterns',
  'designThinking',
  'requirementAnalysis',
  'entityIdentification',
  'responsibilities',
  'relationships',
  'extensibility',
  'coupling',
  'cohesion',
  'communication',
  'tradeoffReasoning',
  'followupHandling',
  'designSpeed',
]

export const SKILL_LABELS: Record<string, string> = {
  oop: 'OOP',
  solid: 'SOLID Principles',
  patterns: 'Design Patterns',
  designThinking: 'Design Thinking',
  requirementAnalysis: 'Requirement Analysis',
  entityIdentification: 'Entity Identification',
  responsibilities: 'Responsibility Assignment',
  relationships: 'Class Relationships',
  extensibility: 'Extensibility',
  coupling: 'Coupling',
  cohesion: 'Cohesion',
  communication: 'Communication',
  tradeoffReasoning: 'Trade-off Reasoning',
  followupHandling: 'Follow-up Handling',
  designSpeed: 'Design Speed',
}
