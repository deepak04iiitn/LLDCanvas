/**
 * Learn modes catalog: detective (idempotent by slug).
 * Run: npx tsx src/scripts/seed-learn-modes.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { DetectiveScenario } from '../models/learn/detective-scenario.model'

type Diff = 'easy' | 'medium' | 'hard'
type Mode = 'identify' | 'detect' | 'explain'

function det(
  order: number, slug: string, title: string, mode: Mode, difficulty: Diff,
  stem: string, answer: string, choices: string[], explanation: string,
  description: string, codeSnippets: Record<string, string>,
) {
  return {
    slug, title, mode, difficulty, stem, answer, choices, explanation,
    description, codeSnippets,
    codeSnippet: codeSnippets.cpp ?? codeSnippets.ts ?? '',
    status: 'published' as const, order,
  }
}

const scenarios = [
  det(1, 'strategy-pricing', 'Swap pricing without touching Ride', 'identify', 'easy',
    'Ride has if/else for economy, premium, surge. New rules without editing Ride — which pattern?',
    'strategy', ['strategy', 'singleton', 'observer', 'none'],
    'Strategy encapsulates interchangeable algorithms.',
    'A Ride class calculates fares using if/else chains. Every new pricing rule (e.g. "off-peak") requires editing the same method. How do you design it so new rules plug in without touching Ride?',
    {
      cpp: `class Ride {
    double calculateFare(string type, double km) {
        if (type == "economy")  return km * 1.0;
        if (type == "premium")  return km * 2.0;
        if (type == "surge")    return km * 3.5;
        throw invalid_argument("Unknown type");
    }
};`,
      ts: `class Ride {
  calculateFare(type: string, km: number): number {
    if (type === 'economy')  return km * 1.0
    if (type === 'premium')  return km * 2.0
    if (type === 'surge')    return km * 3.5
    throw new Error('Unknown type')
  }
}`,
    }),

  det(2, 'simple-dto-trap', 'When no pattern is needed', 'detect', 'medium',
    'PaymentRequest has amount, currency, merchantId — no behaviour. Teammate wants a pattern. Recommend?',
    'none', ['factory', 'builder', 'singleton', 'none'],
    'Plain DTO does not need a GoF pattern.',
    'A teammate sees a simple data class with three string fields and wants to wrap it in a design pattern. The class has no logic, no constructor complexity, and no variation. What is the right advice?',
    {
      cpp: `struct PaymentRequest {
    double amount;
    string currency;
    string merchantId;
    // Pure data bag — no behaviour
};`,
      ts: `class PaymentRequest {
  amount: number
  currency: string
  merchantId: string
  // Pure data bag — no methods, no logic
}`,
    }),

  det(3, 'observer-order-status', 'Order status fan-out', 'identify', 'easy',
    'Email, SMS, and analytics must react when Order becomes PAID without Order importing each one.',
    'observer', ['observer', 'singleton', 'flyweight', 'prototype'],
    'Observer / events: one publisher, many subscribers.',
    'When an order is marked as paid, the system must notify email, SMS, and analytics. Currently Order calls each service directly, creating tight coupling. What pattern removes these hard dependencies?',
    {
      cpp: `class Order {
    void markPaid() {
        status = "paid";
        EmailService::send(id, "paid");    // tight coupling
        SmsService::notify(userId, "paid");
        Analytics::track("order_paid", id);
    }
};`,
      ts: `class Order {
  markPaid() {
    this.status = 'paid'
    EmailService.send(this.id, 'paid')    // tight coupling
    SmsService.notify(this.userId, 'paid')
    Analytics.track('order_paid', this.id)
  }
}`,
    }),

  det(4, 'factory-payment-gateway', 'Create gateways from config', 'identify', 'easy',
    "Callers should not new RazorpayGateway vs StripeGateway — config chooses implementation.",
    'factory', ['factory', 'memento', 'iterator', 'visitor'],
    'Factory encapsulates creation.',
    'Every call site decides which payment gateway class to instantiate using its own if/else. Switching providers or adding a new one requires hunting down every new RazorpayGateway call. Which pattern centralises this decision?',
    {
      cpp: `// Caller decides which gateway to create:
PaymentGateway* gw;
if (config.provider == "razorpay")
    gw = new RazorpayGateway(config.key);
else
    gw = new StripeGateway(config.secret);

gw->charge(order.amount);`,
      ts: `const gw = config.provider === 'razorpay'
  ? new RazorpayGateway(config.key)
  : new StripeGateway(config.secret)

gw.charge(order.amount)`,
    }),

  det(5, 'decorator-notifier', 'Wrap notifier with logging', 'identify', 'medium',
    'Add retry + logging around any NotificationChannel without editing EmailChannel.',
    'decorator', ['decorator', 'singleton', 'bridge', 'prototype'],
    'Decorator stacks behavior.',
    'EmailChannel works but now you need to add retry logic and logging around it. You also have SmsChannel and want the same wrappers. Subclassing each channel doubles the class count. Which pattern lets you compose capabilities freely?',
    {
      cpp: `class NotificationChannel {
public:
    virtual void send(const string& msg) = 0;
};
class EmailChannel : public NotificationChannel {
public:
    void send(const string& msg) override { /* send email */ }
};
// Need: logging + retry wrappers
// Without modifying EmailChannel`,
      ts: `interface NotificationChannel {
  send(msg: string): void
}
class EmailChannel implements NotificationChannel {
  send(msg: string) { /* send email */ }
}
// Need: LoggingChannel wrapping RetryChannel wrapping EmailChannel
// Without touching EmailChannel`,
    }),

  det(6, 'adapter-stripe-sdk', 'Foreign SDK boundary', 'identify', 'easy',
    "Stripe's SDK methods do not match your PaymentPort. You write a thin wrapper.",
    'adapter', ['adapter', 'composite', 'command', 'state'],
    'Adapter translates foreign API → your port.',
    "Your codebase defines a PaymentPort interface. Stripe's official SDK has completely different method names and signatures. You want to use Stripe without changing your internal interface. What pattern bridges the gap?",
    {
      cpp: `class PaymentPort {
public:
    virtual string charge(double amount, const string& token) = 0;
};
// Stripe SDK has a completely different API:
// stripe.createPaymentIntent(amount, currency)
class StripeAdapter : public PaymentPort {
public:
    string charge(double amount, const string& token) override {
        return stripe.createPaymentIntent(amount, "usd").id;
    }
};`,
      ts: `interface PaymentPort {
  charge(amount: number, token: string): Promise<string>
}
// Stripe SDK speaks a different language:
// stripe.paymentIntents.create({ amount, currency, ... })
class StripeAdapter implements PaymentPort {
  async charge(amount: number, token: string) {
    const intent = await stripe.paymentIntents.create({ amount })
    return intent.id
  }
}`,
    }),

  det(7, 'facade-checkout', 'Simplify checkout for UI', 'identify', 'medium',
    'UI should call one CheckoutService that coordinates cart, pay, inventory — not all three.',
    'facade', ['facade', 'flyweight', 'interpreter', 'prototype'],
    'Facade simplifies a subsystem.',
    'The UI layer calls CartService, PaymentService, InventoryService, and EmailService directly to complete a checkout. Any UI screen needs to know the full orchestration. Which pattern provides a single, simple entry point?',
    {
      cpp: `// UI currently orchestrates everything itself:
void checkout(string userId) {
    auto cart = CartService::getCart(userId);
    PaymentService::charge(cart.total, userId);
    InventoryService::reserve(cart.items);
    EmailService::sendConfirmation(userId);
}`,
      ts: `async function checkout(userId: string) {
  const cart = await CartService.getCart(userId)
  await PaymentService.charge(cart.total, userId)
  await InventoryService.reserve(cart.items)
  await EmailService.sendConfirmation(userId)
  // UI knows too much
}`,
    }),

  det(8, 'singleton-misuse', 'Global current-user Singleton', 'detect', 'medium',
    'Web app stores CurrentUser in a process-wide mutable Singleton. Best call?',
    'none', ['excellent-use-of-singleton', 'none', 'observer', 'builder'],
    'Do not use Singleton for request-scoped user — prefer request context.',
    'A developer stores the logged-in user in a static Singleton so any class can access it without passing it around. On a multi-threaded web server, different concurrent requests share the same object. What is the right call?',
    {
      cpp: `class CurrentUser {
    static CurrentUser* instance;
    string userId;
public:
    static CurrentUser* get() {
        if (!instance) instance = new CurrentUser();
        return instance;
    }
};
// In handler:
CurrentUser::get()->userId = req.user.id; // Shared across ALL requests!`,
      ts: `class CurrentUser {
  private static instance: CurrentUser
  userId = ''
  static get() {
    if (!CurrentUser.instance) CurrentUser.instance = new CurrentUser()
    return CurrentUser.instance
  }
}
// In handler:
CurrentUser.get().userId = req.user.id  // shared across all requests!`,
    }),

  det(9, 'builder-query', 'Fluent query construction', 'identify', 'easy',
    'SearchQuery needs many optional filters built step-by-step.',
    'builder', ['builder', 'observer', 'proxy', 'mediator'],
    'Builder for stepwise construction.',
    'A search query can have up to 8 optional parameters. The current constructor takes them all positionally, making call sites unreadable and fragile when parameter order changes. Which pattern gives a readable, step-by-step construction API?',
    {
      cpp: `// Unreadable positional args:
SearchQuery q("laptop", "electronics",
              500, 2000, 4.0, true, "popular", 20);

// Desired fluent API:
SearchQuery q = SearchQuery::builder()
    .term("laptop")
    .category("electronics")
    .priceRange(500, 2000)
    .minRating(4.0)
    .build();`,
      ts: `// Hard to read — 8 positional arguments:
new SearchQuery('laptop', 'electronics', 500, 2000, 4.0, true, 'popular', 20)

// Desired API:
SearchQuery.builder()
  .term('laptop')
  .category('electronics')
  .priceRange(500, 2000)
  .build()`,
    }),

  det(10, 'proxy-image', 'Lazy image loading', 'identify', 'medium',
    'UI holds VirtualImage that loads real bytes on first paint and checks permissions.',
    'proxy', ['proxy', 'bridge', 'memento', 'template-method'],
    'Proxy controls access / lifetime.',
    'A gallery app loads high-resolution images from disk. Loading all images at startup is slow. You want a stand-in object that defers disk access until the image is actually painted, while implementing the same interface. What pattern is this?',
    {
      cpp: `class Image {
public:
    virtual void display() = 0;
};
class RealImage : public Image {
public:
    RealImage(string filename) {
        loadFromDisk(filename); // expensive!
    }
    void display() override { /* show pixels */ }
};
// Need: a stand-in that defers loading until display() is first called`,
      ts: `interface Image {
  display(): void
}
class RealImage implements Image {
  constructor(filename: string) {
    this.loadFromDisk(filename)  // expensive
  }
  display() { /* show pixels */ }
}
// Need a stand-in that defers loadFromDisk until display() is called`,
    }),

  det(11, 'command-editor', 'Undoable canvas ops', 'identify', 'medium',
    'Editor records AddNode / DeleteEdge so users can undo.',
    'command', ['command', 'flyweight', 'singleton', 'adapter'],
    'Command encapsulates actions.',
    'A canvas editor lets users add nodes and delete edges. Users expect Ctrl+Z undo, but operations are called directly with no history. Which pattern encapsulates each operation so it can be stored and reversed?',
    {
      cpp: `class Editor {
    void addNode(Node node)  { canvas.nodes.push_back(node); }
    void deleteEdge(Edge e)  { canvas.removeEdge(e); }
    // No undo — history is lost after every call
};`,
      ts: `class Editor {
  addNode(node: Node) { this.canvas.nodes.push(node) }
  deleteEdge(edge: Edge) { this.canvas.edges.splice(...) }
  // No undo support — history is lost
}`,
    }),

  det(12, 'state-order', 'Order lifecycle modes', 'identify', 'medium',
    'Draft/Paid/Shipped change allowed operations without a giant switch in Order.',
    'state', ['state', 'facade', 'dto', 'marker'],
    'State object per phase.',
    'An Order has three lifecycle phases: Draft, Paid, and Shipped. Each phase allows different operations (e.g. you can only ship a paid order). Currently this is one big if/else chain in every method. How do you model this cleanly?',
    {
      cpp: `class Order {
    string status = "draft";
    void pay() {
        if (status == "draft")       status = "paid";
        else if (status == "paid")   throw runtime_error("Already paid");
        else                         throw runtime_error("Already shipped");
    }
    void ship() {
        if (status != "paid") throw runtime_error("Pay first");
        status = "shipped";
    }
};`,
      ts: `class Order {
  status = 'draft'
  pay() {
    if (this.status === 'draft')      this.status = 'paid'
    else if (this.status === 'paid')  throw new Error('Already paid')
    else                              throw new Error('Already shipped')
  }
  ship() {
    if (this.status !== 'paid') throw new Error('Pay first')
    this.status = 'shipped'
  }
}`,
    }),

  det(13, 'template-export', 'Export algorithm skeleton', 'identify', 'medium',
    'CsvExporter and PdfExporter share validate→fetch→write outline with custom steps.',
    'template-method', ['template-method', 'observer', 'bridge', 'interpreter'],
    'Template Method = fixed skeleton + hooks.',
    'Two exporters (CSV and PDF) follow the exact same steps: validate, fetch data, write output. The validate and fetch steps are identical; only write differs. The code is currently duplicated in both classes. What pattern removes the duplication while allowing the write step to vary?',
    {
      cpp: `class CsvExporter {
    void doExport() {
        validate();                      // duplicated
        auto data = fetchData();         // duplicated
        ofstream f("out.csv");
        for (auto& row : data) f << join(row, ",") << "\\n";
    }
};
class PdfExporter {
    void doExport() {
        validate();                      // duplicated
        auto data = fetchData();         // duplicated
        PdfLib::create(data).save("out.pdf");
    }
};`,
      ts: `class CsvExporter {
  export() {
    this.validate(); this.fetchData()
    // CSV-specific write
  }
}
class PdfExporter {
  export() {
    this.validate(); this.fetchData() // duplicated skeleton
    // PDF-specific write
  }
}`,
    }),

  det(14, 'composite-widgets', 'Widget trees', 'identify', 'medium',
    'Panel contains Buttons and nested Panels; render() works uniformly.',
    'composite', ['composite', 'proxy', 'memento', 'singleton'],
    'Composite = part-whole tree.',
    'A UI framework has Buttons and Panels. A Panel can contain Buttons or other Panels. You want to call render() on any widget, whether it is a leaf or a container, without writing type-checking code. Which pattern gives you a uniform interface over a tree?',
    {
      cpp: `class Widget { public: virtual void render() = 0; };
class Button : public Widget {
    void render() override { cout << "<button>"; }
};
class Panel {
    vector<Widget*> children;
    void render() {
        // Needs instanceof checks to recurse
        for (auto* c : children) c->render();
    }
};`,
      ts: `interface Widget { render(): void }
class Button implements Widget {
  render() { console.log('<button>') }
}
class Panel {
  children: (Button | Panel)[] = []
  render() {
    // Type-checks or casts needed — no uniform interface
    this.children.forEach(c => c.render())
  }
}`,
    }),

  det(15, 'bridge-remote', 'Remote vs device APIs', 'identify', 'hard',
    'RemoteControl hierarchy exploding per TV brand — split abstraction from implementor.',
    'bridge', ['bridge', 'prototype', 'iterator', 'mediator'],
    'Bridge separates orthogonal hierarchies.',
    'You have two independent concerns: remote control types (Basic, Advanced) and TV brands (Sony, LG, Panasonic). Combining them as subclasses gives n×m classes. Adding one new remote type means one new subclass per brand. What pattern decouples the two dimensions?',
    {
      cpp: `class SonyBasicRemote   { /* volume/channel — Sony */ };
class SonyAdvancedRemote { /* mute — Sony */ };
class LGBasicRemote     { /* volume/channel — LG */ };
class LGAdvancedRemote  { /* mute — LG */ };
// Adding Panasonic = 2 more classes
// Adding SmartRemote = 3 more classes per brand`,
      ts: `class SonyBasicRemote    { /* duplicated volume/channel for Sony */ }
class SonyAdvancedRemote { /* mute + Sony-specific */ }
class LGBasicRemote      { /* duplicated for LG */ }
class LGAdvancedRemote   { /* mute + LG-specific */ }
// Adding Panasonic = 2 more; Adding SmartRemote = 3 more per brand`,
    }),

  det(16, 'mediator-chatty-ui', 'Chatty form widgets', 'identify', 'hard',
    'Every form field updates every other field directly — tangle of deps.',
    'mediator', ['mediator', 'flyweight', 'builder', 'adapter'],
    'Mediator centralizes colleague communication.',
    'A form has fields: City, ZIP, Country, and Tax Rate. When City changes it must update ZIP and Country. When ZIP changes it must update City and Tax. Every field holds references to every other field, creating a tangled dependency graph. What pattern centralises coordination?',
    {
      cpp: `class CityField {
    void onChange(string city) {
        zipField->update(city);
        countryField->update(city);
        taxField->recalculate(city);
    }
};
class ZipField {
    void onChange(string zip) {
        cityField->update(zip);
        taxField->recalculate(zip);
    }
};
// Each widget holds a pointer to every other widget`,
      ts: `class CityField {
  onChange(city: string) {
    zipField.update(city); countryField.update(city); taxField.recalculate(city)
  }
}
class ZipField {
  onChange(zip: string) {
    cityField.update(zip); taxField.recalculate(zip)
  }
}
// Each widget holds refs to every other widget`,
    }),

  det(17, 'chain-middleware', 'HTTP middleware pipeline', 'identify', 'medium',
    'Auth → rate-limit → handler can short-circuit or pass along.',
    'chain', ['chain', 'singleton', 'prototype', 'memento'],
    'Chain of Responsibility.',
    'An HTTP request must pass through auth checking, rate limiting, and input validation before reaching business logic. Any step can reject the request early. Currently all steps live in one function. Which pattern lets you compose independent, reorderable handlers?',
    {
      cpp: `void handle(Request& req, Response& res) {
    if (!req.headers.count("Authorization"))
        { res.status(401); return; }
    if (rateLimiter.isExceeded(req.ip))
        { res.status(429); return; }
    if (!validator.isValid(req.body))
        { res.status(400); return; }
    businessLogic(req, res);
}`,
      ts: `async function handle(req: Request, res: Response) {
  if (!req.headers.authorization) { res.status(401); return }
  if (rateLimiter.isExceeded(req.ip)) { res.status(429); return }
  if (!validator.isValid(req.body)) { res.status(400); return }
  await businessLogic(req, res)
}`,
    }),

  det(18, 'strategy-vs-inheritance', 'Prefer strategy over subclass explosion', 'explain', 'medium',
    'You need 5 shipping cost algorithms. Why Strategy over many Order subclasses?',
    'strategy', ['strategy', 'singleton', 'none', 'flyweight'],
    'Keeps Order closed; algorithms vary independently.',
    'You have 5 shipping cost calculations and inherit one per Order subclass. A customer\'s shipping method can change after order creation, but inheritance binds the algorithm at object creation time. Why is Strategy a better fit here?',
    {
      cpp: `// Inheritance approach — 5 Order subclasses:
class EconomyOrder   : public Order { double calcShipping() { return weight * 1; } };
class ExpressOrder   : public Order { double calcShipping() { return weight * 3; } };
class OvernightOrder : public Order { double calcShipping() { return weight * 7; } };
class IntlOrder      : public Order { double calcShipping() { /* complex */ } };
class FreeOrder      : public Order { double calcShipping() { return 0; } };
// New rule = new subclass; can't swap algorithm after construction`,
      ts: `class EconomyOrder   extends Order { calcShipping() { return weight * 1 } }
class ExpressOrder   extends Order { calcShipping() { return weight * 3 } }
class OvernightOrder extends Order { calcShipping() { return weight * 7 } }
class IntlOrder      extends Order { calcShipping() { /* complex */ } }
class FreeOrder      extends Order { calcShipping() { return 0 } }
// New rule = new subclass; rules can't be mixed at runtime`,
    }),

  det(19, 'detect-god-factory', 'Factory that does business logic', 'detect', 'hard',
    'PaymentFactory also charges cards, sends email, and writes analytics. Verdict?',
    'none', ['keep-it', 'none', 'add-more-singletons', 'make-it-static-only'],
    'Not a clean Factory — SRP broken. Redesign.',
    'A class named PaymentFactory not only creates the payment gateway object but also charges the card, sends a receipt email, and logs to analytics — all in one method. Does this represent correct use of the Factory pattern?',
    {
      cpp: `class PaymentFactory {
public:
    static PaymentGateway* create(string type, Order order) {
        auto* gw = type == "stripe"
            ? (PaymentGateway*) new StripeGateway()
            : new RazorpayGateway();
        // Factory doing way too much:
        gw->charge(order.amount);
        EmailService::sendReceipt(order.userId);
        Analytics::track("payment", order.id);
        return gw;
    }
};`,
      ts: `class PaymentFactory {
  static create(type: string, order: Order) {
    const gw = type === 'stripe' ? new StripeGateway() : new RazorpayGateway()
    gw.charge(order.amount)             // should not be here
    EmailService.sendReceipt(order.userId)
    Analytics.track('payment', order.id)
    return gw
  }
}`,
    }),

  det(20, 'observer-vs-polling', 'Push vs poll', 'explain', 'easy',
    'Dashboard polls OrderService every 200ms for status. Better approach?',
    'observer', ['observer', 'singleton', 'prototype', 'flyweight'],
    'Subscribe to status changes instead of chatty polling.',
    'A dashboard checks order status every 200ms by calling the server — that is 5 requests per second per open tab. Most of the time the status has not changed, so requests are wasted. Which pattern eliminates this waste?',
    {
      cpp: `// Current — aggressive polling (5 req/sec):
while (true) {
    auto status = OrderService::getStatus(orderId);
    dashboard.update(status);
    this_thread::sleep_for(200ms);
}`,
      ts: `setInterval(async () => {
  const status = await OrderService.getStatus(orderId)
  dashboard.update(status)
}, 200) // 5 requests/second per dashboard user`,
    }),

  det(21, 'adapter-vs-facade', 'One foreign class vs subsystem', 'explain', 'hard',
    'You wrap one third-party client to match your port — Adapter or Facade?',
    'adapter', ['adapter', 'facade', 'singleton', 'none'],
    'Adapter = interface translation; Facade = simplify a whole subsystem.',
    'You are wrapping exactly one external class (TwilioClient) to match your internal SmsPort interface. No other classes are involved, no complexity is hidden. Adapter or Facade — and why?',
    {
      cpp: `class SmsPort {
public:
    virtual void send(string to, string body) = 0;
};
// Wrapping exactly ONE external class:
class TwilioAdapter : public SmsPort {
    TwilioClient client;
public:
    void send(string to, string body) override {
        client.messages.create(to, ENV::FROM, body);
    }
};`,
      ts: `class TwilioSmsAdapter implements SmsPort {
  constructor(private client: TwilioClient) {}
  send(to: string, body: string) {
    this.client.messages.create({ to, from: ENV.FROM, body })
  }
}`,
    }),

  det(22, 'null-object-notifier', 'Avoid null checks on notifier', 'identify', 'medium',
    'Prefer a no-op Notifier when notifications are disabled instead of null checks.',
    'strategy', ['visitor', 'singleton', 'strategy', 'flyweight'],
    'A NoOp strategy/implementation is the clean approach (Null Object as Strategy).',
    'OrderService receives an optional Notifier. When notifications are disabled the field is null, causing a null check before every send call. How do you eliminate these checks without adding special-case logic?',
    {
      cpp: `class OrderService {
    Notifier* notifier; // may be nullptr
    void complete(Order order) {
        order.status = "done";
        if (notifier != nullptr)         // null check scattered everywhere
            notifier->send(order.userId, "Order done");
    }
};`,
      ts: `class OrderService {
  constructor(private notifier: Notifier | null) {}
  complete(order: Order) {
    order.status = 'done'
    if (this.notifier !== null) {   // null check scattered everywhere
      this.notifier.send(order.userId, 'Order done')
    }
  }
}`,
    }),

  det(23, 'state-vs-strategy', 'Modes vs algorithms', 'explain', 'hard',
    'TrafficLight colors (with transitions) — State or Strategy?',
    'state', ['state', 'strategy', 'none', 'facade'],
    'Modes with transitions → State. Pure interchangeable algorithms → Strategy.',
    'A TrafficLight cycles red → green → yellow → red. Each color determines what the light does AND drives the transition to the next color. The object\'s behaviour changes based on its current mode. State or Strategy — and why?',
    {
      cpp: `class TrafficLight {
    string color = "red";
    void next() {
        if (color == "red")    color = "green";
        else if (color == "green") color = "yellow";
        else color = "red";
        // Behaviour AND next-state depend on current mode
    }
};`,
      ts: `class TrafficLight {
  color: 'red' | 'green' | 'yellow' = 'red'
  next() {
    if (this.color === 'red')    this.color = 'green'
    else if (this.color === 'green') this.color = 'yellow'
    else this.color = 'red'
    // Mode controls transitions — not just algorithms
  }
}`,
    }),

  det(24, 'decorator-vs-inheritance', 'Stacking behaviors', 'explain', 'medium',
    'Need LoggedNotifier and RetryNotifier combinations without subclass explosion.',
    'decorator', ['decorator', 'singleton', 'prototype', 'memento'],
    'Decorators compose in any order.',
    'You need to add logging and retry behaviour to both EmailNotifier and SmsNotifier, in any combination. Using inheritance means creating a subclass for every combination (LoggedEmail, RetryEmail, LoggedRetryEmail, LoggedSms…). What pattern avoids this explosion?',
    {
      cpp: `// Inheritance explosion:
class LoggedEmailNotifier  : public EmailNotifier  { ... };
class RetryEmailNotifier   : public EmailNotifier  { ... };
class LoggedRetryEmail     : public RetryEmailNotifier { ... };
class LoggedSmsNotifier    : public SmsNotifier    { ... };
// 2 concerns x 2 channels = 4+ subclasses, and growing`,
      ts: `class LoggedEmailNotifier  extends EmailNotifier  { ... }
class RetryEmailNotifier   extends EmailNotifier  { ... }
class LoggedRetryEmail     extends RetryEmailNotifier { ... }
class LoggedSmsNotifier    extends SmsNotifier    { ... }
// 2 concerns × 2 channels = 4+ subclasses, growing`,
    }),

  det(25, 'command-vs-observer', 'Undo vs notify', 'explain', 'medium',
    'You need undo for editor ops — Observer or Command?',
    'command', ['command', 'observer', 'flyweight', 'none'],
    'Undo stacks Commands; Observer is for notifications.',
    'An editor must support Ctrl+Z undo for every operation. You need to record what happened and be able to reverse it. Observer notifies listeners of events but cannot reverse them. Which pattern is designed for undoable actions?',
    {
      cpp: `class CanvasEditor {
    // Need to undo: addNode, deleteEdge, moveNode
    void addNode(Node node) {
        canvas.nodes.push_back(node);
        // How to record this for undo?
    }
};`,
      ts: `class CanvasEditor {
  history: Array<{ redo(): void; undo(): void }> = []
  addNode(node: Node) {
    this.canvas.nodes.push(node)
    // Need to record this operation so it can be undone
  }
}`,
    }),

  det(26, 'detect-pattern-bingo', 'Pattern bingo smell', 'detect', 'easy',
    'Junior adds Singleton+Factory+Facade+Observer on a 3-field DTO. Best call?',
    'none', ['celebrate', 'none', 'add-visitor', 'add-bridge'],
    'Over-patterning — keep the DTO.',
    'A junior developer applies four design patterns to a simple data class with three string fields, no business logic, and no variation requirements. What is the right response as a senior reviewer?',
    {
      cpp: `// Original — a simple data bag:
struct UserPrefs {
    string theme    = "dark";
    string lang     = "en";
    string timezone = "UTC";
};
// Junior wraps it in Singleton + Factory + Facade + Observer.
// What is the correct recommendation?`,
      ts: `// Simple data class — no logic, no variation:
class UserPrefs {
  theme    = 'dark'
  lang     = 'en'
  timezone = 'UTC'
}
// Junior adds Singleton + Factory + Facade + Observer to this.
// What is the correct recommendation?`,
    }),

  det(27, 'proxy-vs-decorator-access', 'Access control front', 'explain', 'hard',
    'Object that only checks auth then delegates — Proxy or Decorator?',
    'proxy', ['proxy', 'decorator', 'builder', 'none'],
    'Intent is access control → Proxy.',
    'You wrap a Service to check user permissions before forwarding every call. The wrapper adds no new behaviour — it purely controls access and delegates. Both Proxy and Decorator look similar structurally. Which one matches the intent here?',
    {
      cpp: `class AuthenticatedService : public Service {
    Service* inner;
    User user;
public:
    Result execute(Command cmd) override {
        if (!user.hasPermission(cmd.type))
            throw UnauthorizedError();
        return inner->execute(cmd); // pure delegation
    }
};`,
      ts: `class AuthenticatedService implements Service {
  constructor(private inner: Service, private user: User) {}
  execute(cmd: Command) {
    if (!this.user.hasPermission(cmd.type))
      throw new UnauthorizedError()
    return this.inner.execute(cmd)  // pure delegation
  }
}`,
    }),

  det(28, 'factory-method-framework', 'Framework hooks creation', 'identify', 'medium',
    'Dialog.createButton() overridden by WinDialog/MacDialog — classic…',
    'factory', ['factory', 'singleton', 'memento', 'iterator'],
    'Factory Method.',
    'A Dialog base class defines a render() method that calls createButton() internally. Subclasses override createButton() to return platform-specific buttons. The base class controls the algorithm; subclasses control which object gets created. What pattern is this?',
    {
      cpp: `class Dialog {
public:
    void render() {
        Button* btn = createButton(); // factory method
        btn->onClick([this]{ closeDialog(); });
        btn->render();
    }
    virtual Button* createButton() = 0;
};
class WindowsDialog : public Dialog {
    Button* createButton() override { return new WindowsButton(); }
};`,
      ts: `abstract class Dialog {
  render() {
    const btn = this.createButton()  // factory method
    btn.onClick(() => this.closeDialog())
    btn.render()
  }
  abstract createButton(): Button
}
class WindowsDialog extends Dialog {
  createButton(): Button { return new WindowsButton() }
}`,
    }),

  det(29, 'composite-file-system', 'Files and folders', 'identify', 'easy',
    'File and Directory both support size() and Directory holds children.',
    'composite', ['composite', 'adapter', 'state', 'builder'],
    'Classic Composite.',
    'A file system has Files (leaves) and Directories (containers). Calling size() on a File returns its byte count. Calling size() on a Directory should recursively sum its children — Files or nested Directories. You want one uniform interface for both. What pattern?',
    {
      cpp: `class FileSystemEntry {
public:
    virtual int size() = 0;
};
class File : public FileSystemEntry {
    int size() override { return bytes; }
};
class Directory {
    vector<FileSystemEntry*> children;
    // Need size() that recursively sums — no instanceof checks
};`,
      ts: `interface FileSystemEntry { size(): number }
class File implements FileSystemEntry { size() { return this.bytes } }
class Directory {
  children: (File | Directory)[] = []
  // Need size() that recursively sums children
}`,
    }),

  det(30, 'chain-approvals', 'Expense approval levels', 'identify', 'medium',
    'Manager → Director → VP may approve or pass up.',
    'chain', ['chain', 'singleton', 'flyweight', 'prototype'],
    'Chain of Responsibility.',
    'Expense reports under $500 are approved by a Manager, under $5000 by a Director, above that by the VP. This logic lives in one function. Adding a CFO level or changing thresholds requires editing that function. Which pattern makes each approver independent and composable?',
    {
      cpp: `void approveExpense(double amount, string userId) {
    if (amount <= 500)
        manager.approve(userId, amount);
    else if (amount <= 5000)
        director.approve(userId, amount);
    else
        vp.approve(userId, amount);
    // Adding CFO = edit this function
}`,
      ts: `function approveExpense(amount: number, userId: string) {
  if (amount <= 500)        managerApprove(userId, amount)
  else if (amount <= 5000)  directorApprove(userId, amount)
  else                      vpApprove(userId, amount)
  // Adding CFO level requires editing this function
}`,
    }),

  det(31, 'mediator-air-traffic', 'Towers and planes', 'identify', 'hard',
    'Planes should not talk pairwise; tower coordinates.',
    'mediator', ['mediator', 'observer', 'adapter', 'none'],
    'Mediator.',
    'Planes need to coordinate landing to avoid runway conflicts. Currently each Plane holds a list of all other Planes and queries them directly. Adding a new plane means updating every existing plane. Which pattern introduces a central coordinator?',
    {
      cpp: `class Plane {
    vector<Plane*> otherPlanes;
    void requestLanding() {
        bool clear = all_of(otherPlanes.begin(), otherPlanes.end(),
            [](Plane* p){ return !p->isOnRunway(); });
        if (clear) land();
    }
};`,
      ts: `class Plane {
  otherPlanes: Plane[] = []
  requestLanding() {
    const clear = this.otherPlanes.every(p => !p.isOnRunway())
    if (clear) this.land()
  }
}`,
    }),

  det(32, 'bridge-shapes-colors', 'Shapes + colors explosion', 'identify', 'hard',
    'RedCircle BlueCircle RedSquare… explode. Decouple shape from color drawing API.',
    'bridge', ['bridge', 'composite', 'command', 'memento'],
    'Bridge.',
    'You have shapes (Circle, Square) and colors (Red, Blue, Green). Combining them via inheritance gives RedCircle, BlueCircle, RedSquare, BlueSquare… Adding a new color means adding one subclass per shape. What pattern separates these two independent dimensions?',
    {
      cpp: `class RedCircle  { void draw() { /* circle + red */ } };
class BlueCircle { void draw() { /* circle + blue */ } };
class RedSquare  { void draw() { /* square + red */ } };
class BlueSquare { void draw() { /* square + blue */ } };
// 2 shapes x 3 colors = 6 classes; adding green = 2 more`,
      ts: `class RedCircle  { draw() { /* circle + red */ } }
class BlueCircle { draw() { /* circle + blue */ } }
class RedSquare  { draw() { /* square + red */ } }
class BlueSquare { draw() { /* square + blue */ } }
// 2 shapes × 3 colors = 6 classes; adding purple = 2 more`,
    }),

  det(33, 'template-data-miner', 'Data mining steps', 'identify', 'medium',
    'DocMiner and CsvMiner share open→extract→close with custom extract.',
    'template-method', ['template-method', 'strategy', 'proxy', 'facade'],
    'Template Method.',
    'DocMiner and CsvMiner both follow the same three-step process: open a file, extract data, close the file. The open and close steps are identical; only the extract step differs. The steps are duplicated across both classes. What pattern removes this duplication?',
    {
      cpp: `class DocMiner {
    void mine() {
        auto file = openDoc(path);         // duplicated
        auto raw  = extractDocData(file);  // custom step
        analyzeAndReport(raw);             // duplicated
        closeDoc(file);                    // duplicated
    }
};
class CsvMiner {
    void mine() {
        auto file = openCsv(path);         // same skeleton
        auto raw  = extractCsvData(file);
        analyzeAndReport(raw);
        closeCsv(file);
    }
};`,
      ts: `class DocMiner {
  mine() { this.open(); this.extractDocData(); this.report(); this.close() }
}
class CsvMiner {
  mine() { this.open(); this.extractCsvData(); this.report(); this.close() }
  // Same skeleton, different extract step — both duplicated`,
    }),

  det(34, 'builder-http-request', 'HTTP request builder', 'identify', 'easy',
    'Request.Builder().url().header().post().build() style API.',
    'builder', ['builder', 'observer', 'state', 'visitor'],
    'Builder.',
    'An HTTP request has many optional settings: URL, method, headers, body, timeout, redirect policy. Passing all as constructor arguments is error-prone and unreadable. Which pattern provides a readable, step-by-step construction API?',
    {
      cpp: `// Fragile — positional args, easy to swap:
HttpRequest req(
    "https://api.example.com/pay",
    "POST",
    {{"Authorization", "Bearer tok"}},
    jsonBody, 5000, true
);`,
      ts: `// Unreadable positional args:
const req = new HttpRequest(
  'https://api.example.com/pay', 'POST',
  { Authorization: 'Bearer tok' },
  JSON.stringify(body), 5000, true
)`,
    }),

  det(35, 'adapter-xml-json', 'Legacy XML to JSON port', 'identify', 'easy',
    'New code speaks JsonReader; legacy only XmlReader — wrap it.',
    'adapter', ['adapter', 'facade', 'singleton', 'command'],
    'Adapter.',
    'Your system uses a JsonReader interface throughout. A legacy library only provides an XmlReader with a completely different API. You need to use the legacy library without changing any existing code that expects JsonReader. What pattern solves this?',
    {
      cpp: `class JsonReader {
public:
    virtual vector<map<string,string>> readAll() = 0;
};
// Only available:
class XmlReader {
public:
    XMLDocument parse(string xml);
    vector<XMLNode> getNodes(XMLDocument doc);
};
// Make XmlReader usable where JsonReader is expected`,
      ts: `interface JsonReader {
  readAll(): Record<string, unknown>[]
}
// Only available:
class XmlReader {
  parse(xml: string): XMLDocument { ... }
  getNodes(doc: XMLDocument): XMLNode[] { ... }
}
// Make XmlReader work where JsonReader is expected`,
    }),

  det(36, 'facade-video-convert', 'Video conversion subsystem', 'identify', 'medium',
    'Codecs, bitrate, audio — expose one VideoConverter.convert().',
    'facade', ['facade', 'adapter', 'proxy', 'state'],
    'Facade over a subsystem.',
    'Converting a video requires coordinating a codec, an audio processor, a bitrate optimizer, and a container muxer — four separate subsystems. Every caller must know and coordinate all four. Which pattern hides this complexity behind a single method?',
    {
      cpp: `// Caller must orchestrate all subsystems:
H264Codec codec;
AacProcessor audio;
BitrateOptimizer bitrate(1080);
Mp4Container container;

codec.encode(inputFrames);
audio.process(inputAudio);
bitrate.adjust(codec.output());
container.mux(codec.output(), audio.output());`,
      ts: `const codec   = new H264Codec()
const audio   = new AacAudioProcessor()
const bitrate = new BitrateOptimizer(1080)
const container = new Mp4Container()
codec.encode(inputFrames)
audio.process(inputAudio)
bitrate.adjust(codec.output)
container.mux(codec.output, audio.output)`,
    }),

  det(37, 'observer-stock', 'Stock ticker listeners', 'identify', 'easy',
    'Many dashboards update when StockPrice changes.',
    'observer', ['observer', 'builder', 'memento', 'flyweight'],
    'Observer.',
    'A stock price object must update multiple dashboards whenever the price changes. Currently StockPrice holds a list of Dashboard references and loops over them. What pattern formalises this one-to-many notification relationship?',
    {
      cpp: `class StockPrice {
    double price;
    vector<Dashboard*> dashboards;
public:
    void setPrice(double p) {
        price = p;
        for (auto* d : dashboards) d->update(p);
    }
    void subscribe(Dashboard* d) { dashboards.push_back(d); }
};`,
      ts: `class StockPrice {
  private price: number
  private dashboards: Dashboard[] = []
  setPrice(p: number) {
    this.price = p
    this.dashboards.forEach(d => d.update(p))
  }
  subscribe(d: Dashboard) { this.dashboards.push(d) }
}`,
    }),

  det(38, 'strategy-compression', 'Pluggable compression', 'identify', 'easy',
    'Zip, Gzip, Brotli chosen at runtime for FileStorage.',
    'strategy', ['strategy', 'singleton', 'composite', 'iterator'],
    'Strategy.',
    'FileStorage can compress files using Zip, Gzip, or Brotli. The format is decided at runtime. The current implementation is a chain of if/else blocks inside save(). Adding a new format requires editing the method. Which pattern makes algorithms swappable without editing the class?',
    {
      cpp: `class FileStorage {
    vector<byte> save(vector<byte> data, string format) {
        if (format == "zip")    return ZipLib::compress(data);
        if (format == "gzip")   return GzipLib::compress(data);
        if (format == "brotli") return BrotliLib::compress(data);
        throw invalid_argument("Unknown format");
    }
};`,
      ts: `class FileStorage {
  save(data: Buffer, format: string) {
    if (format === 'zip')    return ZipLib.compress(data)
    if (format === 'gzip')   return GzipLib.compress(data)
    if (format === 'brotli') return BrotliLib.compress(data)
    throw new Error('Unknown format')
  }
}`,
    }),

  det(39, 'state-vending', 'Vending machine modes', 'identify', 'medium',
    'Idle, HasCoin, Dispensing — different acceptCoin/select behaviors.',
    'state', ['state', 'strategy', 'facade', 'none'],
    'State.',
    'A vending machine behaves differently depending on whether it is idle, has a coin inserted, or is dispensing. Each method (acceptCoin, selectProduct) has a growing if/else chain checking the current status. Which pattern replaces these chains with per-state objects?',
    {
      cpp: `class VendingMachine {
    string state = "idle";
    void acceptCoin() {
        if (state == "idle")       state = "hasCoin";
        else if (state == "hasCoin") cout << "Coin already inserted";
        else cout << "Wait for dispensing";
    }
    void selectProduct() {
        if (state != "hasCoin") throw runtime_error("Insert coin");
        state = "dispensing"; dispense();
    }
};`,
      ts: `class VendingMachine {
  state = 'idle'
  acceptCoin() {
    if (this.state === 'idle') this.state = 'hasCoin'
    else if (this.state === 'hasCoin') console.log('Already inserted')
    else console.log('Wait')
  }
  selectProduct() {
    if (this.state !== 'hasCoin') throw new Error('Insert coin first')
    this.state = 'dispensing'; this.dispense()
  }
}`,
    }),

  det(40, 'command-smart-home', 'Smart home remote queue', 'identify', 'medium',
    'Remote queues LightOn / LightOff / MacroParty for undo and scheduling.',
    'command', ['command', 'observer', 'bridge', 'prototype'],
    'Command.',
    'A smart home remote controls lights and speakers. Buttons are hardcoded to actions, there is no undo, and macros (multiple actions as one button) are not supported. Which pattern turns each action into a first-class object that can be stored, queued, and reversed?',
    {
      cpp: `class Remote {
    void onPress(string button) {
        if (button == "on")    Light::turnOn();
        if (button == "off")   Light::turnOff();
        if (button == "party") { Light::dim(30); Speaker::play("party"); }
        // No undo, no scheduling, no macro composition
    }
};`,
      ts: `class Remote {
  onPress(button: string) {
    if (button === 'on')    Light.turnOn()
    if (button === 'off')   Light.turnOff()
    if (button === 'party') { Light.dim(30); Speaker.play('party') }
    // No undo, no scheduling, no macro support
  }
}`,
    }),

  det(41, 'proxy-api-rate', 'Rate-limiting API proxy', 'identify', 'medium',
    'Same service interface; wrapper enforces quotas then delegates.',
    'proxy', ['proxy', 'decorator', 'builder', 'none'],
    'Proxy for access control / throttling.',
    'You need to enforce per-user API quotas on an existing service without changing the service itself. The wrapper must implement the same interface, check the quota, reject with 429 if exceeded, and otherwise forward the call. What pattern is this?',
    {
      cpp: `class ApiService {
public:
    virtual any call(string endpoint, any payload) = 0;
};
class RealApiService : public ApiService {
    any call(string endpoint, any payload) override { /* HTTP */ }
};
// Need a wrapper that:
// 1. Checks quota before forwarding
// 2. Returns 429 if exceeded
// 3. Delegates to RealApiService — same interface`,
      ts: `interface ApiService {
  call(endpoint: string, payload: unknown): Promise<unknown>
}
class RealApiService implements ApiService {
  async call(endpoint, payload) { /* actual HTTP */ }
}
// Wrapper: check quota → reject 429 or delegate to Real`,
    }),

  det(42, 'decorator-stream', 'Java-style stream wrappers', 'identify', 'medium',
    'BufferedStream(EncryptedStream(FileStream)) stacking.',
    'decorator', ['decorator', 'adapter', 'facade', 'singleton'],
    'Decorator.',
    'You want to be able to add buffering and encryption to a FileStream independently, and combine them in any order (buffered-then-encrypted or encrypted-then-buffered). All variations must implement the same DataStream interface. Which pattern enables this?',
    {
      cpp: `class DataStream {
public:
    virtual void write(string data) = 0;
};
class FileStream : public DataStream {
    void write(string data) override {
        ofstream f("out.dat", ios::app);
        f << data;
    }
};
// Add encryption and buffering independently,
// combinable in any order — same interface`,
      ts: `interface DataStream { write(data: string): void }
class FileStream implements DataStream {
  write(data) { fs.appendFileSync('out.dat', data) }
}
// Need to add encryption and buffering independently,
// combinable in any order, same interface`,
    }),

  det(43, 'detect-inheritance-for-reuse', 'Inherit only for reuse', 'detect', 'medium',
    'Stack extends ArrayList just to reuse storage — smell. Best call?',
    'none', ['deeper-inheritance', 'none', 'more-singletons', 'visitor'],
    'Prefer composition; do not bless that inheritance.',
    'A developer creates a Stack by extending ArrayList to reuse its internal array. The problem: callers can now call add(), remove(index), get(i), and other ArrayList methods that bypass the stack discipline. Is this a good use of inheritance?',
    {
      cpp: `template<typename T>
class Stack : public ArrayList<T> {
public:
    void push(T item) { this->add(item); }
    T pop() { return this->remove(this->size() - 1); }
    // Problem: exposes add(), remove(i), get(i), set()
    // Stack discipline is easily bypassed
};`,
      ts: `class Stack<T> extends ArrayList<T> {
  push(item: T) { this.add(item) }
  pop(): T { return this.remove(this.size() - 1) }
  // Exposes add(), remove(), get(), set()
  // Callers can bypass push/pop — LSP violated
}`,
    }),

  det(44, 'explain-dip-payment-uml', 'Read a payment UML', 'explain', 'medium',
    'Order → Payment → Razorpay (all concrete). Closest structural fix among options?',
    'adapter', ['adapter', 'singleton', 'memento', 'flyweight'],
    'Introduce a port; adapters/implementations for providers (DIP).',
    'Order directly creates a RazorpayGateway (concrete-to-concrete dependency). Switching to Stripe requires modifying Order. The Dependency Inversion Principle says high-level modules should not depend on low-level ones. What structural change fixes this?',
    {
      cpp: `class Order {
    void pay() {
        RazorpayGateway gw;          // concrete dependency
        gw.initiatePayment(amount);
    }
};
// Order → RazorpayGateway
// Switching provider = editing Order`,
      ts: `class Order {
  pay() {
    const gw = new RazorpayGateway()   // concrete dependency
    gw.initiatePayment(this.amount)
  }
}
// Order → RazorpayGateway (concrete-to-concrete)`,
    }),

  det(45, 'composite-menu', 'Nested menus', 'identify', 'easy',
    'Menu contains MenuItems and sub-Menus; open() recurses.',
    'composite', ['composite', 'state', 'builder', 'facade'],
    'Composite.',
    'A navigation menu has MenuItems (leaves) and sub-Menus (containers of MenuItems or other sub-Menus). You want to call open() on anything in the tree without knowing whether it is a leaf or a container. What pattern provides this uniformity?',
    {
      cpp: `class MenuItem { void open() { cout << "Navigate to " << url; } };
class Menu {
    vector<variant<MenuItem*, Menu*>> children;
    void open() {
        for (auto& c : children)
            visit([](auto* x){ x->open(); }, c);
        // No uniform base type — instanceof checks needed
    }
};`,
      ts: `class MenuItem { open() { console.log('Navigate to', this.url) } }
class Menu {
  children: (MenuItem | Menu)[] = []
  open() {
    // No uniform interface — must type-check
    this.children.forEach(c => c.open())
  }
}`,
    }),

  det(46, 'chain-logger', 'Log level chain', 'identify', 'medium',
    'InfoLogger → ErrorLogger → EmailLogger pass or handle by severity.',
    'chain', ['chain', 'observer', 'singleton', 'bridge'],
    'Chain of Responsibility.',
    'A logging system handles INFO by printing, ERROR by printing and emailing, and DEBUG by doing nothing in production. All levels are handled in one function with if/else. Adding a WARNING level means editing the function. Which pattern makes each level an independent handler?',
    {
      cpp: `void log(string level, string msg) {
    if (level == "info")
        cout << "[INFO] " << msg;
    else if (level == "error") {
        cerr << "[ERROR] " << msg;
        EmailService::alert(msg);
    }
    // Adding "warning" = edit this function
}`,
      ts: `function log(level: string, msg: string) {
  if (level === 'info')  console.log('[INFO]', msg)
  else if (level === 'error') {
    console.error('[ERROR]', msg)
    EmailService.alert(msg)
  }
  // Adding 'warning' level requires editing this function
}`,
    }),

  det(47, 'strategy-payment-fee', 'Fee calculation variants', 'identify', 'easy',
    'DomesticFee, IntlFee, WaivedFee selected per transaction.',
    'strategy', ['strategy', 'memento', 'iterator', 'visitor'],
    'Strategy.',
    'Payment fee calculation varies by transaction type: domestic transactions are 2%, international are 5% plus a flat fee, and premium members pay nothing. The logic is one if/else block inside the processor. Adding a new fee type requires editing the processor. What pattern makes fee rules pluggable?',
    {
      cpp: `class PaymentProcessor {
    double calculateFee(Transaction tx) {
        if (tx.type == "domestic") return tx.amount * 0.02;
        if (tx.type == "intl")     return tx.amount * 0.05 + 1.50;
        if (tx.type == "waived")   return 0;
        throw invalid_argument("Unknown type");
    }
};`,
      ts: `class PaymentProcessor {
  calculateFee(tx: Transaction): number {
    if (tx.type === 'domestic')  return tx.amount * 0.02
    if (tx.type === 'intl')      return tx.amount * 0.05 + 1.50
    if (tx.type === 'waived')    return 0
    throw new Error('Unknown transaction type')
  }
}`,
    }),

  det(48, 'facade-vs-god', 'Facade or god object?', 'detect', 'hard',
    'CheckoutFacade also owns DB schemas, UI HTML, and thread pools. Verdict?',
    'none', ['perfect-facade', 'none', 'add-more-methods', 'make-static'],
    'God object wearing a Facade name — reject it.',
    'A class called CheckoutFacade has a checkout() method that coordinates cart, payment, and inventory — that part is fine. But it also defines database schemas, generates HTML, and manages a thread pool. Does this qualify as a proper Facade?',
    {
      cpp: `class CheckoutFacade {
    // Legitimate facade method:
    void checkout(string userId) { /* coord cart+pay+inventory */ }

    // Red flags — not facade concerns:
    void createUsersTable() { db.execute("CREATE TABLE users..."); }
    string renderHtml(Order o) { return "<div>...</div>"; }
    void manageThreadPool(int sz) { pool = ThreadPool(sz); }
};`,
      ts: `class CheckoutFacade {
  checkout(userId: string) { /* coord cart + payment + inventory */ }

  // Red flags:
  createUsersTable() { db.execute('CREATE TABLE users...') }
  renderOrderHtml(order: Order) { return '<div>...</div>' }
  manageThreadPool(size: number) { this.pool = new ThreadPool(size) }
}`,
    }),

  det(49, 'observer-chat', 'Chat room messages', 'identify', 'easy',
    'Users subscribe to a ChatRoom and receive new messages.',
    'observer', ['observer', 'builder', 'flyweight', 'prototype'],
    'Observer.',
    'When a user sends a message to a ChatRoom, all other members in the room must receive it instantly. Members join and leave dynamically. What pattern models this publish-subscribe relationship?',
    {
      cpp: `class ChatRoom {
    vector<User*> members;
public:
    void sendMessage(User* sender, string text) {
        for (auto* u : members)
            if (u != sender) u->receive(sender->name, text);
    }
    void join(User* u) { members.push_back(u); }
};`,
      ts: `class ChatRoom {
  private members: User[] = []
  sendMessage(sender: User, text: string) {
    this.members.filter(u => u !== sender).forEach(u => u.receive(sender.name, text))
  }
  join(user: User) { this.members.push(user) }
}`,
    }),

  det(50, 'builder-sql', 'SQL query builder', 'identify', 'easy',
    'Select.from().where().orderBy().build() for safe query assembly.',
    'builder', ['builder', 'observer', 'state', 'proxy'],
    'Builder.',
    'SQL queries are built by string concatenation. Optional clauses (WHERE, ORDER BY, LIMIT) are appended conditionally, making the code fragile and prone to injection. Which pattern provides a safe, readable API for assembling queries step by step?',
    {
      cpp: `// Fragile string concatenation:
string q = "SELECT " + join(cols, ",")
         + " FROM " + table
         + (where ? " WHERE " + where : "")
         + (order ? " ORDER BY " + order : "")
         + " LIMIT " + to_string(limit);`,
      ts: `const q = 'SELECT ' + cols.join(',')
  + ' FROM ' + table
  + (where ? ' WHERE ' + where : '')
  + (order ? ' ORDER BY ' + order : '')
  + ' LIMIT ' + limit
// injection-prone, hard to read`,
    }),

  det(51, 'adapter-legacy-pay', 'Legacy SOAP pay API', 'identify', 'easy',
    'New code expects REST PaymentPort; wrap SOAP client.',
    'adapter', ['adapter', 'composite', 'command', 'mediator'],
    'Adapter.',
    'Your system defines a modern PaymentPort interface. A legacy payment processor only provides a SOAP client with a completely different API. You must integrate it without changing your internal interface or the legacy client. What pattern bridges them?',
    {
      cpp: `class PaymentPort {
public:
    virtual PayResult pay(double amount, string token) = 0;
};
// Legacy client — speaks SOAP:
class LegacySoapClient {
public:
    SoapResponse callService(SoapEnvelope envelope);
};
// Bridge without modifying either class`,
      ts: `interface PaymentPort {
  pay(amount: number, token: string): Promise<{ txId: string }>
}
// Legacy only speaks SOAP:
class LegacySoapClient {
  callService(envelope: SoapEnvelope): SoapResponse { ... }
}`,
    }),

  det(52, 'state-tcp', 'Connection lifecycle', 'identify', 'hard',
    'TCP-like Closed/Listen/Established with different behaviors per state.',
    'state', ['state', 'strategy', 'facade', 'builder'],
    'State.',
    'A TCP connection class has three states: Closed, Listening, and Established. Each state allows different operations (you can only send data when Established). Currently every method has an if/else checking state. Which pattern moves each state\'s behaviour into its own object?',
    {
      cpp: `class TcpConnection {
    string state = "closed";
    void open() {
        if (state == "closed") state = "listen";
        else throw runtime_error("Already open");
    }
    void send(vector<byte> data) {
        if (state != "established")
            throw runtime_error("Not connected");
        socket.write(data);
    }
    // Every method has growing if/else chains...
};`,
      ts: `class TcpConnection {
  state: 'closed' | 'listen' | 'established' = 'closed'
  open() {
    if (this.state === 'closed') this.state = 'listen'
    else throw new Error('Already open')
  }
  send(data: Buffer) {
    if (this.state !== 'established') throw new Error('Not connected')
    this.socket.write(data)
  }
}`,
    }),

  det(53, 'proxy-caching', 'Caching repository proxy', 'identify', 'medium',
    'Same Repository interface; wrapper caches getById results.',
    'proxy', ['proxy', 'bridge', 'memento', 'visitor'],
    'Caching Proxy.',
    'A UserRepository hits the database on every getById call. You want to add an in-memory cache so repeated lookups for the same ID skip the database. The wrapper must be transparent — callers should not know about the cache. What pattern fits?',
    {
      cpp: `class UserRepository {
public:
    virtual User getById(string id) = 0;
};
class DbUserRepository : public UserRepository {
    User getById(string id) override {
        return db.query("SELECT * FROM users WHERE id=?", id);
    }
};
// Need: cache-first wrapper with same interface`,
      ts: `interface UserRepository {
  getById(id: string): Promise<User>
}
class DbUserRepository implements UserRepository {
  async getById(id) { return db.query('SELECT * FROM users WHERE id=?', id) }
}
// Wrapper: cache hit → return cached; miss → query DB + store`,
    }),

  det(54, 'decorator-auth-header', 'Add auth header decorator', 'identify', 'medium',
    'HttpClient wrapped to inject Authorization without editing clients.',
    'decorator', ['decorator', 'singleton', 'flyweight', 'prototype'],
    'Decorator.',
    'FetchClient makes HTTP calls. Every call to a protected API needs an Authorization header. Editing FetchClient is off-limits (third-party). You want a transparent wrapper that injects the header on every request. What pattern achieves this?',
    {
      cpp: `class HttpClient {
public:
    virtual Response get(string url) = 0;
    virtual Response post(string url, any body) = 0;
};
class FetchClient : public HttpClient {
    Response get(string url) override  { return fetch(url); }
    Response post(string url, any b) override { return fetch(url,"POST",b); }
};
// Wrap to inject auth token — same interface, no edits to FetchClient`,
      ts: `interface HttpClient {
  get(url: string): Promise<Response>
  post(url: string, body: unknown): Promise<Response>
}
class FetchClient implements HttpClient {
  async get(url) { return fetch(url) }
  async post(url, body) { return fetch(url, { method: 'POST', body: JSON.stringify(body) }) }
}
// Add auth header injection without modifying FetchClient`,
    }),

  det(55, 'factory-ui-theme', 'Themed button creation', 'identify', 'medium',
    'DarkThemeFactory / LightThemeFactory create matching controls.',
    'factory', ['factory', 'observer', 'state', 'none'],
    'Abstract Factory / Factory family.',
    'Your UI must support Dark and Light themes. Each theme has its own Button, Checkbox, and Dropdown components. Callers should receive consistently-themed controls without knowing which concrete class they are getting. What pattern handles this family of related objects?',
    {
      cpp: `class UiFactory {
public:
    virtual Button*   createButton()   = 0;
    virtual Checkbox* createCheckbox() = 0;
};
// DarkThemeFactory and LightThemeFactory
// both implement UiFactory — callers never know which
`,
      ts: `interface UiFactory {
  createButton(): Button
  createCheckbox(): Checkbox
}
// DarkThemeFactory and LightThemeFactory both implement UiFactory
// Callers get consistent components without knowing the concrete type`,
    }),

  det(56, 'mediator-chatroom', 'Chatroom as mediator', 'identify', 'medium',
    'Users send messages through ChatRoom instead of holding every peer.',
    'mediator', ['mediator', 'adapter', 'builder', 'memento'],
    'Mediator.',
    'In a chat system, every User holds a list of all other Users and calls them directly to send messages. Adding one new user requires updating every existing user. Which pattern introduces a central hub so users only communicate through it?',
    {
      cpp: `class User {
    vector<User*> peers;
    void send(string msg) {
        for (auto* p : peers)
            p->receive(name, msg);
    }
};
// Adding a new user = update every existing user's peers vector`,
      ts: `class User {
  peers: User[] = []    // each user knows every other user
  send(msg: string) {
    this.peers.forEach(p => p.receive(this.name, msg))
  }
}
// Adding a new user = update every existing user's peers list`,
    }),

  det(57, 'bridge-notify', 'Message + channel implementors', 'identify', 'hard',
    'UrgentMessage/NormalMessage + Email/SMS without subclass explosion.',
    'bridge', ['bridge', 'composite', 'command', 'none'],
    'Bridge.',
    'You have two independent dimensions: message priority (Urgent, Normal) and delivery channel (Email, SMS, Push). Combining them via inheritance gives 2×3 = 6 subclasses. Adding WhatsApp as a channel means 2 more subclasses. What pattern decouples these dimensions?',
    {
      cpp: `class UrgentEmailMessage  { void send() { /* urgent + email */ } };
class NormalEmailMessage  { void send() { /* normal + email */ } };
class UrgentSmsMessage    { void send() { /* urgent + sms */ } };
class NormalSmsMessage    { void send() { /* normal + sms */ } };
class UrgentPushMessage   { void send() { /* urgent + push */ } };
// 2 priorities x 3 channels = 6 classes; +1 channel = 2 more`,
      ts: `class UrgentEmailMessage { send() { /* urgent + email */ } }
class NormalEmailMessage { send() { /* normal + email */ } }
class UrgentSmsMessage   { send() { /* urgent + sms */ } }
class NormalSmsMessage   { send() { /* normal + sms */ } }
// 2 priorities × 3 channels = 6 classes; +WhatsApp = 2 more`,
    }),

  det(58, 'template-report', 'Report generation skeleton', 'identify', 'medium',
    'Shared gather→format→deliver with format overridden per report type.',
    'template-method', ['template-method', 'observer', 'proxy', 'flyweight'],
    'Template Method.',
    'SalesReport and HrReport both gather data, format it, and deliver it. The gather and deliver steps share the same shape; only the format step differs. Both classes duplicate the skeleton. What pattern extracts the shared steps into a base class while letting subclasses override the format step?',
    {
      cpp: `class SalesReport {
    void generate() {
        auto data = gatherSalesData();
        string csv = toCsv(data);   // format-specific
        emailSend(csv);             // deliver-specific
    }
};
class HrReport {
    void generate() {
        auto data = gatherHrData();
        auto pdf  = PdfLib::build(data);
        slackPost(pdf);
    }
};`,
      ts: `class SalesReport {
  generate() {
    const data = this.gatherSalesData()
    const csv  = toCsv(data)    // format-specific
    emailSend(csv)               // deliver-specific
  }
}
class HrReport {
  generate() {
    const data = this.gatherHrData()
    const pdf  = PdfLib.build(data)
    slackPost(pdf)
  }
}`,
    }),

  det(59, 'detect-static-util-god', 'Static Utils mega-class', 'detect', 'easy',
    'Utils with 80 unrelated static methods. Pattern to add?',
    'none', ['singleton', 'facade', 'none', 'visitor'],
    'Split by responsibility — do not crown it with a pattern.',
    'A codebase has a Utils class with 80 static methods covering date formatting, password hashing, tax calculation, email sending, and image resizing — all in one file. A developer asks which design pattern to apply to improve it. What is the right answer?',
    {
      cpp: `class Utils {
public:
    static string formatDate(Date d)           { ... }
    static string hashPassword(string pw)      { ... }
    static double calculateTax(double amount)  { ... }
    static void   sendEmail(string to, string body) { ... }
    static Buffer resizeImage(Buffer img, int w)    { ... }
    // 75 more unrelated methods...
};`,
      ts: `class Utils {
  static formatDate(d: Date): string { ... }
  static hashPassword(pw: string): string { ... }
  static calculateTax(amount: number): number { ... }
  static sendEmail(to: string, body: string) { ... }
  static resizeImage(img: Buffer, w: number): Buffer { ... }
  // 75 more unrelated methods...
}`,
    }),

  det(60, 'explain-when-none', 'Resist pattern pressure', 'explain', 'easy',
    'Interview tip: when a simple class works, answer should often be?',
    'none', ['always-singleton', 'always-factory', 'none', 'always-visitor'],
    'Say none / keep it simple when appropriate.',
    'In an interview you are asked how to design a Greeter that says "Hello, name!". A candidate wraps it in a Factory, a Registry, and a Singleton. Another candidate writes a single function. Which approach demonstrates better engineering judgment?',
    {
      cpp: `// Over-engineered:
class GreeterFactory {
    static Greeter* create(string lang) {
        return GreeterRegistry::getInstance().resolve(lang);
    }
};

// All you needed:
string greet(string name) {
    return "Hello, " + name + "!";
}`,
      ts: `// Over-engineered:
class GreeterFactory {
  static create(lang: string): Greeter {
    return GreeterRegistry.getInstance().resolve(lang)
  }
}

// All you needed:
function greet(name: string) {
  return \`Hello, \${name}!\`
}`,
    }),
]


async function main() {
  await connectDB()
  for (const s of scenarios) {
    await DetectiveScenario.findOneAndUpdate({ slug: s.slug }, s, { upsert: true, new: true })
    console.log('upserted detective', s.slug)
  }
  console.log(`done — ${scenarios.length} detective`)
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
