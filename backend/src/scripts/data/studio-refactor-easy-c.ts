import { pack, node, edge, pos, type RefactorPackSeed } from '../seed-studio-refactor-lib'

/** Easy refactor packs — orders 222–233. */
export const EASY_C: RefactorPackSeed[] = [
  // 222 — extract Leaderboard
  pack({
    slug: 'ref-extract-leaderboard-rank',
    title: 'Leaderboard Rank Update',
    difficulty: 'easy',
    order: 222,
    description: 'GameService mixes score updates with rank rebuilding. Extract a Leaderboard.',
    tags: ['extract', 'srp', 'gaming', 'easy'],
    scenario: 'extract',
    nodes: [
      node('n1', 'el-game-ctrl', 'GameController', pos(1, 0), ['submitScore'], []),
      node('n2', 'el-game-svc', 'GameService', pos(1, 1), [
        'updateScore',
        'rebuildRanks',
        'getTopPlayers',
        'sortPlayersByScore',
      ], [{ name: 'players', type: 'Map<string, number>' }]),
      node('n3', 'el-player-repo', 'PlayerRepository', pos(0, 2), ['findById', 'save'], []),
      node('n4', 'el-score-store', 'ScoreStore', pos(2, 2), ['writeScore', 'readAll'], []),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2'),
      edge('e2', 'el-e2', 'n2', 'n3'),
      edge('e3', 'el-e3', 'n2', 'n4'),
    ],
    briefing:
      'What you are looking at\n' +
      'GameService records a new score and also rebuilds the whole ranking table, including sorting and top-N queries.\n\n' +
      'Your goal\n' +
      'Pull ranking into its own collaborator (for example Leaderboard) so GameService only coordinates score updates.\n\n' +
      'Where to start\n' +
      'Look at rebuildRanks, sortPlayersByScore and getTopPlayers. They change for a different reason than updateScore.',
    requirements: [
      'Scores can still be submitted and persisted',
      'Ranks can still be rebuilt and top players queried',
      'Ranking logic lives outside GameService',
    ],
    flows: [
      {
        id: 'submit-score',
        label: 'Submit score',
        steps: ['Controller submits score', 'Score is stored', 'Ranks are refreshed'],
        mustKeepElementNames: ['GameController', 'GameService'],
        mustReach: [{ from: 'GameController', to: 'ScoreStore' }],
        mustHavePathTopics: ['score', 'rank', 'leaderboard'],
      },
    ],
    forbidDeleteElementNames: ['GameController', 'GameService', 'ScoreStore'],
  }),

  // 223 — decouple SES
  pack({
    slug: 'ref-decouple-ses-email',
    title: 'Campaign SES Binding',
    difficulty: 'easy',
    order: 223,
    description: 'CampaignService is hard-wired to AmazonSES. Introduce an EmailPort.',
    tags: ['decouple', 'ports-adapters', 'email', 'easy'],
    scenario: 'decouple',
    nodes: [
      node('n1', 'el-campaign-ctrl', 'CampaignController', pos(1, 0), ['launch'], []),
      node('n2', 'el-campaign-svc', 'CampaignService', pos(1, 1), [
        'sendCampaign',
        'buildMessage',
        'trackDelivery',
      ], [{ name: 'ses', type: 'AmazonSES' }]),
      node('n3', 'el-ses', 'AmazonSES', pos(0, 2), [
        { name: 'sendRawEmail', params: [{ name: 'payload', type: 'SesPayload' }] },
        'configureRegion',
      ], [{ name: 'accessKey', type: 'string' }]),
      node('n4', 'el-subscriber-repo', 'SubscriberRepository', pos(2, 2), ['findActive'], []),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2'),
      edge('e2', 'el-e2', 'n2', 'n3'),
      edge('e3', 'el-e3', 'n2', 'n4'),
    ],
    briefing:
      'What you are looking at\n' +
      'CampaignService calls AmazonSES directly, so switching to another email provider (or testing without AWS) means editing campaign logic.\n\n' +
      'Your goal\n' +
      'Make CampaignService depend on an abstraction such as EmailPort, with AmazonSES as one implementation.\n\n' +
      'Where to start\n' +
      'Follow the arrow from CampaignService to AmazonSES and ask what the service really needs: "send an email".',
    requirements: [
      'Campaigns can still be sent to active subscribers',
      'AmazonSES remains available as an implementation',
      'CampaignService no longer depends on AmazonSES directly',
    ],
    flows: [
      {
        id: 'send-campaign',
        label: 'Send campaign',
        steps: ['Load subscribers', 'Build message', 'Send via email provider'],
        mustKeepElementNames: ['CampaignService', 'AmazonSES'],
        mustReach: [{ from: 'CampaignService', to: 'SubscriberRepository' }],
        mustHavePathTopics: ['email', 'port', 'ses'],
      },
    ],
    forbidDeleteElementNames: ['CampaignService', 'AmazonSES', 'SubscriberRepository'],
  }),

  // 224 — extract CouponEngine
  pack({
    slug: 'ref-extract-coupon-rules',
    title: 'Cart Coupon Rules',
    difficulty: 'easy',
    order: 224,
    description: 'Cart.applyCoupon is a long if/else chain. Extract a CouponEngine.',
    tags: ['extract', 'conditionals', 'ecommerce', 'easy'],
    scenario: 'extract',
    nodes: [
      node('n1', 'el-checkout-ctrl', 'CheckoutController', pos(1, 0), ['applyCode'], []),
      node('n2', 'el-cart', 'Cart', pos(1, 1), [
        { name: 'applyCoupon', params: [{ name: 'code', type: 'string' }] },
        'addItem',
        'getTotal',
        'applyPercentOff',
        'applyFlatOff',
        'applyFreeShipping',
      ], [
        { name: 'items', type: 'CartItem[]' },
        { name: 'discount', type: 'number' },
      ]),
      node('n3', 'el-coupon-repo', 'CouponRepository', pos(0, 2), ['findByCode', 'markRedeemed'], []),
      node('n4', 'el-cart-item', 'CartItem', pos(2, 2), ['getPrice'], [{ name: 'sku', type: 'string' }]),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2'),
      edge('e2', 'el-e2', 'n2', 'n3'),
      edge('e3', 'el-e3', 'n2', 'n4', 'composition'),
    ],
    briefing:
      'What you are looking at\n' +
      'Cart.applyCoupon branches on coupon type with if/else and has helper methods for each discount style, mixing cart state with discount rules.\n\n' +
      'Your goal\n' +
      'Move coupon evaluation into a CouponEngine so Cart only holds items and asks the engine for a discount.\n\n' +
      'Where to start\n' +
      'Group applyPercentOff, applyFlatOff and applyFreeShipping. They are rules, not cart behavior.',
    requirements: [
      'Coupons can still be applied to a cart',
      'Cart can still add items and compute totals',
      'Coupon rules live outside Cart',
    ],
    flows: [
      {
        id: 'apply-coupon',
        label: 'Apply coupon',
        steps: ['Customer enters code', 'Coupon is looked up', 'Discount is calculated', 'Cart total updates'],
        mustKeepElementNames: ['Cart', 'CouponRepository'],
        mustReach: [{ from: 'CheckoutController', to: 'CouponRepository' }],
        mustHavePathTopics: ['coupon', 'discount', 'engine'],
      },
    ],
    forbidDeleteElementNames: ['Cart', 'CouponRepository', 'CartItem'],
  }),

  // 225 — split appointment SMS
  pack({
    slug: 'ref-split-appointment-sms',
    title: 'Clinic Appointment SMS',
    difficulty: 'easy',
    order: 225,
    description: 'AppointmentService both books slots and sends SMS. Extract a Notifier.',
    tags: ['extract', 'srp', 'healthcare', 'easy'],
    scenario: 'extract',
    nodes: [
      node('n1', 'el-appt-ctrl', 'AppointmentController', pos(1, 0), ['book', 'cancel'], []),
      node('n2', 'el-appt-svc', 'AppointmentService', pos(1, 1), [
        'book',
        'cancel',
        'sendSms',
        'formatReminder',
      ], [{ name: 'smsGateway', type: 'TwilioClient' }]),
      node('n3', 'el-slot-repo', 'SlotRepository', pos(0, 2), ['reserve', 'release'], []),
      node('n4', 'el-twilio', 'TwilioClient', pos(2, 2), ['send'], [{ name: 'authToken', type: 'string' }]),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2'),
      edge('e2', 'el-e2', 'n2', 'n3'),
      edge('e3', 'el-e3', 'n2', 'n4'),
    ],
    briefing:
      'What you are looking at\n' +
      'AppointmentService reserves slots and also formats and sends SMS reminders through Twilio.\n\n' +
      'Your goal\n' +
      'Extract notification concerns (for example a Notifier) so booking logic does not know how messages are sent.\n\n' +
      'Where to start\n' +
      'sendSms and formatReminder have nothing to do with slot availability.',
    requirements: [
      'Appointments can still be booked and cancelled',
      'Patients still receive an SMS',
      'Messaging logic lives in its own class',
    ],
    flows: [
      {
        id: 'book',
        label: 'Book appointment',
        steps: ['Reserve slot', 'Notify patient'],
        mustKeepElementNames: ['AppointmentService', 'SlotRepository'],
        mustReach: [{ from: 'AppointmentService', to: 'SlotRepository' }],
        mustHavePathTopics: ['book', 'sms', 'notif'],
      },
    ],
    forbidDeleteElementNames: ['AppointmentService', 'SlotRepository', 'TwilioClient'],
  }),

  // 226 — decouple GCS
  pack({
    slug: 'ref-decouple-gcs-storage',
    title: 'Doc Store GCS Binding',
    difficulty: 'easy',
    order: 226,
    description: 'DocumentStore is hard-wired to Google Cloud Storage. Introduce a StoragePort.',
    tags: ['decouple', 'ports-adapters', 'storage', 'easy'],
    scenario: 'decouple',
    nodes: [
      node('n1', 'el-doc-api', 'DocumentApi', pos(1, 0), ['upload', 'download'], []),
      node('n2', 'el-doc-store', 'DocumentStore', pos(1, 1), [
        'save',
        'load',
        'buildBucketPath',
      ], [{ name: 'gcs', type: 'GoogleCloudStorage' }]),
      node('n3', 'el-gcs', 'GoogleCloudStorage', pos(0, 2), [
        'uploadObject',
        'downloadObject',
        'authenticate',
      ], [{ name: 'bucketName', type: 'string' }]),
      node('n4', 'el-doc-meta', 'DocumentMetadataRepo', pos(2, 2), ['saveMeta', 'findMeta'], []),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2'),
      edge('e2', 'el-e2', 'n2', 'n3'),
      edge('e3', 'el-e3', 'n2', 'n4'),
    ],
    briefing:
      'What you are looking at\n' +
      'DocumentStore calls GoogleCloudStorage directly. Moving to S3 or local disk for tests would mean rewriting DocumentStore.\n\n' +
      'Your goal\n' +
      'Hide the vendor behind a StoragePort that DocumentStore depends on.\n\n' +
      'Where to start\n' +
      'Compare save/load with uploadObject/downloadObject. They are the same idea at different abstraction levels.',
    requirements: [
      'Documents can still be uploaded and downloaded',
      'Metadata is still persisted',
      'DocumentStore no longer depends on GoogleCloudStorage directly',
    ],
    flows: [
      {
        id: 'upload',
        label: 'Upload document',
        steps: ['API receives file', 'Bytes stored', 'Metadata saved'],
        mustKeepElementNames: ['DocumentStore', 'GoogleCloudStorage'],
        mustReach: [{ from: 'DocumentApi', to: 'DocumentMetadataRepo' }],
        mustHavePathTopics: ['storage', 'port', 'upload'],
      },
    ],
    forbidDeleteElementNames: ['DocumentApi', 'DocumentStore', 'GoogleCloudStorage'],
  }),

  // 227 — extract TallyService
  pack({
    slug: 'ref-extract-poll-tally',
    title: 'Poll Tally Logic',
    difficulty: 'easy',
    order: 227,
    description: 'PollService records votes and computes tallies. Extract a TallyService.',
    tags: ['extract', 'srp', 'voting', 'easy'],
    scenario: 'extract',
    nodes: [
      node('n1', 'el-poll-ctrl', 'PollController', pos(1, 0), ['castVote', 'getResults'], []),
      node('n2', 'el-poll-svc', 'PollService', pos(1, 1), [
        'vote',
        'tally',
        'countByOption',
        'computePercentages',
        'determineWinner',
      ], [{ name: 'votes', type: 'Vote[]' }]),
      node('n3', 'el-vote-repo', 'VoteRepository', pos(0, 2), ['insert', 'findByPoll'], []),
      node('n4', 'el-poll-repo', 'PollRepository', pos(2, 2), ['findById'], []),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2'),
      edge('e2', 'el-e2', 'n2', 'n3'),
      edge('e3', 'el-e3', 'n2', 'n4'),
    ],
    briefing:
      'What you are looking at\n' +
      'PollService accepts votes and also owns all the counting, percentage and winner logic.\n\n' +
      'Your goal\n' +
      'Extract a TallyService so PollService focuses on recording votes and delegates result computation.\n\n' +
      'Where to start\n' +
      'countByOption, computePercentages and determineWinner are pure calculation.',
    requirements: [
      'Votes can still be cast',
      'Results can still be tallied',
      'Tally calculation is not inside PollService',
    ],
    flows: [
      {
        id: 'vote-and-results',
        label: 'Vote and view results',
        steps: ['Cast vote', 'Persist vote', 'Compute tally for display'],
        mustKeepElementNames: ['PollService', 'VoteRepository'],
        mustReach: [{ from: 'PollController', to: 'VoteRepository' }],
        mustHavePathTopics: ['vote', 'tally', 'result'],
      },
    ],
    forbidDeleteElementNames: ['PollController', 'PollService', 'VoteRepository'],
  }),

  // 228 — cleanup duplicate mappers
  pack({
    slug: 'ref-cleanup-duplicate-mappers',
    title: 'DTO Mapper Duplication',
    difficulty: 'easy',
    order: 228,
    description: 'OrderController and OrderService both map entities to DTOs. Extract one Mapper.',
    tags: ['cleanup', 'duplication', 'dto', 'easy'],
    scenario: 'cleanup',
    nodes: [
      node('n1', 'el-order-ctrl', 'OrderController', pos(0, 0), [
        'getOrder',
        'toOrderDto',
        'toLineItemDto',
      ], []),
      node('n2', 'el-order-svc', 'OrderService', pos(2, 0), [
        'findOrder',
        'exportOrders',
        'toOrderDto',
        'toLineItemDto',
      ], []),
      node('n3', 'el-order-repo', 'OrderRepository', pos(1, 1), ['findById', 'findAll'], []),
      node('n4', 'el-order-dto', 'OrderDto', pos(0, 2), [], [
        { name: 'id', type: 'string' },
        { name: 'total', type: 'number' },
      ]),
      node('n5', 'el-order-entity', 'Order', pos(2, 2), ['getTotal'], [{ name: 'id', type: 'string' }]),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2', 'association', 'right', 'left'),
      edge('e2', 'el-e2', 'n2', 'n3'),
      edge('e3', 'el-e3', 'n1', 'n4'),
      edge('e4', 'el-e4', 'n2', 'n5'),
    ],
    briefing:
      'What you are looking at\n' +
      'OrderController and OrderService each define their own toOrderDto and toLineItemDto. Fixes in one place are easily missed in the other.\n\n' +
      'Your goal\n' +
      'Create a single Mapper that both use, removing the duplicated mapping code.\n\n' +
      'Where to start\n' +
      'Compare the method names on the two classes. Identical names are a strong duplication smell.',
    requirements: [
      'Orders can still be fetched as DTOs',
      'Exports still produce DTOs',
      'Mapping logic exists in exactly one place',
    ],
    flows: [
      {
        id: 'get-order',
        label: 'Get order',
        steps: ['Controller requests order', 'Service loads entity', 'Entity mapped to DTO'],
        mustKeepElementNames: ['OrderController', 'OrderService', 'OrderRepository'],
        mustReach: [{ from: 'OrderController', to: 'OrderRepository' }],
        mustHavePathTopics: ['order', 'dto', 'mapper'],
      },
    ],
    forbidDeleteElementNames: ['OrderController', 'OrderService', 'OrderRepository', 'OrderDto'],
  }),

  // 229 — decouple Slack
  pack({
    slug: 'ref-decouple-slack-webhook',
    title: 'Alert Slack Binding',
    difficulty: 'easy',
    order: 229,
    description: 'AlertService posts straight to SlackWebhook. Introduce an AlertChannelPort.',
    tags: ['decouple', 'ports-adapters', 'alerting', 'easy'],
    scenario: 'decouple',
    nodes: [
      node('n1', 'el-monitor', 'HealthMonitor', pos(1, 0), ['check'], []),
      node('n2', 'el-alert-svc', 'AlertService', pos(1, 1), [
        'raise',
        'formatSlackBlocks',
        'deduplicate',
      ], [{ name: 'webhook', type: 'SlackWebhook' }]),
      node('n3', 'el-slack', 'SlackWebhook', pos(0, 2), [
        { name: 'postMessage', params: [{ name: 'blocks', type: 'SlackBlock[]' }] },
      ], [{ name: 'url', type: 'string' }]),
      node('n4', 'el-alert-log', 'AlertLog', pos(2, 2), ['record'], []),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2'),
      edge('e2', 'el-e2', 'n2', 'n3'),
      edge('e3', 'el-e3', 'n2', 'n4'),
    ],
    briefing:
      'What you are looking at\n' +
      'AlertService builds Slack-specific blocks and posts to SlackWebhook directly. Adding email or PagerDuty would mean editing alert logic.\n\n' +
      'Your goal\n' +
      'Define an AlertChannelPort and have AlertService depend on it instead of Slack.\n\n' +
      'Where to start\n' +
      'formatSlackBlocks leaks vendor details into a high-level service.',
    requirements: [
      'Alerts can still be raised and logged',
      'Slack remains a working channel',
      'AlertService does not depend on SlackWebhook directly',
    ],
    flows: [
      {
        id: 'raise-alert',
        label: 'Raise alert',
        steps: ['Monitor detects issue', 'Alert deduplicated', 'Sent to a channel', 'Recorded'],
        mustKeepElementNames: ['AlertService', 'SlackWebhook', 'AlertLog'],
        mustReach: [{ from: 'HealthMonitor', to: 'AlertLog' }],
        mustHavePathTopics: ['alert', 'channel', 'slack'],
      },
    ],
    forbidDeleteElementNames: ['HealthMonitor', 'AlertService', 'SlackWebhook'],
  }),

  // 230 — extract ShippingQuote
  pack({
    slug: 'ref-extract-shipping-quote',
    title: 'Checkout Shipping Quote',
    difficulty: 'easy',
    order: 230,
    description: 'Checkout.quoteShipping is inline carrier logic. Extract a ShippingQuote component.',
    tags: ['extract', 'srp', 'ecommerce', 'easy'],
    scenario: 'extract',
    nodes: [
      node('n1', 'el-checkout-ui', 'CheckoutPage', pos(1, 0), ['submit'], []),
      node('n2', 'el-checkout', 'Checkout', pos(1, 1), [
        'placeOrder',
        'quoteShipping',
        'calcWeightSurcharge',
        'calcZoneRate',
        'applyExpressFee',
      ], [{ name: 'cart', type: 'Cart' }]),
      node('n3', 'el-cart2', 'Cart', pos(0, 2), ['getItems', 'getWeight'], []),
      node('n4', 'el-address-svc', 'AddressService', pos(2, 2), ['resolveZone'], []),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2'),
      edge('e2', 'el-e2', 'n2', 'n3'),
      edge('e3', 'el-e3', 'n2', 'n4'),
    ],
    briefing:
      'What you are looking at\n' +
      'Checkout computes shipping prices itself: zone rates, weight surcharges and express fees are all inline.\n\n' +
      'Your goal\n' +
      'Extract a ShippingQuote class so Checkout simply asks for a price.\n\n' +
      'Where to start\n' +
      'The calc* and apply* helpers all feed quoteShipping.',
    requirements: [
      'Orders can still be placed',
      'Shipping quotes are still produced from cart and address',
      'Pricing rules are outside Checkout',
    ],
    flows: [
      {
        id: 'quote-shipping',
        label: 'Quote shipping',
        steps: ['Read cart weight', 'Resolve zone', 'Compute shipping price'],
        mustKeepElementNames: ['Checkout', 'Cart', 'AddressService'],
        mustReach: [{ from: 'Checkout', to: 'AddressService' }],
        mustHavePathTopics: ['shipping', 'quote', 'zone'],
      },
    ],
    forbidDeleteElementNames: ['CheckoutPage', 'Checkout', 'Cart', 'AddressService'],
  }),

  // 231 — split review moderation
  pack({
    slug: 'ref-split-review-moderation',
    title: 'Product Review Moderation',
    difficulty: 'easy',
    order: 231,
    description: 'Product.addReview also performs moderation. Extract a ModerationService.',
    tags: ['extract', 'srp', 'moderation', 'easy'],
    scenario: 'extract',
    nodes: [
      node('n1', 'el-review-ctrl', 'ReviewController', pos(1, 0), ['postReview'], []),
      node('n2', 'el-product', 'Product', pos(1, 1), [
        'addReview',
        'moderate',
        'containsProfanity',
        'looksLikeSpam',
        'getAverageRating',
      ], [{ name: 'reviews', type: 'Review[]' }]),
      node('n3', 'el-review', 'Review', pos(0, 2), ['getText'], [
        { name: 'rating', type: 'number' },
        { name: 'text', type: 'string' },
      ]),
      node('n4', 'el-review-repo', 'ReviewRepository', pos(2, 2), ['save', 'flag'], []),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2'),
      edge('e2', 'el-e2', 'n2', 'n3', 'aggregation'),
      edge('e3', 'el-e3', 'n2', 'n4'),
    ],
    briefing:
      'What you are looking at\n' +
      'Product holds its reviews and also decides whether a review is spam or profane.\n\n' +
      'Your goal\n' +
      'Extract a ModerationService so Product no longer contains content-checking rules.\n\n' +
      'Where to start\n' +
      'Moderation rules change with policy; a product domain object should not.',
    requirements: [
      'Reviews can still be added and saved',
      'Bad reviews can still be flagged',
      'Moderation rules live outside Product',
    ],
    flows: [
      {
        id: 'add-review',
        label: 'Add review',
        steps: ['Customer posts review', 'Content moderated', 'Review saved or flagged'],
        mustKeepElementNames: ['Product', 'Review', 'ReviewRepository'],
        mustReach: [{ from: 'ReviewController', to: 'ReviewRepository' }],
        mustHavePathTopics: ['review', 'moderat', 'flag'],
      },
    ],
    forbidDeleteElementNames: ['ReviewController', 'Product', 'Review', 'ReviewRepository'],
  }),

  // 232 — decouple Elasticsearch
  pack({
    slug: 'ref-decouple-elasticsearch',
    title: 'Catalog ES Binding',
    difficulty: 'easy',
    order: 232,
    description: 'CatalogService talks to Elasticsearch directly. Introduce a SearchPort.',
    tags: ['decouple', 'ports-adapters', 'search', 'easy'],
    scenario: 'decouple',
    nodes: [
      node('n1', 'el-catalog-api', 'CatalogApi', pos(1, 0), ['search', 'getProduct'], []),
      node('n2', 'el-catalog-svc', 'CatalogService', pos(1, 1), [
        'searchProducts',
        'indexProduct',
        'buildEsQuery',
      ], [{ name: 'client', type: 'ElasticsearchClient' }]),
      node('n3', 'el-es', 'ElasticsearchClient', pos(0, 2), [
        'executeQuery',
        'indexDocument',
        'refreshIndex',
      ], [{ name: 'host', type: 'string' }]),
      node('n4', 'el-product-repo', 'ProductRepository', pos(2, 2), ['findById', 'save'], []),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2'),
      edge('e2', 'el-e2', 'n2', 'n3'),
      edge('e3', 'el-e3', 'n2', 'n4'),
    ],
    briefing:
      'What you are looking at\n' +
      'CatalogService builds Elasticsearch queries and calls the client directly, tying domain code to one search technology.\n\n' +
      'Your goal\n' +
      'Introduce a SearchPort so CatalogService only says "search" and "index", with Elasticsearch as an adapter.\n\n' +
      'Where to start\n' +
      'buildEsQuery is a clue that vendor details have leaked upward.',
    requirements: [
      'Products can still be searched and indexed',
      'Product lookup by id still works',
      'CatalogService does not depend on ElasticsearchClient directly',
    ],
    flows: [
      {
        id: 'search',
        label: 'Search products',
        steps: ['API receives query', 'Search backend queried', 'Results returned'],
        mustKeepElementNames: ['CatalogService', 'ElasticsearchClient', 'ProductRepository'],
        mustReach: [{ from: 'CatalogApi', to: 'ProductRepository' }],
        mustHavePathTopics: ['search', 'port', 'index'],
      },
    ],
    forbidDeleteElementNames: ['CatalogApi', 'CatalogService', 'ElasticsearchClient', 'ProductRepository'],
  }),

  // 233 — subscription renewal
  pack({
    slug: 'ref-extract-subscription-renew',
    title: 'Subscription Renew Path',
    difficulty: 'easy',
    order: 233,
    description: 'SubscriptionService.renew charges, updates and notifies. Extract a RenewalOrchestrator or thinner services.',
    tags: ['extract', 'orchestration', 'billing', 'easy'],
    scenario: 'extract',
    nodes: [
      node('n1', 'el-renewal-job', 'RenewalJob', pos(1, 0), ['runDaily'], []),
      node('n2', 'el-sub-svc', 'SubscriptionService', pos(1, 1), [
        'renew',
        'chargeCustomer',
        'extendPeriod',
        'sendReceipt',
        'handleChargeFailure',
      ], [{ name: 'gateway', type: 'PaymentGateway' }]),
      node('n3', 'el-pay-gw', 'PaymentGateway', pos(0, 2), ['charge'], []),
      node('n4', 'el-sub-repo', 'SubscriptionRepository', pos(1, 2), ['findDue', 'save'], []),
      node('n5', 'el-mailer', 'Mailer', pos(2, 2), ['send'], []),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2'),
      edge('e2', 'el-e2', 'n2', 'n3'),
      edge('e3', 'el-e3', 'n2', 'n4'),
      edge('e4', 'el-e4', 'n2', 'n5'),
    ],
    briefing:
      'What you are looking at\n' +
      'SubscriptionService.renew handles payment, subscription state and customer email in one class.\n\n' +
      'Your goal\n' +
      'Introduce a RenewalOrchestrator (or split into thinner services) so each class owns one step of the renewal path.\n\n' +
      'Where to start\n' +
      'List renew\'s steps: charge, extend, notify. Which are domain rules, and which are coordination?',
    requirements: [
      'Due subscriptions can still be renewed',
      'Customers are still charged and receive receipts',
      'Failures are still handled somewhere',
    ],
    flows: [
      {
        id: 'renew',
        label: 'Renew subscription',
        steps: ['Find due subscriptions', 'Charge customer', 'Extend period', 'Send receipt'],
        mustKeepElementNames: ['RenewalJob', 'PaymentGateway', 'SubscriptionRepository', 'Mailer'],
        mustReach: [
          { from: 'RenewalJob', to: 'PaymentGateway' },
          { from: 'RenewalJob', to: 'Mailer' },
        ],
        mustHavePathTopics: ['renew', 'charge', 'notify', 'receipt'],
      },
    ],
    forbidDeleteElementNames: ['RenewalJob', 'PaymentGateway', 'SubscriptionRepository', 'Mailer'],
  }),
]
