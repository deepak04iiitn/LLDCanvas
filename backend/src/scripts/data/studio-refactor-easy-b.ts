/**
 * Design Studio "Refactor" packs — Easy B (orders 211–221).
 * Consumed by seed-studio-refactor-batch2.ts
 */
import { pack, node, edge, pos, type RefactorPackSeed } from '../seed-studio-refactor-lib'

type Param = { name: string; type: string }

/** Typed method shorthand. */
function m(name: string, returnType = 'void', params: Param[] = []) {
  return { name, returnType, params }
}

/** Interviewer-style briefing in the 4-section format used across refactor packs. */
function brief(s: { going: string; problem: string; todo: string; start: string }) {
  return (
    `What’s going on\n${s.going}\n\n` +
    `The problem (simple terms)\n${s.problem}\n\n` +
    `What you should do\n${s.todo}\n\n` +
    `Where to start\n${s.start}`
  )
}

export const EASY_B: RefactorPackSeed[] = [
  // ───────────────────────── 211 ─────────────────────────
  pack({
    slug: 'ref-extract-library-fine',
    title: 'Library Fine Calculation',
    difficulty: 'easy',
    order: 211,
    description:
      'LibraryManager computes overdue fines inline next to checkout and return logic. Pull the fine rules into their own collaborator.',
    tags: ['library', 'extract', 'srp'],
    scenario: 'extract',
    maxNewAbstractions: 2,
    nodes: [
      node('n1', 'el-lm', 'LibraryManager', pos(1, 0), [
        m('checkoutBook', 'Loan', [{ name: 'memberId', type: 'String' }, { name: 'bookId', type: 'String' }]),
        m('returnBook', 'void', [{ name: 'loanId', type: 'String' }]),
        m('calculateFine', 'double', [{ name: 'loan', type: 'Loan' }]),
        m('renewBook', 'void', [{ name: 'loanId', type: 'String' }]),
      ], [
        { name: 'fineRatePerDay', type: 'double' },
        { name: 'graceDays', type: 'int' },
        { name: 'maxFine', type: 'double' },
      ]),
      node('n2', 'el-book', 'Book', pos(0, 1), [m('isAvailable', 'boolean'), m('markBorrowed')], [
        { name: 'isbn', type: 'String' },
      ]),
      node('n3', 'el-member', 'Member', pos(1, 1), [m('getId', 'String'), m('addFine', 'void', [{ name: 'amount', type: 'double' }])], [
        { name: 'outstandingFines', type: 'double' },
      ]),
      node('n4', 'el-loan', 'Loan', pos(2, 1), [m('getDueDate', 'Date'), m('getReturnDate', 'Date')], [
        { name: 'dueDate', type: 'Date' },
      ]),
    ],
    edges: [
      edge('e1', 'ed-lm-book', 'n1', 'n2'),
      edge('e2', 'ed-lm-member', 'n1', 'n3'),
      edge('e3', 'ed-lm-loan', 'n1', 'n4'),
    ],
    briefing: brief({
      going:
        'LibraryManager handles checkout, return and renewal. It also owns fineRatePerDay, graceDays and maxFine, and calculateFine() applies those rules directly.',
      problem:
        'Fine policy is a business rule that changes often (weekend waivers, per-member-tier rates, caps). Today every change means editing the class that also coordinates loans, so each tweak risks breaking checkout and return.',
      todo:
        'Move the fine rules into a dedicated collaborator and have LibraryManager delegate to it when a book is returned. Checkout, return, renewal and adding a fine to the member must still work as before.',
      start:
        'Look at the three fine-related fields and calculateFine on LibraryManager. Ask: “Which of these members would change together if finance changed the policy?”',
    }),
    requirements: [
      'Fine rules (rate, grace period, cap) live outside LibraryManager',
      'returnBook still results in a fine being added to the Member when overdue',
      'Checkout and renewal behave exactly as today',
    ],
    constraints: [
      'Do not remove LibraryManager, Book, Member or Loan',
      'Existing behavior must remain',
      'LibraryManager should only coordinate, not compute fines',
      'Do not introduce more than 2 new abstractions',
    ],
    flows: [
      {
        id: 'return-with-fine',
        label: 'Return overdue book',
        steps: ['Manager loads the loan', 'Fine is computed for overdue days', 'Fine is added to the member'],
        mustKeepElementNames: ['LibraryManager', 'Member', 'Loan'],
        mustReach: [
          { from: 'LibraryManager', to: 'Loan' },
          { from: 'LibraryManager', to: 'Member' },
        ],
        mustHavePathTopics: ['returnbook', 'fine'],
      },
      {
        id: 'checkout',
        label: 'Checkout book',
        steps: ['Verify the book is available', 'Create a loan', 'Mark book borrowed'],
        mustKeepElementNames: ['Book'],
        mustReach: [{ from: 'LibraryManager', to: 'Book' }],
        mustHavePathTopics: ['checkoutbook'],
      },
    ],
    forbidDeleteElementNames: ['LibraryManager', 'Book', 'Member', 'Loan'],
    modelHints: ['FineCalculator'],
  }),

  // ───────────────────────── 212 ─────────────────────────
  pack({
    slug: 'ref-decouple-twilio-sms',
    title: 'SMS Gateway Binding',
    difficulty: 'easy',
    order: 212,
    description:
      'Notifier talks straight to the Twilio SDK. Introduce a port so the SMS vendor can be swapped or faked in tests.',
    tags: ['sms', 'decouple', 'ports-adapters'],
    scenario: 'decouple',
    maxNewAbstractions: 2,
    nodes: [
      node('n1', 'el-otp', 'OtpService', pos(0, 0), [
        m('generateOtp', 'String', [{ name: 'userId', type: 'String' }]),
        m('verifyOtp', 'boolean', [{ name: 'userId', type: 'String' }, { name: 'code', type: 'String' }]),
      ]),
      node('n2', 'el-notifier', 'Notifier', pos(1, 0), [
        m('sendOtp', 'void', [{ name: 'user', type: 'User' }, { name: 'code', type: 'String' }]),
        m('sendAlert', 'void', [{ name: 'user', type: 'User' }, { name: 'text', type: 'String' }]),
        m('formatMessage', 'String', [{ name: 'template', type: 'String' }]),
      ], [
        { name: 'twilioClient', type: 'TwilioRestClient' },
        { name: 'fromNumber', type: 'String' },
      ]),
      node('n3', 'el-twilio', 'TwilioRestClient', pos(2, 0), [
        m('createMessage', 'String', [{ name: 'to', type: 'String' }, { name: 'from', type: 'String' }, { name: 'body', type: 'String' }]),
      ], [
        { name: 'accountSid', type: 'String' },
        { name: 'authToken', type: 'String' },
      ]),
      node('n4', 'el-user', 'User', pos(1, 1), [m('getPhone', 'String'), m('getName', 'String')]),
    ],
    edges: [
      edge('e1', 'ed-otp-notifier', 'n1', 'n2', 'dependency', 'right', 'left'),
      edge('e2', 'ed-notifier-twilio', 'n2', 'n3', 'dependency', 'right', 'left'),
      edge('e3', 'ed-notifier-user', 'n2', 'n4'),
    ],
    briefing: brief({
      going:
        'OtpService asks Notifier to text a code. Notifier formats the message and then calls TwilioRestClient directly, holding the Twilio client and sender number as fields.',
      problem:
        'Notifier is welded to one vendor. Switching to another SMS provider, adding a regional fallback, or unit-testing OTP flows without sending real texts all require editing Notifier itself.',
      todo:
        'Make Notifier depend on an abstraction it owns, and push the Twilio specifics behind an implementation of it. OTP and alert texts must still be delivered through the same public methods.',
      start:
        'Follow the arrow Notifier → TwilioRestClient and the twilioClient field. Ask: “What does Notifier actually need — a Twilio client, or just ‘something that sends a text’?”',
    }),
    requirements: [
      'Notifier no longer references the Twilio class directly',
      'sendOtp and sendAlert still deliver text messages',
      'A second SMS provider could be added without touching Notifier',
    ],
    constraints: [
      'Do not remove OtpService, Notifier or User',
      'Keep TwilioRestClient as the concrete vendor class',
      'Dependency should point toward the abstraction, not the vendor',
      'Do not introduce more than 2 new abstractions',
    ],
    flows: [
      {
        id: 'send-otp',
        label: 'Send OTP',
        steps: ['OtpService generates a code', 'Notifier formats the message', 'Message is sent over SMS'],
        mustKeepElementNames: ['OtpService', 'Notifier'],
        mustReach: [{ from: 'OtpService', to: 'Notifier' }],
        mustHavePathTopics: ['sendotp', 'createmessage'],
      },
      {
        id: 'send-alert',
        label: 'Send alert',
        steps: ['Notifier resolves the user’s phone', 'Alert text is sent'],
        mustKeepElementNames: ['User', 'TwilioRestClient'],
        mustReach: [{ from: 'Notifier', to: 'User' }],
        mustHavePathTopics: ['sendalert'],
      },
    ],
    forbidDeleteElementNames: ['OtpService', 'Notifier', 'User', 'TwilioRestClient'],
    modelHints: ['SmsPort', 'TwilioSmsAdapter'],
  }),

  // ───────────────────────── 213 ─────────────────────────
  pack({
    slug: 'ref-extract-atm-receipt',
    title: 'ATM Receipt Printing',
    difficulty: 'easy',
    order: 213,
    description:
      'ATM both runs the withdrawal and formats/prints the receipt. Separate the printing concern.',
    tags: ['atm', 'extract', 'srp'],
    scenario: 'extract',
    maxNewAbstractions: 2,
    nodes: [
      node('n1', 'el-atm', 'ATM', pos(1, 0), [
        m('withdraw', 'boolean', [{ name: 'accountId', type: 'String' }, { name: 'amount', type: 'double' }]),
        m('checkBalance', 'double', [{ name: 'accountId', type: 'String' }]),
        m('printReceipt', 'void', [{ name: 'tx', type: 'Transaction' }]),
        m('formatReceiptLine', 'String', [{ name: 'label', type: 'String' }, { name: 'value', type: 'String' }]),
      ], [
        { name: 'receiptWidth', type: 'int' },
        { name: 'bankName', type: 'String' },
      ]),
      node('n2', 'el-acct', 'Account', pos(0, 1), [m('debit', 'boolean', [{ name: 'amount', type: 'double' }]), m('getBalance', 'double')]),
      node('n3', 'el-disp', 'CashDispenser', pos(1, 1), [m('dispense', 'void', [{ name: 'amount', type: 'double' }])]),
      node('n4', 'el-tx', 'Transaction', pos(2, 1), [m('getAmount', 'double'), m('getTimestamp', 'Date'), m('getType', 'String')]),
    ],
    edges: [
      edge('e1', 'ed-atm-acct', 'n1', 'n2'),
      edge('e2', 'ed-atm-disp', 'n1', 'n3'),
      edge('e3', 'ed-atm-tx', 'n1', 'n4'),
    ],
    briefing: brief({
      going:
        'ATM authorizes a withdrawal against Account, tells CashDispenser to release cash, and then builds and prints the receipt itself using receiptWidth, bankName and formatReceiptLine.',
      problem:
        'Money movement and paper layout are unrelated reasons to change. A new receipt format (or an emailed receipt instead of paper) means editing the same class that guards cash dispensing.',
      todo:
        'Extract the receipt concern so ATM only orchestrates the withdrawal and hands the transaction over for printing. Withdrawal rules and the printed result must not change.',
      start:
        'Group ATM’s members by who would ask for a change: banking ops vs. branding/UX. printReceipt, formatReceiptLine and the two receipt fields go together.',
    }),
    requirements: [
      'Receipt formatting and printing live outside ATM',
      'withdraw still debits the account and dispenses cash',
      'A receipt is still produced from the Transaction after a successful withdrawal',
    ],
    constraints: [
      'Do not remove ATM, Account, CashDispenser or Transaction',
      'Existing behavior must remain',
      'ATM should orchestrate, not format',
      'Do not introduce more than 2 new abstractions',
    ],
    flows: [
      {
        id: 'withdraw',
        label: 'Withdraw cash',
        steps: ['Debit the account', 'Dispense cash', 'Record the transaction'],
        mustKeepElementNames: ['ATM', 'Account', 'CashDispenser'],
        mustReach: [
          { from: 'ATM', to: 'Account' },
          { from: 'ATM', to: 'CashDispenser' },
        ],
        mustHavePathTopics: ['withdraw', 'debit', 'dispense'],
      },
      {
        id: 'print-receipt',
        label: 'Print receipt',
        steps: ['ATM passes the transaction to the printer', 'Receipt lines are formatted and printed'],
        mustKeepElementNames: ['Transaction'],
        mustReach: [{ from: 'ATM', to: 'Transaction' }],
        mustHavePathTopics: ['receipt'],
      },
    ],
    forbidDeleteElementNames: ['ATM', 'Account', 'CashDispenser', 'Transaction'],
    modelHints: ['ReceiptPrinter'],
  }),

  // ───────────────────────── 214 ─────────────────────────
  pack({
    slug: 'ref-split-gradebook-notify',
    title: 'GradeBook Parent Notify',
    difficulty: 'easy',
    order: 214,
    description:
      'GradeBook stores scores and also composes and sends emails to parents. Split notification from grade keeping.',
    tags: ['education', 'extract', 'notifications'],
    scenario: 'extract',
    maxNewAbstractions: 2,
    nodes: [
      node('n1', 'el-gb', 'GradeBook', pos(1, 0), [
        m('addScore', 'void', [{ name: 'studentId', type: 'String' }, { name: 'score', type: 'double' }]),
        m('getAverage', 'double', [{ name: 'studentId', type: 'String' }]),
        m('emailParents', 'void', [{ name: 'studentId', type: 'String' }]),
        m('buildEmailBody', 'String', [{ name: 'student', type: 'Student' }]),
      ], [
        { name: 'smtpClient', type: 'SmtpClient' },
        { name: 'emailSubject', type: 'String' },
      ]),
      node('n2', 'el-student', 'Student', pos(0, 1), [m('getName', 'String'), m('getParentEmail', 'String')]),
      node('n3', 'el-assign', 'Assignment', pos(1, 1), [m('getMaxScore', 'double'), m('getTitle', 'String')]),
      node('n4', 'el-smtp', 'SmtpClient', pos(2, 1), [m('send', 'void', [{ name: 'to', type: 'String' }, { name: 'subject', type: 'String' }, { name: 'body', type: 'String' }])]),
    ],
    edges: [
      edge('e1', 'ed-gb-student', 'n1', 'n2'),
      edge('e2', 'ed-gb-assign', 'n1', 'n3'),
      edge('e3', 'ed-gb-smtp', 'n1', 'n4'),
    ],
    briefing: brief({
      going:
        'GradeBook records scores and computes averages. It also owns an SmtpClient, builds the email body and sends progress emails to parents.',
      problem:
        'Teachers changing grading rules and communications staff changing email wording touch the same class. Testing the average calculation requires dealing with SMTP wiring, and adding SMS or app push means growing GradeBook even more.',
      todo:
        'Pull the “tell the parents” behavior out into its own notifier and let GradeBook trigger it. Scores, averages and delivered emails must remain identical from the outside.',
      start:
        'Highlight emailParents, buildEmailBody, smtpClient and emailSubject — they have nothing to do with computing a grade. Decide who should own them.',
    }),
    requirements: [
      'Email composition and sending are no longer inside GradeBook',
      'GradeBook still records scores and computes averages',
      'Parents are still emailed through SmtpClient',
    ],
    constraints: [
      'Do not remove GradeBook, Student, Assignment or SmtpClient',
      'Existing behavior must remain',
      'Keep the new notifier small and focused',
      'Do not introduce more than 2 new abstractions',
    ],
    flows: [
      {
        id: 'record-scores',
        label: 'Record and average scores',
        steps: ['Add a score for a student', 'Compute the student’s average'],
        mustKeepElementNames: ['GradeBook', 'Student', 'Assignment'],
        mustReach: [
          { from: 'GradeBook', to: 'Student' },
          { from: 'GradeBook', to: 'Assignment' },
        ],
        mustHavePathTopics: ['addscore', 'getaverage'],
      },
      {
        id: 'notify-parents',
        label: 'Email parents',
        steps: ['GradeBook triggers notification', 'Notifier builds the message', 'SMTP delivers it to the parent'],
        mustKeepElementNames: ['SmtpClient'],
        mustReach: [{ from: 'GradeBook', to: 'SmtpClient' }],
        mustHavePathTopics: ['email', 'send'],
      },
    ],
    forbidDeleteElementNames: ['GradeBook', 'Student', 'Assignment', 'SmtpClient'],
    modelHints: ['ParentNotifier'],
  }),

  // ───────────────────────── 215 ─────────────────────────
  pack({
    slug: 'ref-decouple-mongo-repo',
    title: 'Order Repo Mongo Binding',
    difficulty: 'easy',
    order: 215,
    description:
      'OrderRepository is hard-wired to MongoClient. Introduce a repository port so storage can change and services can be tested in memory.',
    tags: ['persistence', 'decouple', 'repository'],
    scenario: 'decouple',
    maxNewAbstractions: 2,
    nodes: [
      node('n1', 'el-os', 'OrderService', pos(1, 0), [
        m('placeOrder', 'Order', [{ name: 'cart', type: 'Cart' }]),
        m('cancelOrder', 'void', [{ name: 'orderId', type: 'String' }]),
        m('getOrder', 'Order', [{ name: 'orderId', type: 'String' }]),
      ]),
      node('n2', 'el-or', 'OrderRepository', pos(1, 1), [
        m('save', 'void', [{ name: 'order', type: 'Order' }]),
        m('findById', 'Order', [{ name: 'id', type: 'String' }]),
        m('findByCustomer', 'List<Order>', [{ name: 'customerId', type: 'String' }]),
      ], [{ name: 'mongo', type: 'MongoClient' }]),
      node('n3', 'el-mongo', 'MongoClient', pos(2, 1), [
        m('insertOne', 'void', [{ name: 'collection', type: 'String' }, { name: 'doc', type: 'Document' }]),
        m('findOne', 'Document', [{ name: 'collection', type: 'String' }, { name: 'filter', type: 'Document' }]),
        m('find', 'List<Document>', [{ name: 'collection', type: 'String' }, { name: 'filter', type: 'Document' }]),
      ]),
      node('n4', 'el-order', 'Order', pos(0, 1), [m('getId', 'String'), m('getTotal', 'double'), m('getStatus', 'String')]),
    ],
    edges: [
      edge('e1', 'ed-os-or', 'n1', 'n2'),
      edge('e2', 'ed-or-mongo', 'n2', 'n3', 'dependency', 'right', 'left'),
      edge('e3', 'ed-os-order', 'n1', 'n4', 'dependency', 'left', 'top'),
      edge('e4', 'ed-or-order', 'n2', 'n4', 'dependency', 'left', 'right'),
    ],
    briefing: brief({
      going:
        'OrderService places, cancels and fetches orders through OrderRepository. The repository maps orders to documents and calls MongoClient directly.',
      problem:
        'The “repository” is really a MongoDB wrapper. Moving to Postgres, or running service tests without a database, means rewriting OrderRepository and probably the callers that learned its shape.',
      todo:
        'Give OrderService something storage-neutral to depend on, and keep the Mongo-specific code behind an implementation. Saving and loading orders must keep working the same way.',
      start:
        'Look at what OrderService really needs: save, findById, findByCustomer. Those are domain operations — Mongo calls like insertOne and findOne are an implementation detail.',
    }),
    requirements: [
      'OrderService depends on a storage-neutral abstraction, not on Mongo types',
      'Orders can still be saved, loaded by id and listed by customer',
      'A different datastore could be plugged in without changing OrderService',
    ],
    constraints: [
      'Do not remove OrderService, OrderRepository, Order or MongoClient',
      'Existing behavior must remain',
      'Only the Mongo-specific implementation may reference MongoClient',
      'Do not introduce more than 2 new abstractions',
    ],
    flows: [
      {
        id: 'place-order',
        label: 'Place order',
        steps: ['Service builds an order', 'Order is saved through the repository'],
        mustKeepElementNames: ['OrderService', 'OrderRepository', 'Order'],
        mustReach: [
          { from: 'OrderService', to: 'OrderRepository' },
          { from: 'OrderRepository', to: 'Order' },
        ],
        mustHavePathTopics: ['placeorder', 'save'],
      },
      {
        id: 'load-order',
        label: 'Load order',
        steps: ['Service asks the repository for an id', 'Stored order is returned'],
        mustKeepElementNames: ['MongoClient'],
        mustReach: [{ from: 'OrderService', to: 'Order' }],
        mustHavePathTopics: ['findbyid', 'getorder'],
      },
    ],
    forbidDeleteElementNames: ['OrderService', 'OrderRepository', 'Order', 'MongoClient'],
    modelHints: ['RepositoryPort', 'MongoOrderRepository'],
  }),

  // ───────────────────────── 216 ─────────────────────────
  pack({
    slug: 'ref-extract-vending-payment',
    title: 'Vending Coin Logic',
    difficulty: 'easy',
    order: 216,
    description:
      'VendingMachine tracks coins, change and refunds alongside product dispensing. Extract a payment handler.',
    tags: ['vending', 'extract', 'srp'],
    scenario: 'extract',
    maxNewAbstractions: 2,
    nodes: [
      node('n1', 'el-vm', 'VendingMachine', pos(1, 0), [
        m('insertCoin', 'void', [{ name: 'coin', type: 'Coin' }]),
        m('returnCoins', 'List<Coin>'),
        m('selectProduct', 'void', [{ name: 'code', type: 'String' }]),
        m('dispense', 'Product', [{ name: 'code', type: 'String' }]),
        m('calculateChange', 'int', [{ name: 'price', type: 'int' }]),
      ], [
        { name: 'balanceCents', type: 'int' },
        { name: 'coinBank', type: 'Map<Coin, int>' },
      ]),
      node('n2', 'el-prod', 'Product', pos(0, 1), [m('getPrice', 'int'), m('getName', 'String')]),
      node('n3', 'el-inv', 'Inventory', pos(1, 1), [m('isInStock', 'boolean', [{ name: 'code', type: 'String' }]), m('decrement', 'void', [{ name: 'code', type: 'String' }])]),
      node('n4', 'el-disp', 'DisplayPanel', pos(2, 1), [m('show', 'void', [{ name: 'message', type: 'String' }])]),
    ],
    edges: [
      edge('e1', 'ed-vm-prod', 'n1', 'n2'),
      edge('e2', 'ed-vm-inv', 'n1', 'n3'),
      edge('e3', 'ed-vm-disp', 'n1', 'n4'),
    ],
    briefing: brief({
      going:
        'VendingMachine accepts coins, keeps the running balance and coin bank, works out change, refunds, and also checks stock and dispenses the product.',
      problem:
        'Money handling and product handling evolve independently — card readers, new denominations, exact-change-only mode. Today all of that lands in one class, so adding a payment method risks breaking dispensing.',
      todo:
        'Extract a payment handler that owns balance, coin bank, change and refunds. VendingMachine should ask it whether enough has been paid and then dispense. Selling a product and getting change back must still work.',
      start:
        'Circle balanceCents, coinBank, insertCoin, returnCoins and calculateChange. Those are all about money; selectProduct and dispense are about goods.',
    }),
    requirements: [
      'Coin balance, change calculation and refunds are handled outside VendingMachine',
      'Selecting an in-stock product with enough credit still dispenses it',
      'Unused credit can still be returned',
    ],
    constraints: [
      'Do not remove VendingMachine, Product, Inventory or DisplayPanel',
      'Existing behavior must remain',
      'VendingMachine coordinates, PaymentHandler owns the money',
      'Do not introduce more than 2 new abstractions',
    ],
    flows: [
      {
        id: 'purchase',
        label: 'Purchase product',
        steps: ['Insert coins', 'Select product', 'Check stock and price', 'Dispense and give change'],
        mustKeepElementNames: ['VendingMachine', 'Product', 'Inventory'],
        mustReach: [
          { from: 'VendingMachine', to: 'Product' },
          { from: 'VendingMachine', to: 'Inventory' },
        ],
        mustHavePathTopics: ['insertcoin', 'selectproduct', 'dispense', 'change'],
      },
      {
        id: 'refund',
        label: 'Refund coins',
        steps: ['User cancels', 'Remaining credit is returned', 'Display confirms'],
        mustKeepElementNames: ['DisplayPanel'],
        mustReach: [{ from: 'VendingMachine', to: 'DisplayPanel' }],
        mustHavePathTopics: ['returncoins'],
      },
    ],
    forbidDeleteElementNames: ['VendingMachine', 'Product', 'Inventory', 'DisplayPanel'],
    modelHints: ['PaymentHandler'],
  }),

  // ───────────────────────── 217 ─────────────────────────
  pack({
    slug: 'ref-cleanup-god-methods',
    title: 'Booking Fat Methods',
    difficulty: 'easy',
    order: 217,
    description:
      'BookingService has ten methods mixing validation, pricing, persistence, email and invoicing. Thin it out with focused helpers.',
    tags: ['booking', 'cleanup', 'god-class'],
    scenario: 'cleanup',
    maxNewAbstractions: 3,
    nodes: [
      node('n1', 'el-bs', 'BookingService', pos(1, 0), [
        m('createBooking', 'Booking', [{ name: 'req', type: 'BookingRequest' }]),
        m('cancelBooking', 'void', [{ name: 'bookingId', type: 'String' }]),
        m('rescheduleBooking', 'Booking', [{ name: 'bookingId', type: 'String' }, { name: 'newSlot', type: 'TimeSlot' }]),
        m('validateAvailability', 'boolean', [{ name: 'room', type: 'Room' }, { name: 'slot', type: 'TimeSlot' }]),
        m('calculatePrice', 'double', [{ name: 'room', type: 'Room' }, { name: 'slot', type: 'TimeSlot' }]),
        m('applyDiscount', 'double', [{ name: 'price', type: 'double' }, { name: 'customer', type: 'Customer' }]),
        m('sendConfirmationEmail', 'void', [{ name: 'booking', type: 'Booking' }]),
        m('sendCancellationEmail', 'void', [{ name: 'booking', type: 'Booking' }]),
        m('generateInvoice', 'String', [{ name: 'booking', type: 'Booking' }]),
        m('logAudit', 'void', [{ name: 'event', type: 'String' }]),
      ]),
      node('n2', 'el-br', 'BookingRepository', pos(0, 1), [m('save'), m('findById'), m('findByRoom')]),
      node('n3', 'el-room', 'Room', pos(1, 1), [m('getRate', 'double'), m('getCapacity', 'int')]),
      node('n4', 'el-cust', 'Customer', pos(2, 1), [m('getTier', 'String'), m('getEmail', 'String')]),
      node('n5', 'el-mail', 'EmailClient', pos(3, 1), [m('send', 'void', [{ name: 'to', type: 'String' }, { name: 'subject', type: 'String' }, { name: 'body', type: 'String' }])]),
    ],
    edges: [
      edge('e1', 'ed-bs-br', 'n1', 'n2'),
      edge('e2', 'ed-bs-room', 'n1', 'n3'),
      edge('e3', 'ed-bs-cust', 'n1', 'n4'),
      edge('e4', 'ed-bs-mail', 'n1', 'n5'),
    ],
    briefing: brief({
      going:
        'BookingService is the one class every booking feature lands in: it validates slots, prices and discounts, persists, emails customers, builds invoices and writes audit entries.',
      problem:
        'Ten unrelated responsibilities in one place makes every change risky and every test heavy. Pricing tweaks, email copy and invoice layout all collide in the same file.',
      todo:
        'Thin BookingService down to orchestration by moving cohesive groups of methods into small helpers or services — for example pricing and notifications. Create, cancel and reschedule must behave exactly as before.',
      start:
        'Cluster the ten methods by reason to change: pricing (calculatePrice, applyDiscount), messaging (the two emails), documents (generateInvoice). What remains is the real booking workflow.',
    }),
    requirements: [
      'BookingService keeps the booking workflow (create, cancel, reschedule) but delegates pricing and messaging',
      'At least two cohesive groups of methods move out of BookingService',
      'Customers still receive confirmation and cancellation emails',
    ],
    constraints: [
      'Do not remove BookingService, BookingRepository, Room, Customer or EmailClient',
      'Existing behavior must remain',
      'Each extracted class should have a single clear purpose',
      'Do not introduce more than 3 new abstractions',
    ],
    flows: [
      {
        id: 'create-booking',
        label: 'Create booking',
        steps: ['Validate availability', 'Price with discount', 'Save booking', 'Send confirmation'],
        mustKeepElementNames: ['BookingService', 'BookingRepository', 'Room', 'Customer'],
        mustReach: [
          { from: 'BookingService', to: 'BookingRepository' },
          { from: 'BookingService', to: 'Room' },
          { from: 'BookingService', to: 'Customer' },
        ],
        mustHavePathTopics: ['createbooking', 'price', 'confirmation'],
      },
      {
        id: 'cancel-booking',
        label: 'Cancel booking',
        steps: ['Load booking', 'Mark cancelled', 'Send cancellation email'],
        mustKeepElementNames: ['EmailClient'],
        mustReach: [{ from: 'BookingService', to: 'EmailClient' }],
        mustHavePathTopics: ['cancelbooking', 'cancellation'],
      },
    ],
    forbidDeleteElementNames: ['BookingService', 'BookingRepository', 'Room', 'Customer', 'EmailClient'],
    modelHints: ['PricingService', 'BookingNotifier', 'InvoiceGenerator'],
  }),

  // ───────────────────────── 218 ─────────────────────────
  pack({
    slug: 'ref-decouple-paypal',
    title: 'Wallet PayPal Binding',
    difficulty: 'easy',
    order: 218,
    description:
      'Wallet calls the PayPal client directly for top-ups and refunds. Invert the dependency behind a payment port.',
    tags: ['payments', 'decouple', 'ports-adapters'],
    scenario: 'decouple',
    maxNewAbstractions: 2,
    nodes: [
      node('n1', 'el-checkout', 'CheckoutService', pos(0, 0), [m('checkout', 'void', [{ name: 'userId', type: 'String' }, { name: 'amount', type: 'double' }])]),
      node('n2', 'el-wallet', 'Wallet', pos(1, 0), [
        m('topUp', 'void', [{ name: 'amount', type: 'double' }]),
        m('pay', 'boolean', [{ name: 'amount', type: 'double' }]),
        m('refund', 'void', [{ name: 'txId', type: 'String' }]),
        m('getBalance', 'double'),
      ], [
        { name: 'paypal', type: 'PayPalClient' },
        { name: 'balance', type: 'double' },
      ]),
      node('n3', 'el-paypal', 'PayPalClient', pos(2, 0), [
        m('createPayment', 'String', [{ name: 'amount', type: 'double' }, { name: 'currency', type: 'String' }]),
        m('executePayment', 'boolean', [{ name: 'paymentId', type: 'String' }]),
        m('refundSale', 'void', [{ name: 'saleId', type: 'String' }]),
      ]),
      node('n4', 'el-ledger', 'LedgerEntry', pos(1, 1), [m('getAmount', 'double'), m('getType', 'String')]),
    ],
    edges: [
      edge('e1', 'ed-co-wallet', 'n1', 'n2', 'dependency', 'right', 'left'),
      edge('e2', 'ed-wallet-pp', 'n2', 'n3', 'dependency', 'right', 'left'),
      edge('e3', 'ed-wallet-ledger', 'n2', 'n4'),
    ],
    briefing: brief({
      going:
        'CheckoutService uses Wallet to take money. Wallet keeps a balance and a LedgerEntry history, and calls PayPalClient directly to create, execute and refund payments.',
      problem:
        'Wallet’s rules (balance, ledger) are fused to PayPal’s API shape. Adding Stripe, UPI or a mock gateway means changing Wallet, and unit tests need PayPal reachable.',
      todo:
        'Introduce a payment-facing abstraction that Wallet depends on, with PayPal as one implementation. Top-up, pay and refund flows must keep working and keep recording ledger entries.',
      start:
        'Trace Wallet → PayPalClient and the paypal field. Ask: “Which PayPal terms leak into Wallet, and what neutral verbs (charge, refund) would replace them?”',
    }),
    requirements: [
      'Wallet no longer references PayPalClient directly',
      'Top-up, pay and refund still go through a payment gateway',
      'Another gateway could be added without modifying Wallet',
    ],
    constraints: [
      'Do not remove CheckoutService, Wallet, PayPalClient or LedgerEntry',
      'Existing behavior must remain',
      'PayPal specifics stay in a PayPal-only implementation',
      'Do not introduce more than 2 new abstractions',
    ],
    flows: [
      {
        id: 'top-up',
        label: 'Top up wallet',
        steps: ['Checkout requests a top-up', 'Wallet charges the gateway', 'Ledger entry is recorded'],
        mustKeepElementNames: ['CheckoutService', 'Wallet', 'LedgerEntry'],
        mustReach: [
          { from: 'CheckoutService', to: 'Wallet' },
          { from: 'Wallet', to: 'LedgerEntry' },
        ],
        mustHavePathTopics: ['topup', 'payment'],
      },
      {
        id: 'refund',
        label: 'Refund payment',
        steps: ['Wallet asks the gateway to refund', 'Reversal is recorded'],
        mustKeepElementNames: ['PayPalClient'],
        mustReach: [{ from: 'CheckoutService', to: 'LedgerEntry' }],
        mustHavePathTopics: ['refund'],
      },
    ],
    forbidDeleteElementNames: ['CheckoutService', 'Wallet', 'PayPalClient', 'LedgerEntry'],
    modelHints: ['PaymentPort', 'PayPalPaymentAdapter'],
  }),

  // ───────────────────────── 219 ─────────────────────────
  pack({
    slug: 'ref-extract-search-rank',
    title: 'Search Ranking Inline',
    difficulty: 'easy',
    order: 219,
    description:
      'SearchService parses queries, looks up documents and scores/orders results in one place. Extract ranking.',
    tags: ['search', 'extract', 'ranking'],
    scenario: 'extract',
    maxNewAbstractions: 2,
    nodes: [
      node('n1', 'el-sc', 'SearchController', pos(0, 0), [m('handle', 'SearchResponse', [{ name: 'q', type: 'String' }])]),
      node('n2', 'el-ss', 'SearchService', pos(1, 0), [
        m('search', 'List<Document>', [{ name: 'query', type: 'String' }]),
        m('parseQuery', 'Query', [{ name: 'raw', type: 'String' }]),
        m('rankResults', 'List<Document>', [{ name: 'docs', type: 'List<Document>' }, { name: 'q', type: 'Query' }]),
        m('scoreDocument', 'double', [{ name: 'doc', type: 'Document' }, { name: 'q', type: 'Query' }]),
        m('boostByRecency', 'double', [{ name: 'doc', type: 'Document' }]),
      ], [
        { name: 'titleWeight', type: 'double' },
        { name: 'recencyWeight', type: 'double' },
      ]),
      node('n3', 'el-idx', 'InvertedIndex', pos(2, 0), [m('lookup', 'List<Document>', [{ name: 'terms', type: 'List<String>' }])]),
      node('n4', 'el-doc', 'Document', pos(1, 1), [m('getTitle', 'String'), m('getBody', 'String'), m('getUpdatedAt', 'Date')]),
    ],
    edges: [
      edge('e1', 'ed-sc-ss', 'n1', 'n2', 'dependency', 'right', 'left'),
      edge('e2', 'ed-ss-idx', 'n2', 'n3', 'dependency', 'right', 'left'),
      edge('e3', 'ed-ss-doc', 'n2', 'n4'),
    ],
    briefing: brief({
      going:
        'SearchController calls SearchService.search. The service parses the query, asks InvertedIndex for candidates, then scores each Document using weights and recency, and sorts them — all in the same class.',
      problem:
        'Ranking is the part product teams tune weekly (A/B tests, new signals), while query parsing and retrieval are stable. Today each ranking experiment edits the central search class and makes it hard to compare strategies.',
      todo:
        'Extract the scoring/ordering logic into a ranker that SearchService calls. Searching must return the same ordered results as before.',
      start:
        'Look at rankResults, scoreDocument, boostByRecency and the two weight fields. They form a self-contained concern that only needs a query and documents.',
    }),
    requirements: [
      'Scoring, recency boost and ordering live outside SearchService',
      'search still parses, retrieves and returns ranked documents',
      'Ranking strategy can be changed without editing retrieval code',
    ],
    constraints: [
      'Do not remove SearchController, SearchService, InvertedIndex or Document',
      'Existing behavior must remain',
      'Ranker must not know about the controller or the index',
      'Do not introduce more than 2 new abstractions',
    ],
    flows: [
      {
        id: 'query',
        label: 'Run a search',
        steps: ['Controller receives query', 'Service parses it', 'Index returns candidates'],
        mustKeepElementNames: ['SearchController', 'SearchService', 'InvertedIndex'],
        mustReach: [
          { from: 'SearchController', to: 'SearchService' },
          { from: 'SearchService', to: 'InvertedIndex' },
        ],
        mustHavePathTopics: ['search', 'parsequery', 'lookup'],
      },
      {
        id: 'rank',
        label: 'Rank results',
        steps: ['Each document is scored', 'Recency boost applied', 'Results sorted'],
        mustKeepElementNames: ['Document'],
        mustReach: [{ from: 'SearchService', to: 'Document' }],
        mustHavePathTopics: ['rank', 'score'],
      },
    ],
    forbidDeleteElementNames: ['SearchController', 'SearchService', 'InvertedIndex', 'Document'],
    modelHints: ['Ranker'],
  }),

  // ───────────────────────── 220 ─────────────────────────
  pack({
    slug: 'ref-split-chat-media',
    title: 'Chat Media Upload',
    difficulty: 'easy',
    order: 220,
    description:
      'ChatService mixes text messaging with media upload and storage handling. Extract a MediaService.',
    tags: ['chat', 'extract', 'srp'],
    scenario: 'extract',
    maxNewAbstractions: 2,
    nodes: [
      node('n1', 'el-cc', 'ChatController', pos(0, 0), [
        m('postMessage', 'void', [{ name: 'req', type: 'MessageRequest' }]),
        m('postAttachment', 'void', [{ name: 'req', type: 'UploadRequest' }]),
      ]),
      node('n2', 'el-cs', 'ChatService', pos(1, 0), [
        m('sendText', 'Message', [{ name: 'chatId', type: 'String' }, { name: 'text', type: 'String' }]),
        m('uploadMedia', 'Message', [{ name: 'chatId', type: 'String' }, { name: 'file', type: 'byte[]' }, { name: 'mimeType', type: 'String' }]),
        m('validateMime', 'boolean', [{ name: 'mimeType', type: 'String' }]),
        m('buildMediaUrl', 'String', [{ name: 'key', type: 'String' }]),
      ], [
        { name: 'maxUploadBytes', type: 'long' },
        { name: 'allowedMimeTypes', type: 'Set<String>' },
      ]),
      node('n3', 'el-mr', 'MessageRepository', pos(1, 1), [m('save', 'void', [{ name: 'msg', type: 'Message' }]), m('findByChat', 'List<Message>', [{ name: 'chatId', type: 'String' }])]),
      node('n4', 'el-blob', 'BlobStorage', pos(2, 1), [m('put', 'String', [{ name: 'key', type: 'String' }, { name: 'data', type: 'byte[]' }]), m('getUrl', 'String', [{ name: 'key', type: 'String' }])]),
      node('n5', 'el-msg', 'Message', pos(0, 1), [m('getSender', 'String'), m('getContent', 'String'), m('getType', 'String')]),
    ],
    edges: [
      edge('e1', 'ed-cc-cs', 'n1', 'n2', 'dependency', 'right', 'left'),
      edge('e2', 'ed-cs-mr', 'n2', 'n3'),
      edge('e3', 'ed-cs-blob', 'n2', 'n4'),
      edge('e4', 'ed-cs-msg', 'n2', 'n5', 'dependency', 'left', 'top'),
    ],
    briefing: brief({
      going:
        'ChatService sends plain text messages and also handles file uploads: it validates mime types and size limits, pushes bytes into BlobStorage and builds the media URL before saving the message.',
      problem:
        'Text chat and media handling have very different concerns (limits, virus scans, thumbnails, CDN URLs). Growing media features bloat ChatService, and text-only code paths now carry upload configuration.',
      todo:
        'Extract a media-focused service that owns validation, storage and URL building, and let ChatService (or the controller) use it for attachments. Text sending and attachment sending must both still persist a Message.',
      start:
        'Pick out uploadMedia, validateMime, buildMediaUrl and the two upload-related fields. They all revolve around BlobStorage; sendText does not touch it.',
    }),
    requirements: [
      'Upload validation, storage and URL building are outside ChatService',
      'sendText still saves a text Message',
      'Attachments still end up in BlobStorage and produce a saved Message',
    ],
    constraints: [
      'Do not remove ChatController, ChatService, MessageRepository, BlobStorage or Message',
      'Existing behavior must remain',
      'Keep text messaging free of upload configuration',
      'Do not introduce more than 2 new abstractions',
    ],
    flows: [
      {
        id: 'send-text',
        label: 'Send text message',
        steps: ['Controller receives text', 'Service builds the message', 'Message is saved'],
        mustKeepElementNames: ['ChatController', 'ChatService', 'MessageRepository', 'Message'],
        mustReach: [
          { from: 'ChatController', to: 'ChatService' },
          { from: 'ChatService', to: 'MessageRepository' },
        ],
        mustHavePathTopics: ['sendtext'],
      },
      {
        id: 'send-media',
        label: 'Send media attachment',
        steps: ['Controller receives an upload', 'Media is validated and stored', 'Message with media URL is saved'],
        mustKeepElementNames: ['BlobStorage'],
        mustReach: [
          { from: 'ChatController', to: 'BlobStorage' },
          { from: 'ChatController', to: 'MessageRepository' },
        ],
        mustHavePathTopics: ['uploadmedia', 'put'],
      },
    ],
    forbidDeleteElementNames: ['ChatController', 'ChatService', 'MessageRepository', 'BlobStorage', 'Message'],
    modelHints: ['MediaService'],
  }),

  // ───────────────────────── 221 ─────────────────────────
  pack({
    slug: 'ref-decouple-firebase-auth',
    title: 'Auth Firebase Binding',
    difficulty: 'easy',
    order: 221,
    description:
      'AuthService calls FirebaseAuth directly. Put an auth provider port between them.',
    tags: ['auth', 'decouple', 'ports-adapters'],
    scenario: 'decouple',
    maxNewAbstractions: 2,
    nodes: [
      node('n1', 'el-ac', 'AuthController', pos(0, 0), [
        m('login', 'Session', [{ name: 'email', type: 'String' }, { name: 'password', type: 'String' }]),
        m('logout', 'void', [{ name: 'sessionId', type: 'String' }]),
      ]),
      node('n2', 'el-as', 'AuthService', pos(1, 0), [
        m('login', 'Session', [{ name: 'email', type: 'String' }, { name: 'password', type: 'String' }]),
        m('logout', 'void', [{ name: 'sessionId', type: 'String' }]),
        m('verifyToken', 'boolean', [{ name: 'token', type: 'String' }]),
      ], [{ name: 'firebase', type: 'FirebaseAuth' }]),
      node('n3', 'el-fb', 'FirebaseAuth', pos(2, 0), [
        m('signInWithEmailAndPassword', 'FirebaseUser', [{ name: 'email', type: 'String' }, { name: 'password', type: 'String' }]),
        m('verifyIdToken', 'FirebaseToken', [{ name: 'idToken', type: 'String' }]),
        m('revokeRefreshTokens', 'void', [{ name: 'uid', type: 'String' }]),
      ]),
      node('n4', 'el-ss', 'SessionStore', pos(1, 1), [
        m('save', 'void', [{ name: 'session', type: 'Session' }]),
        m('find', 'Session', [{ name: 'sessionId', type: 'String' }]),
        m('delete', 'void', [{ name: 'sessionId', type: 'String' }]),
      ]),
    ],
    edges: [
      edge('e1', 'ed-ac-as', 'n1', 'n2', 'dependency', 'right', 'left'),
      edge('e2', 'ed-as-fb', 'n2', 'n3', 'dependency', 'right', 'left'),
      edge('e3', 'ed-as-ss', 'n2', 'n4'),
    ],
    briefing: brief({
      going:
        'AuthController hands credentials to AuthService. The service signs users in through FirebaseAuth (using Firebase method names and token types), verifies tokens with it, and keeps sessions in SessionStore.',
      problem:
        'The core login/logout logic speaks Firebase directly. Moving to Auth0, Cognito or an in-house identity provider — or even testing locally without Firebase credentials — requires rewriting AuthService.',
      todo:
        'Define what AuthService needs from an identity provider and have it depend only on that. Keep Firebase as one implementation. Login, logout and token verification must behave exactly as before.',
      start:
        'List the three Firebase calls AuthService makes and rename them into provider-neutral operations (authenticate, verify, revoke). The abstraction is born from that list.',
    }),
    requirements: [
      'AuthService depends on a provider abstraction, not on FirebaseAuth',
      'Login, logout and verifyToken still work end-to-end',
      'Swapping the identity provider requires no change to AuthService or AuthController',
    ],
    constraints: [
      'Do not remove AuthController, AuthService, FirebaseAuth or SessionStore',
      'Existing behavior must remain',
      'Firebase-specific types must not leak outside the Firebase adapter',
      'Do not introduce more than 2 new abstractions',
    ],
    flows: [
      {
        id: 'login',
        label: 'Log in',
        steps: ['Controller passes credentials', 'Provider authenticates the user', 'Session is stored'],
        mustKeepElementNames: ['AuthController', 'AuthService', 'SessionStore'],
        mustReach: [
          { from: 'AuthController', to: 'AuthService' },
          { from: 'AuthService', to: 'SessionStore' },
        ],
        mustHavePathTopics: ['login', 'session'],
      },
      {
        id: 'verify-token',
        label: 'Verify token and log out',
        steps: ['Provider validates the token', 'Logout revokes tokens and deletes the session'],
        mustKeepElementNames: ['FirebaseAuth'],
        mustReach: [{ from: 'AuthController', to: 'SessionStore' }],
        mustHavePathTopics: ['verifytoken', 'logout'],
      },
    ],
    forbidDeleteElementNames: ['AuthController', 'AuthService', 'FirebaseAuth', 'SessionStore'],
    modelHints: ['AuthProviderPort', 'FirebaseAuthProvider'],
  }),
]
