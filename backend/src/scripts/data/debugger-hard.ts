import { challenge, type DebuggerSeed } from '../seed-debugger-lib'

export const HARD: DebuggerSeed[] = [
  challenge({
    slug: 'parking-scans-floor-one',
    title: 'Multi-Floor Parking — Only Floor 1 is Searched',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['parking-lot', 'multi-floor', 'invariants'],
    order: 69,
    description:
      'A two-floor garage: floor 1 is empty, floor 2 has large spot L2. Park a large vehicle. Search every floor; the car must receive L2, not FULL.',
    expectedOutput: 'L2',
    hint: 'Does park() iterate all floors, or only index 0?',
    explanation:
      'The lot only inspects floor 1, so a free L2 on floor 2 is invisible and park returns FULL. Multi-floor parking is a scan of every floor for a compatible free spot. Walk all floors before declaring FULL.',
    code: {
      py: `class Lot:
    def __init__(self):
        self.floors = [[], ['L2']]
    def park(self, kind):
        floor = self.floors[0]
        if floor:
            return floor.pop()
        return 'FULL'
lot = Lot()
print(lot.park('large'))`,
      java: `public class Main {
  static java.util.List<java.util.List<String>> floors = new java.util.ArrayList<>();
  static String park(String kind) {
    java.util.List<String> floor = floors.get(0);
    if (!floor.isEmpty()) return floor.remove(floor.size() - 1);
    return "FULL";
  }
  public static void main(String[] args) {
    floors.add(new java.util.ArrayList<>());
    java.util.List<String> f2 = new java.util.ArrayList<>();
    f2.add("L2");
    floors.add(f2);
    System.out.println(park("large"));
  }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
vector<vector<string>> floors = {{}, {"L2"}};
string park(string kind) {
  if (!floors[0].empty()) {
    string s = floors[0].back();
    floors[0].pop_back();
    return s;
  }
  return "FULL";
}
int main() { cout << park("large") << endl; }`,
      cs: `using System;
using System.Collections.Generic;
var floors = new List<List<string>>();
floors.Add(new List<string>());
floors.Add(new List<string>{"L2"});
string Park(string kind) {
  var floor = floors[0];
  if (floor.Count > 0) {
    var s = floor[floor.Count-1];
    floor.RemoveAt(floor.Count-1);
    return s;
  }
  return "FULL";
}
Console.WriteLine(Park("large"));`,
      go: `package main
import "fmt"
func main() {
  floors := [][]string{{}, {"L2"}}
  park := func(kind string) string {
    f := floors[0]
    if len(f) > 0 {
      s := f[len(f)-1]
      floors[0] = f[:len(f)-1]
      return s
    }
    return "FULL"
  }
  fmt.Println(park("large"))
}`,
      rust: `fn park(floors: &mut Vec<Vec<&str>>, _kind: &str) -> String {
  if !floors[0].is_empty() {
    return floors[0].pop().unwrap().to_string();
  }
  "FULL".into()
}
fn main() {
  let mut floors = vec![vec![], vec!["L2"]];
  println!("{}", park(&mut floors, "large"));
}`,
      ts: `const floors: string[][] = [[], ['L2']]
function park(_kind: string) {
  const floor = floors[0]
  if (floor.length) return floor.pop()!
  return 'FULL'
}
console.log(park('large'))`,
      php: `<?php
class Lot {
  public $floors;
  function __construct() { $this->floors = [[], ['L2']]; }
  function park($kind) {
    $floor = $this->floors[0];
    if (count($floor)) return array_pop($this->floors[0]);
    return 'FULL';
  }
}
echo (new Lot())->park('large'), PHP_EOL;`,
      rb: `class Lot
  def initialize
    @floors = [[], ['L2']]
  end
  def park(kind)
    floor = @floors[0]
    return floor.pop unless floor.empty?
    'FULL'
  end
end
puts Lot.new.park('large')`,
    },
  }),

  challenge({
    slug: 'elevator-scan-no-reverse',
    title: 'Elevator SCAN — Never Reverses at Top',
    difficulty: 'hard',
    bugType: 'wrong-algorithm',
    tags: ['elevator', 'scan', 'scheduling'],
    order: 70,
    description:
      'SCAN elevator: cabin is at 5 going up. 5 was the last upward stop; 2 is still pending. After serving 5 the car must reverse and go to 2. Print the next stop.',
    expectedOutput: '2',
    hint: 'When the upward set is empty, does SCAN reverse and pick the nearest down request?',
    explanation:
      'SCAN keeps direction until that side is exhausted, then reverses. With no floors >= 5, the code stays at 5 instead of taking pending 2. If no requests ahead, flip direction and serve the opposite pending set.',
    code: {
      py: `class Lift:
    def __init__(self):
        self.floor, self.dir, self.pending = 5, 1, [2]
    def next_stop(self):
        if self.dir == 1:
            ups = [s for s in self.pending if s >= self.floor]
            if ups:
                return min(ups)
            return self.floor
        downs = [s for s in self.pending if s <= self.floor]
        return max(downs) if downs else self.floor
print(Lift().next_stop())`,
      java: `public class Main {
  static int floor = 5, dir = 1;
  static int[] pending = {2};
  static int nextStop() {
    if (dir == 1) {
      int best = 99, found = 0;
      for (int s : pending) if (s >= floor && s < best) { best = s; found = 1; }
      if (found == 1) return best;
      return floor;
    }
    return floor;
  }
  public static void main(String[] args) {
    System.out.println(nextStop());
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int floorN = 5, dir = 1, pending[] = {2};
int nextStop() {
  if (dir == 1) {
    int best = 99, found = 0;
    if (pending[0] >= floorN) { best = pending[0]; found = 1; }
    if (found) return best;
    return floorN;
  }
  return floorN;
}
int main() { cout << nextStop() << endl; }`,
      cs: `using System;
int floor = 5, dir = 1;
int[] pending = {2};
int NextStop() {
  if (dir == 1) {
    int best = 99, found = 0;
    foreach (int s in pending)
      if (s >= floor && s < best) { best = s; found = 1; }
    if (found == 1) return best;
    return floor;
  }
  return floor;
}
Console.WriteLine(NextStop());`,
      go: `package main
import "fmt"
func main() {
  floor, dir := 5, 1
  pending := []int{2}
  nextStop := func() int {
    if dir == 1 {
      best, found := 99, 0
      for _, s := range pending {
        if s >= floor && s < best { best = s; found = 1 }
      }
      if found == 1 { return best }
      return floor
    }
    return floor
  }
  fmt.Println(nextStop())
}`,
      rust: `fn next_stop(floor: i32, dir: i32, pending: &[i32]) -> i32 {
  if dir == 1 {
    let mut best = 99;
    let mut found = false;
    for s in pending {
      if *s >= floor && *s < best { best = *s; found = true; }
    }
    if found { return best; }
    return floor;
  }
  floor
}
fn main() {
  println!("{}", next_stop(5, 1, &[2]));
}`,
      ts: `const floor = 5
const dir = 1
const pending = [2]
function nextStop() {
  if (dir === 1) {
    const ups = pending.filter(s => s >= floor)
    if (ups.length) return Math.min(...ups)
    return floor
  }
  return floor
}
console.log(nextStop())`,
      php: `<?php
class Lift {
  public $floor = 5, $dir = 1, $pending = [2];
  function nextStop() {
    if ($this->dir == 1) {
      $ups = array_filter($this->pending, function($s) { return $s >= $this->floor; });
      if (count($ups)) return min($ups);
      return $this->floor;
    }
    return $this->floor;
  }
}
echo (new Lift())->nextStop(), PHP_EOL;`,
      rb: `class Lift
  def initialize
    @floor, @dir, @pending = 5, 1, [2]
  end
  def next_stop
    if @dir == 1
      ups = @pending.select { |s| s >= @floor }
      return ups.min unless ups.empty?
      return @floor
    end
    @floor
  end
end
puts Lift.new.next_stop`,
    },
  }),

  challenge({
    slug: 'bookmyshow-lock-cross-show',
    title: 'Movie Booking — Seat Lock Leaks Across Shows',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['booking', 'isolation', 'invariants'],
    order: 71,
    description:
      'BookMyShow LLD: show1 already holds seat A1. Booking A1 for show2 must succeed (OK). Locks are per (show, seat), not global seat ids.',
    expectedOutput: 'OK',
    hint: 'Is the lock set keyed by seat only, or by show plus seat?',
    explanation:
      'A1 in show1 poisons A1 in show2 because the lock table ignores show id. Two screenings share a seat label but not inventory. Key the lock by (showId, seatId).',
    code: {
      py: `class Booking:
    def __init__(self):
        self.locked = set()
    def book(self, show, seat):
        if seat in self.locked:
            return 'SEAT_TAKEN'
        self.locked.add(seat)
        return 'OK'
b = Booking()
b.book('s1', 'A1')
print(b.book('s2', 'A1'))`,
      java: `public class Main {
  static java.util.Set<String> locked = new java.util.HashSet<>();
  static String book(String show, String seat) {
    if (locked.contains(seat)) return "SEAT_TAKEN";
    locked.add(seat);
    return "OK";
  }
  public static void main(String[] args) {
    book("s1", "A1");
    System.out.println(book("s2", "A1"));
  }
}`,
      cpp: `#include <iostream>
#include <set>
#include <string>
using namespace std;
set<string> locked;
string book(string show, string seat) {
  if (locked.count(seat)) return "SEAT_TAKEN";
  locked.insert(seat);
  return "OK";
}
int main() {
  book("s1", "A1");
  cout << book("s2", "A1") << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var locked = new HashSet<string>();
string Book(string show, string seat) {
  if (locked.Contains(seat)) return "SEAT_TAKEN";
  locked.Add(seat);
  return "OK";
}
Book("s1", "A1");
Console.WriteLine(Book("s2", "A1"));`,
      go: `package main
import "fmt"
func main() {
  locked := map[string]bool{}
  book := func(show, seat string) string {
    if locked[seat] { return "SEAT_TAKEN" }
    locked[seat] = true
    return "OK"
  }
  book("s1", "A1")
  fmt.Println(book("s2", "A1"))
}`,
      rust: `use std::collections::HashSet;
fn book(locked: &mut HashSet<String>, _show: &str, seat: &str) -> &'static str {
  if locked.contains(seat) { return "SEAT_TAKEN"; }
  locked.insert(seat.to_string());
  "OK"
}
fn main() {
  let mut locked = HashSet::new();
  book(&mut locked, "s1", "A1");
  println!("{}", book(&mut locked, "s2", "A1"));
}`,
      ts: `const locked = new Set<string>()
function book(_show: string, seat: string) {
  if (locked.has(seat)) return 'SEAT_TAKEN'
  locked.add(seat)
  return 'OK'
}
book('s1', 'A1')
console.log(book('s2', 'A1'))`,
      php: `<?php
class Booking {
  public $locked = [];
  function book($show, $seat) {
    if (in_array($seat, $this->locked)) return 'SEAT_TAKEN';
    $this->locked[] = $seat;
    return 'OK';
  }
}
$b = new Booking();
$b->book('s1', 'A1');
echo $b->book('s2', 'A1'), PHP_EOL;`,
      rb: `class Booking
  def initialize
    @locked = []
  end
  def book(show, seat)
    return 'SEAT_TAKEN' if @locked.include?(seat)
    @locked << seat
    'OK'
  end
end
b = Booking.new
b.book('s1', 'A1')
puts b.book('s2', 'A1')`,
    },
  }),

  challenge({
    slug: 'splitwise-group-bleeds',
    title: 'Splitwise — Group Expense Hits Personal Balance',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['splitwise', 'ledgers', 'isolation'],
    order: 72,
    description:
      'Splitwise LLD: a group expense of 50 between A and B must not change the personal-only ledger. Print the personal A→B balance; it must be 0.',
    expectedOutput: '0',
    hint: 'Does add(group=true) still increment the personal map?',
    explanation:
      'Group expenses were written into the personal ledger, so A→B shows 50. Personal and group balances are separate aggregates. Route group=true into the group book only.',
    code: {
      py: `class Ledger:
    def __init__(self):
        self.personal = 0
        self.group = 0
    def add(self, is_group, amt):
        self.personal += amt
        if is_group:
            self.group += amt
    def personal_ab(self):
        return self.personal
l = Ledger()
l.add(True, 50)
print(l.personal_ab())`,
      java: `public class Main {
  static int personal = 0, group = 0;
  static void add(boolean isGroup, int amt) {
    personal += amt;
    if (isGroup) group += amt;
  }
  public static void main(String[] args) {
    add(true, 50);
    System.out.println(personal);
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int personal = 0, groupAmt = 0;
void add(bool isGroup, int amt) {
  personal += amt;
  if (isGroup) groupAmt += amt;
}
int main() {
  add(true, 50);
  cout << personal << endl;
}`,
      cs: `using System;
int personal = 0, groupAmt = 0;
void Add(bool isGroup, int amt) {
  personal += amt;
  if (isGroup) groupAmt += amt;
}
Add(true, 50);
Console.WriteLine(personal);`,
      go: `package main
import "fmt"
func main() {
  personal, groupAmt := 0, 0
  add := func(isGroup bool, amt int) {
    personal += amt
    if isGroup { groupAmt += amt }
  }
  add(true, 50)
  fmt.Println(personal)
}`,
      rust: `fn add(personal: &mut i32, group: &mut i32, is_group: bool, amt: i32) {
  *personal += amt;
  if is_group { *group += amt; }
}
fn main() {
  let mut personal = 0;
  let mut group = 0;
  add(&mut personal, &mut group, true, 50);
  println!("{}", personal);
}`,
      ts: `let personal = 0
let groupAmt = 0
function add(isGroup: boolean, amt: number) {
  personal += amt
  if (isGroup) groupAmt += amt
}
add(true, 50)
console.log(personal)`,
      php: `<?php
class Ledger {
  public $personal = 0, $group = 0;
  function add($isGroup, $amt) {
    $this->personal += $amt;
    if ($isGroup) $this->group += $amt;
  }
}
$l = new Ledger();
$l->add(true, 50);
echo $l->personal, PHP_EOL;`,
      rb: `class Ledger
  attr_reader :personal
  def initialize
    @personal, @group = 0, 0
  end
  def add(is_group, amt)
    @personal += amt
    @group += amt if is_group
  end
end
l = Ledger.new
l.add(true, 50)
puts l.personal`,
    },
  }),

  challenge({
    slug: 'saga-skips-compensate',
    title: 'Order Saga — Payment Fail Does Not Release Inventory',
    difficulty: 'hard',
    bugType: 'missing-return',
    tags: ['saga', 'compensation', 'inventory'],
    order: 73,
    description:
      'Orchestrated saga: inventory starts at 1. Reserve succeeds, payment fails. Compensation must restore inventory to 1. Print remaining units.',
    expectedOutput: '1',
    hint: 'After pay() returns false, is compensate() invoked?',
    explanation:
      'Reserve decremented stock, payment aborted, but the orchestrator never compensated, leaving inventory at 0. A saga that cannot complete must undo prior steps. Call compensate() on payment failure.',
    code: {
      py: `class Saga:
    def __init__(self):
        self.inv = 1
    def reserve(self):
        if self.inv < 1:
            return False
        self.inv -= 1
        return True
    def pay(self):
        return False
    def compensate(self):
        self.inv += 1
    def run(self):
        self.reserve()
        if not self.pay():
            pass
s = Saga()
s.run()
print(s.inv)`,
      java: `public class Main {
  static int inv = 1;
  static boolean reserve() {
    if (inv < 1) return false;
    inv--;
    return true;
  }
  static boolean pay() { return false; }
  static void compensate() { inv++; }
  static void run() {
    reserve();
    if (!pay()) { }
  }
  public static void main(String[] args) {
    run();
    System.out.println(inv);
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int inv = 1;
bool reserve() {
  if (inv < 1) return false;
  inv--;
  return true;
}
bool pay() { return false; }
void compensate() { inv++; }
void run() {
  reserve();
  if (!pay()) { }
}
int main() { run(); cout << inv << endl; }`,
      cs: `using System;
int inv = 1;
bool Reserve() {
  if (inv < 1) return false;
  inv--;
  return true;
}
bool Pay() { return false; }
void Compensate() { inv++; }
void Run() {
  Reserve();
  if (!Pay()) { }
}
Run();
Console.WriteLine(inv);`,
      go: `package main
import "fmt"
func main() {
  inv := 1
  reserve := func() bool {
    if inv < 1 { return false }
    inv--
    return true
  }
  pay := func() bool { return false }
  compensate := func() { inv++ }
  _ = compensate
  reserve()
  if !pay() { }
  fmt.Println(inv)
}`,
      rust: `fn reserve(inv: &mut i32) -> bool {
  if *inv < 1 { return false; }
  *inv -= 1;
  true
}
fn pay() -> bool { false }
fn compensate(inv: &mut i32) { *inv += 1; }
fn run(inv: &mut i32) {
  reserve(inv);
  if !pay() { }
}
fn main() {
  let mut inv = 1;
  run(&mut inv);
  println!("{}", inv);
}`,
      ts: `let inv = 1
function reserve() {
  if (inv < 1) return false
  inv--
  return true
}
function pay() { return false }
function compensate() { inv++ }
function run() {
  reserve()
  if (!pay()) { }
}
run()
console.log(inv)`,
      php: `<?php
class Saga {
  public $inv = 1;
  function reserve() {
    if ($this->inv < 1) return false;
    $this->inv--;
    return true;
  }
  function pay() { return false; }
  function compensate() { $this->inv++; }
  function run() {
    $this->reserve();
    if (!$this->pay()) { }
  }
}
$s = new Saga();
$s->run();
echo $s->inv, PHP_EOL;`,
      rb: `class Saga
  attr_reader :inv
  def initialize
    @inv = 1
  end
  def reserve
    return false if @inv < 1
    @inv -= 1
    true
  end
  def pay; false; end
  def compensate; @inv += 1; end
  def run
    reserve
    pay
  end
end
s = Saga.new
s.run
puts s.inv`,
    },
  }),

  challenge({
    slug: 'fs-move-into-self',
    title: 'File System — Folder Moved Into Itself',
    difficulty: 'hard',
    bugType: 'edge-case',
    tags: ['filesystem', 'tree', 'invariants'],
    order: 74,
    description:
      'VFS LLD: moving directory /a into /a/b would create a cycle. move("/a", "/a/b") must print ERR, not OK.',
    expectedOutput: 'ERR',
    hint: 'Is dst a descendant of src? Equality-only checks miss /a → /a/b.',
    explanation:
      'The code rejects only src==dst, so /a can be parented under /a/b and the tree cycles. A move is illegal when dst is src or any child of src. Prefix-check dst against src + "/".',
    code: {
      py: `class Fs:
    def under(self, src, dst):
        return False
    def move(self, src, dst):
        if src == dst:
            return 'ERR'
        if self.under(src, dst):
            return 'ERR'
        return 'OK'
print(Fs().move('/a', '/a/b'))`,
      java: `public class Main {
  static boolean under(String src, String dst) { return false; }
  static String move(String src, String dst) {
    if (src.equals(dst)) return "ERR";
    if (under(src, dst)) return "ERR";
    return "OK";
  }
  public static void main(String[] args) {
    System.out.println(move("/a", "/a/b"));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
bool under(string src, string dst) { return false; }
string movePath(string src, string dst) {
  if (src == dst) return "ERR";
  if (under(src, dst)) return "ERR";
  return "OK";
}
int main() { cout << movePath("/a", "/a/b") << endl; }`,
      cs: `using System;
bool Under(string src, string dst) { return false; }
string Move(string src, string dst) {
  if (src == dst) return "ERR";
  if (Under(src, dst)) return "ERR";
  return "OK";
}
Console.WriteLine(Move("/a", "/a/b"));`,
      go: `package main
import "fmt"
func under(src, dst string) bool { return false }
func move(src, dst string) string {
  if src == dst { return "ERR" }
  if under(src, dst) { return "ERR" }
  return "OK"
}
func main() { fmt.Println(move("/a", "/a/b")) }`,
      rust: `fn under(_src: &str, _dst: &str) -> bool { false }
fn move_path(src: &str, dst: &str) -> &'static str {
  if src == dst { return "ERR"; }
  if under(src, dst) { return "ERR"; }
  "OK"
}
fn main() {
  println!("{}", move_path("/a", "/a/b"));
}`,
      ts: `function under(_src: string, _dst: string) {
  return false
}
function move(src: string, dst: string) {
  if (src === dst) return 'ERR'
  if (under(src, dst)) return 'ERR'
  return 'OK'
}
console.log(move('/a', '/a/b'))`,
      php: `<?php
class Fs {
  function under($src, $dst) { return false; }
  function move($src, $dst) {
    if ($src === $dst) return 'ERR';
    if ($this->under($src, $dst)) return 'ERR';
    return 'OK';
  }
}
echo (new Fs())->move('/a', '/a/b'), PHP_EOL;`,
      rb: `class Fs
  def under(src, dst)
    false
  end
  def move(src, dst)
    return 'ERR' if src == dst
    return 'ERR' if under(src, dst)
    'OK'
  end
end
puts Fs.new.move('/a', '/a/b')`,
    },
  }),

  challenge({
    slug: 'command-macro-undo-partial',
    title: 'Macro Command — Undo Only Last Subcommand',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['command', 'macro', 'undo'],
    order: 75,
    description:
      'Command pattern: a macro inserts X then Y as one user action. Undo must roll back both inserts so the document is EMPTY.',
    expectedOutput: 'EMPTY',
    hint: 'Is the macro one Composite command on the undo stack, or two separate inserts?',
    explanation:
      'Undo pops a single insert, leaving X. A macro is one Command whose undo walks every subcommand. Record both inserts as one composite and reverse them together.',
    code: {
      py: `class Doc:
    def __init__(self):
        self.text, self.hist = [], []
    def ins(self, ch):
        self.text.append(ch)
        self.hist.append(ch)
    def undo(self):
        if self.hist:
            self.hist.pop()
            self.text.pop()
    def show(self):
        return ''.join(self.text) if self.text else 'EMPTY'
d = Doc()
d.ins('X')
d.ins('Y')
d.undo()
print(d.show())`,
      java: `public class Main {
  static java.util.List<String> text = new java.util.ArrayList<>();
  static java.util.List<String> hist = new java.util.ArrayList<>();
  static void ins(String ch) { text.add(ch); hist.add(ch); }
  static void undo() {
    if (!hist.isEmpty()) {
      hist.remove(hist.size() - 1);
      text.remove(text.size() - 1);
    }
  }
  static String show() { return text.isEmpty() ? "EMPTY" : String.join("", text); }
  public static void main(String[] args) {
    ins("X"); ins("Y"); undo();
    System.out.println(show());
  }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
vector<string> text, hist;
void ins(string ch) { text.push_back(ch); hist.push_back(ch); }
void undo() {
  if (!hist.empty()) { hist.pop_back(); text.pop_back(); }
}
string show() { return text.empty() ? "EMPTY" : text[0] + (text.size()>1 ? text[1] : ""); }
int main() {
  ins("X"); ins("Y"); undo();
  cout << show() << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var text = new List<string>();
var hist = new List<string>();
void Ins(string ch) { text.Add(ch); hist.Add(ch); }
void Undo() {
  if (hist.Count > 0) { hist.RemoveAt(hist.Count-1); text.RemoveAt(text.Count-1); }
}
string Show() { return text.Count == 0 ? "EMPTY" : string.Join("", text); }
Ins("X"); Ins("Y"); Undo();
Console.WriteLine(Show());`,
      go: `package main
import "fmt"
func main() {
  text, hist := []string{}, []string{}
  ins := func(ch string) { text = append(text, ch); hist = append(hist, ch) }
  undo := func() {
    if len(hist) > 0 {
      hist = hist[:len(hist)-1]
      text = text[:len(text)-1]
    }
  }
  ins("X"); ins("Y"); undo()
  if len(text) == 0 { fmt.Println("EMPTY") } else { fmt.Println(text[0]) }
}`,
      rust: `fn ins(text: &mut Vec<&str>, hist: &mut Vec<&str>, ch: &'static str) {
  text.push(ch);
  hist.push(ch);
}
fn undo(text: &mut Vec<&str>, hist: &mut Vec<&str>) {
  if !hist.is_empty() { hist.pop(); text.pop(); }
}
fn main() {
  let mut text = vec![];
  let mut hist = vec![];
  ins(&mut text, &mut hist, "X");
  ins(&mut text, &mut hist, "Y");
  undo(&mut text, &mut hist);
  if text.is_empty() { println!("EMPTY"); } else { println!("{}", text.join("")); }
}`,
      ts: `const text: string[] = []
const hist: string[] = []
function ins(ch: string) { text.push(ch); hist.push(ch) }
function undo() {
  if (hist.length) { hist.pop(); text.pop() }
}
function show() { return text.length ? text.join('') : 'EMPTY' }
ins('X'); ins('Y'); undo()
console.log(show())`,
      php: `<?php
class Doc {
  public $text = [], $hist = [];
  function ins($ch) { $this->text[] = $ch; $this->hist[] = $ch; }
  function undo() {
    if (count($this->hist)) { array_pop($this->hist); array_pop($this->text); }
  }
  function show() { return count($this->text) ? implode('', $this->text) : 'EMPTY'; }
}
$d = new Doc();
$d->ins('X'); $d->ins('Y'); $d->undo();
echo $d->show(), PHP_EOL;`,
      rb: `class Doc
  def initialize
    @text, @hist = [], []
  end
  def ins(ch)
    @text << ch
    @hist << ch
  end
  def undo
    if !@hist.empty?
      @hist.pop
      @text.pop
    end
  end
  def show
    @text.empty? ? 'EMPTY' : @text.join
  end
end
d = Doc.new
d.ins('X'); d.ins('Y'); d.undo
puts d.show`,
    },
  }),

  challenge({
    slug: 'decorator-encrypt-then-compress',
    title: 'Stream Decorators — Decrypt Order Wrong',
    difficulty: 'hard',
    bugType: 'wrong-algorithm',
    tags: ['decorator', 'streams', 'ordering'],
    order: 76,
    description:
      'Write path compresses then encrypts PLAIN. Open must reverse the stack: decrypt, then decompress, yielding PLAIN. Wrong unwrap order prints GARBLED.',
    expectedOutput: 'PLAIN',
    hint: 'Decorators form a stack. Unwrap in the reverse order of wrapping.',
    explanation:
      'Stored bytes are encrypt(compress(PLAIN)). Opening with decompress-then-decrypt applies the inner codec first and yields garbage. Peel the outermost decorator first: decrypt, then decompress.',
    code: {
      py: `def compress(s):
    return s + '#'
def encrypt(s):
    return s[::-1]
def decompress(s):
    return s[:-1]
def decrypt(s):
    return s[::-1]
stored = encrypt(compress('PLAIN'))
opened = decrypt(decompress(stored))
print('PLAIN' if opened == 'PLAIN' else 'GARBLED')`,
      java: `public class Main {
  static String compress(String s) { return s + "#"; }
  static String encrypt(String s) { return new StringBuilder(s).reverse().toString(); }
  static String decompress(String s) { return s.substring(0, s.length() - 1); }
  static String decrypt(String s) { return new StringBuilder(s).reverse().toString(); }
  public static void main(String[] args) {
    String stored = encrypt(compress("PLAIN"));
    String opened = decrypt(decompress(stored));
    System.out.println(opened.equals("PLAIN") ? "PLAIN" : "GARBLED");
  }
}`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;
string compress(string s) { return s + "#"; }
string encrypt(string s) { reverse(s.begin(), s.end()); return s; }
string decompress(string s) { return s.substr(0, s.size() - 1); }
string decrypt(string s) { reverse(s.begin(), s.end()); return s; }
int main() {
  string stored = encrypt(compress("PLAIN"));
  string opened = decrypt(decompress(stored));
  cout << (opened == "PLAIN" ? "PLAIN" : "GARBLED") << endl;
}`,
      cs: `using System;
string Compress(string s) { return s + "#"; }
string Encrypt(string s) {
  char[] a = s.ToCharArray();
  Array.Reverse(a);
  return new string(a);
}
string Decompress(string s) { return s.Substring(0, s.Length - 1); }
string Decrypt(string s) { return Encrypt(s); }
string stored = Encrypt(Compress("PLAIN"));
string opened = Decrypt(Decompress(stored));
Console.WriteLine(opened == "PLAIN" ? "PLAIN" : "GARBLED");`,
      go: `package main
import "fmt"
func compress(s string) string { return s + "#" }
func encrypt(s string) string {
  r := []rune(s)
  for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
    r[i], r[j] = r[j], r[i]
  }
  return string(r)
}
func decompress(s string) string { return s[:len(s)-1] }
func decrypt(s string) string { return encrypt(s) }
func main() {
  stored := encrypt(compress("PLAIN"))
  opened := decrypt(decompress(stored))
  if opened == "PLAIN" { fmt.Println("PLAIN") } else { fmt.Println("GARBLED") }
}`,
      rust: `fn compress(s: &str) -> String { format!("{}#", s) }
fn encrypt(s: &str) -> String { s.chars().rev().collect() }
fn decompress(s: &str) -> String { s[..s.len()-1].to_string() }
fn decrypt(s: &str) -> String { s.chars().rev().collect() }
fn main() {
  let stored = encrypt(&compress("PLAIN"));
  let opened = decrypt(&decompress(&stored));
  if opened == "PLAIN" { println!("PLAIN"); } else { println!("GARBLED"); }
}`,
      ts: `function compress(s: string) { return s + '#' }
function encrypt(s: string) { return s.split('').reverse().join('') }
function decompress(s: string) { return s.slice(0, -1) }
function decrypt(s: string) { return s.split('').reverse().join('') }
const stored = encrypt(compress('PLAIN'))
const opened = decrypt(decompress(stored))
console.log(opened === 'PLAIN' ? 'PLAIN' : 'GARBLED')`,
      php: `<?php
function compress($s) { return $s . '#'; }
function encrypt($s) { return strrev($s); }
function decompress($s) { return substr($s, 0, -1); }
function decrypt($s) { return strrev($s); }
$stored = encrypt(compress('PLAIN'));
$opened = decrypt(decompress($stored));
echo $opened === 'PLAIN' ? 'PLAIN' : 'GARBLED', PHP_EOL;`,
      rb: `def compress(s) s + '#' end
def encrypt(s) s.reverse end
def decompress(s) s[0...-1] end
def decrypt(s) s.reverse end
stored = encrypt(compress('PLAIN'))
opened = decrypt(decompress(stored))
puts opened == 'PLAIN' ? 'PLAIN' : 'GARBLED'`,
    },
  }),

  challenge({
    slug: 'proxy-auth-after-execute',
    title: 'Protection Proxy — Checks Role After Mutation',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['proxy', 'authorization', 'invariants'],
    order: 77,
    description:
      'Protection proxy: a user (not admin) calls delete(). Must print DENIED and leave the record intact. Authorization is a guard, not an after-the-fact log.',
    expectedOutput: 'DENIED',
    hint: 'Is role checked before the store is mutated, or does delete always succeed?',
    explanation:
      'delete() mutates first (or skips the role check), so a user gets DELETED. A protection proxy denies before forwarding. If role is not admin, return DENIED without touching the record.',
    code: {
      py: `class Store:
    def __init__(self):
        self.rec = 'LIVE'
    def delete(self, role):
        self.rec = 'GONE'
        return 'DELETED'
print(Store().delete('user'))`,
      java: `public class Main {
  static String rec = "LIVE";
  static String delete(String role) {
    rec = "GONE";
    return "DELETED";
  }
  public static void main(String[] args) {
    System.out.println(delete("user"));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string rec = "LIVE";
string del(string role) {
  rec = "GONE";
  return "DELETED";
}
int main() { cout << del("user") << endl; }`,
      cs: `using System;
string rec = "LIVE";
string Delete(string role) {
  rec = "GONE";
  return "DELETED";
}
Console.WriteLine(Delete("user"));`,
      go: `package main
import "fmt"
func main() {
  rec := "LIVE"
  del := func(role string) string {
    rec = "GONE"
    return "DELETED"
  }
  fmt.Println(del("user"))
}`,
      rust: `fn delete(rec: &mut String, _role: &str) -> &'static str {
  rec.clear();
  rec.push_str("GONE");
  "DELETED"
}
fn main() {
  let mut rec = String::from("LIVE");
  println!("{}", delete(&mut rec, "user"));
}`,
      ts: `let rec = 'LIVE'
function del(_role: string) {
  rec = 'GONE'
  return 'DELETED'
}
console.log(del('user'))`,
      php: `<?php
class Store {
  public $rec = 'LIVE';
  function delete($role) {
    $this->rec = 'GONE';
    return 'DELETED';
  }
}
echo (new Store())->delete('user'), PHP_EOL;`,
      rb: `class Store
  def initialize
    @rec = 'LIVE'
  end
  def delete(role)
    @rec = 'GONE'
    'DELETED'
  end
end
puts Store.new.delete('user')`,
    },
  }),

  challenge({
    slug: 'strategy-shared-mutable',
    title: 'Strategy — Shared Instance Corrupts Context',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['strategy', 'shared-state', 'pricing'],
    order: 78,
    description:
      'Two carts share one Discount strategy object. Cart A sets 50% off. Cart B never set a discount; its 100 subtotal must stay 100. Print cart B total.',
    expectedOutput: '100',
    hint: 'Is the percent stored on the shared strategy or on the cart (context)?',
    explanation:
      'Cart A wrote rate=50 onto the shared strategy, so cart B charges 50. Extrinsic context (rate) must not live on a reused strategy. Give each cart its own strategy instance, or store rate on the cart.',
    code: {
      py: `class PctOff:
    def __init__(self):
        self.rate = 0
class Cart:
    def __init__(self, strat, price):
        self.strat, self.price = strat, price
    def set_rate(self, r):
        self.strat.rate = r
    def total(self):
        return self.price * (100 - self.strat.rate) // 100
s = PctOff()
a, b = Cart(s, 100), Cart(s, 100)
a.set_rate(50)
print(b.total())`,
      java: `public class Main {
  static int rate = 0;
  static void setRate(int r) { rate = r; }
  static int total(int price) { return price * (100 - rate) / 100; }
  public static void main(String[] args) {
    setRate(50);
    System.out.println(total(100));
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int rate = 0;
void setRate(int r) { rate = r; }
int total(int price) { return price * (100 - rate) / 100; }
int main() {
  setRate(50);
  cout << total(100) << endl;
}`,
      cs: `using System;
int rate = 0;
void SetRate(int r) { rate = r; }
int Total(int price) { return price * (100 - rate) / 100; }
SetRate(50);
Console.WriteLine(Total(100));`,
      go: `package main
import "fmt"
func main() {
  rate := 0
  setRate := func(r int) { rate = r }
  total := func(price int) int { return price * (100 - rate) / 100 }
  setRate(50)
  fmt.Println(total(100))
}`,
      rust: `fn set_rate(rate: &mut i32, r: i32) { *rate = r; }
fn total(price: i32, rate: i32) -> i32 { price * (100 - rate) / 100 }
fn main() {
  let mut rate = 0;
  set_rate(&mut rate, 50);
  println!("{}", total(100, rate));
}`,
      ts: `let rate = 0
function setRate(r: number) { rate = r }
function total(price: number) { return price * (100 - rate) / 100 }
setRate(50)
console.log(total(100))`,
      php: `<?php
class PctOff { public $rate = 0; }
class Cart {
  public $strat, $price;
  function __construct($strat, $price) { $this->strat = $strat; $this->price = $price; }
  function setRate($r) { $this->strat->rate = $r; }
  function total() { return (int)($this->price * (100 - $this->strat->rate) / 100); }
}
$s = new PctOff();
$a = new Cart($s, 100); $b = new Cart($s, 100);
$a->setRate(50);
echo $b->total(), PHP_EOL;`,
      rb: `class PctOff
  attr_accessor :rate
  def initialize; @rate = 0; end
end
class Cart
  def initialize(strat, price)
    @strat, @price = strat, price
  end
  def set_rate(r); @strat.rate = r; end
  def total; @price * (100 - @strat.rate) / 100; end
end
s = PctOff.new
a, b = Cart.new(s, 100), Cart.new(s, 100)
a.set_rate(50)
puts b.total`,
    },
  }),

  challenge({
    slug: 'state-skips-exit-action',
    title: 'State Machine — Exit Action Not Run',
    difficulty: 'hard',
    bugType: 'missing-return',
    tags: ['state', 'exit-action', 'door'],
    order: 79,
    description:
      'Door FSM: leaving OPEN must run the exit action LOCK, then enter CLOSED. Print LOCK then CLOSED on two lines.',
    expectedOutput: 'LOCK\nCLOSED',
    hint: 'On a transition, is the current state’s exit hook invoked before the new state is entered?',
    explanation:
      'close() jumps to CLOSED without the OPEN exit action, so LOCK never prints. Transitions are exit(old) → enter(new). Call the OPEN exit action (LOCK) before recording CLOSED.',
    code: {
      py: `class Door:
    def __init__(self):
        self.state = 'OPEN'
        self.log = []
    def on_exit_open(self):
        self.log.append('LOCK')
    def close(self):
        self.state = 'CLOSED'
        self.log.append('CLOSED')
    def dump(self):
        return '\\n'.join(self.log)
d = Door()
d.close()
print(d.dump())`,
      java: `public class Main {
  static String state = "OPEN";
  static java.util.List<String> log = new java.util.ArrayList<>();
  static void onExitOpen() { log.add("LOCK"); }
  static void close() {
    state = "CLOSED";
    log.add("CLOSED");
  }
  public static void main(String[] args) {
    close();
    System.out.println(String.join("\\n", log));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string state = "OPEN";
void onExitOpen() { cout << "LOCK" << endl; }
void close() {
  state = "CLOSED";
  cout << "CLOSED" << endl;
}
int main() { close(); }`,
      cs: `using System;
using System.Collections.Generic;
string state = "OPEN";
var log = new List<string>();
void OnExitOpen() { log.Add("LOCK"); }
void Close() {
  state = "CLOSED";
  log.Add("CLOSED");
}
Close();
Console.WriteLine(string.Join("\\n", log));`,
      go: `package main
import (
  "fmt"
  "strings"
)
func main() {
  state := "OPEN"
  log := []string{}
  onExitOpen := func() { log = append(log, "LOCK") }
  _ = onExitOpen
  close := func() {
    state = "CLOSED"
    log = append(log, "CLOSED")
  }
  close()
  fmt.Println(strings.Join(log, "\\n"))
}`,
      rust: `fn on_exit_open(log: &mut Vec<&str>) { log.push("LOCK"); }
fn close(state: &mut &str, log: &mut Vec<&str>) {
  *state = "CLOSED";
  log.push("CLOSED");
}
fn main() {
  let mut state = "OPEN";
  let mut log = vec![];
  close(&mut state, &mut log);
  println!("{}", log.join("\\n"));
}`,
      ts: `let state = 'OPEN'
const log: string[] = []
function onExitOpen() { log.push('LOCK') }
function close() {
  state = 'CLOSED'
  log.push('CLOSED')
}
close()
console.log(log.join('\\n'))`,
      php: `<?php
class Door {
  public $state = 'OPEN', $log = [];
  function onExitOpen() { $this->log[] = 'LOCK'; }
  function close() {
    $this->state = 'CLOSED';
    $this->log[] = 'CLOSED';
  }
}
$d = new Door();
$d->close();
echo implode("\\n", $d->log), PHP_EOL;`,
      rb: `class Door
  def initialize
    @state, @log = 'OPEN', []
  end
  def on_exit_open; @log << 'LOCK'; end
  def close
    @state = 'CLOSED'
    @log << 'CLOSED'
  end
  def dump; @log.join("\\n"); end
end
d = Door.new
d.close
puts d.dump`,
    },
  }),

  challenge({
    slug: 'event-replay-out-of-order',
    title: 'Event Sourcing — Replay Applies Events Unsorted',
    difficulty: 'hard',
    bugType: 'wrong-algorithm',
    tags: ['event-sourcing', 'replay', 'ordering'],
    order: 80,
    description:
      'Account starts at 0. Events: debit 1 at t=2, credit 1 at t=1. Replay must sort by time so credit happens first: balance 0. Unsorted list order refuses the debit then credits to 1.',
    expectedOutput: '0',
    hint: 'Are events sorted by timestamp before fold, or applied in array order?',
    explanation:
      'Replay walks insertion order: debit 1 from 0 is refused, then credit 1 leaves 1. Event sourcing folds a total order. Sort by t so credit at t=1 applies first, then debit at t=2 yields 0.',
    code: {
      py: `class Acct:
    def __init__(self):
        self.bal = 0
    def replay(self, events):
        for kind, amt, t in events:
            if kind == 'credit':
                self.bal += amt
            elif kind == 'debit' and self.bal >= amt:
                self.bal -= amt
events = [('debit', 1, 2), ('credit', 1, 1)]
a = Acct()
a.replay(events)
print(a.bal)`,
      java: `public class Main {
  static int bal = 0;
  static void apply(String kind, int amt) {
    if (kind.equals("credit")) bal += amt;
    else if (kind.equals("debit") && bal >= amt) bal -= amt;
  }
  public static void main(String[] args) {
    String[] kinds = {"debit", "credit"};
    int[] amts = {1, 1};
    int[] ts = {2, 1};
    for (int i = 0; i < kinds.length; i++) apply(kinds[i], amts[i]);
    System.out.println(bal);
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int bal = 0;
void apply(string kind, int amt) {
  if (kind == "credit") bal += amt;
  else if (kind == "debit" && bal >= amt) bal -= amt;
}
int main() {
  string kinds[] = {"debit", "credit"};
  int amts[] = {1, 1};
  for (int i = 0; i < 2; i++) apply(kinds[i], amts[i]);
  cout << bal << endl;
}`,
      cs: `using System;
int bal = 0;
void Apply(string kind, int amt) {
  if (kind == "credit") bal += amt;
  else if (kind == "debit" && bal >= amt) bal -= amt;
}
string[] kinds = {"debit", "credit"};
int[] amts = {1, 1};
for (int i = 0; i < kinds.Length; i++) Apply(kinds[i], amts[i]);
Console.WriteLine(bal);`,
      go: `package main
import "fmt"
func main() {
  bal := 0
  apply := func(kind string, amt int) {
    if kind == "credit" { bal += amt } else if kind == "debit" && bal >= amt { bal -= amt }
  }
  kinds := []string{"debit", "credit"}
  amts := []int{1, 1}
  for i := range kinds { apply(kinds[i], amts[i]) }
  fmt.Println(bal)
}`,
      rust: `fn apply(bal: &mut i32, kind: &str, amt: i32) {
  if kind == "credit" { *bal += amt; }
  else if kind == "debit" && *bal >= amt { *bal -= amt; }
}
fn main() {
  let mut bal = 0;
  let kinds = ["debit", "credit"];
  let amts = [1, 1];
  for i in 0..2 { apply(&mut bal, kinds[i], amts[i]); }
  println!("{}", bal);
}`,
      ts: `let bal = 0
function apply(kind: string, amt: number) {
  if (kind === 'credit') bal += amt
  else if (kind === 'debit' && bal >= amt) bal -= amt
}
const kinds = ['debit', 'credit']
const amts = [1, 1]
for (let i = 0; i < kinds.length; i++) apply(kinds[i], amts[i])
console.log(bal)`,
      php: `<?php
class Acct {
  public $bal = 0;
  function apply($kind, $amt) {
    if ($kind === 'credit') $this->bal += $amt;
    else if ($kind === 'debit' && $this->bal >= $amt) $this->bal -= $amt;
  }
}
$a = new Acct();
$kinds = ['debit', 'credit']; $amts = [1, 1];
for ($i = 0; $i < 2; $i++) $a->apply($kinds[$i], $amts[$i]);
echo $a->bal, PHP_EOL;`,
      rb: `class Acct
  attr_reader :bal
  def initialize; @bal = 0; end
  def apply(kind, amt)
    if kind == 'credit'; @bal += amt
    elsif kind == 'debit' && @bal >= amt; @bal -= amt
    end
  end
end
a = Acct.new
[['debit', 1], ['credit', 1]].each { |k, n| a.apply(k, n) }
puts a.bal`,
    },
  }),

  challenge({
    slug: 'spec-and-implemented-or',
    title: 'Specification — AND Combines as OR',
    difficulty: 'hard',
    bugType: 'operator',
    tags: ['specification', 'composite', 'filtering'],
    order: 81,
    description:
      'Specification pattern: item must satisfy price<10 AND inStock. Item priced 20 that is in stock must FAIL the composite AND.',
    expectedOutput: 'FAIL',
    hint: 'Does Spec.and() use &&, or did someone type ||?',
    explanation:
      'AND was implemented with OR, so in-stock expensive items pass. Composite specifications combine predicates with the named boolean operator. and() must require both sides true.',
    code: {
      py: `class Spec:
    def __init__(self, fn):
        self.fn = fn
    def and_(self, other):
        return Spec(lambda x: self.fn(x) or other.fn(x))
    def ok(self, x):
        return self.fn(x)
item = {'price': 20, 'stock': True}
s = Spec(lambda x: x['price'] < 10).and_(Spec(lambda x: x['stock']))
print('PASS' if s.ok(item) else 'FAIL')`,
      java: `public class Main {
  static boolean cheap(int price) { return price < 10; }
  static boolean inStock(boolean stock) { return stock; }
  static boolean and(boolean a, boolean b) { return a || b; }
  public static void main(String[] args) {
    boolean ok = and(cheap(20), inStock(true));
    System.out.println(ok ? "PASS" : "FAIL");
  }
}`,
      cpp: `#include <iostream>
using namespace std;
bool cheap(int price) { return price < 10; }
bool inStock(bool stock) { return stock; }
bool specAnd(bool a, bool b) { return a || b; }
int main() {
  bool ok = specAnd(cheap(20), inStock(true));
  cout << (ok ? "PASS" : "FAIL") << endl;
}`,
      cs: `using System;
bool Cheap(int price) { return price < 10; }
bool InStock(bool stock) { return stock; }
bool And(bool a, bool b) { return a || b; }
bool ok = And(Cheap(20), InStock(true));
Console.WriteLine(ok ? "PASS" : "FAIL");`,
      go: `package main
import "fmt"
func cheap(price int) bool { return price < 10 }
func inStock(stock bool) bool { return stock }
func and(a, b bool) bool { return a || b }
func main() {
  ok := and(cheap(20), inStock(true))
  if ok { fmt.Println("PASS") } else { fmt.Println("FAIL") }
}`,
      rust: `fn cheap(price: i32) -> bool { price < 10 }
fn in_stock(stock: bool) -> bool { stock }
fn and(a: bool, b: bool) -> bool { a || b }
fn main() {
  let ok = and(cheap(20), in_stock(true));
  if ok { println!("PASS"); } else { println!("FAIL"); }
}`,
      ts: `function cheap(price: number) { return price < 10 }
function inStock(stock: boolean) { return stock }
function and(a: boolean, b: boolean) { return a || b }
const ok = and(cheap(20), inStock(true))
console.log(ok ? 'PASS' : 'FAIL')`,
      php: `<?php
function cheap($price) { return $price < 10; }
function inStock($stock) { return $stock; }
function specAnd($a, $b) { return $a || $b; }
$ok = specAnd(cheap(20), inStock(true));
echo $ok ? 'PASS' : 'FAIL', PHP_EOL;`,
      rb: `def cheap(price) price < 10 end
def in_stock(stock) stock end
def spec_and(a, b) a || b end
ok = spec_and(cheap(20), in_stock(true))
puts ok ? 'PASS' : 'FAIL'`,
    },
  }),

  challenge({
    slug: 'uow-commits-partial',
    title: 'Unit of Work — Commit Saves Only First Aggregate',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['unit-of-work', 'persistence', 'atomicity'],
    order: 82,
    description:
      'Unit of Work has two dirty aggregates. commit() must persist both and print saved count 2.',
    expectedOutput: '2',
    hint: 'Does commit loop the dirty set, or save one row and return?',
    explanation:
      'Commit pops a single aggregate and stops, so saved=1. A unit of work flushes every dirty entity in one transaction. Iterate the full dirty list (or drain it) before returning.',
    code: {
      py: `class UoW:
    def __init__(self):
        self.dirty = ['Order', 'Payment']
        self.saved = 0
    def commit(self):
        if self.dirty:
            self.dirty.pop(0)
            self.saved += 1
u = UoW()
u.commit()
print(u.saved)`,
      java: `public class Main {
  static java.util.List<String> dirty = new java.util.ArrayList<>(java.util.List.of("Order", "Payment"));
  static int saved = 0;
  static void commit() {
    if (!dirty.isEmpty()) {
      dirty.remove(0);
      saved++;
    }
  }
  public static void main(String[] args) {
    commit();
    System.out.println(saved);
  }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
vector<string> dirty = {"Order", "Payment"};
int saved = 0;
void commit() {
  if (!dirty.empty()) { dirty.erase(dirty.begin()); saved++; }
}
int main() { commit(); cout << saved << endl; }`,
      cs: `using System;
using System.Collections.Generic;
var dirty = new List<string>{"Order", "Payment"};
int saved = 0;
void Commit() {
  if (dirty.Count > 0) { dirty.RemoveAt(0); saved++; }
}
Commit();
Console.WriteLine(saved);`,
      go: `package main
import "fmt"
func main() {
  dirty := []string{"Order", "Payment"}
  saved := 0
  commit := func() {
    if len(dirty) > 0 {
      dirty = dirty[1:]
      saved++
    }
  }
  commit()
  fmt.Println(saved)
}`,
      rust: `fn commit(dirty: &mut Vec<&str>, saved: &mut i32) {
  if !dirty.is_empty() {
    dirty.remove(0);
    *saved += 1;
  }
}
fn main() {
  let mut dirty = vec!["Order", "Payment"];
  let mut saved = 0;
  commit(&mut dirty, &mut saved);
  println!("{}", saved);
}`,
      ts: `const dirty = ['Order', 'Payment']
let saved = 0
function commit() {
  if (dirty.length) {
    dirty.shift()
    saved++
  }
}
commit()
console.log(saved)`,
      php: `<?php
class UoW {
  public $dirty = ['Order', 'Payment'], $saved = 0;
  function commit() {
    if (count($this->dirty)) {
      array_shift($this->dirty);
      $this->saved++;
    }
  }
}
$u = new UoW();
$u->commit();
echo $u->saved, PHP_EOL;`,
      rb: `class UoW
  attr_reader :saved
  def initialize
    @dirty, @saved = ['Order', 'Payment'], 0
  end
  def commit
    if !@dirty.empty?
      @dirty.shift
      @saved += 1
    end
  end
end
u = UoW.new
u.commit
puts u.saved`,
    },
  }),

  challenge({
    slug: 'cqrs-read-stale',
    title: 'CQRS — Query Model Not Updated',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['cqrs', 'read-model', 'consistency'],
    order: 83,
    description:
      'CQRS: the command side renames the user to NEO. A subsequent query must return NEO, not the stale OLD projection.',
    expectedOutput: 'NEO',
    hint: 'After the write model changes, is the read model projected?',
    explanation:
      'rename updates the write store only, so queries still see OLD. CQRS keeps a projection in sync (sync or via events). Update the query model when the command succeeds.',
    code: {
      py: `class App:
    def __init__(self):
        self.write = {'name': 'OLD'}
        self.read = {'name': 'OLD'}
    def rename(self, n):
        self.write['name'] = n
    def query(self):
        return self.read['name']
a = App()
a.rename('NEO')
print(a.query())`,
      java: `public class Main {
  static String writeName = "OLD", readName = "OLD";
  static void rename(String n) { writeName = n; }
  static String query() { return readName; }
  public static void main(String[] args) {
    rename("NEO");
    System.out.println(query());
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string writeName = "OLD", readName = "OLD";
void rename(string n) { writeName = n; }
string query() { return readName; }
int main() {
  rename("NEO");
  cout << query() << endl;
}`,
      cs: `using System;
string writeName = "OLD", readName = "OLD";
void Rename(string n) { writeName = n; }
string Query() { return readName; }
Rename("NEO");
Console.WriteLine(Query());`,
      go: `package main
import "fmt"
func main() {
  writeName, readName := "OLD", "OLD"
  rename := func(n string) { writeName = n }
  query := func() string { return readName }
  rename("NEO")
  fmt.Println(query())
}`,
      rust: `fn rename(write: &mut String, n: &str) { write.clear(); write.push_str(n); }
fn query(read: &str) -> &str { read }
fn main() {
  let mut write = String::from("OLD");
  let read = String::from("OLD");
  rename(&mut write, "NEO");
  println!("{}", query(&read));
}`,
      ts: `const write = { name: 'OLD' }
const read = { name: 'OLD' }
function rename(n: string) { write.name = n }
function query() { return read.name }
rename('NEO')
console.log(query())`,
      php: `<?php
class App {
  public $write = 'OLD', $read = 'OLD';
  function rename($n) { $this->write = $n; }
  function query() { return $this->read; }
}
$a = new App();
$a->rename('NEO');
echo $a->query(), PHP_EOL;`,
      rb: `class App
  def initialize
    @write, @read = 'OLD', 'OLD'
  end
  def rename(n); @write = n; end
  def query; @read; end
end
a = App.new
a.rename('NEO')
puts a.query`,
    },
  }),

  challenge({
    slug: 'saga-timeout-after-success',
    title: 'Saga — Timeout Compensation Runs After Success',
    difficulty: 'hard',
    bugType: 'edge-case',
    tags: ['saga', 'timeout', 'idempotency'],
    order: 84,
    description:
      'Saga already completed successfully (DONE). A late timeout callback must be ignored and leave status DONE, not roll back to CANCELLED.',
    expectedOutput: 'DONE',
    hint: 'Does onTimeout() check that the saga is still in-flight?',
    explanation:
      'Timeout compensation is not gated on status, so a completed saga is cancelled. Timeouts are only valid in PENDING. If already DONE, no-op.',
    code: {
      py: `class Saga:
    def __init__(self):
        self.status = 'PENDING'
    def succeed(self):
        self.status = 'DONE'
    def timeout(self):
        self.status = 'CANCELLED'
s = Saga()
s.succeed()
s.timeout()
print(s.status)`,
      java: `public class Main {
  static String status = "PENDING";
  static void succeed() { status = "DONE"; }
  static void timeout() { status = "CANCELLED"; }
  public static void main(String[] args) {
    succeed();
    timeout();
    System.out.println(status);
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string status = "PENDING";
void succeed() { status = "DONE"; }
void timeout() { status = "CANCELLED"; }
int main() {
  succeed();
  timeout();
  cout << status << endl;
}`,
      cs: `using System;
string status = "PENDING";
void Succeed() { status = "DONE"; }
void Timeout() { status = "CANCELLED"; }
Succeed();
Timeout();
Console.WriteLine(status);`,
      go: `package main
import "fmt"
func main() {
  status := "PENDING"
  succeed := func() { status = "DONE" }
  timeout := func() { status = "CANCELLED" }
  succeed()
  timeout()
  fmt.Println(status)
}`,
      rust: `fn succeed(status: &mut &str) { *status = "DONE"; }
fn timeout(status: &mut &str) { *status = "CANCELLED"; }
fn main() {
  let mut status = "PENDING";
  succeed(&mut status);
  timeout(&mut status);
  println!("{}", status);
}`,
      ts: `let status = 'PENDING'
function succeed() { status = 'DONE' }
function timeout() { status = 'CANCELLED' }
succeed()
timeout()
console.log(status)`,
      php: `<?php
class Saga {
  public $status = 'PENDING';
  function succeed() { $this->status = 'DONE'; }
  function timeout() { $this->status = 'CANCELLED'; }
}
$s = new Saga();
$s->succeed();
$s->timeout();
echo $s->status, PHP_EOL;`,
      rb: `class Saga
  attr_reader :status
  def initialize; @status = 'PENDING'; end
  def succeed; @status = 'DONE'; end
  def timeout; @status = 'CANCELLED'; end
end
s = Saga.new
s.succeed
s.timeout
puts s.status`,
    },
  }),

  challenge({
    slug: 'observer-reentrant-dup',
    title: 'Observer — Notify During Notify Duplicates',
    difficulty: 'hard',
    bugType: 'edge-case',
    tags: ['observer', 'reentrancy', 'eventing'],
    order: 85,
    description:
      'An observer resubscribes itself on the first event. Dispatch must snapshot listeners so the handler runs once; a live growing list fires twice. Print the fire count.',
    expectedOutput: '1',
    hint: 'Do you iterate a copy of the subscriber list, or the live vector while it grows?',
    explanation:
      'Notify walks the live list; the handler appends itself and is invoked again (count 2). Snapshot subscribers (or freeze size) before dispatch so reentrant subscribe is deferred.',
    code: {
      py: `obs = []
count = [0]
def handler():
    count[0] += 1
    if count[0] == 1:
        obs.append(handler)
obs.append(handler)
i = 0
while i < len(obs):
    obs[i]()
    i += 1
print(count[0])`,
      java: `public class Main {
  static java.util.List<Integer> obs = new java.util.ArrayList<>();
  static int count = 0;
  static void handler() {
    count++;
    if (count == 1) obs.add(1);
  }
  public static void main(String[] args) {
    obs.add(1);
    for (int i = 0; i < obs.size(); i++) handler();
    System.out.println(count);
  }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
vector<int> obs;
int countN = 0;
void handler() {
  countN++;
  if (countN == 1) obs.push_back(1);
}
int main() {
  obs.push_back(1);
  for (size_t i = 0; i < obs.size(); i++) handler();
  cout << countN << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var obs = new List<int>();
int count = 0;
void Handler() {
  count++;
  if (count == 1) obs.Add(1);
}
obs.Add(1);
for (int i = 0; i < obs.Count; i++) Handler();
Console.WriteLine(count);`,
      go: `package main
import "fmt"
func main() {
  obs := []int{1}
  count := 0
  handler := func() {
    count++
    if count == 1 { obs = append(obs, 1) }
  }
  for i := 0; i < len(obs); i++ { handler() }
  fmt.Println(count)
}`,
      rust: `fn main() {
  let mut obs = vec![1];
  let mut count = 0;
  let mut i = 0;
  while i < obs.len() {
    count += 1;
    if count == 1 { obs.push(1); }
    i += 1;
  }
  println!("{}", count);
}`,
      ts: `const obs: number[] = [1]
let count = 0
function handler() {
  count++
  if (count === 1) obs.push(1)
}
for (let i = 0; i < obs.length; i++) handler()
console.log(count)`,
      php: `<?php
$obs = [1];
$count = 0;
$i = 0;
while ($i < count($obs)) {
  $count++;
  if ($count == 1) $obs[] = 1;
  $i++;
}
echo $count, PHP_EOL;`,
      rb: `obs = [1]
count = 0
i = 0
while i < obs.length
  count += 1
  obs << 1 if count == 1
  i += 1
end
puts count`,
    },
  }),

  challenge({
    slug: 'flyweight-stores-position',
    title: 'Flyweight — Extrinsic Position Stored in Shared Type',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['flyweight', 'extrinsic-state', 'sharing'],
    order: 86,
    description:
      'Particle flyweight: two particles share a type, with x=3 and x=9. Extrinsic position must live on the particle. Print particle 2’s x; it must be 9.',
    expectedOutput: '9',
    hint: 'Was x written onto the shared glyph, first-writer-wins?',
    explanation:
      'Position was cached on the shared type; the first particle’s x=3 stuck, so p2 reports 3. Flyweight intrinsic state is the type; x is extrinsic per instance. Store x on the particle, not the glyph.',
    code: {
      py: `class Glyph:
    def __init__(self):
        self.x = None
    def bind(self, x):
        if self.x is None:
            self.x = x
shared = Glyph()
class Particle:
    def __init__(self, x):
        shared.bind(x)
        self.t = shared
p1 = Particle(3)
p2 = Particle(9)
print(p2.t.x)`,
      java: `public class Main {
  static Integer glyphX = null;
  static void bind(int x) { if (glyphX == null) glyphX = x; }
  public static void main(String[] args) {
    bind(3);
    bind(9);
    System.out.println(glyphX);
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int glyphX = -1;
void bind(int x) { if (glyphX < 0) glyphX = x; }
int main() {
  bind(3);
  bind(9);
  cout << glyphX << endl;
}`,
      cs: `using System;
int? glyphX = null;
void Bind(int x) { if (glyphX == null) glyphX = x; }
Bind(3);
Bind(9);
Console.WriteLine(glyphX);`,
      go: `package main
import "fmt"
func main() {
  glyphX := -1
  bind := func(x int) {
    if glyphX < 0 { glyphX = x }
  }
  bind(3)
  bind(9)
  fmt.Println(glyphX)
}`,
      rust: `fn bind(glyph_x: &mut i32, x: i32) {
  if *glyph_x < 0 { *glyph_x = x; }
}
fn main() {
  let mut glyph_x = -1;
  bind(&mut glyph_x, 3);
  bind(&mut glyph_x, 9);
  println!("{}", glyph_x);
}`,
      ts: `let glyphX: number | null = null
function bind(x: number) {
  if (glyphX === null) glyphX = x
}
bind(3)
bind(9)
console.log(glyphX)`,
      php: `<?php
class Glyph {
  public $x = null;
  function bind($x) { if ($this->x === null) $this->x = $x; }
}
$shared = new Glyph();
class Particle {
  public $t;
  function __construct($x, $shared) { $shared->bind($x); $this->t = $shared; }
}
$p1 = new Particle(3, $shared);
$p2 = new Particle(9, $shared);
echo $p2->t->x, PHP_EOL;`,
      rb: `class Glyph
  attr_accessor :x
  def bind(x)
    @x = x if @x.nil?
  end
end
shared = Glyph.new
class Particle
  attr_reader :t
  def initialize(x, shared)
    shared.bind(x)
    @t = shared
  end
end
Particle.new(3, shared)
p2 = Particle.new(9, shared)
puts p2.t.x`,
    },
  }),

  challenge({
    slug: 'interpreter-precedence',
    title: 'Rule Interpreter — + Binds Tighter Than *',
    difficulty: 'hard',
    bugType: 'operator',
    tags: ['interpreter', 'precedence', 'rules'],
    order: 87,
    description:
      'Rule DSL interpreter evaluates 2+3*4. Multiplication binds tighter than addition, so the result must be 14, not left-to-right 20.',
    expectedOutput: '14',
    hint: 'Is * reduced before +, or do you fold tokens strictly left to right?',
    explanation:
      'The interpreter folds 2+3 then *4 → 20. Arithmetic grammar gives * higher precedence. Parse terms (products) before adding, yielding 2+(3*4)=14.',
    code: {
      py: `class Expr:
    def eval(self):
        nums, ops = [2, 3, 4], ['+', '*']
        acc = nums[0]
        for i, op in enumerate(ops):
            if op == '+':
                acc = acc + nums[i + 1]
            else:
                acc = acc * nums[i + 1]
        return acc
print(Expr().eval())`,
      java: `public class Main {
  static int eval() {
    int[] nums = {2, 3, 4};
    char[] ops = {'+', '*'};
    int acc = nums[0];
    for (int i = 0; i < ops.length; i++) {
      if (ops[i] == '+') acc = acc + nums[i + 1];
      else acc = acc * nums[i + 1];
    }
    return acc;
  }
  public static void main(String[] args) { System.out.println(eval()); }
}`,
      cpp: `#include <iostream>
using namespace std;
int evalExpr() {
  int nums[] = {2, 3, 4};
  char ops[] = {'+', '*'};
  int acc = nums[0];
  for (int i = 0; i < 2; i++) {
    if (ops[i] == '+') acc = acc + nums[i + 1];
    else acc = acc * nums[i + 1];
  }
  return acc;
}
int main() { cout << evalExpr() << endl; }`,
      cs: `using System;
int Eval() {
  int[] nums = {2, 3, 4};
  char[] ops = {'+', '*'};
  int acc = nums[0];
  for (int i = 0; i < ops.Length; i++) {
    if (ops[i] == '+') acc = acc + nums[i + 1];
    else acc = acc * nums[i + 1];
  }
  return acc;
}
Console.WriteLine(Eval());`,
      go: `package main
import "fmt"
func eval() int {
  nums := []int{2, 3, 4}
  ops := []byte{'+', '*'}
  acc := nums[0]
  for i, op := range ops {
    if op == '+' { acc = acc + nums[i+1] } else { acc = acc * nums[i+1] }
  }
  return acc
}
func main() { fmt.Println(eval()) }`,
      rust: `fn eval_expr() -> i32 {
  let nums = [2, 3, 4];
  let ops = ['+', '*'];
  let mut acc = nums[0];
  for i in 0..ops.len() {
    if ops[i] == '+' { acc = acc + nums[i + 1]; }
    else { acc = acc * nums[i + 1]; }
  }
  acc
}
fn main() { println!("{}", eval_expr()); }`,
      ts: `function evalExpr() {
  const nums = [2, 3, 4]
  const ops = ['+', '*']
  let acc = nums[0]
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === '+') acc = acc + nums[i + 1]
    else acc = acc * nums[i + 1]
  }
  return acc
}
console.log(evalExpr())`,
      php: `<?php
function evalExpr() {
  $nums = [2, 3, 4];
  $ops = ['+', '*'];
  $acc = $nums[0];
  for ($i = 0; $i < count($ops); $i++) {
    if ($ops[$i] === '+') $acc = $acc + $nums[$i + 1];
    else $acc = $acc * $nums[$i + 1];
  }
  return $acc;
}
echo evalExpr(), PHP_EOL;`,
      rb: `def eval_expr
  nums, ops = [2, 3, 4], ['+', '*']
  acc = nums[0]
  ops.each_with_index do |op, i|
    acc = op == '+' ? acc + nums[i + 1] : acc * nums[i + 1]
  end
  acc
end
puts eval_expr`,
    },
  }),

  challenge({
    slug: 'visitor-wrong-overload',
    title: 'Visitor — accept() Calls Wrong Visit',
    difficulty: 'hard',
    bugType: 'wrong-algorithm',
    tags: ['visitor', 'double-dispatch', 'shapes'],
    order: 88,
    description:
      'Visitor double-dispatch: Circle.accept(v) must call visitCircle and print CIRCLE, not the base visitShape path that prints SHAPE.',
    expectedOutput: 'CIRCLE',
    hint: 'Does Circle.accept forward to visitCircle, or to the Shape overload?',
    explanation:
      'accept() calls visitShape, so a Circle is treated as a generic Shape. Visitor needs the concrete type: Circle.accept should invoke v.visitCircle(this).',
    code: {
      py: `class Visitor:
    def visit_shape(self, s):
        return 'SHAPE'
    def visit_circle(self, s):
        return 'CIRCLE'
class Circle:
    def accept(self, v):
        return v.visit_shape(self)
print(Circle().accept(Visitor()))`,
      java: `public class Main {
  static class Circle {}
  static String visitShape(Object o) { return "SHAPE"; }
  static String visitCircle(Circle c) { return "CIRCLE"; }
  static String accept(Circle c) { return visitShape(c); }
  public static void main(String[] args) {
    System.out.println(accept(new Circle()));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string visitShape() { return "SHAPE"; }
string visitCircle() { return "CIRCLE"; }
string acceptCircle() { return visitShape(); }
int main() { cout << acceptCircle() << endl; }`,
      cs: `using System;
string VisitShape() { return "SHAPE"; }
string VisitCircle() { return "CIRCLE"; }
string Accept() { return VisitShape(); }
Console.WriteLine(Accept());`,
      go: `package main
import "fmt"
func visitShape() string { return "SHAPE" }
func visitCircle() string { return "CIRCLE" }
func accept() string { return visitShape() }
func main() { fmt.Println(accept()) }`,
      rust: `fn visit_shape() -> &'static str { "SHAPE" }
fn visit_circle() -> &'static str { "CIRCLE" }
fn accept() -> &'static str { visit_shape() }
fn main() { println!("{}", accept()); }`,
      ts: `class Visitor {
  visitShape() { return 'SHAPE' }
  visitCircle() { return 'CIRCLE' }
}
class Circle {
  accept(v: Visitor) { return v.visitShape() }
}
console.log(new Circle().accept(new Visitor()))`,
      php: `<?php
class Visitor {
  function visitShape() { return 'SHAPE'; }
  function visitCircle() { return 'CIRCLE'; }
}
class Circle {
  function accept($v) { return $v->visitShape(); }
}
echo (new Circle())->accept(new Visitor()), PHP_EOL;`,
      rb: `class Visitor
  def visit_shape; 'SHAPE'; end
  def visit_circle; 'CIRCLE'; end
end
class Circle
  def accept(v) v.visit_shape; end
end
puts Circle.new.accept(Visitor.new)`,
    },
  }),

  challenge({
    slug: 'hash-ring-drop-keys',
    title: 'Consistent Hash — Removing Node Drops Keys',
    difficulty: 'hard',
    bugType: 'boundary',
    tags: ['consistent-hash', 'ring', 'rebalance'],
    order: 89,
    description:
      'Ring nodes A, B, C clockwise. A key hashed onto B; B is removed. The key must remap to the next live neighbor C, not NONE.',
    expectedOutput: 'C',
    hint: 'On a miss, do you walk clockwise to the next remaining node?',
    explanation:
      'Lookup returns NONE when the hashed node is gone, dropping keys. Consistent hashing assigns a key to the first live successor on the ring. After removing B, successor is C.',
    code: {
      py: `class Ring:
    def __init__(self):
        self.nodes = ['A', 'B', 'C']
    def get(self, key_node, live):
        if key_node in live:
            return key_node
        return 'NONE'
r = Ring()
print(r.get('B', ['A', 'C']))`,
      java: `public class Main {
  static String get(String keyNode, String[] live) {
    for (String n : live) if (n.equals(keyNode)) return keyNode;
    return "NONE";
  }
  public static void main(String[] args) {
    System.out.println(get("B", new String[]{"A", "C"}));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string getNode(string keyNode, string live[], int n) {
  for (int i = 0; i < n; i++) if (live[i] == keyNode) return keyNode;
  return "NONE";
}
int main() {
  string live[] = {"A", "C"};
  cout << getNode("B", live, 2) << endl;
}`,
      cs: `using System;
string Get(string keyNode, string[] live) {
  foreach (string n in live) if (n == keyNode) return keyNode;
  return "NONE";
}
Console.WriteLine(Get("B", new string[]{"A", "C"}));`,
      go: `package main
import "fmt"
func get(keyNode string, live []string) string {
  for _, n := range live {
    if n == keyNode { return keyNode }
  }
  return "NONE"
}
func main() { fmt.Println(get("B", []string{"A", "C"})) }`,
      rust: `fn get(key_node: &str, live: &[&str]) -> &'static str {
  for n in live {
    if *n == key_node { return "B"; }
  }
  "NONE"
}
fn main() {
  println!("{}", get("B", &["A", "C"]));
}`,
      ts: `function get(keyNode: string, live: string[]) {
  if (live.indexOf(keyNode) >= 0) return keyNode
  return 'NONE'
}
console.log(get('B', ['A', 'C']))`,
      php: `<?php
class Ring {
  function get($keyNode, $live) {
    if (in_array($keyNode, $live)) return $keyNode;
    return 'NONE';
  }
}
echo (new Ring())->get('B', ['A', 'C']), PHP_EOL;`,
      rb: `class Ring
  def get(key_node, live)
    return key_node if live.include?(key_node)
    'NONE'
  end
end
puts Ring.new.get('B', ['A', 'C'])`,
    },
  }),

  challenge({
    slug: 'sliding-window-counts-not-time',
    title: 'Sliding Window Log — Counts Calls Not Timestamps',
    difficulty: 'hard',
    bugType: 'wrong-algorithm',
    tags: ['rate-limit', 'sliding-window', 'ttl'],
    order: 90,
    description:
      'Sliding-window log: limit 2, window 10. Calls at t=0 and t=1, then t=20. The third call must ALLOW because the old stamps fell out of the window.',
    expectedOutput: 'ALLOW',
    hint: 'Do you evict timestamps older than now-window, or just count the array length?',
    explanation:
      'The limiter never drops old timestamps, so the third call is BLOCK. A sliding window keeps only events in (now-window, now]. Evict t=0 and t=1 before judging t=20.',
    code: {
      py: `class Limiter:
    def __init__(self):
        self.calls, self.limit, self.window = [], 2, 10
    def allow(self, t):
        self.calls.append(t)
        if len(self.calls) <= self.limit:
            return 'ALLOW'
        return 'BLOCK'
lim = Limiter()
lim.allow(0)
lim.allow(1)
print(lim.allow(20))`,
      java: `public class Main {
  static java.util.List<Integer> calls = new java.util.ArrayList<>();
  static final int limit = 2, window = 10;
  static String allow(int t) {
    calls.add(t);
    if (calls.size() <= limit) return "ALLOW";
    return "BLOCK";
  }
  public static void main(String[] args) {
    allow(0); allow(1);
    System.out.println(allow(20));
  }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
vector<int> calls;
int limitN = 2, window = 10;
string allow(int t) {
  calls.push_back(t);
  if ((int)calls.size() <= limitN) return "ALLOW";
  return "BLOCK";
}
int main() {
  allow(0); allow(1);
  cout << allow(20) << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var calls = new List<int>();
int limit = 2, window = 10;
string Allow(int t) {
  calls.Add(t);
  if (calls.Count <= limit) return "ALLOW";
  return "BLOCK";
}
Allow(0); Allow(1);
Console.WriteLine(Allow(20));`,
      go: `package main
import "fmt"
func main() {
  calls := []int{}
  limit, window := 2, 10
  _ = window
  allow := func(t int) string {
    calls = append(calls, t)
    if len(calls) <= limit { return "ALLOW" }
    return "BLOCK"
  }
  allow(0); allow(1)
  fmt.Println(allow(20))
}`,
      rust: `fn allow(calls: &mut Vec<i32>, limit: i32, t: i32) -> &'static str {
  calls.push(t);
  if (calls.len() as i32) <= limit { return "ALLOW"; }
  "BLOCK"
}
fn main() {
  let mut calls = vec![];
  allow(&mut calls, 2, 0);
  allow(&mut calls, 2, 1);
  println!("{}", allow(&mut calls, 2, 20));
}`,
      ts: `const calls: number[] = []
const limit = 2
const window = 10
function allow(t: number) {
  calls.push(t)
  if (calls.length <= limit) return 'ALLOW'
  return 'BLOCK'
}
allow(0); allow(1)
console.log(allow(20))`,
      php: `<?php
class Limiter {
  public $calls = [], $limit = 2, $window = 10;
  function allow($t) {
    $this->calls[] = $t;
    if (count($this->calls) <= $this->limit) return 'ALLOW';
    return 'BLOCK';
  }
}
$lim = new Limiter();
$lim->allow(0); $lim->allow(1);
echo $lim->allow(20), PHP_EOL;`,
      rb: `class Limiter
  def initialize
    @calls, @limit, @window = [], 2, 10
  end
  def allow(t)
    @calls << t
    return 'ALLOW' if @calls.length <= @limit
    'BLOCK'
  end
end
lim = Limiter.new
lim.allow(0); lim.allow(1)
puts lim.allow(20)`,
    },
  }),

  challenge({
    slug: 'optimistic-lost-update',
    title: 'Optimistic Lock — Version Not Bumped',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['optimistic-lock', 'concurrency', 'version'],
    order: 91,
    description:
      'Row version starts at 1. First write with seen=1 succeeds and must bump the version. Second write still holding seen=1 must print CONFLICT, not OVERWRITE.',
    expectedOutput: 'CONFLICT',
    hint: 'After a successful write, is version incremented and compared on the next write?',
    explanation:
      'Writes skip the version check (and never bump), so the second stale writer overwrites. Optimistic locking compares seen vs current and increments on success. A mismatch is CONFLICT.',
    code: {
      py: `class Row:
    def __init__(self):
        self.ver, self.val = 1, 'A'
    def write(self, seen, val):
        self.val = val
        return 'OVERWRITE'
r = Row()
r.write(1, 'B')
print(r.write(1, 'C'))`,
      java: `public class Main {
  static int ver = 1;
  static String val = "A";
  static String write(int seen, String v) {
    val = v;
    return "OVERWRITE";
  }
  public static void main(String[] args) {
    write(1, "B");
    System.out.println(write(1, "C"));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int ver = 1;
string val = "A";
string writeRow(int seen, string v) {
  val = v;
  return "OVERWRITE";
}
int main() {
  writeRow(1, "B");
  cout << writeRow(1, "C") << endl;
}`,
      cs: `using System;
int ver = 1;
string val = "A";
string Write(int seen, string v) {
  val = v;
  return "OVERWRITE";
}
Write(1, "B");
Console.WriteLine(Write(1, "C"));`,
      go: `package main
import "fmt"
func main() {
  ver := 1
  val := "A"
  write := func(seen int, v string) string {
    val = v
    return "OVERWRITE"
  }
  _ = ver
  write(1, "B")
  fmt.Println(write(1, "C"))
}`,
      rust: `fn write(val: &mut String, _seen: i32, v: &str) -> &'static str {
  val.clear();
  val.push_str(v);
  "OVERWRITE"
}
fn main() {
  let mut val = String::from("A");
  write(&mut val, 1, "B");
  println!("{}", write(&mut val, 1, "C"));
}`,
      ts: `let ver = 1
let val = 'A'
function write(_seen: number, v: string) {
  val = v
  return 'OVERWRITE'
}
write(1, 'B')
console.log(write(1, 'C'))`,
      php: `<?php
class Row {
  public $ver = 1, $val = 'A';
  function write($seen, $v) {
    $this->val = $v;
    return 'OVERWRITE';
  }
}
$r = new Row();
$r->write(1, 'B');
echo $r->write(1, 'C'), PHP_EOL;`,
      rb: `class Row
  def initialize
    @ver, @val = 1, 'A'
  end
  def write(seen, v)
    @val = v
    'OVERWRITE'
  end
end
r = Row.new
r.write(1, 'B')
puts r.write(1, 'C')`,
    },
  }),

  challenge({
    slug: 'outbox-publishes-without-row',
    title: 'Outbox — Event Published Though Insert Failed',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['outbox', 'atomicity', 'messaging'],
    order: 92,
    description:
      'Transactional outbox: the DB insert fails. The event must not be published. Print NOT (not PUBLISHED).',
    expectedOutput: 'NOT',
    hint: 'Is publish gated on insert success, or always invoked?',
    explanation:
      'The bus emits even when insert_row fails, so consumers see a phantom order. Outbox publish and row insert share one transaction. If insert fails, return NOT and do not emit.',
    code: {
      py: `class Db:
    def insert_row(self):
        return False
class Bus:
    def emit(self):
        return True
def place_order():
    db, bus = Db(), Bus()
    bus.emit()
    if not db.insert_row():
        pass
    return 'PUBLISHED'
print(place_order())`,
      java: `public class Main {
  static boolean insertRow() { return false; }
  static boolean emit() { return true; }
  static String placeOrder() {
    emit();
    if (!insertRow()) { }
    return "PUBLISHED";
  }
  public static void main(String[] args) {
    System.out.println(placeOrder());
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
bool insertRow() { return false; }
bool emit() { return true; }
string placeOrder() {
  emit();
  if (!insertRow()) { }
  return "PUBLISHED";
}
int main() { cout << placeOrder() << endl; }`,
      cs: `using System;
bool InsertRow() { return false; }
bool Emit() { return true; }
string PlaceOrder() {
  Emit();
  if (!InsertRow()) { }
  return "PUBLISHED";
}
Console.WriteLine(PlaceOrder());`,
      go: `package main
import "fmt"
func insertRow() bool { return false }
func emit() bool { return true }
func placeOrder() string {
  emit()
  if !insertRow() { }
  return "PUBLISHED"
}
func main() { fmt.Println(placeOrder()) }`,
      rust: `fn insert_row() -> bool { false }
fn emit() -> bool { true }
fn place_order() -> &'static str {
  emit();
  if !insert_row() {}
  "PUBLISHED"
}
fn main() { println!("{}", place_order()); }`,
      ts: `function insertRow() { return false }
function emit() { return true }
function placeOrder() {
  emit()
  if (!insertRow()) { }
  return 'PUBLISHED'
}
console.log(placeOrder())`,
      php: `<?php
function insertRow() { return false; }
function emit() { return true; }
function placeOrder() {
  emit();
  if (!insertRow()) { }
  return 'PUBLISHED';
}
echo placeOrder(), PHP_EOL;`,
      rb: `def insert_row; false; end
def emit; true; end
def place_order
  emit
  insert_row
  'PUBLISHED'
end
puts place_order`,
    },
  }),

  challenge({
    slug: 'reservation-never-expires',
    title: 'Inventory Reservation — Holds Forever',
    difficulty: 'hard',
    bugType: 'edge-case',
    tags: ['reservation', 'ttl', 'inventory'],
    order: 93,
    description:
      'A hold expires at t=100. At t=200 a new reserve must succeed (OK). Treating any existing hold as live forever must print DENY.',
    expectedOutput: 'OK',
    hint: 'Do you compare now against hold_until, or just check that a hold record exists?',
    explanation:
      'reserve() denies because a hold row exists, ignoring TTL. Expired reservations must be treated as free. If now >= until, allow the new reserve.',
    code: {
      py: `class Inv:
    def __init__(self):
        self.until = 100
    def reserve(self, now):
        if self.until != 0:
            return 'DENY'
        return 'OK'
print(Inv().reserve(200))`,
      java: `public class Main {
  static int until = 100;
  static String reserve(int now) {
    if (until != 0) return "DENY";
    return "OK";
  }
  public static void main(String[] args) {
    System.out.println(reserve(200));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int untilT = 100;
string reserve(int now) {
  if (untilT != 0) return "DENY";
  return "OK";
}
int main() { cout << reserve(200) << endl; }`,
      cs: `using System;
int until = 100;
string Reserve(int now) {
  if (until != 0) return "DENY";
  return "OK";
}
Console.WriteLine(Reserve(200));`,
      go: `package main
import "fmt"
func main() {
  until := 100
  reserve := func(now int) string {
    if until != 0 { return "DENY" }
    return "OK"
  }
  fmt.Println(reserve(200))
}`,
      rust: `fn reserve(until: i32, _now: i32) -> &'static str {
  if until != 0 { return "DENY"; }
  "OK"
}
fn main() { println!("{}", reserve(100, 200)); }`,
      ts: `const until = 100
function reserve(_now: number) {
  if (until !== 0) return 'DENY'
  return 'OK'
}
console.log(reserve(200))`,
      php: `<?php
class Inv {
  public $until = 100;
  function reserve($now) {
    if ($this->until != 0) return 'DENY';
    return 'OK';
  }
}
echo (new Inv())->reserve(200), PHP_EOL;`,
      rb: `class Inv
  def initialize; @until = 100; end
  def reserve(now)
    return 'DENY' if @until != 0
    'OK'
  end
end
puts Inv.new.reserve(200)`,
    },
  }),

  challenge({
    slug: 'order-backward-transition',
    title: 'Order Lifecycle — DELIVERED Can Return to PACKED',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['state-machine', 'order', 'illegal-transition'],
    order: 94,
    description:
      'Order is DELIVERED. pack() is not a legal reverse transition. Print ILLEGAL, not PACKED.',
    expectedOutput: 'ILLEGAL',
    hint: 'Does pack() guard on the current state, or blindly assign PACKED?',
    explanation:
      'pack() rewrites DELIVERED back to PACKED. Lifecycle graphs are directed; delivered cannot pack again. Refuse illegal transitions with ILLEGAL.',
    code: {
      py: `class Order:
    def __init__(self):
        self.state = 'DELIVERED'
    def pack(self):
        self.state = 'PACKED'
        return 'PACKED'
print(Order().pack())`,
      java: `public class Main {
  static String state = "DELIVERED";
  static String pack() {
    state = "PACKED";
    return "PACKED";
  }
  public static void main(String[] args) {
    System.out.println(pack());
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string state = "DELIVERED";
string pack() {
  state = "PACKED";
  return "PACKED";
}
int main() { cout << pack() << endl; }`,
      cs: `using System;
string state = "DELIVERED";
string Pack() {
  state = "PACKED";
  return "PACKED";
}
Console.WriteLine(Pack());`,
      go: `package main
import "fmt"
func main() {
  state := "DELIVERED"
  pack := func() string {
    state = "PACKED"
    return "PACKED"
  }
  fmt.Println(pack())
}`,
      rust: `fn pack(state: &mut &str) -> &'static str {
  *state = "PACKED";
  "PACKED"
}
fn main() {
  let mut state = "DELIVERED";
  println!("{}", pack(&mut state));
}`,
      ts: `let state = 'DELIVERED'
function pack() {
  state = 'PACKED'
  return 'PACKED'
}
console.log(pack())`,
      php: `<?php
class Order {
  public $state = 'DELIVERED';
  function pack() {
    $this->state = 'PACKED';
    return 'PACKED';
  }
}
echo (new Order())->pack(), PHP_EOL;`,
      rb: `class Order
  def initialize; @state = 'DELIVERED'; end
  def pack
    @state = 'PACKED'
    'PACKED'
  end
end
puts Order.new.pack`,
    },
  }),

  challenge({
    slug: 'lfu-evicts-frequent',
    title: 'LFU Cache — Evicts Most Frequent',
    difficulty: 'hard',
    bugType: 'wrong-algorithm',
    tags: ['lfu', 'cache', 'eviction'],
    order: 95,
    description:
      'LFU capacity 2: put a, put b, get a, get a, put c. Key a is most frequent and must remain HIT after c is inserted.',
    expectedOutput: 'HIT',
    hint: 'Are you evicting FIFO (a) instead of the least-frequent key (b)?',
    explanation:
      'put(c) evicts a (arrival order) even after two hits, so get(a) is MISS. LFU drops the lowest frequency; b has 1 vs a’s 3. Evict b, keep a.',
    code: {
      py: `cache, seq = {}, []
def put(k):
    if k not in cache and len(cache) >= 2:
        ev = seq.pop(0)
        del cache[ev]
    cache[k] = 1
    if k not in seq:
        seq.append(k)
def get(k):
    return 'HIT' if k in cache else 'MISS'
put('a'); put('b')
get('a'); get('a')
put('c')
print(get('a'))`,
      java: `public class Main {
  static java.util.Map<String,Integer> cache = new java.util.LinkedHashMap<>();
  static void put(String k) {
    if (!cache.containsKey(k) && cache.size() >= 2) {
      String ev = cache.keySet().iterator().next();
      cache.remove(ev);
    }
    cache.put(k, 1);
  }
  static String get(String k) { return cache.containsKey(k) ? "HIT" : "MISS"; }
  public static void main(String[] args) {
    put("a"); put("b"); get("a"); get("a"); put("c");
    System.out.println(get("a"));
  }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;
vector<string> seq;
void put(string k) {
  if (find(seq.begin(), seq.end(), k) == seq.end() && seq.size() >= 2) seq.erase(seq.begin());
  if (find(seq.begin(), seq.end(), k) == seq.end()) seq.push_back(k);
}
string get(string k) {
  return find(seq.begin(), seq.end(), k) != seq.end() ? "HIT" : "MISS";
}
int main() {
  put("a"); put("b"); get("a"); get("a"); put("c");
  cout << get("a") << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var seq = new List<string>();
void Put(string k) {
  if (!seq.Contains(k) && seq.Count >= 2) seq.RemoveAt(0);
  if (!seq.Contains(k)) seq.Add(k);
}
string Get(string k) { return seq.Contains(k) ? "HIT" : "MISS"; }
Put("a"); Put("b"); Get("a"); Get("a"); Put("c");
Console.WriteLine(Get("a"));`,
      go: `package main
import "fmt"
func main() {
  seq := []string{}
  contains := func(k string) bool {
    for _, x := range seq { if x == k { return true } }
    return false
  }
  put := func(k string) {
    if !contains(k) && len(seq) >= 2 { seq = seq[1:] }
    if !contains(k) { seq = append(seq, k) }
  }
  get := func(k string) string {
    if contains(k) { return "HIT" }
    return "MISS"
  }
  put("a"); put("b"); get("a"); get("a"); put("c")
  fmt.Println(get("a"))
}`,
      rust: `fn put(seq: &mut Vec<&str>, k: &'static str) {
  if !seq.contains(&k) && seq.len() >= 2 { seq.remove(0); }
  if !seq.contains(&k) { seq.push(k); }
}
fn get(seq: &[&str], k: &str) -> &'static str {
  if seq.contains(&k) { "HIT" } else { "MISS" }
}
fn main() {
  let mut seq = vec![];
  put(&mut seq, "a"); put(&mut seq, "b");
  let _ = get(&seq, "a"); let _ = get(&seq, "a");
  put(&mut seq, "c");
  println!("{}", get(&seq, "a"));
}`,
      ts: `const seq: string[] = []
function put(k: string) {
  if (seq.indexOf(k) < 0 && seq.length >= 2) seq.shift()
  if (seq.indexOf(k) < 0) seq.push(k)
}
function get(k: string) { return seq.indexOf(k) >= 0 ? 'HIT' : 'MISS' }
put('a'); put('b'); get('a'); get('a'); put('c')
console.log(get('a'))`,
      php: `<?php
$seq = [];
function put($k) {
  global $seq;
  if (!in_array($k, $seq) && count($seq) >= 2) array_shift($seq);
  if (!in_array($k, $seq)) $seq[] = $k;
}
function get($k) {
  global $seq;
  return in_array($k, $seq) ? 'HIT' : 'MISS';
}
put('a'); put('b'); get('a'); get('a'); put('c');
echo get('a'), PHP_EOL;`,
      rb: `seq = []
def put(seq, k)
  seq.shift if !seq.include?(k) && seq.length >= 2
  seq << k unless seq.include?(k)
end
def get(seq, k)
  seq.include?(k) ? 'HIT' : 'MISS'
end
put(seq, 'a'); put(seq, 'b'); get(seq, 'a'); get(seq, 'a'); put(seq, 'c')
puts get(seq, 'a')`,
    },
  }),

  challenge({
    slug: 'matchmaking-max-skill-gap',
    title: 'Matchmaking — Picks Largest Skill Gap',
    difficulty: 'hard',
    bugType: 'wrong-algorithm',
    tags: ['matchmaking', 'skill', 'nearest'],
    order: 96,
    description:
      'Player skill 100; candidates 90 and 20. Match the nearest skill (90), not the largest gap (20). Print the chosen skill.',
    expectedOutput: '90',
    hint: 'Are you maximizing |me-cand| instead of minimizing it?',
    explanation:
      'The matcher selects max gap, pairing 100 with 20. Fair matchmaking minimizes skill delta. Track the smallest abs(me-c); 90 wins.',
    code: {
      py: `me, cands = 100, [90, 20]
best, best_gap = cands[0], -1
for c in cands:
    gap = abs(me - c)
    if gap > best_gap:
        best_gap, best = gap, c
print(best)`,
      java: `public class Main {
  public static void main(String[] args) {
    int me = 100, best = 90, bestGap = -1;
    int[] cands = {90, 20};
    for (int c : cands) {
      int gap = Math.abs(me - c);
      if (gap > bestGap) { bestGap = gap; best = c; }
    }
    System.out.println(best);
  }
}`,
      cpp: `#include <iostream>
using namespace std;
int main() {
  int me = 100, best = 90, bestGap = -1;
  int cands[] = {90, 20};
  for (int i = 0; i < 2; i++) {
    int gap = me - cands[i];
    if (gap < 0) gap = -gap;
    if (gap > bestGap) { bestGap = gap; best = cands[i]; }
  }
  cout << best << endl;
}`,
      cs: `using System;
int me = 100, best = 90, bestGap = -1;
int[] cands = {90, 20};
foreach (int c in cands) {
  int gap = Math.Abs(me - c);
  if (gap > bestGap) { bestGap = gap; best = c; }
}
Console.WriteLine(best);`,
      go: `package main
import "fmt"
func abs(x int) int { if x < 0 { return -x }; return x }
func main() {
  me, best, bestGap := 100, 90, -1
  cands := []int{90, 20}
  for _, c := range cands {
    gap := abs(me - c)
    if gap > bestGap { bestGap = gap; best = c }
  }
  fmt.Println(best)
}`,
      rust: `fn main() {
  let me = 100;
  let cands = [90, 20];
  let mut best = 90;
  let mut best_gap = -1;
  for c in cands {
    let gap = (me - c).abs();
    if gap > best_gap { best_gap = gap; best = c; }
  }
  println!("{}", best);
}`,
      ts: `const me = 100
const cands = [90, 20]
let best = cands[0]
let bestGap = -1
for (const c of cands) {
  const gap = Math.abs(me - c)
  if (gap > bestGap) { bestGap = gap; best = c }
}
console.log(best)`,
      php: `<?php
$me = 100; $cands = [90, 20];
$best = $cands[0]; $bestGap = -1;
foreach ($cands as $c) {
  $gap = abs($me - $c);
  if ($gap > $bestGap) { $bestGap = $gap; $best = $c; }
}
echo $best, PHP_EOL;`,
      rb: `me, cands = 100, [90, 20]
best, best_gap = cands[0], -1
cands.each do |c|
  gap = (me - c).abs
  if gap > best_gap
    best_gap, best = gap, c
  end
end
puts best`,
    },
  }),

  challenge({
    slug: 'idempotency-key-ignored',
    title: 'Checkout — Idempotency-Key Ignored on Retry',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['idempotency', 'checkout', 'retries'],
    order: 97,
    description:
      'Checkout with the same Idempotency-Key must return SAME_ORDER on retry, not mint NEW_ORDER.',
    expectedOutput: 'SAME_ORDER',
    hint: 'Is the key stored and reused, or does every call allocate a new order?',
    explanation:
      'Retries always increment the order counter. At-least-once clients replay the same key; the server must return the original order. Cache key → order and short-circuit.',
    code: {
      py: `class Checkout:
    def __init__(self):
        self.keys, self.n = {}, 0
    def place(self, key):
        self.n += 1
        return 'NEW_ORDER'
c = Checkout()
c.place('k1')
print(c.place('k1'))`,
      java: `public class Main {
  static int n = 0;
  static String place(String key) {
    n++;
    return "NEW_ORDER";
  }
  public static void main(String[] args) {
    place("k1");
    System.out.println(place("k1"));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int n = 0;
string place(string key) {
  n++;
  return "NEW_ORDER";
}
int main() {
  place("k1");
  cout << place("k1") << endl;
}`,
      cs: `using System;
int n = 0;
string Place(string key) {
  n++;
  return "NEW_ORDER";
}
Place("k1");
Console.WriteLine(Place("k1"));`,
      go: `package main
import "fmt"
func main() {
  n := 0
  place := func(key string) string {
    n++
    return "NEW_ORDER"
  }
  place("k1")
  fmt.Println(place("k1"))
}`,
      rust: `fn place(n: &mut i32, _key: &str) -> &'static str {
  *n += 1;
  "NEW_ORDER"
}
fn main() {
  let mut n = 0;
  place(&mut n, "k1");
  println!("{}", place(&mut n, "k1"));
}`,
      ts: `let n = 0
function place(_key: string) {
  n++
  return 'NEW_ORDER'
}
place('k1')
console.log(place('k1'))`,
      php: `<?php
class Checkout {
  public $n = 0;
  function place($key) {
    $this->n++;
    return 'NEW_ORDER';
  }
}
$c = new Checkout();
$c->place('k1');
echo $c->place('k1'), PHP_EOL;`,
      rb: `class Checkout
  def initialize; @n = 0; end
  def place(key)
    @n += 1
    'NEW_ORDER'
  end
end
c = Checkout.new
c.place('k1')
puts c.place('k1')`,
    },
  }),

  challenge({
    slug: 'two-phase-skips-prepare',
    title: '2PC — Coordinator Commits Without Prepare',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['2pc', 'consensus', 'transactions'],
    order: 98,
    description:
      'Two-phase commit: the only participant votes ABORT. The coordinator must not commit. Print ABORTED.',
    expectedOutput: 'ABORTED',
    hint: 'Did the coordinator skip prepare and jump to commit?',
    explanation:
      'Coordinator calls commit without tallying prepare votes, so an ABORT still becomes COMMITTED. 2PC is prepare-then-commit; any ABORT aborts all.',
    code: {
      py: `class Coord:
    def __init__(self):
        self.votes = ['ABORT']
    def prepare(self):
        return self.votes[0]
    def commit(self):
        return 'COMMITTED'
    def run(self):
        return self.commit()
print(Coord().run())`,
      java: `public class Main {
  static String vote = "ABORT";
  static String prepare() { return vote; }
  static String commit() { return "COMMITTED"; }
  static String run() { return commit(); }
  public static void main(String[] args) {
    System.out.println(run());
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
string vote = "ABORT";
string prepare() { return vote; }
string commit() { return "COMMITTED"; }
string run() { return commit(); }
int main() { cout << run() << endl; }`,
      cs: `using System;
string vote = "ABORT";
string Prepare() { return vote; }
string Commit() { return "COMMITTED"; }
string Run() { return Commit(); }
Console.WriteLine(Run());`,
      go: `package main
import "fmt"
func main() {
  vote := "ABORT"
  prepare := func() string { return vote }
  commit := func() string { return "COMMITTED" }
  _ = prepare
  fmt.Println(commit())
}`,
      rust: `fn prepare(vote: &str) -> &str { vote }
fn commit() -> &'static str { "COMMITTED" }
fn run(vote: &str) -> &'static str {
  let _ = prepare(vote);
  commit()
}
fn main() { println!("{}", run("ABORT")); }`,
      ts: `const vote = 'ABORT'
function prepare() { return vote }
function commit() { return 'COMMITTED' }
function run() { return commit() }
console.log(run())`,
      php: `<?php
class Coord {
  public $votes = ['ABORT'];
  function prepare() { return $this->votes[0]; }
  function commit() { return 'COMMITTED'; }
  function run() { return $this->commit(); }
}
echo (new Coord())->run(), PHP_EOL;`,
      rb: `class Coord
  def initialize; @votes = ['ABORT']; end
  def prepare; @votes[0]; end
  def commit; 'COMMITTED'; end
  def run; commit; end
end
puts Coord.new.run`,
    },
  }),

  challenge({
    slug: 'git-reset-loses-branch',
    title: 'VCS Memento — Reset Drops Parallel Branch Tip',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['memento', 'vcs', 'branches'],
    order: 99,
    description:
      'On feat, commit C1, then checkout main. The feat ref must still point at C1, not EMPTY.',
    expectedOutput: 'C1',
    hint: 'Does checkout rebuild the tip map from only the destination branch?',
    explanation:
      'checkout replaces the entire tip map with {main}, dropping feat. Branch tips are independent mementos. Checkout switches HEAD only; leave other refs intact.',
    code: {
      py: `class Repo:
    def __init__(self):
        self.tips = {'main': 'C0', 'feat': 'C0'}
        self.head = 'feat'
    def commit(self, c):
        self.tips[self.head] = c
    def checkout(self, b):
        self.head = b
        self.tips = {b: self.tips[b]}
r = Repo()
r.commit('C1')
r.checkout('main')
print(r.tips.get('feat', 'EMPTY'))`,
      java: `public class Main {
  static java.util.Map<String,String> tips = new java.util.HashMap<>();
  static String head = "feat";
  static void commit(String c) { tips.put(head, c); }
  static void checkout(String b) {
    head = b;
    String keep = tips.get(b);
    tips = new java.util.HashMap<>();
    tips.put(b, keep);
  }
  public static void main(String[] args) {
    tips.put("main", "C0"); tips.put("feat", "C0");
    commit("C1"); checkout("main");
    System.out.println(tips.getOrDefault("feat", "EMPTY"));
  }
}`,
      cpp: `#include <iostream>
#include <map>
#include <string>
using namespace std;
map<string,string> tips = {{"main","C0"},{"feat","C0"}};
string head = "feat";
void commit(string c) { tips[head] = c; }
void checkout(string b) {
  head = b;
  string keep = tips[b];
  tips.clear();
  tips[b] = keep;
}
int main() {
  commit("C1"); checkout("main");
  cout << (tips.count("feat") ? tips["feat"] : "EMPTY") << endl;
}`,
      cs: `using System;
using System.Collections.Generic;
var tips = new Dictionary<string,string>{{"main","C0"},{"feat","C0"}};
string head = "feat";
void Commit(string c) { tips[head] = c; }
void Checkout(string b) {
  head = b;
  string keep = tips[b];
  tips = new Dictionary<string,string>();
  tips[b] = keep;
}
Commit("C1"); Checkout("main");
string feat;
if (!tips.TryGetValue("feat", out feat)) feat = "EMPTY";
Console.WriteLine(feat);`,
      go: `package main
import "fmt"
func main() {
  tips := map[string]string{"main": "C0", "feat": "C0"}
  head := "feat"
  commit := func(c string) { tips[head] = c }
  checkout := func(b string) {
    head = b
    keep := tips[b]
    tips = map[string]string{b: keep}
  }
  commit("C1"); checkout("main")
  if v, ok := tips["feat"]; ok { fmt.Println(v) } else { fmt.Println("EMPTY") }
}`,
      rust: `use std::collections::HashMap;
fn main() {
  let mut tips = HashMap::new();
  tips.insert("main", "C0");
  tips.insert("feat", "C0");
  tips.insert("feat", "C1");
  let keep = *tips.get("main").unwrap();
  tips.clear();
  tips.insert("main", keep);
  println!("{}", tips.get("feat").copied().unwrap_or("EMPTY"));
}`,
      ts: `const tips: Record<string, string> = { main: 'C0', feat: 'C0' }
let head = 'feat'
function commit(c: string) { tips[head] = c }
function checkout(b: string) {
  head = b
  const keep = tips[b]
  for (const k of Object.keys(tips)) delete tips[k]
  tips[b] = keep
}
commit('C1'); checkout('main')
console.log(tips['feat'] ? tips['feat'] : 'EMPTY')`,
      php: `<?php
class Repo {
  public $tips = ['main' => 'C0', 'feat' => 'C0'], $head = 'feat';
  function commit($c) { $this->tips[$this->head] = $c; }
  function checkout($b) {
    $this->head = $b;
    $keep = $this->tips[$b];
    $this->tips = [$b => $keep];
  }
}
$r = new Repo();
$r->commit('C1'); $r->checkout('main');
echo isset($r->tips['feat']) ? $r->tips['feat'] : 'EMPTY', PHP_EOL;`,
      rb: `class Repo
  attr_reader :tips
  def initialize
    @tips, @head = {'main'=>'C0', 'feat'=>'C0'}, 'feat'
  end
  def commit(c); @tips[@head] = c; end
  def checkout(b)
    @head = b
    keep = @tips[b]
    @tips = {b => keep}
  end
end
r = Repo.new
r.commit('C1'); r.checkout('main')
puts r.tips['feat'] || 'EMPTY'`,
    },
  }),

  challenge({
    slug: 'lock-version-not-checked',
    title: 'Pessimistic vs Optimistic Mix — Write Skips Version Check',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['concurrency', 'version', 'stale-write'],
    order: 100,
    description:
      'Document current version is 2. A writer holding seen=1 must be rejected as STALE, not WRITTEN.',
    expectedOutput: 'STALE',
    hint: 'Does write() compare client version to the stored version?',
    explanation:
      'write() ignores seen and always WRITTEN. Mixing locks still requires a version guard for lost updates. If seen != ver, return STALE.',
    code: {
      py: `class Doc:
    def __init__(self):
        self.ver, self.body = 2, 'x'
    def write(self, seen):
        self.body = 'y'
        return 'WRITTEN'
print(Doc().write(1))`,
      java: `public class Main {
  static int ver = 2;
  static String body = "x";
  static String write(int seen) {
    body = "y";
    return "WRITTEN";
  }
  public static void main(String[] args) {
    System.out.println(write(1));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int ver = 2;
string body = "x";
string writeDoc(int seen) {
  body = "y";
  return "WRITTEN";
}
int main() { cout << writeDoc(1) << endl; }`,
      cs: `using System;
int ver = 2;
string body = "x";
string Write(int seen) {
  body = "y";
  return "WRITTEN";
}
Console.WriteLine(Write(1));`,
      go: `package main
import "fmt"
func main() {
  ver := 2
  body := "x"
  write := func(seen int) string {
    body = "y"
    return "WRITTEN"
  }
  _ = ver
  fmt.Println(write(1))
}`,
      rust: `fn write(body: &mut String, _seen: i32) -> &'static str {
  body.clear();
  body.push_str("y");
  "WRITTEN"
}
fn main() {
  let mut body = String::from("x");
  println!("{}", write(&mut body, 1));
}`,
      ts: `let ver = 2
let body = 'x'
function write(_seen: number) {
  body = 'y'
  return 'WRITTEN'
}
console.log(write(1))`,
      php: `<?php
class Doc {
  public $ver = 2, $body = 'x';
  function write($seen) {
    $this->body = 'y';
    return 'WRITTEN';
  }
}
echo (new Doc())->write(1), PHP_EOL;`,
      rb: `class Doc
  def initialize
    @ver, @body = 2, 'x'
  end
  def write(seen)
    @body = 'y'
    'WRITTEN'
  end
end
puts Doc.new.write(1)`,
    },
  }),

  challenge({
    slug: 'feature-flag-user-override-ignored',
    title: 'Feature Flags — User Override Loses to Global Off',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['feature-flags', 'override', 'priority'],
    order: 101,
    description:
      'Global flag is off, but this user has an override on. Evaluation must print ON. User overrides outrank the global default.',
    expectedOutput: 'ON',
    hint: 'Do you return the global bit and skip the per-user map?',
    explanation:
      'enabled() only reads the global off switch. Flag resolution is global default then user override. If the user override is on, return ON.',
    code: {
      py: `class Flags:
    def __init__(self):
        self.global_on, self.user_on = False, True
    def enabled(self):
        return self.global_on
print('ON' if Flags().enabled() else 'OFF')`,
      java: `public class Main {
  static boolean globalOn = false, userOn = true;
  static boolean enabled() { return globalOn; }
  public static void main(String[] args) {
    System.out.println(enabled() ? "ON" : "OFF");
  }
}`,
      cpp: `#include <iostream>
using namespace std;
bool globalOn = false, userOn = true;
bool enabled() { return globalOn; }
int main() { cout << (enabled() ? "ON" : "OFF") << endl; }`,
      cs: `using System;
bool globalOn = false, userOn = true;
bool Enabled() { return globalOn; }
Console.WriteLine(Enabled() ? "ON" : "OFF");`,
      go: `package main
import "fmt"
func main() {
  globalOn, userOn := false, true
  enabled := func() bool { return globalOn }
  _ = userOn
  if enabled() { fmt.Println("ON") } else { fmt.Println("OFF") }
}`,
      rust: `fn enabled(global_on: bool, _user_on: bool) -> bool { global_on }
fn main() {
  if enabled(false, true) { println!("ON"); } else { println!("OFF"); }
}`,
      ts: `const globalOn = false
const userOn = true
function enabled() { return globalOn }
console.log(enabled() ? 'ON' : 'OFF')`,
      php: `<?php
class Flags {
  public $globalOn = false, $userOn = true;
  function enabled() { return $this->globalOn; }
}
echo (new Flags())->enabled() ? 'ON' : 'OFF', PHP_EOL;`,
      rb: `class Flags
  def initialize
    @global_on, @user_on = false, true
  end
  def enabled; @global_on; end
end
puts Flags.new.enabled ? 'ON' : 'OFF'`,
    },
  }),

  challenge({
    slug: 'distributed-rate-limit-local-only',
    title: 'Rate Limit — Per-Instance Limit Not Global',
    difficulty: 'hard',
    bugType: 'logic',
    tags: ['rate-limit', 'distributed', 'shared-counter'],
    order: 102,
    description:
      'Global limit is 1 across two nodes. Node 1 already allowed a call. Node 2’s next call must BLOCK, not ALLOW from a local counter.',
    expectedOutput: 'BLOCK',
    hint: 'Is the counter in a shared store, or a per-process integer?',
    explanation:
      'Each node has its own counter, so node 2 still ALLOWs. A cluster limit needs a shared tally (Redis, etc.). After one global allow, the second node must BLOCK.',
    code: {
      py: `class Node:
    def __init__(self):
        self.n = 0
    def call(self, limit):
        if self.n < limit:
            self.n += 1
            return 'ALLOW'
        return 'BLOCK'
a, b = Node(), Node()
a.call(1)
print(b.call(1))`,
      java: `public class Main {
  static int n1 = 0, n2 = 0, limit = 1;
  static String call(int node) {
    if (node == 1) {
      if (n1 < limit) { n1++; return "ALLOW"; }
      return "BLOCK";
    }
    if (n2 < limit) { n2++; return "ALLOW"; }
    return "BLOCK";
  }
  public static void main(String[] args) {
    call(1);
    System.out.println(call(2));
  }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
int n1 = 0, n2 = 0, limitN = 1;
string call(int node) {
  if (node == 1) {
    if (n1 < limitN) { n1++; return "ALLOW"; }
    return "BLOCK";
  }
  if (n2 < limitN) { n2++; return "ALLOW"; }
  return "BLOCK";
}
int main() { call(1); cout << call(2) << endl; }`,
      cs: `using System;
int n1 = 0, n2 = 0, limit = 1;
string Call(int node) {
  if (node == 1) {
    if (n1 < limit) { n1++; return "ALLOW"; }
    return "BLOCK";
  }
  if (n2 < limit) { n2++; return "ALLOW"; }
  return "BLOCK";
}
Call(1);
Console.WriteLine(Call(2));`,
      go: `package main
import "fmt"
func main() {
  n1, n2, limit := 0, 0, 1
  call := func(node int) string {
    if node == 1 {
      if n1 < limit { n1++; return "ALLOW" }
      return "BLOCK"
    }
    if n2 < limit { n2++; return "ALLOW" }
    return "BLOCK"
  }
  call(1)
  fmt.Println(call(2))
}`,
      rust: `fn call(n: &mut i32, limit: i32) -> &'static str {
  if *n < limit { *n += 1; return "ALLOW"; }
  "BLOCK"
}
fn main() {
  let mut n1 = 0;
  let mut n2 = 0;
  call(&mut n1, 1);
  println!("{}", call(&mut n2, 1));
}`,
      ts: `let n1 = 0, n2 = 0
const limit = 1
function call(node: number) {
  if (node === 1) {
    if (n1 < limit) { n1++; return 'ALLOW' }
    return 'BLOCK'
  }
  if (n2 < limit) { n2++; return 'ALLOW' }
  return 'BLOCK'
}
call(1)
console.log(call(2))`,
      php: `<?php
class Node {
  public $n = 0;
  function call($limit) {
    if ($this->n < $limit) { $this->n++; return 'ALLOW'; }
    return 'BLOCK';
  }
}
$a = new Node(); $b = new Node();
$a->call(1);
echo $b->call(1), PHP_EOL;`,
      rb: `class Node
  def initialize; @n = 0; end
  def call(limit)
    if @n < limit
      @n += 1
      return 'ALLOW'
    end
    'BLOCK'
  end
end
a, b = Node.new, Node.new
a.call(1)
puts b.call(1)`,
    },
  }),
]
