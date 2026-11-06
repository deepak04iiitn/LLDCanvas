import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, enm, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  // Left: façade and recurrence expansion
  cls('bs', 'BookingService', GRID.x(0), GRID.y(0), [
    attr('-', 'rooms', 'Map<String, Room>'),
    attr('-', 'bookingIndex', 'Map<String, Booking>'),
    attr('-', 'lock', 'Lock'),
  ], [
    method('+', 'findAvailableRooms', 'interval, minCapacity', 'List<Room>'),
    method('+', 'book', 'roomId, organizer, title, interval, attendees', 'Booking'),
    method('+', 'bookRecurring', '…, recurrence: Recurrence', 'List<Booking>'),
    method('+', 'cancel', 'bookingId: String', 'boolean'),
    method('+', 'cancelSeries', 'seriesId: String', 'int'),
    method('+', 'daySchedule', 'roomId, day: Date', 'List<Booking>'),
  ], 'facade'),
  cls('rc', 'Recurrence', GRID.x(0), GRID.y(2.6), [
    attr('-', 'frequency', 'Frequency'),
    attr('-', 'every', 'int'),
    attr('-', 'occurrences', 'int'),
  ], [
    method('+', 'expand', 'base: TimeInterval', 'List<TimeInterval>'),
  ]),
  enm('fq', 'Frequency', GRID.x(1), GRID.y(2.7), ['DAILY', 'WEEKLY']),

  // Centre: the room and its sorted bookings
  cls('rm', 'Room', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'String'),
    attr('-', 'name', 'String'),
    attr('-', 'capacity', 'int'),
    attr('-', 'bookings', 'List<Booking> (sorted by start)'),
  ], [
    method('+', 'isFree', 'interval: TimeInterval', 'boolean'),
    method('+', 'add', 'booking: Booking', 'void'),
    method('+', 'remove', 'bookingId: String', 'boolean'),
    method('+', 'overlapping', 'interval: TimeInterval', 'List<Booking>'),
    method('-', 'lowerBound', 'start: Time', 'int'),
  ]),
  cls('bk', 'Booking', GRID.x(1), GRID.y(1.6), [
    attr('-', 'id', 'String'),
    attr('-', 'roomId', 'String'),
    attr('-', 'organizer', 'String'),
    attr('-', 'title', 'String'),
    attr('-', 'interval', 'TimeInterval'),
    attr('-', 'attendees', 'int'),
    attr('-', 'seriesId', 'String?'),
  ], [], 'immutable'),

  // Right: the interval value object
  cls('ti', 'TimeInterval', GRID.x(2), GRID.y(1.6), [
    attr('-', 'start', 'Time'),
    attr('-', 'end', 'Time (exclusive)'),
  ], [
    method('+', 'overlaps', 'other: TimeInterval', 'boolean'),
  ], 'value object'),
]

const edges = [
  edge('e1', 'bs', 'rm', 'composition', 'right@20', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1..*' }),
  edge('e2', 'rm', 'bk', 'aggregation', 'bottom', 'top', { sourceMultiplicity: '1', targetMultiplicity: '0..*', label: 'sorted by start' }),
  edge('e3', 'bk', 'ti', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e4', 'rm', 'ti', 'dependency', 'right@50', 'top', { label: 'checks overlap' }),
  edge('e5', 'bs', 'rc', 'dependency', 'bottom@40', 'top', { label: 'expands' }),
  edge('e6', 'rc', 'fq', 'dependency', 'right', 'left'),
  edge('e7', 'bs', 'bk', 'association', 'bottom@85', 'left', { label: 'indexes by id' }),
]

//@@py

//@@java

//@@ts

//@@cpp

//@@goCode

//@@csharp

export const meetingRoomBookingSolution: ProblemSolution = {
  slug: 'meeting-room-booking',
  title: 'Design a Meeting Room Booking System - Complete LLD Guide',
  overview: {
    introduction: [
      'Meeting room booking is a calendar problem in disguise, and calendar problems all reduce to one question: “does this time interval collide with anything already there?” Everything else - searching for a free room, preventing double bookings, cancelling, recurring meetings, showing a day’s schedule - is built on getting that one question right, cheaply and consistently.',
      'The interviewer is usually checking for four things. Do you model time intervals precisely (are the end times inclusive? can meetings be back-to-back?) and put the overlap rule in exactly one place? Do you pick a data structure that makes the conflict check fast instead of scanning every booking? Do you handle the multi-step operations - recurring series, check-then-insert under concurrency - atomically? And do you keep recurrence from leaking special cases into the conflict checker?',
      'In this tutorial we work through the problem the way you would on a whiteboard: clarify the interval semantics, derive the overlap predicate, notice that keeping each room’s bookings sorted turns conflict detection into a binary search plus two comparisons, model recurrence as “expand into ordinary bookings”, and finally implement a complete medium-level service in six languages with a runnable demo. Along the way we explain why half-open intervals, all-or-nothing series and a service-level lock are the right defaults.',
      'We stay inside the brief: list available rooms for a time range and capacity, book a room, prevent overlapping bookings, cancel, recurring bookings such as “every Monday 10-11”, and a room’s schedule for a day - at hundreds of rooms with conflict checks well under 100 ms. Time-zone rules, calendar integrations, and distributed locking are discussed as extensions rather than built.',
    ],
    constraints: [
      'Each room has a fixed capacity; a booking’s attendee count must not exceed it.',
      'A room can never have two overlapping bookings; back-to-back meetings are allowed.',
      'Users can search for rooms free during a time window with at least a minimum capacity.',
      'Bookings can be cancelled; cancelling frees the slot immediately.',
      'Recurring bookings (daily or weekly) are expanded into individual bookings.',
      'A room’s schedule for a day lists that day’s bookings in time order.',
      'Conflict checks must finish in well under 100 ms with hundreds of rooms in the system.',
    ],
    assumptions: [
      'All times are UTC instants. Time-zone and daylight-saving handling belongs at the API boundary.',
      'Intervals are half-open [start, end): a meeting ending at 10:00 does not conflict with one starting at 10:00.',
      'A recurring series is all-or-nothing: if any single instance conflicts, nothing is booked.',
      'Recurrence is daily or weekly with an interval multiplier and a fixed number of occurrences; rules like “last Friday of the month” are extensions.',
      'Single process with in-memory state; persistence and distributed locking are follow-ups.',
      'A meeting must be shorter than its recurrence step so instances of one series never overlap each other.',
    ],
    clarificationQuestions: [
      {
        question: 'Are end times inclusive or exclusive, and are back-to-back meetings allowed?',
        why: 'This defines the overlap predicate. Half-open intervals make adjacent meetings legal and reduce overlap to one clean comparison.',
      },
      {
        question: 'For a recurring series, should it fail entirely if one instance conflicts, or skip the conflicting dates?',
        why: 'All-or-nothing is simpler and avoids partial series; “skip conflicts” needs a result type that reports what was skipped.',
      },
      {
        question: 'Do we cancel a single instance, the whole series, or “this and following”?',
        why: 'Each option changes what information a Booking must carry (a series id, an index) and what the cancel API looks like.',
      },
      {
        question: 'When several rooms fit, which should search prefer - smallest capacity, closest, fewest changes?',
        why: 'Ranking is a policy. Smallest sufficient capacity preserves big rooms for big groups; it should be easy to swap.',
      },
      {
        question: 'Do rooms have equipment (projector, video) that search should filter on?',
        why: 'If yes, search becomes a predicate over room attributes in addition to capacity; the data model gains features.',
      },
      {
        question: 'Are there limits such as minimum duration, maximum advance booking or business hours?',
        why: 'These are pre-booking validators; knowing them early tells you where validation lives.',
      },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'Everything is an interval',
        paragraphs: [
          'Before drawing classes, strip the problem to its essence: a room is a timeline, and a booking is an interval on that timeline. Booking is allowed iff the new interval does not overlap an existing one on the same timeline. Search is “which timelines have a gap here?” Cancel removes an interval. A day’s schedule is “all intervals that overlap this 24-hour window.” Recurrence is “a list of intervals generated by a rule.”',
          'Say that aloud: it shows you have found the single abstraction that carries the design, and it tells the interviewer that the rest of your answer will be disciplined about reusing it.',
        ],
        callout: {
          title: 'Interview tip',
          body: 'Write the overlap rule on the board before any class: a overlaps b iff a.start < b.end AND b.start < a.end. Then say “half-open intervals - end exclusive - so back-to-back meetings are fine.”',
        },
      },
      {
        heading: 'Choose half-open intervals and derive the overlap rule',
        paragraphs: [
          'With closed intervals [start, end], a 9:00-10:00 meeting and a 10:00-11:00 meeting would “overlap” at exactly 10:00 and you would have to special-case it. With half-open [start, end) the end instant belongs to the next meeting, and two intervals overlap exactly when each starts before the other ends: a.start < b.end && b.start < a.end. No special cases, no off-by-one.',
          'Model this as an immutable TimeInterval value object that validates start < end at construction and owns overlaps(). Every other class - Room, search, daySchedule - asks the interval, so the rule lives in one place and cannot drift.',
        ],
      },
      {
        heading: 'Make conflict detection O(log n): sorted bookings',
        paragraphs: [
          'The naive conflict check scans every existing booking of the room: O(n). Hundreds of rooms with a few thousand bookings each is still fine, but it does not demonstrate understanding. The observation to make is: if a room’s bookings never overlap and are kept sorted by start time, they are automatically sorted by end time too. So for a new interval [s, e), only two existing bookings can possibly collide - the last one that starts before s (its predecessor) and the first one that starts at or after s (its successor).',
          'Binary search finds the insertion point in O(log n). Then the check is two comparisons: does the predecessor’s end exceed s? Does the successor’s start precede e? If neither, the slot is free and the booking is inserted at that index to keep the list sorted. This is the invariant the Room class protects: “bookings are sorted by start and never overlap.”',
        ],
        numbered: [
          'i = lowerBound(newInterval.start) - first booking starting at or after the new start.',
          'If i > 0 and bookings[i−1].end > new.start → conflict (predecessor runs into us).',
          'If i < size and bookings[i].start < new.end → conflict (successor starts before we end).',
          'Otherwise insert at index i.',
        ],
      },
      {
        heading: 'Recurrence is expansion, not special-casing',
        paragraphs: [
          'The tempting design teaches the conflict checker about recurrence rules. Do not. A recurring booking is just N ordinary bookings generated by a rule. Give Recurrence a pure expand(base) method that returns a list of TimeIntervals (daily or weekly, every k steps, N occurrences). The booking service then validates each interval with the same isFree check used for single bookings.',
          'Make the series atomic: first check every instance, and only if all are free, insert them all with a shared seriesId. That avoids half-booked series and the complicated rollback logic that goes with them. The shared seriesId is also what makes cancelSeries a simple filter.',
        ],
      },
      {
        heading: 'Where the lock goes',
        paragraphs: [
          'Conflict check followed by insert is a classic check-then-act race: two requests can both see the slot as free, then both insert. The check and the insert must be one critical section. BookingService takes a single lock around every mutating operation and around reads that must be consistent with them (search, schedule).',
          'This is deliberately coarse. It is correct, easy to explain, and fast enough for hundreds of rooms because each critical section is O(log n) plus an insertion. If the interviewer asks about scale, you describe per-room locks with ordered acquisition for multi-room operations, and eventually a database constraint.',
        ],
      },
      {
        heading: 'Discovering entities and relationships',
        paragraphs: [
          'BookingService is the façade: findAvailableRooms, book, bookRecurring, cancel, cancelSeries, daySchedule. It composes the Rooms (they live in its registry) and keeps an index of bookings by id so cancel is a lookup rather than a scan. Room owns capacity and the sorted list and is the only class that mutates that list. Booking is immutable: id, room id, organizer, title, TimeInterval, attendees, optional series id. TimeInterval is the value object; Recurrence plus a Frequency enum describes a series.',
          'Relationships: BookingService composes Rooms; Room aggregates its Bookings in sorted order (bookings come and go over the room’s life); Booking composes a TimeInterval (it is part of the booking’s value); BookingService depends on Recurrence to expand series, and Room depends on TimeInterval for overlap checks.',
        ],
      },
      {
        heading: 'Search and the day schedule reuse the same primitive',
        paragraphs: [
          'findAvailableRooms filters rooms by capacity ≥ minCapacity and isFree(interval), then orders the survivors by smallest capacity (best fit) and id for a stable order. daySchedule builds the interval [00:00, 24:00) for the requested day and asks the room for its overlapping bookings, which come back in start order because the list is sorted.',
          'Notice that neither feature introduced new overlap logic. If your design needs a second, slightly different overlap rule for the schedule view, something has gone wrong with the abstraction.',
        ],
      },
      {
        heading: 'Step-by-step path to the final diagram',
        paragraphs: [
          'Draw BookingService on the left; Room in the middle with Booking below it; TimeInterval on the right. Recurrence and Frequency go bottom-left because the service uses them only to expand series. Label the multiplicities (1 to 1..* for rooms, 1 to 0..* for bookings) and narrate the booking path while you point at it: capacity check → isFree → insert → index.',
          'Implement in this order: TimeInterval.overlaps, Room.lowerBound/isFree/add/remove, BookingService.book, Recurrence.expand and bookRecurring, cancel and cancelSeries, search, daySchedule. Finish with concurrency and scale discussion.',
        ],
        numbered: [
          'Clarify interval semantics and the recurring-conflict policy.',
          'Write TimeInterval.overlaps and justify half-open ranges.',
          'Implement Room with a sorted list and a binary-search isFree.',
          'Implement BookingService.book with capacity and conflict checks under a lock.',
          'Add recurrence expansion and all-or-nothing series booking.',
          'Add cancel, cancelSeries, search and daySchedule.',
          'Discuss concurrency, scale (interval trees, DB constraints) and time zones.',
        ],
      },
    ],
    entities: [
      { name: 'BookingService', responsibility: 'Façade: search, book, book recurring, cancel, day schedule. Makes multi-step operations atomic and keeps the id index.', keyMembers: ['findAvailableRooms', 'book', 'bookRecurring', 'cancel', 'daySchedule'] },
      { name: 'Room', responsibility: 'Capacity plus a start-sorted bookings list; owns the overlap, insert and remove logic.', keyMembers: ['isFree', 'add', 'remove', 'overlapping'] },
      { name: 'Booking', responsibility: 'Immutable reservation with interval, organizer, attendees and optional series id.', keyMembers: ['interval', 'attendees', 'seriesId'] },
      { name: 'TimeInterval', responsibility: 'Half-open interval value object with validated range and the single overlaps() rule.', keyMembers: ['start', 'end', 'overlaps'] },
      { name: 'Recurrence / Frequency', responsibility: 'Expands a base interval into daily or weekly instances.', keyMembers: ['expand'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption:
    'Left: BookingService (façade) and the Recurrence helper it uses to expand series. Centre: Room, which owns a sorted list of Bookings. Right: TimeInterval, the value object that defines overlap in one place. Spacing follows the 340×260 grid so composition, aggregation and dependency edges stay readable.',
  designExplanation: {
    sections: [
      {
        heading: 'Architecture in one paragraph',
        paragraphs: [
          'Room maintains one invariant - “bookings are sorted by start and never overlap” - and that single invariant makes conflict detection logarithmic and the day schedule a simple range scan. BookingService adds the cross-cutting rules that Room should not know about (capacity, atomic series, an id index for cancel) and a single lock that makes check-then-insert safe. TimeInterval defines what “overlap” means, exactly once.',
        ],
      },
      {
        heading: 'Why the neighbours are enough',
        paragraphs: [
          'Suppose the room contains [9,10), [11,12), [14,15). A new request for [10,11) has lowerBound index 1 (the first booking starting at or after 10 is [11,12)). The predecessor [9,10) ends at 10, which is not greater than the new start 10, so no conflict. The successor [11,12) starts at 11, which is not before the new end 11, so no conflict. The booking fits exactly between them - the half-open rule at work.',
          'A request for [9:30, 11:30) has lowerBound index 1 too. The predecessor [9,10) ends at 10 > 9:30 - conflict. Notice we never looked at [14,15). Because no two stored bookings overlap, anything further away is already out of reach of the new interval.',
        ],
      },
      {
        heading: 'Binary search with lowerBound',
        paragraphs: [
          'lowerBound(start) is a classic binary search returning the first index whose booking starts at or after start (or the list length). It serves three purposes: the free check, the insertion point, and the starting point for the overlapping() scan used by the day schedule. Writing it once and reusing it is cleaner than three slightly different loops.',
          'Insert and remove on an array-backed list are O(n) because of shifting, but they are cheap memory moves and happen only on actual bookings. If the interviewer pushes on it, mention a balanced tree or skip list for O(log n) mutations - the conflict check logic stays the same.',
        ],
      },
      {
        heading: 'Atomic series booking',
        paragraphs: [
          'bookRecurring expands the rule into N intervals, then in one critical section checks capacity once and isFree for every interval before creating any bookings. If any instance conflicts, it throws with the offending date and nothing has been stored. Only when all are free does it create Booking objects (sharing a new seriesId) and insert them.',
          'Because Recurrence.expand rejects meetings longer than the recurrence step, instances of the same series cannot overlap each other, so it is enough to validate each instance against the room’s existing bookings.',
        ],
      },
      {
        heading: 'Cancellation and the id index',
        paragraphs: [
          'BookingService keeps a map from booking id to Booking. cancel(id) pops the booking from the index, then asks its room to remove it by id. cancelSeries(seriesId) collects every indexed booking with that series id and removes them all in one critical section. The index is the reason cancel does not have to search every room’s list.',
        ],
      },
      {
        heading: 'What we deliberately did not do',
        paragraphs: [
          'We did not model time zones, calendar invitations, room equipment, approvals, or distributed locking. Each has a place: time zones at the API boundary, equipment as a predicate in search, approvals as a booking status, and distributed correctness as a database exclusion constraint on (room, time range). The interval abstraction survives all of them.',
        ],
      },
    ],
    classResponsibilities: [
      { name: 'BookingService', responsibility: 'Validates, serializes mutations, indexes bookings, exposes the public API.', keyMembers: ['book', 'bookRecurring', 'cancel', 'findAvailableRooms'] },
      { name: 'Room', responsibility: 'Sorted bookings list with isFree/add/remove/overlapping.', keyMembers: ['isFree', 'add', 'overlapping'] },
      { name: 'TimeInterval', responsibility: 'Defines what “overlap” means in exactly one place and validates start < end.', keyMembers: ['overlaps'] },
      { name: 'Booking', responsibility: 'Immutable record linking room, interval, organizer and optional series.', keyMembers: ['interval', 'seriesId'] },
      { name: 'Recurrence', responsibility: 'Pure expansion of a base interval into N daily/weekly instances; validates its parameters.', keyMembers: ['expand'] },
    ],
    patterns: [
      {
        name: 'Value Object',
        why: 'An interval has no identity and must never change after creation; equality is by value.',
        howApplied: 'TimeInterval is immutable, validates itself on construction and exposes overlaps().',
      },
      {
        name: 'Façade',
        why: 'Callers should not coordinate rooms, indexes and locks themselves.',
        howApplied: 'BookingService is the single entry point for search, booking, cancel and schedule.',
      },
      {
        name: 'Encapsulated invariant (sorted, non-overlapping list)',
        why: 'Fast conflict detection depends on the list always being sorted and conflict-free.',
        howApplied: 'Only Room mutates its list, and add() re-checks isFree before inserting.',
      },
      {
        name: 'Strategy (optional)',
        why: 'Room ranking and recurrence rules are policies that change independently.',
        howApplied: 'Extract a RoomRankingStrategy and a RecurrenceRule interface when more than one variant is needed.',
      },
    ],
    decisions: [
      {
        decision: 'Half-open intervals [start, end).',
        rationale: 'Back-to-back meetings are natural and overlap is one clean predicate: a.start < b.end && b.start < a.end.',
        alternativeRejected: 'Closed intervals with special handling of equal boundaries.',
        tradeoff: 'Inclusive-end APIs need conversion at the boundary.',
      },
      {
        decision: 'Sorted list + binary search per room, checking only neighbours.',
        rationale: 'Non-overlapping bookings sorted by start are also sorted by end, so only the predecessor and successor can conflict: O(log n) check.',
        alternativeRejected: 'Linear scan of all bookings (simple but O(n)) or an interval tree (more code than the problem needs).',
        tradeoff: 'Insert and remove are O(n) due to array shifting; fine per room, otherwise use a balanced tree.',
      },
      {
        decision: 'Expand recurrence into ordinary bookings.',
        rationale: 'Keeps the conflict checker unaware of recurrence; the same isFree check validates every instance.',
        alternativeRejected: 'Storing rules and computing conflicts symbolically - complex and error-prone.',
        tradeoff: 'Storage grows with the number of occurrences, so cap occurrences (we allow up to 366).',
      },
      {
        decision: 'Series are validated first, then inserted (all-or-nothing).',
        rationale: 'Avoids partially booked series and any rollback logic.',
        tradeoff: 'One conflicting date blocks the whole series; offer a “skip conflicts” mode if the product needs it.',
      },
      {
        decision: 'One service-wide lock.',
        rationale: 'Correctness with minimal code: check-then-insert is atomic and series are consistent.',
        alternativeRejected: 'Per-room locks from day one - better throughput, but ordered acquisition for multi-room operations adds complexity.',
        tradeoff: 'Serializes bookings across rooms; at scale move to per-room locks or database constraints.',
      },
      {
        decision: 'Search ranks by smallest sufficient capacity.',
        rationale: 'Best-fit preserves large rooms for large groups.',
        tradeoff: 'May not match user preference; make it a pluggable strategy.',
      },
    ],
    solid: {
      paragraphs: [
        'Single Responsibility: interval math lives in TimeInterval, per-room ordering in Room, cross-room orchestration in BookingService, series generation in Recurrence.',
        'Open/Closed: new recurrence rules or room-ranking policies plug in without changing Room or the overlap logic. Business-hours checks are new validators, not edits to isFree.',
        'Liskov Substitution: any recurrence rule must return ordered, non-overlapping intervals; Room assumes that when it validates a series.',
        'Interface Segregation: callers use a small façade, never Room’s sorted list or lowerBound.',
        'Dependency Inversion: ranking and recurrence can be injected as abstractions, keeping BookingService independent of concrete policies.',
      ],
    },
    extensibility: [
      'Amenities: add a feature set to Room and a RoomFilter predicate to search; the booking path is unchanged.',
      'Business rules: minimum/maximum duration, business hours and advance-booking limits are pre-booking validators.',
      'More recurrence: monthly or “nth weekday” rules implement a RecurrenceRule interface returning intervals.',
      'Scale: replace the sorted list with an interval tree for fast “all free rooms in this window” across thousands of rooms.',
      'Multi-node: enforce non-overlap in the database with an exclusion constraint on (room_id, time range), or a unique slot table.',
    ],
  },
  implementationIntro: [
    'Each implementation has the same skeleton: TimeInterval (validated, half-open), Room with a sorted bookings list and a binary-search conflict check, Booking as an immutable record, Recurrence that expands into intervals, and a BookingService that holds one lock and makes series booking all-or-nothing.',
    'Every demo books a stand-up, shows that the available-rooms search skips the busy room, rejects an overlapping booking while allowing back-to-back, creates a weekly series, prints a day schedule and cancels the series.',
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
      'The service starts with two rooms: Focus (capacity 4) and Board (capacity 12). Ann books Focus from 9:00 to 10:00 for 3 attendees. book() checks 3 ≤ 4, then Room.isFree: the list is empty so the lower bound is 0 and there are no neighbours - the slot is free. The booking is inserted at index 0 and added to the id index.',
      'Searching for a room free 9:00-10:00 with capacity 3 skips Focus (busy) and returns Board. Bob then tries Focus from 9:00 to 11:00; the lower bound is again 0, the successor starts at 9:00 which is before 11:00, so a BookingConflictError is raised and nothing changes. A 10:00-11:00 request would succeed because the predecessor ends at exactly 10:00. Finally Cat books a weekly series in Board: expand() yields three intervals, each is checked, and all three are inserted with one series id. A day schedule for Focus returns Ann’s stand-up; cancelSeries removes all three of Cat’s meetings at once.',
    ],
    steps: [
      'book() validates 1 ≤ attendees ≤ room capacity, then asks Room.isFree(interval).',
      'isFree binary-searches the first booking starting at or after the new start, and checks the predecessor’s end and the successor’s start.',
      'If free, the booking is inserted at that index (keeping the list sorted) and added to the id index.',
      'bookRecurring() expands the rule into N intervals, checks every one with isFree, and only then inserts all of them with a shared seriesId.',
      'findAvailableRooms filters by capacity and isFree, then orders by smallest capacity (ties by id).',
      'cancel(id) removes the booking from its room and the index; cancelSeries removes every booking with that series id.',
      'daySchedule builds [00:00, 24:00) for the date and returns the room’s overlapping bookings in start order.',
    ],
    examples: [
      {
        title: 'Overlap rejected, adjacent allowed',
        input: 'Existing 9:00-10:00. Request A: 9:00-11:00. Request B: 10:00-11:00.',
        output: 'A → BookingConflictError. B → booked.',
        explanation: 'A’s successor (9:00) starts before A ends (11:00), so overlap. For B, the predecessor ends at 10:00, which is not after B’s start, so with half-open intervals they merely touch.',
      },
      {
        title: 'Weekly series',
        input: 'bookRecurring(room, 14:00-15:00 on Jan 6, WEEKLY × 3)',
        output: 'Bookings on Jan 6, Jan 13 and Jan 20 sharing one seriesId',
        explanation: 'Recurrence.expand adds 7 days per occurrence. All three are validated before any are inserted; one conflict would have rejected the whole series.',
      },
      {
        title: 'Search by time and capacity',
        input: 'findAvailableRooms(9:00-10:00, minCapacity=3) with Focus (4, busy) and Board (12, free)',
        output: '[Board]',
        explanation: 'Both rooms satisfy capacity, but Focus fails isFree. Among free rooms the result is ordered by smallest capacity, so a larger room is suggested only when necessary.',
      },
      {
        title: 'Capacity exceeded',
        input: 'book(Focus, attendees=6) where Focus holds 4',
        output: 'CapacityExceededError; nothing booked',
        explanation: 'Capacity is validated first, before the conflict check, so no state is changed.',
      },
    ],
  },
  followUps: [
    {
      question: 'Why check only the predecessor and successor instead of every booking?',
      answer: 'Because stored bookings never overlap and are sorted by start, they are also sorted by end. Any booking before the predecessor ends even earlier than the predecessor, and any booking after the successor starts even later than the successor, so neither can reach the new interval if the two neighbours do not. That turns an O(n) scan into an O(log n) binary search plus two comparisons.',
    },
    {
      question: 'How would you handle “cancel just this occurrence” or “this and all following”?',
      answer: 'Booking already carries a series id. For one occurrence, cancel(bookingId) works because each occurrence is an ordinary booking. For “this and following”, store an occurrence index (or use the start time) on each booking and cancel every booking in the series whose start is at or after the selected one. Because recurrence was expanded eagerly, no rule rewriting is needed.',
    },
    {
      question: 'What if recurring bookings are open-ended (“every Monday forever”)?',
      answer: 'You cannot expand infinitely. Either cap the horizon (for example 52 weeks) and extend it with a background job, or store the rule and materialize bookings lazily within a rolling window. The conflict checker still only sees ordinary bookings; the generator just runs ahead of time.',
    },
    {
      question: 'How do you scale conflict detection to thousands of rooms and millions of bookings?',
      answer: 'Per-room checks stay O(log n). For “which rooms are free in this window” across many rooms, build an interval tree or a per-room index, or precompute free-slot bitmaps for fixed granularity (for example 15-minute slots per day). For correctness across nodes, enforce non-overlap in the database with an exclusion constraint on (room_id, tsrange).',
    },
    {
      question: 'How would you make the locking finer-grained?',
      answer: 'Use one lock per room. A single-room booking takes that room’s lock only. Operations that touch multiple rooms (a multi-room reservation) acquire locks in a fixed order (by room id) to avoid deadlock. The id index becomes a concurrent map. Reads such as search can take each room’s lock briefly in turn.',
    },
    {
      question: 'How do time zones and daylight-saving changes affect the design?',
      answer: 'The core stores UTC instants and never does calendar arithmetic. Recurrence expansion is the exception: “every Monday 10:00” is a local-time rule, so it must be expanded in the organizer’s zone and each instance converted to UTC. That is why Recurrence is an isolated, pure component - you can make it zone-aware without touching Room.',
    },
    {
      question: 'How would you pick the “best” room for a request?',
      answer: 'Make ranking a strategy. The default is smallest sufficient capacity, ties broken by id. Other strategies might prefer the organizer’s floor, minimise walking distance, or keep rarely used rooms available. Search computes the free set once, then hands it to the strategy to order.',
    },
    {
      question: 'How would you test this?',
      answer: 'Table-driven tests for overlap: identical, nested, partial before/after, and touching intervals. Room tests for first, middle and last insertion positions and for removal. Service tests for capacity, conflict, all-or-nothing series (a conflict on the last instance leaves no bookings), cancel and cancelSeries, and search ordering. A concurrency test with many threads racing for the same slot asserts exactly one winner.',
    },
  ],
  extras: {
    edgeCases: {
      paragraphs: [
        'Most calendar bugs come from boundaries and from assuming operations are single-step. These are the cases to check.',
      ],
      bullets: [
        'Back-to-back meetings (end == next start) must be allowed.',
        'A new meeting that fully contains or is fully contained by an existing one is a conflict.',
        'start ≥ end is rejected at TimeInterval construction.',
        'Attendees of 0 or more than the capacity are rejected before conflict checks.',
        'A series where only the last instance conflicts must book nothing.',
        'Cancelling an unknown or already cancelled booking returns false rather than throwing.',
        'A meeting longer than the recurrence step would overlap itself; reject it.',
        'A day schedule must include bookings that start the previous night and run past midnight.',
      ],
    },
    commonMistakes: {
      paragraphs: [
        'Beginners usually stumble on boundaries and on atomicity, not on the data structure.',
      ],
      bullets: [
        'Using inclusive end times and then writing special cases for adjacent meetings.',
        'Scanning every booking for each conflict check when a sorted list makes it O(log n).',
        'Teaching the conflict checker about recurrence instead of expanding into bookings.',
        'Checking for conflicts and inserting without one lock around both steps.',
        'Booking a series one instance at a time and leaving a partial series after a failure.',
        'Duplicating the overlap predicate in several places so they drift apart.',
      ],
    },
    complexity: [
      'isFree / book: O(log n) search plus O(n) insertion shift per room. cancel: O(n) removal within the room, O(1) index lookup.',
      'findAvailableRooms: O(R log n) plus sorting O(R log R). daySchedule: O(log n + k) for k results. bookRecurring: O(m log n) for m occurrences.',
      'Space: O(B) bookings plus O(B) index entries.',
    ],
    testing: {
      paragraphs: [
        'Test the interval primitive exhaustively because everything depends on it.',
      ],
      numbered: [
        'overlaps: identical, contained, containing, partial left/right, touching, disjoint.',
        'Room insertion at the start, middle, end; remove restores free status.',
        'Capacity exceeded and conflict errors leave state untouched.',
        'Recurring all-or-nothing: conflict on the first, middle and last instance.',
        'findAvailableRooms ordering and capacity filter.',
        'Concurrent bookings for the same slot: exactly one succeeds.',
      ],
    },
    extensions: [
      'Room amenities and a filter predicate in search.',
      'Business hours, minimum/maximum durations, advance-booking limits.',
      'Monthly and “nth weekday” recurrence; time-zone-aware expansion.',
      'Approval workflows and booking statuses.',
      'Interval tree or free-slot bitmaps; database exclusion constraints for multi-node setups.',
    ],
    takeaways: [
      'Model time as half-open intervals and define overlap once.',
      'Sorted, non-overlapping bookings make the conflict check a binary search plus two neighbour comparisons.',
      'Expand recurrence into ordinary bookings; validate all, then insert all.',
      'Make check-then-insert atomic with a lock; refine to per-room locks or DB constraints at scale.',
      'Keep the invariant inside Room so no other code can break it.',
    ],
  },
}
