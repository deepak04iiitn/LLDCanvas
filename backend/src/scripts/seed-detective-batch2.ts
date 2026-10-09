/**
 * Seed 105 Pattern Detective scenarios (batch 2) — idempotent by slug.
 * Run: npx ts-node -r dotenv/config src/scripts/seed-detective-batch2.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { DetectiveScenario } from '../models/learn/detective-scenario.model'

const SCENARIOS: object[] = [
  // ── EASY IDENTIFY (1-20) ─────────────────────────────────────────────────────
  {
    slug: 'singleton-config-b2',
    title: 'Singleton Config',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'Config has a private constructor and a static getInstance(). Multiple callers share the same instance. Which pattern?',
    answer: 'singleton',
    choices: ['singleton', 'factory', 'prototype', 'flyweight'],
    explanation: 'Private constructor + static instance + getInstance() = Singleton. It ensures exactly one Config object exists application-wide.',
    order: 100,
    status: 'published',
    codeSnippets: {
      java: `class Config {
    private static Config instance;
    private Config() {}
    public static Config getInstance() {
        if (instance == null) instance = new Config();
        return instance;
    }
    public String get(String key) { return System.getenv(key); }
}`,
      ts: `class Config {
  private static instance: Config
  private constructor() {}
  static getInstance(): Config {
    if (!Config.instance) Config.instance = new Config()
    return Config.instance
  }
  get(key: string): string | undefined { return process.env[key] }
}`,
      py: `class Config:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    def get(self, key: str) -> str:
        import os; return os.environ.get(key, '')`,
      go: `type Config struct{ data map[string]string }
var instance *Config
var once sync.Once
func GetConfig() *Config {
    once.Do(func() { instance = &Config{data: map[string]string{}} })
    return instance
}`,
      rust: `use std::sync::OnceLock;
static INSTANCE: OnceLock<Config> = OnceLock::new();
struct Config { data: HashMap<String,String> }
impl Config {
    fn get_instance() -> &'static Config {
        INSTANCE.get_or_init(|| Config { data: HashMap::new() })
    }
}`,
      cs: `class Config {
    private static Config _instance;
    private Config() {}
    public static Config GetInstance() {
        if (_instance == null) _instance = new Config();
        return _instance;
    }
    public string Get(string key) => Environment.GetEnvironmentVariable(key);
}`,
      kotlin: `object Config {
    fun get(key: String): String? = System.getenv(key)
}`,
      swift: `class Config {
    static let shared = Config()
    private init() {}
    func get(_ key: String) -> String? { ProcessInfo.processInfo.environment[key] }
}`,
      js: `class Config {
  static #instance
  constructor() { if (Config.#instance) return Config.#instance; Config.#instance = this }
  static getInstance() { return new Config() }
  get(key) { return process.env[key] }
}`,
      rb: `class Config
  @@instance = nil
  def self.instance
    @@instance ||= new
  end
  private_class_method :new
  def get(key) = ENV[key]
end`,
      php: `class Config {
    private static ?Config $instance = null;
    private function __construct() {}
    public static function getInstance(): Config {
        if (self::$instance === null) self::$instance = new Config();
        return self::$instance;
    }
    public function get(string $key): string { return getenv($key) ?: ''; }
}`,
      cpp: `class Config {
    static Config* instance;
    Config() {}
public:
    static Config* getInstance() {
        if (!instance) instance = new Config();
        return instance;
    }
    std::string get(const std::string& key) { return std::getenv(key.c_str()) ?: ""; }
};`,
    },
  },
  {
    slug: 'factory-shape-b2',
    title: 'Shape Factory',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'ShapeFactory.create("circle") returns a Circle; create("square") returns a Square. Callers never use new. Which pattern?',
    answer: 'factory',
    choices: ['factory', 'builder', 'abstract-factory', 'prototype'],
    explanation: 'A static factory method hides concrete class instantiation behind a single creation point. Callers depend only on the Shape interface.',
    order: 101,
    status: 'published',
    codeSnippets: {
      java: `interface Shape { double area(); }
class Circle implements Shape { public double area() { return Math.PI * r * r; } double r; }
class Square implements Shape { public double area() { return side * side; } double side; }

class ShapeFactory {
    public static Shape create(String type) {
        if (type.equals("circle")) return new Circle();
        if (type.equals("square")) return new Square();
        throw new IllegalArgumentException("Unknown: " + type);
    }
}`,
      ts: `interface Shape { area(): number }
class Circle implements Shape { constructor(private r: number) {} area() { return Math.PI * this.r ** 2 } }
class Square implements Shape { constructor(private s: number) {} area() { return this.s ** 2 } }
class ShapeFactory {
  static create(type: string, size: number): Shape {
    if (type === 'circle') return new Circle(size)
    if (type === 'square') return new Square(size)
    throw new Error('Unknown shape: ' + type)
  }
}`,
      py: `class ShapeFactory:
    @staticmethod
    def create(shape_type: str) -> 'Shape':
        if shape_type == 'circle': return Circle()
        if shape_type == 'square': return Square()
        raise ValueError(f'Unknown shape: {shape_type}')`,
      go: `type Shape interface { Area() float64 }
func NewShape(kind string) Shape {
    switch kind {
    case "circle": return &Circle{}
    case "square": return &Square{}
    }
    return nil
}`,
      rust: `trait Shape { fn area(&self) -> f64; }
fn create_shape(kind: &str) -> Box<dyn Shape> {
    match kind {
        "circle" => Box::new(Circle { r: 1.0 }),
        "square" => Box::new(Square { side: 1.0 }),
        _ => panic!("unknown shape"),
    }
}`,
      cs: `interface IShape { double Area(); }
class ShapeFactory {
    public static IShape Create(string type) => type switch {
        "circle" => new Circle(),
        "square" => new Square(),
        _ => throw new ArgumentException("Unknown: " + type)
    };
}`,
      kotlin: `fun createShape(type: String): Shape = when (type) {
    "circle" -> Circle()
    "square" -> Square()
    else -> throw IllegalArgumentException("Unknown: $type")
}`,
      swift: `func createShape(type: String) -> Shape {
    switch type {
    case "circle": return Circle()
    case "square": return Square()
    default: fatalError("Unknown shape")
    }
}`,
      js: `class ShapeFactory {
  static create(type, size) {
    if (type === 'circle') return new Circle(size)
    if (type === 'square') return new Square(size)
    throw new Error('Unknown: ' + type)
  }
}`,
      rb: `class ShapeFactory
  def self.create(type)
    case type
    when 'circle' then Circle.new
    when 'square' then Square.new
    else raise ArgumentError, "Unknown: #{type}"
    end
  end
end`,
      php: `class ShapeFactory {
    public static function create(string $type): Shape {
        return match($type) {
            'circle' => new Circle(),
            'square' => new Square(),
            default  => throw new InvalidArgumentException("Unknown: $type"),
        };
    }
}`,
      cpp: `Shape* ShapeFactory::create(const std::string& type) {
    if (type == "circle") return new Circle();
    if (type == "square") return new Square();
    throw std::invalid_argument("Unknown: " + type);
}`,
    },
  },
  {
    slug: 'observer-newsletter-b2',
    title: 'Newsletter Subscriber',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'Newsletter has subscribe(listener), unsubscribe(listener), and notifyAll(). Subscribers get called whenever an article is published. Which pattern?',
    answer: 'observer',
    choices: ['observer', 'mediator', 'command', 'chain'],
    explanation: 'subscribe/unsubscribe/notifyAll is the textbook Observer (Publish-Subscribe) interface. The newsletter is the subject; readers are observers.',
    order: 102,
    status: 'published',
    codeSnippets: {
      java: `interface Subscriber { void update(String article); }
class Newsletter {
    private List<Subscriber> subs = new ArrayList<>();
    public void subscribe(Subscriber s)   { subs.add(s); }
    public void unsubscribe(Subscriber s) { subs.remove(s); }
    public void publish(String article)   { subs.forEach(s -> s.update(article)); }
}`,
      ts: `type Subscriber = (article: string) => void
class Newsletter {
  private subs: Subscriber[] = []
  subscribe(s: Subscriber)   { this.subs.push(s) }
  unsubscribe(s: Subscriber) { this.subs = this.subs.filter(x => x !== s) }
  publish(article: string)   { this.subs.forEach(s => s(article)) }
}`,
      py: `class Newsletter:
    def __init__(self): self._subs = []
    def subscribe(self, fn): self._subs.append(fn)
    def unsubscribe(self, fn): self._subs.remove(fn)
    def publish(self, article: str):
        for s in self._subs: s(article)`,
      go: `type Subscriber func(article string)
type Newsletter struct { subs []Subscriber }
func (n *Newsletter) Subscribe(s Subscriber)   { n.subs = append(n.subs, s) }
func (n *Newsletter) Publish(article string)   { for _, s := range n.subs { s(article) } }`,
      rust: `type Subscriber = Box<dyn Fn(&str)>;
struct Newsletter { subs: Vec<Subscriber> }
impl Newsletter {
    fn subscribe(&mut self, s: Subscriber) { self.subs.push(s); }
    fn publish(&self, article: &str) { for s in &self.subs { s(article); } }
}`,
      cs: `class Newsletter {
    private List<Action<string>> _subs = new();
    public void Subscribe(Action<string> s)   => _subs.Add(s);
    public void Unsubscribe(Action<string> s) => _subs.Remove(s);
    public void Publish(string article)       => _subs.ForEach(s => s(article));
}`,
      kotlin: `class Newsletter {
    private val subs = mutableListOf<(String) -> Unit>()
    fun subscribe(s: (String) -> Unit)   { subs += s }
    fun unsubscribe(s: (String) -> Unit) { subs -= s }
    fun publish(article: String)         { subs.forEach { it(article) } }
}`,
      swift: `class Newsletter {
    private var subs: [(String) -> Void] = []
    func subscribe(_ s: @escaping (String) -> Void) { subs.append(s) }
    func publish(_ article: String) { subs.forEach { $0(article) } }
}`,
      js: `class Newsletter {
  #subs = []
  subscribe(s)   { this.#subs.push(s) }
  unsubscribe(s) { this.#subs = this.#subs.filter(x => x !== s) }
  publish(article) { this.#subs.forEach(s => s(article)) }
}`,
      rb: `class Newsletter
  def initialize = @subs = []
  def subscribe(fn)   = @subs << fn
  def unsubscribe(fn) = @subs.delete(fn)
  def publish(article) = @subs.each { |s| s.call(article) }
end`,
      php: `class Newsletter {
    private array $subs = [];
    public function subscribe(callable $s): void   { $this->subs[] = $s; }
    public function unsubscribe(callable $s): void { $this->subs = array_filter($this->subs, fn($x) => $x !== $s); }
    public function publish(string $article): void { foreach ($this->subs as $s) $s($article); }
}`,
      cpp: `class Newsletter {
    std::vector<std::function<void(std::string)>> subs;
public:
    void subscribe(std::function<void(std::string)> s) { subs.push_back(s); }
    void publish(const std::string& article) { for (auto& s : subs) s(article); }
};`,
    },
  },
  {
    slug: 'builder-pizza-b2',
    title: 'Pizza Builder',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'PizzaBuilder has setCrust(), setSauce(), addTopping() — all returning `this` — and a build() that returns the Pizza. Which pattern?',
    answer: 'builder',
    choices: ['builder', 'factory', 'prototype', 'decorator'],
    explanation: 'Fluent method chaining (each setter returns this) ending in build() is the classic Builder pattern for constructing complex objects step-by-step.',
    order: 103,
    status: 'published',
    codeSnippets: {
      java: `class PizzaBuilder {
    private String crust, sauce;
    private List<String> toppings = new ArrayList<>();
    public PizzaBuilder setCrust(String c) { crust = c; return this; }
    public PizzaBuilder setSauce(String s) { sauce = s; return this; }
    public PizzaBuilder addTopping(String t) { toppings.add(t); return this; }
    public Pizza build() { return new Pizza(crust, sauce, toppings); }
}
// Pizza p = new PizzaBuilder().setCrust("thin").setSauce("tomato").addTopping("cheese").build();`,
      ts: `class PizzaBuilder {
  private crust = ''; private sauce = ''; private toppings: string[] = []
  setCrust(c: string)    { this.crust = c; return this }
  setSauce(s: string)    { this.sauce = s; return this }
  addTopping(t: string)  { this.toppings.push(t); return this }
  build(): Pizza { return new Pizza(this.crust, this.sauce, this.toppings) }
}`,
      py: `class PizzaBuilder:
    def __init__(self): self.crust = self.sauce = ''; self.toppings = []
    def set_crust(self, c): self.crust = c; return self
    def set_sauce(self, s): self.sauce = s; return self
    def add_topping(self, t): self.toppings.append(t); return self
    def build(self): return Pizza(self.crust, self.sauce, self.toppings)`,
      go: `type PizzaBuilder struct { crust, sauce string; toppings []string }
func (b *PizzaBuilder) SetCrust(c string)   *PizzaBuilder { b.crust = c; return b }
func (b *PizzaBuilder) SetSauce(s string)   *PizzaBuilder { b.sauce = s; return b }
func (b *PizzaBuilder) AddTopping(t string) *PizzaBuilder { b.toppings = append(b.toppings, t); return b }
func (b *PizzaBuilder) Build() Pizza        { return Pizza{b.crust, b.sauce, b.toppings} }`,
      rust: `struct PizzaBuilder { crust: String, sauce: String, toppings: Vec<String> }
impl PizzaBuilder {
    fn set_crust(mut self, c: &str) -> Self { self.crust = c.into(); self }
    fn set_sauce(mut self, s: &str) -> Self { self.sauce = s.into(); self }
    fn add_topping(mut self, t: &str) -> Self { self.toppings.push(t.into()); self }
    fn build(self) -> Pizza { Pizza { crust: self.crust, sauce: self.sauce, toppings: self.toppings } }
}`,
      cs: `class PizzaBuilder {
    string crust, sauce; List<string> toppings = new();
    public PizzaBuilder SetCrust(string c)   { crust = c; return this; }
    public PizzaBuilder SetSauce(string s)   { sauce = s; return this; }
    public PizzaBuilder AddTopping(string t) { toppings.Add(t); return this; }
    public Pizza Build() => new Pizza(crust, sauce, toppings);
}`,
      kotlin: `class PizzaBuilder {
    private var crust = ""; private var sauce = ""; private val toppings = mutableListOf<String>()
    fun setCrust(c: String)   = apply { crust = c }
    fun setSauce(s: String)   = apply { sauce = s }
    fun addTopping(t: String) = apply { toppings += t }
    fun build() = Pizza(crust, sauce, toppings)
}`,
      swift: `class PizzaBuilder {
    var crust = ""; var sauce = ""; var toppings: [String] = []
    @discardableResult func setCrust(_ c: String)   -> Self { crust = c; return self }
    @discardableResult func setSauce(_ s: String)   -> Self { sauce = s; return self }
    @discardableResult func addTopping(_ t: String) -> Self { toppings.append(t); return self }
    func build() -> Pizza { Pizza(crust: crust, sauce: sauce, toppings: toppings) }
}`,
      js: `class PizzaBuilder {
  #crust = ''; #sauce = ''; #toppings = []
  setCrust(c)   { this.#crust = c; return this }
  setSauce(s)   { this.#sauce = s; return this }
  addTopping(t) { this.#toppings.push(t); return this }
  build()       { return new Pizza(this.#crust, this.#sauce, this.#toppings) }
}`,
      rb: `class PizzaBuilder
  def initialize = (@crust = @sauce = ''; @toppings = [])
  def set_crust(c)   = (tap { @crust = c })
  def set_sauce(s)   = (tap { @sauce = s })
  def add_topping(t) = (tap { @toppings << t })
  def build = Pizza.new(@crust, @sauce, @toppings)
end`,
      php: `class PizzaBuilder {
    private string $crust = '', $sauce = ''; private array $toppings = [];
    public function setCrust(string $c): self   { $this->crust = $c; return $this; }
    public function setSauce(string $s): self   { $this->sauce = $s; return $this; }
    public function addTopping(string $t): self { $this->toppings[] = $t; return $this; }
    public function build(): Pizza { return new Pizza($this->crust, $this->sauce, $this->toppings); }
}`,
      cpp: `class PizzaBuilder {
    std::string crust, sauce; std::vector<std::string> toppings;
public:
    PizzaBuilder& setCrust(std::string c)   { crust = c; return *this; }
    PizzaBuilder& setSauce(std::string s)   { sauce = s; return *this; }
    PizzaBuilder& addTopping(std::string t) { toppings.push_back(t); return *this; }
    Pizza build() { return Pizza{crust, sauce, toppings}; }
};`,
    },
  },
  {
    slug: 'prototype-enemy-b2',
    title: 'Game Enemy Clone',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'Enemy has a clone() method that returns a deep copy. Spawning 100 enemies calls clone() on a template rather than new Enemy(). Which pattern?',
    answer: 'prototype',
    choices: ['prototype', 'factory', 'flyweight', 'builder'],
    explanation: 'Prototype creates new objects by cloning an existing instance. clone() on a template object avoids re-running expensive construction logic.',
    order: 104,
    status: 'published',
    codeSnippets: {
      java: `interface Cloneable { Enemy clone(); }
class Enemy implements Cloneable {
    String type; int hp; int damage;
    public Enemy clone() {
        Enemy e = new Enemy();
        e.type = this.type; e.hp = this.hp; e.damage = this.damage;
        return e;
    }
}
// Spawn 100 goblins from template:
// Enemy template = new Enemy("goblin", 100, 10);
// enemies = IntStream.range(0, 100).mapToObj(i -> template.clone()).toList();`,
      ts: `class Enemy {
  constructor(public type: string, public hp: number, public damage: number) {}
  clone(): Enemy { return new Enemy(this.type, this.hp, this.damage) }
}
// const template = new Enemy('goblin', 100, 10)
// const army = Array.from({ length: 100 }, () => template.clone())`,
      py: `import copy
class Enemy:
    def __init__(self, type_: str, hp: int, damage: int):
        self.type = type_; self.hp = hp; self.damage = damage
    def clone(self) -> 'Enemy':
        return copy.deepcopy(self)`,
      go: `type Enemy struct { Type string; HP, Damage int }
func (e *Enemy) Clone() *Enemy { copy := *e; return &copy }
// template := &Enemy{"goblin", 100, 10}
// army := make([]*Enemy, 100)
// for i := range army { army[i] = template.Clone() }`,
      rust: `#[derive(Clone)]
struct Enemy { kind: String, hp: i32, damage: i32 }
// let template = Enemy { kind: "goblin".into(), hp: 100, damage: 10 };
// let army: Vec<Enemy> = (0..100).map(|_| template.clone()).collect();`,
      cs: `class Enemy : ICloneable {
    public string Type; public int Hp, Damage;
    public object Clone() => MemberwiseClone();
}
// var template = new Enemy { Type = "goblin", Hp = 100, Damage = 10 };
// var army = Enumerable.Range(0, 100).Select(_ => (Enemy)template.Clone()).ToList();`,
      kotlin: `data class Enemy(val type: String, val hp: Int, val damage: Int) {
    fun clone() = copy()
}
// val template = Enemy("goblin", 100, 10)
// val army = List(100) { template.clone() }`,
      swift: `class Enemy: NSCopying {
    var type: String; var hp: Int; var damage: Int
    init(type: String, hp: Int, damage: Int) { self.type = type; self.hp = hp; self.damage = damage }
    func copy(with zone: NSZone? = nil) -> Any { Enemy(type: type, hp: hp, damage: damage) }
}`,
      js: `class Enemy {
  constructor(type, hp, damage) { this.type = type; this.hp = hp; this.damage = damage }
  clone() { return new Enemy(this.type, this.hp, this.damage) }
}
// const template = new Enemy('goblin', 100, 10)
// const army = Array.from({ length: 100 }, () => template.clone())`,
      rb: `class Enemy
  attr_accessor :type, :hp, :damage
  def initialize(type, hp, damage) = (@type = type; @hp = hp; @damage = damage)
  def clone = self.dup
end`,
      php: `class Enemy {
    public function __construct(public string $type, public int $hp, public int $damage) {}
    public function clone(): Enemy { return clone $this; }
}`,
      cpp: `class Enemy {
public:
    std::string type; int hp, damage;
    Enemy* clone() const { return new Enemy(*this); }
};`,
    },
  },
  {
    slug: 'decorator-coffee-b2',
    title: 'Coffee Decorator',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'MilkDecorator and SugarDecorator both wrap a Beverage and delegate cost()/description() adding their own contribution. Which pattern?',
    answer: 'decorator',
    choices: ['decorator', 'composite', 'proxy', 'adapter'],
    explanation: 'Decorator wraps a component implementing the same interface, delegates to the wrapped object and adds behavior — classic Starbucks coffee example.',
    order: 105,
    status: 'published',
    codeSnippets: {
      java: `interface Beverage { double cost(); String description(); }
class Espresso implements Beverage {
    public double cost() { return 1.0; }
    public String description() { return "Espresso"; }
}
class MilkDecorator implements Beverage {
    private Beverage b;
    MilkDecorator(Beverage b) { this.b = b; }
    public double cost()        { return b.cost() + 0.25; }
    public String description() { return b.description() + ", Milk"; }
}`,
      ts: `interface Beverage { cost(): number; description(): string }
class Espresso implements Beverage { cost() { return 1.0 } description() { return 'Espresso' } }
class MilkDecorator implements Beverage {
  constructor(private b: Beverage) {}
  cost()        { return this.b.cost() + 0.25 }
  description() { return this.b.description() + ', Milk' }
}`,
      py: `class MilkDecorator:
    def __init__(self, beverage): self._b = beverage
    def cost(self) -> float:       return self._b.cost() + 0.25
    def description(self) -> str:  return self._b.description() + ', Milk'`,
      go: `type MilkDecorator struct { b Beverage }
func (d *MilkDecorator) Cost() float64        { return d.b.Cost() + 0.25 }
func (d *MilkDecorator) Description() string  { return d.b.Description() + ", Milk" }`,
      rust: `struct MilkDecorator { inner: Box<dyn Beverage> }
impl Beverage for MilkDecorator {
    fn cost(&self) -> f64        { self.inner.cost() + 0.25 }
    fn description(&self) -> String { self.inner.description() + ", Milk" }
}`,
      cs: `class MilkDecorator : IBeverage {
    private IBeverage _b;
    public MilkDecorator(IBeverage b) { _b = b; }
    public double Cost()        => _b.Cost() + 0.25;
    public string Description() => _b.Description() + ", Milk";
}`,
      kotlin: `class MilkDecorator(private val b: Beverage) : Beverage {
    override fun cost()        = b.cost() + 0.25
    override fun description() = b.description() + ", Milk"
}`,
      swift: `class MilkDecorator: Beverage {
    private let b: Beverage
    init(_ b: Beverage) { self.b = b }
    func cost() -> Double       { b.cost() + 0.25 }
    func description() -> String { b.description() + ", Milk" }
}`,
      js: `class MilkDecorator {
  constructor(b) { this.b = b }
  cost()        { return this.b.cost() + 0.25 }
  description() { return this.b.description() + ', Milk' }
}`,
      rb: `class MilkDecorator
  def initialize(b) = @b = b
  def cost        = @b.cost + 0.25
  def description = @b.description + ', Milk'
end`,
      php: `class MilkDecorator implements Beverage {
    public function __construct(private Beverage $b) {}
    public function cost(): float       { return $this->b->cost() + 0.25; }
    public function description(): string { return $this->b->description() . ', Milk'; }
}`,
      cpp: `class MilkDecorator : public Beverage {
    Beverage* b;
public:
    MilkDecorator(Beverage* b) : b(b) {}
    double cost()            override { return b->cost() + 0.25; }
    std::string description() override { return b->description() + ", Milk"; }
};`,
    },
  },
  {
    slug: 'template-beverage-b2',
    title: 'Beverage Preparation Template',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'Beverage.prepare() calls boilWater(), brew(), pourInCup(), addCondiments() in order. brew() and addCondiments() are abstract. Tea and Coffee override them. Which pattern?',
    answer: 'template-method',
    choices: ['template-method', 'strategy', 'state', 'factory'],
    explanation: 'Template Method defines a fixed algorithm skeleton in the base class; abstract "primitive operations" are overridden by subclasses to fill in the varying steps.',
    order: 106,
    status: 'published',
    codeSnippets: {
      java: `abstract class Beverage {
    final void prepare() {
        boilWater();
        brew();
        pourInCup();
        addCondiments();
    }
    void boilWater()     { System.out.println("Boiling water"); }
    void pourInCup()     { System.out.println("Pouring"); }
    abstract void brew();
    abstract void addCondiments();
}
class Tea extends Beverage {
    void brew()           { System.out.println("Steeping tea"); }
    void addCondiments()  { System.out.println("Adding lemon"); }
}`,
      ts: `abstract class Beverage {
  prepare() { this.boilWater(); this.brew(); this.pourInCup(); this.addCondiments() }
  boilWater()   { console.log('Boiling water') }
  pourInCup()   { console.log('Pouring') }
  abstract brew(): void
  abstract addCondiments(): void
}
class Tea extends Beverage {
  brew()           { console.log('Steeping tea') }
  addCondiments()  { console.log('Adding lemon') }
}`,
      py: `from abc import ABC, abstractmethod
class Beverage(ABC):
    def prepare(self):
        self.boil_water(); self.brew(); self.pour_in_cup(); self.add_condiments()
    def boil_water(self): print('Boiling')
    def pour_in_cup(self): print('Pouring')
    @abstractmethod
    def brew(self): pass
    @abstractmethod
    def add_condiments(self): pass`,
      go: `type BeverageSteps interface { Brew(); AddCondiments() }
func Prepare(b BeverageSteps) {
    fmt.Println("Boiling water")
    b.Brew()
    fmt.Println("Pouring in cup")
    b.AddCondiments()
}
type Tea struct{}
func (t *Tea) Brew()          { fmt.Println("Steeping tea") }
func (t *Tea) AddCondiments() { fmt.Println("Adding lemon") }`,
      rust: `trait Beverage {
    fn brew(&self);
    fn add_condiments(&self);
    fn prepare(&self) {
        println!("Boiling water");
        self.brew();
        println!("Pouring");
        self.add_condiments();
    }
}
struct Tea;
impl Beverage for Tea {
    fn brew(&self)          { println!("Steeping tea"); }
    fn add_condiments(&self) { println!("Adding lemon"); }
}`,
      cs: `abstract class Beverage {
    public void Prepare() { BoilWater(); Brew(); PourInCup(); AddCondiments(); }
    void BoilWater() => Console.WriteLine("Boiling");
    void PourInCup() => Console.WriteLine("Pouring");
    protected abstract void Brew();
    protected abstract void AddCondiments();
}
class Tea : Beverage {
    protected override void Brew()           => Console.WriteLine("Steeping tea");
    protected override void AddCondiments()  => Console.WriteLine("Adding lemon");
}`,
      kotlin: `abstract class Beverage {
    fun prepare() { boilWater(); brew(); pourInCup(); addCondiments() }
    private fun boilWater() = println("Boiling water")
    private fun pourInCup() = println("Pouring")
    abstract fun brew()
    abstract fun addCondiments()
}
class Tea : Beverage() {
    override fun brew()          = println("Steeping tea")
    override fun addCondiments() = println("Adding lemon")
}`,
      swift: `class Beverage {
    final func prepare() { boilWater(); brew(); pourInCup(); addCondiments() }
    func boilWater()  { print("Boiling") }
    func pourInCup()  { print("Pouring") }
    func brew()          { fatalError("override") }
    func addCondiments() { fatalError("override") }
}
class Tea: Beverage {
    override func brew()          { print("Steeping") }
    override func addCondiments() { print("Adding lemon") }
}`,
      js: `class Beverage {
  prepare() { this.boilWater(); this.brew(); this.pourInCup(); this.addCondiments() }
  boilWater() { console.log('Boiling') }
  pourInCup() { console.log('Pouring') }
  brew() { throw new Error('override') }
  addCondiments() { throw new Error('override') }
}
class Tea extends Beverage {
  brew()           { console.log('Steeping tea') }
  addCondiments()  { console.log('Adding lemon') }
}`,
      rb: `class Beverage
  def prepare = (boil_water; brew; pour_in_cup; add_condiments)
  def boil_water = puts 'Boiling'
  def pour_in_cup = puts 'Pouring'
  def brew = raise NotImplementedError
  def add_condiments = raise NotImplementedError
end
class Tea < Beverage
  def brew = puts 'Steeping tea'
  def add_condiments = puts 'Adding lemon'
end`,
      php: `abstract class Beverage {
    final public function prepare(): void {
        $this->boilWater(); $this->brew(); $this->pourInCup(); $this->addCondiments();
    }
    private function boilWater(): void { echo "Boiling\n"; }
    private function pourInCup(): void { echo "Pouring\n"; }
    abstract protected function brew(): void;
    abstract protected function addCondiments(): void;
}
class Tea extends Beverage {
    protected function brew(): void           { echo "Steeping tea\n"; }
    protected function addCondiments(): void  { echo "Adding lemon\n"; }
}`,
      cpp: `class Beverage {
public:
    void prepare() { boilWater(); brew(); pourInCup(); addCondiments(); }
    void boilWater() { std::cout << "Boiling\n"; }
    void pourInCup() { std::cout << "Pouring\n"; }
    virtual void brew() = 0;
    virtual void addCondiments() = 0;
};
class Tea : public Beverage {
    void brew()          override { std::cout << "Steeping\n"; }
    void addCondiments() override { std::cout << "Adding lemon\n"; }
};`,
    },
  },
  {
    slug: 'command-light-b2',
    title: 'Smart Home Light Command',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'TurnOnCommand and TurnOffCommand implement ICommand with execute(). A RemoteControl invokes commands without knowing what they do. Which pattern?',
    answer: 'command',
    choices: ['command', 'strategy', 'chain', 'observer'],
    explanation: 'Command encapsulates a request as an object. The invoker (RemoteControl) is decoupled from the receiver (Light). Enables queuing, logging, and undo.',
    order: 107,
    status: 'published',
    codeSnippets: {
      java: `interface ICommand { void execute(); }
class Light { public void on() {} public void off() {} }
class TurnOnCommand implements ICommand {
    private Light light;
    TurnOnCommand(Light l) { light = l; }
    public void execute() { light.on(); }
}
class RemoteControl {
    private ICommand cmd;
    public void setCommand(ICommand c) { cmd = c; }
    public void pressButton() { cmd.execute(); }
}`,
      ts: `interface ICommand { execute(): void }
class TurnOnCommand implements ICommand {
  constructor(private light: Light) {}
  execute() { this.light.on() }
}
class RemoteControl {
  private cmd!: ICommand
  setCommand(c: ICommand) { this.cmd = c }
  pressButton() { this.cmd.execute() }
}`,
      py: `class TurnOnCommand:
    def __init__(self, light): self.light = light
    def execute(self): self.light.on()
class RemoteControl:
    def set_command(self, cmd): self.cmd = cmd
    def press(self): self.cmd.execute()`,
      go: `type Command interface { Execute() }
type TurnOnCommand struct { light *Light }
func (c *TurnOnCommand) Execute() { c.light.On() }
type RemoteControl struct { cmd Command }
func (r *RemoteControl) Press() { r.cmd.Execute() }`,
      rust: `trait Command { fn execute(&self); }
struct TurnOnCommand { light: Rc<Light> }
impl Command for TurnOnCommand { fn execute(&self) { self.light.on(); } }
struct RemoteControl { cmd: Box<dyn Command> }
impl RemoteControl { fn press(&self) { self.cmd.execute(); } }`,
      cs: `interface ICommand { void Execute(); }
class TurnOnCommand : ICommand {
    Light _light;
    public TurnOnCommand(Light l) { _light = l; }
    public void Execute() => _light.On();
}
class RemoteControl {
    ICommand _cmd;
    public void SetCommand(ICommand c) => _cmd = c;
    public void PressButton() => _cmd.Execute();
}`,
      kotlin: `interface Command { fun execute() }
class TurnOnCommand(private val light: Light) : Command { override fun execute() = light.on() }
class RemoteControl {
    private lateinit var cmd: Command
    fun setCommand(c: Command) { cmd = c }
    fun press() = cmd.execute()
}`,
      swift: `protocol Command { func execute() }
class TurnOnCommand: Command { let light: Light; init(_ l: Light) { light = l }; func execute() { light.on() } }
class RemoteControl { var cmd: Command?; func press() { cmd?.execute() } }`,
      js: `class TurnOnCommand { constructor(light) { this.light = light }; execute() { this.light.on() } }
class RemoteControl { setCommand(c) { this.cmd = c }; press() { this.cmd.execute() } }`,
      rb: `class TurnOnCommand
  def initialize(light) = @light = light
  def execute = @light.on
end
class RemoteControl
  def set_command(cmd) = @cmd = cmd
  def press = @cmd.execute
end`,
      php: `interface Command { public function execute(): void; }
class TurnOnCommand implements Command {
    public function __construct(private Light $light) {}
    public function execute(): void { $this->light->on(); }
}
class RemoteControl {
    private Command $cmd;
    public function setCommand(Command $c): void { $this->cmd = $c; }
    public function press(): void { $this->cmd->execute(); }
}`,
      cpp: `struct Command { virtual void execute() = 0; };
class TurnOnCommand : public Command {
    Light* light;
public:
    TurnOnCommand(Light* l) : light(l) {}
    void execute() override { light->on(); }
};
class RemoteControl {
    Command* cmd;
public:
    void setCommand(Command* c) { cmd = c; }
    void press() { cmd->execute(); }
};`,
    },
  },
  {
    slug: 'adapter-temperature-b2',
    title: 'Celsius to Fahrenheit Adapter',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'ThermometerAdapter wraps a CelsiusSensor and implements the IFahrenheitSensor interface by converting units. Which pattern?',
    answer: 'adapter',
    choices: ['adapter', 'facade', 'decorator', 'proxy'],
    explanation: 'Adapter translates the interface of an existing class (CelsiusSensor) into the interface the client expects (IFahrenheitSensor) without modifying either.',
    order: 108,
    status: 'published',
    codeSnippets: {
      java: `interface FahrenheitSensor { double getTemperatureF(); }
class CelsiusSensor { public double getTemperatureC() { return 22.0; } }

class ThermometerAdapter implements FahrenheitSensor {
    private CelsiusSensor sensor;
    ThermometerAdapter(CelsiusSensor s) { sensor = s; }
    public double getTemperatureF() { return sensor.getTemperatureC() * 9.0/5.0 + 32; }
}`,
      ts: `interface FahrenheitSensor { getTemperatureF(): number }
class CelsiusSensor { getTemperatureC() { return 22.0 } }
class ThermometerAdapter implements FahrenheitSensor {
  constructor(private sensor: CelsiusSensor) {}
  getTemperatureF() { return this.sensor.getTemperatureC() * 9 / 5 + 32 }
}`,
      py: `class ThermometerAdapter:
    def __init__(self, sensor: CelsiusSensor): self._sensor = sensor
    def get_temperature_f(self) -> float:
        return self._sensor.get_temperature_c() * 9 / 5 + 32`,
      go: `type FahrenheitSensor interface { GetTemperatureF() float64 }
type ThermometerAdapter struct { sensor *CelsiusSensor }
func (a *ThermometerAdapter) GetTemperatureF() float64 {
    return a.sensor.GetTemperatureC()*9/5 + 32
}`,
      rust: `struct ThermometerAdapter { sensor: CelsiusSensor }
impl FahrenheitSensor for ThermometerAdapter {
    fn get_temperature_f(&self) -> f64 { self.sensor.get_temperature_c() * 9.0 / 5.0 + 32.0 }
}`,
      cs: `class ThermometerAdapter : IFahrenheitSensor {
    private CelsiusSensor _sensor;
    public ThermometerAdapter(CelsiusSensor s) { _sensor = s; }
    public double GetTemperatureF() => _sensor.GetTemperatureC() * 9.0/5.0 + 32;
}`,
      kotlin: `class ThermometerAdapter(private val sensor: CelsiusSensor) : FahrenheitSensor {
    override fun getTemperatureF() = sensor.getTemperatureC() * 9.0 / 5.0 + 32
}`,
      swift: `class ThermometerAdapter: FahrenheitSensor {
    private let sensor: CelsiusSensor
    init(_ s: CelsiusSensor) { sensor = s }
    func getTemperatureF() -> Double { sensor.getTemperatureC() * 9 / 5 + 32 }
}`,
      js: `class ThermometerAdapter {
  constructor(sensor) { this.sensor = sensor }
  getTemperatureF() { return this.sensor.getTemperatureC() * 9 / 5 + 32 }
}`,
      rb: `class ThermometerAdapter
  def initialize(sensor) = @sensor = sensor
  def get_temperature_f = @sensor.get_temperature_c * 9.0 / 5.0 + 32
end`,
      php: `class ThermometerAdapter implements FahrenheitSensor {
    public function __construct(private CelsiusSensor $sensor) {}
    public function getTemperatureF(): float { return $this->sensor->getTemperatureC() * 9 / 5 + 32; }
}`,
      cpp: `class ThermometerAdapter : public FahrenheitSensor {
    CelsiusSensor* sensor;
public:
    ThermometerAdapter(CelsiusSensor* s) : sensor(s) {}
    double getTemperatureF() override { return sensor->getTemperatureC() * 9.0/5.0 + 32; }
};`,
    },
  },
  {
    slug: 'strategy-sort-b2',
    title: 'Sorting Strategy',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'Sorter holds a ISortStrategy. Callers can set BubbleSort, QuickSort, or MergeSort at runtime and call sort(data). Which pattern?',
    answer: 'strategy',
    choices: ['strategy', 'template-method', 'command', 'bridge'],
    explanation: 'Strategy defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime via composition.',
    order: 109,
    status: 'published',
    codeSnippets: {
      java: `interface SortStrategy { void sort(int[] data); }
class QuickSort  implements SortStrategy { public void sort(int[] d) { /* quicksort */ } }
class BubbleSort implements SortStrategy { public void sort(int[] d) { /* bubble */ } }

class Sorter {
    private SortStrategy strategy;
    public void setStrategy(SortStrategy s) { strategy = s; }
    public void sort(int[] data) { strategy.sort(data); }
}`,
      ts: `type SortFn = (data: number[]) => void
class Sorter {
  private strategy!: SortFn
  setStrategy(fn: SortFn) { this.strategy = fn }
  sort(data: number[]) { this.strategy(data) }
}
const quickSort: SortFn = d => { /* quicksort */ }`,
      py: `from typing import Callable
class Sorter:
    def __init__(self): self.strategy: Callable = None
    def set_strategy(self, fn): self.strategy = fn
    def sort(self, data: list): self.strategy(data)`,
      go: `type SortStrategy func([]int)
type Sorter struct { strategy SortStrategy }
func (s *Sorter) SetStrategy(fn SortStrategy) { s.strategy = fn }
func (s *Sorter) Sort(data []int)             { s.strategy(data) }`,
      rust: `struct Sorter { strategy: Box<dyn Fn(&mut Vec<i32>)> }
impl Sorter {
    fn set_strategy(&mut self, s: Box<dyn Fn(&mut Vec<i32>)>) { self.strategy = s; }
    fn sort(&self, data: &mut Vec<i32>) { (self.strategy)(data); }
}`,
      cs: `class Sorter {
    private Action<int[]> _strategy;
    public void SetStrategy(Action<int[]> s) => _strategy = s;
    public void Sort(int[] data) => _strategy(data);
}`,
      kotlin: `class Sorter {
    var strategy: ((IntArray) -> Unit)? = null
    fun sort(data: IntArray) = strategy?.invoke(data)
}`,
      swift: `class Sorter {
    var strategy: (([Int]) -> [Int])?
    func sort(_ data: [Int]) -> [Int] { strategy?(data) ?? data }
}`,
      js: `class Sorter {
  setStrategy(fn) { this.strategy = fn }
  sort(data) { return this.strategy(data) }
}`,
      rb: `class Sorter
  def set_strategy(fn) = @strategy = fn
  def sort(data) = @strategy.call(data)
end`,
      php: `class Sorter {
    private $strategy;
    public function setStrategy(callable $s): void { $this->strategy = $s; }
    public function sort(array $data): array { return ($this->strategy)($data); }
}`,
      cpp: `class Sorter {
    std::function<void(std::vector<int>&)> strategy;
public:
    void setStrategy(std::function<void(std::vector<int>&)> s) { strategy = s; }
    void sort(std::vector<int>& data) { strategy(data); }
};`,
    },
  },
  {
    slug: 'facade-home-theater-b2',
    title: 'Home Theater Facade',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'HomeTheaterFacade.watchMovie() calls amplifier.on(), projector.wideScreen(), dvdPlayer.play() etc. Clients call one method instead of six. Which pattern?',
    answer: 'facade',
    choices: ['facade', 'mediator', 'adapter', 'proxy'],
    explanation: 'Facade provides a simple interface to a complex subsystem. watchMovie() orchestrates the subsystem without exposing its complexity to callers.',
    order: 110,
    status: 'published',
    codeSnippets: {
      java: `class HomeTheaterFacade {
    private Amplifier amp; private Projector proj; private DvdPlayer dvd;
    HomeTheaterFacade(Amplifier a, Projector p, DvdPlayer d) { amp=a; proj=p; dvd=d; }
    public void watchMovie(String movie) {
        amp.on(); amp.setVolume(10);
        proj.on(); proj.wideScreenMode();
        dvd.on(); dvd.play(movie);
    }
    public void endMovie() { dvd.stop(); proj.off(); amp.off(); }
}`,
      ts: `class HomeTheaterFacade {
  constructor(private amp: Amplifier, private proj: Projector, private dvd: DvdPlayer) {}
  watchMovie(movie: string) {
    this.amp.on(); this.amp.setVolume(10)
    this.proj.on(); this.proj.wideScreenMode()
    this.dvd.on(); this.dvd.play(movie)
  }
  endMovie() { this.dvd.stop(); this.proj.off(); this.amp.off() }
}`,
      py: `class HomeTheaterFacade:
    def __init__(self, amp, proj, dvd): self.amp=amp; self.proj=proj; self.dvd=dvd
    def watch_movie(self, movie: str):
        self.amp.on(); self.amp.set_volume(10)
        self.proj.on(); self.proj.wide_screen()
        self.dvd.on(); self.dvd.play(movie)`,
      go: `type HomeTheaterFacade struct { amp *Amplifier; proj *Projector; dvd *DvdPlayer }
func (f *HomeTheaterFacade) WatchMovie(movie string) {
    f.amp.On(); f.amp.SetVolume(10)
    f.proj.On(); f.proj.WideScreen()
    f.dvd.On(); f.dvd.Play(movie)
}`,
      rust: `struct HomeTheaterFacade { amp: Amplifier, proj: Projector, dvd: DvdPlayer }
impl HomeTheaterFacade {
    fn watch_movie(&self, movie: &str) {
        self.amp.on(); self.proj.wide_screen(); self.dvd.play(movie);
    }
}`,
      cs: `class HomeTheaterFacade {
    Amplifier amp; Projector proj; DvdPlayer dvd;
    public HomeTheaterFacade(Amplifier a, Projector p, DvdPlayer d) { amp=a; proj=p; dvd=d; }
    public void WatchMovie(string movie) {
        amp.On(); proj.WideScreen(); dvd.On(); dvd.Play(movie);
    }
}`,
      kotlin: `class HomeTheaterFacade(private val amp: Amplifier, private val proj: Projector, private val dvd: DvdPlayer) {
    fun watchMovie(movie: String) { amp.on(); proj.wideScreen(); dvd.on(); dvd.play(movie) }
    fun endMovie() { dvd.stop(); proj.off(); amp.off() }
}`,
      swift: `class HomeTheaterFacade {
    let amp: Amplifier; let proj: Projector; let dvd: DvdPlayer
    func watchMovie(_ movie: String) { amp.on(); proj.wideScreen(); dvd.play(movie) }
}`,
      js: `class HomeTheaterFacade {
  constructor(amp, proj, dvd) { this.amp=amp; this.proj=proj; this.dvd=dvd }
  watchMovie(movie) { this.amp.on(); this.proj.wideScreen(); this.dvd.play(movie) }
}`,
      rb: `class HomeTheaterFacade
  def initialize(amp, proj, dvd) = (@amp=amp; @proj=proj; @dvd=dvd)
  def watch_movie(movie) = (@amp.on; @proj.wide_screen; @dvd.play(movie))
end`,
      php: `class HomeTheaterFacade {
    public function __construct(private Amplifier $amp, private Projector $proj, private DvdPlayer $dvd) {}
    public function watchMovie(string $movie): void {
        $this->amp->on(); $this->proj->wideScreen(); $this->dvd->play($movie);
    }
}`,
      cpp: `class HomeTheaterFacade {
    Amplifier* amp; Projector* proj; DvdPlayer* dvd;
public:
    HomeTheaterFacade(Amplifier* a, Projector* p, DvdPlayer* d) : amp(a), proj(p), dvd(d) {}
    void watchMovie(const std::string& movie) {
        amp->on(); proj->wideScreen(); dvd->play(movie);
    }
};`,
    },
  },
  {
    slug: 'proxy-bank-b2',
    title: 'Bank Account Access Proxy',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'BankAccountProxy checks the user\'s role before delegating deposit() or withdraw() to the real BankAccount. Which pattern?',
    answer: 'proxy',
    choices: ['proxy', 'decorator', 'facade', 'adapter'],
    explanation: 'Protection Proxy controls access to the real subject. It implements the same interface and adds a permission check before delegating.',
    order: 111,
    status: 'published',
    codeSnippets: {
      java: `interface IBankAccount { void deposit(double amt); void withdraw(double amt); }
class RealBankAccount implements IBankAccount {
    public void deposit(double a)  { /* add funds */ }
    public void withdraw(double a) { /* deduct funds */ }
}
class BankAccountProxy implements IBankAccount {
    private RealBankAccount real; private String role;
    BankAccountProxy(RealBankAccount r, String role) { real=r; this.role=role; }
    public void deposit(double a)  { real.deposit(a); }
    public void withdraw(double a) {
        if (!role.equals("OWNER")) throw new SecurityException("Denied");
        real.withdraw(a);
    }
}`,
      ts: `class BankAccountProxy implements IBankAccount {
  constructor(private real: RealBankAccount, private role: string) {}
  deposit(amt: number)  { this.real.deposit(amt) }
  withdraw(amt: number) {
    if (this.role !== 'OWNER') throw new Error('Access denied')
    this.real.withdraw(amt)
  }
}`,
      py: `class BankAccountProxy:
    def __init__(self, real, role): self._real = real; self._role = role
    def deposit(self, amt): self._real.deposit(amt)
    def withdraw(self, amt):
        if self._role != 'OWNER': raise PermissionError('Denied')
        self._real.withdraw(amt)`,
      go: `type BankAccountProxy struct { real *RealBankAccount; role string }
func (p *BankAccountProxy) Deposit(amt float64)  { p.real.Deposit(amt) }
func (p *BankAccountProxy) Withdraw(amt float64) {
    if p.role != "OWNER" { panic("Access denied") }
    p.real.Withdraw(amt)
}`,
      rust: `struct BankAccountProxy { real: RealBankAccount, role: String }
impl BankAccount for BankAccountProxy {
    fn deposit(&mut self, amt: f64)  { self.real.deposit(amt); }
    fn withdraw(&mut self, amt: f64) {
        if self.role != "OWNER" { panic!("Access denied"); }
        self.real.withdraw(amt);
    }
}`,
      cs: `class BankAccountProxy : IBankAccount {
    private RealBankAccount _real; private string _role;
    public BankAccountProxy(RealBankAccount r, string role) { _real=r; _role=role; }
    public void Deposit(double amt)  => _real.Deposit(amt);
    public void Withdraw(double amt) {
        if (_role != "OWNER") throw new UnauthorizedAccessException();
        _real.Withdraw(amt);
    }
}`,
      kotlin: `class BankAccountProxy(private val real: RealBankAccount, private val role: String) : IBankAccount {
    override fun deposit(amt: Double)  = real.deposit(amt)
    override fun withdraw(amt: Double) {
        if (role != "OWNER") throw SecurityException("Denied")
        real.withdraw(amt)
    }
}`,
      swift: `class BankAccountProxy: BankAccount {
    private let real: RealBankAccount; private let role: String
    init(real: RealBankAccount, role: String) { self.real = real; self.role = role }
    func deposit(_ amt: Double)  { real.deposit(amt) }
    func withdraw(_ amt: Double) {
        guard role == "OWNER" else { fatalError("Denied") }
        real.withdraw(amt)
    }
}`,
      js: `class BankAccountProxy {
  constructor(real, role) { this.real = real; this.role = role }
  deposit(amt)  { this.real.deposit(amt) }
  withdraw(amt) {
    if (this.role !== 'OWNER') throw new Error('Denied')
    this.real.withdraw(amt)
  }
}`,
      rb: `class BankAccountProxy
  def initialize(real, role) = (@real = real; @role = role)
  def deposit(amt) = @real.deposit(amt)
  def withdraw(amt)
    raise 'Denied' unless @role == 'OWNER'
    @real.withdraw(amt)
  end
end`,
      php: `class BankAccountProxy implements IBankAccount {
    public function __construct(private RealBankAccount $real, private string $role) {}
    public function deposit(float $amt): void  { $this->real->deposit($amt); }
    public function withdraw(float $amt): void {
        if ($this->role !== 'OWNER') throw new RuntimeException('Denied');
        $this->real->withdraw($amt);
    }
}`,
      cpp: `class BankAccountProxy : public IBankAccount {
    RealBankAccount* real; std::string role;
public:
    BankAccountProxy(RealBankAccount* r, std::string role) : real(r), role(role) {}
    void deposit(double amt)  override { real->deposit(amt); }
    void withdraw(double amt) override {
        if (role != "OWNER") throw std::runtime_error("Denied");
        real->withdraw(amt);
    }
};`,
    },
  },
  {
    slug: 'chain-discount-b2',
    title: 'Discount Chain',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'LoyaltyDiscount, SeasonalDiscount, and BulkDiscount each implement IDiscountHandler with a handle(order) method and a nextHandler reference. They pass the order down the chain. Which pattern?',
    answer: 'chain',
    choices: ['chain', 'strategy', 'decorator', 'command'],
    explanation: 'Chain of Responsibility passes a request through a sequence of handlers, each deciding to process it or forward it to the next.',
    order: 112,
    status: 'published',
    codeSnippets: {
      java: `abstract class DiscountHandler {
    protected DiscountHandler next;
    public void setNext(DiscountHandler h) { next = h; }
    public abstract double handle(Order order);
}
class LoyaltyDiscount extends DiscountHandler {
    public double handle(Order order) {
        double d = order.isLoyal() ? 0.10 : 0;
        return d + (next != null ? next.handle(order) : 0);
    }
}`,
      ts: `abstract class DiscountHandler {
  next?: DiscountHandler
  setNext(h: DiscountHandler) { this.next = h }
  abstract handle(order: Order): number
}
class LoyaltyDiscount extends DiscountHandler {
  handle(order: Order): number {
    const d = order.isLoyal ? 0.10 : 0
    return d + (this.next?.handle(order) ?? 0)
  }
}`,
      py: `class DiscountHandler:
    def __init__(self): self.next = None
    def set_next(self, h): self.next = h; return h
    def handle(self, order): return self.next.handle(order) if self.next else 0.0
class LoyaltyDiscount(DiscountHandler):
    def handle(self, order):
        d = 0.10 if order.is_loyal else 0.0
        return d + super().handle(order)`,
      go: `type DiscountHandler interface { Handle(order *Order) float64 }
type LoyaltyDiscount struct { next DiscountHandler }
func (l *LoyaltyDiscount) Handle(order *Order) float64 {
    d := 0.0
    if order.IsLoyal { d = 0.10 }
    if l.next != nil { d += l.next.Handle(order) }
    return d
}`,
      rust: `trait DiscountHandler { fn handle(&self, order: &Order) -> f64; }
struct LoyaltyDiscount { next: Option<Box<dyn DiscountHandler>> }
impl DiscountHandler for LoyaltyDiscount {
    fn handle(&self, order: &Order) -> f64 {
        let d = if order.is_loyal { 0.10 } else { 0.0 };
        d + self.next.as_ref().map_or(0.0, |n| n.handle(order))
    }
}`,
      cs: `abstract class DiscountHandler {
    protected DiscountHandler Next;
    public void SetNext(DiscountHandler h) => Next = h;
    public abstract double Handle(Order order);
}
class LoyaltyDiscount : DiscountHandler {
    public override double Handle(Order order) {
        var d = order.IsLoyal ? 0.10 : 0;
        return d + (Next?.Handle(order) ?? 0);
    }
}`,
      kotlin: `abstract class DiscountHandler {
    var next: DiscountHandler? = null
    abstract fun handle(order: Order): Double
}
class LoyaltyDiscount : DiscountHandler() {
    override fun handle(order: Order): Double {
        val d = if (order.isLoyal) 0.10 else 0.0
        return d + (next?.handle(order) ?: 0.0)
    }
}`,
      swift: `class LoyaltyDiscount {
    var next: DiscountHandler?
    func handle(order: Order) -> Double {
        let d = order.isLoyal ? 0.10 : 0
        return d + (next?.handle(order: order) ?? 0)
    }
}`,
      js: `class LoyaltyDiscount {
  setNext(h) { this.next = h; return h }
  handle(order) {
    const d = order.isLoyal ? 0.10 : 0
    return d + (this.next?.handle(order) ?? 0)
  }
}`,
      rb: `class LoyaltyDiscount
  attr_writer :next_handler
  def handle(order)
    d = order.loyal? ? 0.10 : 0.0
    d + (@next_handler&.handle(order) || 0.0)
  end
end`,
      php: `abstract class DiscountHandler {
    protected ?DiscountHandler $next = null;
    public function setNext(DiscountHandler $h): void { $this->next = $h; }
    abstract public function handle(Order $order): float;
}
class LoyaltyDiscount extends DiscountHandler {
    public function handle(Order $order): float {
        $d = $order->isLoyal() ? 0.10 : 0.0;
        return $d + ($this->next ? $this->next->handle($order) : 0.0);
    }
}`,
      cpp: `class LoyaltyDiscount : public DiscountHandler {
public:
    double handle(const Order& order) override {
        double d = order.isLoyal ? 0.10 : 0.0;
        return d + (next ? next->handle(order) : 0.0);
    }
};`,
    },
  },
  {
    slug: 'state-traffic-b2',
    title: 'Traffic Light State Machine',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'TrafficLight holds a currentState. RedState, YellowState, GreenState each implement IState with change(). Each state decides what the next state is. Which pattern?',
    answer: 'state',
    choices: ['state', 'strategy', 'chain', 'command'],
    explanation: 'State pattern: the context (TrafficLight) delegates behavior to the current state object, which handles transitions internally.',
    order: 113,
    status: 'published',
    codeSnippets: {
      java: `interface IState { void change(TrafficLight light); String color(); }
class RedState implements IState {
    public void change(TrafficLight l) { l.setState(new GreenState()); }
    public String color() { return "RED"; }
}
class TrafficLight {
    private IState state = new RedState();
    public void setState(IState s) { state = s; }
    public void change() { state.change(this); }
    public String show() { return state.color(); }
}`,
      ts: `interface IState { change(light: TrafficLight): void; color(): string }
class RedState implements IState {
  change(l: TrafficLight) { l.setState(new GreenState()) }
  color() { return 'RED' }
}
class TrafficLight {
  private state: IState = new RedState()
  setState(s: IState) { this.state = s }
  change() { this.state.change(this) }
}`,
      py: `class TrafficLight:
    def __init__(self): self.state = RedState()
    def set_state(self, s): self.state = s
    def change(self): self.state.change(self)
class RedState:
    def change(self, light): light.set_state(GreenState())
    def color(self): return 'RED'`,
      go: `type State interface { Change(l *TrafficLight); Color() string }
type RedState struct{}
func (r *RedState) Change(l *TrafficLight) { l.State = &GreenState{} }
func (r *RedState) Color() string          { return "RED" }
type TrafficLight struct { State State }
func (l *TrafficLight) Change() { l.State.Change(l) }`,
      rust: `trait State { fn change(&self) -> Box<dyn State>; fn color(&self) -> &str; }
struct RedState;
impl State for RedState {
    fn change(&self) -> Box<dyn State> { Box::new(GreenState) }
    fn color(&self) -> &str { "RED" }
}`,
      cs: `interface IState { void Change(TrafficLight l); string Color(); }
class RedState : IState {
    public void Change(TrafficLight l) => l.SetState(new GreenState());
    public string Color() => "RED";
}
class TrafficLight {
    private IState _state = new RedState();
    public void SetState(IState s) => _state = s;
    public void Change() => _state.Change(this);
}`,
      kotlin: `interface TrafficState { fun change(light: TrafficLight); fun color(): String }
class RedState : TrafficState {
    override fun change(light: TrafficLight) = light.setState(GreenState())
    override fun color() = "RED"
}
class TrafficLight {
    var state: TrafficState = RedState()
    fun setState(s: TrafficState) { state = s }
    fun change() = state.change(this)
}`,
      swift: `class TrafficLight {
    var state: TrafficState = RedState()
    func change() { state.change(self) }
}
class RedState: TrafficState {
    func change(_ light: TrafficLight) { light.state = GreenState() }
    func color() -> String { "RED" }
}`,
      js: `class TrafficLight {
  state = new RedState()
  setState(s) { this.state = s }
  change() { this.state.change(this) }
}
class RedState {
  change(l) { l.setState(new GreenState()) }
  color() { return 'RED' }
}`,
      rb: `class TrafficLight
  def initialize = @state = RedState.new
  def set_state(s) = @state = s
  def change = @state.change(self)
  def color = @state.color
end
class RedState
  def change(light) = light.set_state(GreenState.new)
  def color = 'RED'
end`,
      php: `class TrafficLight {
    private TrafficState $state;
    public function __construct() { $this->state = new RedState(); }
    public function setState(TrafficState $s): void { $this->state = $s; }
    public function change(): void { $this->state->change($this); }
}
class RedState implements TrafficState {
    public function change(TrafficLight $l): void { $l->setState(new GreenState()); }
    public function color(): string { return 'RED'; }
}`,
      cpp: `class TrafficLight {
    IState* state;
public:
    TrafficLight() : state(new RedState()) {}
    void setState(IState* s) { delete state; state = s; }
    void change() { state->change(this); }
};
class RedState : public IState {
    void change(TrafficLight* l) override;
    std::string color() override { return "RED"; }
};`,
    },
  },
  {
    slug: 'flyweight-character-b2',
    title: 'Text Editor Character Flyweight',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'A text editor stores thousands of Character objects. GlyphFactory returns shared Glyph instances for each letter, sharing font/size data. Positions are passed at draw time. Which pattern?',
    answer: 'flyweight',
    choices: ['flyweight', 'prototype', 'singleton', 'factory'],
    explanation: 'Flyweight shares intrinsic state (glyph, font, size) across many objects. Extrinsic state (position) is passed by the caller. GlyphFactory is the flyweight pool.',
    order: 114,
    status: 'published',
    codeSnippets: {
      java: `class Glyph {
    private final char symbol; private final String font; private final int size;
    Glyph(char s, String f, int sz) { symbol=s; font=f; size=sz; }
    void draw(int x, int y) { /* render at (x,y) */ }
}
class GlyphFactory {
    private Map<String,Glyph> pool = new HashMap<>();
    Glyph get(char c, String font, int size) {
        String key = c + font + size;
        return pool.computeIfAbsent(key, k -> new Glyph(c, font, size));
    }
}`,
      ts: `class Glyph {
  constructor(readonly symbol: string, readonly font: string, readonly size: number) {}
  draw(x: number, y: number) { /* render */ }
}
class GlyphFactory {
  private pool = new Map<string, Glyph>()
  get(sym: string, font: string, size: number): Glyph {
    const key = sym + font + size
    if (!this.pool.has(key)) this.pool.set(key, new Glyph(sym, font, size))
    return this.pool.get(key)!
  }
}`,
      py: `class Glyph:
    def __init__(self, symbol, font, size): self.symbol=symbol; self.font=font; self.size=size
    def draw(self, x, y): pass  # render at position
class GlyphFactory:
    def __init__(self): self._pool = {}
    def get(self, symbol, font, size):
        key = (symbol, font, size)
        if key not in self._pool: self._pool[key] = Glyph(symbol, font, size)
        return self._pool[key]`,
      go: `type Glyph struct { Symbol rune; Font string; Size int }
func (g *Glyph) Draw(x, y int) {}
type GlyphFactory struct { pool map[string]*Glyph }
func (f *GlyphFactory) Get(sym rune, font string, size int) *Glyph {
    key := fmt.Sprintf("%c%s%d", sym, font, size)
    if _, ok := f.pool[key]; !ok { f.pool[key] = &Glyph{sym, font, size} }
    return f.pool[key]
}`,
      rust: `struct Glyph { symbol: char, font: String, size: u32 }
struct GlyphFactory { pool: HashMap<String, Glyph> }
impl GlyphFactory {
    fn get(&mut self, sym: char, font: &str, size: u32) -> &Glyph {
        let key = format!("{}{}{}", sym, font, size);
        self.pool.entry(key).or_insert(Glyph { symbol: sym, font: font.into(), size })
    }
}`,
      cs: `class Glyph { public char Symbol; public string Font; public int Size; public void Draw(int x, int y) {} }
class GlyphFactory {
    Dictionary<string,Glyph> pool = new();
    public Glyph Get(char c, string font, int size) {
        var key = $"{c}{font}{size}";
        if (!pool.ContainsKey(key)) pool[key] = new Glyph {Symbol=c, Font=font, Size=size};
        return pool[key];
    }
}`,
      kotlin: `data class Glyph(val symbol: Char, val font: String, val size: Int) { fun draw(x: Int, y: Int) {} }
class GlyphFactory {
    private val pool = mutableMapOf<String, Glyph>()
    fun get(sym: Char, font: String, size: Int) =
        pool.getOrPut("$sym$font$size") { Glyph(sym, font, size) }
}`,
      swift: `class GlyphFactory {
    private var pool = [String: Glyph]()
    func get(symbol: Character, font: String, size: Int) -> Glyph {
        let key = "\(symbol)\(font)\(size)"
        if pool[key] == nil { pool[key] = Glyph(symbol: symbol, font: font, size: size) }
        return pool[key]!
    }
}`,
      js: `class GlyphFactory {
  #pool = new Map()
  get(sym, font, size) {
    const key = sym + font + size
    if (!this.#pool.has(key)) this.#pool.set(key, { sym, font, size, draw(x,y){} })
    return this.#pool.get(key)
  }
}`,
      rb: `class GlyphFactory
  def initialize = @pool = {}
  def get(sym, font, size)
    key = "#{sym}#{font}#{size}"
    @pool[key] ||= Glyph.new(sym, font, size)
  end
end`,
      php: `class GlyphFactory {
    private array $pool = [];
    public function get(string $sym, string $font, int $size): Glyph {
        $key = $sym.$font.$size;
        return $this->pool[$key] ??= new Glyph($sym, $font, $size);
    }
}`,
      cpp: `class GlyphFactory {
    std::unordered_map<std::string, Glyph*> pool;
public:
    Glyph* get(char sym, const std::string& font, int size) {
        std::string key = std::string(1,sym) + font + std::to_string(size);
        if (!pool.count(key)) pool[key] = new Glyph(sym, font, size);
        return pool[key];
    }
};`,
    },
  },
  {
    slug: 'memento-calculator-b2',
    title: 'Calculator Undo (Memento)',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'Calculator saves its state before each operation into a stack of Memento objects. An undo() call pops and restores the previous state. Which pattern?',
    answer: 'memento',
    choices: ['memento', 'command', 'state', 'prototype'],
    explanation: 'Memento captures and externalises an object\'s internal state so it can be restored later, without violating encapsulation.',
    order: 115,
    status: 'published',
    codeSnippets: {
      java: `class CalculatorMemento { final double value; CalculatorMemento(double v) { value = v; } }
class Calculator {
    private double value = 0;
    private Deque<CalculatorMemento> history = new ArrayDeque<>();
    public void add(double n) { history.push(new CalculatorMemento(value)); value += n; }
    public void undo() { if (!history.isEmpty()) value = history.pop().value; }
    public double get() { return value; }
}`,
      ts: `class Calculator {
  private value = 0
  private history: number[] = []
  add(n: number)  { this.history.push(this.value); this.value += n }
  undo()          { if (this.history.length) this.value = this.history.pop()! }
  get result()    { return this.value }
}`,
      py: `class Calculator:
    def __init__(self): self.value = 0.0; self.history = []
    def add(self, n: float):
        self.history.append(self.value)
        self.value += n
    def undo(self):
        if self.history: self.value = self.history.pop()`,
      go: `type Calculator struct { value float64; history []float64 }
func (c *Calculator) Add(n float64) { c.history = append(c.history, c.value); c.value += n }
func (c *Calculator) Undo()         {
    if n := len(c.history); n > 0 { c.value = c.history[n-1]; c.history = c.history[:n-1] }
}`,
      rust: `struct Calculator { value: f64, history: Vec<f64> }
impl Calculator {
    fn add(&mut self, n: f64)  { self.history.push(self.value); self.value += n; }
    fn undo(&mut self)         { if let Some(v) = self.history.pop() { self.value = v; } }
}`,
      cs: `class Calculator {
    double _value; Stack<double> _history = new();
    public void Add(double n)  { _history.Push(_value); _value += n; }
    public void Undo()         { if (_history.Count > 0) _value = _history.Pop(); }
    public double Result       => _value;
}`,
      kotlin: `class Calculator {
    private var value = 0.0
    private val history = ArrayDeque<Double>()
    fun add(n: Double)  { history.addLast(value); value += n }
    fun undo()          { if (history.isNotEmpty()) value = history.removeLast() }
    val result get()    = value
}`,
      swift: `class Calculator {
    private var value = 0.0
    private var history: [Double] = []
    func add(_ n: Double)  { history.append(value); value += n }
    func undo()            { if let v = history.popLast() { value = v } }
    var result: Double     { value }
}`,
      js: `class Calculator {
  #value = 0; #history = []
  add(n)    { this.#history.push(this.#value); this.#value += n }
  undo()    { if (this.#history.length) this.#value = this.#history.pop() }
  get result() { return this.#value }
}`,
      rb: `class Calculator
  def initialize = (@value = 0.0; @history = [])
  def add(n)  = (@history << @value; @value += n)
  def undo    = (@value = @history.pop if @history.any?)
  attr_reader :result
end`,
      php: `class Calculator {
    private float $value = 0; private array $history = [];
    public function add(float $n): void  { $this->history[] = $this->value; $this->value += $n; }
    public function undo(): void         { if ($this->history) $this->value = array_pop($this->history); }
    public function getResult(): float   { return $this->value; }
}`,
      cpp: `class Calculator {
    double value = 0; std::stack<double> history;
public:
    void add(double n)  { history.push(value); value += n; }
    void undo()         { if (!history.empty()) { value = history.top(); history.pop(); } }
    double result() const { return value; }
};`,
    },
  },
  {
    slug: 'visitor-shape-b2',
    title: 'Shape Area Visitor',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'Circle and Square each have an accept(IVisitor) method. AreaVisitor implements visitCircle() and visitSquare(). Adding a PerimeterVisitor requires zero changes to shapes. Which pattern?',
    answer: 'visitor',
    choices: ['visitor', 'strategy', 'decorator', 'command'],
    explanation: 'Visitor lets you add operations to an object structure without modifying the classes. Double dispatch via accept(visitor) + visit(this) selects the right overload.',
    order: 116,
    status: 'published',
    codeSnippets: {
      java: `interface Visitor { double visitCircle(Circle c); double visitSquare(Square s); }
interface Shape  { double accept(Visitor v); }
class Circle implements Shape {
    double radius;
    public double accept(Visitor v) { return v.visitCircle(this); }
}
class AreaVisitor implements Visitor {
    public double visitCircle(Circle c) { return Math.PI * c.radius * c.radius; }
    public double visitSquare(Square s) { return s.side * s.side; }
}`,
      ts: `interface Visitor { visitCircle(c: Circle): number; visitSquare(s: Square): number }
class Circle { constructor(public radius: number) {}; accept(v: Visitor) { return v.visitCircle(this) } }
class AreaVisitor implements Visitor {
  visitCircle(c: Circle) { return Math.PI * c.radius ** 2 }
  visitSquare(s: Square) { return s.side ** 2 }
}`,
      py: `class AreaVisitor:
    def visit_circle(self, c) -> float: return 3.14159 * c.radius ** 2
    def visit_square(self, s) -> float: return s.side ** 2
class Circle:
    def __init__(self, r): self.radius = r
    def accept(self, visitor): return visitor.visit_circle(self)`,
      go: `type Visitor interface { VisitCircle(*Circle) float64; VisitSquare(*Square) float64 }
type Circle struct { Radius float64 }
func (c *Circle) Accept(v Visitor) float64 { return v.VisitCircle(c) }
type AreaVisitor struct{}
func (a *AreaVisitor) VisitCircle(c *Circle) float64 { return math.Pi * c.Radius * c.Radius }
func (a *AreaVisitor) VisitSquare(s *Square) float64 { return s.Side * s.Side }`,
      rust: `trait Visitor { fn visit_circle(&self, c: &Circle) -> f64; fn visit_square(&self, s: &Square) -> f64; }
struct AreaVisitor;
impl Visitor for AreaVisitor {
    fn visit_circle(&self, c: &Circle) -> f64 { std::f64::consts::PI * c.radius * c.radius }
    fn visit_square(&self, s: &Square) -> f64 { s.side * s.side }
}`,
      cs: `interface IVisitor { double VisitCircle(Circle c); double VisitSquare(Square s); }
class AreaVisitor : IVisitor {
    public double VisitCircle(Circle c) => Math.PI * c.Radius * c.Radius;
    public double VisitSquare(Square s) => s.Side * s.Side;
}`,
      kotlin: `interface Visitor { fun visitCircle(c: Circle): Double; fun visitSquare(s: Square): Double }
class AreaVisitor : Visitor {
    override fun visitCircle(c: Circle) = Math.PI * c.radius * c.radius
    override fun visitSquare(s: Square) = s.side * s.side
}`,
      swift: `protocol Visitor { func visitCircle(_ c: Circle) -> Double; func visitSquare(_ s: Square) -> Double }
class AreaVisitor: Visitor {
    func visitCircle(_ c: Circle) -> Double { Double.pi * c.radius * c.radius }
    func visitSquare(_ s: Square) -> Double { s.side * s.side }
}`,
      js: `class AreaVisitor {
  visitCircle(c) { return Math.PI * c.radius ** 2 }
  visitSquare(s) { return s.side ** 2 }
}
class Circle { constructor(r) { this.radius = r }; accept(v) { return v.visitCircle(this) } }`,
      rb: `class AreaVisitor
  def visit_circle(c) = Math::PI * c.radius ** 2
  def visit_square(s) = s.side ** 2
end
class Circle
  attr_reader :radius
  def initialize(r) = @radius = r
  def accept(v) = v.visit_circle(self)
end`,
      php: `interface Visitor { public function visitCircle(Circle $c): float; public function visitSquare(Square $s): float; }
class AreaVisitor implements Visitor {
    public function visitCircle(Circle $c): float { return M_PI * $c->radius ** 2; }
    public function visitSquare(Square $s): float { return $s->side ** 2; }
}`,
      cpp: `struct Visitor { virtual double visitCircle(Circle& c) = 0; virtual double visitSquare(Square& s) = 0; };
struct AreaVisitor : Visitor {
    double visitCircle(Circle& c) override { return M_PI * c.radius * c.radius; }
    double visitSquare(Square& s) override { return s.side * s.side; }
};`,
    },
  },
  {
    slug: 'iterator-playlist-b2',
    title: 'Playlist Iterator',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'Playlist provides createIterator() returning an IIterator with hasNext() and next(). Client code loops through songs without knowing the internal list structure. Which pattern?',
    answer: 'iterator',
    choices: ['iterator', 'composite', 'chain', 'visitor'],
    explanation: 'Iterator provides sequential access to elements of a collection without exposing its representation. Playlist is the aggregate; PlaylistIterator is the iterator.',
    order: 117,
    status: 'published',
    codeSnippets: {
      java: `interface Iterator<T> { boolean hasNext(); T next(); }
class Playlist {
    private List<String> songs = new ArrayList<>();
    public void add(String song) { songs.add(song); }
    public Iterator<String> createIterator() {
        return new Iterator<>() {
            int i = 0;
            public boolean hasNext() { return i < songs.size(); }
            public String next()     { return songs.get(i++); }
        };
    }
}`,
      ts: `class Playlist implements Iterable<string> {
  private songs: string[] = []
  add(song: string) { this.songs.push(song) }
  [Symbol.iterator]() {
    let i = 0; const songs = this.songs
    return { hasNext: () => i < songs.length, next: () => songs[i++] }
  }
}`,
      py: `class Playlist:
    def __init__(self): self._songs = []
    def add(self, song): self._songs.append(song)
    def __iter__(self): return iter(self._songs)`,
      go: `type PlaylistIterator struct { songs []string; i int }
func (it *PlaylistIterator) HasNext() bool  { return it.i < len(it.songs) }
func (it *PlaylistIterator) Next() string   { s := it.songs[it.i]; it.i++; return s }
type Playlist struct { songs []string }
func (p *Playlist) CreateIterator() *PlaylistIterator { return &PlaylistIterator{songs: p.songs} }`,
      rust: `struct Playlist { songs: Vec<String> }
impl Playlist { fn iter(&self) -> impl Iterator<Item=&String> { self.songs.iter() } }`,
      cs: `class Playlist : IEnumerable<string> {
    List<string> songs = new();
    public void Add(string s) => songs.Add(s);
    public IEnumerator<string> GetEnumerator() => songs.GetEnumerator();
    IEnumerator IEnumerable.GetEnumerator()    => GetEnumerator();
}`,
      kotlin: `class Playlist : Iterable<String> {
    private val songs = mutableListOf<String>()
    fun add(song: String) { songs += song }
    override fun iterator(): Iterator<String> = songs.iterator()
}`,
      swift: `struct Playlist: Sequence {
    var songs: [String] = []
    func makeIterator() -> IndexingIterator<[String]> { songs.makeIterator() }
}`,
      js: `class Playlist {
  #songs = []
  add(s) { this.#songs.push(s) }
  [Symbol.iterator]() { return this.#songs[Symbol.iterator]() }
}`,
      rb: `class Playlist
  include Enumerable
  def initialize = @songs = []
  def add(s) = @songs << s
  def each(&block) = @songs.each(&block)
end`,
      php: `class Playlist implements Iterator {
    private array $songs = []; private int $i = 0;
    public function add(string $s): void { $this->songs[] = $s; }
    public function current(): string  { return $this->songs[$this->i]; }
    public function key(): int         { return $this->i; }
    public function next(): void       { $this->i++; }
    public function rewind(): void     { $this->i = 0; }
    public function valid(): bool      { return $this->i < count($this->songs); }
}`,
      cpp: `class Playlist {
    std::vector<std::string> songs;
public:
    void add(std::string s) { songs.push_back(s); }
    auto begin() { return songs.begin(); }
    auto end()   { return songs.end(); }
};`,
    },
  },
  {
    slug: 'null-object-logger-b2',
    title: 'Null Logger (Null Object)',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'NullLogger implements ILogger but its log() method does nothing. Services accept an ILogger in the constructor, defaulting to NullLogger, so callers never null-check. Which pattern?',
    answer: 'strategy',
    choices: ['strategy', 'decorator', 'proxy', 'singleton'],
    explanation: 'Null Object is a special case of Strategy: the NullLogger is an interchangeable strategy with no-op behavior, eliminating null checks throughout the codebase.',
    order: 118,
    status: 'published',
    codeSnippets: {
      java: `interface ILogger { void log(String msg); }
class ConsoleLogger implements ILogger { public void log(String m) { System.out.println(m); } }
class NullLogger    implements ILogger { public void log(String m) { /* do nothing */ } }

class OrderService {
    private final ILogger logger;
    OrderService(ILogger logger) { this.logger = logger; }
    OrderService() { this(new NullLogger()); }
    void process(Order o) { logger.log("Processing " + o.id); /* ... */ }
}`,
      ts: `interface ILogger { log(msg: string): void }
class NullLogger implements ILogger { log(_: string) {} }
class ConsoleLogger implements ILogger { log(msg: string) { console.log(msg) } }
class OrderService {
  constructor(private logger: ILogger = new NullLogger()) {}
  process(order: Order) { this.logger.log('Processing ' + order.id) }
}`,
      py: `class NullLogger:
    def log(self, msg: str): pass
class ConsoleLogger:
    def log(self, msg: str): print(msg)
class OrderService:
    def __init__(self, logger=None): self.logger = logger or NullLogger()
    def process(self, order): self.logger.log(f'Processing {order.id}')`,
      go: `type Logger interface { Log(msg string) }
type NullLogger struct{}
func (n *NullLogger) Log(msg string) {}
type OrderService struct { logger Logger }
func NewOrderService(l Logger) *OrderService {
    if l == nil { l = &NullLogger{} }
    return &OrderService{logger: l}
}`,
      rust: `trait Logger { fn log(&self, msg: &str); }
struct NullLogger;
impl Logger for NullLogger { fn log(&self, _msg: &str) {} }
struct OrderService { logger: Box<dyn Logger> }
impl OrderService {
    fn new(logger: Box<dyn Logger>) -> Self { OrderService { logger } }
    fn process(&self, id: &str) { self.logger.log(&format!("Processing {}", id)); }
}`,
      cs: `interface ILogger { void Log(string msg); }
class NullLogger    : ILogger { public void Log(string _) {} }
class ConsoleLogger : ILogger { public void Log(string m) => Console.WriteLine(m); }
class OrderService {
    readonly ILogger _logger;
    public OrderService(ILogger? logger = null) { _logger = logger ?? new NullLogger(); }
    public void Process(Order o) { _logger.Log($"Processing {o.Id}"); }
}`,
      kotlin: `interface Logger { fun log(msg: String) }
class NullLogger : Logger { override fun log(msg: String) {} }
class OrderService(private val logger: Logger = NullLogger()) {
    fun process(order: Order) { logger.log("Processing \${order.id}") }
}`,
      swift: `protocol Logger { func log(_ msg: String) }
class NullLogger: Logger { func log(_ msg: String) {} }
class OrderService {
    private let logger: Logger
    init(logger: Logger = NullLogger()) { self.logger = logger }
    func process(_ order: Order) { logger.log("Processing \(order.id)") }
}`,
      js: `class NullLogger    { log(_) {} }
class ConsoleLogger { log(msg) { console.log(msg) } }
class OrderService {
  constructor(logger = new NullLogger()) { this.logger = logger }
  process(order) { this.logger.log('Processing ' + order.id) }
}`,
      rb: `class NullLogger; def log(msg) = nil; end
class OrderService
  def initialize(logger = NullLogger.new) = @logger = logger
  def process(order) = @logger.log("Processing #{order.id}")
end`,
      php: `interface Logger { public function log(string $msg): void; }
class NullLogger    implements Logger { public function log(string $msg): void {} }
class OrderService {
    public function __construct(private Logger $logger = new NullLogger()) {}
    public function process(Order $o): void { $this->logger->log("Processing {$o->id}"); }
}`,
      cpp: `struct Logger { virtual void log(const std::string&) = 0; };
struct NullLogger : Logger { void log(const std::string&) override {} };
class OrderService {
    std::unique_ptr<Logger> logger;
public:
    OrderService(std::unique_ptr<Logger> l = std::make_unique<NullLogger>()) : logger(std::move(l)) {}
    void process(const Order& o) { logger->log("Processing " + o.id); }
};`,
    },
  },

  // ── EASY DETECT (21-28) ──────────────────────────────────────────────────────
  {
    slug: 'detect-dto-none-b2',
    title: 'Pure DTO — No Pattern',
    mode: 'detect',
    difficulty: 'easy',
    stem: 'This code is a plain data-transfer object. Does it implement a recognizable GoF design pattern?',
    answer: 'none',
    choices: ['none', 'value-object', 'builder', 'prototype'],
    explanation: 'A plain data-transfer class with no behavior, construction logic, or sharing mechanism is just a DTO — not a GoF pattern. Beware of over-identifying patterns where none exist.',
    order: 119,
    status: 'published',
    codeSnippets: {
      java: `class UserDTO {
    public String name;
    public String email;
    public int age;
    // Pure data bag: no behavior, no pattern
}`,
      ts: `interface UserDTO {
  name: string
  email: string
  age: number
  // Pure data shape — no pattern
}`,
      py: `from dataclasses import dataclass
@dataclass
class UserDTO:
    name: str
    email: str
    age: int
    # Pure data class — no behavior, no pattern`,
      go: `type UserDTO struct {
    Name  string
    Email string
    Age   int
    // Plain data struct — no pattern
}`,
      rust: `struct UserDTO {
    name: String,
    email: String,
    age: u32,
    // Plain data struct — no pattern
}`,
      cs: `record UserDTO(string Name, string Email, int Age);
// Pure data record — no GoF pattern`,
      kotlin: `data class UserDTO(val name: String, val email: String, val age: Int)
// Kotlin data class — no GoF pattern`,
      swift: `struct UserDTO {
    let name: String
    let email: String
    let age: Int
    // Plain value type — no pattern
}`,
      js: `const user = { name: 'Alice', email: 'a@b.com', age: 30 }
// Plain object literal — no pattern`,
      rb: `UserDTO = Data.define(:name, :email, :age)
# Plain data class — no pattern`,
      php: `class UserDTO {
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly int $age,
    ) {}
    // Pure data — no pattern
}`,
      cpp: `struct UserDTO {
    std::string name;
    std::string email;
    int age;
    // Plain POD struct — no pattern
};`,
    },
  },
  {
    slug: 'detect-magic-number-b2',
    title: 'Magic Numbers Anti-Pattern',
    mode: 'detect',
    difficulty: 'easy',
    stem: 'The code uses unexplained numeric and string literals scattered through logic. Is this a recognised GoF design pattern?',
    answer: 'none',
    choices: ['none', 'strategy', 'state', 'template-method'],
    explanation: 'Magic numbers and strings are an anti-pattern, not a GoF design pattern. The fix is to extract named constants or enums — not to apply a structural pattern.',
    order: 120,
    status: 'published',
    codeSnippets: {
      java: `class Shipping {
    double calculate(double weight) {
        if (weight < 0.5)  return 2.99;
        if (weight < 2.0)  return 5.99;
        if (weight < 10.0) return 12.99;
        return 24.99;
        // 0.5, 2.0, 10.0, 2.99 — unexplained magic numbers
    }
}`,
      ts: `function getDiscount(tier: string): number {
  if (tier === 'GOLD')     return 0.20   // magic: what is 0.20?
  if (tier === 'SILVER')   return 0.10
  if (tier === 'BRONZE')   return 0.05
  return 0
}`,
      py: `def calc_tax(income: float) -> float:
    if income < 250000: return income * 0.05
    if income < 500000: return income * 0.20
    return income * 0.30
    # 250000, 500000, 0.05, 0.20, 0.30 — unexplained magic numbers`,
      go: `func penalty(score int) int {
    if score < 50  { return 10 }  // magic numbers
    if score < 75  { return 5  }
    return 0
}`,
      rust: `fn grade(score: u32) -> &'static str {
    if score >= 90 { "A" }
    else if score >= 80 { "B" }
    else if score >= 70 { "C" }
    else { "F" }
    // 90, 80, 70 are magic numbers
}`,
      cs: `double GetPremium(string plan) => plan switch {
    "basic"    => 9.99,
    "standard" => 19.99,
    "premium"  => 49.99,
    _ => 0     // magic prices — no named constants
};`,
      kotlin: `fun retryDelay(attempt: Int): Long = when {
    attempt < 3  -> 1000L   // magic: 1000ms?
    attempt < 6  -> 5000L
    else         -> 30000L
}`,
      swift: `func timeout(for priority: Int) -> Double {
    if priority > 8 { return 5.0 }
    if priority > 4 { return 15.0 }
    return 60.0   // magic numbers
}`,
      js: `function rateLimit(requests) {
  if (requests > 1000) return 'throttle'
  if (requests > 500)  return 'warn'
  return 'ok'   // 1000 and 500 are unexplained magic numbers
}`,
      rb: `def shipping_cost(kg)
  return 2.5  if kg < 1
  return 7.0  if kg < 5
  12.5        # unexplained magic literals
end`,
      php: `function calcInterest(float $amount): float {
    if ($amount < 10000) return $amount * 0.03;
    if ($amount < 50000) return $amount * 0.05;
    return $amount * 0.08;  // magic numbers
}`,
      cpp: `double fee(int days) {
    if (days <= 7)  return 0;
    if (days <= 30) return 15.0;
    return 50.0;  // magic numbers — no named constants
}`,
    },
  },
  {
    slug: 'detect-singleton-mutable-b2',
    title: 'Mutable Singleton Anti-Pattern',
    mode: 'detect',
    difficulty: 'easy',
    stem: 'The code creates a Singleton but stores mutable, request-scoped data on it. Is applying Singleton here correct?',
    answer: 'none',
    choices: ['none', 'singleton', 'flyweight', 'prototype'],
    explanation: 'Singleton is misused here. Storing mutable, request-specific state on a shared Singleton causes race conditions in concurrent environments. This is an anti-pattern, not a correct Singleton.',
    order: 121,
    status: 'published',
    codeSnippets: {
      java: `class RequestContext {
    private static RequestContext instance = new RequestContext();
    public String currentUserId;    // DANGER: mutable, per-request state
    public Map<String,Object> data = new HashMap<>();
    private RequestContext() {}
    public static RequestContext getInstance() { return instance; }
    // Bug: all threads share the same userId and data!
}`,
      ts: `class RequestContext {
  private static instance = new RequestContext()
  currentUserId = ''          // shared mutable state — thread-unsafe!
  data: Record<string, unknown> = {}
  static getInstance() { return RequestContext.instance }
}`,
      py: `class RequestContext:
    _instance = None
    current_user_id: str = ''   # shared mutable — not per-request!
    data: dict = {}             # all threads share this dict

    @classmethod
    def get_instance(cls):
        if cls._instance is None: cls._instance = cls()
        return cls._instance`,
      go: `// Anti-pattern: mutable singleton for per-request data
var ctx = &RequestContext{}
type RequestContext struct {
    CurrentUserID string          // shared across goroutines!
    Data          map[string]any  // race condition
}`,
      rust: `// Anti-pattern: global mutable state
static CONTEXT: Mutex<RequestContext> = Mutex::new(RequestContext { user_id: String::new() });
struct RequestContext { user_id: String }  // forces serialization of all requests`,
      cs: `class RequestContext {
    private static RequestContext _instance = new();
    public string CurrentUserId = "";    // Bug: shared across all HTTP requests!
    public Dictionary<string,object> Data = new();
    public static RequestContext Instance => _instance;
}`,
      kotlin: `object RequestContext {
    var currentUserId: String = ""      // shared state — not per-request!
    val data: MutableMap<String,Any> = mutableMapOf()
    // Bug: all coroutines see the same mutable state
}`,
      swift: `class RequestContext {
    static let shared = RequestContext()
    var currentUserId: String = ""      // mutable singleton — dangerous
    var data: [String: Any] = [:]
}`,
      js: `const requestContext = {
  currentUserId: '',         // shared across all requests in Node.js!
  data: {},
}
// Bug: all concurrent requests share the same object`,
      rb: `class RequestContext
  @@instance = new
  def self.instance = @@instance
  attr_accessor :current_user_id, :data   # mutable shared state — not safe!
  def initialize = (@data = {})
end`,
      php: `class RequestContext {
    private static ?self $instance = null;
    public string $userId = '';           // PHP is per-request, so this is OK here
    public static function getInstance(): self {
        return self::$instance ??= new self();
    }
    // In PHP this is acceptable, but in other languages it creates bugs
}`,
      cpp: `class RequestContext {
    static RequestContext* instance;
public:
    std::string currentUserId;   // DANGER in multi-threaded server!
    std::map<std::string, std::string> data;
    static RequestContext* getInstance() {
        if (!instance) instance = new RequestContext();
        return instance;
    }
};`,
    },
  },
  {
    slug: 'detect-static-helper-b2',
    title: 'Static Utility Class — Not a Pattern',
    mode: 'detect',
    difficulty: 'easy',
    stem: 'A class with only static methods and no state. Is this a GoF design pattern?',
    answer: 'none',
    choices: ['none', 'singleton', 'facade', 'strategy'],
    explanation: 'A static utility/helper class is not a GoF pattern — it is a common procedural idiom. It should not be confused with Singleton (which manages a single instance) or Facade (which provides a simplified interface to a complex subsystem).',
    order: 122,
    status: 'published',
    codeSnippets: {
      java: `// Not a GoF pattern — pure static utility class
final class StringUtils {
    private StringUtils() {} // prevent instantiation
    public static String toSnakeCase(String s) { return s.replaceAll("([A-Z])", "_$1").toLowerCase(); }
    public static boolean isPalindrome(String s) { return s.equals(new StringBuilder(s).reverse().toString()); }
    public static String truncate(String s, int max) { return s.length() > max ? s.substring(0, max) + "..." : s; }
}`,
      ts: `// Pure static helper — not a GoF pattern
class StringUtils {
  static toSnakeCase(s: string): string { return s.replace(/([A-Z])/g, '_$1').toLowerCase() }
  static isPalindrome(s: string): boolean { return s === s.split('').reverse().join('') }
  static truncate(s: string, max: number): string { return s.length > max ? s.slice(0, max) + '...' : s }
}`,
      py: `# Module-level functions — not a GoF pattern
def to_snake_case(s: str) -> str:
    return ''.join('_'+c.lower() if c.isupper() else c for c in s).lstrip('_')
def is_palindrome(s: str) -> bool:
    return s == s[::-1]
def truncate(s: str, max_len: int) -> str:
    return s[:max_len] + '...' if len(s) > max_len else s`,
      go: `// Package-level functions — idiomatic Go, not a pattern
func ToSnakeCase(s string) string { /* regex replace */ return s }
func IsPalindrome(s string) bool  { return s == Reverse(s) }
func Truncate(s string, max int) string {
    if len(s) > max { return s[:max] + "..." }
    return s
}`,
      rust: `// Free functions in a module — not a pattern
pub fn to_snake_case(s: &str) -> String { /* convert */ s.to_lowercase() }
pub fn is_palindrome(s: &str) -> bool   { s == s.chars().rev().collect::<String>() }
pub fn truncate(s: &str, max: usize) -> String {
    if s.len() > max { format!("{}...", &s[..max]) } else { s.to_string() }
}`,
      cs: `// Static helper class — common C# idiom, not a GoF pattern
public static class StringUtils {
    public static string ToSnakeCase(string s)     => /* regex */ s;
    public static bool   IsPalindrome(string s)    => s == new string(s.Reverse().ToArray());
    public static string Truncate(string s, int n) => s.Length > n ? s[..n] + "..." : s;
}`,
      kotlin: `// Top-level extension functions — not a GoF pattern
fun String.toSnakeCase() = replace(Regex("([A-Z])"), "_$1").lowercase()
fun String.isPalindrome() = this == this.reversed()
fun String.truncate(max: Int) = if (length > max) take(max) + "..." else this`,
      swift: `// Extension methods — not a GoF pattern
extension String {
    func toSnakeCase() -> String { /* regex */ self }
    var isPalindrome: Bool { self == String(self.reversed()) }
    func truncate(_ max: Int) -> String { count > max ? String(prefix(max)) + "..." : self }
}`,
      js: `// Module utility functions — not a GoF pattern
export const toSnakeCase  = s => s.replace(/([A-Z])/g, '_$1').toLowerCase()
export const isPalindrome = s => s === s.split('').reverse().join('')
export const truncate     = (s, max) => s.length > max ? s.slice(0,max) + '...' : s`,
      rb: `# Module mixin — not a GoF pattern
module StringUtils
  def to_snake_case = gsub(/([A-Z])/) { "_#{$1}" }.downcase
  def palindrome?   = self == reverse
  def truncate(n)   = length > n ? "#{self[0,n]}..." : self
end`,
      php: `// PHP helper class — not a GoF pattern
final class StringUtils {
    private function __construct() {}
    public static function toSnakeCase(string $s): string { return strtolower(preg_replace('/([A-Z])/', '_$1', $s)); }
    public static function isPalindrome(string $s): bool  { return $s === strrev($s); }
    public static function truncate(string $s, int $n): string { return strlen($s) > $n ? substr($s, 0, $n).'...' : $s; }
}`,
      cpp: `// Namespace of free functions — not a GoF pattern
namespace StringUtils {
    std::string toSnakeCase(const std::string& s);
    bool isPalindrome(const std::string& s) { return s == std::string(s.rbegin(), s.rend()); }
    std::string truncate(const std::string& s, size_t n) { return s.size()>n ? s.substr(0,n)+"..." : s; }
}`,
    },
  },
  {
    slug: 'detect-spurious-factory-b2',
    title: 'Factory Doing Business Logic',
    mode: 'detect',
    difficulty: 'easy',
    stem: 'This "factory" creates an object but also charges the user and sends an email inside the same method. Is this a correct Factory pattern usage?',
    answer: 'none',
    choices: ['none', 'factory', 'facade', 'command'],
    explanation: 'A factory should only create objects. Mixing business logic (charging, emailing) inside the factory violates SRP. This is an anti-pattern, not a correct Factory.',
    order: 123,
    status: 'published',
    codeSnippets: {
      java: `class OrderFactory {
    static Order create(User user, Cart cart) {
        Order o = new Order(user, cart);  // creation — OK
        // Below is NOT factory responsibility:
        PaymentService.charge(user, cart.total());
        EmailService.sendConfirmation(user.email(), o.id());
        Analytics.track("order_created", o.id());
        return o;
    }
}`,
      ts: `class OrderFactory {
  static create(user: User, cart: Cart): Order {
    const order = new Order(user, cart)  // OK — creation
    // WRONG: side effects in a factory
    PaymentService.charge(user, cart.total)
    EmailService.sendConfirmation(user.email, order.id)
    return order
  }
}`,
      py: `class OrderFactory:
    @staticmethod
    def create(user, cart) -> Order:
        order = Order(user, cart)   # creation — fine
        # WRONG: factories should not do this:
        payment_service.charge(user, cart.total)
        email_service.send_confirmation(user.email, order.id)
        return order`,
      go: `func CreateOrder(user User, cart Cart) *Order {
    order := &Order{User: user, Cart: cart}  // creation — OK
    // WRONG: side effects in a factory function
    PaymentService.Charge(user, cart.Total)
    EmailService.Send(user.Email, order.ID)
    return order
}`,
      rust: `fn create_order(user: User, cart: Cart) -> Order {
    let order = Order { user: user.clone(), cart: cart.clone() }; // OK
    // WRONG: side effects in a creation function
    charge_payment(&user, cart.total);
    send_email(&user.email, &order.id);
    order
}`,
      cs: `class OrderFactory {
    public static Order Create(User user, Cart cart) {
        var order = new Order(user, cart);  // OK
        // WRONG: business logic in a factory
        PaymentService.Charge(user, cart.Total);
        EmailService.Send(user.Email, order.Id);
        return order;
    }
}`,
      kotlin: `object OrderFactory {
    fun create(user: User, cart: Cart): Order {
        val order = Order(user, cart)   // OK
        // WRONG: factories should not do this
        PaymentService.charge(user, cart.total)
        EmailService.sendConfirmation(user.email, order.id)
        return order
    }
}`,
      swift: `class OrderFactory {
    static func create(user: User, cart: Cart) -> Order {
        let order = Order(user: user, cart: cart)   // OK
        // WRONG: side effects inside a factory
        PaymentService.charge(user, cart.total)
        EmailService.send(user.email, order.id)
        return order
    }
}`,
      js: `class OrderFactory {
  static create(user, cart) {
    const order = new Order(user, cart)   // OK
    // WRONG: factories should only construct
    PaymentService.charge(user, cart.total)
    EmailService.send(user.email, order.id)
    return order
  }
}`,
      rb: `class OrderFactory
  def self.create(user, cart)
    order = Order.new(user, cart)   # OK
    # WRONG: factories should not do this
    PaymentService.charge(user, cart.total)
    EmailService.send(user.email, order.id)
    order
  end
end`,
      php: `class OrderFactory {
    public static function create(User $user, Cart $cart): Order {
        $order = new Order($user, $cart);   // OK
        // WRONG: business logic in a factory
        PaymentService::charge($user, $cart->total());
        EmailService::send($user->email(), $order->id());
        return $order;
    }
}`,
      cpp: `class OrderFactory {
public:
    static Order* create(const User& user, const Cart& cart) {
        auto* order = new Order(user, cart);   // OK
        // WRONG: side effects inside factory
        PaymentService::charge(user, cart.total());
        EmailService::send(user.email(), order->id());
        return order;
    }
};`,
    },
  },
  {
    slug: 'detect-observer-accumulate-b2',
    title: 'Observer Never Unsubscribed',
    mode: 'detect',
    difficulty: 'easy',
    stem: 'Every button click subscribes a new listener but never removes old ones. The list grows forever. Is this Observer used correctly?',
    answer: 'none',
    choices: ['none', 'observer', 'command', 'iterator'],
    explanation: 'This is an Observer memory-leak anti-pattern. Each click adds a listener without removing the previous one. Listeners accumulate indefinitely — they should be unsubscribed when no longer needed.',
    order: 124,
    status: 'published',
    codeSnippets: {
      java: `class Dashboard {
    private Button saveBtn;
    void show() {
        // Bug: adds a NEW listener on every show() call — never removed!
        saveBtn.addClickListener(e -> {
            saveData();
        });
    }
    // After 100 show()/hide() cycles: 100 listeners on one button
}`,
      ts: `class Dashboard {
  private button = document.getElementById('save')!
  show() {
    // Bug: new handler added each time show() is called
    this.button.addEventListener('click', () => {
      this.saveData()
    })
    // Should store the reference and removeEventListener on hide()
  }
}`,
      py: `class Dashboard:
    def show(self):
        # Bug: lambda creates a new object each call — can't unsubscribe!
        self.save_btn.on_click(lambda: self.save_data())
        # Correct: store handler ref and remove it on close`,
      go: `func (d *Dashboard) Show() {
    // Bug: new handler registered on every Show() call
    d.saveBtn.OnClick(func() { d.saveData() })
    // Never deregistered — accumulates handlers
}`,
      rust: `impl Dashboard {
    fn show(&mut self) {
        // Bug: closure registered each call, never removed
        self.save_btn.on_click(|| self.save_data());
        // Listeners pile up across multiple show() calls
    }
}`,
      cs: `class Dashboard {
    void Show() {
        // Bug: += without -= causes handler accumulation
        saveButton.Click += (s, e) => SaveData();
        // Should store handler and -= on close
    }
}`,
      kotlin: `class Dashboard {
    fun show() {
        // Bug: new lambda added each time show() is called
        saveButton.setOnClickListener { saveData() }
        // setOnClickListener replaces in Android, but addClickListener would pile up
    }
}`,
      swift: `class Dashboard {
    func show() {
        // Bug: new observation added each show() call
        NotificationCenter.default.addObserver(self, selector: #selector(save), name: .save, object: nil)
        // Never removed in deinit or hide()
    }
}`,
      js: `class Dashboard {
  show() {
    // Bug: new listener registered every time show() is called
    this.saveBtn.addEventListener('click', () => this.saveData())
    // No removeEventListener — listeners pile up
  }
}`,
      rb: `class Dashboard
  def show
    # Bug: new proc added each call — no cleanup
    @save_btn.on_click { save_data }
  end
end`,
      php: `class Dashboard {
    public function show(): void {
        // Bug: callback registered on every show() call
        $this->saveButton->onClick(fn() => $this->saveData());
        // Never unregistered — memory leak
    }
}`,
      cpp: `class Dashboard {
public:
    void show() {
        // Bug: lambda pushed each call — never erased
        saveBtn->onClick.push_back([this]() { saveData(); });
        // After N calls: N identical handlers fire on every click
    }
};`,
    },
  },
  {
    slug: 'detect-overloaded-constructor-b2',
    title: 'Constructor with Too Many Parameters',
    mode: 'detect',
    difficulty: 'easy',
    stem: 'A class constructor takes 8 parameters, most optional. Is this a correct use of the Builder pattern?',
    answer: 'none',
    choices: ['none', 'builder', 'factory', 'prototype'],
    explanation: 'A constructor with many optional parameters (telescoping constructor) is the problem Builder solves — but this IS the problem, not the solution. The code needs a Builder, it does not have one.',
    order: 125,
    status: 'published',
    codeSnippets: {
      java: `// Anti-pattern: telescoping constructor — NEEDS Builder, does NOT have one
class HttpRequest {
    HttpRequest(String url, String method, Map<String,String> headers,
                String body, int timeout, boolean followRedirects,
                String auth, SSLContext ssl) { /* ... */ }
}
// Callers: new HttpRequest(url, "GET", null, null, 30, true, null, null)
// Impossible to read which null is which`,
      ts: `// Anti-pattern: too many constructor params — no Builder in sight
class HttpRequest {
  constructor(
    url: string, method: string, headers?: Record<string,string>,
    body?: string, timeout?: number, followRedirects?: boolean,
    auth?: string
  ) {}
}
// Usage: new HttpRequest(url, 'GET', undefined, undefined, 30, true, undefined)`,
      py: `# Anti-pattern: too many positional params
class HttpRequest:
    def __init__(self, url, method='GET', headers=None, body=None,
                 timeout=30, follow_redirects=True, auth=None, ssl=None):
        pass
# Caller must remember order: HttpRequest(url,'GET',None,None,30,True,None,None)`,
      go: `// Anti-pattern: function with too many params
func NewHttpRequest(url, method string, headers map[string]string,
    body string, timeout int, followRedirects bool, auth string) *HttpRequest {
    return &HttpRequest{ /* ... */ }
}
// Use functional options or a builder struct instead`,
      rust: `// Anti-pattern: struct literal with many fields
let req = HttpRequest {
    url: "https://api.example.com".into(),
    method: Method::GET,
    headers: None, body: None, timeout: 30,
    follow_redirects: true, auth: None, ssl: None,
    // Still readable in Rust struct syntax, but error-prone for optional fields
};`,
      cs: `// Anti-pattern: too many constructor params
class HttpRequest {
    public HttpRequest(string url, string method = "GET",
        Dictionary<string,string>? headers = null, string? body = null,
        int timeout = 30, bool followRedirects = true, string? auth = null) {}
}
// Caller: new HttpRequest(url, "GET", null, null, 60, false, null) — confusing`,
      kotlin: `// Kotlin named params help, but 8+ is still too many for one constructor
class HttpRequest(
    val url: String, val method: String = "GET",
    val headers: Map<String, String>? = null, val body: String? = null,
    val timeout: Int = 30, val followRedirects: Boolean = true,
    val auth: String? = null, val sslContext: Any? = null
)`,
      swift: `// Swift labeled params help, but this is still a telescoping constructor
class HttpRequest {
    init(url: String, method: String = "GET", headers: [String:String]? = nil,
         body: String? = nil, timeout: Int = 30, followRedirects: Bool = true,
         auth: String? = nil) {}
}`,
      js: `// Anti-pattern: positional params — impossible to read
class HttpRequest {
  constructor(url, method, headers, body, timeout, followRedirects, auth) {}
}
// new HttpRequest(url, 'GET', null, null, 30, true, null)  // which null is which?`,
      rb: `# Ruby: use keyword args or a builder — not positional params
class HttpRequest
  def initialize(url, method = 'GET', headers: nil, body: nil,
                 timeout: 30, follow_redirects: true, auth: nil)
  end
end`,
      php: `class HttpRequest {
    public function __construct(
        private string $url,
        private string $method = 'GET',
        private ?array $headers = null,
        private ?string $body = null,
        private int $timeout = 30,
        private bool $followRedirects = true,
        private ?string $auth = null,
        // 8 params — this screams for a Builder
    ) {}
}`,
      cpp: `// Anti-pattern: too many constructor params
class HttpRequest {
public:
    HttpRequest(std::string url, std::string method = "GET",
                std::map<std::string,std::string> headers = {},
                std::string body = "", int timeout = 30,
                bool followRedirects = true, std::string auth = "") {}
    // Caller must remember param order — error-prone
};`,
    },
  },

  // ── EASY EXPLAIN (29-35) ─────────────────────────────────────────────────────
  {
    slug: 'explain-singleton-db-b2',
    title: 'Why Singleton for DB Connection Pool?',
    mode: 'explain',
    difficulty: 'easy',
    stem: 'A database connection pool is created once and shared across the entire application. Why is Singleton the right choice here?',
    answer: 'singleton',
    choices: ['singleton', 'flyweight', 'prototype', 'factory'],
    explanation: 'Creating a DB connection is expensive (network handshake, authentication). A Singleton ensures the pool is created once and reused. Multiple pool instances waste connections and can exhaust the DB server\'s limit. Singleton gives controlled, shared access to a costly resource.',
    order: 126,
    status: 'published',
    codeSnippets: {
      java: `// Connection pools are expensive — create once, share everywhere
class DatabasePool {
    private static DatabasePool instance;
    private DataSource pool;
    private DatabasePool() { pool = createPool(); } // expensive
    public static DatabasePool getInstance() {
        if (instance == null) instance = new DatabasePool();
        return instance;
    }
    public Connection getConnection() throws SQLException { return pool.getConnection(); }
}`,
      ts: `class DatabasePool {
  private static instance: DatabasePool
  private pool: Pool
  private constructor() { this.pool = createPool(config) }  // expensive
  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) DatabasePool.instance = new DatabasePool()
    return DatabasePool.instance
  }
  getConnection() { return this.pool.connect() }
}`,
      py: `class DatabasePool:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.pool = create_engine(DB_URL, pool_size=10)  # expensive
        return cls._instance
    def get_conn(self): return self.pool.connect()`,
      go: `var pool *sql.DB
var once sync.Once
func GetDB() *sql.DB {
    once.Do(func() { pool, _ = sql.Open("postgres", dsn) })  // created once
    return pool
}`,
      rust: `use std::sync::OnceLock;
static DB: OnceLock<Pool> = OnceLock::new();
fn get_db() -> &'static Pool {
    DB.get_or_init(|| Pool::connect(DB_URL).unwrap())  // initialized once
}`,
      cs: `class DatabasePool {
    private static readonly DatabasePool _instance = new();  // thread-safe eager init
    private readonly IDbConnection _pool;
    private DatabasePool() { _pool = CreatePool(); }        // expensive — once only
    public static DatabasePool Instance => _instance;
    public IDbConnection GetConnection() => _pool;
}`,
      kotlin: `object DatabasePool {
    private val pool: DataSource by lazy { createPool() }  // initialized once
    fun getConnection(): Connection = pool.connection
}`,
      swift: `class DatabasePool {
    static let shared = DatabasePool()  // thread-safe in Swift
    private let pool: ConnectionPool
    private init() { pool = ConnectionPool(maxConnections: 10) }
    func getConnection() -> Connection { pool.acquire() }
}`,
      js: `let _pool = null
function getPool() {
  if (!_pool) _pool = new Pool(config)  // created once
  return _pool
}
// All modules call getPool() — they share the same pool`,
      rb: `class DatabasePool
  @@instance = nil
  def self.instance
    @@instance ||= new
  end
  def initialize
    @pool = ConnectionPool.new(size: 10) { PG.connect(DB_URL) }
  end
  def with(&block) = @pool.with(&block)
end`,
      php: `class DatabasePool {
    private static ?self $instance = null;
    private PDO $pdo;
    private function __construct() { $this->pdo = new PDO(DSN); }
    public static function getInstance(): self { return self::$instance ??= new self(); }
    public function getConnection(): PDO { return $this->pdo; }
}`,
      cpp: `class DatabasePool {
    static DatabasePool* instance;
    pqxx::connection* conn;
    DatabasePool() : conn(new pqxx::connection(DSN)) {}
public:
    static DatabasePool* getInstance() {
        if (!instance) instance = new DatabasePool();
        return instance;
    }
    pqxx::connection* get() { return conn; }
};`,
    },
  },
  {
    slug: 'explain-factory-new-b2',
    title: 'Why Factory Over Direct new?',
    mode: 'explain',
    difficulty: 'easy',
    stem: 'Instead of calling new ConcreteLogger() directly, code calls LoggerFactory.create("file"). What benefit does this give?',
    answer: 'factory',
    choices: ['factory', 'singleton', 'builder', 'strategy'],
    explanation: 'Factory decouples the caller from the concrete class. You can switch from FileLogger to ConsoleLogger or RemoteLogger by changing config — the caller\'s code stays unchanged. It also enables centralized creation logic, validation, and dependency injection.',
    order: 127,
    status: 'published',
    codeSnippets: {
      java: `// Without factory: caller is tightly coupled to FileLogger
// FileLogger logger = new FileLogger("/var/log/app.log");

// With factory: caller depends only on the ILogger interface
ILogger logger = LoggerFactory.create(config.getString("logger.type"));

class LoggerFactory {
    public static ILogger create(String type) {
        return switch (type) {
            case "file"    -> new FileLogger(config.getString("logger.path"));
            case "console" -> new ConsoleLogger();
            case "remote"  -> new RemoteLogger(config.getString("logger.url"));
            default -> throw new IllegalArgumentException("Unknown: " + type);
        };
    }
}`,
      ts: `// Caller only knows ILogger — no concrete class dependency
const logger: ILogger = LoggerFactory.create(config.loggerType)

class LoggerFactory {
  static create(type: string): ILogger {
    if (type === 'file')    return new FileLogger(config.logPath)
    if (type === 'console') return new ConsoleLogger()
    if (type === 'remote')  return new RemoteLogger(config.logUrl)
    throw new Error('Unknown logger: ' + type)
  }
}`,
      py: `# Factory: caller is decoupled from concrete class
logger = LoggerFactory.create(config['logger_type'])

class LoggerFactory:
    @staticmethod
    def create(type_: str) -> Logger:
        if type_ == 'file':    return FileLogger(config['log_path'])
        if type_ == 'console': return ConsoleLogger()
        if type_ == 'remote':  return RemoteLogger(config['log_url'])
        raise ValueError(f'Unknown: {type_}')`,
      go: `func NewLogger(kind string, cfg Config) Logger {
    switch kind {
    case "file":    return &FileLogger{path: cfg.LogPath}
    case "console": return &ConsoleLogger{}
    case "remote":  return &RemoteLogger{url: cfg.LogURL}
    default: panic("unknown logger: " + kind)
    }
}`,
      rust: `fn create_logger(kind: &str, cfg: &Config) -> Box<dyn Logger> {
    match kind {
        "file"    => Box::new(FileLogger::new(&cfg.log_path)),
        "console" => Box::new(ConsoleLogger::new()),
        "remote"  => Box::new(RemoteLogger::new(&cfg.log_url)),
        _ => panic!("Unknown logger: {}", kind),
    }
}`,
      cs: `class LoggerFactory {
    public static ILogger Create(string type, IConfig cfg) => type switch {
        "file"    => new FileLogger(cfg["logger.path"]),
        "console" => new ConsoleLogger(),
        "remote"  => new RemoteLogger(cfg["logger.url"]),
        _ => throw new ArgumentException($"Unknown: {type}")
    };
}`,
      kotlin: `fun createLogger(type: String, cfg: Config): Logger = when (type) {
    "file"    -> FileLogger(cfg.logPath)
    "console" -> ConsoleLogger()
    "remote"  -> RemoteLogger(cfg.logUrl)
    else -> throw IllegalArgumentException("Unknown: $type")
}`,
      swift: `func createLogger(type: String, cfg: Config) -> Logger {
    switch type {
    case "file":    return FileLogger(path: cfg.logPath)
    case "console": return ConsoleLogger()
    case "remote":  return RemoteLogger(url: cfg.logUrl)
    default: fatalError("Unknown logger: \(type)")
    }
}`,
      js: `function createLogger(type, cfg) {
  if (type === 'file')    return new FileLogger(cfg.logPath)
  if (type === 'console') return new ConsoleLogger()
  if (type === 'remote')  return new RemoteLogger(cfg.logUrl)
  throw new Error('Unknown: ' + type)
}`,
      rb: `class LoggerFactory
  def self.create(type, cfg)
    case type
    when 'file'    then FileLogger.new(cfg[:log_path])
    when 'console' then ConsoleLogger.new
    when 'remote'  then RemoteLogger.new(cfg[:log_url])
    else raise ArgumentError, "Unknown: #{type}"
    end
  end
end`,
      php: `class LoggerFactory {
    public static function create(string $type, Config $cfg): Logger {
        return match($type) {
            'file'    => new FileLogger($cfg->get('log.path')),
            'console' => new ConsoleLogger(),
            'remote'  => new RemoteLogger($cfg->get('log.url')),
            default   => throw new InvalidArgumentException("Unknown: $type"),
        };
    }
}`,
      cpp: `std::unique_ptr<Logger> createLogger(const std::string& type, const Config& cfg) {
    if (type == "file")    return std::make_unique<FileLogger>(cfg.get("log.path"));
    if (type == "console") return std::make_unique<ConsoleLogger>();
    if (type == "remote")  return std::make_unique<RemoteLogger>(cfg.get("log.url"));
    throw std::invalid_argument("Unknown: " + type);
}`,
    },
  },
  {
    slug: 'explain-composite-uniform-b2',
    title: 'Why Composite Treats Leaf and Branch Uniformly?',
    mode: 'explain',
    difficulty: 'easy',
    stem: 'A file system where both File and Folder implement the same INode interface. Why does this matter for Composite?',
    answer: 'composite',
    choices: ['composite', 'decorator', 'chain', 'visitor'],
    explanation: 'Composite\'s power is uniformity: clients call getSize() on INode without knowing if it is a File or a Folder. Folders recursively sum child sizes. Adding nesting never changes client code — it always calls the same interface method.',
    order: 128,
    status: 'published',
    codeSnippets: {
      java: `interface INode { long getSize(); String getName(); }
class File implements INode {
    private String name; private long size;
    public long getSize() { return size; }
    public String getName() { return name; }
}
class Folder implements INode {
    private String name;
    private List<INode> children = new ArrayList<>();
    public void add(INode n) { children.add(n); }
    public long getSize() { return children.stream().mapToLong(INode::getSize).sum(); }
    public String getName() { return name; }
}
// Client: long total = root.getSize(); — works for File AND Folder`,
      ts: `interface INode { getSize(): number; name: string }
class File implements INode {
  constructor(public name: string, private size: number) {}
  getSize() { return this.size }
}
class Folder implements INode {
  children: INode[] = []
  constructor(public name: string) {}
  add(node: INode) { this.children.push(node) }
  getSize() { return this.children.reduce((s, n) => s + n.getSize(), 0) }
}`,
      py: `class File:
    def __init__(self, name, size): self.name = name; self._size = size
    def get_size(self): return self._size
class Folder:
    def __init__(self, name): self.name = name; self.children = []
    def add(self, node): self.children.append(node)
    def get_size(self): return sum(c.get_size() for c in self.children)
# root.get_size() works whether root is a File or Folder`,
      go: `type Node interface { GetSize() int64; Name() string }
type File   struct { name string; size int64 }
func (f *File) GetSize() int64 { return f.size }
type Folder struct { name string; children []Node }
func (f *Folder) GetSize() int64 {
    var total int64
    for _, c := range f.children { total += c.GetSize() }
    return total
}`,
      rust: `trait Node { fn get_size(&self) -> u64; fn name(&self) -> &str; }
struct File { name: String, size: u64 }
impl Node for File { fn get_size(&self) -> u64 { self.size } fn name(&self) -> &str { &self.name } }
struct Folder { name: String, children: Vec<Box<dyn Node>> }
impl Node for Folder {
    fn get_size(&self) -> u64 { self.children.iter().map(|c| c.get_size()).sum() }
    fn name(&self) -> &str { &self.name }
}`,
      cs: `interface INode { long GetSize(); string Name { get; } }
class File : INode { public long Size; public long GetSize() => Size; public string Name { get; init; } = ""; }
class Folder : INode {
    List<INode> children = new();
    public string Name { get; init; } = "";
    public void Add(INode n)    => children.Add(n);
    public long GetSize() => children.Sum(c => c.GetSize());
}`,
      kotlin: `interface Node { fun getSize(): Long; val name: String }
class File(override val name: String, private val size: Long) : Node { override fun getSize() = size }
class Folder(override val name: String) : Node {
    private val children = mutableListOf<Node>()
    fun add(n: Node) { children += n }
    override fun getSize() = children.sumOf { it.getSize() }
}`,
      swift: `protocol Node { func getSize() -> Int64; var name: String { get } }
class FileNode: Node { let name: String; let size: Int64; init(name: String, size: Int64) { self.name=name; self.size=size }; func getSize() -> Int64 { size } }
class Folder: Node {
    let name: String; var children: [Node] = []
    init(name: String) { self.name = name }
    func add(_ n: Node) { children.append(n) }
    func getSize() -> Int64 { children.reduce(0) { $0 + $1.getSize() } }
}`,
      js: `class FileNode  { constructor(name, size) { this.name=name; this.size=size }; getSize() { return this.size } }
class Folder {
  constructor(name) { this.name=name; this.children=[] }
  add(node) { this.children.push(node) }
  getSize() { return this.children.reduce((s,n) => s+n.getSize(), 0) }
}`,
      rb: `class FileNode
  attr_reader :name
  def initialize(name, size) = (@name=name; @size=size)
  def get_size = @size
end
class Folder
  attr_reader :name
  def initialize(name) = (@name=name; @children=[])
  def add(node) = @children << node
  def get_size = @children.sum(&:get_size)
end`,
      php: `interface Node { public function getSize(): int; public function getName(): string; }
class FileNode implements Node {
    public function __construct(private string $name, private int $size) {}
    public function getSize(): int { return $this->size; }
    public function getName(): string { return $this->name; }
}
class Folder implements Node {
    private array $children = [];
    public function __construct(private string $name) {}
    public function add(Node $n): void { $this->children[] = $n; }
    public function getSize(): int { return array_sum(array_map(fn(Node $n) => $n->getSize(), $this->children)); }
    public function getName(): string { return $this->name; }
}`,
      cpp: `struct Node { virtual long getSize() = 0; virtual std::string name() = 0; };
class FileNode : public Node { long sz; std::string n; public: long getSize() override { return sz; } std::string name() override { return n; } };
class Folder : public Node {
    std::string n; std::vector<Node*> children;
public:
    void add(Node* node) { children.push_back(node); }
    long getSize() override { long s=0; for(auto* c:children) s+=c->getSize(); return s; }
    std::string name() override { return n; }
};`,
    },
  },

  // ── MEDIUM IDENTIFY (36-55) ──────────────────────────────────────────────────
  {
    slug: 'abstract-factory-ui-b2',
    title: 'UI Widget Abstract Factory',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'IUIFactory has createButton() and createCheckbox(). LightThemeFactory and DarkThemeFactory each return matching widget sets. Clients never reference concrete classes. Which pattern?',
    answer: 'abstract-factory',
    choices: ['abstract-factory', 'factory', 'builder', 'prototype'],
    explanation: 'Abstract Factory creates families of related objects (Button + Checkbox always matching). Unlike Factory Method (one product type), Abstract Factory manages an entire product family.',
    order: 135,
    status: 'published',
    codeSnippets: {
      java: `interface Button   { void render(); }
interface Checkbox  { void check(); }
interface UIFactory { Button createButton(); Checkbox createCheckbox(); }

class LightThemeFactory implements UIFactory {
    public Button   createButton()   { return new LightButton(); }
    public Checkbox createCheckbox() { return new LightCheckbox(); }
}
class DarkThemeFactory implements UIFactory {
    public Button   createButton()   { return new DarkButton(); }
    public Checkbox createCheckbox() { return new DarkCheckbox(); }
}`,
      ts: `interface UIFactory { createButton(): Button; createCheckbox(): Checkbox }
class LightThemeFactory implements UIFactory {
  createButton():   Button   { return new LightButton() }
  createCheckbox(): Checkbox { return new LightCheckbox() }
}
class DarkThemeFactory implements UIFactory {
  createButton():   Button   { return new DarkButton() }
  createCheckbox(): Checkbox { return new DarkCheckbox() }
}
// App only depends on UIFactory interface — swap theme by injecting different factory`,
      py: `class UIFactory(ABC):
    @abstractmethod
    def create_button(self) -> Button: pass
    @abstractmethod
    def create_checkbox(self) -> Checkbox: pass

class LightThemeFactory(UIFactory):
    def create_button(self)   -> Button:   return LightButton()
    def create_checkbox(self) -> Checkbox: return LightCheckbox()

class DarkThemeFactory(UIFactory):
    def create_button(self)   -> Button:   return DarkButton()
    def create_checkbox(self) -> Checkbox: return DarkCheckbox()`,
      go: `type UIFactory interface { CreateButton() Button; CreateCheckbox() Checkbox }
type LightTheme struct{}
func (l *LightTheme) CreateButton()   Button   { return &LightButton{} }
func (l *LightTheme) CreateCheckbox() Checkbox { return &LightCheckbox{} }
type DarkTheme struct{}
func (d *DarkTheme) CreateButton()   Button   { return &DarkButton{} }
func (d *DarkTheme) CreateCheckbox() Checkbox { return &DarkCheckbox{} }`,
      rust: `trait UIFactory { fn create_button(&self) -> Box<dyn Button>; fn create_checkbox(&self) -> Box<dyn Checkbox>; }
struct LightTheme;
impl UIFactory for LightTheme {
    fn create_button(&self)   -> Box<dyn Button>   { Box::new(LightButton) }
    fn create_checkbox(&self) -> Box<dyn Checkbox> { Box::new(LightCheckbox) }
}`,
      cs: `interface IUIFactory { IButton CreateButton(); ICheckbox CreateCheckbox(); }
class LightThemeFactory : IUIFactory {
    public IButton   CreateButton()   => new LightButton();
    public ICheckbox CreateCheckbox() => new LightCheckbox();
}
class DarkThemeFactory : IUIFactory {
    public IButton   CreateButton()   => new DarkButton();
    public ICheckbox CreateCheckbox() => new DarkCheckbox();
}`,
      kotlin: `interface UIFactory { fun createButton(): Button; fun createCheckbox(): Checkbox }
class LightThemeFactory : UIFactory {
    override fun createButton()   = LightButton()
    override fun createCheckbox() = LightCheckbox()
}
class DarkThemeFactory : UIFactory {
    override fun createButton()   = DarkButton()
    override fun createCheckbox() = DarkCheckbox()
}`,
      swift: `protocol UIFactory { func createButton() -> Button; func createCheckbox() -> Checkbox }
class LightThemeFactory: UIFactory {
    func createButton()   -> Button   { LightButton() }
    func createCheckbox() -> Checkbox { LightCheckbox() }
}
class DarkThemeFactory: UIFactory {
    func createButton()   -> Button   { DarkButton() }
    func createCheckbox() -> Checkbox { DarkCheckbox() }
}`,
      js: `class LightThemeFactory {
  createButton()   { return new LightButton() }
  createCheckbox() { return new LightCheckbox() }
}
class DarkThemeFactory {
  createButton()   { return new DarkButton() }
  createCheckbox() { return new DarkCheckbox() }
}`,
      rb: `class LightThemeFactory
  def create_button   = LightButton.new
  def create_checkbox = LightCheckbox.new
end
class DarkThemeFactory
  def create_button   = DarkButton.new
  def create_checkbox = DarkCheckbox.new
end`,
      php: `interface UIFactory { public function createButton(): Button; public function createCheckbox(): Checkbox; }
class LightThemeFactory implements UIFactory {
    public function createButton():   Button   { return new LightButton(); }
    public function createCheckbox(): Checkbox { return new LightCheckbox(); }
}
class DarkThemeFactory implements UIFactory {
    public function createButton():   Button   { return new DarkButton(); }
    public function createCheckbox(): Checkbox { return new DarkCheckbox(); }
}`,
      cpp: `struct UIFactory { virtual Button* createButton()=0; virtual Checkbox* createCheckbox()=0; };
class LightTheme : public UIFactory {
    Button*   createButton()   override { return new LightButton(); }
    Checkbox* createCheckbox() override { return new LightCheckbox(); }
};
class DarkTheme : public UIFactory {
    Button*   createButton()   override { return new DarkButton(); }
    Checkbox* createCheckbox() override { return new DarkCheckbox(); }
};`,
    },
  },
  {
    slug: 'bridge-drawing-b2',
    title: 'Shape + Renderer Bridge',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'Shape (Circle, Square) holds a reference to IRenderer (SVGRenderer, CanvasRenderer). Shape.draw() delegates to renderer.renderCircle(). Adding a new shape or renderer requires no changes to the other hierarchy. Which pattern?',
    answer: 'bridge',
    choices: ['bridge', 'strategy', 'adapter', 'decorator'],
    explanation: 'Bridge separates the Shape abstraction from the Renderer implementation so both can vary independently. Without Bridge, N shapes x M renderers = N*M subclasses.',
    order: 136,
    status: 'published',
    codeSnippets: {
      java: `interface Renderer { void renderCircle(double r); void renderSquare(double s); }
abstract class Shape {
    protected Renderer renderer;
    Shape(Renderer r) { renderer = r; }
    abstract void draw();
}
class Circle extends Shape {
    private double radius;
    Circle(double r, Renderer rnd) { super(rnd); radius = r; }
    public void draw() { renderer.renderCircle(radius); }
}
// Vary shapes and renderers independently — no cross-product explosion`,
      ts: `interface Renderer { renderCircle(r: number): void; renderSquare(s: number): void }
abstract class Shape {
  constructor(protected renderer: Renderer) {}
  abstract draw(): void
}
class Circle extends Shape {
  constructor(private radius: number, renderer: Renderer) { super(renderer) }
  draw() { this.renderer.renderCircle(this.radius) }
}
class SVGRenderer implements Renderer {
  renderCircle(r: number) { console.log('<circle r="' + r + '"/>') }
  renderSquare(s: number) { console.log('<rect side="' + s + '"/>') }
}`,
      py: `class Renderer(ABC):
    @abstractmethod
    def render_circle(self, r: float): pass
class Shape(ABC):
    def __init__(self, renderer: Renderer): self.renderer = renderer
    @abstractmethod
    def draw(self): pass
class Circle(Shape):
    def __init__(self, radius: float, renderer: Renderer):
        super().__init__(renderer); self.radius = radius
    def draw(self): self.renderer.render_circle(self.radius)`,
      go: `type Renderer interface { RenderCircle(r float64); RenderSquare(s float64) }
type Shape interface { Draw() }
type Circle struct { radius float64; renderer Renderer }
func (c *Circle) Draw() { c.renderer.RenderCircle(c.radius) }
type SVGRenderer struct{}
func (r *SVGRenderer) RenderCircle(rad float64) { fmt.Printf("<circle r=%.1f/>\\n", rad) }
func (r *SVGRenderer) RenderSquare(s float64)   { fmt.Printf("<rect s=%.1f/>\\n", s) }`,
      rust: `trait Renderer { fn render_circle(&self, r: f64); fn render_square(&self, s: f64); }
struct Circle { radius: f64, renderer: Box<dyn Renderer> }
impl Circle { fn draw(&self) { self.renderer.render_circle(self.radius); } }
struct SVGRenderer;
impl Renderer for SVGRenderer {
    fn render_circle(&self, r: f64) { println!("<circle r={r}/>"); }
    fn render_square(&self, s: f64) { println!("<rect s={s}/>"); }
}`,
      cs: `interface IRenderer { void RenderCircle(double r); void RenderSquare(double s); }
abstract class Shape { protected IRenderer _r; protected Shape(IRenderer r) { _r = r; } public abstract void Draw(); }
class Circle : Shape {
    double _radius;
    public Circle(double radius, IRenderer r) : base(r) { _radius = radius; }
    public override void Draw() => _r.RenderCircle(_radius);
}`,
      kotlin: `interface Renderer { fun renderCircle(r: Double); fun renderSquare(s: Double) }
abstract class Shape(protected val renderer: Renderer) { abstract fun draw() }
class Circle(private val radius: Double, renderer: Renderer) : Shape(renderer) {
    override fun draw() = renderer.renderCircle(radius)
}`,
      swift: `protocol Renderer { func renderCircle(_ r: Double); func renderSquare(_ s: Double) }
class Shape { let renderer: Renderer; init(r: Renderer) { renderer = r } }
class Circle: Shape {
    let radius: Double; init(r: Double, renderer: Renderer) { radius = r; super.init(r: renderer) }
    func draw() { renderer.renderCircle(radius) }
}`,
      js: `class Circle {
  constructor(radius, renderer) { this.radius = radius; this.renderer = renderer }
  draw() { this.renderer.renderCircle(this.radius) }
}
class SVGRenderer {
  renderCircle(r) { console.log('<circle r="' + r + '"/>') }
  renderSquare(s) { console.log('<rect s="' + s + '"/>') }
}`,
      rb: `class Circle
  def initialize(radius, renderer) = (@radius=radius; @renderer=renderer)
  def draw = @renderer.render_circle(@radius)
end
class SVGRenderer
  def render_circle(r) = puts "<circle r=#{r}/>"
  def render_square(s) = puts "<rect s=#{s}/>"
end`,
      php: `interface Renderer { public function renderCircle(float $r): void; }
abstract class Shape { public function __construct(protected Renderer $r) {} abstract public function draw(): void; }
class Circle extends Shape {
    public function __construct(private float $radius, Renderer $r) { parent::__construct($r); }
    public function draw(): void { $this->r->renderCircle($this->radius); }
}`,
      cpp: `struct Renderer { virtual void renderCircle(double r)=0; virtual void renderSquare(double s)=0; };
class Circle {
    double radius; Renderer* rnd;
public:
    Circle(double r, Renderer* rnd): radius(r), rnd(rnd) {}
    void draw() { rnd->renderCircle(radius); }
};`,
    },
  },
  {
    slug: 'proxy-virtual-b2',
    title: 'Virtual Proxy — Lazy Image Loading',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'ImageProxy implements IImage and defers loading the real HighResImage until display() is first called. Subsequent calls use the cached real image. Which pattern?',
    answer: 'proxy',
    choices: ['proxy', 'decorator', 'flyweight', 'factory'],
    explanation: 'Virtual Proxy defers expensive object creation until the first use. The proxy implements the same interface, making the deferral transparent to callers.',
    order: 137,
    status: 'published',
    codeSnippets: {
      java: `interface IImage { void display(); }
class HighResImage implements IImage {
    private String path;
    HighResImage(String path) { this.path = path; loadFromDisk(); }
    private void loadFromDisk() { System.out.println("Loading " + path); }
    public void display() { System.out.println("Displaying " + path); }
}
class ImageProxy implements IImage {
    private String path; private HighResImage real;
    ImageProxy(String path) { this.path = path; }
    public void display() {
        if (real == null) real = new HighResImage(path); // lazy load
        real.display();
    }
}`,
      ts: `interface IImage { display(): void }
class ImageProxy implements IImage {
  private real: HighResImage | null = null
  constructor(private path: string) {}
  display() {
    if (!this.real) this.real = new HighResImage(this.path)  // lazy load
    this.real.display()
  }
}`,
      py: `class ImageProxy:
    def __init__(self, path: str): self._path = path; self._real = None
    def display(self):
        if self._real is None:
            self._real = HighResImage(self._path)  # lazy load on first call
        self._real.display()`,
      go: `type ImageProxy struct { path string; real *HighResImage }
func (p *ImageProxy) Display() {
    if p.real == nil { p.real = NewHighResImage(p.path) }  // lazy load
    p.real.Display()
}`,
      rust: `struct ImageProxy { path: String, real: Option<HighResImage> }
impl Image for ImageProxy {
    fn display(&mut self) {
        if self.real.is_none() { self.real = Some(HighResImage::load(&self.path)); }
        self.real.as_ref().unwrap().display();
    }
}`,
      cs: `class ImageProxy : IImage {
    string _path; HighResImage? _real;
    public ImageProxy(string path) { _path = path; }
    public void Display() {
        _real ??= new HighResImage(_path);  // lazy init
        _real.Display();
    }
}`,
      kotlin: `class ImageProxy(private val path: String) : IImage {
    private var real: HighResImage? = null
    override fun display() {
        if (real == null) real = HighResImage(path)  // lazy load
        real!!.display()
    }
}`,
      swift: `class ImageProxy: Image {
    private let path: String; private var real: HighResImage?
    init(path: String) { self.path = path }
    func display() {
        if real == nil { real = HighResImage(path: path) }  // lazy
        real?.display()
    }
}`,
      js: `class ImageProxy {
  #real = null
  constructor(path) { this.path = path }
  display() {
    if (!this.#real) this.#real = new HighResImage(this.path)  // lazy
    this.#real.display()
  }
}`,
      rb: `class ImageProxy
  def initialize(path) = (@path = path; @real = nil)
  def display
    @real ||= HighResImage.new(@path)   # lazy load
    @real.display
  end
end`,
      php: `class ImageProxy implements IImage {
    private ?HighResImage $real = null;
    public function __construct(private string $path) {}
    public function display(): void {
        $this->real ??= new HighResImage($this->path);
        $this->real->display();
    }
}`,
      cpp: `class ImageProxy : public IImage {
    std::string path; HighResImage* real = nullptr;
public:
    ImageProxy(std::string p) : path(p) {}
    void display() override {
        if (!real) real = new HighResImage(path);  // lazy load
        real->display();
    }
};`,
    },
  },
  {
    slug: 'command-undo-b2',
    title: 'Text Editor Undo/Redo Stack',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'Every edit (InsertCommand, DeleteCommand) implements execute() and undo(). Editor stores a history stack. Ctrl+Z pops and calls undo(). Which pattern?',
    answer: 'command',
    choices: ['command', 'memento', 'state', 'chain'],
    explanation: 'Command turns each operation into an object. The history stack enables undo/redo. Command differs from Memento: Command stores the action (and how to reverse it), Memento stores the state snapshot.',
    order: 138,
    status: 'published',
    codeSnippets: {
      java: `interface EditCommand { void execute(); void undo(); }
class InsertCommand implements EditCommand {
    private Document doc; private int pos; private String text;
    public void execute() { doc.insert(pos, text); }
    public void undo()    { doc.delete(pos, pos + text.length()); }
}
class Editor {
    private Deque<EditCommand> history = new ArrayDeque<>();
    public void execute(EditCommand cmd) { cmd.execute(); history.push(cmd); }
    public void undo() { if (!history.isEmpty()) history.pop().undo(); }
}`,
      ts: `interface EditCommand { execute(): void; undo(): void }
class InsertCommand implements EditCommand {
  constructor(private doc: Document, private pos: number, private text: string) {}
  execute() { this.doc.insert(this.pos, this.text) }
  undo()    { this.doc.delete(this.pos, this.pos + this.text.length) }
}
class Editor {
  private history: EditCommand[] = []
  execute(cmd: EditCommand) { cmd.execute(); this.history.push(cmd) }
  undo() { this.history.pop()?.undo() }
}`,
      py: `class Editor:
    def __init__(self): self.history = []
    def execute(self, cmd):
        cmd.execute(); self.history.append(cmd)
    def undo(self):
        if self.history: self.history.pop().undo()
class InsertCommand:
    def __init__(self, doc, pos, text): self.doc=doc; self.pos=pos; self.text=text
    def execute(self): self.doc.insert(self.pos, self.text)
    def undo(self):    self.doc.delete(self.pos, self.pos+len(self.text))`,
      go: `type Command interface { Execute(); Undo() }
type Editor struct { history []Command }
func (e *Editor) Execute(cmd Command) { cmd.Execute(); e.history = append(e.history, cmd) }
func (e *Editor) Undo() {
    n := len(e.history)
    if n > 0 { e.history[n-1].Undo(); e.history = e.history[:n-1] }
}`,
      rust: `trait Command { fn execute(&mut self); fn undo(&mut self); }
struct Editor { history: Vec<Box<dyn Command>> }
impl Editor {
    fn execute(&mut self, mut cmd: Box<dyn Command>) { cmd.execute(); self.history.push(cmd); }
    fn undo(&mut self) { if let Some(mut cmd) = self.history.pop() { cmd.undo(); } }
}`,
      cs: `interface IEditCommand { void Execute(); void Undo(); }
class Editor {
    Stack<IEditCommand> history = new();
    public void Execute(IEditCommand cmd) { cmd.Execute(); history.Push(cmd); }
    public void Undo() { if (history.Count > 0) history.Pop().Undo(); }
}`,
      kotlin: `interface EditCommand { fun execute(); fun undo() }
class Editor {
    private val history = ArrayDeque<EditCommand>()
    fun execute(cmd: EditCommand) { cmd.execute(); history.addLast(cmd) }
    fun undo() { history.removeLastOrNull()?.undo() }
}`,
      swift: `protocol EditCommand { func execute(); func undo() }
class Editor {
    private var history: [EditCommand] = []
    func execute(_ cmd: EditCommand) { cmd.execute(); history.append(cmd) }
    func undo() { history.popLast()?.undo() }
}`,
      js: `class Editor {
  #history = []
  execute(cmd) { cmd.execute(); this.#history.push(cmd) }
  undo()       { this.#history.pop()?.undo() }
}`,
      rb: `class Editor
  def initialize = @history = []
  def execute(cmd) = (@history << cmd; cmd.execute)
  def undo = @history.pop&.undo
end`,
      php: `class Editor {
    private array $history = [];
    public function execute(EditCommand $cmd): void { $cmd->execute(); $this->history[] = $cmd; }
    public function undo(): void { array_pop($this->history)?->undo(); }
}`,
      cpp: `class Editor {
    std::stack<std::unique_ptr<Command>> history;
public:
    void execute(std::unique_ptr<Command> cmd) { cmd->execute(); history.push(std::move(cmd)); }
    void undo() { if (!history.empty()) { history.top()->undo(); history.pop(); } }
};`,
    },
  },
  {
    slug: 'state-atm-b2',
    title: 'ATM State Machine',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'ATM holds a currentState. IdleState, CardInsertedState, PinVerifiedState each handle insertCard(), enterPin(), and withdraw() differently, and each state transitions to the next state. Which pattern?',
    answer: 'state',
    choices: ['state', 'chain', 'strategy', 'command'],
    explanation: 'State pattern: behavior changes based on internal state. Each ATMState encapsulates valid transitions and actions. Adding a new state (e.g., MaintenanceState) requires no changes to the ATM class.',
    order: 139,
    status: 'published',
    codeSnippets: {
      java: `interface ATMState { void insertCard(ATM atm); void enterPin(ATM atm, String pin); void withdraw(ATM atm, double amount); }
class IdleState implements ATMState {
    public void insertCard(ATM atm) { atm.setState(new CardInsertedState()); }
    public void enterPin(ATM atm, String pin) { System.out.println("Insert card first"); }
    public void withdraw(ATM atm, double a) { System.out.println("Insert card first"); }
}
class ATM { private ATMState state = new IdleState(); public void setState(ATMState s) { state = s; } }`,
      ts: `interface ATMState { insertCard(atm: ATM): void; enterPin(atm: ATM, pin: string): void; withdraw(atm: ATM, amount: number): void }
class IdleState implements ATMState {
  insertCard(atm: ATM) { atm.setState(new CardInsertedState()) }
  enterPin(_: ATM, __: string)  { console.log('Insert card first') }
  withdraw(_: ATM, __: number)  { console.log('Insert card first') }
}
class ATM { private state: ATMState = new IdleState(); setState(s: ATMState) { this.state = s } }`,
      py: `class ATM:
    def __init__(self): self.state = IdleState()
    def set_state(self, s): self.state = s
    def insert_card(self): self.state.insert_card(self)
    def enter_pin(self, pin): self.state.enter_pin(self, pin)
    def withdraw(self, amount): self.state.withdraw(self, amount)
class IdleState:
    def insert_card(self, atm): atm.set_state(CardInsertedState())
    def enter_pin(self, atm, pin): print('Insert card first')
    def withdraw(self, atm, amount): print('Insert card first')`,
      go: `type ATMState interface { InsertCard(a *ATM); EnterPin(a *ATM, pin string); Withdraw(a *ATM, amount float64) }
type ATM struct { State ATMState }
type IdleState struct{}
func (s *IdleState) InsertCard(a *ATM)              { a.State = &CardInsertedState{} }
func (s *IdleState) EnterPin(a *ATM, pin string)    { fmt.Println("Insert card first") }
func (s *IdleState) Withdraw(a *ATM, amount float64) { fmt.Println("Insert card first") }`,
      rust: `trait ATMState { fn insert_card(&self, atm: &mut ATM); fn enter_pin(&self, atm: &mut ATM, pin: &str); fn withdraw(&self, atm: &mut ATM, amount: f64); }
struct ATM { state: Box<dyn ATMState> }
struct IdleState;
impl ATMState for IdleState {
    fn insert_card(&self, atm: &mut ATM)          { atm.state = Box::new(CardInsertedState); }
    fn enter_pin(&self, _: &mut ATM, _: &str)     { println!("Insert card first"); }
    fn withdraw(&self, _: &mut ATM, _: f64)       { println!("Insert card first"); }
}`,
      cs: `interface IATMState { void InsertCard(ATM a); void EnterPin(ATM a, string pin); void Withdraw(ATM a, double amt); }
class IdleState : IATMState {
    public void InsertCard(ATM a) => a.SetState(new CardInsertedState());
    public void EnterPin(ATM a, string p)  => Console.WriteLine("Insert card first");
    public void Withdraw(ATM a, double amt) => Console.WriteLine("Insert card first");
}
class ATM { IATMState state = new IdleState(); public void SetState(IATMState s) => state = s; }`,
      kotlin: `interface ATMState { fun insertCard(atm: ATM); fun enterPin(atm: ATM, pin: String); fun withdraw(atm: ATM, amount: Double) }
class IdleState : ATMState {
    override fun insertCard(atm: ATM) = atm.setState(CardInsertedState())
    override fun enterPin(atm: ATM, pin: String) = println("Insert card first")
    override fun withdraw(atm: ATM, amount: Double) = println("Insert card first")
}`,
      swift: `protocol ATMState { func insertCard(_ atm: ATM); func enterPin(_ atm: ATM, pin: String); func withdraw(_ atm: ATM, amount: Double) }
class ATM { var state: ATMState = IdleState(); func setState(_ s: ATMState) { state = s } }
class IdleState: ATMState {
    func insertCard(_ atm: ATM) { atm.setState(CardInsertedState()) }
    func enterPin(_ atm: ATM, pin: String) { print("Insert card first") }
    func withdraw(_ atm: ATM, amount: Double) { print("Insert card first") }
}`,
      js: `class ATM { state = new IdleState(); setState(s) { this.state = s } }
class IdleState {
  insertCard(atm) { atm.setState(new CardInsertedState()) }
  enterPin(atm, pin) { console.log('Insert card first') }
  withdraw(atm, amt)  { console.log('Insert card first') }
}`,
      rb: `class ATM
  def initialize = @state = IdleState.new
  def set_state(s) = @state = s
  def insert_card = @state.insert_card(self)
  def enter_pin(pin) = @state.enter_pin(self, pin)
  def withdraw(amount) = @state.withdraw(self, amount)
end
class IdleState
  def insert_card(atm) = atm.set_state(CardInsertedState.new)
  def enter_pin(*) = puts 'Insert card first'
  def withdraw(*) = puts 'Insert card first'
end`,
      php: `interface ATMState { public function insertCard(ATM $atm): void; public function enterPin(ATM $atm, string $pin): void; public function withdraw(ATM $atm, float $amt): void; }
class ATM { private ATMState $state; public function __construct() { $this->state = new IdleState(); } public function setState(ATMState $s): void { $this->state = $s; } }
class IdleState implements ATMState {
    public function insertCard(ATM $atm): void { $atm->setState(new CardInsertedState()); }
    public function enterPin(ATM $atm, string $pin): void { echo "Insert card first\n"; }
    public function withdraw(ATM $atm, float $amt): void { echo "Insert card first\n"; }
}`,
      cpp: `struct ATMState { virtual void insertCard(class ATM*)=0; virtual void enterPin(class ATM*, const std::string&)=0; virtual void withdraw(class ATM*, double)=0; };
class ATM { ATMState* state; public: ATM(); void setState(ATMState* s) { delete state; state=s; } };
class IdleState : public ATMState {
    void insertCard(ATM* a) override;
    void enterPin(ATM*, const std::string&) override { std::cout<<"Insert card first\n"; }
    void withdraw(ATM*, double) override { std::cout<<"Insert card first\n"; }
};`,
    },
  },
  {
    slug: 'flyweight-glyph-b2',
    title: 'Glyph Flyweight for Text Rendering',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'A document with 50,000 characters uses a GlyphPool. Each unique (char, font, size) combination is created once and shared. Position is passed at draw time. Which pattern?',
    answer: 'flyweight',
    choices: ['flyweight', 'prototype', 'singleton', 'object-pool'],
    explanation: 'Flyweight separates intrinsic (shared: char, font, size) from extrinsic (unique: position) state. GlyphPool is the flyweight factory. Memory drops from O(n) glyph objects to O(unique-glyphs).',
    order: 140,
    status: 'published',
    codeSnippets: {
      java: `// Flyweight: shared intrinsic state
class Glyph {
    final char symbol; final String font; final int ptSize;
    Glyph(char c, String f, int s) { symbol=c; font=f; ptSize=s; }
    void draw(int x, int y) { /* render this glyph at extrinsic position */ }
}
// FlyweightFactory: pool of shared glyphs
class GlyphPool {
    private static Map<String, Glyph> pool = new HashMap<>();
    static Glyph get(char c, String font, int size) {
        String key = c + "|" + font + "|" + size;
        return pool.computeIfAbsent(key, k -> new Glyph(c, font, size));
    }
}`,
      ts: `class Glyph {
  constructor(readonly symbol: string, readonly font: string, readonly size: number) {}
  draw(x: number, y: number) { /* render at (x,y) */ }
}
class GlyphPool {
  private static pool = new Map<string, Glyph>()
  static get(sym: string, font: string, size: number): Glyph {
    const key = sym + '|' + font + '|' + size
    if (!this.pool.has(key)) this.pool.set(key, new Glyph(sym, font, size))
    return this.pool.get(key)!
  }
}`,
      py: `class Glyph:  # intrinsic (shared) state
    def __init__(self, symbol: str, font: str, size: int):
        self.symbol = symbol; self.font = font; self.size = size
    def draw(self, x: int, y: int): pass  # x,y are extrinsic

class GlyphPool:
    _pool: dict = {}
    @classmethod
    def get(cls, symbol, font, size) -> Glyph:
        key = (symbol, font, size)
        if key not in cls._pool: cls._pool[key] = Glyph(symbol, font, size)
        return cls._pool[key]`,
      go: `type Glyph struct { Symbol rune; Font string; Size int }
func (g Glyph) Draw(x, y int) {}
type GlyphPool struct { pool map[string]Glyph }
func (p *GlyphPool) Get(sym rune, font string, size int) Glyph {
    key := fmt.Sprintf("%c|%s|%d", sym, font, size)
    if _, ok := p.pool[key]; !ok { p.pool[key] = Glyph{sym, font, size} }
    return p.pool[key]
}`,
      rust: `use std::collections::HashMap;
struct Glyph { symbol: char, font: String, size: u32 }
struct GlyphPool { pool: HashMap<String, Glyph> }
impl GlyphPool {
    fn get(&mut self, sym: char, font: &str, size: u32) -> &Glyph {
        let key = format!("{}|{}|{}", sym, font, size);
        self.pool.entry(key).or_insert(Glyph { symbol: sym, font: font.into(), size })
    }
}`,
      cs: `class Glyph { public char Symbol; public string Font; public int Size; public void Draw(int x, int y) {} }
static class GlyphPool {
    static Dictionary<string,Glyph> pool = new();
    public static Glyph Get(char c, string font, int size) {
        var key = $"{c}|{font}|{size}";
        return pool.TryGetValue(key, out var g) ? g : pool[key] = new Glyph{Symbol=c,Font=font,Size=size};
    }
}`,
      kotlin: `data class Glyph(val symbol: Char, val font: String, val size: Int) { fun draw(x: Int, y: Int) {} }
object GlyphPool {
    private val pool = mutableMapOf<String, Glyph>()
    fun get(sym: Char, font: String, size: Int) =
        pool.getOrPut("$sym|$font|$size") { Glyph(sym, font, size) }
}`,
      swift: `struct Glyph { let symbol: Character; let font: String; let size: Int; func draw(x: Int, y: Int) {} }
class GlyphPool {
    private var pool = [String: Glyph]()
    func get(sym: Character, font: String, size: Int) -> Glyph {
        let key = "\(sym)|\(font)|\(size)"
        return pool[key] ?? { let g = Glyph(symbol: sym, font: font, size: size); pool[key] = g; return g }()
    }
}`,
      js: `class GlyphPool {
  static #pool = new Map()
  static get(sym, font, size) {
    const key = sym + '|' + font + '|' + size
    if (!this.#pool.has(key)) this.#pool.set(key, { sym, font, size, draw(x,y){} })
    return this.#pool.get(key)
  }
}`,
      rb: `class GlyphPool
  @@pool = {}
  def self.get(sym, font, size)
    key = "#{sym}|#{font}|#{size}"
    @@pool[key] ||= Glyph.new(sym, font, size)
  end
end`,
      php: `class GlyphPool {
    private static array $pool = [];
    public static function get(string $sym, string $font, int $size): Glyph {
        $key = "$sym|$font|$size";
        return self::$pool[$key] ??= new Glyph($sym, $font, $size);
    }
}`,
      cpp: `class GlyphPool {
    std::unordered_map<std::string, Glyph> pool;
public:
    const Glyph& get(char sym, const std::string& font, int size) {
        std::string key = std::string(1,sym) + "|" + font + "|" + std::to_string(size);
        return pool.emplace(key, Glyph{sym, font, size}).first->second;
    }
};`,
    },
  },
  {
    slug: 'observer-event-b2',
    title: 'Event Emitter (Observer)',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'EventEmitter has on(event, handler), off(event, handler), and emit(event, data). Multiple modules listen to the same event independently. Which pattern?',
    answer: 'observer',
    choices: ['observer', 'mediator', 'command', 'chain'],
    explanation: 'EventEmitter is the canonical Observer implementation. Subjects (emitters) maintain handler lists per event. emit() notifies all registered observers. on/off = subscribe/unsubscribe.',
    order: 141,
    status: 'published',
    codeSnippets: {
      java: `import java.util.*;
class EventEmitter {
    private Map<String, List<Consumer<Object>>> handlers = new HashMap<>();
    public void on(String event, Consumer<Object> handler) {
        handlers.computeIfAbsent(event, k -> new ArrayList<>()).add(handler);
    }
    public void off(String event, Consumer<Object> handler) {
        handlers.getOrDefault(event, List.of()).remove(handler);
    }
    public void emit(String event, Object data) {
        handlers.getOrDefault(event, List.of()).forEach(h -> h.accept(data));
    }
}`,
      ts: `type Handler<T = unknown> = (data: T) => void
class EventEmitter {
  private handlers = new Map<string, Handler[]>()
  on(event: string, fn: Handler)  { (this.handlers.get(event) ?? this.handlers.set(event,[]).get(event))!.push(fn) }
  off(event: string, fn: Handler) { this.handlers.set(event, (this.handlers.get(event) ?? []).filter(h => h !== fn)) }
  emit(event: string, data: unknown) { this.handlers.get(event)?.forEach(h => h(data)) }
}`,
      py: `from collections import defaultdict
class EventEmitter:
    def __init__(self): self._handlers = defaultdict(list)
    def on(self, event: str, fn): self._handlers[event].append(fn)
    def off(self, event: str, fn): self._handlers[event].remove(fn)
    def emit(self, event: str, data=None):
        for h in self._handlers[event]: h(data)`,
      go: `type EventEmitter struct { handlers map[string][]func(any) }
func (e *EventEmitter) On(event string, fn func(any))  { e.handlers[event] = append(e.handlers[event], fn) }
func (e *EventEmitter) Emit(event string, data any)    { for _, fn := range e.handlers[event] { fn(data) } }`,
      rust: `use std::collections::HashMap;
struct EventEmitter { handlers: HashMap<String, Vec<Box<dyn Fn(&str)>>> }
impl EventEmitter {
    fn on(&mut self, event: &str, handler: Box<dyn Fn(&str)>) {
        self.handlers.entry(event.to_string()).or_default().push(handler);
    }
    fn emit(&self, event: &str, data: &str) {
        if let Some(fns) = self.handlers.get(event) { for f in fns { f(data); } }
    }
}`,
      cs: `class EventEmitter {
    Dictionary<string, List<Action<object>>> handlers = new();
    public void On(string ev, Action<object> fn)  => handlers.GetOrCreate(ev).Add(fn);
    public void Off(string ev, Action<object> fn) => handlers.GetOrCreate(ev).Remove(fn);
    public void Emit(string ev, object data)      => handlers.GetOrCreate(ev).ForEach(h => h(data));
}`,
      kotlin: `class EventEmitter {
    private val handlers = mutableMapOf<String, MutableList<(Any?) -> Unit>>()
    fun on(event: String, fn: (Any?) -> Unit) { handlers.getOrPut(event) { mutableListOf() } += fn }
    fun off(event: String, fn: (Any?) -> Unit) { handlers[event]?.remove(fn) }
    fun emit(event: String, data: Any?) { handlers[event]?.forEach { it(data) } }
}`,
      swift: `class EventEmitter {
    private var handlers = [String: [(Any?) -> Void]]()
    func on(_ event: String, _ fn: @escaping (Any?) -> Void) { handlers[event, default: []].append(fn) }
    func emit(_ event: String, _ data: Any? = nil) { handlers[event]?.forEach { $0(data) } }
}`,
      js: `class EventEmitter {
  #handlers = new Map()
  on(event, fn)   { (this.#handlers.get(event) ?? this.#handlers.set(event,[]).get(event)).push(fn) }
  off(event, fn)  { this.#handlers.set(event, (this.#handlers.get(event)??[]).filter(h => h!==fn)) }
  emit(event, data) { this.#handlers.get(event)?.forEach(h => h(data)) }
}`,
      rb: `class EventEmitter
  def initialize = @handlers = Hash.new { |h,k| h[k] = [] }
  def on(event, &fn)  = @handlers[event] << fn
  def off(event, fn)  = @handlers[event].delete(fn)
  def emit(event, data=nil) = @handlers[event].each { |h| h.call(data) }
end`,
      php: `class EventEmitter {
    private array $handlers = [];
    public function on(string $ev, callable $fn): void  { $this->handlers[$ev][] = $fn; }
    public function off(string $ev, callable $fn): void { $this->handlers[$ev] = array_filter($this->handlers[$ev] ?? [], fn($h) => $h !== $fn); }
    public function emit(string $ev, mixed $data = null): void { foreach ($this->handlers[$ev] ?? [] as $h) $h($data); }
}`,
      cpp: `class EventEmitter {
    std::unordered_map<std::string, std::vector<std::function<void(std::any)>>> handlers;
public:
    void on(const std::string& ev, std::function<void(std::any)> fn) { handlers[ev].push_back(fn); }
    void emit(const std::string& ev, std::any data) { for (auto& fn : handlers[ev]) fn(data); }
};`,
    },
  },
  {
    slug: 'mediator-form-b2',
    title: 'Form Fields Mediator',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'When the "Country" dropdown changes, a FormMediator enables or disables the "State" field and changes the "Phone" format mask. Fields talk to the mediator, not to each other. Which pattern?',
    answer: 'mediator',
    choices: ['mediator', 'observer', 'chain', 'facade'],
    explanation: 'Mediator centralises complex many-to-many coordination logic. Fields (colleagues) communicate only with the mediator, reducing direct inter-field dependencies from O(n^2) to O(n).',
    order: 142,
    status: 'published',
    codeSnippets: {
      java: `interface FormMediator { void notify(Component sender, String event); }
class RegistrationForm implements FormMediator {
    private Dropdown country; private TextField state; private TextField phone;
    public void notify(Component sender, String event) {
        if (sender == country && event.equals("change")) {
            boolean hasStates = country.getValue().equals("US");
            state.setEnabled(hasStates);
            phone.setMask(hasStates ? "+1 (###) ###-####" : "+## ###########");
        }
    }
}`,
      ts: `class FormMediator {
  constructor(private country: Dropdown, private state: TextField, private phone: TextField) {}
  notify(sender: Component, event: string) {
    if (sender === this.country && event === 'change') {
      const isUS = this.country.value === 'US'
      this.state.setEnabled(isUS)
      this.phone.setMask(isUS ? '+1 (###) ###-####' : '+## ###########')
    }
  }
}`,
      py: `class FormMediator:
    def __init__(self, country, state_field, phone):
        self.country = country; self.state = state_field; self.phone = phone
    def notify(self, sender, event: str):
        if sender is self.country and event == 'change':
            is_us = self.country.value == 'US'
            self.state.set_enabled(is_us)
            self.phone.set_mask('+1 (###) ###-####' if is_us else '+## ###########')`,
      go: `type FormMediator struct { country, state, phone Component }
func (m *FormMediator) Notify(sender Component, event string) {
    if sender == m.country && event == "change" {
        isUS := m.country.(Dropdown).Value() == "US"
        m.state.(TextField).SetEnabled(isUS)
    }
}`,
      rust: `struct FormMediator { country_val: String }
impl FormMediator {
    fn notify(&mut self, event: &str, value: &str) {
        if event == "country_changed" {
            let is_us = value == "US";
            // Enable/disable state field, change phone mask
            println!("State enabled: {}, mask: {}", is_us, if is_us { "+1 ###" } else { "+## ##" });
        }
    }
}`,
      cs: `class FormMediator {
    Dropdown country; TextBox state, phone;
    public FormMediator(Dropdown c, TextBox s, TextBox p) { country=c; state=s; phone=p; }
    public void Notify(Control sender, string ev) {
        if (sender == country && ev == "change") {
            bool isUS = country.Value == "US";
            state.Enabled  = isUS;
            phone.Mask     = isUS ? "+1 (###) ###-####" : "+## ###########";
        }
    }
}`,
      kotlin: `class FormMediator(private val country: Dropdown, private val state: TextField, private val phone: TextField) {
    fun notify(sender: Component, event: String) {
        if (sender === country && event == "change") {
            val isUS = country.value == "US"
            state.isEnabled = isUS
            phone.mask = if (isUS) "+1 (###) ###-####" else "+## ###########"
        }
    }
}`,
      swift: `class FormMediator {
    let country: Dropdown; let state: TextField; let phone: TextField
    init(c: Dropdown, s: TextField, p: TextField) { country=c; state=s; phone=p }
    func notify(sender: UIControl, event: String) {
        if sender === country as AnyObject && event == "change" {
            let isUS = country.value == "US"
            state.isEnabled = isUS
        }
    }
}`,
      js: `class FormMediator {
  constructor(country, state, phone) { this.country=country; this.state=state; this.phone=phone }
  notify(sender, event) {
    if (sender === this.country && event === 'change') {
      const isUS = this.country.value === 'US'
      this.state.setEnabled(isUS)
      this.phone.setMask(isUS ? '+1 (###) ###-####' : '+## ###########')
    }
  }
}`,
      rb: `class FormMediator
  def initialize(country, state, phone) = (@country=country; @state=state; @phone=phone)
  def notify(sender, event)
    return unless sender == @country && event == 'change'
    is_us = @country.value == 'US'
    @state.enabled = is_us
    @phone.mask = is_us ? '+1 (###) ###-####' : '+## ###########'
  end
end`,
      php: `class FormMediator {
    public function __construct(private Dropdown $country, private TextField $state, private TextField $phone) {}
    public function notify(object $sender, string $event): void {
        if ($sender === $this->country && $event === 'change') {
            $isUS = $this->country->getValue() === 'US';
            $this->state->setEnabled($isUS);
            $this->phone->setMask($isUS ? '+1 (###) ###-####' : '+## ###########');
        }
    }
}`,
      cpp: `class FormMediator {
    Dropdown* country; TextField* state; TextField* phone;
public:
    FormMediator(Dropdown* c, TextField* s, TextField* p) : country(c), state(s), phone(p) {}
    void notify(Component* sender, const std::string& event) {
        if (sender == country && event == "change") {
            bool isUS = country->getValue() == "US";
            state->setEnabled(isUS);
        }
    }
};`,
    },
  },
  {
    slug: 'interpreter-expr-b2',
    title: 'Arithmetic Expression Interpreter',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'NumberExpr, AddExpr, and MulExpr each implement IExpression with interpret(). MulExpr(AddExpr(2,3), NumberExpr(4)).interpret() evaluates the tree. Which pattern?',
    answer: 'interpreter',
    choices: ['interpreter', 'composite', 'visitor', 'command'],
    explanation: 'Interpreter represents grammar rules as a class hierarchy. Each expression type implements interpret() to evaluate itself — the tree is the parse tree of the language.',
    order: 143,
    status: 'published',
    codeSnippets: {
      java: `interface IExpression { int interpret(); }
class NumberExpr implements IExpression {
    private int value;
    NumberExpr(int v) { value = v; }
    public int interpret() { return value; }
}
class AddExpr implements IExpression {
    private IExpression left, right;
    AddExpr(IExpression l, IExpression r) { left=l; right=r; }
    public int interpret() { return left.interpret() + right.interpret(); }
}
// AddExpr(new NumberExpr(2), new NumberExpr(3)).interpret() == 5`,
      ts: `interface IExpression { interpret(): number }
class NumberExpr implements IExpression {
  constructor(private value: number) {}
  interpret() { return this.value }
}
class AddExpr implements IExpression {
  constructor(private left: IExpression, private right: IExpression) {}
  interpret() { return this.left.interpret() + this.right.interpret() }
}
class MulExpr implements IExpression {
  constructor(private left: IExpression, private right: IExpression) {}
  interpret() { return this.left.interpret() * this.right.interpret() }
}`,
      py: `class NumberExpr:
    def __init__(self, val: int): self.val = val
    def interpret(self) -> int: return self.val
class AddExpr:
    def __init__(self, l, r): self.l = l; self.r = r
    def interpret(self) -> int: return self.l.interpret() + self.r.interpret()
class MulExpr:
    def __init__(self, l, r): self.l = l; self.r = r
    def interpret(self) -> int: return self.l.interpret() * self.r.interpret()`,
      go: `type Expr interface { Interpret() int }
type Num struct { Val int }
func (n Num) Interpret() int { return n.Val }
type Add struct { L, R Expr }
func (a Add) Interpret() int { return a.L.Interpret() + a.R.Interpret() }
type Mul struct { L, R Expr }
func (m Mul) Interpret() int { return m.L.Interpret() * m.R.Interpret() }`,
      rust: `trait Expr { fn interpret(&self) -> i64; }
struct Num(i64);
impl Expr for Num { fn interpret(&self) -> i64 { self.0 } }
struct Add(Box<dyn Expr>, Box<dyn Expr>);
impl Expr for Add { fn interpret(&self) -> i64 { self.0.interpret() + self.1.interpret() } }
struct Mul(Box<dyn Expr>, Box<dyn Expr>);
impl Expr for Mul { fn interpret(&self) -> i64 { self.0.interpret() * self.1.interpret() } }`,
      cs: `interface IExpression { int Interpret(); }
record NumberExpr(int Value)                               : IExpression { public int Interpret() => Value; }
record AddExpr(IExpression Left, IExpression Right)       : IExpression { public int Interpret() => Left.Interpret() + Right.Interpret(); }
record MulExpr(IExpression Left, IExpression Right)       : IExpression { public int Interpret() => Left.Interpret() * Right.Interpret(); }`,
      kotlin: `interface Expression { fun interpret(): Int }
class Num(private val value: Int) : Expression { override fun interpret() = value }
class Add(private val l: Expression, private val r: Expression) : Expression { override fun interpret() = l.interpret() + r.interpret() }
class Mul(private val l: Expression, private val r: Expression) : Expression { override fun interpret() = l.interpret() * r.interpret() }`,
      swift: `protocol Expr { func interpret() -> Int }
struct Num: Expr { let value: Int; func interpret() -> Int { value } }
struct Add: Expr { let l, r: Expr; func interpret() -> Int { l.interpret() + r.interpret() } }
struct Mul: Expr { let l, r: Expr; func interpret() -> Int { l.interpret() * r.interpret() } }`,
      js: `class Num { constructor(v) { this.v = v }; interpret() { return this.v } }
class Add { constructor(l, r) { this.l=l; this.r=r }; interpret() { return this.l.interpret() + this.r.interpret() } }
class Mul { constructor(l, r) { this.l=l; this.r=r }; interpret() { return this.l.interpret() * this.r.interpret() } }`,
      rb: `class Num; def initialize(v) = @v=v; def interpret = @v; end
class Add; def initialize(l,r) = (@l=l;@r=r); def interpret = @l.interpret + @r.interpret; end
class Mul; def initialize(l,r) = (@l=l;@r=r); def interpret = @l.interpret * @r.interpret; end`,
      php: `interface Expr { public function interpret(): int; }
class Num implements Expr { public function __construct(private int $val) {}; public function interpret(): int { return $this->val; } }
class Add implements Expr { public function __construct(private Expr $l, private Expr $r) {}; public function interpret(): int { return $this->l->interpret() + $this->r->interpret(); } }
class Mul implements Expr { public function __construct(private Expr $l, private Expr $r) {}; public function interpret(): int { return $this->l->interpret() * $this->r->interpret(); } }`,
      cpp: `struct Expr { virtual int interpret() = 0; };
struct Num : Expr { int v; Num(int v): v(v){} int interpret() override { return v; } };
struct Add : Expr { Expr *l,*r; Add(Expr* l,Expr* r):l(l),r(r){} int interpret() override { return l->interpret()+r->interpret(); } };
struct Mul : Expr { Expr *l,*r; Mul(Expr* l,Expr* r):l(l),r(r){} int interpret() override { return l->interpret()*r->interpret(); } };`,
    },
  },
  {
    slug: 'strategy-payment-b2',
    title: 'Payment Method Strategy',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'Checkout holds an IPaymentStrategy. CardPayment, WalletPayment, and UPIPayment each implement pay(amount). The strategy is selected based on user preference at runtime. Which pattern?',
    answer: 'strategy',
    choices: ['strategy', 'factory', 'command', 'state'],
    explanation: 'Strategy encapsulates interchangeable algorithms (payment methods). Checkout delegates to whichever IPaymentStrategy is injected — no conditionals in Checkout.',
    order: 144,
    status: 'published',
    codeSnippets: {
      java: `interface IPaymentStrategy { void pay(double amount); }
class CardPayment   implements IPaymentStrategy { public void pay(double a) { /* charge card */ } }
class WalletPayment implements IPaymentStrategy { public void pay(double a) { /* deduct wallet */ } }
class UPIPayment    implements IPaymentStrategy { public void pay(double a) { /* UPI transfer */ } }

class Checkout {
    private IPaymentStrategy strategy;
    public void setStrategy(IPaymentStrategy s) { strategy = s; }
    public void complete(double total) { strategy.pay(total); }
}`,
      ts: `interface PaymentStrategy { pay(amount: number): void }
class CardPayment   implements PaymentStrategy { pay(a: number) { /* card */ } }
class WalletPayment implements PaymentStrategy { pay(a: number) { /* wallet */ } }
class UPIPayment    implements PaymentStrategy { pay(a: number) { /* UPI */ } }
class Checkout {
  private strategy!: PaymentStrategy
  setStrategy(s: PaymentStrategy) { this.strategy = s }
  complete(total: number) { this.strategy.pay(total) }
}`,
      py: `class Checkout:
    def __init__(self): self.strategy = None
    def set_strategy(self, s): self.strategy = s
    def complete(self, total: float): self.strategy.pay(total)
class CardPayment:   pay = lambda self, a: print(f'Card: {a}')
class WalletPayment: pay = lambda self, a: print(f'Wallet: {a}')
class UPIPayment:    pay = lambda self, a: print(f'UPI: {a}')`,
      go: `type PaymentStrategy interface { Pay(amount float64) }
type CardPayment   struct{}; func (c *CardPayment)   Pay(a float64) { /* card */ }
type WalletPayment struct{}; func (w *WalletPayment) Pay(a float64) { /* wallet */ }
type Checkout struct { strategy PaymentStrategy }
func (c *Checkout) SetStrategy(s PaymentStrategy) { c.strategy = s }
func (c *Checkout) Complete(total float64)         { c.strategy.Pay(total) }`,
      rust: `trait PaymentStrategy { fn pay(&self, amount: f64); }
struct CardPayment; impl PaymentStrategy for CardPayment { fn pay(&self, a: f64) { println!("Card: {}", a); } }
struct Checkout { strategy: Box<dyn PaymentStrategy> }
impl Checkout {
    fn set_strategy(&mut self, s: Box<dyn PaymentStrategy>) { self.strategy = s; }
    fn complete(&self, total: f64) { self.strategy.pay(total); }
}`,
      cs: `interface IPayment { void Pay(decimal amount); }
class CardPayment   : IPayment { public void Pay(decimal a) => Console.WriteLine($"Card: {a}"); }
class WalletPayment : IPayment { public void Pay(decimal a) => Console.WriteLine($"Wallet: {a}"); }
class Checkout {
    IPayment _strategy;
    public void SetStrategy(IPayment s) => _strategy = s;
    public void Complete(decimal total) => _strategy.Pay(total);
}`,
      kotlin: `interface PaymentStrategy { fun pay(amount: Double) }
class CardPayment   : PaymentStrategy { override fun pay(a: Double) = println("Card: $a") }
class WalletPayment : PaymentStrategy { override fun pay(a: Double) = println("Wallet: $a") }
class Checkout {
    var strategy: PaymentStrategy? = null
    fun complete(total: Double) = strategy?.pay(total)
}`,
      swift: `protocol PaymentStrategy { func pay(_ amount: Double) }
class CardPayment:   PaymentStrategy { func pay(_ a: Double) { print("Card: \(a)") } }
class WalletPayment: PaymentStrategy { func pay(_ a: Double) { print("Wallet: \(a)") } }
class Checkout { var strategy: PaymentStrategy?; func complete(_ total: Double) { strategy?.pay(total) } }`,
      js: `class Checkout {
  setStrategy(s) { this.strategy = s }
  complete(total) { this.strategy.pay(total) }
}
class CardPayment   { pay(a) { console.log('Card:', a) } }
class WalletPayment { pay(a) { console.log('Wallet:', a) } }`,
      rb: `class Checkout
  def set_strategy(s) = @strategy = s
  def complete(total) = @strategy.pay(total)
end
class CardPayment;   def pay(a) = puts "Card: #{a}"; end
class WalletPayment; def pay(a) = puts "Wallet: #{a}"; end`,
      php: `interface PaymentStrategy { public function pay(float $amount): void; }
class CardPayment   implements PaymentStrategy { public function pay(float $a): void { echo "Card: $a\n"; } }
class WalletPayment implements PaymentStrategy { public function pay(float $a): void { echo "Wallet: $a\n"; } }
class Checkout {
    private PaymentStrategy $strategy;
    public function setStrategy(PaymentStrategy $s): void { $this->strategy = $s; }
    public function complete(float $total): void { $this->strategy->pay($total); }
}`,
      cpp: `struct PaymentStrategy { virtual void pay(double amount) = 0; };
struct CardPayment   : PaymentStrategy { void pay(double a) override { std::cout << "Card: " << a << "\n"; } };
struct WalletPayment : PaymentStrategy { void pay(double a) override { std::cout << "Wallet: " << a << "\n"; } };
class Checkout {
    PaymentStrategy* strategy;
public:
    void setStrategy(PaymentStrategy* s) { strategy = s; }
    void complete(double total) { strategy->pay(total); }
};`,
    },
  },
  {
    slug: 'factory-logger-b2',
    title: 'Logger Factory Method',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'FileLoggerFactory and ConsoleLoggerFactory each override createLogger() returning a concrete logger. Clients use the abstract ILoggerFactory.createLogger() and never reference concrete classes. Which pattern?',
    answer: 'factory',
    choices: ['factory', 'abstract-factory', 'builder', 'strategy'],
    explanation: 'Factory Method: subclasses override a factory method to decide which concrete product to create. Each factory subclass is responsible for one product type.',
    order: 145,
    status: 'published',
    codeSnippets: {
      java: `interface Logger { void log(String msg); }
abstract class LoggerFactory {
    public abstract Logger createLogger();
    public void logMessage(String msg) { createLogger().log(msg); }  // uses factory method
}
class FileLoggerFactory extends LoggerFactory {
    public Logger createLogger() { return new FileLogger("app.log"); }
}
class ConsoleLoggerFactory extends LoggerFactory {
    public Logger createLogger() { return new ConsoleLogger(); }
}`,
      ts: `abstract class LoggerFactory {
  abstract createLogger(): Logger
  log(msg: string) { this.createLogger().log(msg) }
}
class FileLoggerFactory extends LoggerFactory { createLogger() { return new FileLogger('app.log') } }
class ConsoleLoggerFactory extends LoggerFactory { createLogger() { return new ConsoleLogger() } }`,
      py: `from abc import ABC, abstractmethod
class LoggerFactory(ABC):
    @abstractmethod
    def create_logger(self) -> Logger: pass
    def log(self, msg: str): self.create_logger().log(msg)
class FileLoggerFactory(LoggerFactory):
    def create_logger(self) -> Logger: return FileLogger('app.log')
class ConsoleLoggerFactory(LoggerFactory):
    def create_logger(self) -> Logger: return ConsoleLogger()`,
      go: `type LoggerCreator interface { CreateLogger() Logger }
type FileLoggerFactory    struct{}
func (f *FileLoggerFactory)    CreateLogger() Logger { return &FileLogger{path: "app.log"} }
type ConsoleLoggerFactory struct{}
func (c *ConsoleLoggerFactory) CreateLogger() Logger { return &ConsoleLogger{} }`,
      rust: `trait LoggerFactory { fn create_logger(&self) -> Box<dyn Logger>; }
struct FileLoggerFactory;
impl LoggerFactory for FileLoggerFactory { fn create_logger(&self) -> Box<dyn Logger> { Box::new(FileLogger::new("app.log")) } }
struct ConsoleLoggerFactory;
impl LoggerFactory for ConsoleLoggerFactory { fn create_logger(&self) -> Box<dyn Logger> { Box::new(ConsoleLogger::new()) } }`,
      cs: `abstract class LoggerFactory {
    public abstract ILogger CreateLogger();
    public void Log(string msg) => CreateLogger().Log(msg);
}
class FileLoggerFactory    : LoggerFactory { public override ILogger CreateLogger() => new FileLogger("app.log"); }
class ConsoleLoggerFactory : LoggerFactory { public override ILogger CreateLogger() => new ConsoleLogger(); }`,
      kotlin: `abstract class LoggerFactory {
    abstract fun createLogger(): Logger
    fun log(msg: String) = createLogger().log(msg)
}
class FileLoggerFactory    : LoggerFactory() { override fun createLogger() = FileLogger("app.log") }
class ConsoleLoggerFactory : LoggerFactory() { override fun createLogger() = ConsoleLogger() }`,
      swift: `class LoggerFactory { func createLogger() -> Logger { fatalError("override") } }
class FileLoggerFactory:    LoggerFactory { override func createLogger() -> Logger { FileLogger(path: "app.log") } }
class ConsoleLoggerFactory: LoggerFactory { override func createLogger() -> Logger { ConsoleLogger() } }`,
      js: `class LoggerFactory { createLogger() { throw new Error('override') }; log(msg) { this.createLogger().log(msg) } }
class FileLoggerFactory    extends LoggerFactory { createLogger() { return new FileLogger('app.log') } }
class ConsoleLoggerFactory extends LoggerFactory { createLogger() { return new ConsoleLogger() } }`,
      rb: `class LoggerFactory
  def create_logger = raise NotImplementedError
  def log(msg) = create_logger.log(msg)
end
class FileLoggerFactory    < LoggerFactory; def create_logger = FileLogger.new('app.log'); end
class ConsoleLoggerFactory < LoggerFactory; def create_logger = ConsoleLogger.new; end`,
      php: `abstract class LoggerFactory {
    abstract public function createLogger(): Logger;
    public function log(string $msg): void { $this->createLogger()->log($msg); }
}
class FileLoggerFactory    extends LoggerFactory { public function createLogger(): Logger { return new FileLogger('app.log'); } }
class ConsoleLoggerFactory extends LoggerFactory { public function createLogger(): Logger { return new ConsoleLogger(); } }`,
      cpp: `class LoggerFactory { public: virtual Logger* createLogger() = 0; };
class FileLoggerFactory    : public LoggerFactory { Logger* createLogger() override { return new FileLogger("app.log"); } };
class ConsoleLoggerFactory : public LoggerFactory { Logger* createLogger() override { return new ConsoleLogger(); } };`,
    },
  },

  // ── MEDIUM DETECT (56-62) ────────────────────────────────────────────────────
  {
    slug: 'detect-observer-leak-b2',
    title: 'Observer Memory Leak',
    mode: 'detect',
    difficulty: 'medium',
    stem: 'Listeners are added with addEventListener but never removed when the component unmounts. Does this code implement Observer correctly?',
    answer: 'none',
    choices: ['none', 'observer', 'proxy', 'command'],
    explanation: 'This is the classic Observer memory-leak anti-pattern. Listeners that are never unsubscribed keep their owners alive in memory. Components should call removeEventListener (or equivalent unsubscribe) on cleanup/destroy.',
    order: 156,
    status: 'published',
    codeSnippets: {
      java: `class ProductList {
    private EventBus bus;
    ProductList(EventBus bus) { this.bus = bus; }
    void init() {
        // Added every time init() is called — never removed!
        bus.on("productUpdated", this::refresh);
        bus.on("categoryChanged", this::reload);
    }
    void destroy() {
        // BUG: no bus.off() calls here — listeners accumulate
    }
    void refresh(Event e) { /* reload list */ }
    void reload(Event e) { /* full reload */ }
}`,
      ts: `class ProductList {
  constructor(private bus: EventBus) {}
  init() {
    // BUG: new handler added on every init() call — no cleanup
    this.bus.on('productUpdated', this.refresh.bind(this))
    this.bus.on('categoryChanged', this.reload.bind(this))
  }
  destroy() {
    // Missing: this.bus.off('productUpdated', ...) etc.
  }
  refresh(e: Event) {}; reload(e: Event) {}
}`,
      py: `class ProductList:
    def __init__(self, bus): self.bus = bus
    def init(self):
        # BUG: lambda creates new object each call — impossible to remove!
        self.bus.on('product_updated', lambda e: self.refresh(e))
    def destroy(self):
        pass  # BUG: no bus.off() — listener is permanently registered`,
      go: `type ProductList struct { bus *EventBus }
func (p *ProductList) Init() {
    // BUG: registers new handler each call — old ones linger
    p.bus.On("productUpdated", func(e Event) { p.refresh(e) })
}
func (p *ProductList) Destroy() {
    // BUG: no Off() call — goroutine/closure leak
}`,
      rust: `struct ProductList { bus: Arc<EventBus> }
impl ProductList {
    fn init(&self) {
        let self_ref = self as *const Self;
        // BUG: captures pointer; listener never removed
        self.bus.on("product_updated", move |_e| unsafe { (*self_ref).refresh() });
    }
    fn destroy(&self) { /* BUG: no unsubscribe */ }
}`,
      cs: `class ProductList {
    EventBus _bus;
    public ProductList(EventBus bus) { _bus = bus; }
    public void Init() {
        // BUG: += without a matching -= in Destroy
        _bus.ProductUpdated  += OnProductUpdated;
        _bus.CategoryChanged += OnCategoryChanged;
    }
    public void Destroy() {
        // Missing: _bus.ProductUpdated -= OnProductUpdated;
    }
}`,
      kotlin: `class ProductList(private val bus: EventBus) {
    fun init() {
        // BUG: lambda reference lost — can never unsubscribe!
        bus.on("productUpdated") { refresh(it) }
    }
    fun destroy() {
        // BUG: no bus.off() — listener leaks
    }
}`,
      swift: `class ProductList {
    let bus: NotificationCenter
    init(bus: NotificationCenter) { self.bus = bus }
    func start() {
        // BUG: added without corresponding removeObserver in deinit
        bus.addObserver(self, selector: #selector(refresh), name: .productUpdated, object: nil)
    }
    deinit { /* BUG: missing bus.removeObserver(self) */ }
}`,
      js: `class ProductList {
  constructor(bus) { this.bus = bus }
  init() {
    // BUG: arrow function — new reference each call, impossible to remove
    this.bus.on('productUpdated', (e) => this.refresh(e))
  }
  destroy() {
    // BUG: no this.bus.off() call — listener persists after component unmounts
  }
}`,
      rb: `class ProductList
  def initialize(bus) = @bus = bus
  def init
    # BUG: new block each call — can't unsubscribe block references
    @bus.on(:product_updated) { |e| refresh(e) }
  end
  def destroy
    # BUG: no bus.off — listener accumulates
  end
end`,
      php: `class ProductList {
    public function __construct(private EventBus $bus) {}
    public function init(): void {
        // BUG: closure registered each call — PHP long-running processes will leak
        $this->bus->on('productUpdated', fn($e) => $this->refresh($e));
    }
    public function destroy(): void {
        // BUG: no off() call
    }
}`,
      cpp: `class ProductList {
    EventBus* bus;
public:
    ProductList(EventBus* b) : bus(b) {}
    void init() {
        // BUG: lambda registered each init() call — never erased
        bus->on("productUpdated", [this](const Event& e) { refresh(e); });
    }
    void destroy() { /* BUG: no bus->off() */ }
};`,
    },
  },
  {
    slug: 'detect-singleton-test-b2',
    title: 'Singleton Preventing Unit Tests',
    mode: 'detect',
    difficulty: 'medium',
    stem: 'Tests cannot isolate the class under test because it internally creates a Singleton database connection. Is this a correct use of Singleton?',
    answer: 'none',
    choices: ['none', 'singleton', 'proxy', 'facade'],
    explanation: 'Singletons that are directly accessed inside a class make it untestable. The singleton is not wrong per se, but calling DatabasePool.getInstance() inside a constructor violates DIP and makes mocking impossible. Inject the dependency instead.',
    order: 157,
    status: 'published',
    codeSnippets: {
      java: `class OrderRepository {
    private DatabasePool db;
    OrderRepository() {
        // BUG: hardcoded singleton access — cannot inject a mock in tests!
        this.db = DatabasePool.getInstance();
    }
    public List<Order> findAll() { return db.query("SELECT * FROM orders"); }
}
// Test cannot swap db with a mock without touching prod code`,
      ts: `class OrderRepository {
  private db = DatabasePool.getInstance()  // BUG: hardcoded
  findAll(): Order[] {
    return this.db.query('SELECT * FROM orders')
    // Test cannot inject a mock DatabasePool
  }
}`,
      py: `class OrderRepository:
    def __init__(self):
        # BUG: singleton accessed directly — not injectable
        self.db = DatabasePool.get_instance()
    def find_all(self): return self.db.query('SELECT * FROM orders')
# In tests: cannot swap db without monkey-patching the singleton`,
      go: `type OrderRepository struct{}
func (r *OrderRepository) FindAll() []Order {
    // BUG: global singleton — no way to inject mock in tests
    return GetDB().Query("SELECT * FROM orders")
}`,
      rust: `struct OrderRepository;
impl OrderRepository {
    fn find_all(&self) -> Vec<Order> {
        // BUG: global singleton — cannot inject test double
        DB.get().unwrap().query("SELECT * FROM orders")
    }
}`,
      cs: `class OrderRepository {
    public List<Order> FindAll() {
        // BUG: singleton consumed directly — no DI, impossible to mock
        var db = DatabasePool.Instance;
        return db.Query("SELECT * FROM orders");
    }
}`,
      kotlin: `class OrderRepository {
    private val db = DatabasePool // BUG: singleton object — not injectable
    fun findAll(): List<Order> = db.query("SELECT * FROM orders")
}`,
      swift: `class OrderRepository {
    func findAll() -> [Order] {
        // BUG: shared singleton — tests cannot substitute a mock
        return DatabasePool.shared.query("SELECT * FROM orders")
    }
}`,
      js: `class OrderRepository {
  findAll() {
    // BUG: cannot inject a mock — hardcoded singleton
    return DatabasePool.getInstance().query('SELECT * FROM orders')
  }
}`,
      rb: `class OrderRepository
  def find_all
    # BUG: singleton accessed directly — test cannot substitute
    DatabasePool.instance.query('SELECT * FROM orders')
  end
end`,
      php: `class OrderRepository {
    public function findAll(): array {
        // BUG: service locator / singleton — not testable without global state manipulation
        return DatabasePool::getInstance()->query('SELECT * FROM orders');
    }
}`,
      cpp: `class OrderRepository {
public:
    std::vector<Order> findAll() {
        // BUG: global singleton — cannot inject a test double
        return DatabasePool::getInstance()->query("SELECT * FROM orders");
    }
};`,
    },
  },
  {
    slug: 'detect-factory-srp-b2',
    title: 'Factory Violating SRP',
    mode: 'detect',
    difficulty: 'medium',
    stem: 'This factory method creates a service object AND validates inputs AND logs the operation. Is this a correct Factory pattern?',
    answer: 'none',
    choices: ['none', 'factory', 'facade', 'builder'],
    explanation: 'A factory should only construct objects. Validation, logging, and business logic inside a factory violate SRP. Extract those responsibilities to their own classes. This code is an anti-pattern.',
    order: 158,
    status: 'published',
    codeSnippets: {
      java: `class ReportFactory {
    static Report create(String type, Map<String,Object> params) {
        // Validation — not factory responsibility
        if (params.get("startDate") == null) throw new IllegalArgumentException("startDate required");
        if (!List.of("pdf","csv","xlsx").contains(type)) throw new IllegalArgumentException("Bad type");
        // Logging — not factory responsibility
        Logger.info("Creating " + type + " report for " + params.get("userId"));
        // Metrics — really not factory responsibility
        Metrics.increment("report.created", Map.of("type", type));
        return switch (type) { case "pdf" -> new PdfReport(params); default -> new CsvReport(params); };
    }
}`,
      ts: `class ReportFactory {
  static create(type: string, params: Record<string, unknown>): Report {
    // WRONG: validation in factory
    if (!params.startDate) throw new Error('startDate required')
    if (!['pdf','csv','xlsx'].includes(type)) throw new Error('Invalid type')
    // WRONG: logging in factory
    logger.info('Creating ' + type + ' report')
    // WRONG: metric tracking in factory
    metrics.increment('report.created', { type })
    return type === 'pdf' ? new PdfReport(params) : new CsvReport(params)
  }
}`,
      py: `class ReportFactory:
    @staticmethod
    def create(type_: str, params: dict):
        # WRONG: validation inside factory
        if 'start_date' not in params: raise ValueError('start_date required')
        if type_ not in ('pdf', 'csv', 'xlsx'): raise ValueError('Bad type')
        # WRONG: logging inside factory
        logger.info(f'Creating {type_} report')
        metrics.increment('report.created', tags={'type': type_})
        return PdfReport(params) if type_ == 'pdf' else CsvReport(params)`,
      go: `func CreateReport(kind string, params map[string]any) (Report, error) {
    // WRONG: validation
    if params["startDate"] == nil { return nil, errors.New("startDate required") }
    // WRONG: logging
    log.Printf("creating %s report", kind)
    // WRONG: metrics
    metrics.Incr("report.created", kind)
    switch kind { case "pdf": return &PdfReport{params}, nil; default: return &CsvReport{params}, nil }
}`,
      rust: `fn create_report(kind: &str, params: &Params) -> Result<Box<dyn Report>, String> {
    // WRONG: validation, logging, metrics all in factory
    if params.start_date.is_none() { return Err("startDate required".into()); }
    log::info!("Creating {} report", kind);
    metrics::increment("report.created");
    match kind { "pdf" => Ok(Box::new(PdfReport::new(params))), _ => Ok(Box::new(CsvReport::new(params))) }
}`,
      cs: `class ReportFactory {
    public static IReport Create(string type, Dictionary<string,object> p) {
        // WRONG: validation, logging, metrics in factory
        if (!p.ContainsKey("startDate")) throw new ArgumentException("startDate required");
        _logger.LogInformation("Creating {Type} report", type);
        _metrics.Increment("report.created");
        return type == "pdf" ? new PdfReport(p) : new CsvReport(p);
    }
}`,
      kotlin: `object ReportFactory {
    fun create(type: String, params: Map<String, Any>): Report {
        // WRONG: mixing validation + logging + creation
        require(params["startDate"] != null) { "startDate required" }
        logger.info("Creating $type report")
        metrics.increment("report.created", mapOf("type" to type))
        return if (type == "pdf") PdfReport(params) else CsvReport(params)
    }
}`,
      swift: `class ReportFactory {
    static func create(type: String, params: [String: Any]) throws -> Report {
        // WRONG: too many responsibilities in a factory
        guard params["startDate"] != nil else { throw ReportError.missingDate }
        Logger.info("Creating \(type) report")
        Metrics.increment("report.created")
        return type == "pdf" ? PdfReport(params) : CsvReport(params)
    }
}`,
      js: `class ReportFactory {
  static create(type, params) {
    // WRONG: factory doing validation + logging + metrics
    if (!params.startDate) throw new Error('startDate required')
    if (!['pdf','csv'].includes(type)) throw new Error('Bad type')
    logger.info('Creating ' + type + ' report')
    metrics.increment('report.created')
    return type === 'pdf' ? new PdfReport(params) : new CsvReport(params)
  }
}`,
      rb: `class ReportFactory
  def self.create(type, params)
    # WRONG: validation + logging + metrics in a factory
    raise ArgumentError, 'start_date required' unless params[:start_date]
    Rails.logger.info("Creating #{type} report")
    StatsD.increment('report.created')
    type == 'pdf' ? PdfReport.new(params) : CsvReport.new(params)
  end
end`,
      php: `class ReportFactory {
    public static function create(string $type, array $params): Report {
        // WRONG: factory doing too much
        if (empty($params['startDate'])) throw new InvalidArgumentException('startDate required');
        Log::info("Creating {$type} report");
        Metrics::increment('report.created');
        return $type === 'pdf' ? new PdfReport($params) : new CsvReport($params);
    }
}`,
      cpp: `Report* createReport(const std::string& type, const Params& p) {
    // WRONG: validation + logging inside factory
    if (!p.has("startDate")) throw std::invalid_argument("startDate required");
    Logger::info("Creating " + type + " report");
    Metrics::increment("report.created");
    return type == "pdf" ? new PdfReport(p) : new CsvReport(p);
}`,
    },
  },
  {
    slug: 'detect-chain-no-handler-b2',
    title: 'Chain Without Default Handler',
    mode: 'detect',
    difficulty: 'medium',
    stem: 'A Chain of Responsibility processes requests through 3 handlers. If none matches, the request is silently dropped. Is this chain correctly implemented?',
    answer: 'none',
    choices: ['none', 'chain', 'strategy', 'command'],
    explanation: 'A correctly implemented CoR chain must handle unmatched requests explicitly — log them, throw an exception, or route to a default handler. Silently dropping requests is a bug that makes debugging impossible.',
    order: 159,
    status: 'published',
    codeSnippets: {
      java: `abstract class SupportHandler {
    protected SupportHandler next;
    public void setNext(SupportHandler h) { next = h; }
    public abstract void handle(Ticket t);
}
class Level1Support extends SupportHandler {
    public void handle(Ticket t) {
        if (t.priority == Priority.LOW) { resolve(t); }
        else if (next != null) next.handle(t); // if next==null: ticket vanishes!
        // BUG: no else branch — CRITICAL tickets silently dropped when chain ends
    }
}`,
      ts: `abstract class SupportHandler {
  next?: SupportHandler
  abstract handle(ticket: Ticket): void
}
class Level3Support extends SupportHandler {
  handle(ticket: Ticket) {
    if (ticket.priority === Priority.CRITICAL) this.escalate(ticket)
    else if (this.next) this.next.handle(ticket)
    // BUG: else branch missing — unhandled tickets disappear silently
  }
  escalate(t: Ticket) {}
}`,
      py: `class SupportHandler:
    def __init__(self): self.next = None
    def handle(self, ticket):
        if self.next:
            self.next.handle(ticket)
        # BUG: if self.next is None, ticket is silently dropped!
        # Should: raise UnhandledTicketError or log the drop`,
      go: `func HandleTicket(handlers []Handler, t Ticket) {
    for _, h := range handlers {
        if h.CanHandle(t) { h.Handle(t); return }
    }
    // BUG: all handlers declined — ticket silently lost
    // Should: return error, or use a fallback handler`,
      rust: `fn handle_ticket(chain: &[Box<dyn Handler>], ticket: &Ticket) {
    for handler in chain {
        if handler.can_handle(ticket) { handler.handle(ticket); return; }
    }
    // BUG: no fallback — ticket silently dropped when no handler matches
}`,
      cs: `void ProcessTicket(Ticket t, SupportHandler? handler) {
    while (handler != null) {
        if (handler.CanHandle(t)) { handler.Handle(t); return; }
        handler = handler.Next;
    }
    // BUG: loop exhausted without match — ticket silently lost
    // Fix: throw new UnhandledTicketException(t) or log + alert`,
      kotlin: `fun processTicket(ticket: Ticket, handler: SupportHandler?) {
    var current = handler
    while (current != null) {
        if (current.canHandle(ticket)) { current.handle(ticket); return }
        current = current.next
    }
    // BUG: ticket silently dropped — should throw or log`,
      swift: `func process(ticket: Ticket, handler: SupportHandler?) {
    var current = handler
    while let h = current {
        if h.canHandle(ticket) { h.handle(ticket); return }
        current = h.next
    }
    // BUG: unhandled ticket — silently lost, no logging or error`,
      js: `function processTicket(ticket, handler) {
  let current = handler
  while (current) {
    if (current.canHandle(ticket)) { current.handle(ticket); return }
    current = current.next
  }
  // BUG: ticket falls through chain with no action taken
}`,
      rb: `def process_ticket(ticket, handler)
  current = handler
  while current
    if current.can_handle?(ticket)
      current.handle(ticket); return
    end
    current = current.next_handler
  end
  # BUG: no fallback — ticket silently dropped
end`,
      php: `function processTicket(Ticket $ticket, ?SupportHandler $handler): void {
    $current = $handler;
    while ($current !== null) {
        if ($current->canHandle($ticket)) { $current->handle($ticket); return; }
        $current = $current->getNext();
    }
    // BUG: ticket silently lost — should throw or log an alert
}`,
      cpp: `void processTicket(const Ticket& t, Handler* handler) {
    while (handler != nullptr) {
        if (handler->canHandle(t)) { handler->handle(t); return; }
        handler = handler->getNext();
    }
    // BUG: no fallback — ticket vanishes when chain is exhausted
}`,
    },
  },

  // ── MEDIUM EXPLAIN (63-67) ───────────────────────────────────────────────────
  {
    slug: 'explain-factory-builder-b2',
    title: 'Factory vs Builder: When to Use Which?',
    mode: 'explain',
    difficulty: 'medium',
    stem: 'Factory and Builder both create objects. A team argues over which to use for a complex Report object with 10 optional fields. Which is right and why?',
    answer: 'builder',
    choices: ['builder', 'factory', 'abstract-factory', 'prototype'],
    explanation: 'Factory is for simple, one-step creation where the type varies. Builder is for complex, multi-step construction with many optional parts. A Report with 10 optional fields is the textbook Builder use case — factory would require 10 constructor params or method overloads.',
    order: 163,
    status: 'published',
    codeSnippets: {
      java: `// Factory: one-step creation, type selection is the goal
Report report = ReportFactory.create("pdf", params);

// Builder: multi-step construction, optional config is the goal
Report report = new ReportBuilder()
    .setTitle("Q4 Sales")
    .setDateRange(start, end)
    .includeCharts(true)
    .setFormat(Format.PDF)
    .addSection(Section.SUMMARY)
    .addSection(Section.DETAILS)
    .setPageSize(PageSize.A4)
    .build();
// Each step is optional; no need for a constructor with 10 params`,
      ts: `// Factory: picks the RIGHT type — single creation step
const report = ReportFactory.create('pdf', params)

// Builder: assembles a complex object step-by-step
const report = new ReportBuilder()
  .setTitle('Q4 Sales')
  .setDateRange(start, end)
  .includeCharts(true)
  .setFormat('pdf')
  .addSection('summary')
  .build()
// Optional fields + fluent API = Builder territory`,
      py: `# Factory: selects product type
report = ReportFactory.create('pdf', params)

# Builder: complex optional construction
report = (ReportBuilder()
    .set_title('Q4 Sales')
    .set_date_range(start, end)
    .include_charts(True)
    .set_format('pdf')
    .add_section('summary')
    .build())`,
      go: `// Factory
report := NewReport("pdf", params)

// Builder pattern via functional options (Go idiom)
report := NewReport(
    WithTitle("Q4 Sales"),
    WithDateRange(start, end),
    WithCharts(true),
    WithFormat("pdf"),
)`,
      rust: `// Factory: simple type selection
let report = Report::from_type("pdf", &params);

// Builder: complex optional construction
let report = ReportBuilder::new()
    .title("Q4 Sales")
    .date_range(start, end)
    .include_charts(true)
    .format(Format::PDF)
    .build();`,
      cs: `// Factory: picks type at runtime
IReport report = ReportFactory.Create("pdf", params);

// Builder: complex optional construction
IReport report = new ReportBuilder()
    .SetTitle("Q4 Sales")
    .SetDateRange(start, end)
    .IncludeCharts(true)
    .SetFormat(Format.Pdf)
    .AddSection(Section.Summary)
    .Build();`,
      kotlin: `// Factory: type selection
val report = ReportFactory.create("pdf", params)

// Builder: optional step-by-step construction
val report = ReportBuilder()
    .setTitle("Q4 Sales")
    .setDateRange(start, end)
    .includeCharts(true)
    .build()`,
      swift: `// Factory: creates the right type
let report = ReportFactory.create(type: "pdf", params: params)

// Builder: assembles optional parts
let report = ReportBuilder()
    .setTitle("Q4 Sales")
    .setDateRange(start: start, end: end)
    .includeCharts(true)
    .build()`,
      js: `// Factory: type-based creation
const report = ReportFactory.create('pdf', params)

// Builder: optional configuration
const report = new ReportBuilder()
  .setTitle('Q4 Sales')
  .setDateRange(start, end)
  .includeCharts(true)
  .build()`,
      rb: `# Factory
report = ReportFactory.create('pdf', params)

# Builder
report = ReportBuilder.new
  .set_title('Q4 Sales')
  .set_date_range(start, end)
  .include_charts(true)
  .build`,
      php: `// Factory: simple type dispatch
$report = ReportFactory::create('pdf', $params);

// Builder: complex optional assembly
$report = (new ReportBuilder())
    ->setTitle('Q4 Sales')
    ->setDateRange($start, $end)
    ->includeCharts(true)
    ->setFormat('pdf')
    ->build();`,
      cpp: `// Factory: type selection
auto* report = ReportFactory::create("pdf", params);

// Builder: optional complex construction
auto report = ReportBuilder{}
    .setTitle("Q4 Sales")
    .setDateRange(start, end)
    .includeCharts(true)
    .build();`,
    },
  },
  {
    slug: 'explain-proxy-decorator-b2',
    title: 'Proxy vs Decorator: Intent Difference',
    mode: 'explain',
    difficulty: 'medium',
    stem: 'Both Proxy and Decorator wrap an object and implement the same interface. A senior asks: "What is the fundamental intent difference?" What is the correct answer?',
    answer: 'proxy',
    choices: ['proxy', 'decorator', 'adapter', 'facade'],
    explanation: 'Proxy controls ACCESS to the subject (lazy init, auth, caching, remote). The subject interface is usually not changed. Decorator ADDS BEHAVIOUR to the subject transparently. The key test: does the wrapping class add new capabilities, or control how the real object is reached?',
    order: 164,
    status: 'published',
    codeSnippets: {
      java: `// PROXY: controls access (protection proxy)
class SecureFileProxy implements IFileService {
    private RealFileService real; private String role;
    SecureFileProxy(RealFileService r, String role) { real=r; this.role=role; }
    public void delete(String path) {
        if (!role.equals("ADMIN")) throw new SecurityException("Denied"); // access control
        real.delete(path);
    }
}
// DECORATOR: adds behavior (logging decorator)
class LoggingFileDecorator implements IFileService {
    private IFileService inner;
    LoggingFileDecorator(IFileService inner) { this.inner = inner; }
    public void delete(String path) {
        log.info("Deleting: " + path);   // added behavior
        inner.delete(path);
        log.info("Deleted: " + path);   // added behavior
    }
}`,
      ts: `// PROXY: controls ACCESS to the real object
class ImageProxy implements IImage {
  private real: RealImage | null = null
  display() {
    if (!this.real) this.real = new RealImage()  // lazy access control
    this.real.display()
  }
}
// DECORATOR: ADDS behavior to an existing object
class BorderDecorator implements IImage {
  constructor(private image: IImage) {}
  display() {
    this.drawBorder()   // extra behavior
    this.image.display()
    this.drawBorder()
  }
  private drawBorder() { console.log('--- border ---') }
}`,
      py: `# PROXY — controls access (auth, cache, lazy init)
class CachedWeatherProxy:
    def __init__(self, real): self._real = real; self._cache = {}
    def get_weather(self, city):
        if city not in self._cache: self._cache[city] = self._real.get_weather(city)
        return self._cache[city]   # controls when real object is called

# DECORATOR — adds new behavior
class WeatherAlertDecorator:
    def __init__(self, service): self._s = service
    def get_weather(self, city):
        weather = self._s.get_weather(city)
        if weather['temp'] > 40: send_alert(city)  # added behavior
        return weather`,
      go: `// PROXY: access control / lazy init
type ImageProxy struct { path string; real *RealImage }
func (p *ImageProxy) Display() {
    if p.real == nil { p.real = LoadImage(p.path) }  // controls access
    p.real.Display()
}
// DECORATOR: adds logging behavior
type LogDecorator struct { inner Image }
func (d *LogDecorator) Display() {
    log.Println("before display")   // added behavior
    d.inner.Display()
    log.Println("after display")
}`,
      rust: `// PROXY: controls access
struct AuthProxy { inner: Box<dyn Service>, token: String }
impl Service for AuthProxy {
    fn call(&self, req: &Request) -> Response {
        if !validate_token(&self.token) { return unauthorized(); }  // access gate
        self.inner.call(req)
    }
}
// DECORATOR: adds behavior
struct LoggingDecorator { inner: Box<dyn Service> }
impl Service for LoggingDecorator {
    fn call(&self, req: &Request) -> Response {
        log::info!("Request: {:?}", req);   // added behavior
        let res = self.inner.call(req);
        log::info!("Response: {:?}", res);  // added behavior
        res
    }
}`,
      cs: `// PROXY — controls access (protection, virtual, remote)
class ProtectionProxy : IService {
    IService _real; string _role;
    public Response Call(Request r) {
        if (_role != "ADMIN") return Response.Forbidden;  // access control
        return _real.Call(r);
    }
}
// DECORATOR — adds behavior (cross-cutting concerns)
class LoggingDecorator : IService {
    IService _inner;
    public Response Call(Request r) {
        _logger.Log("Before");    // added behavior
        var res = _inner.Call(r);
        _logger.Log("After");     // added behavior
        return res;
    }
}`,
      kotlin: `// Proxy: controls access
class CachingProxy(private val real: WeatherService) : WeatherService {
    private val cache = mutableMapOf<String, Weather>()
    override fun getWeather(city: String) =
        cache.getOrPut(city) { real.getWeather(city) }   // access control: skip real call if cached
}
// Decorator: adds behavior
class AlertDecorator(private val service: WeatherService) : WeatherService {
    override fun getWeather(city: String): Weather {
        val w = service.getWeather(city)
        if (w.temp > 40) sendAlert(city)   // extra behavior
        return w
    }
}`,
      swift: `// Proxy: controls access
class ImageProxy: ImageProtocol {
    var real: RealImage?
    func display() { real = real ?? RealImage(); real?.display() }  // lazy access
}
// Decorator: adds border
class BorderDecorator: ImageProtocol {
    let image: ImageProtocol
    func display() { drawBorder(); image.display(); drawBorder() }  // behavior added
    func drawBorder() { print("===") }
}`,
      js: `// Proxy: access control
const imageProxy = new Proxy(realImage, {
  get(target, prop) {
    if (prop === 'display' && !isAuthenticated()) throw new Error('Denied')  // access gate
    return target[prop]
  }
})
// Decorator: adds behavior
class LogDecorator {
  constructor(service) { this.service = service }
  call(req) {
    console.log('before')              // added behavior
    const res = this.service.call(req)
    console.log('after')
    return res
  }
}`,
      rb: `# Proxy: access control
class AuthProxy
  def initialize(real, token) = (@real=real; @token=token)
  def call(req)
    raise 'Denied' unless valid_token?(@token)   # access gate
    @real.call(req)
  end
end
# Decorator: adds behavior
class LoggingDecorator
  def initialize(inner) = @inner = inner
  def call(req)
    logger.info 'before'          # added behavior
    res = @inner.call(req)
    logger.info 'after'
    res
  end
end`,
      php: `// Proxy: controls access
class AuthProxy implements Service {
    public function __construct(private Service $real, private string $role) {}
    public function call(Request $r): Response {
        if ($this->role !== 'ADMIN') return Response::forbidden();  // access control
        return $this->real->call($r);
    }
}
// Decorator: adds logging
class LoggingDecorator implements Service {
    public function __construct(private Service $inner) {}
    public function call(Request $r): Response {
        Log::info('before'); $res = $this->inner->call($r); Log::info('after'); return $res;
    }
}`,
      cpp: `// PROXY: controls access (lazy loading example)
class ImageProxy : public Image {
    std::string path; RealImage* real = nullptr;
    void display() override { if (!real) real = new RealImage(path); real->display(); }
};
// DECORATOR: adds a border
class BorderDecorator : public Image {
    Image* inner;
    void display() override { std::cout<<"---\n"; inner->display(); std::cout<<"---\n"; }
};`,
    },
  },
  {
    slug: 'explain-strategy-template-b2',
    title: 'Strategy vs Template Method',
    mode: 'explain',
    difficulty: 'medium',
    stem: 'Both Strategy and Template Method define a family of algorithms. A team debates which to use for a data processing pipeline where the steps are the same but the transformation varies. Which fits and why?',
    answer: 'strategy',
    choices: ['strategy', 'template-method', 'decorator', 'chain'],
    explanation: 'Strategy uses composition — inject the algorithm object at runtime. Template Method uses inheritance — override steps in a subclass. Strategy is preferred (favours composition over inheritance) when algorithms need to be swapped at runtime or independently tested. Template Method is better when the algorithm skeleton is truly fixed and subclassing is natural.',
    order: 165,
    status: 'published',
    codeSnippets: {
      java: `// STRATEGY (composition — preferred for runtime swap)
interface Transform { String apply(String data); }
class Pipeline {
    private Transform transform;
    Pipeline(Transform t) { this.transform = t; }
    String process(String data) { return transform.apply(data); }
}
// Swap at runtime: new Pipeline(data -> data.toUpperCase())

// TEMPLATE METHOD (inheritance — better when skeleton is truly fixed)
abstract class Pipeline {
    final String process(String data) {
        String cleaned  = clean(data);    // fixed step
        String transformed = transform(cleaned);  // varies
        return validate(transformed);     // fixed step
    }
    abstract String transform(String data);
}`,
      ts: `// STRATEGY: inject the varying part as a dependency
type Transform = (data: string) => string
class Pipeline {
  constructor(private transform: Transform) {}
  process(data: string) { return this.transform(data) }
}
// Runtime swap: new Pipeline(d => d.toUpperCase())

// TEMPLATE METHOD: vary by subclassing
abstract class Pipeline {
  process(data: string) {
    const cleaned = this.clean(data)
    const transformed = this.transform(cleaned)  // abstract
    return this.validate(transformed)
  }
  private clean(d: string) { return d.trim() }
  abstract transform(d: string): string
  private validate(d: string) { return d }
}`,
      py: `# STRATEGY: composition
class Pipeline:
    def __init__(self, transform): self.transform = transform
    def process(self, data: str): return self.transform(data)
# pipeline = Pipeline(str.upper)  # swap at any time

# TEMPLATE METHOD: inheritance
from abc import ABC, abstractmethod
class Pipeline(ABC):
    def process(self, data: str):
        cleaned = self._clean(data)
        transformed = self._transform(cleaned)  # subclass fills in
        return self._validate(transformed)
    def _clean(self, d): return d.strip()
    @abstractmethod
    def _transform(self, d: str) -> str: pass`,
      go: `// Strategy: inject function/interface
type Transform func(string) string
type Pipeline struct { transform Transform }
func (p *Pipeline) Process(data string) string { return p.transform(data) }

// Template method via embedding (Go idiom)
type PipelineSteps interface { Transform(string) string }
func Process(steps PipelineSteps, data string) string {
    cleaned := strings.TrimSpace(data)  // fixed
    return steps.Transform(cleaned)     // varies
}`,
      rust: `// Strategy: function pointer or trait object
struct Pipeline { transform: Box<dyn Fn(&str) -> String> }
impl Pipeline {
    fn process(&self, data: &str) -> String { (self.transform)(data) }
}

// Template method: trait with default methods
trait Pipeline {
    fn transform(&self, data: &str) -> String;  // varies
    fn process(&self, raw: &str) -> String {
        let cleaned = raw.trim();           // fixed
        self.transform(cleaned)             // delegates
    }
}`,
      cs: `// Strategy: inject delegate/interface
class Pipeline {
    Func<string,string> _transform;
    Pipeline(Func<string,string> t) { _transform = t; }
    string Process(string data) => _transform(data);
}

// Template Method: override abstract method
abstract class Pipeline {
    public string Process(string data) {
        var cleaned = Clean(data);            // fixed
        return Transform(cleaned);            // varies
    }
    string Clean(string d) => d.Trim();
    protected abstract string Transform(string d);
}`,
      kotlin: `// Strategy: inject lambda
class Pipeline(private val transform: (String) -> String) {
    fun process(data: String) = transform(data)
}

// Template Method: override in subclass
abstract class Pipeline {
    fun process(data: String): String {
        val cleaned = clean(data)           // fixed
        return transform(cleaned)           // abstract
    }
    private fun clean(d: String) = d.trim()
    abstract fun transform(d: String): String
}`,
      swift: `// Strategy: inject closure
class Pipeline { let transform: (String) -> String; func process(_ d: String) -> String { transform(d) } }

// Template Method: override in subclass
class Pipeline {
    func process(_ data: String) -> String { transform(clean(data)) }
    private func clean(_ d: String) -> String { d.trimmingCharacters(in: .whitespaces) }
    func transform(_ d: String) -> String { fatalError("override") }
}`,
      js: `// Strategy: inject function
class Pipeline { constructor(fn) { this.fn = fn }; process(d) { return this.fn(d) } }

// Template Method: subclass
class Pipeline {
  process(data) { return this.transform(this.clean(data)) }
  clean(d)      { return d.trim() }
  transform(d)  { throw new Error('override') }
}`,
      rb: `# Strategy: inject proc
class Pipeline
  def initialize(&fn) = @fn = fn
  def process(data) = @fn.call(data)
end

# Template Method
class Pipeline
  def process(data) = transform(clean(data))
  def clean(d)      = d.strip
  def transform(d)  = raise NotImplementedError
end`,
      php: `// Strategy: inject callable
class Pipeline { public function __construct(private $fn) {}; public function process(string $d): string { return ($this->fn)($d); } }

// Template Method
abstract class Pipeline {
    public function process(string $data): string { return $this->transform($this->clean($data)); }
    private function clean(string $d): string { return trim($d); }
    abstract protected function transform(string $d): string;
}`,
      cpp: `// Strategy: inject function
class Pipeline { std::function<std::string(std::string)> fn; public: std::string process(std::string d) { return fn(d); } };

// Template Method
class Pipeline {
public:
    std::string process(const std::string& data) { return transform(clean(data)); }
    std::string clean(const std::string& d) { /* trim */ return d; }
    virtual std::string transform(const std::string& d) = 0;
};`,
    },
  },

  // ── MEDIUM SUGGEST (68-70) ───────────────────────────────────────────────────
  {
    slug: 'suggest-notification-b2',
    title: 'Suggest a Pattern: Multi-Channel Notifications',
    mode: 'suggest',
    difficulty: 'medium',
    stem: 'Design a notification system that sends alerts through Email, SMS, Push, and Slack. New channels should be addable without modifying the core alert logic. Which pattern(s) would you apply?',
    answer: 'observer',
    choices: [],
    explanation: 'Observer (or Strategy + Observer): the Alert is the subject; each channel (EmailNotifier, SMSNotifier) is an observer. Registering new channels extends the system without touching the publisher. Strategy can be used for channel-selection logic.',
    problemContext: 'You are building an alerting system for a cloud platform. When a server goes down, the system must notify the on-call team via Email, SMS, Push notification, and Slack. The marketing team wants to add WhatsApp next quarter. The alert logic (detecting the outage) must not be modified each time a new channel is added.',
    keyPatterns: ['observer', 'strategy', 'pub-sub'],
    order: 168,
    status: 'published',
  },
  {
    slug: 'suggest-export-format-b2',
    title: 'Suggest a Pattern: Multiple Export Formats',
    mode: 'suggest',
    difficulty: 'medium',
    stem: 'A reporting service exports data to CSV, JSON, and PDF. The export steps (fetch data, apply filters, format, write) are the same — only the format output differs. Which pattern(s) would you apply?',
    answer: 'template-method',
    choices: [],
    explanation: 'Template Method: the fixed algorithm (fetch → filter → format → write) lives in the base class. Only the format step is abstract/overridden by CsvExporter, JsonExporter, PdfExporter. Strategy is also valid if exporters are injected at runtime.',
    problemContext: 'Your analytics dashboard lets users export reports. The export pipeline always: 1) Fetches data from the database, 2) Applies date/user filters, 3) Formats the data, 4) Writes to a file or stream. Steps 1, 2, and 4 are identical for all formats. Only step 3 differs (CSV vs JSON vs PDF serialisation).',
    keyPatterns: ['template-method', 'strategy'],
    order: 169,
    status: 'published',
  },
  {
    slug: 'suggest-retry-logic-b2',
    title: 'Suggest a Pattern: Configurable Retry Logic',
    mode: 'suggest',
    difficulty: 'medium',
    stem: 'An HTTP client needs retry logic. Different callers want different backoff strategies: immediate, fixed-delay, or exponential. The retry count and delay formula should be swappable at runtime. Which pattern(s)?',
    answer: 'strategy',
    choices: [],
    explanation: 'Strategy: define a IRetryStrategy interface with nextDelay(attempt). ImmediateRetry, FixedDelayRetry, ExponentialBackoff each implement it. The HTTP client holds a strategy reference and calls nextDelay() — fully swappable without touching the client.',
    problemContext: 'Your microservice calls external APIs that occasionally fail. Different teams need different retry policies: the payment team wants exponential backoff, the analytics team wants 3 immediate retries, and the notification team wants fixed 5-second delays. The retry mechanism should be injectable and testable independently of the HTTP client.',
    keyPatterns: ['strategy', 'decorator', 'chain'],
    order: 170,
    status: 'published',
  },

  // ── HARD IDENTIFY (71-85) ────────────────────────────────────────────────────
  {
    slug: 'visitor-ast-b2',
    title: 'AST Visitor in a Compiler',
    mode: 'identify',
    difficulty: 'hard',
    stem: 'A compiler has IfNode, ForNode, FunctionCallNode — each with accept(IVisitor). TypeCheckerVisitor, CodeGenVisitor, and PrinterVisitor implement different operations on the same tree without modifying node classes. Which pattern?',
    answer: 'visitor',
    choices: ['visitor', 'interpreter', 'composite', 'decorator'],
    explanation: 'Visitor separates algorithms from the object structure. Adding TypeChecker, CodeGen, or Printer requires a new Visitor class, not changes to AST nodes. Double dispatch via accept()/visit() selects the right operation for each node type.',
    order: 171,
    status: 'published',
    codeSnippets: {
      java: `interface ASTVisitor {
    void visitIf(IfNode n);
    void visitFor(ForNode n);
    void visitFunctionCall(FunctionCallNode n);
}
interface ASTNode { void accept(ASTVisitor v); }
class IfNode implements ASTNode {
    ASTNode condition, body, elseBody;
    public void accept(ASTVisitor v) { v.visitIf(this); }
}
class TypeCheckerVisitor implements ASTVisitor {
    public void visitIf(IfNode n)             { /* check condition is bool */ }
    public void visitFor(ForNode n)           { /* check iterator type */ }
    public void visitFunctionCall(FunctionCallNode n) { /* check arg types */ }
}
// Adding PrinterVisitor: new class, zero AST node changes`,
      ts: `interface ASTVisitor { visitIf(n: IfNode): void; visitFor(n: ForNode): void; visitCall(n: CallNode): void }
interface ASTNode { accept(v: ASTVisitor): void }
class IfNode implements ASTNode {
  constructor(public cond: ASTNode, public body: ASTNode) {}
  accept(v: ASTVisitor) { v.visitIf(this) }
}
class TypeCheckerVisitor implements ASTVisitor {
  visitIf(n: IfNode)  { /* verify condition is boolean */ }
  visitFor(n: ForNode) { /* verify iterator */ }
  visitCall(n: CallNode) { /* check arg types */ }
}`,
      py: `class ASTVisitor:
    def visit_if(self, node): raise NotImplementedError
    def visit_for(self, node): raise NotImplementedError
    def visit_call(self, node): raise NotImplementedError
class IfNode:
    def __init__(self, cond, body): self.cond=cond; self.body=body
    def accept(self, visitor): visitor.visit_if(self)
class TypeChecker(ASTVisitor):
    def visit_if(self, node): pass   # verify cond is bool
    def visit_for(self, node): pass  # verify iterator type
    def visit_call(self, node): pass # check arg types`,
      go: `type ASTVisitor interface { VisitIf(*IfNode); VisitFor(*ForNode); VisitCall(*CallNode) }
type ASTNode interface { Accept(ASTVisitor) }
type IfNode struct { Cond, Body, Else ASTNode }
func (n *IfNode) Accept(v ASTVisitor) { v.VisitIf(n) }
type TypeChecker struct{}
func (c *TypeChecker) VisitIf(n *IfNode)     { /* check bool */ }
func (c *TypeChecker) VisitFor(n *ForNode)   { /* check iter */ }
func (c *TypeChecker) VisitCall(n *CallNode) { /* check args */ }`,
      rust: `trait ASTVisitor { fn visit_if(&mut self, n: &IfNode); fn visit_for(&mut self, n: &ForNode); fn visit_call(&mut self, n: &CallNode); }
trait ASTNode { fn accept(&self, v: &mut dyn ASTVisitor); }
struct IfNode { pub cond: Box<dyn ASTNode>, pub body: Box<dyn ASTNode> }
impl ASTNode for IfNode { fn accept(&self, v: &mut dyn ASTVisitor) { v.visit_if(self); } }
struct TypeChecker;
impl ASTVisitor for TypeChecker {
    fn visit_if(&mut self, n: &IfNode)     { /* type check */ }
    fn visit_for(&mut self, n: &ForNode)   { /* type check */ }
    fn visit_call(&mut self, n: &CallNode) { /* type check */ }
}`,
      cs: `interface IASTVisitor { void VisitIf(IfNode n); void VisitFor(ForNode n); void VisitCall(CallNode n); }
interface IASTNode { void Accept(IASTVisitor v); }
class IfNode : IASTNode { public IASTNode Cond, Body; public void Accept(IASTVisitor v) => v.VisitIf(this); }
class TypeChecker : IASTVisitor {
    public void VisitIf(IfNode n)     => Console.WriteLine("Checking if");
    public void VisitFor(ForNode n)   => Console.WriteLine("Checking for");
    public void VisitCall(CallNode n) => Console.WriteLine("Checking call");
}`,
      kotlin: `interface ASTVisitor { fun visitIf(n: IfNode); fun visitFor(n: ForNode); fun visitCall(n: CallNode) }
interface ASTNode { fun accept(v: ASTVisitor) }
class IfNode(val cond: ASTNode, val body: ASTNode) : ASTNode { override fun accept(v: ASTVisitor) = v.visitIf(this) }
class TypeChecker : ASTVisitor {
    override fun visitIf(n: IfNode)    = println("type-check if")
    override fun visitFor(n: ForNode)  = println("type-check for")
    override fun visitCall(n: CallNode) = println("type-check call")
}`,
      swift: `protocol ASTVisitor { func visitIf(_ n: IfNode); func visitFor(_ n: ForNode); func visitCall(_ n: CallNode) }
protocol ASTNode { func accept(_ v: ASTVisitor) }
class IfNode: ASTNode { let cond, body: ASTNode; init(cond: ASTNode, body: ASTNode) { self.cond=cond; self.body=body }; func accept(_ v: ASTVisitor) { v.visitIf(self) } }
class TypeChecker: ASTVisitor {
    func visitIf(_ n: IfNode)    { /* check bool cond */ }
    func visitFor(_ n: ForNode)  { /* check iter */ }
    func visitCall(_ n: CallNode) { /* check args */ }
}`,
      js: `class IfNode { constructor(cond, body) { this.cond=cond; this.body=body }; accept(v) { v.visitIf(this) } }
class TypeChecker {
  visitIf(n)    { /* verify condition is boolean */ }
  visitFor(n)   { /* verify iterator */ }
  visitCall(n)  { /* check arg types */ }
}
// Usage: ast.accept(new TypeChecker())  OR  ast.accept(new CodeGenVisitor())`,
      rb: `class IfNode
  attr_reader :cond, :body
  def initialize(cond, body) = (@cond=cond; @body=body)
  def accept(visitor) = visitor.visit_if(self)
end
class TypeChecker
  def visit_if(n)   = puts 'type-check if'
  def visit_for(n)  = puts 'type-check for'
  def visit_call(n) = puts 'type-check call'
end`,
      php: `interface ASTVisitor { public function visitIf(IfNode $n): void; public function visitFor(ForNode $n): void; public function visitCall(CallNode $n): void; }
class IfNode { public function __construct(public ASTNode $cond, public ASTNode $body) {}; public function accept(ASTVisitor $v): void { $v->visitIf($this); } }
class TypeChecker implements ASTVisitor {
    public function visitIf(IfNode $n): void    { echo "type-check if\n"; }
    public function visitFor(ForNode $n): void  { echo "type-check for\n"; }
    public function visitCall(CallNode $n): void { echo "type-check call\n"; }
}`,
      cpp: `struct ASTVisitor { virtual void visitIf(struct IfNode&)=0; virtual void visitFor(struct ForNode&)=0; };
struct ASTNode { virtual void accept(ASTVisitor& v)=0; };
struct IfNode : ASTNode { ASTNode *cond, *body; void accept(ASTVisitor& v) override { v.visitIf(*this); } };
struct TypeChecker : ASTVisitor {
    void visitIf(IfNode& n)   override { /* type check */ }
    void visitFor(ForNode& n) override { /* type check */ }
};`,
    },
  },
  {
    slug: 'decorator-io-b2',
    title: 'Stacked IO Stream Decorators',
    mode: 'identify',
    difficulty: 'hard',
    stem: 'new GzipStream(new EncryptedStream(new BufferedStream(new FileStream("data.bin")))).write(data) — each layer adds its own transformation transparently. Which pattern?',
    answer: 'decorator',
    choices: ['decorator', 'chain', 'composite', 'proxy'],
    explanation: 'Classic IO Decorator stack. Each stream implements the same interface and wraps the next one. Transformations stack transparently — callers cannot distinguish layers. This is the original GoF Decorator example.',
    order: 172,
    status: 'published',
    codeSnippets: {
      java: `interface Stream { void write(byte[] data); byte[] read(); }
class FileStream   implements Stream { /* raw I/O */ }
class BufferedStream implements Stream {
    private Stream inner; private byte[] buf = new byte[8192];
    BufferedStream(Stream s) { inner = s; }
    public void write(byte[] d) { /* buffer and flush */ inner.write(buf); }
    public byte[] read()        { return inner.read(); }
}
class GzipStream implements Stream {
    private Stream inner;
    GzipStream(Stream s) { inner = s; }
    public void write(byte[] d) { inner.write(gzip(d)); }
    public byte[] read()        { return gunzip(inner.read()); }
}
// Stack: new GzipStream(new BufferedStream(new FileStream("out.bin"))).write(data)`,
      ts: `interface Stream { write(data: Uint8Array): void; read(): Uint8Array }
class FileStream  implements Stream { /* raw I/O */ write(d:Uint8Array){} read(){return new Uint8Array()} }
class GzipStream  implements Stream {
  constructor(private inner: Stream) {}
  write(data: Uint8Array) { this.inner.write(compress(data)) }
  read(): Uint8Array      { return decompress(this.inner.read()) }
}
class EncryptedStream implements Stream {
  constructor(private inner: Stream) {}
  write(data: Uint8Array) { this.inner.write(encrypt(data)) }
  read(): Uint8Array      { return decrypt(this.inner.read()) }
}`,
      py: `class FileStream:
    def write(self, data: bytes): pass  # raw I/O
    def read(self) -> bytes: return b''

class GzipStream:
    def __init__(self, inner): self._inner = inner
    def write(self, data: bytes): self._inner.write(gzip.compress(data))
    def read(self) -> bytes:      return gzip.decompress(self._inner.read())

class EncryptedStream:
    def __init__(self, inner): self._inner = inner
    def write(self, data: bytes): self._inner.write(encrypt(data))
    def read(self) -> bytes:      return decrypt(self._inner.read())`,
      go: `type Stream interface { Write([]byte) error; Read() ([]byte, error) }
type GzipStream struct { inner Stream }
func (s *GzipStream) Write(data []byte) error {
    compressed := compress(data)
    return s.inner.Write(compressed)
}
type EncryptedStream struct { inner Stream }
func (s *EncryptedStream) Write(data []byte) error { return s.inner.Write(encrypt(data)) }`,
      rust: `trait Stream { fn write(&mut self, data: &[u8]); fn read(&mut self) -> Vec<u8>; }
struct GzipStream { inner: Box<dyn Stream> }
impl Stream for GzipStream {
    fn write(&mut self, data: &[u8]) { self.inner.write(&gzip_compress(data)); }
    fn read(&mut self) -> Vec<u8>    { gzip_decompress(&self.inner.read()) }
}
struct EncryptStream { inner: Box<dyn Stream> }
impl Stream for EncryptStream {
    fn write(&mut self, data: &[u8]) { self.inner.write(&encrypt(data)); }
    fn read(&mut self) -> Vec<u8>    { decrypt(&self.inner.read()) }
}`,
      cs: `interface IStream { void Write(byte[] data); byte[] Read(); }
class GzipStream : IStream {
    IStream _inner;
    public GzipStream(IStream s) { _inner = s; }
    public void Write(byte[] d) => _inner.Write(GzipCompress(d));
    public byte[] Read()        => GzipDecompress(_inner.Read());
}
class EncryptStream : IStream {
    IStream _inner;
    public EncryptStream(IStream s) { _inner = s; }
    public void Write(byte[] d) => _inner.Write(Encrypt(d));
    public byte[] Read()        => Decrypt(_inner.Read());
}`,
      kotlin: `interface Stream { fun write(data: ByteArray); fun read(): ByteArray }
class GzipStream(private val inner: Stream) : Stream {
    override fun write(data: ByteArray) = inner.write(gzipCompress(data))
    override fun read(): ByteArray      = gzipDecompress(inner.read())
}
class EncryptStream(private val inner: Stream) : Stream {
    override fun write(data: ByteArray) = inner.write(encrypt(data))
    override fun read(): ByteArray      = decrypt(inner.read())
}`,
      swift: `protocol Stream { func write(_ data: Data); func read() -> Data }
class GzipStream: Stream {
    let inner: Stream; init(_ s: Stream) { inner = s }
    func write(_ data: Data) { inner.write(gzipCompress(data)) }
    func read() -> Data      { gzipDecompress(inner.read()) }
}
class EncryptStream: Stream {
    let inner: Stream; init(_ s: Stream) { inner = s }
    func write(_ data: Data) { inner.write(encrypt(data)) }
    func read() -> Data      { decrypt(inner.read()) }
}`,
      js: `class GzipStream {
  constructor(inner) { this.inner = inner }
  write(data) { this.inner.write(gzipCompress(data)) }
  read()      { return gzipDecompress(this.inner.read()) }
}
class EncryptStream {
  constructor(inner) { this.inner = inner }
  write(data) { this.inner.write(encrypt(data)) }
  read()      { return decrypt(this.inner.read()) }
}
// Usage: new GzipStream(new EncryptStream(new FileStream('out.bin'))).write(data)`,
      rb: `class GzipStream
  def initialize(inner) = @inner = inner
  def write(data) = @inner.write(Zlib.deflate(data))
  def read       = Zlib.inflate(@inner.read)
end
class EncryptStream
  def initialize(inner) = @inner = inner
  def write(data) = @inner.write(encrypt(data))
  def read       = decrypt(@inner.read)
end`,
      php: `interface Stream { public function write(string $data): void; public function read(): string; }
class GzipStream implements Stream {
    public function __construct(private Stream $inner) {}
    public function write(string $data): void { $this->inner->write(gzcompress($data)); }
    public function read(): string { return gzuncompress($this->inner->read()); }
}
class EncryptStream implements Stream {
    public function __construct(private Stream $inner) {}
    public function write(string $data): void { $this->inner->write(openssl_encrypt($data, 'AES-256-CBC', KEY, 0, IV)); }
    public function read(): string { return openssl_decrypt($this->inner->read(), 'AES-256-CBC', KEY, 0, IV); }
}`,
      cpp: `class Stream { public: virtual void write(const std::vector<uint8_t>&)=0; virtual std::vector<uint8_t> read()=0; };
class GzipStream : public Stream {
    Stream* inner;
public: GzipStream(Stream* s) : inner(s) {}
    void write(const std::vector<uint8_t>& d) override { inner->write(gzip_compress(d)); }
    std::vector<uint8_t> read() override { return gzip_decompress(inner->read()); }
};`,
    },
  },
  {
    slug: 'observer-reactive-b2',
    title: 'Reactive Stream (Observer + Iterator)',
    mode: 'identify',
    difficulty: 'hard',
    stem: 'Observable.from([1,2,3]).map(x => x*2).filter(x => x>2).subscribe(handler). Values are pushed asynchronously; operators are composable. Which foundational pattern does this implement?',
    answer: 'observer',
    choices: ['observer', 'iterator', 'chain', 'decorator'],
    explanation: 'Reactive streams (RxJS, Project Reactor) are a fusion of Observer (push-based async notification) and Iterator (sequential element processing). The subscribe() call registers an Observer. Each operator is a Decorator over the stream.',
    order: 173,
    status: 'published',
    codeSnippets: {
      java: `// Reactive streams = Observer + functional composition (Reactor / RxJava)
Flux.fromIterable(List.of(1, 2, 3))
    .map(x -> x * 2)
    .filter(x -> x > 2)
    .subscribe(
        value -> System.out.println("next: " + value),
        error -> System.err.println("error: " + error),
        ()    -> System.out.println("complete")
    );
// subscribe() = Observer.update()
// Publisher notifies Subscriber asynchronously`,
      ts: `// RxJS: Observable = push-based Observer with functional operators
import { from } from 'rxjs'
import { map, filter } from 'rxjs/operators'

from([1, 2, 3])
  .pipe(
    map(x => x * 2),
    filter(x => x > 2),
  )
  .subscribe({
    next:     v => console.log('next:', v),
    error:    e => console.error('error:', e),
    complete: () => console.log('complete'),
  })`,
      py: `# RxPY — Observer pattern with functional composition
from rx import from_iterable
from rx import operators as ops

from_iterable([1, 2, 3]).pipe(
    ops.map(lambda x: x * 2),
    ops.filter(lambda x: x > 2),
).subscribe(
    on_next=lambda v: print('next:', v),
    on_error=lambda e: print('error:', e),
    on_completed=lambda: print('complete'),
)`,
      go: `// Go channels + goroutines implement reactive-stream semantics
func MapFilter(in <-chan int, mapFn func(int) int, filterFn func(int) bool) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for v := range in {
            mapped := mapFn(v)
            if filterFn(mapped) { out <- mapped }
        }
    }()
    return out
}`,
      rust: `// futures::Stream: async Observer/Iterator hybrid
use futures::StreamExt;
futures::stream::iter(vec![1, 2, 3])
    .map(|x| x * 2)
    .filter(|&x| async move { x > 2 })
    .for_each(|v| async move { println!("next: {}", v) })
    .await;`,
      cs: `// System.Reactive (Rx.NET)
Observable.Range(1, 3)
    .Select(x => x * 2)
    .Where(x => x > 2)
    .Subscribe(
        v  => Console.WriteLine($"next: {v}"),
        e  => Console.Error.WriteLine($"error: {e}"),
        () => Console.WriteLine("complete")
    );`,
      kotlin: `// Kotlin Flow: cold stream (Observer + coroutines)
flowOf(1, 2, 3)
    .map { it * 2 }
    .filter { it > 2 }
    .collect { v -> println("next: $v") }`,
      swift: `// Combine framework — Publisher/Subscriber = Observer
[1, 2, 3].publisher
    .map { $0 * 2 }
    .filter { $0 > 2 }
    .sink(
        receiveCompletion: { _ in print("complete") },
        receiveValue:      { print("next: \($0)") }
    )
    .store(in: &cancellables)`,
      js: `// RxJS Observable — subscribe() is Observer.update()
import { from } from 'rxjs'
import { map, filter } from 'rxjs/operators'
from([1, 2, 3])
  .pipe(map(x => x * 2), filter(x => x > 2))
  .subscribe(v => console.log('next:', v))`,
      rb: `# RxRuby observable pipeline
require 'rx'
Rx::Observable.from_array([1, 2, 3])
  .map { |x| x * 2 }
  .filter { |x| x > 2 }
  .subscribe(
    lambda { |v| puts "next: #{v}" },
    lambda { |e| puts "error: #{e}" },
    lambda { puts 'complete' }
  )`,
      php: `// ReactPHP streams implement Observer semantics
$stream = new ThroughStream();
$stream->on('data', function ($data) {
    // Observer::update() equivalent
    $doubled = $data * 2;
    if ($doubled > 2) echo "next: $doubled\n";
});
$stream->write(1); $stream->write(2); $stream->write(3);`,
      cpp: `// C++20 ranges — lazy functional pipeline (Iterator pattern)
#include <ranges>
auto result = std::vector{1, 2, 3}
    | std::views::transform([](int x){ return x * 2; })
    | std::views::filter([](int x){ return x > 2; });
for (int v : result) std::cout << "next: " << v << "\n";`,
    },
  },
  {
    slug: 'abstract-factory-os-b2',
    title: 'OS-Specific Widget Factory',
    mode: 'identify',
    difficulty: 'hard',
    stem: 'Application uses IWidgetFactory to create dialogs, buttons, and scrollbars. At startup, WindowsWidgetFactory or MacWidgetFactory is injected based on the OS. All created widgets work together. Which pattern?',
    answer: 'abstract-factory',
    choices: ['abstract-factory', 'factory', 'bridge', 'strategy'],
    explanation: 'Abstract Factory creates families of related products (Window widget set vs Mac widget set) that are guaranteed to work together. The factory is injected, so the client never references any concrete widget class.',
    order: 174,
    status: 'published',
    codeSnippets: {
      java: `interface IWidgetFactory {
    IDialog createDialog(); IButton createButton(); IScrollbar createScrollbar();
}
class WindowsWidgetFactory implements IWidgetFactory {
    public IDialog    createDialog()    { return new WinDialog(); }
    public IButton    createButton()    { return new WinButton(); }
    public IScrollbar createScrollbar() { return new WinScrollbar(); }
}
class MacWidgetFactory implements IWidgetFactory {
    public IDialog    createDialog()    { return new MacDialog(); }
    public IButton    createButton()    { return new MacButton(); }
    public IScrollbar createScrollbar() { return new MacScrollbar(); }
}
class Application {
    IWidgetFactory factory;
    Application(IWidgetFactory f) { factory = f; }
    void buildUI() { factory.createDialog().show(); factory.createButton().click(); }
}`,
      ts: `interface WidgetFactory { createDialog(): Dialog; createButton(): Button; createScrollbar(): Scrollbar }
class WindowsWidgetFactory implements WidgetFactory {
  createDialog()    { return new WinDialog() }
  createButton()    { return new WinButton() }
  createScrollbar() { return new WinScrollbar() }
}
class MacWidgetFactory implements WidgetFactory {
  createDialog()    { return new MacDialog() }
  createButton()    { return new MacButton() }
  createScrollbar() { return new MacScrollbar() }
}
class Application {
  constructor(private factory: WidgetFactory) {}
  buildUI() { this.factory.createDialog().show(); this.factory.createButton().render() }
}`,
      py: `from abc import ABC, abstractmethod
class WidgetFactory(ABC):
    @abstractmethod
    def create_dialog(self): pass
    @abstractmethod
    def create_button(self): pass
    @abstractmethod
    def create_scrollbar(self): pass
class WindowsWidgetFactory(WidgetFactory):
    def create_dialog(self):    return WinDialog()
    def create_button(self):    return WinButton()
    def create_scrollbar(self): return WinScrollbar()
class Application:
    def __init__(self, factory: WidgetFactory): self.factory = factory
    def build(self): self.factory.create_dialog().show()`,
      go: `type WidgetFactory interface { CreateDialog() Dialog; CreateButton() Button }
type WinFactory struct{}
func (f *WinFactory) CreateDialog() Dialog { return &WinDialog{} }
func (f *WinFactory) CreateButton() Button { return &WinButton{} }
type MacFactory struct{}
func (f *MacFactory) CreateDialog() Dialog { return &MacDialog{} }
func (f *MacFactory) CreateButton() Button { return &MacButton{} }`,
      rust: `trait WidgetFactory { fn create_dialog(&self) -> Box<dyn Dialog>; fn create_button(&self) -> Box<dyn Button>; }
struct WinFactory;
impl WidgetFactory for WinFactory {
    fn create_dialog(&self) -> Box<dyn Dialog> { Box::new(WinDialog) }
    fn create_button(&self) -> Box<dyn Button> { Box::new(WinButton) }
}
struct MacFactory;
impl WidgetFactory for MacFactory {
    fn create_dialog(&self) -> Box<dyn Dialog> { Box::new(MacDialog) }
    fn create_button(&self) -> Box<dyn Button> { Box::new(MacButton) }
}`,
      cs: `interface IWidgetFactory { IDialog CreateDialog(); IButton CreateButton(); }
class WindowsWidgetFactory : IWidgetFactory {
    public IDialog CreateDialog() => new WinDialog();
    public IButton CreateButton() => new WinButton();
}
class MacWidgetFactory : IWidgetFactory {
    public IDialog CreateDialog() => new MacDialog();
    public IButton CreateButton() => new MacButton();
}
class Application { IWidgetFactory _f; Application(IWidgetFactory f) { _f = f; } }`,
      kotlin: `interface WidgetFactory { fun createDialog(): Dialog; fun createButton(): Button }
class WindowsWidgetFactory : WidgetFactory {
    override fun createDialog() = WinDialog()
    override fun createButton() = WinButton()
}
class MacWidgetFactory : WidgetFactory {
    override fun createDialog() = MacDialog()
    override fun createButton() = MacButton()
}`,
      swift: `protocol WidgetFactory { func createDialog() -> Dialog; func createButton() -> Button }
class WindowsWidgetFactory: WidgetFactory {
    func createDialog() -> Dialog { WinDialog() }
    func createButton() -> Button { WinButton() }
}
class MacWidgetFactory: WidgetFactory {
    func createDialog() -> Dialog { MacDialog() }
    func createButton() -> Button { MacButton() }
}`,
      js: `class WindowsWidgetFactory {
  createDialog()    { return new WinDialog() }
  createButton()    { return new WinButton() }
  createScrollbar() { return new WinScrollbar() }
}
class MacWidgetFactory {
  createDialog()    { return new MacDialog() }
  createButton()    { return new MacButton() }
  createScrollbar() { return new MacScrollbar() }
}`,
      rb: `class WindowsWidgetFactory
  def create_dialog    = WinDialog.new
  def create_button    = WinButton.new
  def create_scrollbar = WinScrollbar.new
end
class MacWidgetFactory
  def create_dialog    = MacDialog.new
  def create_button    = MacButton.new
  def create_scrollbar = MacScrollbar.new
end`,
      php: `interface WidgetFactory { public function createDialog(): Dialog; public function createButton(): Button; }
class WindowsWidgetFactory implements WidgetFactory {
    public function createDialog(): Dialog { return new WinDialog(); }
    public function createButton(): Button { return new WinButton(); }
}
class MacWidgetFactory implements WidgetFactory {
    public function createDialog(): Dialog { return new MacDialog(); }
    public function createButton(): Button { return new MacButton(); }
}`,
      cpp: `struct WidgetFactory { virtual Dialog* createDialog()=0; virtual Button* createButton()=0; };
class WinFactory : public WidgetFactory { Dialog* createDialog() override { return new WinDialog; } Button* createButton() override { return new WinButton; } };
class MacFactory : public WidgetFactory { Dialog* createDialog() override { return new MacDialog; } Button* createButton() override { return new MacButton; } };`,
    },
  },
  {
    slug: 'memento-git-b2',
    title: 'Git Commit History as Memento Stack',
    mode: 'identify',
    difficulty: 'hard',
    stem: 'A version control system saves a Snapshot (commit) before each change. Rolling back to any commit restores the repo to that exact state. The Snapshot stores state the Repository exposed. Which pattern?',
    answer: 'memento',
    choices: ['memento', 'command', 'prototype', 'state'],
    explanation: 'Memento: the Originator (Repository) creates Mementos (commits/snapshots) that capture its state. The Caretaker (CommitLog) stores them without inspecting. Checkout restores state from a Memento.',
    order: 175,
    status: 'published',
    codeSnippets: {
      java: `class RepoSnapshot {
    private final Map<String, String> files; // immutable — caretaker cannot modify
    RepoSnapshot(Map<String, String> files) { this.files = new HashMap<>(files); }
    Map<String, String> getFiles() { return Collections.unmodifiableMap(files); }
}
class Repository {
    private Map<String, String> files = new HashMap<>();
    public RepoSnapshot commit() { return new RepoSnapshot(files); }
    public void checkout(RepoSnapshot snap) { files = new HashMap<>(snap.getFiles()); }
    public void writeFile(String path, String content) { files.put(path, content); }
}
class CommitLog {  // Caretaker
    private List<RepoSnapshot> history = new ArrayList<>();
    public void save(RepoSnapshot s) { history.add(s); }
    public RepoSnapshot get(int idx)  { return history.get(idx); }
}`,
      ts: `class RepoSnapshot {
  constructor(private readonly files: ReadonlyMap<string, string>) {}
  getFiles(): ReadonlyMap<string, string> { return this.files }
}
class Repository {
  private files = new Map<string, string>()
  commit(): RepoSnapshot   { return new RepoSnapshot(new Map(this.files)) }
  checkout(s: RepoSnapshot) { this.files = new Map(s.getFiles()) }
  writeFile(path: string, content: string) { this.files.set(path, content) }
}
class CommitLog {
  private history: RepoSnapshot[] = []
  save(s: RepoSnapshot)        { this.history.push(s) }
  get(idx: number): RepoSnapshot { return this.history[idx] }
}`,
      py: `class RepoSnapshot:
    def __init__(self, files: dict): self._files = dict(files)  # deep copy
    def get_files(self) -> dict:     return dict(self._files)   # immutable view
class Repository:
    def __init__(self): self._files: dict = {}
    def commit(self) -> RepoSnapshot:       return RepoSnapshot(self._files)
    def checkout(self, snap: RepoSnapshot): self._files = snap.get_files()
    def write(self, path, content):         self._files[path] = content
class CommitLog:
    def __init__(self): self._history = []
    def save(self, snap): self._history.append(snap)
    def get(self, idx):   return self._history[idx]`,
      go: `type Snapshot struct { files map[string]string }
type Repository struct { files map[string]string }
func (r *Repository) Commit() Snapshot {
    copy := make(map[string]string)
    for k, v := range r.files { copy[k] = v }
    return Snapshot{files: copy}
}
func (r *Repository) Checkout(s Snapshot) {
    r.files = make(map[string]string)
    for k, v := range s.files { r.files[k] = v }
}`,
      rust: `use std::collections::HashMap;
struct Snapshot { files: HashMap<String, String> }
struct Repository { files: HashMap<String, String> }
impl Repository {
    fn commit(&self) -> Snapshot { Snapshot { files: self.files.clone() } }
    fn checkout(&mut self, s: Snapshot) { self.files = s.files; }
    fn write(&mut self, path: &str, content: &str) { self.files.insert(path.into(), content.into()); }
}`,
      cs: `class Snapshot { public IReadOnlyDictionary<string,string> Files { get; }
    public Snapshot(Dictionary<string,string> f) { Files = new Dictionary<string,string>(f); } }
class Repository {
    Dictionary<string,string> files = new();
    public Snapshot Commit()              => new(files);
    public void Checkout(Snapshot s)      => files = new(s.Files);
    public void Write(string p, string c) => files[p] = c;
}`,
      kotlin: `data class Snapshot(val files: Map<String, String>)
class Repository {
    private val files = mutableMapOf<String, String>()
    fun commit()                 = Snapshot(files.toMap())
    fun checkout(s: Snapshot)    { files.clear(); files.putAll(s.files) }
    fun write(path: String, c: String) { files[path] = c }
}`,
      swift: `struct Snapshot { let files: [String: String] }
class Repository {
    private var files = [String: String]()
    func commit() -> Snapshot         { Snapshot(files: files) }
    func checkout(_ s: Snapshot)      { files = s.files }
    func write(_ path: String, _ c: String) { files[path] = c }
}`,
      js: `class Repository {
  #files = new Map()
  commit()        { return new Map(this.#files) }  // snapshot
  checkout(snap)  { this.#files = new Map(snap) }
  write(path, c)  { this.#files.set(path, c) }
}`,
      rb: `class Snapshot
  def initialize(files) = @files = files.dup
  def get = @files.dup
end
class Repository
  def initialize = @files = {}
  def commit     = Snapshot.new(@files)
  def checkout(snap) = @files = snap.get
  def write(path, c) = @files[path] = c
end`,
      php: `class Snapshot { public function __construct(private array $files) {}; public function getFiles(): array { return $this->files; } }
class Repository {
    private array $files = [];
    public function commit(): Snapshot      { return new Snapshot($this->files); }
    public function checkout(Snapshot $s): void { $this->files = $s->getFiles(); }
    public function write(string $p, string $c): void { $this->files[$p] = $c; }
}`,
      cpp: `struct Snapshot { std::map<std::string, std::string> files; };
class Repository {
    std::map<std::string, std::string> files;
public:
    Snapshot commit()                       { return {files}; }
    void checkout(const Snapshot& s)        { files = s.files; }
    void write(const std::string& p, const std::string& c) { files[p] = c; }
};`,
    },
  },

  // ── HARD DETECT (86-90) ──────────────────────────────────────────────────────
  {
    slug: 'detect-god-class-b2',
    title: 'God Class Anti-Pattern',
    mode: 'detect',
    difficulty: 'hard',
    stem: 'A single class handles authentication, user CRUD, order management, payment processing, email sending, and report generation. Is this a design pattern?',
    answer: 'none',
    choices: ['none', 'facade', 'mediator', 'singleton'],
    explanation: 'A God Class (or God Object) is a classic anti-pattern — it accumulates too many responsibilities, violating SRP. It is often confused with Facade, but a Facade deliberately delegates to subsystems while a God Class implements everything itself.',
    order: 186,
    status: 'published',
    codeSnippets: {
      java: `// God Class anti-pattern — NOT a design pattern
class ApplicationManager {
    // Authentication
    public User login(String user, String pass) { /* ... */ return null; }
    public void logout(String sessionId) { /* ... */ }
    // User management
    public User createUser(UserDTO dto) { /* DB insert + email */ return null; }
    public void deleteUser(Long id)     { /* cascade delete */ }
    // Order management
    public Order placeOrder(Cart cart, Long userId) { /* complex logic */ return null; }
    public void cancelOrder(Long orderId) { /* refund + inventory */ }
    // Payment
    public Receipt charge(Order o, PaymentMethod m) { /* call gateway */ return null; }
    public void refund(Long receiptId) { /* ... */ }
    // Email
    public void sendWelcomeEmail(User u) { /* smtp */ }
    public void sendOrderConfirmation(Order o) { /* smtp */ }
    // Reports
    public byte[] generateSalesReport(DateRange r) { /* PDF */ return null; }
    // ... 20 more methods
}`,
      ts: `// God Class: one class does everything — anti-pattern
class ApplicationManager {
  // Auth
  login(user: string, pass: string): User { return null! }
  logout(sessionId: string): void {}
  // Users
  createUser(dto: UserDTO): User { return null! }
  deleteUser(id: number): void {}
  // Orders
  placeOrder(cart: Cart, userId: number): Order { return null! }
  cancelOrder(orderId: number): void {}
  // Payments
  charge(order: Order, method: PaymentMethod): Receipt { return null! }
  refund(receiptId: number): void {}
  // Email
  sendWelcomeEmail(user: User): void {}
  sendOrderConfirmation(order: Order): void {}
  // Reports
  generateSalesReport(range: DateRange): Buffer { return null! }
  // ...20 more methods — this is a God Class
}`,
      py: `# God Class anti-pattern
class ApplicationManager:
    # Auth
    def login(self, user, password): pass
    def logout(self, session_id): pass
    # Users
    def create_user(self, dto): pass
    def delete_user(self, id): pass
    # Orders
    def place_order(self, cart, user_id): pass
    def cancel_order(self, order_id): pass
    # Payments
    def charge(self, order, method): pass
    def refund(self, receipt_id): pass
    # Email
    def send_welcome_email(self, user): pass
    # Reports
    def generate_sales_report(self, range): pass
    # Hundreds of lines, no clear boundary — God Class`,
      go: `// God struct — anti-pattern
type AppManager struct {
    db       *sql.DB
    mailer   *Mailer
    gateway  *PaymentGateway
    reporter *Reporter
}
// Has 50+ methods: Login, Logout, CreateUser, DeleteUser,
// PlaceOrder, CancelOrder, Charge, Refund, SendWelcome, GenerateReport...
// One struct doing everything = God Object`,
      rust: `// God struct — one struct ruling everything
struct AppManager { db: Pool, mailer: Mailer, gateway: Gateway }
impl AppManager {
    fn login(&self, u: &str, p: &str) -> User { todo!() }
    fn logout(&self, sid: &str) { todo!() }
    fn create_user(&self, dto: UserDTO) -> User { todo!() }
    fn place_order(&self, cart: Cart, uid: u64) -> Order { todo!() }
    fn charge(&self, order: &Order, method: PaymentMethod) -> Receipt { todo!() }
    fn send_email(&self, to: &str, subject: &str, body: &str) { todo!() }
    fn generate_report(&self, range: DateRange) -> Vec<u8> { todo!() }
    // Dozens more methods — God Class
}`,
      cs: `// God Class — anti-pattern
class ApplicationManager {
    // Authentication, UserCRUD, Orders, Payments, Email, Reports — all here!
    public User Login(string u, string p)            => default!;
    public void Logout(string sid)                   => default;
    public User CreateUser(UserDTO dto)              => default!;
    public Order PlaceOrder(Cart c, long userId)     => default!;
    public Receipt Charge(Order o, PayMethod m)      => default!;
    public void SendWelcomeEmail(User u)             => default;
    public byte[] GenerateSalesReport(DateRange r)   => default!;
    // 30+ more methods — this class has 10 reasons to change
}`,
      kotlin: `// God object — anti-pattern
class ApplicationManager(val db: DB, val mailer: Mailer, val gw: Gateway) {
    fun login(u: String, p: String): User = error("not impl")
    fun logout(sid: String) {}
    fun createUser(dto: UserDTO): User = error("not impl")
    fun placeOrder(cart: Cart, uid: Long): Order = error("not impl")
    fun charge(order: Order, method: PayMethod): Receipt = error("not impl")
    fun sendWelcomeEmail(user: User) {}
    fun generateSalesReport(range: DateRange): ByteArray = ByteArray(0)
    // One class, 10+ responsibilities — God Class
}`,
      swift: `// God class — anti-pattern
class ApplicationManager {
    func login(user: String, password: String) -> User? { nil }
    func logout(sessionId: String) {}
    func createUser(dto: UserDTO) -> User? { nil }
    func placeOrder(cart: Cart, userId: Int) -> Order? { nil }
    func charge(order: Order, method: PaymentMethod) -> Receipt? { nil }
    func sendWelcomeEmail(user: User) {}
    func generateSalesReport(range: DateRange) -> Data { Data() }
    // 7+ responsibilities — God Class anti-pattern
}`,
      js: `// God Class — anti-pattern
class ApplicationManager {
  login(user, pass)           { /* auth logic */ }
  logout(sessionId)           { /* session destroy */ }
  createUser(dto)             { /* db + email */ }
  placeOrder(cart, userId)    { /* inventory + payment */ }
  charge(order, method)       { /* payment gateway */ }
  sendWelcomeEmail(user)      { /* SMTP */ }
  generateSalesReport(range)  { /* PDF generation */ }
  // 30+ methods, 0 separation of concerns
}`,
      rb: `# God Class — anti-pattern
class ApplicationManager
  def login(user, pass)          = Auth.new.login(user, pass) rescue nil
  def logout(sid)                = sessions.delete(sid)
  def create_user(dto)           = (UserRepository.create(dto); Mailer.welcome(dto))
  def place_order(cart, user_id) = Order.create(cart, user_id)
  def charge(order, method)      = PaymentGateway.charge(order, method)
  def send_welcome_email(user)   = Mailer.deliver(user.email, :welcome)
  def generate_sales_report(r)   = SalesReport.generate(r)
  # Hundreds of lines — God Class
end`,
      php: `class ApplicationManager {
    // God Class — anti-pattern: handles auth, users, orders, payments, email, reports
    public function login(string $u, string $p): ?User    { /* auth */ return null; }
    public function logout(string $sid): void              { /* clear session */ }
    public function createUser(UserDTO $dto): User         { /* insert + email */ return new User(); }
    public function placeOrder(Cart $cart, int $uid): Order{ /* complex */ return new Order(); }
    public function charge(Order $o, PayMethod $m): Receipt{ /* gateway */ return new Receipt(); }
    public function sendWelcomeEmail(User $u): void        { /* smtp */ }
    public function generateSalesReport(DateRange $r): string { /* pdf */ return ''; }
    // 10 reasons to change = 10 SRP violations
}`,
      cpp: `// God Class anti-pattern
class ApplicationManager {
public:
    User login(const std::string& u, const std::string& p);
    void logout(const std::string& sessionId);
    User createUser(const UserDTO& dto);
    void deleteUser(long id);
    Order placeOrder(const Cart& c, long userId);
    void cancelOrder(long orderId);
    Receipt charge(const Order& o, const PaymentMethod& m);
    void refund(long receiptId);
    void sendWelcomeEmail(const User& u);
    std::vector<uint8_t> generateReport(const DateRange& r);
    // 50+ methods — God Class
};`,
    },
  },
  {
    slug: 'detect-anemic-domain-b2',
    title: 'Anemic Domain Model',
    mode: 'detect',
    difficulty: 'hard',
    stem: 'Order is a plain data bag with getters/setters. All business logic (place, cancel, refund) lives in OrderService. Is this a design pattern?',
    answer: 'none',
    choices: ['none', 'strategy', 'state', 'facade'],
    explanation: 'Anemic Domain Model is an anti-pattern (Martin Fowler). Domain objects are data bags; services contain all logic. This is procedural code in OOP clothing — it breaks encapsulation, makes invariants hard to enforce, and misses the benefits of rich domain models.',
    order: 187,
    status: 'published',
    codeSnippets: {
      java: `// ANEMIC domain model — anti-pattern
class Order {
    private Long id; private String status; private double total;
    private List<OrderItem> items;
    // Only getters/setters — no business logic!
    public Long getId()         { return id; }
    public void setId(Long id)  { this.id = id; }
    public String getStatus()   { return status; }
    public void setStatus(String s) { this.status = s; }  // no validation!
    // ... more getters/setters
}
// All logic shoved into a service — procedural style
class OrderService {
    public void placeOrder(Order o) { o.setStatus("PLACED"); /* validate, charge, notify */ }
    public void cancelOrder(Order o) { o.setStatus("CANCELLED"); /* refund logic */ }
    public void refund(Order o)     { o.setStatus("REFUNDED"); /* gateway call */ }
}`,
      ts: `// Anemic domain — anti-pattern
class Order {
  id!: number; status!: string; total!: number; items: OrderItem[] = []
  // Only data, no behavior
}
// All business logic in a service
class OrderService {
  placeOrder(order: Order, userId: number): void {
    order.status = 'PLACED'   // directly mutating — no encapsulation
    // charge payment, notify user...
  }
  cancelOrder(order: Order): void { order.status = 'CANCELLED' }
  refund(order: Order): void      { order.status = 'REFUNDED' }
}`,
      py: `# Anemic domain — anti-pattern
class Order:
    def __init__(self): self.id = None; self.status = None; self.total = 0.0; self.items = []
    # Only data — no methods, no invariants enforced

class OrderService:
    def place_order(self, order: Order): order.status = 'PLACED'   # logic outside domain
    def cancel_order(self, order: Order): order.status = 'CANCELLED'
    def refund(self, order: Order): order.status = 'REFUNDED'`,
      go: `// Anemic struct — anti-pattern
type Order struct {
    ID     int
    Status string
    Total  float64
    Items  []OrderItem
    // No methods — pure data
}
// All logic in the service
type OrderService struct{}
func (s *OrderService) Place(o *Order)  { o.Status = "PLACED" }
func (s *OrderService) Cancel(o *Order) { o.Status = "CANCELLED" }
func (s *OrderService) Refund(o *Order) { o.Status = "REFUNDED" }`,
      rust: `// Anemic struct — anti-pattern
struct Order { id: u64, status: String, total: f64, items: Vec<OrderItem> }
// All logic in a service function — not in the struct
fn place_order(order: &mut Order)  { order.status = "PLACED".into(); }
fn cancel_order(order: &mut Order) { order.status = "CANCELLED".into(); }
fn refund(order: &mut Order)       { order.status = "REFUNDED".into(); }`,
      cs: `// Anemic domain model — anti-pattern
class Order {
    public long Id { get; set; }
    public string Status { get; set; } = "";   // no validation
    public decimal Total { get; set; }
    public List<OrderItem> Items { get; set; } = new();
}
class OrderService {
    public void Place(Order o)  => o.Status = "PLACED";    // no encapsulation
    public void Cancel(Order o) => o.Status = "CANCELLED";
    public void Refund(Order o) => o.Status = "REFUNDED";
}`,
      kotlin: `// Anemic domain — anti-pattern
data class Order(var id: Long, var status: String, var total: Double, val items: MutableList<OrderItem> = mutableListOf())
// No domain logic in Order itself — all in service
class OrderService {
    fun place(order: Order)  { order.status = "PLACED" }
    fun cancel(order: Order) { order.status = "CANCELLED" }
    fun refund(order: Order) { order.status = "REFUNDED" }
}`,
      swift: `// Anemic domain — anti-pattern
class Order {
    var id: Int = 0; var status: String = ""; var total: Double = 0; var items: [OrderItem] = []
    // No business methods
}
class OrderService {
    func place(_ order: Order)  { order.status = "PLACED" }
    func cancel(_ order: Order) { order.status = "CANCELLED" }
    func refund(_ order: Order) { order.status = "REFUNDED" }
}`,
      js: `// Anemic domain — anti-pattern
class Order {
  constructor() { this.id=null; this.status=null; this.total=0; this.items=[] }
  // No business methods — pure data bag
}
class OrderService {
  place(order)  { order.status = 'PLACED' }    // logic outside domain
  cancel(order) { order.status = 'CANCELLED' }
  refund(order) { order.status = 'REFUNDED' }
}`,
      rb: `# Anemic domain — anti-pattern
class Order
  attr_accessor :id, :status, :total, :items
  def initialize = (@items = [])
  # No business methods — just data
end
class OrderService
  def place(order)  = order.status = 'PLACED'   # logic outside domain object
  def cancel(order) = order.status = 'CANCELLED'
  def refund(order) = order.status = 'REFUNDED'
end`,
      php: `// Anemic domain — anti-pattern
class Order {
    public int $id = 0; public string $status = ''; public float $total = 0;
    public array $items = [];
    // Only getters/setters — no domain behavior
}
class OrderService {
    public function place(Order $o): void  { $o->status = 'PLACED'; }    // no encapsulation
    public function cancel(Order $o): void { $o->status = 'CANCELLED'; }
    public function refund(Order $o): void { $o->status = 'REFUNDED'; }
}`,
      cpp: `// Anemic struct — anti-pattern
struct Order { long id; std::string status; double total; std::vector<OrderItem> items; };
// All logic lives outside the struct
void placeOrder(Order& o)  { o.status = "PLACED"; }
void cancelOrder(Order& o) { o.status = "CANCELLED"; }
void refundOrder(Order& o) { o.status = "REFUNDED"; }`,
    },
  },

  // ── HARD EXPLAIN (91-95) ─────────────────────────────────────────────────────
  {
    slug: 'explain-visitor-dispatch-b2',
    title: 'Why Visitor Needs Double Dispatch',
    mode: 'explain',
    difficulty: 'hard',
    stem: 'A developer wonders why Visitor uses both accept() in the element AND visit() in the visitor. Why not just one virtual call?',
    answer: 'visitor',
    choices: ['visitor', 'strategy', 'decorator', 'interpreter'],
    explanation: 'Most OO languages have single dispatch — method selection is based on ONE object\'s type. Visitor needs dispatch on BOTH the element type AND the visitor type. accept(visitor) dispatches on element type (calls the right accept override). visitor.visit(this) dispatches on visitor type (calls the right visit overload). Two virtual calls = double dispatch.',
    order: 191,
    status: 'published',
    codeSnippets: {
      java: `// Single dispatch (what Java normally does):
// method chosen based on the runtime type of ONE receiver
shape.draw();  // chooses Circle.draw() or Square.draw()

// Problem: if we add PdfExporter, HtmlExporter as visitors,
// we need to dispatch on BOTH shape type AND visitor type.

// Visitor solution — double dispatch:
interface Shape { void accept(ShapeVisitor v); }
class Circle implements Shape {
    public void accept(ShapeVisitor v) {
        v.visitCircle(this);  // Dispatch 1: element type (Circle.accept)
        // Dispatch 2: visitor type (which visitCircle overload runs)
    }
}
class AreaCalculator implements ShapeVisitor {
    public void visitCircle(Circle c)  { area = PI * c.r * c.r; }
    public void visitSquare(Square s)  { area = s.side * s.side; }
}
// shape.accept(new AreaCalculator())
// -- First dispatch picks Circle.accept (runtime type of shape)
// -- Second dispatch picks AreaCalculator.visitCircle (runtime type of visitor)`,
      ts: `// Single dispatch: JS/TS picks method based on receiver type ONLY
// shape.draw()  -> Circle.draw() or Square.draw() — fine for ONE dimension

// Double dispatch needed when behaviour depends on TWO types:
// Element type (Circle vs Square) AND operation type (Area vs Perimeter)

interface ShapeVisitor { visitCircle(c: Circle): void; visitSquare(s: Square): void }
class Circle {
  accept(v: ShapeVisitor) { v.visitCircle(this) }
  // accept() = dispatch 1 (on Circle runtime type)
  // visitCircle() = dispatch 2 (on visitor runtime type)
}`,
      py: `# Python has single dispatch (method resolution on one object)
# Visitor simulates double dispatch:

class Circle:
    def accept(self, visitor):
        visitor.visit_circle(self)   # dispatch 1: Circle.accept selected at runtime
        # dispatch 2: visitor.visit_circle selects the right visitor method

class AreaCalculator:
    def visit_circle(self, c): return 3.14 * c.radius ** 2
    def visit_square(self, s): return s.side ** 2

# circle.accept(AreaCalculator())  — two virtual calls, both runtime-resolved`,
      go: `// Go uses interfaces (dynamic dispatch via vtable)
// Visitor simulates double dispatch:
type Shape interface { Accept(ShapeVisitor) }
type ShapeVisitor interface { VisitCircle(*Circle); VisitSquare(*Square) }

type Circle struct{ Radius float64 }
func (c *Circle) Accept(v ShapeVisitor) {
    v.VisitCircle(c)
    // 1st dispatch: Circle.Accept selected (Circle implements Shape)
    // 2nd dispatch: VisitCircle called on concrete visitor
}`,
      rust: `// Rust has single dispatch via trait objects
// Visitor pattern simulates double dispatch:
trait Shape { fn accept(&self, visitor: &dyn ShapeVisitor); }
trait ShapeVisitor { fn visit_circle(&self, c: &Circle); fn visit_square(&self, s: &Square); }
struct Circle { radius: f64 }
impl Shape for Circle {
    fn accept(&self, visitor: &dyn ShapeVisitor) {
        visitor.visit_circle(self);
        // 1st dispatch: Circle::accept (trait object vtable)
        // 2nd dispatch: visitor.visit_circle (ShapeVisitor vtable)
    }
}`,
      cs: `// C# single dispatch: method chosen on ONE receiver's type
// Double dispatch via Visitor:
interface IShape { void Accept(IShapeVisitor v); }
class Circle : IShape {
    public double Radius { get; set; }
    public void Accept(IShapeVisitor v) {
        v.VisitCircle(this);
        // Dispatch 1: Circle.Accept called (runtime type of IShape reference)
        // Dispatch 2: VisitCircle called on the concrete visitor
    }
}
// shape.Accept(new AreaCalculator());
// Without double dispatch, you'd need pattern matching or if-else on type`,
      kotlin: `// Kotlin has single dispatch
// Visitor adds a second dispatch dimension:
interface ShapeVisitor { fun visitCircle(c: Circle); fun visitSquare(s: Square) }
class Circle(val radius: Double) {
    fun accept(v: ShapeVisitor) = v.visitCircle(this)
    // Dispatch 1: Circle.accept (Circle implements Shape)
    // Dispatch 2: v.visitCircle (which ShapeVisitor impl)
}
// Without double dispatch: would need 'when (shape) { is Circle -> ...' — not extensible`,
      swift: `// Swift: single dispatch via dynamic method lookup
// Visitor adds second dispatch via overloaded visit() method:
protocol ShapeVisitor { func visitCircle(_ c: Circle); func visitSquare(_ s: Square) }
class Circle {
    func accept(_ v: ShapeVisitor) {
        v.visitCircle(self)
        // Dispatch 1: Circle.accept (dynamic dispatch on Circle)
        // Dispatch 2: v.visitCircle (dispatch on visitor concrete type)
    }
}`,
      js: `// JS has prototypal single dispatch
// Visitor adds double dispatch:
class Circle {
  accept(visitor) {
    visitor.visitCircle(this)
    // Dispatch 1: Circle.accept called (runtime type)
    // Dispatch 2: visitor.visitCircle called (visitor runtime type)
  }
}
class AreaCalculator {
  visitCircle(c) { return Math.PI * c.radius ** 2 }
  visitSquare(s) { return s.side ** 2 }
}
// circle.accept(new AreaCalculator()) — two runtime dispatches`,
      rb: `# Ruby: single dispatch (send message to one receiver)
# Visitor adds second dispatch via overloaded visit methods:
class Circle
  def accept(visitor) = visitor.visit_circle(self)
  # Dispatch 1: Circle#accept chosen (runtime type of receiver)
  # Dispatch 2: visitor.visit_circle chosen (runtime type of visitor)
end
class AreaCalculator
  def visit_circle(c) = Math::PI * c.radius ** 2
  def visit_square(s) = s.side ** 2
end`,
      php: `// PHP: single dispatch
// Visitor adds double dispatch:
class Circle {
    public function accept(ShapeVisitor $v): void {
        $v->visitCircle($this);
        // Dispatch 1: Circle::accept (late static binding)
        // Dispatch 2: $v->visitCircle (polymorphic call on visitor)
    }
}
// Without double dispatch, you'd need instanceof checks:
// if ($shape instanceof Circle) { $v->visitCircle($shape); } // closed to extension`,
      cpp: `// C++ has single dispatch (virtual method table)
// Visitor adds second dispatch:
class Circle : public Shape {
public:
    void accept(ShapeVisitor& v) override {
        v.visitCircle(*this);
        // Dispatch 1: Circle::accept (vtable of Shape*)
        // Dispatch 2: v.visitCircle (vtable of ShapeVisitor&)
    }
};
// shape->accept(areaCalc);
// C++ cannot natively dispatch on two types simultaneously — Visitor solves it`,
    },
  },
  {
    slug: 'explain-mediator-observer-b2',
    title: 'Mediator vs Observer: When to Choose?',
    mode: 'explain',
    difficulty: 'hard',
    stem: 'A team debates: should the airport use Observer (towers observe planes) or Mediator (ATC controls all communication)? Which is more appropriate and why?',
    answer: 'mediator',
    choices: ['mediator', 'observer', 'facade', 'chain'],
    explanation: 'Observer is peer-to-peer notification (subjects push events to observers). Mediator centralises complex many-to-many communication through a hub. Airport ATC needs Mediator: planes do not notify each other; all communication goes through ATC which applies complex routing rules. Observer would create N*(N-1) plane-to-plane channels.',
    order: 192,
    status: 'published',
    codeSnippets: {
      java: `// MEDIATOR: ATC mediates — planes only talk to ATC
interface ATC { void requestLanding(Plane p); void requestTakeoff(Plane p); }
class AirTrafficControl implements ATC {
    private List<Plane> planes = new ArrayList<>();
    public void requestLanding(Plane p) {
        Plane onRunway = findPlaneOnRunway();
        if (onRunway != null) { p.holdPosition(); }
        else { p.land(); }
    }
    // Complex coordination logic is centralised here
}
class Plane {
    private ATC atc;
    Plane(ATC atc) { this.atc = atc; }
    void requestLanding() { atc.requestLanding(this); }
    void land()           { System.out.println("Landing"); }
    void holdPosition()   { System.out.println("Holding"); }
}

// OBSERVER alternative — planes would observe each other
// Plane A observes Plane B's runway-state? No! Too complex, planes shouldn't know each other.`,
      ts: `// MEDIATOR — correct choice for ATC
class ATC {
  private planes: Plane[] = []
  requestLanding(plane: Plane) {
    if (this.isRunwayClear()) { plane.land() }
    else { plane.holdPosition(); this.notifyQueue() }
  }
  requestTakeoff(plane: Plane) {
    if (this.isRunwayClear()) { plane.takeoff() }
    else { plane.queue() }
  }
  // All coordination logic is here — planes are decoupled from each other
}
class Plane { constructor(private atc: ATC) {}; requestLanding() { this.atc.requestLanding(this) } }

// WHY NOT OBSERVER: Observer = planes observe each other's state
// Flight360 listening to Flight720's runway status = O(N^2) coupling`,
      py: `# MEDIATOR (correct for ATC)
class ATC:
    def __init__(self): self.planes = []
    def request_landing(self, plane):
        if self._runway_clear(): plane.land()
        else: plane.hold(); self._notify_queue()
    def request_takeoff(self, plane):
        if self._runway_clear(): plane.takeoff()
        else: plane.queue()
    # Complex coordination centralised — planes decouple from each other

class Plane:
    def __init__(self, atc): self.atc = atc
    def request_landing(self): self.atc.request_landing(self)

# OBSERVER would be: plane.on('runway_cleared', lambda: request_landing())
# Problem: planes observing planes = N*(N-1) direct dependencies`,
      go: `// Mediator: ATC hub
type ATC interface { RequestLanding(p *Plane); RequestTakeoff(p *Plane) }
type AirTrafficControl struct { planes []*Plane; runway *Plane }
func (atc *AirTrafficControl) RequestLanding(p *Plane) {
    if atc.runway == nil { p.Land(); atc.runway = p } else { p.Hold() }
}
// Observer alternative: planes subscribe to "runway_cleared" events from other planes
// Problem: O(N^2) coupling, no central enforcement of priority/rules`,
      rust: `// Mediator: all comms through ATC
trait ATCMediator { fn request_landing(&mut self, plane_id: u32); fn runway_cleared(&mut self); }
struct ATC { runway: Option<u32>, queue: Vec<u32> }
impl ATCMediator for ATC {
    fn request_landing(&mut self, id: u32) {
        if self.runway.is_none() { self.runway = Some(id); println!("{} cleared to land", id); }
        else { self.queue.push(id); println!("{} hold position", id); }
    }
    fn runway_cleared(&mut self) {
        self.runway = None;
        if let Some(next) = self.queue.first() { println!("{} cleared to land", next); }
    }
}`,
      cs: `// Mediator — ATC controls all communication
interface IATC { void RequestLanding(Plane p); void RequestTakeoff(Plane p); }
class ATC : IATC {
    Queue<Plane> _queue = new(); Plane? _onRunway;
    public void RequestLanding(Plane p) {
        if (_onRunway == null) { _onRunway = p; p.Land(); }
        else { _queue.Enqueue(p); p.Hold(); }
    }
    public void RunwayCleared() {
        _onRunway = null;
        if (_queue.TryDequeue(out var next)) next.Land();
    }
}`,
      kotlin: `// Mediator: ATC hub
class ATC {
    private var onRunway: Plane? = null
    private val queue = ArrayDeque<Plane>()
    fun requestLanding(plane: Plane) {
        if (onRunway == null) { onRunway = plane; plane.land() }
        else { queue.add(plane); plane.hold() }
    }
    fun runwayCleared() { onRunway = null; queue.removeFirstOrNull()?.land() }
}
// Observer alternative: planes subscribe to each other's state — N^2 complexity`,
      swift: `// Mediator: centralised ATC
class ATC {
    private var runway: Plane?; private var queue: [Plane] = []
    func requestLanding(_ plane: Plane) {
        if runway == nil { runway = plane; plane.land() }
        else { queue.append(plane); plane.hold() }
    }
    func runwayCleared() { runway = nil; queue.first.map { $0.land(); queue.removeFirst() } }
}`,
      js: `// Mediator — ATC controls all comms
class ATC {
  #runway = null; #queue = []
  requestLanding(plane) {
    if (!this.#runway) { this.#runway = plane; plane.land() }
    else { this.#queue.push(plane); plane.hold() }
  }
  runwayCleared() { this.#runway = null; this.#queue.shift()?.land() }
}
// Observer alternative: plane.on('runway_clear', () => takeoff())
// Problem: who enforces priority? Planes cannot coordinate without a central entity.`,
      rb: `# Mediator — ATC
class ATC
  def initialize = (@runway = nil; @queue = [])
  def request_landing(plane)
    if @runway.nil? then @runway = plane; plane.land
    else @queue << plane; plane.hold
    end
  end
  def runway_cleared = (@runway = nil; @queue.shift&.land)
end`,
      php: `// Mediator — ATC hub
class ATC {
    private ?Plane $runway = null; private array $queue = [];
    public function requestLanding(Plane $plane): void {
        if ($this->runway === null) { $this->runway = $plane; $plane->land(); }
        else { $this->queue[] = $plane; $plane->hold(); }
    }
    public function runwayCleared(): void {
        $this->runway = null;
        if ($next = array_shift($this->queue)) $next->land();
    }
}`,
      cpp: `class ATC {
    Plane* runway = nullptr; std::queue<Plane*> q;
public:
    void requestLanding(Plane* p) {
        if (!runway) { runway = p; p->land(); }
        else { q.push(p); p->hold(); }
    }
    void runwayCleared() {
        runway = nullptr;
        if (!q.empty()) { q.front()->land(); q.pop(); }
    }
};`,
    },
  },

  // ── HARD SUGGEST (96-100) ────────────────────────────────────────────────────
  {
    slug: 'suggest-undo-redo-b2',
    title: 'Suggest a Pattern: Undo/Redo System',
    mode: 'suggest',
    difficulty: 'hard',
    stem: 'A collaborative design tool needs unlimited undo/redo. Each user action (draw, move, resize, delete) must be reversible. Which pattern(s) would you apply and why?',
    answer: 'command',
    choices: [],
    explanation: 'Command pattern: encapsulate each action as a Command object with execute() and undo(). Maintain a history stack for undo and a redo stack for redo. The editor calls execute(cmd) which runs the action and pushes to history. Ctrl+Z pops history and calls undo(). Memento can be combined when capturing full state snapshots is simpler than inverse operations.',
    problemContext: 'You are building a Figma-like collaborative design tool. Users can: draw shapes, move elements, resize, rotate, change colors, group/ungroup, and delete. Every operation must be undoable (Ctrl+Z, up to 100 steps) and redoable (Ctrl+Y). The system must work correctly even when operations are complex (e.g., deleting a group of 50 elements requires restoring all 50 on undo).',
    keyPatterns: ['command', 'memento'],
    order: 196,
    status: 'published',
  },
  {
    slug: 'suggest-plugin-arch-b2',
    title: 'Suggest a Pattern: Extensible Plugin Architecture',
    mode: 'suggest',
    difficulty: 'hard',
    stem: 'A code editor needs a plugin system. Third-party developers should be able to add syntax highlighting, linters, and formatters without modifying the core editor. Which pattern(s)?',
    answer: 'observer',
    choices: [],
    explanation: 'Observer + Strategy: the editor exposes lifecycle hooks (onFileSave, onFileOpen, onKeyPress) as Observable events. Plugins subscribe to relevant hooks and implement their logic as Strategies injected at runtime. The Strategy pattern makes each plugin capability swappable. Abstract Factory could create plugin component families. This is how VS Code extensions work.',
    problemContext: 'You are designing the extension system for a code editor (like VS Code). Core editor functionality is stable and cannot be modified. Third parties can write plugins that: add syntax highlighting for new languages, provide linting rules, format code on save, add sidebar panels, and contribute keyboard shortcuts. The system should load/unload plugins at runtime without restarting the editor.',
    keyPatterns: ['observer', 'strategy', 'abstract-factory', 'decorator'],
    order: 197,
    status: 'published',
  },
  {
    slug: 'suggest-pipeline-b2',
    title: 'Suggest a Pattern: Data Processing Pipeline',
    mode: 'suggest',
    difficulty: 'hard',
    stem: 'An ETL system must pass data through: validation → transformation → enrichment → filtering → output. Each step is independently configurable and new steps must be addable without changing existing ones. Which pattern(s)?',
    answer: 'chain',
    choices: [],
    explanation: 'Chain of Responsibility (or Decorator): each step is a handler in a chain. Data passes from handler to handler, each transforming or filtering it. New steps are added by inserting a new handler — no existing code changes. Decorator is also valid if steps wrap each other composably. The pipeline pattern (composed chains) is a common use of CoR.',
    problemContext: 'You are building a data ingestion service that processes user events. Raw events must pass through: 1) Schema validation (reject malformed events), 2) PII masking (replace sensitive fields), 3) Geo-enrichment (add country from IP), 4) Deduplication (drop duplicate events within 5 minutes), 5) Output routing (send to Kafka or DLQ). Each step should be independently testable and the order should be configurable.',
    keyPatterns: ['chain', 'decorator', 'strategy'],
    order: 198,
    status: 'published',
  },

  // ── HARD COMPARE (101-105) ───────────────────────────────────────────────────
  {
    slug: 'compare-strategy-state-b2',
    title: 'Compare: Strategy vs State',
    mode: 'compare',
    difficulty: 'hard',
    stem: 'Strategy and State look identical structurally. Explain the intent difference with a concrete example of where each belongs.',
    answer: 'strategy',
    choices: [],
    patternA: 'Strategy',
    patternB: 'State',
    comparisonContext: 'Both patterns use a context that holds a reference to an interchangeable object implementing a common interface. The structures are identical — the intent differs fundamentally.',
    explanation: 'Strategy: the CLIENT chooses the algorithm (sort strategy, payment method). The context is algorithm-agnostic. Algorithms do not know about each other and do not drive transitions. State: the SYSTEM drives transitions internally (ATM: IdleState transitions to CardInsertedState). States know about each other or the context drives them. States encode valid transitions — clients do not usually switch states directly.',
    keyTradeoffs: ['client', 'transitions', 'internal', 'algorithm', 'state'],
    order: 201,
    status: 'published',
  },
  {
    slug: 'compare-proxy-decorator-b2',
    title: 'Compare: Proxy vs Decorator',
    mode: 'compare',
    difficulty: 'hard',
    stem: 'Both Proxy and Decorator wrap an object with the same interface. A code review asks: "Is this a Proxy or a Decorator?" How do you decide?',
    answer: 'proxy',
    choices: [],
    patternA: 'Proxy',
    patternB: 'Decorator',
    comparisonContext: 'Both wrap a subject implementing its interface. The structural difference is minimal. The intent reveals the pattern.',
    explanation: 'Proxy: controls ACCESS to the subject — lazy init, auth, caching, remote. The wrapped object is usually determined at construction; the proxy manages the subject\'s lifecycle. Decorator: ADDS BEHAVIOR — logging, metrics, buffering, encryption. The wrapped object is provided by the caller; stacking multiple decorators is the norm. Key test: "Does this wrapping control how/when the subject is accessed, or add functionality to what it does?"',
    keyTradeoffs: ['access', 'behavior', 'lifecycle', 'stacking', 'control'],
    order: 202,
    status: 'published',
  },
  {
    slug: 'compare-factory-builder-b2',
    title: 'Compare: Factory Method vs Builder',
    mode: 'compare',
    difficulty: 'hard',
    stem: 'A team discusses whether to use Factory Method or Builder to create a complex Request object. Explain the key differences and the decision criteria.',
    answer: 'factory',
    choices: [],
    patternA: 'Factory Method',
    patternB: 'Builder',
    comparisonContext: 'Designing a creation mechanism for a configurable HTTP request with URL, method, headers, body, timeout, and auth. Some fields are optional.',
    explanation: 'Factory Method: single-step, subclass decides the type. Best when the type of object varies but the construction is simple. Builder: multi-step, fluent API assembles complex objects with many optional parts. The Builder avoids telescoping constructors and makes optional configuration readable. For an HTTP request with 6+ optional fields, Builder wins. For choosing between HttpRequest and FtpRequest based on a config key, Factory wins.',
    keyTradeoffs: ['optional', 'fluent', 'subclass', 'type', 'complex'],
    order: 203,
    status: 'published',
  },
  {
    slug: 'compare-observer-mediator-b2',
    title: 'Compare: Observer vs Mediator',
    mode: 'compare',
    difficulty: 'hard',
    stem: 'A real-time trading platform has buyers, sellers, and a clearing house. Should communication use Observer or Mediator? Explain the tradeoffs.',
    answer: 'mediator',
    choices: [],
    patternA: 'Observer',
    patternB: 'Mediator',
    comparisonContext: 'Trading system: buyers post bids, sellers post asks. The clearing house matches trades, enforces rules, and settles. Components should not communicate directly.',
    explanation: 'Observer: publisher pushes events to subscribers; bidirectional coupling is minimal but each subscriber needs to pull context from the publisher. Best for simple 1:N notification (stock price updates to displays). Mediator: centralises N:M communication through a hub that applies complex coordination logic. The clearing house must enforce matching rules, priority, and settlement — these are control decisions beyond simple notification. Mediator wins when coordination logic is complex and would otherwise scatter across participants.',
    keyTradeoffs: ['coordination', 'coupling', 'complex', 'control', 'bidirectional'],
    order: 204,
    status: 'published',
  },
  {
    slug: 'compare-composite-decorator-b2',
    title: 'Compare: Composite vs Decorator',
    mode: 'compare',
    difficulty: 'hard',
    stem: 'Both Composite and Decorator implement the same component interface and may hold other components. What is the fundamental structural and intent difference?',
    answer: 'composite',
    choices: [],
    patternA: 'Composite',
    patternB: 'Decorator',
    comparisonContext: 'A UI toolkit needs to both nest widgets (panels containing buttons containing labels) AND add capabilities to widgets (borders, scrollbars, shadows). Which pattern handles which concern?',
    explanation: 'Composite: for TREE structures. A Composite holds MULTIPLE children (0 to N). Intent: treat leaf and branch uniformly. The structure IS the pattern (folder/file, org chart, expression tree). Decorator: for linear BEHAVIOR stacking. A Decorator holds EXACTLY ONE inner component. Intent: add responsibilities without subclassing. The key difference: Composite = one-to-many children (tree), Decorator = one-to-one wrapping (chain). UI nesting = Composite; adding border/scrollbar = Decorator.',
    keyTradeoffs: ['tree', 'children', 'wrapping', 'behavior', 'nesting'],
    order: 205,
    status: 'published',
  },

  // ── EASY IDENTIFY ─────────────────────────────────────────────────────────

  {
    slug: 'composite-menu-b2',
    title: 'Recursive Menu Structure',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'Both `MenuItem` and `Menu` implement a `MenuComponent` interface with `display()`. A `Menu` holds a list of `MenuComponent` children and calls `display()` on each. What pattern is this?',
    answer: 'Composite',
    choices: ['Composite', 'Decorator', 'Chain of Responsibility', 'Flyweight'],
    explanation: 'Composite lets you compose objects into tree structures. Both leaf (`MenuItem`) and branch (`Menu`) share the same interface. Clients treat individual items and groups uniformly — the hallmark of the Composite pattern.',
    codeSnippets: {
      ts: `interface MenuComponent { display(): void }
class MenuItem implements MenuComponent {
  constructor(private name: string) {}
  display() { console.log(this.name) }
}
class Menu implements MenuComponent {
  private children: MenuComponent[] = []
  add(c: MenuComponent) { this.children.push(c) }
  display() { this.children.forEach(c => c.display()) }
}`,
      js: `class MenuItem {
  constructor(name) { this.name = name }
  display() { console.log(this.name) }
}
class Menu {
  constructor() { this.children = [] }
  add(c) { this.children.push(c) }
  display() { this.children.forEach(c => c.display()) }
}`,
      java: `interface MenuComponent { void display(); }
class MenuItem implements MenuComponent {
  private String name;
  MenuItem(String name) { this.name = name; }
  public void display() { System.out.println(name); }
}
class Menu implements MenuComponent {
  private List<MenuComponent> children = new ArrayList<>();
  public void add(MenuComponent c) { children.add(c); }
  public void display() { children.forEach(MenuComponent::display); }
}`,
      py: `class MenuComponent:
    def display(self): pass
class MenuItem(MenuComponent):
    def __init__(self, name): self.name = name
    def display(self): print(self.name)
class Menu(MenuComponent):
    def __init__(self): self.children = []
    def add(self, c): self.children.append(c)
    def display(self):
        for c in self.children: c.display()`,
      cpp: `struct MenuComponent { virtual void display() = 0; };
struct MenuItem : MenuComponent {
    std::string name;
    void display() override { std::cout << name; }
};
struct Menu : MenuComponent {
    std::vector<MenuComponent*> children;
    void add(MenuComponent* c) { children.push_back(c); }
    void display() override { for(auto c : children) c->display(); }
};`,
      go: `type MenuComponent interface { Display() }
type MenuItem struct { Name string }
func (m *MenuItem) Display() { fmt.Println(m.Name) }
type Menu struct { children []MenuComponent }
func (m *Menu) Add(c MenuComponent) { m.children = append(m.children, c) }
func (m *Menu) Display() { for _, c := range m.children { c.Display() } }`,
      rust: `trait MenuComponent { fn display(&self); }
struct MenuItem { name: String }
impl MenuComponent for MenuItem { fn display(&self) { println!("{}", self.name); } }
struct Menu { children: Vec<Box<dyn MenuComponent>> }
impl MenuComponent for Menu {
  fn display(&self) { for c in &self.children { c.display(); } }
}`,
      cs: `interface IMenuComponent { void Display(); }
class MenuItem : IMenuComponent {
  string name; MenuItem(string n) { name = n; }
  public void Display() { Console.WriteLine(name); }
}
class Menu : IMenuComponent {
  List<IMenuComponent> children = new();
  public void Add(IMenuComponent c) { children.Add(c); }
  public void Display() { foreach (var c in children) c.Display(); }
}`,
      kotlin: `interface MenuComponent { fun display() }
class MenuItem(val name: String) : MenuComponent { override fun display() = println(name) }
class Menu : MenuComponent {
  private val children = mutableListOf<MenuComponent>()
  fun add(c: MenuComponent) { children.add(c) }
  override fun display() { children.forEach { it.display() } }
}`,
      swift: `protocol MenuComponent { func display() }
class MenuItem: MenuComponent { let name: String; init(_ n: String) { name = n }; func display() { print(name) } }
class Menu: MenuComponent {
  var children: [MenuComponent] = []
  func add(_ c: MenuComponent) { children.append(c) }
  func display() { children.forEach { $0.display() } }
}`,
      rb: `module MenuComponent; def display; end; end
class MenuItem; include MenuComponent
  def initialize(name) = @name = name
  def display = puts @name
end
class Menu; include MenuComponent
  def initialize = @children = []
  def add(c) = @children << c
  def display = @children.each(&:display)
end`,
      php: `interface MenuComponent { public function display(): void; }
class MenuItem implements MenuComponent {
  public function __construct(private string $name) {}
  public function display(): void { echo $this->name . "\n"; }
}
class Menu implements MenuComponent {
  private array $children = [];
  public function add(MenuComponent $c): void { $this->children[] = $c; }
  public function display(): void { foreach ($this->children as $c) $c->display(); }
}`,
    },
    order: 206,
    status: 'published',
  },

  {
    slug: 'mediator-chatroom-b2',
    title: 'Chat Room Mediator',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'Users in a chat room do not reference each other directly. Instead, they call `chatRoom.send(user, message)`, and the `ChatRoom` relays it to all other users. What pattern is demonstrated?',
    answer: 'Mediator',
    choices: ['Mediator', 'Observer', 'Facade', 'Chain of Responsibility'],
    explanation: 'Mediator defines an object that encapsulates how a set of objects interact. Users (colleagues) only know about the ChatRoom (mediator), not each other — this reduces many-to-many dependencies to one-to-many through the mediator.',
    codeSnippets: {
      ts: `class ChatRoom {
  private users: User[] = []
  register(u: User) { this.users.push(u) }
  send(from: User, msg: string) {
    this.users.filter(u => u !== from).forEach(u => u.receive(from.name, msg))
  }
}
class User {
  constructor(public name: string, private room: ChatRoom) { room.register(this) }
  send(msg: string) { this.room.send(this, msg) }
  receive(from: string, msg: string) { console.log(from + ': ' + msg) }
}`,
      js: `class ChatRoom {
  constructor() { this.users = [] }
  register(u) { this.users.push(u) }
  send(from, msg) { this.users.filter(u => u !== from).forEach(u => u.receive(from.name, msg)) }
}
class User {
  constructor(name, room) { this.name = name; this.room = room; room.register(this) }
  send(msg) { this.room.send(this, msg) }
  receive(from, msg) { console.log(from + ': ' + msg) }
}`,
      java: `class ChatRoom {
  private List<User> users = new ArrayList<>();
  public void register(User u) { users.add(u); }
  public void send(User from, String msg) {
    users.stream().filter(u -> u != from).forEach(u -> u.receive(from.getName(), msg));
  }
}
class User {
  private String name; private ChatRoom room;
  public User(String name, ChatRoom room) { this.name = name; this.room = room; room.register(this); }
  public void send(String msg) { room.send(this, msg); }
  public void receive(String from, String msg) { System.out.println(from + ": " + msg); }
  public String getName() { return name; }
}`,
      py: `class ChatRoom:
    def __init__(self): self.users = []
    def register(self, u): self.users.append(u)
    def send(self, sender, msg):
        for u in self.users:
            if u is not sender: u.receive(sender.name, msg)
class User:
    def __init__(self, name, room):
        self.name = name; self.room = room; room.register(self)
    def send(self, msg): self.room.send(self, msg)
    def receive(self, frm, msg): print(frm + ': ' + msg)`,
      cpp: `struct User;
struct ChatRoom {
  std::vector<User*> users;
  void register_(User* u) { users.push_back(u); }
  void send(User* from, const std::string& msg);
};
struct User {
  std::string name; ChatRoom* room;
  User(std::string n, ChatRoom* r): name(n), room(r) { r->register_(this); }
  void send(const std::string& msg) { room->send(this, msg); }
  void receive(const std::string& from, const std::string& msg) { std::cout << from << ": " << msg; }
};`,
      go: `type ChatRoom struct { users []*User }
func (r *ChatRoom) Register(u *User) { r.users = append(r.users, u) }
func (r *ChatRoom) Send(from *User, msg string) {
  for _, u := range r.users { if u != from { u.Receive(from.Name, msg) } }
}
type User struct { Name string; room *ChatRoom }
func NewUser(name string, room *ChatRoom) *User { u := &User{Name: name, room: room}; room.Register(u); return u }
func (u *User) Send(msg string) { u.room.Send(u, msg) }
func (u *User) Receive(from, msg string) { fmt.Println(from + ": " + msg) }`,
      rust: `struct ChatRoom { users: Vec<String> }
impl ChatRoom {
  fn send(&self, from: &str, msg: &str) {
    for u in &self.users { if u != from { println!("{}: {}", from, msg); } }
  }
}`,
      cs: `class ChatRoom {
  List<User> users = new();
  public void Register(User u) { users.Add(u); }
  public void Send(User from, string msg) {
    foreach (var u in users) if (u != from) u.Receive(from.Name, msg);
  }
}
class User {
  public string Name; ChatRoom room;
  public User(string name, ChatRoom r) { Name = name; room = r; r.Register(this); }
  public void Send(string msg) { room.Send(this, msg); }
  public void Receive(string from, string msg) { Console.WriteLine(from + ": " + msg); }
}`,
      kotlin: `class ChatRoom {
  private val users = mutableListOf<User>()
  fun register(u: User) { users.add(u) }
  fun send(from: User, msg: String) { users.filter { it != from }.forEach { it.receive(from.name, msg) } }
}
class User(val name: String, private val room: ChatRoom) {
  init { room.register(this) }
  fun send(msg: String) = room.send(this, msg)
  fun receive(from: String, msg: String) = println("$from: $msg")
}`,
      swift: `class ChatRoom {
  var users: [User] = []
  func register(_ u: User) { users.append(u) }
  func send(from: User, msg: String) { users.filter { $0 !== from }.forEach { $0.receive(from: from.name, msg: msg) } }
}
class User {
  let name: String; let room: ChatRoom
  init(_ name: String, _ room: ChatRoom) { self.name = name; self.room = room; room.register(self) }
  func send(_ msg: String) { room.send(from: self, msg: msg) }
  func receive(from: String, msg: String) { print("\(from): \(msg)") }
}`,
      rb: `class ChatRoom
  def initialize = @users = []
  def register(u) = @users << u
  def send_msg(from, msg)
    @users.reject { |u| u == from }.each { |u| u.receive(from.name, msg) }
  end
end
class User
  attr_reader :name
  def initialize(name, room) = (@name = name; @room = room; room.register(self))
  def send_msg(msg) = @room.send_msg(self, msg)
  def receive(from, msg) = puts("#{from}: #{msg}")
end`,
      php: `class ChatRoom {
  private array $users = [];
  public function register(User $u): void { $this->users[] = $u; }
  public function send(User $from, string $msg): void {
    foreach ($this->users as $u) if ($u !== $from) $u->receive($from->name, $msg);
  }
}
class User {
  public string $name;
  public function __construct(string $name, ChatRoom $room) {
    $this->name = $name; $room->register($this);
  }
  public function receive(string $from, string $msg): void { echo "$from: $msg\n"; }
}`,
    },
    order: 207,
    status: 'published',
  },

  {
    slug: 'abstract-factory-dialog-b2',
    title: 'Cross-Platform Dialog Factory',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'A `DialogFactory` interface declares `createButton()` and `createCheckbox()`. `WindowsDialogFactory` and `MacDialogFactory` each implement it, returning platform-specific widgets. What pattern is this?',
    answer: 'Abstract Factory',
    choices: ['Abstract Factory', 'Factory Method', 'Builder', 'Prototype'],
    explanation: 'Abstract Factory provides an interface for creating families of related objects without specifying their concrete classes. Here the factory creates a button AND a checkbox — a family of widgets that belong together — unlike Factory Method which creates only one product.',
    codeSnippets: {
      ts: `interface Button { render(): void }
interface Checkbox { render(): void }
interface DialogFactory {
  createButton(): Button
  createCheckbox(): Checkbox
}
class WindowsDialogFactory implements DialogFactory {
  createButton(): Button { return new WinButton() }
  createCheckbox(): Checkbox { return new WinCheckbox() }
}
class MacDialogFactory implements DialogFactory {
  createButton(): Button { return new MacButton() }
  createCheckbox(): Checkbox { return new MacCheckbox() }
}`,
      js: `class WindowsDialogFactory {
  createButton() { return new WinButton() }
  createCheckbox() { return new WinCheckbox() }
}
class MacDialogFactory {
  createButton() { return new MacButton() }
  createCheckbox() { return new MacCheckbox() }
}`,
      java: `interface DialogFactory {
  Button createButton();
  Checkbox createCheckbox();
}
class WindowsDialogFactory implements DialogFactory {
  public Button createButton() { return new WinButton(); }
  public Checkbox createCheckbox() { return new WinCheckbox(); }
}`,
      py: `class DialogFactory:
    def create_button(self): ...
    def create_checkbox(self): ...
class WindowsDialogFactory(DialogFactory):
    def create_button(self): return WinButton()
    def create_checkbox(self): return WinCheckbox()
class MacDialogFactory(DialogFactory):
    def create_button(self): return MacButton()
    def create_checkbox(self): return MacCheckbox()`,
      cpp: `struct Button { virtual void render() = 0; };
struct Checkbox { virtual void render() = 0; };
struct DialogFactory {
  virtual Button* createButton() = 0;
  virtual Checkbox* createCheckbox() = 0;
};
struct WindowsDialogFactory : DialogFactory {
  Button* createButton() override { return new WinButton(); }
  Checkbox* createCheckbox() override { return new WinCheckbox(); }
};`,
      go: `type Button interface { Render() }
type Checkbox interface { Render() }
type DialogFactory interface {
  CreateButton() Button
  CreateCheckbox() Checkbox
}
type WindowsFactory struct{}
func (f *WindowsFactory) CreateButton() Button { return &WinButton{} }
func (f *WindowsFactory) CreateCheckbox() Checkbox { return &WinCheckbox{} }`,
      rust: `trait Button { fn render(&self); }
trait Checkbox { fn render(&self); }
trait DialogFactory {
  fn create_button(&self) -> Box<dyn Button>;
  fn create_checkbox(&self) -> Box<dyn Checkbox>;
}
struct WindowsFactory;
impl DialogFactory for WindowsFactory {
  fn create_button(&self) -> Box<dyn Button> { Box::new(WinButton) }
  fn create_checkbox(&self) -> Box<dyn Checkbox> { Box::new(WinCheckbox) }
}`,
      cs: `interface IDialogFactory {
  IButton CreateButton();
  ICheckbox CreateCheckbox();
}
class WindowsDialogFactory : IDialogFactory {
  public IButton CreateButton() => new WinButton();
  public ICheckbox CreateCheckbox() => new WinCheckbox();
}
class MacDialogFactory : IDialogFactory {
  public IButton CreateButton() => new MacButton();
  public ICheckbox CreateCheckbox() => new MacCheckbox();
}`,
      kotlin: `interface DialogFactory {
  fun createButton(): Button
  fun createCheckbox(): Checkbox
}
class WindowsDialogFactory : DialogFactory {
  override fun createButton() = WinButton()
  override fun createCheckbox() = WinCheckbox()
}
class MacDialogFactory : DialogFactory {
  override fun createButton() = MacButton()
  override fun createCheckbox() = MacCheckbox()
}`,
      swift: `protocol DialogFactory {
  func createButton() -> Button
  func createCheckbox() -> Checkbox
}
class WindowsDialogFactory: DialogFactory {
  func createButton() -> Button { WinButton() }
  func createCheckbox() -> Checkbox { WinCheckbox() }
}`,
      rb: `module DialogFactory
  def create_button = raise NotImplementedError
  def create_checkbox = raise NotImplementedError
end
class WindowsDialogFactory; include DialogFactory
  def create_button = WinButton.new
  def create_checkbox = WinCheckbox.new
end
class MacDialogFactory; include DialogFactory
  def create_button = MacButton.new
  def create_checkbox = MacCheckbox.new
end`,
      php: `interface DialogFactory {
  public function createButton(): Button;
  public function createCheckbox(): Checkbox;
}
class WindowsDialogFactory implements DialogFactory {
  public function createButton(): Button { return new WinButton(); }
  public function createCheckbox(): Checkbox { return new WinCheckbox(); }
}`,
    },
    order: 208,
    status: 'published',
  },

  {
    slug: 'bridge-remote-b2',
    title: 'Remote Control and Devices',
    mode: 'identify',
    difficulty: 'easy',
    stem: 'A `RemoteControl` class holds a reference to a `Device` interface (with `on()`, `off()`, `setVolume()`). A `AdvancedRemote` extends `RemoteControl` adding `mute()`. `TV` and `Radio` implement `Device`. What pattern is this?',
    answer: 'Bridge',
    choices: ['Bridge', 'Strategy', 'Adapter', 'Decorator'],
    explanation: 'Bridge separates an abstraction (`RemoteControl`) from its implementation (`Device`) so both can vary independently. The remote control hierarchy (basic, advanced) is bridged to the device hierarchy (TV, Radio) — neither hierarchy knows the other\'s concrete classes.',
    codeSnippets: {
      ts: `interface Device { on(): void; off(): void; setVolume(v: number): void }
class RemoteControl {
  constructor(protected device: Device) {}
  power() { this.device.on() }
}
class AdvancedRemote extends RemoteControl {
  mute() { this.device.setVolume(0) }
}
class TV implements Device {
  on() { console.log('TV on') }
  off() { console.log('TV off') }
  setVolume(v: number) { console.log('TV vol ' + v) }
}`,
      js: `class RemoteControl {
  constructor(device) { this.device = device }
  power() { this.device.on() }
}
class AdvancedRemote extends RemoteControl {
  mute() { this.device.setVolume(0) }
}
class TV {
  on() { console.log('TV on') }
  off() { console.log('TV off') }
  setVolume(v) { console.log('TV vol ' + v) }
}`,
      java: `interface Device { void on(); void off(); void setVolume(int v); }
class RemoteControl {
  protected Device device;
  RemoteControl(Device d) { this.device = d; }
  public void power() { device.on(); }
}
class AdvancedRemote extends RemoteControl {
  AdvancedRemote(Device d) { super(d); }
  public void mute() { device.setVolume(0); }
}`,
      py: `class Device:
    def on(self): ...
    def off(self): ...
    def set_volume(self, v): ...
class RemoteControl:
    def __init__(self, device): self.device = device
    def power(self): self.device.on()
class AdvancedRemote(RemoteControl):
    def mute(self): self.device.set_volume(0)
class TV(Device):
    def on(self): print('TV on')
    def off(self): print('TV off')
    def set_volume(self, v): print('TV vol', v)`,
      cpp: `struct Device { virtual void on() = 0; virtual void off() = 0; virtual void setVolume(int) = 0; };
struct RemoteControl {
  Device* device;
  RemoteControl(Device* d) : device(d) {}
  void power() { device->on(); }
};
struct AdvancedRemote : RemoteControl {
  AdvancedRemote(Device* d) : RemoteControl(d) {}
  void mute() { device->setVolume(0); }
};`,
      go: `type Device interface { On(); Off(); SetVolume(v int) }
type RemoteControl struct { device Device }
func (r *RemoteControl) Power() { r.device.On() }
type AdvancedRemote struct { RemoteControl }
func (a *AdvancedRemote) Mute() { a.device.SetVolume(0) }`,
      rust: `trait Device { fn on(&self); fn off(&self); fn set_volume(&self, v: u8); }
struct RemoteControl { device: Box<dyn Device> }
impl RemoteControl { fn power(&self) { self.device.on(); } }
struct AdvancedRemote { remote: RemoteControl }
impl AdvancedRemote { fn mute(&self) { self.remote.device.set_volume(0); } }`,
      cs: `interface IDevice { void On(); void Off(); void SetVolume(int v); }
class RemoteControl {
  protected IDevice device;
  public RemoteControl(IDevice d) { device = d; }
  public void Power() { device.On(); }
}
class AdvancedRemote : RemoteControl {
  public AdvancedRemote(IDevice d) : base(d) {}
  public void Mute() { device.SetVolume(0); }
}`,
      kotlin: `interface Device { fun on(); fun off(); fun setVolume(v: Int) }
open class RemoteControl(protected val device: Device) { fun power() = device.on() }
class AdvancedRemote(device: Device) : RemoteControl(device) { fun mute() = device.setVolume(0) }`,
      swift: `protocol Device { func on(); func off(); func setVolume(_ v: Int) }
class RemoteControl {
  let device: Device
  init(_ device: Device) { self.device = device }
  func power() { device.on() }
}
class AdvancedRemote: RemoteControl { func mute() { device.setVolume(0) } }`,
      rb: `module Device; def on; end; def off; end; def set_volume(v); end; end
class RemoteControl
  def initialize(device) = @device = device
  def power = @device.on
end
class AdvancedRemote < RemoteControl
  def mute = @device.set_volume(0)
end`,
      php: `interface Device { public function on(): void; public function off(): void; public function setVolume(int $v): void; }
class RemoteControl {
  public function __construct(protected Device $device) {}
  public function power(): void { $this->device->on(); }
}
class AdvancedRemote extends RemoteControl {
  public function mute(): void { $this->device->setVolume(0); }
}`,
    },
    order: 209,
    status: 'published',
  },

  // ── MEDIUM IDENTIFY ───────────────────────────────────────────────────────

  {
    slug: 'visitor-compiler-b2',
    title: 'Compiler AST Visitor',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'An AST contains `NumberNode` and `AddNode`. Each implements `accept(visitor)`. A `TypeCheckVisitor` and a `CodeGenVisitor` implement `visitNumber()` and `visitAdd()` separately. Adding a new analysis requires a new visitor, not modifying nodes. What pattern is this?',
    answer: 'Visitor',
    choices: ['Visitor', 'Interpreter', 'Template Method', 'Strategy'],
    explanation: 'Visitor lets you add new operations to object structures without modifying the objects. Each node accepts a visitor, and the visitor defines the operation for each concrete node type. This is the open/closed principle in action: open for new operations (new visitor), closed for modification (nodes unchanged).',
    codeSnippets: {
      ts: `interface Visitor { visitNumber(n: NumberNode): void; visitAdd(n: AddNode): void }
interface ASTNode { accept(v: Visitor): void }
class NumberNode implements ASTNode {
  constructor(public value: number) {}
  accept(v: Visitor) { v.visitNumber(this) }
}
class AddNode implements ASTNode {
  constructor(public left: ASTNode, public right: ASTNode) {}
  accept(v: Visitor) { v.visitAdd(this) }
}
class TypeCheckVisitor implements Visitor {
  visitNumber(n: NumberNode) { /* check */ }
  visitAdd(n: AddNode) { n.left.accept(this); n.right.accept(this); }
}`,
      js: `class NumberNode {
  constructor(value) { this.value = value }
  accept(v) { v.visitNumber(this) }
}
class AddNode {
  constructor(left, right) { this.left = left; this.right = right }
  accept(v) { v.visitAdd(this) }
}
class TypeCheckVisitor {
  visitNumber(n) { /* check */ }
  visitAdd(n) { n.left.accept(this); n.right.accept(this) }
}`,
      java: `interface Visitor { void visitNumber(NumberNode n); void visitAdd(AddNode n); }
interface ASTNode { void accept(Visitor v); }
class NumberNode implements ASTNode {
  int value;
  public void accept(Visitor v) { v.visitNumber(this); }
}
class AddNode implements ASTNode {
  ASTNode left, right;
  public void accept(Visitor v) { v.visitAdd(this); }
}`,
      py: `class Visitor:
    def visit_number(self, n): ...
    def visit_add(self, n): ...
class NumberNode:
    def __init__(self, value): self.value = value
    def accept(self, v): v.visit_number(self)
class AddNode:
    def __init__(self, left, right): self.left = left; self.right = right
    def accept(self, v): v.visit_add(self)
class TypeCheckVisitor(Visitor):
    def visit_number(self, n): pass
    def visit_add(self, n): n.left.accept(self); n.right.accept(self)`,
      cpp: `struct Visitor;
struct ASTNode { virtual void accept(Visitor&) = 0; };
struct NumberNode : ASTNode { int value; void accept(Visitor& v) override; };
struct AddNode : ASTNode { ASTNode *left, *right; void accept(Visitor& v) override; };
struct Visitor { virtual void visitNumber(NumberNode&) = 0; virtual void visitAdd(AddNode&) = 0; };`,
      go: `type Visitor interface { VisitNumber(n *NumberNode); VisitAdd(n *AddNode) }
type ASTNode interface { Accept(v Visitor) }
type NumberNode struct { Value int }
func (n *NumberNode) Accept(v Visitor) { v.VisitNumber(n) }
type AddNode struct { Left, Right ASTNode }
func (n *AddNode) Accept(v Visitor) { v.VisitAdd(n) }`,
      rust: `trait Visitor { fn visit_number(&self, n: &NumberNode); fn visit_add(&self, n: &AddNode); }
struct NumberNode { value: i32 }
struct AddNode { left: Box<dyn ASTNode>, right: Box<dyn ASTNode> }
trait ASTNode { fn accept(&self, v: &dyn Visitor); }
impl ASTNode for NumberNode { fn accept(&self, v: &dyn Visitor) { v.visit_number(self); } }
impl ASTNode for AddNode { fn accept(&self, v: &dyn Visitor) { v.visit_add(self); } }`,
      cs: `interface IVisitor { void VisitNumber(NumberNode n); void VisitAdd(AddNode n); }
interface IASTNode { void Accept(IVisitor v); }
class NumberNode : IASTNode { public int Value; public void Accept(IVisitor v) => v.VisitNumber(this); }
class AddNode : IASTNode {
  public IASTNode Left, Right;
  public void Accept(IVisitor v) => v.VisitAdd(this);
}`,
      kotlin: `interface Visitor { fun visitNumber(n: NumberNode); fun visitAdd(n: AddNode) }
interface ASTNode { fun accept(v: Visitor) }
class NumberNode(val value: Int) : ASTNode { override fun accept(v: Visitor) = v.visitNumber(this) }
class AddNode(val left: ASTNode, val right: ASTNode) : ASTNode { override fun accept(v: Visitor) = v.visitAdd(this) }`,
      swift: `protocol Visitor { func visitNumber(_ n: NumberNode); func visitAdd(_ n: AddNode) }
protocol ASTNode { func accept(_ v: Visitor) }
class NumberNode: ASTNode { let value: Int; init(_ v: Int) { value = v }; func accept(_ v: Visitor) { v.visitNumber(self) } }
class AddNode: ASTNode {
  let left, right: ASTNode
  init(_ l: ASTNode, _ r: ASTNode) { left = l; right = r }
  func accept(_ v: Visitor) { v.visitAdd(self) }
}`,
      rb: `module Visitor; def visit_number(n); end; def visit_add(n); end; end
class NumberNode
  attr_reader :value
  def initialize(v) = @value = v
  def accept(v) = v.visit_number(self)
end
class AddNode
  attr_reader :left, :right
  def initialize(l, r) = (@left = l; @right = r)
  def accept(v) = v.visit_add(self)
end`,
      php: `interface Visitor { public function visitNumber(NumberNode $n): void; public function visitAdd(AddNode $n): void; }
interface ASTNode { public function accept(Visitor $v): void; }
class NumberNode implements ASTNode {
  public function __construct(public int $value) {}
  public function accept(Visitor $v): void { $v->visitNumber($this); }
}
class AddNode implements ASTNode {
  public function __construct(public ASTNode $left, public ASTNode $right) {}
  public function accept(Visitor $v): void { $v->visitAdd($this); }
}`,
    },
    order: 210,
    status: 'published',
  },

  {
    slug: 'chain-logger-b2',
    title: 'Logger Level Chain',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'Three logger classes (`DebugLogger`, `InfoLogger`, `ErrorLogger`) each have a `next` logger reference. When `log(level, msg)` is called, a logger handles it if the level matches, then always passes to `next`. What pattern is demonstrated?',
    answer: 'Chain of Responsibility',
    choices: ['Chain of Responsibility', 'Decorator', 'Observer', 'Strategy'],
    explanation: 'Chain of Responsibility passes a request along a chain of handlers. Each handler decides whether to process and/or forward the request. Logger chains route messages by level — a classic CoR application. Unlike Decorator (which always wraps to add behavior), CoR handlers may independently decide to handle or skip.',
    codeSnippets: {
      ts: `abstract class Logger {
  protected next?: Logger
  setNext(l: Logger) { this.next = l; return l }
  abstract log(level: string, msg: string): void
  protected passToNext(level: string, msg: string) { this.next?.log(level, msg) }
}
class ErrorLogger extends Logger {
  log(level: string, msg: string) {
    if (level === 'ERROR') console.error(msg)
    this.passToNext(level, msg)
  }
}`,
      js: `class Logger {
  setNext(l) { this.next = l; return l }
  log(level, msg) { if (this.next) this.next.log(level, msg) }
}
class ErrorLogger extends Logger {
  log(level, msg) { if (level === 'ERROR') console.error(msg); super.log(level, msg) }
}`,
      java: `abstract class Logger {
  protected Logger next;
  public Logger setNext(Logger l) { next = l; return l; }
  public abstract void log(String level, String msg);
  protected void passToNext(String level, String msg) { if (next != null) next.log(level, msg); }
}
class ErrorLogger extends Logger {
  public void log(String level, String msg) {
    if ("ERROR".equals(level)) System.err.println(msg);
    passToNext(level, msg);
  }
}`,
      py: `class Logger:
    def set_next(self, l):
        self.next = l; return l
    def log(self, level, msg):
        if hasattr(self, 'next'): self.next.log(level, msg)
class ErrorLogger(Logger):
    def log(self, level, msg):
        if level == 'ERROR': print('ERROR:', msg)
        super().log(level, msg)`,
      cpp: `struct Logger {
  Logger* next = nullptr;
  Logger* setNext(Logger* l) { next = l; return l; }
  virtual void log(const std::string& level, const std::string& msg) {
    if (next) next->log(level, msg);
  }
};
struct ErrorLogger : Logger {
  void log(const std::string& level, const std::string& msg) override {
    if (level == "ERROR") std::cerr << msg;
    Logger::log(level, msg);
  }
};`,
      go: `type Logger interface { Log(level, msg string); SetNext(Logger) }
type BaseLogger struct { next Logger }
func (b *BaseLogger) SetNext(l Logger) { b.next = l }
func (b *BaseLogger) passToNext(level, msg string) { if b.next != nil { b.next.Log(level, msg) } }
type ErrorLogger struct { BaseLogger }
func (e *ErrorLogger) Log(level, msg string) {
  if level == "ERROR" { fmt.Fprintln(os.Stderr, msg) }
  e.passToNext(level, msg)
}`,
      rust: `trait Logger { fn log(&self, level: &str, msg: &str); }
struct ErrorLogger { next: Option<Box<dyn Logger>> }
impl Logger for ErrorLogger {
  fn log(&self, level: &str, msg: &str) {
    if level == "ERROR" { eprintln!("{}", msg); }
    if let Some(n) = &self.next { n.log(level, msg); }
  }
}`,
      cs: `abstract class Logger {
  protected Logger? Next;
  public Logger SetNext(Logger l) { Next = l; return l; }
  public abstract void Log(string level, string msg);
  protected void PassToNext(string level, string msg) { Next?.Log(level, msg); }
}
class ErrorLogger : Logger {
  public override void Log(string level, string msg) {
    if (level == "ERROR") Console.Error.WriteLine(msg);
    PassToNext(level, msg);
  }
}`,
      kotlin: `abstract class Logger {
  var next: Logger? = null
  fun setNext(l: Logger): Logger { next = l; return l }
  abstract fun log(level: String, msg: String)
  protected fun passToNext(level: String, msg: String) { next?.log(level, msg) }
}
class ErrorLogger : Logger() {
  override fun log(level: String, msg: String) {
    if (level == "ERROR") System.err.println(msg)
    passToNext(level, msg)
  }
}`,
      swift: `class Logger {
  var next: Logger?
  func setNext(_ l: Logger) -> Logger { next = l; return l }
  func log(level: String, msg: String) { next?.log(level: level, msg: msg) }
}
class ErrorLogger: Logger {
  override func log(level: String, msg: String) {
    if level == "ERROR" { fputs(msg, stderr) }
    super.log(level: level, msg: msg)
  }
}`,
      rb: `class Logger
  attr_writer :next
  def log(level, msg) = @next&.log(level, msg)
end
class ErrorLogger < Logger
  def log(level, msg)
    $stderr.puts msg if level == 'ERROR'
    super
  end
end`,
      php: `abstract class Logger {
  protected ?Logger $next = null;
  public function setNext(Logger $l): Logger { $this->next = $l; return $l; }
  abstract public function log(string $level, string $msg): void;
  protected function passToNext(string $level, string $msg): void { $this->next?->log($level, $msg); }
}
class ErrorLogger extends Logger {
  public function log(string $level, string $msg): void {
    if ($level === 'ERROR') error_log($msg);
    $this->passToNext($level, $msg);
  }
}`,
    },
    order: 211,
    status: 'published',
  },

  {
    slug: 'template-report-b2',
    title: 'Report Generation Template',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'A `ReportGenerator` base class defines `generate()` which calls: `openFile()`, `buildHeader()`, `buildBody()`, `buildFooter()`, `closeFile()` in order. Subclasses `PDFReport` and `CSVReport` override only `buildHeader()` and `buildBody()`. What pattern is this?',
    answer: 'Template Method',
    choices: ['Template Method', 'Strategy', 'Builder', 'Composite'],
    explanation: 'Template Method defines the skeleton of an algorithm in a base class, letting subclasses override specific steps without changing the algorithm\'s structure. The `generate()` method is the template — it orchestrates the steps. Subclasses customise individual steps (header, body format) without altering the overall sequence.',
    codeSnippets: {
      ts: `abstract class ReportGenerator {
  generate(): void {
    this.openFile()
    this.buildHeader()
    this.buildBody()
    this.buildFooter()
    this.closeFile()
  }
  protected openFile() { console.log('open') }
  protected abstract buildHeader(): void
  protected abstract buildBody(): void
  protected buildFooter() { console.log('footer') }
  protected closeFile() { console.log('close') }
}
class PDFReport extends ReportGenerator {
  protected buildHeader() { console.log('PDF header') }
  protected buildBody() { console.log('PDF body') }
}`,
      js: `class ReportGenerator {
  generate() {
    this.openFile(); this.buildHeader(); this.buildBody(); this.buildFooter(); this.closeFile()
  }
  openFile() { console.log('open') }
  buildFooter() { console.log('footer') }
  closeFile() { console.log('close') }
}
class PDFReport extends ReportGenerator {
  buildHeader() { console.log('PDF header') }
  buildBody() { console.log('PDF body') }
}`,
      java: `abstract class ReportGenerator {
  public final void generate() {
    openFile(); buildHeader(); buildBody(); buildFooter(); closeFile();
  }
  protected void openFile() {}
  protected abstract void buildHeader();
  protected abstract void buildBody();
  protected void buildFooter() {}
  protected void closeFile() {}
}
class PDFReport extends ReportGenerator {
  protected void buildHeader() { System.out.println("PDF header"); }
  protected void buildBody() { System.out.println("PDF body"); }
}`,
      py: `class ReportGenerator:
    def generate(self):
        self.open_file()
        self.build_header()
        self.build_body()
        self.build_footer()
        self.close_file()
    def open_file(self): pass
    def build_header(self): raise NotImplementedError
    def build_body(self): raise NotImplementedError
    def build_footer(self): pass
    def close_file(self): pass
class PDFReport(ReportGenerator):
    def build_header(self): print('PDF header')
    def build_body(self): print('PDF body')`,
      cpp: `class ReportGenerator {
public:
  void generate() { openFile(); buildHeader(); buildBody(); buildFooter(); closeFile(); }
protected:
  virtual void openFile() {}
  virtual void buildHeader() = 0;
  virtual void buildBody() = 0;
  virtual void buildFooter() {}
  virtual void closeFile() {}
};
class PDFReport : public ReportGenerator {
protected:
  void buildHeader() override { std::cout << "PDF header"; }
  void buildBody() override { std::cout << "PDF body"; }
};`,
      go: `type ReportGenerator interface { BuildHeader(); BuildBody() }
func Generate(r ReportGenerator) {
  fmt.Println("open")
  r.BuildHeader()
  r.BuildBody()
  fmt.Println("footer")
  fmt.Println("close")
}
type PDFReport struct{}
func (p *PDFReport) BuildHeader() { fmt.Println("PDF header") }
func (p *PDFReport) BuildBody() { fmt.Println("PDF body") }`,
      rust: `trait ReportGenerator {
  fn build_header(&self);
  fn build_body(&self);
  fn generate(&self) {
    println!("open");
    self.build_header();
    self.build_body();
    println!("footer");
    println!("close");
  }
}
struct PDFReport;
impl ReportGenerator for PDFReport {
  fn build_header(&self) { println!("PDF header"); }
  fn build_body(&self) { println!("PDF body"); }
}`,
      cs: `abstract class ReportGenerator {
  public void Generate() { OpenFile(); BuildHeader(); BuildBody(); BuildFooter(); CloseFile(); }
  protected virtual void OpenFile() {}
  protected abstract void BuildHeader();
  protected abstract void BuildBody();
  protected virtual void BuildFooter() {}
  protected virtual void CloseFile() {}
}
class PDFReport : ReportGenerator {
  protected override void BuildHeader() => Console.WriteLine("PDF header");
  protected override void BuildBody() => Console.WriteLine("PDF body");
}`,
      kotlin: `abstract class ReportGenerator {
  fun generate() { openFile(); buildHeader(); buildBody(); buildFooter(); closeFile() }
  protected open fun openFile() {}
  protected abstract fun buildHeader()
  protected abstract fun buildBody()
  protected open fun buildFooter() {}
  protected open fun closeFile() {}
}
class PDFReport : ReportGenerator() {
  override fun buildHeader() = println("PDF header")
  override fun buildBody() = println("PDF body")
}`,
      swift: `class ReportGenerator {
  func generate() { openFile(); buildHeader(); buildBody(); buildFooter(); closeFile() }
  func openFile() {}
  func buildHeader() { fatalError("override") }
  func buildBody() { fatalError("override") }
  func buildFooter() {}
  func closeFile() {}
}
class PDFReport: ReportGenerator {
  override func buildHeader() { print("PDF header") }
  override func buildBody() { print("PDF body") }
}`,
      rb: `class ReportGenerator
  def generate
    open_file; build_header; build_body; build_footer; close_file
  end
  def open_file; end
  def build_header = raise NotImplementedError
  def build_body = raise NotImplementedError
  def build_footer; end
  def close_file; end
end
class PDFReport < ReportGenerator
  def build_header = puts 'PDF header'
  def build_body = puts 'PDF body'
end`,
      php: `abstract class ReportGenerator {
  public function generate(): void {
    $this->openFile(); $this->buildHeader(); $this->buildBody(); $this->buildFooter(); $this->closeFile();
  }
  protected function openFile(): void {}
  abstract protected function buildHeader(): void;
  abstract protected function buildBody(): void;
  protected function buildFooter(): void {}
  protected function closeFile(): void {}
}
class PDFReport extends ReportGenerator {
  protected function buildHeader(): void { echo "PDF header\n"; }
  protected function buildBody(): void { echo "PDF body\n"; }
}`,
    },
    order: 212,
    status: 'published',
  },

  // ── MEDIUM DETECT ─────────────────────────────────────────────────────────

  {
    slug: 'detect-big-switch-b2',
    title: 'Big Switch Statement Smell',
    mode: 'detect',
    difficulty: 'medium',
    stem: `A payment processor contains a large switch on payment type to select processing logic. New payment types require modifying this class. What is the primary design problem and the appropriate fix?

\`\`\`
function processPayment(type, amount) {
  switch(type) {
    case 'credit': /* ... */ break;
    case 'debit':  /* ... */ break;
    case 'paypal': /* ... */ break;
    case 'crypto': /* ... */ break;
    // grows with every new type
  }
}
\`\`\``,
    answer: 'Open/Closed Principle violation — use Strategy pattern to encapsulate each payment algorithm',
    choices: [
      'Open/Closed Principle violation — use Strategy pattern to encapsulate each payment algorithm',
      'Single Responsibility violation — split into separate functions',
      'Liskov Substitution violation — use inheritance',
      'No problem — switch statements are idiomatic',
    ],
    explanation: 'Every new payment type requires modifying the same function, violating OCP. The Strategy pattern fixes this: define a `PaymentStrategy` interface, implement `CreditStrategy`, `DebitStrategy`, etc., and select the strategy at runtime. New types are added by adding new classes, not modifying existing ones.',
    codeSnippets: {
      ts: `// Problem
function processPayment(type: string, amount: number) {
  switch (type) {
    case 'credit': /* credit logic */ break
    case 'debit': /* debit logic */ break
    case 'paypal': /* paypal logic */ break
    // every new type requires editing this function
  }
}
// Fix: Strategy pattern
interface PaymentStrategy { process(amount: number): void }
class CreditStrategy implements PaymentStrategy { process(a: number) { /* credit */ } }
class DebitStrategy implements PaymentStrategy { process(a: number) { /* debit */ } }
class Processor { constructor(private s: PaymentStrategy) {}; pay(a: number) { this.s.process(a) } }`,
      js: `// Problem: switch grows with every payment type
function processPayment(type, amount) {
  switch(type) {
    case 'credit': break
    case 'debit': break
    // ...
  }
}
// Fix: Strategy
class CreditStrategy { process(a) { /* credit */ } }
class DebitStrategy { process(a) { /* debit */ } }
class Processor { constructor(s) { this.s = s } pay(a) { this.s.process(a) } }`,
      java: `// Problem
public void process(String type, double amount) {
  switch (type) {
    case "credit": break;
    case "debit": break;
    // OCP violation: must modify for each new type
  }
}
// Fix
interface PaymentStrategy { void process(double amount); }
class CreditStrategy implements PaymentStrategy { public void process(double a) {} }`,
      py: `# Problem
def process_payment(type, amount):
    if type == 'credit': pass
    elif type == 'debit': pass
    elif type == 'paypal': pass
    # grows without end

# Fix: Strategy
class PaymentStrategy:
    def process(self, amount): raise NotImplementedError
class CreditStrategy(PaymentStrategy):
    def process(self, amount): pass  # credit logic`,
      cpp: `// Problem
void processPayment(const std::string& type, double amount) {
  if (type == "credit") { /* ... */ }
  else if (type == "debit") { /* ... */ }
  // violates OCP
}
// Fix
struct PaymentStrategy { virtual void process(double) = 0; };
struct CreditStrategy : PaymentStrategy { void process(double a) override {} };`,
      go: `// Problem
func processPayment(payType string, amount float64) {
  switch payType {
  case "credit": // ...
  case "debit": // ...
  }
}
// Fix
type PaymentStrategy interface { Process(amount float64) }
type CreditStrategy struct{}
func (c *CreditStrategy) Process(a float64) {}`,
      rust: `// Problem: match grows with each new type
fn process_payment(pay_type: &str, amount: f64) {
  match pay_type {
    "credit" => {},
    "debit" => {},
    _ => {},
  }
}
// Fix: trait objects
trait PaymentStrategy { fn process(&self, amount: f64); }
struct CreditStrategy;
impl PaymentStrategy for CreditStrategy { fn process(&self, _: f64) {} }`,
      cs: `// Problem
void ProcessPayment(string type, decimal amount) {
  switch (type) {
    case "credit": break;
    case "debit": break;
    // OCP violation
  }
}
// Fix: Strategy
interface IPaymentStrategy { void Process(decimal amount); }
class CreditStrategy : IPaymentStrategy { public void Process(decimal a) {} }`,
      kotlin: `// Problem
fun processPayment(type: String, amount: Double) = when (type) {
  "credit" -> Unit
  "debit" -> Unit
  else -> Unit // grows with new types
}
// Fix
interface PaymentStrategy { fun process(amount: Double) }
class CreditStrategy : PaymentStrategy { override fun process(amount: Double) {} }`,
      swift: `// Problem
func processPayment(type: String, amount: Double) {
  switch type {
  case "credit": break
  case "debit": break
  default: break
  }
}
// Fix
protocol PaymentStrategy { func process(amount: Double) }
class CreditStrategy: PaymentStrategy { func process(amount: Double) {} }`,
      rb: `# Problem
def process_payment(type, amount)
  case type
  when 'credit' then nil
  when 'debit' then nil
  # grows without bound
  end
end
# Fix
module PaymentStrategy; def process(amount); end; end
class CreditStrategy; include PaymentStrategy
  def process(amount); end
end`,
      php: `// Problem
function processPayment(string $type, float $amount): void {
  switch ($type) {
    case 'credit': break;
    case 'debit': break;
    // OCP violation
  }
}
// Fix
interface PaymentStrategy { public function process(float $amount): void; }
class CreditStrategy implements PaymentStrategy {
  public function process(float $amount): void {}
}`,
    },
    order: 213,
    status: 'published',
  },

  {
    slug: 'detect-tight-coupling-b2',
    title: 'Tight Coupling via Direct Instantiation',
    mode: 'detect',
    difficulty: 'medium',
    stem: `An \`OrderService\` class directly instantiates its \`EmailNotifier\` dependency. What design problem does this cause and how should it be fixed?

\`\`\`
class OrderService {
  private notifier = new EmailNotifier()
  place(order) { this.notifier.send(order) }
}
\`\`\``,
    answer: 'Tight coupling — inject a Notifier interface instead (Dependency Injection)',
    choices: [
      'Tight coupling — inject a Notifier interface instead (Dependency Injection)',
      'Singleton violation — EmailNotifier should be a singleton',
      'Open/Closed violation — use a Factory to create EmailNotifier',
      'No problem — direct instantiation is fine for simple cases',
    ],
    explanation: 'Direct instantiation inside a class creates tight coupling: `OrderService` is forever bound to `EmailNotifier`. You cannot substitute `SMSNotifier` without modifying `OrderService`. The fix is Dependency Injection: accept a `Notifier` interface through the constructor. This follows DIP (Depend on abstractions), enables testing with mocks, and allows swapping implementations without changing `OrderService`.',
    codeSnippets: {
      ts: `// Problem: tight coupling
class OrderService {
  private notifier = new EmailNotifier()
  place(order: Order) { this.notifier.send(order) }
}
// Fix: Dependency Injection
interface Notifier { send(o: Order): void }
class OrderService {
  constructor(private notifier: Notifier) {}
  place(order: Order) { this.notifier.send(order) }
}`,
      js: `// Problem
class OrderService {
  constructor() { this.notifier = new EmailNotifier() }
  place(order) { this.notifier.send(order) }
}
// Fix: inject dependency
class OrderService {
  constructor(notifier) { this.notifier = notifier }
  place(order) { this.notifier.send(order) }
}`,
      java: `// Problem
class OrderService {
  private EmailNotifier notifier = new EmailNotifier();
  public void place(Order order) { notifier.send(order); }
}
// Fix
interface Notifier { void send(Order order); }
class OrderService {
  private final Notifier notifier;
  public OrderService(Notifier n) { this.notifier = n; }
  public void place(Order order) { notifier.send(order); }
}`,
      py: `# Problem
class OrderService:
    def __init__(self):
        self.notifier = EmailNotifier()  # tight coupling
    def place(self, order): self.notifier.send(order)

# Fix: DI
class OrderService:
    def __init__(self, notifier):
        self.notifier = notifier
    def place(self, order): self.notifier.send(order)`,
      cpp: `// Problem
class OrderService {
  EmailNotifier notifier;  // hard dependency
public:
  void place(Order o) { notifier.send(o); }
};
// Fix
struct Notifier { virtual void send(Order) = 0; };
class OrderService {
  Notifier* notifier;
public:
  OrderService(Notifier* n): notifier(n) {}
  void place(Order o) { notifier->send(o); }
};`,
      go: `// Problem
type OrderService struct { notifier *EmailNotifier }
func NewOrderService() *OrderService { return &OrderService{notifier: &EmailNotifier{}} }

// Fix
type Notifier interface { Send(order Order) }
type OrderService struct { notifier Notifier }
func NewOrderService(n Notifier) *OrderService { return &OrderService{notifier: n} }`,
      rust: `// Problem
struct OrderService { notifier: EmailNotifier }
impl OrderService { fn place(&self, order: &Order) { self.notifier.send(order); } }

// Fix
trait Notifier { fn send(&self, order: &Order); }
struct OrderService { notifier: Box<dyn Notifier> }
impl OrderService {
  fn new(n: Box<dyn Notifier>) -> Self { OrderService { notifier: n } }
  fn place(&self, order: &Order) { self.notifier.send(order); }
}`,
      cs: `// Problem
class OrderService {
  private EmailNotifier notifier = new EmailNotifier();
  public void Place(Order o) { notifier.Send(o); }
}
// Fix
interface INotifier { void Send(Order o); }
class OrderService {
  private readonly INotifier notifier;
  public OrderService(INotifier n) { notifier = n; }
  public void Place(Order o) { notifier.Send(o); }
}`,
      kotlin: `// Problem
class OrderService {
  private val notifier = EmailNotifier()
  fun place(order: Order) = notifier.send(order)
}
// Fix
interface Notifier { fun send(order: Order) }
class OrderService(private val notifier: Notifier) {
  fun place(order: Order) = notifier.send(order)
}`,
      swift: `// Problem
class OrderService {
  private let notifier = EmailNotifier()
  func place(_ order: Order) { notifier.send(order) }
}
// Fix
protocol Notifier { func send(_ order: Order) }
class OrderService {
  private let notifier: Notifier
  init(notifier: Notifier) { self.notifier = notifier }
  func place(_ order: Order) { notifier.send(order) }
}`,
      rb: `# Problem
class OrderService
  def initialize = @notifier = EmailNotifier.new
  def place(order) = @notifier.send_notification(order)
end
# Fix
class OrderService
  def initialize(notifier) = @notifier = notifier
  def place(order) = @notifier.send_notification(order)
end`,
      php: `// Problem
class OrderService {
  private EmailNotifier $notifier;
  public function __construct() { $this->notifier = new EmailNotifier(); }
  public function place(Order $o): void { $this->notifier->send($o); }
}
// Fix
interface Notifier { public function send(Order $o): void; }
class OrderService {
  public function __construct(private Notifier $notifier) {}
  public function place(Order $o): void { $this->notifier->send($o); }
}`,
    },
    order: 214,
    status: 'published',
  },

  {
    slug: 'detect-null-checks-b2',
    title: 'Pervasive Null Checks',
    mode: 'detect',
    difficulty: 'medium',
    stem: `Every call site checks whether the logger is null before using it. What pattern would eliminate these checks?

\`\`\`
if (logger != null) logger.log("Order placed")
if (logger != null) logger.log("Payment processed")
if (logger != null) logger.log("Shipped")
\`\`\``,
    answer: 'Null Object pattern — provide a no-op logger that implements the Logger interface',
    choices: [
      'Null Object pattern — provide a no-op logger that implements the Logger interface',
      'Singleton pattern — share one global logger instance',
      'Guard clause — throw an exception if logger is null',
      'Factory Method — create a logger via a factory',
    ],
    explanation: 'The Null Object pattern provides a do-nothing object that fulfils the expected interface. Instead of checking for null, callers always use the object and a `NullLogger` silently ignores all calls. This removes conditional checks, adheres to the "Tell, Don\'t Ask" principle, and simplifies call sites.',
    codeSnippets: {
      ts: `// Problem: null checks everywhere
if (logger) logger.log('Order placed')
if (logger) logger.log('Payment processed')

// Fix: Null Object
interface Logger { log(msg: string): void }
class ConsoleLogger implements Logger { log(msg: string) { console.log(msg) } }
class NullLogger implements Logger { log(_: string) { /* no-op */ } }
// Now always safe to call
const logger: Logger = config.debug ? new ConsoleLogger() : new NullLogger()
logger.log('Order placed')
logger.log('Payment processed')`,
      js: `// Problem
if (logger) logger.log('placed')
if (logger) logger.log('processed')

// Fix: Null Object
class NullLogger { log() {} }
const logger = config.debug ? new ConsoleLogger() : new NullLogger()
logger.log('placed')  // always safe`,
      java: `// Problem
if (logger != null) logger.log("placed");
if (logger != null) logger.log("processed");

// Fix
interface Logger { void log(String msg); }
class ConsoleLogger implements Logger { public void log(String m) { System.out.println(m); } }
class NullLogger implements Logger { public void log(String m) { /* no-op */ } }`,
      py: `# Problem
if logger: logger.log('placed')
if logger: logger.log('processed')

# Fix: Null Object
class Logger:
    def log(self, msg): raise NotImplementedError
class ConsoleLogger(Logger):
    def log(self, msg): print(msg)
class NullLogger(Logger):
    def log(self, msg): pass  # no-op
logger = ConsoleLogger() if debug else NullLogger()
logger.log('placed')`,
      cpp: `// Problem
if (logger) logger->log("placed");
if (logger) logger->log("processed");

// Fix
struct Logger { virtual void log(const std::string&) = 0; };
struct ConsoleLogger : Logger { void log(const std::string& m) override { std::cout << m; } };
struct NullLogger : Logger { void log(const std::string&) override {} };`,
      go: `// Problem
if logger != nil { logger.Log("placed") }
if logger != nil { logger.Log("processed") }

// Fix
type Logger interface { Log(msg string) }
type NullLogger struct{}
func (n *NullLogger) Log(_ string) {}  // no-op
// Always safe
logger.Log("placed")`,
      rust: `// Problem: option checks everywhere
if let Some(l) = &logger { l.log("placed"); }
if let Some(l) = &logger { l.log("processed"); }

// Fix: Null Object
trait Logger { fn log(&self, msg: &str); }
struct NullLogger;
impl Logger for NullLogger { fn log(&self, _: &str) {} }
// Now use Box<dyn Logger> always`,
      cs: `// Problem
if (logger != null) logger.Log("placed");
if (logger != null) logger.Log("processed");

// Fix
interface ILogger { void Log(string msg); }
class ConsoleLogger : ILogger { public void Log(string m) => Console.WriteLine(m); }
class NullLogger : ILogger { public void Log(string m) { /* no-op */ } }`,
      kotlin: `// Problem
logger?.log("placed")
logger?.log("processed")

// Fix: Null Object
interface Logger { fun log(msg: String) }
class ConsoleLogger : Logger { override fun log(msg: String) = println(msg) }
class NullLogger : Logger { override fun log(msg: String) {} }  // no-op`,
      swift: `// Problem
logger?.log("placed")
logger?.log("processed")

// Fix: Null Object
protocol Logger { func log(_ msg: String) }
class NullLogger: Logger { func log(_ msg: String) {} }
class ConsoleLogger: Logger { func log(_ msg: String) { print(msg) } }`,
      rb: `# Problem
logger&.log('placed')
logger&.log('processed')

# Fix: Null Object
class NullLogger
  def log(_) = nil  # no-op
end
logger = debug ? ConsoleLogger.new : NullLogger.new
logger.log('placed')`,
      php: `// Problem
if ($logger !== null) $logger->log('placed');
if ($logger !== null) $logger->log('processed');

// Fix
interface Logger { public function log(string $msg): void; }
class NullLogger implements Logger { public function log(string $msg): void {} }`,
    },
    order: 215,
    status: 'published',
  },

  {
    slug: 'detect-inheritance-abuse-b2',
    title: 'Inheritance Misused for Code Reuse',
    mode: 'detect',
    difficulty: 'medium',
    stem: `\`CSVExporter\` extends \`XMLExporter\` solely to reuse its \`writeHeader()\` method, even though CSV and XML have no IS-A relationship. What is the design smell and preferred fix?`,
    answer: 'Inheritance for code reuse instead of IS-A — extract shared logic into a composed helper or utility',
    choices: [
      'Inheritance for code reuse instead of IS-A — extract shared logic into a composed helper or utility',
      'Missing Facade — wrap both exporters behind one interface',
      'Violates SRP — each exporter should have a single method',
      'No problem — inheritance for reuse is standard practice',
    ],
    explanation: 'Inheritance should model IS-A relationships, not just reuse code. `CSVExporter` is not an `XMLExporter`. Inheriting for reuse creates fragile coupling: any change to `XMLExporter` can unintentionally break `CSVExporter`. The fix is composition: extract `writeHeader()` into an `ExportHelper` class and compose it into both exporters. "Favor composition over inheritance."',
    codeSnippets: {
      ts: `// Problem: CSVExporter is NOT an XMLExporter
class XMLExporter {
  writeHeader() { console.log('<xml>') }
  export(data: any) { this.writeHeader(); console.log(JSON.stringify(data)) }
}
class CSVExporter extends XMLExporter {  // only inherits to reuse writeHeader
  export(data: any) { this.writeHeader(); console.log(Object.values(data).join(',')) }
}

// Fix: Composition
class ExportHelper { writeHeader(type: string) { console.log(type + ' header') } }
class CSVExporter { private helper = new ExportHelper(); export(data: any) { this.helper.writeHeader('csv'); } }`,
      js: `// Problem
class XMLExporter {
  writeHeader() { console.log('<xml>') }
}
class CSVExporter extends XMLExporter {  // only for reuse!
  export(data) { this.writeHeader(); }
}
// Fix
class ExportHelper { writeHeader() {} }
class CSVExporter {
  constructor() { this.helper = new ExportHelper() }
  export(data) { this.helper.writeHeader() }
}`,
      java: `// Problem
class XMLExporter {
  protected void writeHeader() { System.out.println("<xml>"); }
}
class CSVExporter extends XMLExporter {  // only to reuse writeHeader
  public void export(Object data) { writeHeader(); /* csv logic */ }
}
// Fix
class ExportHelper { public void writeHeader(String type) { System.out.println(type + " header"); } }
class CSVExporter {
  private ExportHelper helper = new ExportHelper();
  public void export(Object data) { helper.writeHeader("csv"); }
}`,
      py: `# Problem
class XMLExporter:
    def write_header(self): print('<xml>')
class CSVExporter(XMLExporter):  # not really an XMLExporter!
    def export(self, data): self.write_header()

# Fix: composition
class ExportHelper:
    def write_header(self, fmt): print(fmt + ' header')
class CSVExporter:
    def __init__(self): self.helper = ExportHelper()
    def export(self, data): self.helper.write_header('csv')`,
      cpp: `// Problem
class XMLExporter {
protected:
  void writeHeader() { std::cout << "<xml>"; }
};
class CSVExporter : public XMLExporter {  // inheritance for reuse only
public:
  void exportData() { writeHeader(); /* csv */ }
};
// Fix
class ExportHelper { public: void writeHeader() {} };
class CSVExporter { ExportHelper helper; public: void exportData() { helper.writeHeader(); } };`,
      go: `// Problem: embedding for reuse
type XMLExporter struct{}
func (x *XMLExporter) WriteHeader() { fmt.Println("<xml>") }
type CSVExporter struct { XMLExporter }  // embedding just for WriteHeader
func (c *CSVExporter) Export(data interface{}) { c.WriteHeader() }

// Fix
type ExportHelper struct{}
func (h *ExportHelper) WriteHeader() { fmt.Println("header") }
type CSVExporter struct { helper ExportHelper }
func (c *CSVExporter) Export(data interface{}) { c.helper.WriteHeader() }`,
      rust: `// Problem: misused trait with default impl just for reuse
trait XMLExporter { fn write_header(&self) { println!("<xml>"); } }
struct CSVExporter;
impl XMLExporter for CSVExporter {}  // only to inherit write_header
// Fix: composition
struct ExportHelper;
impl ExportHelper { fn write_header(&self) { println!("header"); } }
struct CSVExporter { helper: ExportHelper }
impl CSVExporter { fn export(&self) { self.helper.write_header(); } }`,
      cs: `// Problem
class XMLExporter {
  protected void WriteHeader() { Console.WriteLine("<xml>"); }
}
class CSVExporter : XMLExporter {  // not IS-A XMLExporter
  public void Export() { WriteHeader(); }
}
// Fix
class ExportHelper { public void WriteHeader() {} }
class CSVExporter {
  private ExportHelper helper = new();
  public void Export() { helper.WriteHeader(); }
}`,
      kotlin: `// Problem
open class XMLExporter {
  protected fun writeHeader() = println("<xml>")
}
class CSVExporter : XMLExporter() {  // not IS-A
  fun export() { writeHeader() }
}
// Fix
class ExportHelper { fun writeHeader() = println("header") }
class CSVExporter(private val helper: ExportHelper = ExportHelper()) {
  fun export() { helper.writeHeader() }
}`,
      swift: `// Problem
class XMLExporter {
  func writeHeader() { print("<xml>") }
}
class CSVExporter: XMLExporter {  // not IS-A
  func export() { writeHeader() }
}
// Fix
class ExportHelper { func writeHeader() { print("header") } }
class CSVExporter {
  private let helper = ExportHelper()
  func export() { helper.writeHeader() }
}`,
      rb: `# Problem
class XMLExporter
  def write_header = puts '<xml>'
end
class CSVExporter < XMLExporter  # not IS-A
  def export = write_header
end
# Fix
class ExportHelper
  def write_header = puts 'header'
end
class CSVExporter
  def initialize = @helper = ExportHelper.new
  def export = @helper.write_header
end`,
      php: `// Problem
class XMLExporter {
  protected function writeHeader(): void { echo "<xml>\n"; }
}
class CSVExporter extends XMLExporter {  // not IS-A
  public function export(): void { $this->writeHeader(); }
}
// Fix
class ExportHelper { public function writeHeader(): void { echo "header\n"; } }
class CSVExporter {
  private ExportHelper $helper;
  public function __construct() { $this->helper = new ExportHelper(); }
  public function export(): void { $this->helper->writeHeader(); }
}`,
    },
    order: 216,
    status: 'published',
  },

  // ── MEDIUM EXPLAIN ────────────────────────────────────────────────────────

  {
    slug: 'explain-observer-push-pull-b2',
    title: 'Observer Push vs Pull Model',
    mode: 'explain',
    difficulty: 'medium',
    stem: 'Explain the difference between the push and pull models in the Observer pattern. In which scenario is each preferred?',
    answer: 'Push: subject sends full data in the notification; Pull: subject notifies change only, observers query needed data',
    choices: [
      'Push: subject sends full data in the notification; Pull: subject notifies change only, observers query needed data',
      'Push: observers request updates; Pull: subject broadcasts on schedule',
      'Push: multiple subjects; Pull: single subject with one observer',
      'Push and Pull are two names for the same thing',
    ],
    explanation: 'Push model: the subject passes all relevant data to `update(data)` in the notification call. Simple but may send data observers don\'t need — tight coupling. Pull model: the subject calls `update()` with no data (or minimal context); observers then call back to query what they need via `getState()`. More flexible — observers get exactly what they need — but requires observers to hold a reference to the subject. Use Push for simple, fixed data sets. Use Pull when observers have varied needs or the subject\'s interface is stable.',
    codeSnippets: {
      ts: `// Push model
interface PushObserver { update(data: StockData): void }
class StockSubject {
  notify() { this.observers.forEach(o => o.update(this.currentData)) }
}

// Pull model
interface PullObserver { update(subject: StockSubject): void }
class StockSubject {
  getData() { return this.currentData }
  notify() { this.observers.forEach(o => o.update(this)) }
}
class PriceDisplay implements PullObserver {
  update(s: StockSubject) {
    const d = s.getData()  // observer pulls only what it needs
    this.render(d.price)
  }
}`,
      js: `// Push: subject sends data
class Subject {
  notify() { this.observers.forEach(o => o.update(this.data)) }
}
// Pull: observer fetches data
class Subject {
  getData() { return this.data }
  notify() { this.observers.forEach(o => o.update(this)) }
}`,
      java: `// Push model
interface Observer { void update(StockData data); }
// Pull model
interface Observer { void update(Subject subject); }
class PriceDisplay implements Observer {
  public void update(Subject s) {
    StockData d = ((StockSubject) s).getData();
    display(d.getPrice());
  }
}`,
      py: `# Push model
class Observer:
    def update(self, data): pass  # data is pushed by subject

# Pull model
class Observer:
    def update(self, subject): pass  # observer queries subject

class PriceDisplay:
    def update(self, subject):
        price = subject.get_data()['price']  # pull what we need
        self.render(price)`,
      cpp: `// Push
struct PushObserver { virtual void update(StockData) = 0; };
// Pull
struct PullObserver { virtual void update(Subject*) = 0; };
struct PriceDisplay : PullObserver {
  void update(Subject* s) override {
    auto data = static_cast<StockSubject*>(s)->getData();
  }
};`,
      go: `// Push
type PushObserver interface { Update(data StockData) }
// Pull
type PullObserver interface { Update(subject *StockSubject) }
type PriceDisplay struct{}
func (p *PriceDisplay) Update(s *StockSubject) {
  data := s.GetData()  // pull
  _ = data.Price
}`,
      rust: `// Push
trait PushObserver { fn update(&self, data: StockData); }
// Pull
trait PullObserver { fn update(&self, subject: &StockSubject); }
struct PriceDisplay;
impl PullObserver for PriceDisplay {
  fn update(&self, s: &StockSubject) {
    let price = s.get_data().price;  // pull
    println!("{}", price);
  }
}`,
      cs: `// Push model
interface IObserver { void Update(StockData data); }
// Pull model
interface IObserver { void Update(ISubject subject); }
class PriceDisplay : IObserver {
  public void Update(ISubject s) {
    var data = ((StockSubject)s).GetData();  // pull
    Console.WriteLine(data.Price);
  }
}`,
      kotlin: `// Push
interface PushObserver { fun update(data: StockData) }
// Pull
interface PullObserver { fun update(subject: StockSubject) }
class PriceDisplay : PullObserver {
  override fun update(subject: StockSubject) {
    val price = subject.getData().price  // pull
    println(price)
  }
}`,
      swift: `// Push
protocol PushObserver { func update(data: StockData) }
// Pull
protocol PullObserver { func update(subject: StockSubject) }
class PriceDisplay: PullObserver {
  func update(subject: StockSubject) {
    let price = subject.getData().price  // pull
    print(price)
  }
}`,
      rb: `# Push
module PushObserver; def update(data); end; end
# Pull
module PullObserver; def update(subject); end; end
class PriceDisplay; include PullObserver
  def update(subject)
    price = subject.get_data[:price]  # pull
    puts price
  end
end`,
      php: `// Push model
interface Observer { public function update(StockData $data): void; }
// Pull model
interface Observer { public function update(Subject $subject): void; }
class PriceDisplay implements Observer {
  public function update(Subject $s): void {
    $data = $s->getData();  // pull what we need
    echo $data->price;
  }
}`,
    },
    order: 217,
    status: 'published',
  },

  // ── MEDIUM SUGGEST ────────────────────────────────────────────────────────

  {
    slug: 'suggest-cache-b2',
    title: 'Transparent Caching Layer',
    mode: 'suggest',
    difficulty: 'medium',
    stem: 'You have an `ImageLoader` interface that loads images from disk. Loading is expensive. You want to add caching without modifying `ImageLoader` or any existing loaders. Client code should not need to know whether caching is active. Which pattern(s) would you apply?',
    answer: 'Proxy pattern (CachingProxy implementing ImageLoader wrapping the real loader)',
    choices: [
      'Proxy pattern (CachingProxy implementing ImageLoader wrapping the real loader)',
      'Decorator pattern — add caching behavior at runtime',
      'Facade — hide both loader and cache behind one entry point',
      'Flyweight — share image instances to avoid reloading',
    ],
    problemContext: 'An `ImageLoader` interface with `load(path: string): Image`. Disk loading is expensive. Cache should be transparent to callers.',
    keyPatterns: ['proxy', 'virtual proxy', 'cache', 'caching', 'caching proxy', 'transparent'],
    explanation: 'The Proxy pattern is ideal here: a `CachingProxy` implements the same `ImageLoader` interface, holds a cache map, and delegates to the real loader on cache miss. Clients use `ImageLoader` — they cannot tell whether they\'re talking to the proxy or the real loader. Decorator would also work, but its intent is adding behavior at runtime; Proxy\'s intent is controlling access (including caching) — a better semantic fit.',
    codeSnippets: {
      ts: `interface ImageLoader { load(path: string): Image }
class DiskImageLoader implements ImageLoader {
  load(path: string) { /* expensive disk I/O */ return new Image(path) }
}
class CachingProxy implements ImageLoader {
  private cache = new Map<string, Image>()
  constructor(private real: ImageLoader) {}
  load(path: string): Image {
    if (!this.cache.has(path)) this.cache.set(path, this.real.load(path))
    return this.cache.get(path)!
  }
}
// Usage: completely transparent
const loader: ImageLoader = new CachingProxy(new DiskImageLoader())
loader.load('logo.png')`,
      js: `class CachingProxy {
  constructor(real) { this.real = real; this.cache = new Map() }
  load(path) {
    if (!this.cache.has(path)) this.cache.set(path, this.real.load(path))
    return this.cache.get(path)
  }
}`,
      java: `interface ImageLoader { Image load(String path); }
class CachingProxy implements ImageLoader {
  private Map<String, Image> cache = new HashMap<>();
  private ImageLoader real;
  public CachingProxy(ImageLoader real) { this.real = real; }
  public Image load(String path) {
    return cache.computeIfAbsent(path, real::load);
  }
}`,
      py: `class CachingProxy:
    def __init__(self, real): self.real = real; self._cache = {}
    def load(self, path):
        if path not in self._cache:
            self._cache[path] = self.real.load(path)
        return self._cache[path]`,
      cpp: `struct ImageLoader { virtual Image load(const std::string& path) = 0; };
struct CachingProxy : ImageLoader {
  ImageLoader* real;
  std::unordered_map<std::string, Image> cache;
  Image load(const std::string& path) override {
    if (!cache.count(path)) cache[path] = real->load(path);
    return cache[path];
  }
};`,
      go: `type ImageLoader interface { Load(path string) Image }
type CachingProxy struct { real ImageLoader; cache map[string]Image }
func NewCachingProxy(r ImageLoader) *CachingProxy { return &CachingProxy{real: r, cache: map[string]Image{}} }
func (p *CachingProxy) Load(path string) Image {
  if img, ok := p.cache[path]; ok { return img }
  img := p.real.Load(path); p.cache[path] = img; return img
}`,
      rust: `use std::collections::HashMap;
trait ImageLoader { fn load(&self, path: &str) -> Image; }
struct CachingProxy { real: Box<dyn ImageLoader>, cache: HashMap<String, Image> }
impl ImageLoader for CachingProxy {
  fn load(&self, path: &str) -> Image {
    // In real code, use RefCell for interior mutability
    self.real.load(path)
  }
}`,
      cs: `interface IImageLoader { Image Load(string path); }
class CachingProxy : IImageLoader {
  private readonly IImageLoader real;
  private readonly Dictionary<string, Image> cache = new();
  public CachingProxy(IImageLoader r) { real = r; }
  public Image Load(string path) {
    if (!cache.ContainsKey(path)) cache[path] = real.Load(path);
    return cache[path];
  }
}`,
      kotlin: `interface ImageLoader { fun load(path: String): Image }
class CachingProxy(private val real: ImageLoader) : ImageLoader {
  private val cache = mutableMapOf<String, Image>()
  override fun load(path: String) = cache.getOrPut(path) { real.load(path) }
}`,
      swift: `protocol ImageLoader { func load(path: String) -> Image }
class CachingProxy: ImageLoader {
  private var cache: [String: Image] = [:]
  private let real: ImageLoader
  init(_ real: ImageLoader) { self.real = real }
  func load(path: String) -> Image {
    if cache[path] == nil { cache[path] = real.load(path: path) }
    return cache[path]!
  }
}`,
      rb: `class CachingProxy
  def initialize(real) = (@real = real; @cache = {})
  def load(path)
    @cache[path] ||= @real.load(path)
  end
end`,
      php: `interface ImageLoader { public function load(string $path): Image; }
class CachingProxy implements ImageLoader {
  private array $cache = [];
  public function __construct(private ImageLoader $real) {}
  public function load(string $path): Image {
    return $this->cache[$path] ??= $this->real->load($path);
  }
}`,
    },
    order: 218,
    status: 'published',
  },

  {
    slug: 'suggest-logging-framework-b2',
    title: 'Extensible Logging Framework',
    mode: 'suggest',
    difficulty: 'medium',
    stem: 'You are building a logging library. Logs should flow through severity levels (DEBUG→INFO→WARN→ERROR) and each level can be handled by multiple handlers (console, file, remote). New handlers and levels should be addable without changing existing code. Which pattern(s) best structure this?',
    answer: 'Chain of Responsibility for level routing combined with Observer for multiple handlers per level',
    choices: [
      'Chain of Responsibility for level routing combined with Observer for multiple handlers per level',
      'Strategy pattern — swap logging algorithms at runtime',
      'Decorator pattern — wrap each logger to add handlers',
      'Composite — treat all handlers as a single logger',
    ],
    problemContext: 'Logging library: severity chain + multiple handlers per level + extensible without modification.',
    keyPatterns: ['chain', 'chain of responsibility', 'observer', 'handler', 'level', 'routing'],
    explanation: 'Chain of Responsibility routes messages by severity level — each node handles its level and forwards to the next. Observer (or the Composite "broadcast" pattern) allows multiple handlers at each level to respond (console AND file AND remote simultaneously). Together: CoR handles WHICH level, Observer handles WHO gets notified at that level. This is how log4j / SLF4J / Winston are structured internally.',
    codeSnippets: {
      ts: `// Chain of Responsibility for levels
abstract class LogHandler {
  protected next?: LogHandler
  setNext(h: LogHandler) { this.next = h; return h }
  abstract handle(level: string, msg: string): void
  protected forward(level: string, msg: string) { this.next?.handle(level, msg) }
}
// Observer for multiple handlers at each level
class LevelHandler extends LogHandler {
  private handlers: ((msg: string) => void)[] = []
  subscribe(h: (msg: string) => void) { this.handlers.push(h) }
  handle(level: string, msg: string) {
    if (level === this.level) this.handlers.forEach(h => h(msg))
    this.forward(level, msg)
  }
  constructor(private level: string) { super() }
}`,
      js: `class LevelHandler {
  constructor(level) { this.level = level; this.handlers = []; this.next = null }
  subscribe(h) { this.handlers.push(h) }
  setNext(h) { this.next = h; return h }
  handle(level, msg) {
    if (level === this.level) this.handlers.forEach(h => h(msg))
    if (this.next) this.next.handle(level, msg)
  }
}`,
      java: `abstract class LogHandler {
  protected LogHandler next;
  public LogHandler setNext(LogHandler h) { next = h; return h; }
  public abstract void handle(String level, String msg);
  protected void forward(String level, String msg) { if (next != null) next.handle(level, msg); }
}
class LevelHandler extends LogHandler {
  private final String myLevel;
  private final List<Consumer<String>> handlers = new ArrayList<>();
  public LevelHandler(String level) { myLevel = level; }
  public void subscribe(Consumer<String> h) { handlers.add(h); }
  public void handle(String level, String msg) {
    if (myLevel.equals(level)) handlers.forEach(h -> h.accept(msg));
    forward(level, msg);
  }
}`,
      py: `class LogHandler:
    def __init__(self, level):
        self.level = level; self.next = None; self.handlers = []
    def set_next(self, h): self.next = h; return h
    def subscribe(self, h): self.handlers.append(h)
    def handle(self, level, msg):
        if level == self.level:
            for h in self.handlers: h(msg)
        if self.next: self.next.handle(level, msg)`,
      cpp: `// Pattern: CoR + Observer
class LogHandler {
protected:
  LogHandler* next = nullptr;
  std::vector<std::function<void(const std::string&)>> handlers;
  std::string level;
public:
  LogHandler(std::string lvl) : level(lvl) {}
  void subscribe(std::function<void(const std::string&)> h) { handlers.push_back(h); }
  void setNext(LogHandler* n) { next = n; }
  void handle(const std::string& lvl, const std::string& msg) {
    if (lvl == level) for (auto& h : handlers) h(msg);
    if (next) next->handle(lvl, msg);
  }
};`,
      go: `type LogHandler struct {
  level    string
  handlers []func(string)
  next     *LogHandler
}
func (h *LogHandler) Subscribe(fn func(string)) { h.handlers = append(h.handlers, fn) }
func (h *LogHandler) Handle(level, msg string) {
  if h.level == level { for _, fn := range h.handlers { fn(msg) } }
  if h.next != nil { h.next.Handle(level, msg) }
}`,
      rust: `// CoR + Observer for logging
struct LogHandler { level: String, handlers: Vec<Box<dyn Fn(&str)>>, next: Option<Box<LogHandler>> }
impl LogHandler {
  fn subscribe(&mut self, h: impl Fn(&str) + 'static) { self.handlers.push(Box::new(h)); }
  fn handle(&self, level: &str, msg: &str) {
    if self.level == level { for h in &self.handlers { h(msg); } }
    if let Some(n) = &self.next { n.handle(level, msg); }
  }
}`,
      cs: `class LogHandler {
  private string level; private LogHandler? next;
  private List<Action<string>> handlers = new();
  public LogHandler(string level) { this.level = level; }
  public LogHandler SetNext(LogHandler h) { next = h; return h; }
  public void Subscribe(Action<string> h) { handlers.Add(h); }
  public void Handle(string lvl, string msg) {
    if (lvl == level) handlers.ForEach(h => h(msg));
    next?.Handle(lvl, msg);
  }
}`,
      kotlin: `class LogHandler(private val level: String) {
  private val handlers = mutableListOf<(String) -> Unit>()
  var next: LogHandler? = null
  fun subscribe(h: (String) -> Unit) { handlers.add(h) }
  fun handle(lvl: String, msg: String) {
    if (lvl == level) handlers.forEach { it(msg) }
    next?.handle(lvl, msg)
  }
}`,
      swift: `class LogHandler {
  let level: String
  var handlers: [(String) -> Void] = []
  var next: LogHandler?
  init(_ level: String) { self.level = level }
  func subscribe(_ h: @escaping (String) -> Void) { handlers.append(h) }
  func handle(level: String, msg: String) {
    if level == self.level { handlers.forEach { $0(msg) } }
    next?.handle(level: level, msg: msg)
  }
}`,
      rb: `class LogHandler
  def initialize(level) = (@level = level; @handlers = []; @next = nil)
  attr_writer :next
  def subscribe(h) = @handlers << h
  def handle(level, msg)
    @handlers.each { |h| h.call(msg) } if level == @level
    @next&.handle(level, msg)
  end
end`,
      php: `class LogHandler {
  private array $handlers = [];
  private ?LogHandler $next = null;
  public function __construct(private string $level) {}
  public function setNext(LogHandler $h): LogHandler { $this->next = $h; return $h; }
  public function subscribe(callable $h): void { $this->handlers[] = $h; }
  public function handle(string $level, string $msg): void {
    if ($level === $this->level) foreach ($this->handlers as $h) $h($msg);
    $this->next?->handle($level, $msg);
  }
}`,
    },
    order: 219,
    status: 'published',
  },

  // ── HARD IDENTIFY ─────────────────────────────────────────────────────────

  {
    slug: 'proxy-protection-b2',
    title: 'Access Control Proxy',
    mode: 'identify',
    difficulty: 'hard',
    stem: 'A `SecureFileSystem` wraps a `RealFileSystem` implementing the same interface. Before delegating to `RealFileSystem`, it checks permissions, logs access, and rejects unauthorized operations. What pattern is this, and which subtype?',
    answer: 'Proxy — specifically a Protection Proxy (access control)',
    choices: [
      'Proxy — specifically a Protection Proxy (access control)',
      'Decorator — adds security behavior at runtime',
      'Facade — simplifies a complex file system interface',
      'Chain of Responsibility — passes requests through security checks',
    ],
    explanation: 'A Protection Proxy controls access to the real object by checking permissions before delegating. It looks identical to Decorator from the outside (same interface, wraps the real object), but the intent differs: Decorator adds behavior, Proxy controls access. Proxy subtypes: Virtual (lazy creation), Remote (network delegation), Protection (auth/authz), Caching (memoization), Logging, Smart Reference.',
    codeSnippets: {
      ts: `interface FileSystem { read(path: string): string; write(path: string, data: string): void }
class RealFileSystem implements FileSystem {
  read(path: string) { return 'data' }
  write(path: string, data: string) { /* disk write */ }
}
class SecureFileSystem implements FileSystem {
  constructor(private real: FileSystem, private user: User) {}
  read(path: string): string {
    if (!this.user.canRead(path)) throw new Error('Access denied')
    console.log('read access ' + path + ' by ' + this.user.name)
    return this.real.read(path)
  }
  write(path: string, data: string): void {
    if (!this.user.canWrite(path)) throw new Error('Access denied')
    this.real.write(path, data)
  }
}`,
      js: `class SecureFileSystem {
  constructor(real, user) { this.real = real; this.user = user }
  read(path) {
    if (!this.user.canRead(path)) throw new Error('Access denied')
    return this.real.read(path)
  }
  write(path, data) {
    if (!this.user.canWrite(path)) throw new Error('Access denied')
    this.real.write(path, data)
  }
}`,
      java: `interface FileSystem { String read(String path); void write(String path, String data); }
class SecureFileSystem implements FileSystem {
  private FileSystem real; private User user;
  SecureFileSystem(FileSystem real, User user) { this.real = real; this.user = user; }
  public String read(String path) {
    if (!user.canRead(path)) throw new SecurityException("Access denied");
    return real.read(path);
  }
  public void write(String path, String data) {
    if (!user.canWrite(path)) throw new SecurityException("Access denied");
    real.write(path, data);
  }
}`,
      py: `class SecureFileSystem:
    def __init__(self, real, user):
        self.real = real; self.user = user
    def read(self, path):
        if not self.user.can_read(path): raise PermissionError('Access denied')
        return self.real.read(path)
    def write(self, path, data):
        if not self.user.can_write(path): raise PermissionError('Access denied')
        self.real.write(path, data)`,
      cpp: `struct FileSystem { virtual std::string read(const std::string& p) = 0; virtual void write(const std::string& p, const std::string& d) = 0; };
struct SecureFileSystem : FileSystem {
  FileSystem* real; User* user;
  std::string read(const std::string& p) override {
    if (!user->canRead(p)) throw std::runtime_error("denied");
    return real->read(p);
  }
  void write(const std::string& p, const std::string& d) override {
    if (!user->canWrite(p)) throw std::runtime_error("denied");
    real->write(p, d);
  }
};`,
      go: `type FileSystem interface { Read(path string) string; Write(path, data string) }
type SecureFS struct { real FileSystem; user *User }
func (s *SecureFS) Read(path string) string {
  if !s.user.CanRead(path) { panic("access denied") }
  return s.real.Read(path)
}
func (s *SecureFS) Write(path, data string) {
  if !s.user.CanWrite(path) { panic("access denied") }
  s.real.Write(path, data)
}`,
      rust: `trait FileSystem { fn read(&self, path: &str) -> String; fn write(&self, path: &str, data: &str); }
struct SecureFS<F: FileSystem> { real: F, user: User }
impl<F: FileSystem> FileSystem for SecureFS<F> {
  fn read(&self, path: &str) -> String {
    assert!(self.user.can_read(path), "access denied");
    self.real.read(path)
  }
  fn write(&self, path: &str, data: &str) {
    assert!(self.user.can_write(path), "access denied");
    self.real.write(path, data);
  }
}`,
      cs: `interface IFileSystem { string Read(string path); void Write(string path, string data); }
class SecureFileSystem : IFileSystem {
  private IFileSystem real; private User user;
  public SecureFileSystem(IFileSystem r, User u) { real = r; user = u; }
  public string Read(string path) {
    if (!user.CanRead(path)) throw new UnauthorizedAccessException();
    return real.Read(path);
  }
  public void Write(string path, string data) {
    if (!user.CanWrite(path)) throw new UnauthorizedAccessException();
    real.Write(path, data);
  }
}`,
      kotlin: `interface FileSystem { fun read(path: String): String; fun write(path: String, data: String) }
class SecureFS(private val real: FileSystem, private val user: User) : FileSystem {
  override fun read(path: String): String {
    require(user.canRead(path)) { "Access denied" }
    return real.read(path)
  }
  override fun write(path: String, data: String) {
    require(user.canWrite(path)) { "Access denied" }
    real.write(path, data)
  }
}`,
      swift: `protocol FileSystem { func read(path: String) -> String; func write(path: String, data: String) }
class SecureFS: FileSystem {
  private let real: FileSystem; private let user: User
  init(_ real: FileSystem, _ user: User) { self.real = real; self.user = user }
  func read(path: String) -> String {
    guard user.canRead(path) else { fatalError("access denied") }
    return real.read(path: path)
  }
  func write(path: String, data: String) {
    guard user.canWrite(path) else { fatalError("access denied") }
    real.write(path: path, data: data)
  }
}`,
      rb: `class SecureFS
  def initialize(real, user) = (@real = real; @user = user)
  def read(path)
    raise 'Access denied' unless @user.can_read?(path)
    @real.read(path)
  end
  def write(path, data)
    raise 'Access denied' unless @user.can_write?(path)
    @real.write(path, data)
  end
end`,
      php: `interface FileSystem { public function read(string $path): string; public function write(string $path, string $data): void; }
class SecureFileSystem implements FileSystem {
  public function __construct(private FileSystem $real, private User $user) {}
  public function read(string $path): string {
    if (!$this->user->canRead($path)) throw new \RuntimeException('Access denied');
    return $this->real->read($path);
  }
  public function write(string $path, string $data): void {
    if (!$this->user->canWrite($path)) throw new \RuntimeException('Access denied');
    $this->real->write($path, $data);
  }
}`,
    },
    order: 220,
    status: 'published',
  },

  {
    slug: 'flyweight-particles-b2',
    title: 'Particle System Flyweight',
    mode: 'identify',
    difficulty: 'hard',
    stem: 'A particle system renders 100,000 particles. Each particle stores its own `x`, `y`, `velocity` but shares `color`, `sprite`, and `maxSize` with all particles of the same type. Shared state is stored in a `ParticleType` object. Individual particles hold a reference to their type. What pattern is used?',
    answer: 'Flyweight',
    choices: ['Flyweight', 'Prototype', 'Multiton', 'Object Pool'],
    explanation: 'Flyweight separates intrinsic state (shared, immutable — `color`, `sprite`, `maxSize`) from extrinsic state (unique per instance — `x`, `y`, `velocity`). The `ParticleType` is the flyweight object; individual `Particle`s store only their extrinsic state plus a reference to the shared flyweight. This reduces memory from N×(all fields) to N×(extrinsic fields) + K×(intrinsic fields), where K is the number of distinct types.',
    codeSnippets: {
      ts: `// Flyweight: intrinsic state
class ParticleType {
  constructor(public color: string, public sprite: string, public maxSize: number) {}
}
// Context: extrinsic state
class Particle {
  constructor(
    public x: number, public y: number, public vx: number, public vy: number,
    private type: ParticleType  // shared flyweight
  ) {}
  render() { console.log('render ' + this.type.sprite + ' at ' + this.x + ',' + this.y) }
}
// Factory / Flyweight pool
class ParticleFactory {
  private types = new Map<string, ParticleType>()
  getType(color: string, sprite: string, size: number): ParticleType {
    const key = color + sprite + size
    if (!this.types.has(key)) this.types.set(key, new ParticleType(color, sprite, size))
    return this.types.get(key)!
  }
}`,
      js: `class ParticleType {
  constructor(color, sprite, maxSize) { this.color = color; this.sprite = sprite; this.maxSize = maxSize }
}
class Particle {
  constructor(x, y, vx, vy, type) { this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.type = type }
  render() { console.log('render ' + this.type.sprite + ' at ' + this.x + ',' + this.y) }
}
class ParticleFactory {
  constructor() { this.pool = new Map() }
  get(color, sprite, size) {
    const k = color + sprite + size
    if (!this.pool.has(k)) this.pool.set(k, new ParticleType(color, sprite, size))
    return this.pool.get(k)
  }
}`,
      java: `// Flyweight
class ParticleType {
  final String color, sprite; final int maxSize;
  ParticleType(String c, String s, int m) { color=c; sprite=s; maxSize=m; }
}
// Context
class Particle {
  double x, y, vx, vy; ParticleType type;
  void render() { System.out.printf("render %s at %.0f,%.0f%n", type.sprite, x, y); }
}
class ParticleFactory {
  private Map<String, ParticleType> pool = new HashMap<>();
  public ParticleType get(String c, String s, int m) {
    return pool.computeIfAbsent(c+s+m, k -> new ParticleType(c, s, m));
  }
}`,
      py: `# Flyweight
class ParticleType:
    def __init__(self, color, sprite, max_size):
        self.color = color; self.sprite = sprite; self.max_size = max_size
# Context
class Particle:
    def __init__(self, x, y, vx, vy, ptype):
        self.x = x; self.y = y; self.vx = vx; self.vy = vy; self.ptype = ptype
    def render(self): print(f'render {self.ptype.sprite} at {self.x},{self.y}')
class ParticleFactory:
    def __init__(self): self._pool = {}
    def get(self, color, sprite, max_size):
        key = (color, sprite, max_size)
        if key not in self._pool: self._pool[key] = ParticleType(color, sprite, max_size)
        return self._pool[key]`,
      cpp: `struct ParticleType { std::string color, sprite; int maxSize; };
struct Particle {
  float x, y, vx, vy;
  ParticleType* type;  // shared flyweight
  void render() { std::cout << type->sprite << " at " << x << "," << y; }
};
class ParticleFactory {
  std::map<std::string, ParticleType> pool;
public:
  ParticleType* get(const std::string& c, const std::string& s, int m) {
    std::string key = c + s + std::to_string(m);
    if (!pool.count(key)) pool[key] = {c, s, m};
    return &pool[key];
  }
};`,
      go: `// Flyweight intrinsic state
type ParticleType struct { Color, Sprite string; MaxSize int }
// Context with extrinsic state
type Particle struct { X, Y, VX, VY float64; Type *ParticleType }
func (p *Particle) Render() { fmt.Printf("render %s at %.0f,%.0f\n", p.Type.Sprite, p.X, p.Y) }
// Pool
type ParticleFactory struct { pool map[string]*ParticleType }
func (f *ParticleFactory) Get(c, s string, m int) *ParticleType {
  k := c + s + fmt.Sprint(m)
  if f.pool[k] == nil { f.pool[k] = &ParticleType{c, s, m} }
  return f.pool[k]
}`,
      rust: `use std::collections::HashMap;
#[derive(Clone)]
struct ParticleType { color: String, sprite: String, max_size: u32 }
struct Particle { x: f32, y: f32, vx: f32, vy: f32, pt: ParticleType }
impl Particle { fn render(&self) { println!("render {} at {},{}", self.pt.sprite, self.x, self.y); } }
struct ParticleFactory { pool: HashMap<String, ParticleType> }
impl ParticleFactory {
  fn get(&mut self, c: &str, s: &str, m: u32) -> ParticleType {
    self.pool.entry(format!("{}{}{}", c, s, m))
      .or_insert_with(|| ParticleType { color: c.into(), sprite: s.into(), max_size: m })
      .clone()
  }
}`,
      cs: `// Flyweight
record ParticleType(string Color, string Sprite, int MaxSize);
class Particle {
  public float X, Y, VX, VY; public ParticleType Type;
  public void Render() => Console.WriteLine($"render {Type.Sprite} at {X},{Y}");
}
class ParticleFactory {
  private Dictionary<string, ParticleType> pool = new();
  public ParticleType Get(string c, string s, int m) {
    string key = c + s + m;
    if (!pool.ContainsKey(key)) pool[key] = new ParticleType(c, s, m);
    return pool[key];
  }
}`,
      kotlin: `data class ParticleType(val color: String, val sprite: String, val maxSize: Int)
data class Particle(val x: Double, val y: Double, val vx: Double, val vy: Double, val type: ParticleType)
class ParticleFactory {
  private val pool = mutableMapOf<String, ParticleType>()
  fun get(color: String, sprite: String, maxSize: Int): ParticleType {
    val key = "$color$sprite$maxSize"
    return pool.getOrPut(key) { ParticleType(color, sprite, maxSize) }
  }
}`,
      swift: `struct ParticleType { let color, sprite: String; let maxSize: Int }
struct Particle { var x, y, vx, vy: Double; let type: ParticleType }
class ParticleFactory {
  private var pool: [String: ParticleType] = [:]
  func get(color: String, sprite: String, maxSize: Int) -> ParticleType {
    let key = color + sprite + "\(maxSize)"
    if pool[key] == nil { pool[key] = ParticleType(color: color, sprite: sprite, maxSize: maxSize) }
    return pool[key]!
  }
}`,
      rb: `ParticleType = Struct.new(:color, :sprite, :max_size)
Particle = Struct.new(:x, :y, :vx, :vy, :type) do
  def render = puts "render #{type.sprite} at #{x},#{y}"
end
class ParticleFactory
  def initialize = @pool = {}
  def get(color, sprite, max_size)
    key = [color, sprite, max_size]
    @pool[key] ||= ParticleType.new(color, sprite, max_size)
  end
end`,
      php: `class ParticleType {
  public function __construct(public string $color, public string $sprite, public int $maxSize) {}
}
class Particle {
  public function __construct(
    public float $x, public float $y, public float $vx, public float $vy,
    private ParticleType $type
  ) {}
  public function render(): void { echo "render {$this->type->sprite} at {$this->x},{$this->y}\n"; }
}
class ParticleFactory {
  private array $pool = [];
  public function get(string $c, string $s, int $m): ParticleType {
    $key = $c . $s . $m;
    return $this->pool[$key] ??= new ParticleType($c, $s, $m);
  }
}`,
    },
    order: 221,
    status: 'published',
  },

  {
    slug: 'visitor-tax-b2',
    title: 'Tax Calculation Visitor',
    mode: 'identify',
    difficulty: 'hard',
    stem: 'An e-commerce system has item types: `Book`, `Electronics`, `Grocery`. Tax rules differ per item type and change independently. A `TaxCalculator` visitor is added that calls `visitBook()`, `visitElectronics()`, `visitGrocery()`. Later a `ShippingCostCalculator` visitor is added without modifying item classes. What pattern and principle does this demonstrate?',
    answer: 'Visitor pattern — enables adding new operations (calculators) without modifying item classes (OCP)',
    choices: [
      'Visitor pattern — enables adding new operations (calculators) without modifying item classes (OCP)',
      'Strategy pattern — swaps tax algorithm at runtime per item',
      'Template Method — defines tax skeleton with item-specific steps',
      'Chain of Responsibility — routes tax calculation by item type',
    ],
    explanation: 'Visitor separates operations from the object structure they operate on. Each item class calls `accept(visitor)` which triggers double dispatch — the item type and visitor type together determine the method called. New operations (new visitor classes) can be added without changing item classes. The trade-off: adding a new item class requires updating all existing visitors.',
    codeSnippets: {
      ts: `interface TaxVisitor { visitBook(b: Book): number; visitElectronics(e: Electronics): number; visitGrocery(g: Grocery): number }
interface Item { accept(v: TaxVisitor): number }
class Book implements Item {
  constructor(public price: number) {}
  accept(v: TaxVisitor) { return v.visitBook(this) }
}
class Electronics implements Item {
  constructor(public price: number) {}
  accept(v: TaxVisitor) { return v.visitElectronics(this) }
}
class TaxCalculator implements TaxVisitor {
  visitBook(b: Book) { return b.price * 0.0 }       // books: tax-exempt
  visitElectronics(e: Electronics) { return e.price * 0.18 }
  visitGrocery(g: Grocery) { return g.price * 0.05 }
}`,
      js: `class Book { constructor(price) { this.price = price }; accept(v) { return v.visitBook(this) } }
class Electronics { constructor(price) { this.price = price }; accept(v) { return v.visitElectronics(this) } }
class TaxCalculator {
  visitBook(b) { return 0 }
  visitElectronics(e) { return e.price * 0.18 }
  visitGrocery(g) { return g.price * 0.05 }
}`,
      java: `interface TaxVisitor { double visitBook(Book b); double visitElectronics(Electronics e); double visitGrocery(Grocery g); }
interface Item { double accept(TaxVisitor v); }
class Book implements Item {
  double price;
  public double accept(TaxVisitor v) { return v.visitBook(this); }
}
class TaxCalculator implements TaxVisitor {
  public double visitBook(Book b) { return 0; }
  public double visitElectronics(Electronics e) { return e.price * 0.18; }
  public double visitGrocery(Grocery g) { return g.price * 0.05; }
}`,
      py: `class TaxVisitor:
    def visit_book(self, b): ...
    def visit_electronics(self, e): ...
    def visit_grocery(self, g): ...
class Book:
    def __init__(self, price): self.price = price
    def accept(self, v): return v.visit_book(self)
class TaxCalculator(TaxVisitor):
    def visit_book(self, b): return 0
    def visit_electronics(self, e): return e.price * 0.18
    def visit_grocery(self, g): return g.price * 0.05`,
      cpp: `struct TaxVisitor;
struct Item { virtual double accept(TaxVisitor&) = 0; };
struct Book : Item { double price; double accept(TaxVisitor& v) override; };
struct Electronics : Item { double price; double accept(TaxVisitor& v) override; };
struct TaxVisitor {
  virtual double visitBook(Book&) = 0;
  virtual double visitElectronics(Electronics&) = 0;
};`,
      go: `type TaxVisitor interface { VisitBook(b *Book) float64; VisitElectronics(e *Electronics) float64 }
type Book struct { Price float64 }
func (b *Book) Accept(v TaxVisitor) float64 { return v.VisitBook(b) }
type TaxCalculator struct{}
func (t *TaxCalculator) VisitBook(b *Book) float64 { return 0 }
func (t *TaxCalculator) VisitElectronics(e *Electronics) float64 { return e.Price * 0.18 }`,
      rust: `trait TaxVisitor { fn visit_book(&self, b: &Book) -> f64; fn visit_electronics(&self, e: &Electronics) -> f64; }
struct Book { price: f64 }
impl Book { fn accept(&self, v: &dyn TaxVisitor) -> f64 { v.visit_book(self) } }
struct TaxCalculator;
impl TaxVisitor for TaxCalculator {
  fn visit_book(&self, _: &Book) -> f64 { 0.0 }
  fn visit_electronics(&self, e: &Electronics) -> f64 { e.price * 0.18 }
}`,
      cs: `interface ITaxVisitor { double VisitBook(Book b); double VisitElectronics(Electronics e); }
interface IItem { double Accept(ITaxVisitor v); }
class Book : IItem { public double Price; public double Accept(ITaxVisitor v) => v.VisitBook(this); }
class TaxCalculator : ITaxVisitor {
  public double VisitBook(Book b) => 0;
  public double VisitElectronics(Electronics e) => e.Price * 0.18;
}`,
      kotlin: `interface TaxVisitor { fun visitBook(b: Book): Double; fun visitElectronics(e: Electronics): Double }
interface Item { fun accept(v: TaxVisitor): Double }
class Book(val price: Double) : Item { override fun accept(v: TaxVisitor) = v.visitBook(this) }
class TaxCalculator : TaxVisitor {
  override fun visitBook(b: Book) = 0.0
  override fun visitElectronics(e: Electronics) = e.price * 0.18
}`,
      swift: `protocol TaxVisitor { func visitBook(_ b: Book) -> Double; func visitElectronics(_ e: Electronics) -> Double }
protocol Item { func accept(_ v: TaxVisitor) -> Double }
class Book: Item { let price: Double; init(_ p: Double) { price = p }; func accept(_ v: TaxVisitor) -> Double { v.visitBook(self) } }
class TaxCalculator: TaxVisitor {
  func visitBook(_ b: Book) -> Double { 0 }
  func visitElectronics(_ e: Electronics) -> Double { e.price * 0.18 }
}`,
      rb: `module TaxVisitor; def visit_book(b); end; def visit_electronics(e); end; end
class Book
  attr_reader :price
  def initialize(p) = @price = p
  def accept(v) = v.visit_book(self)
end
class TaxCalculator; include TaxVisitor
  def visit_book(b) = 0
  def visit_electronics(e) = e.price * 0.18
end`,
      php: `interface TaxVisitor { public function visitBook(Book $b): float; public function visitElectronics(Electronics $e): float; }
interface Item { public function accept(TaxVisitor $v): float; }
class Book implements Item {
  public function __construct(public float $price) {}
  public function accept(TaxVisitor $v): float { return $v->visitBook($this); }
}
class TaxCalculator implements TaxVisitor {
  public function visitBook(Book $b): float { return 0; }
  public function visitElectronics(Electronics $e): float { return $e->price * 0.18; }
}`,
    },
    order: 222,
    status: 'published',
  },

  // ── HARD DETECT ───────────────────────────────────────────────────────────

  {
    slug: 'detect-service-locator-b2',
    title: 'Service Locator Antipattern',
    mode: 'detect',
    difficulty: 'hard',
    stem: `A class resolves its own dependencies via a global \`ServiceLocator.get('emailService')\` call inside a method. What is the key design problem with this approach compared to Dependency Injection?`,
    answer: 'Hidden dependencies — the class\'s dependencies are invisible from its constructor signature, making testing and reasoning difficult',
    choices: [
      'Hidden dependencies — the class\'s dependencies are invisible from its constructor signature, making testing and reasoning difficult',
      'Performance — Service Locator has higher lookup overhead than DI',
      'Memory leaks — services are never garbage collected from the locator',
      'Thread safety — concurrent access to the global locator causes race conditions',
    ],
    explanation: 'Service Locator hides dependencies: you cannot tell what a class needs by looking at its constructor. This violates the "Explicit Dependencies Principle." With DI, all dependencies are declared upfront (constructor parameters), making them visible, mockable, and enforced by the compiler. Service Locator is sometimes called an antipattern because: (1) hidden coupling is hard to test — you must configure the global locator before each test, (2) dependencies can change without compile-time errors, (3) it creates global mutable state. DI containers achieve the same goal with explicit, verifiable dependencies.',
    codeSnippets: {
      ts: `// Problem: Service Locator
class OrderService {
  place(order: Order) {
    // Hidden dependency — invisible to callers
    const emailer = ServiceLocator.get<EmailService>('emailService')
    const payment = ServiceLocator.get<PaymentService>('paymentService')
    payment.charge(order)
    emailer.send(order)
  }
}

// Fix: Dependency Injection
class OrderService {
  // All dependencies explicit and verifiable
  constructor(
    private payment: PaymentService,
    private emailer: EmailService,
  ) {}
  place(order: Order) {
    this.payment.charge(order)
    this.emailer.send(order)
  }
}`,
      js: `// Problem: Service Locator hides dependencies
class OrderService {
  place(order) {
    const emailer = ServiceLocator.get('emailService')  // hidden!
    const payment = ServiceLocator.get('paymentService')  // hidden!
    payment.charge(order); emailer.send(order)
  }
}
// Fix: DI — explicit dependencies
class OrderService {
  constructor(payment, emailer) { this.payment = payment; this.emailer = emailer }
  place(order) { this.payment.charge(order); this.emailer.send(order) }
}`,
      java: `// Problem: Service Locator
class OrderService {
  public void place(Order order) {
    EmailService email = ServiceLocator.get(EmailService.class);  // hidden
    PaymentService payment = ServiceLocator.get(PaymentService.class);  // hidden
    payment.charge(order); email.send(order);
  }
}
// Fix: DI
class OrderService {
  private final PaymentService payment; private final EmailService emailer;
  public OrderService(PaymentService p, EmailService e) { payment = p; emailer = e; }
  public void place(Order o) { payment.charge(o); emailer.send(o); }
}`,
      py: `# Problem: Service Locator
class OrderService:
    def place(self, order):
        emailer = service_locator.get('email')   # hidden dependency
        payment = service_locator.get('payment') # hidden dependency
        payment.charge(order)
        emailer.send(order)

# Fix: DI — dependencies declared in __init__
class OrderService:
    def __init__(self, payment, emailer):
        self.payment = payment
        self.emailer = emailer
    def place(self, order):
        self.payment.charge(order)
        self.emailer.send(order)`,
      cpp: `// Problem: Service Locator
class OrderService {
public:
  void place(Order& order) {
    auto emailer = ServiceLocator::get<EmailService>();  // hidden
    auto payment = ServiceLocator::get<PaymentService>();
    payment->charge(order); emailer->send(order);
  }
};
// Fix: DI
class OrderService {
  PaymentService* payment; EmailService* emailer;
public:
  OrderService(PaymentService* p, EmailService* e): payment(p), emailer(e) {}
  void place(Order& o) { payment->charge(o); emailer->send(o); }
};`,
      go: `// Problem: Service Locator (global registry)
func (s *OrderService) Place(order Order) {
  emailer := locator.Get("email").(EmailService)   // hidden
  payment := locator.Get("payment").(PaymentService)
  payment.Charge(order); emailer.Send(order)
}
// Fix: DI
type OrderService struct { payment PaymentService; emailer EmailService }
func NewOrderService(p PaymentService, e EmailService) *OrderService { return &OrderService{p, e} }
func (s *OrderService) Place(o Order) { s.payment.Charge(o); s.emailer.Send(o) }`,
      rust: `// Problem: Service Locator
struct OrderService;
impl OrderService {
  fn place(&self, order: Order) {
    let emailer = LOCATOR.get::<EmailService>();  // hidden dependency!
    let payment = LOCATOR.get::<PaymentService>();
    payment.charge(&order); emailer.send(&order);
  }
}
// Fix: DI
struct OrderService { payment: Box<dyn PaymentService>, emailer: Box<dyn EmailService> }
impl OrderService {
  fn new(p: Box<dyn PaymentService>, e: Box<dyn EmailService>) -> Self { OrderService { payment: p, emailer: e } }
  fn place(&self, order: &Order) { self.payment.charge(order); self.emailer.send(order); }
}`,
      cs: `// Problem: Service Locator
class OrderService {
  public void Place(Order order) {
    var emailer = ServiceLocator.Get<IEmailService>();  // hidden
    var payment = ServiceLocator.Get<IPaymentService>();
    payment.Charge(order); emailer.Send(order);
  }
}
// Fix: Constructor DI
class OrderService {
  private readonly IPaymentService payment; private readonly IEmailService emailer;
  public OrderService(IPaymentService p, IEmailService e) { payment = p; emailer = e; }
  public void Place(Order o) { payment.Charge(o); emailer.Send(o); }
}`,
      kotlin: `// Problem: Service Locator
class OrderService {
  fun place(order: Order) {
    val emailer = ServiceLocator.get<EmailService>()  // hidden
    val payment = ServiceLocator.get<PaymentService>()
    payment.charge(order); emailer.send(order)
  }
}
// Fix: Constructor DI
class OrderService(private val payment: PaymentService, private val emailer: EmailService) {
  fun place(order: Order) { payment.charge(order); emailer.send(order) }
}`,
      swift: `// Problem: Service Locator
class OrderService {
  func place(_ order: Order) {
    let emailer = ServiceLocator.get(EmailService.self)  // hidden
    let payment = ServiceLocator.get(PaymentService.self)
    payment.charge(order); emailer.send(order)
  }
}
// Fix: Constructor DI
class OrderService {
  let payment: PaymentService; let emailer: EmailService
  init(payment: PaymentService, emailer: EmailService) { self.payment = payment; self.emailer = emailer }
  func place(_ order: Order) { payment.charge(order); emailer.send(order) }
}`,
      rb: `# Problem: Service Locator
class OrderService
  def place(order)
    emailer = ServiceLocator.get(:email)   # hidden
    payment = ServiceLocator.get(:payment) # hidden
    payment.charge(order)
    emailer.send(order)
  end
end
# Fix: DI
class OrderService
  def initialize(payment, emailer) = (@payment = payment; @emailer = emailer)
  def place(order)
    @payment.charge(order)
    @emailer.send(order)
  end
end`,
      php: `// Problem: Service Locator
class OrderService {
  public function place(Order $order): void {
    $emailer = ServiceLocator::get('email');    // hidden
    $payment = ServiceLocator::get('payment');  // hidden
    $payment->charge($order); $emailer->send($order);
  }
}
// Fix: Constructor DI
class OrderService {
  public function __construct(
    private PaymentService $payment,
    private EmailService $emailer
  ) {}
  public function place(Order $o): void { $this->payment->charge($o); $this->emailer->send($o); }
}`,
    },
    order: 223,
    status: 'published',
  },

  {
    slug: 'detect-circular-dep-b2',
    title: 'Circular Module Dependencies',
    mode: 'detect',
    difficulty: 'hard',
    stem: 'Module A imports Module B, and Module B imports Module A. What is the structural problem, and which design principle / pattern helps resolve it?',
    answer: 'Circular dependency — extract a shared abstraction (interface/event) that both modules depend on instead of each other',
    choices: [
      'Circular dependency — extract a shared abstraction (interface/event) that both modules depend on instead of each other',
      'God Class — both modules should be merged into one',
      'Feature Envy — methods should be moved between modules',
      'No problem — circular imports are handled by module systems automatically',
    ],
    explanation: 'Circular dependencies create tightly coupled modules: they cannot be tested, built, or deployed independently. Resolutions: (1) Extract a third module (interfaces/events/DTOs) that both A and B depend on — Dependency Inversion. (2) Use an event bus so A fires events and B listens, eliminating direct references. (3) Merge A and B if they truly belong together. The Dependency Inversion Principle (DIP) — both high-level and low-level modules should depend on abstractions — is the guiding principle.',
    codeSnippets: {
      ts: `// Problem: circular dependency
// module-a.ts
import { B } from './module-b'
export class A { doSomething() { new B().help() } }

// module-b.ts
import { A } from './module-a'  // circular!
export class B { help() { new A().doSomething() } }

// Fix: extract shared interface
// shared.ts
export interface Helper { help(): void }
// module-a.ts
import type { Helper } from './shared'
export class A { constructor(private helper: Helper) {}; doSomething() { this.helper.help() } }
// module-b.ts — no longer imports A`,
      js: `// Problem
// a.js: const B = require('./b'); class A { ... new B() ... }
// b.js: const A = require('./a'); class B { ... new A() ... }  // circular!

// Fix: event-based decoupling
// a.js
const EventEmitter = require('events')
const bus = new EventEmitter()
class A { doSomething() { bus.emit('help-needed') } }
// b.js
bus.on('help-needed', () => { /* handle */ })`,
      java: `// Problem
// A.java: import B; class A { void run() { new B().help(); } }
// B.java: import A; class B { void help() { new A().run(); } }  // circular

// Fix: DIP
// Helper.java (shared interface)
interface Helper { void help(); }
// A.java: depends on Helper interface only
class A { A(Helper h) { this.h = h; }; void run() { h.help(); } }
// B.java: implements Helper, no longer imports A
class B implements Helper { public void help() { /* ... */ } }`,
      py: `# Problem: circular imports
# a.py: from b import B
# b.py: from a import A  # circular!

# Fix 1: lazy import
class A:
    def do_something(self):
        from b import B  # import inside method
        B().help()

# Fix 2: event bus
# events.py: bus = EventBus()
# a.py: bus.emit('help-needed')
# b.py: bus.on('help-needed', lambda: ...)`,
      cpp: `// Problem: header circular include
// A.h: #include "B.h"
// B.h: #include "A.h"  // circular!

// Fix: forward declaration + interface
// IHelper.h
class IHelper { public: virtual void help() = 0; };
// A.h: #include "IHelper.h" — no longer includes B.h
class A {
  IHelper* h;
public: A(IHelper* h): h(h) {}
  void run() { h->help(); }
};
// B.h: implements IHelper, no longer includes A.h`,
      go: `// Problem: package cycles
// package a: import "myapp/b"
// package b: import "myapp/a"  // compile error: import cycle

// Fix: extract shared interface package
// package shared
type Helper interface { Help() }
// package a: import "myapp/shared" — depends on interface only
// package b: implements shared.Helper — no import of a`,
      rust: `// Problem: in Rust, circular module dependencies cause compile errors
// mod a { use super::b::B; }
// mod b { use super::a::A; }  // compile error

// Fix: extract trait
mod shared {
  pub trait Helper { fn help(&self); }
}
mod a {
  use super::shared::Helper;
  pub struct A { helper: Box<dyn Helper> }
}
mod b {
  use super::shared::Helper;
  pub struct B;
  impl Helper for B { fn help(&self) {} }
}`,
      cs: `// Problem: circular project references
// ProjectA references ProjectB
// ProjectB references ProjectA  // circular!

// Fix: extract shared abstractions project
// SharedAbstractions (no dependencies)
public interface IHelper { void Help(); }
// ProjectA: references SharedAbstractions
class A { IHelper h; A(IHelper h) { this.h = h; } void Run() { h.Help(); } }
// ProjectB: references SharedAbstractions, implements IHelper
class B : IHelper { public void Help() {} }`,
      kotlin: `// Problem: circular module deps
// module A: import B
// module B: import A  // circular!

// Fix: extract shared interface
// module shared:
interface Helper { fun help() }
// module A: depends on Helper interface
class A(private val h: Helper) { fun run() = h.help() }
// module B: implements Helper, no dependency on A
class B : Helper { override fun help() {} }`,
      swift: `// Problem: Swift module cycle
// In large projects: ModuleA imports ModuleB, ModuleB imports ModuleA
// Swift compiler error: cyclic dependency

// Fix: shared protocol module
// SharedProtocols:
protocol Helper { func help() }
// ModuleA: depends on SharedProtocols
class A { let h: Helper; init(_ h: Helper) { self.h = h }; func run() { h.help() } }
// ModuleB: implements Helper, no import of ModuleA
class B: Helper { func help() {} }`,
      rb: `# Problem: circular require
# a.rb: require_relative 'b'
# b.rb: require_relative 'a'  # may cause load issues

# Fix: extract shared concern
# helper.rb:
module Helper; def help; raise NotImplementedError; end; end
# a.rb: require 'helper' -- depends on module only
class A
  def initialize(h) = @h = h
  def run = @h.help
end
# b.rb: implements Helper -- no require of a.rb
class B; include Helper; def help; end; end`,
      php: `// Problem: circular class dependencies
// class A depends on B, class B depends on A

// Fix: shared interface (DIP)
// Helper.php
interface Helper { public function help(): void; }
// A.php: depends on Helper interface
class A { public function __construct(private Helper $h) {} public function run(): void { $this->h->help(); } }
// B.php: implements Helper, no dependency on A
class B implements Helper { public function help(): void {} }`,
    },
    order: 224,
    status: 'published',
  },

  {
    slug: 'detect-premature-abstraction-b2',
    title: 'Unnecessary Abstract Factory',
    mode: 'detect',
    difficulty: 'hard',
    stem: 'A codebase has an `AbstractReportFactory` interface implemented by exactly one class: `DefaultReportFactory`. There are no plans for additional implementations. The developer says this follows the Open/Closed Principle. Is this correct?',
    answer: 'No — this is premature abstraction (YAGNI violation); a concrete class suffices until a second implementation is actually needed',
    choices: [
      'No — this is premature abstraction (YAGNI violation); a concrete class suffices until a second implementation is actually needed',
      'Yes — OCP always requires an abstract factory interface',
      'Yes — the interface makes testing easier even with one implementation',
      'No — Abstract Factory requires at least two products to be valid',
    ],
    explanation: 'YAGNI (You Aren\'t Gonna Need It) says don\'t add abstractions until they\'re needed. An interface with one implementation adds indirection, complexity, and maintenance overhead without any benefit. OCP doesn\'t mandate premature abstraction — it says don\'t break existing callers when extending. A concrete class is perfectly OCP-compliant; you add the interface only when you have (or imminently need) a second implementation. Premature abstraction is a real cost: code is harder to read, navigate, and test because you must trace through indirections to understand what actually executes.',
    codeSnippets: {
      ts: `// Problem: unnecessary abstraction
interface AbstractReportFactory {
  createPDFReport(): PDFReport
  createCSVReport(): CSVReport
}
class DefaultReportFactory implements AbstractReportFactory {
  createPDFReport() { return new PDFReport() }
  createCSVReport() { return new CSVReport() }
}
// Only one implementation — YAGNI violation

// Simpler solution when only one variant exists:
class ReportFactory {
  createPDFReport() { return new PDFReport() }
  createCSVReport() { return new CSVReport() }
}
// Extract interface when (and only when) a second factory is needed`,
      js: `// Problem: interface with one impl (YAGNI)
class DefaultReportFactory {
  createPDF() { return new PDFReport() }
  createCSV() { return new CSVReport() }
}
// The interface adds nothing until a second impl exists
// Add the interface only when you have: CloudReportFactory, TestReportFactory, etc.`,
      java: `// Problem: premature abstraction
interface AbstractReportFactory {
  PDFReport createPDFReport();
  CSVReport createCSVReport();
}
class DefaultReportFactory implements AbstractReportFactory {
  public PDFReport createPDFReport() { return new PDFReport(); }
  public CSVReport createCSVReport() { return new CSVReport(); }
}
// No other implementations exist or are planned

// Preferred (YAGNI compliant):
class ReportFactory {
  public PDFReport createPDFReport() { return new PDFReport(); }
  public CSVReport createCSVReport() { return new CSVReport(); }
}
// Extract the interface when a CloudReportFactory is actually needed`,
      py: `# Problem: unnecessary abstraction
from abc import ABC, abstractmethod
class AbstractReportFactory(ABC):
    @abstractmethod
    def create_pdf(self): ...
    @abstractmethod
    def create_csv(self): ...
class DefaultReportFactory(AbstractReportFactory):
    def create_pdf(self): return PDFReport()
    def create_csv(self): return CSVReport()
# Only one implementation — YAGNI violation

# Preferred — just use a concrete class:
class ReportFactory:
    def create_pdf(self): return PDFReport()
    def create_csv(self): return CSVReport()`,
      cpp: `// Problem: unnecessary abstract base class
class AbstractReportFactory {
public:
  virtual PDFReport* createPDF() = 0;
  virtual CSVReport* createCSV() = 0;
};
class DefaultReportFactory : public AbstractReportFactory {
public:
  PDFReport* createPDF() override { return new PDFReport(); }
  CSVReport* createCSV() override { return new CSVReport(); }
};
// Only one concrete class — over-engineered

// Preferred when only one impl:
class ReportFactory {
public:
  PDFReport* createPDF() { return new PDFReport(); }
  CSVReport* createCSV() { return new CSVReport(); }
};`,
      go: `// Problem: interface with single implementation
type ReportFactory interface {
  CreatePDF() *PDFReport
  CreateCSV() *CSVReport
}
type DefaultReportFactory struct{}
func (f *DefaultReportFactory) CreatePDF() *PDFReport { return &PDFReport{} }
func (f *DefaultReportFactory) CreateCSV() *CSVReport { return &CSVReport{} }
// Only DefaultReportFactory exists

// Go idiom: accept interfaces, return concrete types
// Introduce the interface only when there are 2+ implementations`,
      rust: `// Problem: trait with one implementor
trait ReportFactory {
  fn create_pdf(&self) -> PDFReport;
  fn create_csv(&self) -> CSVReport;
}
struct DefaultReportFactory;
impl ReportFactory for DefaultReportFactory {
  fn create_pdf(&self) -> PDFReport { PDFReport }
  fn create_csv(&self) -> CSVReport { CSVReport }
}
// YAGNI: just use DefaultReportFactory directly until a second is needed`,
      cs: `// Problem: premature interface
interface IReportFactory {
  PDFReport CreatePDF();
  CSVReport CreateCSV();
}
class DefaultReportFactory : IReportFactory {
  public PDFReport CreatePDF() => new();
  public CSVReport CreateCSV() => new();
}
// Only one implementation exists and none are planned

// Correct: concrete class first, add interface when needed
class ReportFactory {
  public PDFReport CreatePDF() => new();
  public CSVReport CreateCSV() => new();
}`,
      kotlin: `// Problem: unnecessary interface
interface ReportFactory {
  fun createPDF(): PDFReport
  fun createCSV(): CSVReport
}
class DefaultReportFactory : ReportFactory {
  override fun createPDF() = PDFReport()
  override fun createCSV() = CSVReport()
}
// YAGNI: use concrete class until a 2nd factory is actually required

// Preferred:
class ReportFactory {
  fun createPDF() = PDFReport()
  fun createCSV() = CSVReport()
}`,
      swift: `// Problem: premature protocol
protocol ReportFactory {
  func createPDF() -> PDFReport
  func createCSV() -> CSVReport
}
class DefaultReportFactory: ReportFactory {
  func createPDF() -> PDFReport { PDFReport() }
  func createCSV() -> CSVReport { CSVReport() }
}
// Only one conformance — over-abstracted

// Preferred (YAGNI):
class ReportFactory {
  func createPDF() -> PDFReport { PDFReport() }
  func createCSV() -> CSVReport { CSVReport() }
}`,
      rb: `# Problem: abstract module with single concrete class
module ReportFactory
  def create_pdf = raise NotImplementedError
  def create_csv = raise NotImplementedError
end
class DefaultReportFactory; include ReportFactory
  def create_pdf = PDFReport.new
  def create_csv = CSVReport.new
end
# No other factory exists or is planned — YAGNI violation

# Preferred:
class ReportFactory
  def create_pdf = PDFReport.new
  def create_csv = CSVReport.new
end`,
      php: `// Problem: premature abstraction
interface ReportFactory {
  public function createPDF(): PDFReport;
  public function createCSV(): CSVReport;
}
class DefaultReportFactory implements ReportFactory {
  public function createPDF(): PDFReport { return new PDFReport(); }
  public function createCSV(): CSVReport { return new CSVReport(); }
}
// Only one implementation — violates YAGNI

// Fix: concrete class until a second variant is needed
class ReportFactory {
  public function createPDF(): PDFReport { return new PDFReport(); }
  public function createCSV(): CSVReport { return new CSVReport(); }
}`,
    },
    order: 225,
    status: 'published',
  },

  // ── HARD EXPLAIN ──────────────────────────────────────────────────────────

  {
    slug: 'explain-bridge-vs-adapter-b2',
    title: 'Bridge vs Adapter: Intent Difference',
    mode: 'explain',
    difficulty: 'hard',
    stem: 'Both Bridge and Adapter involve two interfaces connected by an intermediary. Explain the fundamental intent difference and when you would choose each.',
    answer: 'Bridge: designed upfront to separate abstraction from implementation; Adapter: retrofitted to make incompatible interfaces work together',
    choices: [
      'Bridge: designed upfront to separate abstraction from implementation; Adapter: retrofitted to make incompatible interfaces work together',
      'Bridge: for structural hierarchies; Adapter: for behavioral hierarchies',
      'Bridge: for external APIs; Adapter: for internal class families',
      'They are identical — Bridge is just a bidirectional Adapter',
    ],
    explanation: 'Intent is everything in design patterns. Bridge is a proactive, architectural decision made before coding: you anticipate that both abstractions and implementations will evolve independently, so you separate them via composition. The classic example: a GUI framework designed with "Shape" (abstraction) and "Renderer" (implementation) hierarchies from the start. Adapter is reactive: you have two existing incompatible interfaces that need to work together (e.g., your code uses `ILogger` but a third-party library provides `ExternalLog`). Adapter wraps one to look like the other. Memory device: Bridge = "build with separation in mind." Adapter = "glue two incompatibles together."',
    codeSnippets: {
      ts: `// Bridge: proactive architecture
interface Renderer { renderCircle(r: number): void; renderSquare(s: number): void }
class VectorRenderer implements Renderer { /* SVG implementation */ }
class RasterRenderer implements Renderer { /* Pixel implementation */ }
abstract class Shape {
  constructor(protected renderer: Renderer) {}
  abstract draw(): void
}
class Circle extends Shape { constructor(r: number, renderer: Renderer) { super(renderer) }; draw() { this.renderer.renderCircle(5) } }

// Adapter: reactive fix for incompatible interfaces
interface ILogger { log(msg: string): void }
class ExternalLog { writeEntry(msg: string) { console.log(msg) } }  // third party
class LogAdapter implements ILogger {
  constructor(private ext: ExternalLog) {}
  log(msg: string) { this.ext.writeEntry(msg) }  // adapts writeEntry to log
}`,
      js: `// Bridge: designed upfront
class Shape {
  constructor(renderer) { this.renderer = renderer }
}
class Circle extends Shape {
  draw() { this.renderer.renderCircle(5) }
}

// Adapter: retrofit incompatible interface
class ExternalLog { writeEntry(msg) { console.log(msg) } }
class LogAdapter {
  constructor(ext) { this.ext = ext }
  log(msg) { this.ext.writeEntry(msg) }  // adapts API
}`,
      java: `// Bridge: proactive
interface Renderer { void renderCircle(double r); }
class VectorRenderer implements Renderer { public void renderCircle(double r) {} }
abstract class Shape {
  protected Renderer renderer;
  Shape(Renderer r) { renderer = r; }
  abstract void draw();
}

// Adapter: reactive fix
interface ILogger { void log(String msg); }
class ThirdPartyLog { public void writeEntry(String msg) {} }  // incompatible
class LogAdapter implements ILogger {
  private ThirdPartyLog ext;
  LogAdapter(ThirdPartyLog t) { ext = t; }
  public void log(String msg) { ext.writeEntry(msg); }  // bridging incompatible
}`,
      py: `# Bridge: architectural decision upfront
class Renderer:
    def render_circle(self, r): ...
class VectorRenderer(Renderer):
    def render_circle(self, r): print(f'SVG circle r={r}')
class Shape:
    def __init__(self, renderer): self.renderer = renderer
class Circle(Shape):
    def draw(self): self.renderer.render_circle(5)

# Adapter: fix incompatible APIs
class ThirdPartyLog:
    def write_entry(self, msg): print(msg)
class LogAdapter:
    def __init__(self, ext): self.ext = ext
    def log(self, msg): self.ext.write_entry(msg)  # adapts`,
      cpp: `// Bridge: upfront design
struct Renderer { virtual void renderCircle(float r) = 0; };
struct VectorRenderer : Renderer { void renderCircle(float r) override {} };
struct Shape { Renderer* r; Shape(Renderer* r): r(r) {}; virtual void draw() = 0; };
struct Circle : Shape { Circle(Renderer* r): Shape(r){}; void draw() override { r->renderCircle(5); } };

// Adapter: retrofit
struct ILogger { virtual void log(const std::string& msg) = 0; };
struct ThirdPartyLog { void writeEntry(const std::string& msg) {} };
struct LogAdapter : ILogger {
  ThirdPartyLog ext;
  void log(const std::string& msg) override { ext.writeEntry(msg); }
};`,
      go: `// Bridge: proactive
type Renderer interface { RenderCircle(r float64) }
type Shape struct { renderer Renderer }
func (s *Shape) Draw() { s.renderer.RenderCircle(5) }

// Adapter: reactive
type ILogger interface { Log(msg string) }
type ThirdPartyLog struct{}
func (t *ThirdPartyLog) WriteEntry(msg string) {}
type LogAdapter struct { ext *ThirdPartyLog }
func (a *LogAdapter) Log(msg string) { a.ext.WriteEntry(msg) }`,
      rust: `// Bridge: designed from scratch
trait Renderer { fn render_circle(&self, r: f32); }
struct Shape { renderer: Box<dyn Renderer> }
impl Shape { fn draw(&self) { self.renderer.render_circle(5.0); } }

// Adapter: fix incompatible types
trait ILogger { fn log(&self, msg: &str); }
struct ThirdPartyLog;
impl ThirdPartyLog { fn write_entry(&self, msg: &str) { println!("{}", msg); } }
struct LogAdapter { ext: ThirdPartyLog }
impl ILogger for LogAdapter { fn log(&self, msg: &str) { self.ext.write_entry(msg); } }`,
      cs: `// Bridge: upfront architecture
interface IRenderer { void RenderCircle(double r); }
class VectorRenderer : IRenderer { public void RenderCircle(double r) {} }
abstract class Shape {
  protected IRenderer renderer;
  protected Shape(IRenderer r) { renderer = r; }
  public abstract void Draw();
}
// Adapter: retrofit
interface ILogger { void Log(string msg); }
class ThirdPartyLog { public void WriteEntry(string msg) {} }
class LogAdapter : ILogger {
  private ThirdPartyLog ext;
  public LogAdapter(ThirdPartyLog t) { ext = t; }
  public void Log(string msg) => ext.WriteEntry(msg);
}`,
      kotlin: `// Bridge: proactive
interface Renderer { fun renderCircle(r: Double) }
class VectorRenderer : Renderer { override fun renderCircle(r: Double) = println("SVG circle $r") }
abstract class Shape(protected val renderer: Renderer) { abstract fun draw() }
class Circle(renderer: Renderer) : Shape(renderer) { override fun draw() = renderer.renderCircle(5.0) }

// Adapter: reactive
interface ILogger { fun log(msg: String) }
class ThirdPartyLog { fun writeEntry(msg: String) = println(msg) }
class LogAdapter(private val ext: ThirdPartyLog) : ILogger {
  override fun log(msg: String) = ext.writeEntry(msg)
}`,
      swift: `// Bridge: proactive
protocol Renderer { func renderCircle(r: Double) }
class Shape {
  let renderer: Renderer
  init(_ r: Renderer) { renderer = r }
  func draw() { renderer.renderCircle(r: 5) }
}

// Adapter: reactive
protocol ILogger { func log(msg: String) }
class ThirdPartyLog { func writeEntry(_ msg: String) { print(msg) } }
class LogAdapter: ILogger {
  let ext: ThirdPartyLog
  init(_ e: ThirdPartyLog) { ext = e }
  func log(msg: String) { ext.writeEntry(msg) }
}`,
      rb: `# Bridge: proactive design
module Renderer; def render_circle(r); end; end
class VectorRenderer; include Renderer; def render_circle(r) = puts "SVG #{r}"; end
class Shape
  def initialize(renderer) = @renderer = renderer
  def draw = raise NotImplementedError
end
class Circle < Shape; def draw = @renderer.render_circle(5); end

# Adapter: retrofit
class ThirdPartyLog; def write_entry(msg) = puts msg; end
class LogAdapter
  def initialize(ext) = @ext = ext
  def log(msg) = @ext.write_entry(msg)
end`,
      php: `// Bridge: proactive
interface Renderer { public function renderCircle(float $r): void; }
class VectorRenderer implements Renderer { public function renderCircle(float $r): void { echo "SVG $r\n"; } }
abstract class Shape {
  public function __construct(protected Renderer $renderer) {}
  abstract public function draw(): void;
}
// Adapter: reactive
interface ILogger { public function log(string $msg): void; }
class ThirdPartyLog { public function writeEntry(string $msg): void { echo $msg . "\n"; } }
class LogAdapter implements ILogger {
  public function __construct(private ThirdPartyLog $ext) {}
  public function log(string $msg): void { $this->ext->writeEntry($msg); }
}`,
    },
    order: 226,
    status: 'published',
  },

  {
    slug: 'explain-abstract-factory-vs-factory-b2',
    title: 'Abstract Factory vs Factory Method',
    mode: 'explain',
    difficulty: 'hard',
    stem: 'Explain the structural and intent differences between Abstract Factory and Factory Method. When should you use each?',
    answer: 'Factory Method: one product, subclass decides the type; Abstract Factory: a family of related products created together',
    choices: [
      'Factory Method: one product, subclass decides the type; Abstract Factory: a family of related products created together',
      'Abstract Factory uses composition; Factory Method uses only static methods',
      'Factory Method requires an interface; Abstract Factory can use concrete classes',
      'They are interchangeable — Abstract Factory is just a named Factory Method',
    ],
    explanation: 'Factory Method: a class has ONE factory method (often abstract) that subclasses override to return a specific product. "Let subclasses decide which class to instantiate." Structure: inheritance. Example: `Application.createDocument()` overridden by `WordApp` returning `WordDocument`. Abstract Factory: an interface declares MULTIPLE factory methods — one per product in a family. The factory creates related products that must be used together. Structure: composition (clients hold a reference to the factory). Example: `UIFactory.createButton() + createCheckbox()` — you always need a matching set of widgets. Rule of thumb: one product → Factory Method; a consistent family of products → Abstract Factory.',
    codeSnippets: {
      ts: `// Factory Method: single product, subclass decides
abstract class Application {
  abstract createDocument(): Document  // factory method
  open() { const doc = this.createDocument(); doc.open() }
}
class WordApp extends Application {
  createDocument() { return new WordDocument() }
}

// Abstract Factory: family of related products
interface UIFactory {
  createButton(): Button      // product 1
  createCheckbox(): Checkbox  // product 2 — must match button theme
}
class WindowsUIFactory implements UIFactory {
  createButton() { return new WinButton() }
  createCheckbox() { return new WinCheckbox() }
}`,
      js: `// Factory Method: one product
class Application {
  createDocument() { throw new Error('abstract') }  // override in subclass
  open() { this.createDocument().open() }
}
class WordApp extends Application { createDocument() { return new WordDocument() } }

// Abstract Factory: product family
class WindowsUIFactory {
  createButton() { return new WinButton() }
  createCheckbox() { return new WinCheckbox() }  // consistent family
}`,
      java: `// Factory Method
abstract class Application {
  protected abstract Document createDocument();  // factory method
  public void open() { createDocument().open(); }
}
class WordApp extends Application {
  protected Document createDocument() { return new WordDocument(); }
}

// Abstract Factory
interface UIFactory {
  Button createButton();
  Checkbox createCheckbox();
}
class WindowsUIFactory implements UIFactory {
  public Button createButton() { return new WinButton(); }
  public Checkbox createCheckbox() { return new WinCheckbox(); }
}`,
      py: `# Factory Method: single product
class Application:
    def create_document(self):  # override in subclass
        raise NotImplementedError
    def open(self):
        doc = self.create_document(); doc.open()
class WordApp(Application):
    def create_document(self): return WordDocument()

# Abstract Factory: product family
class UIFactory:
    def create_button(self): ...   # product 1
    def create_checkbox(self): ... # product 2
class WindowsUIFactory(UIFactory):
    def create_button(self): return WinButton()
    def create_checkbox(self): return WinCheckbox()`,
      cpp: `// Factory Method
class Application {
protected:
  virtual Document* createDocument() = 0;  // factory method
public:
  void open() { createDocument()->open(); }
};
class WordApp : public Application {
protected:
  Document* createDocument() override { return new WordDocument(); }
};

// Abstract Factory
struct UIFactory {
  virtual Button* createButton() = 0;
  virtual Checkbox* createCheckbox() = 0;
};
struct WindowsUIFactory : UIFactory {
  Button* createButton() override { return new WinButton(); }
  Checkbox* createCheckbox() override { return new WinCheckbox(); }
};`,
      go: `// Factory Method (Go: function/interface method)
type DocumentFactory interface { Create() Document }
type WordFactory struct{}
func (w *WordFactory) Create() Document { return &WordDocument{} }

// Abstract Factory: family
type UIFactory interface { CreateButton() Button; CreateCheckbox() Checkbox }
type WindowsUIFactory struct{}
func (f *WindowsUIFactory) CreateButton() Button { return &WinButton{} }
func (f *WindowsUIFactory) CreateCheckbox() Checkbox { return &WinCheckbox{} }`,
      rust: `// Factory Method
trait DocumentFactory { fn create(&self) -> Box<dyn Document>; }
struct WordFactory;
impl DocumentFactory for WordFactory { fn create(&self) -> Box<dyn Document> { Box::new(WordDocument) } }

// Abstract Factory
trait UIFactory {
  fn create_button(&self) -> Box<dyn Button>;
  fn create_checkbox(&self) -> Box<dyn Checkbox>;
}
struct WindowsUIFactory;
impl UIFactory for WindowsUIFactory {
  fn create_button(&self) -> Box<dyn Button> { Box::new(WinButton) }
  fn create_checkbox(&self) -> Box<dyn Checkbox> { Box::new(WinCheckbox) }
}`,
      cs: `// Factory Method
abstract class Application {
  protected abstract IDocument CreateDocument();  // factory method
  public void Open() { CreateDocument().Open(); }
}
class WordApp : Application {
  protected override IDocument CreateDocument() => new WordDocument();
}
// Abstract Factory
interface IUIFactory {
  IButton CreateButton();
  ICheckbox CreateCheckbox();
}
class WindowsUIFactory : IUIFactory {
  public IButton CreateButton() => new WinButton();
  public ICheckbox CreateCheckbox() => new WinCheckbox();
}`,
      kotlin: `// Factory Method: one product, inheritance-based
abstract class Application {
  abstract fun createDocument(): Document  // factory method
  fun open() = createDocument().open()
}
class WordApp : Application() { override fun createDocument() = WordDocument() }

// Abstract Factory: product family, composition-based
interface UIFactory {
  fun createButton(): Button
  fun createCheckbox(): Checkbox
}
class WindowsUIFactory : UIFactory {
  override fun createButton() = WinButton()
  override fun createCheckbox() = WinCheckbox()
}`,
      swift: `// Factory Method
class Application {
  func createDocument() -> Document { fatalError("abstract") }
  func open() { createDocument().open() }
}
class WordApp: Application { override func createDocument() -> Document { WordDocument() } }

// Abstract Factory
protocol UIFactory {
  func createButton() -> Button
  func createCheckbox() -> Checkbox
}
class WindowsUIFactory: UIFactory {
  func createButton() -> Button { WinButton() }
  func createCheckbox() -> Checkbox { WinCheckbox() }
}`,
      rb: `# Factory Method: single product
class Application
  def create_document = raise NotImplementedError  # override
  def open = create_document.open
end
class WordApp < Application
  def create_document = WordDocument.new
end

# Abstract Factory: product family
module UIFactory
  def create_button = raise NotImplementedError
  def create_checkbox = raise NotImplementedError
end
class WindowsUIFactory; include UIFactory
  def create_button = WinButton.new
  def create_checkbox = WinCheckbox.new
end`,
      php: `// Factory Method
abstract class Application {
  abstract protected function createDocument(): Document;  // factory method
  public function open(): void { $this->createDocument()->open(); }
}
class WordApp extends Application {
  protected function createDocument(): Document { return new WordDocument(); }
}
// Abstract Factory
interface UIFactory {
  public function createButton(): Button;
  public function createCheckbox(): Checkbox;
}
class WindowsUIFactory implements UIFactory {
  public function createButton(): Button { return new WinButton(); }
  public function createCheckbox(): Checkbox { return new WinCheckbox(); }
}`,
    },
    order: 227,
    status: 'published',
  },

  // ── HARD COMPARE ──────────────────────────────────────────────────────────

  {
    slug: 'compare-observer-event-b2',
    title: 'Observer vs Event Bus',
    mode: 'compare',
    difficulty: 'hard',
    stem: 'Compare the Observer pattern with an Event Bus (Pub/Sub). In what ways do they differ structurally and in terms of coupling, and when is each preferred?',
    answer: 'Observer: subject holds direct references to observers (direct coupling); Event Bus: publishers and subscribers are decoupled via an intermediary channel',
    choices: [
      'Observer: subject holds direct references to observers (direct coupling); Event Bus: publishers and subscribers are decoupled via an intermediary channel',
      'Event Bus is always superior to Observer in all scenarios',
      'Observer uses push model; Event Bus always uses pull model',
      'They are architecturally identical — Event Bus is just a renamed Observer',
    ],
    patternA: 'Observer',
    patternB: 'Event Bus',
    comparisonContext: 'A system needs to notify multiple components when an order is placed. Compare using Observer (OrderService holds references to listeners) vs Event Bus (OrderService publishes an event to a central bus).',
    keyTradeoffs: ['coupling', 'decoupled', 'direct reference', 'intermediary', 'subscribe', 'publish', 'channel', 'bus'],
    explanation: 'Observer: the subject (publisher) knows its observers — it holds direct references. Advantages: simple, synchronous, type-safe, easy to trace. Disadvantages: coupling between subject and observer types; observers must register with the specific subject. Event Bus (Pub/Sub): publishers fire events to a channel; subscribers listen to that channel. Neither knows the other. Advantages: loose coupling, cross-module communication without imports, easy to add new subscribers. Disadvantages: harder to trace (who handles this event?), potential event storms, risk of leaked subscriptions. Use Observer for small, well-defined relationships (Model→View). Use Event Bus for cross-cutting concerns and cross-module communication (order.placed → email, analytics, inventory).',
    codeSnippets: {
      ts: `// Observer: direct coupling
class OrderService {
  private listeners: OrderListener[] = []
  subscribe(l: OrderListener) { this.listeners.push(l) }
  place(order: Order) {
    // fulfill order...
    this.listeners.forEach(l => l.onOrderPlaced(order))  // direct call
  }
}

// Event Bus: decoupled
class EventBus {
  private handlers = new Map<string, ((e: any) => void)[]>()
  on(event: string, h: (e: any) => void) { (this.handlers.get(event) ?? []).push(h); this.handlers.set(event, this.handlers.get(event)!) }
  emit(event: string, data: any) { this.handlers.get(event)?.forEach(h => h(data)) }
}
class OrderService {
  constructor(private bus: EventBus) {}
  place(order: Order) { this.bus.emit('order.placed', order) }  // no knowledge of listeners
}
class EmailService { constructor(bus: EventBus) { bus.on('order.placed', (o) => this.sendEmail(o)) } }`,
      js: `// Observer: subject knows observers
class OrderService {
  constructor() { this.listeners = [] }
  subscribe(l) { this.listeners.push(l) }
  place(order) { this.listeners.forEach(l => l.onOrderPlaced(order)) }
}
// Event Bus: fully decoupled
const bus = { handlers: {}, on(e, h) { (this.handlers[e] = this.handlers[e] || []).push(h) }, emit(e, d) { (this.handlers[e] || []).forEach(h => h(d)) } }
class OrderService { place(order) { bus.emit('order.placed', order) } }
class EmailService { constructor() { bus.on('order.placed', o => this.send(o)) } }`,
      java: `// Observer
class OrderService {
  private List<OrderListener> listeners = new ArrayList<>();
  public void subscribe(OrderListener l) { listeners.add(l); }
  public void place(Order order) { listeners.forEach(l -> l.onOrderPlaced(order)); }
}
// Event Bus
class EventBus {
  private Map<String, List<Consumer<Object>>> handlers = new HashMap<>();
  public void on(String event, Consumer<Object> h) { handlers.computeIfAbsent(event, k -> new ArrayList<>()).add(h); }
  public void emit(String event, Object data) { handlers.getOrDefault(event, List.of()).forEach(h -> h.accept(data)); }
}`,
      py: `# Observer: coupled
class OrderService:
    def __init__(self): self.listeners = []
    def subscribe(self, l): self.listeners.append(l)
    def place(self, order):
        for l in self.listeners: l.on_order_placed(order)

# Event Bus: decoupled
class EventBus:
    def __init__(self): self.handlers = {}
    def on(self, event, h): self.handlers.setdefault(event, []).append(h)
    def emit(self, event, data):
        for h in self.handlers.get(event, []): h(data)

bus = EventBus()
class OrderService:
    def place(self, order): bus.emit('order.placed', order)`,
      cpp: `// Observer
class OrderService {
  std::vector<OrderListener*> listeners;
public:
  void subscribe(OrderListener* l) { listeners.push_back(l); }
  void place(Order o) { for (auto l: listeners) l->onOrderPlaced(o); }
};
// Event Bus
class EventBus {
  std::unordered_map<std::string, std::vector<std::function<void(Order)>>> handlers;
public:
  void on(const std::string& e, std::function<void(Order)> h) { handlers[e].push_back(h); }
  void emit(const std::string& e, Order o) { for (auto& h: handlers[e]) h(o); }
};`,
      go: `// Observer
type OrderListener interface { OnOrderPlaced(o Order) }
type OrderService struct { listeners []OrderListener }
func (s *OrderService) Subscribe(l OrderListener) { s.listeners = append(s.listeners, l) }
func (s *OrderService) Place(o Order) { for _, l := range s.listeners { l.OnOrderPlaced(o) } }

// Event Bus
type EventBus struct { handlers map[string][]func(interface{}) }
func (b *EventBus) On(event string, h func(interface{})) { b.handlers[event] = append(b.handlers[event], h) }
func (b *EventBus) Emit(event string, data interface{}) { for _, h := range b.handlers[event] { h(data) } }`,
      rust: `// Observer: direct coupling
trait OrderListener { fn on_order_placed(&self, order: &Order); }
struct OrderService { listeners: Vec<Box<dyn OrderListener>> }
impl OrderService {
  fn subscribe(&mut self, l: Box<dyn OrderListener>) { self.listeners.push(l); }
  fn place(&self, order: &Order) { for l in &self.listeners { l.on_order_placed(order); } }
}
// Event Bus: decoupled via intermediary`,
      cs: `// Observer
interface IOrderListener { void OnOrderPlaced(Order order); }
class OrderService {
  private List<IOrderListener> listeners = new();
  public void Subscribe(IOrderListener l) { listeners.Add(l); }
  public void Place(Order o) { listeners.ForEach(l => l.OnOrderPlaced(o)); }
}
// Event Bus
class EventBus {
  private Dictionary<string, List<Action<object>>> handlers = new();
  public void On(string e, Action<object> h) { if (!handlers.ContainsKey(e)) handlers[e] = new(); handlers[e].Add(h); }
  public void Emit(string e, object data) { handlers.GetValueOrDefault(e, new())?.ForEach(h => h(data)); }
}`,
      kotlin: `// Observer: coupled
interface OrderListener { fun onOrderPlaced(order: Order) }
class OrderService {
  private val listeners = mutableListOf<OrderListener>()
  fun subscribe(l: OrderListener) { listeners.add(l) }
  fun place(order: Order) { listeners.forEach { it.onOrderPlaced(order) } }
}
// Event Bus: decoupled
class EventBus {
  private val handlers = mutableMapOf<String, MutableList<(Any) -> Unit>>()
  fun on(event: String, h: (Any) -> Unit) { handlers.getOrPut(event) { mutableListOf() }.add(h) }
  fun emit(event: String, data: Any) { handlers[event]?.forEach { it(data) } }
}`,
      swift: `// Observer: subject holds references
protocol OrderListener: AnyObject { func onOrderPlaced(_ order: Order) }
class OrderService {
  var listeners: [OrderListener] = []
  func subscribe(_ l: OrderListener) { listeners.append(l) }
  func place(_ order: Order) { listeners.forEach { $0.onOrderPlaced(order) } }
}
// Event Bus: decoupled
class EventBus {
  var handlers: [String: [(Any) -> Void]] = [:]
  func on(_ event: String, _ h: @escaping (Any) -> Void) { handlers[event, default: []].append(h) }
  func emit(_ event: String, data: Any) { handlers[event]?.forEach { $0(data) } }
}`,
      rb: `# Observer: direct coupling
class OrderService
  def initialize = @listeners = []
  def subscribe(l) = @listeners << l
  def place(order) = @listeners.each { |l| l.on_order_placed(order) }
end
# Event Bus: decoupled
class EventBus
  def initialize = @handlers = Hash.new { |h, k| h[k] = [] }
  def on(event, &block) = @handlers[event] << block
  def emit(event, data) = @handlers[event].each { |h| h.call(data) }
end`,
      php: `// Observer: direct coupling
interface OrderListener { public function onOrderPlaced(Order $o): void; }
class OrderService {
  private array $listeners = [];
  public function subscribe(OrderListener $l): void { $this->listeners[] = $l; }
  public function place(Order $o): void { foreach ($this->listeners as $l) $l->onOrderPlaced($o); }
}
// Event Bus: decoupled
class EventBus {
  private array $handlers = [];
  public function on(string $event, callable $h): void { $this->handlers[$event][] = $h; }
  public function emit(string $event, mixed $data): void {
    foreach ($this->handlers[$event] ?? [] as $h) $h($data);
  }
}`,
    },
    order: 228,
    status: 'published',
  },

  {
    slug: 'compare-adapter-facade-b2',
    title: 'Adapter vs Facade',
    mode: 'compare',
    difficulty: 'hard',
    stem: 'Both Adapter and Facade wrap existing code. Compare their intent, structure, and usage context.',
    answer: 'Adapter: converts one interface to another (compatibility); Facade: simplifies a complex subsystem behind a unified interface',
    choices: [
      'Adapter: converts one interface to another (compatibility); Facade: simplifies a complex subsystem behind a unified interface',
      'Adapter wraps multiple classes; Facade wraps exactly one class',
      'Facade requires an interface; Adapter works only with concrete classes',
      'They are identical — Adapter is just a named Facade',
    ],
    patternA: 'Adapter',
    patternB: 'Facade',
    comparisonContext: 'A system integrates (1) a third-party payment SDK with incompatible method names, and (2) a complex video encoding subsystem with 12 classes. Which pattern fits each case?',
    keyTradeoffs: ['compatibility', 'interface', 'simplify', 'subsystem', 'convert', 'unified', 'wrap', 'legacy'],
    explanation: 'Adapter: the target interface is fixed (defined by the client). The adapter wraps ONE incompatible object and translates its interface. Introduces no new capability — only translation. Example: `PaymentAdapter` implements `IPaymentGateway` and delegates to a third-party SDK with different method names. Facade: no pre-existing interface to conform to. The facade creates a NEW simplified interface over a COMPLEX subsystem (often many classes). Clients use the facade for common operations; they can still use the subsystem directly for advanced use. Example: `VideoConverter` facade wraps `Codec`, `BitrateReader`, `AudioMixer`, `VideoFile` classes into `convert(file, format)`. Key difference: Adapter is driven by an incompatible interface that must be matched. Facade is driven by complexity that must be hidden.',
    codeSnippets: {
      ts: `// Adapter: convert incompatible interface
interface IPaymentGateway { charge(userId: string, cents: number): boolean }
class ThirdPartySDK { makePayment(uid: string, amount: number) { return true } }
class PaymentAdapter implements IPaymentGateway {
  constructor(private sdk: ThirdPartySDK) {}
  charge(userId: string, cents: number): boolean {
    return this.sdk.makePayment(userId, cents / 100)  // translates
  }
}

// Facade: simplify complex subsystem
class VideoConverter {
  convert(file: string, format: string): void {
    const video = new VideoFile(file)
    const codec = CodecFactory.extract(video)
    const audio = new AudioMixer()
    // ... coordinates 5+ classes
    console.log('converted to ' + format)
  }
}`,
      js: `// Adapter: one-to-one interface translation
class PaymentAdapter {
  constructor(sdk) { this.sdk = sdk }
  charge(userId, cents) { return this.sdk.makePayment(userId, cents / 100) }
}
// Facade: simplifies many classes
class VideoConverter {
  convert(file, format) {
    // internally uses VideoFile, Codec, AudioMixer, BitrateReader...
    console.log('converted')
  }
}`,
      java: `// Adapter: translate interface
interface IPaymentGateway { boolean charge(String uid, int cents); }
class ThirdPartySDK { public boolean makePayment(String uid, double amount) { return true; } }
class PaymentAdapter implements IPaymentGateway {
  private ThirdPartySDK sdk;
  public boolean charge(String uid, int cents) { return sdk.makePayment(uid, cents / 100.0); }
}
// Facade: simplify subsystem
class VideoConverter {
  public void convert(String file, String format) {
    new VideoFile(file); new AudioMixer(); // complex orchestration
  }
}`,
      py: `# Adapter: translate incompatible API
class ThirdPartySDK:
    def make_payment(self, uid, amount): return True
class PaymentAdapter:
    def __init__(self, sdk): self.sdk = sdk
    def charge(self, user_id, cents):  # IPaymentGateway interface
        return self.sdk.make_payment(user_id, cents / 100)

# Facade: hide complexity
class VideoConverter:
    def convert(self, file, fmt):
        # coordinates VideoFile, Codec, AudioMixer, BitrateReader...
        pass`,
      cpp: `// Adapter
struct IPaymentGateway { virtual bool charge(std::string uid, int cents) = 0; };
struct ThirdPartySDK { bool makePayment(std::string uid, double amount) { return true; } };
struct PaymentAdapter : IPaymentGateway {
  ThirdPartySDK sdk;
  bool charge(std::string uid, int cents) override { return sdk.makePayment(uid, cents/100.0); }
};
// Facade
class VideoConverter {
public:
  void convert(const std::string& file, const std::string& fmt) {
    // orchestrates multiple subsystem classes
  }
};`,
      go: `// Adapter: interface translation
type IPaymentGateway interface { Charge(uid string, cents int) bool }
type ThirdPartySDK struct{}
func (s *ThirdPartySDK) MakePayment(uid string, amount float64) bool { return true }
type PaymentAdapter struct { sdk *ThirdPartySDK }
func (a *PaymentAdapter) Charge(uid string, cents int) bool { return a.sdk.MakePayment(uid, float64(cents)/100) }

// Facade: simplification
type VideoConverter struct{}
func (v *VideoConverter) Convert(file, format string) {
  // coordinates multiple subsystem types
}`,
      rust: `// Adapter
trait IPaymentGateway { fn charge(&self, uid: &str, cents: u32) -> bool; }
struct ThirdPartySDK;
impl ThirdPartySDK { fn make_payment(&self, uid: &str, amount: f64) -> bool { true } }
struct PaymentAdapter { sdk: ThirdPartySDK }
impl IPaymentGateway for PaymentAdapter {
  fn charge(&self, uid: &str, cents: u32) -> bool { self.sdk.make_payment(uid, cents as f64 / 100.0) }
}
// Facade: unified interface over subsystem
struct VideoConverter;
impl VideoConverter { fn convert(&self, file: &str, format: &str) { /* orchestrates many */ } }`,
      cs: `// Adapter: convert interface
interface IPaymentGateway { bool Charge(string uid, int cents); }
class ThirdPartySDK { public bool MakePayment(string uid, double amount) => true; }
class PaymentAdapter : IPaymentGateway {
  ThirdPartySDK sdk;
  public bool Charge(string uid, int cents) => sdk.MakePayment(uid, cents / 100.0);
}
// Facade: simplify subsystem
class VideoConverter {
  public void Convert(string file, string format) {
    // orchestrates VideoFile, Codec, AudioMixer etc.
  }
}`,
      kotlin: `// Adapter
interface IPaymentGateway { fun charge(uid: String, cents: Int): Boolean }
class ThirdPartySDK { fun makePayment(uid: String, amount: Double) = true }
class PaymentAdapter(private val sdk: ThirdPartySDK) : IPaymentGateway {
  override fun charge(uid: String, cents: Int) = sdk.makePayment(uid, cents / 100.0)
}
// Facade
class VideoConverter {
  fun convert(file: String, format: String) { /* coordinates subsystem */ }
}`,
      swift: `// Adapter
protocol IPaymentGateway { func charge(uid: String, cents: Int) -> Bool }
class ThirdPartySDK { func makePayment(uid: String, amount: Double) -> Bool { true } }
class PaymentAdapter: IPaymentGateway {
  let sdk: ThirdPartySDK
  init(_ s: ThirdPartySDK) { sdk = s }
  func charge(uid: String, cents: Int) -> Bool { sdk.makePayment(uid: uid, amount: Double(cents) / 100) }
}
// Facade
class VideoConverter {
  func convert(file: String, format: String) { /* simplifies subsystem */ }
}`,
      rb: `# Adapter: translate interface
class PaymentAdapter
  def initialize(sdk) = @sdk = sdk
  def charge(uid, cents)  # expected interface
    @sdk.make_payment(uid, cents / 100.0)  # delegates to incompatible SDK
  end
end
# Facade: simplify complex subsystem
class VideoConverter
  def convert(file, format)
    # internally uses VideoFile, Codec, AudioMixer, BitrateReader...
  end
end`,
      php: `// Adapter
interface IPaymentGateway { public function charge(string $uid, int $cents): bool; }
class ThirdPartySDK { public function makePayment(string $uid, float $amount): bool { return true; } }
class PaymentAdapter implements IPaymentGateway {
  public function __construct(private ThirdPartySDK $sdk) {}
  public function charge(string $uid, int $cents): bool { return $this->sdk->makePayment($uid, $cents / 100); }
}
// Facade
class VideoConverter {
  public function convert(string $file, string $format): void { /* orchestrates subsystem */ }
}`,
    },
    order: 229,
    status: 'published',
  },

  {
    slug: 'compare-command-strategy-b2',
    title: 'Command vs Strategy',
    mode: 'compare',
    difficulty: 'hard',
    stem: 'Both Command and Strategy encapsulate behavior in an object. Explain the key differences in intent, what each encapsulates, and when to use each.',
    answer: 'Strategy encapsulates how to do something (algorithm); Command encapsulates what to do and when (request/action with optional undo)',
    choices: [
      'Strategy encapsulates how to do something (algorithm); Command encapsulates what to do and when (request/action with optional undo)',
      'Command uses inheritance; Strategy uses composition',
      'Strategy supports undo/redo; Command does not',
      'They are identical — Command is just a Strategy with a name',
    ],
    patternA: 'Command',
    patternB: 'Strategy',
    comparisonContext: 'A text editor needs (1) switchable text alignment algorithms (left/center/right) and (2) undoable actions (bold, delete). Which pattern fits each case?',
    keyTradeoffs: ['undo', 'algorithm', 'request', 'encapsulate', 'queue', 'history', 'swap', 'interchangeable'],
    explanation: 'Strategy: "how to" — encapsulates an interchangeable algorithm (sorting, compression, validation). The context holds one strategy and delegates to it. Strategies are usually stateless and swappable. No notion of undo. Command: "what to do" — encapsulates a complete request as an object, including the receiver and parameters. Commands can be queued, logged, and importantly UNDONE. Command objects are stateful (they know what state to restore). Memory aid: Strategy = select an algorithm; Command = record an action. In the editor: alignment → Strategy (swap left/center/right instantly). Bold/delete → Command (added to undo stack, can be reversed).',
    codeSnippets: {
      ts: `// Strategy: interchangeable algorithms
interface SortStrategy { sort(data: number[]): number[] }
class BubbleSort implements SortStrategy { sort(d: number[]) { return [...d].sort((a,b) => a-b) } }
class QuickSort implements SortStrategy { sort(d: number[]) { return [...d].sort((a,b) => a-b) } }
class Sorter { constructor(private s: SortStrategy) {}; sort(d: number[]) { return this.s.sort(d) } }

// Command: request as object with undo
interface Command { execute(): void; undo(): void }
class BoldCommand implements Command {
  private prevState: string = ''
  constructor(private editor: Editor) {}
  execute() { this.prevState = this.editor.text; this.editor.setBold() }
  undo() { this.editor.text = this.prevState }
}
class CommandHistory { private stack: Command[] = []
  execute(c: Command) { c.execute(); this.stack.push(c) }
  undo() { this.stack.pop()?.undo() }
}`,
      js: `// Strategy: swappable algorithm
class Sorter { constructor(s) { this.s = s } sort(d) { return this.s.sort(d) } }
// Command: request + undo
class BoldCommand {
  constructor(editor) { this.editor = editor }
  execute() { this.prev = this.editor.text; this.editor.setBold() }
  undo() { this.editor.text = this.prev }
}`,
      java: `// Strategy
interface SortStrategy { List<Integer> sort(List<Integer> data); }
class QuickSort implements SortStrategy { public List<Integer> sort(List<Integer> d) { /* quicksort */ return d; } }

// Command with undo
interface Command { void execute(); void undo(); }
class BoldCommand implements Command {
  private Editor editor; private String prevText;
  BoldCommand(Editor e) { editor = e; }
  public void execute() { prevText = editor.getText(); editor.setBold(); }
  public void undo() { editor.setText(prevText); }
}`,
      py: `# Strategy: interchangeable algorithm
class SortStrategy:
    def sort(self, data): raise NotImplementedError
class QuickSort(SortStrategy):
    def sort(self, data): return sorted(data)

# Command: request as object with undo
class BoldCommand:
    def __init__(self, editor):
        self.editor = editor; self.prev = None
    def execute(self):
        self.prev = self.editor.text
        self.editor.set_bold()
    def undo(self):
        self.editor.text = self.prev`,
      cpp: `// Strategy
struct SortStrategy { virtual std::vector<int> sort(std::vector<int>) = 0; };
struct QuickSort : SortStrategy { std::vector<int> sort(std::vector<int> d) override { std::sort(d.begin(),d.end()); return d; } };

// Command with undo
struct Command { virtual void execute() = 0; virtual void undo() = 0; };
struct BoldCommand : Command {
  Editor* editor; std::string prevText;
  void execute() override { prevText = editor->getText(); editor->setBold(); }
  void undo() override { editor->setText(prevText); }
};`,
      go: `// Strategy
type SortStrategy interface { Sort(data []int) []int }
type QuickSort struct{}
func (q *QuickSort) Sort(data []int) []int { /* ... */ return data }

// Command with undo
type Command interface { Execute(); Undo() }
type BoldCommand struct { editor *Editor; prevText string }
func (c *BoldCommand) Execute() { c.prevText = c.editor.Text; c.editor.SetBold() }
func (c *BoldCommand) Undo() { c.editor.Text = c.prevText }`,
      rust: `// Strategy: interchangeable algorithm
trait SortStrategy { fn sort(&self, data: Vec<i32>) -> Vec<i32>; }
struct QuickSort;
impl SortStrategy for QuickSort { fn sort(&self, mut d: Vec<i32>) -> Vec<i32> { d.sort(); d } }

// Command: request with undo
trait Command { fn execute(&mut self); fn undo(&mut self); }
struct BoldCommand { editor: Editor, prev_text: String }
impl Command for BoldCommand {
  fn execute(&mut self) { self.prev_text = self.editor.text.clone(); self.editor.set_bold(); }
  fn undo(&mut self) { self.editor.text = self.prev_text.clone(); }
}`,
      cs: `// Strategy
interface ISortStrategy { IList<int> Sort(IList<int> data); }
class QuickSort : ISortStrategy { public IList<int> Sort(IList<int> d) { /* ... */ return d; } }

// Command with undo
interface ICommand { void Execute(); void Undo(); }
class BoldCommand : ICommand {
  Editor editor; string prevText = "";
  public BoldCommand(Editor e) { editor = e; }
  public void Execute() { prevText = editor.GetText(); editor.SetBold(); }
  public void Undo() { editor.SetText(prevText); }
}`,
      kotlin: `// Strategy: interchangeable algorithm
interface SortStrategy { fun sort(data: List<Int>): List<Int> }
class QuickSort : SortStrategy { override fun sort(data: List<Int>) = data.sorted() }

// Command: request + undo
interface Command { fun execute(); fun undo() }
class BoldCommand(private val editor: Editor) : Command {
  private var prevText = ""
  override fun execute() { prevText = editor.text; editor.setBold() }
  override fun undo() { editor.text = prevText }
}`,
      swift: `// Strategy
protocol SortStrategy { func sort(_ data: [Int]) -> [Int] }
class QuickSort: SortStrategy { func sort(_ data: [Int]) -> [Int] { data.sorted() } }

// Command with undo
protocol Command { func execute(); func undo() }
class BoldCommand: Command {
  let editor: Editor; var prevText = ""
  init(_ e: Editor) { editor = e }
  func execute() { prevText = editor.text; editor.setBold() }
  func undo() { editor.text = prevText }
}`,
      rb: `# Strategy: swappable algorithm
class Sorter
  def initialize(strategy) = @s = strategy
  def sort(data) = @s.sort(data)
end
class QuickSort; def sort(data) = data.sort; end

# Command: request with undo
class BoldCommand
  def initialize(editor) = (@editor = editor; @prev = nil)
  def execute = (@prev = @editor.text; @editor.set_bold)
  def undo = (@editor.text = @prev)
end`,
      php: `// Strategy: interchangeable algorithm
interface SortStrategy { public function sort(array $data): array; }
class QuickSort implements SortStrategy { public function sort(array $data): array { sort($data); return $data; } }

// Command: request + undo
interface Command { public function execute(): void; public function undo(): void; }
class BoldCommand implements Command {
  private string $prevText = '';
  public function __construct(private Editor $editor) {}
  public function execute(): void { $this->prevText = $this->editor->getText(); $this->editor->setBold(); }
  public function undo(): void { $this->editor->setText($this->prevText); }
}`,
    },
    order: 230,
    status: 'published',
  },

  {
    slug: 'compare-singleton-monostate-b2',
    title: 'Singleton vs Monostate',
    mode: 'compare',
    difficulty: 'hard',
    stem: 'Compare Singleton and Monostate patterns. Both ensure a single shared state, but they differ structurally. When would you prefer Monostate over Singleton?',
    answer: 'Singleton: one instance enforced by constructor; Monostate: multiple instances allowed but all share static state',
    choices: [
      'Singleton: one instance enforced by constructor; Monostate: multiple instances allowed but all share static state',
      'Monostate uses a private constructor; Singleton uses static fields',
      'They are identical — Monostate is just another name for Singleton',
      'Singleton is always preferable to Monostate in all scenarios',
    ],
    patternA: 'Singleton',
    patternB: 'Monostate',
    comparisonContext: 'A config system needs shared state. Compare allowing `new Config()` anywhere (Monostate, all share static data) vs enforcing `Config.getInstance()` (Singleton, one reference enforced).',
    keyTradeoffs: ['static', 'instance', 'constructor', 'shared state', 'multiple instances', 'enforce', 'transparent'],
    explanation: 'Singleton: enforces a single instance at the object level. Clients must use `getInstance()`. Testable difficulty: hard to replace with a mock (private constructor). Monostate: allows `new` anywhere; all instances share the same static backing fields. "Transparent" singleton — callers don\'t know there\'s shared state. Advantages: drop-in replacement in code that uses `new`, easier to extend. Disadvantages: hidden coupling (callers don\'t know state is shared), surprising behaviour. Use Singleton when you need to control instance count tightly. Use Monostate when code already uses `new` extensively and refactoring to getInstance() is impractical — but be aware of the hidden coupling.',
    codeSnippets: {
      ts: `// Singleton: enforced single instance
class Config {
  private static instance: Config
  private constructor(private data: Record<string, string> = {}) {}
  static getInstance(): Config {
    if (!Config.instance) Config.instance = new Config()
    return Config.instance
  }
  get(key: string) { return this.data[key] }
  set(key: string, val: string) { this.data[key] = val }
}
// Usage: Config.getInstance().set('env', 'prod')

// Monostate: multiple instances, shared static state
class Config {
  private static data: Record<string, string> = {}  // shared
  get(key: string) { return Config.data[key] }  // reads from static
  set(key: string, val: string) { Config.data[key] = val }
}
// Usage: new Config().set('env', 'prod')  — or new Config() anywhere`,
      js: `// Singleton
class Config {
  static #instance = null
  static getInstance() { return Config.#instance ??= new Config() }
  #data = {}
  get(k) { return this.#data[k] }
  set(k, v) { this.#data[k] = v }
}
// Monostate: transparent
class Config {
  static #data = {}
  get(k) { return Config.#data[k] }
  set(k, v) { Config.#data[k] = v }
}
new Config().set('env', 'prod')
console.log(new Config().get('env'))  // 'prod' — different instance, same state`,
      java: `// Singleton
public class Config {
  private static Config instance;
  private Map<String, String> data = new HashMap<>();
  private Config() {}
  public static Config getInstance() {
    if (instance == null) instance = new Config();
    return instance;
  }
}
// Monostate
public class Config {
  private static Map<String, String> data = new HashMap<>();  // shared
  public String get(String key) { return data.get(key); }
  public void set(String key, String val) { data.put(key, val); }
}`,
      py: `# Singleton
class Config:
    _instance = None
    def __new__(cls, *args, **kwargs):
        if not cls._instance: cls._instance = super().__new__(cls)
        return cls._instance

# Monostate
class Config:
    _data = {}  # class-level (shared)
    def get(self, key): return Config._data.get(key)
    def set(self, key, val): Config._data[key] = val
# new Config() always works, but state is shared:
a = Config(); b = Config()
a.set('env', 'prod'); print(b.get('env'))  # 'prod'`,
      cpp: `// Singleton
class Config {
  static Config* instance;
  std::map<std::string,std::string> data;
  Config() {}
public:
  static Config* getInstance() { if (!instance) instance = new Config(); return instance; }
};
// Monostate
class Config {
  static std::map<std::string,std::string> data;  // shared
public:
  std::string get(const std::string& k) { return data[k]; }
  void set(const std::string& k, const std::string& v) { data[k] = v; }
};`,
      go: `// Singleton (using sync.Once)
var (
  instance *Config
  once     sync.Once
)
func GetConfig() *Config { once.Do(func() { instance = &Config{} }); return instance }

// Monostate equivalent in Go (package-level variable)
var configData = map[string]string{}
type Config struct{}
func (c *Config) Get(k string) string { return configData[k] }
func (c *Config) Set(k, v string) { configData[k] = v }`,
      rust: `// Singleton (using lazy_static)
use std::sync::{Mutex, LazyLock};
static CONFIG: LazyLock<Mutex<Config>> = LazyLock::new(|| Mutex::new(Config::new()));

// Monostate: static fields, multiple instances allowed
struct Config;
static DATA: std::sync::RwLock<std::collections::HashMap<String, String>> =
  std::sync::RwLock::new(std::collections::HashMap::new());
impl Config {
  fn get(&self, key: &str) -> Option<String> { DATA.read().unwrap().get(key).cloned() }
  fn set(&self, key: &str, val: &str) { DATA.write().unwrap().insert(key.into(), val.into()); }
}`,
      cs: `// Singleton
class Config {
  private static Config? _instance;
  private Dictionary<string, string> data = new();
  private Config() {}
  public static Config Instance => _instance ??= new Config();
}
// Monostate
class Config {
  private static Dictionary<string, string> data = new();  // shared static
  public string? Get(string key) => data.GetValueOrDefault(key);
  public void Set(string key, string val) => data[key] = val;
}`,
      kotlin: `// Singleton: object keyword enforces single instance
object Config {
  private val data = mutableMapOf<String, String>()
  fun get(key: String) = data[key]
  fun set(key: String, value: String) { data[key] = value }
}

// Monostate: companion object holds shared state
class Config {
  companion object { private val data = mutableMapOf<String, String>() }
  fun get(key: String) = data[key]
  fun set(key: String, value: String) { data[key] = value }
}
// new Config() is allowed, but all instances share companion data`,
      swift: `// Singleton
class Config {
  static let shared = Config()
  private init() {}
  private var data: [String: String] = [:]
  func get(_ k: String) -> String? { data[k] }
  func set(_ k: String, _ v: String) { data[k] = v }
}
// Monostate
class Config {
  private static var data: [String: String] = [:]  // shared
  func get(_ k: String) -> String? { Config.data[k] }
  func set(_ k: String, _ v: String) { Config.data[k] = v }
}`,
      rb: `# Singleton
class Config
  @instance = nil
  def self.instance = @instance ||= new
  private_class_method :new
  def initialize = @data = {}
  def get(k) = @data[k]
  def set(k, v) = @data[k] = v
end

# Monostate
class Config
  @@data = {}  # class variable (shared)
  def get(k) = @@data[k]
  def set(k, v) = @@data[k] = v
end
a = Config.new; b = Config.new
a.set(:env, 'prod'); puts b.get(:env)  # 'prod'`,
      php: `// Singleton
class Config {
  private static ?Config $instance = null;
  private array $data = [];
  private function __construct() {}
  public static function getInstance(): static { return static::$instance ??= new static(); }
}
// Monostate
class Config {
  private static array $data = [];  // shared
  public function get(string $k): mixed { return self::$data[$k] ?? null; }
  public function set(string $k, mixed $v): void { self::$data[$k] = $v; }
}`,
    },
    order: 231,
    status: 'published',
  },

  // ── ADDITIONAL HARD IDENTIFY ───────────────────────────────────────────────

  {
    slug: 'decorator-beverage-b2',
    title: 'Beverage Condiment Decorator',
    mode: 'identify',
    difficulty: 'hard',
    stem: 'A `Beverage` abstract class has `cost()` and `description()`. `CondimentDecorator` extends `Beverage` and wraps another `Beverage`. `Milk` and `Sugar` extend `CondimentDecorator`, calling `super.cost() + ownCost`. `new Milk(new Sugar(new Espresso()))` creates a triple-wrapped object. What pattern is this?',
    answer: 'Decorator',
    choices: ['Decorator', 'Composite', 'Chain of Responsibility', 'Proxy'],
    explanation: 'Decorator wraps an object with the same interface to transparently add behavior. Key identifiers: (1) the wrapper extends the same abstract class as the wrapped object, (2) each wrapper holds exactly ONE inner component (not a list — that\'s Composite), (3) behavior is additive: Milk adds its cost to the wrapped object\'s cost. The wrapping chain `Milk(Sugar(Espresso))` reads right-to-left: Espresso→Sugar→Milk. Each wrapper is responsible for calling through to the inner object.',
    codeSnippets: {
      ts: `abstract class Beverage { abstract cost(): number; abstract description(): string }
abstract class CondimentDecorator extends Beverage {
  constructor(protected inner: Beverage) { super() }
}
class Espresso extends Beverage { cost() { return 1.99 }; description() { return 'Espresso' } }
class Milk extends CondimentDecorator {
  cost() { return this.inner.cost() + 0.25 }
  description() { return this.inner.description() + ', Milk' }
}
class Sugar extends CondimentDecorator {
  cost() { return this.inner.cost() + 0.10 }
  description() { return this.inner.description() + ', Sugar' }
}
// Usage: new Milk(new Sugar(new Espresso()))`,
      js: `class Espresso { cost() { return 1.99 }; description() { return 'Espresso' } }
class Milk {
  constructor(inner) { this.inner = inner }
  cost() { return this.inner.cost() + 0.25 }
  description() { return this.inner.description() + ', Milk' }
}
class Sugar {
  constructor(inner) { this.inner = inner }
  cost() { return this.inner.cost() + 0.10 }
  description() { return this.inner.description() + ', Sugar' }
}`,
      java: `abstract class Beverage { abstract double cost(); abstract String description(); }
abstract class CondimentDecorator extends Beverage { protected Beverage inner; CondimentDecorator(Beverage b) { inner = b; } }
class Espresso extends Beverage { public double cost() { return 1.99; } public String description() { return "Espresso"; } }
class Milk extends CondimentDecorator {
  Milk(Beverage b) { super(b); }
  public double cost() { return inner.cost() + 0.25; }
  public String description() { return inner.description() + ", Milk"; }
}`,
      py: `class Beverage:
    def cost(self): raise NotImplementedError
    def description(self): raise NotImplementedError
class Espresso(Beverage):
    def cost(self): return 1.99
    def description(self): return 'Espresso'
class Milk(Beverage):
    def __init__(self, inner): self.inner = inner
    def cost(self): return self.inner.cost() + 0.25
    def description(self): return self.inner.description() + ', Milk'`,
      cpp: `struct Beverage { virtual double cost() = 0; virtual std::string desc() = 0; };
struct Espresso : Beverage { double cost() override { return 1.99; } std::string desc() override { return "Espresso"; } };
struct Milk : Beverage {
  Beverage* inner;
  Milk(Beverage* b) : inner(b) {}
  double cost() override { return inner->cost() + 0.25; }
  std::string desc() override { return inner->desc() + ", Milk"; }
};`,
      go: `type Beverage interface { Cost() float64; Description() string }
type Espresso struct{}
func (e *Espresso) Cost() float64 { return 1.99 }
func (e *Espresso) Description() string { return "Espresso" }
type Milk struct { inner Beverage }
func (m *Milk) Cost() float64 { return m.inner.Cost() + 0.25 }
func (m *Milk) Description() string { return m.inner.Description() + ", Milk" }`,
      rust: `trait Beverage { fn cost(&self) -> f64; fn description(&self) -> String; }
struct Espresso;
impl Beverage for Espresso { fn cost(&self) -> f64 { 1.99 } fn description(&self) -> String { "Espresso".into() } }
struct Milk { inner: Box<dyn Beverage> }
impl Beverage for Milk {
  fn cost(&self) -> f64 { self.inner.cost() + 0.25 }
  fn description(&self) -> String { self.inner.description() + ", Milk" }
}`,
      cs: `abstract class Beverage { public abstract double Cost(); public abstract string Description(); }
abstract class CondimentDecorator : Beverage { protected Beverage inner; public CondimentDecorator(Beverage b) { inner = b; } }
class Espresso : Beverage { public override double Cost() => 1.99; public override string Description() => "Espresso"; }
class Milk : CondimentDecorator {
  public Milk(Beverage b) : base(b) {}
  public override double Cost() => inner.Cost() + 0.25;
  public override string Description() => inner.Description() + ", Milk";
}`,
      kotlin: `abstract class Beverage { abstract fun cost(): Double; abstract fun description(): String }
abstract class CondimentDecorator(protected val inner: Beverage) : Beverage()
class Espresso : Beverage() { override fun cost() = 1.99; override fun description() = "Espresso" }
class Milk(inner: Beverage) : CondimentDecorator(inner) {
  override fun cost() = inner.cost() + 0.25
  override fun description() = inner.description() + ", Milk"
}`,
      swift: `protocol Beverage { var cost: Double { get }; var desc: String { get } }
class Espresso: Beverage { var cost: Double { 1.99 }; var desc: String { "Espresso" } }
class Milk: Beverage {
  private let inner: Beverage
  init(_ b: Beverage) { inner = b }
  var cost: Double { inner.cost + 0.25 }
  var desc: String { inner.desc + ", Milk" }
}`,
      rb: `class Espresso; def cost = 1.99; def description = 'Espresso'; end
class Milk
  def initialize(inner) = @inner = inner
  def cost = @inner.cost + 0.25
  def description = @inner.description + ', Milk'
end
class Sugar
  def initialize(inner) = @inner = inner
  def cost = @inner.cost + 0.10
  def description = @inner.description + ', Sugar'
end`,
      php: `abstract class Beverage { abstract public function cost(): float; abstract public function description(): string; }
class Espresso extends Beverage { public function cost(): float { return 1.99; } public function description(): string { return 'Espresso'; } }
class Milk extends Beverage {
  public function __construct(private Beverage $inner) {}
  public function cost(): float { return $this->inner->cost() + 0.25; }
  public function description(): string { return $this->inner->description() . ', Milk'; }
}`,
    },
    order: 232,
    status: 'published',
  },

  {
    slug: 'state-vending-b2',
    title: 'Vending Machine State Machine',
    mode: 'identify',
    difficulty: 'hard',
    stem: 'A vending machine has states: `NoCoin`, `HasCoin`, `Dispensing`, `SoldOut`. Inserting a coin, pressing dispense, and collecting the item trigger transitions between states. Each state implements `insertCoin()`, `pressDispense()`, and `collectItem()` differently. What pattern is this?',
    answer: 'State',
    choices: ['State', 'Strategy', 'Command', 'Chain of Responsibility'],
    explanation: 'The State pattern allows an object to alter its behaviour when its internal state changes — the object appears to change its class. Each state is a separate class implementing the same interface. The vending machine context delegates all actions to the current state object. Transitions update the context\'s `currentState` field. Unlike Strategy (where the algorithm is selected externally and doesn\'t change itself), State transitions are driven by the object\'s own lifecycle.',
    codeSnippets: {
      ts: `interface VendingState { insertCoin(): void; pressDispense(): void; collectItem(): void }
class VendingMachine {
  private state: VendingState
  constructor() { this.state = new NoCoinState(this) }
  setState(s: VendingState) { this.state = s }
  insertCoin() { this.state.insertCoin() }
  pressDispense() { this.state.pressDispense() }
  collectItem() { this.state.collectItem() }
}
class NoCoinState implements VendingState {
  constructor(private m: VendingMachine) {}
  insertCoin() { console.log('coin inserted'); this.m.setState(new HasCoinState(this.m)) }
  pressDispense() { console.log('insert coin first') }
  collectItem() { console.log('no item') }
}`,
      js: `class VendingMachine {
  constructor() { this.state = new NoCoinState(this) }
  setState(s) { this.state = s }
  insertCoin() { this.state.insertCoin() }
  pressDispense() { this.state.pressDispense() }
}
class NoCoinState {
  constructor(m) { this.m = m }
  insertCoin() { this.m.setState(new HasCoinState(this.m)) }
  pressDispense() { console.log('insert coin first') }
}`,
      java: `interface VendingState { void insertCoin(); void pressDispense(); void collectItem(); }
class VendingMachine {
  private VendingState state;
  public VendingMachine() { state = new NoCoinState(this); }
  public void setState(VendingState s) { state = s; }
  public void insertCoin() { state.insertCoin(); }
}
class NoCoinState implements VendingState {
  private VendingMachine m;
  public void insertCoin() { m.setState(new HasCoinState(m)); }
  public void pressDispense() { System.out.println("insert coin first"); }
  public void collectItem() {}
}`,
      py: `class VendingMachine:
    def __init__(self): self.state = NoCoinState(self)
    def set_state(self, s): self.state = s
    def insert_coin(self): self.state.insert_coin()
    def press_dispense(self): self.state.press_dispense()
class NoCoinState:
    def __init__(self, m): self.m = m
    def insert_coin(self): self.m.set_state(HasCoinState(self.m))
    def press_dispense(self): print('insert coin first')`,
      cpp: `struct VendingMachine;
struct VendingState { virtual void insertCoin(VendingMachine&) = 0; virtual void pressDispense(VendingMachine&) = 0; };
struct VendingMachine {
  VendingState* state;
  VendingMachine();
  void setState(VendingState* s) { state = s; }
  void insertCoin() { state->insertCoin(*this); }
};`,
      go: `type VendingState interface { InsertCoin(m *VendingMachine); PressDispense(m *VendingMachine) }
type VendingMachine struct { state VendingState }
func (m *VendingMachine) SetState(s VendingState) { m.state = s }
func (m *VendingMachine) InsertCoin() { m.state.InsertCoin(m) }
type NoCoinState struct{}
func (s *NoCoinState) InsertCoin(m *VendingMachine) { m.SetState(&HasCoinState{}) }
func (s *NoCoinState) PressDispense(m *VendingMachine) { fmt.Println("insert coin first") }`,
      rust: `trait VendingState { fn insert_coin(&self, m: &mut VendingMachine); fn press_dispense(&self, m: &mut VendingMachine); }
struct VendingMachine { state: Box<dyn VendingState> }
impl VendingMachine {
  fn insert_coin(&mut self) { /* delegate */ }
}`,
      cs: `interface IVendingState { void InsertCoin(); void PressDispense(); void CollectItem(); }
class VendingMachine {
  private IVendingState state;
  public VendingMachine() { state = new NoCoinState(this); }
  public void SetState(IVendingState s) { state = s; }
  public void InsertCoin() { state.InsertCoin(); }
}
class NoCoinState : IVendingState {
  VendingMachine m;
  public NoCoinState(VendingMachine m) { this.m = m; }
  public void InsertCoin() { m.SetState(new HasCoinState(m)); }
  public void PressDispense() { Console.WriteLine("insert coin first"); }
  public void CollectItem() {}
}`,
      kotlin: `interface VendingState { fun insertCoin(m: VendingMachine); fun pressDispense(m: VendingMachine) }
class VendingMachine {
  var state: VendingState = NoCoinState()
  fun insertCoin() = state.insertCoin(this)
  fun pressDispense() = state.pressDispense(this)
}
class NoCoinState : VendingState {
  override fun insertCoin(m: VendingMachine) { m.state = HasCoinState() }
  override fun pressDispense(m: VendingMachine) = println("insert coin first")
}`,
      swift: `protocol VendingState { func insertCoin(m: VendingMachine); func pressDispense(m: VendingMachine) }
class VendingMachine {
  var state: VendingState
  init() { state = NoCoinState() }
  func insertCoin() { state.insertCoin(m: self) }
}
class NoCoinState: VendingState {
  func insertCoin(m: VendingMachine) { m.state = HasCoinState() }
  func pressDispense(m: VendingMachine) { print("insert coin first") }
}`,
      rb: `class VendingMachine
  attr_accessor :state
  def initialize = @state = NoCoinState.new(self)
  def insert_coin = @state.insert_coin
  def press_dispense = @state.press_dispense
end
class NoCoinState
  def initialize(m) = @m = m
  def insert_coin = @m.state = HasCoinState.new(@m)
  def press_dispense = puts 'insert coin first'
end`,
      php: `interface VendingState { public function insertCoin(): void; public function pressDispense(): void; }
class VendingMachine {
  private VendingState $state;
  public function __construct() { $this->state = new NoCoinState($this); }
  public function setState(VendingState $s): void { $this->state = $s; }
  public function insertCoin(): void { $this->state->insertCoin(); }
}
class NoCoinState implements VendingState {
  public function __construct(private VendingMachine $m) {}
  public function insertCoin(): void { $this->m->setState(new HasCoinState($this->m)); }
  public function pressDispense(): void { echo "insert coin first\n"; }
}`,
    },
    order: 233,
    status: 'published',
  },

  {
    slug: 'detect-exception-flow-b2',
    title: 'Exceptions for Control Flow',
    mode: 'detect',
    difficulty: 'hard',
    stem: `A \`UserService\` throws a custom \`UserNotFoundException\` when a lookup returns no results, and the caller catches it to branch logic. What is the design problem and what is the preferred solution?

\`\`\`
try {
  const user = userService.findById(id)
  processUser(user)
} catch (UserNotFoundException e) {
  createNewUser(id)
}
\`\`\``,
    answer: 'Using exceptions for control flow — return Optional/null/Result type instead; reserve exceptions for truly exceptional conditions',
    choices: [
      'Using exceptions for control flow — return Optional/null/Result type instead; reserve exceptions for truly exceptional conditions',
      'Missing try-finally — resources are not being closed',
      'Single Responsibility violation — lookup and creation should be separate classes',
      'No problem — exceptions are the correct mechanism for handling missing users',
    ],
    explanation: '"Not found" is a normal, expected outcome — not an exceptional condition. Using exceptions for expected branching: (1) hides intent — readers expect exceptions to signal bugs, not expected outcomes; (2) is slow — exceptions are expensive in most runtimes; (3) makes control flow non-obvious. Preferred alternatives: return `Optional<User>` (Java), `User | null` (TypeScript), `Result<User, NotFound>` (Rust/Kotlin), or a boolean `existsById()` check. Reserve exceptions for truly exceptional, unrecoverable situations (database connection failure, null pointer, etc.).',
    codeSnippets: {
      ts: `// Problem: exception as control flow
try {
  const user = userService.findById(id)
  processUser(user)
} catch (e) {
  if (e instanceof UserNotFoundException) createNewUser(id)
  else throw e
}

// Fix: return null or optional
const user = userService.findById(id)  // returns User | null
if (user === null) {
  createNewUser(id)
} else {
  processUser(user)
}`,
      js: `// Problem: throw for expected case
function findById(id) {
  const user = db.get(id)
  if (!user) throw new Error('UserNotFound')  // not truly exceptional
  return user
}
// Fix: return null
function findById(id) { return db.get(id) ?? null }
const user = userService.findById(id)
if (user) processUser(user); else createNewUser(id)`,
      java: `// Problem: exception for control flow
try {
  User user = userService.findById(id);
  processUser(user);
} catch (UserNotFoundException e) {
  createNewUser(id);
}
// Fix: Optional<User>
Optional<User> user = userService.findById(id);
user.ifPresentOrElse(this::processUser, () -> createNewUser(id));`,
      py: `# Problem: exception as expected branch
try:
    user = user_service.find_by_id(uid)
    process_user(user)
except UserNotFoundException:
    create_new_user(uid)

# Fix: return None
user = user_service.find_by_id(uid)  # returns User | None
if user is None:
    create_new_user(uid)
else:
    process_user(user)`,
      cpp: `// Problem: exception for normal case
try {
  auto user = userService.findById(id);
  processUser(user);
} catch (const UserNotFoundException&) {
  createNewUser(id);
}
// Fix: std::optional
std::optional<User> user = userService.findById(id);
if (user) processUser(*user);
else createNewUser(id);`,
      go: `// Problem: simulated exception via panic (antipattern)
// Go idiomatic: return error as value
user, err := userService.FindById(id)
if errors.Is(err, ErrUserNotFound) {
  CreateNewUser(id)  // expected branch, not exceptional
  return
}
if err != nil { return err }  // truly exceptional
ProcessUser(user)`,
      rust: `// Problem: panic for expected case
// Fix: use Result or Option
fn find_user(id: u64) -> Option<User> {
  db.get(id)  // returns None when not found
}
match find_user(id) {
  Some(user) => process_user(user),
  None => create_new_user(id),  // clear, explicit branching
}`,
      cs: `// Problem: exception as control flow
try {
  var user = userService.FindById(id);
  ProcessUser(user);
} catch (UserNotFoundException) {
  CreateNewUser(id);
}
// Fix: return null or use TryGet pattern
var user = userService.FindById(id);  // returns User?
if (user is null) CreateNewUser(id);
else ProcessUser(user);`,
      kotlin: `// Problem: exception for expected path
try {
  val user = userService.findById(id)
  processUser(user)
} catch (e: UserNotFoundException) {
  createNewUser(id)
}
// Fix: return null or sealed Result
val user = userService.findById(id)  // User?
if (user == null) createNewUser(id) else processUser(user)`,
      swift: `// Problem: throw for expected case
do {
  let user = try userService.find(id: id)
  process(user)
} catch UserError.notFound {
  createNewUser(id: id)  // "not found" is expected, not exceptional
}
// Fix: return Optional
if let user = userService.find(id: id) {
  process(user)
} else {
  createNewUser(id: id)
}`,
      rb: `# Problem: exception for control flow
begin
  user = user_service.find_by_id(id)
  process_user(user)
rescue UserNotFoundException
  create_new_user(id)
end

# Fix: return nil
user = user_service.find_by_id(id)  # returns nil if not found
if user.nil?
  create_new_user(id)
else
  process_user(user)
end`,
      php: `// Problem: exception for expected case
try {
  $user = $userService->findById($id);
  $this->processUser($user);
} catch (UserNotFoundException $e) {
  $this->createNewUser($id);
}
// Fix: return null
$user = $userService->findById($id);  // returns ?User
if ($user === null) $this->createNewUser($id);
else $this->processUser($user);`,
    },
    order: 234,
    status: 'published',
  },

  {
    slug: 'suggest-undo-stack-b2',
    title: 'Undo/Redo for a Text Editor',
    mode: 'suggest',
    difficulty: 'hard',
    stem: 'You are implementing undo/redo for a text editor. Each operation (insert character, delete word, paste block) must be reversible. Operations should be queueable for macro recording and replayable. Which pattern provides the best structure?',
    answer: 'Command pattern — encapsulate each operation as a Command object with execute() and undo()',
    choices: [
      'Command pattern — encapsulate each operation as a Command object with execute() and undo()',
      'Memento pattern — snapshot entire editor state before each operation',
      'Strategy pattern — swap text-manipulation algorithms at runtime',
      'Observer pattern — notify listeners of every character change',
    ],
    problemContext: 'Text editor: each operation (insert, delete, paste) must be undoable and replayable. Macro recording needs a sequence of operations.',
    keyPatterns: ['command', 'undo', 'redo', 'history', 'execute', 'reversible', 'macro', 'queue'],
    explanation: 'The Command pattern encapsulates each editor operation as an object with `execute()` and `undo()`. A history stack stores executed commands; undo pops and calls `undo()`; redo pushes and re-executes. Macros are just lists of commands. Compared to Memento (snapshot full state): Command is more memory-efficient (stores only the delta — what changed), supports macro recording naturally, and allows selective undo. Use Memento when operations are complex and deltas are hard to express. For a text editor, Command is preferred because operations are discrete and invertible.',
    codeSnippets: {
      ts: `interface Command { execute(): void; undo(): void }
class InsertCommand implements Command {
  constructor(private doc: Document, private pos: number, private text: string) {}
  execute() { this.doc.insert(this.pos, this.text) }
  undo() { this.doc.delete(this.pos, this.text.length) }
}
class DeleteCommand implements Command {
  private deleted = ''
  constructor(private doc: Document, private pos: number, private len: number) {}
  execute() { this.deleted = this.doc.getText(this.pos, this.len); this.doc.delete(this.pos, this.len) }
  undo() { this.doc.insert(this.pos, this.deleted) }
}
class CommandHistory {
  private done: Command[] = []; private undone: Command[] = []
  execute(c: Command) { c.execute(); this.done.push(c); this.undone = [] }
  undo() { const c = this.done.pop(); if (c) { c.undo(); this.undone.push(c) } }
  redo() { const c = this.undone.pop(); if (c) { c.execute(); this.done.push(c) } }
}`,
      js: `class InsertCommand {
  constructor(doc, pos, text) { this.doc = doc; this.pos = pos; this.text = text }
  execute() { this.doc.insert(this.pos, this.text) }
  undo() { this.doc.delete(this.pos, this.text.length) }
}
class CommandHistory {
  constructor() { this.done = []; this.undone = [] }
  execute(c) { c.execute(); this.done.push(c); this.undone = [] }
  undo() { const c = this.done.pop(); if (c) { c.undo(); this.undone.push(c) } }
  redo() { const c = this.undone.pop(); if (c) { c.execute(); this.done.push(c) } }
}`,
      java: `interface Command { void execute(); void undo(); }
class InsertCommand implements Command {
  private Document doc; private int pos; private String text;
  InsertCommand(Document d, int p, String t) { doc = d; pos = p; text = t; }
  public void execute() { doc.insert(pos, text); }
  public void undo() { doc.delete(pos, text.length()); }
}
class CommandHistory {
  private Deque<Command> done = new ArrayDeque<>();
  private Deque<Command> undone = new ArrayDeque<>();
  public void execute(Command c) { c.execute(); done.push(c); undone.clear(); }
  public void undo() { if (!done.isEmpty()) { Command c = done.pop(); c.undo(); undone.push(c); } }
  public void redo() { if (!undone.isEmpty()) { Command c = undone.pop(); c.execute(); done.push(c); } }
}`,
      py: `class InsertCommand:
    def __init__(self, doc, pos, text):
        self.doc = doc; self.pos = pos; self.text = text
    def execute(self): self.doc.insert(self.pos, self.text)
    def undo(self): self.doc.delete(self.pos, len(self.text))
class CommandHistory:
    def __init__(self): self.done = []; self.undone = []
    def execute(self, cmd):
        cmd.execute(); self.done.append(cmd); self.undone.clear()
    def undo(self):
        if self.done: cmd = self.done.pop(); cmd.undo(); self.undone.append(cmd)
    def redo(self):
        if self.undone: cmd = self.undone.pop(); cmd.execute(); self.done.append(cmd)`,
      cpp: `struct Command { virtual void execute() = 0; virtual void undo() = 0; };
struct InsertCommand : Command {
  Document& doc; int pos; std::string text;
  void execute() override { doc.insert(pos, text); }
  void undo() override { doc.erase(pos, text.size()); }
};
struct CommandHistory {
  std::stack<Command*> done, undone;
  void execute(Command* c) { c->execute(); done.push(c); while (!undone.empty()) undone.pop(); }
  void undo() { if (!done.empty()) { auto c = done.top(); done.pop(); c->undo(); undone.push(c); } }
  void redo() { if (!undone.empty()) { auto c = undone.top(); undone.pop(); c->execute(); done.push(c); } }
};`,
      go: `type Command interface { Execute(); Undo() }
type InsertCmd struct { doc *Document; pos int; text string }
func (c *InsertCmd) Execute() { c.doc.Insert(c.pos, c.text) }
func (c *InsertCmd) Undo() { c.doc.Delete(c.pos, len(c.text)) }
type History struct { done []Command; undone []Command }
func (h *History) Execute(c Command) { c.Execute(); h.done = append(h.done, c); h.undone = nil }
func (h *History) Undo() {
  if n := len(h.done); n > 0 { c := h.done[n-1]; h.done = h.done[:n-1]; c.Undo(); h.undone = append(h.undone, c) }
}`,
      rust: `trait Command { fn execute(&mut self); fn undo(&mut self); }
struct InsertCommand { pos: usize, text: String }
impl Command for InsertCommand {
  fn execute(&mut self) { /* insert */ }
  fn undo(&mut self) { /* delete */ }
}
struct CommandHistory { done: Vec<Box<dyn Command>>, undone: Vec<Box<dyn Command>> }
impl CommandHistory {
  fn execute(&mut self, mut c: Box<dyn Command>) { c.execute(); self.done.push(c); self.undone.clear(); }
  fn undo(&mut self) { if let Some(mut c) = self.done.pop() { c.undo(); self.undone.push(c); } }
  fn redo(&mut self) { if let Some(mut c) = self.undone.pop() { c.execute(); self.done.push(c); } }
}`,
      cs: `interface ICommand { void Execute(); void Undo(); }
class InsertCommand : ICommand {
  Document doc; int pos; string text;
  public InsertCommand(Document d, int p, string t) { doc = d; pos = p; text = t; }
  public void Execute() { doc.Insert(pos, text); }
  public void Undo() { doc.Delete(pos, text.Length); }
}
class CommandHistory {
  Stack<ICommand> done = new(), undone = new();
  public void Execute(ICommand c) { c.Execute(); done.Push(c); undone.Clear(); }
  public void Undo() { if (done.Count > 0) { var c = done.Pop(); c.Undo(); undone.Push(c); } }
  public void Redo() { if (undone.Count > 0) { var c = undone.Pop(); c.Execute(); done.Push(c); } }
}`,
      kotlin: `interface Command { fun execute(); fun undo() }
class InsertCommand(private val doc: Document, private val pos: Int, private val text: String) : Command {
  override fun execute() = doc.insert(pos, text)
  override fun undo() = doc.delete(pos, text.length)
}
class CommandHistory {
  private val done = ArrayDeque<Command>()
  private val undone = ArrayDeque<Command>()
  fun execute(c: Command) { c.execute(); done.addLast(c); undone.clear() }
  fun undo() { done.removeLastOrNull()?.let { it.undo(); undone.addLast(it) } }
  fun redo() { undone.removeLastOrNull()?.let { it.execute(); done.addLast(it) } }
}`,
      swift: `protocol Command { func execute(); func undo() }
class InsertCommand: Command {
  let doc: Document; let pos: Int; let text: String
  init(_ d: Document, _ p: Int, _ t: String) { doc = d; pos = p; text = t }
  func execute() { doc.insert(at: pos, text: text) }
  func undo() { doc.delete(at: pos, length: text.count) }
}
class CommandHistory {
  var done: [Command] = []; var undone: [Command] = []
  func execute(_ c: Command) { c.execute(); done.append(c); undone.removeAll() }
  func undo() { if let c = done.popLast() { c.undo(); undone.append(c) } }
  func redo() { if let c = undone.popLast() { c.execute(); done.append(c) } }
}`,
      rb: `class InsertCommand
  def initialize(doc, pos, text) = (@doc = doc; @pos = pos; @text = text)
  def execute = @doc.insert(@pos, @text)
  def undo = @doc.delete(@pos, @text.length)
end
class CommandHistory
  def initialize = (@done = []; @undone = [])
  def execute(cmd) = (cmd.execute; @done.push(cmd); @undone.clear)
  def undo = (cmd = @done.pop) && (cmd.undo; @undone.push(cmd))
  def redo = (cmd = @undone.pop) && (cmd.execute; @done.push(cmd))
end`,
      php: `interface Command { public function execute(): void; public function undo(): void; }
class InsertCommand implements Command {
  public function __construct(private Document $doc, private int $pos, private string $text) {}
  public function execute(): void { $this->doc->insert($this->pos, $this->text); }
  public function undo(): void { $this->doc->delete($this->pos, strlen($this->text)); }
}
class CommandHistory {
  private array $done = [], $undone = [];
  public function execute(Command $c): void { $c->execute(); $this->done[] = $c; $this->undone = []; }
  public function undo(): void { if ($c = array_pop($this->done)) { $c->undo(); $this->undone[] = $c; } }
  public function redo(): void { if ($c = array_pop($this->undone)) { $c->execute(); $this->done[] = $c; } }
}`,
    },
    order: 235,
    status: 'published',
  },

  // ── ADDITIONAL MEDIUM IDENTIFY ────────────────────────────────────────────

  {
    slug: 'prototype-registry-b2',
    title: 'Prototype Registry',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'A game has many `Monster` types. A `MonsterRegistry` stores prototype instances by name. When spawning a monster, the registry calls `prototype.clone()` to produce a new instance — avoiding expensive re-initialization. What pattern is this?',
    answer: 'Prototype',
    choices: ['Prototype', 'Factory Method', 'Flyweight', 'Object Pool'],
    explanation: 'Prototype creates new objects by copying an existing instance. The registry holds pre-initialized "template" monsters. Cloning is faster than calling `new` + configuring from scratch (especially with complex initialization). Each clone gets independent state and can be modified without affecting the prototype. Prototype differs from Flyweight (shared state, no clone) and Factory Method (creates from scratch, not from a template).',
    codeSnippets: {
      ts: `interface Monster { clone(): Monster; name: string; hp: number }
class Goblin implements Monster {
  constructor(public name: string, public hp: number) {}
  clone(): Monster { return new Goblin(this.name, this.hp) }
}
class MonsterRegistry {
  private registry = new Map<string, Monster>()
  register(key: string, proto: Monster) { this.registry.set(key, proto) }
  spawn(key: string): Monster { return this.registry.get(key)!.clone() }
}
const reg = new MonsterRegistry()
reg.register('goblin', new Goblin('Goblin', 50))
const g1 = reg.spawn('goblin'); const g2 = reg.spawn('goblin')  // independent`,
      js: `class Goblin {
  constructor(name, hp) { this.name = name; this.hp = hp }
  clone() { return new Goblin(this.name, this.hp) }
}
class MonsterRegistry {
  constructor() { this.registry = new Map() }
  register(key, proto) { this.registry.set(key, proto) }
  spawn(key) { return this.registry.get(key).clone() }
}`,
      java: `interface Monster extends Cloneable { Monster clone(); }
class Goblin implements Monster {
  String name; int hp;
  public Goblin clone() { try { return (Goblin) super.clone(); } catch (Exception e) { throw new RuntimeException(e); } }
}
class MonsterRegistry {
  Map<String, Monster> registry = new HashMap<>();
  public void register(String key, Monster proto) { registry.put(key, proto); }
  public Monster spawn(String key) { return registry.get(key).clone(); }
}`,
      py: `import copy
class Goblin:
    def __init__(self, name, hp): self.name = name; self.hp = hp
    def clone(self): return copy.copy(self)
class MonsterRegistry:
    def __init__(self): self.registry = {}
    def register(self, key, proto): self.registry[key] = proto
    def spawn(self, key): return self.registry[key].clone()`,
      cpp: `struct Monster { virtual Monster* clone() = 0; std::string name; int hp; };
struct Goblin : Monster { Goblin* clone() override { return new Goblin(*this); } };
class MonsterRegistry {
  std::map<std::string, Monster*> registry;
public:
  void register_(const std::string& key, Monster* proto) { registry[key] = proto; }
  Monster* spawn(const std::string& key) { return registry[key]->clone(); }
};`,
      go: `type Monster interface { Clone() Monster }
type Goblin struct { Name string; HP int }
func (g *Goblin) Clone() Monster { c := *g; return &c }
type MonsterRegistry struct { reg map[string]Monster }
func (r *MonsterRegistry) Register(key string, m Monster) { r.reg[key] = m }
func (r *MonsterRegistry) Spawn(key string) Monster { return r.reg[key].Clone() }`,
      rust: `trait Monster: Clone { fn clone_monster(&self) -> Box<dyn Monster>; }
#[derive(Clone)]
struct Goblin { name: String, hp: u32 }
impl Monster for Goblin { fn clone_monster(&self) -> Box<dyn Monster> { Box::new(self.clone()) } }`,
      cs: `interface IMonster { IMonster Clone(); string Name { get; } int HP { get; } }
class Goblin : IMonster {
  public string Name { get; }; public int HP { get; }
  Goblin(string n, int h) { Name = n; HP = h; }
  public IMonster Clone() => new Goblin(Name, HP);
}
class MonsterRegistry {
  Dictionary<string, IMonster> registry = new();
  public void Register(string key, IMonster proto) { registry[key] = proto; }
  public IMonster Spawn(string key) => registry[key].Clone();
}`,
      kotlin: `interface Monster { fun clone(): Monster; val name: String; val hp: Int }
data class Goblin(override val name: String, override val hp: Int) : Monster {
  override fun clone() = copy()
}
class MonsterRegistry {
  private val registry = mutableMapOf<String, Monster>()
  fun register(key: String, proto: Monster) { registry[key] = proto }
  fun spawn(key: String) = registry[key]!!.clone()
}`,
      swift: `protocol Monster: AnyObject { func clone() -> Monster; var name: String { get }; var hp: Int { get } }
class Goblin: Monster {
  var name: String; var hp: Int
  init(_ n: String, _ h: Int) { name = n; hp = h }
  func clone() -> Monster { Goblin(name, hp) }
}
class MonsterRegistry {
  var registry: [String: Monster] = [:]
  func register(_ key: String, _ proto: Monster) { registry[key] = proto }
  func spawn(_ key: String) -> Monster { registry[key]!.clone() }
}`,
      rb: `class Goblin
  attr_reader :name, :hp
  def initialize(name, hp) = (@name = name; @hp = hp)
  def clone = Goblin.new(@name, @hp)
end
class MonsterRegistry
  def initialize = @registry = {}
  def register(key, proto) = @registry[key] = proto
  def spawn(key) = @registry[key].clone
end`,
      php: `interface Monster { public function clone(): static; public function getName(): string; }
class Goblin implements Monster {
  public function __construct(private string $name, private int $hp) {}
  public function clone(): static { return new static($this->name, $this->hp); }
  public function getName(): string { return $this->name; }
}
class MonsterRegistry {
  private array $registry = [];
  public function register(string $key, Monster $proto): void { $this->registry[$key] = $proto; }
  public function spawn(string $key): Monster { return $this->registry[$key]->clone(); }
}`,
    },
    order: 236,
    status: 'published',
  },

  {
    slug: 'builder-query-b2',
    title: 'SQL Query Builder',
    mode: 'identify',
    difficulty: 'medium',
    stem: 'A `QueryBuilder` class has methods `select()`, `from()`, `where()`, `orderBy()`, `limit()` — each returning `this`. Construction ends with `build()` which returns the final SQL string. What pattern is this?',
    answer: 'Builder',
    choices: ['Builder', 'Fluent Interface', 'Factory Method', 'Template Method'],
    explanation: 'Builder separates the construction of a complex object from its representation, using a step-by-step approach. The fluent interface (method chaining via `return this`) is a common implementation style for Builder — not a separate pattern. The key indicators: (1) construction is step-by-step, (2) each step is optional and can be called in any order, (3) `build()` assembles the final product. A query string is complex to assemble correctly (proper SQL syntax, ordering of clauses) — Builder handles this without requiring all parameters upfront.',
    codeSnippets: {
      ts: `class QueryBuilder {
  private parts: Record<string, string> = {}
  select(cols: string): this { this.parts.select = cols; return this }
  from(table: string): this { this.parts.from = table; return this }
  where(cond: string): this { this.parts.where = cond; return this }
  orderBy(col: string): this { this.parts.order = col; return this }
  limit(n: number): this { this.parts.limit = String(n); return this }
  build(): string {
    return 'SELECT ' + (this.parts.select ?? '*')
      + ' FROM ' + this.parts.from
      + (this.parts.where ? ' WHERE ' + this.parts.where : '')
      + (this.parts.order ? ' ORDER BY ' + this.parts.order : '')
      + (this.parts.limit ? ' LIMIT ' + this.parts.limit : '')
  }
}
const sql = new QueryBuilder().select('id, name').from('users').where('age > 18').limit(10).build()`,
      js: `class QueryBuilder {
  constructor() { this.parts = {} }
  select(cols) { this.parts.select = cols; return this }
  from(table) { this.parts.from = table; return this }
  where(cond) { this.parts.where = cond; return this }
  limit(n) { this.parts.limit = n; return this }
  build() {
    return 'SELECT ' + (this.parts.select || '*') + ' FROM ' + this.parts.from
      + (this.parts.where ? ' WHERE ' + this.parts.where : '')
      + (this.parts.limit ? ' LIMIT ' + this.parts.limit : '')
  }
}`,
      java: `class QueryBuilder {
  private String select = "*", from, where, order; private Integer limit;
  public QueryBuilder select(String cols) { select = cols; return this; }
  public QueryBuilder from(String table) { from = table; return this; }
  public QueryBuilder where(String cond) { where = cond; return this; }
  public QueryBuilder orderBy(String col) { order = col; return this; }
  public QueryBuilder limit(int n) { limit = n; return this; }
  public String build() {
    StringBuilder sb = new StringBuilder("SELECT " + select + " FROM " + from);
    if (where != null) sb.append(" WHERE " + where);
    if (order != null) sb.append(" ORDER BY " + order);
    if (limit != null) sb.append(" LIMIT " + limit);
    return sb.toString();
  }
}`,
      py: `class QueryBuilder:
    def __init__(self): self._select = '*'; self._from = ''; self._where = None; self._limit = None
    def select(self, cols): self._select = cols; return self
    def from_table(self, table): self._from = table; return self
    def where(self, cond): self._where = cond; return self
    def limit(self, n): self._limit = n; return self
    def build(self):
        q = f'SELECT {self._select} FROM {self._from}'
        if self._where: q += f' WHERE {self._where}'
        if self._limit: q += f' LIMIT {self._limit}'
        return q`,
      cpp: `class QueryBuilder {
  std::string sel = "*", frm, whr, ord; int lim = -1;
public:
  QueryBuilder& select(const std::string& s) { sel = s; return *this; }
  QueryBuilder& from(const std::string& f) { frm = f; return *this; }
  QueryBuilder& where(const std::string& w) { whr = w; return *this; }
  QueryBuilder& limit(int n) { lim = n; return *this; }
  std::string build() const {
    std::string q = "SELECT " + sel + " FROM " + frm;
    if (!whr.empty()) q += " WHERE " + whr;
    if (lim > 0) q += " LIMIT " + std::to_string(lim);
    return q;
  }
};`,
      go: `type QueryBuilder struct { sel, frm, whr string; lim int }
func (q *QueryBuilder) Select(cols string) *QueryBuilder { q.sel = cols; return q }
func (q *QueryBuilder) From(table string) *QueryBuilder { q.frm = table; return q }
func (q *QueryBuilder) Where(cond string) *QueryBuilder { q.whr = cond; return q }
func (q *QueryBuilder) Limit(n int) *QueryBuilder { q.lim = n; return q }
func (q *QueryBuilder) Build() string {
  sql := "SELECT " + q.sel + " FROM " + q.frm
  if q.whr != "" { sql += " WHERE " + q.whr }
  if q.lim > 0 { sql += " LIMIT " + fmt.Sprint(q.lim) }
  return sql
}`,
      rust: `#[derive(Default)]
struct QueryBuilder { select: String, from: String, where_: Option<String>, limit: Option<u32> }
impl QueryBuilder {
  fn select(mut self, cols: &str) -> Self { self.select = cols.into(); self }
  fn from(mut self, table: &str) -> Self { self.from = table.into(); self }
  fn where_(mut self, cond: &str) -> Self { self.where_ = Some(cond.into()); self }
  fn limit(mut self, n: u32) -> Self { self.limit = Some(n); self }
  fn build(self) -> String {
    let mut q = format!("SELECT {} FROM {}", self.select, self.from);
    if let Some(w) = self.where_ { q += &format!(" WHERE {}", w); }
    if let Some(l) = self.limit { q += &format!(" LIMIT {}", l); }
    q
  }
}`,
      cs: `class QueryBuilder {
  string select = "*", from, where; int? limit;
  public QueryBuilder Select(string cols) { select = cols; return this; }
  public QueryBuilder From(string table) { from = table; return this; }
  public QueryBuilder Where(string cond) { where = cond; return this; }
  public QueryBuilder Limit(int n) { limit = n; return this; }
  public string Build() {
    var sb = new System.Text.StringBuilder("SELECT " + select + " FROM " + from);
    if (where != null) sb.Append(" WHERE " + where);
    if (limit.HasValue) sb.Append(" LIMIT " + limit);
    return sb.ToString();
  }
}`,
      kotlin: `class QueryBuilder {
  private var select = "*"; private var from = ""; private var where: String? = null; private var limit: Int? = null
  fun select(cols: String): QueryBuilder { select = cols; return this }
  fun from(table: String): QueryBuilder { from = table; return this }
  fun where(cond: String): QueryBuilder { where = cond; return this }
  fun limit(n: Int): QueryBuilder { limit = n; return this }
  fun build(): String {
    var q = "SELECT $select FROM $from"
    where?.let { q += " WHERE $it" }
    limit?.let { q += " LIMIT $it" }
    return q
  }
}`,
      swift: `class QueryBuilder {
  var sel = "*"; var frm = ""; var whr: String?; var lim: Int?
  func select(_ cols: String) -> Self { sel = cols; return self }
  func from(_ table: String) -> Self { frm = table; return self }
  func condition(_ cond: String) -> Self { whr = cond; return self }
  func limit(_ n: Int) -> Self { lim = n; return self }
  func build() -> String {
    var q = "SELECT \(sel) FROM \(frm)"
    if let w = whr { q += " WHERE \(w)" }
    if let l = lim { q += " LIMIT \(l)" }
    return q
  }
}`,
      rb: `class QueryBuilder
  def initialize = (@select = '*'; @from = ''; @where = nil; @limit = nil)
  def select(cols) = (@select = cols; self)
  def from(table) = (@from = table; self)
  def where(cond) = (@where = cond; self)
  def limit(n) = (@limit = n; self)
  def build
    q = "SELECT #{@select} FROM #{@from}"
    q += " WHERE #{@where}" if @where
    q += " LIMIT #{@limit}" if @limit
    q
  end
end`,
      php: `class QueryBuilder {
  private string $select = '*', $from = '', $where = '', $limit = '';
  public function select(string $cols): static { $this->select = $cols; return $this; }
  public function from(string $table): static { $this->from = $table; return $this; }
  public function where(string $cond): static { $this->where = $cond; return $this; }
  public function limit(int $n): static { $this->limit = (string)$n; return $this; }
  public function build(): string {
    $q = "SELECT {$this->select} FROM {$this->from}";
    if ($this->where) $q .= " WHERE {$this->where}";
    if ($this->limit) $q .= " LIMIT {$this->limit}";
    return $q;
  }
}`,
    },
    order: 237,
    status: 'published',
  },

  {
    slug: 'explain-composite-vs-decorator-b2',
    title: 'Why Composite and Decorator Look Similar',
    mode: 'explain',
    difficulty: 'medium',
    stem: 'Both Composite and Decorator use a component interface and wrap another component. Explain the key structural difference that distinguishes them, and why it matters.',
    answer: 'Composite holds a list of children (1-to-many, tree); Decorator holds exactly one inner component (1-to-1, chain)',
    choices: [
      'Composite holds a list of children (1-to-many, tree); Decorator holds exactly one inner component (1-to-1, chain)',
      'Composite adds behavior; Decorator represents tree structure',
      'They are structurally identical — only the naming differs',
      'Decorator supports undo; Composite does not',
    ],
    explanation: 'The pivotal structural difference: Composite stores MULTIPLE children (`List<Component>`) and delegates to all of them — it represents a TREE (folder/file, organization chart). Decorator stores EXACTLY ONE inner component and adds behaviour to it — it represents a CHAIN of wrappers. This one difference drives everything: Composite\'s `operation()` fans out to N children; Decorator\'s `operation()` modifies behavior for one. Another test: can you call `add(child)` or `remove(child)`? If yes, it\'s Composite. If not, Decorator. GOF confirms: Composite\'s purpose is STRUCTURE (part-whole hierarchies); Decorator\'s purpose is BEHAVIOR (adding responsibilities without subclassing).',
    codeSnippets: {
      ts: `interface Component { operation(): string }
// Composite: holds MULTIPLE children (tree structure)
class Composite implements Component {
  private children: Component[] = []  // ← list of children
  add(c: Component) { this.children.push(c) }
  operation(): string { return this.children.map(c => c.operation()).join('+') }  // fans out to all
}
// Decorator: holds EXACTLY ONE inner component (wrapping chain)
class Decorator implements Component {
  constructor(private inner: Component) {}  // ← single component
  operation(): string { return '[' + this.inner.operation() + ']' }  // adds behavior to one
}`,
      js: `// Composite: children list (tree)
class Composite {
  constructor() { this.children = [] }  // many children
  add(c) { this.children.push(c) }
  operation() { return this.children.map(c => c.operation()).join('+') }
}
// Decorator: single inner (chain)
class Decorator {
  constructor(inner) { this.inner = inner }  // one component
  operation() { return '[' + this.inner.operation() + ']' }
}`,
      java: `interface Component { String operation(); }
// Composite: list of children
class Composite implements Component {
  private List<Component> children = new ArrayList<>();  // 1-to-MANY
  public void add(Component c) { children.add(c); }
  public String operation() { return children.stream().map(Component::operation).collect(Collectors.joining("+")); }
}
// Decorator: single wrapped component
class Decorator implements Component {
  protected Component inner;  // 1-to-ONE
  Decorator(Component c) { inner = c; }
  public String operation() { return "[" + inner.operation() + "]"; }
}`,
      py: `class Composite:
    def __init__(self): self.children = []  # list = tree structure
    def add(self, c): self.children.append(c)
    def operation(self): return '+'.join(c.operation() for c in self.children)

class Decorator:
    def __init__(self, inner): self.inner = inner  # single = chain
    def operation(self): return '[' + self.inner.operation() + ']'`,
      cpp: `struct Component { virtual std::string operation() = 0; };
// Composite: vector of children
struct Composite : Component {
  std::vector<Component*> children;  // 1:N
  void add(Component* c) { children.push_back(c); }
  std::string operation() override {
    std::string r; for(auto c : children) r += c->operation(); return r;
  }
};
// Decorator: single inner
struct Decorator : Component {
  Component* inner;  // 1:1
  Decorator(Component* c): inner(c) {}
  std::string operation() override { return "[" + inner->operation() + "]"; }
};`,
      go: `type Component interface { Operation() string }
// Composite: slice of children (tree)
type Composite struct { children []Component }
func (c *Composite) Add(child Component) { c.children = append(c.children, child) }
func (c *Composite) Operation() string {
  results := make([]string, len(c.children))
  for i, ch := range c.children { results[i] = ch.Operation() }
  return strings.Join(results, "+")
}
// Decorator: one inner (chain)
type Decorator struct { inner Component }
func (d *Decorator) Operation() string { return "[" + d.inner.Operation() + "]" }`,
      rust: `trait Component { fn operation(&self) -> String; }
// Composite: Vec of children
struct Composite { children: Vec<Box<dyn Component>> }
impl Component for Composite {
  fn operation(&self) -> String { self.children.iter().map(|c| c.operation()).collect::<Vec<_>>().join("+") }
}
// Decorator: one inner
struct Decorator { inner: Box<dyn Component> }
impl Component for Decorator {
  fn operation(&self) -> String { format!("[{}]", self.inner.operation()) }
}`,
      cs: `interface IComponent { string Operation(); }
// Composite: list of children
class Composite : IComponent {
  private List<IComponent> children = new();  // 1:N
  public void Add(IComponent c) { children.Add(c); }
  public string Operation() => string.Join("+", children.Select(c => c.Operation()));
}
// Decorator: single component
class Decorator : IComponent {
  protected IComponent inner;
  public Decorator(IComponent c) { inner = c; }
  public string Operation() => "[" + inner.Operation() + "]";
}`,
      kotlin: `interface Component { fun operation(): String }
// Composite: list of children (tree)
class Composite : Component {
  private val children = mutableListOf<Component>()
  fun add(c: Component) { children.add(c) }
  override fun operation() = children.joinToString("+") { it.operation() }
}
// Decorator: single component (chain)
class Decorator(private val inner: Component) : Component {
  override fun operation() = "[" + inner.operation() + "]"
}`,
      swift: `protocol Component { func operation() -> String }
// Composite: children array (tree)
class Composite: Component {
  var children: [Component] = []
  func add(_ c: Component) { children.append(c) }
  func operation() -> String { children.map { $0.operation() }.joined(separator: "+") }
}
// Decorator: one inner (chain)
class Decorator: Component {
  let inner: Component
  init(_ c: Component) { inner = c }
  func operation() -> String { "[\(inner.operation())]" }
}`,
      rb: `# Composite: holds many children (tree)
class Composite
  def initialize = @children = []
  def add(c) = @children << c
  def operation = @children.map(&:operation).join('+')
end
# Decorator: wraps one component (chain)
class Decorator
  def initialize(inner) = @inner = inner
  def operation = "[#{@inner.operation}]"
end`,
      php: `interface Component { public function operation(): string; }
// Composite: children list
class Composite implements Component {
  private array $children = [];
  public function add(Component $c): void { $this->children[] = $c; }
  public function operation(): string { return implode('+', array_map(fn($c) => $c->operation(), $this->children)); }
}
// Decorator: single inner
class Decorator implements Component {
  public function __construct(private Component $inner) {}
  public function operation(): string { return '[' . $this->inner->operation() . ']'; }
}`,
    },
    order: 238,
    status: 'published',
  },

  {
    slug: 'suggest-rate-limiter-b2',
    title: 'Rate Limiter Design',
    mode: 'suggest',
    difficulty: 'hard',
    stem: 'You need to add rate limiting to an existing `APIClient` (max N requests per minute). Rate limiting should be invisible to callers — they should still use the `APIClient` interface unchanged. Multiple rate-limiting strategies (token bucket, sliding window) should be swappable. Which pattern(s) apply?',
    answer: 'Proxy (transparent wrapping) + Strategy (swappable rate-limiting algorithm)',
    choices: [
      'Proxy (transparent wrapping) + Strategy (swappable rate-limiting algorithm)',
      'Decorator + Template Method',
      'Facade + Chain of Responsibility',
      'Adapter + Observer',
    ],
    problemContext: 'APIClient with transparent rate limiting. Multiple algorithms: token bucket, sliding window. Callers must not change.',
    keyPatterns: ['proxy', 'strategy', 'transparent', 'rate limit', 'algorithm', 'swappable', 'token bucket', 'sliding window'],
    explanation: 'Proxy (transparent): a `RateLimitedAPIClient` implements the same `APIClient` interface and wraps the real client. Callers see no difference. The proxy intercepts calls and enforces limits. Strategy (swappable algorithm): the proxy holds a `RateLimitStrategy` (token bucket, sliding window, fixed window). Swapping the strategy changes behavior without modifying the proxy or callers. This separation of concerns (Proxy handles transparency + delegation; Strategy handles the algorithm) is the key to extensibility. If algorithms never need to change, a simpler approach (just a Proxy with hardcoded logic) suffices — but Strategy future-proofs the design.',
    codeSnippets: {
      ts: `// Strategy: swappable rate-limiting algorithm
interface RateLimitStrategy { allow(): boolean }
class TokenBucketStrategy implements RateLimitStrategy {
  private tokens: number; private lastRefill = Date.now()
  constructor(private capacity: number, private refillRate: number) { this.tokens = capacity }
  allow(): boolean {
    const now = Date.now(); this.tokens = Math.min(this.capacity, this.tokens + (now - this.lastRefill) * this.refillRate / 1000); this.lastRefill = now
    if (this.tokens >= 1) { this.tokens--; return true }; return false
  }
}
class SlidingWindowStrategy implements RateLimitStrategy {
  private timestamps: number[] = []
  constructor(private maxRequests: number, private windowMs: number) {}
  allow(): boolean {
    const now = Date.now(); this.timestamps = this.timestamps.filter(t => now - t < this.windowMs)
    if (this.timestamps.length < this.maxRequests) { this.timestamps.push(now); return true }; return false
  }
}
// Proxy: transparent
interface APIClient { request(url: string): Promise<Response> }
class RateLimitedClient implements APIClient {
  constructor(private real: APIClient, private limiter: RateLimitStrategy) {}
  async request(url: string): Promise<Response> {
    if (!this.limiter.allow()) throw new Error('Rate limit exceeded')
    return this.real.request(url)
  }
}`,
      js: `class TokenBucket {
  constructor(capacity, rate) { this.capacity = capacity; this.tokens = capacity; this.rate = rate; this.last = Date.now() }
  allow() {
    const now = Date.now(); this.tokens = Math.min(this.capacity, this.tokens + (now - this.last) * this.rate / 1000); this.last = now
    if (this.tokens >= 1) { this.tokens--; return true }; return false
  }
}
class RateLimitedClient {
  constructor(real, limiter) { this.real = real; this.limiter = limiter }
  async request(url) {
    if (!this.limiter.allow()) throw new Error('Rate limited')
    return this.real.request(url)
  }
}`,
      java: `interface RateLimitStrategy { boolean allow(); }
class TokenBucketStrategy implements RateLimitStrategy {
  private double tokens; private double capacity; private double rate; private long last = System.currentTimeMillis();
  TokenBucketStrategy(double cap, double rate) { tokens = capacity = cap; this.rate = rate; }
  public synchronized boolean allow() {
    long now = System.currentTimeMillis(); tokens = Math.min(capacity, tokens + (now - last) * rate / 1000); last = now;
    if (tokens >= 1) { tokens--; return true; } return false;
  }
}
interface APIClient { Response request(String url) throws Exception; }
class RateLimitedClient implements APIClient {
  private APIClient real; private RateLimitStrategy limiter;
  public RateLimitedClient(APIClient r, RateLimitStrategy l) { real = r; limiter = l; }
  public Response request(String url) throws Exception {
    if (!limiter.allow()) throw new RuntimeException("Rate limited");
    return real.request(url);
  }
}`,
      py: `import time
class TokenBucket:
    def __init__(self, capacity, rate):
        self.capacity = capacity; self.tokens = capacity; self.rate = rate; self.last = time.time()
    def allow(self):
        now = time.time(); self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate); self.last = now
        if self.tokens >= 1: self.tokens -= 1; return True
        return False

class RateLimitedClient:
    def __init__(self, real, limiter): self.real = real; self.limiter = limiter
    def request(self, url):
        if not self.limiter.allow(): raise Exception('Rate limited')
        return self.real.request(url)`,
      cpp: `struct RateLimitStrategy { virtual bool allow() = 0; };
class TokenBucket : public RateLimitStrategy {
  double tokens, capacity, rate; long long last;
public:
  TokenBucket(double cap, double r): tokens(cap), capacity(cap), rate(r), last(0) {}
  bool allow() override {
    auto now = std::chrono::steady_clock::now().time_since_epoch().count();
    tokens = std::min(capacity, tokens + (now - last) * rate / 1e9); last = now;
    if (tokens >= 1) { tokens--; return true; } return false;
  }
};
struct APIClient { virtual Response request(const std::string& url) = 0; };
struct RateLimitedClient : APIClient {
  APIClient* real; RateLimitStrategy* limiter;
  Response request(const std::string& url) override {
    if (!limiter->allow()) throw std::runtime_error("Rate limited");
    return real->request(url);
  }
};`,
      go: `type RateLimitStrategy interface { Allow() bool }
type TokenBucket struct { tokens, capacity, rate float64; last time.Time; mu sync.Mutex }
func (t *TokenBucket) Allow() bool {
  t.mu.Lock(); defer t.mu.Unlock()
  now := time.Now(); t.tokens = math.Min(t.capacity, t.tokens+now.Sub(t.last).Seconds()*t.rate); t.last = now
  if t.tokens >= 1 { t.tokens--; return true }; return false
}
type APIClient interface { Request(url string) (*Response, error) }
type RateLimitedClient struct { real APIClient; limiter RateLimitStrategy }
func (c *RateLimitedClient) Request(url string) (*Response, error) {
  if !c.limiter.Allow() { return nil, errors.New("rate limited") }
  return c.real.Request(url)
}`,
      rust: `trait RateLimitStrategy { fn allow(&mut self) -> bool; }
trait APIClient { fn request(&self, url: &str) -> Result<Response, Box<dyn std::error::Error>>; }
struct RateLimitedClient<C: APIClient, S: RateLimitStrategy> { real: C, limiter: S }
impl<C: APIClient, S: RateLimitStrategy> APIClient for RateLimitedClient<C, S> {
  fn request(&self, url: &str) -> Result<Response, Box<dyn std::error::Error>> {
    // limiter.allow() check (needs mut, use RefCell in practice)
    self.real.request(url)
  }
}`,
      cs: `interface IRateLimitStrategy { bool Allow(); }
class TokenBucketStrategy : IRateLimitStrategy {
  private double tokens, capacity, rate; private DateTime last = DateTime.UtcNow;
  public TokenBucketStrategy(double cap, double rate) { tokens = capacity = cap; this.rate = rate; }
  public bool Allow() {
    var now = DateTime.UtcNow; tokens = Math.Min(capacity, tokens + (now - last).TotalSeconds * rate); last = now;
    if (tokens >= 1) { tokens--; return true; } return false;
  }
}
interface IAPIClient { Task<Response> Request(string url); }
class RateLimitedClient : IAPIClient {
  private readonly IAPIClient real; private readonly IRateLimitStrategy limiter;
  public RateLimitedClient(IAPIClient r, IRateLimitStrategy l) { real = r; limiter = l; }
  public async Task<Response> Request(string url) {
    if (!limiter.Allow()) throw new InvalidOperationException("Rate limited");
    return await real.Request(url);
  }
}`,
      kotlin: `interface RateLimitStrategy { fun allow(): Boolean }
class TokenBucketStrategy(private val capacity: Double, private val rate: Double) : RateLimitStrategy {
  private var tokens = capacity; private var last = System.currentTimeMillis()
  @Synchronized override fun allow(): Boolean {
    val now = System.currentTimeMillis(); tokens = minOf(capacity, tokens + (now - last) * rate / 1000); last = now
    return if (tokens >= 1) { tokens--; true } else false
  }
}
interface APIClient { suspend fun request(url: String): Response }
class RateLimitedClient(private val real: APIClient, private val limiter: RateLimitStrategy) : APIClient {
  override suspend fun request(url: String): Response {
    if (!limiter.allow()) throw RuntimeException("Rate limited")
    return real.request(url)
  }
}`,
      swift: `protocol RateLimitStrategy { mutating func allow() -> Bool }
struct TokenBucket: RateLimitStrategy {
  var tokens: Double; let capacity: Double; let rate: Double; var last = Date()
  init(cap: Double, rate: Double) { tokens = cap; capacity = cap; self.rate = rate }
  mutating func allow() -> Bool {
    let now = Date(); tokens = min(capacity, tokens + now.timeIntervalSince(last) * rate); last = now
    if tokens >= 1 { tokens -= 1; return true }; return false
  }
}
protocol APIClient { func request(url: String) async throws -> Response }
class RateLimitedClient: APIClient {
  let real: APIClient; var limiter: RateLimitStrategy
  init(_ r: APIClient, _ l: RateLimitStrategy) { real = r; limiter = l }
  func request(url: String) async throws -> Response {
    guard limiter.allow() else { throw URLError(.networkConnectionLost) }
    return try await real.request(url: url)
  }
}`,
      rb: `class TokenBucket
  def initialize(capacity, rate) = (@capacity = capacity; @tokens = capacity; @rate = rate; @last = Time.now)
  def allow?
    now = Time.now; @tokens = [@capacity, @tokens + (now - @last) * @rate].min; @last = now
    return false unless @tokens >= 1
    @tokens -= 1; true
  end
end
class RateLimitedClient
  def initialize(real, limiter) = (@real = real; @limiter = limiter)
  def request(url)
    raise 'Rate limited' unless @limiter.allow?
    @real.request(url)
  end
end`,
      php: `interface RateLimitStrategy { public function allow(): bool; }
class TokenBucket implements RateLimitStrategy {
  private float $tokens; private float $last;
  public function __construct(private float $capacity, private float $rate) {
    $this->tokens = $capacity; $this->last = microtime(true);
  }
  public function allow(): bool {
    $now = microtime(true); $this->tokens = min($this->capacity, $this->tokens + ($now - $this->last) * $this->rate); $this->last = $now;
    if ($this->tokens >= 1) { $this->tokens--; return true; } return false;
  }
}
interface APIClient { public function request(string $url): Response; }
class RateLimitedClient implements APIClient {
  public function __construct(private APIClient $real, private RateLimitStrategy $limiter) {}
  public function request(string $url): Response {
    if (!$this->limiter->allow()) throw new \RuntimeException('Rate limited');
    return $this->real->request($url);
  }
}`,
    },
    order: 239,
    status: 'published',
  },
]

async function main() {
  await connectDB()
  let upserted = 0
  for (const s of SCENARIOS) {
    await DetectiveScenario.findOneAndUpdate(
      { slug: (s as any).slug },
      { $set: s },
      { upsert: true, new: true },
    )
    console.log(`✓ ${(s as any).slug}`)
    upserted++
  }
  console.log(`\nDone — ${upserted} scenarios upserted (batch 2)`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
