import 'dotenv/config'
import { connectDB } from '../config/db'
import { DebuggerChallenge } from '../models/learn/debugger-challenge.model'

const challenges = [
  // ─── 1 ── Observer — Missing Last Subscriber ──────────────────────────────
  {
    slug: 'observer-missing-last',
    title: 'News Agency Notification',
    difficulty: 'easy',
    bugType: 'off-by-one',
    description: 'A NewsAgency publishes updates to all its subscribers. When Alice, Bob, and Charlie are subscribed and news is published, each subscriber should receive a notification.',
    testInput: '',
    expectedOutput: 'Alice notified\nBob notified\nCharlie notified',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class NewsAgency:
    def __init__(self):
        self.observers = []
    def subscribe(self, name):
        self.observers.append(name)
    def publish(self, news):
        for i in range(len(self.observers) - 1):
            print(f"{self.observers[i]} notified")

agency = NewsAgency()
agency.subscribe("Alice")
agency.subscribe("Bob")
agency.subscribe("Charlie")
agency.publish("Breaking news!")`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `import java.util.*;
public class Main {
    static List<String> observers = new ArrayList<>();
    static void subscribe(String name) { observers.add(name); }
    static void publish(String news) {
        for (int i = 0; i < observers.size() - 1; i++) {
            System.out.println(observers.get(i) + " notified");
        }
    }
    public static void main(String[] args) {
        subscribe("Alice"); subscribe("Bob"); subscribe("Charlie");
        publish("Breaking news!");
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
vector<string> observers;
void subscribe(string name) { observers.push_back(name); }
void publish(string news) {
    for (int i = 0; i < (int)observers.size() - 1; i++) {
        cout << observers[i] << " notified" << endl;
    }
}
int main() {
    subscribe("Alice"); subscribe("Bob"); subscribe("Charlie");
    publish("Breaking news!");
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
using System.Collections.Generic;
var observers = new List<string>();
void Subscribe(string name) => observers.Add(name);
void Publish(string news) {
    for (int i = 0; i < observers.Count - 1; i++)
        Console.WriteLine(observers[i] + " notified");
}
Subscribe("Alice"); Subscribe("Bob"); Subscribe("Charlie");
Publish("Breaking news!");`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
func main() {
    observers := []string{"Alice", "Bob", "Charlie"}
    for i := 0; i < len(observers)-1; i++ {
        fmt.Println(observers[i] + " notified")
    }
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `fn main() {
    let observers = vec!["Alice", "Bob", "Charlie"];
    for i in 0..observers.len()-1 {
        println!("{} notified", observers[i]);
    }
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `const observers = ["Alice", "Bob", "Charlie"];
for (let i = 0; i < observers.length - 1; i++) {
  console.log(observers[i] + " notified");
}`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
$observers = ["Alice", "Bob", "Charlie"];
for ($i = 0; $i < count($observers) - 1; $i++) {
    echo $observers[$i] . " notified\\n";
}`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `observers = ["Alice", "Bob", "Charlie"]
(observers.length - 1).times do |i|
  puts "#{observers[i]} notified"
end`,
      },
    ],
    hint: 'How many observers does your loop visit? Check the upper bound of the loop.',
    explanation: 'The loop uses len(self.observers) - 1 which misses the last subscriber (Charlie). Remove the -1: use len(self.observers) or simply "for obs in self.observers".',
    tags: ['design-patterns', 'observer'],
    status: 'published',
    order: 1,
  },

  // ─── 2 ── Strategy — Wrong Discount Applied ───────────────────────────────
  {
    slug: 'strategy-wrong-selection',
    title: 'Membership Pricing',
    difficulty: 'easy',
    bugType: 'logic',
    description: 'A pricing system applies discounts based on membership type. Premium members receive 20% off their order (pay 80%), while Regular members receive 10% off (pay 90%). For a premium member with a $100 order, print the final price.',
    testInput: 'premium 100',
    expectedOutput: '80.0',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `def calculate_price(member_type, amount):
    if member_type == "regular":
        return amount * 0.8
    return amount * 0.9

parts = input().split()
print(calculate_price(parts[0], float(parts[1])))`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `import java.util.Scanner;
public class Main {
    static double calculate(String type, double amount) {
        if (type.equals("regular")) return amount * 0.8;
        return amount * 0.9;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println(calculate(sc.next(), sc.nextDouble()));
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
#include <string>
#include <cstdio>
using namespace std;
int main() {
    string type; double amount;
    cin >> type >> amount;
    if (type == "regular") printf("%.1f\\n", amount * 0.8);
    else printf("%.1f\\n", amount * 0.9);
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
var parts = Console.ReadLine()!.Split();
string type = parts[0]; double amount = double.Parse(parts[1]);
Console.WriteLine((type == "regular" ? amount * 0.8 : amount * 0.9).ToString("0.0"));`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
func main() {
    var t string; var a float64
    fmt.Scan(&t, &a)
    if t == "regular" { fmt.Printf("%.1f\\n", a*0.8) } else { fmt.Printf("%.1f\\n", a*0.9) }
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `use std::io;
fn main() {
    let mut s = String::new(); io::stdin().read_line(&mut s).unwrap();
    let mut it = s.trim().split_whitespace();
    let t = it.next().unwrap();
    let a: f64 = it.next().unwrap().parse().unwrap();
    if t == "regular" { println!("{:.1}", a*0.8); } else { println!("{:.1}", a*0.9); }
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `const [t, a] = prompt()!.split(' ');
const amount = parseFloat(a);
console.log(t === 'regular' ? (amount * 0.8).toFixed(1) : (amount * 0.9).toFixed(1));`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
[$t, $a] = explode(' ', trim(fgets(STDIN)));
$a = (float)$a;
echo number_format($t === 'regular' ? $a * 0.8 : $a * 0.9, 1) . "\\n";`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `t, a = gets.split
a = a.to_f
puts "%.1f" % (t == 'regular' ? a * 0.8 : a * 0.9)`,
      },
    ],
    hint: 'Check the condition that selects the discount strategy. Is the string comparison correct?',
    explanation: 'The condition `if member_type == "regular"` applies the premium (20%) discount to regular members and vice versa. Swap the condition to `if member_type == "premium"`.',
    tags: ['design-patterns', 'strategy', 'oop'],
    status: 'published',
    order: 2,
  },

  // ─── 3 ── Singleton — Counter Reset ──────────────────────────────────────
  {
    slug: 'singleton-new-every-time',
    title: 'Shared Counter',
    difficulty: 'easy',
    bugType: 'logic',
    description: 'A Singleton Counter is shared across the application. The counter is retrieved three times and incremented each time. After all three increments, print the final count.',
    testInput: '',
    expectedOutput: '3',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class Counter:
    _instance = None
    def __init__(self): self.count = 0
    @classmethod
    def get_instance(cls):
        cls._instance = Counter()
        return cls._instance

Counter.get_instance().count += 1
Counter.get_instance().count += 1
Counter.get_instance().count += 1
print(Counter.get_instance().count)`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `public class Main {
    static Main instance = null;
    int count = 0;
    static Main getInstance() {
        instance = new Main();
        return instance;
    }
    public static void main(String[] args) {
        getInstance().count++;
        getInstance().count++;
        getInstance().count++;
        System.out.println(getInstance().count);
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
using namespace std;
class Counter {
public:
    static Counter* instance;
    int count = 0;
    static Counter* getInstance() {
        instance = new Counter();
        return instance;
    }
};
Counter* Counter::instance = nullptr;
int main() {
    Counter::getInstance()->count++;
    Counter::getInstance()->count++;
    Counter::getInstance()->count++;
    cout << Counter::getInstance()->count << endl;
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
class Counter {
    static Counter? _inst;
    public int Count = 0;
    public static Counter GetInstance() {
        _inst = new Counter();
        return _inst;
    }
}
Counter.GetInstance().Count++;
Counter.GetInstance().Count++;
Counter.GetInstance().Count++;
Console.WriteLine(Counter.GetInstance().Count);`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
type Counter struct{ count int }
var instance *Counter
func getInstance() *Counter {
    instance = &Counter{}
    return instance
}
func main() {
    getInstance().count++
    getInstance().count++
    getInstance().count++
    fmt.Println(getInstance().count)
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `use std::cell::RefCell;
thread_local! { static COUNT: RefCell<i32> = RefCell::new(0); }
fn get_instance_and_increment() {
    COUNT.with(|c| *c.borrow_mut() = 0 + 1);
}
fn main() {
    get_instance_and_increment();
    get_instance_and_increment();
    get_instance_and_increment();
    COUNT.with(|c| println!("{}", *c.borrow()));
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `class Counter {
  static instance: Counter | null = null;
  count = 0;
  static getInstance(): Counter {
    Counter.instance = new Counter();
    return Counter.instance;
  }
}
Counter.getInstance().count++;
Counter.getInstance().count++;
Counter.getInstance().count++;
console.log(Counter.getInstance().count);`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
class Counter {
    private static ?Counter $inst = null;
    public int $count = 0;
    public static function getInstance(): Counter {
        self::$inst = new Counter();
        return self::$inst;
    }
}
Counter::getInstance()->count++;
Counter::getInstance()->count++;
Counter::getInstance()->count++;
echo Counter::getInstance()->count . "\\n";`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `class Counter
  @@instance = nil
  attr_accessor :count
  def initialize; @count = 0; end
  def self.instance
    @@instance = Counter.new
    @@instance
  end
end
Counter.instance.count += 1
Counter.instance.count += 1
Counter.instance.count += 1
puts Counter.instance.count`,
      },
    ],
    hint: 'Should get_instance() always create a new Counter? When should it create one?',
    explanation: 'get_instance() creates a new Counter every call instead of returning the existing one. The guard `if cls._instance is None` is missing — add it so a new instance is only created the first time.',
    tags: ['design-patterns', 'singleton', 'oop'],
    status: 'published',
    order: 3,
  },

  // ─── 4 ── Decorator — Coffee Cost Missing Base ────────────────────────────
  {
    slug: 'decorator-base-not-chained',
    title: 'Coffee Order Pricing',
    difficulty: 'easy',
    bugType: 'logic',
    description: 'A coffee shop calculates order prices using decorators. A base coffee costs $5. Adding milk costs an extra $1. Adding sugar costs an extra $0.50. Print the total price of a coffee with milk and sugar.',
    testInput: '',
    expectedOutput: '6.5',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class Coffee:
    def cost(self): return 5

class MilkDecorator:
    def __init__(self, c): self.component = c
    def cost(self): return 1

class SugarDecorator:
    def __init__(self, c): self.component = c
    def cost(self): return 0.5

drink = SugarDecorator(MilkDecorator(Coffee()))
print(drink.cost())`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `public class Main {
    interface Drink { double cost(); }
    static class Coffee implements Drink { public double cost() { return 5; } }
    static class Milk implements Drink {
        Drink d; Milk(Drink d){this.d=d;}
        public double cost() { return 1; }
    }
    static class Sugar implements Drink {
        Drink d; Sugar(Drink d){this.d=d;}
        public double cost() { return 0.5; }
    }
    public static void main(String[] args) {
        System.out.println(new Sugar(new Milk(new Coffee())).cost());
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
using namespace std;
struct Drink { virtual double cost() = 0; };
struct Coffee : Drink { double cost() { return 5; } };
struct Milk : Drink {
    Drink* d; Milk(Drink* d): d(d){}
    double cost() { return 1; }
};
struct Sugar : Drink {
    Drink* d; Sugar(Drink* d): d(d){}
    double cost() { return 0.5; }
};
int main() {
    Drink* drink = new Sugar(new Milk(new Coffee()));
    cout << drink->cost() << endl;
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
interface IDrink { double Cost(); }
class Coffee : IDrink { public double Cost() => 5; }
class Milk : IDrink {
    IDrink _d; public Milk(IDrink d){_d=d;}
    public double Cost() => 1;
}
class Sugar : IDrink {
    IDrink _d; public Sugar(IDrink d){_d=d;}
    public double Cost() => 0.5;
}
Console.WriteLine(new Sugar(new Milk(new Coffee())).Cost());`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
type Drink interface{ Cost() float64 }
type Coffee struct{}
func(c Coffee)Cost()float64{return 5}
type Milk struct{D Drink}
func(m Milk)Cost()float64{return 1}
type Sugar struct{D Drink}
func(s Sugar)Cost()float64{return 0.5}
func main(){fmt.Println(Sugar{D:Milk{D:Coffee{}}}.Cost())}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `trait Drink { fn cost(&self) -> f64; }
struct Coffee;
impl Drink for Coffee { fn cost(&self) -> f64 { 5.0 } }
struct Milk<D: Drink>(D);
impl<D: Drink> Drink for Milk<D> { fn cost(&self) -> f64 { 1.0 } }
struct Sugar<D: Drink>(D);
impl<D: Drink> Drink for Sugar<D> { fn cost(&self) -> f64 { 0.5 } }
fn main() { println!("{}", Sugar(Milk(Coffee)).cost()); }`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `interface Drink { cost(): number; }
class Coffee implements Drink { cost() { return 5; } }
class Milk implements Drink {
  constructor(private d: Drink) {}
  cost() { return 1; }
}
class Sugar implements Drink {
  constructor(private d: Drink) {}
  cost() { return 0.5; }
}
console.log(new Sugar(new Milk(new Coffee())).cost());`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
interface Drink { public function cost(): float; }
class Coffee implements Drink { public function cost(): float { return 5; } }
class Milk implements Drink {
    function __construct(private Drink $d){}
    public function cost(): float { return 1; }
}
class Sugar implements Drink {
    function __construct(private Drink $d){}
    public function cost(): float { return 0.5; }
}
echo (new Sugar(new Milk(new Coffee())))->cost() . "\\n";`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `class Coffee; def cost; 5; end; end
class Milk
  def initialize(d); @d = d; end
  def cost; 1; end
end
class Sugar
  def initialize(d); @d = d; end
  def cost; 0.5; end
end
puts Sugar.new(Milk.new(Coffee.new)).cost`,
      },
    ],
    hint: 'Does the decorator correctly add its cost ON TOP of the wrapped component cost?',
    explanation: 'The decorator should return self.component.cost() + self.extra, not just self.extra. Without calling the wrapped component, the base coffee cost ($5) is lost.',
    tags: ['design-patterns', 'decorator', 'oop'],
    status: 'published',
    order: 4,
  },

  // ─── 5 ── Factory — Wrong Shape Created ──────────────────────────────────
  {
    slug: 'factory-wrong-type',
    title: 'Shape Area Calculator',
    difficulty: 'easy',
    bugType: 'logic',
    description: 'A ShapeFactory creates shapes by name and returns their area. For a circle with radius 5, the area is π × r² ≈ 78.54. Print the area rounded to 2 decimal places.',
    testInput: 'circle 5',
    expectedOutput: '78.54',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `import math
class Circle:
    def __init__(self, r): self.r = r
    def area(self): return round(math.pi * self.r * self.r, 2)

class Rectangle:
    def __init__(self, r): self.r = r
    def area(self): return self.r * self.r

def create_shape(name, size):
    if name == "rectangle":
        return Circle(size)
    return Rectangle(size)

parts = input().split()
print(create_shape(parts[0], float(parts[1])).area())`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `import java.util.Scanner;
public class Main {
    static double area(String name, double size) {
        if (name.equals("rectangle"))
            return Math.round(Math.PI * size * size * 100.0) / 100.0;
        return size * size;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println(area(sc.next(), sc.nextDouble()));
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
#include <cmath>
#include <string>
using namespace std;
int main() {
    string name; double size;
    cin >> name >> size;
    if (name == "rectangle") {
        printf("%.2f\\n", M_PI * size * size);
    } else {
        printf("%.2f\\n", size * size);
    }
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
var p = Console.ReadLine()!.Split();
string name = p[0]; double size = double.Parse(p[1]);
Console.WriteLine(name == "rectangle"
    ? Math.Round(Math.PI * size * size, 2)
    : size * size);`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import ("fmt";"math")
func main() {
    var name string; var size float64
    fmt.Scan(&name, &size)
    if name == "rectangle" {
        fmt.Printf("%.2f\\n", math.Pi*size*size)
    } else {
        fmt.Printf("%.2f\\n", size*size)
    }
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `use std::io;
use std::f64::consts::PI;
fn main() {
    let mut s = String::new(); io::stdin().read_line(&mut s).unwrap();
    let mut it = s.trim().split_whitespace();
    let name = it.next().unwrap();
    let size: f64 = it.next().unwrap().parse().unwrap();
    if name == "rectangle" {
        println!("{:.2}", PI * size * size);
    } else {
        println!("{:.2}", size * size);
    }
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `const [name, s] = prompt()!.split(' ');
const size = parseFloat(s);
if (name === 'rectangle') {
  console.log((Math.PI * size * size).toFixed(2));
} else {
  console.log((size * size).toFixed(2));
}`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
[$name, $size] = explode(' ', trim(fgets(STDIN)));
$size = (float)$size;
if ($name === 'rectangle') {
    echo number_format(M_PI * $size * $size, 2) . "\\n";
} else {
    echo number_format($size * $size, 2) . "\\n";
}`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `name, size = gets.split
size = size.to_f
if name == 'rectangle'
  puts (Math::PI * size * size).round(2)
else
  puts (size * size).round(2)
end`,
      },
    ],
    hint: 'Check the factory condition. Does "circle" actually create a Circle?',
    explanation: 'The condition `if shape == "rectangle"` when creating a Circle means the circle branch is never taken for a "circle" input. Change `"rectangle"` to `"circle"` in that condition.',
    tags: ['design-patterns', 'factory', 'oop'],
    status: 'published',
    order: 5,
  },

  // ─── 6 ── Chain of Responsibility — Handler Never Passes ─────────────────
  {
    slug: 'chain-never-passes',
    title: 'Expense Approval System',
    difficulty: 'medium',
    bugType: 'logic',
    description: 'An expense approval system routes requests through a chain: TeamLead (up to $500), Manager (up to $2000), Director (up to $5000). A $1500 request should be approved at the correct level.',
    testInput: '1500',
    expectedOutput: 'Manager approved',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class TeamLead:
    def __init__(self, nxt): self.nxt = nxt
    def handle(self, amount):
        if amount <= 500:
            print("TeamLead approved")

class Manager:
    def __init__(self, nxt): self.nxt = nxt
    def handle(self, amount):
        if amount <= 2000:
            print("Manager approved")
        else:
            self.nxt.handle(amount)

class Director:
    def handle(self, amount):
        if amount <= 5000:
            print("Director approved")
        else:
            print("Rejected")

director = Director()
manager = Manager(director)
lead = TeamLead(manager)
lead.handle(int(input()))`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `import java.util.Scanner;
public class Main {
    interface Handler { void handle(int amt); }
    static class TeamLead implements Handler {
        Handler next; TeamLead(Handler n){next=n;}
        public void handle(int amt) {
            if(amt<=500) System.out.println("TeamLead approved");
        }
    }
    static class Manager implements Handler {
        Handler next; Manager(Handler n){next=n;}
        public void handle(int amt) {
            if(amt<=2000) System.out.println("Manager approved");
            else next.handle(amt);
        }
    }
    static class Director implements Handler {
        public void handle(int amt) {
            System.out.println(amt<=5000?"Director approved":"Rejected");
        }
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Handler chain = new TeamLead(new Manager(new Director()));
        chain.handle(sc.nextInt());
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
using namespace std;
struct Handler { virtual void handle(int amt) = 0; };
struct Director : Handler {
    void handle(int amt){ cout<<(amt<=5000?"Director approved":"Rejected")<<endl; }
};
struct Manager : Handler {
    Handler* next; Manager(Handler* n):next(n){}
    void handle(int amt){ if(amt<=2000) cout<<"Manager approved"<<endl; else next->handle(amt); }
};
struct TeamLead : Handler {
    Handler* next; TeamLead(Handler* n):next(n){}
    void handle(int amt){
        if(amt<=500) cout<<"TeamLead approved"<<endl;
    }
};
int main(){
    int amt; cin>>amt;
    Director d; Manager m(&d); TeamLead t(&m);
    t.handle(amt);
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
int amt = int.Parse(Console.ReadLine()!);
Action<int> director = a => Console.WriteLine(a <= 5000 ? "Director approved" : "Rejected");
Action<int> manager = a => { if (a <= 2000) Console.WriteLine("Manager approved"); else director(a); };
Action<int> lead = a => { if (a <= 500) Console.WriteLine("TeamLead approved"); };
lead(amt);`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
func main() {
    director := func(amt int) {
        if amt <= 5000 { fmt.Println("Director approved") } else { fmt.Println("Rejected") }
    }
    manager := func(amt int) {
        if amt <= 2000 { fmt.Println("Manager approved") } else { director(amt) }
    }
    lead := func(amt int) {
        if amt <= 500 { fmt.Println("TeamLead approved") }
    }
    var amt int; fmt.Scan(&amt)
    lead(amt)
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `use std::io;
fn director(amt: i32) {
    if amt <= 5000 { println!("Director approved"); } else { println!("Rejected"); }
}
fn manager(amt: i32) {
    if amt <= 2000 { println!("Manager approved"); } else { director(amt); }
}
fn team_lead(amt: i32) {
    if amt <= 500 { println!("TeamLead approved"); }
}
fn main() {
    let mut s = String::new(); io::stdin().read_line(&mut s).unwrap();
    let amt: i32 = s.trim().parse().unwrap();
    team_lead(amt);
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `const amt = parseInt(prompt()!);
const director = (a: number) => console.log(a <= 5000 ? 'Director approved' : 'Rejected');
const manager = (a: number) => { if (a <= 2000) console.log('Manager approved'); else director(a); };
const lead = (a: number) => { if (a <= 500) console.log('TeamLead approved'); };
lead(amt);`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
$amt = intval(trim(fgets(STDIN)));
function director($a) { echo ($a <= 5000 ? "Director approved" : "Rejected") . "\\n"; }
function manager($a) { if ($a <= 2000) echo "Manager approved\\n"; else director($a); }
function lead($a) { if ($a <= 500) echo "TeamLead approved\\n"; }
lead($amt);`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `amt = gets.to_i
director = ->(a) { puts a <= 5000 ? 'Director approved' : 'Rejected' }
manager = ->(a) { a <= 2000 ? puts('Manager approved') : director.call(a) }
lead = ->(a) { puts 'TeamLead approved' if a <= 500 }
lead.call(amt)`,
      },
    ],
    hint: 'Does the TeamLead handler ever forward the request to the next handler?',
    explanation: 'The TeamLead handler returns without calling next_handler.handle() when the amount exceeds its limit. Add an else clause that forwards to the next handler.',
    tags: ['design-patterns', 'chain-of-responsibility', 'oop'],
    status: 'published',
    order: 6,
  },

  // ─── 7 ── Parking Lot — Wrong Available Spaces ────────────────────────────
  {
    slug: 'parking-lot-wrong-count',
    title: 'Parking Lot Manager',
    difficulty: 'easy',
    bugType: 'logic',
    description: 'A parking lot starts with 5 available spaces. After 3 cars park, print how many spaces remain.',
    testInput: '5 3',
    expectedOutput: '2',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class ParkingLot:
    def __init__(self, total):
        self.available = total
    def park(self):
        self.available += 1

parts = input().split()
total, cars = int(parts[0]), int(parts[1])
lot = ParkingLot(total)
for _ in range(cars):
    lot.park()
print(lot.available)`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `import java.util.Scanner;
public class Main {
    static int available;
    static void park() { available++; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        available = sc.nextInt(); int cars = sc.nextInt();
        for(int i=0;i<cars;i++) park();
        System.out.println(available);
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
using namespace std;
int available;
void park() { available++; }
int main() {
    int cars; cin >> available >> cars;
    for(int i=0;i<cars;i++) park();
    cout << available << endl;
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
var p = Console.ReadLine()!.Split();
int available = int.Parse(p[0]), cars = int.Parse(p[1]);
for (int i = 0; i < cars; i++) available++;
Console.WriteLine(available);`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
func main() {
    var available, cars int
    fmt.Scan(&available, &cars)
    for i := 0; i < cars; i++ { available++ }
    fmt.Println(available)
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `use std::io;
fn main() {
    let mut s = String::new(); io::stdin().read_line(&mut s).unwrap();
    let mut it = s.trim().split_whitespace();
    let mut available: i32 = it.next().unwrap().parse().unwrap();
    let cars: i32 = it.next().unwrap().parse().unwrap();
    for _ in 0..cars { available += 1; }
    println!("{}", available);
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `const [total, cars] = prompt()!.split(' ').map(Number);
let available = total;
for (let i = 0; i < cars; i++) available++;
console.log(available);`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
[$total, $cars] = array_map('intval', explode(' ', trim(fgets(STDIN))));
$available = $total;
for ($i = 0; $i < $cars; $i++) $available++;
echo $available . "\\n";`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `total, cars = gets.split.map(&:to_i)
available = total
cars.times { available += 1 }
puts available`,
      },
    ],
    hint: 'When a car parks, should available spaces increase or decrease?',
    explanation: 'The park() method increments available instead of decrementing it. Parking a car TAKES a space, so change += 1 to -= 1.',
    tags: ['oop', 'object-design', 'state'],
    status: 'published',
    order: 7,
  },

  // ─── 8 ── LRU Cache — Wrong Eviction Order ───────────────────────────────
  {
    slug: 'lru-cache-wrong-eviction',
    title: 'LRU Cache',
    difficulty: 'medium',
    bugType: 'logic',
    description: 'An LRU cache with capacity 2. Insert key 1 (value A), key 2 (value B). Access key 1. Insert key 3 (value C). Print the result of looking up key 2, then key 1.',
    testInput: '',
    expectedOutput: 'MISS\nA',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `from collections import OrderedDict
class LRUCache:
    def __init__(self, cap): self.cap = cap; self.cache = OrderedDict()
    def get(self, key):
        if key not in self.cache: return "MISS"
        self.cache.move_to_end(key)
        return self.cache[key]
    def put(self, key, val):
        if key in self.cache: self.cache.move_to_end(key)
        self.cache[key] = val
        if len(self.cache) > self.cap:
            self.cache.popitem(last=True)

cache = LRUCache(2)
cache.put(1, 'A')
cache.put(2, 'B')
cache.get(1)
cache.put(3, 'C')
print(cache.get(2))
print(cache.get(1))`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `import java.util.*;
public class Main {
    static LinkedHashMap<Integer,String> cache = new LinkedHashMap<>();
    static int cap = 2;
    static String lget(int k){
        if(!cache.containsKey(k)) return "MISS";
        String v=cache.remove(k); cache.put(k,v); return v;
    }
    static void lput(int k,String v){
        cache.remove(k); cache.put(k,v);
        if(cache.size()>cap){
            Integer lastKey=null;
            for(Integer key:cache.keySet()) lastKey=key;
            cache.remove(lastKey);
        }
    }
    public static void main(String[] args){
        lput(1,"A"); lput(2,"B"); lget(1); lput(3,"C");
        System.out.println(lget(2));
        System.out.println(lget(1));
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <algorithm>
using namespace std;
vector<int> keys;
map<int,string> vals;
int cap=2;
string lget(int k){
    if(!vals.count(k)) return "MISS";
    keys.erase(find(keys.begin(),keys.end(),k)); keys.push_back(k);
    return vals[k];
}
void lput(int k,string v){
    if(vals.count(k)) keys.erase(find(keys.begin(),keys.end(),k));
    keys.push_back(k); vals[k]=v;
    if((int)keys.size()>cap){
        int last=keys.back();
        vals.erase(last); keys.pop_back();
    }
}
int main(){
    lput(1,"A"); lput(2,"B"); lget(1); lput(3,"C");
    cout<<lget(2)<<"\\n"<<lget(1)<<endl;
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
using System.Collections.Generic;
var keys=new List<int>(); var vals=new Dictionary<int,string>(); int cap=2;
string LGet(int k){
    if(!vals.ContainsKey(k)) return "MISS";
    keys.Remove(k); keys.Add(k); return vals[k];
}
void LPut(int k,string v){
    if(vals.ContainsKey(k)) keys.Remove(k);
    keys.Add(k); vals[k]=v;
    if(keys.Count>cap){
        int last=keys[keys.Count-1];
        vals.Remove(last); keys.RemoveAt(keys.Count-1);
    }
}
LPut(1,"A"); LPut(2,"B"); LGet(1); LPut(3,"C");
Console.WriteLine(LGet(2));
Console.WriteLine(LGet(1));`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
var keys []int
var vals=map[int]string{}
const cap=2
func lget(k int)string{
    v,ok:=vals[k]; if !ok{return "MISS"}
    for i,key:=range keys{if key==k{keys=append(keys[:i],keys[i+1:]...);break}}
    keys=append(keys,k); return v
}
func lput(k int,v string){
    if _,ok:=vals[k];ok{for i,key:=range keys{if key==k{keys=append(keys[:i],keys[i+1:]...);break}}}
    keys=append(keys,k); vals[k]=v
    if len(keys)>cap{
        last:=keys[len(keys)-1]
        delete(vals,last); keys=keys[:len(keys)-1]
    }
}
func main(){
    lput(1,"A"); lput(2,"B"); lget(1); lput(3,"C")
    fmt.Println(lget(2)); fmt.Println(lget(1))
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `use std::collections::HashMap;
struct Cache{cap:usize,order:Vec<i32>,map:HashMap<i32,String>}
impl Cache{
    fn new(c:usize)->Self{Cache{cap:c,order:vec![],map:HashMap::new()}}
    fn get(&mut self,k:i32)->String{
        if !self.map.contains_key(&k){return "MISS".to_string()}
        let p=self.order.iter().position(|&x|x==k).unwrap();
        self.order.remove(p); self.order.push(k);
        self.map[&k].clone()
    }
    fn put(&mut self,k:i32,v:String){
        if self.map.contains_key(&k){let p=self.order.iter().position(|&x|x==k).unwrap();self.order.remove(p);}
        self.order.push(k); self.map.insert(k,v);
        if self.order.len()>self.cap{
            let last=*self.order.last().unwrap();
            self.map.remove(&last);
            let p=self.order.iter().position(|&x|x==last).unwrap();
            self.order.remove(p);
        }
    }
}
fn main(){
    let mut c=Cache::new(2);
    c.put(1,"A".to_string()); c.put(2,"B".to_string()); c.get(1); c.put(3,"C".to_string());
    println!("{}",c.get(2)); println!("{}",c.get(1));
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `const keys: number[] = [];
const vals = new Map<number, string>();
const cap = 2;
function lget(k: number): string {
  if (!vals.has(k)) return 'MISS';
  keys.splice(keys.indexOf(k), 1); keys.push(k);
  return vals.get(k)!;
}
function lput(k: number, v: string): void {
  if (vals.has(k)) keys.splice(keys.indexOf(k), 1);
  keys.push(k); vals.set(k, v);
  if (keys.length > cap) {
    const last = keys[keys.length - 1];
    vals.delete(last); keys.splice(keys.length - 1, 1);
  }
}
lput(1,'A'); lput(2,'B'); lget(1); lput(3,'C');
console.log(lget(2)); console.log(lget(1));`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
$keys=[]; $vals=[]; $cap=2;
function lget($k){
    global $keys,$vals;
    if(!isset($vals[$k])) return 'MISS';
    $idx=array_search($k,$keys); array_splice($keys,$idx,1); $keys[]=$k;
    return $vals[$k];
}
function lput($k,$v){
    global $keys,$vals,$cap;
    if(isset($vals[$k])){$idx=array_search($k,$keys);array_splice($keys,$idx,1);}
    $keys[]=$k; $vals[$k]=$v;
    if(count($keys)>$cap){
        $last=$keys[count($keys)-1];
        unset($vals[$last]); array_pop($keys);
    }
}
lput(1,'A'); lput(2,'B'); lget(1); lput(3,'C');
echo lget(2)."\\n"; echo lget(1)."\\n";`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `$keys=[]; $vals={}; $cap=2
def lget(k)
  return 'MISS' unless $vals.key?(k)
  $keys.delete(k); $keys.push(k); $vals[k]
end
def lput(k,v)
  $keys.delete(k) if $vals.key?(k)
  $keys.push(k); $vals[k]=v
  if $keys.length>$cap
    last=$keys.last
    $vals.delete(last); $keys.delete(last)
  end
end
lput(1,'A'); lput(2,'B'); lget(1); lput(3,'C')
puts lget(2); puts lget(1)`,
      },
    ],
    hint: 'When evicting, are you removing the LEAST recently used entry or the most recently used?',
    explanation: 'The eviction removes the last entry (most recently used) instead of the first (least recently used). LRU evicts the entry accessed LEAST recently — change keys.back()/last to keys.front()/first.',
    tags: ['oop', 'caching', 'lru', 'object-design'],
    status: 'published',
    order: 8,
  },

  // ─── 9 ── State Pattern — Wrong State Transition ──────────────────────────
  {
    slug: 'state-wrong-transition',
    title: 'Traffic Light Controller',
    difficulty: 'easy',
    bugType: 'logic',
    description: 'A traffic light cycles through states: Red → Green → Yellow → Red. Starting from Red, print the state after 3 transitions.',
    testInput: '',
    expectedOutput: 'Red',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class TrafficLight:
    def __init__(self): self.state = "Red"
    def next(self):
        if self.state == "Red": self.state = "Green"
        elif self.state == "Green": self.state = "Yellow"
        elif self.state == "Yellow": self.state = "Yellow"

light = TrafficLight()
for _ in range(3): light.next()
print(light.state)`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `public class Main {
    static String state = "Red";
    static void next() {
        if(state.equals("Red")) state="Green";
        else if(state.equals("Green")) state="Yellow";
        else if(state.equals("Yellow")) state="Yellow";
    }
    public static void main(String[] args) {
        for(int i=0;i<3;i++) next();
        System.out.println(state);
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
#include <string>
using namespace std;
int main() {
    string state="Red";
    for(int i=0;i<3;i++){
        if(state=="Red") state="Green";
        else if(state=="Green") state="Yellow";
        else if(state=="Yellow") state="Yellow";
    }
    cout<<state<<endl;
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
string state="Red";
for(int i=0;i<3;i++){
    if(state=="Red") state="Green";
    else if(state=="Green") state="Yellow";
    else if(state=="Yellow") state="Yellow";
}
Console.WriteLine(state);`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
func main() {
    state:="Red"
    for i:=0;i<3;i++{
        if state=="Red"{state="Green"}else if state=="Green"{state="Yellow"}else if state=="Yellow"{state="Yellow"}
    }
    fmt.Println(state)
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `fn main() {
    let mut state="Red";
    for _ in 0..3 {
        state=match state{
            "Red"=>"Green",
            "Green"=>"Yellow",
            "Yellow"=>"Yellow",
            _=>state,
        };
    }
    println!("{}",state);
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `let state = 'Red';
for (let i = 0; i < 3; i++) {
  if (state === 'Red') state = 'Green';
  else if (state === 'Green') state = 'Yellow';
  else if (state === 'Yellow') state = 'Yellow';
}
console.log(state);`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
$state='Red';
for($i=0;$i<3;$i++){
    if($state==='Red') $state='Green';
    elseif($state==='Green') $state='Yellow';
    elseif($state==='Yellow') $state='Yellow';
}
echo $state."\\n";`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `state='Red'
3.times do
  state=case state
  when 'Red' then 'Green'
  when 'Green' then 'Yellow'
  when 'Yellow' then 'Yellow'
  else state
  end
end
puts state`,
      },
    ],
    hint: 'Trace through the transitions. Does Yellow correctly transition to Red?',
    explanation: 'Yellow transitions to Yellow again instead of Red. Fix: the Yellow state\'s next() should return "Red", not "Yellow", to complete the cycle.',
    tags: ['design-patterns', 'state-machine', 'oop'],
    status: 'published',
    order: 9,
  },

  // ─── 10 ── Template Method — Steps Out of Order ───────────────────────────
  {
    slug: 'template-method-wrong-order',
    title: 'Data Pipeline',
    difficulty: 'easy',
    bugType: 'logic',
    description: 'A data processing pipeline runs three steps in a fixed order: validating, transforming, then saving. Print each step as it executes.',
    testInput: '',
    expectedOutput: 'validating\ntransforming\nsaving',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class Pipeline:
    def validate(self): print("validating")
    def transform(self): print("transforming")
    def save(self): print("saving")
    def run(self):
        self.validate()
        self.save()
        self.transform()

Pipeline().run()`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `public class Main {
    static void validate(){System.out.println("validating");}
    static void transform(){System.out.println("transforming");}
    static void save(){System.out.println("saving");}
    static void run(){validate();save();transform();}
    public static void main(String[] args){run();}
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
using namespace std;
void validate(){cout<<"validating"<<endl;}
void transform(){cout<<"transforming"<<endl;}
void save(){cout<<"saving"<<endl;}
void run(){validate();save();transform();}
int main(){run();}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
void Validate(){Console.WriteLine("validating");}
void Transform(){Console.WriteLine("transforming");}
void Save(){Console.WriteLine("saving");}
void Run(){Validate();Save();Transform();}
Run();`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
func validate(){fmt.Println("validating")}
func transform(){fmt.Println("transforming")}
func save(){fmt.Println("saving")}
func run(){validate();save();transform()}
func main(){run()}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `fn validate(){println!("validating");}
fn transform(){println!("transforming");}
fn save(){println!("saving");}
fn run(){validate();save();transform();}
fn main(){run();}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `const validate = () => console.log('validating');
const transform = () => console.log('transforming');
const save = () => console.log('saving');
const run = () => { validate(); save(); transform(); };
run();`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
function validate(){echo "validating\\n";}
function transform(){echo "transforming\\n";}
function save(){echo "saving\\n";}
function run(){validate();save();transform();}
run();`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `def validate; puts 'validating'; end
def transform; puts 'transforming'; end
def save; puts 'saving'; end
def run; validate; save; transform; end
run`,
      },
    ],
    hint: 'In what order does the template method call the steps?',
    explanation: 'The template method calls save() before transform(). The correct order is validate() → transform() → save(). Swap the last two calls.',
    tags: ['design-patterns', 'template-method', 'oop'],
    status: 'published',
    order: 10,
  },

  // ─── 11 ── Command Pattern — Undo Not Applied ─────────────────────────────
  {
    slug: 'command-undo-not-executed',
    title: 'Text Editor with Undo',
    difficulty: 'medium',
    bugType: 'logic',
    description: 'A text editor supports undo. The user types "Hello", then " World", then undoes the last action. Print the current text.',
    testInput: '',
    expectedOutput: 'Hello',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class TextEditor:
    def __init__(self):
        self.text = ""
        self.history = []
    def write(self, text):
        self.history.append(self.text)
        self.text += text
    def undo(self):
        self.history.pop()

editor = TextEditor()
editor.write("Hello")
editor.write(" World")
editor.undo()
print(editor.text)`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `import java.util.*;
public class Main {
    static String text="";
    static Deque<String> history=new ArrayDeque<>();
    static void write(String s){history.push(text);text+=s;}
    static void undo(){history.pop();}
    public static void main(String[] args){
        write("Hello"); write(" World"); undo();
        System.out.println(text);
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
#include <string>
#include <stack>
using namespace std;
string text="";
stack<string> history;
void write(string s){history.push(text);text+=s;}
void undo(){history.pop();}
int main(){
    write("Hello"); write(" World"); undo();
    cout<<text<<endl;
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
using System.Collections.Generic;
string text="";
var history=new Stack<string>();
void Write(string s){history.Push(text);text+=s;}
void Undo(){history.Pop();}
Write("Hello"); Write(" World"); Undo();
Console.WriteLine(text);`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
var text string
var history []string
func write(s string){history=append(history,text);text+=s}
func undo(){history=history[:len(history)-1]}
func main(){
    write("Hello"); write(" World"); undo()
    fmt.Println(text)
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `fn main(){
    let mut text=String::new();
    let mut history:Vec<String>=vec![];
    // write "Hello"
    history.push(text.clone()); text.push_str("Hello");
    // write " World"
    history.push(text.clone()); text.push_str(" World");
    // undo
    history.pop();
    println!("{}",text);
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `let text = '';
const history: string[] = [];
const write = (s: string) => { history.push(text); text += s; };
const undo = () => { history.pop(); };
write('Hello'); write(' World'); undo();
console.log(text);`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
$text=''; $history=[];
function myWrite($s){global $text,$history;$history[]=$text;$text.=$s;}
function myUndo(){global $text,$history;array_pop($history);}
myWrite('Hello'); myWrite(' World'); myUndo();
echo $text."\\n";`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `text=''; history=[]
write_fn=->(s){history.push(text.dup);text<<s}
undo_fn=->{history.pop}
write_fn.call('Hello')
write_fn.call(' World')
undo_fn.call
puts text`,
      },
    ],
    hint: 'The history stack saves previous states. What should undo() do with the popped state?',
    explanation: 'undo() pops the history stack but throws away the restored state. The popped value IS the previous text — assign it back: `self.text = self.history.pop()`.',
    tags: ['design-patterns', 'command', 'undo'],
    status: 'published',
    order: 11,
  },

  // ─── 12 ── Builder — Field Missing from Build ─────────────────────────────
  {
    slug: 'builder-field-missing',
    title: 'User Profile Builder',
    difficulty: 'medium',
    bugType: 'logic',
    description: 'A User profile is built with name Alice, age 25, and role admin. Print each field on a separate line.',
    testInput: '',
    expectedOutput: 'Alice\n25\nadmin',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class User:
    def __init__(self): self.name=""; self.age=0; self.role=""

class UserBuilder:
    def __init__(self): self._name=""; self._age=0; self._role=""
    def set_name(self,name): self._name=name; return self
    def set_age(self,age): self._age=age; return self
    def set_role(self,role): self._role=role; return self
    def build(self):
        u=User()
        u.name=self._name
        u.role=self._role
        return u

user=UserBuilder().set_name("Alice").set_age(25).set_role("admin").build()
print(user.name)
print(user.age)
print(user.role)`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `public class Main{
    static class User{String name="";int age=0;String role="";}
    static class Builder{
        String name="";int age=0;String role="";
        Builder name(String n){name=n;return this;}
        Builder age(int a){age=a;return this;}
        Builder role(String r){role=r;return this;}
        User build(){
            User u=new User();
            u.name=name;
            u.role=role;
            return u;
        }
    }
    public static void main(String[] args){
        User u=new Builder().name("Alice").age(25).role("admin").build();
        System.out.println(u.name);
        System.out.println(u.age);
        System.out.println(u.role);
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
#include <string>
using namespace std;
struct User{string name="";int age=0;string role="";};
class Builder{
    string name;int age;string role;
public:
    Builder& setName(string n){name=n;return *this;}
    Builder& setAge(int a){age=a;return *this;}
    Builder& setRole(string r){role=r;return *this;}
    User build(){
        User u;u.name=name;
        u.role=role;return u;
    }
};
int main(){
    User u=Builder().setName("Alice").setAge(25).setRole("admin").build();
    cout<<u.name<<"\\n"<<u.age<<"\\n"<<u.role<<endl;
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
class User{public string Name="";public int Age=0;public string Role="";}
class Builder{
    string name="";int age=0;string role="";
    public Builder Name(string n){name=n;return this;}
    public Builder Age(int a){age=a;return this;}
    public Builder Role(string r){role=r;return this;}
    public User Build(){
        var u=new User();u.Name=name;u.Role=role;return u;
    }
}
var u=new Builder().Name("Alice").Age(25).Role("admin").Build();
Console.WriteLine(u.Name);
Console.WriteLine(u.Age);
Console.WriteLine(u.Role);`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
type User struct{Name string;Age int;Role string}
type Builder struct{name string;age int;role string}
func(b *Builder)SetName(n string)*Builder{b.name=n;return b}
func(b *Builder)SetAge(a int)*Builder{b.age=a;return b}
func(b *Builder)SetRole(r string)*Builder{b.role=r;return b}
func(b *Builder)Build()User{
    return User{Name:b.name,Role:b.role}
}
func main(){
    u:=(&Builder{}).SetName("Alice").SetAge(25).SetRole("admin").Build()
    fmt.Println(u.Name); fmt.Println(u.Age); fmt.Println(u.Role)
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `struct User{name:String,age:u32,role:String}
struct Builder{name:String,age:u32,role:String}
impl Builder{
    fn new()->Self{Builder{name:String::new(),age:0,role:String::new()}}
    fn name(mut self,n:&str)->Self{self.name=n.to_string();self}
    fn age(mut self,a:u32)->Self{self.age=a;self}
    fn role(mut self,r:&str)->Self{self.role=r.to_string();self}
    fn build(self)->User{
        User{name:self.name,age:0,role:self.role}
    }
}
fn main(){
    let u=Builder::new().name("Alice").age(25).role("admin").build();
    println!("{}",u.name); println!("{}",u.age); println!("{}",u.role)
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `class User{name='';age=0;role='';}
class Builder{
  private _name='';private _age=0;private _role='';
  name(n:string){this._name=n;return this;}
  age(a:number){this._age=a;return this;}
  role(r:string){this._role=r;return this;}
  build(){
    const u=new User();
    u.name=this._name;
    u.role=this._role;
    return u;
  }
}
const u=new Builder().name('Alice').age(25).role('admin').build();
console.log(u.name); console.log(u.age); console.log(u.role);`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
class User{public string $name='';public int $age=0;public string $role='';}
class Builder{
    private string $name='';private int $age=0;private string $role='';
    public function name(string $n):static{$this->name=$n;return $this;}
    public function age(int $a):static{$this->age=$a;return $this;}
    public function role(string $r):static{$this->role=$r;return $this;}
    public function build():User{
        $u=new User();$u->name=$this->name;$u->role=$this->role;return $u;
    }
}
$u=(new Builder())->name('Alice')->age(25)->role('admin')->build();
echo $u->name."\\n"; echo $u->age."\\n"; echo $u->role."\\n";`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `class User
  attr_accessor :name,:age,:role
  def initialize;@name='';@age=0;@role='';end
end
class Builder
  def initialize;@name='';@age=0;@role='';end
  def name(n);@name=n;self;end
  def age(a);@age=a;self;end
  def role(r);@role=r;self;end
  def build
    u=User.new;u.name=@name;u.role=@role;u
  end
end
u=Builder.new.name('Alice').age(25).role('admin').build
puts u.name; puts u.age; puts u.role`,
      },
    ],
    hint: 'Does build() copy ALL fields from the builder into the User object?',
    explanation: 'The build() method copies name and role but forgets to copy the age field. Add `u.age = self._age` (or the equivalent) to carry the age into the built object.',
    tags: ['design-patterns', 'builder', 'oop'],
    status: 'published',
    order: 12,
  },

  // ─── 13 ── Rate Limiter — Wrong Token Check ───────────────────────────────
  {
    slug: 'rate-limiter-wrong-check',
    title: 'API Rate Limiter',
    difficulty: 'medium',
    bugType: 'logic',
    description: 'A token bucket rate limiter starts with 3 tokens. Process 5 requests one by one. Print how many were allowed and how many were denied.',
    testInput: '',
    expectedOutput: 'Allowed: 3\nDenied: 2',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class RateLimiter:
    def __init__(self, capacity):
        self.tokens = capacity
    def allow(self):
        if self.tokens >= 0:
            self.tokens -= 1
            return True
        return False

limiter = RateLimiter(3)
allowed = 0; denied = 0
for _ in range(5):
    if limiter.allow(): allowed += 1
    else: denied += 1
print(f"Allowed: {allowed}")
print(f"Denied: {denied}")`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `public class Main {
    static int tokens=3;
    static boolean allow(){
        if(tokens>=0){tokens--;return true;}
        return false;
    }
    public static void main(String[] args){
        int allowed=0,denied=0;
        for(int i=0;i<5;i++) if(allow()) allowed++; else denied++;
        System.out.println("Allowed: "+allowed);
        System.out.println("Denied: "+denied);
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
using namespace std;
int tokens=3;
bool allow(){if(tokens>=0){tokens--;return true;}return false;}
int main(){
    int allowed=0,denied=0;
    for(int i=0;i<5;i++) if(allow()) allowed++; else denied++;
    cout<<"Allowed: "<<allowed<<"\\nDenied: "<<denied<<endl;
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
int tokens=3,allowed=0,denied=0;
bool Allow(){if(tokens>=0){tokens--;return true;}return false;}
for(int i=0;i<5;i++) if(Allow()) allowed++; else denied++;
Console.WriteLine("Allowed: "+allowed);
Console.WriteLine("Denied: "+denied);`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
func main(){
    tokens:=3;allowed:=0;denied:=0
    allow:=func()bool{if tokens>=0{tokens--;return true};return false}
    for i:=0;i<5;i++{if allow(){allowed++}else{denied++}}
    fmt.Printf("Allowed: %d\\nDenied: %d\\n",allowed,denied)
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `fn main(){
    let mut tokens:i32=3;
    let mut allowed=0;let mut denied=0;
    for _ in 0..5{
        if tokens>=0{tokens-=1;allowed+=1;}
        else{denied+=1;}
    }
    println!("Allowed: {}",allowed);
    println!("Denied: {}",denied);
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `let tokens=3,allowed=0,denied=0;
const allow=()=>{if(tokens>=0){tokens--;return true;}return false;};
for(let i=0;i<5;i++) if(allow()) allowed++; else denied++;
console.log('Allowed: '+allowed);
console.log('Denied: '+denied);`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
$tokens=3;$allowed=0;$denied=0;
function allow(){global $tokens;if($tokens>=0){$tokens--;return true;}return false;}
for($i=0;$i<5;$i++) if(allow()) $allowed++; else $denied++;
echo "Allowed: $allowed\\nDenied: $denied\\n";`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `tokens=3;allowed=0;denied=0
allow=->{if tokens>=0 then tokens-=1;true else false end}
5.times{if allow.call then allowed+=1 else denied+=1 end}
puts "Allowed: #{allowed}"
puts "Denied: #{denied}"`,
      },
    ],
    hint: 'When tokens = 0, should a request be allowed?',
    explanation: 'The condition `tokens >= 0` allows a request even when tokens = 0, letting one extra request through. Change to `tokens > 0` so requests are only allowed when there is at least 1 token.',
    tags: ['oop', 'rate-limiting', 'object-design'],
    status: 'published',
    order: 13,
  },

  // ─── 14 ── Caching Proxy — Always Recomputes ──────────────────────────────
  {
    slug: 'proxy-cache-always-miss',
    title: 'Caching Proxy',
    difficulty: 'medium',
    bugType: 'logic',
    description: 'A caching proxy wraps an expensive computation (square of a number). Call compute(5) twice. The first call should compute the result; the second should use the cached value. Print "computing" only when actually computing, followed by the result each time.',
    testInput: '',
    expectedOutput: 'computing\n25\n25',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class ExpensiveService:
    def compute(self, n):
        print("computing")
        return n * n

class CachingProxy:
    def __init__(self, service):
        self.service = service
        self.cache = {}
    def compute(self, n):
        result = self.service.compute(n)
        self.cache[n] = result
        return result

proxy = CachingProxy(ExpensiveService())
print(proxy.compute(5))
print(proxy.compute(5))`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `import java.util.*;
public class Main {
    static int compute(int n){System.out.println("computing");return n*n;}
    static Map<Integer,Integer> cache=new HashMap<>();
    static int proxied(int n){
        int result=compute(n);
        cache.put(n,result); return result;
    }
    public static void main(String[] args){
        System.out.println(proxied(5));
        System.out.println(proxied(5));
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
#include <map>
using namespace std;
map<int,int> cache;
int compute(int n){cout<<"computing"<<endl;return n*n;}
int proxied(int n){
    int result=compute(n);
    cache[n]=result; return result;
}
int main(){
    cout<<proxied(5)<<endl;
    cout<<proxied(5)<<endl;
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
using System.Collections.Generic;
int Compute(int n){Console.WriteLine("computing");return n*n;}
var cache=new Dictionary<int,int>();
int Proxied(int n){
    int r=Compute(n);
    cache[n]=r;return r;
}
Console.WriteLine(Proxied(5));
Console.WriteLine(Proxied(5));`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
var cache=map[int]int{}
func compute(n int)int{fmt.Println("computing");return n*n}
func proxied(n int)int{
    r:=compute(n)
    cache[n]=r; return r
}
func main(){
    fmt.Println(proxied(5)); fmt.Println(proxied(5))
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `use std::collections::HashMap;
fn compute(n:i32)->i32{println!("computing");n*n}
struct Proxy{cache:HashMap<i32,i32>}
impl Proxy{
    fn new()->Self{Proxy{cache:HashMap::new()}}
    fn get(&mut self,n:i32)->i32{
        let r=compute(n);
        self.cache.insert(n,r); r
    }
}
fn main(){
    let mut p=Proxy::new();
    println!("{}",p.get(5)); println!("{}",p.get(5));
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `const cache=new Map<number,number>();
const compute=(n:number)=>{console.log('computing');return n*n;};
const proxied=(n:number)=>{
  const r=compute(n);
  cache.set(n,r);return r;
};
console.log(proxied(5)); console.log(proxied(5));`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
$cache=[];
function compute($n){echo "computing\\n";return $n*$n;}
function proxied($n){
    global $cache;
    $r=compute($n);
    $cache[$n]=$r;return $r;
}
echo proxied(5)."\\n"; echo proxied(5)."\\n";`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `$cache={}
def compute(n);puts 'computing';n*n;end
def proxied(n)
  r=compute(n)
  $cache[n]=r;r
end
puts proxied(5); puts proxied(5)`,
      },
    ],
    hint: 'Is the cache ever consulted before recomputing?',
    explanation: 'The proxy always calls the real compute() without checking the cache first. Add a cache lookup: if the key is present, return the cached value; otherwise compute, store, and return.',
    tags: ['design-patterns', 'proxy', 'caching'],
    status: 'published',
    order: 14,
  },

  // ─── 15 ── Composite — Folder Size Not Recursive ──────────────────────────
  {
    slug: 'composite-size-not-recursive',
    title: 'File System Size',
    difficulty: 'medium',
    bugType: 'logic',
    description: 'A file system has Folder A containing a File of 10 bytes and Folder B containing a File of 20 bytes. Print the total size of Folder A.',
    testInput: '',
    expectedOutput: '30',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class File:
    def __init__(self, size): self.size=size
    def get_size(self): return self.size

class Folder:
    def __init__(self): self.children=[]
    def add(self, child): self.children.append(child)
    def get_size(self):
        total=0
        for child in self.children:
            if isinstance(child, File):
                total+=child.get_size()
        return total

folder_b=Folder(); folder_b.add(File(20))
folder_a=Folder(); folder_a.add(File(10)); folder_a.add(folder_b)
print(folder_a.get_size())`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `import java.util.*;
public class Main{
    interface Component{int getSize();}
    static class MyFile implements Component{int s;MyFile(int s){this.s=s;}public int getSize(){return s;}}
    static class Folder implements Component{
        List<Component> ch=new ArrayList<>();
        void add(Component c){ch.add(c);}
        public int getSize(){
            int t=0;
            for(Component c:ch)
                if(c instanceof MyFile) t+=c.getSize();
            return t;
        }
    }
    public static void main(String[] args){
        Folder b=new Folder();b.add(new MyFile(20));
        Folder a=new Folder();a.add(new MyFile(10));a.add(b);
        System.out.println(a.getSize());
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
#include <vector>
using namespace std;
struct Component{virtual int getSize()=0;};
struct File:Component{int sz;File(int s):sz(s){}int getSize(){return sz;}};
struct Folder:Component{
    vector<Component*> ch;
    void add(Component* c){ch.push_back(c);}
    int getSize(){
        int t=0;
        for(auto c:ch) if(dynamic_cast<File*>(c)) t+=c->getSize();
        return t;
    }
};
int main(){
    Folder* b=new Folder();b->add(new File(20));
    Folder* a=new Folder();a->add(new File(10));a->add(b);
    cout<<a->getSize()<<endl;
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;using System.Collections.Generic;
interface IComponent{int GetSize();}
class MyFile:IComponent{int s;public MyFile(int s){this.s=s;}public int GetSize()=>s;}
class Folder:IComponent{
    List<IComponent> ch=new();
    public void Add(IComponent c)=>ch.Add(c);
    public int GetSize(){int t=0;foreach(var c in ch)if(c is MyFile)t+=c.GetSize();return t;}
}
var b=new Folder();b.Add(new MyFile(20));
var a=new Folder();a.Add(new MyFile(10));a.Add(b);
Console.WriteLine(a.GetSize());`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
type Component interface{GetSize()int}
type File struct{Size int}
func(f File)GetSize()int{return f.Size}
type Folder struct{children []Component}
func(f *Folder)Add(c Component){f.children=append(f.children,c)}
func(f *Folder)GetSize()int{
    t:=0
    for _,c:=range f.children{
        if _,ok:=c.(File);ok{t+=c.GetSize()}
    }
    return t
}
func main(){
    b:=&Folder{};b.Add(File{20})
    a:=&Folder{};a.Add(File{10});a.Add(b)
    fmt.Println(a.GetSize())
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `enum Component{File(i32),Folder(Vec<Box<Component>>)}
impl Component{
    fn get_size(&self)->i32{
        match self{
            Component::File(s)=>*s,
            Component::Folder(children)=>{
                let mut t=0;
                for c in children{
                    if let Component::File(s)=c.as_ref(){t+=s;}
                }
                t
            }
        }
    }
}
fn main(){
    let folder_b=Component::Folder(vec![Box::new(Component::File(20))]);
    let folder_a=Component::Folder(vec![Box::new(Component::File(10)),Box::new(folder_b)]);
    println!("{}",folder_a.get_size());
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `class File{constructor(public size:number){}getSize(){return this.size;}}
class Folder{
  private children:(File|Folder)[]=[];
  add(c:File|Folder){this.children.push(c);}
  getSize(){
    let total=0;
    for(const c of this.children)
      if(c instanceof File) total+=c.getSize();
    return total;
  }
}
const folderB=new Folder();folderB.add(new File(20));
const folderA=new Folder();folderA.add(new File(10));folderA.add(folderB);
console.log(folderA.getSize());`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
interface Component{public function getSize():int;}
class MyFile implements Component{
    function __construct(private int $s){}
    public function getSize():int{return $this->s;}
}
class Folder implements Component{
    private array $ch=[];
    public function add(Component $c):void{$this->ch[]=$c;}
    public function getSize():int{
        $t=0;
        foreach($this->ch as $c) if($c instanceof MyFile) $t+=$c->getSize();
        return $t;
    }
}
$b=new Folder();$b->add(new MyFile(20));
$a=new Folder();$a->add(new MyFile(10));$a->add($b);
echo $a->getSize()."\\n";`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `class MyFile
  def initialize(size);@size=size;end
  def get_size;@size;end
end
class Folder
  def initialize;@children=[];end
  def add(child);@children<<child;end
  def get_size
    @children.select{|c|c.is_a?(MyFile)}.sum(&:get_size)
  end
end
folder_b=Folder.new;folder_b.add(MyFile.new(20))
folder_a=Folder.new;folder_a.add(MyFile.new(10));folder_a.add(folder_b)
puts folder_a.get_size`,
      },
    ],
    hint: 'Does getSize() recurse into child folders, or only count direct file children?',
    explanation: 'The loop only sums File children (by type check), ignoring nested Folders. In the Composite pattern, getSize() should call getSize() on ALL children recursively: `total += child.get_size()` for every child.',
    tags: ['design-patterns', 'composite', 'recursion'],
    status: 'published',
    order: 15,
  },

  // ─── 16 ── Library Book — Wrong Availability ──────────────────────────────
  {
    slug: 'library-wrong-availability',
    title: 'Library Book Checkout',
    difficulty: 'easy',
    bugType: 'logic',
    description: 'A library book starts as available. After checking it out, print whether the book is still available.',
    testInput: '',
    expectedOutput: 'False',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class Book:
    def __init__(self): self.available=True
    def checkout(self): self.available=True
    def is_available(self): return self.available

book=Book()
book.checkout()
print(book.is_available())`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `public class Main{
    static boolean available=true;
    static void checkout(){available=true;}
    static boolean isAvailable(){return available;}
    public static void main(String[] args){
        checkout();
        System.out.println(isAvailable()?"True":"False");
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
using namespace std;
bool available=true;
void checkout(){available=true;}
int main(){
    checkout();
    cout<<(available?"True":"False")<<endl;
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
bool available=true;
void Checkout(){available=true;}
Checkout();
Console.WriteLine(available);`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
func main(){
    available:=true
    checkout:=func(){available=true}
    checkout()
    if available{fmt.Println("True")}else{fmt.Println("False")}
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `fn main(){
    let mut available=true;
    let checkout=|a:&mut bool|{*a=true;};
    checkout(&mut available);
    println!("{}",if available{"True"}else{"False"});
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `class Book{
  available=true;
  checkout(){this.available=true;}
  isAvailable(){return this.available;}
}
const book=new Book();
book.checkout();
console.log(book.isAvailable()?'True':'False');`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
class Book{
    public bool $available=true;
    public function checkout():void{$this->available=true;}
    public function isAvailable():bool{return $this->available;}
}
$book=new Book();
$book->checkout();
echo ($book->isAvailable()?'True':'False')."\\n";`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `class Book
  def initialize;@available=true;end
  def checkout;@available=true;end
  def available?;@available;end
end
book=Book.new
book.checkout
puts book.available? ? 'True' : 'False'`,
      },
    ],
    hint: 'What should checkout() do to the availability flag?',
    explanation: 'checkout() sets available = True instead of False. Checking out a book makes it UNAVAILABLE. Change the assignment to `self.available = False`.',
    tags: ['oop', 'object-design', 'state'],
    status: 'published',
    order: 16,
  },

  // ─── 17 ── Iterator — Skips Every Other Element ───────────────────────────
  {
    slug: 'iterator-skips-elements',
    title: 'Custom List Iterator',
    difficulty: 'medium',
    bugType: 'off-by-one',
    description: 'A custom iterator traverses the list [10, 20, 30, 40, 50]. Print each element on a separate line.',
    testInput: '',
    expectedOutput: '10\n20\n30\n40\n50',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class ListIterator:
    def __init__(self, items): self.items=items; self.index=0
    def has_next(self): return self.index<len(self.items)
    def next(self):
        item=self.items[self.index]
        self.index+=2
        return item

it=ListIterator([10,20,30,40,50])
while it.has_next():
    print(it.next())`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `public class Main{
    static int[] items={10,20,30,40,50};
    static int index=0;
    static boolean hasNext(){return index<items.length;}
    static int next(){int item=items[index];index+=2;return item;}
    public static void main(String[] args){
        while(hasNext()) System.out.println(next());
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
using namespace std;
int items[]={10,20,30,40,50};
int idx=0,n=5;
bool hasNext(){return idx<n;}
int next(){int item=items[idx];idx+=2;return item;}
int main(){while(hasNext())cout<<next()<<endl;}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
int[] items={10,20,30,40,50};
int idx=0;
bool HasNext()=>idx<items.Length;
int Next(){int item=items[idx];idx+=2;return item;}
while(HasNext())Console.WriteLine(Next());`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
func main(){
    items:=[]int{10,20,30,40,50}
    idx:=0
    hasNext:=func()bool{return idx<len(items)}
    next:=func()int{item:=items[idx];idx+=2;return item}
    for hasNext(){fmt.Println(next())}
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `struct Iter{items:Vec<i32>,index:usize}
impl Iter{
    fn new(items:Vec<i32>)->Self{Iter{items,index:0}}
    fn has_next(&self)->bool{self.index<self.items.len()}
    fn next_val(&mut self)->i32{let v=self.items[self.index];self.index+=2;v}
}
fn main(){
    let mut it=Iter::new(vec![10,20,30,40,50]);
    while it.has_next(){println!("{}",it.next_val());}
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `class ListIterator{
  private index=0;
  constructor(private items:number[]){}
  hasNext(){return this.index<this.items.length;}
  next(){const item=this.items[this.index];this.index+=2;return item;}
}
const it=new ListIterator([10,20,30,40,50]);
while(it.hasNext())console.log(it.next());`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
class ListIterator{
    private int $idx=0;
    function __construct(private array $items){}
    function hasNext():bool{return $this->idx<count($this->items);}
    function next():int{$item=$this->items[$this->idx];$this->idx+=2;return $item;}
}
$it=new ListIterator([10,20,30,40,50]);
while($it->hasNext()) echo $it->next()."\\n";`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `class ListIterator
  def initialize(items);@items=items;@idx=0;end
  def has_next?;@idx<@items.length;end
  def next_val;item=@items[@idx];@idx+=2;item;end
end
it=ListIterator.new([10,20,30,40,50])
while it.has_next?
  puts it.next_val
end`,
      },
    ],
    hint: 'By how much does the iterator advance its index on each call?',
    explanation: 'next() advances the index by 2 instead of 1, skipping every other element. Change `index += 2` to `index += 1` (or `index++`) to visit every element.',
    tags: ['design-patterns', 'iterator', 'oop'],
    status: 'published',
    order: 17,
  },

  // ─── 18 ── Adapter — Wrong Method Called ──────────────────────────────────
  {
    slug: 'adapter-wrong-method',
    title: 'Printer Adapter',
    difficulty: 'medium',
    bugType: 'logic',
    description: 'An Adapter wraps an OldPrinter (which has a print_document method) to work with the NewPrinter interface (which expects print). Adapt and print the input text with the prefix "Printing: ".',
    testInput: 'Hello',
    expectedOutput: 'Printing: Hello',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class OldPrinter:
    def print_document(self, text):
        print(f"Printing: {text}")

class PrinterAdapter:
    def __init__(self, old_printer):
        self.old_printer = old_printer
    def print(self, text):
        self.old_printer.print_document(text.upper())

text = input()
adapter = PrinterAdapter(OldPrinter())
adapter.print(text)`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `import java.util.Scanner;
public class Main{
    static class OldPrinter{
        void printDocument(String text){System.out.println("Printing: "+text);}
    }
    static class Adapter{
        OldPrinter p;Adapter(OldPrinter p){this.p=p;}
        void print(String text){p.printDocument(text.toUpperCase());}
    }
    public static void main(String[] args){
        Scanner sc=new Scanner(System.in);
        new Adapter(new OldPrinter()).print(sc.nextLine());
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;
struct OldPrinter{
    void printDocument(string text){cout<<"Printing: "<<text<<endl;}
};
struct Adapter{
    OldPrinter p;
    void print(string text){
        transform(text.begin(),text.end(),text.begin(),::toupper);
        p.printDocument(text);
    }
};
int main(){
    string text;getline(cin,text);
    Adapter().print(text);
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
class OldPrinter{public void PrintDocument(string text){Console.WriteLine("Printing: "+text);}}
class Adapter{
    OldPrinter _p;public Adapter(OldPrinter p){_p=p;}
    public void Print(string text){_p.PrintDocument(text.ToUpper());}
}
new Adapter(new OldPrinter()).Print(Console.ReadLine()!);`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import ("fmt";"strings")
type OldPrinter struct{}
func(o OldPrinter)PrintDocument(text string){fmt.Println("Printing: "+text)}
type Adapter struct{p OldPrinter}
func(a Adapter)Print(text string){a.p.PrintDocument(strings.ToUpper(text))}
func main(){
    var text string;fmt.Scan(&text)
    Adapter{}.Print(text)
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `use std::io;
struct OldPrinter;
impl OldPrinter{fn print_document(&self,text:&str){println!("Printing: {}",text);}}
struct Adapter{p:OldPrinter}
impl Adapter{fn print(&self,text:&str){self.p.print_document(&text.to_uppercase());}}
fn main(){
    let mut s=String::new();io::stdin().read_line(&mut s).unwrap();
    Adapter{p:OldPrinter}.print(s.trim());
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `class OldPrinter{
  printDocument(text:string){console.log('Printing: '+text);}
}
class PrinterAdapter{
  constructor(private p:OldPrinter){}
  print(text:string){this.p.printDocument(text.toUpperCase());}
}
const text=prompt()!;
new PrinterAdapter(new OldPrinter()).print(text);`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
class OldPrinter{
    public function printDocument(string $text):void{echo "Printing: $text\\n";}
}
class PrinterAdapter{
    function __construct(private OldPrinter $p){}
    public function print(string $text):void{$this->p->printDocument(strtoupper($text));}
}
$text=trim(fgets(STDIN));
(new PrinterAdapter(new OldPrinter()))->print($text);`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `class OldPrinter
  def print_document(text); puts "Printing: #{text}"; end
end
class PrinterAdapter
  def initialize(p); @p=p; end
  def print(text); @p.print_document(text.upcase); end
end
text=gets.chomp
PrinterAdapter.new(OldPrinter.new).print(text)`,
      },
    ],
    hint: 'Does the Adapter pass the text to the wrapped method correctly?',
    explanation: 'The Adapter calls `text.upper()` before passing to print_document, transforming the text to uppercase. The adapter should pass the text unchanged: `self.old_printer.print_document(text)`.',
    tags: ['design-patterns', 'adapter', 'oop'],
    status: 'published',
    order: 18,
  },

  // ─── 19 ── Observer — Wrong Subscriber Removed ────────────────────────────
  {
    slug: 'observer-unsubscribe-wrong',
    title: 'Event Subscription Manager',
    difficulty: 'medium',
    bugType: 'logic',
    description: 'An event system has Alice, Bob, and Charlie subscribed. Bob unsubscribes. When an event is published, print notifications for all remaining subscribers.',
    testInput: '',
    expectedOutput: 'Alice notified\nCharlie notified',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class EventSystem:
    def __init__(self): self.subscribers=[]
    def subscribe(self, name): self.subscribers.append(name)
    def unsubscribe(self, name):
        self.subscribers.pop(0)
    def notify(self):
        for sub in self.subscribers: print(f"{sub} notified")

events=EventSystem()
events.subscribe("Alice")
events.subscribe("Bob")
events.subscribe("Charlie")
events.unsubscribe("Bob")
events.notify()`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `import java.util.*;
public class Main{
    static List<String> subs=new ArrayList<>();
    static void subscribe(String n){subs.add(n);}
    static void unsubscribe(String n){subs.remove(0);}
    static void notify_all(){for(String s:subs)System.out.println(s+" notified");}
    public static void main(String[] args){
        subscribe("Alice");subscribe("Bob");subscribe("Charlie");
        unsubscribe("Bob");
        notify_all();
    }
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
vector<string> subs;
void subscribe(string n){subs.push_back(n);}
void unsubscribe(string n){subs.erase(subs.begin());}
void notify_all(){for(auto& s:subs)cout<<s<<" notified"<<endl;}
int main(){
    subscribe("Alice");subscribe("Bob");subscribe("Charlie");
    unsubscribe("Bob");
    notify_all();
}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;using System.Collections.Generic;
var subs=new List<string>();
void Subscribe(string n)=>subs.Add(n);
void Unsubscribe(string n)=>subs.RemoveAt(0);
void NotifyAll(){foreach(var s in subs)Console.WriteLine(s+" notified");}
Subscribe("Alice");Subscribe("Bob");Subscribe("Charlie");
Unsubscribe("Bob");
NotifyAll();`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
var subs []string
func subscribe(n string){subs=append(subs,n)}
func unsubscribe(n string){
    if len(subs)>0{subs=subs[1:]}
}
func notifyAll(){for _,s:=range subs{fmt.Println(s+" notified")}}
func main(){
    subscribe("Alice");subscribe("Bob");subscribe("Charlie")
    unsubscribe("Bob")
    notifyAll()
}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `fn main(){
    let mut subs:Vec<&str>=vec!["Alice","Bob","Charlie"];
    if !subs.is_empty(){subs.remove(0);}
    for s in &subs{println!("{} notified",s);}
}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `const subs=['Alice','Bob','Charlie'];
const unsubscribe=(name:string)=>{subs.splice(0,1);};
unsubscribe('Bob');
subs.forEach(s=>console.log(s+' notified'));`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
$subs=["Alice","Bob","Charlie"];
function unsubscribe($name){global $subs;array_shift($subs);}
unsubscribe("Bob");
foreach($subs as $s) echo "$s notified\\n";`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `subs=['Alice','Bob','Charlie']
unsubscribe=->(name){subs.shift}
unsubscribe.call('Bob')
subs.each{|s|puts "#{s} notified"}`,
      },
    ],
    hint: 'Does the unsubscribe method actually remove the CORRECT subscriber?',
    explanation: 'unsubscribe() removes the element at index 0 (always Alice) instead of finding and removing the specified subscriber. Use `list.remove(name)` or equivalent to find and remove by value.',
    tags: ['design-patterns', 'observer', 'oop'],
    status: 'published',
    order: 19,
  },

  // ─── 20 ── SRP — Wrong Operation Order ────────────────────────────────────
  {
    slug: 'solid-srp-violation',
    title: 'Order Processor',
    difficulty: 'medium',
    bugType: 'logic',
    description: 'An OrderProcessor processes an order and sends a confirmation email. For order "order123", print the processing confirmation followed by the email confirmation.',
    testInput: '',
    expectedOutput: 'Order processed: order123\nEmail sent: order123',
    variants: [
      {
        language: 'python-3.14',
        buggyCode: `class OrderProcessor:
    def send_email(self, order_id):
        print(f"Email sent: {order_id}")
    def process_order(self, order_id):
        print(f"Order processed: {order_id}")
    def process(self, order_id):
        self.send_email(order_id)
        self.process_order(order_id)

OrderProcessor().process("order123")`,
      },
      {
        language: 'openjdk-25',
        buggyCode: `public class Main{
    static void sendEmail(String id){System.out.println("Email sent: "+id);}
    static void processOrder(String id){System.out.println("Order processed: "+id);}
    static void process(String id){
        sendEmail(id);
        processOrder(id);
    }
    public static void main(String[] args){process("order123");}
}`,
      },
      {
        language: 'g++-15',
        buggyCode: `#include <iostream>
using namespace std;
void sendEmail(string id){cout<<"Email sent: "<<id<<endl;}
void processOrder(string id){cout<<"Order processed: "<<id<<endl;}
void process(string id){
    sendEmail(id);
    processOrder(id);
}
int main(){process("order123");}`,
      },
      {
        language: 'dotnet-csharp-9',
        buggyCode: `using System;
void SendEmail(string id){Console.WriteLine("Email sent: "+id);}
void ProcessOrder(string id){Console.WriteLine("Order processed: "+id);}
void Process(string id){
    SendEmail(id);
    ProcessOrder(id);
}
Process("order123");`,
      },
      {
        language: 'go-1.26',
        buggyCode: `package main
import "fmt"
func sendEmail(id string){fmt.Println("Email sent: "+id)}
func processOrder(id string){fmt.Println("Order processed: "+id)}
func process(id string){
    sendEmail(id)
    processOrder(id)
}
func main(){process("order123")}`,
      },
      {
        language: 'rust-1.93',
        buggyCode: `fn send_email(id:&str){println!("Email sent: {}",id);}
fn process_order(id:&str){println!("Order processed: {}",id);}
fn process(id:&str){
    send_email(id);
    process_order(id);
}
fn main(){process("order123");}`,
      },
      {
        language: 'typescript-deno',
        buggyCode: `const sendEmail=(id:string)=>console.log('Email sent: '+id);
const processOrder=(id:string)=>console.log('Order processed: '+id);
const process=(id:string)=>{
  sendEmail(id);
  processOrder(id);
};
process('order123');`,
      },
      {
        language: 'php-8.5',
        buggyCode: `<?php
function sendEmail($id){echo "Email sent: $id\\n";}
function processOrder($id){echo "Order processed: $id\\n";}
function process($id){
    sendEmail($id);
    processOrder($id);
}
process("order123");`,
      },
      {
        language: 'ruby-4.0',
        buggyCode: `def send_email(id);puts "Email sent: #{id}";end
def process_order(id);puts "Order processed: #{id}";end
def process(id)
  send_email(id)
  process_order(id)
end
process('order123')`,
      },
    ],
    hint: 'In what order should the operations run? Which should happen first?',
    explanation: 'The process() method sends the email before the order is processed. Swap the calls so process_order() runs first, then send_email(). This also illustrates SRP — ideally each action would be in its own class.',
    tags: ['solid', 'srp', 'oop'],
    status: 'published',
    order: 20,
  },
]

async function main() {
  await connectDB()
  for (const c of challenges) {
    await DebuggerChallenge.findOneAndUpdate({ slug: c.slug }, c, { upsert: true, new: true })
    console.log('upserted', c.slug)
  }
  console.log(`done — ${challenges.length} challenges`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
