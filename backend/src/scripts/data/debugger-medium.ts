import { challenge, type DebuggerSeed } from '../seed-debugger-lib'

export const MEDIUM: DebuggerSeed[] = [
  challenge({
    slug: 'parking-unpark-leaks-spot',
    title: 'Parking Lot — Unpark Does Not Free the Spot',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['parking-lot', 'object-design', 'invariants'],
    order: 35,
    description:
      'Parking-lot LLD: one compact spot C1. Park a compact car, unpark it, then park another compact. The second car must reuse C1 — unpark must return the spot to the free list.',
    expectedOutput: 'C1',
    hint: 'Does unpark() put the occupied spot back onto the free list, or only drop it from the used map?',
    explanation:
      'unpark removes the car from the occupied map but never pushes the spot back onto free, so the second park sees an empty list and prints FULL. The invariant is spots are conserved: every unpark must free the stall it held.',
    code: {
      py: `class Lot:
    def __init__(self):
        self.free, self.used = ['C1'], {}
    def park(self, car):
        if not self.free:
            return 'FULL'
        s = self.free.pop()
        self.used[car] = s
        return s
    def unpark(self, car):
        self.used.pop(car, None)
lot = Lot()
lot.park('A')
lot.unpark('A')
print(lot.park('B'))`,
      java: `public class Main {
  static java.util.List<String> free = new java.util.ArrayList<>(java.util.List.of("C1"));
  static java.util.Map<String,String> used = new java.util.HashMap<>();
  static String park(String car) {
    if (free.isEmpty()) return "FULL";
    String s = free.remove(free.size() - 1);
    used.put(car, s);
    return s;
  }
  static void unpark(String car) { used.remove(car); }
  public static void main(String[] args) {
    park("A"); unpark("A");
    System.out.println(park("B"));
  }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <map>
using namespace std;
vector<string> freeSpots={"C1"};
map<string,string> used;
string park(string car) {
  if (freeSpots.empty()) return "FULL";
  string s = freeSpots.back(); freeSpots.pop_back();
  used[car] = s; return s;
}
void unpark(string car) { used.erase(car); }
int main() {
  park("A"); unpark("A");
  cout << park("B") << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var free = new List<string>{"C1"};
var used = new Dictionary<string,string>();
string Park(string car) {
  if (free.Count == 0) return "FULL";
  var s = free[free.Count-1];
  free.RemoveAt(free.Count-1);
  used[car] = s; return s;
}
void Unpark(string car) { used.Remove(car); }
Park("A"); Unpark("A");
Console.WriteLine(Park("B"));`,
      go: `package main
import "fmt"
func main() {
  free := []string{"C1"}
  used := map[string]string{}
  park := func(car string) string {
    if len(free) == 0 { return "FULL" }
    s := free[len(free)-1]
    free = free[:len(free)-1]
    used[car] = s
    return s
  }
  unpark := func(car string) { delete(used, car) }
  park("A"); unpark("A")
  fmt.Println(park("B"))
}`,
      rust: `use std::collections::HashMap;
fn park(free: &mut Vec<&str>, used: &mut HashMap<String,String>, car: &str) -> String {
  if free.is_empty() { return "FULL".into(); }
  let s = free.pop().unwrap().to_string();
  used.insert(car.to_string(), s.clone());
  s
}
fn unpark(used: &mut HashMap<String,String>, car: &str) { used.remove(car); }
fn main() {
  let mut free = vec!["C1"];
  let mut used = HashMap::new();
  park(&mut free, &mut used, "A");
  unpark(&mut used, "A");
  println!("{}", park(&mut free, &mut used, "B"));
}`,
      ts: `const free = ['C1']
const used: Record<string, string> = {}
function park(car: string) {
  if (!free.length) return 'FULL'
  const s = free.pop()!
  used[car] = s
  return s
}
function unpark(car: string) { delete used[car] }
park('A'); unpark('A')
console.log(park('B'))`,
      php: `<?php
class Lot {
  public $free = ['C1'];
  public $used = [];
  function park($car) {
    if (!count($this->free)) return 'FULL';
    $s = array_pop($this->free);
    $this->used[$car] = $s;
    return $s;
  }
  function unpark($car) { unset($this->used[$car]); }
}
$lot = new Lot();
$lot->park('A');
$lot->unpark('A');
echo $lot->park('B'), PHP_EOL;`,
      rb: `class Lot
  def initialize
    @free, @used = ['C1'], {}
  end
  def park(car)
    return 'FULL' if @free.empty?
    s = @free.pop
    @used[car] = s
    s
  end
  def unpark(car)
    @used.delete(car)
  end
end
lot = Lot.new
lot.park('A')
lot.unpark('A')
puts lot.park('B')`,
    },
  }),

  challenge({
    slug: 'movie-seat-double-book',
    title: 'BookMyShow — Same Seat Sold Twice',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['bookmyshow', 'concurrency-invariants', 'object-design'],
    order: 36,
    description:
      'Show booking LLD: seat A1 starts free. book(A1) then book(A1) again. The second call must return SEAT_TAKEN — a seat cannot be sold twice.',
    expectedOutput: 'SEAT_TAKEN',
    hint: 'After a successful book, is the seat still marked available?',
    explanation:
      'book always returns OK and never flips the seat to taken, so two customers get A1. Availability is an invariant: a successful reservation must mark the seat occupied before returning OK.',
    code: {
      py: `class Show:
    def __init__(self):
        self.free = {'A1': True}
    def book(self, seat):
        if seat not in self.free:
            return 'NO_SEAT'
        return 'OK'
s = Show()
s.book('A1')
print(s.book('A1'))`,
      java: `public class Main {
  static java.util.Map<String,Boolean> free = new java.util.HashMap<>();
  static String book(String seat) {
    if (!free.containsKey(seat)) return "NO_SEAT";
    return "OK";
  }
  public static void main(String[] args) {
    free.put("A1", true);
    book("A1");
    System.out.println(book("A1"));
  }
}`,
      cpp: `#include <iostream>
#include <string>
#include <map>
using namespace std;
map<string,bool> freeSeats;
string book(string seat) {
  if (!freeSeats.count(seat)) return "NO_SEAT";
  return "OK";
}
int main() {
  freeSeats["A1"] = true;
  book("A1");
  cout << book("A1") << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var free = new Dictionary<string,bool>{{"A1", true}};
string Book(string seat) {
  if (!free.ContainsKey(seat)) return "NO_SEAT";
  return "OK";
}
Book("A1");
Console.WriteLine(Book("A1"));`,
      go: `package main
import "fmt"
func main() {
  free := map[string]bool{"A1": true}
  book := func(seat string) string {
    if _, ok := free[seat]; !ok { return "NO_SEAT" }
    return "OK"
  }
  book("A1")
  fmt.Println(book("A1"))
}`,
      rust: `use std::collections::HashMap;
fn book(free: &HashMap<&str, bool>, seat: &str) -> &'static str {
  if !free.contains_key(seat) { return "NO_SEAT"; }
  "OK"
}
fn main() {
  let free = HashMap::from([("A1", true)]);
  book(&free, "A1");
  println!("{}", book(&free, "A1"));
}`,
      ts: `const free: Record<string, boolean> = { A1: true }
function book(seat: string) {
  if (!(seat in free)) return 'NO_SEAT'
  return 'OK'
}
book('A1')
console.log(book('A1'))`,
      php: `<?php
class Show {
  public $free = ['A1' => true];
  function book($seat) {
    if (!isset($this->free[$seat])) return 'NO_SEAT';
    return 'OK';
  }
}
$s = new Show();
$s->book('A1');
echo $s->book('A1'), PHP_EOL;`,
      rb: `class Show
  def initialize
    @free = {'A1' => true}
  end
  def book(seat)
    return 'NO_SEAT' unless @free.key?(seat)
    'OK'
  end
end
s = Show.new
s.book('A1')
puts s.book('A1')`,
    },
  }),

  challenge({
    slug: 'splitwise-wrong-direction',
    title: 'Splitwise — Settle Pays the Wrong Person',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['splitwise', 'balances', 'invariants'],
    order: 37,
    description:
      'Expense-sharing LLD: B paid 50 for A, so A owes B 50. settle() must print A_PAYS_B_50. Balances: negative means you owe; the debtor pays the creditor.',
    expectedOutput: 'A_PAYS_B_50',
    hint: 'Who has the negative balance? Does settle() print debtor_PAYS_creditor or the reverse?',
    explanation:
      'expense credits B and debits A, but settle emits B_PAYS_A_50 — the creditor paying the debtor. Settlement direction follows the sign: the negative balance pays the positive one.',
    code: {
      py: `class Books:
    def __init__(self):
        self.bal = {'A': 0, 'B': 0}
    def expense(self, paid_by, owed_by, amt):
        self.bal[paid_by] += amt
        self.bal[owed_by] -= amt
    def settle(self):
        if self.bal['A'] < 0:
            return 'B_PAYS_A_' + str(-self.bal['A'])
        return 'SETTLED'
bk = Books()
bk.expense('B', 'A', 50)
print(bk.settle())`,
      java: `public class Main {
  static java.util.Map<String,Integer> bal = new java.util.HashMap<>();
  static void expense(String paidBy, String owedBy, int amt) {
    bal.put(paidBy, bal.get(paidBy) + amt);
    bal.put(owedBy, bal.get(owedBy) - amt);
  }
  static String settle() {
    if (bal.get("A") < 0) return "B_PAYS_A_" + (-bal.get("A"));
    return "SETTLED";
  }
  public static void main(String[] args) {
    bal.put("A", 0); bal.put("B", 0);
    expense("B", "A", 50);
    System.out.println(settle());
  }
}`,
      cpp: `#include <iostream>
#include <string>
#include <map>
using namespace std;
map<string,int> bal;
void expense(string paidBy, string owedBy, int amt) {
  bal[paidBy] += amt; bal[owedBy] -= amt;
}
string settle() {
  if (bal["A"] < 0) return string("B_PAYS_A_") + to_string(-bal["A"]);
  return "SETTLED";
}
int main() {
  bal["A"] = 0; bal["B"] = 0;
  expense("B", "A", 50);
  cout << settle() << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var bal = new Dictionary<string,int>{{"A",0},{"B",0}};
void Expense(string paidBy, string owedBy, int amt) {
  bal[paidBy] += amt; bal[owedBy] -= amt;
}
string Settle() {
  if (bal["A"] < 0) return "B_PAYS_A_" + (-bal["A"]);
  return "SETTLED";
}
Expense("B", "A", 50);
Console.WriteLine(Settle());`,
      go: `package main
import "fmt"
func main() {
  bal := map[string]int{"A": 0, "B": 0}
  expense := func(paidBy, owedBy string, amt int) {
    bal[paidBy] += amt
    bal[owedBy] -= amt
  }
  settle := func() string {
    if bal["A"] < 0 {
      return fmt.Sprintf("B_PAYS_A_%d", -bal["A"])
    }
    return "SETTLED"
  }
  expense("B", "A", 50)
  fmt.Println(settle())
}`,
      rust: `use std::collections::HashMap;
fn expense(bal: &mut HashMap<&str,i32>, paid_by: &str, owed_by: &str, amt: i32) {
  *bal.get_mut(paid_by).unwrap() += amt;
  *bal.get_mut(owed_by).unwrap() -= amt;
}
fn settle(bal: &HashMap<&str,i32>) -> String {
  if bal["A"] < 0 { return format!("B_PAYS_A_{}", -bal["A"]); }
  "SETTLED".into()
}
fn main() {
  let mut bal = HashMap::from([("A", 0), ("B", 0)]);
  expense(&mut bal, "B", "A", 50);
  println!("{}", settle(&bal));
}`,
      ts: `const bal: Record<string, number> = { A: 0, B: 0 }
function expense(paidBy: string, owedBy: string, amt: number) {
  bal[paidBy] += amt
  bal[owedBy] -= amt
}
function settle() {
  if (bal['A'] < 0) return 'B_PAYS_A_' + (-bal['A'])
  return 'SETTLED'
}
expense('B', 'A', 50)
console.log(settle())`,
      php: `<?php
class Books {
  public $bal = ['A' => 0, 'B' => 0];
  function expense($paidBy, $owedBy, $amt) {
    $this->bal[$paidBy] += $amt;
    $this->bal[$owedBy] -= $amt;
  }
  function settle() {
    if ($this->bal['A'] < 0) return 'B_PAYS_A_' . (-$this->bal['A']);
    return 'SETTLED';
  }
}
$bk = new Books();
$bk->expense('B', 'A', 50);
echo $bk->settle(), PHP_EOL;`,
      rb: `class Books
  def initialize
    @bal = {'A' => 0, 'B' => 0}
  end
  def expense(paid_by, owed_by, amt)
    @bal[paid_by] += amt
    @bal[owed_by] -= amt
  end
  def settle
    return 'B_PAYS_A_' + (-@bal['A']).to_s if @bal['A'] < 0
    'SETTLED'
  end
end
bk = Books.new
bk.expense('B', 'A', 50)
puts bk.settle`,
    },
  }),

  challenge({
    slug: 'hotel-checkout-blocks-next',
    title: 'Hotel Booking — Checkout Day Still Blocked',
    difficulty: 'medium',
    bugType: 'boundary',
    tags: ['hotel-booking', 'intervals', 'invariants'],
    order: 38,
    description:
      'Hotel room calendar: check-in is inclusive, checkout is exclusive (the room is free that morning). Alice books days 1–3 (checkout on 3). Bob books 3–5 and must get OK — same-day turnover is allowed.',
    expectedOutput: 'OK',
    hint: 'Is the checkout day treated as still occupied? Should interval overlap use < end or <= end?',
    explanation:
      'Overlap uses inclusive ends (start <= otherEnd), so Bob arriving on Alice’s checkout day is OVERLAP. Hotel intervals are half-open [checkIn, checkOut): adjacent bookings that share the checkout/check-in day do not conflict.',
    code: {
      py: `class Hotel:
    def __init__(self):
        self.bookings = []
    def book(self, start, end):
        for s, e in self.bookings:
            if start <= e and end >= s:
                return 'OVERLAP'
        self.bookings.append((start, end))
        return 'OK'
h = Hotel()
h.book(1, 3)
print(h.book(3, 5))`,
      java: `public class Main {
  static java.util.List<int[]> bookings = new java.util.ArrayList<>();
  static String book(int start, int end) {
    for (int[] b : bookings) {
      if (start <= b[1] && end >= b[0]) return "OVERLAP";
    }
    bookings.add(new int[]{start, end});
    return "OK";
  }
  public static void main(String[] args) {
    book(1, 3);
    System.out.println(book(3, 5));
  }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
vector<pair<int,int>> bookings;
string book(int start, int end) {
  for (auto &b : bookings)
    if (start <= b.second && end >= b.first) return "OVERLAP";
  bookings.push_back({start, end});
  return "OK";
}
int main() {
  book(1, 3);
  cout << book(3, 5) << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var bookings = new List<(int s, int e)>();
string Book(int start, int end) {
  foreach (var b in bookings)
    if (start <= b.e && end >= b.s) return "OVERLAP";
  bookings.Add((start, end));
  return "OK";
}
Book(1, 3);
Console.WriteLine(Book(3, 5));`,
      go: `package main
import "fmt"
func main() {
  type iv struct{ s, e int }
  bookings := []iv{}
  book := func(start, end int) string {
    for _, b := range bookings {
      if start <= b.e && end >= b.s { return "OVERLAP" }
    }
    bookings = append(bookings, iv{start, end})
    return "OK"
  }
  book(1, 3)
  fmt.Println(book(3, 5))
}`,
      rust: `fn book(bookings: &mut Vec<(i32,i32)>, start: i32, end: i32) -> &'static str {
  for &(s, e) in bookings.iter() {
    if start <= e && end >= s { return "OVERLAP"; }
  }
  bookings.push((start, end));
  "OK"
}
fn main() {
  let mut bookings = vec![];
  book(&mut bookings, 1, 3);
  println!("{}", book(&mut bookings, 3, 5));
}`,
      ts: `const bookings: [number, number][] = []
function book(start: number, end: number) {
  for (const [s, e] of bookings) {
    if (start <= e && end >= s) return 'OVERLAP'
  }
  bookings.push([start, end])
  return 'OK'
}
book(1, 3)
console.log(book(3, 5))`,
      php: `<?php
class Hotel {
  public $bookings = [];
  function book($start, $end) {
    foreach ($this->bookings as $b) {
      if ($start <= $b[1] && $end >= $b[0]) return 'OVERLAP';
    }
    $this->bookings[] = [$start, $end];
    return 'OK';
  }
}
$h = new Hotel();
$h->book(1, 3);
echo $h->book(3, 5), PHP_EOL;`,
      rb: `class Hotel
  def initialize
    @bookings = []
  end
  def book(start, finish)
    @bookings.each do |s, e|
      return 'OVERLAP' if start <= e && finish >= s
    end
    @bookings << [start, finish]
    'OK'
  end
end
h = Hotel.new
h.book(1, 3)
puts h.book(3, 5)`,
    },
  }),

  challenge({
    slug: 'cart-discount-then-tax-wrong',
    title: 'Shopping Cart — Discount Applied After Percent Off',
    difficulty: 'medium',
    bugType: 'wrong-algorithm',
    tags: ['shopping-cart', 'pricing', 'invariants'],
    order: 39,
    description:
      'Checkout pricing: cart total 100. Apply a flat coupon of 20 first, then 10% off the remainder. Expected 72 (80 × 0.9). Percent-off must not run on the original price before the coupon.',
    expectedOutput: '72',
    hint: 'Which runs first in total(): the percent discount or the flat coupon? Coupons usually reduce the subtotal before percent off.',
    explanation:
      'total() takes 10% off 100 then subtracts 20, yielding 70. The intended pipeline is coupon then percent: (100 − 20) × 0.9 = 72. Order of pricing rules is an invariant interviewers love to flip.',
    code: {
      py: `class Cart:
    def __init__(self, price):
        self.price, self.coupon, self.pct = price, 0, 0
    def apply_coupon(self, n):
        self.coupon = n
    def apply_pct(self, n):
        self.pct = n
    def total(self):
        t = self.price * (100 - self.pct) // 100
        return t - self.coupon
c = Cart(100)
c.apply_coupon(20)
c.apply_pct(10)
print(c.total())`,
      java: `public class Main {
  static int price = 100, coupon = 0, pct = 0;
  static int total() {
    int t = price * (100 - pct) / 100;
    return t - coupon;
  }
  public static void main(String[] args) {
    coupon = 20; pct = 10;
    System.out.println(total());
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int price = 100, coupon = 0, pct = 0;
int total() {
  int t = price * (100 - pct) / 100;
  return t - coupon;
}
int main() {
  coupon = 20; pct = 10;
  cout << total() << endl;
}`,
      cs: `using System;
int price = 100, coupon = 0, pct = 0;
int Total() {
  int t = price * (100 - pct) / 100;
  return t - coupon;
}
coupon = 20; pct = 10;
Console.WriteLine(Total());`,
      go: `package main
import "fmt"
func main() {
  price, coupon, pct := 100, 0, 0
  total := func() int {
    t := price * (100 - pct) / 100
    return t - coupon
  }
  coupon, pct = 20, 10
  fmt.Println(total())
}`,
      rust: `fn total(price: i32, coupon: i32, pct: i32) -> i32 {
  let t = price * (100 - pct) / 100;
  t - coupon
}
fn main() {
  println!("{}", total(100, 20, 10));
}`,
      ts: `let price = 100, coupon = 0, pct = 0
function total() {
  const t = Math.floor(price * (100 - pct) / 100)
  return t - coupon
}
coupon = 20; pct = 10
console.log(total())`,
      php: `<?php
class Cart {
  public $price = 100, $coupon = 0, $pct = 0;
  function total() {
    $t = intdiv($this->price * (100 - $this->pct), 100);
    return $t - $this->coupon;
  }
}
$c = new Cart();
$c->coupon = 20; $c->pct = 10;
echo $c->total(), PHP_EOL;`,
      rb: `class Cart
  attr_accessor :price, :coupon, :pct
  def initialize
    @price, @coupon, @pct = 100, 0, 0
  end
  def total
    t = @price * (100 - @pct) / 100
    t - @coupon
  end
end
c = Cart.new
c.coupon, c.pct = 20, 10
puts c.total`,
    },
  }),

  challenge({
    slug: 'rate-limiter-boundary-burst',
    title: 'API Rate Limiter — Off-By-One Allows Limit+1',
    difficulty: 'medium',
    bugType: 'off-by-one',
    tags: ['rate-limiter', 'boundary', 'invariants'],
    order: 40,
    description:
      'Fixed-window rate limiter: at most 2 requests. allow() three times in the same window. The third call must return BLOCK. Compare count against limit with a strict less-than before incrementing.',
    expectedOutput: 'BLOCK',
    hint: 'When count already equals limit, does allow() still increment? Is the test count <= limit or count < limit?',
    explanation:
      'allow uses count <= limit, so the 3rd call still sees 2 <= 2 and returns ALLOW. Capacity is exclusive at the limit: admit only while count < limit, then increment. This is the classic off-by-one in token/window counters.',
    code: {
      py: `class Limiter:
    def __init__(self, limit):
        self.limit, self.count = limit, 0
    def allow(self):
        if self.count <= self.limit:
            self.count += 1
            return 'ALLOW'
        return 'BLOCK'
lim = Limiter(2)
lim.allow()
lim.allow()
print(lim.allow())`,
      java: `public class Main {
  static int limit = 2, count = 0;
  static String allow() {
    if (count <= limit) { count++; return "ALLOW"; }
    return "BLOCK";
  }
  public static void main(String[] args) {
    allow(); allow();
    System.out.println(allow());
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int limit = 2, countN = 0;
string allow() {
  if (countN <= limit) { countN++; return "ALLOW"; }
  return "BLOCK";
}
int main() {
  allow(); allow();
  cout << allow() << endl;
}`,
      cs: `using System;
int limit = 2, count = 0;
string Allow() {
  if (count <= limit) { count++; return "ALLOW"; }
  return "BLOCK";
}
Allow(); Allow();
Console.WriteLine(Allow());`,
      go: `package main
import "fmt"
func main() {
  limit, count := 2, 0
  allow := func() string {
    if count <= limit {
      count++
      return "ALLOW"
    }
    return "BLOCK"
  }
  allow(); allow()
  fmt.Println(allow())
}`,
      rust: `fn allow(count: &mut i32, limit: i32) -> &'static str {
  if *count <= limit { *count += 1; return "ALLOW"; }
  "BLOCK"
}
fn main() {
  let mut count = 0;
  allow(&mut count, 2);
  allow(&mut count, 2);
  println!("{}", allow(&mut count, 2));
}`,
      ts: `let limit = 2, count = 0
function allow() {
  if (count <= limit) { count++; return 'ALLOW' }
  return 'BLOCK'
}
allow(); allow()
console.log(allow())`,
      php: `<?php
class Limiter {
  public $limit, $count = 0;
  function __construct($limit) { $this->limit = $limit; }
  function allow() {
    if ($this->count <= $this->limit) { $this->count++; return 'ALLOW'; }
    return 'BLOCK';
  }
}
$lim = new Limiter(2);
$lim->allow(); $lim->allow();
echo $lim->allow(), PHP_EOL;`,
      rb: `class Limiter
  def initialize(limit)
    @limit, @count = limit, 0
  end
  def allow
    if @count <= @limit
      @count += 1
      return 'ALLOW'
    end
    'BLOCK'
  end
end
lim = Limiter.new(2)
lim.allow; lim.allow
puts lim.allow`,
    },
  }),

  challenge({
    slug: 'lru-get-does-not-refresh',
    title: 'LRU Cache — GET Does Not Mark Recently Used',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['lru-cache', 'eviction', 'invariants'],
    order: 41,
    description:
      'LRU cache capacity 2: put(1), put(2), get(1), put(3). Key 1 was just read so 2 is least-recent and must be evicted. Then get(2) is MISS and get(1) is HIT.',
    expectedOutput: 'MISS\nHIT',
    hint: 'Does get() move the key to the most-recently-used end, or only put()?',
    explanation:
      'get returns HIT but never refreshes recency, so the order stays [1,2] and put(3) evicts 1. LRU recency is updated on both get and put; after get(1) the victim of the next insert must be 2.',
    code: {
      py: `class LRU:
    def __init__(self, cap):
        self.cap, self.order, self.data = cap, [], {}
    def put(self, k, v):
        if len(self.data) >= self.cap:
            old = self.order.pop(0)
            del self.data[old]
        self.order.append(k)
        self.data[k] = v
    def get(self, k):
        if k not in self.data:
            return 'MISS'
        return 'HIT'
c = LRU(2)
c.put(1, 1); c.put(2, 2); c.get(1); c.put(3, 3)
print(c.get(2))
print(c.get(1))`,
      java: `public class Main {
  static java.util.List<Integer> order = new java.util.ArrayList<>();
  static java.util.Map<Integer,Integer> data = new java.util.HashMap<>();
  static final int CAP = 2;
  static void put(int k, int v) {
    if (data.size() >= CAP) data.remove(order.remove(0));
    order.add(k); data.put(k, v);
  }
  static String get(int k) {
    if (!data.containsKey(k)) return "MISS";
    return "HIT";
  }
  public static void main(String[] args) {
    put(1,1); put(2,2); get(1); put(3,3);
    System.out.println(get(2));
    System.out.println(get(1));
  }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <map>
using namespace std;
int CAP = 2;
vector<int> order;
map<int,int> store;
void put(int k, int v) {
  if ((int)store.size() >= CAP) { store.erase(order[0]); order.erase(order.begin()); }
  order.push_back(k); store[k] = v;
}
string lookup(int k) {
  if (!store.count(k)) return "MISS";
  return "HIT";
}
int main() {
  put(1,1); put(2,2); lookup(1); put(3,3);
  cout << lookup(2) << endl;
  cout << lookup(1) << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
int cap = 2;
var order = new List<int>();
var data = new Dictionary<int,int>();
void Put(int k, int v) {
  if (data.Count >= cap) { data.Remove(order[0]); order.RemoveAt(0); }
  order.Add(k); data[k] = v;
}
string Get(int k) {
  if (!data.ContainsKey(k)) return "MISS";
  return "HIT";
}
Put(1,1); Put(2,2); Get(1); Put(3,3);
Console.WriteLine(Get(2));
Console.WriteLine(Get(1));`,
      go: `package main
import "fmt"
func main() {
  capN, order, data := 2, []int{}, map[int]int{}
  put := func(k, v int) {
    if len(data) >= capN {
      delete(data, order[0]); order = order[1:]
    }
    order = append(order, k); data[k] = v
  }
  get := func(k int) string {
    if _, ok := data[k]; !ok { return "MISS" }
    return "HIT"
  }
  put(1,1); put(2,2); get(1); put(3,3)
  fmt.Println(get(2))
  fmt.Println(get(1))
}`,
      rust: `use std::collections::HashMap;
fn put(cap: usize, order: &mut Vec<i32>, data: &mut HashMap<i32,i32>, k: i32, v: i32) {
  if data.len() >= cap {
    let old = order.remove(0);
    data.remove(&old);
  }
  order.push(k); data.insert(k, v);
}
fn get(data: &HashMap<i32,i32>, k: i32) -> &'static str {
  if !data.contains_key(&k) { return "MISS"; }
  "HIT"
}
fn main() {
  let mut order = vec![];
  let mut data = HashMap::new();
  put(2, &mut order, &mut data, 1, 1);
  put(2, &mut order, &mut data, 2, 2);
  get(&data, 1);
  put(2, &mut order, &mut data, 3, 3);
  println!("{}", get(&data, 2));
  println!("{}", get(&data, 1));
}`,
      ts: `const cap = 2
const order: number[] = []
const data = new Map<number, number>()
function put(k: number, v: number) {
  if (data.size >= cap) { data.delete(order.shift()!) }
  order.push(k); data.set(k, v)
}
function get(k: number) {
  if (!data.has(k)) return 'MISS'
  return 'HIT'
}
put(1,1); put(2,2); get(1); put(3,3)
console.log(get(2))
console.log(get(1))`,
      php: `<?php
class LRU {
  public $cap, $order = [], $data = [];
  function __construct($cap) { $this->cap = $cap; }
  function put($k, $v) {
    if (count($this->data) >= $this->cap) {
      $old = array_shift($this->order); unset($this->data[$old]);
    }
    $this->order[] = $k; $this->data[$k] = $v;
  }
  function get($k) {
    if (!isset($this->data[$k])) return 'MISS';
    return 'HIT';
  }
}
$c = new LRU(2);
$c->put(1,1); $c->put(2,2); $c->get(1); $c->put(3,3);
echo $c->get(2), PHP_EOL;
echo $c->get(1), PHP_EOL;`,
      rb: `class LRU
  def initialize(cap)
    @cap, @order, @data = cap, [], {}
  end
  def put(k, v)
    if @data.size >= @cap
      old = @order.shift
      @data.delete(old)
    end
    @order << k
    @data[k] = v
  end
  def get(k)
    return 'MISS' unless @data.key?(k)
    'HIT'
  end
end
c = LRU.new(2)
c.put(1,1); c.put(2,2); c.get(1); c.put(3,3)
puts c.get(2)
puts c.get(1)`,
    },
  }),

  challenge({
    slug: 'uber-matches-farthest',
    title: 'Ride Matching — Assigns the Farthest Driver',
    difficulty: 'medium',
    bugType: 'wrong-algorithm',
    tags: ['uber', 'matching', 'greedy'],
    order: 42,
    description:
      'Ride matching: rider at position 0, drivers at 3 and 10. Dispatch must pick the nearest driver (3). Distance is absolute difference from the rider.',
    expectedOutput: '3',
    hint: 'Is assign() taking the minimum distance or the maximum?',
    explanation:
      'The matcher keeps the driver with the larger distance, so 10 wins. Nearest-driver dispatch is min |driver − rider|. Swap the comparison to track the smaller distance.',
    code: {
      py: `class Match:
    def __init__(self):
        self.drivers = [3, 10]
        self.rider = 0
    def assign(self):
        best, best_d = None, -1
        for pos in self.drivers:
            d = abs(pos - self.rider)
            if d > best_d:
                best_d, best = d, pos
        return best
print(Match().assign())`,
      java: `public class Main {
  static int[] drivers = {3, 10};
  static int rider = 0;
  static int assign() {
    int best = 0, bestD = -1;
    for (int pos : drivers) {
      int d = Math.abs(pos - rider);
      if (d > bestD) { bestD = d; best = pos; }
    }
    return best;
  }
  public static void main(String[] args) {
    System.out.println(assign());
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int drivers[] = {3, 10};
int rider = 0;
int assign() {
  int best = 0, bestD = -1;
  for (int pos : drivers) {
    int d = pos > rider ? pos - rider : rider - pos;
    if (d > bestD) { bestD = d; best = pos; }
  }
  return best;
}
int main() { cout << assign() << endl; }`,
      cs: `using System;
int[] drivers = {3, 10};
int rider = 0;
int Assign() {
  int best = 0, bestD = -1;
  foreach (int pos in drivers) {
    int d = Math.Abs(pos - rider);
    if (d > bestD) { bestD = d; best = pos; }
  }
  return best;
}
Console.WriteLine(Assign());`,
      go: `package main
import "fmt"
func main() {
  drivers := []int{3, 10}
  rider := 0
  best, bestD := 0, -1
  for _, pos := range drivers {
    d := pos - rider
    if d < 0 { d = -d }
    if d > bestD { bestD, best = d, pos }
  }
  fmt.Println(best)
}`,
      rust: `fn assign(drivers: &[i32], rider: i32) -> i32 {
  let mut best = 0;
  let mut best_d = -1;
  for &pos in drivers {
    let d = (pos - rider).abs();
    if d > best_d { best_d = d; best = pos; }
  }
  best
}
fn main() {
  println!("{}", assign(&[3, 10], 0));
}`,
      ts: `const drivers = [3, 10]
const rider = 0
function assign() {
  let best = 0, bestD = -1
  for (const pos of drivers) {
    const d = Math.abs(pos - rider)
    if (d > bestD) { bestD = d; best = pos }
  }
  return best
}
console.log(assign())`,
      php: `<?php
class RideMatch {
  public $drivers = [3, 10];
  public $rider = 0;
  function assign() {
    $best = 0; $bestD = -1;
    foreach ($this->drivers as $pos) {
      $d = abs($pos - $this->rider);
      if ($d > $bestD) { $bestD = $d; $best = $pos; }
    }
    return $best;
  }
}
echo (new RideMatch())->assign(), PHP_EOL;`,
      rb: `class Match
  def initialize
    @drivers, @rider = [3, 10], 0
  end
  def assign
    best, best_d = 0, -1
    @drivers.each do |pos|
      d = (pos - @rider).abs
      if d > best_d
        best_d, best = d, pos
      end
    end
    best
  end
end
puts Match.new.assign`,
    },
  }),

  challenge({
    slug: 'locker-assigns-too-small',
    title: 'Amazon Locker — Package Assigned Undersized Locker',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['amazon-locker', 'assignment', 'invariants'],
    order: 43,
    description:
      'Locker assignment: package size 5. Lockers: SMALL capacity 2, LARGE capacity 8. The package must go to LARGE. Never place a package in a locker smaller than the package.',
    expectedOutput: 'LARGE',
    hint: 'Does assign() skip lockers whose capacity is less than the package size, or take the first locker blindly?',
    explanation:
      'assign returns the first locker (SMALL) without comparing capacities. Fit is an invariant: locker.capacity >= package.size. Scan until LARGE (8 >= 5).',
    code: {
      py: `class Hub:
    def __init__(self):
        self.lockers = [('SMALL', 2), ('LARGE', 8)]
    def assign(self, sz):
        for name, cap in self.lockers:
            return name
        return 'NONE'
print(Hub().assign(5))`,
      java: `public class Main {
  static String[] names = {"SMALL", "LARGE"};
  static int[] caps = {2, 8};
  static String assign(int sz) {
    for (int i = 0; i < names.length; i++) return names[i];
    return "NONE";
  }
  public static void main(String[] args) {
    System.out.println(assign(5));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string names[] = {"SMALL", "LARGE"};
int caps[] = {2, 8};
string assign(int sz) {
  for (int i = 0; i < 2; i++) return names[i];
  return "NONE";
}
int main() { cout << assign(5) << endl; }`,
      cs: `using System;
string[] names = {"SMALL", "LARGE"};
int[] caps = {2, 8};
string Assign(int sz) {
  foreach (var n in names) return n;
  return "NONE";
}
Console.WriteLine(Assign(5));`,
      go: `package main
import "fmt"
func main() {
  names := []string{"SMALL", "LARGE"}
  caps := []int{2, 8}
  assign := func(_ int) string {
    for i := range names {
      _ = caps[i]
      return names[i]
    }
    return "NONE"
  }
  fmt.Println(assign(5))
}`,
      rust: `fn assign(names: &[&str], _caps: &[i32], _sz: i32) -> &'static str {
  for &n in names { return n; }
  "NONE"
}
fn main() {
  println!("{}", assign(&["SMALL", "LARGE"], &[2, 8], 5));
}`,
      ts: `const names = ['SMALL', 'LARGE']
const caps = [2, 8]
function assign(_sz: number) {
  for (const n of names) return n
  return 'NONE'
}
console.log(assign(5))`,
      php: `<?php
class Hub {
  public $lockers = [['SMALL', 2], ['LARGE', 8]];
  function assign($sz) {
    foreach ($this->lockers as $L) return $L[0];
    return 'NONE';
  }
}
echo (new Hub())->assign(5), PHP_EOL;`,
      rb: `class Hub
  def initialize
    @lockers = [['SMALL', 2], ['LARGE', 8]]
  end
  def assign(sz)
    @lockers.each { |name, cap| return name }
    'NONE'
  end
end
puts Hub.new.assign(5)`,
    },
  }),

  challenge({
    slug: 'calendar-misses-overlap',
    title: 'Meeting Scheduler — Overlap Not Detected',
    difficulty: 'medium',
    bugType: 'edge-case',
    tags: ['calendar', 'intervals', 'invariants'],
    order: 44,
    description:
      'Meeting calendar: one meeting is 9–11. Adding 10–12 must return CONFLICT. Two meetings conflict if their half-open intervals overlap, not only if they are identical.',
    expectedOutput: 'CONFLICT',
    hint: 'Does add() only reject equal start/end, or any intersecting interval?',
    explanation:
      'Conflict is tested with equality (same start and end), so 10–12 slides in beside 9–11. Overlap is start < other.end && end > other.start. Partial overlap is still a conflict.',
    code: {
      py: `class Cal:
    def __init__(self):
        self.m = []
    def add(self, s, e):
        for a, b in self.m:
            if a == s and b == e:
                return 'CONFLICT'
        self.m.append((s, e))
        return 'OK'
c = Cal()
c.add(9, 11)
print(c.add(10, 12))`,
      java: `public class Main {
  static java.util.List<int[]> m = new java.util.ArrayList<>();
  static String add(int s, int e) {
    for (int[] x : m) if (x[0] == s && x[1] == e) return "CONFLICT";
    m.add(new int[]{s, e});
    return "OK";
  }
  public static void main(String[] args) {
    add(9, 11);
    System.out.println(add(10, 12));
  }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
vector<pair<int,int>> m;
string add(int s, int e) {
  for (auto &x : m) if (x.first == s && x.second == e) return "CONFLICT";
  m.push_back({s, e});
  return "OK";
}
int main() {
  add(9, 11);
  cout << add(10, 12) << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var m = new List<(int s, int e)>();
string Add(int s, int e) {
  foreach (var x in m) if (x.s == s && x.e == e) return "CONFLICT";
  m.Add((s, e));
  return "OK";
}
Add(9, 11);
Console.WriteLine(Add(10, 12));`,
      go: `package main
import "fmt"
func main() {
  type iv struct{ s, e int }
  meetings := []iv{}
  add := func(s, e int) string {
    for _, x := range meetings {
      if x.s == s && x.e == e { return "CONFLICT" }
    }
    meetings = append(meetings, iv{s, e})
    return "OK"
  }
  add(9, 11)
  fmt.Println(add(10, 12))
}`,
      rust: `fn add(m: &mut Vec<(i32,i32)>, s: i32, e: i32) -> &'static str {
  for &(a, b) in m.iter() {
    if a == s && b == e { return "CONFLICT"; }
  }
  m.push((s, e));
  "OK"
}
fn main() {
  let mut m = vec![];
  add(&mut m, 9, 11);
  println!("{}", add(&mut m, 10, 12));
}`,
      ts: `const m: [number, number][] = []
function add(s: number, e: number) {
  for (const [a, b] of m) if (a === s && b === e) return 'CONFLICT'
  m.push([s, e])
  return 'OK'
}
add(9, 11)
console.log(add(10, 12))`,
      php: `<?php
class Cal {
  public $m = [];
  function add($s, $e) {
    foreach ($this->m as $x)
      if ($x[0] == $s && $x[1] == $e) return 'CONFLICT';
    $this->m[] = [$s, $e];
    return 'OK';
  }
}
$c = new Cal();
$c->add(9, 11);
echo $c->add(10, 12), PHP_EOL;`,
      rb: `class Cal
  def initialize
    @m = []
  end
  def add(s, e)
    @m.each { |a, b| return 'CONFLICT' if a == s && b == e }
    @m << [s, e]
    'OK'
  end
end
c = Cal.new
c.add(9, 11)
puts c.add(10, 12)`,
    },
  }),

  challenge({
    slug: 'wallet-credit-without-debit',
    title: 'Wallet Transfer — Receiver Credited, Sender Not Debited',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['wallet', 'atomicity', 'invariants'],
    order: 45,
    description:
      'Wallet transfer: A has 100, B has 0. transfer(40) from A to B must leave A=60 and B=40. Money is conserved: credit and debit are one atomic action.',
    expectedOutput: '60\n40',
    hint: 'Does transfer() subtract from the sender, or only add to the receiver?',
    explanation:
      'B is credited 40 while A stays at 100 — money is created. A transfer is two sides of one invariant: sender.balance -= amt and receiver.balance += amt, with a sufficient-funds check.',
    code: {
      py: `class Wallet:
    def __init__(self):
        self.a, self.b = 100, 0
    def transfer(self, amt):
        self.b += amt
w = Wallet()
w.transfer(40)
print(w.a)
print(w.b)`,
      java: `public class Main {
  static int a = 100, b = 0;
  static void transfer(int amt) { b += amt; }
  public static void main(String[] args) {
    transfer(40);
    System.out.println(a);
    System.out.println(b);
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int a = 100, b = 0;
void transfer(int amt) { b += amt; }
int main() {
  transfer(40);
  cout << a << endl;
  cout << b << endl;
}`,
      cs: `using System;
int a = 100, b = 0;
void Transfer(int amt) {
  b += amt;
}
Transfer(40);
Console.WriteLine(a);
Console.WriteLine(b);`,
      go: `package main
import "fmt"
func main() {
  a, b := 100, 0
  transfer := func(amt int) { b += amt }
  transfer(40)
  fmt.Println(a)
  fmt.Println(b)
}`,
      rust: `fn transfer(_a: &mut i32, b: &mut i32, amt: i32) { *b += amt; }
fn main() {
  let mut a = 100;
  let mut b = 0;
  transfer(&mut a, &mut b, 40);
  println!("{}", a);
  println!("{}", b);
}`,
      ts: `class Wallet {
  a = 100
  b = 0
  transfer(amt: number) {
    this.b += amt
  }
}
const w = new Wallet()
w.transfer(40)
console.log(w.a)
console.log(w.b)`,
      php: `<?php
class Wallet {
  public $a = 100, $b = 0;
  function transfer($amt) { $this->b += $amt; }
}
$w = new Wallet();
$w->transfer(40);
echo $w->a, PHP_EOL;
echo $w->b, PHP_EOL;`,
      rb: `class Wallet
  attr_reader :a, :b
  def initialize
    @a, @b = 100, 0
  end
  def transfer(amt)
    @b += amt
  end
end
w = Wallet.new
w.transfer(40)
puts w.a
puts w.b`,
    },
  }),

  challenge({
    slug: 'pubsub-unsub-still-receives',
    title: 'Pub/Sub — Unsubscribe Leaves Subscriber',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['pubsub', 'observer', 'invariants'],
    order: 46,
    description:
      'Pub/sub bus: subscribe A, unsubscribe A, then publish. A must receive 0 messages. Unsubscribe has to remove the listener so later publishes skip it.',
    expectedOutput: '0',
    hint: 'Is unsub() actually removing the id from the subscriber list?',
    explanation:
      'unsub is a no-op, so A stays in the list and publish counts 1. Observer lists are mutable: unsubscribe must delete the subscriber before the next fan-out.',
    code: {
      py: `class Bus:
    def __init__(self):
        self.subs, self.n = [], 0
    def sub(self, i):
        self.subs.append(i)
    def unsub(self, i):
        pass
    def pub(self):
        self.n = len(self.subs)
b = Bus()
b.sub('A')
b.unsub('A')
b.pub()
print(b.n)`,
      java: `public class Main {
  static java.util.List<String> subs = new java.util.ArrayList<>();
  static int n = 0;
  static void sub(String i) { subs.add(i); }
  static void unsub(String i) { }
  static void pub() { n = subs.size(); }
  public static void main(String[] args) {
    sub("A"); unsub("A"); pub();
    System.out.println(n);
  }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
vector<string> subs;
int n = 0;
void sub(string i) { subs.push_back(i); }
void unsub(string i) { }
void pub() { n = (int)subs.size(); }
int main() {
  sub("A"); unsub("A"); pub();
  cout << n << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var subs = new List<string>();
int n = 0;
void Sub(string i) { subs.Add(i); }
void Unsub(string i) { }
void Pub() { n = subs.Count; }
Sub("A"); Unsub("A"); Pub();
Console.WriteLine(n);`,
      go: `package main
import "fmt"
func main() {
  subs := []string{}
  n := 0
  sub := func(i string) { subs = append(subs, i) }
  unsub := func(_ string) { }
  pub := func() { n = len(subs) }
  sub("A"); unsub("A"); pub()
  fmt.Println(n)
}`,
      rust: `fn sub(subs: &mut Vec<&str>, i: &str) { subs.push(i); }
fn unsub(_subs: &mut Vec<&str>, _i: &str) { }
fn pub_msg(subs: &Vec<&str>) -> usize { subs.len() }
fn main() {
  let mut subs = vec![];
  sub(&mut subs, "A");
  unsub(&mut subs, "A");
  println!("{}", pub_msg(&subs));
}`,
      ts: `const subs: string[] = []
let n = 0
function sub(i: string) { subs.push(i) }
function unsub(_i: string) { }
function pub() { n = subs.length }
sub('A'); unsub('A'); pub()
console.log(n)`,
      php: `<?php
class Bus {
  public $subs = [];
  public $n = 0;
  function sub($i) { $this->subs[] = $i; }
  function unsub($i) { }
  function pub() { $this->n = count($this->subs); }
}
$b = new Bus();
$b->sub('A');
$b->unsub('A');
$b->pub();
echo $b->n, PHP_EOL;`,
      rb: `class Bus
  attr_reader :n
  def initialize
    @subs, @n = [], 0
  end
  def sub(i)
    @subs << i
  end
  def unsub(i)
  end
  def pub
    @n = @subs.length
  end
end
b = Bus.new
b.sub('A')
b.unsub('A')
b.pub
puts b.n`,
    },
  }),

  challenge({
    slug: 'pool-borrow-never-returns',
    title: 'Connection Pool — Borrow Never Returns',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['connection-pool', 'resource-management', 'invariants'],
    order: 47,
    description:
      'Connection pool of size 1: borrow, return, borrow again. The second borrow must print OK. Returning a connection must put it back in the free count.',
    expectedOutput: 'OK',
    hint: 'Does returnConn() increment the free counter, or is it an empty method?',
    explanation:
      'returnConn is a no-op, so the only connection stays checked out and the second borrow prints EMPTY. Pool size is conserved: every successful borrow decrements free; every return increments it.',
    code: {
      py: `class Pool:
    def __init__(self, n):
        self.free = n
    def borrow(self):
        if self.free == 0:
            return 'EMPTY'
        self.free -= 1
        return 'OK'
    def return_conn(self):
        pass
p = Pool(1)
p.borrow()
p.return_conn()
print(p.borrow())`,
      java: `public class Main {
  static int free = 1;
  static String borrow() {
    if (free == 0) return "EMPTY";
    free--;
    return "OK";
  }
  static void returnConn() { }
  public static void main(String[] args) {
    borrow(); returnConn();
    System.out.println(borrow());
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int freeN = 1;
string borrow() {
  if (freeN == 0) return "EMPTY";
  freeN--;
  return "OK";
}
void returnConn() { }
int main() {
  borrow(); returnConn();
  cout << borrow() << endl;
}`,
      cs: `using System;
int free = 1;
string Borrow() {
  if (free == 0) return "EMPTY";
  free--;
  return "OK";
}
void ReturnConn() { }
Borrow(); ReturnConn();
Console.WriteLine(Borrow());`,
      go: `package main
import "fmt"
func main() {
  free := 1
  borrow := func() string {
    if free == 0 { return "EMPTY" }
    free--
    return "OK"
  }
  returnConn := func() { }
  borrow(); returnConn()
  fmt.Println(borrow())
}`,
      rust: `fn borrow(free: &mut i32) -> &'static str {
  if *free == 0 { return "EMPTY"; }
  *free -= 1;
  "OK"
}
fn return_conn(_free: &mut i32) { }
fn main() {
  let mut free = 1;
  borrow(&mut free);
  return_conn(&mut free);
  println!("{}", borrow(&mut free));
}`,
      ts: `let free = 1
function borrow() {
  if (free === 0) return 'EMPTY'
  free--
  return 'OK'
}
function returnConn() { }
borrow(); returnConn()
console.log(borrow())`,
      php: `<?php
class Pool {
  public $free;
  function __construct($n) { $this->free = $n; }
  function borrow() {
    if ($this->free == 0) return 'EMPTY';
    $this->free--;
    return 'OK';
  }
  function returnConn() { }
}
$p = new Pool(1);
$p->borrow();
$p->returnConn();
echo $p->borrow(), PHP_EOL;`,
      rb: `class Pool
  def initialize(n)
    @free = n
  end
  def borrow
    return 'EMPTY' if @free == 0
    @free -= 1
    'OK'
  end
  def return_conn
  end
end
p = Pool.new(1)
p.borrow
p.return_conn
puts p.borrow`,
    },
  }),

  challenge({
    slug: 'circuit-stays-closed',
    title: 'Circuit Breaker — Never Opens',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['circuit-breaker', 'state-machine', 'invariants'],
    order: 48,
    description:
      'Circuit breaker with failure threshold 2. Record two failures, then read state. After two consecutive failures the breaker must be OPEN so later calls fail fast.',
    expectedOutput: 'OPEN',
    hint: 'Is the open condition failures > threshold or failures >= threshold?',
    explanation:
      'The breaker opens only when failures > 2, so two failures leave it CLOSED. Threshold is inclusive: trip when failures >= threshold. This is the classic off-by-one in circuit-breaker LLD.',
    code: {
      py: `class CB:
    def __init__(self, th):
        self.th, self.fails, self.state = th, 0, 'CLOSED'
    def fail(self):
        self.fails += 1
        if self.fails > self.th:
            self.state = 'OPEN'
cb = CB(2)
cb.fail(); cb.fail()
print(cb.state)`,
      java: `public class Main {
  static int th = 2, fails = 0;
  static String state = "CLOSED";
  static void fail() {
    fails++;
    if (fails > th) state = "OPEN";
  }
  public static void main(String[] args) {
    fail(); fail();
    System.out.println(state);
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int th = 2, fails = 0;
string state = "CLOSED";
void fail() {
  fails++;
  if (fails > th) state = "OPEN";
}
int main() {
  fail(); fail();
  cout << state << endl;
}`,
      cs: `using System;
int th = 2, fails = 0;
string state = "CLOSED";
void Fail() {
  fails++;
  if (fails > th) state = "OPEN";
}
Fail(); Fail();
Console.WriteLine(state);`,
      go: `package main
import "fmt"
func main() {
  th, fails, state := 2, 0, "CLOSED"
  fail := func() {
    fails++
    if fails > th { state = "OPEN" }
  }
  fail(); fail()
  fmt.Println(state)
}`,
      rust: `fn fail(fails: &mut i32, th: i32, state: &mut &str) {
  *fails += 1;
  if *fails > th { *state = "OPEN"; }
}
fn main() {
  let mut fails = 0;
  let mut state = "CLOSED";
  fail(&mut fails, 2, &mut state);
  fail(&mut fails, 2, &mut state);
  println!("{}", state);
}`,
      ts: `let th = 2, fails = 0, state = 'CLOSED'
function fail() {
  fails++
  if (fails > th) state = 'OPEN'
}
fail(); fail()
console.log(state)`,
      php: `<?php
class CB {
  public $th, $fails = 0, $state = 'CLOSED';
  function __construct($th) { $this->th = $th; }
  function fail() {
    $this->fails++;
    if ($this->fails > $this->th) $this->state = 'OPEN';
  }
}
$cb = new CB(2);
$cb->fail(); $cb->fail();
echo $cb->state, PHP_EOL;`,
      rb: `class CB
  attr_reader :state
  def initialize(th)
    @th, @fails, @state = th, 0, 'CLOSED'
  end
  def fail
    @fails += 1
    @state = 'OPEN' if @fails > @th
  end
end
cb = CB.new(2)
cb.fail; cb.fail
puts cb.state`,
    },
  }),

  challenge({
    slug: 'payment-double-charge',
    title: 'Payment Gateway — Missing Idempotency Key',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['payment-gateway', 'idempotency', 'invariants'],
    order: 49,
    description:
      'Payment gateway: charge the same paymentId twice. The second call must return DUPLICATE and must not charge again. Gateways key charges by idempotency id.',
    expectedOutput: 'DUPLICATE',
    hint: 'Does charge() remember paymentIds it already processed?',
    explanation:
      'Every charge returns CHARGED; the seen set is never consulted. Idempotency: if paymentId is already in the processed set, return DUPLICATE; otherwise record it and charge once.',
    code: {
      py: `class Gw:
    def __init__(self):
        self.seen = set()
    def charge(self, pid):
        return 'CHARGED'
g = Gw()
g.charge('p1')
print(g.charge('p1'))`,
      java: `public class Main {
  static java.util.Set<String> seen = new java.util.HashSet<>();
  static String charge(String pid) {
    return "CHARGED";
  }
  public static void main(String[] args) {
    charge("p1");
    System.out.println(charge("p1"));
  }
}`,
      cpp: `#include <iostream>
#include <string>
#include <set>
using namespace std;
set<string> seen;
string charge(string pid) {
  return "CHARGED";
}
int main() {
  charge("p1");
  cout << charge("p1") << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var seen = new HashSet<string>();
string Charge(string pid) {
  return "CHARGED";
}
Charge("p1");
Console.WriteLine(Charge("p1"));`,
      go: `package main
import "fmt"
func main() {
  seen := map[string]bool{}
  charge := func(_ string) string {
    return "CHARGED"
  }
  _ = seen
  charge("p1")
  fmt.Println(charge("p1"))
}`,
      rust: `use std::collections::HashSet;
fn charge(_seen: &mut HashSet<&str>, _pid: &str) -> &'static str {
  "CHARGED"
}
fn main() {
  let mut seen = HashSet::new();
  charge(&mut seen, "p1");
  println!("{}", charge(&mut seen, "p1"));
}`,
      ts: `class Gw {
  seen = new Set<string>()
  charge(_pid: string) {
    return 'CHARGED'
  }
}
const g = new Gw()
g.charge('p1')
console.log(g.charge('p1'))`,
      php: `<?php
class Gw {
  public $seen = [];
  function charge($pid) {
    return 'CHARGED';
  }
}
$g = new Gw();
$g->charge('p1');
echo $g->charge('p1'), PHP_EOL;`,
      rb: `class Gw
  def initialize
    @seen = {}
  end
  def charge(pid)
    'CHARGED'
  end
end
g = Gw.new
g.charge('p1')
puts g.charge('p1')`,
    },
  }),

  challenge({
    slug: 'inventory-oversell',
    title: 'Inventory — Last Item Sold Twice',
    difficulty: 'medium',
    bugType: 'edge-case',
    tags: ['inventory', 'invariants', 'reservations'],
    order: 50,
    description:
      'Inventory with stock 1. reserve() then reserve() again. The second call must DENY — you cannot reserve below zero. Check remaining stock before decrementing.',
    expectedOutput: 'DENY',
    hint: 'Is the guard stock < 0 (after a free decrement) or stock <= 0 before selling?',
    explanation:
      'reserve denies only when stock < 0, so the last unit can be sold and then stock goes negative on the next call which still succeeds. Guard with stock <= 0 before decrement so the last item cannot oversell.',
    code: {
      py: `class Inv:
    def __init__(self):
        self.stock = 1
    def reserve(self):
        if self.stock < 0:
            return 'DENY'
        self.stock -= 1
        return 'OK'
inv = Inv()
inv.reserve()
print(inv.reserve())`,
      java: `public class Main {
  static int stock = 1;
  static String reserve() {
    if (stock < 0) return "DENY";
    stock--;
    return "OK";
  }
  public static void main(String[] args) {
    reserve();
    System.out.println(reserve());
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int stock = 1;
string reserve() {
  if (stock < 0) return "DENY";
  stock--;
  return "OK";
}
int main() {
  reserve();
  cout << reserve() << endl;
}`,
      cs: `using System;
int stock = 1;
string Reserve() {
  if (stock < 0) return "DENY";
  stock--;
  return "OK";
}
Reserve();
Console.WriteLine(Reserve());`,
      go: `package main
import "fmt"
func main() {
  stock := 1
  reserve := func() string {
    if stock < 0 { return "DENY" }
    stock--
    return "OK"
  }
  reserve()
  fmt.Println(reserve())
}`,
      rust: `fn reserve(stock: &mut i32) -> &'static str {
  if *stock < 0 { return "DENY"; }
  *stock -= 1;
  "OK"
}
fn main() {
  let mut stock = 1;
  reserve(&mut stock);
  println!("{}", reserve(&mut stock));
}`,
      ts: `let stock = 1
function reserve() {
  if (stock < 0) return 'DENY'
  stock--
  return 'OK'
}
reserve()
console.log(reserve())`,
      php: `<?php
class Inv {
  public $stock = 1;
  function reserve() {
    if ($this->stock < 0) return 'DENY';
    $this->stock--;
    return 'OK';
  }
}
$inv = new Inv();
$inv->reserve();
echo $inv->reserve(), PHP_EOL;`,
      rb: `class Inv
  def initialize
    @stock = 1
  end
  def reserve
    return 'DENY' if @stock < 0
    @stock -= 1
    'OK'
  end
end
inv = Inv.new
inv.reserve
puts inv.reserve`,
    },
  }),

  challenge({
    slug: 'shipping-uses-domestic',
    title: 'Shipping — International Uses Domestic Rate',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['shipping', 'strategy', 'invariants'],
    order: 51,
    description:
      'Shipping rates: domestic (same country) is 10, international is 50. Quote US → IN. Destination is India, so the rate must be 50. Origin being US does not make the shipment domestic.',
    expectedOutput: '50',
    hint: 'Does rate() key off origin == US (always domestic) or origin != destination?',
    explanation:
      'Any shipment whose origin is US is billed 10, so US→IN is undercharged. Domestic vs international is origin == destination vs not. Cross-border must take the international rate.',
    code: {
      py: `class Ship:
    def __init__(self):
        self.domestic, self.intl = 10, 50
    def rate(self, origin, dest):
        if origin == 'US':
            return self.domestic
        return self.intl
print(Ship().rate('US', 'IN'))`,
      java: `public class Main {
  static int domestic = 10, intl = 50;
  static int rate(String origin, String dest) {
    if (origin.equals("US")) return domestic;
    return intl;
  }
  public static void main(String[] args) {
    System.out.println(rate("US", "IN"));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int domestic = 10, intl = 50;
int rate(string origin, string dest) {
  if (origin == "US") return domestic;
  return intl;
}
int main() { cout << rate("US", "IN") << endl; }`,
      cs: `using System;
int domestic = 10, intl = 50;
int Rate(string origin, string dest) {
  if (origin == "US") return domestic;
  return intl;
}
Console.WriteLine(Rate("US", "IN"));`,
      go: `package main
import "fmt"
func main() {
  domestic, intl := 10, 50
  rate := func(origin, _ string) int {
    if origin == "US" { return domestic }
    return intl
  }
  fmt.Println(rate("US", "IN"))
}`,
      rust: `fn rate(origin: &str, _dest: &str, domestic: i32, intl: i32) -> i32 {
  if origin == "US" { return domestic; }
  intl
}
fn main() {
  println!("{}", rate("US", "IN", 10, 50));
}`,
      ts: `const domestic = 10, intl = 50
function rate(origin: string, _dest: string) {
  if (origin === 'US') return domestic
  return intl
}
console.log(rate('US', 'IN'))`,
      php: `<?php
class Ship {
  public $domestic = 10, $intl = 50;
  function rate($origin, $dest) {
    if ($origin == 'US') return $this->domestic;
    return $this->intl;
  }
}
echo (new Ship())->rate('US', 'IN'), PHP_EOL;`,
      rb: `class Ship
  def initialize
    @domestic, @intl = 10, 50
  end
  def rate(origin, dest)
    return @domestic if origin == 'US'
    @intl
  end
end
puts Ship.new.rate('US', 'IN')`,
    },
  }),

  challenge({
    slug: 'rbac-requires-all-roles',
    title: 'RBAC — AND Used Instead of OR',
    difficulty: 'medium',
    bugType: 'wrong-algorithm',
    tags: ['rbac', 'authorization', 'invariants'],
    order: 52,
    description:
      'RBAC: the user has role READ. The action is allowed if the user has READ or ADMIN. authorize() must ALLOW. Required roles on an action are a disjunction, not a conjunction.',
    expectedOutput: 'ALLOW',
    hint: 'Does authorize() require every listed role, or any one of them?',
    explanation:
      'The checker ANDs required roles, so READ alone fails because the user is not also ADMIN. Permission to act is any(user.roles ∩ required). OR, not AND.',
    code: {
      py: `class Guard:
    def __init__(self):
        self.user = ['READ']
        self.need = ['READ', 'ADMIN']
    def authorize(self):
        for r in self.need:
            if r not in self.user:
                return 'DENY'
        return 'ALLOW'
print(Guard().authorize())`,
      java: `public class Main {
  static java.util.Set<String> user = new java.util.HashSet<>(java.util.List.of("READ"));
  static String[] need = {"READ", "ADMIN"};
  static String authorize() {
    for (String r : need) if (!user.contains(r)) return "DENY";
    return "ALLOW";
  }
  public static void main(String[] args) {
    System.out.println(authorize());
  }
}`,
      cpp: `#include <iostream>
#include <string>
#include <set>
using namespace std;
set<string> user = {"READ"};
string need[] = {"READ", "ADMIN"};
string authorize() {
  for (auto &r : need) if (!user.count(r)) return "DENY";
  return "ALLOW";
}
int main() { cout << authorize() << endl; }`,
      cs: `using System;
using System.Collections.Generic;
var user = new HashSet<string>{"READ"};
string[] need = {"READ", "ADMIN"};
string Authorize() {
  foreach (var r in need) if (!user.Contains(r)) return "DENY";
  return "ALLOW";
}
Console.WriteLine(Authorize());`,
      go: `package main
import "fmt"
func main() {
  user := map[string]bool{"READ": true}
  need := []string{"READ", "ADMIN"}
  authorize := func() string {
    for _, r := range need {
      if !user[r] { return "DENY" }
    }
    return "ALLOW"
  }
  fmt.Println(authorize())
}`,
      rust: `use std::collections::HashSet;
fn authorize(user: &HashSet<&str>, need: &[&str]) -> &'static str {
  for r in need {
    if !user.contains(r) { return "DENY"; }
  }
  "ALLOW"
}
fn main() {
  let user = HashSet::from(["READ"]);
  println!("{}", authorize(&user, &["READ", "ADMIN"]));
}`,
      ts: `const user = new Set(['READ'])
const need = ['READ', 'ADMIN']
function authorize() {
  for (const r of need) if (!user.has(r)) return 'DENY'
  return 'ALLOW'
}
console.log(authorize())`,
      php: `<?php
class Guard {
  public $user = ['READ'];
  public $need = ['READ', 'ADMIN'];
  function authorize() {
    foreach ($this->need as $r)
      if (!in_array($r, $this->user)) return 'DENY';
    return 'ALLOW';
  }
}
echo (new Guard())->authorize(), PHP_EOL;`,
      rb: `class Guard
  def initialize
    @user, @need = ['READ'], ['READ', 'ADMIN']
  end
  def authorize
    @need.each { |r| return 'DENY' unless @user.include?(r) }
    'ALLOW'
  end
end
puts Guard.new.authorize`,
    },
  }),

  challenge({
    slug: 'job-queue-ignores-priority',
    title: 'Job Queue — FIFO Ignores Priority',
    difficulty: 'medium',
    bugType: 'wrong-algorithm',
    tags: ['job-queue', 'priority-queue', 'scheduling'],
    order: 53,
    description:
      'Priority job queue: enqueue LOW (prio 1) then HIGH (prio 10). pop() must return HIGH. The scheduler picks the highest priority, not insertion order.',
    expectedOutput: 'HIGH',
    hint: 'Does pop() take index 0 (FIFO) or the job with the largest priority field?',
    explanation:
      'Jobs are popped from the front, so LOW (enqueued first) runs before HIGH. A priority queue selects max(priority) on pop. FIFO is the wrong strategy once jobs carry a priority.',
    code: {
      py: `class Q:
    def __init__(self):
        self.jobs = []
    def enq(self, name, prio):
        self.jobs.append((name, prio))
    def pop(self):
        return self.jobs.pop(0)[0]
q = Q()
q.enq('LOW', 1)
q.enq('HIGH', 10)
print(q.pop())`,
      java: `public class Main {
  static java.util.List<String> names = new java.util.ArrayList<>();
  static java.util.List<Integer> prio = new java.util.ArrayList<>();
  static void enq(String n, int p) { names.add(n); prio.add(p); }
  static String pop() { prio.remove(0); return names.remove(0); }
  public static void main(String[] args) {
    enq("LOW", 1); enq("HIGH", 10);
    System.out.println(pop());
  }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
vector<string> names;
vector<int> prio;
void enq(string n, int p) { names.push_back(n); prio.push_back(p); }
string pop() { string n = names[0]; names.erase(names.begin()); prio.erase(prio.begin()); return n; }
int main() {
  enq("LOW", 1); enq("HIGH", 10);
  cout << pop() << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var names = new List<string>();
var prio = new List<int>();
void Enq(string n, int p) { names.Add(n); prio.Add(p); }
string Pop() { prio.RemoveAt(0); var n = names[0]; names.RemoveAt(0); return n; }
Enq("LOW", 1); Enq("HIGH", 10);
Console.WriteLine(Pop());`,
      go: `package main
import "fmt"
func main() {
  names := []string{}
  prio := []int{}
  enq := func(n string, p int) { names = append(names, n); prio = append(prio, p) }
  pop := func() string {
    n := names[0]
    names, prio = names[1:], prio[1:]
    return n
  }
  enq("LOW", 1); enq("HIGH", 10)
  fmt.Println(pop())
}`,
      rust: `fn pop(names: &mut Vec<&str>, prio: &mut Vec<i32>) -> String {
  prio.remove(0);
  names.remove(0).to_string()
}
fn main() {
  let mut names = vec!["LOW", "HIGH"];
  let mut prio = vec![1, 10];
  println!("{}", pop(&mut names, &mut prio));
}`,
      ts: `class Q {
  names: string[] = []
  prio: number[] = []
  enq(n: string, p: number) { this.names.push(n); this.prio.push(p) }
  pop() { this.prio.shift(); return this.names.shift()! }
}
const q = new Q()
q.enq('LOW', 1)
q.enq('HIGH', 10)
console.log(q.pop())`,
      php: `<?php
class Q {
  public $jobs = [];
  function enq($name, $prio) { $this->jobs[] = [$name, $prio]; }
  function pop() {
    $j = array_shift($this->jobs);
    return $j[0];
  }
}
$q = new Q();
$q->enq('LOW', 1);
$q->enq('HIGH', 10);
echo $q->pop(), PHP_EOL;`,
      rb: `class Q
  def initialize
    @jobs = []
  end
  def enq(name, prio)
    @jobs << [name, prio]
  end
  def pop
    @jobs.shift[0]
  end
end
q = Q.new
q.enq('LOW', 1)
q.enq('HIGH', 10)
puts q.pop`,
    },
  }),

  challenge({
    slug: 'cache-ttl-never-expires',
    title: 'Cache — TTL Never Expires',
    difficulty: 'medium',
    bugType: 'edge-case',
    tags: ['cache', 'ttl', 'invariants'],
    order: 54,
    description:
      'TTL cache: put(k, v, ttl=0) means the entry is already expired at insert time (now=0). get(k) must return MISS. A zero TTL is not “forever”; it is immediately stale.',
    expectedOutput: 'MISS',
    hint: 'Does get() compare now against expiresAt, or return HIT whenever the key exists?',
    explanation:
      'get returns HIT if the key is present and never inspects expiry. ttl=0 sets expiresAt=now, so the entry is dead on arrival. Miss when now >= expiresAt.',
    code: {
      py: `class Cache:
    def __init__(self):
        self.data, self.exp, self.now = {}, {}, 0
    def put(self, k, v, ttl):
        self.data[k] = v
        self.exp[k] = self.now + ttl
    def get(self, k):
        if k in self.data:
            return 'HIT'
        return 'MISS'
c = Cache()
c.put('k', 'v', 0)
print(c.get('k'))`,
      java: `public class Main {
  static java.util.Map<String,String> data = new java.util.HashMap<>();
  static java.util.Map<String,Integer> exp = new java.util.HashMap<>();
  static int now = 0;
  static void put(String k, String v, int ttl) {
    data.put(k, v); exp.put(k, now + ttl);
  }
  static String get(String k) {
    if (data.containsKey(k)) return "HIT";
    return "MISS";
  }
  public static void main(String[] args) {
    put("k", "v", 0);
    System.out.println(get("k"));
  }
}`,
      cpp: `#include <iostream>
#include <string>
#include <map>
using namespace std;
map<string,string> store;
map<string,int> expm;
int now = 0;
void put(string k, string v, int ttl) { store[k] = v; expm[k] = now + ttl; }
string lookup(string k) {
  if (store.count(k)) return "HIT";
  return "MISS";
}
int main() {
  put("k", "v", 0);
  cout << lookup("k") << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var data = new Dictionary<string,string>();
var exp = new Dictionary<string,int>();
int now = 0;
void Put(string k, string v, int ttl) { data[k] = v; exp[k] = now + ttl; }
string Get(string k) {
  if (data.ContainsKey(k)) return "HIT";
  return "MISS";
}
Put("k", "v", 0);
Console.WriteLine(Get("k"));`,
      go: `package main
import "fmt"
func main() {
  data := map[string]string{}
  exp := map[string]int{}
  now := 0
  put := func(k, v string, ttl int) { data[k] = v; exp[k] = now + ttl }
  get := func(k string) string {
    if _, ok := data[k]; ok { return "HIT" }
    return "MISS"
  }
  _ = exp
  put("k", "v", 0)
  fmt.Println(get("k"))
}`,
      rust: `use std::collections::HashMap;
fn put(data: &mut HashMap<&str,&str>, exp: &mut HashMap<&str,i32>, now: i32, k: &'static str, v: &'static str, ttl: i32) {
  data.insert(k, v); exp.insert(k, now + ttl);
}
fn get(data: &HashMap<&str,&str>, _exp: &HashMap<&str,i32>, _now: i32, k: &str) -> &'static str {
  if data.contains_key(k) { return "HIT"; }
  "MISS"
}
fn main() {
  let mut data = HashMap::new();
  let mut exp = HashMap::new();
  put(&mut data, &mut exp, 0, "k", "v", 0);
  println!("{}", get(&data, &exp, 0, "k"));
}`,
      ts: `const data = new Map<string, string>()
const exp = new Map<string, number>()
const now = 0
function put(k: string, v: string, ttl: number) {
  data.set(k, v); exp.set(k, now + ttl)
}
function get(k: string) {
  if (data.has(k)) return 'HIT'
  return 'MISS'
}
put('k', 'v', 0)
console.log(get('k'))`,
      php: `<?php
class Cache {
  public $data = [], $exp = [], $now = 0;
  function put($k, $v, $ttl) {
    $this->data[$k] = $v;
    $this->exp[$k] = $this->now + $ttl;
  }
  function get($k) {
    if (isset($this->data[$k])) return 'HIT';
    return 'MISS';
  }
}
$c = new Cache();
$c->put('k', 'v', 0);
echo $c->get('k'), PHP_EOL;`,
      rb: `class Cache
  def initialize
    @data, @exp, @now = {}, {}, 0
  end
  def put(k, v, ttl)
    @data[k] = v
    @exp[k] = @now + ttl
  end
  def get(k)
    return 'HIT' if @data.key?(k)
    'MISS'
  end
end
c = Cache.new
c.put('k', 'v', 0)
puts c.get('k')`,
    },
  }),

  challenge({
    slug: 'session-survives-logout',
    title: 'Session Store — Logout Does Not Invalidate',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['session', 'auth', 'invariants'],
    order: 55,
    description:
      'Session store: login issues token t, logout(t), then validate(t). After logout the token must be INVALID. Logout has to drop the session, not leave it in the map.',
    expectedOutput: 'INVALID',
    hint: 'Does logout() delete the token from the session map?',
    explanation:
      'logout is a no-op, so validate still finds the token and prints VALID. Session identity is membership in the store: logout must remove the key so later validate returns INVALID.',
    code: {
      py: `class Store:
    def __init__(self):
        self.tok = {}
    def login(self, u):
        self.tok['t'] = u
        return 't'
    def logout(self, t):
        pass
    def valid(self, t):
        return 'VALID' if t in self.tok else 'INVALID'
s = Store()
tok = s.login('u')
s.logout(tok)
print(s.valid(tok))`,
      java: `public class Main {
  static java.util.Map<String,String> tok = new java.util.HashMap<>();
  static String login(String u) { tok.put("t", u); return "t"; }
  static void logout(String t) { }
  static String valid(String t) { return tok.containsKey(t) ? "VALID" : "INVALID"; }
  public static void main(String[] args) {
    String t = login("u");
    logout(t);
    System.out.println(valid(t));
  }
}`,
      cpp: `#include <iostream>
#include <string>
#include <map>
using namespace std;
map<string,string> tok;
string login(string u) { tok["t"] = u; return "t"; }
void logout(string t) { }
string valid(string t) { return tok.count(t) ? "VALID" : "INVALID"; }
int main() {
  string t = login("u");
  logout(t);
  cout << valid(t) << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var tok = new Dictionary<string,string>();
string Login(string u) { tok["t"] = u; return "t"; }
void Logout(string t) { }
string Valid(string t) { return tok.ContainsKey(t) ? "VALID" : "INVALID"; }
var t = Login("u");
Logout(t);
Console.WriteLine(Valid(t));`,
      go: `package main
import "fmt"
func main() {
  tok := map[string]string{}
  login := func(u string) string { tok["t"] = u; return "t" }
  logout := func(_ string) { }
  valid := func(t string) string {
    if _, ok := tok[t]; ok { return "VALID" }
    return "INVALID"
  }
  t := login("u")
  logout(t)
  fmt.Println(valid(t))
}`,
      rust: `use std::collections::HashMap;
fn login(tok: &mut HashMap<&str,&str>, u: &'static str) -> &'static str {
  tok.insert("t", u); "t"
}
fn logout(_tok: &mut HashMap<&str,&str>, _t: &str) { }
fn valid(tok: &HashMap<&str,&str>, t: &str) -> &'static str {
  if tok.contains_key(t) { "VALID" } else { "INVALID" }
}
fn main() {
  let mut tok = HashMap::new();
  let t = login(&mut tok, "u");
  logout(&mut tok, t);
  println!("{}", valid(&tok, t));
}`,
      ts: `const tok: Record<string, string> = {}
function login(u: string) { tok['t'] = u; return 't' }
function logout(_t: string) { }
function valid(t: string) { return t in tok ? 'VALID' : 'INVALID' }
const t = login('u')
logout(t)
console.log(valid(t))`,
      php: `<?php
class Store {
  public $tok = [];
  function login($u) { $this->tok['t'] = $u; return 't'; }
  function logout($t) { }
  function valid($t) { return isset($this->tok[$t]) ? 'VALID' : 'INVALID'; }
}
$s = new Store();
$t = $s->login('u');
$s->logout($t);
echo $s->valid($t), PHP_EOL;`,
      rb: `class Store
  def initialize
    @tok = {}
  end
  def login(u)
    @tok['t'] = u
    't'
  end
  def logout(t)
  end
  def valid(t)
    @tok.key?(t) ? 'VALID' : 'INVALID'
  end
end
s = Store.new
tok = s.login('u')
s.logout(tok)
puts s.valid(tok)`,
    },
  }),

  challenge({
    slug: 'url-shortener-overwrite',
    title: 'URL Shortener — Hash Collision Overwrites',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['url-shortener', 'hash-collision', 'invariants'],
    order: 56,
    description:
      'URL shortener: save a.com under code abc, then save b.com which hashes to the same abc. Lookup abc must still return a.com. First writer wins on collision; do not overwrite.',
    expectedOutput: 'a.com',
    hint: 'Does save() skip the write when the short code is already taken?',
    explanation:
      'The second save overwrites abc with b.com. Collision policy is insert-if-absent: if the code exists, keep the original URL. Overwrite breaks existing redirects.',
    code: {
      py: `class Short:
    def __init__(self):
        self.m = {}
    def save(self, url, code):
        self.m[code] = url
    def get(self, code):
        return self.m[code]
s = Short()
s.save('a.com', 'abc')
s.save('b.com', 'abc')
print(s.get('abc'))`,
      java: `public class Main {
  static java.util.Map<String,String> m = new java.util.HashMap<>();
  static void save(String url, String code) { m.put(code, url); }
  static String get(String code) { return m.get(code); }
  public static void main(String[] args) {
    save("a.com", "abc"); save("b.com", "abc");
    System.out.println(get("abc"));
  }
}`,
      cpp: `#include <iostream>
#include <string>
#include <map>
using namespace std;
map<string,string> m;
void save(string url, string code) { m[code] = url; }
string get(string code) { return m[code]; }
int main() {
  save("a.com", "abc"); save("b.com", "abc");
  cout << get("abc") << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var m = new Dictionary<string,string>();
void Save(string url, string code) { m[code] = url; }
string Get(string code) { return m[code]; }
Save("a.com", "abc"); Save("b.com", "abc");
Console.WriteLine(Get("abc"));`,
      go: `package main
import "fmt"
func main() {
  m := map[string]string{}
  save := func(url, code string) { m[code] = url }
  get := func(code string) string { return m[code] }
  save("a.com", "abc"); save("b.com", "abc")
  fmt.Println(get("abc"))
}`,
      rust: `use std::collections::HashMap;
fn save(m: &mut HashMap<&str,&str>, url: &'static str, code: &'static str) {
  m.insert(code, url);
}
fn get<'a>(m: &HashMap<&str,&'a str>, code: &str) -> &'a str { m[code] }
fn main() {
  let mut m = HashMap::new();
  save(&mut m, "a.com", "abc");
  save(&mut m, "b.com", "abc");
  println!("{}", get(&m, "abc"));
}`,
      ts: `class Short {
  m: Record<string, string> = {}
  save(url: string, code: string) { this.m[code] = url }
  get(code: string) { return this.m[code] }
}
const s = new Short()
s.save('a.com', 'abc')
s.save('b.com', 'abc')
console.log(s.get('abc'))`,
      php: `<?php
class Short {
  public $m = [];
  function save($url, $code) { $this->m[$code] = $url; }
  function get($code) { return $this->m[$code]; }
}
$s = new Short();
$s->save('a.com', 'abc');
$s->save('b.com', 'abc');
echo $s->get('abc'), PHP_EOL;`,
      rb: `class Short
  def initialize
    @m = {}
  end
  def save(url, code)
    @m[code] = url
  end
  def get(code)
    @m[code]
  end
end
s = Short.new
s.save('a.com', 'abc')
s.save('b.com', 'abc')
puts s.get('abc')`,
    },
  }),

  challenge({
    slug: 'chess-king-adjacent',
    title: 'Chess — King Moves Adjacent to King',
    difficulty: 'medium',
    bugType: 'edge-case',
    tags: ['chess', 'rules', 'invariants'],
    order: 57,
    description:
      'Kings cannot stand on adjacent squares (including capturing each other). White king on e1 (5,1), black king on e2 (5,2). White trying to move to e2 must be ILLEGAL.',
    expectedOutput: 'ILLEGAL',
    hint: 'After the move, is the destination within one square of the enemy king? Same square counts.',
    explanation:
      'The mover only checks that e1→e2 is a one-step king move, so it prints OK. Kings also cannot step next to (or onto) the other king. Reject when |dx|<=1 and |dy|<=1 versus the enemy king.',
    code: {
      py: `class Game:
    def __init__(self):
        self.wx, self.wy = 5, 1
        self.bx, self.by = 5, 2
    def move_white(self, tx, ty):
        if abs(tx - self.wx) > 1 or abs(ty - self.wy) > 1:
            return 'ILLEGAL'
        return 'OK'
print(Game().move_white(5, 2))`,
      java: `public class Main {
  static int wx = 5, wy = 1, bx = 5, by = 2;
  static String moveWhite(int tx, int ty) {
    if (Math.abs(tx - wx) > 1 || Math.abs(ty - wy) > 1) return "ILLEGAL";
    return "OK";
  }
  public static void main(String[] args) {
    System.out.println(moveWhite(5, 2));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int wx = 5, wy = 1, bx = 5, by = 2;
int ad(int x) { return x < 0 ? -x : x; }
string moveWhite(int tx, int ty) {
  if (ad(tx - wx) > 1 || ad(ty - wy) > 1) return "ILLEGAL";
  return "OK";
}
int main() { cout << moveWhite(5, 2) << endl; }`,
      cs: `using System;
int wx = 5, wy = 1, bx = 5, by = 2;
string MoveWhite(int tx, int ty) {
  if (Math.Abs(tx - wx) > 1 || Math.Abs(ty - wy) > 1) return "ILLEGAL";
  return "OK";
}
Console.WriteLine(MoveWhite(5, 2));`,
      go: `package main
import "fmt"
func main() {
  wx, wy, bx, by := 5, 1, 5, 2
  ad := func(x int) int { if x < 0 { return -x }; return x }
  moveWhite := func(tx, ty int) string {
    if ad(tx-wx) > 1 || ad(ty-wy) > 1 { return "ILLEGAL" }
    return "OK"
  }
  _, _ = bx, by
  fmt.Println(moveWhite(5, 2))
}`,
      rust: `fn ad(x: i32) -> i32 { if x < 0 { -x } else { x } }
fn move_white(wx: i32, wy: i32, _bx: i32, _by: i32, tx: i32, ty: i32) -> &'static str {
  if ad(tx - wx) > 1 || ad(ty - wy) > 1 { return "ILLEGAL"; }
  "OK"
}
fn main() {
  println!("{}", move_white(5, 1, 5, 2, 5, 2));
}`,
      ts: `const wx = 5, wy = 1, bx = 5, by = 2
function moveWhite(tx: number, ty: number) {
  if (Math.abs(tx - wx) > 1 || Math.abs(ty - wy) > 1) return 'ILLEGAL'
  return 'OK'
}
console.log(moveWhite(5, 2))`,
      php: `<?php
class Game {
  public $wx = 5, $wy = 1, $bx = 5, $by = 2;
  function moveWhite($tx, $ty) {
    if (abs($tx - $this->wx) > 1 || abs($ty - $this->wy) > 1) return 'ILLEGAL';
    return 'OK';
  }
}
echo (new Game())->moveWhite(5, 2), PHP_EOL;`,
      rb: `class Game
  def initialize
    @wx, @wy, @bx, @by = 5, 1, 5, 2
  end
  def move_white(tx, ty)
    return 'ILLEGAL' if (tx - @wx).abs > 1 || (ty - @wy).abs > 1
    'OK'
  end
end
puts Game.new.move_white(5, 2)`,
    },
  }),

  challenge({
    slug: 'snake-ignores-snake',
    title: 'Snake & Ladder — Lands on Snake Not Slid',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['snake-ladder', 'board-game', 'invariants'],
    order: 58,
    description:
      'Snakes and ladders: a snake from 98 to 20. Piece is on 97, roll 1, land on 98. The piece must slide to 20. Landing on a snake always teleports to its tail.',
    expectedOutput: '20',
    hint: 'After adding the roll, do you look up snakes[pos] and move there?',
    explanation:
      'roll adds 1 and returns 98, never consulting the snake map. After moving, if pos is a snake head, pos becomes snakes[pos]. Ladders work the same way.',
    code: {
      py: `class Board:
    def __init__(self):
        self.snakes = {98: 20}
        self.pos = 97
    def roll(self, d):
        self.pos += d
        return self.pos
print(Board().roll(1))`,
      java: `public class Main {
  static java.util.Map<Integer,Integer> snakes = new java.util.HashMap<>();
  static int pos = 97;
  static int roll(int d) {
    pos += d;
    return pos;
  }
  public static void main(String[] args) {
    snakes.put(98, 20);
    System.out.println(roll(1));
  }
}`,
      cpp: `#include <iostream>
#include <map>
using namespace std;
map<int,int> snakes;
int pos = 97;
int roll(int d) {
  pos += d;
  return pos;
}
int main() {
  snakes[98] = 20;
  cout << roll(1) << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var snakes = new Dictionary<int,int>{{98, 20}};
int pos = 97;
int Roll(int d) {
  pos += d;
  return pos;
}
Console.WriteLine(Roll(1));`,
      go: `package main
import "fmt"
func main() {
  snakes := map[int]int{98: 20}
  pos := 97
  roll := func(d int) int {
    pos += d
    return pos
  }
  _ = snakes
  fmt.Println(roll(1))
}`,
      rust: `use std::collections::HashMap;
fn roll(pos: &mut i32, _snakes: &HashMap<i32,i32>, d: i32) -> i32 {
  *pos += d;
  *pos
}
fn main() {
  let snakes = HashMap::from([(98, 20)]);
  let mut pos = 97;
  println!("{}", roll(&mut pos, &snakes, 1));
}`,
      ts: `const snakes: Record<number, number> = { 98: 20 }
let pos = 97
function roll(d: number) {
  pos += d
  return pos
}
console.log(roll(1))`,
      php: `<?php
class Board {
  public $snakes = [98 => 20];
  public $pos = 97;
  function roll($d) {
    $this->pos += $d;
    return $this->pos;
  }
}
echo (new Board())->roll(1), PHP_EOL;`,
      rb: `class Board
  def initialize
    @snakes, @pos = {98 => 20}, 97
  end
  def roll(d)
    @pos += d
    @pos
  end
end
puts Board.new.roll(1)`,
    },
  }),

  challenge({
    slug: 'order-pays-before-stock',
    title: 'Order Service — Charges Then Discovers Out of Stock',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['order-service', 'saga', 'invariants'],
    order: 59,
    description:
      'Place-order flow: stock is 0. placeOrder must return NO_STOCK and must not charge. Check inventory before payment — never charge for an item you cannot fulfill.',
    expectedOutput: 'NO_STOCK',
    hint: 'Does place() charge first and ignore stock, or refuse when stock is 0?',
    explanation:
      'place always charges and returns CHARGED even with stock 0. The invariant is validate inventory, then charge, then decrement. Out of stock must fail closed with NO_STOCK and no side effects.',
    code: {
      py: `class Orders:
    def __init__(self):
        self.stock = 0
    def place(self):
        return 'CHARGED'
print(Orders().place())`,
      java: `public class Main {
  static int stock = 0;
  static String place() {
    return "CHARGED";
  }
  public static void main(String[] args) {
    System.out.println(place());
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int stock = 0;
string place() {
  return "CHARGED";
}
int main() { cout << place() << endl; }`,
      cs: `using System;
int stock = 0;
string Place() {
  return "CHARGED";
}
Console.WriteLine(Place());`,
      go: `package main
import "fmt"
func main() {
  stock := 0
  place := func() string { return "CHARGED" }
  _ = stock
  fmt.Println(place())
}`,
      rust: `fn place(_stock: i32) -> &'static str {
  "CHARGED"
}
fn main() {
  println!("{}", place(0));
}`,
      ts: `const stock = 0
function place() {
  return 'CHARGED'
}
console.log(place())`,
      php: `<?php
class Orders {
  public $stock = 0;
  function place() {
    return 'CHARGED';
  }
}
echo (new Orders())->place(), PHP_EOL;`,
      rb: `class Orders
  def initialize
    @stock = 0
  end
  def place
    'CHARGED'
  end
end
puts Orders.new.place`,
    },
  }),

  challenge({
    slug: 'notification-retry-drops',
    title: 'Notification — Failed Channel Not Retried',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['notification', 'fallback', 'invariants'],
    order: 60,
    description:
      'Notification fan-out: email() always fails. send() must fall back to SMS and print SMS. A failed primary channel is not silence — try the next channel.',
    expectedOutput: 'SMS',
    hint: 'When email() returns false, does send() call sms() or return SILENT?',
    explanation:
      'send returns SILENT after email fails instead of trying SMS. Fallback policy: if the preferred channel fails, attempt the next (SMS). Do not drop the notification.',
    code: {
      py: `class Notify:
    def email(self):
        return False
    def sms(self):
        return 'SMS'
    def send(self):
        if self.email():
            return 'EMAIL'
        return 'SILENT'
print(Notify().send())`,
      java: `public class Main {
  static boolean email() { return false; }
  static String sms() { return "SMS"; }
  static String send() {
    if (email()) return "EMAIL";
    return "SILENT";
  }
  public static void main(String[] args) {
    System.out.println(send());
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
bool email() { return false; }
string sms() { return "SMS"; }
string send() {
  if (email()) return "EMAIL";
  return "SILENT";
}
int main() { cout << send() << endl; }`,
      cs: `using System;
bool Email() { return false; }
string Sms() { return "SMS"; }
string Send() {
  if (Email()) return "EMAIL";
  return "SILENT";
}
Console.WriteLine(Send());`,
      go: `package main
import "fmt"
func main() {
  email := func() bool { return false }
  sms := func() string { return "SMS" }
  send := func() string {
    if email() { return "EMAIL" }
    return "SILENT"
  }
  _ = sms
  fmt.Println(send())
}`,
      rust: `fn email() -> bool { false }
fn sms() -> &'static str { "SMS" }
fn send() -> &'static str {
  if email() { return "EMAIL"; }
  "SILENT"
}
fn main() {
  println!("{}", send());
}`,
      ts: `function email() { return false }
function sms() { return 'SMS' }
function send() {
  if (email()) return 'EMAIL'
  return 'SILENT'
}
console.log(send())`,
      php: `<?php
class Notify {
  function email() { return false; }
  function sms() { return 'SMS'; }
  function send() {
    if ($this->email()) return 'EMAIL';
    return 'SILENT';
  }
}
echo (new Notify())->send(), PHP_EOL;`,
      rb: `class Notify
  def email
    false
  end
  def sms
    'SMS'
  end
  def send
    return 'EMAIL' if email
    'SILENT'
  end
end
puts Notify.new.send`,
    },
  }),

  challenge({
    slug: 'fs-mkdir-no-parent',
    title: 'File System — mkdir Creates Orphan Without Parent',
    difficulty: 'medium',
    bugType: 'edge-case',
    tags: ['file-system', 'tree', 'invariants'],
    order: 61,
    description:
      'In-memory FS starts with only /. mkdir(/a/b) when /a does not exist must return ERR. Directories cannot be created unless the parent path already exists.',
    expectedOutput: 'ERR',
    hint: 'Does mkdir() check that the parent directory is already in the tree?',
    explanation:
      'mkdir inserts /a/b unconditionally, creating an orphan. The tree invariant: parent(path) must already be a directory. For /a/b the parent is /a, which is missing, so ERR.',
    code: {
      py: `class FS:
    def __init__(self):
        self.dirs = {'/'}
    def mkdir(self, path):
        self.dirs.add(path)
        return 'OK'
print(FS().mkdir('/a/b'))`,
      java: `public class Main {
  static java.util.Set<String> dirs = new java.util.HashSet<>(java.util.List.of("/"));
  static String mkdir(String path) {
    dirs.add(path);
    return "OK";
  }
  public static void main(String[] args) {
    System.out.println(mkdir("/a/b"));
  }
}`,
      cpp: `#include <iostream>
#include <string>
#include <set>
using namespace std;
set<string> dirs = {"/"};
string mkdir(string path) {
  dirs.insert(path);
  return "OK";
}
int main() { cout << mkdir("/a/b") << endl; }`,
      cs: `using System;
using System.Collections.Generic;
var dirs = new HashSet<string>{"/"};
string Mkdir(string path) {
  dirs.Add(path);
  return "OK";
}
Console.WriteLine(Mkdir("/a/b"));`,
      go: `package main
import "fmt"
func main() {
  dirs := map[string]bool{"/": true}
  mkdir := func(path string) string {
    dirs[path] = true
    return "OK"
  }
  fmt.Println(mkdir("/a/b"))
}`,
      rust: `use std::collections::HashSet;
fn mkdir(dirs: &mut HashSet<&str>, path: &'static str) -> &'static str {
  dirs.insert(path);
  "OK"
}
fn main() {
  let mut dirs = HashSet::from(["/"]);
  println!("{}", mkdir(&mut dirs, "/a/b"));
}`,
      ts: `const dirs = new Set(['/'])
function mkdir(path: string) {
  dirs.add(path)
  return 'OK'
}
console.log(mkdir('/a/b'))`,
      php: `<?php
class FS {
  public $dirs = ['/' => true];
  function mkdir($path) {
    $this->dirs[$path] = true;
    return 'OK';
  }
}
echo (new FS())->mkdir('/a/b'), PHP_EOL;`,
      rb: `class FS
  def initialize
    @dirs = {'/' => true}
  end
  def mkdir(path)
    @dirs[path] = true
    'OK'
  end
end
puts FS.new.mkdir('/a/b')`,
    },
  }),

  challenge({
    slug: 'comments-orphan-parent',
    title: 'Nested Comments — Reply to Missing Parent Allowed',
    difficulty: 'medium',
    bugType: 'edge-case',
    tags: ['nested-comments', 'tree', 'invariants'],
    order: 62,
    description:
      'Threaded comments: existing ids are {1}. reply(parentId=99) must return ERR because 99 is not a comment. Replies can only hang off a real parent.',
    expectedOutput: 'ERR',
    hint: 'Does reply() verify parentId is in the comment set before inserting?',
    explanation:
      'reply always inserts and returns OK even when parent 99 is missing. Tree integrity: a child edge requires the parent node to exist. Missing parent → ERR, no insert.',
    code: {
      py: `class Tree:
    def __init__(self):
        self.ids = {1}
    def reply(self, pid):
        self.ids.add(100)
        return 'OK'
print(Tree().reply(99))`,
      java: `public class Main {
  static java.util.Set<Integer> ids = new java.util.HashSet<>(java.util.List.of(1));
  static String reply(int pid) {
    ids.add(100);
    return "OK";
  }
  public static void main(String[] args) {
    System.out.println(reply(99));
  }
}`,
      cpp: `#include <iostream>
#include <string>
#include <set>
using namespace std;
set<int> ids = {1};
string reply(int pid) {
  ids.insert(100);
  return "OK";
}
int main() { cout << reply(99) << endl; }`,
      cs: `using System;
using System.Collections.Generic;
var ids = new HashSet<int>{1};
string Reply(int pid) {
  ids.Add(100);
  return "OK";
}
Console.WriteLine(Reply(99));`,
      go: `package main
import "fmt"
func main() {
  ids := map[int]bool{1: true}
  reply := func(_ int) string {
    ids[100] = true
    return "OK"
  }
  fmt.Println(reply(99))
}`,
      rust: `use std::collections::HashSet;
fn reply(ids: &mut HashSet<i32>, _pid: i32) -> &'static str {
  ids.insert(100);
  "OK"
}
fn main() {
  let mut ids = HashSet::from([1]);
  println!("{}", reply(&mut ids, 99));
}`,
      ts: `const ids = new Set([1])
function reply(_pid: number) {
  ids.add(100)
  return 'OK'
}
console.log(reply(99))`,
      php: `<?php
class Tree {
  public $ids = [1 => true];
  function reply($pid) {
    $this->ids[100] = true;
    return 'OK';
  }
}
echo (new Tree())->reply(99), PHP_EOL;`,
      rb: `class Tree
  def initialize
    @ids = {1 => true}
  end
  def reply(pid)
    @ids[100] = true
    'OK'
  end
end
puts Tree.new.reply(99)`,
    },
  }),

  challenge({
    slug: 'coupon-expired-applies',
    title: 'Promotions — Expired Coupon Still Applies',
    difficulty: 'medium',
    bugType: 'edge-case',
    tags: ['promotions', 'coupons', 'invariants'],
    order: 63,
    description:
      'Coupon with end time 5, now is 10 (already ended). apply(100) with 20 off must return EXPIRED, not 80. Time-bounded promotions must refuse after end.',
    expectedOutput: 'EXPIRED',
    hint: 'Does apply() compare now against coupon.end before subtracting?',
    explanation:
      'apply always subtracts 20 and prints 80, ignoring that now > end. A coupon is valid only while now <= end. Expired codes must short-circuit to EXPIRED.',
    code: {
      py: `now = 10
class Coupon:
    def __init__(self):
        self.end, self.off = 5, 20
    def apply(self, price):
        return price - self.off
print(Coupon().apply(100))`,
      java: `public class Main {
  static int now = 10, end = 5, off = 20;
  static String apply(int price) {
    return "" + (price - off);
  }
  public static void main(String[] args) {
    System.out.println(apply(100));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int now = 10, endt = 5, off = 20;
string apply(int price) {
  return to_string(price - off);
}
int main() { cout << apply(100) << endl; }`,
      cs: `using System;
int now = 10, end = 5, off = 20;
string Apply(int price) {
  return "" + (price - off);
}
Console.WriteLine(Apply(100));`,
      go: `package main
import "fmt"
func main() {
  now, end, off := 10, 5, 20
  apply := func(price int) string {
    return fmt.Sprintf("%d", price-off)
  }
  _, _ = now, end
  fmt.Println(apply(100))
}`,
      rust: `fn apply(_now: i32, _end: i32, off: i32, price: i32) -> String {
  (price - off).to_string()
}
fn main() {
  println!("{}", apply(10, 5, 20, 100));
}`,
      ts: `const now = 10, end = 5, off = 20
function apply(price: number) {
  return '' + (price - off)
}
console.log(apply(100))`,
      php: `<?php
$now = 10;
class Coupon {
  public $end = 5, $off = 20;
  function apply($price) {
    return $price - $this->off;
  }
}
echo (new Coupon())->apply(100), PHP_EOL;`,
      rb: `NOW = 10
class Coupon
  def initialize
    @end, @off = 5, 20
  end
  def apply(price)
    price - @off
  end
end
puts Coupon.new.apply(100)`,
    },
  }),

  challenge({
    slug: 'waitlist-skips-head',
    title: 'Restaurant Waitlist — Seat Skips First in Line',
    difficulty: 'medium',
    bugType: 'wrong-algorithm',
    tags: ['waitlist', 'queue', 'invariants'],
    order: 64,
    description:
      'Restaurant waitlist is a FIFO queue. A joins, then B. seatNext() must seat A (head of line). Using a stack would skip A and seat B.',
    expectedOutput: 'A',
    hint: 'Is seatNext popping the tail (LIFO) instead of the head (FIFO)?',
    explanation:
      'seatNext pops the last arrival (B) like a stack. A waitlist is a queue: join appends, seatNext removes index 0. Fairness is FIFO.',
    code: {
      py: `class Wait:
    def __init__(self):
        self.q = []
    def join(self, n):
        self.q.append(n)
    def seat_next(self):
        return self.q.pop()
w = Wait()
w.join('A'); w.join('B')
print(w.seat_next())`,
      java: `public class Main {
  static java.util.List<String> q = new java.util.ArrayList<>();
  static void join(String n) { q.add(n); }
  static String seatNext() { return q.remove(q.size() - 1); }
  public static void main(String[] args) {
    join("A"); join("B");
    System.out.println(seatNext());
  }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
vector<string> q;
void join(string n) { q.push_back(n); }
string seatNext() { string n = q.back(); q.pop_back(); return n; }
int main() {
  join("A"); join("B");
  cout << seatNext() << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var q = new List<string>();
void Join(string n) { q.Add(n); }
string SeatNext() { var n = q[q.Count-1]; q.RemoveAt(q.Count-1); return n; }
Join("A"); Join("B");
Console.WriteLine(SeatNext());`,
      go: `package main
import "fmt"
func main() {
  q := []string{}
  join := func(n string) { q = append(q, n) }
  seatNext := func() string {
    n := q[len(q)-1]
    q = q[:len(q)-1]
    return n
  }
  join("A"); join("B")
  fmt.Println(seatNext())
}`,
      rust: `fn seat_next(q: &mut Vec<&str>) -> String {
  q.pop().unwrap().to_string()
}
fn main() {
  let mut q = vec!["A", "B"];
  println!("{}", seat_next(&mut q));
}`,
      ts: `const q: string[] = []
function join(n: string) { q.push(n) }
function seatNext() { return q.pop()! }
join('A'); join('B')
console.log(seatNext())`,
      php: `<?php
class Wait {
  public $q = [];
  function join($n) { $this->q[] = $n; }
  function seatNext() { return array_pop($this->q); }
}
$w = new Wait();
$w->join('A'); $w->join('B');
echo $w->seatNext(), PHP_EOL;`,
      rb: `class Wait
  def initialize
    @q = []
  end
  def join(n)
    @q << n
  end
  def seat_next
    @q.pop
  end
end
w = Wait.new
w.join('A'); w.join('B')
puts w.seat_next`,
    },
  }),

  challenge({
    slug: 'auction-accepts-late-bid',
    title: 'Auction — Bid After Close Accepted',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['auction', 'state-machine', 'invariants'],
    order: 65,
    description:
      'Auction is already CLOSED. bid(10) must return CLOSED and must not accept the bid. Bidding is legal only while the auction is open.',
    expectedOutput: 'CLOSED',
    hint: 'Does bid() check the auction state before accepting?',
    explanation:
      'bid always returns ACCEPTED even when open is false. State machine: OPEN.bid records the bid; CLOSED.bid refuses with CLOSED. Late bids must not change the winner.',
    code: {
      py: `class Auction:
    def __init__(self):
        self.open = False
    def bid(self, amt):
        return 'ACCEPTED'
print(Auction().bid(10))`,
      java: `public class Main {
  static boolean open = false;
  static String bid(int amt) {
    return "ACCEPTED";
  }
  public static void main(String[] args) {
    System.out.println(bid(10));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
bool openA = false;
string bid(int amt) {
  return "ACCEPTED";
}
int main() { cout << bid(10) << endl; }`,
      cs: `using System;
bool open = false;
string Bid(int amt) {
  return "ACCEPTED";
}
Console.WriteLine(Bid(10));`,
      go: `package main
import "fmt"
func main() {
  open := false
  bid := func(_ int) string { return "ACCEPTED" }
  _ = open
  fmt.Println(bid(10))
}`,
      rust: `fn bid(_open: bool, _amt: i32) -> &'static str {
  "ACCEPTED"
}
fn main() {
  println!("{}", bid(false, 10));
}`,
      ts: `const open = false
function bid(_amt: number) {
  return 'ACCEPTED'
}
console.log(bid(10))`,
      php: `<?php
class Auction {
  public $open = false;
  function bid($amt) {
    return 'ACCEPTED';
  }
}
echo (new Auction())->bid(10), PHP_EOL;`,
      rb: `class Auction
  def initialize
    @open = false
  end
  def bid(amt)
    'ACCEPTED'
  end
end
puts Auction.new.bid(10)`,
    },
  }),

  challenge({
    slug: 'leaderboard-stale-score',
    title: 'Leaderboard — Update Keeps Old Score if Lower',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['leaderboard', 'best-score', 'invariants'],
    order: 66,
    description:
      'Best-score leaderboard: set(50) then set(40). Displayed score must stay 50. Updates keep the maximum, they do not blindly overwrite with a worse run.',
    expectedOutput: '50',
    hint: 'Does set() replace the score even when the new value is lower?',
    explanation:
      'set always overwrites, so 40 replaces 50. A high-score board stores max(old, new). Lower submissions must be ignored.',
    code: {
      py: `class Board:
    def __init__(self):
        self.s = 0
    def set(self, v):
        self.s = v
    def score(self):
        return self.s
b = Board()
b.set(50); b.set(40)
print(b.score())`,
      java: `public class Main {
  static int s = 0;
  static void set(int v) { s = v; }
  public static void main(String[] args) {
    set(50); set(40);
    System.out.println(s);
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int s = 0;
void setv(int v) { s = v; }
int main() {
  setv(50); setv(40);
  cout << s << endl;
}`,
      cs: `using System;
int s = 0;
void Set(int v) { s = v; }
Set(50); Set(40);
Console.WriteLine(s);`,
      go: `package main
import "fmt"
func main() {
  s := 0
  set := func(v int) { s = v }
  set(50); set(40)
  fmt.Println(s)
}`,
      rust: `fn set(s: &mut i32, v: i32) { *s = v; }
fn main() {
  let mut s = 0;
  set(&mut s, 50);
  set(&mut s, 40);
  println!("{}", s);
}`,
      ts: `let s = 0
function set(v: number) { s = v }
set(50); set(40)
console.log(s)`,
      php: `<?php
class Board {
  public $s = 0;
  function set($v) { $this->s = $v; }
}
$b = new Board();
$b->set(50); $b->set(40);
echo $b->s, PHP_EOL;`,
      rb: `class Board
  attr_reader :s
  def initialize
    @s = 0
  end
  def set(v)
    @s = v
  end
end
b = Board.new
b.set(50); b.set(40)
puts b.s`,
    },
  }),

  challenge({
    slug: 'threadpool-rejects-valid',
    title: 'Thread Pool — Queue Full Rejects After Worker Freed',
    difficulty: 'medium',
    bugType: 'logic',
    tags: ['thread-pool', 'resource-management', 'invariants'],
    order: 67,
    description:
      'Thread pool of size 1: submit, complete, submit again. The second submit must be OK. Completing a task must free the worker so the pool can accept more work.',
    expectedOutput: 'OK',
    hint: 'Does complete() increment the free-worker count, or leave the slot occupied forever?',
    explanation:
      'complete is a no-op, so the only worker stays busy and the second submit is REJECT. Pool occupancy is conserved: submit decrements free; complete increments it. Same leak as an unreturned connection.',
    code: {
      py: `class Pool:
    def __init__(self, n):
        self.free = n
    def submit(self):
        if self.free == 0:
            return 'REJECT'
        self.free -= 1
        return 'OK'
    def complete(self):
        pass
p = Pool(1)
p.submit()
p.complete()
print(p.submit())`,
      java: `public class Main {
  static int free = 1;
  static String submit() {
    if (free == 0) return "REJECT";
    free--;
    return "OK";
  }
  static void complete() { }
  public static void main(String[] args) {
    submit(); complete();
    System.out.println(submit());
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int freeN = 1;
string submit() {
  if (freeN == 0) return "REJECT";
  freeN--;
  return "OK";
}
void complete() { }
int main() {
  submit(); complete();
  cout << submit() << endl;
}`,
      cs: `using System;
int free = 1;
string Submit() {
  if (free == 0) return "REJECT";
  free--;
  return "OK";
}
void Complete() { }
Submit(); Complete();
Console.WriteLine(Submit());`,
      go: `package main
import "fmt"
func main() {
  free := 1
  submit := func() string {
    if free == 0 { return "REJECT" }
    free--
    return "OK"
  }
  complete := func() { }
  submit(); complete()
  fmt.Println(submit())
}`,
      rust: `fn submit(free: &mut i32) -> &'static str {
  if *free == 0 { return "REJECT"; }
  *free -= 1;
  "OK"
}
fn complete(_free: &mut i32) { }
fn main() {
  let mut free = 1;
  submit(&mut free);
  complete(&mut free);
  println!("{}", submit(&mut free));
}`,
      ts: `let free = 1
function submit() {
  if (free === 0) return 'REJECT'
  free--
  return 'OK'
}
function complete() { }
submit(); complete()
console.log(submit())`,
      php: `<?php
class Pool {
  public $free;
  function __construct($n) { $this->free = $n; }
  function submit() {
    if ($this->free == 0) return 'REJECT';
    $this->free--;
    return 'OK';
  }
  function complete() { }
}
$p = new Pool(1);
$p->submit();
$p->complete();
echo $p->submit(), PHP_EOL;`,
      rb: `class Pool
  def initialize(n)
    @free = n
  end
  def submit
    return 'REJECT' if @free == 0
    @free -= 1
    'OK'
  end
  def complete
  end
end
p = Pool.new(1)
p.submit
p.complete
puts p.submit`,
    },
  }),

  challenge({
    slug: 'token-bucket-uncapped',
    title: 'Token Bucket — Refill Exceeds Capacity',
    difficulty: 'medium',
    bugType: 'boundary',
    tags: ['token-bucket', 'rate-limiter', 'invariants'],
    order: 68,
    description:
      'Token bucket capacity 2, starts at 0 tokens. refill(5) must leave 2 tokens — never more than capacity. Extra refill is discarded, not stored.',
    expectedOutput: '2',
    hint: 'Does refill add tokens without min(capacity, tokens + n)?',
    explanation:
      'refill adds 5 with no cap, so tokens become 5. The bucket invariant is 0 <= tokens <= capacity. refill must set tokens = min(capacity, tokens + n).',
    code: {
      py: `class TB:
    def __init__(self, cap):
        self.cap, self.tok = cap, 0
    def refill(self, n):
        self.tok += n
    def tokens(self):
        return self.tok
t = TB(2)
t.refill(5)
print(t.tokens())`,
      java: `public class Main {
  static int cap = 2, tok = 0;
  static void refill(int n) { tok += n; }
  public static void main(String[] args) {
    refill(5);
    System.out.println(tok);
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int cap = 2, tok = 0;
void refill(int n) { tok += n; }
int main() {
  refill(5);
  cout << tok << endl;
}`,
      cs: `using System;
int cap = 2, tok = 0;
void Refill(int n) { tok += n; }
Refill(5);
Console.WriteLine(tok);`,
      go: `package main
import "fmt"
func main() {
  cap, tok := 2, 0
  refill := func(n int) { tok += n }
  refill(5)
  _ = cap
  fmt.Println(tok)
}`,
      rust: `fn refill(tok: &mut i32, _cap: i32, n: i32) { *tok += n; }
fn main() {
  let mut tok = 0;
  refill(&mut tok, 2, 5);
  println!("{}", tok);
}`,
      ts: `const cap = 2
let tok = 0
function refill(n: number) { tok += n }
refill(5)
console.log(tok)`,
      php: `<?php
class TB {
  public $cap, $tok = 0;
  function __construct($cap) { $this->cap = $cap; }
  function refill($n) { $this->tok += $n; }
}
$t = new TB(2);
$t->refill(5);
echo $t->tok, PHP_EOL;`,
      rb: `class TB
  attr_reader :tok
  def initialize(cap)
    @cap, @tok = cap, 0
  end
  def refill(n)
    @tok += n
  end
end
t = TB.new(2)
t.refill(5)
puts t.tok`,
    },
  }),

]
