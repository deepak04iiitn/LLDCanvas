/**
 * Design Studio "Change One Thing" packs — hard B (orders 479–489).
 */
import { pack, node, edge, pos, type ChangePackSeed } from '../seed-studio-change-lib'

function brief(going: string, problem: string, todo: string, start: string): string {
  return (
    'What’s going on\n' + going + '\n\n' +
    'The change (simple terms)\n' + problem + '\n\n' +
    'What you should do\n' + todo + '\n\n' +
    'Where to start\n' + start
  )
}

export const HARD_B: ChangePackSeed[] = [
  // ── 479 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-circuit-breaker-downstream',
    title: 'Open Circuit on Downstream Failures',
    difficulty: 'hard',
    order: 479,
    description:
      'The payment provider keeps timing out and every checkout hangs waiting on it. Stop hammering a failing dependency without breaking healthy ones.',
    tags: ['resilience', 'circuit-breaker', 'failure'],
    maxNewClasses: 5,
    nodes: [
      node('n1', 'co-cb-orders', 'OrderService', pos(1, 0), ['placeOrder', 'cancelOrder']),
      node('n2', 'co-cb-inv', 'InventoryClient', pos(0, 1), ['reserve', 'release']),
      node('n3', 'co-cb-pay', 'PaymentClient', pos(1, 1), ['authorize', 'capture']),
      node('n4', 'co-cb-ship', 'ShippingClient', pos(2, 1), ['quote', 'schedule']),
      node('n5', 'co-cb-http', 'HttpTransport', pos(1, 2), ['send']),
      node('n6', 'co-cb-metrics', 'MetricsReporter', pos(2, 2), ['increment', 'recordLatency']),
    ],
    edges: [
      edge('e1', 'ed-co-cb-1', 'n1', 'n2'),
      edge('e2', 'ed-co-cb-2', 'n1', 'n3'),
      edge('e3', 'ed-co-cb-3', 'n1', 'n4'),
      edge('e4', 'ed-co-cb-4', 'n2', 'n5'),
      edge('e5', 'ed-co-cb-5', 'n3', 'n5'),
      edge('e6', 'ed-co-cb-6', 'n4', 'n5'),
      edge('e7', 'ed-co-cb-7', 'n1', 'n6'),
    ],
    changeRequest: {
      title: 'Open Circuit on Downstream Failures',
      body:
        'When the payment provider is down, every order waits through a long timeout and retries pile up, dragging the whole service down. After a run of consecutive failures the system should stop calling the provider for a cool-off period, fail fast, then carefully probe to see whether it has recovered. Inventory and shipping calls must keep behaving exactly as they do today.',
      type: 'failure',
    },
    briefing: brief(
      'OrderService calls three downstream clients — inventory, payment and shipping — all sharing one HttpTransport. Each call simply waits for the transport and propagates any error.',
      'A failing dependency is called again and again, tying up threads. We want calls to a dependency to be short-circuited once it has failed repeatedly, and re-tried gently after a cool-off.',
      'Add a reusable protection that tracks failures and decides whether a call may proceed, and apply it to the payment path. Failed fast calls should be visible in metrics. Leave the transport and the other clients alone.',
      'PaymentClient is the one that is hurting. Wrap its calls rather than editing HttpTransport, which everyone shares.',
    ),
    constraints: [
      'Protect the payment calls only; do not change inventory or shipping behaviour',
      'Do not change HttpTransport',
      'Fail-fast rejections must be recorded in metrics',
    ],
    forbidModifyElementNames: ['HttpTransport', 'InventoryClient', 'ShippingClient'],
    expectedTouchHints: ['PaymentClient', 'CircuitBreaker', 'MetricsReporter'],
    protectedFlows: [
      {
        id: 'reserve-stock',
        label: 'Reserve Stock',
        steps: ['Place order', 'Reserve inventory over HTTP'],
        mustKeepElementNames: ['OrderService', 'InventoryClient', 'HttpTransport'],
        mustReach: [
          { from: 'OrderService', to: 'InventoryClient' },
          { from: 'InventoryClient', to: 'HttpTransport' },
        ],
        mustHavePathTopics: ['reserve', 'send'],
      },
      {
        id: 'schedule-shipping',
        label: 'Schedule Shipping',
        steps: ['Quote shipping', 'Schedule shipment'],
        mustReach: [{ from: 'OrderService', to: 'ShippingClient' }],
        mustHavePathTopics: ['shipping', 'schedule'],
      },
    ],
    newFlows: [
      {
        id: 'guarded-payment',
        label: 'Guarded Payment Call',
        steps: ['Ask breaker if call is allowed', 'Call provider or fail fast', 'Record success or failure'],
        mustReach: [
          { from: 'PaymentClient', to: 'CircuitBreaker' },
          { from: 'PaymentClient', to: 'HttpTransport' },
        ],
        mustHavePathTopics: ['circuit', 'breaker', 'failure'],
      },
      {
        id: 'fail-fast-metric',
        label: 'Record Fail-Fast Rejection',
        steps: ['Circuit open', 'Reject call', 'Increment metric'],
        mustReach: [{ from: 'CircuitBreaker', to: 'MetricsReporter' }],
        mustHavePathTopics: ['open', 'metric'],
      },
    ],
  }),

  // ── 480 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-event-replay-projection',
    title: 'Rebuild Projection From Event Stream',
    difficulty: 'hard',
    order: 480,
    description:
      'A bug corrupted the order read model. Rebuild it from the stored events without taking live traffic offline.',
    tags: ['event-sourcing', 'cqrs', 'capability', 'scale'],
    maxNewClasses: 5,
    nodes: [
      node('n1', 'co-rp-cmd', 'OrderCommandHandler', pos(1, 0), ['handle']),
      node('n2', 'co-rp-store', 'EventStore', pos(0, 1), ['append', 'readStream', 'readAll']),
      node('n3', 'co-rp-proj', 'OrderProjection', pos(1, 1), ['apply', 'getView']),
      node('n4', 'co-rp-pstore', 'ProjectionStore', pos(2, 1), ['save', 'load', 'clear']),
      node('n5', 'co-rp-pub', 'EventPublisher', pos(0, 2), ['publish']),
      node('n6', 'co-rp-query', 'OrderQueryController', pos(2, 2), ['getOrder', 'listOrders']),
    ],
    edges: [
      edge('e1', 'ed-co-rp-1', 'n1', 'n2'),
      edge('e2', 'ed-co-rp-2', 'n1', 'n5'),
      edge('e3', 'ed-co-rp-3', 'n5', 'n3'),
      edge('e4', 'ed-co-rp-4', 'n3', 'n4'),
      edge('e5', 'ed-co-rp-5', 'n6', 'n4'),
    ],
    changeRequest: {
      title: 'Rebuild Projection From Event Stream',
      body:
        'Operations needs to rebuild the order read model from scratch by replaying the full event history. Millions of events must be processed in batches, progress must survive a restart, and the query API must keep serving the existing view while the new one is being built.',
      type: 'capability',
    },
    briefing: brief(
      'Commands append events to EventStore and publish them. OrderProjection listens, updates ProjectionStore, and the query controller reads from it.',
      'There is no way to regenerate the read model. If it gets corrupted, we are stuck. We need a replay that reads the history in batches, remembers how far it got, and swaps in the rebuilt result.',
      'Add a replay mechanism that reads events from the store in order, feeds them into the projection logic, and tracks a checkpoint. Do not disturb the live write path or the query endpoints.',
      'EventStore already has readAll. The rebuilder should drive OrderProjection.apply rather than duplicating projection logic.',
    ),
    constraints: [
      'Reuse OrderProjection.apply for replay; do not duplicate projection rules',
      'Replay must be resumable from a checkpoint',
      'Live command and query flows must keep working during a rebuild',
    ],
    forbidModifyElementNames: ['OrderCommandHandler', 'OrderQueryController'],
    expectedTouchHints: ['EventStore', 'OrderProjection', 'ProjectionRebuilder', 'CheckpointStore'],
    protectedFlows: [
      {
        id: 'handle-command',
        label: 'Handle Command',
        steps: ['Handle command', 'Append event', 'Publish event'],
        mustKeepElementNames: ['OrderCommandHandler', 'EventStore'],
        mustReach: [
          { from: 'OrderCommandHandler', to: 'EventStore' },
          { from: 'OrderCommandHandler', to: 'EventPublisher' },
        ],
        mustHavePathTopics: ['handle', 'append'],
      },
      {
        id: 'live-projection',
        label: 'Live Projection Update',
        steps: ['Publish event', 'Apply to projection', 'Save view'],
        mustReach: [
          { from: 'EventPublisher', to: 'OrderProjection' },
          { from: 'OrderProjection', to: 'ProjectionStore' },
        ],
        mustHavePathTopics: ['publish', 'apply'],
      },
      {
        id: 'query-order',
        label: 'Query Order',
        steps: ['Read order view'],
        mustReach: [{ from: 'OrderQueryController', to: 'ProjectionStore' }],
        mustHavePathTopics: ['getorder', 'load'],
      },
    ],
    newFlows: [
      {
        id: 'replay-events',
        label: 'Replay Events',
        steps: ['Read batch from event store', 'Apply to projection', 'Save checkpoint'],
        mustReach: [
          { from: 'ProjectionRebuilder', to: 'EventStore' },
          { from: 'ProjectionRebuilder', to: 'OrderProjection' },
          { from: 'ProjectionRebuilder', to: 'CheckpointStore' },
        ],
        mustHavePathTopics: ['replay', 'checkpoint'],
      },
    ],
  }),

  // ── 481 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-blue-green-deploy',
    title: 'Support Blue-Green Traffic Shift',
    difficulty: 'hard',
    order: 481,
    description:
      'Deployments currently replace servers in place. Run two versions side by side and shift traffic gradually between them.',
    tags: ['deployment', 'routing', 'scale', 'variation'],
    maxNewClasses: 5,
    nodes: [
      node('n1', 'co-bg-router', 'TrafficRouter', pos(1, 0), ['route']),
      node('n2', 'co-bg-lb', 'LoadBalancer', pos(0, 1), ['pick', 'markUnhealthy']),
      node('n3', 'co-bg-reg', 'ServiceRegistry', pos(1, 1), ['register', 'lookup', 'deregister']),
      node('n4', 'co-bg-health', 'HealthChecker', pos(2, 1), ['check']),
      node('n5', 'co-bg-deploy', 'DeployController', pos(0, 2), ['deploy', 'rollback']),
      node('n6', 'co-bg-config', 'ConfigStore', pos(2, 2), ['get', 'set']),
    ],
    edges: [
      edge('e1', 'ed-co-bg-1', 'n1', 'n2'),
      edge('e2', 'ed-co-bg-2', 'n2', 'n3'),
      edge('e3', 'ed-co-bg-3', 'n4', 'n3'),
      edge('e4', 'ed-co-bg-4', 'n5', 'n3'),
      edge('e5', 'ed-co-bg-5', 'n5', 'n6'),
    ],
    changeRequest: {
      title: 'Support Blue-Green Traffic Shift',
      body:
        'Release engineering wants to bring up a new version (green) next to the live one (blue), send a small percentage of traffic to it, increase gradually, and flip back instantly if health degrades. Requests from the same user should stay on the same version during a rollout.',
      type: 'variation',
    },
    briefing: brief(
      'DeployController registers instances in ServiceRegistry. TrafficRouter hands requests to a LoadBalancer, which picks any healthy instance.',
      'Today every instance is treated the same, so a new version replaces the old one all at once. We want two named groups of instances and a controlled split of traffic between them.',
      'Introduce the idea of a release slot and a traffic split, make the router honour it, and let the deploy controller change the split. Keep plain routing and health checking working for services that are not mid-rollout.',
      'The decision about which slot gets a request belongs before the LoadBalancer picks an instance, not inside it.',
    ),
    constraints: [
      'Services without a rollout must route exactly as before',
      'Keep a user on a single slot during a rollout',
      'Rollback must be a split change, not a redeploy',
    ],
    forbidModifyElementNames: ['HealthChecker', 'ConfigStore'],
    expectedTouchHints: ['TrafficRouter', 'DeployController', 'TrafficSplit', 'ReleaseSlot'],
    protectedFlows: [
      {
        id: 'route-request',
        label: 'Route Request',
        steps: ['Route request', 'Pick instance', 'Lookup registry'],
        mustKeepElementNames: ['TrafficRouter', 'LoadBalancer', 'ServiceRegistry'],
        mustReach: [
          { from: 'TrafficRouter', to: 'LoadBalancer' },
          { from: 'LoadBalancer', to: 'ServiceRegistry' },
        ],
        mustHavePathTopics: ['route', 'pick', 'lookup'],
      },
      {
        id: 'health-check',
        label: 'Health Check',
        steps: ['Check instances', 'Update registry'],
        mustReach: [{ from: 'HealthChecker', to: 'ServiceRegistry' }],
        mustHavePathTopics: ['check'],
      },
    ],
    newFlows: [
      {
        id: 'split-traffic',
        label: 'Split Traffic Between Slots',
        steps: ['Read traffic split', 'Choose blue or green', 'Pick instance in slot'],
        mustReach: [
          { from: 'TrafficRouter', to: 'TrafficSplit' },
          { from: 'TrafficRouter', to: 'LoadBalancer' },
        ],
        mustHavePathTopics: ['split', 'slot'],
      },
      {
        id: 'shift-traffic',
        label: 'Shift Traffic',
        steps: ['Deploy green', 'Raise percentage', 'Rollback if unhealthy'],
        mustReach: [{ from: 'DeployController', to: 'TrafficSplit' }],
        mustHavePathTopics: ['shift', 'rollback'],
      },
    ],
  }),

  // ── 482 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-gdpr-cross-region-purge',
    title: 'Purge EU User Data From All Regions',
    difficulty: 'hard',
    order: 482,
    description:
      'EU users data is replicated to other regions, backups and analytics. An erasure request must reach every copy and prove it did.',
    tags: ['gdpr', 'privacy', 'multi-region', 'constraint'],
    maxNewClasses: 5,
    nodes: [
      node('n1', 'co-xr-priv', 'PrivacyService', pos(1, 0), ['requestErasure', 'getStatus']),
      node('n2', 'co-xr-resolver', 'RegionResolver', pos(0, 1), ['homeRegion', 'replicaRegions']),
      node('n3', 'co-xr-repo', 'RegionalUserRepository', pos(1, 1), ['findById', 'delete']),
      node('n4', 'co-xr-backup', 'BackupArchive', pos(2, 1), ['snapshot', 'restore']),
      node('n5', 'co-xr-search', 'SearchIndex', pos(0, 2), ['indexUser', 'removeDoc']),
      node('n6', 'co-xr-wh', 'AnalyticsWarehouse', pos(1, 2), ['ingest', 'deleteByUser']),
      node('n7', 'co-xr-audit', 'AuditLog', pos(2, 2), ['record']),
    ],
    edges: [
      edge('e1', 'ed-co-xr-1', 'n1', 'n2'),
      edge('e2', 'ed-co-xr-2', 'n1', 'n3'),
      edge('e3', 'ed-co-xr-3', 'n1', 'n5'),
      edge('e4', 'ed-co-xr-4', 'n1', 'n6'),
      edge('e5', 'ed-co-xr-5', 'n1', 'n7'),
      edge('e6', 'ed-co-xr-6', 'n4', 'n3'),
    ],
    changeRequest: {
      title: 'Purge EU User Data From All Regions',
      body:
        'A deletion request from an EU user must remove their data from the home region, every replica region, the search index and the warehouse. Backups cannot be edited, so erased users must be remembered and skipped if a backup is ever restored. If one region is unreachable the purge must be retried and the request kept open until every region confirms.',
      type: 'constraint',
    },
    briefing: brief(
      'PrivacyService can already erase a user from the home repository and the search index, and it writes to the audit log. Replica regions and backups are not covered.',
      'Data copies live in several regions plus an immutable backup archive. A purge that misses one copy is a legal problem, and a restored backup could bring an erased user back.',
      'Add a coordinated purge that visits each region, tracks which have confirmed, retries the ones that have not, and keeps a list of erased users that restore must respect. Do not weaken the existing home-region erasure.',
      'Start with PrivacyService.requestErasure — it should hand the multi-region work to a dedicated owner, not loop over regions itself.',
    ),
    constraints: [
      'A request is complete only after every region confirms',
      'Restoring a backup must never resurrect an erased user',
      'Every region confirmation is audited',
    ],
    forbidModifyElementNames: ['SearchIndex', 'AnalyticsWarehouse'],
    expectedTouchHints: ['PrivacyService', 'BackupArchive', 'RegionPurgeCoordinator', 'ErasureTombstones'],
    protectedFlows: [
      {
        id: 'home-erasure',
        label: 'Home Region Erasure',
        steps: ['Request erasure', 'Delete from home repository', 'Remove from search'],
        mustKeepElementNames: ['PrivacyService', 'RegionalUserRepository'],
        mustReach: [
          { from: 'PrivacyService', to: 'RegionalUserRepository' },
          { from: 'PrivacyService', to: 'SearchIndex' },
        ],
        mustHavePathTopics: ['erasure', 'delete'],
      },
      {
        id: 'warehouse-delete',
        label: 'Warehouse Deletion',
        steps: ['Delete user rows from warehouse'],
        mustReach: [{ from: 'PrivacyService', to: 'AnalyticsWarehouse' }],
        mustHavePathTopics: ['deletebyuser'],
      },
      {
        id: 'audit-erasure',
        label: 'Audit Erasure',
        steps: ['Record erasure event'],
        mustReach: [{ from: 'PrivacyService', to: 'AuditLog' }],
        mustHavePathTopics: ['record'],
      },
    ],
    newFlows: [
      {
        id: 'multi-region-purge',
        label: 'Multi-Region Purge',
        steps: ['Resolve replica regions', 'Purge each region', 'Track confirmations and retry'],
        mustReach: [
          { from: 'PrivacyService', to: 'RegionPurgeCoordinator' },
          { from: 'RegionPurgeCoordinator', to: 'RegionResolver' },
          { from: 'RegionPurgeCoordinator', to: 'RegionalUserRepository' },
        ],
        mustHavePathTopics: ['purge', 'region', 'confirm'],
      },
      {
        id: 'restore-skip-erased',
        label: 'Restore Skips Erased Users',
        steps: ['Restore backup', 'Check erasure tombstones', 'Skip erased users'],
        mustReach: [{ from: 'BackupArchive', to: 'ErasureTombstones' }],
        mustHavePathTopics: ['restore', 'tombstone'],
      },
    ],
  }),

  // ── 483 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-optimistic-concurrency-orders',
    title: 'Detect Lost Updates on Orders',
    difficulty: 'hard',
    order: 483,
    description:
      'Two agents editing the same order silently overwrite each other. Detect conflicting writes instead of letting the last one win.',
    tags: ['concurrency', 'orders', 'failure', 'behavior'],
    maxNewClasses: 5,
    nodes: [
      node('n1', 'co-oc-ctrl', 'OrderController', pos(1, 0), ['patchOrder', 'cancelOrder']),
      node('n2', 'co-oc-svc', 'OrderService', pos(1, 1), ['updateAddress', 'cancel', 'addItem']),
      node('n3', 'co-oc-repo', 'OrderRepository', pos(0, 2), ['findById', 'save']),
      node('n4', 'co-oc-order', 'Order', pos(1, 2), ['applyChange', 'getStatus']),
      node('n5', 'co-oc-audit', 'AuditLog', pos(2, 2), ['record']),
      node('n6', 'co-oc-pub', 'EventPublisher', pos(2, 1), ['publish']),
    ],
    edges: [
      edge('e1', 'ed-co-oc-1', 'n1', 'n2'),
      edge('e2', 'ed-co-oc-2', 'n2', 'n3'),
      edge('e3', 'ed-co-oc-3', 'n2', 'n4'),
      edge('e4', 'ed-co-oc-4', 'n2', 'n5'),
      edge('e5', 'ed-co-oc-5', 'n2', 'n6'),
    ],
    changeRequest: {
      title: 'Detect Lost Updates on Orders',
      body:
        'Support agents report that edits vanish when two people change the same order at once. A write based on stale data must be rejected with a clear conflict error so the caller can reload and retry. Normal single-writer updates must not slow down or change behaviour.',
      type: 'failure',
    },
    briefing: brief(
      'OrderService loads an order, applies a change, and saves it. OrderRepository.save simply overwrites whatever is stored.',
      'Between load and save someone else may have changed the order. Their change is lost silently. The write must carry proof of which version it was based on, and the store must refuse stale writes.',
      'Give orders a version, check it when saving, and surface a conflict to the controller. Audit and event publishing must only happen for writes that actually succeed.',
      'The check belongs where the save happens, not scattered across each OrderService method.',
    ),
    constraints: [
      'A stale write must be rejected, never partially applied',
      'No audit or event for a rejected write',
      'Existing single-writer updates must behave as before',
    ],
    forbidModifyElementNames: ['AuditLog', 'EventPublisher'],
    expectedTouchHints: ['OrderRepository', 'Order', 'OrderService', 'ConflictException'],
    protectedFlows: [
      {
        id: 'update-order',
        label: 'Update Order',
        steps: ['Patch order', 'Load order', 'Apply change', 'Save order'],
        mustKeepElementNames: ['OrderController', 'OrderService', 'OrderRepository', 'Order'],
        mustReach: [
          { from: 'OrderController', to: 'OrderService' },
          { from: 'OrderService', to: 'OrderRepository' },
          { from: 'OrderService', to: 'Order' },
        ],
        mustHavePathTopics: ['patch', 'save'],
      },
      {
        id: 'audit-and-publish',
        label: 'Audit And Publish',
        steps: ['Record audit entry', 'Publish order updated'],
        mustReach: [
          { from: 'OrderService', to: 'AuditLog' },
          { from: 'OrderService', to: 'EventPublisher' },
        ],
        mustHavePathTopics: ['record', 'publish'],
      },
    ],
    newFlows: [
      {
        id: 'reject-stale-write',
        label: 'Reject Stale Write',
        steps: ['Load order with version', 'Save with expected version', 'Version mismatch', 'Raise conflict'],
        mustReach: [
          { from: 'OrderRepository', to: 'ConflictException' },
          { from: 'OrderService', to: 'OrderVersion' },
        ],
        mustHavePathTopics: ['version', 'conflict'],
      },
      {
        id: 'conflict-response',
        label: 'Report Conflict To Caller',
        steps: ['Catch conflict', 'Return conflict response'],
        mustReach: [{ from: 'OrderController', to: 'ConflictException' }],
        mustHavePathTopics: ['conflict'],
      },
    ],
  }),

  // ── 484 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-backpressure-ingest',
    title: 'Apply Backpressure on Ingest Spike',
    difficulty: 'hard',
    order: 484,
    description:
      'A traffic spike fills the ingest queue until the service runs out of memory. Slow producers down and shed low-value load safely.',
    tags: ['ingest', 'backpressure', 'scale'],
    maxNewClasses: 5,
    nodes: [
      node('n1', 'co-bp-ctrl', 'IngestController', pos(1, 0), ['receive']),
      node('n2', 'co-bp-queue', 'EventQueue', pos(0, 1), ['enqueue', 'dequeue', 'size']),
      node('n3', 'co-bp-worker', 'IngestWorker', pos(1, 1), ['pollAndProcess']),
      node('n4', 'co-bp-parser', 'EventParser', pos(2, 1), ['parse']),
      node('n5', 'co-bp-sink', 'SinkWriter', pos(1, 2), ['write']),
      node('n6', 'co-bp-rate', 'RateMonitor', pos(0, 2), ['recordArrival', 'currentRate']),
    ],
    edges: [
      edge('e1', 'ed-co-bp-1', 'n1', 'n2'),
      edge('e2', 'ed-co-bp-2', 'n1', 'n6'),
      edge('e3', 'ed-co-bp-3', 'n3', 'n2'),
      edge('e4', 'ed-co-bp-4', 'n3', 'n4'),
      edge('e5', 'ed-co-bp-5', 'n3', 'n5'),
    ],
    changeRequest: {
      title: 'Apply Backpressure on Ingest Spike',
      body:
        'During spikes the queue grows without limit and the service crashes. When the queue is nearly full, clients should be told to slow down (with a retry hint) and low-priority events should be dropped first. Critical events must still be accepted as long as there is any room at all.',
      type: 'scale',
    },
    briefing: brief(
      'IngestController accepts events and enqueues them. IngestWorker drains the queue, parses events and writes them out. RateMonitor tracks arrival rate.',
      'Nothing limits how much we accept. We need the controller to consult load, push back on callers when we are saturated, and prefer dropping unimportant events to losing important ones.',
      'Add an admission decision in front of the queue that looks at queue depth and event priority, and tells the controller to accept, shed, or reject with a retry delay. Leave the worker and sink as they are.',
      'IngestController.receive is where overload becomes visible to callers; the decision logic should sit in its own class.',
    ),
    constraints: [
      'Critical events are accepted until the queue is truly full',
      'Rejected callers receive a retry-after hint',
      'Do not change the worker or the sink',
    ],
    forbidModifyElementNames: ['IngestWorker', 'SinkWriter', 'EventParser'],
    expectedTouchHints: ['IngestController', 'EventQueue', 'BackpressureGate', 'LoadShedder'],
    protectedFlows: [
      {
        id: 'accept-event',
        label: 'Accept Event',
        steps: ['Receive event', 'Enqueue event', 'Record arrival'],
        mustKeepElementNames: ['IngestController', 'EventQueue'],
        mustReach: [
          { from: 'IngestController', to: 'EventQueue' },
          { from: 'IngestController', to: 'RateMonitor' },
        ],
        mustHavePathTopics: ['receive', 'enqueue'],
      },
      {
        id: 'process-event',
        label: 'Process Event',
        steps: ['Dequeue', 'Parse', 'Write to sink'],
        mustReach: [
          { from: 'IngestWorker', to: 'EventQueue' },
          { from: 'IngestWorker', to: 'EventParser' },
          { from: 'IngestWorker', to: 'SinkWriter' },
        ],
        mustHavePathTopics: ['dequeue', 'parse', 'write'],
      },
    ],
    newFlows: [
      {
        id: 'admission-decision',
        label: 'Admission Decision',
        steps: ['Check queue depth', 'Check event priority', 'Accept, shed or reject'],
        mustReach: [
          { from: 'IngestController', to: 'BackpressureGate' },
          { from: 'BackpressureGate', to: 'EventQueue' },
        ],
        mustHavePathTopics: ['backpressure', 'depth'],
      },
      {
        id: 'shed-low-priority',
        label: 'Shed Low-Priority Load',
        steps: ['Queue near capacity', 'Drop low-priority event'],
        mustReach: [{ from: 'BackpressureGate', to: 'LoadShedder' }],
        mustHavePathTopics: ['shed', 'priority'],
      },
    ],
  }),

  // ── 485 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-schema-evolution',
    title: 'Evolve Event Schema Without Breaking Consumers',
    difficulty: 'hard',
    order: 485,
    description:
      'The OrderPlaced event needs a new shape, but three consumers upgrade at different times. Old and new messages must coexist.',
    tags: ['events', 'schema', 'compatibility', 'constraint', 'variation'],
    maxNewClasses: 5,
    nodes: [
      node('n1', 'co-se-pub', 'OrderEventPublisher', pos(1, 0), ['publishOrderPlaced']),
      node('n2', 'co-se-ser', 'EventSerializer', pos(1, 1), ['serialize', 'deserialize']),
      node('n3', 'co-se-bus', 'EventBus', pos(0, 1), ['send', 'subscribe']),
      node('n4', 'co-se-bill', 'BillingConsumer', pos(0, 2), ['handle']),
      node('n5', 'co-se-ship', 'ShippingConsumer', pos(1, 2), ['handle']),
      node('n6', 'co-se-ana', 'AnalyticsConsumer', pos(2, 2), ['handle']),
    ],
    edges: [
      edge('e1', 'ed-co-se-1', 'n1', 'n2'),
      edge('e2', 'ed-co-se-2', 'n1', 'n3'),
      edge('e3', 'ed-co-se-3', 'n3', 'n4'),
      edge('e4', 'ed-co-se-4', 'n3', 'n5'),
      edge('e5', 'ed-co-se-5', 'n3', 'n6'),
      edge('e6', 'ed-co-se-6', 'n4', 'n2'),
    ],
    changeRequest: {
      title: 'Evolve Event Schema Without Breaking Consumers',
      body:
        'The OrderPlaced event must replace a single "address" string with a structured address object. Billing has already upgraded, Shipping will upgrade next month and Analytics has no deadline. Every consumer must keep working on both old and new messages, and unknown versions must be rejected cleanly rather than crashing a consumer.',
      type: 'constraint',
    },
    briefing: brief(
      'OrderEventPublisher serialises events and sends them over EventBus. Billing, Shipping and Analytics subscribe and each decode the payload.',
      'Messages carry no version, so a change in shape breaks whoever has not upgraded. Messages need a version stamp, and older versions need to be translated to the shape consumers expect.',
      'Introduce explicit schema versions plus a step that upgrades older payloads to the current shape before consumers see them. The publisher should declare which version it writes. Do not rewrite each consumer.',
      'Version handling belongs around EventSerializer.deserialize, so every consumer benefits and none needs its own compatibility code.',
    ),
    constraints: [
      'Do not modify ShippingConsumer or AnalyticsConsumer',
      'Old-format messages already on the bus must still be readable',
      'Unknown versions are rejected with a clear error',
    ],
    forbidModifyElementNames: ['ShippingConsumer', 'AnalyticsConsumer', 'EventBus'],
    expectedTouchHints: ['EventSerializer', 'OrderEventPublisher', 'SchemaVersion', 'EventUpcaster'],
    protectedFlows: [
      {
        id: 'publish-order-placed',
        label: 'Publish OrderPlaced',
        steps: ['Serialize event', 'Send on bus'],
        mustKeepElementNames: ['OrderEventPublisher', 'EventSerializer', 'EventBus'],
        mustReach: [
          { from: 'OrderEventPublisher', to: 'EventSerializer' },
          { from: 'OrderEventPublisher', to: 'EventBus' },
        ],
        mustHavePathTopics: ['publish', 'serialize'],
      },
      {
        id: 'consumer-delivery',
        label: 'Consumer Delivery',
        steps: ['Bus delivers to Billing, Shipping, Analytics'],
        mustReach: [
          { from: 'EventBus', to: 'BillingConsumer' },
          { from: 'EventBus', to: 'ShippingConsumer' },
          { from: 'EventBus', to: 'AnalyticsConsumer' },
        ],
        mustHavePathTopics: ['handle'],
      },
    ],
    newFlows: [
      {
        id: 'upgrade-old-payload',
        label: 'Upgrade Old Payload',
        steps: ['Read version', 'Upcast to current shape', 'Return to consumer'],
        mustReach: [
          { from: 'EventSerializer', to: 'SchemaVersion' },
          { from: 'EventSerializer', to: 'EventUpcaster' },
        ],
        mustHavePathTopics: ['version', 'upcast'],
      },
      {
        id: 'stamp-version',
        label: 'Stamp Published Version',
        steps: ['Declare schema version', 'Serialize with version'],
        mustReach: [{ from: 'OrderEventPublisher', to: 'SchemaVersion' }],
        mustHavePathTopics: ['version'],
      },
    ],
  }),

  // ── 486 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-kill-switch-feature',
    title: 'Global Kill Switch for Risky Feature',
    difficulty: 'hard',
    order: 486,
    description:
      'The new recommender is misbehaving in production. Operators need to turn it off everywhere in seconds, without a redeploy.',
    tags: ['feature-flags', 'operations', 'failure', 'capability'],
    maxNewClasses: 5,
    nodes: [
      node('n1', 'co-ks-page', 'ProductPageService', pos(1, 0), ['renderPage']),
      node('n2', 'co-ks-rec', 'NewRecommender', pos(0, 1), ['recommend']),
      node('n3', 'co-ks-flag', 'FeatureFlagClient', pos(1, 1), ['isEnabled']),
      node('n4', 'co-ks-cache', 'ConfigCache', pos(1, 2), ['get', 'put', 'expire']),
      node('n5', 'co-ks-remote', 'RemoteConfigService', pos(2, 2), ['fetch', 'publishChange']),
      node('n6', 'co-ks-alert', 'AlertNotifier', pos(2, 1), ['notify']),
    ],
    edges: [
      edge('e1', 'ed-co-ks-1', 'n1', 'n2'),
      edge('e2', 'ed-co-ks-2', 'n1', 'n3'),
      edge('e3', 'ed-co-ks-3', 'n3', 'n4'),
      edge('e4', 'ed-co-ks-4', 'n4', 'n5'),
      edge('e5', 'ed-co-ks-5', 'n1', 'n6'),
    ],
    changeRequest: {
      title: 'Global Kill Switch for Risky Feature',
      body:
        'On-call needs one control that disables the new recommender on every server within seconds, even if the flag service is unreachable. When the switch is on, product pages must still render using a safe fallback instead of recommendations. Each flip of the switch must be traceable to a person and a reason.',
      type: 'failure',
    },
    briefing: brief(
      'ProductPageService asks FeatureFlagClient whether the feature is enabled, then calls NewRecommender. Flags are cached locally and refreshed from RemoteConfigService.',
      'Flags are cached for minutes and fall back to the last known value if the remote is down — so a risky feature can stay on for too long. We need a faster, stronger override that wins over normal flags and does not depend on the remote being reachable.',
      'Add an emergency override that is checked before the regular flag, propagates quickly, and defaults to a safe state. Give pages a plain fallback when the feature is off, and record who flipped the switch.',
      'The override should be consulted on the page path ahead of NewRecommender. Do not add flag-specific checks inside the recommender.',
    ),
    constraints: [
      'The override takes priority over regular flags',
      'Pages must render with a fallback when the feature is switched off',
      'Every flip records who and why',
    ],
    forbidModifyElementNames: ['NewRecommender', 'RemoteConfigService'],
    expectedTouchHints: ['ProductPageService', 'KillSwitch', 'FallbackRecommender', 'SwitchAuditTrail'],
    protectedFlows: [
      {
        id: 'render-with-recs',
        label: 'Render With Recommendations',
        steps: ['Render page', 'Check flag', 'Call recommender'],
        mustKeepElementNames: ['ProductPageService', 'NewRecommender', 'FeatureFlagClient'],
        mustReach: [
          { from: 'ProductPageService', to: 'FeatureFlagClient' },
          { from: 'ProductPageService', to: 'NewRecommender' },
        ],
        mustHavePathTopics: ['render', 'recommend'],
      },
      {
        id: 'flag-refresh',
        label: 'Flag Refresh',
        steps: ['Read cache', 'Fetch from remote on expiry'],
        mustReach: [
          { from: 'FeatureFlagClient', to: 'ConfigCache' },
          { from: 'ConfigCache', to: 'RemoteConfigService' },
        ],
        mustHavePathTopics: ['cache', 'fetch'],
      },
      {
        id: 'alert-on-error',
        label: 'Alert On Error',
        steps: ['Notify on-call'],
        mustReach: [{ from: 'ProductPageService', to: 'AlertNotifier' }],
        mustHavePathTopics: ['notify'],
      },
    ],
    newFlows: [
      {
        id: 'override-check',
        label: 'Check Kill Switch First',
        steps: ['Check kill switch', 'If on, skip recommender'],
        mustReach: [{ from: 'ProductPageService', to: 'KillSwitch' }],
        mustHavePathTopics: ['kill', 'switch'],
      },
      {
        id: 'fallback-render',
        label: 'Fallback Render',
        steps: ['Switch is on', 'Use fallback recommendations', 'Render page'],
        mustReach: [{ from: 'ProductPageService', to: 'FallbackRecommender' }],
        mustHavePathTopics: ['fallback'],
      },
      {
        id: 'audit-flip',
        label: 'Audit Switch Flip',
        steps: ['Operator flips switch', 'Record who and why'],
        mustReach: [{ from: 'KillSwitch', to: 'SwitchAuditTrail' }],
        mustHavePathTopics: ['audit', 'flip'],
      },
    ],
  }),

  // ── 487 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-audit-immutable-ledger',
    title: 'Payment Audit Must Be Append-Only',
    difficulty: 'hard',
    order: 487,
    description:
      'Auditors found payment history rows that were edited and deleted. Make the ledger tamper-evident and append-only, with corrections as new entries.',
    tags: ['audit', 'payments', 'compliance', 'constraint'],
    maxNewClasses: 5,
    nodes: [
      node('n1', 'co-al-pay', 'PaymentService', pos(1, 0), ['capture', 'refund']),
      node('n2', 'co-al-ledger', 'LedgerRepository', pos(1, 1), ['insert', 'update', 'delete', 'findByPayment']),
      node('n3', 'co-al-admin', 'AdminTool', pos(0, 1), ['correctEntry', 'removeEntry']),
      node('n4', 'co-al-report', 'ReportingService', pos(2, 1), ['generateStatement']),
      node('n5', 'co-al-entry', 'LedgerEntry', pos(1, 2), ['getAmount', 'getType']),
      node('n6', 'co-al-clock', 'Clock', pos(2, 2), ['now']),
    ],
    edges: [
      edge('e1', 'ed-co-al-1', 'n1', 'n2'),
      edge('e2', 'ed-co-al-2', 'n3', 'n2'),
      edge('e3', 'ed-co-al-3', 'n4', 'n2'),
      edge('e4', 'ed-co-al-4', 'n2', 'n5'),
      edge('e5', 'ed-co-al-5', 'n1', 'n6'),
    ],
    changeRequest: {
      title: 'Payment Audit Must Be Append-Only',
      body:
        'Compliance requires that payment ledger history can never be modified or deleted. Mistakes must be fixed by adding a compensating entry that references the original. Any tampering after the fact must be detectable. Statements must show the corrected view without hiding the original entries.',
      type: 'constraint',
    },
    briefing: brief(
      'PaymentService writes ledger rows through LedgerRepository, which exposes insert, update and delete. AdminTool uses update and delete to fix errors, and ReportingService reads rows for statements.',
      'Because rows can be edited or removed, history cannot be trusted. We need a write path that only adds entries, links corrections to what they correct, and lets us verify nothing was changed afterwards.',
      'Introduce an append-only way to write the ledger, change admin fixes to become correction entries, and add integrity checking over the stored entries. Statements should still work and show net balances.',
      'The destructive operations on LedgerRepository are the root of the problem — decide who may still call them (ideally nobody) and route writes through a new owner.',
    ),
    constraints: [
      'No code path may update or delete an existing ledger entry',
      'Corrections reference the entry they correct',
      'Tampering must be detectable',
    ],
    forbidModifyElementNames: ['Clock', 'ReportingService'],
    expectedTouchHints: ['LedgerRepository', 'AdminTool', 'AppendOnlyLedger', 'CorrectionEntry'],
    protectedFlows: [
      {
        id: 'capture-payment',
        label: 'Capture Payment',
        steps: ['Capture payment', 'Write ledger entry', 'Timestamp'],
        mustKeepElementNames: ['PaymentService', 'LedgerRepository'],
        mustReach: [
          { from: 'PaymentService', to: 'LedgerRepository' },
          { from: 'PaymentService', to: 'Clock' },
        ],
        mustHavePathTopics: ['capture', 'insert'],
      },
      {
        id: 'generate-statement',
        label: 'Generate Statement',
        steps: ['Read ledger entries', 'Build statement'],
        mustReach: [{ from: 'ReportingService', to: 'LedgerRepository' }],
        mustHavePathTopics: ['statement', 'findbypayment'],
      },
    ],
    newFlows: [
      {
        id: 'append-entry',
        label: 'Append Entry',
        steps: ['Create entry', 'Chain to previous hash', 'Append to ledger'],
        mustReach: [
          { from: 'PaymentService', to: 'AppendOnlyLedger' },
          { from: 'AppendOnlyLedger', to: 'LedgerRepository' },
        ],
        mustHavePathTopics: ['append', 'hash'],
      },
      {
        id: 'correct-entry',
        label: 'Correct Entry',
        steps: ['Admin requests correction', 'Create compensating entry', 'Append to ledger'],
        mustReach: [
          { from: 'AdminTool', to: 'CorrectionEntry' },
          { from: 'AdminTool', to: 'AppendOnlyLedger' },
        ],
        mustHavePathTopics: ['correct', 'compensat'],
      },
      {
        id: 'verify-integrity',
        label: 'Verify Integrity',
        steps: ['Walk hash chain', 'Report broken links'],
        mustReach: [{ from: 'AppendOnlyLedger', to: 'LedgerEntry' }],
        mustHavePathTopics: ['verify', 'integrity'],
      },
    ],
  }),

  // ── 488 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-shadow-traffic',
    title: 'Shadow New Matcher With Live Traffic',
    difficulty: 'hard',
    order: 488,
    description:
      'A rewritten matching engine needs real-traffic validation before it replaces the old one. Run it quietly beside production and compare results.',
    tags: ['shadowing', 'matching', 'scale', 'variation'],
    maxNewClasses: 5,
    nodes: [
      node('n1', 'co-sh-router', 'RideRequestRouter', pos(1, 0), ['route']),
      node('n2', 'co-sh-legacy', 'LegacyMatcher', pos(0, 1), ['match']),
      node('n3', 'co-sh-resp', 'ResponseBuilder', pos(1, 1), ['build']),
      node('n4', 'co-sh-config', 'MatcherConfig', pos(2, 1), ['getSampleRate', 'isEnabled']),
      node('n5', 'co-sh-metrics', 'MetricsClient', pos(2, 2), ['increment', 'timing']),
      node('n6', 'co-sh-driver', 'DriverPool', pos(0, 2), ['findNearby']),
    ],
    edges: [
      edge('e1', 'ed-co-sh-1', 'n1', 'n2'),
      edge('e2', 'ed-co-sh-2', 'n1', 'n3'),
      edge('e3', 'ed-co-sh-3', 'n1', 'n4'),
      edge('e4', 'ed-co-sh-4', 'n2', 'n6'),
      edge('e5', 'ed-co-sh-5', 'n3', 'n5'),
    ],
    changeRequest: {
      title: 'Shadow New Matcher With Live Traffic',
      body:
        'The team has built a new matching algorithm. Before switching, a configurable share of real ride requests should also be run through it in the background. Riders must only ever see the legacy answer. Differences between the two must be measured, and the new matcher being slow or crashing must never delay or fail a request.',
      type: 'scale',
    },
    briefing: brief(
      'RideRequestRouter sends each request to LegacyMatcher, which picks a driver from DriverPool, then asks ResponseBuilder to produce the reply. MatcherConfig holds settings.',
      'We cannot trust the new algorithm on test data alone. We want it to see real requests without any user-visible effect, and we want a clear report of where it disagrees with the current one.',
      'Add a way to run a sampled copy of each request through the new matcher off the main path, compare its choice to the legacy one, and publish the outcome as metrics. The user response must stay identical.',
      'The router decides what happens per request, so that is where sampling hooks in — but the shadow work must not be done inline in the same call chain that builds the response.',
    ),
    constraints: [
      'Riders always get the legacy result',
      'Shadow failures or slowness never affect the live request',
      'Sampling rate comes from MatcherConfig',
    ],
    forbidModifyElementNames: ['LegacyMatcher', 'DriverPool', 'ResponseBuilder'],
    expectedTouchHints: ['RideRequestRouter', 'ShadowRunner', 'ResultComparator', 'NewMatcher'],
    protectedFlows: [
      {
        id: 'live-match',
        label: 'Live Match',
        steps: ['Route request', 'Legacy match', 'Find drivers', 'Build response'],
        mustKeepElementNames: ['RideRequestRouter', 'LegacyMatcher', 'ResponseBuilder'],
        mustReach: [
          { from: 'RideRequestRouter', to: 'LegacyMatcher' },
          { from: 'LegacyMatcher', to: 'DriverPool' },
          { from: 'RideRequestRouter', to: 'ResponseBuilder' },
        ],
        mustHavePathTopics: ['route', 'match', 'build'],
      },
      {
        id: 'response-metrics',
        label: 'Response Metrics',
        steps: ['Record timing'],
        mustReach: [{ from: 'ResponseBuilder', to: 'MetricsClient' }],
        mustHavePathTopics: ['timing'],
      },
    ],
    newFlows: [
      {
        id: 'shadow-run',
        label: 'Shadow Run',
        steps: ['Sample request', 'Run new matcher in background', 'Collect result'],
        mustReach: [
          { from: 'RideRequestRouter', to: 'ShadowRunner' },
          { from: 'ShadowRunner', to: 'NewMatcher' },
          { from: 'ShadowRunner', to: 'MatcherConfig' },
        ],
        mustHavePathTopics: ['shadow', 'sample'],
      },
      {
        id: 'compare-results',
        label: 'Compare Results',
        steps: ['Compare driver choice', 'Publish diff metric'],
        mustReach: [
          { from: 'ShadowRunner', to: 'ResultComparator' },
          { from: 'ResultComparator', to: 'MetricsClient' },
        ],
        mustHavePathTopics: ['compare', 'diff'],
      },
    ],
  }),

  // ── 489 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-compensating-refund-saga',
    title: 'Partial Checkout Failure Compensates',
    difficulty: 'hard',
    order: 489,
    description:
      'If shipping fails after payment was charged and stock reserved, customers end up charged for orders that never ship. Undo what already happened.',
    tags: ['saga', 'checkout', 'compensation', 'failure'],
    maxNewClasses: 5,
    nodes: [
      node('n1', 'co-sg-checkout', 'CheckoutService', pos(1, 0), ['placeOrder']),
      node('n2', 'co-sg-inv', 'InventoryService', pos(0, 1), ['reserve', 'release']),
      node('n3', 'co-sg-pay', 'PaymentService', pos(1, 1), ['charge', 'refund']),
      node('n4', 'co-sg-ship', 'ShippingService', pos(2, 1), ['schedule', 'cancel']),
      node('n5', 'co-sg-orders', 'OrderRepository', pos(0, 2), ['save', 'markFailed']),
      node('n6', 'co-sg-notify', 'NotificationService', pos(2, 2), ['sendConfirmation', 'sendFailure']),
    ],
    edges: [
      edge('e1', 'ed-co-sg-1', 'n1', 'n2'),
      edge('e2', 'ed-co-sg-2', 'n1', 'n3'),
      edge('e3', 'ed-co-sg-3', 'n1', 'n4'),
      edge('e4', 'ed-co-sg-4', 'n1', 'n5'),
      edge('e5', 'ed-co-sg-5', 'n1', 'n6'),
    ],
    changeRequest: {
      title: 'Partial Checkout Failure Compensates',
      body:
        'Checkout reserves stock, charges the card and schedules shipping, in that order. If a later step fails, the earlier ones must be reversed in reverse order: cancel any shipment, refund the charge, release the stock. Reversal steps can themselves fail and must be retried safely without refunding twice. The customer should be told the order failed.',
      type: 'failure',
    },
    briefing: brief(
      'CheckoutService calls inventory, payment and shipping one after another, then saves the order and sends a confirmation. Refund, release and cancel operations already exist on those services but nothing calls them.',
      'A failure midway leaves the system half-done — the card is charged, stock is held, and no order ships. Each step that succeeded needs a matching undo, executed in reverse, with progress remembered so retries are safe.',
      'Add a coordinator that runs the steps, remembers which ones completed, and on failure runs their compensations in reverse order and marks the order failed. Reuse the existing refund, release and cancel operations.',
      'CheckoutService.placeOrder currently owns the sequence. Move the sequencing and undo bookkeeping out into a dedicated saga instead of piling try/catch blocks into it.',
    ),
    constraints: [
      'Compensate only the steps that completed, in reverse order',
      'Compensations must be idempotent — never refund twice',
      'Successful checkouts must behave exactly as before',
    ],
    forbidModifyElementNames: ['InventoryService', 'PaymentService', 'ShippingService'],
    expectedTouchHints: ['CheckoutService', 'CheckoutSaga', 'CompensationStep', 'SagaLog'],
    protectedFlows: [
      {
        id: 'happy-checkout',
        label: 'Successful Checkout',
        steps: ['Reserve stock', 'Charge payment', 'Schedule shipping', 'Save order'],
        mustKeepElementNames: ['CheckoutService', 'InventoryService', 'PaymentService', 'ShippingService'],
        mustReach: [
          { from: 'CheckoutService', to: 'InventoryService' },
          { from: 'CheckoutService', to: 'PaymentService' },
          { from: 'CheckoutService', to: 'ShippingService' },
          { from: 'CheckoutService', to: 'OrderRepository' },
        ],
        mustHavePathTopics: ['reserve', 'charge', 'schedule'],
      },
      {
        id: 'confirmation',
        label: 'Send Confirmation',
        steps: ['Send order confirmation'],
        mustReach: [{ from: 'CheckoutService', to: 'NotificationService' }],
        mustHavePathTopics: ['confirmation'],
      },
    ],
    newFlows: [
      {
        id: 'compensate-on-failure',
        label: 'Compensate On Failure',
        steps: ['Step fails', 'Undo completed steps in reverse', 'Mark order failed'],
        mustReach: [
          { from: 'CheckoutSaga', to: 'CompensationStep' },
          { from: 'CheckoutSaga', to: 'OrderRepository' },
        ],
        mustHavePathTopics: ['compensat', 'failed'],
      },
      {
        id: 'reverse-operations',
        label: 'Reverse Operations',
        steps: ['Cancel shipment', 'Refund payment', 'Release stock'],
        mustReach: [
          { from: 'CompensationStep', to: 'ShippingService' },
          { from: 'CompensationStep', to: 'PaymentService' },
          { from: 'CompensationStep', to: 'InventoryService' },
        ],
        mustHavePathTopics: ['cancel', 'refund', 'release'],
      },
      {
        id: 'saga-progress',
        label: 'Remember Saga Progress',
        steps: ['Log completed step', 'Skip already-compensated steps on retry'],
        mustReach: [{ from: 'CheckoutSaga', to: 'SagaLog' }],
        mustHavePathTopics: ['saga', 'log'],
      },
      {
        id: 'notify-failure',
        label: 'Notify Failure',
        steps: ['Tell customer the order failed'],
        mustReach: [{ from: 'CheckoutSaga', to: 'NotificationService' }],
        mustHavePathTopics: ['failure'],
      },
    ],
  }),
]
