/**
 * Refactor packs — medium C (orders 256–267).
 */
import { pack, node, edge, pos, type RefactorPackSeed } from '../seed-studio-refactor-lib'

function brief(going: string, problem: string, todo: string, start: string): string {
  return (
    `What’s going on\n${going}\n\n` +
    `The problem (simple terms)\n${problem}\n\n` +
    `What you should do\n${todo}\n\n` +
    `Where to start\n${start}`
  )
}

export const MEDIUM_C: RefactorPackSeed[] = [
  // 256 — Shipment carriers
  pack({
    slug: 'ref-decouple-shipment-carriers',
    title: 'Shipment Carrier Binding',
    difficulty: 'medium',
    order: 256,
    description:
      'ShipmentTracker news up FedEx and DHL clients directly. Introduce a carrier abstraction so adding a carrier does not mean editing the tracker.',
    tags: ['shipment', 'carrier', 'decouple', 'logistics'],
    scenario: 'decouple',
    nodes: [
      node('n1', 'el-ship', 'Shipment', pos(0, 0), ['getTrackingNumber', 'getCarrierCode'], [
        { name: 'trackingNumber', type: 'String' },
        { name: 'carrierCode', type: 'String' },
      ]),
      node('n2', 'el-tracker', 'ShipmentTracker', pos(1, 0), [
        'track',
        'createLabel',
        'getRate',
        'handleDelivered',
      ], [
        { name: 'fedex', type: 'FedExClient' },
        { name: 'dhl', type: 'DHLClient' },
      ]),
      node('n3', 'el-fedex', 'FedExClient', pos(0, 1), ['fedexTrack', 'fedexLabel', 'fedexRate']),
      node('n4', 'el-dhl', 'DHLClient', pos(1, 1), ['dhlTrack', 'dhlLabel', 'dhlQuote']),
      node('n5', 'el-shiprepo', 'ShipmentRepository', pos(2, 0), ['save', 'findByTracking']),
      node('n6', 'el-custnotif', 'CustomerNotifier', pos(2, 1), ['sendDeliveredNotice']),
    ],
    edges: [
      edge('e1', 'ed-ship-tracker', 'n1', 'n2'),
      edge('e2', 'ed-tracker-fedex', 'n2', 'n3'),
      edge('e3', 'ed-tracker-dhl', 'n2', 'n4'),
      edge('e4', 'ed-tracker-repo', 'n2', 'n5', 'dependency', 'right', 'left'),
      edge('e5', 'ed-tracker-notif', 'n2', 'n6'),
    ],
    briefing: brief(
      'ShipmentTracker holds a FedExClient and a DHLClient and picks between them with carrier-code checks inside track(), createLabel(), and getRate().',
      'Every new carrier (UPS, Aramex…) forces edits across all three methods in ShipmentTracker. The tracker knows vendor APIs it should not care about.',
      'Make carriers swappable behind a common contract so the tracker talks to “a carrier,” not to FedEx or DHL by name. Keep tracking, labels, rates, and delivery notices working.',
      'Look at the ShipmentTracker → FedExClient and → DHLClient arrows and the if/else on carrierCode. Ask: what is the smallest contract both vendors can satisfy?',
    ),
    requirements: [
      'Track a shipment with its carrier',
      'Create shipping labels',
      'Quote shipping rates',
      'Notify customer on delivery',
    ],
    flows: [
      {
        id: 'track-shipment',
        label: 'Track Shipment',
        steps: ['Look up shipment', 'Ask carrier for tracking status', 'Persist status'],
        mustKeepElementNames: ['ShipmentTracker', 'FedExClient', 'DHLClient'],
        mustReach: [
          { from: 'ShipmentTracker', to: 'FedExClient' },
          { from: 'ShipmentTracker', to: 'DHLClient' },
        ],
        mustHavePathTopics: ['track', 'carrier'],
      },
      {
        id: 'create-label',
        label: 'Create Label',
        steps: ['Choose carrier', 'Request label', 'Save tracking number'],
        mustReach: [{ from: 'ShipmentTracker', to: 'ShipmentRepository' }],
        mustHavePathTopics: ['label', 'carrier'],
      },
      {
        id: 'delivered-notice',
        label: 'Delivered Notice',
        steps: ['Mark delivered', 'Notify customer'],
        mustReach: [{ from: 'ShipmentTracker', to: 'CustomerNotifier' }],
        mustHavePathTopics: ['notif', 'deliver'],
      },
    ],
    forbidDeleteElementNames: ['ShipmentTracker', 'FedExClient', 'DHLClient', 'Shipment'],
    modelHints: ['CarrierPort interface', 'Adapter per carrier', 'Factory/registry optional'],
  }),

  // 257 — Smart devices
  pack({
    slug: 'ref-decouple-smart-devices',
    title: 'Smart Hub Device Calls',
    difficulty: 'medium',
    order: 257,
    description:
      'SmartHub calls concrete lights, thermostats, and locks directly. Introduce a SmartDevice port so new devices plug in without hub edits.',
    tags: ['iot', 'smart-home', 'decouple', 'polymorphism'],
    scenario: 'decouple',
    nodes: [
      node('n1', 'el-hub', 'SmartHub', pos(1, 0), [
        'turnOnLight',
        'turnOffLight',
        'setTemperature',
        'lockDoor',
        'unlockDoor',
        'runScene',
      ], [
        { name: 'light', type: 'LightBulb' },
        { name: 'thermostat', type: 'Thermostat' },
        { name: 'lock', type: 'DoorLock' },
      ]),
      node('n2', 'el-app', 'MobileApp', pos(0, 0), ['pressSceneButton']),
      node('n3', 'el-light', 'LightBulb', pos(0, 1), ['switchOn', 'switchOff', 'dim']),
      node('n4', 'el-thermo', 'Thermostat', pos(1, 1), ['setTarget', 'readCurrent']),
      node('n5', 'el-lock', 'DoorLock', pos(2, 1), ['engage', 'release']),
      node('n6', 'el-hublog', 'ActivityLog', pos(2, 0), ['record']),
    ],
    edges: [
      edge('e1', 'ed-app-hub', 'n2', 'n1', 'dependency', 'right', 'left'),
      edge('e2', 'ed-hub-light', 'n1', 'n3'),
      edge('e3', 'ed-hub-thermo', 'n1', 'n4'),
      edge('e4', 'ed-hub-lock', 'n1', 'n5'),
      edge('e5', 'ed-hub-log', 'n1', 'n6', 'dependency', 'right', 'left'),
    ],
    briefing: brief(
      'SmartHub exposes a method per action and calls LightBulb, Thermostat, and DoorLock by their concrete types. runScene() chains those calls by hand.',
      'Adding a smart plug or camera means adding fields and methods to the hub. The hub grows with every gadget and cannot treat devices uniformly.',
      'Let the hub work with devices through one abstraction while each device keeps its own behavior. Scenes and logging must still work.',
      'Follow the three arrows out of SmartHub. Look at which operations are common (on/off/status) versus device-specific.',
    ),
    requirements: [
      'Control lights',
      'Set thermostat target',
      'Lock and unlock doors',
      'Run scenes and log activity',
    ],
    flows: [
      {
        id: 'run-scene',
        label: 'Run Scene',
        steps: ['App triggers scene', 'Hub commands each device', 'Hub logs activity'],
        mustKeepElementNames: ['SmartHub', 'MobileApp'],
        mustReach: [
          { from: 'MobileApp', to: 'SmartHub' },
          { from: 'SmartHub', to: 'ActivityLog' },
        ],
        mustHavePathTopics: ['scene', 'device'],
      },
      {
        id: 'control-light',
        label: 'Control Light',
        steps: ['Hub receives command', 'Light switches on/off'],
        mustReach: [{ from: 'SmartHub', to: 'LightBulb' }],
        mustHavePathTopics: ['light', 'device'],
      },
      {
        id: 'lock-door',
        label: 'Lock Door',
        steps: ['Hub receives command', 'Lock engages'],
        mustReach: [{ from: 'SmartHub', to: 'DoorLock' }],
        mustHavePathTopics: ['lock', 'device'],
      },
    ],
    forbidDeleteElementNames: ['SmartHub', 'LightBulb', 'Thermostat', 'DoorLock'],
    modelHints: ['SmartDevice interface', 'Device registry in hub', 'Devices implement the port'],
  }),

  // 258 — Editor commands
  pack({
    slug: 'ref-redesign-editor-commands',
    title: 'Document Editor Undo',
    difficulty: 'medium',
    order: 258,
    description:
      'Editor implements undo with a reverse switch over action types. Redesign with the Command pattern so each action knows how to undo itself.',
    tags: ['editor', 'undo', 'command-pattern', 'redesign'],
    scenario: 'redesign',
    nodes: [
      node('n1', 'el-editor', 'DocumentEditor', pos(1, 0), [
        'insertText',
        'deleteText',
        'applyBold',
        'undo',
        'redo',
      ], [
        { name: 'history', type: 'List<ActionRecord>' },
        { name: 'redoStack', type: 'List<ActionRecord>' },
      ]),
      node('n2', 'el-doc', 'Document', pos(1, 1), ['insert', 'remove', 'setStyle', 'getText'], [
        { name: 'content', type: 'String' },
      ]),
      node('n3', 'el-actrec', 'ActionRecord', pos(2, 0), ['getType', 'getPayload'], [
        { name: 'type', type: 'String' },
        { name: 'payload', type: 'Map<String,Object>' },
      ]),
      node('n4', 'el-toolbar', 'Toolbar', pos(0, 0), ['clickBold', 'clickUndo']),
      node('n5', 'el-shortcut', 'ShortcutHandler', pos(0, 1), ['onKey']),
      node('n6', 'el-autosave', 'AutoSaver', pos(2, 1), ['saveSnapshot']),
    ],
    edges: [
      edge('e1', 'ed-toolbar-editor', 'n4', 'n1', 'dependency', 'right', 'left'),
      edge('e2', 'ed-short-editor', 'n5', 'n1', 'dependency', 'top', 'left'),
      edge('e3', 'ed-editor-doc', 'n1', 'n2'),
      edge('e4', 'ed-editor-rec', 'n1', 'n3', 'association', 'right', 'left'),
      edge('e5', 'ed-editor-save', 'n1', 'n6', 'dependency', 'bottom', 'top'),
    ],
    briefing: brief(
      'DocumentEditor logs every action as an ActionRecord with a type string. undo() has a big switch(type) that reverses each action manually; redo() has a mirrored switch.',
      'Each new editing feature (italic, paste, image) requires touching insertText, undo, and redo in the same class. It is easy to forget one switch and corrupt undo history.',
      'Redesign so every action encapsulates both “do” and “undo.” The editor should just run and rewind them. Toolbar and keyboard shortcuts must still work.',
      'Read undo() in your head: it switches on ActionRecord.type. What object should own the logic for reversing one action?',
    ),
    requirements: [
      'Insert and delete text',
      'Apply formatting',
      'Undo and redo',
      'Toolbar and shortcuts trigger actions',
    ],
    flows: [
      {
        id: 'edit-action',
        label: 'Edit Action',
        steps: ['User triggers action', 'Editor executes it on document', 'Action recorded for history'],
        mustKeepElementNames: ['DocumentEditor', 'Document'],
        mustReach: [
          { from: 'Toolbar', to: 'DocumentEditor' },
          { from: 'DocumentEditor', to: 'Document' },
        ],
        mustHavePathTopics: ['execute', 'action', 'command'],
      },
      {
        id: 'undo',
        label: 'Undo',
        steps: ['User presses Ctrl+Z', 'Editor pops last action', 'Action reverses its own effect'],
        mustReach: [
          { from: 'ShortcutHandler', to: 'DocumentEditor' },
          { from: 'DocumentEditor', to: 'Document' },
        ],
        mustHavePathTopics: ['undo', 'command'],
      },
      {
        id: 'autosave',
        label: 'Auto Save',
        steps: ['Editor changes document', 'AutoSaver snapshots'],
        mustReach: [{ from: 'DocumentEditor', to: 'AutoSaver' }],
        mustHavePathTopics: ['save'],
      },
    ],
    forbidDeleteElementNames: ['DocumentEditor', 'Document', 'Toolbar'],
    modelHints: ['Command interface with execute()/undo()', 'Concrete commands per action', 'Editor holds command stacks'],
  }),

  // 259 — Comment service
  pack({
    slug: 'ref-extract-comment-service',
    title: 'Social Post Comments',
    difficulty: 'medium',
    order: 259,
    description:
      'Post owns comment create/edit/delete/moderation alongside its own content. Extract a CommentService and keep Post focused.',
    tags: ['social', 'comments', 'extract', 'srp'],
    scenario: 'extract',
    nodes: [
      node('n1', 'el-post', 'Post', pos(1, 0), [
        'publish',
        'edit',
        'addComment',
        'editComment',
        'deleteComment',
        'flagComment',
        'listComments',
      ], [
        { name: 'comments', type: 'List<Comment>' },
        { name: 'body', type: 'String' },
      ]),
      node('n2', 'el-comment', 'Comment', pos(2, 0), ['getText', 'getAuthorId'], [
        { name: 'text', type: 'String' },
        { name: 'authorId', type: 'String' },
      ]),
      node('n3', 'el-postctrl', 'PostController', pos(0, 0), ['commentOnPost', 'removeComment']),
      node('n4', 'el-postrepo', 'PostRepository', pos(1, 1), ['save', 'findById']),
      node('n5', 'el-spam', 'SpamFilter', pos(2, 1), ['isSpam']),
      node('n6', 'el-notify', 'AuthorNotifier', pos(0, 1), ['notifyNewComment']),
    ],
    edges: [
      edge('e1', 'ed-ctrl-post', 'n3', 'n1', 'dependency', 'right', 'left'),
      edge('e2', 'ed-post-comment', 'n1', 'n2', 'composition', 'right', 'left'),
      edge('e3', 'ed-post-repo', 'n1', 'n4'),
      edge('e4', 'ed-post-spam', 'n1', 'n5'),
      edge('e5', 'ed-post-notify', 'n1', 'n6'),
    ],
    briefing: brief(
      'Post stores its comments in a list and implements addComment, editComment, deleteComment, flagComment, and listComments itself — including calling SpamFilter and AuthorNotifier.',
      'A post entity is mixing “what a post is” with “how comments work.” Comment rules changes (threading, rate limits) force edits in the Post class used everywhere else.',
      'Pull comment workflows into a dedicated service and keep Post responsible for post content. PostController should still be able to add and remove comments.',
      'Count the comment-related methods on Post and trace which collaborators only they use (SpamFilter, AuthorNotifier).',
    ),
    requirements: [
      'Add comments with spam check',
      'Edit and delete own comments',
      'Flag abusive comments',
      'Notify post author of new comments',
    ],
    flows: [
      {
        id: 'add-comment',
        label: 'Add Comment',
        steps: ['Controller receives request', 'Spam check', 'Store comment', 'Notify author'],
        mustKeepElementNames: ['Post', 'Comment', 'PostController'],
        mustReach: [
          { from: 'PostController', to: 'SpamFilter' },
          { from: 'PostController', to: 'AuthorNotifier' },
        ],
        mustHavePathTopics: ['comment', 'spam', 'notif'],
      },
      {
        id: 'delete-comment',
        label: 'Delete Comment',
        steps: ['Controller receives request', 'Remove comment', 'Persist'],
        mustReach: [{ from: 'PostController', to: 'PostRepository' }],
        mustHavePathTopics: ['comment', 'delete'],
      },
      {
        id: 'publish-post',
        label: 'Publish Post',
        steps: ['Create post content', 'Persist post'],
        mustReach: [{ from: 'Post', to: 'PostRepository' }],
        mustHavePathTopics: ['publish', 'post'],
      },
    ],
    forbidDeleteElementNames: ['Post', 'Comment', 'PostController'],
    modelHints: ['CommentService', 'Optional CommentRepository', 'Controller calls service'],
  }),

  // 260 — Interview scheduler
  pack({
    slug: 'ref-split-interview-scheduler',
    title: 'Interview Scheduler God',
    difficulty: 'medium',
    order: 260,
    description:
      'InterviewScheduler checks availability, books rooms, creates video links, and sends emails. Extract focused services.',
    tags: ['scheduling', 'god-class', 'extract', 'hiring'],
    scenario: 'extract',
    nodes: [
      node('n1', 'el-sched', 'InterviewScheduler', pos(1, 0), [
        'scheduleInterview',
        'rescheduleInterview',
        'cancelInterview',
        'findFreeSlots',
        'bookRoom',
        'createVideoLink',
        'sendInvite',
      ], [
        { name: 'calendarClient', type: 'CalendarApi' },
        { name: 'zoomClient', type: 'ZoomApi' },
        { name: 'smtp', type: 'SmtpClient' },
      ]),
      node('n2', 'el-recruiter', 'RecruiterPortal', pos(0, 0), ['requestInterview']),
      node('n3', 'el-calapi', 'CalendarApi', pos(0, 1), ['getBusySlots', 'createEvent']),
      node('n4', 'el-roomsys', 'RoomSystem', pos(1, 1), ['reserve', 'release']),
      node('n5', 'el-zoom', 'ZoomApi', pos(2, 1), ['createMeeting']),
      node('n6', 'el-smtp', 'SmtpClient', pos(2, 0), ['send']),
    ],
    edges: [
      edge('e1', 'ed-rec-sched', 'n2', 'n1', 'dependency', 'right', 'left'),
      edge('e2', 'ed-sched-cal', 'n1', 'n3'),
      edge('e3', 'ed-sched-room', 'n1', 'n4'),
      edge('e4', 'ed-sched-zoom', 'n1', 'n5'),
      edge('e5', 'ed-sched-smtp', 'n1', 'n6', 'dependency', 'right', 'left'),
    ],
    briefing: brief(
      'InterviewScheduler computes free slots from CalendarApi, reserves physical rooms in RoomSystem, mints Zoom meetings, and sends invite emails — all in one class.',
      'Four independent integrations are tangled in one workflow class. A change to email templates or room rules risks breaking availability logic.',
      'Extract services for availability, room/venue booking, video meetings, and invitations. The scheduler should orchestrate rather than do everything. Cancel and reschedule must keep working.',
      'List the scheduler’s methods and group them by external system they talk to.',
    ),
    requirements: [
      'Find slots where all participants are free',
      'Book an on-site room when needed',
      'Create a video link for remote interviews',
      'Email invitations and cancellations',
    ],
    flows: [
      {
        id: 'schedule-interview',
        label: 'Schedule Interview',
        steps: ['Find common slot', 'Book room or video link', 'Send invites'],
        mustKeepElementNames: ['InterviewScheduler', 'RecruiterPortal'],
        mustReach: [
          { from: 'InterviewScheduler', to: 'CalendarApi' },
          { from: 'InterviewScheduler', to: 'RoomSystem' },
          { from: 'InterviewScheduler', to: 'SmtpClient' },
        ],
        mustHavePathTopics: ['availab', 'room', 'invite'],
      },
      {
        id: 'remote-interview',
        label: 'Remote Interview',
        steps: ['Find common slot', 'Create video meeting', 'Send invite with link'],
        mustReach: [
          { from: 'InterviewScheduler', to: 'ZoomApi' },
          { from: 'InterviewScheduler', to: 'SmtpClient' },
        ],
        mustHavePathTopics: ['video', 'invite'],
      },
      {
        id: 'cancel-interview',
        label: 'Cancel Interview',
        steps: ['Release room', 'Notify participants'],
        mustReach: [
          { from: 'InterviewScheduler', to: 'RoomSystem' },
          { from: 'InterviewScheduler', to: 'SmtpClient' },
        ],
        mustHavePathTopics: ['room', 'notif', 'email'],
      },
    ],
    forbidDeleteElementNames: ['InterviewScheduler', 'RecruiterPortal'],
    modelHints: ['AvailabilityService', 'RoomBookingService', 'VideoMeetingService', 'InviteNotifier'],
  }),

  // 261 — CDN cache
  pack({
    slug: 'ref-decouple-cdn-cache',
    title: 'CDN Cache Policy Inline',
    difficulty: 'medium',
    order: 261,
    description:
      'ContentDelivery caches inline with hard-coded LRU/TTL branches. Extract a CacheStrategy so policies can be swapped.',
    tags: ['cdn', 'cache', 'strategy', 'decouple'],
    scenario: 'decouple',
    nodes: [
      node('n1', 'el-cdn', 'ContentDelivery', pos(1, 0), [
        'serve',
        'purge',
        'putInCache',
        'evictLru',
        'evictExpired',
        'shouldCache',
      ], [
        { name: 'cacheMap', type: 'Map<String,CachedItem>' },
        { name: 'policyMode', type: 'String' },
      ]),
      node('n2', 'el-edge', 'EdgeServer', pos(0, 0), ['handleRequest']),
      node('n3', 'el-cached', 'CachedItem', pos(2, 0), ['isExpired', 'touch'], [
        { name: 'ttlSeconds', type: 'int' },
        { name: 'lastAccess', type: 'long' },
      ]),
      node('n4', 'el-origin', 'OriginClient', pos(0, 1), ['fetch']),
      node('n5', 'el-metrics', 'CdnMetrics', pos(1, 1), ['recordHit', 'recordMiss']),
      node('n6', 'el-compress', 'Compressor', pos(2, 1), ['gzip']),
    ],
    edges: [
      edge('e1', 'ed-edge-cdn', 'n2', 'n1', 'dependency', 'right', 'left'),
      edge('e2', 'ed-cdn-cached', 'n1', 'n3', 'association', 'right', 'left'),
      edge('e3', 'ed-cdn-origin', 'n1', 'n4'),
      edge('e4', 'ed-cdn-metrics', 'n1', 'n5'),
      edge('e5', 'ed-cdn-comp', 'n1', 'n6'),
    ],
    briefing: brief(
      'ContentDelivery stores CachedItems in a map and uses policyMode (“lru” or “ttl”) with if/else in putInCache, evictLru, evictExpired, and shouldCache.',
      'Cache eviction/admission rules are baked into the delivery class. Adding LFU or size-based eviction means editing core request-serving code.',
      'Move caching decisions behind a swappable strategy while ContentDelivery keeps serving, purging, and recording metrics. Origin fetch on a miss must remain.',
      'Search the class mentally for policyMode checks. Which methods only exist to implement one cache policy?',
    ),
    requirements: [
      'Serve cached content on hit',
      'Fetch from origin on miss',
      'Evict according to configured policy',
      'Purge content on demand',
    ],
    flows: [
      {
        id: 'serve-hit',
        label: 'Serve Cache Hit',
        steps: ['Edge receives request', 'Lookup cache', 'Record hit', 'Return content'],
        mustKeepElementNames: ['ContentDelivery', 'EdgeServer', 'CachedItem'],
        mustReach: [
          { from: 'EdgeServer', to: 'ContentDelivery' },
          { from: 'ContentDelivery', to: 'CdnMetrics' },
        ],
        mustHavePathTopics: ['cache', 'hit'],
      },
      {
        id: 'serve-miss',
        label: 'Serve Cache Miss',
        steps: ['Lookup cache', 'Fetch origin', 'Decide to cache', 'Compress and return'],
        mustReach: [
          { from: 'ContentDelivery', to: 'OriginClient' },
          { from: 'ContentDelivery', to: 'Compressor' },
        ],
        mustHavePathTopics: ['origin', 'cache', 'strategy', 'policy'],
      },
      {
        id: 'evict',
        label: 'Evict',
        steps: ['Cache is full', 'Policy picks victim', 'Remove entry'],
        mustReach: [{ from: 'ContentDelivery', to: 'CachedItem' }],
        mustHavePathTopics: ['evict', 'policy', 'strategy'],
      },
    ],
    forbidDeleteElementNames: ['ContentDelivery', 'EdgeServer', 'CachedItem', 'OriginClient'],
    modelHints: ['CacheStrategy interface', 'LruStrategy / TtlStrategy', 'Inject strategy into ContentDelivery'],
  }),

  // 262 — Form builder
  pack({
    slug: 'ref-split-form-builder',
    title: 'Form Builder Duties',
    difficulty: 'medium',
    order: 262,
    description:
      'FormBuilder validates, submits, tracks analytics, and exports PDFs. Extract each concern into its own collaborator.',
    tags: ['forms', 'god-class', 'extract', 'srp'],
    scenario: 'extract',
    nodes: [
      node('n1', 'el-formbuilder', 'FormBuilder', pos(1, 0), [
        'addField',
        'removeField',
        'validate',
        'submit',
        'trackFieldFocus',
        'trackSubmitRate',
        'exportPdf',
      ], [
        { name: 'fields', type: 'List<FormField>' },
        { name: 'events', type: 'List<AnalyticsEvent>' },
      ]),
      node('n2', 'el-formfield', 'FormField', pos(2, 0), ['getLabel', 'getRules'], [
        { name: 'label', type: 'String' },
        { name: 'rules', type: 'List<String>' },
      ]),
      node('n3', 'el-formpage', 'FormPage', pos(0, 0), ['render', 'onSubmitClick']),
      node('n4', 'el-submitapi', 'SubmissionApi', pos(0, 1), ['post']),
      node('n5', 'el-analytics', 'AnalyticsClient', pos(1, 1), ['sendEvent']),
      node('n6', 'el-pdflib', 'PdfLibrary', pos(2, 1), ['renderPage', 'save']),
    ],
    edges: [
      edge('e1', 'ed-page-builder', 'n3', 'n1', 'dependency', 'right', 'left'),
      edge('e2', 'ed-builder-field', 'n1', 'n2', 'composition', 'right', 'left'),
      edge('e3', 'ed-builder-api', 'n1', 'n4'),
      edge('e4', 'ed-builder-analytics', 'n1', 'n5'),
      edge('e5', 'ed-builder-pdf', 'n1', 'n6'),
    ],
    briefing: brief(
      'FormBuilder defines fields, runs validation rules, posts submissions, records analytics events, and renders a PDF export — four jobs wrapped around one field list.',
      'Changing PDF layout or analytics events means editing the same class that owns validation and submission. Each concern is hard to test alone.',
      'Extract validation, submission, analytics, and export responsibilities so FormBuilder mostly composes the form. Submit-to-API and PDF export must still work.',
      'Group FormBuilder’s methods by what they touch: FormField rules, SubmissionApi, AnalyticsClient, PdfLibrary.',
    ),
    requirements: [
      'Define form fields',
      'Validate input against rules',
      'Submit form data',
      'Track form analytics',
      'Export a PDF copy',
    ],
    flows: [
      {
        id: 'submit-form',
        label: 'Submit Form',
        steps: ['User clicks submit', 'Validate fields', 'Post submission', 'Track submit event'],
        mustKeepElementNames: ['FormBuilder', 'FormField', 'FormPage'],
        mustReach: [
          { from: 'FormPage', to: 'SubmissionApi' },
          { from: 'FormPage', to: 'AnalyticsClient' },
        ],
        mustHavePathTopics: ['validat', 'submit', 'analytics'],
      },
      {
        id: 'export-pdf',
        label: 'Export PDF',
        steps: ['User requests export', 'Render fields to pages', 'Save PDF'],
        mustReach: [{ from: 'FormPage', to: 'PdfLibrary' }],
        mustHavePathTopics: ['pdf', 'export'],
      },
    ],
    forbidDeleteElementNames: ['FormBuilder', 'FormField', 'FormPage'],
    modelHints: ['FormValidator', 'FormSubmitter', 'FormAnalyticsTracker', 'PdfExporter'],
  }),

  // 263 — Analytics pipeline
  pack({
    slug: 'ref-extract-analytics-pipeline',
    title: 'Analytics Fire Persist Mix',
    difficulty: 'medium',
    order: 263,
    description:
      'AnalyticsService fires events, stores them, and aggregates reports in one class. Split ingestion, storage, and aggregation.',
    tags: ['analytics', 'pipeline', 'extract', 'srp'],
    scenario: 'extract',
    nodes: [
      node('n1', 'el-analsvc', 'AnalyticsService', pos(1, 0), [
        'trackEvent',
        'enrichEvent',
        'persistEvent',
        'flushBuffer',
        'dailyCount',
        'topEvents',
        'buildReport',
      ], [
        { name: 'buffer', type: 'List<Event>' },
        { name: 'db', type: 'EventDatabase' },
      ]),
      node('n2', 'el-event', 'Event', pos(2, 0), ['getName', 'getTimestamp'], [
        { name: 'name', type: 'String' },
        { name: 'timestamp', type: 'long' },
      ]),
      node('n3', 'el-sdk', 'ClientSdk', pos(0, 0), ['logClick', 'logView']),
      node('n4', 'el-eventdb', 'EventDatabase', pos(1, 1), ['insertBatch', 'queryRange']),
      node('n5', 'el-dashboard', 'DashboardController', pos(0, 1), ['showReport']),
      node('n6', 'el-geoip', 'GeoLookup', pos(2, 1), ['resolveCountry']),
    ],
    edges: [
      edge('e1', 'ed-sdk-anal', 'n3', 'n1', 'dependency', 'right', 'left'),
      edge('e2', 'ed-anal-event', 'n1', 'n2', 'association', 'right', 'left'),
      edge('e3', 'ed-anal-db', 'n1', 'n4'),
      edge('e4', 'ed-anal-geo', 'n1', 'n6'),
      edge('e5', 'ed-dash-anal', 'n5', 'n1', 'dependency', 'top', 'left'),
    ],
    briefing: brief(
      'AnalyticsService receives events from ClientSdk, enriches them with geo data, buffers and flushes to EventDatabase, and also computes daily counts, top events, and reports for the dashboard.',
      'Write-path code (fire & persist) and read-path code (aggregation) live together. Reporting changes risk slowing or breaking ingestion.',
      'Split the write path from the aggregation/report path, keeping enrichment sensible. Dashboard reports and event ingestion must both still work.',
      'Draw a line through AnalyticsService: trackEvent → persistEvent is ingestion; dailyCount → buildReport is reporting.',
    ),
    requirements: [
      'Ingest client events',
      'Enrich events with geo data',
      'Persist events in batches',
      'Aggregate and report metrics',
    ],
    flows: [
      {
        id: 'track-event',
        label: 'Track Event',
        steps: ['SDK sends event', 'Enrich with geo', 'Buffer and flush to DB'],
        mustKeepElementNames: ['AnalyticsService', 'Event', 'ClientSdk'],
        mustReach: [
          { from: 'ClientSdk', to: 'GeoLookup' },
          { from: 'ClientSdk', to: 'EventDatabase' },
        ],
        mustHavePathTopics: ['event', 'persist', 'ingest'],
      },
      {
        id: 'show-report',
        label: 'Show Report',
        steps: ['Dashboard requests report', 'Query events', 'Aggregate counts'],
        mustReach: [{ from: 'DashboardController', to: 'EventDatabase' }],
        mustHavePathTopics: ['report', 'aggregat'],
      },
    ],
    forbidDeleteElementNames: ['AnalyticsService', 'Event', 'ClientSdk', 'DashboardController'],
    modelHints: ['EventIngestor', 'EventStore', 'MetricsAggregator'],
  }),

  // 264 — Player roles
  pack({
    slug: 'ref-decouple-player-roles',
    title: 'Multiplayer Role Mix',
    difficulty: 'medium',
    order: 264,
    description:
      'Player handles admin, spectator, and normal-player behavior with role flags. Introduce a Role abstraction.',
    tags: ['multiplayer', 'roles', 'decouple', 'polymorphism'],
    scenario: 'decouple',
    nodes: [
      node('n1', 'el-player', 'Player', pos(1, 0), [
        'move',
        'attack',
        'chat',
        'kickPlayer',
        'mutePlayer',
        'watchMatch',
        'canPerform',
      ], [
        { name: 'isAdmin', type: 'boolean' },
        { name: 'isSpectator', type: 'boolean' },
        { name: 'name', type: 'String' },
      ]),
      node('n2', 'el-lobby', 'GameLobby', pos(0, 0), ['join', 'leave']),
      node('n3', 'el-match', 'MatchSession', pos(1, 1), ['applyMove', 'applyAttack', 'addSpectator']),
      node('n4', 'el-chatsvc', 'ChatService', pos(2, 0), ['broadcast', 'muteUser']),
      node('n5', 'el-moderation', 'ModerationService', pos(2, 1), ['kick', 'audit']),
      node('n6', 'el-input', 'InputHandler', pos(0, 1), ['onCommand']),
    ],
    edges: [
      edge('e1', 'ed-lobby-player', 'n2', 'n1', 'association', 'right', 'left'),
      edge('e2', 'ed-input-player', 'n6', 'n1', 'dependency', 'top', 'left'),
      edge('e3', 'ed-player-match', 'n1', 'n3'),
      edge('e4', 'ed-player-chat', 'n1', 'n4', 'dependency', 'right', 'left'),
      edge('e5', 'ed-player-mod', 'n1', 'n5'),
    ],
    briefing: brief(
      'Player has isAdmin and isSpectator flags, and every method (move, attack, chat, kickPlayer, watchMatch) checks them to decide what is allowed.',
      'Permission logic is smeared across the class. Adding a “moderator” or “coach” role means more flags and more branches in every method.',
      'Model roles as an abstraction with their own permissions/behavior so Player delegates instead of branching. Normal play, moderation, and spectating must all keep working.',
      'Look at the boolean attributes and canPerform(). Ask what a Role would answer instead.',
    ),
    requirements: [
      'Players can move, attack, and chat',
      'Admins can kick and mute',
      'Spectators can watch but not act',
      'Role checks happen in one place',
    ],
    flows: [
      {
        id: 'play-turn',
        label: 'Play Turn',
        steps: ['Input command', 'Check role permission', 'Apply move or attack'],
        mustKeepElementNames: ['Player', 'MatchSession', 'InputHandler'],
        mustReach: [
          { from: 'InputHandler', to: 'Player' },
          { from: 'Player', to: 'MatchSession' },
        ],
        mustHavePathTopics: ['role', 'permission', 'move'],
      },
      {
        id: 'moderate',
        label: 'Moderate Player',
        steps: ['Admin issues kick/mute', 'Permission verified', 'Moderation applied and audited'],
        mustReach: [
          { from: 'Player', to: 'ModerationService' },
          { from: 'Player', to: 'ChatService' },
        ],
        mustHavePathTopics: ['admin', 'role', 'kick'],
      },
      {
        id: 'spectate',
        label: 'Spectate Match',
        steps: ['Spectator joins', 'Added to match as watcher'],
        mustReach: [{ from: 'Player', to: 'MatchSession' }],
        mustHavePathTopics: ['spectat', 'role'],
      },
    ],
    forbidDeleteElementNames: ['Player', 'GameLobby', 'MatchSession'],
    modelHints: ['Role interface', 'AdminRole / SpectatorRole / PlayerRole', 'Player holds a Role'],
  }),

  // 265 — Microwave
  pack({
    slug: 'ref-split-microwave-controller',
    title: 'Microwave Controller God',
    difficulty: 'medium',
    order: 265,
    description:
      'MicrowaveController handles timer, power, door, and display together. Extract components so each device part owns its logic.',
    tags: ['embedded', 'microwave', 'god-class', 'extract'],
    scenario: 'extract',
    nodes: [
      node('n1', 'el-mwctrl', 'MicrowaveController', pos(1, 0), [
        'start',
        'stop',
        'setTimer',
        'tickTimer',
        'setPower',
        'applyPowerLevel',
        'onDoorOpened',
        'onDoorClosed',
        'updateDisplay',
        'beep',
      ], [
        { name: 'remainingSeconds', type: 'int' },
        { name: 'powerLevel', type: 'int' },
        { name: 'doorOpen', type: 'boolean' },
        { name: 'displayText', type: 'String' },
      ]),
      node('n2', 'el-keypad', 'Keypad', pos(0, 0), ['pressDigit', 'pressStart']),
      node('n3', 'el-magnetron', 'Magnetron', pos(1, 1), ['emit', 'cutOff']),
      node('n4', 'el-doorsensor', 'DoorSensor', pos(0, 1), ['isOpen']),
      node('n5', 'el-lcd', 'LcdPanel', pos(2, 0), ['show']),
      node('n6', 'el-buzzer', 'Buzzer', pos(2, 1), ['sound']),
    ],
    edges: [
      edge('e1', 'ed-keypad-ctrl', 'n2', 'n1', 'dependency', 'right', 'left'),
      edge('e2', 'ed-ctrl-mag', 'n1', 'n3'),
      edge('e3', 'ed-ctrl-door', 'n1', 'n4', 'dependency', 'left', 'top'),
      edge('e4', 'ed-ctrl-lcd', 'n1', 'n5', 'dependency', 'right', 'left'),
      edge('e5', 'ed-ctrl-buzzer', 'n1', 'n6'),
    ],
    briefing: brief(
      'MicrowaveController tracks the countdown, power level, door state, and display text, and directly drives Magnetron, DoorSensor, LcdPanel, and Buzzer.',
      'Timer rules, power rules, door-safety, and display formatting are interleaved. A bug in door handling can easily leak into timer code.',
      'Extract cohesive parts (timer, power, door safety, display) and let the controller coordinate. Starting, stopping on door open, and finishing with a beep must still work.',
      'Highlight the four attributes — remainingSeconds, powerLevel, doorOpen, displayText — each hints at a missing class.',
    ),
    requirements: [
      'Set timer and power level',
      'Start cooking only when door is closed',
      'Stop immediately when door opens',
      'Show remaining time and beep when done',
    ],
    flows: [
      {
        id: 'start-cooking',
        label: 'Start Cooking',
        steps: ['Keypad sets time/power', 'Verify door closed', 'Emit microwaves', 'Show countdown'],
        mustKeepElementNames: ['MicrowaveController', 'Magnetron', 'Keypad'],
        mustReach: [
          { from: 'Keypad', to: 'Magnetron' },
          { from: 'MicrowaveController', to: 'DoorSensor' },
          { from: 'MicrowaveController', to: 'LcdPanel' },
        ],
        mustHavePathTopics: ['timer', 'power', 'door'],
      },
      {
        id: 'door-open',
        label: 'Door Opened',
        steps: ['Door opens', 'Cut off magnetron', 'Update display'],
        mustReach: [
          { from: 'MicrowaveController', to: 'Magnetron' },
          { from: 'MicrowaveController', to: 'LcdPanel' },
        ],
        mustHavePathTopics: ['door', 'safety', 'stop'],
      },
      {
        id: 'finish',
        label: 'Finish Cooking',
        steps: ['Timer hits zero', 'Stop magnetron', 'Beep'],
        mustReach: [
          { from: 'MicrowaveController', to: 'Magnetron' },
          { from: 'MicrowaveController', to: 'Buzzer' },
        ],
        mustHavePathTopics: ['timer', 'beep'],
      },
    ],
    forbidDeleteElementNames: ['MicrowaveController', 'Magnetron', 'DoorSensor', 'LcdPanel', 'Buzzer'],
    modelHints: ['CookTimer', 'PowerControl', 'DoorSafety', 'DisplayPresenter'],
  }),

  // 266 — Subscription billing
  pack({
    slug: 'ref-extract-subscription-billing',
    title: 'Subscription Billing Blob',
    difficulty: 'medium',
    order: 266,
    description:
      'SubscriptionManager mixes plan changes, invoicing, and dunning. Extract Billing and Dunning services.',
    tags: ['subscription', 'billing', 'dunning', 'extract'],
    scenario: 'extract',
    nodes: [
      node('n1', 'el-submgr', 'SubscriptionManager', pos(1, 0), [
        'subscribe',
        'changePlan',
        'cancel',
        'generateInvoice',
        'chargeInvoice',
        'prorate',
        'handleFailedPayment',
        'retryPayment',
        'sendDunningEmail',
        'suspendAccount',
      ], [
        { name: 'retryCount', type: 'int' },
      ]),
      node('n2', 'el-plan', 'Plan', pos(2, 0), ['getPrice', 'getInterval'], [
        { name: 'price', type: 'double' },
      ]),
      node('n3', 'el-account', 'CustomerAccount', pos(0, 0), ['getPlanId', 'setStatus']),
      node('n4', 'el-gateway', 'PaymentGateway', pos(0, 1), ['charge']),
      node('n5', 'el-invrepo', 'InvoiceRepository', pos(1, 1), ['save', 'findOpen']),
      node('n6', 'el-mailer', 'Mailer', pos(2, 1), ['send']),
    ],
    edges: [
      edge('e1', 'ed-sub-plan', 'n1', 'n2', 'association', 'right', 'left'),
      edge('e2', 'ed-acct-sub', 'n3', 'n1', 'dependency', 'right', 'left'),
      edge('e3', 'ed-sub-gw', 'n1', 'n4'),
      edge('e4', 'ed-sub-inv', 'n1', 'n5'),
      edge('e5', 'ed-sub-mail', 'n1', 'n6'),
    ],
    briefing: brief(
      'SubscriptionManager handles sign-ups and plan changes, builds and charges invoices (with proration), and also runs the failed-payment retry and dunning email schedule.',
      'Plan lifecycle, billing math, and dunning (collections) policy are three different change drivers. Tweaking retry schedules shouldn’t touch plan changes.',
      'Extract a billing component (invoice, proration, charge) and a dunning component (retry, notices, suspension). The manager should handle plan lifecycle and delegate.',
      'Cluster the ten methods: subscribe/changePlan/cancel; generateInvoice/chargeInvoice/prorate; handleFailedPayment/retryPayment/sendDunningEmail/suspendAccount.',
    ),
    requirements: [
      'Subscribe, upgrade/downgrade, and cancel',
      'Generate and charge invoices with proration',
      'Retry failed payments',
      'Send dunning emails and suspend after repeated failure',
    ],
    flows: [
      {
        id: 'change-plan',
        label: 'Change Plan',
        steps: ['Customer picks new plan', 'Prorate charge', 'Create invoice', 'Charge gateway'],
        mustKeepElementNames: ['SubscriptionManager', 'Plan', 'CustomerAccount'],
        mustReach: [
          { from: 'SubscriptionManager', to: 'PaymentGateway' },
          { from: 'SubscriptionManager', to: 'InvoiceRepository' },
        ],
        mustHavePathTopics: ['plan', 'invoice', 'billing'],
      },
      {
        id: 'failed-payment',
        label: 'Failed Payment',
        steps: ['Charge fails', 'Retry on schedule', 'Send dunning email', 'Suspend after limit'],
        mustReach: [
          { from: 'SubscriptionManager', to: 'PaymentGateway' },
          { from: 'SubscriptionManager', to: 'Mailer' },
        ],
        mustHavePathTopics: ['dunning', 'retry', 'email'],
      },
      {
        id: 'cancel-subscription',
        label: 'Cancel Subscription',
        steps: ['Customer cancels', 'Final invoice if needed', 'Update account status'],
        mustReach: [{ from: 'CustomerAccount', to: 'SubscriptionManager' }],
        mustHavePathTopics: ['cancel', 'invoice'],
      },
    ],
    forbidDeleteElementNames: ['SubscriptionManager', 'Plan', 'CustomerAccount', 'PaymentGateway'],
    modelHints: ['BillingService', 'DunningService', 'Manager coordinates'],
  }),

  // 267 — Matchmaking
  pack({
    slug: 'ref-decouple-matchmaking',
    title: 'Game Matchmaking Rules',
    difficulty: 'medium',
    order: 267,
    description:
      'Matchmaker hard-codes skill and region matching with if/else. Introduce a MatchingStrategy so rules can be swapped per queue.',
    tags: ['matchmaking', 'strategy', 'gaming', 'decouple'],
    scenario: 'decouple',
    nodes: [
      node('n1', 'el-matchmaker', 'Matchmaker', pos(1, 0), [
        'enqueue',
        'findMatch',
        'matchBySkill',
        'matchByRegion',
        'matchHybrid',
        'createLobby',
      ], [
        { name: 'mode', type: 'String' },
        { name: 'queue', type: 'List<PlayerTicket>' },
      ]),
      node('n2', 'el-ticket', 'PlayerTicket', pos(2, 0), ['getSkillRating', 'getRegion'], [
        { name: 'skillRating', type: 'int' },
        { name: 'region', type: 'String' },
      ]),
      node('n3', 'el-gameclient', 'GameClient', pos(0, 0), ['clickPlay']),
      node('n4', 'el-lobbysvc', 'LobbyService', pos(1, 1), ['openLobby', 'addPlayers']),
      node('n5', 'el-pingsvc', 'PingService', pos(2, 1), ['measureLatency']),
      node('n6', 'el-matchlog', 'MatchHistory', pos(0, 1), ['recordMatch']),
    ],
    edges: [
      edge('e1', 'ed-client-mm', 'n3', 'n1', 'dependency', 'right', 'left'),
      edge('e2', 'ed-mm-ticket', 'n1', 'n2', 'association', 'right', 'left'),
      edge('e3', 'ed-mm-lobby', 'n1', 'n4'),
      edge('e4', 'ed-mm-ping', 'n1', 'n5'),
      edge('e5', 'ed-mm-hist', 'n1', 'n6'),
    ],
    briefing: brief(
      'Matchmaker.findMatch() switches on a mode string and calls matchBySkill, matchByRegion, or matchHybrid. All matching rules sit in the same class as queue management and lobby creation.',
      'New queue types (ranked, party, low-latency) force edits to findMatch and the Matchmaker class. Rules cannot be unit-tested or swapped in isolation.',
      'Extract matching rules behind an interchangeable strategy. Matchmaker should manage the queue and lobbies and ask the strategy who matches. Existing skill/region/hybrid behavior must remain.',
      'Look at the mode attribute and the three match* methods. What is the common question each one answers?',
    ),
    requirements: [
      'Queue players with skill and region data',
      'Match by skill',
      'Match by region/latency',
      'Create a lobby and record match history',
    ],
    flows: [
      {
        id: 'find-match',
        label: 'Find Match',
        steps: ['Player clicks play', 'Enqueue ticket', 'Strategy selects opponents', 'Create lobby'],
        mustKeepElementNames: ['Matchmaker', 'PlayerTicket', 'GameClient'],
        mustReach: [
          { from: 'GameClient', to: 'Matchmaker' },
          { from: 'Matchmaker', to: 'LobbyService' },
        ],
        mustHavePathTopics: ['match', 'strategy', 'lobby'],
      },
      {
        id: 'region-match',
        label: 'Region Match',
        steps: ['Measure latency', 'Prefer same region', 'Create lobby'],
        mustReach: [
          { from: 'Matchmaker', to: 'PingService' },
          { from: 'Matchmaker', to: 'LobbyService' },
        ],
        mustHavePathTopics: ['region', 'latency', 'strategy'],
      },
      {
        id: 'record-match',
        label: 'Record Match',
        steps: ['Lobby formed', 'Write to match history'],
        mustReach: [{ from: 'Matchmaker', to: 'MatchHistory' }],
        mustHavePathTopics: ['history', 'match'],
      },
    ],
    forbidDeleteElementNames: ['Matchmaker', 'PlayerTicket', 'GameClient', 'LobbyService'],
    modelHints: ['MatchingStrategy interface', 'SkillStrategy / RegionStrategy / HybridStrategy', 'Inject strategy per queue'],
  }),
]
