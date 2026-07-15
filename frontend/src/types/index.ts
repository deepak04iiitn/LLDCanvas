// ─── Interview & Stats ────────────────────────────────────────────────────────

export interface InterviewSession {
  _id: string
  userId: string
  diagramId: string | null
  title: string
  status: 'active' | 'completed' | 'abandoned'
  durationLimit: number | null
  timeElapsed: number
  notes: string
  canvasSnapshot: unknown
  startedAt: string
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DailyActivity {
  date: string
  sessionCount: number
  timeSeconds: number
}

export interface PracticeStats {
  totalSessions: number
  totalTimeSeconds: number
  longestStreakDays: number
  currentStreakDays: number
  lastPracticeDate: string | null
  dailyActivity: DailyActivity[]
}

// ─── Node Types ───────────────────────────────────────────────────────────────

export type NodeType = 'class' | 'abstract-class' | 'interface' | 'enum' | 'note'

export type Visibility = '+' | '-' | '#' | '~'

export interface UMLAttribute {
  id: string
  visibility: Visibility
  name: string
  type: string
  isStatic: boolean
}

export interface UMLMethod {
  id: string
  visibility: Visibility
  name: string
  params: string
  returnType: string
  isStatic: boolean
  isAbstract: boolean
  isConstructor?: boolean
}

export interface UMLNodeData {
  nodeType: NodeType
  name: string
  stereotype?: string       // e.g. 'singleton', 'repository'
  genericParam?: string     // e.g. 'T' for Repository<T>
  constraints?: string[]    // e.g. ['readOnly', 'ordered']
  attributes: UMLAttribute[]
  methods: UMLMethod[]
  noteText?: string         // used only when nodeType === 'note'
  packageName?: string
  isEditing?: boolean       // triggers auto-focus of name on mount
  [key: string]: unknown    // React Flow requires index signature on node data
}

// ─── Edge / Relationship Types ─────────────────────────────────────────────────

export type RelationshipType =
  | 'association'
  | 'aggregation'
  | 'composition'
  | 'inheritance'
  | 'realization'
  | 'dependency'
  | 'bidirectional'

export type EdgeLineStyle = 'step' | 'straight'

export interface UMLEdgeData {
  relationshipType: RelationshipType
  sourceMultiplicity?: string   // '1', '0..1', '1..*', '0..*'
  targetMultiplicity?: string
  label?: string
  lineStyle?: EdgeLineStyle    // defaults to 'step' (elbow) when unset
  [key: string]: unknown
}

// ─── Canvas / Diagram ─────────────────────────────────────────────────────────

export type CanvasTheme = 'light' | 'dark' | 'whiteboard'

export interface DiagramMeta {
  theme: CanvasTheme
  zoom: number
  panX: number
  panY: number
}

export interface DiagramData {
  version: number
  nodes: unknown[]
  edges: unknown[]
  meta: DiagramMeta
}

// ─── API Shapes ───────────────────────────────────────────────────────────────

export interface DiagramSummary {
  _id: string
  title: string
  thumbnail?: string
  updatedAt: string
  createdAt: string
  isTemplate: boolean
}

export interface DiagramFull extends DiagramSummary {
  diagramData: DiagramData
}

export interface ApiUser {
  _id: string
  name: string
  email: string
  image?: string
  authProvider: 'google' | 'email'
}

