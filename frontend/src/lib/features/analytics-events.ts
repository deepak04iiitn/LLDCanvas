/** Analytics event name constants — `{category}_{feature}_{action}`. */

export const AnalyticsEvents = {
  // Studio — microscope
  STUDIO_MICROSCOPE_OPEN: 'studio_microscope_open',
  STUDIO_MICROSCOPE_NODE_INSPECT: 'studio_microscope_node_inspect',

  // Studio — dependency web
  STUDIO_DEPWEB_OPEN: 'studio_depweb_open',
  STUDIO_DEPWEB_ISOLATE: 'studio_depweb_isolate',

  // Studio — debugger
  STUDIO_DEBUGGER_SESSION_START: 'studio_debugger_session_start',
  STUDIO_DEBUGGER_SESSION_COMPLETE: 'studio_debugger_session_complete',
  STUDIO_DEBUGGER_SESSION_ABANDON: 'studio_debugger_session_abandon',
  STUDIO_DEBUGGER_ISSUE_MARKED: 'studio_debugger_issue_marked',
  STUDIO_DEBUGGER_REVEAL_VIEWED: 'studio_debugger_reveal_viewed',

  // Studio — refactor / change / evolution / budget
  STUDIO_REFACTOR_SESSION_START: 'studio_refactor_session_start',
  STUDIO_CHANGE_ONE_SESSION_START: 'studio_change_one_session_start',
  STUDIO_EVOLUTION_RUN_START: 'studio_evolution_run_start',
  STUDIO_BUDGET_OPEN: 'studio_budget_open',

  // Learn
  LEARN_SCORE_RUN: 'learn_score_run',
  LEARN_SCORE_DIMENSION_OPEN: 'learn_score_dimension_open',
  LEARN_QUIZ_START: 'learn_quiz_start',
  LEARN_QUIZ_COMPLETE: 'learn_quiz_complete',
  LEARN_DETECTIVE_START: 'learn_detective_start',
  LEARN_ROGUELIKE_RUN_START: 'learn_roguelike_run_start',

  // Hubs
  HUB_DESIGN_STUDIO_OPEN: 'hub_design_studio_open',
  HUB_LEARN_OPEN: 'hub_learn_open',
} as const

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents]
