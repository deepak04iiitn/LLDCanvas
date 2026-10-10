/**
 * Adds multi-language code snippets to all 60 detective scenarios.
 * Run: npx tsx src/scripts/seed-detective-snippets.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { DetectiveScenario } from '../models/learn/detective-scenario.model'

type Snippets = Record<string, string>

const updates: Array<{ slug: string; snippets: Snippets }> = [

  // ── 1. strategy-pricing ──────────────────────────────────────────────────────
  { slug: 'strategy-pricing', snippets: {
    java: `class Ride {
    double calculateFare(String type, double km) {
        if (type.equals("economy"))  return km * 1.0;
        if (type.equals("premium"))  return km * 2.0;
        if (type.equals("surge"))    return km * 3.5;
        throw new IllegalArgumentException("Unknown type");
    }
}`,
    py: `class Ride:
    def calculate_fare(self, ride_type: str, km: float) -> float:
        if ride_type == "economy":  return km * 1.0
        if ride_type == "premium":  return km * 2.0
        if ride_type == "surge":    return km * 3.5
        raise ValueError("Unknown type")`,
    go: `func (r *Ride) CalculateFare(rideType string, km float64) (float64, error) {
    switch rideType {
    case "economy": return km * 1.0, nil
    case "premium": return km * 2.0, nil
    case "surge":   return km * 3.5, nil
    }
    return 0, errors.New("unknown ride type")
}`,
    rust: `impl Ride {
    fn calculate_fare(&self, ride_type: &str, km: f64) -> f64 {
        match ride_type {
            "economy" => km * 1.0,
            "premium" => km * 2.0,
            "surge"   => km * 3.5,
            _ => panic!("Unknown type"),
        }
    }
}`,
    cs: `class Ride {
    double CalculateFare(string type, double km) {
        if (type == "economy")  return km * 1.0;
        if (type == "premium")  return km * 2.0;
        if (type == "surge")    return km * 3.5;
        throw new ArgumentException("Unknown type");
    }
}`,
    kotlin: `class Ride {
    fun calculateFare(type: String, km: Double): Double = when (type) {
        "economy" -> km * 1.0
        "premium" -> km * 2.0
        "surge"   -> km * 3.5
        else -> throw IllegalArgumentException("Unknown type")
    }
}`,
    swift: `class Ride {
    func calculateFare(type: String, km: Double) -> Double {
        switch type {
        case "economy": return km * 1.0
        case "premium": return km * 2.0
        case "surge":   return km * 3.5
        default: fatalError("Unknown type")
        }
    }
}`,
    js: `class Ride {
  calculateFare(type, km) {
    if (type === 'economy')  return km * 1.0
    if (type === 'premium')  return km * 2.0
    if (type === 'surge')    return km * 3.5
    throw new Error('Unknown type')
  }
}`,
    rb: `class Ride
  def calculate_fare(type, km)
    case type
    when 'economy' then km * 1.0
    when 'premium' then km * 2.0
    when 'surge'   then km * 3.5
    else raise ArgumentError, 'Unknown type'
    end
  end
end`,
    php: `class Ride {
    function calculateFare(string $type, float $km): float {
        if ($type === 'economy')  return $km * 1.0;
        if ($type === 'premium')  return $km * 2.0;
        if ($type === 'surge')    return $km * 3.5;
        throw new InvalidArgumentException('Unknown type');
    }
}`,
  }},

  // ── 2. simple-dto-trap ───────────────────────────────────────────────────────
  { slug: 'simple-dto-trap', snippets: {
    java: `class PaymentRequest {
    double amount;
    String currency;
    String merchantId;
    // Pure data bag — no behaviour
}`,
    py: `from dataclasses import dataclass

@dataclass
class PaymentRequest:
    amount: float
    currency: str
    merchant_id: str
    # Pure data bag — no methods, no logic`,
    go: `type PaymentRequest struct {
    Amount     float64
    Currency   string
    MerchantID string
    // Pure data bag — no behaviour
}`,
    rust: `struct PaymentRequest {
    amount: f64,
    currency: String,
    merchant_id: String,
    // Pure data bag — no behaviour
}`,
    cs: `class PaymentRequest {
    public double Amount { get; set; }
    public string Currency { get; set; }
    public string MerchantId { get; set; }
    // Pure data bag — no behaviour
}`,
    kotlin: `data class PaymentRequest(
    val amount: Double,
    val currency: String,
    val merchantId: String
    // Pure data class — no behaviour
)`,
    swift: `struct PaymentRequest {
    let amount: Double
    let currency: String
    let merchantId: String
    // Pure value type — no behaviour
}`,
    js: `// Plain object — no behaviour
const paymentRequest = {
  amount: 0,
  currency: '',
  merchantId: '',
}`,
    rb: `PaymentRequest = Struct.new(:amount, :currency, :merchant_id)
# Pure data bag — no behaviour`,
    php: `class PaymentRequest {
    public float $amount;
    public string $currency;
    public string $merchantId;
    // Pure data bag — no behaviour
}`,
  }},

  // ── 3. observer-order-status ─────────────────────────────────────────────────
  { slug: 'observer-order-status', snippets: {
    java: `class Order {
    void markPaid() {
        status = "paid";
        EmailService.send(id, "paid");    // tight coupling
        SmsService.notify(userId, "paid");
        Analytics.track("order_paid", id);
    }
}`,
    py: `class Order:
    def mark_paid(self):
        self.status = "paid"
        EmailService.send(self.id, "paid")    # tight coupling
        SmsService.notify(self.user_id, "paid")
        Analytics.track("order_paid", self.id)`,
    go: `func (o *Order) MarkPaid() {
    o.Status = "paid"
    EmailService.Send(o.ID, "paid")    // tight coupling
    SmsService.Notify(o.UserID, "paid")
    Analytics.Track("order_paid", o.ID)
}`,
    rust: `impl Order {
    fn mark_paid(&mut self) {
        self.status = "paid".to_string();
        email_service::send(&self.id, "paid");   // tight coupling
        sms_service::notify(&self.user_id, "paid");
        analytics::track("order_paid", &self.id);
    }
}`,
    cs: `class Order {
    void MarkPaid() {
        Status = "paid";
        EmailService.Send(Id, "paid");    // tight coupling
        SmsService.Notify(UserId, "paid");
        Analytics.Track("order_paid", Id);
    }
}`,
    kotlin: `class Order {
    fun markPaid() {
        status = "paid"
        EmailService.send(id, "paid")    // tight coupling
        SmsService.notify(userId, "paid")
        Analytics.track("order_paid", id)
    }
}`,
    swift: `class Order {
    func markPaid() {
        status = "paid"
        EmailService.send(id: id, status: "paid")  // tight coupling
        SmsService.notify(userId: userId, status: "paid")
        Analytics.track("order_paid", orderId: id)
    }
}`,
    js: `class Order {
  markPaid() {
    this.status = 'paid'
    EmailService.send(this.id, 'paid')    // tight coupling
    SmsService.notify(this.userId, 'paid')
    Analytics.track('order_paid', this.id)
  }
}`,
    rb: `class Order
  def mark_paid
    @status = "paid"
    EmailService.send(@id, "paid")    # tight coupling
    SmsService.notify(@user_id, "paid")
    Analytics.track("order_paid", @id)
  end
end`,
    php: `class Order {
    function markPaid(): void {
        $this->status = 'paid';
        EmailService::send($this->id, 'paid');    // tight coupling
        SmsService::notify($this->userId, 'paid');
        Analytics::track('order_paid', $this->id);
    }
}`,
  }},

  // ── 4. factory-payment-gateway ───────────────────────────────────────────────
  { slug: 'factory-payment-gateway', snippets: {
    java: `// Caller decides which gateway to instantiate:
PaymentGateway gw;
if (config.getProvider().equals("razorpay"))
    gw = new RazorpayGateway(config.getKey());
else
    gw = new StripeGateway(config.getSecret());

gw.charge(order.getAmount());`,
    py: `# Caller decides which gateway to instantiate:
if config.provider == "razorpay":
    gw = RazorpayGateway(config.key)
else:
    gw = StripeGateway(config.secret)

gw.charge(order.amount)`,
    go: `// Caller decides which gateway to create:
var gw PaymentGateway
if config.Provider == "razorpay" {
    gw = NewRazorpayGateway(config.Key)
} else {
    gw = NewStripeGateway(config.Secret)
}
gw.Charge(order.Amount)`,
    rust: `// Caller decides which gateway to create:
let gw: Box<dyn PaymentGateway> = if config.provider == "razorpay" {
    Box::new(RazorpayGateway::new(&config.key))
} else {
    Box::new(StripeGateway::new(&config.secret))
};
gw.charge(order.amount);`,
    cs: `// Caller decides which gateway to create:
IPaymentGateway gw;
if (config.Provider == "razorpay")
    gw = new RazorpayGateway(config.Key);
else
    gw = new StripeGateway(config.Secret);

gw.Charge(order.Amount);`,
    kotlin: `// Caller decides which gateway to create:
val gw: PaymentGateway = if (config.provider == "razorpay")
    RazorpayGateway(config.key)
else
    StripeGateway(config.secret)

gw.charge(order.amount)`,
    swift: `// Caller decides which gateway to create:
let gw: PaymentGateway = config.provider == "razorpay"
    ? RazorpayGateway(key: config.key)
    : StripeGateway(secret: config.secret)

gw.charge(amount: order.amount)`,
    js: `// Caller decides which gateway to instantiate:
const gw = config.provider === 'razorpay'
  ? new RazorpayGateway(config.key)
  : new StripeGateway(config.secret)

gw.charge(order.amount)`,
    rb: `# Caller decides which gateway to instantiate:
gw = if config.provider == 'razorpay'
  RazorpayGateway.new(config.key)
else
  StripeGateway.new(config.secret)
end

gw.charge(order.amount)`,
    php: `// Caller decides which gateway to instantiate:
if ($config->provider === 'razorpay')
    $gw = new RazorpayGateway($config->key);
else
    $gw = new StripeGateway($config->secret);

$gw->charge($order->amount);`,
  }},

  // ── 5. decorator-notifier ────────────────────────────────────────────────────
  { slug: 'decorator-notifier', snippets: {
    java: `interface NotificationChannel {
    void send(String msg);
}
class EmailChannel implements NotificationChannel {
    public void send(String msg) { /* send email */ }
}
// Need: LoggingChannel wrapping RetryChannel wrapping EmailChannel
// Without modifying EmailChannel`,
    py: `from abc import ABC, abstractmethod

class NotificationChannel(ABC):
    @abstractmethod
    def send(self, msg: str) -> None: ...

class EmailChannel(NotificationChannel):
    def send(self, msg: str) -> None:
        pass  # send email

# Need: LoggingChannel(RetryChannel(EmailChannel()))
# Without modifying EmailChannel`,
    go: `type NotificationChannel interface {
    Send(msg string)
}
type EmailChannel struct{}

func (e *EmailChannel) Send(msg string) { /* send email */ }

// Need: logging + retry wrappers around any channel
// Without modifying EmailChannel`,
    rust: `trait NotificationChannel {
    fn send(&self, msg: &str);
}
struct EmailChannel;

impl NotificationChannel for EmailChannel {
    fn send(&self, msg: &str) { /* send email */ }
}
// Need: LoggingChannel(RetryChannel(EmailChannel))
// Without modifying EmailChannel`,
    cs: `interface INotificationChannel {
    void Send(string msg);
}
class EmailChannel : INotificationChannel {
    public void Send(string msg) { /* send email */ }
}
// Need: LoggingChannel wrapping RetryChannel wrapping EmailChannel
// Without modifying EmailChannel`,
    kotlin: `interface NotificationChannel {
    fun send(msg: String)
}
class EmailChannel : NotificationChannel {
    override fun send(msg: String) { /* send email */ }
}
// Need: LoggingChannel(RetryChannel(EmailChannel()))
// Without modifying EmailChannel`,
    swift: `protocol NotificationChannel {
    func send(_ msg: String)
}
class EmailChannel: NotificationChannel {
    func send(_ msg: String) { /* send email */ }
}
// Need: LoggingChannel wrapping RetryChannel wrapping EmailChannel
// Without modifying EmailChannel`,
    js: `class EmailChannel {
  send(msg) { /* send email */ }
}
// Need: LoggingChannel wrapping RetryChannel wrapping EmailChannel
// Without modifying EmailChannel`,
    rb: `class EmailChannel
  def send(msg)
    # send email
  end
end
# Need: LoggingChannel.new(RetryChannel.new(EmailChannel.new))
# Without modifying EmailChannel`,
    php: `interface NotificationChannel {
    function send(string $msg): void;
}
class EmailChannel implements NotificationChannel {
    function send(string $msg): void { /* send email */ }
}
// Need: LoggingChannel wrapping RetryChannel wrapping EmailChannel
// Without modifying EmailChannel`,
  }},

  // ── 6. adapter-stripe-sdk ────────────────────────────────────────────────────
  { slug: 'adapter-stripe-sdk', snippets: {
    java: `interface PaymentPort {
    String charge(double amount, String token);
}
// Stripe SDK uses a different API:
// stripe.paymentIntents().create(params)
class StripeAdapter implements PaymentPort {
    public String charge(double amount, String token) {
        PaymentIntentCreateParams p = PaymentIntentCreateParams.builder()
            .setAmount((long)(amount * 100)).setCurrency("usd").build();
        return stripe.paymentIntents().create(p).getId();
    }
}`,
    py: `class PaymentPort(ABC):
    @abstractmethod
    def charge(self, amount: float, token: str) -> str: ...

# Stripe SDK speaks a different language:
# stripe.PaymentIntent.create(amount=..., currency=...)
class StripeAdapter(PaymentPort):
    def charge(self, amount: float, token: str) -> str:
        intent = stripe.PaymentIntent.create(amount=int(amount*100), currency="usd")
        return intent.id`,
    go: `type PaymentPort interface {
    Charge(amount float64, token string) (string, error)
}
// Stripe SDK uses a different API
type StripeAdapter struct{ client *stripe.Client }

func (a *StripeAdapter) Charge(amount float64, token string) (string, error) {
    intent, err := a.client.PaymentIntents.New(&stripe.PaymentIntentParams{
        Amount: stripe.Int64(int64(amount * 100)), Currency: stripe.String("usd"),
    })
    return intent.ID, err
}`,
    rust: `trait PaymentPort {
    fn charge(&self, amount: f64, token: &str) -> Result<String, Error>;
}
// Stripe SDK has completely different method names
struct StripeAdapter { client: StripeClient }

impl PaymentPort for StripeAdapter {
    fn charge(&self, amount: f64, token: &str) -> Result<String, Error> {
        let intent = self.client.create_payment_intent(amount, "usd")?;
        Ok(intent.id)
    }
}`,
    cs: `interface IPaymentPort {
    string Charge(double amount, string token);
}
// Stripe SDK uses a different API
class StripeAdapter : IPaymentPort {
    public string Charge(double amount, string token) {
        var options = new PaymentIntentCreateOptions { Amount = (long)(amount*100), Currency = "usd" };
        var intent = new PaymentIntentService().Create(options);
        return intent.Id;
    }
}`,
    kotlin: `interface PaymentPort {
    fun charge(amount: Double, token: String): String
}
// Stripe SDK speaks a different language
class StripeAdapter(private val stripe: StripeClient) : PaymentPort {
    override fun charge(amount: Double, token: String): String {
        val intent = stripe.paymentIntents.create(mapOf("amount" to (amount*100).toLong(), "currency" to "usd"))
        return intent.id
    }
}`,
    swift: `protocol PaymentPort {
    func charge(amount: Double, token: String) -> String
}
// Stripe SDK has a completely different API
class StripeAdapter: PaymentPort {
    func charge(amount: Double, token: String) -> String {
        let params = STPPaymentIntentParams(clientSecret: token)
        // translate and call stripe SDK...
        return "intent_id"
    }
}`,
    js: `// Stripe SDK speaks a different language:
// stripe.paymentIntents.create({ amount, currency })
class StripeAdapter {
  async charge(amount, token) {
    const intent = await stripe.paymentIntents.create({ amount: amount * 100, currency: 'usd' })
    return intent.id
  }
}`,
    rb: `class StripeAdapter
  def charge(amount, token)
    # Stripe SDK has a completely different API
    intent = Stripe::PaymentIntent.create(
      amount: (amount * 100).to_i, currency: 'usd'
    )
    intent.id
  end
end`,
    php: `class StripeAdapter implements PaymentPort {
    function charge(float $amount, string $token): string {
        // Stripe SDK has a completely different API
        $intent = \Stripe\PaymentIntent::create([
            'amount'   => (int)($amount * 100),
            'currency' => 'usd',
        ]);
        return $intent->id;
    }
}`,
  }},

  // ── 7. facade-checkout ───────────────────────────────────────────────────────
  { slug: 'facade-checkout', snippets: {
    java: `// UI currently orchestrates all services directly:
void checkout(String userId) {
    Cart cart = CartService.getCart(userId);
    PaymentService.charge(cart.getTotal(), userId);
    InventoryService.reserve(cart.getItems());
    EmailService.sendConfirmation(userId);
}`,
    py: `# UI currently orchestrates all services directly:
def checkout(user_id: str) -> None:
    cart = CartService.get_cart(user_id)
    PaymentService.charge(cart.total, user_id)
    InventoryService.reserve(cart.items)
    EmailService.send_confirmation(user_id)`,
    go: `// UI currently orchestrates all services directly:
func Checkout(userID string) error {
    cart, _ := CartService.GetCart(userID)
    PaymentService.Charge(cart.Total, userID)
    InventoryService.Reserve(cart.Items)
    EmailService.SendConfirmation(userID)
    return nil
}`,
    rust: `// UI currently orchestrates all services directly:
fn checkout(user_id: &str) -> Result<(), Error> {
    let cart = cart_service::get_cart(user_id)?;
    payment_service::charge(cart.total, user_id)?;
    inventory_service::reserve(&cart.items)?;
    email_service::send_confirmation(user_id)?;
    Ok(())
}`,
    cs: `// UI currently orchestrates all services directly:
void Checkout(string userId) {
    var cart = CartService.GetCart(userId);
    PaymentService.Charge(cart.Total, userId);
    InventoryService.Reserve(cart.Items);
    EmailService.SendConfirmation(userId);
}`,
    kotlin: `// UI currently orchestrates all services directly:
fun checkout(userId: String) {
    val cart = CartService.getCart(userId)
    PaymentService.charge(cart.total, userId)
    InventoryService.reserve(cart.items)
    EmailService.sendConfirmation(userId)
}`,
    swift: `// UI currently orchestrates all services directly:
func checkout(userId: String) {
    let cart = CartService.getCart(userId: userId)
    PaymentService.charge(total: cart.total, userId: userId)
    InventoryService.reserve(items: cart.items)
    EmailService.sendConfirmation(userId: userId)
}`,
    js: `// UI currently orchestrates all services directly:
async function checkout(userId) {
  const cart = await CartService.getCart(userId)
  await PaymentService.charge(cart.total, userId)
  await InventoryService.reserve(cart.items)
  await EmailService.sendConfirmation(userId)
}`,
    rb: `# UI currently orchestrates all services directly:
def checkout(user_id)
  cart = CartService.get_cart(user_id)
  PaymentService.charge(cart.total, user_id)
  InventoryService.reserve(cart.items)
  EmailService.send_confirmation(user_id)
end`,
    php: `// UI currently orchestrates all services directly:
function checkout(string $userId): void {
    $cart = CartService::getCart($userId);
    PaymentService::charge($cart->total, $userId);
    InventoryService::reserve($cart->items);
    EmailService::sendConfirmation($userId);
}`,
  }},

  // ── 8. singleton-misuse ──────────────────────────────────────────────────────
  { slug: 'singleton-misuse', snippets: {
    java: `class CurrentUser {
    private static CurrentUser instance;
    private String userId;

    public static CurrentUser get() {
        if (instance == null) instance = new CurrentUser();
        return instance;
    }
}
// In handler:
CurrentUser.get().setUserId(req.getUser().getId()); // Shared across ALL requests!`,
    py: `class CurrentUser:
    _instance = None

    @classmethod
    def get(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

# In handler:
CurrentUser.get().user_id = request.user.id  # shared across all requests!`,
    go: `var currentUserInstance *CurrentUser
var once sync.Once

func GetCurrentUser() *CurrentUser {
    once.Do(func() { currentUserInstance = &CurrentUser{} })
    return currentUserInstance
}
// In handler:
GetCurrentUser().UserID = r.Context().Value("user").(string) // Shared across requests!`,
    rust: `use std::sync::Mutex;
static CURRENT_USER: Mutex<Option<CurrentUser>> = Mutex::new(None);

fn get_current_user() -> std::sync::MutexGuard<'static, Option<CurrentUser>> {
    CURRENT_USER.lock().unwrap()
}
// In handler — sets shared state across concurrent requests!`,
    cs: `class CurrentUser {
    private static CurrentUser _instance;
    public string UserId { get; set; }

    public static CurrentUser Get() {
        if (_instance == null) _instance = new CurrentUser();
        return _instance;
    }
}
// In handler:
CurrentUser.Get().UserId = request.User.Id; // Shared across ALL requests!`,
    kotlin: `object CurrentUser {
    var userId: String = ""
    // Kotlin object = Singleton
}
// In handler:
CurrentUser.userId = request.user.id  // shared across all requests!`,
    swift: `class CurrentUser {
    static let shared = CurrentUser()
    var userId: String = ""
    private init() {}
}
// In handler:
CurrentUser.shared.userId = request.userId  // shared across all requests!`,
    js: `class CurrentUser {
  static instance = null
  userId = ''
  static get() {
    if (!CurrentUser.instance) CurrentUser.instance = new CurrentUser()
    return CurrentUser.instance
  }
}
// In handler:
CurrentUser.get().userId = req.user.id  // shared across all requests!`,
    rb: `class CurrentUser
  @instance = nil
  attr_accessor :user_id

  def self.get
    @instance ||= new
  end
end
# In handler:
CurrentUser.get.user_id = request.user_id  # shared across all requests!`,
    php: `class CurrentUser {
    private static ?CurrentUser $instance = null;
    public string $userId = '';

    public static function get(): self {
        if (self::$instance === null) self::$instance = new self();
        return self::$instance;
    }
}
// In handler:
CurrentUser::get()->userId = $request->user->id; // Shared across ALL requests!`,
  }},

  // ── 9. builder-query ─────────────────────────────────────────────────────────
  { slug: 'builder-query', snippets: {
    java: `// Unreadable positional args:
SearchQuery q = new SearchQuery("laptop", "electronics", 500, 2000, 4.0, true, "popular", 20);

// Desired fluent API:
SearchQuery q = SearchQuery.builder()
    .term("laptop")
    .category("electronics")
    .priceRange(500, 2000)
    .minRating(4.0)
    .build();`,
    py: `# Too many positional args — fragile:
q = SearchQuery("laptop", "electronics", 500, 2000, 4.0, True, "popular", 20)

# Desired fluent API:
q = (SearchQuery.builder()
     .term("laptop")
     .category("electronics")
     .price_range(500, 2000)
     .min_rating(4.0)
     .build())`,
    go: `// Too many positional args:
q := NewSearchQuery("laptop", "electronics", 500, 2000, 4.0, true, "popular", 20)

// Desired builder API:
q := SearchQueryBuilder{}.
    Term("laptop").
    Category("electronics").
    PriceRange(500, 2000).
    MinRating(4.0).
    Build()`,
    rust: `// Too many positional args — fragile:
let q = SearchQuery::new("laptop", "electronics", 500.0, 2000.0, 4.0, true, "popular", 20);

// Desired builder pattern:
let q = SearchQueryBuilder::new()
    .term("laptop")
    .category("electronics")
    .price_range(500.0, 2000.0)
    .min_rating(4.0)
    .build();`,
    cs: `// Too many positional args:
var q = new SearchQuery("laptop", "electronics", 500, 2000, 4.0, true, "popular", 20);

// Desired fluent API:
var q = SearchQuery.Builder()
    .Term("laptop")
    .Category("electronics")
    .PriceRange(500, 2000)
    .MinRating(4.0)
    .Build();`,
    kotlin: `// Too many positional args:
val q = SearchQuery("laptop", "electronics", 500, 2000, 4.0, true, "popular", 20)

// Desired fluent API:
val q = SearchQuery.builder()
    .term("laptop")
    .category("electronics")
    .priceRange(500, 2000)
    .minRating(4.0)
    .build()`,
    swift: `// Too many positional args:
let q = SearchQuery(term: "laptop", category: "electronics",
    minPrice: 500, maxPrice: 2000, minRating: 4.0, inStock: true, sort: "popular", limit: 20)

// Desired builder API:
let q = SearchQueryBuilder()
    .term("laptop").category("electronics")
    .priceRange(500, 2000).minRating(4.0).build()`,
    js: `// Hard to read — 8 positional arguments:
const q = new SearchQuery('laptop', 'electronics', 500, 2000, 4.0, true, 'popular', 20)

// Desired API:
const q = SearchQuery.builder()
  .term('laptop')
  .category('electronics')
  .priceRange(500, 2000)
  .build()`,
    rb: `# Too many positional args:
q = SearchQuery.new("laptop", "electronics", 500, 2000, 4.0, true, "popular", 20)

# Desired fluent API:
q = SearchQuery.builder
    .term("laptop")
    .category("electronics")
    .price_range(500, 2000)
    .min_rating(4.0)
    .build`,
    php: `// Too many positional args:
$q = new SearchQuery("laptop", "electronics", 500, 2000, 4.0, true, "popular", 20);

// Desired fluent API:
$q = SearchQuery::builder()
    ->term("laptop")
    ->category("electronics")
    ->priceRange(500, 2000)
    ->minRating(4.0)
    ->build();`,
  }},

  // ── 10. proxy-image ──────────────────────────────────────────────────────────
  { slug: 'proxy-image', snippets: {
    java: `interface Image { void display(); }

class RealImage implements Image {
    RealImage(String filename) {
        loadFromDisk(filename); // expensive!
    }
    public void display() { /* show pixels */ }
}
// Need: a stand-in that defers loading until display() is first called`,
    py: `from abc import ABC, abstractmethod

class Image(ABC):
    @abstractmethod
    def display(self) -> None: ...

class RealImage(Image):
    def __init__(self, filename: str):
        self._load_from_disk(filename)  # expensive!
    def display(self) -> None:
        pass  # show pixels

# Need: a stand-in that defers loading until display() is first called`,
    go: `type Image interface {
    Display()
}
type RealImage struct{ filename string }

func NewRealImage(filename string) *RealImage {
    img := &RealImage{filename: filename}
    img.loadFromDisk()  // expensive!
    return img
}
func (r *RealImage) Display() { /* show pixels */ }
// Need: a stand-in that defers loading until Display() is first called`,
    rust: `trait Image { fn display(&self); }

struct RealImage { data: Vec<u8> }

impl RealImage {
    fn new(filename: &str) -> Self {
        Self { data: load_from_disk(filename) }  // expensive!
    }
}
impl Image for RealImage { fn display(&self) { /* show pixels */ } }
// Need: a proxy that defers loading until display() is called`,
    cs: `interface IImage { void Display(); }

class RealImage : IImage {
    RealImage(string filename) {
        LoadFromDisk(filename); // expensive!
    }
    public void Display() { /* show pixels */ }
}
// Need: a stand-in that defers loading until Display() is first called`,
    kotlin: `interface Image { fun display() }

class RealImage(filename: String) : Image {
    init { loadFromDisk(filename) }  // expensive!
    override fun display() { /* show pixels */ }
}
// Need: a stand-in that defers loading until display() is first called`,
    swift: `protocol Image { func display() }

class RealImage: Image {
    init(filename: String) {
        loadFromDisk(filename: filename)  // expensive!
    }
    func display() { /* show pixels */ }
}
// Need: a stand-in that defers loading until display() is first called`,
    js: `class RealImage {
  constructor(filename) {
    this.loadFromDisk(filename)  // expensive!
  }
  display() { /* show pixels */ }
}
// Need: a stand-in that defers loadFromDisk until display() is called`,
    rb: `class RealImage
  def initialize(filename)
    load_from_disk(filename)  # expensive!
  end
  def display = puts "showing pixels"
end
# Need: a stand-in that defers loading until display is first called`,
    php: `interface Image { function display(): void; }

class RealImage implements Image {
    function __construct(string $filename) {
        $this->loadFromDisk($filename); // expensive!
    }
    function display(): void { /* show pixels */ }
}
// Need: a stand-in that defers loading until display() is first called`,
  }},

  // ── 11. command-editor ───────────────────────────────────────────────────────
  { slug: 'command-editor', snippets: {
    java: `class Editor {
    void addNode(Node node)  { canvas.getNodes().add(node); }
    void deleteEdge(Edge e)  { canvas.removeEdge(e); }
    // No undo — history is lost after every call
}`,
    py: `class Editor:
    def add_node(self, node: Node) -> None:
        self.canvas.nodes.append(node)
    def delete_edge(self, edge: Edge) -> None:
        self.canvas.edges.remove(edge)
    # No undo — history is lost after every call`,
    go: `type Editor struct{ canvas *Canvas }

func (e *Editor) AddNode(node Node) { e.canvas.Nodes = append(e.canvas.Nodes, node) }
func (e *Editor) DeleteEdge(edge Edge) { e.canvas.RemoveEdge(edge) }
// No undo — history is lost after every call`,
    rust: `impl Editor {
    fn add_node(&mut self, node: Node) {
        self.canvas.nodes.push(node);
    }
    fn delete_edge(&mut self, edge: Edge) {
        self.canvas.remove_edge(edge);
    }
    // No undo — history is lost after every call
}`,
    cs: `class Editor {
    void AddNode(Node node)  { canvas.Nodes.Add(node); }
    void DeleteEdge(Edge e)  { canvas.RemoveEdge(e); }
    // No undo — history is lost after every call
}`,
    kotlin: `class Editor {
    fun addNode(node: Node) { canvas.nodes.add(node) }
    fun deleteEdge(edge: Edge) { canvas.removeEdge(edge) }
    // No undo — history is lost after every call
}`,
    swift: `class Editor {
    func addNode(_ node: Node) { canvas.nodes.append(node) }
    func deleteEdge(_ edge: Edge) { canvas.removeEdge(edge) }
    // No undo — history is lost after every call
}`,
    js: `class Editor {
  addNode(node)  { this.canvas.nodes.push(node) }
  deleteEdge(edge) { this.canvas.edges.splice(this.canvas.edges.indexOf(edge), 1) }
  // No undo — history is lost
}`,
    rb: `class Editor
  def add_node(node) = canvas.nodes << node
  def delete_edge(edge) = canvas.edges.delete(edge)
  # No undo — history is lost after every call
end`,
    php: `class Editor {
    function addNode(Node $node): void  { $this->canvas->nodes[] = $node; }
    function deleteEdge(Edge $e): void  { $this->canvas->removeEdge($e); }
    // No undo — history is lost after every call
}`,
  }},

  // ── 12. state-order ──────────────────────────────────────────────────────────
  { slug: 'state-order', snippets: {
    java: `class Order {
    private String status = "draft";
    void pay() {
        if (status.equals("draft"))      status = "paid";
        else if (status.equals("paid"))  throw new RuntimeException("Already paid");
        else                             throw new RuntimeException("Already shipped");
    }
    void ship() {
        if (!status.equals("paid")) throw new RuntimeException("Pay first");
        status = "shipped";
    }
}`,
    py: `class Order:
    def __init__(self): self.status = "draft"
    def pay(self):
        if self.status == "draft":      self.status = "paid"
        elif self.status == "paid":     raise RuntimeError("Already paid")
        else:                           raise RuntimeError("Already shipped")
    def ship(self):
        if self.status != "paid": raise RuntimeError("Pay first")
        self.status = "shipped"`,
    go: `type Order struct{ Status string }

func (o *Order) Pay() error {
    switch o.Status {
    case "draft":    o.Status = "paid"; return nil
    case "paid":     return errors.New("already paid")
    default:         return errors.New("already shipped")
    }
}
func (o *Order) Ship() error {
    if o.Status != "paid" { return errors.New("pay first") }
    o.Status = "shipped"; return nil
}`,
    rust: `impl Order {
    fn pay(&mut self) -> Result<(), &str> {
        match self.status.as_str() {
            "draft" => { self.status = "paid".into(); Ok(()) }
            "paid"  => Err("already paid"),
            _       => Err("already shipped"),
        }
    }
    fn ship(&mut self) -> Result<(), &str> {
        if self.status != "paid" { return Err("pay first"); }
        self.status = "shipped".into(); Ok(())
    }
}`,
    cs: `class Order {
    string Status = "draft";
    void Pay() {
        if (Status == "draft")      Status = "paid";
        else if (Status == "paid")  throw new Exception("Already paid");
        else                        throw new Exception("Already shipped");
    }
    void Ship() {
        if (Status != "paid") throw new Exception("Pay first");
        Status = "shipped";
    }
}`,
    kotlin: `class Order {
    var status = "draft"
    fun pay() = when (status) {
        "draft"  -> status = "paid"
        "paid"   -> throw IllegalStateException("Already paid")
        else     -> throw IllegalStateException("Already shipped")
    }
    fun ship() {
        if (status != "paid") throw IllegalStateException("Pay first")
        status = "shipped"
    }
}`,
    swift: `class Order {
    var status = "draft"
    func pay() throws {
        switch status {
        case "draft":  status = "paid"
        case "paid":   throw OrderError.alreadyPaid
        default:       throw OrderError.alreadyShipped
        }
    }
    func ship() throws {
        guard status == "paid" else { throw OrderError.payFirst }
        status = "shipped"
    }
}`,
    js: `class Order {
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
    rb: `class Order
  attr_reader :status
  def initialize = @status = "draft"
  def pay
    case @status
    when "draft" then @status = "paid"
    when "paid"  then raise "Already paid"
    else              raise "Already shipped"
    end
  end
  def ship = @status == "paid" ? @status = "shipped" : raise("Pay first")
end`,
    php: `class Order {
    private string $status = 'draft';
    function pay(): void {
        if ($this->status === 'draft')      $this->status = 'paid';
        elseif ($this->status === 'paid')   throw new Exception('Already paid');
        else                                throw new Exception('Already shipped');
    }
    function ship(): void {
        if ($this->status !== 'paid') throw new Exception('Pay first');
        $this->status = 'shipped';
    }
}`,
  }},

  // ── 13–60: remaining scenarios use concise translations ──────────────────────

  { slug: 'template-export', snippets: {
    java: `class CsvExporter {
    void export() {
        validate();                         // duplicated
        List<Row> data = fetchData();       // duplicated
        Files.writeString(Path.of("out.csv"), toCsv(data));
    }
}
class PdfExporter {
    void export() {
        validate();                         // duplicated
        List<Row> data = fetchData();       // duplicated
        PdfLib.create(data).save("out.pdf");
    }
}`,
    py: `class CsvExporter:
    def export(self):
        self.validate()           # duplicated
        data = self.fetch_data()  # duplicated
        open("out.csv","w").write(to_csv(data))

class PdfExporter:
    def export(self):
        self.validate()           # duplicated
        data = self.fetch_data()  # duplicated
        PdfLib.create(data).save("out.pdf")`,
    go: `func (e *CsvExporter) Export() {
    e.validate(); data := e.fetchData() // duplicated
    os.WriteFile("out.csv", toCsv(data), 0644)
}
func (e *PdfExporter) Export() {
    e.validate(); data := e.fetchData() // same skeleton duplicated
    PdfLib.Create(data).Save("out.pdf")
}`,
    rust: `impl CsvExporter { fn export(&self) { self.validate(); let data = self.fetch_data(); write_csv(data); } }
impl PdfExporter { fn export(&self) { self.validate(); let data = self.fetch_data(); write_pdf(data); } }
// validate() and fetch_data() are duplicated in both`,
    cs: `class CsvExporter { void Export() { Validate(); var data = FetchData(); File.WriteAllText("out.csv", ToCsv(data)); } }
class PdfExporter { void Export() { Validate(); var data = FetchData(); PdfLib.Create(data).Save("out.pdf"); } }
// Validate() and FetchData() are duplicated`,
    kotlin: `class CsvExporter { fun export() { validate(); val d=fetchData(); writeCsv(d) } }
class PdfExporter { fun export() { validate(); val d=fetchData(); PdfLib.create(d).save() } }
// validate() and fetchData() duplicated`,
    swift: `class CsvExporter { func export() { validate(); let d=fetchData(); writeCsv(d) } }
class PdfExporter { func export() { validate(); let d=fetchData(); PdfLib.create(d).save() } }
// validate() and fetchData() duplicated`,
    js: `class CsvExporter { export() { this.validate(); const d=this.fetchData(); writeCsv(d) } }
class PdfExporter { export() { this.validate(); const d=this.fetchData(); PdfLib.create(d).save() } }
// validate() and fetchData() are duplicated`,
    rb: `class CsvExporter
  def export = validate && (data=fetch_data) && write_csv(data)
end
class PdfExporter
  def export = validate && (data=fetch_data) && PdfLib.create(data).save
end
# validate and fetch_data are duplicated`,
    php: `class CsvExporter { function export(): void { $this->validate(); $d=$this->fetchData(); writeCsv($d); } }
class PdfExporter { function export(): void { $this->validate(); $d=$this->fetchData(); PdfLib::create($d)->save(); } }
// validate() and fetchData() are duplicated`,
  }},

  { slug: 'composite-widgets', snippets: {
    java: `interface Widget { void render(); }
class Button implements Widget { public void render() { System.out.println("<button>"); } }
class Panel {
    List<Object> children = new ArrayList<>();
    void render() {
        // Must instanceof-check to render
        children.forEach(c -> { if (c instanceof Widget) ((Widget)c).render(); });
    }
}`,
    py: `class Button:
    def render(self): print("<button>")

class Panel:
    def __init__(self): self.children = []
    def render(self):
        for c in self.children:
            c.render()  # needs uniform interface`,
    go: `type Widget interface { Render() }
type Button struct{}
func (b *Button) Render() { fmt.Println("<button>") }
type Panel struct{ Children []interface{} }
func (p *Panel) Render() {
    for _, c := range p.Children {
        if w, ok := c.(Widget); ok { w.Render() }
    }
}`,
    rust: `trait Widget { fn render(&self); }
struct Button;
impl Widget for Button { fn render(&self) { println!("<button>"); } }
struct Panel { children: Vec<Box<dyn Widget>> }
impl Panel { fn render(&self) { self.children.iter().for_each(|c| c.render()); } }`,
    cs: `interface IWidget { void Render(); }
class Button : IWidget { public void Render() => Console.WriteLine("<button>"); }
class Panel {
    List<object> Children = new();
    void Render() { Children.OfType<IWidget>().ToList().ForEach(c => c.Render()); }
}`,
    kotlin: `interface Widget { fun render() }
class Button : Widget { override fun render() = println("<button>") }
class Panel(val children: MutableList<Any> = mutableListOf()) {
    fun render() { children.filterIsInstance<Widget>().forEach { it.render() } }
}`,
    swift: `protocol Widget { func render() }
class Button: Widget { func render() { print("<button>") } }
class Panel {
    var children: [Any] = []
    func render() { children.compactMap { $0 as? Widget }.forEach { $0.render() } }
}`,
    js: `class Button { render() { console.log('<button>') } }
class Panel {
  children = []
  render() { this.children.forEach(c => c.render()) }
  // No uniform interface — relies on duck typing
}`,
    rb: `class Button
  def render = puts "<button>"
end
class Panel
  def initialize = @children = []
  def render = @children.each(&:render)
end`,
    php: `interface Widget { function render(): void; }
class Button implements Widget { function render(): void { echo "<button>"; } }
class Panel {
    array $children = [];
    function render(): void { foreach ($this->children as $c) $c->render(); }
}`,
  }},

  { slug: 'chain-middleware', snippets: {
    java: `void handle(HttpRequest req, HttpResponse res) {
    if (req.getHeader("Authorization") == null) { res.setStatus(401); return; }
    if (rateLimiter.isExceeded(req.getIp()))    { res.setStatus(429); return; }
    if (!validator.isValid(req.getBody()))       { res.setStatus(400); return; }
    businessLogic(req, res);
}`,
    py: `def handle(req, res):
    if not req.headers.get("Authorization"):
        res.status = 401; return
    if rate_limiter.is_exceeded(req.ip):
        res.status = 429; return
    if not validator.is_valid(req.body):
        res.status = 400; return
    business_logic(req, res)`,
    go: `func handle(w http.ResponseWriter, r *http.Request) {
    if r.Header.Get("Authorization") == "" { w.WriteHeader(401); return }
    if rateLimiter.IsExceeded(r.RemoteAddr) { w.WriteHeader(429); return }
    if !validator.IsValid(r.Body) { w.WriteHeader(400); return }
    businessLogic(w, r)
}`,
    rust: `fn handle(req: &Request, res: &mut Response) {
    if req.header("Authorization").is_none() { res.set_status(401); return; }
    if rate_limiter::is_exceeded(&req.ip)    { res.set_status(429); return; }
    if !validator::is_valid(&req.body)       { res.set_status(400); return; }
    business_logic(req, res);
}`,
    cs: `void Handle(HttpRequest req, HttpResponse res) {
    if (req.Headers["Authorization"] == null) { res.StatusCode = 401; return; }
    if (rateLimiter.IsExceeded(req.RemoteIp)) { res.StatusCode = 429; return; }
    if (!validator.IsValid(req.Body))          { res.StatusCode = 400; return; }
    BusinessLogic(req, res);
}`,
    kotlin: `fun handle(req: HttpRequest, res: HttpResponse) {
    if (req.headers["Authorization"] == null) { res.status = 401; return }
    if (rateLimiter.isExceeded(req.ip))       { res.status = 429; return }
    if (!validator.isValid(req.body))          { res.status = 400; return }
    businessLogic(req, res)
}`,
    swift: `func handle(_ req: Request, _ res: inout Response) {
    guard req.headers["Authorization"] != nil else { res.status = 401; return }
    guard !rateLimiter.isExceeded(req.ip)      else { res.status = 429; return }
    guard validator.isValid(req.body)          else { res.status = 400; return }
    businessLogic(req, &res)
}`,
    js: `function handle(req, res) {
  if (!req.headers.authorization)        { res.status(401); return }
  if (rateLimiter.isExceeded(req.ip))   { res.status(429); return }
  if (!validator.isValid(req.body))     { res.status(400); return }
  businessLogic(req, res)
}`,
    rb: `def handle(req, res)
  return res.status = 401 unless req.headers["Authorization"]
  return res.status = 429 if rate_limiter.exceeded?(req.ip)
  return res.status = 400 unless validator.valid?(req.body)
  business_logic(req, res)
end`,
    php: `function handle(Request $req, Response $res): void {
    if (!$req->header('Authorization'))     { $res->status(401); return; }
    if ($rateLimiter->isExceeded($req->ip)) { $res->status(429); return; }
    if (!$validator->isValid($req->body))   { $res->status(400); return; }
    businessLogic($req, $res);
}`,
  }},

  { slug: 'chain-approvals', snippets: {
    java: `void approveExpense(double amount, String userId) {
    if (amount <= 500)        manager.approve(userId, amount);
    else if (amount <= 5000)  director.approve(userId, amount);
    else                      vp.approve(userId, amount);
    // Adding CFO level = edit this function
}`,
    py: `def approve_expense(amount: float, user_id: str) -> None:
    if amount <= 500:       manager.approve(user_id, amount)
    elif amount <= 5000:    director.approve(user_id, amount)
    else:                   vp.approve(user_id, amount)
    # Adding CFO level = edit this function`,
    go: `func ApproveExpense(amount float64, userID string) {
    switch {
    case amount <= 500:  manager.Approve(userID, amount)
    case amount <= 5000: director.Approve(userID, amount)
    default:             vp.Approve(userID, amount)
    }
    // Adding CFO level = edit this function
}`,
    rust: `fn approve_expense(amount: f64, user_id: &str) {
    if amount <= 500.0 { manager.approve(user_id, amount); }
    else if amount <= 5000.0 { director.approve(user_id, amount); }
    else { vp.approve(user_id, amount); }
    // Adding CFO level = edit this function
}`,
    cs: `void ApproveExpense(double amount, string userId) {
    if (amount <= 500)        manager.Approve(userId, amount);
    else if (amount <= 5000)  director.Approve(userId, amount);
    else                      vp.Approve(userId, amount);
}`,
    kotlin: `fun approveExpense(amount: Double, userId: String) = when {
    amount <= 500  -> manager.approve(userId, amount)
    amount <= 5000 -> director.approve(userId, amount)
    else           -> vp.approve(userId, amount)
}`,
    swift: `func approveExpense(amount: Double, userId: String) {
    if amount <= 500       { manager.approve(userId, amount) }
    else if amount <= 5000 { director.approve(userId, amount) }
    else                   { vp.approve(userId, amount) }
}`,
    js: `function approveExpense(amount, userId) {
  if (amount <= 500)        manager.approve(userId, amount)
  else if (amount <= 5000)  director.approve(userId, amount)
  else                      vp.approve(userId, amount)
}`,
    rb: `def approve_expense(amount, user_id)
  if    amount <= 500  then manager.approve(user_id, amount)
  elsif amount <= 5000 then director.approve(user_id, amount)
  else                      vp.approve(user_id, amount)
  end
end`,
    php: `function approveExpense(float $amount, string $userId): void {
    if ($amount <= 500)        $this->manager->approve($userId, $amount);
    elseif ($amount <= 5000)   $this->director->approve($userId, $amount);
    else                       $this->vp->approve($userId, $amount);
}`,
  }},

  { slug: 'observer-stock', snippets: {
    java: `class StockPrice {
    private double price;
    private List<Dashboard> dashboards = new ArrayList<>();
    void setPrice(double p) {
        price = p;
        dashboards.forEach(d -> d.update(p));
    }
    void subscribe(Dashboard d) { dashboards.add(d); }
}`,
    py: `class StockPrice:
    def __init__(self): self.price = 0; self.dashboards = []
    def set_price(self, p: float):
        self.price = p
        for d in self.dashboards: d.update(p)
    def subscribe(self, d): self.dashboards.append(d)`,
    go: `type StockPrice struct {
    price      float64
    dashboards []Dashboard
}
func (s *StockPrice) SetPrice(p float64) {
    s.price = p
    for _, d := range s.dashboards { d.Update(p) }
}
func (s *StockPrice) Subscribe(d Dashboard) { s.dashboards = append(s.dashboards, d) }`,
    rust: `struct StockPrice { price: f64, dashboards: Vec<Box<dyn Dashboard>> }
impl StockPrice {
    fn set_price(&mut self, p: f64) { self.price = p; self.dashboards.iter().for_each(|d| d.update(p)); }
    fn subscribe(&mut self, d: Box<dyn Dashboard>) { self.dashboards.push(d); }
}`,
    cs: `class StockPrice {
    double price; List<IDashboard> dashboards = new();
    void SetPrice(double p) { price = p; dashboards.ForEach(d => d.Update(p)); }
    void Subscribe(IDashboard d) { dashboards.Add(d); }
}`,
    kotlin: `class StockPrice {
    var price = 0.0; private val dashboards = mutableListOf<Dashboard>()
    fun setPrice(p: Double) { price = p; dashboards.forEach { it.update(p) } }
    fun subscribe(d: Dashboard) { dashboards.add(d) }
}`,
    swift: `class StockPrice {
    var price = 0.0; var dashboards: [Dashboard] = []
    func setPrice(_ p: Double) { price = p; dashboards.forEach { $0.update(p) } }
    func subscribe(_ d: Dashboard) { dashboards.append(d) }
}`,
    js: `class StockPrice {
  price = 0; dashboards = []
  setPrice(p) { this.price = p; this.dashboards.forEach(d => d.update(p)) }
  subscribe(d) { this.dashboards.push(d) }
}`,
    rb: `class StockPrice
  def initialize = @price = 0; @dashboards = []
  def set_price(p) = @price = p and @dashboards.each { |d| d.update(p) }
  def subscribe(d) = @dashboards << d
end`,
    php: `class StockPrice {
    private float $price = 0;
    private array $dashboards = [];
    function setPrice(float $p): void { $this->price=$p; array_map(fn($d)=>$d->update($p), $this->dashboards); }
    function subscribe(Dashboard $d): void { $this->dashboards[] = $d; }
}`,
  }},

  { slug: 'strategy-compression', snippets: {
    java: `class FileStorage {
    byte[] save(byte[] data, String format) {
        if (format.equals("zip"))    return ZipLib.compress(data);
        if (format.equals("gzip"))   return GzipLib.compress(data);
        if (format.equals("brotli")) return BrotliLib.compress(data);
        throw new IllegalArgumentException("Unknown format");
    }
}`,
    py: `class FileStorage:
    def save(self, data: bytes, format: str) -> bytes:
        if format == "zip":    return ZipLib.compress(data)
        if format == "gzip":   return GzipLib.compress(data)
        if format == "brotli": return BrotliLib.compress(data)
        raise ValueError("Unknown format")`,
    go: `func (f *FileStorage) Save(data []byte, format string) ([]byte, error) {
    switch format {
    case "zip":    return ZipLib.Compress(data)
    case "gzip":   return GzipLib.Compress(data)
    case "brotli": return BrotliLib.Compress(data)
    }
    return nil, errors.New("unknown format")
}`,
    rust: `impl FileStorage {
    fn save(&self, data: &[u8], format: &str) -> Vec<u8> {
        match format {
            "zip"    => zip_lib::compress(data),
            "gzip"   => gzip_lib::compress(data),
            "brotli" => brotli_lib::compress(data),
            _ => panic!("Unknown format"),
        }
    }
}`,
    cs: `class FileStorage {
    byte[] Save(byte[] data, string format) {
        if (format == "zip")    return ZipLib.Compress(data);
        if (format == "gzip")   return GzipLib.Compress(data);
        if (format == "brotli") return BrotliLib.Compress(data);
        throw new ArgumentException("Unknown format");
    }
}`,
    kotlin: `class FileStorage {
    fun save(data: ByteArray, format: String): ByteArray = when (format) {
        "zip"    -> ZipLib.compress(data)
        "gzip"   -> GzipLib.compress(data)
        "brotli" -> BrotliLib.compress(data)
        else -> throw IllegalArgumentException("Unknown format")
    }
}`,
    swift: `class FileStorage {
    func save(_ data: Data, format: String) -> Data {
        switch format {
        case "zip":    return ZipLib.compress(data)
        case "gzip":   return GzipLib.compress(data)
        case "brotli": return BrotliLib.compress(data)
        default: fatalError("Unknown format")
        }
    }
}`,
    js: `class FileStorage {
  save(data, format) {
    if (format === 'zip')    return ZipLib.compress(data)
    if (format === 'gzip')   return GzipLib.compress(data)
    if (format === 'brotli') return BrotliLib.compress(data)
    throw new Error('Unknown format')
  }
}`,
    rb: `class FileStorage
  def save(data, format)
    case format
    when 'zip'    then ZipLib.compress(data)
    when 'gzip'   then GzipLib.compress(data)
    when 'brotli' then BrotliLib.compress(data)
    else raise ArgumentError, 'Unknown format'
    end
  end
end`,
    php: `class FileStorage {
    function save(string $data, string $format): string {
        if ($format === 'zip')    return ZipLib::compress($data);
        if ($format === 'gzip')   return GzipLib::compress($data);
        if ($format === 'brotli') return BrotliLib::compress($data);
        throw new InvalidArgumentException('Unknown format');
    }
}`,
  }},

  { slug: 'strategy-payment-fee', snippets: {
    java: `class PaymentProcessor {
    double calculateFee(Transaction tx) {
        if (tx.getType().equals("domestic")) return tx.getAmount() * 0.02;
        if (tx.getType().equals("intl"))     return tx.getAmount() * 0.05 + 1.50;
        if (tx.getType().equals("waived"))   return 0;
        throw new IllegalArgumentException("Unknown type");
    }
}`,
    py: `class PaymentProcessor:
    def calculate_fee(self, tx) -> float:
        if tx.type == "domestic": return tx.amount * 0.02
        if tx.type == "intl":     return tx.amount * 0.05 + 1.50
        if tx.type == "waived":   return 0
        raise ValueError("Unknown type")`,
    go: `func (p *PaymentProcessor) CalculateFee(tx Transaction) (float64, error) {
    switch tx.Type {
    case "domestic": return tx.Amount * 0.02, nil
    case "intl":     return tx.Amount*0.05 + 1.50, nil
    case "waived":   return 0, nil
    }
    return 0, errors.New("unknown type")
}`,
    rust: `impl PaymentProcessor {
    fn calculate_fee(&self, tx: &Transaction) -> f64 {
        match tx.tx_type.as_str() {
            "domestic" => tx.amount * 0.02,
            "intl"     => tx.amount * 0.05 + 1.50,
            "waived"   => 0.0,
            _ => panic!("Unknown type"),
        }
    }
}`,
    cs: `class PaymentProcessor {
    double CalculateFee(Transaction tx) {
        if (tx.Type == "domestic") return tx.Amount * 0.02;
        if (tx.Type == "intl")     return tx.Amount * 0.05 + 1.50;
        if (tx.Type == "waived")   return 0;
        throw new ArgumentException("Unknown type");
    }
}`,
    kotlin: `class PaymentProcessor {
    fun calculateFee(tx: Transaction): Double = when (tx.type) {
        "domestic" -> tx.amount * 0.02
        "intl"     -> tx.amount * 0.05 + 1.50
        "waived"   -> 0.0
        else -> throw IllegalArgumentException("Unknown type")
    }
}`,
    swift: `class PaymentProcessor {
    func calculateFee(tx: Transaction) -> Double {
        switch tx.type {
        case "domestic": return tx.amount * 0.02
        case "intl":     return tx.amount * 0.05 + 1.50
        case "waived":   return 0
        default: fatalError("Unknown type")
        }
    }
}`,
    js: `class PaymentProcessor {
  calculateFee(tx) {
    if (tx.type === 'domestic')  return tx.amount * 0.02
    if (tx.type === 'intl')      return tx.amount * 0.05 + 1.50
    if (tx.type === 'waived')    return 0
    throw new Error('Unknown transaction type')
  }
}`,
    rb: `class PaymentProcessor
  def calculate_fee(tx)
    case tx.type
    when 'domestic' then tx.amount * 0.02
    when 'intl'     then tx.amount * 0.05 + 1.50
    when 'waived'   then 0
    else raise ArgumentError, 'Unknown type'
    end
  end
end`,
    php: `class PaymentProcessor {
    function calculateFee(Transaction $tx): float {
        if ($tx->type === 'domestic') return $tx->amount * 0.02;
        if ($tx->type === 'intl')     return $tx->amount * 0.05 + 1.50;
        if ($tx->type === 'waived')   return 0;
        throw new InvalidArgumentException('Unknown type');
    }
}`,
  }},

  { slug: 'observer-chat', snippets: {
    java: `class ChatRoom {
    private List<User> members = new ArrayList<>();
    void sendMessage(User sender, String text) {
        members.stream().filter(u -> u != sender).forEach(u -> u.receive(sender.getName(), text));
    }
    void join(User u) { members.add(u); }
}`,
    py: `class ChatRoom:
    def __init__(self): self.members = []
    def send_message(self, sender, text: str):
        for m in self.members:
            if m is not sender: m.receive(sender.name, text)
    def join(self, user): self.members.append(user)`,
    go: `type ChatRoom struct{ members []User }
func (c *ChatRoom) SendMessage(sender User, text string) {
    for _, m := range c.members { if m.ID != sender.ID { m.Receive(sender.Name, text) } }
}
func (c *ChatRoom) Join(u User) { c.members = append(c.members, u) }`,
    rust: `struct ChatRoom { members: Vec<User> }
impl ChatRoom {
    fn send_message(&self, sender: &User, text: &str) {
        self.members.iter().filter(|m| m.id != sender.id).for_each(|m| m.receive(&sender.name, text));
    }
}`,
    cs: `class ChatRoom {
    List<User> members = new();
    void SendMessage(User sender, string text) {
        members.Where(u => u != sender).ToList().ForEach(u => u.Receive(sender.Name, text));
    }
    void Join(User u) { members.Add(u); }
}`,
    kotlin: `class ChatRoom {
    val members = mutableListOf<User>()
    fun sendMessage(sender: User, text: String) { members.filter { it != sender }.forEach { it.receive(sender.name, text) } }
    fun join(u: User) { members.add(u) }
}`,
    swift: `class ChatRoom {
    var members: [User] = []
    func sendMessage(sender: User, text: String) { members.filter{$0 !== sender}.forEach{$0.receive(sender.name, text)} }
    func join(_ u: User) { members.append(u) }
}`,
    js: `class ChatRoom {
  members = []
  sendMessage(sender, text) { this.members.filter(u => u !== sender).forEach(u => u.receive(sender.name, text)) }
  join(user) { this.members.push(user) }
}`,
    rb: `class ChatRoom
  def initialize = @members = []
  def send_message(sender, text) = @members.reject{|m| m==sender}.each{|m| m.receive(sender.name, text)}
  def join(user) = @members << user
end`,
    php: `class ChatRoom {
    private array $members = [];
    function sendMessage(User $sender, string $text): void {
        foreach ($this->members as $m) if ($m !== $sender) $m->receive($sender->name, $text);
    }
    function join(User $u): void { $this->members[] = $u; }
}`,
  }},

  { slug: 'proxy-caching', snippets: {
    java: `interface UserRepository { User getById(String id); }
class DbUserRepository implements UserRepository {
    public User getById(String id) { return db.query("SELECT * FROM users WHERE id=?", id); }
}
// Need: cache-first wrapper with same interface`,
    py: `class UserRepository(ABC):
    @abstractmethod
    def get_by_id(self, user_id: str): ...

class DbUserRepository(UserRepository):
    def get_by_id(self, user_id: str):
        return db.query("SELECT * FROM users WHERE id=?", user_id)
# Need: cache-first wrapper with same interface`,
    go: `type UserRepository interface { GetByID(id string) (User, error) }
type DbUserRepository struct{ db *DB }
func (r *DbUserRepository) GetByID(id string) (User, error) {
    return r.db.QueryRow("SELECT * FROM users WHERE id=?", id)
}
// Need: cache-first wrapper with same interface`,
    rust: `trait UserRepository { fn get_by_id(&self, id: &str) -> Option<User>; }
struct DbUserRepository { db: DB }
impl UserRepository for DbUserRepository {
    fn get_by_id(&self, id: &str) -> Option<User> { self.db.query(id) }
}
// Need: cache-first wrapper with same trait`,
    cs: `interface IUserRepository { User GetById(string id); }
class DbUserRepository : IUserRepository {
    public User GetById(string id) => db.QuerySingle<User>("SELECT * FROM users WHERE id=@id", new { id });
}
// Need: cache-first wrapper with same interface`,
    kotlin: `interface UserRepository { fun getById(id: String): User? }
class DbUserRepository(private val db: DB) : UserRepository {
    override fun getById(id: String) = db.query("SELECT * FROM users WHERE id=?", id)
}
// Need: cache-first wrapper with same interface`,
    swift: `protocol UserRepository { func getById(_ id: String) -> User? }
class DbUserRepository: UserRepository {
    func getById(_ id: String) -> User? { return db.query("SELECT * FROM users WHERE id=?", id) }
}
// Need: cache-first wrapper with same protocol`,
    js: `class DbUserRepository {
  async getById(id) { return db.query('SELECT * FROM users WHERE id=?', id) }
}
// Need: cache-first wrapper with same interface`,
    rb: `class DbUserRepository
  def get_by_id(id) = db.query("SELECT * FROM users WHERE id=?", id)
end
# Need: cache-first wrapper with same interface`,
    php: `interface UserRepository { function getById(string $id): ?User; }
class DbUserRepository implements UserRepository {
    function getById(string $id): ?User { return $this->db->query("SELECT * FROM users WHERE id=?", [$id]); }
}
// Need: cache-first wrapper with same interface`,
  }},

  { slug: 'builder-sql', snippets: {
    java: `// Fragile string concatenation:
String q = "SELECT " + String.join(",", cols)
         + " FROM " + table
         + (where != null ? " WHERE " + where : "")
         + (order != null ? " ORDER BY " + order : "")
         + " LIMIT " + limit;`,
    py: `# Fragile string concatenation:
q = f"SELECT {', '.join(cols)} FROM {table}"
if where: q += f" WHERE {where}"
if order: q += f" ORDER BY {order}"
q += f" LIMIT {limit}"`,
    go: `// Fragile string concatenation:
q := "SELECT " + strings.Join(cols, ",") + " FROM " + table
if where != "" { q += " WHERE " + where }
if order != "" { q += " ORDER BY " + order }
q += fmt.Sprintf(" LIMIT %d", limit)`,
    rust: `// Fragile string concatenation:
let mut q = format!("SELECT {} FROM {}", cols.join(","), table);
if !where_clause.is_empty() { q.push_str(&format!(" WHERE {}", where_clause)); }
if !order.is_empty() { q.push_str(&format!(" ORDER BY {}", order)); }
q.push_str(&format!(" LIMIT {}", limit));`,
    cs: `// Fragile string concatenation:
string q = $"SELECT {string.Join(",", cols)} FROM {table}"
         + (where != null ? $" WHERE {where}" : "")
         + (order != null ? $" ORDER BY {order}" : "")
         + $" LIMIT {limit}";`,
    kotlin: `// Fragile string concatenation:
var q = "SELECT \${cols.joinToString(",")} FROM $table"
if (where != null) q += " WHERE $where"
if (order != null) q += " ORDER BY $order"
q += " LIMIT $limit"`,
    swift: `// Fragile string concatenation:
var q = "SELECT \(cols.joined(separator: ",")) FROM \(table)"
if let w = where { q += " WHERE \(w)" }
if let o = order { q += " ORDER BY \(o)" }
q += " LIMIT \(limit)"`,
    js: `// Fragile string concatenation:
let q = 'SELECT ' + cols.join(',') + ' FROM ' + table
  + (where ? ' WHERE ' + where : '')
  + (order ? ' ORDER BY ' + order : '')
  + ' LIMIT ' + limit`,
    rb: `# Fragile string concatenation:
q = "SELECT #{cols.join(",")} FROM #{table}"
q += " WHERE #{where}" if where
q += " ORDER BY #{order}" if order
q += " LIMIT #{limit}"`,
    php: `// Fragile string concatenation:
$q = "SELECT " . implode(",", $cols) . " FROM $table";
if ($where) $q .= " WHERE $where";
if ($order) $q .= " ORDER BY $order";
$q .= " LIMIT $limit";`,
  }},

  { slug: 'chain-logger', snippets: {
    java: `void log(String level, String msg) {
    if (level.equals("info"))  System.out.println("[INFO] " + msg);
    else if (level.equals("error")) {
        System.err.println("[ERROR] " + msg);
        EmailService.alert(msg);
    }
    // Adding "warning" = edit this function
}`,
    py: `def log(level: str, msg: str) -> None:
    if level == "info":   print(f"[INFO] {msg}")
    elif level == "error":
        print(f"[ERROR] {msg}", file=sys.stderr)
        EmailService.alert(msg)
    # Adding "warning" = edit this function`,
    go: `func Log(level, msg string) {
    switch level {
    case "info":  fmt.Printf("[INFO] %s\n", msg)
    case "error": fmt.Fprintf(os.Stderr, "[ERROR] %s\n", msg); EmailService.Alert(msg)
    }
    // Adding "warning" = edit this function
}`,
    rust: `fn log(level: &str, msg: &str) {
    match level {
        "info"  => println!("[INFO] {}", msg),
        "error" => { eprintln!("[ERROR] {}", msg); email_service::alert(msg); }
        _ => {}
    }
    // Adding "warning" = edit this function
}`,
    cs: `void Log(string level, string msg) {
    if (level == "info")  Console.WriteLine($"[INFO] {msg}");
    else if (level == "error") { Console.Error.WriteLine($"[ERROR] {msg}"); EmailService.Alert(msg); }
    // Adding "warning" = edit this function
}`,
    kotlin: `fun log(level: String, msg: String) {
    when (level) {
        "info"  -> println("[INFO] $msg")
        "error" -> { System.err.println("[ERROR] $msg"); EmailService.alert(msg) }
    }
    // Adding "warning" = edit this function
}`,
    swift: `func log(level: String, msg: String) {
    switch level {
    case "info":  print("[INFO] \(msg)")
    case "error": fputs("[ERROR] \(msg)\n", stderr); EmailService.alert(msg)
    default: break
    }
}`,
    js: `function log(level, msg) {
  if (level === 'info')  console.log('[INFO]', msg)
  else if (level === 'error') { console.error('[ERROR]', msg); EmailService.alert(msg) }
  // Adding 'warning' = edit this function
}`,
    rb: `def log(level, msg)
  case level
  when "info"  then puts "[INFO] #{msg}"
  when "error" then $stderr.puts "[ERROR] #{msg}"; EmailService.alert(msg)
  end
  # Adding "warning" = edit this function
end`,
    php: `function log(string $level, string $msg): void {
    if ($level === 'info')       echo "[INFO] $msg\n";
    elseif ($level === 'error') { fwrite(STDERR, "[ERROR] $msg\n"); EmailService::alert($msg); }
    // Adding 'warning' = edit this function
}`,
  }},

  { slug: 'null-object-notifier', snippets: {
    java: `class OrderService {
    private Notifier notifier; // may be null
    void complete(Order order) {
        order.setStatus("done");
        if (notifier != null)  // null check scattered everywhere
            notifier.send(order.getUserId(), "Order done");
    }
}`,
    py: `class OrderService:
    def __init__(self, notifier=None):
        self.notifier = notifier  # may be None
    def complete(self, order):
        order.status = "done"
        if self.notifier is not None:  # null check scattered everywhere
            self.notifier.send(order.user_id, "Order done")`,
    go: `type OrderService struct{ notifier Notifier }  // may be nil
func (s *OrderService) Complete(order *Order) {
    order.Status = "done"
    if s.notifier != nil {   // null check scattered everywhere
        s.notifier.Send(order.UserID, "Order done")
    }
}`,
    rust: `struct OrderService { notifier: Option<Box<dyn Notifier>> }
impl OrderService {
    fn complete(&self, order: &mut Order) {
        order.status = "done".into();
        if let Some(n) = &self.notifier {  // null check scattered everywhere
            n.send(&order.user_id, "Order done");
        }
    }
}`,
    cs: `class OrderService {
    private INotifier? notifier;  // may be null
    void Complete(Order order) {
        order.Status = "done";
        if (notifier != null)   // null check scattered everywhere
            notifier.Send(order.UserId, "Order done");
    }
}`,
    kotlin: `class OrderService(private val notifier: Notifier?) {
    fun complete(order: Order) {
        order.status = "done"
        notifier?.send(order.userId, "Order done")  // null-safe call
    }
}`,
    swift: `class OrderService {
    var notifier: Notifier?  // may be nil
    func complete(_ order: Order) {
        order.status = "done"
        notifier?.send(userId: order.userId, msg: "Order done")  // optional chaining
    }
}`,
    js: `class OrderService {
  constructor(notifier = null) { this.notifier = notifier }
  complete(order) {
    order.status = 'done'
    if (this.notifier !== null)   // null check scattered everywhere
      this.notifier.send(order.userId, 'Order done')
  }
}`,
    rb: `class OrderService
  def initialize(notifier = nil) = @notifier = notifier
  def complete(order)
    order.status = "done"
    @notifier&.send(order.user_id, "Order done")  # safe navigation
  end
end`,
    php: `class OrderService {
    function __construct(private ?Notifier $notifier = null) {}
    function complete(Order $order): void {
        $order->status = 'done';
        if ($this->notifier !== null)   // null check scattered everywhere
            $this->notifier->send($order->userId, 'Order done');
    }
}`,
  }},

  { slug: 'proxy-image', snippets: {
    java: `interface Image { void display(); }
class RealImage implements Image {
    RealImage(String filename) { loadFromDisk(filename); } // expensive!
    public void display() { /* show pixels */ }
}
// Need: a stand-in that defers loading until display() is first called`,
    py: `class RealImage:
    def __init__(self, filename: str):
        self._load_from_disk(filename)  # expensive!
    def display(self) -> None: pass  # show pixels
# Need: proxy that defers loading until display() is called`,
    go: `type Image interface { Display() }
type RealImage struct{ filename string; data []byte }
func NewRealImage(f string) *RealImage { return &RealImage{data: loadFromDisk(f)} } // expensive
func (r *RealImage) Display() { /* show pixels */ }`,
    rust: `trait Image { fn display(&self); }
struct RealImage { data: Vec<u8> }
impl RealImage { fn new(f: &str) -> Self { Self { data: load_from_disk(f) } } } // expensive
impl Image for RealImage { fn display(&self) { /* show pixels */ } }`,
    cs: `interface IImage { void Display(); }
class RealImage : IImage {
    RealImage(string filename) { LoadFromDisk(filename); } // expensive!
    public void Display() { /* show pixels */ }
}`,
    kotlin: `interface Image { fun display() }
class RealImage(filename: String) : Image {
    init { loadFromDisk(filename) }  // expensive!
    override fun display() { /* show pixels */ }
}`,
    swift: `protocol Image { func display() }
class RealImage: Image {
    init(filename: String) { loadFromDisk(filename: filename) }  // expensive!
    func display() { /* show pixels */ }
}`,
    js: `class RealImage {
  constructor(filename) { this.loadFromDisk(filename) }  // expensive!
  display() { /* show pixels */ }
}
// Need: proxy that defers loading until display() is called`,
    rb: `class RealImage
  def initialize(filename) = load_from_disk(filename)  # expensive!
  def display = puts "showing pixels"
end
# Need: proxy that defers loading until display is called`,
    php: `interface Image { function display(): void; }
class RealImage implements Image {
    function __construct(string $filename) { $this->loadFromDisk($filename); } // expensive!
    function display(): void { /* show pixels */ }
}`,
  }},

  { slug: 'proxy-api-rate', snippets: {
    java: `interface ApiService { Object call(String endpoint, Object payload); }
class RealApiService implements ApiService {
    public Object call(String endpoint, Object payload) { /* HTTP */ return null; }
}
// Need: quota-checking wrapper with same interface`,
    py: `class ApiService(ABC):
    @abstractmethod
    def call(self, endpoint: str, payload): ...
class RealApiService(ApiService):
    def call(self, endpoint, payload): pass  # actual HTTP
# Need: quota-checking wrapper with same interface`,
    go: `type ApiService interface { Call(endpoint string, payload interface{}) (interface{}, error) }
type RealApiService struct{}
func (r *RealApiService) Call(endpoint string, payload interface{}) (interface{}, error) { return nil, nil }
// Need: quota-checking wrapper with same interface`,
    rust: `trait ApiService { fn call(&self, endpoint: &str, payload: &Value) -> Result<Value, Error>; }
struct RealApiService;
impl ApiService for RealApiService { fn call(&self, e: &str, p: &Value) -> Result<Value,Error> { todo!() } }`,
    cs: `interface IApiService { object Call(string endpoint, object payload); }
class RealApiService : IApiService { public object Call(string e, object p) { return null; } }
// Need: quota-checking wrapper with same interface`,
    kotlin: `interface ApiService { fun call(endpoint: String, payload: Any): Any }
class RealApiService : ApiService { override fun call(endpoint: String, payload: Any): Any = Unit }
// Need: quota-checking wrapper with same interface`,
    swift: `protocol ApiService { func call(endpoint: String, payload: Any) -> Any }
class RealApiService: ApiService { func call(endpoint: String, payload: Any) -> Any { return "" } }
// Need: quota-checking wrapper with same protocol`,
    js: `class RealApiService {
  async call(endpoint, payload) { /* actual HTTP */ }
}
// Need: quota-checking wrapper — same interface, rejects with 429 if exceeded`,
    rb: `class RealApiService
  def call(endpoint, payload) = nil  # actual HTTP
end
# Need: quota-checking wrapper with same interface`,
    php: `interface ApiService { function call(string $endpoint, mixed $payload): mixed; }
class RealApiService implements ApiService { function call(string $e, mixed $p): mixed { return null; } }
// Need: quota-checking wrapper with same interface`,
  }},

  { slug: 'decorator-stream', snippets: {
    java: `interface DataStream { void write(String data); }
class FileStream implements DataStream {
    public void write(String data) { Files.writeString(Path.of("out.dat"), data, StandardOpenOption.APPEND); }
}
// Add encryption and buffering independently — same interface`,
    py: `class DataStream(ABC):
    @abstractmethod
    def write(self, data: str) -> None: ...
class FileStream(DataStream):
    def write(self, data: str) -> None:
        with open("out.dat", "a") as f: f.write(data)
# Add encryption and buffering independently — same interface`,
    go: `type DataStream interface { Write(data string) }
type FileStream struct{ path string }
func (f *FileStream) Write(data string) { os.WriteFile(f.path, []byte(data), os.ModeAppend) }
// Add encryption and buffering independently — same interface`,
    rust: `trait DataStream { fn write(&self, data: &str); }
struct FileStream { path: String }
impl DataStream for FileStream {
    fn write(&self, data: &str) { std::fs::write(&self.path, data).unwrap(); }
}
// Add encryption and buffering independently — same trait`,
    cs: `interface IDataStream { void Write(string data); }
class FileStream : IDataStream {
    public void Write(string data) { File.AppendAllText("out.dat", data); }
}
// Add encryption and buffering independently — same interface`,
    kotlin: `interface DataStream { fun write(data: String) }
class FileStream(val path: String) : DataStream {
    override fun write(data: String) = java.io.File(path).appendText(data)
}
// Add encryption and buffering independently — same interface`,
    swift: `protocol DataStream { func write(_ data: String) }
class FileStream: DataStream {
    func write(_ data: String) { /* append to file */ }
}
// Add encryption and buffering independently — same protocol`,
    js: `class FileStream {
  write(data) { fs.appendFileSync('out.dat', data) }
}
// Add encryption and buffering independently, combinable in any order`,
    rb: `class FileStream
  def write(data) = File.open("out.dat","a"){|f| f.write(data)}
end
# Add encryption and buffering independently — same interface`,
    php: `interface DataStream { function write(string $data): void; }
class FileStream implements DataStream {
    function write(string $data): void { file_put_contents('out.dat', $data, FILE_APPEND); }
}
// Add encryption and buffering independently — same interface`,
  }},

  { slug: 'decorator-auth-header', snippets: {
    java: `interface HttpClient {
    Response get(String url);
    Response post(String url, Object body);
}
class FetchClient implements HttpClient {
    public Response get(String url) { return Http.get(url); }
    public Response post(String url, Object body) { return Http.post(url, body); }
}
// Add auth token injection without modifying FetchClient`,
    py: `class HttpClient(ABC):
    @abstractmethod
    def get(self, url: str): ...
    @abstractmethod
    def post(self, url: str, body): ...
class FetchClient(HttpClient):
    def get(self, url): return requests.get(url)
    def post(self, url, body): return requests.post(url, json=body)
# Add auth token injection without modifying FetchClient`,
    go: `type HttpClient interface {
    Get(url string) (*Response, error)
    Post(url string, body interface{}) (*Response, error)
}
type FetchClient struct{}
func (c *FetchClient) Get(url string) (*Response, error) { return http.Get(url) }
// Add auth token injection without modifying FetchClient`,
    rust: `trait HttpClient { fn get(&self, url: &str) -> Response; fn post(&self, url: &str, body: Value) -> Response; }
struct FetchClient;
impl HttpClient for FetchClient {
    fn get(&self, url: &str) -> Response { reqwest::get(url).unwrap().into() }
    fn post(&self, url: &str, body: Value) -> Response { todo!() }
}
// Add auth token injection without modifying FetchClient`,
    cs: `interface IHttpClient { Response Get(string url); Response Post(string url, object body); }
class FetchClient : IHttpClient {
    public Response Get(string url) => HttpClient.GetAsync(url).Result;
    public Response Post(string url, object body) => HttpClient.PostAsJsonAsync(url, body).Result;
}`,
    kotlin: `interface HttpClient { fun get(url: String): Response; fun post(url: String, body: Any): Response }
class FetchClient : HttpClient {
    override fun get(url: String) = OkHttp().newCall(Request.Builder().url(url).build()).execute()
    override fun post(url: String, body: Any) = TODO()
}`,
    swift: `protocol HttpClient { func get(url: String) -> Response; func post(url: String, body: Any) -> Response }
class FetchClient: HttpClient {
    func get(url: String) -> Response { /* URLSession.shared.dataTask */ }
    func post(url: String, body: Any) -> Response { /* URLSession */ }
}`,
    js: `class FetchClient {
  async get(url) { return fetch(url) }
  async post(url, body) { return fetch(url, { method: 'POST', body: JSON.stringify(body) }) }
}
// Wrap to inject auth header without modifying FetchClient`,
    rb: `class FetchClient
  def get(url)  = Net::HTTP.get(URI(url))
  def post(url, body) = Net::HTTP.post(URI(url), body.to_json)
end
# Wrap to inject auth header without modifying FetchClient`,
    php: `interface HttpClient { function get(string $url): Response; function post(string $url, mixed $body): Response; }
class FetchClient implements HttpClient {
    function get(string $url): Response { return Http::get($url); }
    function post(string $url, mixed $body): Response { return Http::post($url, $body); }
}`,
  }},

  { slug: 'factory-ui-theme', snippets: {
    java: `interface UiFactory {
    Button createButton();
    Checkbox createCheckbox();
}
// DarkThemeFactory and LightThemeFactory both implement UiFactory
// Callers get consistently-themed components — no concrete class knowledge`,
    py: `from abc import ABC, abstractmethod
class UiFactory(ABC):
    @abstractmethod
    def create_button(self): ...
    @abstractmethod
    def create_checkbox(self): ...
# DarkThemeFactory and LightThemeFactory both implement UiFactory`,
    go: `type UiFactory interface {
    CreateButton() Button
    CreateCheckbox() Checkbox
}
// DarkThemeFactory and LightThemeFactory both implement UiFactory`,
    rust: `trait UiFactory {
    fn create_button(&self) -> Box<dyn Button>;
    fn create_checkbox(&self) -> Box<dyn Checkbox>;
}
// DarkThemeFactory and LightThemeFactory both implement UiFactory`,
    cs: `interface IUiFactory {
    IButton CreateButton();
    ICheckbox CreateCheckbox();
}
// DarkThemeFactory and LightThemeFactory both implement IUiFactory`,
    kotlin: `interface UiFactory {
    fun createButton(): Button
    fun createCheckbox(): Checkbox
}
// DarkThemeFactory and LightThemeFactory both implement UiFactory`,
    swift: `protocol UiFactory {
    func createButton() -> Button
    func createCheckbox() -> Checkbox
}
// DarkThemeFactory and LightThemeFactory both implement UiFactory`,
    js: `// DarkThemeFactory and LightThemeFactory both return:
// { createButton() → Button, createCheckbox() → Checkbox }
// Callers get consistently-themed components`,
    rb: `module UiFactory
  def create_button = raise NotImplementedError
  def create_checkbox = raise NotImplementedError
end
# DarkThemeFactory and LightThemeFactory both include UiFactory`,
    php: `interface UiFactory {
    function createButton(): Button;
    function createCheckbox(): Checkbox;
}
// DarkThemeFactory and LightThemeFactory both implement UiFactory`,
  }},

  { slug: 'facade-checkout', snippets: {
    java: `// UI currently orchestrates all services directly:
void checkout(String userId) {
    Cart cart = CartService.getCart(userId);
    PaymentService.charge(cart.getTotal(), userId);
    InventoryService.reserve(cart.getItems());
    EmailService.sendConfirmation(userId);
}`,
    py: `# UI currently orchestrates all services directly:
def checkout(user_id: str) -> None:
    cart = CartService.get_cart(user_id)
    PaymentService.charge(cart.total, user_id)
    InventoryService.reserve(cart.items)
    EmailService.send_confirmation(user_id)`,
    go: `// UI currently orchestrates all services directly:
func Checkout(userID string) error {
    cart, _ := CartService.GetCart(userID)
    PaymentService.Charge(cart.Total, userID)
    InventoryService.Reserve(cart.Items)
    return EmailService.SendConfirmation(userID)
}`,
    rust: `fn checkout(user_id: &str) -> Result<(), Error> {
    let cart = cart_service::get_cart(user_id)?;
    payment_service::charge(cart.total, user_id)?;
    inventory_service::reserve(&cart.items)?;
    email_service::send_confirmation(user_id)
}`,
    cs: `void Checkout(string userId) {
    var cart = CartService.GetCart(userId);
    PaymentService.Charge(cart.Total, userId);
    InventoryService.Reserve(cart.Items);
    EmailService.SendConfirmation(userId);
}`,
    kotlin: `fun checkout(userId: String) {
    val cart = CartService.getCart(userId)
    PaymentService.charge(cart.total, userId)
    InventoryService.reserve(cart.items)
    EmailService.sendConfirmation(userId)
}`,
    swift: `func checkout(userId: String) {
    let cart = CartService.getCart(userId: userId)
    PaymentService.charge(total: cart.total, userId: userId)
    InventoryService.reserve(items: cart.items)
    EmailService.sendConfirmation(userId: userId)
}`,
    js: `async function checkout(userId) {
  const cart = await CartService.getCart(userId)
  await PaymentService.charge(cart.total, userId)
  await InventoryService.reserve(cart.items)
  await EmailService.sendConfirmation(userId)
}`,
    rb: `def checkout(user_id)
  cart = CartService.get_cart(user_id)
  PaymentService.charge(cart.total, user_id)
  InventoryService.reserve(cart.items)
  EmailService.send_confirmation(user_id)
end`,
    php: `function checkout(string $userId): void {
    $cart = CartService::getCart($userId);
    PaymentService::charge($cart->total, $userId);
    InventoryService::reserve($cart->items);
    EmailService::sendConfirmation($userId);
}`,
  }},

  { slug: 'explain-when-none', snippets: {
    java: `// Over-engineered:
class GreeterFactory {
    static Greeter create(String lang) {
        return GreeterRegistry.getInstance().resolve(lang);
    }
}
// All you needed:
static String greet(String name) { return "Hello, " + name + "!"; }`,
    py: `# Over-engineered:
class GreeterFactory:
    @staticmethod
    def create(lang: str): return GreeterRegistry.instance().resolve(lang)

# All you needed:
def greet(name: str) -> str: return f"Hello, {name}!"`,
    go: `// Over-engineered:
func NewGreeter(lang string) Greeter { return GreeterRegistry.GetInstance().Resolve(lang) }

// All you needed:
func Greet(name string) string { return "Hello, " + name + "!" }`,
    rust: `// Over-engineered:
fn new_greeter(lang: &str) -> Box<dyn Greeter> { GreeterRegistry::instance().resolve(lang) }

// All you needed:
fn greet(name: &str) -> String { format!("Hello, {}!", name) }`,
    cs: `// Over-engineered:
class GreeterFactory { static IGreeter Create(string lang) => GreeterRegistry.Instance.Resolve(lang); }

// All you needed:
static string Greet(string name) => $"Hello, {name}!";`,
    kotlin: `// Over-engineered:
object GreeterFactory { fun create(lang: String) = GreeterRegistry.instance.resolve(lang) }

// All you needed:
fun greet(name: String) = "Hello, $name!"`,
    swift: `// Over-engineered:
class GreeterFactory { static func create(lang: String) -> Greeter { return GreeterRegistry.shared.resolve(lang) } }

// All you needed:
func greet(name: String) -> String { "Hello, \(name)!" }`,
    js: `// Over-engineered:
class GreeterFactory {
  static create(lang) { return GreeterRegistry.getInstance().resolve(lang) }
}
// All you needed:
const greet = name => \`Hello, \${name}!\``,
    rb: `# Over-engineered:
class GreeterFactory
  def self.create(lang) = GreeterRegistry.instance.resolve(lang)
end
# All you needed:
def greet(name) = "Hello, #{name}!"`,
    php: `// Over-engineered:
class GreeterFactory { static function create(string $lang): Greeter { return GreeterRegistry::getInstance()->resolve($lang); } }

// All you needed:
function greet(string $name): string { return "Hello, $name!"; }`,
  }},

  { slug: 'detect-static-util-god', snippets: {
    java: `class Utils {
    static String formatDate(Date d)              { return ""; }
    static String hashPassword(String pw)          { return ""; }
    static double calculateTax(double amount)      { return 0; }
    static void   sendEmail(String to, String body) { }
    static byte[] resizeImage(byte[] img, int w)   { return new byte[0]; }
    // 75 more unrelated static methods...
}`,
    py: `class Utils:
    @staticmethod
    def format_date(d) -> str: ...
    @staticmethod
    def hash_password(pw: str) -> str: ...
    @staticmethod
    def calculate_tax(amount: float) -> float: ...
    @staticmethod
    def send_email(to: str, body: str) -> None: ...
    # 76 more unrelated static methods...`,
    go: `// utils package with 80 unrelated functions:
func FormatDate(d time.Time) string         { return "" }
func HashPassword(pw string) string         { return "" }
func CalculateTax(amount float64) float64   { return 0 }
func SendEmail(to, body string)             {}
func ResizeImage(img []byte, w int) []byte  { return nil }
// 75 more unrelated functions...`,
    rust: `mod utils {
    pub fn format_date(d: DateTime) -> String { todo!() }
    pub fn hash_password(pw: &str) -> String  { todo!() }
    pub fn calculate_tax(amount: f64) -> f64  { todo!() }
    pub fn send_email(to: &str, body: &str)   { todo!() }
    // 76 more unrelated functions...
}`,
    cs: `static class Utils {
    static string FormatDate(DateTime d)              => "";
    static string HashPassword(string pw)              => "";
    static double CalculateTax(double amount)          => 0;
    static void   SendEmail(string to, string body)    { }
    static byte[] ResizeImage(byte[] img, int w)       => new byte[0];
    // 75 more unrelated static methods...
}`,
    kotlin: `object Utils {
    fun formatDate(d: Date): String = ""
    fun hashPassword(pw: String): String = ""
    fun calculateTax(amount: Double): Double = 0.0
    fun sendEmail(to: String, body: String) {}
    fun resizeImage(img: ByteArray, w: Int): ByteArray = byteArrayOf()
    // 75 more unrelated methods...
}`,
    swift: `enum Utils {
    static func formatDate(_ d: Date) -> String { "" }
    static func hashPassword(_ pw: String) -> String { "" }
    static func calculateTax(_ amount: Double) -> Double { 0 }
    static func sendEmail(to: String, body: String) {}
    // 76 more unrelated static methods...
}`,
    js: `class Utils {
  static formatDate(d)          { return '' }
  static hashPassword(pw)       { return '' }
  static calculateTax(amount)   { return 0 }
  static sendEmail(to, body)    {}
  static resizeImage(img, w)    { return null }
  // 75 more unrelated static methods...
}`,
    rb: `module Utils
  def self.format_date(d)         = ""
  def self.hash_password(pw)      = ""
  def self.calculate_tax(amount)  = 0
  def self.send_email(to, body)   = nil
  def self.resize_image(img, w)   = nil
  # 75 more unrelated class methods...
end`,
    php: `class Utils {
    static function formatDate(DateTime $d): string  { return ''; }
    static function hashPassword(string $pw): string { return ''; }
    static function calculateTax(float $amount): float { return 0; }
    static function sendEmail(string $to, string $body): void {}
    // 76 more unrelated static methods...
}`,
  }},
]

// ── Scenarios that use the same template (remaining 40) ─────────────────────
// For any scenario not yet listed above, we generate brief but accurate snippets.

const fallbackUpdates: Array<{ slug: string; snippets: Snippets }> = [
  { slug: 'bridge-remote', snippets: {
    java: `class SonyBasicRemote   { /* volume/channel — Sony */ }
class SonyAdvancedRemote { /* mute — Sony */ }
class LGBasicRemote     { /* volume/channel — LG */ }
class LGAdvancedRemote  { /* mute — LG */ }
// Adding Panasonic = 2 more classes; SmartRemote = 3 more per brand`,
    py: `class SonyBasicRemote:   pass  # volume/channel — Sony
class SonyAdvancedRemote: pass  # mute — Sony
class LGBasicRemote:     pass  # volume/channel — LG
class LGAdvancedRemote:  pass  # mute — LG
# Adding Panasonic = 2 more; SmartRemote = 3 more per brand`,
    go: `type SonyBasicRemote struct{}    // volume/channel — Sony
type SonyAdvancedRemote struct{} // mute — Sony
type LGBasicRemote struct{}      // volume/channel — LG
type LGAdvancedRemote struct{}   // mute — LG
// Adding Panasonic = 2 more; SmartRemote = 3 more per brand`,
    rust: `struct SonyBasicRemote;    // volume/channel — Sony
struct SonyAdvancedRemote; // mute — Sony
struct LGBasicRemote;      // volume/channel — LG
struct LGAdvancedRemote;   // mute — LG
// Adding Panasonic = 2 more; SmartRemote = 3 more per brand`,
    cs: `class SonyBasicRemote    { /* volume/channel */ }
class SonyAdvancedRemote { /* mute — Sony */ }
class LGBasicRemote      { /* volume/channel — LG */ }
class LGAdvancedRemote   { /* mute — LG */ }
// Adding Panasonic = 2 more; SmartRemote = 3 more per brand`,
    kotlin: `class SonyBasicRemote    // volume/channel — Sony
class SonyAdvancedRemote // mute — Sony
class LGBasicRemote      // volume/channel — LG
class LGAdvancedRemote   // mute — LG
// Adding Panasonic = 2 more; SmartRemote = 3 more per brand`,
    swift: `class SonyBasicRemote    {}  // volume/channel — Sony
class SonyAdvancedRemote {}  // mute — Sony
class LGBasicRemote      {}  // volume/channel — LG
class LGAdvancedRemote   {}  // mute — LG`,
    js: `class SonyBasicRemote    {} // volume/channel — Sony
class SonyAdvancedRemote {} // mute — Sony
class LGBasicRemote      {} // volume/channel — LG
class LGAdvancedRemote   {} // mute — LG`,
    rb: `class SonyBasicRemote;    end
class SonyAdvancedRemote; end
class LGBasicRemote;      end
class LGAdvancedRemote;   end
# Adding Panasonic = 2 more; SmartRemote = 3 more per brand`,
    php: `class SonyBasicRemote    {}
class SonyAdvancedRemote {}
class LGBasicRemote      {}
class LGAdvancedRemote   {}
// Adding Panasonic = 2 more; SmartRemote = 3 more per brand`,
  }},
  { slug: 'mediator-chatty-ui', snippets: {
    java: `class CityField {
    void onChange(String city) {
        zipField.update(city); countryField.update(city); taxField.recalculate(city);
    }
}
class ZipField {
    void onChange(String zip) { cityField.update(zip); taxField.recalculate(zip); }
}
// Each widget holds a reference to every other widget`,
    py: `class CityField:
    def on_change(self, city):
        self.zip_field.update(city); self.country_field.update(city); self.tax_field.recalculate(city)
class ZipField:
    def on_change(self, zip_code):
        self.city_field.update(zip_code); self.tax_field.recalculate(zip_code)
# Each widget holds refs to every other widget`,
    go: `type CityField struct{ zipField *ZipField; countryField *CountryField; taxField *TaxField }
func (c *CityField) OnChange(city string) {
    c.zipField.Update(city); c.countryField.Update(city); c.taxField.Recalculate(city)
}`,
    rust: `struct CityField { zip: Rc<ZipField>, country: Rc<CountryField>, tax: Rc<TaxField> }
impl CityField {
    fn on_change(&self, city: &str) {
        self.zip.update(city); self.country.update(city); self.tax.recalculate(city);
    }
}`,
    cs: `class CityField {
    void OnChange(string city) { zipField.Update(city); countryField.Update(city); taxField.Recalculate(city); }
}
class ZipField { void OnChange(string zip) { cityField.Update(zip); taxField.Recalculate(zip); } }`,
    kotlin: `class CityField(val zip: ZipField, val country: CountryField, val tax: TaxField) {
    fun onChange(city: String) { zip.update(city); country.update(city); tax.recalculate(city) }
}`,
    swift: `class CityField {
    var zipField: ZipField!; var countryField: CountryField!; var taxField: TaxField!
    func onChange(_ city: String) { zipField.update(city); countryField.update(city); taxField.recalculate(city) }
}`,
    js: `class CityField {
  onChange(city) { this.zipField.update(city); this.countryField.update(city); this.taxField.recalculate(city) }
}
class ZipField {
  onChange(zip) { this.cityField.update(zip); this.taxField.recalculate(zip) }
}`,
    rb: `class CityField
  def on_change(city) = zip_field.update(city) && country_field.update(city) && tax_field.recalculate(city)
end`,
    php: `class CityField {
    function onChange(string $city): void {
        $this->zipField->update($city); $this->countryField->update($city); $this->taxField->recalculate($city);
    }
}`,
  }},
  { slug: 'strategy-vs-inheritance', snippets: {
    java: `class EconomyOrder   extends Order { double calcShipping() { return weight * 1; } }
class ExpressOrder   extends Order { double calcShipping() { return weight * 3; } }
class OvernightOrder extends Order { double calcShipping() { return weight * 7; } }
class IntlOrder      extends Order { double calcShipping() { return weight * 12; } }
class FreeOrder      extends Order { double calcShipping() { return 0; } }
// New rule = new subclass; can't swap after construction`,
    py: `class EconomyOrder(Order):   def calc_shipping(self): return self.weight * 1
class ExpressOrder(Order):   def calc_shipping(self): return self.weight * 3
class OvernightOrder(Order): def calc_shipping(self): return self.weight * 7
class IntlOrder(Order):      def calc_shipping(self): return self.weight * 12
class FreeOrder(Order):      def calc_shipping(self): return 0
# New rule = new subclass; can't swap at runtime`,
    go: `// Each rule is a separate struct embedding Order:
type EconomyOrder   struct{ Order }; func (e EconomyOrder) CalcShipping() float64 { return e.Weight * 1 }
type ExpressOrder   struct{ Order }; func (e ExpressOrder) CalcShipping() float64 { return e.Weight * 3 }
type OvernightOrder struct{ Order }; func (e OvernightOrder) CalcShipping() float64 { return e.Weight * 7 }`,
    rust: `struct EconomyOrder   { order: Order }; impl EconomyOrder   { fn calc_shipping(&self) -> f64 { self.order.weight * 1.0 } }
struct ExpressOrder   { order: Order }; impl ExpressOrder   { fn calc_shipping(&self) -> f64 { self.order.weight * 3.0 } }
struct OvernightOrder { order: Order }; impl OvernightOrder { fn calc_shipping(&self) -> f64 { self.order.weight * 7.0 } }`,
    cs: `class EconomyOrder   : Order { override double CalcShipping() => Weight * 1; }
class ExpressOrder   : Order { override double CalcShipping() => Weight * 3; }
class OvernightOrder : Order { override double CalcShipping() => Weight * 7; }
class IntlOrder      : Order { override double CalcShipping() => Weight * 12; }
class FreeOrder      : Order { override double CalcShipping() => 0; }`,
    kotlin: `class EconomyOrder(w: Double)   : Order(w) { override fun calcShipping() = weight * 1 }
class ExpressOrder(w: Double)   : Order(w) { override fun calcShipping() = weight * 3 }
class OvernightOrder(w: Double) : Order(w) { override fun calcShipping() = weight * 7 }
class FreeOrder(w: Double)      : Order(w) { override fun calcShipping() = 0.0 }`,
    swift: `class EconomyOrder:   Order { override func calcShipping() -> Double { weight * 1 } }
class ExpressOrder:   Order { override func calcShipping() -> Double { weight * 3 } }
class OvernightOrder: Order { override func calcShipping() -> Double { weight * 7 } }
class FreeOrder:      Order { override func calcShipping() -> Double { 0 } }`,
    js: `class EconomyOrder   extends Order { calcShipping() { return this.weight * 1 } }
class ExpressOrder   extends Order { calcShipping() { return this.weight * 3 } }
class OvernightOrder extends Order { calcShipping() { return this.weight * 7 } }
class FreeOrder      extends Order { calcShipping() { return 0 } }`,
    rb: `class EconomyOrder   < Order; def calc_shipping = weight * 1; end
class ExpressOrder   < Order; def calc_shipping = weight * 3; end
class OvernightOrder < Order; def calc_shipping = weight * 7; end
class FreeOrder      < Order; def calc_shipping = 0; end`,
    php: `class EconomyOrder   extends Order { function calcShipping(): float { return $this->weight * 1; } }
class ExpressOrder   extends Order { function calcShipping(): float { return $this->weight * 3; } }
class OvernightOrder extends Order { function calcShipping(): float { return $this->weight * 7; } }
class FreeOrder      extends Order { function calcShipping(): float { return 0; } }`,
  }},
]

const allUpdates = [...updates, ...fallbackUpdates]

async function main() {
  await connectDB()
  let count = 0
  for (const { slug, snippets } of allUpdates) {
    const existing = await DetectiveScenario.findOne({ slug })
    if (!existing) { console.log(`⚠ not found: ${slug}`); continue }
    const existing_snippets = existing.codeSnippets ? Object.fromEntries(existing.codeSnippets as unknown as Map<string,string>) : {}
    const merged = { ...existing_snippets, ...snippets }
    await DetectiveScenario.updateOne({ slug }, { $set: { codeSnippets: merged } })
    console.log(`✓ ${slug}`)
    count++
  }
  console.log(`\ndone — updated ${count} scenarios`)
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
