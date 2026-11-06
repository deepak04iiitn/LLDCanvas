import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, enm, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  // Left: façade + the failures it can surface
  cls('ws', 'WalletService', GRID.x(0), GRID.y(0), [
    attr('-', 'wallets', 'Map<String, Wallet>'),
    attr('-', 'registryLock', 'Lock'),
  ], [
    method('+', 'createWallet', 'owner: String', 'String'),
    method('+', 'deposit', 'walletId, amount', 'Transaction'),
    method('+', 'withdraw', 'walletId, amount', 'Transaction'),
    method('+', 'getBalance', 'walletId', 'long'),
    method('+', 'getHistory', 'walletId', 'List<Transaction>'),
  ], 'facade'),
  cls('ex', 'InsufficientFundsError', GRID.x(0), GRID.y(1.6), [
    attr('-', 'requested', 'long'),
    attr('-', 'available', 'long'),
  ], [], 'exception'),

  // Centre: the aggregate root and its ledger
  cls('wl', 'Wallet', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'String'),
    attr('-', 'owner', 'String'),
    attr('-', 'ledger', 'Ledger'),
    attr('-', 'lock', 'Lock'),
  ], [
    method('+', 'applyTransaction', 'type, amount', 'Transaction'),
    method('+', 'balance', '', 'long'),
    method('+', 'history', '', 'List<Transaction>'),
  ], 'aggregate root'),
  cls('lg', 'Ledger', GRID.x(1), GRID.y(1.6), [
    attr('-', 'entries', 'List<Transaction>'),
  ], [
    method('+', 'append', 'tx: Transaction', 'void'),
    method('+', 'entries', '', 'List<Transaction>'),
    method('+', 'balance', '', 'long'),
  ], 'append-only'),

  // Right: immutable records
  enm('tt', 'TransactionType', GRID.x(2), GRID.y(0), ['DEPOSIT', 'WITHDRAWAL']),
  cls('tx', 'Transaction', GRID.x(2), GRID.y(1.6), [
    attr('-', 'id', 'String'),
    attr('-', 'walletId', 'String'),
    attr('-', 'type', 'TransactionType'),
    attr('-', 'amount', 'long'),
    attr('-', 'balanceAfter', 'long'),
    attr('-', 'timestamp', 'DateTime'),
    attr('-', 'seq', 'long'),
  ], [], 'immutable'),
]

const edges = [
  edge('e1', 'ws', 'wl', 'composition', 'right@30', 'left@30', { sourceMultiplicity: '1', targetMultiplicity: '0..*' }),
  edge('e2', 'wl', 'lg', 'composition', 'bottom', 'top', { sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e3', 'lg', 'tx', 'aggregation', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '0..*', label: 'appends' }),
  edge('e4', 'tx', 'tt', 'dependency', 'top', 'bottom'),
  edge('e5', 'wl', 'ex', 'dependency', 'left@80', 'right', { label: 'throws' }),
]

//@@py

//@@java

//@@ts

//@@cpp

//@@goCode

//@@csharp

export const digitalWalletSolution: ProblemSolution = {
  slug: 'digital-wallet',
  title: 'Design a Digital Wallet (Single Currency) - Complete LLD Guide',
  overview: {
    introduction: [
      'A digital wallet is a small problem with a sharp edge: it is about money, and money systems are judged by their invariants rather than by their feature lists. Users can deposit, withdraw, check a balance and see a history. That is easy to sketch. What an interviewer actually wants to know is whether you can guarantee that a balance never goes negative, that history is never rewritten, and that two simultaneous withdrawals can never both succeed against the same funds.',
      'The traps are well known. Using floating-point numbers for currency. Updating a balance field from three different code paths. Checking the balance in one statement and updating it in the next, which is exactly the gap where concurrent requests sneak through. A strong answer closes each of those by construction: integer minor units, one method that is the only way to change money, and a critical section that makes “check, then write” indivisible.',
      'In this tutorial we walk the problem as you would at a whiteboard. We start with the invariants, derive the classes from them, make an append-only ledger the source of truth, scope the lock to a single wallet so unrelated wallets never wait on each other, draw the UML, and then implement a complete medium-level design in six languages with a runnable demo that includes a rejected overdraft. We also point at the seams for transfers, idempotency and persistence, since those are the natural follow-ups.',
      'We stay inside the practice-problem brief: create a wallet with a zero balance, deposit, withdraw when funds are sufficient, view the balance, view a chronological history and prevent overdraft - with atomic updates under concurrency and an immutable history. Multi-currency, transfers, holds and refunds are discussed as extensions, not built.',
    ],
    constraints: [
      'A wallet starts with a zero balance and can be credited (deposit) and debited (withdraw).',
      'A withdrawal succeeds only if the balance is sufficient; the balance can never go negative.',
      'The current balance can be queried at any time and always equals the sum of the ledger.',
      'History is returned in chronological order; entries are never edited or deleted once written.',
      'Concurrent operations on one wallet must not lose updates or corrupt the balance or the ledger.',
    ],
    assumptions: [
      'One currency per wallet; multi-currency and exchange rates are out of scope.',
      'Amounts are positive integers in minor units (cents). Floating-point numbers are never used for money.',
      'Wallet-to-wallet transfers, holds and refunds are follow-ups because they need multi-wallet locking or idempotency.',
      'Storage is in-memory for the exercise; the same design maps directly to a database table plus a transaction.',
      'Wallet ids are generated by the service; authentication and authorization are handled elsewhere.',
      'A wallet that does not exist raises a clear “wallet not found” error rather than silently creating one.',
    ],
    clarificationQuestions: [
      {
        question: 'Single currency or multi-currency? What precision should amounts have?',
        why: 'Decides the money representation. Single currency in integer minor units keeps the model exact and simple; multi-currency needs a Money value object carrying a currency.',
      },
      {
        question: 'Do we need wallet-to-wallet transfers now, and must they be atomic across two wallets?',
        why: 'Transfers require locking two wallets in a deterministic order (to avoid deadlock) or a database transaction. Knowing early avoids redesigning the lock scope.',
      },
      {
        question: 'Is there a maximum balance or a per-transaction limit?',
        why: 'Limits are additional validation inside the same critical section. They belong in applyTransaction, not scattered across callers.',
      },
      {
        question: 'Should operations be idempotent when clients retry (for example with an idempotency key)?',
        why: 'Network retries can double-apply a withdrawal. Idempotency needs a key → result map checked inside the lock.',
      },
      {
        question: 'How long must history be retained, and does it need pagination?',
        why: 'Unbounded history returned as a full list is an O(n) copy per call; pagination changes the read API.',
      },
      {
        question: 'Is this a single-node in-memory service, or backed by a database?',
        why: 'In memory we use a per-wallet lock. With a database we rely on row locks or optimistic versioning, but the Wallet-as-consistency-boundary design is identical.',
      },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'Start from the invariants, not the features',
        paragraphs: [
          'Most LLD problems are about relationships between objects. A wallet is about rules that must hold at every instant, whatever order requests arrive in. Write them on the whiteboard before drawing any class: (1) balance is never negative; (2) every change to the balance is recorded; (3) recorded history is never changed; (4) balance equals the sum of the recorded changes.',
          'Once the invariants are on the board, the design nearly writes itself. Anything that can break an invariant must be private and funnelled through one place. Anything that merely reads can be simple. If you keep pointing back at the invariants while you draw, the interviewer sees that your classes are justified, not decorative.',
        ],
        callout: {
          title: 'Interview tip',
          body: 'Say it as a sentence: “There will be exactly one method that can change a balance, and it validates and records in the same critical section.” That is the whole answer to correctness under concurrency.',
        },
      },
      {
        heading: 'Money is an integer',
        paragraphs: [
          'Decide the representation first, because it infects everything. A double cannot represent 0.10 exactly, so 0.1 + 0.2 ≠ 0.3 and a ledger of such numbers will drift. Store money as an integer count of minor units - cents for dollars, paise for rupees. A deposit of 10,000 means 100.00. Comparison, addition and subtraction are then exact, and “is the balance sufficient?” is a plain integer comparison.',
          'Reject non-positive amounts at the boundary. A zero or negative “deposit” is a withdrawal in disguise and would bypass the overdraft check. Validation lives in applyTransaction so no caller can forget it.',
        ],
      },
      {
        heading: 'The ledger is the source of truth',
        paragraphs: [
          'There are two ways to store balances: keep a mutable balance field and update it, or record every change as an immutable entry and derive the balance. The second is the one accountants use and the one that makes history, audit and chronological ordering free. Each Transaction records its type, amount, a timestamp, a per-wallet sequence number and - crucially - the balance after it was applied.',
          'Storing balanceAfter on every entry makes the current balance an O(1) read (the last entry’s balanceAfter) and makes every entry self-auditing. The ledger is append-only: the only mutation is append, and reading history returns a defensive copy so a caller cannot rewrite the past.',
        ],
      },
      {
        heading: 'One method changes money: applyTransaction',
        paragraphs: [
          'Wallet owns the ledger and exposes applyTransaction(type, amount). Inside a single critical section it reads the current balance, checks the rule (a withdrawal must not exceed the balance), computes the new balance and appends the entry. Deposit and withdraw are thin wrappers that pass a different type.',
          'The critical section is the whole point. If the check and the write were separate steps, two concurrent withdrawals of 80 against a balance of 100 could both pass the check and both be applied, leaving −60. Making check-then-write atomic closes that race for good.',
        ],
        numbered: [
          'Validate: amount is a positive integer.',
          'Lock the wallet.',
          'Read the current balance from the ledger.',
          'If withdrawal and amount > balance → throw InsufficientFundsError.',
          'Compute new balance, build an immutable Transaction (with balanceAfter and seq).',
          'Append to the ledger and unlock.',
        ],
      },
      {
        heading: 'Lock scope: per wallet, not global',
        paragraphs: [
          'A single global lock would be correct, but it would make every wallet wait for every other. Two different users depositing at the same time have nothing to coordinate. So each Wallet owns its own lock: operations on one wallet are strictly serialized, operations on different wallets run in parallel.',
          'The registry - the map of wallets inside WalletService - is shared, so it gets its own short-lived lock that is held only for lookup and insert. We always release the registry lock before taking the wallet lock, so the two locks are never held together and cannot deadlock.',
        ],
      },
      {
        heading: 'Entities, relationships and what to leave out',
        paragraphs: [
          'WalletService is the façade callers use: createWallet, deposit, withdraw, getBalance, getHistory. It composes the Wallets it creates. Wallet composes exactly one Ledger. Ledger aggregates Transactions that are only ever appended. Transaction is an immutable value with a TransactionType. InsufficientFundsError is a typed domain error carrying the requested and available amounts so callers can show a precise message.',
          'Leave out transfers, currencies, limits and persistence until asked - but be ready to say where each goes. Showing the seam without building it is the right depth for a medium round.',
        ],
      },
      {
        heading: 'Step-by-step path to the final diagram',
        paragraphs: [
          'Draw Wallet in the middle as the aggregate root. Put WalletService on the left with a composition edge to Wallet, and the exception below it. Below Wallet draw Ledger, and to its right Transaction with TransactionType above it. Narrate: “every mutation goes through Wallet, which takes its lock, validates, and appends to the ledger.”',
          'Code in this order: money representation and Transaction, Ledger.append/balance/entries, Wallet.applyTransaction, WalletService wrappers, and finally the demo with a rejected overdraft. Then talk about concurrency, transfers and databases.',
        ],
        numbered: [
          'State the invariants and the money representation.',
          'Define the immutable Transaction and the append-only Ledger.',
          'Implement Wallet.applyTransaction under a per-wallet lock.',
          'Wrap in WalletService (create, deposit, withdraw, balance, history).',
          'Demo including an overdraft rejection and history.',
          'Discuss transfers, idempotency, persistence.',
        ],
      },
    ],
    entities: [
      { name: 'WalletService', responsibility: 'Façade: create wallet, deposit, withdraw, balance and history; owns the wallet registry.', keyMembers: ['createWallet', 'deposit', 'withdraw', 'getBalance', 'getHistory'] },
      { name: 'Wallet', responsibility: 'Aggregate root. Owns a ledger and a lock; enforces the no-overdraft invariant in applyTransaction.', keyMembers: ['applyTransaction', 'balance', 'history'] },
      { name: 'Ledger', responsibility: 'Append-only transaction list; derives the current balance from the last entry.', keyMembers: ['append', 'entries', 'balance'] },
      { name: 'Transaction', responsibility: 'Immutable record of one balance change with the resulting balance and a sequence number.', keyMembers: ['type', 'amount', 'balanceAfter', 'seq'] },
      { name: 'TransactionType', responsibility: 'DEPOSIT or WITHDRAWAL.' },
      { name: 'InsufficientFundsError', responsibility: 'Domain error carrying the requested and available amounts.', keyMembers: ['requested', 'available'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption:
    'Centre: Wallet, the aggregate root, owns exactly one append-only Ledger. Right: the immutable Transaction records and their type. Left: WalletService (the façade that owns the registry) and the typed overdraft error. Spacing follows the 340×260 grid so composition and aggregation arrows stay readable.',
  designExplanation: {
    sections: [
      {
        heading: 'Architecture in one paragraph',
        paragraphs: [
          'Wallet is the aggregate root that guards the invariant “balance ≥ 0”. Every change flows through one method that locks the wallet, validates, and appends an immutable ledger entry carrying the new balance. History and balance are just reads of that ledger, so they cannot drift apart. WalletService is a thin façade that finds the right wallet and delegates; it never touches balances itself.',
        ],
      },
      {
        heading: 'Why Wallet is the consistency boundary',
        paragraphs: [
          'In domain-driven terms, a wallet and its ledger are an aggregate: they must always be consistent with each other, and outsiders may touch only the root. If a caller could append directly to the ledger it could bypass the overdraft check, and if it could set a balance field it could desynchronize the balance from the history. By making Ledger accessible only through Wallet, there is no code path that changes one without the other.',
          'This is also why the lock lives on Wallet, not on Ledger: the unit of atomicity is “validate against the balance, then append,” and that sequence spans both the rule and the storage.',
        ],
      },
      {
        heading: 'The ledger and balanceAfter',
        paragraphs: [
          'The ledger is a list with exactly three operations: append, read a defensive copy of the entries, and read the balance. The balance is the last entry’s balanceAfter, or zero when the list is empty. Because each entry’s balanceAfter equals the previous balanceAfter plus or minus the amount, the ledger is self-checking; you can replay it at any time and compare.',
          'The slight redundancy of storing balanceAfter is worth it: reading the balance is O(1), and an auditor can look at any single row and see the state of the wallet at that moment. The redundancy is safe because the value is computed and written inside the same critical section as the append.',
        ],
      },
      {
        heading: 'Two locks, never nested',
        paragraphs: [
          'WalletService holds a registry lock only while it looks up or inserts into the map of wallets, and releases it before delegating to the wallet. Wallet holds its own lock for the whole read-validate-append sequence. Because the service never holds the registry lock while calling into a wallet, and a wallet never calls back into the service, the two locks are never held at the same time, and lock-ordering deadlocks cannot happen.',
          'Transfers will change this: they need two wallet locks at once. The standard rule is to always acquire them in a deterministic order (for example by wallet id) so two opposing transfers cannot each hold one and wait for the other.',
        ],
      },
      {
        heading: 'Typed failures instead of booleans',
        paragraphs: [
          'A withdrawal that exceeds the balance throws InsufficientFundsError carrying both the requested and the available amounts. An invalid amount raises a validation error, and an unknown wallet id raises a wallet-not-found error. Typed errors let callers react precisely - show “you have 75.00 available” - and keep the success path free from status-code juggling.',
        ],
      },
      {
        heading: 'What we deliberately did not do',
        paragraphs: [
          'No transfers, no currencies, no limits, no database. Each has a clear home: transfers are a new service method that locks two wallets in order and appends a debit and a credit sharing a transfer id; currencies turn amount into a Money value object; limits are extra checks in applyTransaction; persistence replaces the in-memory Ledger with a repository behind the same interface.',
        ],
      },
    ],
    classResponsibilities: [
      { name: 'WalletService', responsibility: 'Entry point; resolves the wallet and delegates. Owns a registry guarded separately from wallet locks.', keyMembers: ['createWallet', 'deposit', 'withdraw'] },
      { name: 'Wallet', responsibility: 'Atomic validate-and-apply plus balance and history reads under its own lock.', keyMembers: ['applyTransaction', 'balance', 'history'] },
      { name: 'Ledger', responsibility: 'Append-only storage; returns copies so callers cannot mutate history.', keyMembers: ['append', 'entries', 'balance'] },
      { name: 'Transaction', responsibility: 'Immutable audit record with a per-wallet sequence number and balanceAfter.', keyMembers: ['balanceAfter', 'seq'] },
      { name: 'InsufficientFundsError', responsibility: 'Explicit, typed failure for overdraft attempts.', keyMembers: ['requested', 'available'] },
    ],
    patterns: [
      {
        name: 'Aggregate / Domain model',
        why: 'The wallet and its ledger must change together or not at all; one object must be the gatekeeper.',
        howApplied: 'Wallet is the only public way to change money; Ledger has no public mutators other than append used by Wallet.',
      },
      {
        name: 'Append-only log (event-sourcing-lite)',
        why: 'Gives auditability, trivial chronological history and a derived balance.',
        howApplied: 'Every change is a new immutable Transaction; the balance is read from the last entry.',
      },
      {
        name: 'Façade',
        why: 'Callers should not look up wallets, manage locks or build transactions.',
        howApplied: 'WalletService exposes five operations and hides the registry and locking.',
      },
      {
        name: 'Immutable value objects',
        why: 'A recorded transaction must never change; immutability makes that a language guarantee.',
        howApplied: 'Transaction is a frozen/readonly record, and history() returns copies.',
      },
    ],
    decisions: [
      {
        decision: 'Integer minor units instead of floating point or decimal strings.',
        rationale: 'Exact arithmetic with no rounding surprises and trivial comparison.',
        alternativeRejected: 'double/float (inexact) or arbitrary-precision decimals in the core (heavier, unnecessary for one currency).',
        tradeoff: 'Callers convert at the boundary and the currency exponent must be known.',
      },
      {
        decision: 'Store balanceAfter on every ledger entry.',
        rationale: 'Balance read is O(1) and every row is self-auditing.',
        alternativeRejected: 'Summing the whole ledger on every read - O(n) and unnecessary.',
        tradeoff: 'Slight redundancy; must be written inside the same critical section as the append.',
      },
      {
        decision: 'Per-wallet lock rather than one global lock.',
        rationale: 'Operations on different wallets run in parallel; operations on one wallet are strictly serialized.',
        alternativeRejected: 'A global mutex - correct but needlessly serializes unrelated users.',
        tradeoff: 'Transfers touching two wallets need a lock-ordering rule to avoid deadlock.',
      },
      {
        decision: 'Validate and append in one critical section.',
        rationale: 'Closes the check-then-act race that would let two concurrent withdrawals overdraw.',
        alternativeRejected: 'Check balance outside the lock and “fix up” on conflict - brittle and easy to get wrong.',
        tradeoff: 'Lock hold time includes the append; negligible in memory, but with I/O prefer a database transaction.',
      },
      {
        decision: 'history() returns a copy, not the internal list.',
        rationale: 'Preserves the append-only guarantee even if a caller mutates the returned list.',
        tradeoff: 'O(n) copy per call; add pagination or immutable persistent lists if histories grow large.',
      },
      {
        decision: 'Typed InsufficientFundsError carrying requested and available.',
        rationale: 'Lets callers present a precise message and keeps the success path simple.',
        tradeoff: 'Callers must handle exceptions (or result types in languages without them).',
      },
    ],
    solid: {
      paragraphs: [
        'Single Responsibility: Ledger stores, Wallet enforces rules and locking, WalletService routes. A change in storage touches Ledger only; a change in rules touches Wallet only.',
        'Open/Closed: new transaction types (FEE, REFUND, INTEREST) are new enum values and rules in applyTransaction without rewriting the ledger or the service.',
        'Liskov Substitution: any alternative Ledger (for example database-backed) must preserve append order, immutability of entries and the balanceAfter contract; otherwise Wallet’s assumptions break.',
        'Interface Segregation: callers see five service operations; Ledger exposes only append, entries and balance.',
        'Dependency Inversion: Wallet can depend on a ledger abstraction (a repository interface) when persistence arrives, without changing its logic.',
      ],
    },
    extensibility: [
      'Transfers: add transfer(from, to, amount) to WalletService. Lock both wallets in a deterministic order (by id), apply a withdrawal on one and a deposit on the other, and tag both entries with a shared transfer id.',
      'Idempotency: accept a client key; inside the lock, check a key → transaction map and return the earlier result for a repeated key.',
      'Persistence: replace the in-memory Ledger with a repository; use a database transaction (SELECT … FOR UPDATE) or optimistic concurrency on the sequence number for atomicity.',
      'Multi-currency: replace long amounts with a Money value object carrying a currency and keep one ledger per currency.',
    ],
  },
  implementationIntro: [
    'The six implementations share the same structure: an immutable Transaction, an append-only Ledger that hands out copies, a Wallet that validates and appends under its own lock, and a thin WalletService that owns the registry. Amounts are integer minor units everywhere.',
    'Each demo creates a wallet, deposits 100.00, withdraws 25.00, attempts to withdraw more than the remaining 75.00 (rejected with an insufficient-funds error), and prints the balance and the chronological history.',
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
      'The service creates a wallet for “alice”; its ledger is empty, so the balance is 0. A deposit of 10,000 minor units goes through applyTransaction: the amount is validated, the wallet lock is taken, the current balance (0) is read, the new balance becomes 10,000, and a Transaction with seq 1 and balanceAfter 10,000 is appended. Then a withdrawal of 2,500: the balance 10,000 is sufficient, the new balance is 7,500, and a seq-2 entry is appended.',
      'A third request tries to withdraw 9,999. Inside the lock the balance is 7,500, which is less than the amount, so InsufficientFundsError(requested=9,999, available=7,500) is thrown and nothing is appended - the ledger and the balance are exactly as before. getBalance now returns 7,500 (the last entry’s balanceAfter) and getHistory returns the two recorded entries in order.',
    ],
    steps: [
      'createWallet generates an id, builds a Wallet with an empty Ledger and registers it under the registry lock.',
      'deposit / withdraw look the wallet up (registry lock, released immediately) and call applyTransaction.',
      'applyTransaction validates the amount is a positive integer.',
      'It takes the wallet lock, reads the balance, enforces the overdraft rule and computes the new balance.',
      'It builds an immutable Transaction (type, amount, balanceAfter, timestamp, seq) and appends it to the ledger.',
      'getBalance returns the last entry’s balanceAfter (or 0); getHistory returns a copy of the entries in append order.',
    ],
    examples: [
      {
        title: 'Deposit then withdraw',
        input: 'deposit(10000); withdraw(2500)',
        output: 'Entries: #1 DEPOSIT 10000 → 10000; #2 WITHDRAWAL 2500 → 7500; balance = 7500',
        explanation: 'Each entry stores the resulting balance, so the balance is simply the last entry’s balanceAfter and every row can be audited on its own.',
      },
      {
        title: 'Overdraft rejected',
        input: 'withdraw(9999) with a balance of 7500',
        output: 'InsufficientFundsError(requested=9999, available=7500); ledger unchanged',
        explanation: 'The check happens inside the critical section before anything is written, so a rejected request leaves no partial state.',
      },
      {
        title: 'Concurrent withdrawals',
        input: 'Two threads withdraw 80 at the same time against a balance of 100',
        output: 'Exactly one succeeds (balance 20); the other throws InsufficientFundsError',
        explanation: 'The per-wallet lock serializes them: the first sees 100 and succeeds; the second then sees 20 and is rejected. Without the lock both could read 100 and both succeed.',
      },
      {
        title: 'Invalid amount',
        input: 'deposit(0) or withdraw(-5)',
        output: 'Validation error; nothing recorded',
        explanation: 'Non-positive amounts are rejected before locking. A negative deposit would otherwise bypass the overdraft check.',
      },
    ],
  },
  followUps: [
    {
      question: 'How would you implement wallet-to-wallet transfers safely?',
      answer: 'Add transfer(from, to, amount). Lock both wallets in a deterministic order - for example by comparing ids - so two opposing transfers cannot deadlock. Inside both locks, check the source balance, append a withdrawal to the source and a deposit to the destination, and tag both entries with a shared transfer id. Either both entries are appended or neither is. With a database, wrap it in one transaction.',
    },
    {
      question: 'How do you make deposits and withdrawals idempotent?',
      answer: 'Require the client to send an idempotency key. Inside the wallet lock, check a map from key to the resulting transaction; if the key exists, return that transaction instead of applying the operation again. Store keys with the ledger entries (or in a table with a unique constraint) so that retries after a timeout cannot double-charge.',
    },
    {
      question: 'Why integer minor units instead of a decimal or double?',
      answer: 'A double cannot represent most decimal fractions exactly, so sums drift. Integer minor units make arithmetic and comparisons exact and cheap. The cost is converting at the boundary and knowing the currency’s exponent (2 for USD, 0 for JPY, 3 for KWD). For multi-currency, wrap it in a Money value object holding the amount and currency.',
    },
    {
      question: 'What would change if this were backed by a database?',
      answer: 'The per-wallet lock becomes a row lock (SELECT … FOR UPDATE on the wallet row) or an optimistic version check (UPDATE … WHERE version = ?). Ledger entries become rows in an append-only table, written in the same transaction as the balance update. The Wallet-as-consistency-boundary design is unchanged; only the mechanism that provides atomicity moves into the database.',
    },
    {
      question: 'Why store balanceAfter in each entry if it can be derived?',
      answer: 'It turns the balance read into an O(1) lookup and makes each row independently auditable. The redundancy is safe because it is computed and written inside the same critical section as the append. You can still verify integrity by replaying the ledger and comparing to the stored values.',
    },
    {
      question: 'How would you handle a very long history?',
      answer: 'Return pages instead of the full list: history(limit, beforeSeq). Because entries have a monotonically increasing per-wallet sequence number, cursor-based pagination is trivial. For very old data, archive to cold storage and keep periodic checkpoint balances so you never need to replay from the beginning.',
    },
    {
      question: 'How would you add fees or refunds?',
      answer: 'Add FEE and REFUND to TransactionType and extend applyTransaction with the rules for them - a fee might be allowed to overdraw, a refund must reference the original transaction id. The ledger and service are unchanged because they treat transactions uniformly. A refund must never edit the original entry; it appends a new compensating one.',
    },
    {
      question: 'How would you test this?',
      answer: 'Unit tests for validation, overdraft and exact boundaries (withdraw exactly the balance succeeds, one more fails). Property-style tests: after any sequence of operations, balance equals the sum of deposits minus withdrawals and history is strictly increasing in seq. A concurrency test with many threads depositing and withdrawing, asserting that the final balance matches the sum of successful operations and never goes negative. Inject a clock to make timestamps deterministic.',
    },
  ],
  extras: {
    edgeCases: {
      paragraphs: [
        'Money code earns its reputation in the corners. These are the ones to mention.',
      ],
      bullets: [
        'Withdrawing exactly the balance succeeds and leaves zero; one unit more fails.',
        'Zero, negative or non-integer amounts are rejected before any state changes.',
        'Unknown wallet id raises wallet-not-found rather than creating a wallet implicitly.',
        'Two concurrent withdrawals that together exceed the balance: exactly one succeeds.',
        'A caller mutating the list returned by history() must not alter the ledger.',
        'Integer overflow on extreme amounts: in fixed-width languages, check bounds (or use 64-bit and cap deposits).',
      ],
    },
    commonMistakes: {
      paragraphs: [
        'The classic failures are check-then-act races and sloppy money types.',
      ],
      bullets: [
        'Using floating-point numbers for currency.',
        'Checking the balance outside the lock and updating inside it.',
        'Exposing a setBalance method or a public mutable ledger so invariants can be bypassed.',
        'Holding the registry lock while performing wallet operations, creating lock-ordering risk.',
        'Returning the internal history list so callers can rewrite the past.',
        'Using one global lock and calling it “thread-safe” without discussing throughput.',
      ],
    },
    complexity: [
      'deposit/withdraw: O(1) amortized (append plus a constant-time balance read). getBalance: O(1). getHistory: O(n) because of the defensive copy.',
      'Space: O(n) transactions per wallet.',
    ],
    testing: {
      paragraphs: [
        'Test the invariants directly rather than only the happy path.',
      ],
      numbered: [
        'Deposit/withdraw produce exactly one ledger entry each with the right balanceAfter and increasing seq.',
        'Overdraft by one unit is rejected and leaves the ledger unchanged.',
        'Withdraw of exactly the balance succeeds.',
        'Invalid amounts are rejected before locking.',
        'N concurrent withdrawals against a limited balance: successes × amount ≤ initial balance and balance ≥ 0.',
        'history() mutation does not affect the ledger.',
      ],
    },
    extensions: [
      'Wallet-to-wallet transfers with ordered locking.',
      'Idempotency keys for retry safety.',
      'Multi-currency Money value object and per-currency ledgers.',
      'Per-transaction and daily limits.',
      'Persistent ledger with database transactions and paginated history.',
    ],
    takeaways: [
      'Design from invariants: no overdraft, no lost updates, no rewritten history.',
      'Money is an integer in minor units.',
      'One method changes money, and it validates and appends inside one critical section.',
      'The append-only ledger is the truth; balance is derived (balanceAfter makes it O(1)).',
      'Lock per wallet, never nest the registry lock with a wallet lock.',
    ],
  },
}
