import { pack, node, edge, pos, type DebuggerPackSeed, type DebuggerCategory } from '../seed-studio-debugger-lib'

function issue(
  slug: string,
  n: number,
  elementIds: string[],
  category: DebuggerCategory,
  explanationKeywords: string[],
  modelAnswer: string,
  hints: [string, string],
  aliases?: string[],
) {
  return {
    id: `iss-${slug}-${n}`,
    elementIds,
    category,
    ...(aliases ? { aliases } : {}),
    explanationKeywords,
    modelAnswer,
    hints,
  }
}

function briefing(names: string[], start: string, methods: string) {
  return (
    `This challenge is a broken UML sketch around: ${names.join(', ')}.\n\n` +
    `Your job is to investigate - click classes and relationships, notice what feels overloaded, oddly connected, or hard to extend - then mark issues with a category and a short "why."\n\n` +
    `Start by opening ${start} and reading its methods (${methods}).\n\n` +
    `Do not assume the answer from the title alone; use the diagram.`
  )
}

function requirement(count: number, goal: string) {
  return `There are exactly ${count} design problems to find. Inspect the diagram, mark each with a category and a short "why," then repair so ${goal}.`
}

export const MEDIUM_C: DebuggerPackSeed[] = [
  // 156 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-calendar-event-extends-cal',
    title: 'Calendar Event Hierarchy',
    difficulty: 'medium',
    order: 156,
    description: 'Find why modelling an Event as a kind of Calendar breaks the domain model.',
    tags: ['calendar', 'inheritance', 'encapsulation'],
    nodes: [
      node('n1', 'el-calendar', 'Calendar', pos(0, 0),
        ['addEvent', 'removeEvent', 'listEvents'],
        [{ name: 'events', type: 'List<Event>', visibility: 'public' }]),
      node('n2', 'el-event', 'Event', pos(0, 1),
        ['reschedule', 'getTitle', 'addAttendee'],
        [{ name: 'title', type: 'String' }, { name: 'start', type: 'DateTime' }]),
      node('n3', 'el-attendee', 'Attendee', pos(1, 1), ['accept', 'decline']),
      node('n4', 'el-reminder', 'Reminder', pos(2, 1), ['schedule', 'cancel']),
      node('n5', 'el-notifier', 'NotificationService', pos(2, 0), ['push']),
      node('n6', 'el-recurrence', 'RecurrenceRule', pos(1, 2), ['nextOccurrence']),
    ],
    edges: [
      edge('e1', 'ed-event-calendar', 'n2', 'n1', 'inheritance'),
      edge('e2', 'ed-event-attendee', 'n2', 'n3', 'association'),
      edge('e3', 'ed-event-reminder', 'n2', 'n4', 'composition'),
      edge('e4', 'ed-reminder-notifier', 'n4', 'n5', 'dependency'),
      edge('e5', 'ed-event-recurrence', 'n2', 'n6', 'aggregation'),
    ],
    briefing: briefing(
      ['Calendar', 'Event', 'Attendee', 'Reminder', 'NotificationService', 'RecurrenceRule'],
      'Event',
      'reschedule, getTitle, addAttendee',
    ),
    requirement: requirement(2, 'Event and Calendar relate through the right kind of relationship and Calendar owns its data safely'),
    expectedIssues: [
      issue(
        'dbg-calendar-event-extends-cal', 1,
        ['ed-event-calendar', 'el-event'],
        'Incorrect Inheritance',
        ['is-a', 'extends', 'inherit', 'composition', 'has-a', 'Liskov'],
        'Event extends Calendar, but an event is not a calendar. It wrongly inherits addEvent/removeEvent/listEvents. Replace inheritance with an association: a Calendar contains Events.',
        [
          'Read the sentence "Event is a Calendar" out loud. Does it make sense?',
          'Which methods does Event inherit that make no sense for a single meeting?',
        ],
        ['wrong inheritance', 'misuse of inheritance'],
      ),
      issue(
        'dbg-calendar-event-extends-cal', 2,
        ['el-calendar'],
        'Poor Encapsulation',
        ['public', 'events', 'list', 'expose', 'mutable', 'encapsulation'],
        'Calendar exposes its events list as a public attribute, so any subclass or caller can mutate it directly. Make it private and expose only controlled operations.',
        [
          'Look at the visibility of the attributes in Calendar.',
          'Who can currently change the list of events without going through addEvent?',
        ],
      ),
    ],
    verification: { requireNoEditTo: ['NotificationService'] },
  }),

  // 157 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-news-feed-rank-inline',
    title: 'Feed Ranking Modes',
    difficulty: 'medium',
    order: 157,
    description: 'Find why adding a new ranking mode keeps forcing edits to the same Feed class.',
    tags: ['feed', 'strategy', 'SRP', 'OCP'],
    nodes: [
      node('n1', 'el-feed', 'Feed', pos(0, 0),
        ['loadPosts', 'rankChronological', 'rankEngagement', 'rankML', 'render']),
      node('n2', 'el-post', 'Post', pos(1, 0), ['getTimestamp', 'getLikes']),
      node('n3', 'el-user', 'User', pos(0, 1), ['getFollowing']),
      node('n4', 'el-feed-repo', 'FeedRepository', pos(1, 1), ['fetchPosts']),
      node('n5', 'el-ml-model', 'MLRankModel', pos(2, 0), ['score']),
      node('n6', 'el-feed-view', 'FeedView', pos(2, 1), ['draw']),
    ],
    edges: [
      edge('e1', 'ed-feed-post', 'n1', 'n2', 'aggregation'),
      edge('e2', 'ed-feed-user', 'n1', 'n3', 'association'),
      edge('e3', 'ed-feed-repo', 'n1', 'n4', 'dependency'),
      edge('e4', 'ed-feed-ml', 'n1', 'n5', 'dependency'),
      edge('e5', 'ed-feed-view', 'n1', 'n6', 'dependency'),
    ],
    briefing: briefing(
      ['Feed', 'Post', 'User', 'FeedRepository', 'MLRankModel', 'FeedView'],
      'Feed',
      'loadPosts, rankChronological, rankEngagement, rankML, render',
    ),
    requirement: requirement(3, 'new ranking modes can be added without editing Feed'),
    expectedIssues: [
      issue(
        'dbg-news-feed-rank-inline', 1,
        ['el-feed'],
        'SRP Violation',
        ['loading', 'ranking', 'render', 'multiple responsibilities', 'split'],
        'Feed loads posts, ranks them in three different ways, and renders them. Separate fetching, ranking, and presentation.',
        [
          'List every verb in Feed. How many different reasons would make you change it?',
          'Which methods have nothing to do with holding a feed?',
        ],
      ),
      issue(
        'dbg-news-feed-rank-inline', 2,
        ['el-feed'],
        'OCP Violation',
        ['strategy', 'ranking', 'new mode', 'modify', 'interface', 'polymorphism'],
        'Each ranking mode is hardcoded inside Feed (rankChronological/rankEngagement/rankML). Adding a new mode means editing Feed. Introduce a RankingStrategy interface with one implementation per mode.',
        [
          'What do you have to touch to add a "trending" ranking mode?',
          'Which design pattern lets you swap an algorithm behind an interface?',
        ],
        ['missing strategy', 'Strategy pattern'],
      ),
      issue(
        'dbg-news-feed-rank-inline', 3,
        ['ed-feed-ml'],
        'Tight Coupling',
        ['concrete', 'MLRankModel', 'direct', 'coupled', 'interface', 'swap'],
        'Feed depends directly on the concrete MLRankModel, so ranking logic cannot be swapped or tested without it. Hide it behind a ranking abstraction.',
        [
          'Follow the arrow from Feed to MLRankModel. Is it an abstraction or a concrete class?',
          'Could you unit test Feed without a trained model?',
        ],
      ),
    ],
    verification: { mustIntroduceElementNames: ['RankingStrategy'] },
  }),

  // 158 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-shipment-tracker-carriers',
    title: 'Shipment Carrier Binding',
    difficulty: 'medium',
    order: 158,
    description: 'Find why the tracker is welded to specific carrier clients.',
    tags: ['shipping', 'DIP', 'coupling'],
    nodes: [
      node('n1', 'el-tracker', 'ShipmentTracker', pos(1, 0),
        ['trackFedEx', 'trackDHL', 'trackUPS', 'getStatus']),
      node('n2', 'el-fedex', 'FedExClient', pos(0, 1), ['fetchTracking']),
      node('n3', 'el-dhl', 'DHLClient', pos(1, 1), ['fetchTracking']),
      node('n4', 'el-ups', 'UPSClient', pos(2, 1), ['fetchTracking']),
      node('n5', 'el-shipment', 'Shipment', pos(0, 0), ['getId', 'getCarrier']),
      node('n6', 'el-tracking-event', 'TrackingEvent', pos(2, 0), ['getLocation', 'getTime']),
    ],
    edges: [
      edge('e1', 'ed-tracker-fedex', 'n1', 'n2', 'dependency'),
      edge('e2', 'ed-tracker-dhl', 'n1', 'n3', 'dependency'),
      edge('e3', 'ed-tracker-ups', 'n1', 'n4', 'dependency'),
      edge('e4', 'ed-tracker-shipment', 'n1', 'n5', 'association'),
      edge('e5', 'ed-tracker-event', 'n1', 'n6', 'dependency'),
    ],
    briefing: briefing(
      ['ShipmentTracker', 'FedExClient', 'DHLClient', 'UPSClient', 'Shipment', 'TrackingEvent'],
      'ShipmentTracker',
      'trackFedEx, trackDHL, trackUPS, getStatus',
    ),
    requirement: requirement(2, 'a new carrier can be supported without changing ShipmentTracker'),
    expectedIssues: [
      issue(
        'dbg-shipment-tracker-carriers', 1,
        ['ed-tracker-fedex', 'ed-tracker-dhl', 'ed-tracker-ups'],
        'DIP Violation',
        ['abstraction', 'interface', 'concrete', 'carrier', 'high-level', 'depend'],
        'ShipmentTracker (high-level policy) depends directly on FedExClient, DHLClient and UPSClient. Introduce a CarrierClient interface that the tracker depends on and the clients implement.',
        [
          'Check what ShipmentTracker points to: abstractions or concrete classes?',
          'What would a CarrierClient interface look like?',
        ],
      ),
      issue(
        'dbg-shipment-tracker-carriers', 2,
        ['el-tracker'],
        'Tight Coupling',
        ['new', 'instantiate', 'construct', 'inject', 'carrier', 'hardcoded'],
        'ShipmentTracker constructs each carrier client itself and has a separate method per carrier, so it is welded to them. Inject carrier clients through the abstraction and select one at runtime.',
        [
          'Who creates the carrier clients and where?',
          'How many methods must be edited when UPS changes its API?',
        ],
      ),
    ],
    verification: { mustIntroduceElementNames: ['CarrierClient'] },
  }),

  // 159 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-smart-home-no-device',
    title: 'Smart Hub Device Calls',
    difficulty: 'medium',
    order: 159,
    description: 'Find why every new gadget forces changes inside the smart home hub.',
    tags: ['smart-home', 'DIP', 'OCP'],
    nodes: [
      node('n1', 'el-hub', 'SmartHub', pos(1, 0),
        ['turnOnLight', 'setThermostat', 'lockDoor', 'runScene']),
      node('n2', 'el-thermostat', 'Thermostat', pos(0, 1), ['setTemperature']),
      node('n3', 'el-light', 'Light', pos(1, 1), ['switchOn', 'dim']),
      node('n4', 'el-lock', 'DoorLock', pos(2, 1), ['lock', 'unlock']),
      node('n5', 'el-scene', 'Scene', pos(0, 0), ['getName', 'getActions']),
      node('n6', 'el-hub-app', 'HubApp', pos(2, 0), ['onTap']),
    ],
    edges: [
      edge('e1', 'ed-hub-thermostat', 'n1', 'n2', 'dependency'),
      edge('e2', 'ed-hub-light', 'n1', 'n3', 'dependency'),
      edge('e3', 'ed-hub-lock', 'n1', 'n4', 'dependency'),
      edge('e4', 'ed-hub-scene', 'n1', 'n5', 'association'),
      edge('e5', 'ed-app-hub', 'n6', 'n1', 'dependency'),
    ],
    briefing: briefing(
      ['SmartHub', 'Thermostat', 'Light', 'DoorLock', 'Scene', 'HubApp'],
      'SmartHub',
      'turnOnLight, setThermostat, lockDoor, runScene',
    ),
    requirement: requirement(2, 'new device types can join the hub without editing SmartHub'),
    expectedIssues: [
      issue(
        'dbg-smart-home-no-device', 1,
        ['ed-hub-thermostat', 'ed-hub-light', 'ed-hub-lock'],
        'DIP Violation',
        ['device', 'interface', 'abstraction', 'concrete', 'depend'],
        'SmartHub calls Thermostat, Light and DoorLock directly. It should depend on a Device abstraction implemented by each device.',
        [
          'What type does SmartHub use to talk to each gadget?',
          'Is there any shared Device interface in the diagram?',
        ],
        ['missing device interface'],
      ),
      issue(
        'dbg-smart-home-no-device', 2,
        ['el-hub'],
        'OCP Violation',
        ['new device', 'modify', 'extend', 'method per device', 'polymorphism'],
        'SmartHub has one hardcoded method per device kind. Adding a sprinkler or camera means editing the hub. Loop over Device implementations polymorphically so the hub is closed for modification.',
        [
          'What code would you add to SmartHub for a new smart camera?',
          'Which principle says classes should be open for extension but closed for modification?',
        ],
      ),
    ],
    verification: { mustIntroduceElementNames: ['Device'] },
  }),

  // 160 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-document-editor-no-command',
    title: 'Editor Undo Stack',
    difficulty: 'medium',
    order: 160,
    description: 'Find why undo in the editor is brittle and a pattern is only half-applied.',
    tags: ['editor', 'command', 'undo', 'pattern'],
    nodes: [
      node('n1', 'el-editor', 'DocumentEditor', pos(1, 0),
        ['insertText', 'deleteText', 'applyBold', 'undo', 'redo']),
      node('n2', 'el-document', 'Document', pos(0, 0), ['getText', 'setText']),
      node('n3', 'el-undo-stack', 'UndoStack', pos(1, 1), ['push', 'pop', 'isEmpty']),
      node('n4', 'el-action-record', 'ActionRecord', pos(2, 1), [],
        [{ name: 'type', type: 'String' }, { name: 'payload', type: 'String' }, { name: 'position', type: 'int' }]),
      node('n5', 'el-clipboard', 'Clipboard', pos(0, 1), ['copy', 'paste']),
      node('n6', 'el-selection', 'Selection', pos(2, 0), ['getRange']),
    ],
    edges: [
      edge('e1', 'ed-editor-doc', 'n1', 'n2', 'association'),
      edge('e2', 'ed-editor-stack', 'n1', 'n3', 'composition'),
      edge('e3', 'ed-stack-record', 'n3', 'n4', 'aggregation'),
      edge('e4', 'ed-editor-clip', 'n1', 'n5', 'dependency'),
      edge('e5', 'ed-editor-selection', 'n1', 'n6', 'dependency'),
    ],
    briefing: briefing(
      ['DocumentEditor', 'Document', 'UndoStack', 'ActionRecord', 'Clipboard', 'Selection'],
      'DocumentEditor',
      'insertText, deleteText, applyBold, undo, redo',
    ),
    requirement: requirement(2, 'each editing action knows how to execute and undo itself, so new actions need no editor changes'),
    expectedIssues: [
      issue(
        'dbg-document-editor-no-command', 1,
        ['el-editor'],
        'OCP Violation',
        ['command', 'switch', 'undo', 'reverse', 'execute', 'new action'],
        'DocumentEditor mutates the document directly and implements undo with a switch that reverses each action type. Each new action means editing the switch. Introduce a Command interface with execute() and undo().',
        [
          'How does undo() decide how to reverse an action?',
          'Which pattern encapsulates a request as an object with execute and undo?',
        ],
        ['missing command pattern'],
      ),
      issue(
        'dbg-document-editor-no-command', 2,
        ['el-action-record', 'ed-stack-record'],
        'Pattern Misuse',
        ['anemic', 'data only', 'no behavior', 'record', 'type string', 'command'],
        'ActionRecord looks like a command but is just a data bag with a string type and payload. It has no execute/undo behaviour, so the editor must interpret it. A real Command object carries its own behaviour.',
        [
          'Does ActionRecord have any methods? Who knows how to undo it?',
          'Is this a real Command or just a labelled data holder?',
        ],
        ['fake command', 'anemic command'],
      ),
    ],
    verification: { mustIntroduceElementNames: ['Command'] },
  }),

  // 161 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-social-post-owns-comments',
    title: 'Post Comment Management',
    difficulty: 'medium',
    order: 161,
    description: 'Find why Post has become the place for everything about comments.',
    tags: ['social', 'SRP', 'comments'],
    nodes: [
      node('n1', 'el-post', 'Post', pos(1, 0),
        ['like', 'share', 'addComment', 'deleteComment', 'moderateComment'],
        [{ name: 'comments', type: 'List<Comment>' }, { name: 'body', type: 'String' }]),
      node('n2', 'el-comment', 'Comment', pos(2, 0), ['getText', 'getAuthor']),
      node('n3', 'el-user', 'User', pos(0, 0), ['getName', 'isModerator']),
      node('n4', 'el-profanity', 'ProfanityFilter', pos(2, 1), ['containsBannedWords']),
      node('n5', 'el-notifier', 'Notifier', pos(0, 1), ['notifyAuthor']),
    ],
    edges: [
      edge('e1', 'ed-post-comment', 'n1', 'n2', 'composition'),
      edge('e2', 'ed-post-user', 'n1', 'n3', 'association'),
      edge('e3', 'ed-post-filter', 'n1', 'n4', 'dependency'),
      edge('e4', 'ed-post-notifier', 'n1', 'n5', 'dependency'),
      edge('e5', 'ed-comment-user', 'n2', 'n3', 'association'),
    ],
    briefing: briefing(
      ['Post', 'Comment', 'User', 'ProfanityFilter', 'Notifier'],
      'Post',
      'like, share, addComment, deleteComment, moderateComment',
    ),
    requirement: requirement(2, 'comment handling lives in its own component and Post stays focused on the post itself'),
    expectedIssues: [
      issue(
        'dbg-social-post-owns-comments', 1,
        ['el-post'],
        'SRP Violation',
        ['comments', 'moderate', 'add', 'delete', 'responsibility', 'extract'],
        'Post both represents a post and manages the whole comment lifecycle: add, delete and moderate. Extract a CommentThread or CommentService responsible for comment handling.',
        [
          'Count the methods in Post that are about comments.',
          'If moderation rules change, would you expect to edit Post?',
        ],
      ),
      issue(
        'dbg-social-post-owns-comments', 2,
        ['ed-post-filter', 'ed-post-notifier'],
        'Tight Coupling',
        ['filter', 'notifier', 'concrete', 'post', 'moderation', 'inject'],
        'Post is coupled to ProfanityFilter and Notifier, which only exist to serve comment moderation. Move these into the comment-handling component so Post does not know about them.',
        [
          'Why would a Post need to know about a ProfanityFilter?',
          'Which outgoing arrows from Post exist only because of comments?',
        ],
      ),
    ],
    verification: { mustIntroduceElementNames: ['CommentService'] },
  }),

  // 162 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-interview-scheduler-god',
    title: 'Interview Scheduler Scope',
    difficulty: 'medium',
    order: 162,
    description: 'Find why one scheduler class knows about calendars, rooms, video and email.',
    tags: ['scheduler', 'god-object', 'integration'],
    nodes: [
      node('n1', 'el-scheduler', 'InterviewScheduler', pos(1, 0),
        ['checkAvailability', 'bookCalendar', 'reserveRoom', 'createVideoLink', 'sendEmail']),
      node('n2', 'el-candidate', 'Candidate', pos(0, 0), ['getEmail', 'getAvailability']),
      node('n3', 'el-interviewer', 'Interviewer', pos(2, 0), ['getEmail', 'getAvailability']),
      node('n4', 'el-room', 'Room', pos(0, 1), ['isFree', 'reserve']),
      node('n5', 'el-gcal', 'GoogleCalendarClient', pos(1, 1), ['insertEvent']),
      node('n6', 'el-zoom', 'ZoomClient', pos(2, 1), ['createMeeting']),
      node('n7', 'el-smtp', 'SmtpMailer', pos(1, 2), ['send']),
    ],
    edges: [
      edge('e1', 'ed-sched-candidate', 'n1', 'n2', 'association'),
      edge('e2', 'ed-sched-interviewer', 'n1', 'n3', 'association'),
      edge('e3', 'ed-sched-room', 'n1', 'n4', 'dependency'),
      edge('e4', 'ed-sched-gcal', 'n1', 'n5', 'dependency'),
      edge('e5', 'ed-sched-zoom', 'n1', 'n6', 'dependency'),
      edge('e6', 'ed-sched-smtp', 'n1', 'n7', 'dependency'),
    ],
    briefing: briefing(
      ['InterviewScheduler', 'Candidate', 'Interviewer', 'Room', 'GoogleCalendarClient', 'ZoomClient', 'SmtpMailer'],
      'InterviewScheduler',
      'checkAvailability, bookCalendar, reserveRoom, createVideoLink, sendEmail',
    ),
    requirement: requirement(2, 'scheduling logic is separated from integrations and each integration can change independently'),
    expectedIssues: [
      issue(
        'dbg-interview-scheduler-god', 1,
        ['el-scheduler'],
        'God Object',
        ['availability', 'calendar', 'room', 'video', 'email', 'orchestrat', 'too many'],
        'InterviewScheduler handles availability, calendar booking, room reservation, video link creation and email. It knows too much and changes for too many reasons. Split into focused services and keep the scheduler as a thin coordinator.',
        [
          'List the different domains InterviewScheduler touches.',
          'How many unrelated external systems does one class talk to?',
        ],
        ['too many responsibilities'],
      ),
      issue(
        'dbg-interview-scheduler-god', 2,
        ['ed-sched-gcal', 'ed-sched-zoom', 'ed-sched-smtp'],
        'DIP Violation',
        ['concrete', 'interface', 'abstraction', 'provider', 'swap', 'depend'],
        'The scheduler depends on concrete Google, Zoom and SMTP clients. Depend on CalendarGateway, VideoProvider and Mailer abstractions instead.',
        [
          'Could you replace Zoom with Teams without editing the scheduler?',
          'What types sit at the other end of those dependency arrows?',
        ],
      ),
    ],
    verification: { requireNoEditTo: ['Candidate', 'Interviewer'] },
  }),

  // 163 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-cdn-cache-inline',
    title: 'CDN Cache Policy',
    difficulty: 'medium',
    order: 163,
    description: 'Find why changing the cache eviction rule means rewriting the delivery class.',
    tags: ['cdn', 'cache', 'strategy', 'OCP'],
    nodes: [
      node('n1', 'el-delivery', 'ContentDelivery', pos(1, 0),
        ['serve', 'cacheLRU', 'cacheTTL', 'evict']),
      node('n2', 'el-edge-node', 'EdgeNode', pos(0, 0), ['handle']),
      node('n3', 'el-origin', 'OriginServer', pos(2, 0), ['fetch']),
      node('n4', 'el-cache-entry', 'CacheEntry', pos(1, 1), [],
        [
          { name: 'content', type: 'byte[]', visibility: 'public' },
          { name: 'expiresAt', type: 'DateTime', visibility: 'public' },
          { name: 'hitCount', type: 'int', visibility: 'public' },
        ]),
      node('n5', 'el-request', 'Request', pos(0, 1), ['getUrl']),
      node('n6', 'el-metrics', 'MetricsCollector', pos(2, 1), ['recordHit', 'recordMiss']),
    ],
    edges: [
      edge('e1', 'ed-edge-delivery', 'n2', 'n1', 'dependency'),
      edge('e2', 'ed-delivery-origin', 'n1', 'n3', 'dependency'),
      edge('e3', 'ed-delivery-entry', 'n1', 'n4', 'aggregation'),
      edge('e4', 'ed-delivery-request', 'n1', 'n5', 'dependency'),
      edge('e5', 'ed-delivery-metrics', 'n1', 'n6', 'dependency'),
    ],
    briefing: briefing(
      ['ContentDelivery', 'EdgeNode', 'OriginServer', 'CacheEntry', 'Request', 'MetricsCollector'],
      'ContentDelivery',
      'serve, cacheLRU, cacheTTL, evict',
    ),
    requirement: requirement(2, 'cache policies can be swapped or added without editing ContentDelivery'),
    expectedIssues: [
      issue(
        'dbg-cdn-cache-inline', 1,
        ['el-delivery'],
        'OCP Violation',
        ['strategy', 'policy', 'LRU', 'TTL', 'inline', 'new policy', 'interface'],
        'ContentDelivery implements LRU and TTL caching inline. A new policy such as LFU means editing the class. Extract a CacheStrategy interface with one implementation per policy and inject it.',
        [
          'Where does the cache eviction decision live?',
          'What would you modify to add an LFU policy?',
        ],
        ['missing CacheStrategy', 'missing strategy'],
      ),
      issue(
        'dbg-cdn-cache-inline', 2,
        ['el-cache-entry'],
        'Poor Encapsulation',
        ['public', 'fields', 'mutate', 'hitCount', 'expiresAt', 'getter', 'encapsulation'],
        'CacheEntry exposes content, expiresAt and hitCount as public fields, so any class can change them. Make them private and expose behaviour like isExpired() and recordHit().',
        [
          'Check the visibility of the attributes on CacheEntry.',
          'Who could corrupt expiresAt or hitCount today?',
        ],
      ),
    ],
    verification: { mustIntroduceElementNames: ['CacheStrategy'] },
  }),

  // 164 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-form-builder-god',
    title: 'Form Builder Duties',
    difficulty: 'medium',
    order: 164,
    description: 'Find why the Form class validates, hides fields, submits, tracks and prints.',
    tags: ['forms', 'god-object', 'coupling'],
    nodes: [
      node('n1', 'el-form', 'Form', pos(1, 0),
        ['validate', 'evaluateVisibility', 'submit', 'trackAnalytics', 'exportPDF']),
      node('n2', 'el-field', 'Field', pos(0, 0), ['getValue', 'setValue']),
      node('n3', 'el-rule', 'ValidationRule', pos(0, 1), ['check']),
      node('n4', 'el-pdf', 'PdfRenderer', pos(2, 0), ['render']),
      node('n5', 'el-analytics', 'AnalyticsClient', pos(2, 1), ['logEvent']),
      node('n6', 'el-store', 'SubmissionStore', pos(1, 1), ['save']),
    ],
    edges: [
      edge('e1', 'ed-form-field', 'n1', 'n2', 'composition'),
      edge('e2', 'ed-field-rule', 'n2', 'n3', 'association'),
      edge('e3', 'ed-form-pdf', 'n1', 'n4', 'dependency'),
      edge('e4', 'ed-form-analytics', 'n1', 'n5', 'dependency'),
      edge('e5', 'ed-form-store', 'n1', 'n6', 'dependency'),
    ],
    briefing: briefing(
      ['Form', 'Field', 'ValidationRule', 'PdfRenderer', 'AnalyticsClient', 'SubmissionStore'],
      'Form',
      'validate, evaluateVisibility, submit, trackAnalytics, exportPDF',
    ),
    requirement: requirement(2, 'form data, validation, submission, analytics and export each have a clear owner'),
    expectedIssues: [
      issue(
        'dbg-form-builder-god', 1,
        ['el-form'],
        'God Object',
        ['validate', 'visibility', 'submit', 'analytics', 'pdf', 'too many', 'split'],
        'Form validates input, computes field visibility, submits, tracks analytics and exports PDFs. It is a God Object. Split into FormValidator, VisibilityEvaluator, SubmissionService and exporters so Form is mostly a model.',
        [
          'How many unrelated jobs does Form perform?',
          'Which of those would change for a reason unrelated to forms (e.g. analytics vendor)?',
        ],
        ['too many responsibilities'],
      ),
      issue(
        'dbg-form-builder-god', 2,
        ['ed-form-pdf', 'ed-form-analytics'],
        'Tight Coupling',
        ['pdf', 'analytics', 'concrete', 'direct', 'abstraction', 'inject'],
        'Form is directly wired to PdfRenderer and AnalyticsClient. A form model should not know about rendering or telemetry vendors. Move these behind exporter/tracker interfaces used by higher-level services.',
        [
          'Why does a data model reference a PDF library?',
          'What happens to Form when you switch analytics providers?',
        ],
      ),
    ],
    verification: { requireNoEditTo: ['Field'] },
  }),

  // 165 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-analytics-mixed',
    title: 'Analytics Pipeline Blend',
    difficulty: 'medium',
    order: 165,
    description: 'Find why firing, storing and aggregating analytics all live in one service.',
    tags: ['analytics', 'SRP', 'encapsulation'],
    nodes: [
      node('n1', 'el-analytics-service', 'AnalyticsService', pos(1, 0),
        ['fire', 'persist', 'aggregate'],
        [{ name: 'buffer', type: 'List<AnalyticsEvent>', visibility: 'public' }]),
      node('n2', 'el-analytics-event', 'AnalyticsEvent', pos(0, 0), ['getName', 'getTimestamp']),
      node('n3', 'el-dashboard', 'Dashboard', pos(2, 0), ['refresh', 'showTotals']),
      node('n4', 'el-event-db', 'EventDatabase', pos(0, 1), ['insertBatch']),
      node('n5', 'el-metric', 'MetricAggregate', pos(1, 1), ['getCount', 'getAverage']),
    ],
    edges: [
      edge('e1', 'ed-service-event', 'n1', 'n2', 'aggregation'),
      edge('e2', 'ed-service-db', 'n1', 'n4', 'dependency'),
      edge('e3', 'ed-service-metric', 'n1', 'n5', 'dependency'),
      edge('e4', 'ed-dashboard-service', 'n3', 'n1', 'dependency'),
      edge('e5', 'ed-dashboard-metric', 'n3', 'n5', 'dependency'),
    ],
    briefing: briefing(
      ['AnalyticsService', 'AnalyticsEvent', 'Dashboard', 'EventDatabase', 'MetricAggregate'],
      'AnalyticsService',
      'fire, persist, aggregate',
    ),
    requirement: requirement(2, 'event collection, persistence and aggregation are separate and internal state is protected'),
    expectedIssues: [
      issue(
        'dbg-analytics-mixed', 1,
        ['el-analytics-service'],
        'SRP Violation',
        ['fire', 'persist', 'aggregate', 'collect', 'store', 'responsibility', 'split'],
        'AnalyticsService fires events, persists them and aggregates metrics. These change for different reasons. Split into an EventCollector, an EventRepository and a MetricsAggregator.',
        [
          'Name each reason AnalyticsService might need to change.',
          'Could aggregation be changed without touching how events are stored?',
        ],
      ),
      issue(
        'dbg-analytics-mixed', 2,
        ['ed-dashboard-service', 'el-analytics-service'],
        'Poor Encapsulation',
        ['public', 'buffer', 'expose', 'internal', 'dashboard', 'direct access'],
        'AnalyticsService exposes its internal buffer as a public attribute and Dashboard reads it directly. Callers can bypass the API or corrupt the buffer. Make it private and expose read-only query methods.',
        [
          'Look at the visibility of buffer and who is connected to AnalyticsService.',
          'What can Dashboard do to the buffer that it should not?',
        ],
      ),
    ],
    verification: { requireNoEditTo: ['AnalyticsEvent'] },
  }),

  // 166 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-multiplayer-no-role',
    title: 'Game Player Roles',
    difficulty: 'medium',
    order: 166,
    description: 'Find why admin, spectator and participant behaviour is tangled in Player.',
    tags: ['multiplayer', 'roles', 'OCP', 'encapsulation'],
    nodes: [
      node('n1', 'el-player', 'Player', pos(1, 0),
        ['kick', 'mute', 'move', 'chat', 'spectate', 'submitScore'],
        [
          { name: 'isAdmin', type: 'boolean', visibility: 'public' },
          { name: 'isSpectator', type: 'boolean', visibility: 'public' },
        ]),
      node('n2', 'el-session', 'GameSession', pos(0, 0), ['join', 'leave', 'broadcast']),
      node('n3', 'el-chat', 'ChatChannel', pos(2, 0), ['post']),
      node('n4', 'el-match', 'Match', pos(0, 1), ['start', 'end']),
      node('n5', 'el-lobby', 'Lobby', pos(1, 1), ['listPlayers']),
      node('n6', 'el-scoreboard', 'ScoreBoard', pos(2, 1), ['record']),
    ],
    edges: [
      edge('e1', 'ed-session-player', 'n2', 'n1', 'aggregation'),
      edge('e2', 'ed-chat-player', 'n3', 'n1', 'dependency'),
      edge('e3', 'ed-session-match', 'n2', 'n4', 'composition'),
      edge('e4', 'ed-lobby-session', 'n5', 'n2', 'association'),
      edge('e5', 'ed-match-scoreboard', 'n4', 'n6', 'composition'),
    ],
    briefing: briefing(
      ['Player', 'GameSession', 'ChatChannel', 'Match', 'Lobby', 'ScoreBoard'],
      'Player',
      'kick, mute, move, chat, spectate, submitScore',
    ),
    requirement: requirement(2, 'roles are first-class and a new role can be added without editing Player'),
    expectedIssues: [
      issue(
        'dbg-multiplayer-no-role', 1,
        ['el-player'],
        'OCP Violation',
        ['role', 'admin', 'spectator', 'participant', 'if', 'flags', 'new role', 'polymorphism'],
        'Player mixes admin, spectator and participant behaviour using boolean flags and conditionals. A new role like moderator means editing Player. Introduce a Role abstraction (Admin, Spectator, Participant) that Player delegates to.',
        [
          'How does Player know which actions are allowed?',
          'What changes if you add a "Moderator" role?',
        ],
        ['missing role', 'missing Role abstraction'],
      ),
      issue(
        'dbg-multiplayer-no-role', 2,
        ['ed-session-player', 'ed-chat-player'],
        'Poor Encapsulation',
        ['public', 'flag', 'isAdmin', 'isSpectator', 'check', 'expose', 'tell don\'t ask'],
        'Player exposes isAdmin and isSpectator as public flags. GameSession and ChatChannel inspect them and make decisions, scattering permission logic. Encapsulate role checks inside a Role (e.g. role.canKick()).',
        [
          'Which attributes of Player are public and who reads them?',
          'Where would permission checks end up scattered?',
        ],
      ),
    ],
    verification: { mustIntroduceElementNames: ['Role'] },
  }),

  // 167 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-microwave-controller-god',
    title: 'Microwave Controller Scope',
    difficulty: 'medium',
    order: 167,
    description: 'Find why one controller handles timer, power, door, presets and the display.',
    tags: ['embedded', 'god-object', 'DIP'],
    nodes: [
      node('n1', 'el-controller', 'MicrowaveController', pos(1, 0),
        ['setTimer', 'setPower', 'openDoor', 'closeDoor', 'applyPreset', 'updateDisplay']),
      node('n2', 'el-magnetron', 'Magnetron', pos(0, 1), ['setLevel', 'start', 'stop']),
      node('n3', 'el-door-sensor', 'DoorSensor', pos(1, 1), ['isOpen']),
      node('n4', 'el-display', 'LcdDisplay', pos(2, 1), ['showText']),
      node('n5', 'el-preset', 'Preset', pos(0, 0), ['getSeconds', 'getPower']),
      node('n6', 'el-keypad', 'Keypad', pos(2, 0), ['onKey']),
    ],
    edges: [
      edge('e1', 'ed-controller-magnetron', 'n1', 'n2', 'dependency'),
      edge('e2', 'ed-controller-door', 'n1', 'n3', 'dependency'),
      edge('e3', 'ed-controller-display', 'n1', 'n4', 'dependency'),
      edge('e4', 'ed-controller-preset', 'n1', 'n5', 'association'),
      edge('e5', 'ed-keypad-controller', 'n6', 'n1', 'dependency'),
    ],
    briefing: briefing(
      ['MicrowaveController', 'Magnetron', 'DoorSensor', 'LcdDisplay', 'Preset', 'Keypad'],
      'MicrowaveController',
      'setTimer, setPower, openDoor, closeDoor, applyPreset, updateDisplay',
    ),
    requirement: requirement(2, 'timing, power, safety and display concerns are separated and hardware is accessed through abstractions'),
    expectedIssues: [
      issue(
        'dbg-microwave-controller-god', 1,
        ['el-controller'],
        'God Object',
        ['timer', 'power', 'door', 'preset', 'display', 'too many', 'split'],
        'MicrowaveController owns the timer, power level, door logic, presets and display updates. Split into focused collaborators (CookTimer, PowerControl, DoorSafety, PresetManager, DisplayPresenter) and keep the controller as a coordinator.',
        [
          'How many different subsystems does the controller manage directly?',
          'Which of its methods could live in a separate, smaller class?',
        ],
        ['too many responsibilities'],
      ),
      issue(
        'dbg-microwave-controller-god', 2,
        ['ed-controller-magnetron', 'ed-controller-display'],
        'DIP Violation',
        ['hardware', 'concrete', 'interface', 'abstraction', 'magnetron', 'display', 'test'],
        'The controller depends directly on the concrete Magnetron and LcdDisplay hardware classes. Depend on abstractions such as HeatingElement and Display so the controller can be tested and hardware swapped.',
        [
          'Can you test the controller without real hardware today?',
          'What abstraction would sit between the controller and the Magnetron?',
        ],
      ),
    ],
    verification: { requireNoEditTo: ['Keypad'] },
  }),
]
