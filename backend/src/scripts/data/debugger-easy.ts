import { challenge, type DebuggerSeed } from '../seed-debugger-lib'

export const EASY: DebuggerSeed[] = [
  challenge({
    slug: 'parking-compact-uses-large',
    title: 'Parking Lot — Compact Cars Steal Large Spots',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['parking-lot', 'object-design', 'invariants'],
    order: 1,
    description:
      'Classic parking-lot LLD: compact spots {C1} and large spots {L1}. A compact car must take a compact spot when one is free; a bus needs a large spot. Park a compact car, then a bus, and print each assigned spot.',
    expectedOutput: 'C1\nL1',
    hint: 'Does park() look at the vehicle type before choosing a list of spots?',
    explanation:
      'The lot always pops from the large list, so the compact car takes L1 and the bus finds no large spot. Spot selection is an invariant: vehicle type maps to a compatible spot size. Park compact into compact first; only then consider large.',
    code: {
      py: `class Lot:
    def __init__(self):
        self.compact, self.large = ['C1'], ['L1']
    def park(self, kind):
        if self.large:
            return self.large.pop()
        return 'FULL'
lot = Lot()
print(lot.park('compact'))
print(lot.park('large'))`,
      java: `public class Main {
  static java.util.List<String> compact = new java.util.ArrayList<>(java.util.List.of("C1"));
  static java.util.List<String> large = new java.util.ArrayList<>(java.util.List.of("L1"));
  static String park(String kind) {
    if (!large.isEmpty()) return large.remove(large.size() - 1);
    return "FULL";
  }
  public static void main(String[] args) {
    System.out.println(park("compact"));
    System.out.println(park("large"));
  }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
vector<string> compact={"C1"}, large={"L1"};
string park(string kind) {
  if (!large.empty()) { string s = large.back(); large.pop_back(); return s; }
  return "FULL";
}
int main() {
  cout << park("compact") << endl;
  cout << park("large") << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var compact = new List<string>{"C1"};
var large = new List<string>{"L1"};
string Park(string kind) {
  if (large.Count > 0) { var s = large[large.Count-1]; large.RemoveAt(large.Count-1); return s; }
  return "FULL";
}
Console.WriteLine(Park("compact"));
Console.WriteLine(Park("large"));`,
      go: `package main
import "fmt"
func main() {
  compact := []string{"C1"}
  large := []string{"L1"}
  park := func(kind string) string {
    if len(large) > 0 {
      s := large[len(large)-1]
      large = large[:len(large)-1]
      return s
    }
    return "FULL"
  }
  _ = compact
  fmt.Println(park("compact"))
  fmt.Println(park("large"))
}`,
      rust: `fn park(_kind: &str, _compact: &mut Vec<&str>, large: &mut Vec<&str>) -> String {
  if let Some(s) = large.pop() { return s.to_string(); }
  "FULL".into()
}
fn main() {
  let mut compact = vec!["C1"];
  let mut large = vec!["L1"];
  println!("{}", park("compact", &mut compact, &mut large));
  println!("{}", park("large", &mut compact, &mut large));
}`,
      ts: `const compact = ['C1']
const large = ['L1']
function park(_kind: string) {
  if (large.length) return large.pop()!
  return 'FULL'
}
console.log(park('compact'))
console.log(park('large'))`,
      php: `<?php
class Lot {
  public $compact = ['C1'];
  public $large = ['L1'];
  function park($kind) {
    if (count($this->large)) return array_pop($this->large);
    return 'FULL';
  }
}
$lot = new Lot();
echo $lot->park('compact'), PHP_EOL;
echo $lot->park('large'), PHP_EOL;`,
      rb: `class Lot
  def initialize
    @compact = ['C1']
    @large = ['L1']
  end
  def park(kind)
    return @large.pop unless @large.empty?
    'FULL'
  end
end
lot = Lot.new
puts lot.park('compact')
puts lot.park('large')`,
    },
  }),

  challenge({
    slug: 'vending-dispense-without-coin',
    title: 'Vending Machine — Dispense Skips Payment',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['vending-machine', 'state', 'design-patterns'],
    order: 2,
    description:
      'A vending machine is a state machine: Idle → HasCoin → Sold. Calling dispense() from Idle (no coin inserted) must print WAIT_COIN and stay idle. The machine starts idle; the customer presses dispense immediately.',
    expectedOutput: 'WAIT_COIN',
    hint: 'Which state is allowed to vend? Does dispense() check the current state?',
    explanation:
      'The machine vends from any state, so a customer gets a free item. Each action is legal only in certain states. Idle.dispense() must refuse; only HasCoin.dispense() vends.',
    code: {
      py: `class Machine:
    def __init__(self):
        self.state = 'IDLE'
        self.stock = 1
    def dispense(self):
        self.stock -= 1
        return 'VEND'
m = Machine()
print(m.dispense())`,
      java: `public class Main {
  static String state = "IDLE";
  static int stock = 1;
  static String dispense() {
    stock--;
    return "VEND";
  }
  public static void main(String[] args) {
    System.out.println(dispense());
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string state = "IDLE";
int stock = 1;
string dispense() {
  stock--;
  return "VEND";
}
int main() { cout << dispense() << endl; }`,
      cs: `using System;
string state = "IDLE";
int stock = 1;
string Dispense() {
  stock--;
  return "VEND";
}
Console.WriteLine(Dispense());`,
      go: `package main
import "fmt"
func main() {
  state := "IDLE"
  stock := 1
  dispense := func() string {
    stock--
    return "VEND"
  }
  _ = state
  fmt.Println(dispense())
}`,
      rust: `fn dispense(stock: &mut i32, _state: &str) -> &'static str {
  *stock -= 1;
  "VEND"
}
fn main() {
  let mut stock = 1;
  let state = "IDLE";
  println!("{}", dispense(&mut stock, state));
}`,
      ts: `let state = 'IDLE'
let stock = 1
function dispense() {
  stock--
  return 'VEND'
}
console.log(dispense())`,
      php: `<?php
class Machine {
  public $state = 'IDLE';
  public $stock = 1;
  function dispense() {
    $this->stock--;
    return 'VEND';
  }
}
$m = new Machine();
echo $m->dispense(), PHP_EOL;`,
      rb: `class Machine
  def initialize
    @state = 'IDLE'
    @stock = 1
  end
  def dispense
    @stock -= 1
    'VEND'
  end
end
puts Machine.new.dispense`,
    },
  }),

  challenge({
    slug: 'atm-withdraw-skips-pin',
    title: 'ATM — Withdraw Without PIN',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['atm', 'state', 'security-invariants'],
    order: 3,
    description:
      'ATM session LLD: the machine starts unauthenticated with balance 1000. withdraw(100) before authenticate() must refuse with AUTH_REQUIRED and must not touch the balance. The customer hits withdraw immediately.',
    expectedOutput: 'AUTH_REQUIRED',
    hint: 'Is there an authenticated flag that withdraw() is supposed to consult?',
    explanation:
      'Withdraw deducts 100 and prints 900 even though PIN was never entered. Cash movement is legal only after authenticate(). Guard withdraw with that flag and return AUTH_REQUIRED otherwise.',
    code: {
      py: `class ATM:
    def __init__(self):
        self.auth = False
        self.bal = 1000
    def withdraw(self, amt):
        self.bal -= amt
        return str(self.bal)
print(ATM().withdraw(100))`,
      java: `public class Main {
  static boolean auth = false;
  static int bal = 1000;
  static String withdraw(int amt) {
    bal -= amt;
    return "" + bal;
  }
  public static void main(String[] args) {
    System.out.println(withdraw(100));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
bool auth = false;
int bal = 1000;
string withdraw(int amt) {
  bal -= amt;
  return to_string(bal);
}
int main() { cout << withdraw(100) << endl; }`,
      cs: `using System;
bool auth = false;
int bal = 1000;
string Withdraw(int amt) {
  bal -= amt;
  return "" + bal;
}
Console.WriteLine(Withdraw(100));`,
      go: `package main
import "fmt"
func main() {
  auth := false
  bal := 1000
  withdraw := func(amt int) string {
    bal -= amt
    return fmt.Sprintf("%d", bal)
  }
  _ = auth
  fmt.Println(withdraw(100))
}`,
      rust: `fn withdraw(bal: &mut i32, amt: i32, _auth: bool) -> String {
  *bal -= amt;
  bal.to_string()
}
fn main() {
  let mut bal = 1000;
  let auth = false;
  println!("{}", withdraw(&mut bal, 100, auth));
}`,
      ts: `let auth = false
let bal = 1000
function withdraw(amt: number) {
  bal -= amt
  return '' + bal
}
console.log(withdraw(100))`,
      php: `<?php
class ATM {
  public $auth = false;
  public $bal = 1000;
  function withdraw($amt) {
    $this->bal -= $amt;
    return (string)$this->bal;
  }
}
echo (new ATM())->withdraw(100), PHP_EOL;`,
      rb: `class ATM
  def initialize
    @auth = false
    @bal = 1000
  end
  def withdraw(amt)
    @bal -= amt
    @bal.to_s
  end
end
puts ATM.new.withdraw(100)`,
    },
  }),

  challenge({
    slug: 'library-still-available',
    title: 'Library — Checkout Leaves Book Available',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['library', 'object-design', 'invariants'],
    order: 4,
    description:
      'Library LLD: a Book starts available. After checkout(), isAvailable() must print NO so a second member cannot borrow the same copy. Checkout a book and print availability.',
    expectedOutput: 'NO',
    hint: 'Does checkout() flip the available flag, or is it a no-op?',
    explanation:
      'Checkout never mutates state, so the catalog still reports YES. The invariant is one physical copy → at most one active loan. Set available to false on checkout.',
    code: {
      py: `class Book:
    def __init__(self):
        self.avail = True
    def checkout(self):
        pass
    def is_available(self):
        return 'YES' if self.avail else 'NO'
b = Book()
b.checkout()
print(b.is_available())`,
      java: `public class Main {
  static boolean avail = true;
  static void checkout() { }
  static String isAvailable() { return avail ? "YES" : "NO"; }
  public static void main(String[] args) {
    checkout();
    System.out.println(isAvailable());
  }
}`,
      cpp: `#include <iostream>
using namespace std;
bool avail = true;
void checkout() { }
const char* isAvailable() { return avail ? "YES" : "NO"; }
int main() {
  checkout();
  cout << isAvailable() << endl;
}`,
      cs: `using System;
bool avail = true;
void Checkout() { }
string IsAvailable() { return avail ? "YES" : "NO"; }
Checkout();
Console.WriteLine(IsAvailable());`,
      go: `package main
import "fmt"
func main() {
  avail := true
  checkout := func() {}
  checkout()
  if avail { fmt.Println("YES") } else { fmt.Println("NO") }
}`,
      rust: `fn checkout(_avail: &mut bool) {}
fn main() {
  let mut avail = true;
  checkout(&mut avail);
  if avail { println!("YES"); } else { println!("NO"); }
}`,
      ts: `let avail = true
function checkout() {}
function isAvailable() { return avail ? 'YES' : 'NO' }
checkout()
console.log(isAvailable())`,
      php: `<?php
class Book {
  public $avail = true;
  function checkout() {}
  function isAvailable() { return $this->avail ? 'YES' : 'NO'; }
}
$b = new Book();
$b->checkout();
echo $b->isAvailable(), PHP_EOL;`,
      rb: `class Book
  def initialize
    @avail = true
  end
  def checkout
  end
  def is_available
    @avail ? 'YES' : 'NO'
  end
end
b = Book.new
b.checkout
puts b.is_available`,
    },
  }),

  challenge({
    slug: 'elevator-ignores-request',
    title: 'Elevator — Request Never Moves Cabin',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['elevator', 'state', 'object-design'],
    order: 5,
    description:
      'Elevator LLD: the cabin sits at floor 5. A rider requests floor 8, then step() should move the cabin to the pending target and print the new floor. Simulate one request and one step.',
    expectedOutput: '8',
    hint: 'Does step() move toward the requested floor, or does it clobber cabin state?',
    explanation:
      'step() always resets the cabin to 0, dropping the request. The elevator invariant is: pending request becomes the next floor. Store the target on request() and assign it in step().',
    code: {
      py: `class Elevator:
    def __init__(self):
        self.floor = 5
        self.target = None
    def request(self, f):
        self.target = f
    def step(self):
        self.floor = 0
        return self.floor
e = Elevator()
e.request(8)
print(e.step())`,
      java: `public class Main {
  static int floor = 5;
  static int target = 5;
  static void request(int f) { target = f; }
  static int step() { floor = 0; return floor; }
  public static void main(String[] args) {
    request(8);
    System.out.println(step());
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int floorN = 5;
int target = 5;
void request(int f) { target = f; }
int step() { floorN = 0; return floorN; }
int main() {
  request(8);
  cout << step() << endl;
}`,
      cs: `using System;
int floor = 5;
int target = 5;
void Request(int f) { target = f; }
int Step() { floor = 0; return floor; }
Request(8);
Console.WriteLine(Step());`,
      go: `package main
import "fmt"
func main() {
  floor := 5
  target := 5
  request := func(f int) { target = f }
  step := func() int { floor = 0; return floor }
  request(8)
  _ = target
  fmt.Println(step())
}`,
      rust: `fn request(target: &mut i32, f: i32) { *target = f; }
fn step(floor: &mut i32, _target: i32) -> i32 {
  *floor = 0;
  *floor
}
fn main() {
  let mut floor = 5;
  let mut target = 5;
  request(&mut target, 8);
  println!("{}", step(&mut floor, target));
}`,
      ts: `let floor = 5
let target = 5
function request(f: number) { target = f }
function step() { floor = 0; return floor }
request(8)
console.log(step())`,
      php: `<?php
class Elevator {
  public $floor = 5;
  public $target = 5;
  function request($f) { $this->target = $f; }
  function step() { $this->floor = 0; return $this->floor; }
}
$e = new Elevator();
$e->request(8);
echo $e->step(), PHP_EOL;`,
      rb: `class Elevator
  def initialize
    @floor = 5
    @target = 5
  end
  def request(f)
    @target = f
  end
  def step
    @floor = 0
    @floor
  end
end
e = Elevator.new
e.request(8)
puts e.step`,
    },
  }),

  challenge({
    slug: 'singleton-db-new-every-call',
    title: 'Database Connection — Singleton Always News',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['singleton', 'design-patterns', 'shared-resource'],
    order: 6,
    description:
      'Connection pool LLD: Database.getInstance() must be a singleton. The first connection is id 1. Two back-to-back getInstance() calls must both print 1 (same object), not allocate a second connection.',
    expectedOutput: '1\n1',
    hint: 'Does getInstance() cache the first instance, or does it construct every time?',
    explanation:
      'Each call news a connection, so ids print 1 then 2. Singleton exists to share one expensive resource. Store the first instance and return it on later calls.',
    code: {
      py: `class DB:
    inst = None
    nid = 0
    def __init__(self):
        DB.nid += 1
        self.id = DB.nid
    @staticmethod
    def get_instance():
        return DB()
print(DB.get_instance().id)
print(DB.get_instance().id)`,
      java: `public class Main {
  static int nid = 0;
  static int getInstance() {
    nid++;
    return nid;
  }
  public static void main(String[] args) {
    System.out.println(getInstance());
    System.out.println(getInstance());
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int nid = 0;
int getInstance() {
  nid++;
  return nid;
}
int main() {
  cout << getInstance() << endl;
  cout << getInstance() << endl;
}`,
      cs: `using System;
int nid = 0;
int GetInstance() {
  nid++;
  return nid;
}
Console.WriteLine(GetInstance());
Console.WriteLine(GetInstance());`,
      go: `package main
import "fmt"
func main() {
  nid := 0
  getInstance := func() int {
    nid++
    return nid
  }
  fmt.Println(getInstance())
  fmt.Println(getInstance())
}`,
      rust: `fn get_instance(_cached: &mut Option<i32>, next: &mut i32) -> i32 {
  *next += 1;
  *next
}
fn main() {
  let mut cached = None;
  let mut next = 0;
  println!("{}", get_instance(&mut cached, &mut next));
  println!("{}", get_instance(&mut cached, &mut next));
}`,
      ts: `let nid = 0
let inst: number | null = null
function getInstance() {
  nid++
  return nid
}
console.log(getInstance())
console.log(getInstance())`,
      php: `<?php
class DB {
  public static $inst = null;
  public static $nid = 0;
  public $id;
  function __construct() {
    self::$nid++;
    $this->id = self::$nid;
  }
  static function getInstance() { return new DB(); }
}
echo DB::getInstance()->id, PHP_EOL;
echo DB::getInstance()->id, PHP_EOL;`,
      rb: `class DB
  @@inst = nil
  @@nid = 0
  attr_reader :id
  def initialize
    @@nid += 1
    @id = @@nid
  end
  def self.get_instance
    DB.new
  end
end
puts DB.get_instance.id
puts DB.get_instance.id`,
    },
  }),

  challenge({
    slug: 'factory-sms-builds-email',
    title: 'Notification Factory — SMS Builds Email',
    difficulty: 'easy',
    bugType: 'wrong-algorithm',
    tags: ['factory', 'design-patterns', 'notifications'],
    order: 7,
    description:
      'Notification factory LLD: create(kind) must return the matching product. create("sms").send() must print SMS. The client asks for SMS.',
    expectedOutput: 'SMS',
    hint: 'Does the factory branch on kind, or does it always construct Email?',
    explanation:
      'The factory ignores the kind argument and always returns Email, so send() prints EMAIL. Factory Method exists so the client depends on a product interface, not a concrete notifier. Return the SMS product when kind is sms.',
    code: {
      py: `class Email:
    def send(self):
        return 'EMAIL'
class Sms:
    def send(self):
        return 'SMS'
def create(kind):
    return Email()
print(create('sms').send())`,
      java: `public class Main {
  static class Notifier { String send() { return ""; } }
  static class Email extends Notifier { String send() { return "EMAIL"; } }
  static class Sms extends Notifier { String send() { return "SMS"; } }
  static Notifier create(String kind) { return new Email(); }
  public static void main(String[] args) {
    System.out.println(create("sms").send());
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string create(string kind) {
  return "EMAIL";
}
int main() { cout << create("sms") << endl; }`,
      cs: `using System;
string Create(string kind) {
  return "EMAIL";
}
Console.WriteLine(Create("sms"));`,
      go: `package main
import "fmt"
type Sender interface{ send() string }
type Email struct{}
func (Email) send() string { return "EMAIL" }
type Sms struct{}
func (Sms) send() string { return "SMS" }
func create(kind string) Sender {
  return Email{}
}
func main() { fmt.Println(create("sms").send()) }`,
      rust: `fn create(_kind: &str) -> &'static str {
  "EMAIL"
}
fn main() {
  println!("{}", create("sms"));
}`,
      ts: `class Email { send() { return 'EMAIL' } }
class Sms { send() { return 'SMS' } }
function create(_kind: string) {
  return new Email()
}
console.log(create('sms').send())`,
      php: `<?php
class Email { function send() { return 'EMAIL'; } }
class Sms { function send() { return 'SMS'; } }
function create($kind) { return new Email(); }
echo create('sms')->send(), PHP_EOL;`,
      rb: `class Email
  def send; 'EMAIL'; end
end
class Sms
  def send; 'SMS'; end
end
def create(kind)
  Email.new
end
puts create('sms').send`,
    },
  }),

  challenge({
    slug: 'strategy-premium-wrong-rate',
    title: 'Pricing Strategy — Premium Uses Regular Rate',
    difficulty: 'easy',
    bugType: 'wrong-algorithm',
    tags: ['strategy', 'design-patterns', 'pricing'],
    order: 8,
    description:
      'E-commerce pricing LLD: Regular is 10% off, Premium is 20% off. Quote a Premium customer on base 100. They must pay 80. Print the charged amount as an integer.',
    expectedOutput: '80',
    hint: 'Which percent does the Premium strategy apply — 10 or 20?',
    explanation:
      'PremiumStrategy uses the regular 10% multiplier (90) instead of 20% (80). Strategy exists so each customer tier owns its formula. Premium must compute base * 80 / 100.',
    code: {
      py: `class Premium:
    def price(self, base):
        return base * 90 // 100
print(Premium().price(100))`,
      java: `public class Main {
  static int price(int base) {
    return base * 90 / 100;
  }
  public static void main(String[] args) {
    System.out.println(price(100));
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int price(int base) { return base * 90 / 100; }
int main() { cout << price(100) << endl; }`,
      cs: `using System;
int Price(int baseAmt) { return baseAmt * 90 / 100; }
Console.WriteLine(Price(100));`,
      go: `package main
import "fmt"
func price(base int) int { return base * 90 / 100 }
func main() { fmt.Println(price(100)) }`,
      rust: `fn price(base: i32) -> i32 { base * 90 / 100 }
fn main() { println!("{}", price(100)); }`,
      ts: `function price(base: number) {
  return (base * 90) / 100
}
console.log(price(100))`,
      php: `<?php
class Premium {
  function price($base) { return intdiv($base * 90, 100); }
}
echo (new Premium())->price(100), PHP_EOL;`,
      rb: `class Premium
  def price(base)
    base * 90 / 100
  end
end
puts Premium.new.price(100)`,
    },
  }),

  challenge({
    slug: 'decorator-milk-drops-base',
    title: 'Coffee Decorator — Milk Drops Base Price',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['decorator', 'design-patterns', 'coffee-machine'],
    order: 9,
    description:
      'Coffee-shop decorator LLD: a plain coffee costs 5, milk adds 1. Milk(Coffee()).cost() must print 6 — the wrapped price plus the addon. Print the final cost.',
    expectedOutput: '6',
    hint: 'Does Milk.cost() add to inner.cost(), or does it return only the addon?',
    explanation:
      'Milk returns 1 and drops the wrapped coffee. Decorator must forward to the inner beverage then add its own delta: inner.cost() + 1.',
    code: {
      py: `class Coffee:
    def cost(self):
        return 5
class Milk:
    def __init__(self, inner):
        self.inner = inner
    def cost(self):
        return 1
print(Milk(Coffee()).cost())`,
      java: `public class Main {
  static class Coffee { int cost() { return 5; } }
  static class Milk {
    Coffee inner;
    Milk(Coffee c) { inner = c; }
    int cost() { return 1; }
  }
  public static void main(String[] args) {
    System.out.println(new Milk(new Coffee()).cost());
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int coffeeCost() { return 5; }
int milkCost() { return 1; }
int main() { cout << milkCost() << endl; }`,
      cs: `using System;
int CoffeeCost() { return 5; }
int MilkCost() { return 1; }
Console.WriteLine(MilkCost());`,
      go: `package main
import "fmt"
func coffeeCost() int { return 5 }
func milkCost() int { return 1 }
func main() { fmt.Println(milkCost()) }`,
      rust: `fn coffee_cost() -> i32 { 5 }
fn milk_cost() -> i32 { 1 }
fn main() { println!("{}", milk_cost()); }`,
      ts: `class Coffee { cost() { return 5 } }
class Milk {
  inner: Coffee
  constructor(inner: Coffee) { this.inner = inner }
  cost() { return 1 }
}
console.log(new Milk(new Coffee()).cost())`,
      php: `<?php
class Coffee { function cost() { return 5; } }
class Milk {
  public $inner;
  function __construct($inner) { $this->inner = $inner; }
  function cost() { return 1; }
}
echo (new Milk(new Coffee()))->cost(), PHP_EOL;`,
      rb: `class Coffee
  def cost; 5; end
end
class Milk
  def initialize(inner)
    @inner = inner
  end
  def cost
    1
  end
end
puts Milk.new(Coffee.new).cost`,
    },
  }),

  challenge({
    slug: 'adapter-cents-as-dollars',
    title: 'Payment Adapter — Cents Passed as Dollars',
    difficulty: 'easy',
    bugType: 'wrong-algorithm',
    tags: ['adapter', 'design-patterns', 'payments'],
    order: 10,
    description:
      'Payment-gateway adapter LLD: the app speaks cents, the SDK speaks dollars. adapter.charge(500) must call the SDK with 5. Print the dollar amount the SDK receives.',
    expectedOutput: '5',
    hint: 'Did you convert cents to dollars before calling the third-party SDK?',
    explanation:
      'The adapter forwards 500 cents as if they were dollars, overcharging 100x. Adapter exists to translate the app model to the SDK model: divide by 100.',
    code: {
      py: `def sdk_charge(dollars):
    print(dollars)
def adapter_charge(cents):
    sdk_charge(cents)
adapter_charge(500)`,
      java: `public class Main {
  static void sdkCharge(int dollars) { System.out.println(dollars); }
  static void adapterCharge(int cents) { sdkCharge(cents); }
  public static void main(String[] args) { adapterCharge(500); }
}`,
      cpp: `#include <iostream>
using namespace std;
void sdkCharge(int dollars) { cout << dollars << endl; }
void adapterCharge(int cents) { sdkCharge(cents); }
int main() { adapterCharge(500); }`,
      cs: `using System;
void SdkCharge(int dollars) { Console.WriteLine(dollars); }
void AdapterCharge(int cents) { SdkCharge(cents); }
AdapterCharge(500);`,
      go: `package main
import "fmt"
func sdkCharge(dollars int) { fmt.Println(dollars) }
func adapterCharge(cents int) { sdkCharge(cents) }
func main() { adapterCharge(500) }`,
      rust: `fn sdk_charge(dollars: i32) { println!("{}", dollars); }
fn adapter_charge(cents: i32) { sdk_charge(cents); }
fn main() { adapter_charge(500); }`,
      ts: `function sdkCharge(dollars: number) { console.log(dollars) }
function adapterCharge(cents: number) { sdkCharge(cents) }
adapterCharge(500)`,
      php: `<?php
function sdkCharge($dollars) { echo $dollars, PHP_EOL; }
function adapterCharge($cents) { sdkCharge($cents); }
adapterCharge(500);`,
      rb: `def sdk_charge(dollars)
  puts dollars
end
def adapter_charge(cents)
  sdk_charge(cents)
end
adapter_charge(500)`,
    },
  }),

  challenge({
    slug: 'builder-skips-email',
    title: 'User Builder — Email Setter is a No-op',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['builder', 'design-patterns', 'user-profile'],
    order: 11,
    description:
      'User-profile builder LLD: UserBuilder.email("a@x.com").build() must produce a user whose email prints a@x.com. The email setter currently leaves the field at BLANK.',
    expectedOutput: 'a@x.com',
    hint: 'Does email() actually write the field before returning this?',
    explanation:
      'The fluent setter returns this without assigning email, so build() prints BLANK. Builder setters must mutate the product (or the builder buffer) then return self for chaining.',
    code: {
      py: `class User:
    def __init__(self):
        self.email = 'BLANK'
class Builder:
    def __init__(self):
        self.u = User()
    def email(self, e):
        return self
    def build(self):
        return self.u
print(Builder().email('a@x.com').build().email)`,
      java: `public class Main {
  static String email = "BLANK";
  static void emailSet(String e) { }
  public static void main(String[] args) {
    emailSet("a@x.com");
    System.out.println(email);
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string email = "BLANK";
void emailSet(string e) { }
int main() {
  emailSet("a@x.com");
  cout << email << endl;
}`,
      cs: `using System;
string email = "BLANK";
void EmailSet(string e) { }
EmailSet("a@x.com");
Console.WriteLine(email);`,
      go: `package main
import "fmt"
func main() {
  email := "BLANK"
  emailSet := func(e string) {}
  emailSet("a@x.com")
  fmt.Println(email)
}`,
      rust: `fn email_set(_buf: &mut String, _e: &str) {}
fn main() {
  let mut email = String::from("BLANK");
  email_set(&mut email, "a@x.com");
  println!("{}", email);
}`,
      ts: `class User { email = 'BLANK' }
class Builder {
  u = new User()
  email(_e: string) { return this }
  build() { return this.u }
}
console.log(new Builder().email('a@x.com').build().email)`,
      php: `<?php
class User { public $email = 'BLANK'; }
class Builder {
  public $u;
  function __construct() { $this->u = new User(); }
  function email($e) { return $this; }
  function build() { return $this->u; }
}
echo (new Builder())->email('a@x.com')->build()->email, PHP_EOL;`,
      rb: `class User
  attr_accessor :email
  def initialize
    @email = 'BLANK'
  end
end
class Builder
  def initialize
    @u = User.new
  end
  def email(e)
    self
  end
  def build
    @u
  end
end
puts Builder.new.email('a@x.com').build.email`,
    },
  }),

  challenge({
    slug: 'command-undo-does-nothing',
    title: 'Light Command — Undo of TurnOn is No-op',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['command', 'design-patterns', 'undo'],
    order: 12,
    description:
      'Home-automation command LLD: the light starts OFF. Execute TurnOn, then undo. Undo of TurnOn must restore OFF. Print ON or OFF after the undo.',
    expectedOutput: 'OFF',
    hint: 'What should TurnOn.undo() do to the receiver?',
    explanation:
      'TurnOn.execute() flips the light on, but undo() is empty, so the light stays ON. Command undo is the inverse operation on the same receiver: TurnOn.undo() must turn the light off.',
    code: {
      py: `class Light:
    def __init__(self):
        self.on = False
class TurnOn:
    def __init__(self, light):
        self.light = light
    def execute(self):
        self.light.on = True
    def undo(self):
        pass
light = Light()
cmd = TurnOn(light)
cmd.execute()
cmd.undo()
print('ON' if light.on else 'OFF')`,
      java: `public class Main {
  static boolean on = false;
  static void execute() { on = true; }
  static void undo() { }
  public static void main(String[] args) {
    execute();
    undo();
    System.out.println(on ? "ON" : "OFF");
  }
}`,
      cpp: `#include <iostream>
using namespace std;
bool on = false;
void execute() { on = true; }
void undo() { }
int main() {
  execute();
  undo();
  cout << (on ? "ON" : "OFF") << endl;
}`,
      cs: `using System;
bool on = false;
void Execute() { on = true; }
void Undo() { }
Execute();
Undo();
Console.WriteLine(on ? "ON" : "OFF");`,
      go: `package main
import "fmt"
func main() {
  on := false
  execute := func() { on = true }
  undo := func() {}
  execute()
  undo()
  if on { fmt.Println("ON") } else { fmt.Println("OFF") }
}`,
      rust: `fn execute(on: &mut bool) { *on = true; }
fn undo(_on: &mut bool) {}
fn main() {
  let mut on = false;
  execute(&mut on);
  undo(&mut on);
  if on { println!("ON"); } else { println!("OFF"); }
}`,
      ts: `let on = false
function execute() { on = true }
function undo() {}
execute()
undo()
console.log(on ? 'ON' : 'OFF')`,
      php: `<?php
class Light { public $on = false; }
class TurnOn {
  public $light;
  function __construct($light) { $this->light = $light; }
  function execute() { $this->light->on = true; }
  function undo() {}
}
$light = new Light();
$cmd = new TurnOn($light);
$cmd->execute();
$cmd->undo();
echo $light->on ? 'ON' : 'OFF', PHP_EOL;`,
      rb: `class Light
  attr_accessor :on
  def initialize
    @on = false
  end
end
class TurnOn
  def initialize(light)
    @light = light
  end
  def execute
    @light.on = true
  end
  def undo
  end
end
light = Light.new
cmd = TurnOn.new(light)
cmd.execute
cmd.undo
puts light.on ? 'ON' : 'OFF'`,
    },
  }),

  challenge({
    slug: 'template-skips-header',
    title: 'Report Template — generate() Skips Header',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['template-method', 'design-patterns', 'reports'],
    order: 13,
    description:
      'Report generator LLD: Template Method generate() must print HEADER, then BODY, then FOOTER, in that order. A concrete report implements the three steps; the skeleton is generate().',
    expectedOutput: 'HEADER\nBODY\nFOOTER',
    hint: 'Does generate() call header() before body() and footer()?',
    explanation:
      'generate() jumps to body then footer and never calls header(). Template Method locks the algorithm order in the base class. Invoke header, body, footer in sequence.',
    code: {
      py: `class Report:
    def generate(self):
        self.body()
        self.footer()
    def header(self):
        print('HEADER')
    def body(self):
        print('BODY')
    def footer(self):
        print('FOOTER')
Report().generate()`,
      java: `public class Main {
  static void header() { System.out.println("HEADER"); }
  static void body() { System.out.println("BODY"); }
  static void footer() { System.out.println("FOOTER"); }
  static void generate() { body(); footer(); }
  public static void main(String[] args) { generate(); }
}`,
      cpp: `#include <iostream>
using namespace std;
void header() { cout << "HEADER" << endl; }
void body() { cout << "BODY" << endl; }
void footer() { cout << "FOOTER" << endl; }
void generate() { body(); footer(); }
int main() { generate(); }`,
      cs: `using System;
void Header() { Console.WriteLine("HEADER"); }
void Body() { Console.WriteLine("BODY"); }
void Footer() { Console.WriteLine("FOOTER"); }
void Generate() { Body(); Footer(); }
Generate();`,
      go: `package main
import "fmt"
func header() { fmt.Println("HEADER") }
func body() { fmt.Println("BODY") }
func footer() { fmt.Println("FOOTER") }
func generate() { body(); footer() }
func main() { generate() }`,
      rust: `fn header() { println!("HEADER"); }
fn body() { println!("BODY"); }
fn footer() { println!("FOOTER"); }
fn generate() { body(); footer(); }
fn main() { generate(); }`,
      ts: `function header() { console.log('HEADER') }
function body() { console.log('BODY') }
function footer() { console.log('FOOTER') }
function generate() { body(); footer() }
generate()`,
      php: `<?php
function headerStep() { echo 'HEADER', PHP_EOL; }
function bodyStep() { echo 'BODY', PHP_EOL; }
function footerStep() { echo 'FOOTER', PHP_EOL; }
function generate() { bodyStep(); footerStep(); }
generate();`,
      rb: `def header; puts 'HEADER'; end
def body; puts 'BODY'; end
def footer; puts 'FOOTER'; end
def generate
  body
  footer
end
generate`,
    },
  }),

  challenge({
    slug: 'state-cancel-shipped',
    title: 'Order State — Cancel After Shipped',
    difficulty: 'easy',
    bugType: 'edge-case',
    tags: ['state', 'design-patterns', 'order-lifecycle'],
    order: 14,
    description:
      'Order lifecycle LLD: states include Placed → Shipped → Delivered, plus Cancelled. An already-shipped order must reject cancel() with CANNOT_CANCEL. The order is in SHIPPED when cancel is called.',
    expectedOutput: 'CANNOT_CANCEL',
    hint: 'Which states allow cancel? Does shipped.cancel() refuse the transition?',
    explanation:
      'cancel() blindly sets CANCELLED even after shipment. Illegal transitions must be rejected: once SHIPPED, cancel returns CANNOT_CANCEL and leaves the state unchanged.',
    code: {
      py: `class Order:
    def __init__(self):
        self.state = 'SHIPPED'
    def cancel(self):
        self.state = 'CANCELLED'
        return self.state
print(Order().cancel())`,
      java: `public class Main {
  static String state = "SHIPPED";
  static String cancel() {
    state = "CANCELLED";
    return state;
  }
  public static void main(String[] args) {
    System.out.println(cancel());
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string state = "SHIPPED";
string cancel() {
  state = "CANCELLED";
  return state;
}
int main() { cout << cancel() << endl; }`,
      cs: `using System;
string state = "SHIPPED";
string Cancel() {
  state = "CANCELLED";
  return state;
}
Console.WriteLine(Cancel());`,
      go: `package main
import "fmt"
func main() {
  state := "SHIPPED"
  cancel := func() string {
    state = "CANCELLED"
    return state
  }
  fmt.Println(cancel())
}`,
      rust: `fn cancel(state: &mut String) -> String {
  *state = "CANCELLED".into();
  state.clone()
}
fn main() {
  let mut state = String::from("SHIPPED");
  println!("{}", cancel(&mut state));
}`,
      ts: `let state = 'SHIPPED'
function cancel() {
  state = 'CANCELLED'
  return state
}
console.log(cancel())`,
      php: `<?php
class Order {
  public $state = 'SHIPPED';
  function cancel() {
    $this->state = 'CANCELLED';
    return $this->state;
  }
}
echo (new Order())->cancel(), PHP_EOL;`,
      rb: `class Order
  def initialize
    @state = 'SHIPPED'
  end
  def cancel
    @state = 'CANCELLED'
    @state
  end
end
puts Order.new.cancel`,
    },
  }),

  challenge({
    slug: 'observer-never-notifies',
    title: 'Stock Ticker — Publish Notifies Nobody',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['observer', 'design-patterns', 'stock-ticker'],
    order: 15,
    description:
      'Stock-ticker observer LLD: two subscribers listen to a symbol. publish() must notify every subscriber. Print how many listeners received the tick. Both should receive it.',
    expectedOutput: '2',
    hint: 'Does publish() iterate subscribers, or is notify() an empty method?',
    explanation:
      'publish() never walks the subscriber list, so received stays 0. Observer is a 1-to-N fan-out: on publish, increment (or callback) once per registered listener.',
    code: {
      py: `class Ticker:
    def __init__(self):
        self.subs = ['a', 'b']
        self.received = 0
    def publish(self):
        pass
t = Ticker()
t.publish()
print(t.received)`,
      java: `public class Main {
  static String[] subs = {"a", "b"};
  static int received = 0;
  static void publish() { }
  public static void main(String[] args) {
    publish();
    System.out.println(received);
  }
}`,
      cpp: `#include <iostream>
using namespace std;
const char* subs[] = {"a", "b"};
int received = 0;
void publish() { }
int main() { publish(); cout << received << endl; }`,
      cs: `using System;
string[] subs = {"a", "b"};
int received = 0;
void Publish() { }
Publish();
Console.WriteLine(received);`,
      go: `package main
import "fmt"
func main() {
  subs := []string{"a", "b"}
  received := 0
  publish := func() {
    for range subs {
    }
  }
  publish()
  fmt.Println(received)
}`,
      rust: `fn publish(_subs: &[&str], _received: &mut i32) {}
fn main() {
  let subs = ["a", "b"];
  let mut received = 0;
  publish(&subs, &mut received);
  println!("{}", received);
}`,
      ts: `const subs = ['a', 'b']
let received = 0
function publish() {}
publish()
console.log(received)`,
      php: `<?php
class Ticker {
  public $subs = ['a', 'b'];
  public $received = 0;
  function publish() {}
}
$t = new Ticker();
$t->publish();
echo $t->received, PHP_EOL;`,
      rb: `class Ticker
  attr_reader :received
  def initialize
    @subs = ['a', 'b']
    @received = 0
  end
  def publish
  end
end
t = Ticker.new
t.publish
puts t.received`,
    },
  }),

  challenge({
    slug: 'proxy-loads-eager',
    title: 'Virtual Image Proxy — Loads Before Draw',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['proxy', 'design-patterns', 'lazy-load'],
    order: 16,
    description:
      'Image virtual-proxy LLD: constructing ImageProxy must not load the heavy image. Only draw() loads it. Construct a proxy, do not call draw, and print whether it is loaded (YES/NO).',
    expectedOutput: 'NO',
    hint: 'Is load happening in the constructor instead of draw()?',
    explanation:
      'The proxy loads in the constructor, defeating lazy access. Virtual Proxy defers the real subject until first use. Set loaded only inside draw(), not in __init__/ctor.',
    code: {
      py: `class ImageProxy:
    def __init__(self):
        self.loaded = True
    def draw(self):
        self.loaded = True
p = ImageProxy()
print('YES' if p.loaded else 'NO')`,
      java: `public class Main {
  static boolean loaded;
  static void construct() { loaded = true; }
  public static void main(String[] args) {
    construct();
    System.out.println(loaded ? "YES" : "NO");
  }
}`,
      cpp: `#include <iostream>
using namespace std;
bool loaded = false;
void construct() { loaded = true; }
int main() {
  construct();
  cout << (loaded ? "YES" : "NO") << endl;
}`,
      cs: `using System;
bool loaded = false;
void Construct() { loaded = true; }
Construct();
Console.WriteLine(loaded ? "YES" : "NO");`,
      go: `package main
import "fmt"
func main() {
  loaded := false
  construct := func() { loaded = true }
  construct()
  if loaded { fmt.Println("YES") } else { fmt.Println("NO") }
}`,
      rust: `fn construct(loaded: &mut bool) { *loaded = true; }
fn main() {
  let mut loaded = false;
  construct(&mut loaded);
  if loaded { println!("YES"); } else { println!("NO"); }
}`,
      ts: `class ImageProxy {
  loaded = true
  draw() { this.loaded = true }
}
const p = new ImageProxy()
console.log(p.loaded ? 'YES' : 'NO')`,
      php: `<?php
class ImageProxy {
  public $loaded;
  function __construct() { $this->loaded = true; }
  function draw() { $this->loaded = true; }
}
$p = new ImageProxy();
echo $p->loaded ? 'YES' : 'NO', PHP_EOL;`,
      rb: `class ImageProxy
  attr_reader :loaded
  def initialize
    @loaded = true
  end
  def draw
    @loaded = true
  end
end
p = ImageProxy.new
puts p.loaded ? 'YES' : 'NO'`,
    },
  }),

  challenge({
    slug: 'facade-wrong-power-order',
    title: 'Home Theater Facade — Power-on Order Wrong',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['facade', 'design-patterns', 'home-theater'],
    order: 17,
    description:
      'Home-theater facade LLD: watchMovie() must power the AMP first, then the DVD player (AMP needs to be up before HDMI). Print each device as it powers on, one per line.',
    expectedOutput: 'AMP\nDVD',
    hint: 'watchMovie() is a facade: does it start AMP before DVD?',
    explanation:
      'The facade powers DVD then AMP, violating the hardware sequence. Facade hides subsystem order; the correct sequence is AMP then DVD.',
    code: {
      py: `class Theater:
    def watch_movie(self):
        print('DVD')
        print('AMP')
Theater().watch_movie()`,
      java: `public class Main {
  static void watchMovie() {
    System.out.println("DVD");
    System.out.println("AMP");
  }
  public static void main(String[] args) { watchMovie(); }
}`,
      cpp: `#include <iostream>
using namespace std;
void watchMovie() {
  cout << "DVD" << endl;
  cout << "AMP" << endl;
}
int main() { watchMovie(); }`,
      cs: `using System;
void WatchMovie() {
  Console.WriteLine("DVD");
  Console.WriteLine("AMP");
}
WatchMovie();`,
      go: `package main
import "fmt"
func watchMovie() {
  fmt.Println("DVD")
  fmt.Println("AMP")
}
func main() { watchMovie() }`,
      rust: `fn watch_movie() {
  println!("DVD");
  println!("AMP");
}
fn main() { watch_movie(); }`,
      ts: `function watchMovie() {
  console.log('DVD')
  console.log('AMP')
}
watchMovie()`,
      php: `<?php
function watchMovie() {
  echo 'DVD', PHP_EOL;
  echo 'AMP', PHP_EOL;
}
watchMovie();`,
      rb: `def watch_movie
  puts 'DVD'
  puts 'AMP'
end
watch_movie`,
    },
  }),

  challenge({
    slug: 'composite-ignores-subfolders',
    title: 'File System — Folder Size Ignores Nested Folders',
    difficulty: 'easy',
    bugType: 'wrong-algorithm',
    tags: ['composite', 'design-patterns', 'file-system'],
    order: 18,
    description:
      'File-system composite LLD: a folder contains a file of size 3 and a nested folder with a file of size 4. Folder.size() must recurse into children and print 7.',
    expectedOutput: '7',
    hint: 'Does size() sum nested folders, or only the direct files list?',
    explanation:
      'size() sums only direct files (3) and skips child folders. Composite treats files and folders uniformly: add every child.size(), including nested folders.',
    code: {
      py: `class File:
    def __init__(self, n):
        self.n = n
    def size(self):
        return self.n
class Folder:
    def __init__(self):
        self.files, self.folders = [], []
    def size(self):
        return sum(f.size() for f in self.files)
root = Folder()
root.files.append(File(3))
sub = Folder()
sub.files.append(File(4))
root.folders.append(sub)
print(root.size())`,
      java: `public class Main {
  static int size(int[] files, int nested) {
    int t = 0;
    for (int f : files) t += f;
    return t;
  }
  public static void main(String[] args) {
    System.out.println(size(new int[]{3}, 4));
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int sizeFiles[] = {3};
int nested = 4;
int folderSize() {
  int t = 0;
  for (int f : sizeFiles) t += f;
  return t;
}
int main() { cout << folderSize() << endl; }`,
      cs: `using System;
int[] files = {3};
int nested = 4;
int FolderSize() {
  int t = 0;
  foreach (int f in files) t += f;
  return t;
}
Console.WriteLine(FolderSize());`,
      go: `package main
import "fmt"
func main() {
  files := []int{3}
  nested := []int{4}
  t := 0
  for _, f := range files { t += f }
  _ = nested
  fmt.Println(t)
}`,
      rust: `fn main() {
  let files = [3];
  let nested = [4];
  let mut t = 0;
  for f in files { t += f; }
  let _ = nested;
  println!("{}", t);
}`,
      ts: `class FileN {
  n: number
  constructor(n: number) { this.n = n }
  size() { return this.n }
}
class Folder {
  files: FileN[] = []
  folders: Folder[] = []
  size() { return this.files.reduce((s, f) => s + f.size(), 0) }
}
const root = new Folder()
root.files.push(new FileN(3))
const sub = new Folder()
sub.files.push(new FileN(4))
root.folders.push(sub)
console.log(root.size())`,
      php: `<?php
class FileN {
  public $n;
  function __construct($n) { $this->n = $n; }
  function size() { return $this->n; }
}
class Folder {
  public $files = [];
  public $folders = [];
  function size() {
    $t = 0;
    foreach ($this->files as $f) $t += $f->size();
    return $t;
  }
}
$root = new Folder();
$root->files[] = new FileN(3);
$sub = new Folder();
$sub->files[] = new FileN(4);
$root->folders[] = $sub;
echo $root->size(), PHP_EOL;`,
      rb: `class FileN
  def initialize(n); @n = n; end
  def size; @n; end
end
class Folder
  attr_accessor :files, :folders
  def initialize
    @files = []
    @folders = []
  end
  def size
    @files.map(&:size).sum
  end
end
root = Folder.new
root.files << FileN.new(3)
sub = Folder.new
sub.files << FileN.new(4)
root.folders << sub
puts root.size`,
    },
  }),

  challenge({
    slug: 'chain-lead-approves-all',
    title: 'Expense Chain — TeamLead Never Escalates',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['chain-of-responsibility', 'design-patterns', 'approvals'],
    order: 19,
    description:
      'Expense-approval chain LLD: TeamLead can approve up to 500; anything larger goes to Manager. A claim of 1500 must print MANAGER. Build Lead → Manager and handle 1500.',
    expectedOutput: 'MANAGER',
    hint: 'If amount exceeds the lead limit, do you forward to next, or approve locally?',
    explanation:
      'TeamLead always returns LEAD, even for 1500. Chain of Responsibility forwards when the handler cannot satisfy the request. If amt > 500, call next.handle().',
    code: {
      py: `class Lead:
    def __init__(self, nxt):
        self.nxt = nxt
        self.limit = 500
    def handle(self, amt):
        return 'LEAD'
class Manager:
    def handle(self, amt):
        return 'MANAGER'
print(Lead(Manager()).handle(1500))`,
      java: `public class Main {
  static String handle(int amt) { return "LEAD"; }
  public static void main(String[] args) {
    System.out.println(handle(1500));
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int leadLimit = 500;
const char* handle(int amt) { return "LEAD"; }
int main() { cout << handle(1500) << endl; }`,
      cs: `using System;
int leadLimit = 500;
string Handle(int amt) { return "LEAD"; }
Console.WriteLine(Handle(1500));`,
      go: `package main
import "fmt"
func main() {
  leadLimit := 500
  handle := func(amt int) string { return "LEAD" }
  _ = leadLimit
  fmt.Println(handle(1500))
}`,
      rust: `fn handle(_amt: i32, _limit: i32) -> &'static str { "LEAD" }
fn main() {
  println!("{}", handle(1500, 500));
}`,
      ts: `class Manager { handle(_amt: number) { return 'MANAGER' } }
class Lead {
  nxt: Manager
  limit = 500
  constructor(nxt: Manager) { this.nxt = nxt }
  handle(_amt: number) { return 'LEAD' }
}
console.log(new Lead(new Manager()).handle(1500))`,
      php: `<?php
class Manager { function handle($amt) { return 'MANAGER'; } }
class Lead {
  public $nxt;
  public $limit = 500;
  function __construct($nxt) { $this->nxt = $nxt; }
  function handle($amt) { return 'LEAD'; }
}
echo (new Lead(new Manager()))->handle(1500), PHP_EOL;`,
      rb: `class Manager
  def handle(amt); 'MANAGER'; end
end
class Lead
  def initialize(nxt)
    @nxt = nxt
    @limit = 500
  end
  def handle(amt)
    'LEAD'
  end
end
puts Lead.new(Manager.new).handle(1500)`,
    },
  }),

  challenge({
    slug: 'lsp-square-area',
    title: 'Rectangle/Square LSP — setHeight Breaks Area Contract',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['lsp', 'solid', 'rectangle-square'],
    order: 20,
    description:
      'Classic LSP interview: a client holds a Rectangle and calls setWidth(5) then setHeight(4). Area must be 20. A Square used as that Rectangle currently sets both sides on each setter.',
    expectedOutput: '20',
    hint: 'If Square overrides setHeight to also change width, can a Rectangle client still trust area = w*h after independent setters?',
    explanation:
      'Square.setHeight(4) also sets width to 4, so area becomes 16. That violates Rectangle’s contract. Do not make Square inherit Rectangle’s independent setters; keep sides independent when used as a Rectangle.',
    code: {
      py: `class Rect:
    def __init__(self):
        self.w = 0
        self.h = 0
    def set_width(self, x):
        self.w = x
    def set_height(self, x):
        self.h = x
    def area(self):
        return self.w * self.h
class Square(Rect):
    def set_width(self, x):
        self.w = x
        self.h = x
    def set_height(self, x):
        self.h = x
        self.w = x
r = Square()
r.set_width(5)
r.set_height(4)
print(r.area())`,
      java: `public class Main {
  static class Rect {
    int w, h;
    void setWidth(int x) { w = x; }
    void setHeight(int x) { h = x; }
    int area() { return w * h; }
  }
  static class Square extends Rect {
    void setWidth(int x) { w = x; h = x; }
    void setHeight(int x) { h = x; w = x; }
  }
  public static void main(String[] args) {
    Rect r = new Square();
    r.setWidth(5);
    r.setHeight(4);
    System.out.println(r.area());
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int w = 0, h = 0;
void setWidth(int x) { w = x; h = x; }
void setHeight(int x) { h = x; w = x; }
int main() {
  setWidth(5);
  setHeight(4);
  cout << w * h << endl;
}`,
      cs: `using System;
int w = 0, h = 0;
void SetWidth(int x) { w = x; h = x; }
void SetHeight(int x) { h = x; w = x; }
SetWidth(5);
SetHeight(4);
Console.WriteLine(w * h);`,
      go: `package main
import "fmt"
func main() {
  w, h := 0, 0
  isSq := true
  setWidth := func(x int) { w = x; if isSq { h = x } }
  setHeight := func(x int) { h = x; if isSq { w = x } }
  setWidth(5)
  setHeight(4)
  fmt.Println(w * h)
}`,
      rust: `fn set_width(w: &mut i32, h: &mut i32, x: i32, is_sq: bool) {
  *w = x;
  if is_sq { *h = x; }
}
fn set_height(w: &mut i32, h: &mut i32, x: i32, is_sq: bool) {
  *h = x;
  if is_sq { *w = x; }
}
fn main() {
  let mut w = 0;
  let mut h = 0;
  set_width(&mut w, &mut h, 5, true);
  set_height(&mut w, &mut h, 4, true);
  println!("{}", w * h);
}`,
      ts: `class Rect {
  w = 0
  h = 0
  setWidth(x: number) { this.w = x }
  setHeight(x: number) { this.h = x }
  area() { return this.w * this.h }
}
class Square extends Rect {
  setWidth(x: number) { this.w = x; this.h = x }
  setHeight(x: number) { this.h = x; this.w = x }
}
const r: Rect = new Square()
r.setWidth(5)
r.setHeight(4)
console.log(r.area())`,
      php: `<?php
class Rect {
  public $w = 0, $h = 0;
  function setWidth($x) { $this->w = $x; }
  function setHeight($x) { $this->h = $x; }
  function area() { return $this->w * $this->h; }
}
class Square extends Rect {
  function setWidth($x) { $this->w = $x; $this->h = $x; }
  function setHeight($x) { $this->h = $x; $this->w = $x; }
}
$r = new Square();
$r->setWidth(5);
$r->setHeight(4);
echo $r->area(), PHP_EOL;`,
      rb: `class Rect
  attr_accessor :w, :h
  def initialize
    @w = 0
    @h = 0
  end
  def set_width(x); @w = x; end
  def set_height(x); @h = x; end
  def area; @w * @h; end
end
class Square < Rect
  def set_width(x); @w = x; @h = x; end
  def set_height(x); @h = x; @w = x; end
end
r = Square.new
r.set_width(5)
r.set_height(4)
puts r.area`,
    },
  }),

  challenge({
    slug: 'srp-email-before-report',
    title: 'Report Service — Emails Before Generating',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['srp', 'solid', 'reports'],
    order: 21,
    description:
      'Report service LLD: generate() fills the body with REPORT, then send() emails that body. The service currently calls send() first, so the mailbox gets EMPTY. Print the sent body.',
    expectedOutput: 'REPORT',
    hint: 'Are you sending before generate() has written the body?',
    explanation:
      'send() runs while body is still EMPTY, then generate() fills it too late. Even in a mixed service, the generate-then-send order is required so the email contains REPORT.',
    code: {
      py: `class Report:
    def __init__(self):
        self.body = 'EMPTY'
    def generate(self):
        self.body = 'REPORT'
    def send(self):
        return self.body
r = Report()
print(r.send())
r.generate()`,
      java: `public class Main {
  static String body = "EMPTY";
  static void generate() { body = "REPORT"; }
  static String send() { return body; }
  public static void main(String[] args) {
    System.out.println(send());
    generate();
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string body = "EMPTY";
void generate() { body = "REPORT"; }
string send() { return body; }
int main() {
  cout << send() << endl;
  generate();
}`,
      cs: `using System;
string body = "EMPTY";
void Generate() { body = "REPORT"; }
string Send() { return body; }
Console.WriteLine(Send());
Generate();`,
      go: `package main
import "fmt"
func main() {
  body := "EMPTY"
  generate := func() { body = "REPORT" }
  send := func() string { return body }
  fmt.Println(send())
  generate()
}`,
      rust: `fn generate(body: &mut String) { *body = "REPORT".into(); }
fn send(body: &str) -> &str { body }
fn main() {
  let mut body = String::from("EMPTY");
  println!("{}", send(&body));
  generate(&mut body);
}`,
      ts: `class Report {
  body = 'EMPTY'
  generate() { this.body = 'REPORT' }
  send() { return this.body }
}
const r = new Report()
console.log(r.send())
r.generate()`,
      php: `<?php
class Report {
  public $body = 'EMPTY';
  function generate() { $this->body = 'REPORT'; }
  function send() { return $this->body; }
}
$r = new Report();
echo $r->send(), PHP_EOL;
$r->generate();`,
      rb: `class Report
  def initialize
    @body = 'EMPTY'
  end
  def generate
    @body = 'REPORT'
  end
  def send
    @body
  end
end
r = Report.new
puts r.send
r.generate`,
    },
  }),

  challenge({
    slug: 'ocp-missing-triangle',
    title: 'Graphics Area — New Shape Requires Edit, Triangle Returns 0',
    difficulty: 'easy',
    bugType: 'wrong-algorithm',
    tags: ['ocp', 'solid', 'graphics'],
    order: 22,
    description:
      'Graphics area LLD: area("tri", 10, 5) is a triangle with base 10 and height 5, so the integer area is 25. The dispatcher currently knows only rectangles and returns 0 for anything else.',
    expectedOutput: '25',
    hint: 'The switch/if chain has no triangle branch — what should base*height/2 return?',
    explanation:
      'Open/Closed is broken: adding triangle required editing the dispatcher, and the missing branch returns 0. Handle "tri" as base * height / 2 (integer 25).',
    code: {
      py: `def area(kind, a, b):
    if kind == 'rect':
        return a * b
    return 0
print(area('tri', 10, 5))`,
      java: `public class Main {
  static int area(String kind, int a, int b) {
    if (kind.equals("rect")) return a * b;
    return 0;
  }
  public static void main(String[] args) {
    System.out.println(area("tri", 10, 5));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int area(string kind, int a, int b) {
  if (kind == "rect") return a * b;
  return 0;
}
int main() { cout << area("tri", 10, 5) << endl; }`,
      cs: `using System;
int Area(string kind, int a, int b) {
  if (kind == "rect") return a * b;
  return 0;
}
Console.WriteLine(Area("tri", 10, 5));`,
      go: `package main
import "fmt"
func area(kind string, a, b int) int {
  if kind == "rect" { return a * b }
  return 0
}
func main() { fmt.Println(area("tri", 10, 5)) }`,
      rust: `fn area(kind: &str, a: i32, b: i32) -> i32 {
  if kind == "rect" { a * b } else { 0 }
}
fn main() { println!("{}", area("tri", 10, 5)); }`,
      ts: `function area(kind: string, a: number, b: number) {
  if (kind === 'rect') return a * b
  return 0
}
console.log(area('tri', 10, 5))`,
      php: `<?php
function area($kind, $a, $b) {
  if ($kind === 'rect') return $a * $b;
  return 0;
}
echo area('tri', 10, 5), PHP_EOL;`,
      rb: `def area(kind, a, b)
  return a * b if kind == 'rect'
  0
end
puts area('tri', 10, 5)`,
    },
  }),

  challenge({
    slug: 'dip-hardcoded-email',
    title: 'Order Notifier — Depends on Concrete Email',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['dip', 'solid', 'notifications'],
    order: 23,
    description:
      'Order notifier LLD: the service is constructed with an SmsNotifier, so dispatch() must print SMS. High-level code currently news EmailNotifier itself and ignores the injected dependency.',
    expectedOutput: 'SMS',
    hint: 'Does dispatch() use the injected notifier, or does it hardcode Email?',
    explanation:
      'DIP says high-level OrderNotifier depends on an abstraction. The constructor receives SmsNotifier but dispatch() still calls Email. Use the injected collaborator.',
    code: {
      py: `class Email:
    def send(self):
        return 'EMAIL'
class Sms:
    def send(self):
        return 'SMS'
class OrderNotifier:
    def __init__(self, n):
        self.n = n
    def dispatch(self):
        return Email().send()
print(OrderNotifier(Sms()).dispatch())`,
      java: `public class Main {
  static class Email { String send() { return "EMAIL"; } }
  static class Sms { String send() { return "SMS"; } }
  static class OrderNotifier {
    Object n;
    OrderNotifier(Object n) { this.n = n; }
    String dispatch() { return new Email().send(); }
  }
  public static void main(String[] args) {
    System.out.println(new OrderNotifier(new Sms()).dispatch());
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string dispatch(string injected) {
  return "EMAIL";
}
int main() { cout << dispatch("SMS") << endl; }`,
      cs: `using System;
string Dispatch(string injected) { return "EMAIL"; }
Console.WriteLine(Dispatch("SMS"));`,
      go: `package main
import "fmt"
type Sender interface{ send() string }
type Email struct{}
func (Email) send() string { return "EMAIL" }
type Sms struct{}
func (Sms) send() string { return "SMS" }
func dispatch(n Sender) string { return Email{}.send() }
func main() { fmt.Println(dispatch(Sms{})) }`,
      rust: `fn dispatch(_injected: &str) -> &'static str { "EMAIL" }
fn main() { println!("{}", dispatch("SMS")); }`,
      ts: `class Email { send() { return 'EMAIL' } }
class Sms { send() { return 'SMS' } }
class OrderNotifier {
  n: { send: () => string }
  constructor(n: { send: () => string }) { this.n = n }
  dispatch() { return new Email().send() }
}
console.log(new OrderNotifier(new Sms()).dispatch())`,
      php: `<?php
class Email { function send() { return 'EMAIL'; } }
class Sms { function send() { return 'SMS'; } }
class OrderNotifier {
  public $n;
  function __construct($n) { $this->n = $n; }
  function dispatch() { return (new Email())->send(); }
}
echo (new OrderNotifier(new Sms()))->dispatch(), PHP_EOL;`,
      rb: `class Email
  def send; 'EMAIL'; end
end
class Sms
  def send; 'SMS'; end
end
class OrderNotifier
  def initialize(n)
    @n = n
  end
  def dispatch
    Email.new.send
  end
end
puts OrderNotifier.new(Sms.new).dispatch`,
    },
  }),

  challenge({
    slug: 'prototype-shared-attachments',
    title: 'Document Prototype — Clone Shares Attachment List',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['prototype', 'design-patterns', 'clone'],
    order: 24,
    description:
      'Document prototype LLD: an original has one attachment. clone() then adds a second attachment on the copy. The original’s attachment count must stay 1. Print the original count after the clone mutates.',
    expectedOutput: '1',
    hint: 'Is clone() copying the attachments list, or aliasing the same list object?',
    explanation:
      'clone() assigns the same list reference, so appending on the copy mutates the original (count 2). Prototype clone of mutable collections must deep-copy (or copy-on-write) the attachments.',
    code: {
      py: `class Doc:
    def __init__(self, atts=None):
        self.atts = atts if atts is not None else ['cover']
    def clone(self):
        return Doc(self.atts)
orig = Doc()
c = orig.clone()
c.atts.append('photo')
print(len(orig.atts))`,
      java: `public class Main {
  public static void main(String[] args) {
    java.util.List<String> orig = new java.util.ArrayList<>();
    orig.add("cover");
    java.util.List<String> clone = orig;
    clone.add("photo");
    System.out.println(orig.size());
  }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
int main() {
  vector<string> orig = {"cover"};
  vector<string>& clone = orig;
  clone.push_back("photo");
  cout << orig.size() << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var orig = new List<string>{"cover"};
var clone = orig;
clone.Add("photo");
Console.WriteLine(orig.Count);`,
      go: `package main
import "fmt"
type Doc struct{ atts []string }
func main() {
  orig := &Doc{atts: []string{"cover"}}
  clone := orig
  clone.atts = append(clone.atts, "photo")
  fmt.Println(len(orig.atts))
}`,
      rust: `fn main() {
  let mut orig = vec!["cover"];
  {
    let clone = &mut orig;
    clone.push("photo");
  }
  println!("{}", orig.len());
}`,
      ts: `class Doc {
  atts: string[]
  constructor(atts?: string[]) { this.atts = atts ?? ['cover'] }
  clone() { return new Doc(this.atts) }
}
const orig = new Doc()
const c = orig.clone()
c.atts.push('photo')
console.log(orig.atts.length)`,
      php: `<?php
class Doc {
  public $atts;
  function __construct($atts = null) { $this->atts = $atts ?? ['cover']; }
  function cloneDoc() {
    $d = new Doc();
    $d->atts = &$this->atts;
    return $d;
  }
}
$orig = new Doc();
$c = $orig->cloneDoc();
$c->atts[] = 'photo';
echo count($orig->atts), PHP_EOL;`,
      rb: `class Doc
  attr_accessor :atts
  def initialize(atts = nil)
    @atts = atts || ['cover']
  end
  def clone_doc
    Doc.new(@atts)
  end
end
orig = Doc.new
c = orig.clone_doc
c.atts << 'photo'
puts orig.atts.length`,
    },
  }),

  challenge({
    slug: 'memento-drops-cursor',
    title: 'Text Editor Memento — Undo Restores Text Not Cursor',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['memento', 'design-patterns', 'text-editor'],
    order: 25,
    description:
      'Text-editor memento LLD: cursor starts at 0. Save, type four characters (cursor becomes 4), then undo. Undo must restore both text and cursor; print the cursor, which must be 0.',
    expectedOutput: '0',
    hint: 'Does the memento store cursor, or only the document text?',
    explanation:
      'save() snapshots text only; restore() leaves cursor at 4. A memento must capture every bit of restorable state — here text and cursor — so undo returns cursor to 0.',
    code: {
      py: `class Editor:
    def __init__(self):
        self.text = ''
        self.cursor = 0
    def insert(self, s):
        self.text += s
        self.cursor += len(s)
    def save(self):
        return self.text
    def restore(self, m):
        self.text = m
ed = Editor()
m = ed.save()
ed.insert('abcd')
ed.restore(m)
print(ed.cursor)`,
      java: `public class Main {
  static String text = "";
  static int cursor = 0;
  static String save() { return text; }
  static void insert(String s) { text += s; cursor += s.length(); }
  static void restore(String m) { text = m; }
  public static void main(String[] args) {
    String m = save();
    insert("abcd");
    restore(m);
    System.out.println(cursor);
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string text = "";
int cursor = 0;
string save() { return text; }
void insert(string s) { text += s; cursor += (int)s.size(); }
void restore(string m) { text = m; }
int main() {
  string m = save();
  insert("abcd");
  restore(m);
  cout << cursor << endl;
}`,
      cs: `using System;
string text = "";
int cursor = 0;
string Save() { return text; }
void Insert(string s) { text += s; cursor += s.Length; }
void Restore(string m) { text = m; }
var m = Save();
Insert("abcd");
Restore(m);
Console.WriteLine(cursor);`,
      go: `package main
import "fmt"
func main() {
  text := ""
  cursor := 0
  save := func() string { return text }
  insert := func(s string) { text += s; cursor += len(s) }
  restore := func(m string) { text = m }
  m := save()
  insert("abcd")
  restore(m)
  fmt.Println(cursor)
}`,
      rust: `fn main() {
  let mut text = String::new();
  let mut cursor = 0;
  let saved = text.clone();
  text.push_str("abcd");
  cursor += 4;
  text = saved;
  println!("{}", cursor);
}`,
      ts: `class Editor {
  text = ''
  cursor = 0
  insert(s: string) { this.text += s; this.cursor += s.length }
  save() { return this.text }
  restore(m: string) { this.text = m }
}
const ed = new Editor()
const m = ed.save()
ed.insert('abcd')
ed.restore(m)
console.log(ed.cursor)`,
      php: `<?php
class Editor {
  public $text = '';
  public $cursor = 0;
  function insert($s) { $this->text .= $s; $this->cursor += strlen($s); }
  function save() { return $this->text; }
  function restore($m) { $this->text = $m; }
}
$ed = new Editor();
$m = $ed->save();
$ed->insert('abcd');
$ed->restore($m);
echo $ed->cursor, PHP_EOL;`,
      rb: `class Editor
  attr_reader :cursor
  def initialize
    @text = ''
    @cursor = 0
  end
  def insert(s)
    @text += s
    @cursor += s.length
  end
  def save
    @text
  end
  def restore(m)
    @text = m
  end
end
ed = Editor.new
m = ed.save
ed.insert('abcd')
ed.restore(m)
puts ed.cursor`,
    },
  }),

  challenge({
    slug: 'flyweight-color-bleed',
    title: 'Tree Flyweight — Extrinsic Color Mutates Shared Type',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['flyweight', 'design-patterns', 'graphics'],
    order: 26,
    description:
      'Forest flyweight LLD: TreeType is shared. treeA is painted red (extrinsic). treeB uses the same type and must stay green. Print treeB’s color after painting A red.',
    expectedOutput: 'green',
    hint: 'Is color stored on the shared TreeType (intrinsic) or on the Tree instance (extrinsic)?',
    explanation:
      'paint() writes color onto the shared TreeType, so treeB bleeds to red. Flyweight splits intrinsic (species) from extrinsic (color, x, y). Keep color on the Tree, not the type.',
    code: {
      py: `class TreeType:
    def __init__(self):
        self.color = 'green'
class Tree:
    def __init__(self, typ):
        self.typ = typ
    def paint(self, color):
        self.typ.color = color
shared = TreeType()
a, b = Tree(shared), Tree(shared)
a.paint('red')
print(b.typ.color)`,
      java: `public class Main {
  static String typeColor = "green";
  static void paintA(String color) { typeColor = color; }
  public static void main(String[] args) {
    paintA("red");
    System.out.println(typeColor);
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string typeColor = "green";
void paintA(string color) { typeColor = color; }
int main() {
  paintA("red");
  cout << typeColor << endl;
}`,
      cs: `using System;
string typeColor = "green";
void PaintA(string color) { typeColor = color; }
PaintA("red");
Console.WriteLine(typeColor);`,
      go: `package main
import "fmt"
func main() {
  typeColor := "green"
  paintA := func(color string) { typeColor = color }
  paintA("red")
  fmt.Println(typeColor)
}`,
      rust: `fn paint_a(type_color: &mut String, color: &str) { *type_color = color.into(); }
fn main() {
  let mut type_color = String::from("green");
  paint_a(&mut type_color, "red");
  println!("{}", type_color);
}`,
      ts: `class TreeType { color = 'green' }
class Tree {
  typ: TreeType
  constructor(typ: TreeType) { this.typ = typ }
  paint(color: string) { this.typ.color = color }
}
const shared = new TreeType()
const a = new Tree(shared)
const b = new Tree(shared)
a.paint('red')
console.log(b.typ.color)`,
      php: `<?php
class TreeType { public $color = 'green'; }
class Tree {
  public $typ;
  function __construct($typ) { $this->typ = $typ; }
  function paint($color) { $this->typ->color = $color; }
}
$shared = new TreeType();
$a = new Tree($shared);
$b = new Tree($shared);
$a->paint('red');
echo $b->typ->color, PHP_EOL;`,
      rb: `class TreeType
  attr_accessor :color
  def initialize
    @color = 'green'
  end
end
class Tree
  attr_reader :typ
  def initialize(typ)
    @typ = typ
  end
  def paint(color)
    @typ.color = color
  end
end
shared = TreeType.new
a = Tree.new(shared)
b = Tree.new(shared)
a.paint('red')
puts b.typ.color`,
    },
  }),

  challenge({
    slug: 'abstract-factory-cross-family',
    title: 'GUI Abstract Factory — WinFactory Builds Mac Button',
    difficulty: 'easy',
    bugType: 'wrong-algorithm',
    tags: ['abstract-factory', 'design-patterns', 'gui'],
    order: 27,
    description:
      'GUI kit LLD: WinFactory.createButton() must return a Windows button labeled WIN_BTN. The factory currently emits MAC_BTN, mixing families. Print the button id.',
    expectedOutput: 'WIN_BTN',
    hint: 'WinFactory must produce the Windows product family, not Mac.',
    explanation:
      'Abstract Factory keeps a family consistent (Win buttons with Win checkboxes). WinFactory.createButton() wrongly returns MAC_BTN. Return WIN_BTN from the Windows factory.',
    code: {
      py: `class WinFactory:
    def create_button(self):
        return 'MAC_BTN'
print(WinFactory().create_button())`,
      java: `public class Main {
  static String createButton() { return "MAC_BTN"; }
  public static void main(String[] args) {
    System.out.println(createButton());
  }
}`,
      cpp: `#include <iostream>
using namespace std;
const char* createButton() { return "MAC_BTN"; }
int main() { cout << createButton() << endl; }`,
      cs: `using System;
string CreateButton() { return "MAC_BTN"; }
Console.WriteLine(CreateButton());`,
      go: `package main
import "fmt"
func createButton() string { return "MAC_BTN" }
func main() { fmt.Println(createButton()) }`,
      rust: `fn create_button() -> &'static str { "MAC_BTN" }
fn main() { println!("{}", create_button()); }`,
      ts: `class WinFactory {
  createButton() { return 'MAC_BTN' }
}
console.log(new WinFactory().createButton())`,
      php: `<?php
class WinFactory {
  function createButton() { return 'MAC_BTN'; }
}
echo (new WinFactory())->createButton(), PHP_EOL;`,
      rb: `class WinFactory
  def create_button
    'MAC_BTN'
  end
end
puts WinFactory.new.create_button`,
    },
  }),

  challenge({
    slug: 'visitor-taxes-books',
    title: 'Tax Visitor — Books Are Taxed',
    difficulty: 'easy',
    bugType: 'wrong-algorithm',
    tags: ['visitor', 'design-patterns', 'tax'],
    order: 28,
    description:
      'Shopping-cart visitor LLD: electronics are taxed 18%, books are tax-exempt. A book priced 100 must print tax 0. The visitor currently applies the electronics rate to books.',
    expectedOutput: '0',
    hint: 'visitBook should not reuse the electronics 18% formula.',
    explanation:
      'visitBook uses price * 18 / 100 (18) instead of 0. Visitor double-dispatch exists so each element type has its own tax rule. Books return 0.',
    code: {
      py: `class Book:
    def __init__(self, p):
        self.p = p
class Tax:
    def visit_book(self, b):
        return b.p * 18 // 100
print(Tax().visit_book(Book(100)))`,
      java: `public class Main {
  static int visitBook(int price) { return price * 18 / 100; }
  public static void main(String[] args) {
    System.out.println(visitBook(100));
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int visitBook(int price) { return price * 18 / 100; }
int main() { cout << visitBook(100) << endl; }`,
      cs: `using System;
int VisitBook(int price) { return price * 18 / 100; }
Console.WriteLine(VisitBook(100));`,
      go: `package main
import "fmt"
func visitBook(price int) int { return price * 18 / 100 }
func main() { fmt.Println(visitBook(100)) }`,
      rust: `fn visit_book(price: i32) -> i32 { price * 18 / 100 }
fn main() { println!("{}", visit_book(100)); }`,
      ts: `class Book { constructor(public p: number) {} }
class Tax {
  visitBook(b: Book) { return (b.p * 18) / 100 }
}
console.log(new Tax().visitBook(new Book(100)))`,
      php: `<?php
class Book {
  public $p;
  function __construct($p) { $this->p = $p; }
}
class Tax {
  function visitBook($b) { return intdiv($b->p * 18, 100); }
}
echo (new Tax())->visitBook(new Book(100)), PHP_EOL;`,
      rb: `class Book
  attr_reader :p
  def initialize(p); @p = p; end
end
class Tax
  def visit_book(b)
    b.p * 18 / 100
  end
end
puts Tax.new.visit_book(Book.new(100))`,
    },
  }),

  challenge({
    slug: 'null-object-aborts-order',
    title: 'Null Logger — Missing Logger Skips Business Logic',
    difficulty: 'easy',
    bugType: 'null-check',
    tags: ['null-object', 'design-patterns', 'orders'],
    order: 29,
    description:
      'Order processor LLD: logging is optional. process() with no logger still must complete and print PROCESSED. A missing logger currently aborts with SKIPPED.',
    expectedOutput: 'PROCESSED',
    hint: 'Should a null logger skip the order, or no-op while the order still processes?',
    explanation:
      'The code treats a missing logger as a business failure. Null Object (or a no-op logger) lets process() always run; logging is a side channel, not a precondition.',
    code: {
      py: `def process(logger):
    if logger is None:
        return 'SKIPPED'
    logger('ok')
    return 'PROCESSED'
print(process(None))`,
      java: `public class Main {
  static String process(Object logger) {
    if (logger == null) return "SKIPPED";
    return "PROCESSED";
  }
  public static void main(String[] args) {
    System.out.println(process(null));
  }
}`,
      cpp: `#include <iostream>
using namespace std;
const char* process(void* logger) {
  if (!logger) return "SKIPPED";
  return "PROCESSED";
}
int main() { cout << process(nullptr) << endl; }`,
      cs: `using System;
string Process(object logger) {
  if (logger == null) return "SKIPPED";
  return "PROCESSED";
}
Console.WriteLine(Process(null));`,
      go: `package main
import "fmt"
func process(logger *int) string {
  if logger == nil { return "SKIPPED" }
  return "PROCESSED"
}
func main() { fmt.Println(process(nil)) }`,
      rust: `fn process(logger: Option<&str>) -> &'static str {
  if logger.is_none() { return "SKIPPED"; }
  "PROCESSED"
}
fn main() { println!("{}", process(None)); }`,
      ts: `function process(logger: ((m: string) => void) | null) {
  if (logger === null) return 'SKIPPED'
  logger('ok')
  return 'PROCESSED'
}
console.log(process(null))`,
      php: `<?php
function process($logger) {
  if ($logger === null) return 'SKIPPED';
  return 'PROCESSED';
}
echo process(null), PHP_EOL;`,
      rb: `def process(logger)
  return 'SKIPPED' if logger.nil?
  'PROCESSED'
end
puts process(nil)`,
    },
  }),

  challenge({
    slug: 'tictactoe-overwrite-cell',
    title: 'Tic-Tac-Toe — Occupied Cell Overwritten',
    difficulty: 'easy',
    bugType: 'edge-case',
    tags: ['tic-tac-toe', 'game', 'invariants'],
    order: 30,
    description:
      'Tic-tac-toe LLD: X places at (0,0), then O tries the same cell. place() must reject that with OCCUPIED and leave X. Print the result of O’s move.',
    expectedOutput: 'OCCUPIED',
    hint: 'Do you check that the cell is empty before writing the new mark?',
    explanation:
      'place() overwrites X with O. The board invariant is: a filled cell cannot change. If the cell is not empty, return OCCUPIED.',
    code: {
      py: `class Game:
    def __init__(self):
        self.b = [['.'] * 3 for _ in range(3)]
    def place(self, r, c, p):
        self.b[r][c] = p
        return p
g = Game()
g.place(0, 0, 'X')
print(g.place(0, 0, 'O'))`,
      java: `public class Main {
  static char[][] b = {{'.','.','.'},{'.','.','.'},{'.','.','.'}};
  static String place(int r, int c, char p) {
    b[r][c] = p;
    return "" + p;
  }
  public static void main(String[] args) {
    place(0, 0, 'X');
    System.out.println(place(0, 0, 'O'));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
char b[3][3] = {{'.','.','.'},{'.','.','.'},{'.','.','.'}};
string place(int r, int c, char p) {
  b[r][c] = p;
  return string(1, p);
}
int main() {
  place(0, 0, 'X');
  cout << place(0, 0, 'O') << endl;
}`,
      cs: `using System;
char[,] b = {{'.','.','.'},{'.','.','.'},{'.','.','.'}};
string Place(int r, int c, char p) {
  b[r, c] = p;
  return "" + p;
}
Place(0, 0, 'X');
Console.WriteLine(Place(0, 0, 'O'));`,
      go: `package main
import "fmt"
func main() {
  b := [3][3]byte{{'.','.','.'},{'.','.','.'},{'.','.','.'}}
  place := func(r, c int, p byte) string {
    b[r][c] = p
    return string([]byte{p})
  }
  place(0, 0, 'X')
  fmt.Println(place(0, 0, 'O'))
}`,
      rust: `fn place(b: &mut [[char; 3]; 3], r: usize, c: usize, p: char) -> String {
  b[r][c] = p;
  p.to_string()
}
fn main() {
  let mut b = [['.'; 3]; 3];
  place(&mut b, 0, 0, 'X');
  println!("{}", place(&mut b, 0, 0, 'O'));
}`,
      ts: `const b = [['.', '.', '.'], ['.', '.', '.'], ['.', '.', '.']]
function place(r: number, c: number, p: string) {
  b[r][c] = p
  return p
}
place(0, 0, 'X')
console.log(place(0, 0, 'O'))`,
      php: `<?php
$b = [['.','.','.'],['.','.','.'],['.','.','.']];
function place($r, $c, $p) {
  global $b;
  $b[$r][$c] = $p;
  return $p;
}
place(0, 0, 'X');
echo place(0, 0, 'O'), PHP_EOL;`,
      rb: `class Game
  def initialize
    @b = Array.new(3) { Array.new(3, '.') }
  end
  def place(r, c, p)
    @b[r][c] = p
    p
  end
end
g = Game.new
g.place(0, 0, 'X')
puts g.place(0, 0, 'O')`,
    },
  }),

  challenge({
    slug: 'coffee-machine-no-water',
    title: 'Coffee Machine — Brews Without Water',
    difficulty: 'easy',
    bugType: 'edge-case',
    tags: ['coffee-machine', 'state', 'invariants'],
    order: 31,
    description:
      'Coffee-machine LLD: brew() is illegal when the water tank is empty. Tank starts at 0. brew() must print NO_WATER instead of brewing OK.',
    expectedOutput: 'NO_WATER',
    hint: 'Is there a water > 0 guard before the machine claims OK?',
    explanation:
      'brew() ignores the empty tank and returns OK. Hardware invariants: no water → no brew. Check water and return NO_WATER when it is 0.',
    code: {
      py: `class Machine:
    def __init__(self):
        self.water = 0
    def brew(self):
        return 'OK'
print(Machine().brew())`,
      java: `public class Main {
  static int water = 0;
  static String brew() { return "OK"; }
  public static void main(String[] args) {
    System.out.println(brew());
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int water = 0;
const char* brew() { return "OK"; }
int main() { cout << brew() << endl; }`,
      cs: `using System;
int water = 0;
string Brew() { return "OK"; }
Console.WriteLine(Brew());`,
      go: `package main
import "fmt"
func main() {
  water := 0
  brew := func() string { return "OK" }
  _ = water
  fmt.Println(brew())
}`,
      rust: `fn brew(_water: i32) -> &'static str { "OK" }
fn main() {
  let water = 0;
  println!("{}", brew(water));
}`,
      ts: `let water = 0
function brew() { return 'OK' }
console.log(brew())`,
      php: `<?php
class Machine {
  public $water = 0;
  function brew() { return 'OK'; }
}
echo (new Machine())->brew(), PHP_EOL;`,
      rb: `class Machine
  def initialize
    @water = 0
  end
  def brew
    'OK'
  end
end
puts Machine.new.brew`,
    },
  }),

  challenge({
    slug: 'cart-add-resets-qty',
    title: 'Shopping Cart — Second Add Resets Quantity',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['shopping-cart', 'object-design', 'invariants'],
    order: 32,
    description:
      'Shopping-cart LLD: add("A") twice must yield quantity 2 for SKU A, not replace the line with 1. Add A, add A, print qty.',
    expectedOutput: '2',
    hint: 'On a duplicate SKU, do you increment quantity or assign 1 again?',
    explanation:
      'add() always writes qty=1, so the second add resets the line. Cart invariant: same SKU merges. Increment the existing quantity.',
    code: {
      py: `class Cart:
    def __init__(self):
        self.items = {}
    def add(self, sku):
        self.items[sku] = 1
c = Cart()
c.add('A')
c.add('A')
print(c.items['A'])`,
      java: `public class Main {
  static java.util.Map<String,Integer> items = new java.util.HashMap<>();
  static void add(String sku) { items.put(sku, 1); }
  public static void main(String[] args) {
    add("A");
    add("A");
    System.out.println(items.get("A"));
  }
}`,
      cpp: `#include <iostream>
#include <map>
#include <string>
using namespace std;
map<string,int> items;
void add(string sku) { items[sku] = 1; }
int main() {
  add("A");
  add("A");
  cout << items["A"] << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var items = new Dictionary<string,int>();
void Add(string sku) { items[sku] = 1; }
Add("A");
Add("A");
Console.WriteLine(items["A"]);`,
      go: `package main
import "fmt"
func main() {
  items := map[string]int{}
  add := func(sku string) { items[sku] = 1 }
  add("A")
  add("A")
  fmt.Println(items["A"])
}`,
      rust: `use std::collections::HashMap;
fn add(items: &mut HashMap<&str, i32>, sku: &str) {
  items.insert(sku, 1);
}
fn main() {
  let mut items = HashMap::new();
  add(&mut items, "A");
  add(&mut items, "A");
  println!("{}", items.get("A").unwrap());
}`,
      ts: `const items: Record<string, number> = {}
function add(sku: string) { items[sku] = 1 }
add('A')
add('A')
console.log(items['A'])`,
      php: `<?php
class Cart {
  public $items = [];
  function add($sku) { $this->items[$sku] = 1; }
}
$c = new Cart();
$c->add('A');
$c->add('A');
echo $c->items['A'], PHP_EOL;`,
      rb: `class Cart
  attr_reader :items
  def initialize
    @items = {}
  end
  def add(sku)
    @items[sku] = 1
  end
end
c = Cart.new
c.add('A')
c.add('A')
puts c.items['A']`,
    },
  }),

  challenge({
    slug: 'logger-debug-leaks',
    title: 'Logger — INFO Level Still Prints DEBUG',
    difficulty: 'easy',
    bugType: 'logic',
    tags: ['logger', 'object-design', 'levels'],
    order: 33,
    description:
      'Logger LLD: min level is INFO (1); DEBUG is 0. log(DEBUG) then log(INFO) must print only INFO. DEBUG must be filtered. Print remaining lines.',
    expectedOutput: 'INFO',
    hint: 'Does log() compare the message level against min, or print unconditionally?',
    explanation:
      'Every message is printed, so DEBUG leaks. A leveled logger drops records below min. If level < min, return; otherwise print the message.',
    code: {
      py: `DEBUG, INFO = 0, 1
class Logger:
    def __init__(self, minl):
        self.minl = minl
    def log(self, level, msg):
        print(msg)
lg = Logger(INFO)
lg.log(DEBUG, 'DEBUG')
lg.log(INFO, 'INFO')`,
      java: `public class Main {
  static int DEBUG = 0, INFO = 1, min = 1;
  static void log(int level, String msg) { System.out.println(msg); }
  public static void main(String[] args) {
    log(DEBUG, "DEBUG");
    log(INFO, "INFO");
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int DEBUG = 0, INFO = 1, minL = 1;
void logMsg(int level, const char* msg) { cout << msg << endl; }
int main() {
  logMsg(DEBUG, "DEBUG");
  logMsg(INFO, "INFO");
}`,
      cs: `using System;
int DEBUG = 0, INFO = 1, minL = 1;
void Log(int level, string msg) { Console.WriteLine(msg); }
Log(DEBUG, "DEBUG");
Log(INFO, "INFO");`,
      go: `package main
import "fmt"
func main() {
  debug, info, min := 0, 1, 1
  log := func(level int, msg string) { fmt.Println(msg) }
  _ = min
  log(debug, "DEBUG")
  log(info, "INFO")
}`,
      rust: `fn log(_level: i32, _min: i32, msg: &str) { println!("{}", msg); }
fn main() {
  let min = 1;
  log(0, min, "DEBUG");
  log(1, min, "INFO");
}`,
      ts: `const DEBUG = 0, INFO = 1
const min = INFO
function log(_level: number, msg: string) { console.log(msg) }
log(DEBUG, 'DEBUG')
log(INFO, 'INFO')`,
      php: `<?php
class Logger {
  public $minl;
  function __construct($minl) { $this->minl = $minl; }
  function log($level, $msg) { echo $msg, PHP_EOL; }
}
$lg = new Logger(1);
$lg->log(0, 'DEBUG');
$lg->log(1, 'INFO');`,
      rb: `DEBUG = 0
INFO = 1
class Logger
  def initialize(minl)
    @minl = minl
  end
  def log(level, msg)
    puts msg
  end
end
lg = Logger.new(INFO)
lg.log(DEBUG, 'DEBUG')
lg.log(INFO, 'INFO')`,
    },
  }),

  challenge({
    slug: 'player-wraps-without-repeat',
    title: 'Music Player — Next on Last Song Wraps',
    difficulty: 'easy',
    bugType: 'edge-case',
    tags: ['music-player', 'state', 'playlist'],
    order: 34,
    description:
      'Music player LLD: playlist [A, B], current index 1 (song B), repeat is off. next() must print STOP rather than wrapping to A. Call next once and print the result.',
    expectedOutput: 'STOP',
    hint: 'When repeat is false and you are on the last track, should next wrap with modulo?',
    explanation:
      'next() always does (index+1) % n, so it wraps to A. Without repeat, advancing past the last song is a terminal STOP, not a circular playlist.',
    code: {
      py: `class Player:
    def __init__(self):
        self.songs = ['A', 'B']
        self.idx = 1
        self.repeat = False
    def next(self):
        self.idx = (self.idx + 1) % len(self.songs)
        return self.songs[self.idx]
print(Player().next())`,
      java: `public class Main {
  static String[] songs = {"A", "B"};
  static int idx = 1;
  static boolean repeat = false;
  static String next() {
    idx = (idx + 1) % songs.length;
    return songs[idx];
  }
  public static void main(String[] args) {
    System.out.println(next());
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string songs[] = {"A", "B"};
int idx = 1;
bool repeat = false;
string nextSong() {
  idx = (idx + 1) % 2;
  return songs[idx];
}
int main() { cout << nextSong() << endl; }`,
      cs: `using System;
string[] songs = {"A", "B"};
int idx = 1;
bool repeat = false;
string Next() {
  idx = (idx + 1) % songs.Length;
  return songs[idx];
}
Console.WriteLine(Next());`,
      go: `package main
import "fmt"
func main() {
  songs := []string{"A", "B"}
  idx := 1
  repeat := false
  next := func() string {
    idx = (idx + 1) % len(songs)
    return songs[idx]
  }
  _ = repeat
  fmt.Println(next())
}`,
      rust: `fn next_song(songs: &[&str], idx: &mut usize, _repeat: bool) -> String {
  *idx = (*idx + 1) % songs.len();
  songs[*idx].to_string()
}
fn main() {
  let songs = ["A", "B"];
  let mut idx = 1;
  println!("{}", next_song(&songs, &mut idx, false));
}`,
      ts: `const songs = ['A', 'B']
let idx = 1
const repeat = false
function next() {
  idx = (idx + 1) % songs.length
  return songs[idx]
}
console.log(next())`,
      php: `<?php
class Player {
  public $songs = ['A', 'B'];
  public $idx = 1;
  public $repeat = false;
  function next() {
    $this->idx = ($this->idx + 1) % count($this->songs);
    return $this->songs[$this->idx];
  }
}
echo (new Player())->next(), PHP_EOL;`,
      rb: `class Player
  def initialize
    @songs = ['A', 'B']
    @idx = 1
    @repeat = false
  end
  def next_song
    @idx = (@idx + 1) % @songs.length
    @songs[@idx]
  end
end
puts Player.new.next_song`,
    },
  }),
]
