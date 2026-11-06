import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  // Left: scoring strategy + the state enum
  iface('ss', 'ScoringStrategy', GRID.x(0), GRID.y(0), [
    method('+', 'score', 'q: Question, correct: boolean, elapsedMs: long', 'int'),
  ]),
  cls('sb', 'SpeedBonusScoring', GRID.x(0), GRID.y(1), [
    attr('-', 'base', 'int'),
    attr('-', 'maxBonus', 'int'),
  ], [
    method('+', 'score', 'q, correct, elapsedMs', 'int'),
  ]),
  enm('gs', 'GameState', GRID.x(0), GRID.y(2.3), ['WAITING', 'QUESTION_ACTIVE', 'REVEAL', 'LEADERBOARD', 'FINISHED']),

  // Centre: the session aggregate + ranking
  cls('qg', 'QuizGame', GRID.x(1), GRID.y(0), [
    attr('-', 'questions', 'List<Question>'),
    attr('-', 'players', 'Map<String, Player>'),
    attr('-', 'state', 'GameState'),
    attr('-', 'currentIndex', 'int'),
    attr('-', 'startedAt', 'long'),
    attr('-', 'answers', 'Map<String, Answer>'),
    attr('-', 'scoring', 'ScoringStrategy'),
    attr('-', 'clock', 'Clock'),
  ], [
    method('+', 'addPlayer', 'name: String', 'Player'),
    method('+', 'start', '', 'void'),
    method('+', 'submitAnswer', 'playerId, optionIndex', 'void'),
    method('+', 'tick', '', 'GameState'),
    method('+', 'closeQuestion', '', 'QuestionResult'),
    method('+', 'showLeaderboard', '', 'List<LeaderboardEntry>'),
    method('+', 'nextQuestion', '', 'GameState'),
  ], 'state machine'),
  cls('lb', 'Leaderboard', GRID.x(1), GRID.y(2.1), [], [
    method('+', 'rank', 'players: Collection<Player>', 'List<LeaderboardEntry>', { isStatic: true }),
  ]),
  cls('le', 'LeaderboardEntry', GRID.x(1), GRID.y(3.3), [
    attr('-', 'rank', 'int'),
    attr('-', 'playerId', 'String'),
    attr('-', 'name', 'String'),
    attr('-', 'score', 'int'),
  ], []),

  // Right: the data the game manipulates
  cls('qs', 'Question', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'String'),
    attr('-', 'text', 'String'),
    attr('-', 'options', 'List<String>'),
    attr('-', 'correctIndex', 'int'),
    attr('-', 'timeLimitMs', 'long'),
  ], [
    method('+', 'fromDict', 'raw: Map', 'Question', { isStatic: true }),
  ], 'immutable'),
  cls('pl', 'Player', GRID.x(2), GRID.y(1.3), [
    attr('-', 'id', 'String'),
    attr('-', 'name', 'String'),
    attr('-', 'score', 'int'),
    attr('-', 'correctCount', 'int'),
    attr('-', 'tieBreakMs', 'long'),
  ], []),
  cls('an', 'Answer', GRID.x(2), GRID.y(2.6), [
    attr('-', 'playerId', 'String'),
    attr('-', 'optionIndex', 'int'),
    attr('-', 'elapsedMs', 'long'),
  ], [], 'immutable'),
]

const edges = [
  edge('e1', 'qg', 'qs', 'composition', 'right@15', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1..*' }),
  edge('e2', 'qg', 'pl', 'aggregation', 'right@55', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1..*' }),
  edge('e3', 'qg', 'an', 'association', 'right@90', 'left', { sourceMultiplicity: '1', targetMultiplicity: '0..*', label: 'current question' }),
  edge('e4', 'an', 'pl', 'association', 'top', 'bottom', { label: 'by' }),
  edge('e5', 'qg', 'ss', 'aggregation', 'left@20', 'right', { label: 'scores with' }),
  edge('e6', 'sb', 'ss', 'realization', 'top', 'bottom'),
  edge('e7', 'qg', 'gs', 'dependency', 'left@85', 'right', { label: 'transitions' }),
  edge('e8', 'qg', 'lb', 'dependency', 'bottom', 'top', { label: 'ranks with' }),
  edge('e9', 'lb', 'le', 'dependency', 'bottom', 'top', { label: 'produces' }),
]

//@@py

//@@java

//@@ts

//@@cpp

//@@goCode

//@@csharp

export const quizTriviaEngineSolution: ProblemSolution = {
  slug: 'quiz-trivia-engine',
  title: 'Design a Quiz / Trivia Game Engine - Complete LLD Guide',
  overview: {
    introduction: [
      'A trivia engine is the kind of problem that looks like a UI exercise and turns out to be a modelling exercise. Players, questions and a leaderboard are easy to name. The interesting part is everything that happens between “question shown” and “leaderboard shown”: who is allowed to do what at which moment, how the speed bonus is calculated, what happens when a player answers twice or after time is up, and how a single-player quiz and a hundred-player Kahoot-style game can share one engine without two code paths.',
      'The interviewer is usually looking for three things. First, an explicit game state machine - can you list the phases, the legal transitions, and which operations are valid in each? Second, a clean place for the scoring rule so that “faster answers earn more points” is a swappable policy rather than a formula buried in the game loop. Third, sensible concurrency and time handling: many players submitting at once, and a time limit that must be enforced without dragging threads and sockets into the core model.',
      'In this tutorial we walk the problem like a real interview: clarify the rules (synchronous rounds? tie-breaking? negative marking?), draw the lifecycle before any classes, assign each rule to exactly one owner, implement a complete medium-level engine in six languages with an injectable clock, and finish with a demo that steps time manually so the output is deterministic. If you can explain the transition table and the scoring formula, you can explain the design.',
      'We stay inside the practice-problem brief: multiple-choice questions, per-player scores across rounds, a per-question time limit, a speed bonus, a leaderboard after each round, and single- or multi-player modes for up to about a hundred players per session. Networking, UI, persistence and matchmaking are explicitly out of scope - the engine is a pure, testable model that a transport layer could drive.',
    ],
    constraints: [
      'Questions are multiple choice with exactly one correct option and a per-question time limit.',
      'Each player may answer a question at most once, and only while it is active and within the time limit.',
      'A correct answer earns base points plus a bonus that grows the faster the player answered; a wrong or missing answer earns zero.',
      'Scores accumulate per player across rounds and are exposed through a ranked leaderboard shown after each question.',
      'The same engine supports single-player (one player) and multiplayer (many players) sessions.',
      'The game moves through Waiting → Question Active → Reveal → Leaderboard, then either the next question or Finished.',
      'A session should handle around 100 concurrent players, with score changes visible within about 500 ms.',
    ],
    assumptions: [
      'Rounds are synchronous (Kahoot-style): all players see and answer the same question at the same time.',
      'Elapsed time is measured from when the question opens, using a server-side clock that is injected so tests can control it.',
      'No negative marking and no partial credit. A late, missing or wrong answer scores zero.',
      'Players can join only while the game is in the Waiting state.',
      'Leaderboard ties on score are broken by the total time spent on correct answers (less is better); players who are still tied share a rank.',
      'Transport (websockets, UI) is out of scope. A host timer calls tick() periodically to enforce time limits.',
    ],
    clarificationQuestions: [
      {
        question: 'Is the game synchronous - everyone on the same question at the same time - or can each player progress at their own pace?',
        why: 'Synchronous play means one shared current question and one state machine for the session. Self-paced play means per-player progress and a very different model. We assume synchronous.',
      },
      {
        question: 'How is the speed bonus defined - linear in remaining time, tiered, or streak-based?',
        why: 'It tells you the signature of the scoring strategy and whether it needs history (streaks) or just (question, correct, elapsed).',
      },
      {
        question: 'Is there negative marking or partial credit, and what happens on a wrong answer?',
        why: 'Negative marking changes the lower bound of a score and affects the leaderboard invariants. We assume wrong answers score zero.',
      },
      {
        question: 'How should leaderboard ties be handled - shared rank, or a tie-break rule?',
        why: 'Ranking must be deterministic. We tie-break on total correct-answer time, and equal keys share a rank.',
      },
      {
        question: 'Can players join or leave mid-game? What happens to the score of someone who disconnects?',
        why: 'Joining mid-game would break “everyone answers every question”. We allow joins only in the lobby, and disconnected players simply stop scoring.',
      },
      {
        question: 'Should we plan for other question types (true/false, multi-select, free text) later?',
        why: 'If yes, “is this answer correct?” should be polymorphic on Question rather than hard-coded as an index comparison. We keep MCQ but name the seam.',
      },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'Draw the lifecycle before any class',
        paragraphs: [
          'Resist the urge to start with Quiz, Question, Player. In a trivia game, the phase the game is in decides which operations are legal: you cannot submit an answer during the leaderboard, you cannot skip the reveal, and you cannot add a player after the first question opened. Those rules are the specification, so draw them first.',
          'On the whiteboard write five boxes - WAITING, QUESTION_ACTIVE, REVEAL, LEADERBOARD, FINISHED - and draw arrows for the only transitions that exist: WAITING → QUESTION_ACTIVE (start), QUESTION_ACTIVE → REVEAL (everyone answered or time up), REVEAL → LEADERBOARD, LEADERBOARD → QUESTION_ACTIVE (next question) or → FINISHED (no more questions). Anything not on the diagram is illegal. This single picture will later become a transition table in code.',
        ],
        callout: {
          title: 'Interview tip',
          body: 'Say “the transition table is the spec” out loud. It tells the interviewer you will make illegal sequences impossible by construction instead of sprinkling if-statements around.',
        },
      },
      {
        heading: 'Ask which object owns each rule',
        paragraphs: [
          'Now go rule by rule and assign an owner. “Is this a valid question?” is the Question’s job: at least two options, a correct index in range, a positive time limit. “Is this player allowed to answer right now?” is the game’s job, because it needs the phase, the clock and the set of players. “How many points is this answer worth?” varies by product, so it goes behind a ScoringStrategy. “Who is in first place?” is a pure function of the players, so Leaderboard owns it and holds no state.',
          'This is the same discipline as in any LLD problem: if two different reasons could make you edit a class, split it. Scoring formulas change with product experiments; game flow changes when you add phases; ranking changes when you change tie-break rules. They should not live in the same method.',
        ],
      },
      {
        heading: 'Single-player versus multiplayer is just a number',
        paragraphs: [
          'The brief asks for both modes. The tempting design is a SinglePlayerGame and a MultiplayerGame with duplicated flow. Resist it. A single-player game is a session with exactly one Player: the “everyone has answered” check is satisfied by one answer, the leaderboard has one row, and every rule still applies. One class, parameterized by the player set, handles both.',
          'This is a good moment to mention polymorphism you chose not to use: inheritance would have given you two classes to keep in sync, with no behaviour that actually differs.',
        ],
      },
      {
        heading: 'Discovering entities',
        paragraphs: [
          'QuizGame is the aggregate for one session. It owns the question list, the registered players, the current phase, the index of the current question, when that question opened, and the answers received so far. Every mutation of a game goes through it, which is what lets us guard transitions in one place.',
          'Question is an immutable value: id, text, options, the correct index, and a time limit. Player carries identity plus the statistics that matter for ranking: cumulative score, the count of correct answers and a tie-break time. Answer is a tiny immutable record - which option, and how many milliseconds after the question opened. ScoringStrategy turns (question, correct, elapsed) into points; SpeedBonusScoring is the default. Leaderboard ranks players into LeaderboardEntry rows.',
        ],
      },
      {
        heading: 'Scoring: the formula and where it lives',
        paragraphs: [
          'The speed bonus must be easy to state: a correct answer earns base points plus a bonus proportional to the fraction of the time limit that remained. With base 1000, max bonus 500 and a 10-second limit, answering after 2 s earns 1000 + 500 × 8000 / 10000 = 1400, and answering after 6 s earns 1000 + 500 × 4000 / 10000 = 1200. A wrong answer or no answer is 0.',
          'Two small decisions deserve a sentence in an interview. We use integer math so scores are identical across languages and never depend on floating-point rounding. And we apply points at reveal time, in one pass over all players, rather than at submit time: scores never leak early, and the reveal screen and leaderboard are always consistent.',
        ],
      },
      {
        heading: 'Time without threads: the clock and tick()',
        paragraphs: [
          'The requirement says “per-question time limit,” and the temptation is to start a timer thread per question. That makes the core hard to test and tangles it with concurrency. Instead we inject a Clock (a function returning epoch milliseconds) and give the game a tick() method that a host timer calls periodically. tick() closes the question if its limit has elapsed.',
          'We also enforce the limit on every submitAnswer by comparing the server-side elapsed time to the limit - so even if tick() runs late, a late answer is still rejected exactly at the boundary. A question closes in two ways: everyone has answered (we reveal early), or tick() sees the time is up.',
        ],
      },
      {
        heading: 'Relationships, patterns and the step-by-step plan',
        paragraphs: [
          'QuizGame composes its Questions (they live and die with the session) and aggregates Players (registered in the lobby, referenced by id). Answers belong to the current question only and are cleared when the next one opens. QuizGame depends on the ScoringStrategy and Clock abstractions. The two patterns that earn their place are State (an explicit transition table) and Strategy (scoring); everything else is just good encapsulation.',
          'Implement in this order: the transition table and GameState, Question validation, SpeedBonusScoring (pure and trivially testable), Leaderboard.rank, and then QuizGame with its guards. Mention concurrency last: every public method takes one lock, because many players submit at once.',
        ],
        numbered: [
          'Clarify rounds, scoring, tie-breaking and join rules.',
          'Draw the five phases and the legal transitions.',
          'Model Question (validated), Player, Answer; extract ScoringStrategy.',
          'Implement submitAnswer with every guard: phase, known player, duplicate, valid option, time.',
          'Implement close/reveal: score all players in one pass, then move to REVEAL.',
          'Implement showLeaderboard and nextQuestion; discuss locking and timers.',
        ],
      },
    ],
    entities: [
      { name: 'QuizGame', responsibility: 'Session aggregate: players, current question, answers and phase transitions; scores everyone at reveal.', keyMembers: ['addPlayer', 'start', 'submitAnswer', 'tick', 'nextQuestion'] },
      { name: 'GameState', responsibility: 'WAITING, QUESTION_ACTIVE, REVEAL, LEADERBOARD, FINISHED - the phases of a session.' },
      { name: 'Question', responsibility: 'Immutable multiple-choice question with validation (≥ 2 options, valid correct index, positive limit).', keyMembers: ['options', 'correctIndex', 'timeLimitMs'] },
      { name: 'Player', responsibility: 'Identity plus cumulative score, correct count and tie-break time.', keyMembers: ['score', 'tieBreakMs'] },
      { name: 'Answer', responsibility: 'One player’s chosen option and how long they took.', keyMembers: ['optionIndex', 'elapsedMs'] },
      { name: 'ScoringStrategy / SpeedBonusScoring', responsibility: 'Maps (question, correct, elapsed) to points; the default pays base + a bonus for remaining time.', keyMembers: ['score'] },
      { name: 'Leaderboard / LeaderboardEntry', responsibility: 'Pure ranking by score, then tie-break time, then name; equal keys share a rank.', keyMembers: ['rank'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption:
    'Centre: QuizGame, the state-machine aggregate, with Leaderboard below it. Left: the swappable ScoringStrategy and the GameState enum. Right: the data it works with - Question, Player and the current round’s Answers. Spacing follows the 340×260 grid so the aggregation and realization edges do not overlap.',
  designExplanation: {
    sections: [
      {
        heading: 'Architecture in one paragraph',
        paragraphs: [
          'QuizGame is a state machine that owns all mutable state for one session. Rules that vary - how many points an answer is worth, how ties are ranked - live in small collaborators. Every phase change goes through a single guarded function that consults a transition table, so illegal sequences such as answering during the reveal, or starting the next question before the leaderboard, are impossible by construction rather than by scattered checks.',
        ],
      },
      {
        heading: 'The transition table',
        paragraphs: [
          'The table maps each phase to the set of phases it may move to: WAITING → {QUESTION_ACTIVE}, QUESTION_ACTIVE → {REVEAL}, REVEAL → {LEADERBOARD}, LEADERBOARD → {QUESTION_ACTIVE, FINISHED}, FINISHED → {}. A private move(target) method throws if the target is not in the current phase’s set. Public methods call it after doing their own work.',
          'The reason to prefer a table over polymorphic State objects here is size: five phases, almost no per-state behaviour - the behaviour is in the guards, not the states. If phases grew rich behaviour (different UI payloads, timers per phase) you would promote them to State classes. Saying that out loud shows you know when the textbook pattern is overkill.',
        ],
      },
      {
        heading: 'submitAnswer: the guard checklist',
        paragraphs: [
          'submitAnswer is where most bugs hide, so give it a checklist. Is the game in QUESTION_ACTIVE? Is this a known player? Has this player already answered this question? Is the option index within range? Is the elapsed time within the limit? Only after all five pass do we store the Answer. If that answer was the last one outstanding, the game closes the question immediately and reveals early.',
          'Each failure maps to a distinct, typed error - illegal state, unknown player, duplicate answer, invalid option, time up - so a transport layer can return a precise message instead of a generic failure.',
        ],
      },
      {
        heading: 'Closing a question: score everyone once',
        paragraphs: [
          'When a question closes - because everyone answered, because tick() sees the limit elapsed, or because the host forces it - we loop over every player exactly once. A player with a correct answer asks the ScoringStrategy for points, and their correct count and tie-break time are updated; everyone else gets 0. The game then moves to REVEAL and returns a QuestionResult with the correct index and the points earned by each player.',
          'Doing this in one pass inside one critical section is what keeps the system consistent: no reader can ever observe half the players scored. Because the loop covers all players, someone who never answered still gets an explicit zero entry rather than being missing from the result.',
        ],
      },
      {
        heading: 'Why Leaderboard is a pure function',
        paragraphs: [
          'Ranking is deterministic: sort by score descending, then by tie-break time ascending, then by name for stable output. Players whose score and tie-break time are both equal share a rank. Because ranking depends only on the players’ current numbers, Leaderboard.rank is a stateless static function - trivially testable and impossible to get out of sync with the scores.',
        ],
      },
      {
        heading: 'What we deliberately did not do',
        paragraphs: [
          'We did not build a timer thread per question, a websocket layer, question banks, persistence or anti-cheat. The engine exposes tick() and state-change results; a host decides how often to call tick() and how to push updates. If the interviewer asks about live updates, the answer is an Observer hook on state changes - not a change to the engine’s core.',
        ],
      },
    ],
    classResponsibilities: [
      { name: 'QuizGame', responsibility: 'Enforces transitions, records answers, closes questions, applies points, exposes the leaderboard. All public methods take one lock.', keyMembers: ['submitAnswer', 'tick', 'closeQuestion', 'nextQuestion'] },
      { name: 'Question', responsibility: 'Validates and holds MCQ data; also the unit loaded from JSON or a database.', keyMembers: ['fromDict'] },
      { name: 'Player', responsibility: 'Holds the cumulative statistics used for ranking.', keyMembers: ['score', 'correctCount', 'tieBreakMs'] },
      { name: 'Answer', responsibility: 'Immutable record of a submission for the current question.', keyMembers: ['optionIndex', 'elapsedMs'] },
      { name: 'SpeedBonusScoring', responsibility: 'base + maxBonus × remaining / limit for correct answers only; integer arithmetic.', keyMembers: ['score'] },
      { name: 'Leaderboard', responsibility: 'Sorts by score, then total correct time, then name; equal keys share a rank.', keyMembers: ['rank'] },
    ],
    patterns: [
      {
        name: 'State (transition table)',
        why: 'The phase decides which operations are legal. Centralizing transitions makes illegal sequences impossible.',
        howApplied: 'A table maps each GameState to its allowed successors; move(target) throws on anything else.',
      },
      {
        name: 'Strategy',
        why: 'Scoring formulas change independently of game flow (streak bonuses, difficulty weights, negative marking).',
        howApplied: 'ScoringStrategy.score(question, correct, elapsed); SpeedBonusScoring is the default and is injected into QuizGame.',
      },
      {
        name: 'Dependency Injection (Clock)',
        why: 'Time-limit logic is impossible to test deterministically with a real clock.',
        howApplied: 'A clock function returning epoch milliseconds is passed to QuizGame; tests and the demo advance it manually.',
      },
      {
        name: 'Immutable value objects',
        why: 'Questions and answers must not change once created; this removes a class of concurrency bugs.',
        howApplied: 'Question, Answer, QuestionResult and LeaderboardEntry are read-only records.',
      },
    ],
    decisions: [
      {
        decision: 'Apply points at reveal, not at submit.',
        rationale: 'All players are scored in a single atomic step, so scores never leak early and the leaderboard is consistent with the reveal.',
        alternativeRejected: 'Scoring on each submit - gives live scores but exposes who answered correctly before the question closes.',
        tradeoff: 'Scores are not live during the question; stream provisional points separately if the UI needs them.',
      },
      {
        decision: 'Auto-close a question when every player has answered.',
        rationale: 'Keeps single-player and small games snappy; tick() handles the case where someone does not answer.',
        tradeoff: 'Reveals early, which leaks that everyone has answered; acceptable for trivia.',
      },
      {
        decision: 'Enforce the limit via tick() and a server-side elapsed check on submit.',
        rationale: 'The engine stays free of threads and timers; the host decides how often to call tick(). Late submissions are still rejected exactly at the limit.',
        alternativeRejected: 'A timer thread per question - harder to test and couples the core to a concurrency model.',
        tradeoff: 'The question closes only when tick() runs, so accuracy of the reveal depends on tick() frequency.',
      },
      {
        decision: 'Integer math in the speed bonus.',
        rationale: 'Deterministic scores across languages and platforms; no floating-point rounding disputes.',
        tradeoff: 'Granularity is limited by integer division - negligible for realistic limits.',
      },
      {
        decision: 'Tie-break on total time spent on correct answers.',
        rationale: 'Rewards speed consistently and gives a deterministic ordering; true ties still share a rank.',
        tradeoff: 'Only score and correct-answer time matter; name is used only to make output stable.',
      },
      {
        decision: 'One coarse lock around every public QuizGame method.',
        rationale: 'A session has ~100 players and short critical sections; one lock is correct and easy to reason about.',
        alternativeRejected: 'Per-player locks or lock-free structures - unnecessary complexity at this scale.',
        tradeoff: 'Submissions from different players serialize briefly; negligible against the 500 ms budget.',
      },
    ],
    solid: {
      paragraphs: [
        'Single Responsibility: QuizGame owns flow, ScoringStrategy owns points, Leaderboard owns ranking, Question owns validity. Each changes for one reason.',
        'Open/Closed: streak multipliers, difficulty weights or negative marking are new ScoringStrategy implementations; QuizGame is not edited. New question types extend Question with a polymorphic isCorrect.',
        'Liskov Substitution: every ScoringStrategy must return a non-negative integer and 0 for an incorrect answer; QuizGame relies on that when summing scores.',
        'Interface Segregation: ScoringStrategy exposes a single method; Clock is a single function. Nothing forces implementers to carry unrelated behaviour.',
        'Dependency Inversion: QuizGame depends on abstractions for scoring and time, so both are replaceable and testable.',
      ],
    },
    extensibility: [
      'New scoring: implement ScoringStrategy for streaks, difficulty weights, partial credit or negative marking. If a strategy needs history (streaks), pass the Player into score().',
      'New question types: make “is this answer correct?” a method on Question so true/false, multi-select and numeric-range questions plug in without touching QuizGame.',
      'Live updates: add an Observer on state changes so a transport layer can broadcast QUESTION_ACTIVE, REVEAL and LEADERBOARD events.',
      'Self-paced play: split QuizGame into a shared GameSession and per-player progress objects - a larger change, but the Question, Scoring and Leaderboard pieces are reused as-is.',
    ],
  },
  implementationIntro: [
    'Every implementation has the same shape: an immutable Question that validates itself, a ScoringStrategy with a SpeedBonusScoring default, a Leaderboard ranking function, and a QuizGame that guards every transition through a table and takes one lock per public method. The clock is injected, so each demo advances time by hand and the output is fully deterministic.',
    'Start with Python to understand the flow, then skim your interview language. The demo runs two players through two questions, including a question that nobody answers and is closed by tick().',
  ],
  implementations: {
    python: py,
    java,
    typescript: ts,
    cpp,
    go: goCode,
    csharp,
  },
  executionFlow: {
    narrative: [
      'Alice and Bob join the lobby. The host calls start(), the game moves WAITING → QUESTION_ACTIVE and records the start time of question 1 (“2 + 2?”, 10-second limit). Two seconds later Alice answers option 1, which is correct; the engine stores Answer(alice, 1, 2000 ms). Six seconds in, Bob also answers option 1; this is the last outstanding answer, so the game closes the question immediately.',
      'Closing loops over both players. Alice is correct at 2 s: 1000 + 500 × 8000 / 10000 = 1400 points. Bob is correct at 6 s: 1000 + 500 × 4000 / 10000 = 1200. Both players’ correct counts and tie-break times are updated and the game moves to REVEAL. showLeaderboard() moves it to LEADERBOARD and returns Alice (1400) ranked above Bob (1200). nextQuestion() opens question 2; this time nobody answers, so after 10 more seconds tick() sees the limit elapsed, closes the question with zero points for everyone, and the game proceeds to the leaderboard and, with no questions left, to FINISHED.',
    ],
    steps: [
      'Load validated Question objects and create QuizGame with a ScoringStrategy and a Clock.',
      'Players join while the state is WAITING; start() requires at least one player and opens question 0 (QUESTION_ACTIVE) recording the start time.',
      'submitAnswer checks: phase, known player, not already answered, valid option, elapsed ≤ time limit; then stores an Answer.',
      'When all players have answered, or tick() sees the time limit elapsed, the question closes.',
      'Closing scores every player once (correct → strategy points, else 0), updates correct count and tie-break time, and moves to REVEAL.',
      'showLeaderboard() moves to LEADERBOARD and returns ranked entries.',
      'nextQuestion() opens the next question (QUESTION_ACTIVE) or moves to FINISHED after the last one.',
    ],
    examples: [
      {
        title: 'Speed bonus - two players',
        input: 'Q (limit 10 s): Alice correct at 2 s, Bob correct at 6 s; base 1000, max bonus 500',
        output: 'Alice +1400, Bob +1200; leaderboard Alice #1, Bob #2',
        explanation: 'Bonus = 500 × remaining / limit using integer division: 500 × 8000 / 10000 = 400 for Alice and 500 × 4000 / 10000 = 200 for Bob.',
      },
      {
        title: 'Timeout',
        input: 'Nobody answers question 2; the clock advances past the 10 s limit and the host calls tick()',
        output: 'Question closes with 0 points for everyone; state becomes REVEAL',
        explanation: 'tick() compares the injected clock to startedAt + limit. At or past the limit it closes the question; the close loop gives every player an explicit 0 because they have no stored answer.',
      },
      {
        title: 'Illegal action',
        input: 'submitAnswer during LEADERBOARD, or a second submitAnswer by the same player',
        output: 'Rejected with an “illegal state” or “already answered” error',
        explanation: 'The phase guard and the duplicate guard run before any state is changed, so the stored answers and scores are untouched.',
      },
      {
        title: 'Tie on the leaderboard',
        input: 'Two players with identical score and identical total correct-answer time',
        output: 'Both receive the same rank (e.g. both #2); the next player is #4',
        explanation: 'The ranking sorts deterministically, then assigns a shared rank when the (score, tie-break time) pair equals the previous entry’s.',
      },
    ],
  },
  followUps: [
    {
      question: 'How would you add streak bonuses or difficulty weighting?',
      answer: 'Write another ScoringStrategy. A streak strategy needs history, so widen the signature to receive the Player (or a small context object with the player’s current streak). Difficulty weighting reads a difficulty field on Question. QuizGame does not change: it only asks the strategy for a number at close time. This is the Open/Closed principle paying off.',
    },
    {
      question: 'How do you enforce the time limit without a timer per question?',
      answer: 'Two cooperating mechanisms. Every submitAnswer compares the server-side elapsed time with the limit and rejects late answers exactly at the boundary. A host-owned timer calls tick() periodically, and tick() closes the question when the limit has elapsed. The engine itself has no threads, which keeps it deterministic and easy to unit test; the host decides how frequently to call tick().',
    },
    {
      question: 'How would you support 10,000 players in one game instead of 100?',
      answer: 'One lock and one in-memory map stop being comfortable. Shard players across several game nodes, aggregate scores asynchronously, and compute the leaderboard from a sorted structure (a heap or Redis sorted set) rather than sorting all players per reveal. Answers can be queued and processed in batches at close time. The model - phases, strategy, ranking rules - is unchanged; the storage and fan-out change.',
    },
    {
      question: 'How would you broadcast live updates to clients?',
      answer: 'Add an Observer hook that fires on state changes and on each answer (without leaking correctness). A transport layer - websockets or server-sent events - subscribes and pushes events like QUESTION_ACTIVE, REVEAL and LEADERBOARD to clients. The engine stays I/O-free; it only emits events.',
    },
    {
      question: 'Why is “everyone answered” allowed to close a question early?',
      answer: 'It keeps small and single-player games fast: waiting out the full limit after everyone has answered is pointless. The cost is a minor information leak (“everyone answered”), which does not matter for trivia. If the product wants to avoid it, make early close a configuration flag and rely solely on tick().',
    },
    {
      question: 'How do you prevent a player from answering twice or answering for someone else?',
      answer: 'The duplicate check is keyed by player id inside the lock, so a second submission is rejected before any state changes. For impersonation, the engine only trusts the player id it is given; authenticating that the request really came from that player belongs to the transport/session layer, which maps a socket or token to a player id.',
    },
    {
      question: 'How would you add other question types such as multi-select?',
      answer: 'Turn “is this correct?” into a method on Question (for example question.isCorrect(answer)) and let Answer carry a set of option indexes. MCQ, true/false, multi-select and numeric ranges become subclasses or strategies; QuizGame and Leaderboard are unchanged. For partial credit, the ScoringStrategy receives a score fraction instead of a boolean.',
    },
    {
      question: 'How would you test this?',
      answer: 'Inject a fake clock and drive the whole game by moving time by hand. Test the transition table exhaustively (every illegal transition throws), the guards of submitAnswer one by one, the scoring formula at the edges (0 ms, exactly the limit, one millisecond past it), ranking ties, early close, and tick-based close. Add a concurrency test with many threads submitting answers at once and assert there is exactly one answer per player.',
    },
  ],
  extras: {
    edgeCases: {
      paragraphs: [
        'Trivia engines are mostly edge cases around time and ordering. Walk through these before the interviewer asks.',
      ],
      bullets: [
        'An answer submitted exactly at the limit versus one millisecond after it: define whether the boundary is inclusive and test it.',
        'A player who joins after the game has started: rejected, because joins are allowed only in WAITING.',
        'start() with zero players: rejected - there is no game without players.',
        'A question that nobody answers: tick() closes it and every player scores zero.',
        'Calling nextQuestion() before showLeaderboard(): rejected by the transition table.',
        'Two players with identical score and tie-break time: share a rank.',
        'A Question with fewer than two options or a bad correct index: fails validation at construction.',
      ],
    },
    commonMistakes: {
      paragraphs: [
        'The most common mistake is not modelling the phases at all and relying on booleans like isActive and hasStarted. These drift out of sync and make illegal states reachable.',
      ],
      bullets: [
        'Putting scoring formulas inside the game loop so every change to the bonus rewrites game flow.',
        'Using floating-point math for the speed bonus and getting different totals in different languages.',
        'Scoring at submit time, which leaks who is right before the question closes.',
        'Starting a thread-based timer inside the core model, making it untestable.',
        'Forgetting to give non-answering players an explicit zero entry in the result.',
        'Building separate single-player and multiplayer classes with duplicated flow.',
      ],
    },
    complexity: [
      'submitAnswer: O(1) with a hash map of answers. Closing a question: O(P) over players. Ranking: O(P log P). tick(): O(1).',
      'Space: O(Q + P) for questions and players, plus O(P) answers for the current question.',
    ],
    testing: {
      paragraphs: [
        'Make time a parameter, then test rules in isolation before testing the whole flow.',
      ],
      numbered: [
        'Transition table: each legal transition succeeds and each illegal one throws.',
        'Scoring at 0 ms, mid-limit, exactly the limit; incorrect answers always score 0.',
        'Guards of submitAnswer: wrong phase, unknown player, duplicate, bad option, late.',
        'Early close when all players answered; tick-based close otherwise.',
        'Leaderboard ordering and shared ranks for true ties.',
        'Concurrent submissions: exactly one stored answer per player.',
      ],
    },
    extensions: [
      'Streak, difficulty and negative-marking scoring strategies.',
      'Multi-select, true/false and numeric-answer question types.',
      'Observer-based live updates for a web transport.',
      'Self-paced mode with per-player progress.',
      'Persisted game history and question banks.',
    ],
    takeaways: [
      'Draw the state machine first; the transition table is the specification.',
      'Give each rule one owner: game flow, scoring, ranking and validity are separate.',
      'Single-player is a multiplayer game with one player - do not fork the design.',
      'Inject the clock and expose tick() instead of owning timer threads.',
      'Apply points in one atomic pass at reveal using integer math.',
    ],
  },
}
