/**
 * Adds multi-language snippets for the remaining 25 detective scenarios.
 * Run: npx tsx src/scripts/seed-detective-snippets2.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { DetectiveScenario } from '../models/learn/detective-scenario.model'

type Snippets = Record<string, string>
const updates: Array<{ slug: string; snippets: Snippets }> = [

  // ── detect-god-factory ───────────────────────────────────────────────────────
  { slug: 'detect-god-factory', snippets: {
    java: `class PaymentFactory {
    static PaymentGateway create(String type, Order order) {
        PaymentGateway gw = type.equals("stripe")
            ? new StripeGateway() : new RazorpayGateway();
        // Factory doing way too much:
        gw.charge(order.getAmount());
        EmailService.sendReceipt(order.getUserId());
        Analytics.track("payment", order.getId());
        return gw;
    }
}`,
    py: `class PaymentFactory:
    @staticmethod
    def create(type_: str, order):
        gw = StripeGateway() if type_ == "stripe" else RazorpayGateway()
        # Factory doing way too much:
        gw.charge(order.amount)
        EmailService.send_receipt(order.user_id)
        Analytics.track("payment", order.id)
        return gw`,
    go: `func CreatePaymentGateway(gatewayType string, order Order) PaymentGateway {
    var gw PaymentGateway
    if gatewayType == "stripe" { gw = &StripeGateway{} } else { gw = &RazorpayGateway{} }
    // Factory doing way too much:
    gw.Charge(order.Amount)
    EmailService.SendReceipt(order.UserID)
    Analytics.Track("payment", order.ID)
    return gw
}`,
    rust: `fn create_payment_gateway(gateway_type: &str, order: &Order) -> Box<dyn PaymentGateway> {
    let gw: Box<dyn PaymentGateway> = if gateway_type == "stripe" {
        Box::new(StripeGateway::new())
    } else { Box::new(RazorpayGateway::new()) };
    // Factory doing way too much:
    gw.charge(order.amount);
    email_service::send_receipt(&order.user_id);
    analytics::track("payment", &order.id);
    gw
}`,
    cs: `class PaymentFactory {
    static IPaymentGateway Create(string type, Order order) {
        var gw = type == "stripe" ? (IPaymentGateway)new StripeGateway() : new RazorpayGateway();
        // Factory doing way too much:
        gw.Charge(order.Amount);
        EmailService.SendReceipt(order.UserId);
        Analytics.Track("payment", order.Id);
        return gw;
    }
}`,
    kotlin: `object PaymentFactory {
    fun create(type: String, order: Order): PaymentGateway {
        val gw = if (type == "stripe") StripeGateway() else RazorpayGateway()
        // Factory doing way too much:
        gw.charge(order.amount)
        EmailService.sendReceipt(order.userId)
        Analytics.track("payment", order.id)
        return gw
    }
}`,
    swift: `class PaymentFactory {
    static func create(type: String, order: Order) -> PaymentGateway {
        let gw: PaymentGateway = type == "stripe" ? StripeGateway() : RazorpayGateway()
        // Factory doing way too much:
        gw.charge(amount: order.amount)
        EmailService.sendReceipt(userId: order.userId)
        Analytics.track("payment", orderId: order.id)
        return gw
    }
}`,
    js: `class PaymentFactory {
  static create(type, order) {
    const gw = type === 'stripe' ? new StripeGateway() : new RazorpayGateway()
    // Factory doing way too much:
    gw.charge(order.amount)
    EmailService.sendReceipt(order.userId)
    Analytics.track('payment', order.id)
    return gw
  }
}`,
    rb: `class PaymentFactory
  def self.create(type, order)
    gw = type == "stripe" ? StripeGateway.new : RazorpayGateway.new
    # Factory doing way too much:
    gw.charge(order.amount)
    EmailService.send_receipt(order.user_id)
    Analytics.track("payment", order.id)
    gw
  end
end`,
    php: `class PaymentFactory {
    static function create(string $type, Order $order): PaymentGateway {
        $gw = $type === 'stripe' ? new StripeGateway() : new RazorpayGateway();
        // Factory doing way too much:
        $gw->charge($order->amount);
        EmailService::sendReceipt($order->userId);
        Analytics::track('payment', $order->id);
        return $gw;
    }
}`,
  }},

  // ── observer-vs-polling ──────────────────────────────────────────────────────
  { slug: 'observer-vs-polling', snippets: {
    java: `// Current — polling every 200ms (5 req/sec per tab):
ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
scheduler.scheduleAtFixedRate(() -> {
    String status = OrderService.getStatus(orderId);
    dashboard.update(status);
}, 0, 200, TimeUnit.MILLISECONDS);`,
    py: `import time, threading
# Current — polling every 200ms (5 req/sec per tab):
def poll():
    while True:
        status = OrderService.get_status(order_id)
        dashboard.update(status)
        time.sleep(0.2)
threading.Thread(target=poll, daemon=True).start()`,
    go: `// Current — polling every 200ms (5 req/sec per goroutine):
go func() {
    ticker := time.NewTicker(200 * time.Millisecond)
    for range ticker.C {
        status := OrderService.GetStatus(orderID)
        dashboard.Update(status)
    }
}()`,
    rust: `// Current — polling every 200ms:
loop {
    let status = order_service::get_status(&order_id);
    dashboard.update(&status);
    std::thread::sleep(Duration::from_millis(200));
}`,
    cs: `// Current — polling every 200ms:
while (true) {
    var status = OrderService.GetStatus(orderId);
    dashboard.Update(status);
    await Task.Delay(200);
}`,
    kotlin: `// Current — polling every 200ms:
while (true) {
    val status = OrderService.getStatus(orderId)
    dashboard.update(status)
    delay(200)
}`,
    swift: `// Current — polling every 200ms (5 req/sec per view):
Timer.scheduledTimer(withTimeInterval: 0.2, repeats: true) { _ in
    let status = OrderService.getStatus(orderId: orderId)
    dashboard.update(status: status)
}`,
    js: `// Current — polling every 200ms (5 req/sec per tab):
setInterval(async () => {
  const status = await OrderService.getStatus(orderId)
  dashboard.update(status)
}, 200)`,
    rb: `# Current — polling every 200ms:
loop do
  status = OrderService.get_status(order_id)
  dashboard.update(status)
  sleep 0.2
end`,
    php: `// Current — polling every 200ms:
while (true) {
    $status = OrderService::getStatus($orderId);
    $dashboard->update($status);
    usleep(200_000);
}`,
  }},

  // ── adapter-vs-facade ────────────────────────────────────────────────────────
  { slug: 'adapter-vs-facade', snippets: {
    java: `interface SmsPort { void send(String to, String body); }
// Wrapping exactly ONE external class:
class TwilioAdapter implements SmsPort {
    private TwilioClient client;
    public void send(String to, String body) {
        client.messages().create(to, ENV.FROM, body);
    }
}`,
    py: `class SmsPort(ABC):
    @abstractmethod
    def send(self, to: str, body: str) -> None: ...

# Wrapping exactly ONE external class:
class TwilioAdapter(SmsPort):
    def __init__(self, client: TwilioClient): self.client = client
    def send(self, to: str, body: str) -> None:
        self.client.messages.create(to=to, from_=ENV.FROM, body=body)`,
    go: `type SmsPort interface { Send(to, body string) error }
// Wrapping exactly ONE external class:
type TwilioAdapter struct{ client *TwilioClient }
func (a *TwilioAdapter) Send(to, body string) error {
    return a.client.Messages.Create(to, os.Getenv("FROM"), body)
}`,
    rust: `trait SmsPort { fn send(&self, to: &str, body: &str) -> Result<(), Error>; }
// Wrapping exactly ONE external class:
struct TwilioAdapter { client: TwilioClient }
impl SmsPort for TwilioAdapter {
    fn send(&self, to: &str, body: &str) -> Result<(), Error> {
        self.client.messages().create(to, &env::var("FROM")?, body)
    }
}`,
    cs: `interface ISmsPort { void Send(string to, string body); }
// Wrapping exactly ONE external class:
class TwilioAdapter : ISmsPort {
    private TwilioClient client;
    public void Send(string to, string body) => client.Messages.Create(to, Env.From, body);
}`,
    kotlin: `interface SmsPort { fun send(to: String, body: String) }
// Wrapping exactly ONE external class:
class TwilioAdapter(private val client: TwilioClient) : SmsPort {
    override fun send(to: String, body: String) = client.messages.create(to, ENV.FROM, body)
}`,
    swift: `protocol SmsPort { func send(to: String, body: String) }
// Wrapping exactly ONE external class:
class TwilioAdapter: SmsPort {
    let client: TwilioClient
    func send(to: String, body: String) { client.messages.create(to: to, from: ENV.from, body: body) }
}`,
    js: `// Wrapping exactly ONE external class:
class TwilioAdapter {
  constructor(client) { this.client = client }
  send(to, body) { this.client.messages.create({ to, from: process.env.FROM, body }) }
}`,
    rb: `# Wrapping exactly ONE external class:
class TwilioAdapter
  def initialize(client) = @client = client
  def send(to, body) = @client.messages.create(to: to, from: ENV["FROM"], body: body)
end`,
    php: `interface SmsPort { function send(string $to, string $body): void; }
// Wrapping exactly ONE external class:
class TwilioAdapter implements SmsPort {
    function __construct(private TwilioClient $client) {}
    function send(string $to, string $body): void { $this->client->messages->create($to, getenv('FROM'), $body); }
}`,
  }},

  // ── state-vs-strategy ────────────────────────────────────────────────────────
  { slug: 'state-vs-strategy', snippets: {
    java: `class TrafficLight {
    private String color = "red";
    void next() {
        if (color.equals("red"))    color = "green";
        else if (color.equals("green")) color = "yellow";
        else color = "red";
        // Behaviour AND transitions depend on current mode
    }
}`,
    py: `class TrafficLight:
    def __init__(self): self.color = "red"
    def next(self):
        if self.color == "red":    self.color = "green"
        elif self.color == "green": self.color = "yellow"
        else:                       self.color = "red"
        # Behaviour AND transitions depend on current mode`,
    go: `type TrafficLight struct{ Color string }
func (t *TrafficLight) Next() {
    switch t.Color {
    case "red":    t.Color = "green"
    case "green":  t.Color = "yellow"
    default:       t.Color = "red"
    }
    // Behaviour and transition depend on current mode
}`,
    rust: `struct TrafficLight { color: &'static str }
impl TrafficLight {
    fn next(&mut self) {
        self.color = match self.color {
            "red"    => "green",
            "green"  => "yellow",
            _        => "red",
        };
    }
}`,
    cs: `class TrafficLight {
    string Color = "red";
    void Next() {
        Color = Color switch {
            "red"   => "green",
            "green" => "yellow",
            _       => "red",
        };
    }
}`,
    kotlin: `class TrafficLight {
    var color = "red"
    fun next() { color = when (color) { "red" -> "green"; "green" -> "yellow"; else -> "red" } }
}`,
    swift: `class TrafficLight {
    var color = "red"
    func next() {
        switch color {
        case "red":   color = "green"
        case "green": color = "yellow"
        default:      color = "red"
        }
    }
}`,
    js: `class TrafficLight {
  color = 'red'
  next() {
    if (this.color === 'red')    this.color = 'green'
    else if (this.color === 'green') this.color = 'yellow'
    else this.color = 'red'
    // Mode controls transitions
  }
}`,
    rb: `class TrafficLight
  attr_reader :color
  def initialize = @color = "red"
  def next_color
    @color = case @color
    when "red"   then "green"
    when "green" then "yellow"
    else              "red"
    end
  end
end`,
    php: `class TrafficLight {
    private string $color = 'red';
    function next(): void {
        $this->color = match($this->color) {
            'red'   => 'green',
            'green' => 'yellow',
            default => 'red',
        };
    }
}`,
  }},

  // ── decorator-vs-inheritance ─────────────────────────────────────────────────
  { slug: 'decorator-vs-inheritance', snippets: {
    java: `// Inheritance explosion — 2 concerns × 2 channels:
class LoggedEmailNotifier  extends EmailNotifier  { /* add logging */ }
class RetryEmailNotifier   extends EmailNotifier  { /* add retry */ }
class LoggedRetryEmail     extends RetryEmailNotifier { /* both */ }
class LoggedSmsNotifier    extends SmsNotifier    { /* add logging */ }
// Adding push channel = 3 more subclasses`,
    py: `# Inheritance explosion — 2 concerns × 2 channels:
class LoggedEmailNotifier(EmailNotifier):  pass  # add logging
class RetryEmailNotifier(EmailNotifier):   pass  # add retry
class LoggedRetryEmail(RetryEmailNotifier): pass  # both
class LoggedSmsNotifier(SmsNotifier):      pass  # logging on SMS
# Adding push channel = 3 more subclasses`,
    go: `// Go uses embedding — same explosion:
type LoggedEmailNotifier  struct{ EmailNotifier }
type RetryEmailNotifier   struct{ EmailNotifier }
type LoggedRetryEmail     struct{ RetryEmailNotifier }
type LoggedSmsNotifier    struct{ SmsNotifier }
// Adding push channel = 3 more structs`,
    rust: `// Trait inheritance explosion:
struct LoggedEmailNotifier  { inner: EmailNotifier }
struct RetryEmailNotifier   { inner: EmailNotifier }
struct LoggedRetryEmail     { inner: RetryEmailNotifier }
struct LoggedSmsNotifier    { inner: SmsNotifier }
// Adding push channel = 3 more structs`,
    cs: `// Inheritance explosion:
class LoggedEmailNotifier  : EmailNotifier  { /* add logging */ }
class RetryEmailNotifier   : EmailNotifier  { /* add retry */ }
class LoggedRetryEmail     : RetryEmailNotifier { /* both */ }
class LoggedSmsNotifier    : SmsNotifier    { /* add logging */ }
// Adding push = 3 more subclasses`,
    kotlin: `// Inheritance explosion:
class LoggedEmailNotifier  : EmailNotifier()  { /* logging */ }
class RetryEmailNotifier   : EmailNotifier()  { /* retry */ }
class LoggedRetryEmail     : RetryEmailNotifier() { /* both */ }
class LoggedSmsNotifier    : SmsNotifier()    { /* logging */ }
// Adding push channel = 3 more classes`,
    swift: `// Inheritance explosion:
class LoggedEmailNotifier  : EmailNotifier  { /* add logging */ }
class RetryEmailNotifier   : EmailNotifier  { /* add retry */ }
class LoggedRetryEmail     : RetryEmailNotifier { /* both */ }
class LoggedSmsNotifier    : SmsNotifier    { /* add logging */ }`,
    js: `// Inheritance explosion:
class LoggedEmailNotifier  extends EmailNotifier  { /* add logging */ }
class RetryEmailNotifier   extends EmailNotifier  { /* add retry */ }
class LoggedRetryEmail     extends RetryEmailNotifier { /* both */ }
class LoggedSmsNotifier    extends SmsNotifier    { /* add logging */ }
// Adding push channel = 3 more classes`,
    rb: `# Inheritance explosion:
class LoggedEmailNotifier  < EmailNotifier;  end
class RetryEmailNotifier   < EmailNotifier;  end
class LoggedRetryEmail     < RetryEmailNotifier; end
class LoggedSmsNotifier    < SmsNotifier;    end
# Adding push channel = 3 more subclasses`,
    php: `// Inheritance explosion:
class LoggedEmailNotifier  extends EmailNotifier  { /* add logging */ }
class RetryEmailNotifier   extends EmailNotifier  { /* add retry */ }
class LoggedRetryEmail     extends RetryEmailNotifier { /* both */ }
class LoggedSmsNotifier    extends SmsNotifier    { /* add logging */ }`,
  }},

  // ── command-vs-observer ──────────────────────────────────────────────────────
  { slug: 'command-vs-observer', snippets: {
    java: `class CanvasEditor {
    private Deque<Runnable[]> history = new ArrayDeque<>();
    void addNode(Node node) {
        canvas.getNodes().add(node);
        // Need to record redo/undo pair — how?
    }
}`,
    py: `from collections import deque
class CanvasEditor:
    def __init__(self): self.history = deque()
    def add_node(self, node):
        self.canvas.nodes.append(node)
        # Need to record this so it can be undone — how?`,
    go: `type CanvasEditor struct {
    canvas  *Canvas
    history []struct{ redo, undo func() }
}
func (e *CanvasEditor) AddNode(node Node) {
    e.canvas.Nodes = append(e.canvas.Nodes, node)
    // Need to record this for undo — how?
}`,
    rust: `struct CanvasEditor { canvas: Canvas, history: Vec<Box<dyn Undoable>> }
impl CanvasEditor {
    fn add_node(&mut self, node: Node) {
        self.canvas.nodes.push(node.clone());
        // Need to record this so it can be undone — how?
    }
}`,
    cs: `class CanvasEditor {
    Stack<(Action Redo, Action Undo)> history = new();
    void AddNode(Node node) {
        canvas.Nodes.Add(node);
        // Need to record redo/undo pair — how?
    }
}`,
    kotlin: `class CanvasEditor {
    val history = ArrayDeque<Pair<() -> Unit, () -> Unit>>()
    fun addNode(node: Node) {
        canvas.nodes.add(node)
        // Need to record this for undo — how?
    }
}`,
    swift: `class CanvasEditor {
    var history: [(redo: () -> Void, undo: () -> Void)] = []
    func addNode(_ node: Node) {
        canvas.nodes.append(node)
        // Need to record this for undo — how?
    }
}`,
    js: `class CanvasEditor {
  history = []
  addNode(node) {
    this.canvas.nodes.push(node)
    // Need to record this so it can be undone — how?
  }
}`,
    rb: `class CanvasEditor
  def initialize = @history = []
  def add_node(node)
    canvas.nodes << node
    # Need to record this so it can be undone — how?
  end
end`,
    php: `class CanvasEditor {
    private array $history = [];
    function addNode(Node $node): void {
        $this->canvas->nodes[] = $node;
        // Need to record this for undo — how?
    }
}`,
  }},

  // ── detect-pattern-bingo ─────────────────────────────────────────────────────
  { slug: 'detect-pattern-bingo', snippets: {
    java: `// Original — a simple data class:
class UserPrefs {
    String theme    = "dark";
    String lang     = "en";
    String timezone = "UTC";
}
// Junior wraps it in Singleton + Factory + Facade + Observer.
// What is the correct recommendation?`,
    py: `# Original — a simple data class:
@dataclass
class UserPrefs:
    theme:    str = "dark"
    lang:     str = "en"
    timezone: str = "UTC"
# Junior wraps it in Singleton + Factory + Facade + Observer.
# What is the correct recommendation?`,
    go: `// Original — a simple data struct:
type UserPrefs struct {
    Theme    string
    Lang     string
    Timezone string
}
// Junior wraps it in Singleton + Factory + Facade + Observer.
// What is the correct recommendation?`,
    rust: `// Original — a simple data struct:
struct UserPrefs {
    theme:    String,
    lang:     String,
    timezone: String,
}
// Junior wraps it in Singleton + Factory + Facade + Observer.
// What is the correct recommendation?`,
    cs: `// Original — a simple data class:
class UserPrefs {
    public string Theme    = "dark";
    public string Lang     = "en";
    public string Timezone = "UTC";
}
// Junior wraps it in Singleton + Factory + Facade + Observer.
// What is the correct recommendation?`,
    kotlin: `// Original — a simple data class:
data class UserPrefs(
    val theme:    String = "dark",
    val lang:     String = "en",
    val timezone: String = "UTC"
)
// Junior wraps it in Singleton + Factory + Facade + Observer.`,
    swift: `// Original — a simple struct:
struct UserPrefs {
    var theme:    String = "dark"
    var lang:     String = "en"
    var timezone: String = "UTC"
}
// Junior wraps it in Singleton + Factory + Facade + Observer.`,
    js: `// Original — a simple object:
class UserPrefs {
  theme    = 'dark'
  lang     = 'en'
  timezone = 'UTC'
}
// Junior adds Singleton + Factory + Facade + Observer.
// What is the correct recommendation?`,
    rb: `# Original — a simple data bag:
UserPrefs = Struct.new(:theme, :lang, :timezone) do
  def initialize(theme: "dark", lang: "en", timezone: "UTC")
    super(theme, lang, timezone)
  end
end
# Junior wraps it in Singleton + Factory + Facade + Observer.`,
    php: `// Original — a simple DTO:
class UserPrefs {
    public string $theme    = 'dark';
    public string $lang     = 'en';
    public string $timezone = 'UTC';
}
// Junior wraps it in Singleton + Factory + Facade + Observer.
// What is the correct recommendation?`,
  }},

  // ── proxy-vs-decorator-access ────────────────────────────────────────────────
  { slug: 'proxy-vs-decorator-access', snippets: {
    java: `class AuthenticatedService implements Service {
    private Service inner;
    private User user;
    public Result execute(Command cmd) {
        if (!user.hasPermission(cmd.getType())) throw new UnauthorizedException();
        return inner.execute(cmd); // pure delegation
    }
}`,
    py: `class AuthenticatedService(Service):
    def __init__(self, inner: Service, user: User):
        self.inner = inner; self.user = user
    def execute(self, cmd: Command) -> Result:
        if not self.user.has_permission(cmd.type): raise UnauthorizedException()
        return self.inner.execute(cmd)  # pure delegation`,
    go: `type AuthenticatedService struct{ inner Service; user User }
func (a *AuthenticatedService) Execute(cmd Command) (Result, error) {
    if !a.user.HasPermission(cmd.Type) { return Result{}, ErrUnauthorized }
    return a.inner.Execute(cmd)  // pure delegation
}`,
    rust: `struct AuthenticatedService { inner: Box<dyn Service>, user: User }
impl Service for AuthenticatedService {
    fn execute(&self, cmd: Command) -> Result<Output, Error> {
        if !self.user.has_permission(&cmd.cmd_type) { return Err(Error::Unauthorized); }
        self.inner.execute(cmd)  // pure delegation
    }
}`,
    cs: `class AuthenticatedService : IService {
    IService inner; User user;
    public Result Execute(Command cmd) {
        if (!user.HasPermission(cmd.Type)) throw new UnauthorizedException();
        return inner.Execute(cmd); // pure delegation
    }
}`,
    kotlin: `class AuthenticatedService(private val inner: Service, private val user: User) : Service {
    override fun execute(cmd: Command): Result {
        if (!user.hasPermission(cmd.type)) throw UnauthorizedException()
        return inner.execute(cmd)  // pure delegation
    }
}`,
    swift: `class AuthenticatedService: Service {
    let inner: Service; let user: User
    func execute(_ cmd: Command) throws -> Result {
        guard user.hasPermission(cmd.type) else { throw ServiceError.unauthorized }
        return inner.execute(cmd)  // pure delegation
    }
}`,
    js: `class AuthenticatedService {
  constructor(inner, user) { this.inner = inner; this.user = user }
  execute(cmd) {
    if (!this.user.hasPermission(cmd.type)) throw new UnauthorizedError()
    return this.inner.execute(cmd)  // pure delegation
  }
}`,
    rb: `class AuthenticatedService
  def initialize(inner, user) = @inner = inner and @user = user
  def execute(cmd)
    raise UnauthorizedError unless @user.has_permission?(cmd.type)
    @inner.execute(cmd)  # pure delegation
  end
end`,
    php: `class AuthenticatedService implements Service {
    function __construct(private Service $inner, private User $user) {}
    function execute(Command $cmd): Result {
        if (!$this->user->hasPermission($cmd->type)) throw new UnauthorizedException();
        return $this->inner->execute($cmd); // pure delegation
    }
}`,
  }},

  // ── factory-method-framework ─────────────────────────────────────────────────
  { slug: 'factory-method-framework', snippets: {
    java: `abstract class Dialog {
    void render() {
        Button btn = createButton(); // factory method
        btn.setOnClick(this::closeDialog);
        btn.render();
    }
    abstract Button createButton();
}
class WindowsDialog extends Dialog {
    Button createButton() { return new WindowsButton(); }
}`,
    py: `from abc import ABC, abstractmethod
class Dialog(ABC):
    def render(self):
        btn = self.create_button()  # factory method
        btn.on_click = self.close_dialog
        btn.render()
    @abstractmethod
    def create_button(self): ...
class WindowsDialog(Dialog):
    def create_button(self): return WindowsButton()`,
    go: `type Dialog interface { CreateButton() Button; Render() }
type BaseDialog struct{}
func (d *BaseDialog) Render(factory Dialog) {
    btn := factory.CreateButton()  // factory method
    btn.SetOnClick(d.CloseDialog)
    btn.Render()
}
type WindowsDialog struct{ BaseDialog }
func (w *WindowsDialog) CreateButton() Button { return &WindowsButton{} }`,
    rust: `trait Dialog { fn create_button(&self) -> Box<dyn Button>; }
struct WindowsDialog;
impl Dialog for WindowsDialog { fn create_button(&self) -> Box<dyn Button> { Box::new(WindowsButton) } }
fn render(dialog: &dyn Dialog) {
    let btn = dialog.create_button();  // factory method
    btn.render();
}`,
    cs: `abstract class Dialog {
    void Render() {
        var btn = CreateButton(); // factory method
        btn.OnClick += CloseDialog;
        btn.Render();
    }
    protected abstract IButton CreateButton();
}
class WindowsDialog : Dialog {
    protected override IButton CreateButton() => new WindowsButton();
}`,
    kotlin: `abstract class Dialog {
    fun render() {
        val btn = createButton()  // factory method
        btn.onClick = ::closeDialog
        btn.render()
    }
    abstract fun createButton(): Button
}
class WindowsDialog : Dialog() {
    override fun createButton() = WindowsButton()
}`,
    swift: `class Dialog {
    func render() {
        let btn = createButton()  // factory method
        btn.onTap = closeDialog
        btn.render()
    }
    func createButton() -> Button { fatalError("override me") }
}
class WindowsDialog: Dialog {
    override func createButton() -> Button { WindowsButton() }
}`,
    js: `class Dialog {
  render() {
    const btn = this.createButton()  // factory method
    btn.onClick = () => this.closeDialog()
    btn.render()
  }
  createButton() { throw new Error('override me') }
}
class WindowsDialog extends Dialog {
  createButton() { return new WindowsButton() }
}`,
    rb: `class Dialog
  def render
    btn = create_button  # factory method
    btn.on_click = method(:close_dialog)
    btn.render
  end
  def create_button = raise NotImplementedError
end
class WindowsDialog < Dialog
  def create_button = WindowsButton.new
end`,
    php: `abstract class Dialog {
    function render(): void {
        $btn = $this->createButton(); // factory method
        $btn->onClick = fn() => $this->closeDialog();
        $btn->render();
    }
    abstract function createButton(): Button;
}
class WindowsDialog extends Dialog {
    function createButton(): Button { return new WindowsButton(); }
}`,
  }},

  // ── composite-file-system ────────────────────────────────────────────────────
  { slug: 'composite-file-system', snippets: {
    java: `interface FileSystemEntry { int size(); }
class File implements FileSystemEntry {
    private int bytes;
    public int size() { return bytes; }
}
class Directory {
    List<Object> children = new ArrayList<>();
    // Need size() that recursively sums — no instanceof checks
}`,
    py: `class FileSystemEntry(ABC):
    @abstractmethod
    def size(self) -> int: ...
class File(FileSystemEntry):
    def size(self) -> int: return self.bytes
class Directory:
    def __init__(self): self.children = []
    # Need size() that recursively sums children`,
    go: `type FileSystemEntry interface { Size() int }
type File struct{ Bytes int }
func (f *File) Size() int { return f.Bytes }
type Directory struct{ Children []FileSystemEntry }
// Need Size() that recursively sums — no type switches`,
    rust: `trait FileSystemEntry { fn size(&self) -> usize; }
struct File { bytes: usize }
impl FileSystemEntry for File { fn size(&self) -> usize { self.bytes } }
struct Directory { children: Vec<Box<dyn FileSystemEntry>> }
// Need size() that recursively sums children`,
    cs: `interface IFileSystemEntry { int Size(); }
class File : IFileSystemEntry { int bytes; public int Size() => bytes; }
class Directory {
    List<object> Children = new();
    // Need Size() that recursively sums — no instanceof
}`,
    kotlin: `interface FileSystemEntry { fun size(): Int }
class File(val bytes: Int) : FileSystemEntry { override fun size() = bytes }
class Directory(val children: MutableList<Any> = mutableListOf()) {
    // Need size() that recursively sums children
}`,
    swift: `protocol FileSystemEntry { func size() -> Int }
class File: FileSystemEntry { var bytes = 0; func size() -> Int { bytes } }
class Directory {
    var children: [Any] = []
    // Need size() that recursively sums — no type checking
}`,
    js: `class File { size() { return this.bytes } }
class Directory {
  children = []
  // Need size() that recursively sums children
  // Without type-checking each child
}`,
    rb: `class File
  def size = @bytes
end
class Directory
  def initialize = @children = []
  # Need size() that recursively sums children
  # Without checking types
end`,
    php: `interface FileSystemEntry { function size(): int; }
class File implements FileSystemEntry { function size(): int { return $this->bytes; } }
class Directory {
    array $children = [];
    // Need size() that recursively sums — no instanceof checks
}`,
  }},

  // ── mediator-air-traffic ─────────────────────────────────────────────────────
  { slug: 'mediator-air-traffic', snippets: {
    java: `class Plane {
    private List<Plane> otherPlanes;
    void requestLanding() {
        boolean clear = otherPlanes.stream().allMatch(p -> !p.isOnRunway());
        if (clear) land();
        // Each plane knows every other plane
    }
}`,
    py: `class Plane:
    def __init__(self): self.other_planes = []
    def request_landing(self):
        clear = all(not p.is_on_runway() for p in self.other_planes)
        if clear: self.land()
        # Each plane knows every other plane`,
    go: `type Plane struct{ otherPlanes []*Plane }
func (p *Plane) RequestLanding() {
    for _, other := range p.otherPlanes {
        if other.IsOnRunway() { return }
    }
    p.Land()  // Each plane knows every other plane
}`,
    rust: `struct Plane { other_planes: Vec<Rc<RefCell<Plane>>> }
impl Plane {
    fn request_landing(&self) {
        let clear = self.other_planes.iter().all(|p| !p.borrow().is_on_runway());
        if clear { self.land(); }
    }
}`,
    cs: `class Plane {
    List<Plane> otherPlanes;
    void RequestLanding() {
        bool clear = otherPlanes.All(p => !p.IsOnRunway());
        if (clear) Land();
        // Each plane knows every other plane
    }
}`,
    kotlin: `class Plane {
    val otherPlanes = mutableListOf<Plane>()
    fun requestLanding() {
        val clear = otherPlanes.all { !it.isOnRunway() }
        if (clear) land()
    }
}`,
    swift: `class Plane {
    var otherPlanes: [Plane] = []
    func requestLanding() {
        let clear = otherPlanes.allSatisfy { !$0.isOnRunway() }
        if clear { land() }
    }
}`,
    js: `class Plane {
  otherPlanes = []
  requestLanding() {
    const clear = this.otherPlanes.every(p => !p.isOnRunway())
    if (clear) this.land()
    // Each plane knows every other plane
  }
}`,
    rb: `class Plane
  def initialize = @other_planes = []
  def request_landing
    land if @other_planes.none?(&:on_runway?)
    # Each plane knows every other plane
  end
end`,
    php: `class Plane {
    private array $otherPlanes = [];
    function requestLanding(): void {
        $clear = array_reduce($this->otherPlanes, fn($ok, $p) => $ok && !$p->isOnRunway(), true);
        if ($clear) $this->land();
    }
}`,
  }},

  // ── bridge-shapes-colors ─────────────────────────────────────────────────────
  { slug: 'bridge-shapes-colors', snippets: {
    java: `class RedCircle  { void draw() { /* circle + red */ } }
class BlueCircle { void draw() { /* circle + blue */ } }
class RedSquare  { void draw() { /* square + red */ } }
class BlueSquare { void draw() { /* square + blue */ } }
// 2 shapes × 3 colors = 6 classes; adding green = 2 more`,
    py: `class RedCircle:  # circle + red mixed
    def draw(self): pass
class BlueCircle:  # circle + blue mixed
    def draw(self): pass
class RedSquare:   # square + red mixed
    def draw(self): pass
class BlueSquare:  # square + blue mixed
    def draw(self): pass
# 2 shapes × 3 colors = 6 classes; adding green = 2 more`,
    go: `type RedCircle  struct{}; func (r RedCircle) Draw()  { /* circle + red */ }
type BlueCircle struct{}; func (b BlueCircle) Draw() { /* circle + blue */ }
type RedSquare  struct{}; func (r RedSquare) Draw()  { /* square + red */ }
type BlueSquare struct{}; func (b BlueSquare) Draw() { /* square + blue */ }
// 2 shapes × 3 colors = 6 types; adding green = 2 more`,
    rust: `struct RedCircle;  impl RedCircle  { fn draw(&self) { /* circle + red  */ } }
struct BlueCircle; impl BlueCircle { fn draw(&self) { /* circle + blue */ } }
struct RedSquare;  impl RedSquare  { fn draw(&self) { /* square + red  */ } }
struct BlueSquare; impl BlueSquare { fn draw(&self) { /* square + blue */ } }
// 2 shapes × 3 colors = 6 structs`,
    cs: `class RedCircle  { void Draw() { /* circle + red  */ } }
class BlueCircle { void Draw() { /* circle + blue */ } }
class RedSquare  { void Draw() { /* square + red  */ } }
class BlueSquare { void Draw() { /* square + blue */ } }
// 2 shapes × 3 colors = 6 classes`,
    kotlin: `class RedCircle  { fun draw() { /* circle + red  */ } }
class BlueCircle { fun draw() { /* circle + blue */ } }
class RedSquare  { fun draw() { /* square + red  */ } }
class BlueSquare { fun draw() { /* square + blue */ } }
// 2 shapes × 3 colors = 6 classes; adding purple = 2 more`,
    swift: `class RedCircle  { func draw() { /* circle + red  */ } }
class BlueCircle { func draw() { /* circle + blue */ } }
class RedSquare  { func draw() { /* square + red  */ } }
class BlueSquare { func draw() { /* square + blue */ } }
// 2 shapes × 3 colors = 6 classes`,
    js: `class RedCircle  { draw() { /* circle + red  */ } }
class BlueCircle { draw() { /* circle + blue */ } }
class RedSquare  { draw() { /* square + red  */ } }
class BlueSquare { draw() { /* square + blue */ } }
// 2 shapes × 3 colors = 6 classes; adding purple = 2 more`,
    rb: `class RedCircle;  def draw = nil; end   # circle + red
class BlueCircle; def draw = nil; end   # circle + blue
class RedSquare;  def draw = nil; end   # square + red
class BlueSquare; def draw = nil; end   # square + blue
# 2 shapes × 3 colors = 6 classes`,
    php: `class RedCircle  { function draw(): void { /* circle + red  */ } }
class BlueCircle { function draw(): void { /* circle + blue */ } }
class RedSquare  { function draw(): void { /* square + red  */ } }
class BlueSquare { function draw(): void { /* square + blue */ } }
// 2 shapes × 3 colors = 6 classes; adding green = 2 more`,
  }},

  // ── template-data-miner ──────────────────────────────────────────────────────
  { slug: 'template-data-miner', snippets: {
    java: `class DocMiner {
    void mine() {
        File f = openDoc(path);         // duplicated
        RawData r = extractDocData(f);  // custom step
        analyzeAndReport(r);            // duplicated
        closeDoc(f);                    // duplicated
    }
}
class CsvMiner {
    void mine() {
        File f = openCsv(path);         // same skeleton
        RawData r = extractCsvData(f);
        analyzeAndReport(r); closeCsv(f);
    }
}`,
    py: `class DocMiner:
    def mine(self):
        f = self.open_doc(self.path)        # duplicated
        raw = self.extract_doc_data(f)      # custom step
        self.analyze_and_report(raw)        # duplicated
        self.close_doc(f)                   # duplicated
class CsvMiner:
    def mine(self):
        f = self.open_csv(self.path)        # same skeleton
        raw = self.extract_csv_data(f)
        self.analyze_and_report(raw); self.close_csv(f)`,
    go: `func (d *DocMiner) Mine() {
    f := openDoc(d.path); raw := extractDocData(f)  // same skeleton duplicated
    analyzeAndReport(raw); closeDoc(f)
}
func (c *CsvMiner) Mine() {
    f := openCsv(c.path); raw := extractCsvData(f)
    analyzeAndReport(raw); closeCsv(f)
}`,
    rust: `impl DocMiner { fn mine(&self) { let f=open_doc(&self.path); let r=extract_doc(&f); report(&r); close_doc(f); } }
impl CsvMiner { fn mine(&self) { let f=open_csv(&self.path); let r=extract_csv(&f); report(&r); close_csv(f); } }
// validate() and report() duplicated across both`,
    cs: `class DocMiner { void Mine() { var f=OpenDoc(path); var r=ExtractDoc(f); Report(r); CloseDoc(f); } }
class CsvMiner { void Mine() { var f=OpenCsv(path); var r=ExtractCsv(f); Report(r); CloseCsv(f); } }
// Report() skeleton is duplicated`,
    kotlin: `class DocMiner { fun mine() { val f=openDoc(path); val r=extractDoc(f); report(r); closeDoc(f) } }
class CsvMiner { fun mine() { val f=openCsv(path); val r=extractCsv(f); report(r); closeCsv(f) } }
// report() step is duplicated`,
    swift: `class DocMiner { func mine() { let f=openDoc(path); let r=extractDoc(f); report(r); closeDoc(f) } }
class CsvMiner { func mine() { let f=openCsv(path); let r=extractCsv(f); report(r); closeCsv(f) } }
// report() skeleton duplicated`,
    js: `class DocMiner { mine() { const f=this.openDoc(); const r=this.extractDoc(f); this.report(r); this.closeDoc(f) } }
class CsvMiner { mine() { const f=this.openCsv(); const r=this.extractCsv(f); this.report(r); this.closeCsv(f) } }
// report() step is duplicated`,
    rb: `class DocMiner
  def mine = close_doc(report(extract_doc(open_doc(path))))
end
class CsvMiner
  def mine = close_csv(report(extract_csv(open_csv(path))))
end
# report() duplicated in both`,
    php: `class DocMiner { function mine(): void { $f=$this->openDoc(); $r=$this->extractDoc($f); $this->report($r); $this->closeDoc($f); } }
class CsvMiner { function mine(): void { $f=$this->openCsv(); $r=$this->extractCsv($f); $this->report($r); $this->closeCsv($f); } }`,
  }},

  // ── builder-http-request ─────────────────────────────────────────────────────
  { slug: 'builder-http-request', snippets: {
    java: `// Fragile — positional args, easy to swap:
HttpRequest req = new HttpRequest(
    "https://api.example.com/pay", "POST",
    Map.of("Authorization","Bearer tok"),
    jsonBody, 5000, true
);`,
    py: `# Fragile positional args:
req = HttpRequest(
    "https://api.example.com/pay", "POST",
    {"Authorization": "Bearer tok"},
    json_body, 5000, True
)`,
    go: `// Fragile positional args:
req := NewHttpRequest(
    "https://api.example.com/pay", "POST",
    map[string]string{"Authorization": "Bearer tok"},
    jsonBody, 5000, true,
)`,
    rust: `// Fragile positional args:
let req = HttpRequest::new(
    "https://api.example.com/pay", "POST",
    &[("Authorization", "Bearer tok")],
    &json_body, Duration::from_secs(5), true,
);`,
    cs: `// Fragile positional args:
var req = new HttpRequest(
    "https://api.example.com/pay", "POST",
    new Dictionary<string,string>{{"Authorization","Bearer tok"}},
    jsonBody, TimeSpan.FromSeconds(5), true
);`,
    kotlin: `// Fragile positional args:
val req = HttpRequest(
    "https://api.example.com/pay", "POST",
    mapOf("Authorization" to "Bearer tok"),
    jsonBody, 5000L, true
)`,
    swift: `// Fragile positional args:
let req = HttpRequest(
    url: "https://api.example.com/pay", method: "POST",
    headers: ["Authorization": "Bearer tok"],
    body: jsonBody, timeout: 5.0, followRedirects: true
)`,
    js: `// Unreadable positional args:
const req = new HttpRequest(
  'https://api.example.com/pay', 'POST',
  { Authorization: 'Bearer tok' },
  JSON.stringify(body), 5000, true
)`,
    rb: `# Fragile positional args:
req = HttpRequest.new(
  "https://api.example.com/pay", "POST",
  { "Authorization" => "Bearer tok" },
  json_body, 5000, true
)`,
    php: `// Fragile positional args:
$req = new HttpRequest(
    "https://api.example.com/pay", "POST",
    ["Authorization" => "Bearer tok"],
    $jsonBody, 5000, true
);`,
  }},

  // ── adapter-xml-json ─────────────────────────────────────────────────────────
  { slug: 'adapter-xml-json', snippets: {
    java: `interface JsonReader { List<Map<String,String>> readAll(); }
// Only available:
class XmlReader {
    Document parse(String xml) { return null; }
    List<Node> getNodes(Document doc) { return null; }
}
// Make XmlReader usable where JsonReader is expected`,
    py: `class JsonReader(ABC):
    @abstractmethod
    def read_all(self) -> list[dict]: ...
# Only available:
class XmlReader:
    def parse(self, xml: str): return None
    def get_nodes(self, doc) -> list: return []
# Make XmlReader usable where JsonReader is expected`,
    go: `type JsonReader interface { ReadAll() []map[string]string }
// Only available:
type XmlReader struct{}
func (r *XmlReader) Parse(xml string) *XMLDocument { return nil }
func (r *XmlReader) GetNodes(doc *XMLDocument) []XMLNode { return nil }
// Make XmlReader usable where JsonReader is expected`,
    rust: `trait JsonReader { fn read_all(&self) -> Vec<HashMap<String, String>>; }
// Only available:
struct XmlReader;
impl XmlReader {
    fn parse(&self, xml: &str) -> XmlDocument { todo!() }
    fn get_nodes(&self, doc: &XmlDocument) -> Vec<XmlNode> { todo!() }
}
// Make XmlReader usable where JsonReader is expected`,
    cs: `interface IJsonReader { List<Dictionary<string,string>> ReadAll(); }
// Only available:
class XmlReader {
    XmlDocument Parse(string xml) => null;
    List<XmlNode> GetNodes(XmlDocument doc) => null;
}
// Make XmlReader usable where IJsonReader is expected`,
    kotlin: `interface JsonReader { fun readAll(): List<Map<String,String>> }
// Only available:
class XmlReader {
    fun parse(xml: String): XmlDocument = TODO()
    fun getNodes(doc: XmlDocument): List<XmlNode> = TODO()
}
// Make XmlReader usable where JsonReader is expected`,
    swift: `protocol JsonReader { func readAll() -> [[String: String]] }
// Only available:
class XmlReader {
    func parse(_ xml: String) -> XMLDocument { XMLDocument() }
    func getNodes(_ doc: XMLDocument) -> [XMLNode] { [] }
}
// Make XmlReader usable where JsonReader is expected`,
    js: `// Only available:
class XmlReader {
  parse(xml) { return null }
  getNodes(doc) { return [] }
}
// Make XmlReader work where JsonReader interface is expected`,
    rb: `module JsonReader
  def read_all = raise NotImplementedError
end
# Only available:
class XmlReader
  def parse(xml) = nil
  def get_nodes(doc) = []
end
# Make XmlReader usable where JsonReader is expected`,
    php: `interface JsonReader { function readAll(): array; }
// Only available:
class XmlReader {
    function parse(string $xml): DOMDocument { return new DOMDocument(); }
    function getNodes(DOMDocument $doc): array { return []; }
}
// Make XmlReader usable where JsonReader is expected`,
  }},

  // ── facade-video-convert ─────────────────────────────────────────────────────
  { slug: 'facade-video-convert', snippets: {
    java: `// Client must orchestrate all subsystems manually:
H264Codec codec = new H264Codec();
AacProcessor audio = new AacProcessor();
BitrateOptimizer bitrate = new BitrateOptimizer(1080);
Mp4Container container = new Mp4Container();
codec.encode(inputFrames);
audio.process(inputAudio);
bitrate.adjust(codec.getOutput());
container.mux(codec.getOutput(), audio.getOutput());`,
    py: `# Client must orchestrate all subsystems manually:
codec   = H264Codec()
audio   = AacProcessor()
bitrate = BitrateOptimizer(1080)
container = Mp4Container()
codec.encode(input_frames)
audio.process(input_audio)
bitrate.adjust(codec.output)
container.mux(codec.output, audio.output)`,
    go: `// Client must orchestrate all subsystems manually:
codec   := NewH264Codec()
audio   := NewAacProcessor()
bitrate := NewBitrateOptimizer(1080)
mp4     := NewMp4Container()
codec.Encode(inputFrames)
audio.Process(inputAudio)
bitrate.Adjust(codec.Output())
mp4.Mux(codec.Output(), audio.Output())`,
    rust: `// Client must orchestrate all subsystems manually:
let codec   = H264Codec::new();
let audio   = AacProcessor::new();
let bitrate = BitrateOptimizer::new(1080);
let mp4     = Mp4Container::new();
codec.encode(&input_frames);
audio.process(&input_audio);
bitrate.adjust(codec.output());
mp4.mux(codec.output(), audio.output());`,
    cs: `// Client must orchestrate all subsystems manually:
var codec   = new H264Codec();
var audio   = new AacProcessor();
var bitrate = new BitrateOptimizer(1080);
var mp4     = new Mp4Container();
codec.Encode(inputFrames);
audio.Process(inputAudio);
bitrate.Adjust(codec.Output);
mp4.Mux(codec.Output, audio.Output);`,
    kotlin: `// Client must orchestrate all subsystems manually:
val codec   = H264Codec()
val audio   = AacProcessor()
val bitrate = BitrateOptimizer(1080)
val mp4     = Mp4Container()
codec.encode(inputFrames)
audio.process(inputAudio)
bitrate.adjust(codec.output)
mp4.mux(codec.output, audio.output)`,
    swift: `// Client must orchestrate all subsystems manually:
let codec   = H264Codec(); let audio = AacProcessor()
let bitrate = BitrateOptimizer(resolution: 1080); let mp4 = Mp4Container()
codec.encode(frames: inputFrames); audio.process(audio: inputAudio)
bitrate.adjust(output: codec.output); mp4.mux(video: codec.output, audio: audio.output)`,
    js: `// Client must orchestrate all subsystems manually:
const codec   = new H264Codec()
const audio   = new AacAudioProcessor()
const bitrate = new BitrateOptimizer(1080)
const mp4     = new Mp4Container()
codec.encode(inputFrames)
audio.process(inputAudio)
bitrate.adjust(codec.output)
mp4.mux(codec.output, audio.output)`,
    rb: `# Client must orchestrate all subsystems manually:
codec   = H264Codec.new
audio   = AacProcessor.new
bitrate = BitrateOptimizer.new(1080)
mp4     = Mp4Container.new
codec.encode(input_frames); audio.process(input_audio)
bitrate.adjust(codec.output); mp4.mux(codec.output, audio.output)`,
    php: `// Client must orchestrate all subsystems manually:
$codec   = new H264Codec();   $audio = new AacProcessor();
$bitrate = new BitrateOptimizer(1080); $mp4 = new Mp4Container();
$codec->encode($inputFrames); $audio->process($inputAudio);
$bitrate->adjust($codec->output); $mp4->mux($codec->output, $audio->output);`,
  }},

  // ── state-vending ────────────────────────────────────────────────────────────
  { slug: 'state-vending', snippets: {
    java: `class VendingMachine {
    private String state = "idle";
    void acceptCoin() {
        if (state.equals("idle"))       state = "hasCoin";
        else if (state.equals("hasCoin")) System.out.println("Coin inserted");
        else System.out.println("Wait...");
    }
    void selectProduct() {
        if (!state.equals("hasCoin")) throw new IllegalStateException("Insert coin");
        state = "dispensing"; dispense();
    }
}`,
    py: `class VendingMachine:
    def __init__(self): self.state = "idle"
    def accept_coin(self):
        if self.state == "idle":      self.state = "hasCoin"
        elif self.state == "hasCoin": print("Coin already inserted")
        else:                         print("Wait...")
    def select_product(self):
        if self.state != "hasCoin": raise RuntimeError("Insert coin")
        self.state = "dispensing"; self.dispense()`,
    go: `type VendingMachine struct{ state string }
func (v *VendingMachine) AcceptCoin() {
    switch v.state {
    case "idle":     v.state = "hasCoin"
    case "hasCoin":  fmt.Println("Coin inserted")
    default:         fmt.Println("Wait...")
    }
}
func (v *VendingMachine) SelectProduct() {
    if v.state != "hasCoin" { panic("Insert coin first") }
    v.state = "dispensing"; v.dispense()
}`,
    rust: `struct VendingMachine { state: String }
impl VendingMachine {
    fn accept_coin(&mut self) {
        match self.state.as_str() {
            "idle"    => self.state = "hasCoin".into(),
            "hasCoin" => println!("Coin inserted"),
            _         => println!("Wait..."),
        }
    }
    fn select_product(&mut self) {
        if self.state != "hasCoin" { panic!("Insert coin first"); }
        self.state = "dispensing".into();
    }
}`,
    cs: `class VendingMachine {
    string state = "idle";
    void AcceptCoin() {
        if (state == "idle")       state = "hasCoin";
        else if (state == "hasCoin") Console.WriteLine("Coin inserted");
        else Console.WriteLine("Wait...");
    }
    void SelectProduct() {
        if (state != "hasCoin") throw new InvalidOperationException("Insert coin");
        state = "dispensing"; Dispense();
    }
}`,
    kotlin: `class VendingMachine {
    var state = "idle"
    fun acceptCoin() = when (state) {
        "idle"    -> state = "hasCoin"
        "hasCoin" -> println("Coin inserted")
        else      -> println("Wait...")
    }
    fun selectProduct() {
        if (state != "hasCoin") throw IllegalStateException("Insert coin")
        state = "dispensing"; dispense()
    }
}`,
    swift: `class VendingMachine {
    var state = "idle"
    func acceptCoin() {
        switch state {
        case "idle":    state = "hasCoin"
        case "hasCoin": print("Coin inserted")
        default:        print("Wait...")
        }
    }
    func selectProduct() {
        guard state == "hasCoin" else { fatalError("Insert coin") }
        state = "dispensing"; dispense()
    }
}`,
    js: `class VendingMachine {
  state = 'idle'
  acceptCoin() {
    if (this.state === 'idle')      this.state = 'hasCoin'
    else if (this.state === 'hasCoin') console.log('Coin inserted')
    else console.log('Wait...')
  }
  selectProduct() {
    if (this.state !== 'hasCoin') throw new Error('Insert coin first')
    this.state = 'dispensing'; this.dispense()
  }
}`,
    rb: `class VendingMachine
  def initialize = @state = "idle"
  def accept_coin
    case @state
    when "idle"    then @state = "hasCoin"
    when "hasCoin" then puts "Coin inserted"
    else                puts "Wait..."
    end
  end
  def select_product = @state == "hasCoin" ? (@state = "dispensing") : raise("Insert coin")
end`,
    php: `class VendingMachine {
    private string $state = 'idle';
    function acceptCoin(): void {
        if ($this->state === 'idle')       $this->state = 'hasCoin';
        elseif ($this->state === 'hasCoin') echo 'Coin inserted';
        else echo 'Wait...';
    }
    function selectProduct(): void {
        if ($this->state !== 'hasCoin') throw new Exception('Insert coin');
        $this->state = 'dispensing'; $this->dispense();
    }
}`,
  }},

  // ── command-smart-home ───────────────────────────────────────────────────────
  { slug: 'command-smart-home', snippets: {
    java: `class Remote {
    void onPress(String button) {
        if (button.equals("on"))    Light.turnOn();
        if (button.equals("off"))   Light.turnOff();
        if (button.equals("party")) { Light.dim(30); Speaker.play("party"); }
        // No undo, no scheduling, no macro support
    }
}`,
    py: `class Remote:
    def on_press(self, button: str):
        if button == "on":    Light.turn_on()
        if button == "off":   Light.turn_off()
        if button == "party": Light.dim(30); Speaker.play("party")
        # No undo, no scheduling, no macro support`,
    go: `func (r *Remote) OnPress(button string) {
    switch button {
    case "on":    Light.TurnOn()
    case "off":   Light.TurnOff()
    case "party": Light.Dim(30); Speaker.Play("party")
    }
    // No undo, no scheduling, no macro support
}`,
    rust: `impl Remote {
    fn on_press(&self, button: &str) {
        match button {
            "on"    => light::turn_on(),
            "off"   => light::turn_off(),
            "party" => { light::dim(30); speaker::play("party"); }
            _ => {}
        }
        // No undo, no scheduling, no macro support
    }
}`,
    cs: `class Remote {
    void OnPress(string button) {
        if (button == "on")    Light.TurnOn();
        if (button == "off")   Light.TurnOff();
        if (button == "party") { Light.Dim(30); Speaker.Play("party"); }
        // No undo, no scheduling, no macro support
    }
}`,
    kotlin: `class Remote {
    fun onPress(button: String) {
        when (button) {
            "on"    -> Light.turnOn()
            "off"   -> Light.turnOff()
            "party" -> { Light.dim(30); Speaker.play("party") }
        }
    }
}`,
    swift: `class Remote {
    func onPress(button: String) {
        switch button {
        case "on":    Light.turnOn()
        case "off":   Light.turnOff()
        case "party": Light.dim(30); Speaker.play("party")
        default: break
        }
    }
}`,
    js: `class Remote {
  onPress(button) {
    if (button === 'on')    Light.turnOn()
    if (button === 'off')   Light.turnOff()
    if (button === 'party') { Light.dim(30); Speaker.play('party') }
    // No undo, no scheduling, no macro support
  }
}`,
    rb: `class Remote
  def on_press(button)
    case button
    when "on"    then Light.turn_on
    when "off"   then Light.turn_off
    when "party" then Light.dim(30); Speaker.play("party")
    end
  end
end`,
    php: `class Remote {
    function onPress(string $button): void {
        if ($button === 'on')    Light::turnOn();
        if ($button === 'off')   Light::turnOff();
        if ($button === 'party') { Light::dim(30); Speaker::play('party'); }
    }
}`,
  }},

  // ── detect-inheritance-for-reuse ─────────────────────────────────────────────
  { slug: 'detect-inheritance-for-reuse', snippets: {
    java: `class Stack<T> extends ArrayList<T> {
    public void push(T item) { add(item); }
    public T pop() { return remove(size() - 1); }
    // Problem: exposes add(), remove(i), get(i), set() — stack discipline bypassed
}`,
    py: `class Stack(list):
    def push(self, item): self.append(item)
    def pop_top(self): return self.pop()
    # Problem: exposes insert(), __setitem__(), remove()
    # Stack discipline can be bypassed`,
    go: `// Go has no inheritance but embedding has same smell:
type Stack[T any] struct{ ArrayList[T] }
func (s *Stack[T]) Push(item T) { s.Add(item) }
func (s *Stack[T]) Pop() T { return s.Remove(s.Size()-1) }
// Exposes Add(), Remove(i), Get(i) — stack discipline bypassed`,
    rust: `// Rust doesn't have inheritance — using newtype:
struct Stack<T>(Vec<T>);
impl<T> Stack<T> {
    fn push(&mut self, item: T) { self.0.push(item) }
    fn pop(&mut self) -> Option<T> { self.0.pop() }
    // If we expose Vec directly, discipline breaks
}`,
    cs: `class Stack<T> : List<T> {
    public void Push(T item) => Add(item);
    public T Pop() => this[Count - 1]; // also Remove
    // Problem: exposes Add(), Insert(), Remove(i) — bypass possible
}`,
    kotlin: `class Stack<T> : ArrayList<T>() {
    fun push(item: T) { add(item) }
    fun popTop(): T = removeAt(size - 1)
    // Problem: exposes add(), set(), removeAt(i) — stack discipline bypassed
}`,
    swift: `class Stack<T>: Array<T> { // Swift doesn't allow this, but similar smell:
    func push(_ item: T) { append(item) }
    func popTop() -> T? { return popLast() }
    // Exposes insert(), remove(at:) — bypasses stack discipline
}`,
    js: `class Stack extends Array {
  push(...items) { return super.push(...items) }
  pop() { return super.pop() }
  // Problem: exposes splice(), sort(), indexOf() — stack discipline bypassed
}`,
    rb: `class Stack < Array
  def push_item(item) = push(item)
  def pop_top = pop
  # Problem: exposes insert(), delete_at(), [] — stack discipline bypassed
end`,
    php: `class Stack extends SplDoublyLinkedList {
    function push(mixed $item): void { parent::push($item); }
    function pop(): mixed { return parent::pop(); }
    // Exposes offsetGet(), offsetSet() — discipline bypassed
}`,
  }},

  // ── explain-dip-payment-uml ──────────────────────────────────────────────────
  { slug: 'explain-dip-payment-uml', snippets: {
    java: `class Order {
    void pay() {
        RazorpayGateway gw = new RazorpayGateway(); // concrete dependency
        gw.initiatePayment(amount);
    }
}
// Order → RazorpayGateway (concrete-to-concrete)`,
    py: `class Order:
    def pay(self):
        gw = RazorpayGateway()   # concrete dependency
        gw.initiate_payment(self.amount)
# Order → RazorpayGateway (concrete-to-concrete)`,
    go: `func (o *Order) Pay() {
    gw := &RazorpayGateway{}   // concrete dependency
    gw.InitiatePayment(o.Amount)
}
// Order → RazorpayGateway (concrete-to-concrete)`,
    rust: `impl Order {
    fn pay(&self) {
        let gw = RazorpayGateway::new();   // concrete dependency
        gw.initiate_payment(self.amount);
    }
}
// Order → RazorpayGateway (concrete-to-concrete)`,
    cs: `class Order {
    void Pay() {
        var gw = new RazorpayGateway(); // concrete dependency
        gw.InitiatePayment(amount);
    }
}
// Order → RazorpayGateway (concrete-to-concrete)`,
    kotlin: `class Order {
    fun pay() {
        val gw = RazorpayGateway()   // concrete dependency
        gw.initiatePayment(amount)
    }
}
// Order → RazorpayGateway (concrete-to-concrete)`,
    swift: `class Order {
    func pay() {
        let gw = RazorpayGateway()   // concrete dependency
        gw.initiatePayment(amount: amount)
    }
}
// Order → RazorpayGateway (concrete-to-concrete)`,
    js: `class Order {
  pay() {
    const gw = new RazorpayGateway()   // concrete dependency
    gw.initiatePayment(this.amount)
  }
}
// Order → RazorpayGateway (concrete-to-concrete)`,
    rb: `class Order
  def pay
    gw = RazorpayGateway.new   # concrete dependency
    gw.initiate_payment(@amount)
  end
end
# Order → RazorpayGateway (concrete-to-concrete)`,
    php: `class Order {
    function pay(): void {
        $gw = new RazorpayGateway(); // concrete dependency
        $gw->initiatePayment($this->amount);
    }
}
// Order → RazorpayGateway (concrete-to-concrete)`,
  }},

  // ── composite-menu ───────────────────────────────────────────────────────────
  { slug: 'composite-menu', snippets: {
    java: `class MenuItem { void open() { System.out.println("Navigate to " + url); } }
class Menu {
    List<Object> children = new ArrayList<>();
    void open() {
        // No uniform interface — type checks needed
        for (Object c : children) {
            if (c instanceof MenuItem) ((MenuItem)c).open();
            else if (c instanceof Menu) ((Menu)c).open();
        }
    }
}`,
    py: `class MenuItem:
    def open(self): print(f"Navigate to {self.url}")
class Menu:
    def __init__(self): self.children = []
    def open(self):
        for c in self.children:
            c.open()  # needs uniform interface`,
    go: `type MenuItem struct{ URL string }
func (m *MenuItem) Open() { fmt.Println("Navigate to", m.URL) }
type Menu struct{ Children []interface{} }
func (m *Menu) Open() {
    for _, c := range m.Children {
        switch v := c.(type) {
        case *MenuItem: v.Open()
        case *Menu:     v.Open()
        }
    }
}`,
    rust: `trait MenuEntry { fn open(&self); }
struct MenuItem { url: String }
impl MenuEntry for MenuItem { fn open(&self) { println!("Navigate to {}", self.url); } }
struct Menu { children: Vec<Box<dyn MenuEntry>> }
impl MenuEntry for Menu { fn open(&self) { self.children.iter().for_each(|c| c.open()); } }`,
    cs: `class MenuItem { void Open() => Console.WriteLine($"Navigate to {url}"); }
class Menu {
    List<object> Children = new();
    void Open() { Children.OfType<dynamic>().ToList().ForEach(c => c.Open()); }
}`,
    kotlin: `class MenuItem(val url: String) { fun open() = println("Navigate to $url") }
class Menu(val children: MutableList<Any> = mutableListOf()) {
    fun open() { children.forEach { (it as? MenuItem)?.open() ?: (it as? Menu)?.open() } }
}`,
    swift: `class MenuItem { func open() { print("Navigate to \(url)") } }
class Menu {
    var children: [Any] = []
    func open() {
        children.forEach { ($0 as? MenuItem)?.open() ?? ($0 as? Menu)?.open() }
    }
}`,
    js: `class MenuItem { open() { console.log('Navigate to', this.url) } }
class Menu {
  children = []
  open() {
    // No uniform interface — relies on duck typing
    this.children.forEach(c => c.open())
  }
}`,
    rb: `class MenuItem
  def open = puts "Navigate to #{@url}"
end
class Menu
  def initialize = @children = []
  def open = @children.each(&:open)
end`,
    php: `class MenuItem { function open(): void { echo "Navigate to $this->url"; } }
class Menu {
    array $children = [];
    function open(): void { foreach ($this->children as $c) $c->open(); }
}`,
  }},

  // ── facade-vs-god ────────────────────────────────────────────────────────────
  { slug: 'facade-vs-god', snippets: {
    java: `class CheckoutFacade {
    // Legitimate:
    void checkout(String userId) { /* coord cart + payment + inventory */ }
    // Red flags:
    void createUsersTable() { db.execute("CREATE TABLE users..."); }
    String renderHtml(Order o) { return "<div>...</div>"; }
    void manageThreadPool(int size) { this.pool = new ThreadPool(size); }
}`,
    py: `class CheckoutFacade:
    # Legitimate:
    def checkout(self, user_id: str): pass  # coord cart + payment + inventory
    # Red flags:
    def create_users_table(self): db.execute("CREATE TABLE users...")
    def render_html(self, order) -> str: return "<div>...</div>"
    def manage_thread_pool(self, size: int): self.pool = ThreadPool(size)`,
    go: `type CheckoutFacade struct{}
// Legitimate:
func (f *CheckoutFacade) Checkout(userID string) { /* coord cart + payment + inventory */ }
// Red flags:
func (f *CheckoutFacade) CreateUsersTable() { db.Exec("CREATE TABLE users...") }
func (f *CheckoutFacade) RenderHTML(o Order) string { return "<div>...</div>" }
func (f *CheckoutFacade) ManageThreadPool(size int) { f.pool = NewPool(size) }`,
    rust: `struct CheckoutFacade;
impl CheckoutFacade {
    fn checkout(&self, user_id: &str) { /* coord cart + payment + inventory */ }
    // Red flags:
    fn create_users_table(&self) { db::exec("CREATE TABLE users..."); }
    fn render_html(&self, order: &Order) -> String { "<div>...</div>".into() }
    fn manage_thread_pool(&self, size: usize) { /* ThreadPool::new(size) */ }
}`,
    cs: `class CheckoutFacade {
    // Legitimate:
    void Checkout(string userId) { /* coord cart + payment + inventory */ }
    // Red flags:
    void CreateUsersTable() { db.Execute("CREATE TABLE users..."); }
    string RenderHtml(Order o) => "<div>...</div>";
    void ManageThreadPool(int size) { this.pool = new ThreadPool(size); }
}`,
    kotlin: `class CheckoutFacade {
    // Legitimate:
    fun checkout(userId: String) { /* coord cart + payment + inventory */ }
    // Red flags:
    fun createUsersTable() = db.execute("CREATE TABLE users...")
    fun renderHtml(order: Order): String = "<div>...</div>"
    fun manageThreadPool(size: Int) { pool = ThreadPool(size) }
}`,
    swift: `class CheckoutFacade {
    // Legitimate:
    func checkout(userId: String) { /* coord cart + payment + inventory */ }
    // Red flags:
    func createUsersTable() { db.execute("CREATE TABLE users...") }
    func renderHtml(order: Order) -> String { "<div>...</div>" }
    func manageThreadPool(size: Int) { pool = ThreadPool(size: size) }
}`,
    js: `class CheckoutFacade {
  checkout(userId) { /* coord cart + payment + inventory */ }  // Legitimate
  // Red flags:
  createUsersTable() { db.execute('CREATE TABLE users...') }
  renderHtml(order) { return '<div>...</div>' }
  manageThreadPool(size) { this.pool = new ThreadPool(size) }
}`,
    rb: `class CheckoutFacade
  def checkout(user_id) = nil  # Legitimate: coord cart + payment + inventory
  # Red flags:
  def create_users_table = db.execute("CREATE TABLE users...")
  def render_html(order) = "<div>...</div>"
  def manage_thread_pool(size) = @pool = ThreadPool.new(size)
end`,
    php: `class CheckoutFacade {
    // Legitimate:
    function checkout(string $userId): void { /* coord cart + payment + inventory */ }
    // Red flags:
    function createUsersTable(): void { $this->db->execute("CREATE TABLE users..."); }
    function renderHtml(Order $order): string { return "<div>...</div>"; }
    function manageThreadPool(int $size): void { $this->pool = new ThreadPool($size); }
}`,
  }},

  // ── adapter-legacy-pay ───────────────────────────────────────────────────────
  { slug: 'adapter-legacy-pay', snippets: {
    java: `interface PaymentPort { PayResult pay(double amount, String token); }
// Legacy client only speaks SOAP:
class LegacySoapClient {
    SoapResponse callService(SoapEnvelope envelope) { return null; }
}
// Bridge without modifying either class`,
    py: `class PaymentPort(ABC):
    @abstractmethod
    def pay(self, amount: float, token: str): ...
# Legacy client only speaks SOAP:
class LegacySoapClient:
    def call_service(self, envelope) -> SoapResponse: return None
# Bridge without modifying either class`,
    go: `type PaymentPort interface { Pay(amount float64, token string) (PayResult, error) }
// Legacy client only speaks SOAP:
type LegacySoapClient struct{}
func (c *LegacySoapClient) CallService(env SoapEnvelope) SoapResponse { return SoapResponse{} }
// Bridge without modifying either`,
    rust: `trait PaymentPort { fn pay(&self, amount: f64, token: &str) -> PayResult; }
// Legacy client only speaks SOAP:
struct LegacySoapClient;
impl LegacySoapClient { fn call_service(&self, env: SoapEnvelope) -> SoapResponse { todo!() } }
// Bridge without modifying either`,
    cs: `interface IPaymentPort { PayResult Pay(double amount, string token); }
// Legacy client only speaks SOAP:
class LegacySoapClient {
    SoapResponse CallService(SoapEnvelope envelope) => default;
}
// Bridge without modifying either`,
    kotlin: `interface PaymentPort { fun pay(amount: Double, token: String): PayResult }
// Legacy client only speaks SOAP:
class LegacySoapClient { fun callService(envelope: SoapEnvelope): SoapResponse = TODO() }
// Bridge without modifying either class`,
    swift: `protocol PaymentPort { func pay(amount: Double, token: String) -> PayResult }
// Legacy client only speaks SOAP:
class LegacySoapClient { func callService(_ envelope: SoapEnvelope) -> SoapResponse { SoapResponse() } }
// Bridge without modifying either`,
    js: `// Legacy client only speaks SOAP:
class LegacySoapClient {
  callService(envelope) { return null }
}
// New code expects: pay(amount, token) => { txId }
// Bridge without modifying either class`,
    rb: `module PaymentPort
  def pay(amount, token) = raise NotImplementedError
end
# Legacy client only speaks SOAP:
class LegacySoapClient
  def call_service(envelope) = nil
end
# Bridge without modifying either class`,
    php: `interface PaymentPort { function pay(float $amount, string $token): PayResult; }
// Legacy client only speaks SOAP:
class LegacySoapClient {
    function callService(SoapEnvelope $envelope): SoapResponse { return new SoapResponse(); }
}
// Bridge without modifying either class`,
  }},

  // ── state-tcp ────────────────────────────────────────────────────────────────
  { slug: 'state-tcp', snippets: {
    java: `class TcpConnection {
    private String state = "closed";
    void open() {
        if (state.equals("closed")) state = "listen";
        else throw new RuntimeException("Already open");
    }
    void send(byte[] data) {
        if (!state.equals("established")) throw new RuntimeException("Not connected");
        socket.write(data);
    }
}`,
    py: `class TcpConnection:
    def __init__(self): self.state = "closed"
    def open(self):
        if self.state == "closed": self.state = "listen"
        else: raise RuntimeError("Already open")
    def send(self, data: bytes):
        if self.state != "established": raise RuntimeError("Not connected")
        self.socket.write(data)`,
    go: `type TcpConnection struct{ state string; socket net.Conn }
func (t *TcpConnection) Open() error {
    if t.state == "closed" { t.state = "listen"; return nil }
    return errors.New("already open")
}
func (t *TcpConnection) Send(data []byte) error {
    if t.state != "established" { return errors.New("not connected") }
    _, err := t.socket.Write(data); return err
}`,
    rust: `struct TcpConnection { state: String }
impl TcpConnection {
    fn open(&mut self) -> Result<(), &str> {
        if self.state == "closed" { self.state = "listen".into(); Ok(()) }
        else { Err("already open") }
    }
    fn send(&self, data: &[u8]) -> Result<(), &str> {
        if self.state != "established" { return Err("not connected"); }
        Ok(self.socket.write_all(data).unwrap())
    }
}`,
    cs: `class TcpConnection {
    string state = "closed";
    void Open() {
        if (state == "closed") state = "listen";
        else throw new InvalidOperationException("Already open");
    }
    void Send(byte[] data) {
        if (state != "established") throw new InvalidOperationException("Not connected");
        socket.Write(data);
    }
}`,
    kotlin: `class TcpConnection {
    var state = "closed"
    fun open() = if (state == "closed") state = "listen" else throw IllegalStateException("Already open")
    fun send(data: ByteArray) {
        if (state != "established") throw IllegalStateException("Not connected")
        socket.write(data)
    }
}`,
    swift: `class TcpConnection {
    var state = "closed"
    func open() throws {
        guard state == "closed" else { throw TcpError.alreadyOpen }
        state = "listen"
    }
    func send(_ data: Data) throws {
        guard state == "established" else { throw TcpError.notConnected }
        socket.write(data)
    }
}`,
    js: `class TcpConnection {
  state = 'closed'
  open() {
    if (this.state === 'closed') this.state = 'listen'
    else throw new Error('Already open')
  }
  send(data) {
    if (this.state !== 'established') throw new Error('Not connected')
    this.socket.write(data)
  }
}`,
    rb: `class TcpConnection
  def initialize = @state = "closed"
  def open = @state == "closed" ? @state = "listen" : raise("Already open")
  def send(data) = @state == "established" ? @socket.write(data) : raise("Not connected")
end`,
    php: `class TcpConnection {
    private string $state = 'closed';
    function open(): void {
        if ($this->state === 'closed') $this->state = 'listen';
        else throw new Exception('Already open');
    }
    function send(string $data): void {
        if ($this->state !== 'established') throw new Exception('Not connected');
        $this->socket->write($data);
    }
}`,
  }},

  // ── mediator-chatroom ────────────────────────────────────────────────────────
  { slug: 'mediator-chatroom', snippets: {
    java: `class User {
    private List<User> peers;
    void send(String msg) {
        for (User p : peers) p.receive(name, msg);
    }
}
// Adding a new user = update every existing user's peers list`,
    py: `class User:
    def __init__(self): self.peers = []
    def send(self, msg: str):
        for p in self.peers: p.receive(self.name, msg)
# Adding a new user = update every existing user's peers list`,
    go: `type User struct{ Name string; Peers []*User }
func (u *User) Send(msg string) {
    for _, p := range u.Peers { p.Receive(u.Name, msg) }
}
// Adding a new user = update every existing user's Peers slice`,
    rust: `struct User { name: String, peers: Vec<Rc<RefCell<User>>> }
impl User {
    fn send(&self, msg: &str) {
        self.peers.iter().for_each(|p| p.borrow().receive(&self.name, msg));
    }
}`,
    cs: `class User {
    List<User> Peers = new();
    void Send(string msg) { Peers.ForEach(p => p.Receive(Name, msg)); }
}
// Adding a new user = update every existing user's Peers list`,
    kotlin: `class User {
    val peers = mutableListOf<User>()
    fun send(msg: String) { peers.forEach { it.receive(name, msg) } }
}
// Adding a new user = update every existing user's peers list`,
    swift: `class User {
    var peers: [User] = []
    func send(_ msg: String) { peers.forEach { $0.receive(from: name, msg: msg) } }
}
// Adding a new user = update every existing user's peers array`,
    js: `class User {
  peers = []
  send(msg) { this.peers.forEach(p => p.receive(this.name, msg)) }
}
// Adding a new user = update every existing user's peers list`,
    rb: `class User
  def initialize = @peers = []
  def send(msg) = @peers.each { |p| p.receive(@name, msg) }
end
# Adding a new user = update every existing user's peers array`,
    php: `class User {
    private array $peers = [];
    function send(string $msg): void {
        foreach ($this->peers as $p) $p->receive($this->name, $msg);
    }
}
// Adding a new user = update every existing user's peers array`,
  }},

  // ── bridge-notify ────────────────────────────────────────────────────────────
  { slug: 'bridge-notify', snippets: {
    java: `class UrgentEmailMessage  { void send() { /* urgent + email  */ } }
class NormalEmailMessage  { void send() { /* normal + email  */ } }
class UrgentSmsMessage    { void send() { /* urgent + sms    */ } }
class NormalSmsMessage    { void send() { /* normal + sms    */ } }
class UrgentPushMessage   { void send() { /* urgent + push   */ } }
// 2 priorities × 3 channels = 6 classes; +WhatsApp = 2 more`,
    py: `class UrgentEmailMessage:  # urgent + email
    def send(self): pass
class NormalEmailMessage:  # normal + email
    def send(self): pass
class UrgentSmsMessage:    # urgent + sms
    def send(self): pass
class NormalSmsMessage:    # normal + sms
    def send(self): pass
# 2 priorities × 3 channels = 6 classes; +WhatsApp = 2 more`,
    go: `type UrgentEmailMessage  struct{}; func (u UrgentEmailMessage)  Send() { /* urgent + email  */ }
type NormalEmailMessage  struct{}; func (n NormalEmailMessage)  Send() { /* normal + email  */ }
type UrgentSmsMessage    struct{}; func (u UrgentSmsMessage)    Send() { /* urgent + sms    */ }
type NormalSmsMessage    struct{}; func (n NormalSmsMessage)    Send() { /* normal + sms    */ }
// 2 priorities × 3 channels = 6 types`,
    rust: `struct UrgentEmailMessage; impl UrgentEmailMessage { fn send(&self) { /* urgent + email */ } }
struct NormalEmailMessage; impl NormalEmailMessage { fn send(&self) { /* normal + email */ } }
struct UrgentSmsMessage;   impl UrgentSmsMessage   { fn send(&self) { /* urgent + sms   */ } }
struct NormalSmsMessage;   impl NormalSmsMessage   { fn send(&self) { /* normal + sms   */ } }
// 2 priorities × 3 channels = 6 structs`,
    cs: `class UrgentEmailMessage  { void Send() { /* urgent + email  */ } }
class NormalEmailMessage  { void Send() { /* normal + email  */ } }
class UrgentSmsMessage    { void Send() { /* urgent + sms    */ } }
class NormalSmsMessage    { void Send() { /* normal + sms    */ } }
// 2 priorities × 3 channels = 6 classes`,
    kotlin: `class UrgentEmailMessage  { fun send() { /* urgent + email  */ } }
class NormalEmailMessage  { fun send() { /* normal + email  */ } }
class UrgentSmsMessage    { fun send() { /* urgent + sms    */ } }
class NormalSmsMessage    { fun send() { /* normal + sms    */ } }
// 2 priorities × 3 channels = 6 classes; +WhatsApp = 2 more`,
    swift: `class UrgentEmailMessage  { func send() { /* urgent + email  */ } }
class NormalEmailMessage  { func send() { /* normal + email  */ } }
class UrgentSmsMessage    { func send() { /* urgent + sms    */ } }
class NormalSmsMessage    { func send() { /* normal + sms    */ } }`,
    js: `class UrgentEmailMessage  { send() { /* urgent + email  */ } }
class NormalEmailMessage  { send() { /* normal + email  */ } }
class UrgentSmsMessage    { send() { /* urgent + sms    */ } }
class NormalSmsMessage    { send() { /* normal + sms    */ } }
// 2 priorities × 3 channels = 6 classes; +WhatsApp = 2 more`,
    rb: `class UrgentEmailMessage;  def send = nil; end   # urgent + email
class NormalEmailMessage;  def send = nil; end   # normal + email
class UrgentSmsMessage;    def send = nil; end   # urgent + sms
class NormalSmsMessage;    def send = nil; end   # normal + sms
# 2 priorities × 3 channels = 6 classes`,
    php: `class UrgentEmailMessage  { function send(): void { /* urgent + email  */ } }
class NormalEmailMessage  { function send(): void { /* normal + email  */ } }
class UrgentSmsMessage    { function send(): void { /* urgent + sms    */ } }
class NormalSmsMessage    { function send(): void { /* normal + sms    */ } }
// 2 priorities × 3 channels = 6 classes`,
  }},

  // ── template-report ──────────────────────────────────────────────────────────
  { slug: 'template-report', snippets: {
    java: `class SalesReport {
    void generate() {
        List<Row> data = gatherSalesData();
        String csv = toCsv(data);  // format-specific
        emailSend(csv);             // deliver-specific
    }
}
class HrReport {
    void generate() {
        List<Row> data = gatherHrData();
        PDF pdf = PdfLib.build(data);
        slackPost(pdf);
    }
}`,
    py: `class SalesReport:
    def generate(self):
        data = self.gather_sales_data()
        csv  = to_csv(data)     # format-specific
        email_send(csv)          # deliver-specific
class HrReport:
    def generate(self):
        data = self.gather_hr_data()
        pdf  = PdfLib.build(data)
        slack_post(pdf)`,
    go: `func (s *SalesReport) Generate() {
    data := s.gatherSalesData()
    csv  := toCsv(data)    // format-specific
    emailSend(csv)          // deliver-specific
}
func (h *HrReport) Generate() {
    data := h.gatherHrData()
    pdf  := PdfLib.Build(data)
    slackPost(pdf)
}`,
    rust: `impl SalesReport {
    fn generate(&self) { let data=self.gather_sales(); let csv=to_csv(&data); email_send(&csv); }
}
impl HrReport {
    fn generate(&self) { let data=self.gather_hr(); let pdf=pdf_lib::build(&data); slack_post(&pdf); }
}
// Both share gather→format→deliver skeleton but duplicate it`,
    cs: `class SalesReport { void Generate() { var d=GatherSalesData(); var csv=ToCsv(d); EmailSend(csv); } }
class HrReport    { void Generate() { var d=GatherHrData();    var pdf=PdfLib.Build(d); SlackPost(pdf); } }
// Gather + deliver steps duplicated`,
    kotlin: `class SalesReport { fun generate() { val d=gatherSales(); val csv=toCsv(d); emailSend(csv) } }
class HrReport    { fun generate() { val d=gatherHr();    val pdf=PdfLib.build(d); slackPost(pdf) } }
// Skeleton duplicated across both`,
    swift: `class SalesReport { func generate() { let d=gatherSales(); let csv=toCsv(d); emailSend(csv) } }
class HrReport    { func generate() { let d=gatherHr();    let pdf=PdfLib.build(d); slackPost(pdf) } }
// Skeleton duplicated`,
    js: `class SalesReport { generate() { const d=this.gatherSales(); const csv=toCsv(d); emailSend(csv) } }
class HrReport    { generate() { const d=this.gatherHr();    const pdf=PdfLib.build(d); slackPost(pdf) } }
// Skeleton duplicated`,
    rb: `class SalesReport
  def generate = email_send(to_csv(gather_sales_data))
end
class HrReport
  def generate = slack_post(PdfLib.build(gather_hr_data))
end
# gather + deliver steps are duplicated`,
    php: `class SalesReport { function generate(): void { $d=$this->gatherSales(); $csv=toCsv($d); emailSend($csv); } }
class HrReport    { function generate(): void { $d=$this->gatherHr();    $pdf=PdfLib::build($d); slackPost($pdf); } }
// Skeleton duplicated across both`,
  }},
]

async function main() {
  await connectDB()
  let count = 0
  for (const { slug, snippets } of updates) {
    const existing = await DetectiveScenario.findOne({ slug })
    if (!existing) { console.log(`⚠ not found: ${slug}`); continue }
    const existingSnippets = existing.codeSnippets
      ? (typeof (existing.codeSnippets as any).toJSON === 'function'
          ? (existing.codeSnippets as any).toJSON()
          : existing.codeSnippets)
      : {}
    const merged = { ...(existingSnippets as object), ...snippets }
    await DetectiveScenario.updateOne({ slug }, { $set: { codeSnippets: merged } })
    console.log(`✓ ${slug}`)
    count++
  }
  console.log(`\ndone — updated ${count} scenarios`)
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
