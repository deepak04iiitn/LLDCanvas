/**
 * Curated “how to use this feature” copy for problem-library Instructions tabs.
 * Keep language simple — senior-interviewer tone without jargon overload.
 */

export type FeatureInstructionKey =
  | 'studio-debugger'
  | 'studio-refactor'
  | 'studio-change'
  | 'studio-evolution'
  | 'studio-budget'
  | 'learn-debugger'
  | 'learn-design-bug'
  | 'learn-roguelike'
  | 'learn-detective'

export interface FeatureInstructions {
  key: FeatureInstructionKey
  title: string
  tagline: string
  goal: string
  steps: { title: string; body: string }[]
  tips: string[]
  avoid: string[]
  interviewTip: string
}

export const FEATURE_INSTRUCTIONS: Record<FeatureInstructionKey, FeatureInstructions> = {
  'studio-debugger': {
    key: 'studio-debugger',
    title: 'Design Debugger',
    tagline: 'Find the flaw. Name it. Fix it.',
    goal:
      'Practice spotting structural design mistakes on a UML canvas — the same skill interviewers test when they ask “what’s wrong with this design?”',
    steps: [
      {
        title: 'Detect',
        body: 'Study the diagram. Mark elements or relationships that look wrong — inheritance that should be composition, god classes, backwards arrows, missing boundaries.',
      },
      {
        title: 'Diagnose',
        body: 'For each mark, pick a category and explain why it’s a problem in plain language. Vague notes won’t pass — say what breaks if this stays.',
      },
      {
        title: 'Repair',
        body: 'Edit the diagram: change relationships, extract classes, introduce interfaces. Keep what still works.',
      },
      {
        title: 'Verify',
        body: 'Submit and read the report. Use it like interviewer feedback — what you caught, what you missed, what to practice next.',
      },
    ],
    tips: [
      'Say the relationship out loud: “A is a B” vs “A has a B.” Inheritance fails that test often.',
      'Open Code when you want to sketch how the broken design would look in real classes.',
      'One clear issue well explained beats five vague marks.',
    ],
    avoid: [
      'Marking everything “just in case” — precision matters more than volume.',
      'Fixing symptoms (renaming) without fixing structure (wrong relationship type).',
      'Skipping the diagnose step and jumping straight to redrawing.',
    ],
    interviewTip:
      'In interviews, spotting the bug is only half the grade. Explaining the consequence and proposing a minimal fix is what separates mid-level from senior.',
  },

  'studio-refactor': {
    key: 'studio-refactor',
    title: 'Refactoring Mode',
    tagline: 'Same behavior. Better design.',
    goal:
      'Take a messy but working design and clean it up without breaking protected flows — exactly what “refactor this” means in a system-design follow-up.',
    steps: [
      {
        title: 'Read the contract',
        body: 'Open the brief and behavior checklist. Those flows must keep working after your changes. That is your non-negotiable.',
      },
      {
        title: 'Study original vs working',
        body: 'Left is frozen original. Right is yours. Improve structure on the right — extract classes, cut coupling, clarify ownership.',
      },
      {
        title: 'Refactor minimally',
        body: 'Prefer small, named moves (extract, introduce interface) over a full redraw. Interviewers watch for discipline.',
      },
      {
        title: 'Prove it',
        body: 'Submit when protected flows still hold. Optionally use Code to sanity-check how the new structure would implement.',
      },
    ],
    tips: [
      'Start with the worst smell (god class, tight coupling) — don’t polish names first.',
      'Keep domain names readable; don’t invent clever abstractions nobody asked for.',
      'Check the behavior checklist before submit — that’s your safety net.',
    ],
    avoid: [
      'Changing behavior “while you’re at it” — that’s a feature, not a refactor.',
      'Deleting protected classes because they’re awkward — rewire instead.',
      'Adding layers with no payoff (interfaces for a single concrete type forever).',
    ],
    interviewTip:
      'Say out loud: “I’m preserving X and Y while extracting Z.” Narrating trade-offs is half the interview.',
  },

  'studio-change': {
    key: 'studio-change',
    title: 'Change One Thing',
    tagline: 'Requirements change. Your design shouldn’t shatter.',
    goal:
      'Absorb a new product request with the smallest structural change — without breaking what already works.',
    steps: [
      {
        title: 'Brief',
        body: 'Read the change request carefully. Note what’s new and what must stay the same.',
      },
      {
        title: 'Predict',
        body: 'Select which classes/relationships you think will need to move. This trains blast-radius thinking before you edit.',
      },
      {
        title: 'Edit',
        body: 'Make the minimal UML change that satisfies the request. Prefer a port/interface over if/else piles.',
      },
      {
        title: 'Submit',
        body: 'Protected flows must still pass; new flows must appear. Use Code if you want to prototype the delta in code.',
      },
    ],
    tips: [
      'Ask: “What is the one seam that should absorb this change?” Usually a gateway, strategy, or observer.',
      'If your edit touches more than a few classes, you may be over-solving.',
      'Compare your prediction to what you actually changed — that gap is the learning.',
    ],
    avoid: [
      'Rewriting the whole diagram for a single new requirement.',
      'Hard-coding the new case inside a domain class that shouldn’t know about it.',
      'Ignoring protected flows while chasing the new feature.',
    ],
    interviewTip:
      'Interviewers love “what if we also need PayPal next year?” Your answer should show an extension point — not another if-branch.',
  },

  'studio-evolution': {
    key: 'studio-evolution',
    title: 'Architecture Evolution',
    tagline: 'v1 ships. The hard part comes next.',
    goal:
      'Evolve a living design across time — knowing when to change and when holding is the senior move.',
    steps: [
      {
        title: 'Read the stage',
        body: 'Each stage is a moment in the product’s life: metrics, narrative, pressures. Understand what changed in the world.',
      },
      {
        title: 'Pick pressures',
        body: 'Select the real pressures (latency, coupling, scale). Don’t invent imaginary futures the story doesn’t support.',
      },
      {
        title: 'Evolve or hold',
        body: 'Sometimes the correct answer is do nothing. Over-engineering Day 0 is a fail. Change when the pressure is real.',
      },
      {
        title: 'Edit when needed',
        body: 'If you evolve, change the diagram for this stage only — don’t redesign the entire future. Carry debt intentionally.',
      },
    ],
    tips: [
      'Track deferred debt — later stages escalate what you ignored.',
      'Prefer reversible, local changes over big-bang rewrites.',
      'Match complexity budget: don’t buy an event bus for 200 users.',
    ],
    avoid: [
      'Preparing for marketplace scale on day one with no sellers.',
      'Changing everything every stage — evolution should be incremental.',
      'Ignoring hold stages; they’re testing judgment, not passivity.',
    ],
    interviewTip:
      '“I’d wait until we have a second provider” is often a stronger answer than a premature abstraction.',
  },

  'studio-budget': {
    key: 'studio-budget',
    title: 'Architecture Budget',
    tagline: 'Budget is finite. Decisions aren’t free.',
    goal:
      'Allocate scarce architecture points under pressure — prioritize what matters now and accept debt deliberately.',
    steps: [
      {
        title: 'Read priorities & pressures',
        body: 'Critical priorities must be covered. Pressures tell you what’s hurting. Map investments to both.',
      },
      {
        title: 'Shop the catalog',
        body: 'Each investment has cost, benefits, and risks. Cheap hacks exist — they ship fast and hurt later.',
      },
      {
        title: 'Spend or reserve',
        body: 'You don’t have to spend everything. Reserving for later stages is often wise when the story is uncertain.',
      },
      {
        title: 'Survive later stages',
        body: 'Traffic spikes and new requirements escalate deferred debt. Your early choices show up as opportunity cost.',
      },
    ],
    tips: [
      'Cover critical priorities first — then niceties.',
      'Prefer one proper investment over two weak cheap hacks.',
      'Say why you deferred something; silent debt still grades.',
    ],
    avoid: [
      'Buying everything “just in case” until the meter is empty.',
      'Ignoring cheap-hack warnings when a proper alternative fits the budget.',
      'Optimizing for imaginary scale while checkout reliability is critical.',
    ],
    interviewTip:
      'Senior candidates rank investments under a constraint. Listing ten improvements without a budget is a mid-level trap.',
  },

  'learn-debugger': {
    key: 'learn-debugger',
    title: 'Code Bug Lab',
    tagline: 'The code compiles. The design doesn’t.',
    goal:
      'Find and fix structural bugs in real LLD-style code — then explain why the original design was wrong.',
    steps: [
      {
        title: 'Read the prompt',
        body: 'Understand what the code is supposed to do and which language variant you’re editing.',
      },
      {
        title: 'Hunt the bug',
        body: 'Look for wrong inheritance, SRP violations, tight coupling, broken encapsulation — not just typos.',
      },
      {
        title: 'Fix and run',
        body: 'Edit the code, run it, match expected output. Reset if you need a clean slate.',
      },
      {
        title: 'Internalize the lesson',
        body: 'After you pass, read the explanation. That’s the interviewer debrief — don’t skip it.',
      },
    ],
    tips: [
      'Ask “does this class have one reason to change?” before editing.',
      'Use the hint only after a real attempt — struggle builds interview muscle.',
      'Try another language variant after you understand the design bug.',
    ],
    avoid: [
      'Patching symptoms (extra ifs) without fixing the underlying structure.',
      'Copy-pasting until tests pass without understanding why.',
      'Ignoring the post-solve explanation.',
    ],
    interviewTip:
      'Interviewers care that you can name the principle (SRP, composition over inheritance) and show a cleaner design.',
  },

  'learn-design-bug': {
    key: 'learn-design-bug',
    title: 'Design Bug Hunt',
    tagline: 'Mark the violation before the interviewer does.',
    goal:
      'Inspect UML diagrams and annotate structural design bugs — training your eye for interview whiteboards.',
    steps: [
      {
        title: 'Scan the diagram',
        body: 'Read class names, methods, and arrows. Look for relationships that violate is-a / has-a.',
      },
      {
        title: 'Mark issues',
        body: 'Click the offending element or edge. Categorize the problem and explain the consequence.',
      },
      {
        title: 'Submit',
        body: 'Compare your marks to the expected issues. Learn from misses — they’re the highest-value practice.',
      },
    ],
    tips: [
      'Inheritance and cyclic dependencies are the most common interview traps.',
      'Ask who owns whom — ownership arrows often point the wrong way.',
      'One precise mark beats a spray of guesses.',
    ],
    avoid: [
      'Marking style nits (spacing, naming polish) instead of structural flaws.',
      'Giving up after one miss — re-open and try again with a fresh eye.',
    ],
    interviewTip:
      'On a whiteboard, circle the bad arrow and say what breaks at runtime or under change. That’s the signal.',
  },

  'learn-roguelike': {
    key: 'learn-roguelike',
    title: 'LLD Roguelike',
    tagline: 'Decisions are permanent here.',
    goal:
      'Design under evolving pressure with limited resources — practice adaptation, not perfect first drafts.',
    steps: [
      {
        title: 'Pick mode & scenario',
        body: 'Beginner for fundamentals; Interview for timed trade-offs; harder modes for scarce resources.',
      },
      {
        title: 'Build the MVP',
        body: 'First stages want a clear domain model. Don’t over-architect before requirements demand it.',
      },
      {
        title: 'Respond to events',
        body: 'Each stage throws a requirement, failure, or scale pressure. Choose a decision and live with the health delta.',
      },
      {
        title: 'Survive the boss',
        body: 'Late stages test whether your earlier choices left room to adapt. Checkpoints are scarce — spend them wisely.',
      },
    ],
    tips: [
      'Watch coupling and debt meters — they’re your interview scoreboard.',
      'Prefer designs that leave extension points when the story hints at variation.',
      'In Interview mode, narrate trade-offs out loud as you click.',
    ],
    avoid: [
      'Spending the whole complexity budget on stage one.',
      'Ignoring constraints (team size, hours) — they’re part of the problem.',
      'Restarting every time you dislike an outcome — learning comes from living with it.',
    ],
    interviewTip:
      'Roguelike mirrors real systems: you rarely get a clean redesign. Practice adapting under constraints.',
  },

  'learn-detective': {
    key: 'learn-detective',
    title: 'Pattern Detective',
    tagline: 'Read the code. Name the pattern.',
    goal:
      'Recognize design patterns from code and structure — and explain when you’d use (or avoid) them.',
    steps: [
      {
        title: 'Observe',
        body: 'Read the snippet or diagram. Note roles: who creates, who decides, who notifies.',
      },
      {
        title: 'Identify',
        body: 'Name the pattern (or say it isn’t one). Back your call with evidence from the code.',
      },
      {
        title: 'Explain & compare',
        body: 'Say why it fits, what trade-off it buys, and what you’d pick instead in another context.',
      },
    ],
    tips: [
      'Focus on intent (vary algorithm, notify dependents) not just class names.',
      'If two patterns seem close, compare their consequences under change.',
      'Wrong answers with good reasoning still teach — read the feedback carefully.',
    ],
    avoid: [
      'Memorizing UML shapes without understanding the problem they solve.',
      'Forcing a pattern name when the code is just plain structure.',
    ],
    interviewTip:
      'Interviewers rarely ask “draw Observer.” They ask “how would you notify many subscribers?” — pattern fluency shows up there.',
  },
}
